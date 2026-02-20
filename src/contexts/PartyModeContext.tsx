import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import {
  PartyTheme,
  PartyPlaylist,
  PartyModeState,
  PartyModeSettings,
  ChallengeTimer,
  PARTY_THEMES,
  PARTY_PLAYLISTS,
  SoundEffect,
  SOUND_EFFECTS
} from '@/types/partyMode';

interface PartyModeContextType {
  // State
  state: PartyModeState;
  settings: PartyModeSettings;
  
  // Theme controls
  setTheme: (theme: PartyTheme) => void;
  themes: PartyTheme[];
  
  // Playlist controls
  setPlaylist: (playlist: PartyPlaylist | null) => void;
  playlists: PartyPlaylist[];
  playMusic: () => void;
  pauseMusic: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (volume: number) => void;
  
  // Timer controls
  startTimer: (duration?: number) => void;
  pauseTimer: () => void;
  resetTimer: (duration?: number) => void;
  setTimerMode: (mode: ChallengeTimer['mode']) => void;
  
  // Sound effects
  playSoundEffect: (effect: SoundEffect) => void;
  soundEffects: SoundEffect[];
  
  // Confetti
  triggerConfetti: (intensity?: PartyModeState['confettiIntensity']) => void;
  
  // Party mode controls
  activatePartyMode: () => void;
  deactivatePartyMode: () => void;
  updateSettings: (settings: Partial<PartyModeSettings>) => void;
  
  // Scoring
  addScore: (playerId: string, points: number) => void;
  resetScores: () => void;
  incrementRound: () => void;
}

const defaultState: PartyModeState = {
  isActive: false,
  currentTheme: PARTY_THEMES[0],
  currentPlaylist: null,
  currentTrackIndex: 0,
  isPlaying: false,
  volume: 0.7,
  timer: {
    duration: 30,
    isRunning: false,
    timeRemaining: 30,
    mode: 'countdown',
    warningThreshold: 5
  },
  roundNumber: 1,
  scores: {},
  showConfetti: false,
  confettiIntensity: 'medium'
};

const defaultSettings: PartyModeSettings = {
  autoPlayMusic: true,
  soundEffectsEnabled: true,
  confettiEnabled: true,
  timerSounds: true,
  randomTimerVariation: 5,
  challengeCardsEnabled: true
};

const PartyModeContext = createContext<PartyModeContextType | null>(null);

export const usePartyMode = () => {
  const context = useContext(PartyModeContext);
  if (!context) {
    throw new Error('usePartyMode must be used within a PartyModeProvider');
  }
  return context;
};

