import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Clock, Zap, Shuffle, Skull, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { usePartyMode } from '@/contexts/PartyModeContext';

interface PartyTimerProps {
  onTimerEnd?: () => void;
  compact?: boolean;
}

const PartyTimer: React.FC<PartyTimerProps> = ({ onTimerEnd, compact = false }) => {
  const { state, startTimer, pauseTimer, resetTimer, setTimerMode, settings, updateSettings } = usePartyMode();
  const [showSettings, setShowSettings] = useState(false);
  const [customDuration, setCustomDuration] = useState(30);
  
  const { timer, currentTheme } = state;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 
      ? `${mins}:${secs.toString().padStart(2, '0')}`
      : `0:${secs.toString().padStart(2, '0')}`;
  };
  
  const progressPercent = ((timer.duration - timer.timeRemaining) / timer.duration) * 100;
  const isWarning = timer.timeRemaining <= timer.warningThreshold && timer.timeRemaining > 0;
  const isEnded = timer.timeRemaining === 0 && !timer.isRunning;
  
  const handlePlayPause = () => {
    if (timer.isRunning) {
      pauseTimer();
    } else {
      startTimer(customDuration);
    }
  };
  
  const handleReset = () => {
    resetTimer(customDuration);
  };
  
  const timerModes = [
    { id: 'countdown', name: 'Countdown', icon: Clock, description: 'Fixed time countdown' },
    { id: 'random', name: 'Random', icon: Shuffle, description: 'Varies by ±5 seconds' },
    { id: 'sudden-death', name: 'Sudden Death', icon: Skull, description: 'Extra tension!' }
  ] as const;
  
  const presetDurations = [15, 20, 30, 45, 60];
  
  if (compact) {
    return (
      <div 
        className="rounded-xl p-4 text-white"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.secondaryColor})`
        }}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={handlePlayPause}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              timer.isRunning 
                ? 'bg-red-500 hover:bg-red-400' 
                : 'bg-green-500 hover:bg-green-400'
            }`}
          >
            {timer.isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
          </button>
          
          <div className="flex-1">
            <div className={`text-3xl font-black ${isWarning ? 'text-red-300 animate-pulse' : ''}`}>
              {formatTime(timer.timeRemaining)}
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${
                  isWarning ? 'bg-red-400 animate-pulse' : 'bg-yellow-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          
          <button
            onClick={handleReset}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className="rounded-2xl p-6 text-white overflow-hidden relative"
      style={{
        background: `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.secondaryColor})`
      }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {timer.mode === 'countdown' && <Clock className="w-6 h-6" />}
              {timer.mode === 'random' && <Shuffle className="w-6 h-6" />}
              {timer.mode === 'sudden-death' && <Skull className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-xl font-black">Challenge Timer</h3>
              <p className="text-white/70 text-sm">
                {timerModes.find(m => m.id === timer.mode)?.name} Mode
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
          >
            {showSettings ? <ChevronUp className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-black/20 rounded-xl p-4 mb-6 space-y-4">
            {/* Timer Mode Selection */}
            <div>
              <p className="text-white/70 text-sm mb-2">Timer Mode</p>
              <div className="grid grid-cols-3 gap-2">
                {timerModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setTimerMode(mode.id)}
                    className={`p-3 rounded-lg flex flex-col items-center gap-1 transition-all ${
                      timer.mode === mode.id
                        ? 'bg-white/30 ring-2 ring-white'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    <mode.icon className="w-5 h-5" />
                    <span className="text-xs font-bold">{mode.name}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Duration Presets */}
            <div>
              <p className="text-white/70 text-sm mb-2">Duration</p>
              <div className="flex gap-2">
                {presetDurations.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => {
                      setCustomDuration(duration);
                      resetTimer(duration);
                    }}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                      customDuration === duration
                        ? 'bg-white text-gray-900'
                        : 'bg-white/10 hover:bg-white/20'
                    }`}
                  >
                    {duration}s
                  </button>
                ))}
              </div>
            </div>
            
            {/* Sound Settings */}
            <div className="flex items-center justify-between">
              <span className="text-white/70 text-sm">Timer Sounds</span>
              <button
                onClick={() => updateSettings({ timerSounds: !settings.timerSounds })}
                className={`w-12 h-6 rounded-full transition-all ${
                  settings.timerSounds ? 'bg-green-500' : 'bg-white/20'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-all transform ${
                  settings.timerSounds ? 'translate-x-6' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          </div>
        )}
        
        {/* Timer Display */}
        <div className="text-center mb-6">
          <div className={`text-8xl font-black tracking-tight mb-4 transition-all ${
            isWarning ? 'text-red-300 animate-pulse scale-110' : ''
          } ${isEnded ? 'text-yellow-300' : ''}`}>
            {formatTime(timer.timeRemaining)}
          </div>
          
          {/* Progress Bar */}
          <div className="h-4 bg-white/20 rounded-full overflow-hidden mx-auto max-w-sm">
            <div 
              className={`h-full transition-all duration-1000 ${
                isWarning ? 'bg-red-400 animate-pulse' : 
                timer.timeRemaining <= 10 ? 'bg-orange-400' : 'bg-yellow-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          
          {/* Status Messages */}
          {isWarning && timer.isRunning && (
            <p className="text-red-300 font-bold mt-3 animate-bounce flex items-center justify-center gap-2">
              <Zap className="w-5 h-5" />
              Hurry! Time's almost up!
              <Zap className="w-5 h-5" />
            </p>
          )}
          
          {isEnded && (
            <p className="text-yellow-300 font-bold mt-3 text-xl animate-pulse">
              TIME'S UP!
            </p>
          )}
          
          {timer.mode === 'random' && !timer.isRunning && (
            <p className="text-white/60 text-sm mt-2">
              Timer will vary by ±{settings.randomTimerVariation} seconds
            </p>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="w-14 h-14 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all transform hover:scale-105"
          >
            <RotateCcw className="w-6 h-6" />
          </button>
          
          <button
            onClick={handlePlayPause}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all transform hover:scale-105 shadow-lg ${
              timer.isRunning 
                ? 'bg-red-500 hover:bg-red-400' 
                : 'bg-green-500 hover:bg-green-400'
            }`}
          >
            {timer.isRunning ? (
              <Pause className="w-10 h-10" />
            ) : (
              <Play className="w-10 h-10 ml-1" />
            )}
          </button>
          
          <div className="w-14 h-14" /> {/* Spacer for symmetry */}
        </div>
        
        {/* Instructions */}
        <div className="mt-6 text-center text-white/70 text-sm">
          <p>Press play and pass the hot poo around the circle!</p>
          <p>Whoever is holding it when the timer ends is OUT!</p>
        </div>
      </div>
    </div>
  );
};

export default PartyTimer;
