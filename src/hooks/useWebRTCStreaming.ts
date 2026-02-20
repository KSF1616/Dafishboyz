import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export type PeerStatus = 'new' | 'connecting' | 'connected' | 'failed' | 'closed';

interface PeerState {
  connection: RTCPeerConnection;
  status: PeerStatus;
  peerId: string;
  peerName: string;
}

interface UseWebRTCStreamingOptions {
  roomId: string | undefined;
  playerId: string;
  playerName?: string;
  isActor: boolean;
  localStream: MediaStream | null;
  players: { player_id: string; player_name: string }[];
  enabled: boolean; // master switch - only true when camera is on AND game is active
}

interface UseWebRTCStreamingReturn {
  remoteStream: MediaStream | null;
  peerStatuses: Record<string, PeerStatus>;
  viewerCount: number;
  isStreaming: boolean;
  streamError: string | null;
  iceSource: 'turn-relay' | 'stun-fallback' | 'error-fallback' | 'loading';
  /** Imperatively replace the broadcast stream on all existing peer connections.
   *  Useful when swapping between camera / screen-share / composite streams
   *  without waiting for a React re-render cycle. */
  replaceStream: (newStream: MediaStream) => void;
}


// ─── TURN credential response shape ──────────────────────────────────────────

interface TurnCredentialResponse {
  iceServers: RTCIceServer[];
  ttl: number;
  expiresAt?: number;
  source: 'turn-relay' | 'stun-fallback' | 'error-fallback';
  warning?: string;
}

// ─── Static STUN-only fallback (used while loading or on error) ──────────────

const STUN_FALLBACK_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' },
];

const STUN_FALLBACK_CONFIG: RTCConfiguration = {
  iceServers: STUN_FALLBACK_SERVERS,
  iceCandidatePoolSize: 10,
};

// ─── Signaling event types ───────────────────────────────────────────────────

const SIG = {
  ACTOR_STREAMING: 'actor-streaming',
  ACTOR_STOPPED: 'actor-stopped',
  VIEWER_REQUEST: 'viewer-request',
  SDP_OFFER: 'sdp-offer',
  SDP_ANSWER: 'sdp-answer',
  ICE_CANDIDATE: 'ice-candidate',
} as const;

// ─── Credential refresh margin (refresh 5 minutes before expiry) ─────────────

