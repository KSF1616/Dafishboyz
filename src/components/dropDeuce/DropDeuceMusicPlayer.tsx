import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Music, Sparkles } from 'lucide-react';

interface DropDeuceMusicPlayerProps {
  onTimerEnd?: () => void;
  compact?: boolean;
}

// Fun party music notes for the hot poo game
const MUSIC_NOTES = [
  { freq: 523.25, duration: 0.2 }, // C5
  { freq: 587.33, duration: 0.2 }, // D5
  { freq: 659.25, duration: 0.2 }, // E5
  { freq: 698.46, duration: 0.2 }, // F5
  { freq: 783.99, duration: 0.2 }, // G5
  { freq: 880.00, duration: 0.2 }, // A5
  { freq: 987.77, duration: 0.2 }, // B5
  { freq: 1046.50, duration: 0.3 }, // C6
];

const DropDeuceMusicPlayer: React.FC<DropDeuceMusicPlayerProps> = ({ onTimerEnd, compact = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isMuted, setIsMuted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
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

  const playNote = useCallback((frequency: number, duration: number) => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [isMuted, getAudioContext]);

  const playBuzzer = useCallback(() => {
    if (isMuted) return;
    
    try {
      const ctx = getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = 200;
      oscillator.type = 'square';
      
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 1);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [isMuted, getAudioContext]);

  const startMusic = useCallback(() => {
    if (musicIntervalRef.current) return;
    
    noteIndexRef.current = 0;
    musicIntervalRef.current = setInterval(() => {
      const note = MUSIC_NOTES[noteIndexRef.current % MUSIC_NOTES.length];
      playNote(note.freq, note.duration);
      noteIndexRef.current++;
    }, 250);
  }, [playNote]);

  const stopMusic = useCallback(() => {
    if (musicIntervalRef.current) {
      clearInterval(musicIntervalRef.current);
      musicIntervalRef.current = null;
    }
  }, []);

  const handlePlay = () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      stopMusic();
    } else {
      // Play
      setIsPlaying(true);
      startMusic();
      
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer ended!
            setIsPlaying(false);
            stopMusic();
            playBuzzer();
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 3000);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            onTimerEnd?.();
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setTimeLeft(30);
    stopMusic();
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopMusic();
    };
  }, [stopMusic]);

  const formatTime = (seconds: number) => {
    return `0:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercent = ((30 - timeLeft) / 30) * 100;

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl p-4 text-white">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlay}
            className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
          
          <div className="flex-1">
            <div className="text-2xl font-black">{formatTime(timeLeft)}</div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-yellow-400 transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-white/20 rounded-lg transition-all"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 rounded-3xl p-8 text-white overflow-hidden">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`
              }}
            >
              <Sparkles className="w-6 h-6 text-yellow-300" />
            </div>
          ))}
        </div>
      )}
      
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black">Hot Poo Music Timer</h3>
            <p className="text-white/70 text-sm">Pass the poo before the music stops!</p>
          </div>
        </div>
        
        {/* Timer display */}
        <div className="text-center mb-6">
          <div className="text-7xl font-black tracking-tight mb-2">
            {formatTime(timeLeft)}
          </div>
          <div className="h-4 bg-white/20 rounded-full overflow-hidden mx-auto max-w-xs">
            <div 
              className={`h-full transition-all duration-1000 ${
                timeLeft <= 5 ? 'bg-red-400 animate-pulse' : 
                timeLeft <= 10 ? 'bg-orange-400' : 'bg-yellow-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {timeLeft <= 5 && isPlaying && (
            <p className="text-yellow-300 font-bold mt-2 animate-pulse">
              Hurry! Pass the poo!
            </p>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          
          <button
            onClick={handlePlay}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
              isPlaying 
                ? 'bg-red-500 hover:bg-red-400' 
                : 'bg-green-500 hover:bg-green-400'
            }`}
          >
            {isPlaying ? (
              <Pause className="w-10 h-10" />
            ) : (
              <Play className="w-10 h-10 ml-1" />
            )}
          </button>
          
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
          >
            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Instructions */}
        <div className="mt-6 text-center text-white/70 text-sm">
          <p>Press play and pass the hot poo around the circle!</p>
          <p>Whoever is holding it when the music stops is OUT!</p>
        </div>
      </div>
    </div>
  );
};

export default DropDeuceMusicPlayer;
