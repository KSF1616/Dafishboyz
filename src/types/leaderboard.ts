export interface PlayerStats {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  total_games_played: number;
  total_wins: number;
  total_losses: number;
  total_draws: number;
  total_points: number;
  current_streak: number;
  best_streak: number;
  created_at: string;
  updated_at: string;
  rank?: number;
}

export interface GameResult {
  id: string;
  user_id: string;
  game_type: string;
  result: 'win' | 'loss' | 'draw';
  points_earned: number;
  opponent_id?: string;
  game_duration_seconds?: number;
  played_at: string;
  metadata?: Record<string, any>;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  requirement_type: string;
  requirement_value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface PlayerAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  achievement?: Achievement;
}

export type TimeFilter = 'weekly' | 'monthly' | 'all-time';
export type SortBy = 'points' | 'wins' | 'streak' | 'games';
