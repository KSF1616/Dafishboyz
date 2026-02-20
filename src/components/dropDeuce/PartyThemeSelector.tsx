import React from 'react';
import { Check, Palette } from 'lucide-react';
import { PartyTheme } from '@/types/partyMode';
import { usePartyMode } from '@/contexts/PartyModeContext';

interface PartyThemeSelectorProps {
  compact?: boolean;
}

const PartyThemeSelector: React.FC<PartyThemeSelectorProps> = ({ compact = false }) => {
  const { state, setTheme, themes } = usePartyMode();
  
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setTheme(theme)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all transform hover:scale-110 ${
              state.currentTheme.id === theme.id
                ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-900 scale-110'
                : ''
            }`}
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
            }}
            title={theme.name}
          >
            <span className="text-white text-sm">{theme.icon}</span>
          </button>
        ))}
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Palette className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Party Theme</h3>
          <p className="text-gray-400 text-sm">Choose your vibe</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {themes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setTheme(theme)}
            className={`relative p-4 rounded-xl transition-all transform hover:scale-105 ${
              state.currentTheme.id === theme.id
                ? 'ring-2 ring-white shadow-lg scale-105'
                : 'hover:ring-1 hover:ring-white/50'
            }`}
            style={{
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
            }}
          >
            {state.currentTheme.id === theme.id && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                <Check className="w-3 h-3 text-gray-900" />
              </div>
            )}
            
            <div className="text-2xl mb-2">{theme.icon}</div>
            <div className="text-white font-bold text-sm">{theme.name}</div>
            <div className="text-white/70 text-xs mt-1">{theme.description}</div>
            
            {/* Color preview */}
            <div className="flex gap-1 mt-3">
              {theme.confettiColors.slice(0, 5).map((color, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
      
      {/* Theme preview */}
      <div className="mt-4 p-4 rounded-xl overflow-hidden relative"
        style={{
          background: `linear-gradient(135deg, ${state.currentTheme.primaryColor}40, ${state.currentTheme.secondaryColor}40)`
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs">Current Theme</p>
            <p className="text-white font-bold flex items-center gap-2">
              <span>{state.currentTheme.icon}</span>
              {state.currentTheme.name}
            </p>
          </div>
          <div className="flex gap-1">
            {state.currentTheme.confettiColors.map((color, i) => (
              <div
                key={i}
                className="w-4 h-4 rounded-full animate-bounce"
                style={{ 
                  backgroundColor: color,
                  animationDelay: `${i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartyThemeSelector;
