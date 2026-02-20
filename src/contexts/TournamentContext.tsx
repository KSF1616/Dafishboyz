import React, { createContext, useContext, useState, useCallback } from 'react';
import { Tournament, TournamentParticipant, TournamentMatch, TournamentLeaderboardEntry } from '@/types/tournament';

interface TournamentContextType {
  tournaments: Tournament[];
  currentTournament: Tournament | null;
  participants: TournamentParticipant[];
  matches: TournamentMatch[];
  leaderboard: TournamentLeaderboardEntry[];
  loading: boolean;
  setCurrentTournament: (t: Tournament | null) => void;
  createTournament: (data: Partial<Tournament>) => Promise<Tournament>;
  joinTournament: (tournamentId: string, userId: string, username: string) => Promise<void>;
  leaveTournament: (tournamentId: string, participantId: string) => Promise<void>;
  startTournament: (tournamentId: string) => Promise<void>;
  reportMatchResult: (matchId: string, winnerId: string, p1Score: number, p2Score: number) => Promise<void>;
  fetchTournaments: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
}

const TournamentContext = createContext<TournamentContextType | null>(null);

export const useTournament = () => {
  const ctx = useContext(TournamentContext);
  if (!ctx) throw new Error('useTournament must be used within TournamentProvider');
  return ctx;
};

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [currentTournament, setCurrentTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [leaderboard, setLeaderboard] = useState<TournamentLeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setTournaments(getMockTournaments());
    setLoading(false);
  }, []);

  const fetchLeaderboard = useCallback(async () => {
    setLeaderboard(getMockLeaderboard());
  }, []);

  const createTournament = async (data: Partial<Tournament>): Promise<Tournament> => {
    const entryFee = data.entry_fee || 5;
    const maxParticipants = data.max_participants || 16;
    const newTournament: Tournament = {
      id: `t-${Date.now()}`, 
      name: data.name || 'New Tournament', 
      description: data.description || '',
      game_type: data.game_type || 'up-shitz-creek', 
      host_id: 'user-1', 
      host_name: 'Host',
      status: 'registration', 
      format: data.format || 'single_elimination', 
      max_participants: maxParticipants,
      current_participants: 0, 
      rules: data.rules || { best_of: 3, time_limit_minutes: 30, allow_spectators: true, custom_rules: [] },
      bracket: null, 
      registration_start: new Date().toISOString(), 
      registration_end: data.registration_end || '',
      start_date: data.start_date || '', 
      created_at: new Date().toISOString(),
      entry_fee: entryFee,
      prize_pool: 0, // Starts at 0, grows as players join
      prize_distribution: data.prize_distribution || { first_place_percent: 60, second_place_percent: 30, third_place_percent: 10 }
    };
    setTournaments(prev => [...prev, newTournament]);
    return newTournament;
  };

  const joinTournament = async (tournamentId: string, userId: string, username: string) => {
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    
    // Add entry fee to prize pool
    setTournaments(prev => prev.map(t => 
      t.id === tournamentId 
        ? { ...t, prize_pool: t.prize_pool + t.entry_fee, current_participants: t.current_participants + 1 }
        : t
    ));
    
    const participant: TournamentParticipant = {
      id: `p-${Date.now()}`, 
      tournament_id: tournamentId, 
      user_id: userId, 
      username, 
      seed: participants.length + 1,
      status: 'registered', 
      wins: 0, 
      losses: 0, 
      points: 0, 
      registered_at: new Date().toISOString(),
      entry_paid: true
    };
    setParticipants(prev => [...prev, participant]);
  };

  const leaveTournament = async (tournamentId: string, participantId: string) => {
    setParticipants(prev => prev.filter(p => p.id !== participantId));
  };

  const startTournament = async (tournamentId: string) => {
    setTournaments(prev => prev.map(t => t.id === tournamentId ? { ...t, status: 'in_progress' as const } : t));
  };

  const reportMatchResult = async (matchId: string, winnerId: string, p1Score: number, p2Score: number) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, winner_id: winnerId, player1_score: p1Score, player2_score: p2Score, status: 'completed' as const } : m));
    
    // Check if this completes a tournament and the winner is the current user
    // This would need to be expanded with proper tournament completion logic
    // For now, we'll track tournament wins when a match is won
    const match = matches.find(m => m.id === matchId);
    if (match && match.round === 'finals') {
      // Update localStorage for collectible character unlocks
      const tournamentWins = parseInt(localStorage.getItem('tournamentWins') || '0') + 1;
      localStorage.setItem('tournamentWins', tournamentWins.toString());
    }
  };


  return (
    <TournamentContext.Provider value={{
      tournaments, currentTournament, participants, matches, leaderboard, loading,
      setCurrentTournament, createTournament, joinTournament, leaveTournament,
      startTournament, reportMatchResult, fetchTournaments, fetchLeaderboard
    }}>
      {children}
    </TournamentContext.Provider>
  );
};

const getMockTournaments = (): Tournament[] => [
  { 
    id: 't1', 
    name: 'Weekly Shitz Championship', 
    description: 'Weekly tournament - winner takes the pot!', 
    game_type: 'up-shitz-creek', 
    host_id: 'u1', 
    host_name: 'DaFish', 
    status: 'registration', 
    format: 'single_elimination', 
    max_participants: 16, 
    current_participants: 12, 
    rules: { best_of: 3, time_limit_minutes: 30, allow_spectators: true, custom_rules: [] }, 
    bracket: null, 
    registration_start: '2025-12-01', 
    registration_end: '2025-12-05', 
    start_date: '2025-12-06', 
    created_at: '2025-12-01',
    entry_fee: 5,
    prize_pool: 60, // 12 players * $5
    prize_distribution: { first_place_percent: 60, second_place_percent: 30, third_place_percent: 10 }
  },
  { 
    id: 't2', 
    name: "O'Craps Masters", 
    description: 'High stakes O\'Craps - big prize pool!', 
    game_type: 'o-craps', 
    host_id: 'u2', 
    host_name: 'GameMaster', 
    status: 'in_progress', 
    format: 'double_elimination', 
    max_participants: 32, 
    current_participants: 32, 
    rules: { best_of: 5, time_limit_minutes: 45, allow_spectators: true, custom_rules: ['No timeouts'] }, 
    bracket: null, 
    registration_start: '2025-11-25', 
    registration_end: '2025-12-01', 
    start_date: '2025-12-02', 
    created_at: '2025-11-25',
    entry_fee: 10,
    prize_pool: 320, // 32 players * $10
    prize_distribution: { first_place_percent: 50, second_place_percent: 25, third_place_percent: 15, fourth_place_percent: 10 }
  }
];

const getMockLeaderboard = (): TournamentLeaderboardEntry[] => [
  { rank: 1, user_id: 'u1', username: 'ShitKing99', tournaments_won: 15, tournaments_played: 20, win_rate: 75, total_earnings: 450 },
  { rank: 2, user_id: 'u2', username: 'CreekMaster', tournaments_won: 12, tournaments_played: 18, win_rate: 66, total_earnings: 320 },
  { rank: 3, user_id: 'u3', username: 'DiceRoller', tournaments_won: 10, tournaments_played: 25, win_rate: 40, total_earnings: 180 }
];
