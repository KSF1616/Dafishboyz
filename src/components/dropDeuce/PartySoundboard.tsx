import React, { useState } from 'react';
import { Volume2, VolumeX, Megaphone } from 'lucide-react';
import { usePartyMode } from '@/contexts/PartyModeContext';
import { SoundEffect } from '@/types/partyMode';

interface PartySoundboardProps {
  compact?: boolean;
}

const PartySoundboard: React.FC<PartySoundboardProps> = ({ compact = false }) => {
  const { soundEffects, playSoundEffect, settings, updateSettings, state } = usePartyMode();
  const [activeEffect, setActiveEffect] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<SoundEffect['category'] | 'all'>('all');
  
  const { currentTheme } = state;
  
  const categories = [
    { id: 'all', name: 'All', icon: '🎵' },
    { id: 'celebration', name: 'Celebration', icon: '🎉' },
    { id: 'funny', name: 'Funny', icon: '😂' },
    { id: 'alert', name: 'Alert', icon: '🚨' }
  ] as const;
  
  const filteredEffects = selectedCategory === 'all' 
    ? soundEffects 
    : soundEffects.filter(e => e.category === selectedCategory);
  
  const handlePlayEffect = (effect: SoundEffect) => {
    if (!settings.soundEffectsEnabled) return;
    
    setActiveEffect(effect.id);
    playSoundEffect(effect);
    
    setTimeout(() => {
      setActiveEffect(null);
    }, (effect.duration || 0.5) * 1000);
  };
  
  if (compact) {
    return (
      <div 
        className="rounded-xl p-4 text-white"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.primaryColor}60, ${currentTheme.secondaryColor}60)`
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            <span className="font-bold text-sm">Sound FX</span>
          </div>
          <button
            onClick={() => updateSettings({ soundEffectsEnabled: !settings.soundEffectsEnabled })}
            className={`p-1.5 rounded-lg transition-all ${
              settings.soundEffectsEnabled ? 'bg-white/20' : 'bg-white/10'
            }`}
          >
            {settings.soundEffectsEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {soundEffects.slice(0, 8).map((effect) => (
            <button
              key={effect.id}
              onClick={() => handlePlayEffect(effect)}
              disabled={!settings.soundEffectsEnabled}
              className={`p-2 rounded-lg text-xl transition-all transform ${
                activeEffect === effect.id
                  ? 'bg-white/40 scale-110'
                  : settings.soundEffectsEnabled
                    ? 'bg-white/10 hover:bg-white/20 hover:scale-105'
                    : 'bg-white/5 cursor-not-allowed opacity-50'
              }`}
              title={effect.name}
            >
              {effect.icon}
            </button>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.secondaryColor})`
            }}
          >
            <Megaphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Sound Effects</h3>
            <p className="text-gray-400 text-sm">Tap to play sounds</p>
          </div>
        </div>
        
        <button
          onClick={() => updateSettings({ soundEffectsEnabled: !settings.soundEffectsEnabled })}
          className={`p-3 rounded-xl transition-all ${
            settings.soundEffectsEnabled 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-white/10 text-gray-400'
          }`}
        >
          {settings.soundEffectsEnabled ? (
            <Volume2 className="w-6 h-6" />
          ) : (
            <VolumeX className="w-6 h-6" />
          )}
        </button>
      </div>
      
      {/* Category Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-white text-gray-900'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <span className="mr-1">{cat.icon}</span>
            {cat.name}
          </button>
        ))}
      </div>
      
      {/* Sound Grid */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {filteredEffects.map((effect) => (
          <button
            key={effect.id}
            onClick={() => handlePlayEffect(effect)}
            disabled={!settings.soundEffectsEnabled}
            className={`relative p-4 rounded-xl transition-all transform ${
              activeEffect === effect.id
                ? 'scale-110 ring-2 ring-white'
                : settings.soundEffectsEnabled
                  ? 'hover:scale-105'
                  : 'opacity-50 cursor-not-allowed'
            }`}
            style={{
              background: activeEffect === effect.id
                ? `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.secondaryColor})`
                : 'rgba(255,255,255,0.1)'
            }}
          >
            {/* Ripple effect when active */}
            {activeEffect === effect.id && (
              <div className="absolute inset-0 rounded-xl animate-ping opacity-30"
                style={{
                  background: `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.secondaryColor})`
                }}
              />
            )}
            
            <div className="relative z-10">
              <div className="text-3xl mb-2">{effect.icon}</div>
              <p className="text-white text-xs font-medium">{effect.name}</p>
            </div>
          </button>
        ))}
      </div>
      
      {/* Disabled message */}
      {!settings.soundEffectsEnabled && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm text-center">
            Sound effects are disabled. Click the speaker icon to enable.
          </p>
        </div>
      )}
      
      {/* Quick Tips */}
      <div className="mt-4 p-3 bg-white/5 rounded-lg">
        <p className="text-gray-400 text-xs">
          <span className="text-white font-medium">Pro tip:</span> Use sound effects to add excitement! 
          Play the air horn when someone wins, or the buzzer when time runs out.
        </p>
      </div>
    </div>
  );
};

export default PartySoundboard;
