import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DrinkingRule {
  id: string;
  trigger: string;
  action: string;
  drinks: number;
  isCustom?: boolean;
}

export interface DrinkingGameSettings {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
  customRules: DrinkingRule[];
}

interface DrinkingGameContextType {
  settings: DrinkingGameSettings;
  toggleDrinkingMode: () => void;
  setIntensity: (intensity: 'light' | 'medium' | 'heavy') => void;
  addCustomRule: (rule: Omit<DrinkingRule, 'id' | 'isCustom'>) => void;
  removeCustomRule: (id: string) => void;
  getRulesForGame: (gameType: string) => DrinkingRule[];
  triggerDrink: (rule: DrinkingRule) => void;
  drinkHistory: { rule: DrinkingRule; timestamp: Date; player?: string }[];
  clearHistory: () => void;
}

const DrinkingGameContext = createContext<DrinkingGameContextType | null>(null);

export const useDrinkingGame = () => {
  const ctx = useContext(DrinkingGameContext);
  if (!ctx) throw new Error('useDrinkingGame must be used within DrinkingGameProvider');
  return ctx;
};

// Default drinking rules for each game
const DEFAULT_RULES: Record<string, DrinkingRule[]> = {
  'up-shitz-creek': [
    { id: 'usc-1', trigger: 'Land on a hazard space', action: 'Take a drink', drinks: 1 },
    { id: 'usc-2', trigger: 'Get sent back 3+ spaces', action: 'Take 2 drinks', drinks: 2 },
    { id: 'usc-3', trigger: 'Use a paddle card', action: 'Give a drink', drinks: 1 },
    { id: 'usc-4', trigger: 'Land on another player', action: 'Both drink', drinks: 1 },
    { id: 'usc-5', trigger: 'Roll doubles', action: 'Waterfall (everyone drinks until you stop)', drinks: 3 },
    { id: 'usc-6', trigger: 'Win the game', action: 'Everyone else finishes their drink', drinks: 0 },
    { id: 'usc-7', trigger: 'Last place after a round', action: 'Take a shot', drinks: 3 },
  ],
  'let-that-shit-go': [
    { id: 'ltsg-1', trigger: 'Draw a "Let It Go" card', action: 'Take a drink and share a confession', drinks: 1 },
    { id: 'ltsg-2', trigger: 'Someone calls you out', action: 'Take 2 drinks', drinks: 2 },
    { id: 'ltsg-3', trigger: 'Refuse to answer', action: 'Finish your drink', drinks: 4 },
    { id: 'ltsg-4', trigger: 'Make someone laugh', action: 'Give out 2 drinks', drinks: 0 },
    { id: 'ltsg-5', trigger: 'Get emotional', action: 'Everyone takes a sympathy drink', drinks: 1 },
    { id: 'ltsg-6', trigger: 'Win a challenge', action: 'Give out 3 drinks', drinks: 0 },
    { id: 'ltsg-7', trigger: 'Tell the best story', action: 'Become drink master for next round', drinks: 0 },
  ],
  'o-craps': [
    { id: 'oc-1', trigger: 'Roll snake eyes (1-1)', action: 'Take 2 drinks', drinks: 2 },
    { id: 'oc-2', trigger: 'Roll boxcars (6-6)', action: 'Give out 4 drinks', drinks: 0 },
    { id: 'oc-3', trigger: 'Crap out (2, 3, or 12)', action: 'Finish your drink', drinks: 4 },
    { id: 'oc-4', trigger: 'Hit your point', action: 'Give out drinks equal to point value', drinks: 0 },
    { id: 'oc-5', trigger: 'Roll a 7 after point', action: 'Take a shot', drinks: 3 },
    { id: 'oc-6', trigger: 'Win 3 in a row', action: 'Become the bartender', drinks: 0 },
    { id: 'oc-7', trigger: 'Natural (7 or 11 on come-out)', action: 'Everyone else drinks', drinks: 0 },
  ],
  'shito': [
    { id: 'sh-1', trigger: 'Mark a space', action: 'Take a sip', drinks: 1 },
    { id: 'sh-2', trigger: 'Miss a call (had the icon)', action: 'Take 2 drinks', drinks: 2 },
    { id: 'sh-3', trigger: 'Complete a row/column', action: 'Give out 3 drinks', drinks: 0 },
    { id: 'sh-4', trigger: 'False SHITO call', action: 'Finish your drink', drinks: 4 },
    { id: 'sh-5', trigger: 'Win SHITO', action: 'Everyone else takes a shot', drinks: 0 },
    { id: 'sh-6', trigger: 'Get the FREE space called', action: 'Social drink (everyone)', drinks: 1 },
    { id: 'sh-7', trigger: 'Same icon called twice', action: 'Waterfall', drinks: 3 },
  ],
  'slanging-shit': [
    { id: 'ss-1', trigger: 'Team fails to guess', action: 'Team takes 2 drinks each', drinks: 2 },
    { id: 'ss-2', trigger: 'Use a forbidden word', action: 'Take a shot', drinks: 3 },
    { id: 'ss-3', trigger: 'Guess in under 10 seconds', action: 'Other team drinks', drinks: 2 },
    { id: 'ss-4', trigger: 'Act out something embarrassing', action: 'Take a drink for courage', drinks: 1 },
    { id: 'ss-5', trigger: 'Win a round', action: 'Give out drinks equal to points earned', drinks: 0 },
    { id: 'ss-6', trigger: 'Time runs out', action: 'Acting player finishes their drink', drinks: 4 },
    { id: 'ss-7', trigger: 'Perfect round (all guesses)', action: 'Other team does a waterfall', drinks: 0 },
  ],
};