const CREDENTIAL_REFRESH_MARGIN_S = 300;

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useWebRTCStreaming({
  roomId,
  playerId,
  playerName = 'Unknown',
  isActor,
  localStream,
  players,
  enabled,
}: UseWebRTCStreamingOptions): UseWebRTCStreamingReturn {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerStatuses, setPeerStatuses] = useState<Record<string, PeerStatus>>({});
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [iceSource, setIceSource] = useState<UseWebRTCStreamingReturn['iceSource']>('loading');

  // Refs for mutable state that shouldn't trigger re-renders
  const peersRef = useRef<Map<string, PeerState>>(new Map());
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const iceCandidateQueueRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const isActorRef = useRef(isActor);
  const localStreamRef = useRef(localStream);
  const enabledRef = useRef(enabled);

  // TURN credential state (ref so peer connections always get latest config)
  const rtcConfigRef = useRef<RTCConfiguration>(STUN_FALLBACK_CONFIG);
  const credentialExpiresAtRef = useRef<number>(0);
  const credentialRefreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep refs in sync
  useEffect(() => { isActorRef.current = isActor; }, [isActor]);
  useEffect(() => { localStreamRef.current = localStream; }, [localStream]);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  // ══════════════════════════════════════════════════════════════════════════
  // TURN credential fetching & auto-refresh
  // ══════════════════════════════════════════════════════════════════════════

  const fetchTurnCredentials = useCallback(async (): Promise<RTCConfiguration> => {
    try {
      console.log('[WebRTC] Fetching TURN credentials from edge function…');

      const { data, error } = await supabase.functions.invoke('turn-credentials', {
        body: { userId: playerId },
      });

      if (error) {
        console.warn('[WebRTC] TURN credential fetch error:', error);
        setIceSource('error-fallback');
        return STUN_FALLBACK_CONFIG;
      }

      const response = data as TurnCredentialResponse;

      if (!response?.iceServers || !Array.isArray(response.iceServers)) {
        console.warn('[WebRTC] Invalid TURN credential response:', response);
        setIceSource('error-fallback');
        return STUN_FALLBACK_CONFIG;
      }

      // Log what we got
      const hasTurn = response.iceServers.some(s => {
        const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
        return urls.some(u => u.startsWith('turn:') || u.startsWith('turns:'));
      });

      if (hasTurn) {
        console.log(`[WebRTC] TURN credentials received (source: ${response.source}, TTL: ${response.ttl}s)`);
      } else {
        console.log(`[WebRTC] No TURN servers in response (source: ${response.source})${response.warning ? ' – ' + response.warning : ''}`);
      }

      setIceSource(response.source);

      // Store expiry for refresh scheduling
      if (response.expiresAt) {
        credentialExpiresAtRef.current = response.expiresAt;
      }

      const config: RTCConfiguration = {
        iceServers: response.iceServers,
        iceCandidatePoolSize: 10,
        // Prefer relay candidates when TURN is available, but allow all
        // This ensures the browser tries TURN relay if direct P2P fails
        iceTransportPolicy: 'all',
      };

      rtcConfigRef.current = config;
      return config;
    } catch (err) {
      console.error('[WebRTC] Failed to fetch TURN credentials:', err);
      setIceSource('error-fallback');
      return STUN_FALLBACK_CONFIG;
    }
  }, [playerId]);

  // Schedule automatic credential refresh before expiry
  const scheduleCredentialRefresh = useCallback(() => {
    // Clear any existing timer
    if (credentialRefreshTimerRef.current) {
      clearTimeout(credentialRefreshTimerRef.current);
      credentialRefreshTimerRef.current = null;
    }

    const expiresAt = credentialExpiresAtRef.current;
    if (!expiresAt || expiresAt === 0) return;

    const nowS = Math.floor(Date.now() / 1000);
    const refreshInS = Math.max(
      (expiresAt - CREDENTIAL_REFRESH_MARGIN_S) - nowS,
      60, // minimum 60s before refresh
    );

    console.log(`[WebRTC] Scheduling TURN credential refresh in ${refreshInS}s`);

    credentialRefreshTimerRef.current = setTimeout(async () => {
      if (!enabledRef.current) return;
      console.log('[WebRTC] Auto-refreshing TURN credentials…');

      const newConfig = await fetchTurnCredentials();

      // Update existing peer connections with new ICE servers
      // (only possible by restarting ICE on each connection)
      peersRef.current.forEach((peer) => {
        try {
          if (peer.connection.connectionState !== 'closed') {
            peer.connection.setConfiguration(newConfig);
            console.log(`[WebRTC] Updated ICE config for peer ${peer.peerName}`);
          }
        } catch (e) {
          // setConfiguration may not be supported in all browsers
          console.warn(`[WebRTC] Could not update ICE config for ${peer.peerName}:`, e);
        }
      });

      // Schedule the next refresh
      scheduleCredentialRefresh();
    }, refreshInS * 1000);
  }, [fetchTurnCredentials]);

  // Fetch credentials when hook is enabled
  useEffect(() => {
    if (!enabled) {
      // Clear refresh timer when disabled
      if (credentialRefreshTimerRef.current) {
        clearTimeout(credentialRefreshTimerRef.current);
        credentialRefreshTimerRef.current = null;
      }
      return;
    }

    let cancelled = false;

    (async () => {
      const config = await fetchTurnCredentials();
      if (cancelled) return;
      rtcConfigRef.current = config;
      scheduleCredentialRefresh();
    })();

    return () => {
      cancelled = true;
      if (credentialRefreshTimerRef.current) {
        clearTimeout(credentialRefreshTimerRef.current);
        credentialRefreshTimerRef.current = null;
      }
    };
  }, [enabled, fetchTurnCredentials, scheduleCredentialRefresh]);

  // ── Peer status updater ─────────────────────────────────────────────────
  const updatePeerStatus = useCallback((peerId: string, status: PeerStatus) => {
    const peer = peersRef.current.get(peerId);
    if (peer) peer.status = status;
    setPeerStatuses(prev => ({ ...prev, [peerId]: status }));
  }, []);

  // ── Create RTCPeerConnection (now uses dynamic TURN-enabled config) ─────
  const createPeerConnection = useCallback((peerId: string, peerName: string): RTCPeerConnection => {
    console.log(`[WebRTC] Creating peer connection for ${peerName} (${peerId})`);

    // Use the latest config which includes TURN credentials
    const config = rtcConfigRef.current;

    // Log which ICE servers we're using
    const serverSummary = config.iceServers?.map(s => {
      const urls = Array.isArray(s.urls) ? s.urls : [s.urls];
      return urls.join(', ');
    }).join(' | ');
    console.log(`[WebRTC] ICE servers: ${serverSummary}`);

    const pc = new RTCPeerConnection(config);

    // Track ICE connection state
    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC] ICE state for ${peerName}: ${pc.iceConnectionState}`);
      switch (pc.iceConnectionState) {
        case 'checking':
          updatePeerStatus(peerId, 'connecting');
          break;
        case 'connected':
        case 'completed':
          updatePeerStatus(peerId, 'connected');
          // Log selected candidate pair to see if TURN relay was used
          try {
            pc.getStats().then(stats => {
              stats.forEach(report => {
                if (report.type === 'candidate-pair' && report.state === 'succeeded') {
                  const localId = report.localCandidateId;
                  const remoteId = report.remoteCandidateId;
                  stats.forEach(r => {
                    if (r.id === localId || r.id === remoteId) {
                      console.log(`[WebRTC] Active candidate (${r.id === localId ? 'local' : 'remote'}): type=${r.candidateType} protocol=${r.protocol} address=${r.address || 'hidden'}`);
                    }
                  });
                }
              });
            });
          } catch {
            // Stats API may not be available
          }
          break;
        case 'failed':
          updatePeerStatus(peerId, 'failed');
          setStreamError(`Connection to ${peerName} failed – may need TURN relay`);
          break;
        case 'disconnected':
        case 'closed':
          updatePeerStatus(peerId, 'closed');
          break;
      }
    };

    // Log ICE gathering state for debugging
    pc.onicegatheringstatechange = () => {
      console.log(`[WebRTC] ICE gathering state for ${peerName}: ${pc.iceGatheringState}`);
    };

    // Send ICE candidates via signaling channel
    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        // Log candidate type for debugging TURN usage
        console.log(`[WebRTC] Local ICE candidate for ${peerName}: type=${event.candidate.type} protocol=${event.candidate.protocol}`);
        channelRef.current.send({
          type: 'broadcast',
          event: SIG.ICE_CANDIDATE,
          payload: {
            from: playerId,
            to: peerId,
            candidate: event.candidate.toJSON(),
          },
        });
      }
    };

    // For viewers: receive the actor's video stream
    if (!isActorRef.current) {
      pc.ontrack = (event) => {
        console.log(`[WebRTC] Received remote track from ${peerName}`, event.streams);
        if (event.streams && event.streams[0]) {
          setRemoteStream(event.streams[0]);
        } else {
          // Create a new MediaStream from the track
          const stream = new MediaStream([event.track]);
          setRemoteStream(stream);
        }
      };
    }

    // Store peer state
    const peerState: PeerState = {
      connection: pc,
      status: 'new',
      peerId,
      peerName,
    };
    peersRef.current.set(peerId, peerState);
    updatePeerStatus(peerId, 'new');

    return pc;
  }, [playerId, updatePeerStatus]);

  // ── Actor: create offer for a viewer ────────────────────────────────────
  const createOfferForViewer = useCallback(async (viewerId: string, viewerName: string) => {
    if (!localStreamRef.current || !channelRef.current) {
      console.warn('[WebRTC] Cannot create offer: no local stream or channel');
      return;
    }

    // Clean up existing connection to this viewer if any
    const existingPeer = peersRef.current.get(viewerId);
    if (existingPeer) {
      existingPeer.connection.close();
      peersRef.current.delete(viewerId);
    }

    const pc = createPeerConnection(viewerId, viewerName);

    // Add local stream tracks to the connection
    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current!);
    });

    try {
      const offer = await pc.createOffer({
        offerToReceiveAudio: false,
        offerToReceiveVideo: false,
      });
      await pc.setLocalDescription(offer);

      console.log(`[WebRTC] Sending SDP offer to ${viewerName}`);
      channelRef.current.send({
        type: 'broadcast',
        event: SIG.SDP_OFFER,
        payload: {
          from: playerId,
          to: viewerId,
          sdp: pc.localDescription?.toJSON(),
        },
      });

      updatePeerStatus(viewerId, 'connecting');
    } catch (err) {
      console.error(`[WebRTC] Error creating offer for ${viewerName}:`, err);
      updatePeerStatus(viewerId, 'failed');
    }
  }, [playerId, createPeerConnection, updatePeerStatus]);

  // ── Viewer: handle incoming SDP offer from actor ────────────────────────
  const handleOffer = useCallback(async (actorId: string, actorName: string, sdp: RTCSessionDescriptionInit) => {
    console.log(`[WebRTC] Received SDP offer from ${actorName}`);

    // Clean up existing connection
    const existingPeer = peersRef.current.get(actorId);
    if (existingPeer) {
      existingPeer.connection.close();
      peersRef.current.delete(actorId);
    }

    const pc = createPeerConnection(actorId, actorName);

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));

      // Process any queued ICE candidates
      const queued = iceCandidateQueueRef.current.get(actorId) || [];
      for (const candidate of queued) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
      iceCandidateQueueRef.current.delete(actorId);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      console.log(`[WebRTC] Sending SDP answer to ${actorName}`);
      channelRef.current?.send({
        type: 'broadcast',
        event: SIG.SDP_ANSWER,
        payload: {
          from: playerId,
          to: actorId,
          sdp: pc.localDescription?.toJSON(),
        },
      });

      updatePeerStatus(actorId, 'connecting');
    } catch (err) {
      console.error(`[WebRTC] Error handling offer from ${actorName}:`, err);
      updatePeerStatus(actorId, 'failed');
      setStreamError('Failed to connect to actor\'s video stream');
    }
  }, [playerId, createPeerConnection, updatePeerStatus]);

  // ── Actor: handle incoming SDP answer from viewer ───────────────────────
  const handleAnswer = useCallback(async (viewerId: string, sdp: RTCSessionDescriptionInit) => {
    const peer = peersRef.current.get(viewerId);
    if (!peer) {
      console.warn(`[WebRTC] No peer connection found for ${viewerId}`);
      return;
    }

    try {
      await peer.connection.setRemoteDescription(new RTCSessionDescription(sdp));
      console.log(`[WebRTC] Set remote description (answer) from ${peer.peerName}`);

      // Process any queued ICE candidates
      const queued = iceCandidateQueueRef.current.get(viewerId) || [];
      for (const candidate of queued) {
        await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
      }
      iceCandidateQueueRef.current.delete(viewerId);
    } catch (err) {
      console.error(`[WebRTC] Error handling answer from ${peer.peerName}:`, err);
      updatePeerStatus(viewerId, 'failed');
    }
  }, [updatePeerStatus]);

  // ── Handle incoming ICE candidate ───────────────────────────────────────
  const handleIceCandidate = useCallback(async (fromId: string, candidate: RTCIceCandidateInit) => {
    const peer = peersRef.current.get(fromId);
    if (!peer) {
      // Queue the candidate - peer connection may not exist yet
      const queue = iceCandidateQueueRef.current.get(fromId) || [];
      queue.push(candidate);
      iceCandidateQueueRef.current.set(fromId, queue);
      return;
    }

    try {
      if (peer.connection.remoteDescription) {
        await peer.connection.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        // Queue if remote description not set yet
        const queue = iceCandidateQueueRef.current.get(fromId) || [];
        queue.push(candidate);
        iceCandidateQueueRef.current.set(fromId, queue);
      }
    } catch (err) {
      console.error(`[WebRTC] Error adding ICE candidate from ${fromId}:`, err);
    }
  }, []);

  // ── Cleanup all peer connections ────────────────────────────────────────
  const cleanupPeers = useCallback(() => {
    console.log('[WebRTC] Cleaning up all peer connections');
    peersRef.current.forEach((peer) => {
      try {
        peer.connection.close();
      } catch (e) {
        // ignore
      }
    });
    peersRef.current.clear();
    iceCandidateQueueRef.current.clear();
    setPeerStatuses({});
    setRemoteStream(null);
    setIsStreaming(false);
    setStreamError(null);
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // Main signaling channel setup
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!roomId || !enabled) {
      // Cleanup when disabled
      if (channelRef.current) {
        // If actor was streaming, notify viewers
        if (isActorRef.current && isStreaming) {
          channelRef.current.send({
            type: 'broadcast',
            event: SIG.ACTOR_STOPPED,
            payload: { actorId: playerId },
          });
        }
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      cleanupPeers();
      return;
    }

    const channelName = `webrtc-signal:${roomId}`;
    console.log(`[WebRTC] Subscribing to signaling channel: ${channelName} (role: ${isActor ? 'actor' : 'viewer'})`);

    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    // ── Actor streaming announcement ──────────────────────────────────────
    channel.on('broadcast', { event: SIG.ACTOR_STREAMING }, ({ payload }) => {
      if (!isActorRef.current && payload?.actorId) {
        console.log('[WebRTC] Actor announced streaming, sending viewer request');
        // Viewer requests connection from actor
        channel.send({
          type: 'broadcast',
          event: SIG.VIEWER_REQUEST,
          payload: {
            viewerId: playerId,
            viewerName: playerName,
          },
        });
      }
    });

    // ── Actor stopped ─────────────────────────────────────────────────────
    channel.on('broadcast', { event: SIG.ACTOR_STOPPED }, ({ payload }) => {
      if (!isActorRef.current && payload?.actorId) {
        console.log('[WebRTC] Actor stopped streaming');
        cleanupPeers();
      }
    });

    // ── Viewer request (actor receives) ───────────────────────────────────
    channel.on('broadcast', { event: SIG.VIEWER_REQUEST }, ({ payload }) => {
      if (isActorRef.current && payload?.viewerId && localStreamRef.current) {
        console.log(`[WebRTC] Viewer ${payload.viewerName} requesting connection`);
        createOfferForViewer(payload.viewerId, payload.viewerName || 'Viewer');
      }
    });

    // ── SDP Offer (viewer receives) ───────────────────────────────────────
    channel.on('broadcast', { event: SIG.SDP_OFFER }, ({ payload }) => {
      if (!isActorRef.current && payload?.to === playerId && payload?.sdp) {
        const actorPlayer = players.find(p => p.player_id === payload.from);
        handleOffer(payload.from, actorPlayer?.player_name || 'Actor', payload.sdp);
      }
    });

    // ── SDP Answer (actor receives) ───────────────────────────────────────
    channel.on('broadcast', { event: SIG.SDP_ANSWER }, ({ payload }) => {
      if (isActorRef.current && payload?.to === playerId && payload?.sdp) {
        handleAnswer(payload.from, payload.sdp);
      }
    });

    // ── ICE Candidate (both sides) ────────────────────────────────────────
    channel.on('broadcast', { event: SIG.ICE_CANDIDATE }, ({ payload }) => {
      if (payload?.to === playerId && payload?.candidate) {
        handleIceCandidate(payload.from, payload.candidate);
      }
    });

    channel.subscribe((status) => {
      console.log(`[WebRTC] Signaling channel status: ${status}`);
      if (status === 'SUBSCRIBED') {
        channelRef.current = channel;

        // If actor has a stream, announce it
        if (isActorRef.current && localStreamRef.current) {
          console.log('[WebRTC] Actor announcing stream availability');
          setIsStreaming(true);
          setTimeout(() => {
            channel.send({
              type: 'broadcast',
              event: SIG.ACTOR_STREAMING,
              payload: {
                actorId: playerId,
                actorName: playerName,
              },
            });
          }, 500); // Small delay to ensure all viewers have subscribed
        }
      }
    });

    return () => {
      // Notify viewers that actor stopped
      if (isActorRef.current && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: SIG.ACTOR_STOPPED,
          payload: { actorId: playerId },
        });
      }
      supabase.removeChannel(channel);
      channelRef.current = null;
      cleanupPeers();
    };
  }, [roomId, enabled, playerId, playerName, isActor, players]);

  // ═══════════════════════════════════════════════════════════════════════════
  // When actor's local stream changes, re-announce and re-negotiate
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    if (!isActor || !enabled || !channelRef.current) return;

    if (localStream) {
      console.log('[WebRTC] Actor local stream changed, re-announcing');
      setIsStreaming(true);

      // Replace tracks on existing peer connections
      peersRef.current.forEach((peer) => {
        const senders = peer.connection.getSenders();
        localStream.getTracks().forEach(track => {
          const sender = senders.find(s => s.track?.kind === track.kind);
          if (sender) {
            sender.replaceTrack(track).catch(console.error);
          } else {
            peer.connection.addTrack(track, localStream);
          }
        });
      });

      // Also announce for any new viewers
      channelRef.current.send({
        type: 'broadcast',
        event: SIG.ACTOR_STREAMING,
        payload: {
          actorId: playerId,
          actorName: playerName,
        },
      });
    } else {
      // Stream removed
      console.log('[WebRTC] Actor local stream removed');
      setIsStreaming(false);
      channelRef.current.send({
        type: 'broadcast',
        event: SIG.ACTOR_STOPPED,
        payload: { actorId: playerId },
      });
      cleanupPeers();
    }
  }, [isActor, localStream, enabled, playerId, playerName, cleanupPeers]);

  // ═══════════════════════════════════════════════════════════════════════════
  // Cleanup credential refresh timer on unmount
  // ═══════════════════════════════════════════════════════════════════════════

  useEffect(() => {
    return () => {
      if (credentialRefreshTimerRef.current) {
        clearTimeout(credentialRefreshTimerRef.current);
        credentialRefreshTimerRef.current = null;
      }
    };
  }, []);

  // ═══════════════════════════════════════════════════════════════════════════
  // Compute viewer count from connected peers
  // ═══════════════════════════════════════════════════════════════════════════

  const viewerCount = Object.values(peerStatuses).filter(
    s => s === 'connected' || s === 'connecting'
  ).length;

  // ═══════════════════════════════════════════════════════════════════════════
  // Imperative stream replacement (for screen-share / composite swaps)
  // ═══════════════════════════════════════════════════════════════════════════

  const replaceStream = useCallback((newStream: MediaStream) => {
    if (!isActorRef.current) return;

    console.log('[WebRTC] replaceStream called – updating all peer connections');
    localStreamRef.current = newStream;

    peersRef.current.forEach((peer) => {
      const senders = peer.connection.getSenders();
      newStream.getTracks().forEach(track => {
        const sender = senders.find(s => s.track?.kind === track.kind);
        if (sender) {
          sender.replaceTrack(track).catch(err =>
            console.error(`[WebRTC] replaceTrack failed for ${peer.peerName}:`, err)
          );
        } else {
          try {
            peer.connection.addTrack(track, newStream);
          } catch (e) {
            console.warn(`[WebRTC] addTrack failed for ${peer.peerName}:`, e);
          }
        }
      });
    });

    // Re-announce so any new viewers pick up the latest stream
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: SIG.ACTOR_STREAMING,
        payload: {
          actorId: playerId,
          actorName: playerName,
        },
      });
    }
  }, [playerId, playerName]);

  return {
    remoteStream,
    peerStatuses,
    viewerCount,
    isStreaming,
    streamError,
    iceSource,
    replaceStream,
  };
}