export const PartyModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PartyModeState>(defaultState);
  const [settings, setSettings] = useState<PartyModeSettings>(defaultSettings);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const musicIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const noteIndexRef = useRef(0);
  
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);
  
  // Play a single note
  const playNote = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(volume * state.volume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [getAudioContext, state.volume]);
  
  // Play sound effect
  const playSoundEffect = useCallback((effect: SoundEffect) => {
    if (!settings.soundEffectsEnabled) return;
    
    if (effect.frequencies && effect.duration) {
      const noteDelay = effect.duration / effect.frequencies.length;
      effect.frequencies.forEach((freq, i) => {
        setTimeout(() => {
          playNote(freq, noteDelay * 1.5, 'square', 0.4);
        }, i * noteDelay * 1000);
      });
    }
  }, [settings.soundEffectsEnabled, playNote]);
  
  // Music playback
  const playMusic = useCallback(() => {
    if (!state.currentPlaylist || musicIntervalRef.current) return;
    
    const track = state.currentPlaylist.tracks[state.currentTrackIndex];
    if (!track) return;
    
    setState(prev => ({ ...prev, isPlaying: true }));
    noteIndexRef.current = 0;
    
    const bpmInterval = 60000 / (track.bpm || 120);
    
    musicIntervalRef.current = setInterval(() => {
      const freq = track.frequencies[noteIndexRef.current % track.frequencies.length];
      playNote(freq, 0.2, 'sine', 0.25);
      noteIndexRef.current++;
    }, bpmInterval / 2);
  }, [state.currentPlaylist, state.currentTrackIndex, playNote]);
  
  const pauseMusic = useCallback(() => {
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
    setState(prev => ({ ...prev, isPlaying: false }));
  }, []);
  
  const nextTrack = useCallback(() => {
    if (!state.currentPlaylist) return;
    const wasPlaying = state.isPlaying;
    pauseMusic();
    setState(prev => ({
      ...prev,
      currentTrackIndex: (prev.currentTrackIndex + 1) % (prev.currentPlaylist?.tracks.length || 1)
    }));
    if (wasPlaying) {
      setTimeout(playMusic, 100);
    }
  }, [state.currentPlaylist, state.isPlaying, pauseMusic, playMusic]);
  
  const prevTrack = useCallback(() => {
    if (!state.currentPlaylist) return;
    const wasPlaying = state.isPlaying;
    pauseMusic();
    setState(prev => ({
      ...prev,
      currentTrackIndex: prev.currentTrackIndex === 0 
        ? (prev.currentPlaylist?.tracks.length || 1) - 1 
        : prev.currentTrackIndex - 1
    }));
    if (wasPlaying) {
      setTimeout(playMusic, 100);
    }
  }, [state.currentPlaylist, state.isPlaying, pauseMusic, playMusic]);
  
  // Timer controls
  const startTimer = useCallback((duration?: number) => {
    if (timerRef.current) return;
    
    const baseDuration = duration || state.timer.duration;
    let actualDuration = baseDuration;
    
    // Add random variation for random mode
    if (state.timer.mode === 'random') {
      const variation = Math.floor(Math.random() * settings.randomTimerVariation * 2) - settings.randomTimerVariation;
      actualDuration = Math.max(5, baseDuration + variation);
    }
    
    setState(prev => ({
      ...prev,
      timer: {
        ...prev.timer,
        isRunning: true,
        timeRemaining: actualDuration
      }
    }));
    
    // Auto-play music if enabled
    if (settings.autoPlayMusic && state.currentPlaylist && !state.isPlaying) {
      playMusic();
    }
    
    timerRef.current = setInterval(() => {
      setState(prev => {
        const newTime = prev.timer.timeRemaining - 1;
        
        // Play warning beeps
        if (settings.timerSounds && newTime <= prev.timer.warningThreshold && newTime > 0) {
          playNote(880, 0.1, 'square', 0.5);
        }
        
        if (newTime <= 0) {
          // Timer ended
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          pauseMusic();
          
          // Play buzzer
          if (settings.timerSounds) {
            playNote(200, 0.5, 'square', 0.6);
            setTimeout(() => playNote(180, 0.5, 'square', 0.5), 200);
          }
          
          // Trigger confetti
          if (settings.confettiEnabled) {
            return {
              ...prev,
              timer: { ...prev.timer, isRunning: false, timeRemaining: 0 },
              showConfetti: true,
              confettiIntensity: 'high'
            };
          }
          
          return {
            ...prev,
            timer: { ...prev.timer, isRunning: false, timeRemaining: 0 }
          };
        }
        
        return {
          ...prev,
          timer: { ...prev.timer, timeRemaining: newTime }
        };
      });
    }, 1000);
  }, [state.timer.duration, state.timer.mode, state.currentPlaylist, state.isPlaying, settings, playMusic, pauseMusic, playNote]);
  
  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    pauseMusic();
    setState(prev => ({
      ...prev,
      timer: { ...prev.timer, isRunning: false }
    }));
  }, [pauseMusic]);
  
  const resetTimer = useCallback((duration?: number) => {
    pauseTimer();
    setState(prev => ({
      ...prev,
      timer: {
        ...prev.timer,
        timeRemaining: duration || prev.timer.duration,
        isRunning: false
      },
      showConfetti: false
    }));
  }, [pauseTimer]);
  
  // Confetti
  const triggerConfetti = useCallback((intensity: PartyModeState['confettiIntensity'] = 'medium') => {
    if (!settings.confettiEnabled) return;
    
    setState(prev => ({
      ...prev,
      showConfetti: true,
      confettiIntensity: intensity
    }));
    
    // Auto-hide confetti after animation
    setTimeout(() => {
      setState(prev => ({ ...prev, showConfetti: false }));
    }, 4000);
  }, [settings.confettiEnabled]);
  
  // Party mode controls
  const activatePartyMode = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true }));
    if (settings.soundEffectsEnabled) {
      // Play activation sound
      playNote(523.25, 0.15, 'sine', 0.4);
      setTimeout(() => playNote(659.25, 0.15, 'sine', 0.4), 100);
      setTimeout(() => playNote(783.99, 0.15, 'sine', 0.4), 200);
      setTimeout(() => playNote(1046.50, 0.3, 'sine', 0.5), 300);
    }
  }, [settings.soundEffectsEnabled, playNote]);
  
  const deactivatePartyMode = useCallback(() => {
    pauseTimer();
    pauseMusic();
    setState(prev => ({ ...prev, isActive: false, showConfetti: false }));
  }, [pauseTimer, pauseMusic]);
  
  // Scoring
  const addScore = useCallback((playerId: string, points: number) => {
    setState(prev => ({
      ...prev,
      scores: {
        ...prev.scores,
        [playerId]: (prev.scores[playerId] || 0) + points
      }
    }));
    
    if (settings.soundEffectsEnabled) {
      playNote(880, 0.1, 'sine', 0.3);
      setTimeout(() => playNote(1100, 0.15, 'sine', 0.4), 100);
    }
  }, [settings.soundEffectsEnabled, playNote]);
  
  const resetScores = useCallback(() => {
    setState(prev => ({ ...prev, scores: {}, roundNumber: 1 }));
  }, []);
  
  const incrementRound = useCallback(() => {
    setState(prev => ({ ...prev, roundNumber: prev.roundNumber + 1 }));
  }, []);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (musicIntervalRef.current) clearInterval(musicIntervalRef.current);
    };
  }, []);
  
  const value: PartyModeContextType = {
    state,
    settings,
    setTheme: (theme) => setState(prev => ({ ...prev, currentTheme: theme })),
    themes: PARTY_THEMES,
    setPlaylist: (playlist) => setState(prev => ({ 
      ...prev, 
      currentPlaylist: playlist, 
      currentTrackIndex: 0 
    })),
    playlists: PARTY_PLAYLISTS,
    playMusic,
    pauseMusic,
    nextTrack,
    prevTrack,
    setVolume: (volume) => setState(prev => ({ ...prev, volume })),
    startTimer,
    pauseTimer,
    resetTimer,
    setTimerMode: (mode) => setState(prev => ({ 
      ...prev, 
      timer: { ...prev.timer, mode } 
    })),
    playSoundEffect,
    soundEffects: SOUND_EFFECTS,
    triggerConfetti,
    activatePartyMode,
    deactivatePartyMode,
    updateSettings: (newSettings) => setSettings(prev => ({ ...prev, ...newSettings })),
    addScore,
    resetScores,
    incrementRound
  };
  
  return (
    <PartyModeContext.Provider value={value}>
      {children}
    </PartyModeContext.Provider>
  );
};
