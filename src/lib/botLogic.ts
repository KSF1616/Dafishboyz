import { BotPlayer, BotAction, BotPersonality, BOT_CHAT_MESSAGES } from '@/types/bot';

// Utility to add random delay based on difficulty
const getThinkingDelay = (difficulty: 'easy' | 'medium' | 'hard'): number => {
  const baseDelay = {
    easy: 2000,
    medium: 1500,
    hard: 800
  };
  return baseDelay[difficulty] + Math.random() * 1000;
};

// Get random element from array
const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Get bot chat message based on personality
export const getBotChatMessage = (personality: BotPersonality): string => {
  return randomChoice(BOT_CHAT_MESSAGES[personality]);
};

// O'Craps bot logic - handles all phases of the game
export const getOCrapsBotAction = (
  bot: BotPlayer,
  gameData: Record<string, any>,
  players: any[]
): BotAction => {
  const delay = getThinkingDelay(bot.difficulty);
  const phase = gameData.phase || 'waiting';
  const playerChips = gameData.playerChips || {};
  const botChips = playerChips[bot.id] || [];
  const currentTurn = gameData.currentTurn || 0;
  const diceResults = gameData.diceResults || [];
  const rerollIndices = gameData.rerollIndices || [];
  
  // If bot has no chips, skip turn
  if (botChips.length === 0) {
    return {
      type: 'skip',
      data: {
        currentTurn: (currentTurn + 1) % players.length
      },
      delay: delay / 2
    };
  }
  
  // Phase: waiting - roll dice
  if (phase === 'waiting') {
    const diceCount = Math.min(3, Math.max(0, botChips.length));
    const results = Array(diceCount).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
    const pooIndices = results.map((r, i) => r === 1 ? i : -1).filter(i => i >= 0);
    
    return {
      type: 'rolled',
      data: {
        diceResults: results,
        phase: pooIndices.length > 0 ? 'reroll' : 'resolve',
        rerollIndices: pooIndices
      },
      delay
    };
  }
  
  // Phase: reroll - reroll poo dice
  if (phase === 'reroll') {
    const newResults = [...diceResults];
    rerollIndices.forEach((i: number) => {
      newResults[i] = Math.floor(Math.random() * 6) + 1;
    });
    const pooIndices = newResults.map((r, i) => r === 1 ? i : -1).filter(i => i >= 0);
    
    return {
      type: 'rerolled',
      data: {
        diceResults: newResults,
        phase: pooIndices.length > 0 ? 'reroll' : 'resolve',
        rerollIndices: pooIndices
      },
      delay
    };
  }
  
  // Phase: resolve - apply dice results
  if (phase === 'resolve') {
    const DICE_FACES = ['poo', 'C', 'R', 'A', 'P', 'S'];
    const newPlayerChips = { ...playerChips };
    const newCenterPot = [...(gameData.centerPot || [])];
    let chipsToRemove = 0;
    
    diceResults.forEach((r: number) => {
      if (chipsToRemove >= botChips.length) return;
      const face = DICE_FACES[r - 1];
      
      if (face === 'C') {
        // Center pot
        newCenterPot.push(botChips[chipsToRemove]);
        chipsToRemove++;
      } else if (face === 'R') {
        // Pass right
        const botIdx = players.findIndex(p => p.player_id === bot.id);
        const rightIdx = (botIdx + 1) % players.length;
        const rightPlayer = players[rightIdx];
        newPlayerChips[rightPlayer.player_id] = [...(newPlayerChips[rightPlayer.player_id] || []), botChips[chipsToRemove]];
        chipsToRemove++;
      } else if (face === 'P') {
        // Pass left
        const botIdx = players.findIndex(p => p.player_id === bot.id);
        const leftIdx = (botIdx - 1 + players.length) % players.length;
        const leftPlayer = players[leftIdx];
        newPlayerChips[leftPlayer.player_id] = [...(newPlayerChips[leftPlayer.player_id] || []), botChips[chipsToRemove]];
        chipsToRemove++;
      } else if (face === 'A') {
        // Give to any - bot picks strategically or randomly
        const otherPlayers = players.filter(p => p.player_id !== bot.id);
        let targetPlayer;
        
        if (bot.difficulty === 'hard') {
          // Give to player with most chips (strategic)
          targetPlayer = otherPlayers.reduce((max, p) => {
            const pChips = newPlayerChips[p.player_id]?.length || 0;
            const maxChips = newPlayerChips[max.player_id]?.length || 0;
            return pChips > maxChips ? p : max;
          }, otherPlayers[0]);
        } else {
          targetPlayer = randomChoice(otherPlayers);
        }
        
        if (targetPlayer) {
          newPlayerChips[targetPlayer.player_id] = [...(newPlayerChips[targetPlayer.player_id] || []), botChips[chipsToRemove]];
          chipsToRemove++;
        }
      }
      // 'S' = Safe, keep chip
    });
    
    newPlayerChips[bot.id] = botChips.slice(chipsToRemove);
    
    // Check for winner
    const activePlayers = players.filter(p => (newPlayerChips[p.player_id] || []).length > 0);
    const winner = activePlayers.length === 1 ? activePlayers[0].player_id : null;
    
    return {
      type: 'resolve',
      data: {
        playerChips: newPlayerChips,
        centerPot: newCenterPot,
        currentTurn: (currentTurn + 1) % players.length,
        phase: 'waiting',
        diceResults: [],
        winner
      },
      delay
    };
  }
  
  // Default: just advance turn
  return {
    type: 'advance_turn',
    data: {
      currentTurn: (currentTurn + 1) % players.length
    },
    delay
  };
};

