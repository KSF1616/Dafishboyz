import { CoachMessage, GameStrategy, SituationalHint } from '@/types/practiceMode';

// Generate unique ID for coach messages
const generateMessageId = () => `coach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Coach Bot Strategies for each game
export const GAME_STRATEGIES: Record<string, GameStrategy> = {
  'o-craps': {
    gameId: 'o-craps',
    generalTips: [
      "Keep track of how many chips each player has - the last one with chips wins!",
      "Rolling 'S' (Safe) is your best friend - you keep your chip.",
      "Watch out for 'C' (Center) - those chips go to the pot and are gone forever.",
      "When you have few chips left, you're actually in a good position - fewer dice to roll!",
      "Pay attention to 'A' (Any) rolls - strategic players give chips to those who already have many."
    ],
    situationalHints: [
      {
        condition: (state) => (state.playerChips?.['player']?.length || 0) <= 2,
        hint: "You're down to few chips! This is actually advantageous - you roll fewer dice and have less chance of losing chips.",
        priority: 'medium'
      },
      {
        condition: (state) => (state.playerChips?.['player']?.length || 0) >= 5,
        hint: "You have many chips! Be prepared to lose some - with more chips, you roll more dice.",
        priority: 'low'
      },
      {
        condition: (state) => state.phase === 'reroll',
        hint: "You rolled a 'Poo'! You get to reroll that die - hope for an 'S' (Safe) this time!",
        priority: 'high'
      }
    ],
    optimalMoves: [
      {
        situation: "When you roll 'A' (Any)",
        optimalAction: "Give the chip to the player with the most chips",
        explanation: "Players with more chips have higher chances of losing them on their turn."
      },
      {
        situation: "When down to 1 chip",
        optimalAction: "Stay calm and wait",
        explanation: "With only 1 chip, you only roll 1 die. The odds are in your favor!"
      }
    ]
  },
  'shito': {
    gameId: 'shito',
    generalTips: [
      "Listen carefully to the called icon AND the column letter!",
      "The 'Poo' column is wild - any icon in that column can be marked regardless of the called column.",
      "Aim for patterns: rows, columns, diagonals, or four corners.",
      "Keep your eyes on multiple potential winning patterns at once.",
      "Don't forget to yell 'SHITO!' when you complete a pattern!"
    ],
    situationalHints: [
      {
        condition: (state) => {
          const board = state.boards?.['player'] || [];
          const markedCount = board.flat().filter((c: any) => c?.marked).length;
          return markedCount >= 4;
        },
        hint: "You're making progress! Look for which patterns you're closest to completing.",
        priority: 'medium'
      },
      {
        condition: (state) => {
          const board = state.boards?.['player'] || [];
          // Check if close to a row
          return board.some((row: any[]) => row.filter((c: any) => c?.marked).length >= 4);
        },
        hint: "You're one away from completing a row! Focus on that pattern!",
        priority: 'high'
      }
    ],
    optimalMoves: [
      {
        situation: "Multiple cells match the called icon",
        optimalAction: "Mark the cell that contributes to the most potential patterns",
        explanation: "Prioritize cells that are part of multiple winning combinations (row + column + diagonal)."
      },
      {
        situation: "Center cell is available",
        optimalAction: "Mark it when possible",
        explanation: "The center cell is part of 4 patterns: its row, column, and both diagonals."
      }
    ]
  },
  'up-shitz-creek': {
    gameId: 'up-shitz-creek',
    generalTips: [
      "Plan your route carefully - some paths have more obstacles than others.",
      "Save your power-ups for crucial moments, not early in the game.",
      "Watch what cards other players are holding - they might sabotage you!",
      "Sometimes going slower is smarter if it means avoiding a trap.",
      "The paddle cards are powerful - use them wisely!"
    ],
    situationalHints: [
      {
        condition: (state) => (state.positions?.['player'] || 0) < 5,
        hint: "You're just starting out! Focus on building momentum and collecting useful cards.",
        priority: 'low'
      },
      {
        condition: (state) => (state.positions?.['player'] || 0) > 15,
        hint: "You're in the home stretch! Watch out for other players trying to sabotage you.",
        priority: 'high'
      }
    ],
    optimalMoves: [
      {
        situation: "You have a 'Skip Turn' card",
        optimalAction: "Save it for when an opponent is about to win",
        explanation: "Timing is everything - using it too early wastes its potential."
      },
      {
        situation: "Multiple paths available",
        optimalAction: "Choose the path with fewer visible obstacles",
        explanation: "Even if it's longer, avoiding setbacks is usually worth it."
      }
    ]
  },
  'slanging-shit': {
    gameId: 'slanging-shit',
    generalTips: [
      "Use big, exaggerated gestures - subtlety doesn't work in charades!",
      "Break complex phrases into smaller, actable parts.",
      "If stuck, try acting out rhyming words or similar concepts.",
      "Watch the timer - sometimes simpler interpretations work better.",
      "Pay attention to your teammates' guesses - they might be on the right track!"
    ],
    situationalHints: [
      {
        condition: (state) => (state.timeRemaining || 60) < 15,
        hint: "Time is running out! Try more obvious gestures or break down the word differently.",
        priority: 'high'
      },
      {
        condition: (state) => (state.wrongGuesses || 0) > 3,
        hint: "Your team is struggling. Try acting out the opposite or a related concept.",
        priority: 'medium'
      }
    ],
    optimalMoves: [
      {
        situation: "Acting out a compound word",
        optimalAction: "Act out each part separately, then combine",
        explanation: "Breaking it down makes it easier for guessers to piece together."
      },
      {
        situation: "Team keeps guessing wrong category",
        optimalAction: "Use the 'sounds like' gesture",
        explanation: "Redirect their thinking by indicating a rhyming word."
      }
    ]
  },
  'let-that-shit-go': {
    gameId: 'let-that-shit-go',
    generalTips: [
      "Aim for the center of the toilet for maximum points!",
      "Timing is everything - wait for the perfect moment to release.",
      "Watch the wind indicator if there is one - it affects your shot.",
      "Practice makes perfect - learn the arc of your throws.",
      "Bonus points are often hidden in challenging positions."
    ],
    situationalHints: [
      {
        condition: (state) => (state.score?.['player'] || 0) < (state.score?.['bot'] || 0),
        hint: "You're behind! Consider taking riskier shots for bonus points.",
        priority: 'medium'
      },
      {
        condition: (state) => (state.roundsRemaining || 5) <= 2,
        hint: "Final rounds! Every shot counts - focus and take your time.",
        priority: 'high'
      }
    ],
    optimalMoves: [
      {
        situation: "You're ahead in points",
        optimalAction: "Play it safe with center shots",
        explanation: "No need to risk missing - consistent points will secure your lead."
      },
      {
        situation: "You're behind with few rounds left",
        optimalAction: "Go for high-risk, high-reward shots",
        explanation: "You need to catch up, so the risk is worth it."
      }
    ]
  },
  'drop-deuce': {
    gameId: 'drop-deuce',
    generalTips: [
      "Read each challenge card carefully before starting!",
      "Teamwork makes the dream work - help your teammates succeed.",
      "Don't be afraid to be silly - that's the whole point!",
      "Keep energy high - enthusiasm is contagious.",
      "Remember: it's about having fun, not just winning!"
    ],
    situationalHints: [
      {
        condition: (state) => state.currentChallenge?.type === 'physical',
        hint: "Physical challenge! Make sure you have enough space and be careful.",
        priority: 'medium'
      },
      {
        condition: (state) => state.currentChallenge?.type === 'creative',
        hint: "Creative challenge! Think outside the box - the sillier, the better!",
        priority: 'low'
      }
    ],
    optimalMoves: [
      {
        situation: "Team challenge",
        optimalAction: "Communicate clearly with your partner",
        explanation: "Coordination is key - make sure everyone knows the plan."
      },
      {
        situation: "Timed challenge",
        optimalAction: "Start immediately and stay focused",
        explanation: "Every second counts - don't waste time overthinking."
      }
    ]
  }
};

// Get a random general tip for a game
export const getRandomTip = (gameId: string): CoachMessage => {
  const strategy = GAME_STRATEGIES[gameId];
  if (!strategy) {
    return {
      id: generateMessageId(),
      type: 'hint',
      title: 'General Tip',
      message: 'Focus on learning the game mechanics first!',
      timestamp: Date.now()
    };
  }
  
  const tip = strategy.generalTips[Math.floor(Math.random() * strategy.generalTips.length)];
  return {
    id: generateMessageId(),
    type: 'hint',
    title: 'Coach Tip',
    message: tip,
    timestamp: Date.now(),
    gameContext: gameId
  };
};

// Get situational hint based on game state
export const getSituationalHint = (gameId: string, gameState: Record<string, any>): CoachMessage | null => {
  const strategy = GAME_STRATEGIES[gameId];
  if (!strategy) return null;
  
  // Find applicable hints sorted by priority
  const applicableHints = strategy.situationalHints
    .filter(hint => {
      try {
        return hint.condition(gameState);
      } catch {
        return false;
      }
    })
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  
  if (applicableHints.length === 0) return null;
  
  const hint = applicableHints[0];
  return {
    id: generateMessageId(),
    type: hint.priority === 'high' ? 'warning' : 'hint',
    title: hint.priority === 'high' ? 'Important!' : 'Hint',
    message: hint.hint,
    timestamp: Date.now(),
    gameContext: gameId
  };
};

// Get optimal move explanation
export const getOptimalMoveHint = (gameId: string, situation: string): CoachMessage | null => {
  const strategy = GAME_STRATEGIES[gameId];
  if (!strategy) return null;
  
  const move = strategy.optimalMoves.find(m => 
    m.situation.toLowerCase().includes(situation.toLowerCase())
  );
  
  if (!move) return null;
  
  return {
    id: generateMessageId(),
    type: 'strategy',
    title: 'Optimal Strategy',
    message: `${move.optimalAction}\n\n${move.explanation}`,
    timestamp: Date.now(),
    gameContext: gameId
  };
};

// Generate praise message
export const getPraiseMessage = (action: string): CoachMessage => {
  const praises = [
    "Great move! You're getting the hang of this!",
    "Excellent choice! That was a smart play.",
    "Well done! Keep up the good work!",
    "Nice one! You're thinking like a pro.",
    "Perfect execution! You're learning fast.",
    "Brilliant! That's exactly what I would have done.",
    "Impressive! You're really improving.",
    "Fantastic play! You're a natural."
  ];
  
  return {
    id: generateMessageId(),
    type: 'praise',
    title: 'Well Done!',
    message: praises[Math.floor(Math.random() * praises.length)],
    timestamp: Date.now()
  };
};

// Generate explanation for a move
export const explainMove = (gameId: string, action: string, data: Record<string, any>): CoachMessage => {
  const explanations: Record<string, Record<string, string>> = {
    'o-craps': {
      'rolled': `You rolled the dice! Results: ${data.diceResults?.join(', ') || 'unknown'}. ${data.phase === 'reroll' ? "You got a 'Poo' - you'll get to reroll!" : "Now let's see where your chips go."}`,
      'rerolled': `Reroll complete! New results: ${data.diceResults?.join(', ') || 'unknown'}.`,
      'resolve': 'Chips have been distributed based on your roll.',
      'skip': 'Turn skipped - no chips to roll with.'
    },
    'shito': {
      'mark_cell': `You marked a cell! ${data.row !== undefined ? `Row ${data.row + 1}, Column ${data.col + 1}` : ''}`,
      'call_icon': `A new icon was called: ${data.icon || 'unknown'} in column ${data.column || 'unknown'}.`,
      'no_match': "No matching cells to mark this round."
    },
    'up-shitz-creek': {
      'roll_and_move': `Rolled a ${data.roll || '?'}! Moving to position ${data.newPosition || '?'}.`,
      'use_card': `Used a card: ${data.cardName || 'unknown'}.`,
      'obstacle': `Hit an obstacle! ${data.effect || ''}`
    },
    'slanging-shit': {
      'guess': `Guess: "${data.guess || '?'}" - ${data.isCorrect ? 'Correct!' : 'Not quite...'}`,
      'skip': 'Skipped this phrase.',
      'timeout': "Time's up!"
    },
    'let-that-shit-go': {
      'shoot': `Shot from ${data.position || 'unknown'} position - ${data.made ? 'Made it!' : 'Missed!'}`,
      'bonus': `Bonus shot! ${data.points || 0} extra points.`
    }
  };
  
  const gameExplanations = explanations[gameId] || {};
  const explanation = gameExplanations[action] || `Action: ${action}`;
  
  return {
    id: generateMessageId(),
    type: 'explanation',
    title: 'Move Explanation',
    message: explanation,
    timestamp: Date.now(),
    gameContext: gameId
  };
};

// Get welcome message for practice mode
export const getWelcomeMessage = (gameId: string): CoachMessage => {
  const gameName = {
    'o-craps': "O'Craps",
    'shito': 'SHITO',
    'up-shitz-creek': 'Up Shitz Creek',
    'slanging-shit': 'Slanging Shit',
    'let-that-shit-go': 'Let That Shit Go',
    'drop-deuce': 'Drop A Deuce'
  }[gameId] || 'this game';
  
  return {
    id: generateMessageId(),
    type: 'hint',
    title: `Welcome to ${gameName} Practice!`,
    message: `I'm your Coach Bot! I'll help you learn the game with tips and strategies. Use the hint button anytime you need guidance. You can also pause the game, undo moves, and practice at your own pace. Let's get started!`,
    timestamp: Date.now(),
    gameContext: gameId
  };
};

// Analyze a move and provide feedback
export const analyzeMove = (
  gameId: string, 
  action: string, 
  gameStateBefore: Record<string, any>,
  gameStateAfter: Record<string, any>
): CoachMessage | null => {
  // Simple analysis - can be expanded for more sophisticated feedback
  const wasGoodMove = Math.random() > 0.3; // Simplified - would need real game logic
  
  if (wasGoodMove) {
    return getPraiseMessage(action);
  }
  
  // Provide constructive feedback
  const feedback = getSituationalHint(gameId, gameStateAfter);
  if (feedback) {
    return {
      ...feedback,
      title: 'Tip for Next Time',
      type: 'hint'
    };
  }
  
  return null;
};
