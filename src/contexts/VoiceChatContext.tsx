import React, { createContext, useContext, useState, useRef, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { VoiceParticipant, VoiceSettings, PeerConnection, SignalingMessage, DEFAULT_VOICE_SETTINGS, ICE_SERVERS } from '@/types/voiceChat';

interface VoiceChatContextType {
  isConnected: boolean;
  isMuted: boolean;
  isSpeaking: boolean;
  isPushToTalkActive: boolean;
  participants: VoiceParticipant[];
  settings: VoiceSettings;
  joinVoiceChat: (roomId: string, playerId: string, playerName: string) => Promise<void>;
  leaveVoiceChat: () => void;
  toggleMute: () => void;
  setPlayerVolume: (playerId: string, volume: number) => void;
  mutePlayer: (playerId: string, muted: boolean) => void;
  updateSettings: (settings: Partial<VoiceSettings>) => void;
  startPushToTalk: () => void;
  stopPushToTalk: () => void;
}

const VoiceChatContext = createContext<VoiceChatContextType | null>(null);

export const useVoiceChat = () => {
  const ctx = useContext(VoiceChatContext);
  if (!ctx) throw new Error('useVoiceChat must be used within VoiceChatProvider');
  return ctx;
};

export const VoiceChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPushToTalkActive, setIsPushToTalkActive] = useState(false);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [settings, setSettings] = useState<VoiceSettings>(DEFAULT_VOICE_SETTINGS);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, PeerConnection>>(new Map());
  const channelRef = useRef<any>(null);
  const roomIdRef = useRef<string>('');
  const playerIdRef = useRef<string>('');
  const playerNameRef = useRef<string>('');
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const createPeerConnection = useCallback(async (targetPlayerId: string, isInitiator: boolean) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current!));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast', event: 'voice-signal',
          payload: { type: 'ice-candidate', from: playerIdRef.current, to: targetPlayerId, payload: event.candidate }
        });
      }
    };

    pc.ontrack = (event) => {
      const audio = new Audio();
      audio.srcObject = event.streams[0];
      audio.autoplay = true;
      peersRef.current.set(targetPlayerId, { ...peersRef.current.get(targetPlayerId)!, audioStream: event.streams[0], audioElement: audio });
    };

    peersRef.current.set(targetPlayerId, { playerId: targetPlayerId, connection: pc });

    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      channelRef.current?.send({
        type: 'broadcast', event: 'voice-signal',
        payload: { type: 'offer', from: playerIdRef.current, to: targetPlayerId, payload: offer }
      });
    }
    return pc;
  }, []);

  const handleSignal = useCallback(async (message: SignalingMessage) => {
    if (message.to && message.to !== playerIdRef.current) return;
    
    if (message.type === 'join' && message.from !== playerIdRef.current) {
      setParticipants(prev => {
        if (prev.find(p => p.odplayerId === message.from)) return prev;
        return [...prev, { odplayerId: message.from, playerName: message.payload?.name || 'Player', isMuted: false, isSpeaking: false, volume: 100, isConnected: true, audioLevel: 0 }];
      });
      await createPeerConnection(message.from, true);
    } else if (message.type === 'offer') {
      let pc = peersRef.current.get(message.from)?.connection;
      if (!pc) pc = await createPeerConnection(message.from, false);
      await pc.setRemoteDescription(new RTCSessionDescription(message.payload));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      channelRef.current?.send({ type: 'broadcast', event: 'voice-signal', payload: { type: 'answer', from: playerIdRef.current, to: message.from, payload: answer } });
    } else if (message.type === 'answer') {
      const pc = peersRef.current.get(message.from)?.connection;
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(message.payload));
    } else if (message.type === 'ice-candidate') {
      const pc = peersRef.current.get(message.from)?.connection;
      if (pc && message.payload) await pc.addIceCandidate(new RTCIceCandidate(message.payload));
    } else if (message.type === 'leave') {
      const peer = peersRef.current.get(message.from);
      if (peer) { peer.connection.close(); peer.audioElement?.pause(); peersRef.current.delete(message.from); }
      setParticipants(prev => prev.filter(p => p.odplayerId !== message.from));
    }
  }, [createPeerConnection]);

  const joinVoiceChat = async (roomId: string, odplayerId: string, playerName: string) => {
    roomIdRef.current = roomId;
    playerIdRef.current = odplayerId;
    playerNameRef.current = playerName;

    try {
      localStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: settings.echoCancellation, noiseSuppression: settings.noiseSuppression } });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(localStreamRef.current);
      source.connect(analyserRef.current);

      channelRef.current = supabase.channel(`voice:${roomId}`)
        .on('broadcast', { event: 'voice-signal' }, ({ payload }) => handleSignal(payload))
        .subscribe(() => {
          channelRef.current.send({ type: 'broadcast', event: 'voice-signal', payload: { type: 'join', from: odplayerId, payload: { name: playerName } } });
        });

      setIsConnected(true);
      setParticipants([{ odplayerId, playerName, isMuted: false, isSpeaking: false, volume: 100, isConnected: true, audioLevel: 0 }]);
    } catch (err) { console.error('Failed to join voice chat:', err); }
  };

  const leaveVoiceChat = () => {
    channelRef.current?.send({ type: 'broadcast', event: 'voice-signal', payload: { type: 'leave', from: playerIdRef.current } });
    peersRef.current.forEach(peer => { peer.connection.close(); peer.audioElement?.pause(); });
    peersRef.current.clear();
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    supabase.removeChannel(channelRef.current);
    audioContextRef.current?.close();
    setIsConnected(false);
    setParticipants([]);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const enabled = !isMuted;
      localStreamRef.current.getAudioTracks().forEach(t => t.enabled = !enabled);
      setIsMuted(enabled);
    }
  };

  const setPlayerVolume = (odplayerId: string, volume: number) => {
    const peer = peersRef.current.get(odplayerId);
    if (peer?.audioElement) peer.audioElement.volume = volume / 100;
    setParticipants(prev => prev.map(p => p.odplayerId === odplayerId ? { ...p, volume } : p));
  };

  const mutePlayer = (odplayerId: string, muted: boolean) => {
    const peer = peersRef.current.get(odplayerId);
    if (peer?.audioElement) peer.audioElement.muted = muted;
    setParticipants(prev => prev.map(p => p.odplayerId === odplayerId ? { ...p, isMuted: muted } : p));
  };

  const startPushToTalk = () => { if (settings.mode === 'push-to-talk' && localStreamRef.current) { localStreamRef.current.getAudioTracks().forEach(t => t.enabled = true); setIsPushToTalkActive(true); } };
  const stopPushToTalk = () => { if (settings.mode === 'push-to-talk' && localStreamRef.current) { localStreamRef.current.getAudioTracks().forEach(t => t.enabled = false); setIsPushToTalkActive(false); } };
  const updateSettings = (newSettings: Partial<VoiceSettings>) => setSettings(prev => ({ ...prev, ...newSettings }));

  useEffect(() => () => { if (isConnected) leaveVoiceChat(); }, []);

  return (
    <VoiceChatContext.Provider value={{ isConnected, isMuted, isSpeaking, isPushToTalkActive, participants, settings, joinVoiceChat, leaveVoiceChat, toggleMute, setPlayerVolume, mutePlayer, updateSettings, startPushToTalk, stopPushToTalk }}>
      {children}
    </VoiceChatContext.Provider>
  );
};