// Shito bot logic
export const getShitoBotAction = (
  bot: BotPlayer,
  gameData: Record<string, any>,
  calledIcon: string,
  calledColumn: string
): BotAction => {
  const delay = getThinkingDelay(bot.difficulty);
  const botBoard = gameData.boards?.[bot.id] || [];
  
  // Find matching cell to mark
  const matchingCells: { row: number; col: number }[] = [];
  
  botBoard.forEach((row: any[], rowIndex: number) => {
    row.forEach((cell: any, colIndex: number) => {
      if (cell.icon === calledIcon && !cell.marked) {
        // If column matches or it's a wild (Poo)
        if (calledColumn === 'Poo' || colIndex === ['S', 'H', 'I', 'T', 'O'].indexOf(calledColumn)) {
          matchingCells.push({ row: rowIndex, col: colIndex });
        }
      }
    });
  });
  
  if (matchingCells.length > 0) {
    // Bot marks a matching cell
    const cellToMark = bot.difficulty === 'hard' 
      ? matchingCells[0] // Strategic: first match
      : randomChoice(matchingCells); // Random choice
    
    return {
      type: 'mark_cell',
      data: {
        playerId: bot.id,
        row: cellToMark.row,
        col: cellToMark.col
      },
      delay
    };
  }
  
  return {
    type: 'no_match',
    data: { playerId: bot.id },
    delay: delay / 2
  };
};

// Up Shitz Creek bot logic
export const getShitzCreekBotAction = (
  bot: BotPlayer,
  gameData: Record<string, any>,
  isMyTurn: boolean
): BotAction => {
  const delay = getThinkingDelay(bot.difficulty);
  
  if (!isMyTurn) {
    return { type: 'wait', data: {}, delay: 100 };
  }
  
  const botPosition = gameData.positions?.[bot.id] || 0;
  
  // Roll dice
  const diceRoll = Math.floor(Math.random() * 6) + 1;
  
  return {
    type: 'roll_and_move',
    data: {
      playerId: bot.id,
      roll: diceRoll,
      newPosition: botPosition + diceRoll
    },
    delay
  };
};

// Slanging Shit bot logic (for guessing)
export const getSlangingShitBotGuess = (
  bot: BotPlayer,
  currentPhrase: string,
  previousGuesses: string[]
): BotAction => {
  const delay = getThinkingDelay(bot.difficulty);
  
  // Bot guesses based on difficulty
  const correctGuessChance = {
    easy: 0.2,
    medium: 0.4,
    hard: 0.6
  };
  
  const willGuessCorrectly = Math.random() < correctGuessChance[bot.difficulty];
  
  // Common wrong guesses
  const wrongGuesses = [
    "Dancing?",
    "Running?",
    "Eating?",
    "Sleeping?",
    "Swimming?",
    "Flying?",
    "Jumping?",
    "Crying?",
    "Laughing?",
    "Singing?"
  ];
  
  const guess = willGuessCorrectly 
    ? currentPhrase 
    : randomChoice(wrongGuesses.filter(g => !previousGuesses.includes(g)));
  
  return {
    type: 'guess',
    data: {
      playerId: bot.id,
      guess,
      isCorrect: willGuessCorrectly
    },
    delay
  };
};

// Let That Shit Go bot logic
export const getLetGoShitBotAction = (
  bot: BotPlayer,
  gameData: Record<string, any>,
  isMyTurn: boolean
): BotAction => {
  const delay = getThinkingDelay(bot.difficulty);
  
  if (!isMyTurn) {
    return { type: 'wait', data: {}, delay: 100 };
  }
  
  // Bot shooting accuracy based on difficulty
  const accuracy = {
    easy: 0.3,
    medium: 0.5,
    hard: 0.75
  };
  
  const madeShot = Math.random() < accuracy[bot.difficulty];
  
  // Random shooting position
  const positions = ['close', 'mid', 'far', 'corner', 'behind'];
  const position = randomChoice(positions);
  
  return {
    type: 'shoot',
    data: {
      playerId: bot.id,
      position,
      made: madeShot
    },
    delay
  };
};

// Main bot action dispatcher
export const getBotAction = (
  bot: BotPlayer,
  gameType: string,
  gameData: Record<string, any>,
  players: any[],
  isMyTurn: boolean,
  extraData?: Record<string, any>
): BotAction => {
  switch (gameType) {
    case 'o-craps':
      return getOCrapsBotAction(bot, gameData, players);
    
    case 'shito':
      return getShitoBotAction(
        bot, 
        gameData, 
        extraData?.calledIcon || '', 
        extraData?.calledColumn || ''
      );
    
    case 'up-shitz-creek':
      return getShitzCreekBotAction(bot, gameData, isMyTurn);
    
    case 'slanging-shit':
      return getSlangingShitBotGuess(
        bot, 
        extraData?.currentPhrase || '', 
        extraData?.previousGuesses || []
      );
    
    case 'let-that-shit-go':
      return getLetGoShitBotAction(bot, gameData, isMyTurn);
    
    default:
      return {
        type: 'generic_action',
        data: { playerId: bot.id },
        delay: getThinkingDelay(bot.difficulty)
      };
  }
};

// Check if bot should send a chat message
export const shouldBotChat = (personality: BotPersonality): boolean => {
  const chatChance = {
    aggressive: 0.4,
    cautious: 0.1,
    random: 0.3,
    strategic: 0.15,
    trickster: 0.5
  };
  return Math.random() < chatChance[personality];
};
