import React, { useState } from 'react';
import { useDrinkingGame, DrinkingRule } from '@/contexts/DrinkingGameContext';
import { useLobby } from '@/contexts/LobbyContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Wine, 
  Beer, 
  GlassWater, 
  Flame, 
  Sparkles, 
  Plus, 
  X, 
  History, 
  Settings,
  AlertTriangle,
  PartyPopper,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DrinkingGamePanelProps {
  gameType: string;
  isChildGame?: boolean;
  compact?: boolean;
}

const DrinkingGamePanel: React.FC<DrinkingGamePanelProps> = ({ 
  gameType, 
  isChildGame = false,
  compact = false 
}) => {
  const { 
    settings, 
    toggleDrinkingMode, 
    setIntensity, 
    getRulesForGame, 
    addCustomRule,
    removeCustomRule,
    drinkHistory,
    clearHistory,
    triggerDrink
  } = useDrinkingGame();
  
  // Try to get lobby context for multiplayer drink tracking
  let lobbyContext: ReturnType<typeof useLobby> | null = null;
  try {
    lobbyContext = useLobby();
  } catch {
    // Not in a lobby context, that's fine
  }
  
  const [showRules, setShowRules] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({ trigger: '', action: '', drinks: 1 });

  // Don't render for child games
  if (isChildGame) {
    return null;
  }

  const rules = getRulesForGame(gameType);

  const handleAddRule = () => {
    if (newRule.trigger && newRule.action) {
      addCustomRule(newRule);
      setNewRule({ trigger: '', action: '', drinks: 1 });
      setShowAddRule(false);
    }
  };

  const handleTriggerDrink = (rule: DrinkingRule) => {
    triggerDrink(rule);
    // Also track in lobby context for stats
    if (lobbyContext) {
      for (let i = 0; i < rule.drinks; i++) {
        lobbyContext.addDrink();
      }
      // Broadcast to other players if in multiplayer
      lobbyContext.triggerDrinkEvent(rule.action);
    }
  };

  const getIntensityIcon = () => {
    switch (settings.intensity) {
      case 'light': return <GlassWater className="w-4 h-4" />;
      case 'medium': return <Beer className="w-4 h-4" />;
      case 'heavy': return <Flame className="w-4 h-4" />;
    }
  };

  const getIntensityColor = () => {
    switch (settings.intensity) {
      case 'light': return 'from-blue-500 to-cyan-500';
      case 'medium': return 'from-amber-500 to-orange-500';
      case 'heavy': return 'from-red-500 to-pink-500';
    }
  };

  // Get drinks this game from lobby context if available
  const drinksThisGame = lobbyContext?.drinkingMode.drinksThisGame || 0;

  // Compact toggle button for header
  if (compact) {
    return (
      <Button
        onClick={toggleDrinkingMode}
        variant={settings.enabled ? 'default' : 'outline'}
        size="sm"
        className={settings.enabled 
          ? `bg-gradient-to-r ${getIntensityColor()} text-white border-0` 
          : 'border-amber-500 text-amber-400 hover:bg-amber-500/20'
        }
      >
        <Wine className="w-4 h-4 mr-1" />
        {settings.enabled ? `Drinking (${drinksThisGame})` : 'Drinking Mode'}
      </Button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-2xl border border-amber-500/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Wine className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Drinking Game Mode
                {settings.enabled && <Sparkles className="w-4 h-4 text-yellow-300" />}
              </h3>
              <p className="text-xs text-white/70">21+ Only - Drink Responsibly</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {settings.enabled && drinksThisGame > 0 && (
              <div className="bg-white/20 px-3 py-1 rounded-full">
                <span className="text-white font-bold">{drinksThisGame}</span>
                <span className="text-white/70 text-sm ml-1">drinks</span>
              </div>
            )}
            <Button
              onClick={toggleDrinkingMode}
              className={settings.enabled 
                ? 'bg-white text-amber-600 hover:bg-amber-100' 
                : 'bg-white/20 text-white hover:bg-white/30'
              }
            >
              {settings.enabled ? 'Enabled' : 'Disabled'}
            </Button>
          </div>
        </div>
      </div>

      {settings.enabled && (
        <div className="p-4 space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-3 bg-red-500/20 rounded-xl p-3 border border-red-500/30">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">
              Please drink responsibly. Know your limits. Never drink and drive. 
              This mode is for adults 21+ only.
            </p>
          </div>

          {/* Intensity Selector */}
          <div>
            <label className="text-sm font-medium text-amber-300 mb-2 block">Intensity Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['light', 'medium', 'heavy'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    setIntensity(level);
                    // Also update in lobby if in multiplayer
                    if (lobbyContext) {
                      lobbyContext.setDrinkingIntensity(level);
                    }
                  }}
                  className={`p-3 rounded-xl text-center transition-all ${
                    settings.intensity === level
                      ? level === 'light' 
                        ? 'bg-blue-500 text-white ring-2 ring-blue-300'
                        : level === 'medium'
                        ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                        : 'bg-red-500 text-white ring-2 ring-red-300'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    {level === 'light' && <GlassWater className="w-5 h-5" />}
                    {level === 'medium' && <Beer className="w-5 h-5" />}
                    {level === 'heavy' && <Flame className="w-5 h-5" />}
                    <span className="text-xs font-bold capitalize">{level}</span>
                    <span className="text-xs opacity-70">
                      {level === 'light' && '0.5x drinks'}
                      {level === 'medium' && '1x drinks'}
                      {level === 'heavy' && '2x drinks'}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Rules Section */}
          <div>
            <button
              onClick={() => setShowRules(!showRules)}
              className="w-full flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
            >
              <span className="font-medium text-white flex items-center gap-2">
                <PartyPopper className="w-4 h-4 text-amber-400" />
                Drinking Rules ({rules.length})
              </span>
              {showRules ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
            </button>
            
            {showRules && (
              <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                {rules.map((rule) => (
                  <div 
                    key={rule.id}
                    className={`p-3 rounded-xl border ${
                      rule.isCustom 
                        ? 'bg-purple-500/20 border-purple-500/30' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">{rule.trigger}</p>
                        <p className="text-xs text-amber-300 mt-1">{rule.action}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-amber-500/30 rounded-lg text-xs font-bold text-amber-300">
                          {rule.drinks} {rule.drinks === 1 ? 'drink' : 'drinks'}
                        </span>
                        {rule.isCustom && (
                          <button
                            onClick={() => removeCustomRule(rule.id)}
                            className="p-1 hover:bg-red-500/30 rounded-lg transition-all"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleTriggerDrink(rule)}
                      className="mt-2 w-full py-1.5 bg-amber-500/30 hover:bg-amber-500/50 rounded-lg text-xs font-medium text-amber-200 transition-all"
                    >
                      Trigger This Rule
                    </button>
                  </div>
                ))}
                
                {/* Add Custom Rule */}
                {showAddRule ? (
                  <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30 space-y-2">
                    <Input
                      value={newRule.trigger}
                      onChange={(e) => setNewRule(prev => ({ ...prev, trigger: e.target.value }))}
                      placeholder="When this happens..."
                      className="bg-white/10 border-white/20 text-white placeholder-white/50 text-sm"
                    />
                    <Input
                      value={newRule.action}
                      onChange={(e) => setNewRule(prev => ({ ...prev, action: e.target.value }))}
                      placeholder="Do this..."
                      className="bg-white/10 border-white/20 text-white placeholder-white/50 text-sm"
                    />
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        value={newRule.drinks}
                        onChange={(e) => setNewRule(prev => ({ ...prev, drinks: parseInt(e.target.value) || 1 }))}
                        className="w-20 bg-white/10 border-white/20 text-white text-sm"
                      />
                      <span className="text-sm text-white/70">drinks</span>
                      <div className="flex-1" />
                      <Button size="sm" variant="ghost" onClick={() => setShowAddRule(false)} className="text-white/70">
                        Cancel
                      </Button>
                      <Button size="sm" onClick={handleAddRule} className="bg-purple-500 hover:bg-purple-600">
                        Add
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowAddRule(true)}
                    className="w-full p-3 border-2 border-dashed border-white/20 rounded-xl text-white/50 hover:border-purple-500/50 hover:text-purple-300 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Custom Rule
                  </button>
                )}
              </div>
            )}
          </div>

          {/* History Section */}
          <div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all"
            >
              <span className="font-medium text-white flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                Drink History ({drinkHistory.length})
              </span>
              {showHistory ? <ChevronUp className="w-4 h-4 text-white" /> : <ChevronDown className="w-4 h-4 text-white" />}
            </button>
            
            {showHistory && (
              <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                {drinkHistory.length === 0 ? (
                  <p className="text-center text-white/50 text-sm py-4">No drinks triggered yet</p>
                ) : (
                  <>
                    {drinkHistory.slice(0, 10).map((entry, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-sm">
                        <span className="text-white/70">{entry.rule.trigger}</span>
                        <span className="text-amber-300 font-medium">{entry.rule.drinks} drinks</span>
                      </div>
                    ))}
                    {drinkHistory.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="w-full py-2 text-red-400 text-xs hover:text-red-300 transition-all"
                      >
                        Clear History
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Session Stats */}
          {drinksThisGame > 0 && (
            <div className="bg-white/10 rounded-xl p-4">
              <h4 className="text-sm font-medium text-amber-300 mb-2">This Game Session</h4>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Total Drinks</span>
                <span className="text-2xl font-bold text-amber-400">{drinksThisGame}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DrinkingGamePanel;