// Intensity multipliers
const INTENSITY_MULTIPLIERS = {
  light: 0.5,
  medium: 1,
  heavy: 2,
};

export const DrinkingGameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<DrinkingGameSettings>({
    enabled: false,
    intensity: 'medium',
    customRules: [],
  });
  
  const [drinkHistory, setDrinkHistory] = useState<{ rule: DrinkingRule; timestamp: Date; player?: string }[]>([]);

  const toggleDrinkingMode = () => {
    setSettings(prev => ({ ...prev, enabled: !prev.enabled }));
  };

  const setIntensity = (intensity: 'light' | 'medium' | 'heavy') => {
    setSettings(prev => ({ ...prev, intensity }));
  };

  const addCustomRule = (rule: Omit<DrinkingRule, 'id' | 'isCustom'>) => {
    const newRule: DrinkingRule = {
      ...rule,
      id: `custom-${Date.now()}`,
      isCustom: true,
    };
    setSettings(prev => ({
      ...prev,
      customRules: [...prev.customRules, newRule],
    }));
  };

  const removeCustomRule = (id: string) => {
    setSettings(prev => ({
      ...prev,
      customRules: prev.customRules.filter(r => r.id !== id),
    }));
  };

  const getRulesForGame = (gameType: string): DrinkingRule[] => {
    const defaultRules = DEFAULT_RULES[gameType] || [];
    const multiplier = INTENSITY_MULTIPLIERS[settings.intensity];
    
    // Apply intensity multiplier to drink counts
    const adjustedRules = defaultRules.map(rule => ({
      ...rule,
      drinks: Math.max(1, Math.round(rule.drinks * multiplier)),
    }));
    
    // Add custom rules
    const customRulesAdjusted = settings.customRules.map(rule => ({
      ...rule,
      drinks: Math.max(1, Math.round(rule.drinks * multiplier)),
    }));
    
    return [...adjustedRules, ...customRulesAdjusted];
  };

  const triggerDrink = (rule: DrinkingRule, player?: string) => {
    setDrinkHistory(prev => [
      { rule, timestamp: new Date(), player },
      ...prev.slice(0, 49), // Keep last 50 entries
    ]);
  };

  const clearHistory = () => {
    setDrinkHistory([]);
  };

  return (
    <DrinkingGameContext.Provider
      value={{
        settings,
        toggleDrinkingMode,
        setIntensity,
        addCustomRule,
        removeCustomRule,
        getRulesForGame,
        triggerDrink,
        drinkHistory,
        clearHistory,
      }}
    >
      {children}
    </DrinkingGameContext.Provider>
  );
};
