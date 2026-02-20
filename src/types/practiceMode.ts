export interface PracticeModeState {
  isActive: boolean;
  isPaused: boolean;
  selectedGame: string | null;
  difficulty: 'easy' | 'medium' | 'hard';
  botCount: number;
  moveHistory: GameMove[];
  currentMoveIndex: number;
  hintsEnabled: boolean;
  coachMessages: CoachMessage[];
  gameState: Record<string, any>;
}

export interface GameMove {
  id: string;
  playerId: string;
  playerName: string;
  isBot: boolean;
  action: string;
  data: Record<string, any>;
  timestamp: number;
  gameStateBefore: Record<string, any>;
  gameStateAfter: Record<string, any>;
}

export interface CoachMessage {
  id: string;
  type: 'hint' | 'strategy' | 'warning' | 'praise' | 'explanation';
  title: string;
  message: string;
  timestamp: number;
  gameContext?: string;
}

export interface GameStrategy {
  gameId: string;
  generalTips: string[];
  situationalHints: SituationalHint[];
  optimalMoves: OptimalMoveGuide[];
}

export interface SituationalHint {
  condition: (gameState: Record<string, any>) => boolean;
  hint: string;
  priority: 'low' | 'medium' | 'high';
}

export interface OptimalMoveGuide {
  situation: string;
  optimalAction: string;
  explanation: string;
}

export interface PracticeSettings {
  showBotThinking: boolean;
  autoHints: boolean;
  hintDelay: number; // ms before showing hint
  slowMotion: boolean;
  slowMotionSpeed: number; // multiplier
}

export const DEFAULT_PRACTICE_SETTINGS: PracticeSettings = {
  showBotThinking: true,
  autoHints: true,
  hintDelay: 3000,
  slowMotion: false,
  slowMotionSpeed: 0.5
};

export const GAME_MIN_PLAYERS: Record<string, number> = {
  'o-craps': 2,
  'shito': 2,
  'up-shitz-creek': 2,
  'slanging-shit': 4,
  'let-that-shit-go': 2,
  'drop-deuce': 3
};

export const GAME_DISPLAY_NAMES: Record<string, string> = {
  'o-craps': "O'Craps",
  'shito': 'SHITO',
  'up-shitz-creek': 'Up Shitz Creek',
  'slanging-shit': 'Slanging Shit',
  'let-that-shit-go': 'Let That Shit Go',
  'drop-deuce': 'Drop A Deuce'
};
