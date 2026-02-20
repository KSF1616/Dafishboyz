import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Play, Check, SkipForward, X, Video, VideoOff, Trophy, 
  Clock, Users, Eye, EyeOff, Send, RotateCcw, Loader2,
  Volume2, VolumeX, Maximize2, Minimize2, Camera, CameraOff,
  ThumbsUp, AlertCircle, Sparkles, Timer, ChevronRight,
  Wifi, WifiOff, Radio, MonitorPlay, Signal,
  Monitor, MonitorOff, ScreenShare, ScreenShareOff
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAudio } from '@/contexts/AudioContext';
import { useWebRTCStreaming, PeerStatus } from '@/hooks/useWebRTCStreaming';


// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  gameData: Record<string, any>;
  isMyTurn: boolean;
  onAction: (action: string, data?: any) => void;
  players: { player_id: string; player_name: string }[];
  currentPlayerId: string;
  roomId?: string;
  [key: string]: any; // allow extra props from boardProps spread
}

interface CharadesCard {
  id: string;
  card_name: string;
  card_number: number;
}

interface Guess {
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
  isCorrect: boolean;
}

type GamePhase = 'lobby' | 'ready' | 'acting' | 'guessing' | 'reveal' | 'roundEnd' | 'gameOver';

// ─── Constants ────────────────────────────────────────────────────────────────

const ROUND_TIME = 60;
const WIN_SCORE = 10;
const POINTS_ACTOR = 1;
const POINTS_GUESSER = 2;
const MAX_PASSES = 1;
const COUNTDOWN_READY = 3;

// ─── Peer status badge helper ─────────────────────────────────────────────────

