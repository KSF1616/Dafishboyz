export interface PlayerStats {
  id: string;
  user_id: string;
  total_games: number;
  wins: number;
  losses: number;
  total_score: number;
  highest_score: number;
  current_streak: number;
  best_streak: number;
  favorite_game: string | null;
  drinking_games_played: number;
  total_drinks_taken: number;
  drinking_game_wins: number;
  favorite_drinking_game: string | null;
  games_by_type: Record<string, GameTypeStats>;
  monthly_stats: MonthlyStats[];
  last_played_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface GameTypeStats {
  played: number;
  wins: number;
  total_score: number;
  drinking_played?: number;
  total_drinks?: number;
}

export interface MonthlyStats {
  month: string;
  games: number;
  wins: number;
  total_score: number;
  drinking_games: number;
  drinks: number;
}

export interface GameHistoryRecord {
  id: string;
  user_id: string;
  game_type: string;
  score: number;
  result: 'win' | 'loss' | 'draw';
  duration_minutes: number | null;
  players_count: number;
  drinking_mode: boolean;
  drinks_taken: number;
  drinking_intensity: 'light' | 'medium' | 'heavy' | null;
  opponents: { name: string; id?: string }[];
  room_code: string | null;
  played_at: string;
}

export interface DrinkingGameStats {
  id: string;
  user_id: string;
  game_type: string;
  total_games: number;
  total_drinks: number;
  avg_drinks_per_game: number;
  light_intensity_games: number;
  medium_intensity_games: number;
  heavy_intensity_games: number;
  most_drinks_single_game: number;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  achievement_id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirement_type: string;
  requirement_value: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export const GAME_NAMES: Record<string, string> = {
  'up-shitz-creek': 'Up Shitz Creek',
  'o-craps': 'O Craps',
  'shito': 'SHITO',
  'slanging-shit': 'Slanging Shit',
  'let-that-shit-go': 'Let That Shit Go',
  'drop-a-deuce': 'Drop A Deuce'
};

export const GAME_COLORS: Record<string, string> = {
  'up-shitz-creek': '#8B5CF6',
  'o-craps': '#F59E0B',
  'shito': '#10B981',
  'slanging-shit': '#EF4444',
  'let-that-shit-go': '#3B82F6',
  'drop-a-deuce': '#EC4899'
};

export const ACHIEVEMENT_ICONS: Record<string, string> = {
  trophy: 'Trophy',
  crown: 'Crown',
  star: 'Star',
  gamepad: 'Gamepad2',
  medal: 'Medal',
  gem: 'Gem',
  flame: 'Flame',
  zap: 'Zap',
  shield: 'Shield',
  beer: 'Beer',
  party: 'PartyPopper',
  bottle: 'Wine',
  liver: 'Heart',
  target: 'Target',
  grid: 'Grid3X3',
  dice: 'Dice5',
  paddle: 'Waves',
  peace: 'Leaf',
  cards: 'Layers'
};

// Legacy achievements for backward compatibility
export const ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  { id: 'first_win', achievement_id: 'first_win', name: 'First Victory', description: 'Win your first game', category: 'milestones', icon: 'trophy', points: 10, rarity: 'common', requirement_type: 'wins', requirement_value: 1 },
  { id: 'ten_games', achievement_id: 'ten_games', name: 'Getting Started', description: 'Play 10 games', category: 'milestones', icon: 'gamepad', points: 10, rarity: 'common', requirement_type: 'total_games', requirement_value: 10 },
  { id: 'fifty_games', achievement_id: 'fifty_games', name: 'Dedicated Player', description: 'Play 50 games', category: 'milestones', icon: 'gamepad', points: 25, rarity: 'common', requirement_type: 'total_games', requirement_value: 50 },
  { id: 'hundred_games', achievement_id: 'hundred_games', name: 'Veteran', description: 'Play 100 games', category: 'milestones', icon: 'medal', points: 50, rarity: 'rare', requirement_type: 'total_games', requirement_value: 100 },
  { id: 'win_streak_3', achievement_id: 'streak_3', name: 'Hot Streak', description: 'Win 3 games in a row', category: 'streaks', icon: 'flame', points: 15, rarity: 'common', requirement_type: 'best_streak', requirement_value: 3 },
  { id: 'win_streak_5', achievement_id: 'streak_5', name: 'On Fire', description: 'Win 5 games in a row', category: 'streaks', icon: 'flame', points: 30, rarity: 'rare', requirement_type: 'best_streak', requirement_value: 5 },
  { id: 'win_streak_10', achievement_id: 'streak_10', name: 'Unstoppable', description: 'Win 10 games in a row', category: 'streaks', icon: 'zap', points: 75, rarity: 'epic', requirement_type: 'best_streak', requirement_value: 10 },
  { id: 'high_scorer', achievement_id: 'score_1000', name: 'High Scorer', description: 'Score over 1000 points in a game', category: 'scores', icon: 'target', points: 40, rarity: 'rare', requirement_type: 'highest_score', requirement_value: 1000 },
  { id: 'first_drink', achievement_id: 'first_drink', name: 'Cheers!', description: 'Play your first drinking game', category: 'drinking', icon: 'beer', points: 10, rarity: 'common', requirement_type: 'drinking_games_played', requirement_value: 1 },
  { id: 'party_animal', achievement_id: 'ten_drinking', name: 'Party Animal', description: 'Play 10 drinking games', category: 'drinking', icon: 'beer', points: 25, rarity: 'common', requirement_type: 'drinking_games_played', requirement_value: 10 },
  { id: 'heavyweight', achievement_id: 'hundred_drinks', name: 'Heavyweight', description: 'Take 100 total drinks', category: 'drinking', icon: 'bottle', points: 30, rarity: 'rare', requirement_type: 'total_drinks_taken', requirement_value: 100 },
  { id: 'perfectionist', achievement_id: 'score_2000', name: 'Perfectionist', description: 'Score 2000 points in a single game', category: 'scores', icon: 'star', points: 75, rarity: 'epic', requirement_type: 'highest_score', requirement_value: 2000 },
];
