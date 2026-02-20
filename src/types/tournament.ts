export interface Tournament {
  id: string;
  name: string;
  description: string;
  game_type: string;
  host_id: string;
  host_name: string;
  status: 'registration' | 'in_progress' | 'completed' | 'cancelled';
  format: 'single_elimination' | 'double_elimination' | 'round_robin';
  max_participants: number;
  current_participants: number;
  rules: TournamentRules;
  bracket: TournamentBracket | null;
  registration_start: string;
  registration_end: string;
  start_date: string;
  end_date?: string;
  created_at: string;
  // Prize pool fields
  entry_fee: number;
  prize_pool: number;
  prize_distribution: PrizeDistribution;
}

export interface TournamentRules {
  best_of: number;
  time_limit_minutes: number;
  allow_spectators: boolean;
  custom_rules: string[];
}

export interface PrizeDistribution {
  first_place_percent: number;
  second_place_percent: number;
  third_place_percent: number;
  fourth_place_percent?: number;
}

export interface TournamentParticipant {
  id: string;
  tournament_id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  seed: number;
  status: 'registered' | 'active' | 'eliminated' | 'winner';
  wins: number;
  losses: number;
  points: number;
  registered_at: string;
  entry_paid: boolean;
  payout_amount?: number;
}

export interface TournamentMatch {
  id: string;
  tournament_id: string;
  round: number;
  match_number: number;
  player1_id: string | null;
  player1_name: string | null;
  player2_id: string | null;
  player2_name: string | null;
  winner_id: string | null;
  player1_score: number;
  player2_score: number;
  status: 'pending' | 'in_progress' | 'completed';
  room_id?: string;
  scheduled_time?: string;
  completed_at?: string;
}

export interface TournamentBracket {
  rounds: TournamentRound[];
  total_rounds: number;
}

export interface TournamentRound {
  round_number: number;
  name: string;
  matches: TournamentMatch[];
}

export interface TournamentLeaderboardEntry {
  rank: number;
  user_id: string;
  username: string;
  avatar_url?: string;
  tournaments_won: number;
  tournaments_played: number;
  win_rate: number;
  total_earnings?: number;
}