function PeerStatusBadge({ status }: { status: PeerStatus }) {
  const config: Record<PeerStatus, { color: string; label: string; pulse: boolean }> = {
    new: { color: 'bg-gray-500', label: 'Initializing', pulse: false },
    connecting: { color: 'bg-yellow-500', label: 'Connecting', pulse: true },
    connected: { color: 'bg-green-500', label: 'Connected', pulse: false },
    failed: { color: 'bg-red-500', label: 'Failed', pulse: false },
    closed: { color: 'bg-gray-600', label: 'Disconnected', pulse: false },
  };
  const c = config[status] || config.new;
  return (
    <span className="flex items-center gap-1">
      <span className={`w-2 h-2 rounded-full ${c.color} ${c.pulse ? 'animate-pulse' : ''}`} />
      <span className="text-[10px] text-white/60">{c.label}</span>
    </span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SlangingShitBoard({ gameData, isMyTurn, onAction, players, currentPlayerId, roomId }: Props) {
  const { playTimerBeep, playVictory, playFart } = useAudio();

  // ── Card deck state ─────────────────────────────────────────────────────
  const [allCards, setAllCards] = useState<CharadesCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [cardDeck, setCardDeck] = useState<CharadesCard[]>([]);

  // ── Game state ──────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<GamePhase>('lobby');
  const [currentCard, setCurrentCard] = useState<CharadesCard | null>(null);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
  const [readyCountdown, setReadyCountdown] = useState(COUNTDOWN_READY);
  const [isRunning, setIsRunning] = useState(false);
  const [passesUsed, setPassesUsed] = useState(0);
  const [currentActorIndex, setCurrentActorIndex] = useState(gameData.currentActor || 0);
  const [scores, setScores] = useState<Record<string, number>>(gameData.scores || {});
  const [usedCardIds, setUsedCardIds] = useState<Set<string>>(new Set(gameData.usedCardIds || []));
  const [roundScore, setRoundScore] = useState(0);
  const [cardsThisRound, setCardsThisRound] = useState<string[]>([]);

  // ── Guessing state ──────────────────────────────────────────────────────
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [guessInput, setGuessInput] = useState('');
  const [showPhraseHint, setShowPhraseHint] = useState(false);

  // ── Video state ─────────────────────────────────────────────────────────
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  // ── Screen sharing state ────────────────────────────────────────────────
  const [screenShareOn, setScreenShareOn] = useState(false);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const pipVideoRef = useRef<HTMLVideoElement>(null);
  // Canvas compositing refs (for combining screen + camera into one stream)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const compositeStreamRef = useRef<MediaStream | null>(null);
  const compositeAnimFrameRef = useRef<number | null>(null);
  // The actual stream being broadcast via WebRTC (camera, screen, or composite)
  const [broadcastStream, setBroadcastStream] = useState<MediaStream | null>(null);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const lastBeepRef = useRef<number>(0);
  const guessListRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isActor = players[currentActorIndex]?.player_id === currentPlayerId;
  const actorName = players[currentActorIndex]?.player_name || 'Unknown';
  const winner = Object.entries(scores).find(([_, s]) => (s as number) >= WIN_SCORE);

  // ── WebRTC streaming ────────────────────────────────────────────────────
  const playerName = players.find(p => p.player_id === currentPlayerId)?.player_name || 'Unknown';
  
  // Actor is enabled when camera or screen share is on; viewers are enabled during active phases
  const isActivePhase = phase === 'acting' || phase === 'ready' || phase === 'roundEnd' || phase === 'lobby';
  const webrtcEnabled = isActor ? ((cameraOn || screenShareOn) && isActivePhase) : isActivePhase;

  const {
    remoteStream,
    peerStatuses,
    viewerCount,
    isStreaming,
    streamError,
    iceSource,
    replaceStream,
  } = useWebRTCStreaming({
    roomId,
    playerId: currentPlayerId,
    playerName,
    isActor,
    localStream: broadcastStream,
    players,
    enabled: webrtcEnabled,
  });




  // ── Attach remote stream to video element ───────────────────────────────
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      console.log('[SlangingShit] Attached remote stream to video element');
    }
  }, [remoteStream]);

  // ── Load cards from database ────────────────────────────────────────────

  useEffect(() => {
    loadCardsFromDB();
  }, []);

  const loadCardsFromDB = async () => {
    setLoadingCards(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase.functions.invoke('game-card-loader', {
        body: { action: 'get-cards', gameId: 'slanging-shit' }
      });

      if (error) throw new Error(error.message || 'Failed to load cards');
      
      const responseData = data?.data || data;
      
      if (!responseData?.success || !responseData?.cards?.length) {
        throw new Error('No charades cards found in database');
      }

      const cards: CharadesCard[] = responseData.cards.map((c: any) => ({
        id: c.id,
        card_name: c.card_name?.trim() || '',
        card_number: c.card_number
      })).filter((c: CharadesCard) => c.card_name.length > 0);

      console.log(`Loaded ${cards.length} real Slanging Shit charades phrases from database`);
      setAllCards(cards);
      
      // Shuffle for the deck
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setCardDeck(shuffled);
      setLoadingCards(false);
    } catch (e: any) {
      console.error('Failed to load charades cards:', e);
      setLoadError(e.message || 'Failed to load cards');
      setLoadingCards(false);
    }
  };

  // ── Timer logic ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  useEffect(() => {
    if (isRunning && timeLeft <= 10 && timeLeft > 0 && timeLeft !== lastBeepRef.current) {
      playTimerBeep();
      lastBeepRef.current = timeLeft;
    }
    if (timeLeft <= 0 && isRunning) {
      endRound();
    }
  }, [timeLeft, isRunning]);

  // ── Ready countdown ─────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'ready') return;
    if (readyCountdown <= 0) {
      setPhase('acting');
      setIsRunning(true);
      return;
    }
    const t = setTimeout(() => setReadyCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, readyCountdown]);

  // ── Winner detection ────────────────────────────────────────────────────

  useEffect(() => {
    if (winner) {
      setPhase('gameOver');
      playVictory();
    }
  }, [winner]);

  // ── Auto-scroll guesses ─────────────────────────────────────────────────

  useEffect(() => {
    if (guessListRef.current) {
      guessListRef.current.scrollTop = guessListRef.current.scrollHeight;
    }
  }, [guesses]);

  // ── Camera controls ─────────────────────────────────────────────────────

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }, 
        audio: false 
      });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      setCameraOn(true);
    } catch (e: any) {
      console.error('Camera error:', e);
      setCameraError(
        e.name === 'NotAllowedError' 
          ? 'Camera permission denied. Please allow camera access.' 
          : e.name === 'NotFoundError'
          ? 'No camera found on this device.'
          : 'Could not start camera. Please try again.'
      );
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
    setCameraOn(false);
  }, []);

  const toggleCamera = useCallback(() => {
    if (cameraOn) stopCamera();
    else startCamera();
  }, [cameraOn, startCamera, stopCamera]);

  const flipCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (cameraOn) {
      stopCamera();
      setTimeout(() => startCamera(), 100);
    }
  }, [cameraOn, startCamera, stopCamera]);

  const toggleFullscreen = useCallback(() => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => { stopCamera(); stopScreenShare(); };
  }, [stopCamera]);

  // ── Screen sharing controls ─────────────────────────────────────────────

  const stopCompositing = useCallback(() => {
    if (compositeAnimFrameRef.current) {
      cancelAnimationFrame(compositeAnimFrameRef.current);
      compositeAnimFrameRef.current = null;
    }
    if (compositeStreamRef.current) {
      compositeStreamRef.current.getTracks().forEach(t => t.stop());
      compositeStreamRef.current = null;
    }
    canvasRef.current = null;
  }, []);

  /** Create a canvas-based composite stream: screen share as main, camera as PiP corner */
  const startCompositing = useCallback((screenStream: MediaStream, cameraStream: MediaStream): MediaStream => {
    stopCompositing();

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d')!;

    // Hidden video elements to draw from
    const screenVid = document.createElement('video');
    screenVid.srcObject = screenStream;
    screenVid.muted = true;
    screenVid.playsInline = true;
    screenVid.play().catch(() => {});

    const camVid = document.createElement('video');
    camVid.srcObject = cameraStream;
    camVid.muted = true;
    camVid.playsInline = true;
    camVid.play().catch(() => {});

    const PIP_W = 240;
    const PIP_H = 180;
    const PIP_MARGIN = 16;
    const PIP_RADIUS = 12;

    const draw = () => {
      // Draw screen share (fill entire canvas)
      ctx.drawImage(screenVid, 0, 0, canvas.width, canvas.height);

      // Draw camera PiP in bottom-right corner with rounded rect clip
      const pipX = canvas.width - PIP_W - PIP_MARGIN;
      const pipY = canvas.height - PIP_H - PIP_MARGIN;

      ctx.save();
      // Shadow for PiP
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Rounded rect clip path
      ctx.beginPath();
      ctx.moveTo(pipX + PIP_RADIUS, pipY);
      ctx.lineTo(pipX + PIP_W - PIP_RADIUS, pipY);
      ctx.quadraticCurveTo(pipX + PIP_W, pipY, pipX + PIP_W, pipY + PIP_RADIUS);
      ctx.lineTo(pipX + PIP_W, pipY + PIP_H - PIP_RADIUS);
      ctx.quadraticCurveTo(pipX + PIP_W, pipY + PIP_H, pipX + PIP_W - PIP_RADIUS, pipY + PIP_H);
      ctx.lineTo(pipX + PIP_RADIUS, pipY + PIP_H);
      ctx.quadraticCurveTo(pipX, pipY + PIP_H, pipX, pipY + PIP_H - PIP_RADIUS);
      ctx.lineTo(pipX, pipY + PIP_RADIUS);
      ctx.quadraticCurveTo(pipX, pipY, pipX + PIP_RADIUS, pipY);
      ctx.closePath();
      ctx.clip();

      // Draw camera (mirrored)
      ctx.translate(pipX + PIP_W, pipY);
      ctx.scale(-1, 1);
      ctx.drawImage(camVid, 0, 0, PIP_W, PIP_H);
      ctx.restore();

      // Border around PiP
      ctx.save();
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pipX + PIP_RADIUS, pipY);
      ctx.lineTo(pipX + PIP_W - PIP_RADIUS, pipY);
      ctx.quadraticCurveTo(pipX + PIP_W, pipY, pipX + PIP_W, pipY + PIP_RADIUS);
      ctx.lineTo(pipX + PIP_W, pipY + PIP_H - PIP_RADIUS);
      ctx.quadraticCurveTo(pipX + PIP_W, pipY + PIP_H, pipX + PIP_W - PIP_RADIUS, pipY + PIP_H);
      ctx.lineTo(pipX + PIP_RADIUS, pipY + PIP_H);
      ctx.quadraticCurveTo(pipX, pipY + PIP_H, pipX, pipY + PIP_H - PIP_RADIUS);
      ctx.lineTo(pipX, pipY + PIP_RADIUS);
      ctx.quadraticCurveTo(pipX, pipY, pipX + PIP_RADIUS, pipY);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      compositeAnimFrameRef.current = requestAnimationFrame(draw);
    };

    compositeAnimFrameRef.current = requestAnimationFrame(draw);

    const compositeStream = canvas.captureStream(30);
    compositeStreamRef.current = compositeStream;
    console.log('[ScreenShare] Composite stream created (screen + camera PiP)');
    return compositeStream;
  }, [stopCompositing]);

  /** Recompute which stream to broadcast based on current camera + screen state */
  const updateBroadcastStream = useCallback(() => {
    const hasCamera = cameraOn && streamRef.current;
    const hasScreen = screenShareOn && screenStreamRef.current;

    if (hasScreen && hasCamera) {
      // Both active → composite canvas stream
      const composite = startCompositing(screenStreamRef.current!, streamRef.current!);
      setBroadcastStream(composite);
      replaceStream(composite);
      console.log('[ScreenShare] Broadcasting composite (screen + camera PiP)');
    } else if (hasScreen) {
      // Screen only
      stopCompositing();
      setBroadcastStream(screenStreamRef.current);
      replaceStream(screenStreamRef.current!);
      console.log('[ScreenShare] Broadcasting screen share only');
    } else if (hasCamera) {
      // Camera only
      stopCompositing();
      setBroadcastStream(streamRef.current);
      replaceStream(streamRef.current!);
      console.log('[ScreenShare] Broadcasting camera only');
    } else {
      // Nothing
      stopCompositing();
      setBroadcastStream(null);
    }
  }, [cameraOn, screenShareOn, startCompositing, stopCompositing, replaceStream]);

  // Re-compute broadcast stream whenever camera or screen share state changes
  useEffect(() => {
    updateBroadcastStream();
  }, [cameraOn, screenShareOn, updateBroadcastStream]);

  const startScreenShare = useCallback(async () => {
    setScreenShareError(null);
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
        audio: false,
      });

      screenStreamRef.current = stream;
      if (screenVideoRef.current) {
        screenVideoRef.current.srcObject = stream;
      }

      // Listen for the browser's native "Stop sharing" button
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.addEventListener('ended', () => {
          console.log('[ScreenShare] User stopped sharing via browser UI');
          stopScreenShare();
        });
      }

      setScreenShareOn(true);
      console.log('[ScreenShare] Screen share started');
    } catch (e: any) {
      console.error('[ScreenShare] Error:', e);
      setScreenShareError(
        e.name === 'NotAllowedError'
          ? 'Screen share permission denied.'
          : 'Could not start screen share. Please try again.'
      );
    }
  }, []);

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }
    stopCompositing();
    setScreenShareOn(false);
    setScreenShareError(null);
    console.log('[ScreenShare] Screen share stopped');
  }, [stopCompositing]);

  const toggleScreenShare = useCallback(() => {
    if (screenShareOn) stopScreenShare();
    else startScreenShare();
  }, [screenShareOn, startScreenShare, stopScreenShare]);



  // ── Card deck operations ────────────────────────────────────────────────

  const drawCard = useCallback((): CharadesCard | null => {
    const available = cardDeck.filter(c => !usedCardIds.has(c.id));
    if (available.length === 0) {
      // Reshuffle all cards except current round's
      const reshuffled = allCards
        .filter(c => !cardsThisRound.includes(c.id))
        .sort(() => Math.random() - 0.5);
      if (reshuffled.length === 0) return null;
      setCardDeck(reshuffled);
      setUsedCardIds(new Set(cardsThisRound));
      return reshuffled[0];
    }
    return available[0];
  }, [cardDeck, usedCardIds, allCards, cardsThisRound]);

  // ── Game flow ───────────────────────────────────────────────────────────

  const startRound = useCallback(() => {
    const card = drawCard();
    if (!card) return;

    setCurrentCard(card);
    setCardRevealed(false);
    setTimeLeft(ROUND_TIME);
    setReadyCountdown(COUNTDOWN_READY);
    setPassesUsed(0);
    setGuesses([]);
    setRoundScore(0);
    setCardsThisRound([card.id]);
    setShowPhraseHint(false);
    setPhase('ready');
    lastBeepRef.current = 0;

    const newUsed = new Set(usedCardIds);
    newUsed.add(card.id);
    setUsedCardIds(newUsed);

    onAction('startRound', { 
      currentCardId: card.id, 
      usedCardIds: Array.from(newUsed), 
      roundActive: true,
      currentActor: currentActorIndex
    });
  }, [drawCard, usedCardIds, currentActorIndex, onAction]);

  const endRound = useCallback(() => {
    setIsRunning(false);
    setPhase('roundEnd');

    // Show the phrase to everyone
    setCardRevealed(true);

    const nextActor = (currentActorIndex + 1) % players.length;
    
    // Brief delay then advance
    setTimeout(() => {
      setCurrentActorIndex(nextActor);
      setPhase('lobby');
      setCurrentCard(null);
      setCardRevealed(false);
      onAction('endRound', { 
        roundActive: false, 
        currentCardId: null, 
        currentActor: nextActor,
        scores 
      });
    }, 4000);
  }, [currentActorIndex, players.length, scores, onAction]);

  const correctGuess = useCallback((guesserId?: string) => {
    if (!currentCard) return;

    const actorId = players[currentActorIndex]?.player_id;
    const newScores = { ...scores };
    
    // Actor gets points
    newScores[actorId] = (newScores[actorId] || 0) + POINTS_ACTOR;
    
    // Guesser gets points (if specified)
    if (guesserId) {
      newScores[guesserId] = (newScores[guesserId] || 0) + POINTS_GUESSER;
    }
    
    setScores(newScores);
    setRoundScore(prev => prev + 1);

    // Draw next card
    const card = drawCard();
    if (!card) {
      endRound();
      return;
    }

    const newUsed = new Set(usedCardIds);
    newUsed.add(card.id);
    setUsedCardIds(newUsed);
    setCardsThisRound(prev => [...prev, card.id]);
    setCurrentCard(card);
    setCardRevealed(false);
    setShowPhraseHint(false);
    setGuesses([]);

    onAction('correct', { 
      scores: newScores, 
      currentCardId: card.id, 
      usedCardIds: Array.from(newUsed) 
    });
  }, [currentCard, currentActorIndex, players, scores, drawCard, usedCardIds, endRound, onAction]);

  const passCard = useCallback(() => {
    if (passesUsed >= MAX_PASSES) return;
    setPassesUsed(prev => prev + 1);
    playFart();

    const card = drawCard();
    if (!card) {
      endRound();
      return;
    }

    const newUsed = new Set(usedCardIds);
    newUsed.add(card.id);
    setUsedCardIds(newUsed);
    setCardsThisRound(prev => [...prev, card.id]);
    setCurrentCard(card);
    setCardRevealed(false);
    setShowPhraseHint(false);

    onAction('pass', { 
      currentCardId: card.id, 
      usedCardIds: Array.from(newUsed) 
    });
  }, [passesUsed, drawCard, usedCardIds, endRound, playFart, onAction]);

  // ── Guess submission ────────────────────────────────────────────────────

  const submitGuess = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = guessInput.trim();
    if (!text || !currentCard || isActor) return;

    const guesserName = players.find(p => p.player_id === currentPlayerId)?.player_name || 'Unknown';
    
    // Check if guess matches the phrase (case-insensitive, flexible matching)
    const phrase = currentCard.card_name.toUpperCase().trim();
    const guess = text.toUpperCase().trim();
    
    // Exact match or close enough (remove punctuation for comparison)
    const normalize = (s: string) => s.replace(/[^A-Z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    const isCorrect = normalize(guess) === normalize(phrase) || 
                       guess === phrase ||
                       // Allow partial match if guess contains all key words
                       (phrase.split(' ').length > 2 && 
                        phrase.split(' ').every(word => guess.includes(word)));

    const newGuess: Guess = {
      playerId: currentPlayerId,
      playerName: guesserName,
      text,
      timestamp: Date.now(),
      isCorrect
    };

    setGuesses(prev => [...prev, newGuess]);
    setGuessInput('');

    if (isCorrect) {
      // Auto-score correct guess
      correctGuess(currentPlayerId);
    }

    onAction('guess', { guess: newGuess });
  }, [guessInput, currentCard, isActor, currentPlayerId, players, correctGuess, onAction]);

  // ── Hint system ─────────────────────────────────────────────────────────

  const getHint = useCallback((): string => {
    if (!currentCard) return '';
    const words = currentCard.card_name.split(' ');
    const wordCount = words.length;
    // Show word count and first letter of each word
    return words.map(w => w[0] + '_'.repeat(Math.max(0, w.length - 1))).join(' ') + ` (${wordCount} words)`;
  }, [currentCard]);

  // ── Timer display helpers ───────────────────────────────────────────────

  const timerPercent = (timeLeft / ROUND_TIME) * 100;
  const timerColor = timeLeft <= 10 ? 'text-red-400' : timeLeft <= 20 ? 'text-yellow-400' : 'text-green-400';
  const timerBarColor = timeLeft <= 10 ? 'bg-red-500' : timeLeft <= 20 ? 'bg-yellow-500' : 'bg-green-500';
  const timerRingColor = timeLeft <= 10 ? 'stroke-red-500' : timeLeft <= 20 ? 'stroke-yellow-500' : 'stroke-green-500';

  // ── Remaining cards count ───────────────────────────────────────────────
  const remainingCards = allCards.filter(c => !usedCardIds.has(c.id)).length;

  // ── Determine what video to show ────────────────────────────────────────
  const hasRemoteStream = !isActor && remoteStream && remoteStream.active;
  const hasLocalStream = isActor && (cameraOn || screenShareOn);
  const showVideo = hasRemoteStream || hasLocalStream;


  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Loading state ───────────────────────────────────────────────────────

  if (loadingCards) {
    return (
      <div className="bg-gradient-to-br from-orange-900 via-amber-900 to-red-900 rounded-2xl p-8 text-center">
        <Loader2 className="w-12 h-12 text-orange-400 animate-spin mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Loading Charades Cards...</h3>
        <p className="text-orange-300">Fetching 101 real phrases from the database</p>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────

  if (loadError) {
    return (
      <div className="bg-gradient-to-br from-orange-900 via-amber-900 to-red-900 rounded-2xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Failed to Load Cards</h3>
        <p className="text-red-300 mb-4">{loadError}</p>
        <Button onClick={loadCardsFromDB} className="bg-orange-600 hover:bg-orange-700">
          <RotateCcw className="w-4 h-4 mr-2" />Retry
        </Button>
      </div>
    );
  }

  // ── Game Over ───────────────────────────────────────────────────────────

  if (phase === 'gameOver' && winner) {
    const winnerPlayer = players.find(p => p.player_id === winner[0]);
    return (
      <div className="bg-gradient-to-br from-orange-900 via-amber-900 to-red-900 rounded-2xl p-8 text-center relative overflow-hidden">
        {/* Animated sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
        <Trophy className="w-24 h-24 text-yellow-400 mx-auto mb-4 animate-bounce" />
        <h3 className="text-4xl font-black text-white mb-2">GAME OVER!</h3>
        <p className="text-2xl text-yellow-400 font-bold mb-6">
          {winnerPlayer?.player_name} is the Slanging Shit Champion!
        </p>
        <div className="bg-black/30 rounded-xl p-4 max-w-md mx-auto">
          <h4 className="text-white font-bold mb-3">Final Scores</h4>
          {players
            .sort((a, b) => (scores[b.player_id] || 0) - (scores[a.player_id] || 0))
            .map((p, i) => (
              <div key={p.player_id} className={`flex justify-between items-center py-1 ${i === 0 ? 'text-yellow-400' : 'text-white/80'}`}>
                <span className="flex items-center gap-2">
                  {i === 0 && <Trophy className="w-4 h-4" />}
                  <span className="font-medium">{p.player_name}</span>
                </span>
                <span className="font-bold">{scores[p.player_id] || 0} pts</span>
              </div>
            ))}
        </div>
        <Button onClick={() => { setScores({}); setUsedCardIds(new Set()); setPhase('lobby'); setCurrentActorIndex(0); }} className="mt-6 bg-green-600 hover:bg-green-700">
          <RotateCcw className="w-4 h-4 mr-2" />Play Again
        </Button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MAIN GAME UI
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="bg-gradient-to-br from-orange-900 via-amber-900 to-red-900 rounded-2xl overflow-hidden">
      
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-black/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-black text-white tracking-wide">SLANGING SHIT</h3>
          <span className="text-xs bg-orange-600/50 text-orange-200 px-2 py-0.5 rounded-full font-medium">
            CHARADES
          </span>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-orange-300 flex items-center gap-1">
            <Users className="w-4 h-4" />{players.length}
          </span>
          <span className="text-orange-300 flex items-center gap-1">
            {remainingCards} cards left
          </span>
          {/* WebRTC streaming status */}
          {isActor && (cameraOn || screenShareOn) && (
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
              viewerCount > 0 ? 'bg-green-600/50 text-green-200' : 'bg-yellow-600/50 text-yellow-200'
            }`}>
              <Radio className="w-3 h-3" />
              {viewerCount > 0 ? `${viewerCount} viewer${viewerCount > 1 ? 's' : ''}` : 'Broadcasting...'}
            </span>
          )}
          {/* Screen share active badge */}
          {isActor && screenShareOn && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-indigo-600/50 text-indigo-200">
              <Monitor className="w-3 h-3" />
              Screen
            </span>
          )}
          {!isActor && hasRemoteStream && (
            <span className="flex items-center gap-1 text-xs bg-green-600/50 text-green-200 px-2 py-0.5 rounded-full">
              <MonitorPlay className="w-3 h-3" />
              Live
            </span>
          )}

        </div>
      </div>

      <div className="p-4">
        {/* ── Ready Countdown Overlay ───────────────────────────────────── */}
        {phase === 'ready' && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
            <div className="text-center">
              <p className="text-orange-300 text-xl mb-4">
                {isActor ? 'Get ready to act!' : `${actorName} is about to perform!`}
              </p>
              <div className="text-9xl font-black text-white animate-pulse">
                {readyCountdown}
              </div>
              {isActor && currentCard && (
                <div className="mt-6 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 max-w-md mx-auto">
                  <p className="text-yellow-200 text-sm mb-2">YOUR PHRASE:</p>
                  <p className="text-3xl font-black text-white">{currentCard.card_name}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-4">
          
          {/* ══════════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN - Video Stage */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-2 space-y-3">
            
            {/* Video Container */}
            <div 
              ref={videoContainerRef}
              className="relative bg-black rounded-xl overflow-hidden aspect-video group"
            >
              {/* ── Actor: screen share as main view ───────────────────── */}
              {isActor && screenShareOn && (
                <video 
                  ref={screenVideoRef} 
                  autoPlay 
                  muted 
                  playsInline
                  className="w-full h-full object-contain bg-black" 
                />
              )}

              {/* ── Actor: camera as main (when no screen share) ────────── */}
              {isActor && cameraOn && !screenShareOn && (
                <video 
                  ref={localVideoRef} 
                  autoPlay 
                  muted 
                  playsInline
                  className="w-full h-full object-cover" 
                  style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                />
              )}

              {/* ── Actor: camera PiP overlay (when screen sharing + camera both on) ── */}
              {isActor && screenShareOn && cameraOn && (
                <div className="absolute bottom-4 right-4 w-44 h-32 rounded-xl overflow-hidden shadow-2xl border-2 border-white/20 z-20 group/pip cursor-move hover:border-indigo-400/60 transition-colors">
                  <video 
                    ref={pipVideoRef} 
                    autoPlay 
                    muted 
                    playsInline
                    className="w-full h-full object-cover" 
                    style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                  />
                  {/* PiP label */}
                  <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-sm rounded px-1.5 py-0.5 flex items-center gap-1 opacity-0 group-hover/pip:opacity-100 transition-opacity">
                    <Camera className="w-2.5 h-2.5 text-white" />
                    <span className="text-[9px] text-white font-medium">Camera</span>
                  </div>
                </div>
              )}

              {/* ── Non-actor: show remote stream from actor ──────────── */}
              {!isActor && hasRemoteStream && (
                <video 
                  ref={remoteVideoRef} 
                  autoPlay 
                  playsInline
                  className="w-full h-full object-cover" 
                />
              )}

              {/* ── No video placeholder ──────────────────────────────── */}
              {!showVideo && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                  {!isActor && (phase === 'acting' || phase === 'ready') ? (
                    <>
                      {streamError ? (
                        <>
                          <WifiOff className="w-16 h-16 text-red-500 mb-3" />
                          <p className="text-red-400 text-lg font-medium">Connection Failed</p>
                          <p className="text-gray-500 text-sm mt-1 max-w-xs text-center">{streamError}</p>
                        </>
                      ) : (
                        <>
                          <div className="relative mb-4">
                            <MonitorPlay className="w-16 h-16 text-orange-400" />
                            <Loader2 className="w-6 h-6 text-orange-300 animate-spin absolute -bottom-1 -right-1" />
                          </div>
                          <p className="text-orange-300 text-lg font-medium">Waiting for {actorName}'s camera...</p>
                          <p className="text-gray-500 text-sm mt-1">
                            {Object.keys(peerStatuses).length > 0 ? 'Connecting via WebRTC...' : 'Waiting for video stream to start'}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2 justify-center">
                            {Object.entries(peerStatuses).map(([peerId, status]) => (
                              <PeerStatusBadge key={peerId} status={status} />
                            ))}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <CameraOff className="w-16 h-16 text-gray-600 mb-3" />
                      <p className="text-gray-500 text-lg font-medium">Camera Off</p>
                      {isActor && phase === 'acting' && (
                        <p className="text-orange-400 text-sm mt-2">Turn on your camera or share your screen to act!</p>
                      )}
                      {!isActor && phase === 'lobby' && (
                        <p className="text-gray-600 text-sm mt-2">The actor's camera feed will appear here during the round</p>
                      )}
                      {cameraError && <p className="text-red-400 text-xs mt-2 max-w-xs text-center">{cameraError}</p>}
                      {screenShareError && <p className="text-red-400 text-xs mt-2 max-w-xs text-center">{screenShareError}</p>}
                    </>
                  )}
                </div>
              )}

              {/* Screen share mode badge */}
              {isActor && screenShareOn && (
                <div className="absolute top-3 left-3 bg-indigo-600/80 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2 z-10">
                  <Monitor className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">
                    Screen Sharing{cameraOn ? ' + Camera' : ''}
                  </span>
                </div>
              )}

              {/* Actor name badge (non-screen-share) */}
              {(phase === 'acting' || phase === 'guessing') && !(isActor && screenShareOn) && (
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-sm font-medium">{actorName} is acting</span>
                </div>
              )}

              {/* WebRTC streaming indicator for actor */}
              {isActor && (cameraOn || screenShareOn) && isStreaming && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-green-600/80 to-emerald-600/80 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2 z-10">
                  <Signal className="w-3.5 h-3.5 text-white animate-pulse" />
                  <span className="text-white text-xs font-medium">
                    LIVE to {viewerCount} viewer{viewerCount !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              {/* WebRTC connection status for viewer */}
              {!isActor && hasRemoteStream && (
                <div className={`absolute top-3 right-14 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1.5 ${
                  iceSource === 'turn-relay' ? 'bg-blue-600/60' : 'bg-green-600/60'
                }`}>
                  <Wifi className="w-3 h-3 text-white" />
                  <span className="text-white text-[10px] font-medium">{iceSource === 'turn-relay' ? 'RELAY' : 'P2P'}</span>
                </div>
              )}

              {/* Timer overlay on video */}
              {isRunning && (
                <div className="absolute top-3 right-3">
                  <div className={`relative w-14 h-14 ${timeLeft <= 10 ? 'animate-pulse' : ''}`}>
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                      <circle cx="28" cy="28" r="24" fill="rgba(0,0,0,0.6)" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                      <circle cx="28" cy="28" r="24" fill="none" className={timerRingColor} strokeWidth="3" strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 24}`} strokeDashoffset={`${2 * Math.PI * 24 * (1 - timerPercent / 100)}`}
                        style={{ transition: 'stroke-dashoffset 1s linear' }} />
                    </svg>
                    <span className={`absolute inset-0 flex items-center justify-center text-lg font-bold ${timerColor}`}>{timeLeft}</span>
                  </div>
                </div>
              )}

              {/* Round score overlay */}
              {isRunning && roundScore > 0 && (
                <div className="absolute bottom-3 left-3 bg-green-600/80 backdrop-blur-sm rounded-lg px-3 py-1.5 z-10">
                  <span className="text-white text-sm font-bold">{roundScore} correct this round</span>
                </div>
              )}

              {/* Video controls overlay */}
              {isActor && (
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {!screenShareOn && (
                    <button onClick={flipCamera} className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors" title="Flip camera">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={toggleFullscreen} className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors" title="Fullscreen">
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Viewer fullscreen control */}
              {!isActor && hasRemoteStream && (
                <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={toggleFullscreen} className="w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors" title="Fullscreen">
                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>

            {/* Camera + Screen Share + Action Buttons */}
            <div className="flex flex-wrap gap-2">
              {/* Only actor can toggle camera */}
              {isActor && (
                <Button 
                  onClick={toggleCamera} 
                  className={`${cameraOn ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'} transition-colors`}
                >
                  {cameraOn ? <><VideoOff className="w-4 h-4 mr-2" />Stop Camera</> : <><Video className="w-4 h-4 mr-2" />Start Camera</>}
                </Button>
              )}

              {/* Screen Share button (actor only) */}
              {isActor && (
                <Button 
                  onClick={toggleScreenShare} 
                  className={`${screenShareOn 
                    ? 'bg-indigo-600 hover:bg-indigo-700 ring-2 ring-indigo-400/50' 
                    : 'bg-indigo-500/70 hover:bg-indigo-600'} transition-all`}
                >
                  {screenShareOn 
                    ? <><MonitorOff className="w-4 h-4 mr-2" />Stop Sharing</> 
                    : <><Monitor className="w-4 h-4 mr-2" />Share Screen</>}
                </Button>
              )}

              {/* Screen share error */}
              {screenShareError && (
                <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-900/20 border border-red-700/30 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{screenShareError}</span>
                </div>
              )}

              {/* Viewer streaming info */}
              {!isActor && hasRemoteStream && (
                <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 border ${
                  iceSource === 'turn-relay' 
                    ? 'text-blue-300 bg-blue-900/30 border-blue-700/30' 
                    : 'text-green-300 bg-green-900/30 border-green-700/30'
                }`}>
                  <Wifi className="w-4 h-4" />
                  <span>Watching <strong>{actorName}</strong> via {iceSource === 'turn-relay' ? 'TURN relay' : 'P2P'}</span>
                </div>
              )}

              {phase === 'lobby' && isActor && (
                <Button onClick={startRound} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 font-bold">
                  <Play className="w-4 h-4 mr-2" />Start Round
                </Button>
              )}

              {phase === 'acting' && isActor && (
                <>
                  <Button onClick={() => correctGuess()} className="bg-green-600 hover:bg-green-700">
                    <Check className="w-4 h-4 mr-2" />Correct!
                  </Button>
                  <Button onClick={passCard} disabled={passesUsed >= MAX_PASSES} variant="outline" className="border-orange-500 text-orange-300 hover:bg-orange-500/20">
                    <SkipForward className="w-4 h-4 mr-2" />Pass {passesUsed >= MAX_PASSES ? '(Used)' : `(${MAX_PASSES - passesUsed} left)`}
                  </Button>
                  <Button onClick={endRound} variant="destructive">
                    <X className="w-4 h-4 mr-2" />End Round
                  </Button>
                </>
              )}

              {phase === 'lobby' && !isActor && (
                <div className="flex items-center gap-2 text-orange-300 bg-black/20 rounded-lg px-4 py-2">
                  <Clock className="w-4 h-4" />
                  <span>Waiting for <strong>{actorName}</strong> to start...</span>
                </div>
              )}
            </div>


            {/* ── Phrase Card (Actor Only) ──────────────────────────────── */}
            {phase === 'acting' && isActor && currentCard && (
              <div 
                className="relative cursor-pointer perspective-1000"
                onClick={() => setCardRevealed(!cardRevealed)}
              >
                <div className={`relative transition-transform duration-500 transform-style-preserve-3d ${cardRevealed ? '' : ''}`}>
                  <div className="bg-gradient-to-br from-yellow-500 via-orange-500 to-red-500 rounded-xl p-1">
                    <div className="bg-gradient-to-br from-yellow-900/90 to-orange-900/90 rounded-lg p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 text-sm font-bold uppercase tracking-wider">Act This Out</span>
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                      </div>
                      <p className="text-3xl md:text-4xl font-black text-white leading-tight">
                        {currentCard.card_name}
                      </p>
                      <p className="text-yellow-500/60 text-xs mt-3">
                        Card #{currentCard.card_number} of {allCards.length} &bull; No talking!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Round End Reveal ──────────────────────────────────────── */}
            {phase === 'roundEnd' && currentCard && (
              <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/30 rounded-xl p-4 text-center animate-in fade-in duration-500">
                <p className="text-purple-300 text-sm mb-1">The phrase was:</p>
                <p className="text-3xl font-black text-white">{currentCard.card_name}</p>
                <p className="text-orange-300 mt-2">
                  {actorName} scored {roundScore} point{roundScore !== 1 ? 's' : ''} this round!
                </p>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN - Guessing & Scores */}
          {/* ══════════════════════════════════════════════════════════════ */}
          <div className="space-y-3">
            
            {/* ── Timer Bar ────────────────────────────────────────────── */}
            {(phase === 'acting' || phase === 'guessing') && (
              <div className={`bg-black/30 rounded-xl p-4 ${timeLeft <= 10 ? 'ring-2 ring-red-500/50 animate-pulse' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm font-medium flex items-center gap-1">
                    <Timer className="w-4 h-4" />Time Left
                  </span>
                  <span className={`text-3xl font-black ${timerColor}`}>{timeLeft}s</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${timerBarColor}`} 
                    style={{ width: `${timerPercent}%` }} 
                  />
                </div>
              </div>
            )}

            {/* ── WebRTC Connection Panel (during active game) ──────────── */}
            {(phase === 'acting' || phase === 'ready') && isActor && cameraOn && Object.keys(peerStatuses).length > 0 && (
              <div className="bg-black/20 rounded-xl p-3">
                <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Signal className="w-3.5 h-3.5 text-green-400" />
                  Stream Connections
                </h4>
                <div className="space-y-1">
                  {Object.entries(peerStatuses).map(([peerId, status]) => {
                    const peer = players.find(p => p.player_id === peerId);
                    return (
                      <div key={peerId} className="flex items-center justify-between bg-black/20 rounded-lg px-2 py-1.5">
                        <span className="text-white/70 text-xs truncate">{peer?.player_name || peerId.slice(0, 8)}</span>
                        <PeerStatusBadge status={status} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Guess Feed / Chat ────────────────────────────────────── */}
            {(phase === 'acting' || phase === 'roundEnd') && (
              <div className="bg-black/30 rounded-xl overflow-hidden flex flex-col" style={{ height: '300px' }}>
                <div className="bg-black/30 px-3 py-2 flex items-center justify-between border-b border-white/5">
                  <span className="text-white font-bold text-sm flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 text-orange-400" />
                    Guesses
                  </span>
                  {!isActor && currentCard && (
                    <button 
                      onClick={() => setShowPhraseHint(!showPhraseHint)}
                      className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1"
                    >
                      {showPhraseHint ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      {showPhraseHint ? 'Hide' : 'Hint'}
                    </button>
                  )}
                </div>

                {/* Hint bar */}
                {showPhraseHint && !isActor && (
                  <div className="bg-yellow-600/20 px-3 py-1.5 border-b border-yellow-500/20">
                    <p className="text-yellow-300 text-xs font-mono tracking-wider">{getHint()}</p>
                  </div>
                )}

                {/* Guess list */}
                <div ref={guessListRef} className="flex-1 overflow-y-auto p-3 space-y-2">
                  {guesses.length === 0 && (
                    <div className="text-center text-gray-500 text-sm py-8">
                      {isActor ? 'Waiting for guesses...' : 'Type your guess below!'}
                    </div>
                  )}
                  {guesses.map((g, i) => (
                    <div 
                      key={i} 
                      className={`rounded-lg px-3 py-2 ${
                        g.isCorrect 
                          ? 'bg-green-600/30 border border-green-500/30' 
                          : 'bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-orange-400 text-xs font-bold">{g.playerName}</span>
                        {g.isCorrect && <Check className="w-3 h-3 text-green-400" />}
                      </div>
                      <p className={`text-sm ${g.isCorrect ? 'text-green-300 font-bold' : 'text-white/80'}`}>
                        {g.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Guess input (non-actors only) */}
                {!isActor && phase === 'acting' && (
                  <form onSubmit={submitGuess} className="p-2 border-t border-white/5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={guessInput}
                        onChange={(e) => setGuessInput(e.target.value)}
                        placeholder="Type your guess..."
                        className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                        autoFocus
                      />
                      <Button 
                        type="submit" 
                        size="sm" 
                        className="bg-orange-600 hover:bg-orange-700 px-3"
                        disabled={!guessInput.trim()}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* Actor view - voting buttons for manual scoring */}
                {isActor && phase === 'acting' && guesses.length > 0 && (
                  <div className="p-2 border-t border-white/5">
                    <p className="text-xs text-gray-400 mb-1">Tap a guess to mark correct:</p>
                    <div className="flex flex-wrap gap-1">
                      {guesses.filter(g => !g.isCorrect).slice(-3).map((g, i) => (
                        <button
                          key={i}
                          onClick={() => correctGuess(g.playerId)}
                          className="text-xs bg-green-600/20 hover:bg-green-600/40 text-green-300 rounded-lg px-2 py-1 transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3 inline mr-1" />{g.playerName}: {g.text}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Scoreboard ───────────────────────────────────────────── */}
            <div className="bg-black/30 rounded-xl p-3">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-bold text-sm flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  Scores
                </h4>
                <span className="text-orange-400 text-xs">First to {WIN_SCORE}</span>
              </div>
              <div className="space-y-1.5">
                {players
                  .map((p, i) => ({ ...p, originalIndex: i }))
                  .sort((a, b) => (scores[b.player_id] || 0) - (scores[a.player_id] || 0))
                  .map((p) => {
                    const playerScore = scores[p.player_id] || 0;
                    const isCurrentActor = p.originalIndex === currentActorIndex;
                    const isMe = p.player_id === currentPlayerId;
                    const peerStatus = peerStatuses[p.player_id];
                    return (
                      <div 
                        key={p.player_id} 
                        className={`flex items-center justify-between rounded-lg px-3 py-2 transition-colors ${
                          isCurrentActor 
                            ? 'bg-orange-600/20 border border-orange-500/30' 
                            : isMe 
                            ? 'bg-blue-600/10 border border-blue-500/20' 
                            : 'bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${isCurrentActor ? 'text-orange-300' : isMe ? 'text-blue-300' : 'text-white/80'}`}>
                            {p.player_name}
                          </span>
                          {isCurrentActor && (
                            <span className="text-[10px] bg-orange-600/50 text-orange-200 px-1.5 py-0.5 rounded-full">
                              ACTING
                            </span>
                          )}
                          {isMe && !isCurrentActor && (
                            <span className="text-[10px] bg-blue-600/50 text-blue-200 px-1.5 py-0.5 rounded-full">
                              YOU
                            </span>
                          )}
                          {/* Show WebRTC connection status for each player (actor view) */}
                          {isActor && peerStatus && !isMe && (
                            <PeerStatusBadge status={peerStatus} />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Score bar */}
                          <div className="w-20 bg-gray-800 rounded-full h-1.5 hidden sm:block">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-500"
                              style={{ width: `${Math.min(100, (playerScore / WIN_SCORE) * 100)}%` }}
                            />
                          </div>
                          <span className={`font-bold text-sm min-w-[2rem] text-right ${isCurrentActor ? 'text-orange-400' : 'text-white'}`}>
                            {playerScore}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* ── Turn Order ───────────────────────────────────────────── */}
            {phase === 'lobby' && (
              <div className="bg-black/20 rounded-xl p-3">
                <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">Turn Order</h4>
                <div className="flex flex-wrap gap-1.5">
                  {players.map((p, i) => (
                    <div 
                      key={p.player_id}
                      className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs ${
                        i === currentActorIndex 
                          ? 'bg-orange-600 text-white font-bold' 
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {i === currentActorIndex && <ChevronRight className="w-3 h-3" />}
                      {p.player_name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Rules Reminder ────────────────────────────────────────── */}
            {phase === 'lobby' && (
              <div className="bg-black/20 rounded-xl p-3">
                <h4 className="text-white/60 text-xs font-bold uppercase tracking-wider mb-2">How to Play</h4>
                <ul className="text-white/50 text-xs space-y-1">
                  <li className="flex items-start gap-1.5">
                    <span className="text-orange-400 font-bold mt-0.5">1.</span>
                    The actor draws a phrase card and acts it out
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-orange-400 font-bold mt-0.5">2.</span>
                    NO TALKING - use gestures, body language only!
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-orange-400 font-bold mt-0.5">3.</span>
                    Other players type guesses in the chat
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-orange-400 font-bold mt-0.5">4.</span>
                    Correct guess: +{POINTS_GUESSER} pts (guesser), +{POINTS_ACTOR} pt (actor)
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-orange-400 font-bold mt-0.5">5.</span>
                    First to {WIN_SCORE} points wins!
                  </li>
                </ul>
                {/* WebRTC + TURN info */}
                <div className="mt-3 pt-2 border-t border-white/5 space-y-1">
                  <div className="flex items-center gap-1.5 text-green-400/70 text-[10px]">
                    <Wifi className="w-3 h-3" />
                    <span>Video streams via WebRTC peer-to-peer connection</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px]">
                    <Signal className="w-3 h-3 text-blue-400/70" />
                    <span className={iceSource === 'turn-relay' ? 'text-blue-400/70' : iceSource === 'stun-fallback' ? 'text-yellow-400/70' : 'text-gray-500'}>
                      {iceSource === 'turn-relay' 
                        ? 'TURN relay available for restricted networks' 
                        : iceSource === 'stun-fallback'
                        ? 'STUN only (TURN relay not configured)'
                        : iceSource === 'loading'
                        ? 'Loading ICE configuration...'
                        : 'STUN fallback (credential error)'}
                    </span>
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
