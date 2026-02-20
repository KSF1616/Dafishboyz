export interface BotPlayer {
  id: string;
  name: string;
  difficulty: 'easy' | 'medium' | 'hard';
  personality: BotPersonality;
  avatar: string;
  isBot: true;
  isReady: boolean;
  score: number;
  playerData: Record<string, any>;
}

export type BotPersonality = 
  | 'aggressive' // Makes bold moves, takes risks
  | 'cautious'   // Plays safe, conservative strategy
  | 'random'     // Unpredictable moves
  | 'strategic'  // Calculates optimal moves
  | 'trickster'; // Tries to mess with other players

export interface BotAction {
  type: string;
  data: Record<string, any>;
  delay: number; // ms to wait before executing (simulates thinking)
}

export interface BotConfig {
  enabled: boolean;
  autoFillEmpty: boolean; // Auto-add bots when room is empty
  minBots: number;
  maxBots: number;
  defaultDifficulty: 'easy' | 'medium' | 'hard';
}

export const BOT_NAMES = [
  'Robo-Flush',
  'Toilet-Tron',
  'Poo-Bot 3000',
  'Captain Crap',
  'Sir Stinks-a-Lot',
  'The Dookie Duke',
  'Professor Plop',
  'Baron von Bowel',
  'Count Commode',
  'Admiral Anus',
  'General Gastro',
  'Major Methane',
  'Private Parts',
  'Sergeant Sewage',
  'Lieutenant Latrine'
];

export const BOT_AVATARS = [
  '🤖', '🦾', '🎮', '👾', '🕹️', '💩', '🚽', '🧻', '🪠', '🦠'
];

export const BOT_CHAT_MESSAGES: Record<BotPersonality, string[]> = {
  aggressive: [
    "You're going down!",
    "I'm coming for you!",
    "Watch this move!",
    "Too easy!",
    "Can't stop me now!"
  ],
  cautious: [
    "Playing it safe here...",
    "Let me think about this...",
    "Hmm, interesting...",
    "I'll wait for a better opportunity.",
    "Patience is key."
  ],
  random: [
    "YOLO!",
    "Why not?",
    "Let's see what happens!",
    "Random is my strategy!",
    "Chaos mode activated!"
  ],
  strategic: [
    "Calculating optimal move...",
    "According to my analysis...",
    "Statistically speaking...",
    "The probability favors this move.",
    "A logical choice."
  ],
  trickster: [
    "Hehe, watch this!",
    "Gotcha!",
    "Didn't see that coming, did ya?",
    "Surprise!",
    "Just messing with you!"
  ]
};
