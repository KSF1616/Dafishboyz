export interface UserProfile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  favorite_game: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface GameHistoryItem {
  id: string;
  user_id: string;
  game_id: string;
  room_code: string | null;
  result: 'win' | 'loss' | 'draw' | 'incomplete';
  score: number;
  played_at: string;
  duration_minutes: number | null;
  opponents: { name: string; id?: string }[];
}

export interface UserStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalScore: number;
  averageScore: number;
  favoriteGame: string | null;
  currentStreak: number;
  bestStreak: number;
  gameBreakdown: {
    gameId: string;
    gameName: string;
    played: number;
    wins: number;
  }[];
}

export interface GameCard {
  id: string;
  game_id: string;
  card_type: 'prompt' | 'response' | 'action' | 'rule';
  file_url: string;
  file_name: string;
  uploaded_at: string;
  uploaded_by: string | null;
  metadata: Record<string, any>;
}
