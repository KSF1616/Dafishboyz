import React, { useState, useEffect } from 'react';
import { 
  PartyPopper, X, Play, Pause, RotateCcw, Volume2, VolumeX, 
  Sparkles, Timer, Music, ChevronUp, ChevronDown, Zap
} from 'lucide-react';
import { usePartyMode } from '@/contexts/PartyModeContext';
import ConfettiEffect from '@/components/dropDeuce/ConfettiEffect';

const FloatingPartyButton: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSoundboard, setShowSoundboard] = useState(false);
  const { 
    state, 
    settings, 
    activatePartyMode, 
    deactivatePartyMode, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    triggerConfetti, 
    playSoundEffect, 
    soundEffects,
    updateSettings,
    playMusic,
    pauseMusic,
    setPlaylist,
    playlists
  } = usePartyMode();

  const { isActive, timer, currentTheme, showConfetti, confettiIntensity, isPlaying } = state;

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 
      ? `${mins}:${secs.toString().padStart(2, '0')}`
      : `0:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = timer.timeRemaining <= timer.warningThreshold && timer.timeRemaining > 0;

  // Quick sound effects (first 6)
  const quickSounds = soundEffects.slice(0, 6);

  // Handle party mode toggle
  const handleTogglePartyMode = () => {
    if (isActive) {
      deactivatePartyMode();
    } else {
      activatePartyMode();
      // Auto-select first playlist if none selected
      if (!state.currentPlaylist && playlists.length > 0) {
        setPlaylist(playlists[0]);
      }
    }
  };

  // Handle timer controls
  const handleTimerPlayPause = () => {
    if (timer.isRunning) {
      pauseTimer();
    } else {
      startTimer(30);
    }
  };

  return (
    <>
      {/* Confetti Effect */}
      <ConfettiEffect 
        isActive={showConfetti} 
        intensity={confettiIntensity} 
        theme={currentTheme}
      />

      {/* Floating Button Container */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        
        {/* Expanded Panel */}
        {isExpanded && (
          <div 
            className="bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
            style={{
              boxShadow: isActive 
                ? `0 0 30px ${currentTheme.primaryColor}40, 0 0 60px ${currentTheme.secondaryColor}20`
                : '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Header */}
            <div 
              className="px-4 py-3 flex items-center justify-between"
              style={{
                background: isActive 
                  ? `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.secondaryColor})`
                  : 'linear-gradient(135deg, #6366f1, #ec4899)'
              }}
            >
              <div className="flex items-center gap-2">
                <PartyPopper className="w-5 h-5 text-white" />
                <span className="font-bold text-white text-sm">Party Mode</span>
              </div>
              <button
                onClick={handleTogglePartyMode}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                  isActive 
                    ? 'bg-white/20 text-white hover:bg-white/30' 
                    : 'bg-white text-purple-600 hover:bg-white/90'
                }`}
              >
                {isActive ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4 w-72">
              
              {/* Timer Section */}
              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Timer className="w-4 h-4 text-purple-400" />
                    <span className="text-white text-sm font-medium">Timer</span>
                  </div>
                  <span className={`text-xl font-black ${
                    isWarning ? 'text-red-400 animate-pulse' : 'text-white'
                  }`}>
                    {formatTime(timer.timeRemaining)}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 bg-white/10 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      isWarning ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-r from-purple-500 to-pink-500'
                    }`}
                    style={{ width: `${((timer.duration - timer.timeRemaining) / timer.duration) * 100}%` }}
                  />
                </div>
                
                {/* Timer Controls */}
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => resetTimer(30)}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-all"
                  >
                    <RotateCcw className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={handleTimerPlayPause}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
                      timer.isRunning 
                        ? 'bg-red-500 hover:bg-red-400' 
                        : 'bg-green-500 hover:bg-green-400'
                    }`}
                  >
                    {timer.isRunning ? (
                      <Pause className="w-6 h-6 text-white" />
                    ) : (
                      <Play className="w-6 h-6 text-white ml-0.5" />
                    )}
                  </button>
                  <button
                    onClick={() => triggerConfetti('high')}
                    className="w-10 h-10 bg-yellow-500 hover:bg-yellow-400 rounded-full flex items-center justify-center transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Sound Effects Section */}
              <div className="bg-white/5 rounded-xl p-3">
                <button
                  onClick={() => setShowSoundboard(!showSoundboard)}
                  className="w-full flex items-center justify-between mb-2"
                >
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-pink-400" />
                    <span className="text-white text-sm font-medium">Sound FX</span>
                  </div>
                  {showSoundboard ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                
                {showSoundboard && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {quickSounds.map((sound) => (
                      <button
                        key={sound.id}
                        onClick={() => playSoundEffect(sound)}
                        disabled={!settings.soundEffectsEnabled}
                        className={`p-2 rounded-lg text-xl transition-all transform hover:scale-105 ${
                          settings.soundEffectsEnabled
                            ? 'bg-white/10 hover:bg-white/20'
                            : 'bg-white/5 opacity-50 cursor-not-allowed'
                        }`}
                        title={sound.name}
                      >
                        {sound.icon}
                      </button>
                    ))}
                  </div>
                )}
                
                {/* Sound Toggle */}
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                  <span className="text-gray-400 text-xs">Sound Effects</span>
                  <button
                    onClick={() => updateSettings({ soundEffectsEnabled: !settings.soundEffectsEnabled })}
                    className={`w-10 h-5 rounded-full transition-all ${
                      settings.soundEffectsEnabled ? 'bg-green-500' : 'bg-white/20'
                    }`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-all transform ${
                      settings.soundEffectsEnabled ? 'translate-x-5' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Music Section */}
              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-cyan-400" />
                    <span className="text-white text-sm font-medium">Music</span>
                  </div>
                  <button
                    onClick={() => isPlaying ? pauseMusic() : playMusic()}
                    disabled={!state.currentPlaylist}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isPlaying 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                    } ${!state.currentPlaylist ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isPlaying ? 'Stop' : 'Play'}
                  </button>
                </div>
                {state.currentPlaylist && (
                  <p className="text-gray-400 text-xs mt-1 truncate">
                    {state.currentPlaylist.name}
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => triggerConfetti('extreme')}
                  className="flex-1 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  Big Confetti!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Floating Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`relative w-16 h-16 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 ${
            isExpanded ? 'rotate-0' : ''
          }`}
          style={{
            background: isActive 
              ? `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.secondaryColor})`
              : 'linear-gradient(135deg, #6366f1, #ec4899)',
            boxShadow: isActive 
              ? `0 0 20px ${currentTheme.primaryColor}60, 0 0 40px ${currentTheme.secondaryColor}40`
              : '0 10px 40px -10px rgba(99, 102, 241, 0.5)'
          }}
        >
          {/* Pulse Animation Ring */}
          {isActive && (
            <>
              <span 
                className="absolute inset-0 rounded-full animate-ping opacity-30"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.secondaryColor})`
                }}
              />
              <span 
                className="absolute inset-0 rounded-full animate-pulse opacity-50"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.secondaryColor})`
                }}
              />
            </>
          )}
          
          {/* Icon */}
          <div className="relative z-10 flex items-center justify-center w-full h-full">
            {isExpanded ? (
              <X className="w-7 h-7 text-white" />
            ) : (
              <PartyPopper className={`w-7 h-7 text-white ${isActive ? 'animate-bounce' : ''}`} />
            )}
          </div>

          {/* Active Indicator Dot */}
          {isActive && !isExpanded && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          )}

          {/* Timer Running Indicator */}
          {timer.isRunning && !isExpanded && (
            <span className="absolute -top-1 -left-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
              <Timer className="w-3 h-3 text-white" />
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export default FloatingPartyButton;
