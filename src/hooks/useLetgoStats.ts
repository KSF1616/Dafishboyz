import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface LetgoGameData {
  gameMode: 'multiplayer' | 'emotional';
  shotsTaken: number;
  shotsMade: number;
  gameResult: 'win' | 'loss' | 'completed';
  emotionalItems?: string[];
  lettersEarned?: string[];
}

export interface LetgoStats {
  totalGames: number;
  totalShotsTaken: number;
  totalShotsMade: number;
  overallAccuracy: number;
  multiplayer: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
  };
  emotional: {
    gamesCompleted: number;
    totalShots: number;
    shotsMade: number;
    accuracy: number;
  };
  improvementTrend: number;
  accuracyHistory: {
    date: string;
    accuracy: number;
    gameMode: string;
    result: string;
  }[];
  weeklyStats: {
    week: string;
    gamesPlayed: number;
    accuracy: number;
    shotsTaken: number;
    shotsMade: number;
  }[];
  recentGames: any[];
}

export function useLetgoStats(userId: string | undefined) {
  const [stats, setStats] = useState<LetgoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase.functions.invoke('letgo-stats', {
        body: { action: 'getStats', userId }
      });

      if (fetchError) throw fetchError;

      if (data.success) {
        setStats(data.stats);
      } else {
        throw new Error(data.error || 'Failed to fetch stats');
      }
    } catch (err: any) {
      console.error('Error fetching letgo stats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const saveGame = useCallback(async (gameData: LetgoGameData) => {
    if (!userId) {
      console.error('No user ID for saving game');
      return false;
    }

    try {
      const { data, error: saveError } = await supabase.functions.invoke('letgo-stats', {
        body: { action: 'saveGame', userId, gameData }
      });

      if (saveError) throw saveError;

      if (data.success) {
        // Refresh stats after saving
        await fetchStats();
        return true;
      } else {
        throw new Error(data.error || 'Failed to save game');
      }
    } catch (err: any) {
      console.error('Error saving letgo game:', err);
      return false;
    }
  }, [userId, fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    saveGame,
    refetch: fetchStats
  };
}
