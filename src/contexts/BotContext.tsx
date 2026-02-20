import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';
import { BotPlayer, BotPersonality, BotConfig, BOT_NAMES, BOT_AVATARS } from '@/types/bot';
import { getBotAction, getBotChatMessage, shouldBotChat } from '@/lib/botLogic';

interface BotContextType {
  bots: BotPlayer[];
  botConfig: BotConfig;
  addBot: (difficulty?: 'easy' | 'medium' | 'hard', personality?: BotPersonality) => BotPlayer;
  removeBot: (botId: string) => void;
  clearBots: () => void;
  setBotConfig: (config: Partial<BotConfig>) => void;
  executeBotTurn: (
    gameType: string,
    gameData: Record<string, any>,
    players: any[],
    currentTurnPlayerId: string,
    extraData?: Record<string, any>
  ) => Promise<{ action: any; chatMessage?: string } | null>;
  isBotPlayer: (playerId: string) => boolean;
  getBotById: (botId: string) => BotPlayer | undefined;
  updateBotScore: (botId: string, score: number) => void;
  updateBotData: (botId: string, data: Record<string, any>) => void;
  autoFillBots: (minPlayers: number, currentPlayerCount: number) => BotPlayer[];
}

const BotContext = createContext<BotContextType | null>(null);

export const useBots = () => {
  const ctx = useContext(BotContext);
  if (!ctx) throw new Error('useBots must be used within BotProvider');
  return ctx;
};

const generateBotId = () => `bot_${Math.random().toString(36).substr(2, 9)}`;

const getUnusedBotName = (usedNames: string[]): string => {
  const available = BOT_NAMES.filter(name => !usedNames.includes(name));
  if (available.length === 0) {
    return `Bot-${Math.floor(Math.random() * 1000)}`;
  }
  return available[Math.floor(Math.random() * available.length)];
};

const getRandomPersonality = (): BotPersonality => {
  const personalities: BotPersonality[] = ['aggressive', 'cautious', 'random', 'strategic', 'trickster'];
  return personalities[Math.floor(Math.random() * personalities.length)];
};

export const BotProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [bots, setBots] = useState<BotPlayer[]>([]);
  const [botConfig, setBotConfigState] = useState<BotConfig>({
    enabled: true,
    autoFillEmpty: true,
    minBots: 1,
    maxBots: 5,
    defaultDifficulty: 'medium'
  });
  
  const botActionTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const addBot = useCallback((
    difficulty: 'easy' | 'medium' | 'hard' = botConfig.defaultDifficulty,
    personality?: BotPersonality
  ): BotPlayer => {
    const usedNames = bots.map(b => b.name);
    const newBot: BotPlayer = {
      id: generateBotId(),
      name: getUnusedBotName(usedNames),
      difficulty,
      personality: personality || getRandomPersonality(),
      avatar: BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)],
      isBot: true,
      isReady: true,
      score: 0,
      playerData: {}
    };
    
    setBots(prev => [...prev, newBot]);
    return newBot;
  }, [bots, botConfig.defaultDifficulty]);

  const removeBot = useCallback((botId: string) => {
    // Clear any pending actions
    const timeout = botActionTimeouts.current.get(botId);
    if (timeout) {
      clearTimeout(timeout);
      botActionTimeouts.current.delete(botId);
    }
    setBots(prev => prev.filter(b => b.id !== botId));
  }, []);

  const clearBots = useCallback(() => {
    // Clear all pending actions
    botActionTimeouts.current.forEach(timeout => clearTimeout(timeout));
    botActionTimeouts.current.clear();
    setBots([]);
  }, []);

  const setBotConfig = useCallback((config: Partial<BotConfig>) => {
    setBotConfigState(prev => ({ ...prev, ...config }));
  }, []);

  const isBotPlayer = useCallback((playerId: string): boolean => {
    return bots.some(b => b.id === playerId) || playerId.startsWith('bot_');
  }, [bots]);

  const getBotById = useCallback((botId: string): BotPlayer | undefined => {
    return bots.find(b => b.id === botId);
  }, [bots]);

  const updateBotScore = useCallback((botId: string, score: number) => {
    setBots(prev => prev.map(b => 
      b.id === botId ? { ...b, score } : b
    ));
  }, []);

  const updateBotData = useCallback((botId: string, data: Record<string, any>) => {
    setBots(prev => prev.map(b => 
      b.id === botId ? { ...b, playerData: { ...b.playerData, ...data } } : b
    ));
  }, []);

  const executeBotTurn = useCallback(async (
    gameType: string,
    gameData: Record<string, any>,
    players: any[],
    currentTurnPlayerId: string,
    extraData?: Record<string, any>
  ): Promise<{ action: any; chatMessage?: string } | null> => {
    const bot = bots.find(b => b.id === currentTurnPlayerId);
    if (!bot) return null;

    const action = getBotAction(
      bot,
      gameType,
      gameData,
      players,
      true,
      extraData
    );

    // Wait for the thinking delay
    await new Promise(resolve => setTimeout(resolve, action.delay));

    // Maybe send a chat message
    let chatMessage: string | undefined;
    if (shouldBotChat(bot.personality)) {
      chatMessage = getBotChatMessage(bot.personality);
    }

    return {
      action: {
        type: action.type,
        ...action.data
      },
      chatMessage
    };
  }, [bots]);

  const autoFillBots = useCallback((minPlayers: number, currentPlayerCount: number): BotPlayer[] => {
    if (!botConfig.autoFillEmpty) return [];
    
    const botsNeeded = Math.max(0, minPlayers - currentPlayerCount);
    const newBots: BotPlayer[] = [];
    
    for (let i = 0; i < botsNeeded && bots.length + newBots.length < botConfig.maxBots; i++) {
      const usedNames = [...bots.map(b => b.name), ...newBots.map(b => b.name)];
      const newBot: BotPlayer = {
        id: generateBotId(),
        name: getUnusedBotName(usedNames),
        difficulty: botConfig.defaultDifficulty,
        personality: getRandomPersonality(),
        avatar: BOT_AVATARS[Math.floor(Math.random() * BOT_AVATARS.length)],
        isBot: true,
        isReady: true,
        score: 0,
        playerData: {}
      };
      newBots.push(newBot);
    }
    
    if (newBots.length > 0) {
      setBots(prev => [...prev, ...newBots]);
    }
    
    return newBots;
  }, [bots, botConfig]);

  const value: BotContextType = {
    bots,
    botConfig,
    addBot,
    removeBot,
    clearBots,
    setBotConfig,
    executeBotTurn,
    isBotPlayer,
    getBotById,
    updateBotScore,
    updateBotData,
    autoFillBots
  };

  return <BotContext.Provider value={value}>{children}</BotContext.Provider>;
};
