import React, { useState } from 'react';
import { useBots } from '@/contexts/BotContext';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Plus, 
  Trash2, 
  Settings, 
  Zap, 
  Shield, 
  Shuffle, 
  Brain, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Users
} from 'lucide-react';
import { BotPersonality } from '@/types/bot';

interface BotPlayerManagerProps {
  isHost: boolean;
  maxPlayers: number;
  currentPlayerCount: number;
  disabled?: boolean;
}

const personalityIcons: Record<BotPersonality, React.ReactNode> = {
  aggressive: <Zap className="w-3 h-3 text-red-400" />,
  cautious: <Shield className="w-3 h-3 text-blue-400" />,
  random: <Shuffle className="w-3 h-3 text-yellow-400" />,
  strategic: <Brain className="w-3 h-3 text-purple-400" />,
  trickster: <Sparkles className="w-3 h-3 text-pink-400" />
};

const personalityLabels: Record<BotPersonality, string> = {
  aggressive: 'Aggressive',
  cautious: 'Cautious',
  random: 'Random',
  strategic: 'Strategic',
  trickster: 'Trickster'
};

const difficultyColors = {
  easy: 'text-green-400 bg-green-400/20',
  medium: 'text-yellow-400 bg-yellow-400/20',
  hard: 'text-red-400 bg-red-400/20'
};

export default function BotPlayerManager({ 
  isHost, 
  maxPlayers, 
  currentPlayerCount,
  disabled 
}: BotPlayerManagerProps) {
  const { bots, addBot, removeBot, clearBots, botConfig, setBotConfig } = useBots();
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  
  const totalPlayers = currentPlayerCount + bots.length;
  const canAddBot = totalPlayers < maxPlayers && isHost && !disabled;

  const handleAddBot = () => {
    if (canAddBot) {
      addBot(selectedDifficulty);
    }
  };

  const handleAutoFill = () => {
    if (!isHost || disabled) return;
    const botsNeeded = Math.max(0, 2 - totalPlayers); // Fill to at least 2 players
    for (let i = 0; i < botsNeeded && totalPlayers + i < maxPlayers; i++) {
      addBot(selectedDifficulty);
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-cyan-400" />
          <h3 className="font-semibold text-white">Bot Players</h3>
          <span className="text-xs text-gray-400">({bots.length} active)</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-400 hover:text-white"
        >
          <Settings className="w-4 h-4" />
          {showSettings ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
        </Button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-3 bg-gray-900/50 rounded-lg space-y-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Default Difficulty</label>
            <div className="flex gap-2">
              {(['easy', 'medium', 'hard'] as const).map(diff => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                    selectedDifficulty === diff 
                      ? difficultyColors[diff] 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-xs text-gray-400">Auto-fill when empty</label>
            <button
              onClick={() => setBotConfig({ autoFillEmpty: !botConfig.autoFillEmpty })}
              className={`w-10 h-5 rounded-full transition-colors ${
                botConfig.autoFillEmpty ? 'bg-cyan-600' : 'bg-gray-600'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                botConfig.autoFillEmpty ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        </div>
      )}

      {/* Bot List */}
      {bots.length > 0 && (
        <div className="space-y-2 mb-3">
          {bots.map(bot => (
            <div 
              key={bot.id}
              className="flex items-center justify-between bg-gray-700/50 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{bot.avatar}</span>
                <div>
                  <p className="text-sm font-medium text-white">{bot.name}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${difficultyColors[bot.difficulty]}`}>
                      {bot.difficulty}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      {personalityIcons[bot.personality]}
                      {personalityLabels[bot.personality]}
                    </span>
                  </div>
                </div>
              </div>
              {isHost && !disabled && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeBot(bot.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {isHost && !disabled && (
        <div className="flex gap-2">
          <Button
            onClick={handleAddBot}
            disabled={!canAddBot}
            className="flex-1 bg-cyan-600 hover:bg-cyan-700"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Bot
          </Button>
          
          {totalPlayers < 2 && (
            <Button
              onClick={handleAutoFill}
              variant="outline"
              className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/20"
              size="sm"
            >
              <Users className="w-4 h-4 mr-1" />
              Auto-Fill
            </Button>
          )}
          
          {bots.length > 0 && (
            <Button
              onClick={clearBots}
              variant="outline"
              className="border-red-600 text-red-400 hover:bg-red-600/20"
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      )}

      {/* Info for non-hosts */}
      {!isHost && bots.length === 0 && (
        <p className="text-xs text-gray-500 text-center">
          Only the host can add bot players
        </p>
      )}

      {/* Single player mode hint */}
      {currentPlayerCount === 1 && bots.length === 0 && isHost && (
        <div className="mt-3 p-2 bg-cyan-900/30 rounded-lg border border-cyan-700/50">
          <p className="text-xs text-cyan-300 text-center">
            Playing solo? Add bots to start the game!
          </p>
        </div>
      )}
    </div>
  );
}
