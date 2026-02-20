import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  PlayerStats, 
  GameHistoryRecord, 
  Achievement, 
  DrinkingGameStats,
  ACHIEVEMENTS,
  GAME_NAMES 
} from '@/types/stats';

interface RecordGameParams {
  game_type: string;
  score: number;
  result: 'win' | 'loss' | 'draw';
  duration_minutes?: number;
  players_count?: number;
  drinking_mode?: boolean;
  drinks_taken?: number;
  drinking_intensity?: 'light' | 'medium' | 'heavy';
  opponents?: { name: string; id?: string }[];
  room_code?: string;
}

const getDefaultStats = (userId: string): PlayerStats => ({
  id: '',
  user_id: userId,
  total_games: 0,
  wins: 0,
  losses: 0,
  total_score: 0,
  highest_score: 0,
  current_streak: 0,
  best_streak: 0,
  favorite_game: null,
  drinking_games_played: 0,
  total_drinks_taken: 0,
  drinking_game_wins: 0,
  favorite_drinking_game: null,
  games_by_type: {},
  monthly_stats: [],
  last_played_at: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

// Helper to set default data silently
const setDefaultData = (
  userId: string,
  setStats: (s: PlayerStats) => void,
  setHistory: (h: GameHistoryRecord[]) => void,
  setDrinkingStats: (d: DrinkingGameStats[]) => void,
  setAchievements: (a: Achievement[]) => void,
  setAllAchievements: (a: Achievement[]) => void
) => {
  setStats(getDefaultStats(userId));
  setHistory([]);
  setDrinkingStats([]);
  const processedAchievements = ACHIEVEMENTS.map(a => ({
    ...a,
    unlocked: false,
    unlockedAt: undefined
  }));
  setAchievements(processedAchievements);
  setAllAchievements(ACHIEVEMENTS);
};

export const usePlayerStats = (userId: string | undefined) => {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [history, setHistory] = useState<GameHistoryRecord[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [drinkingStats, setDrinkingStats] = useState<DrinkingGameStats[]>([]);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Try to fetch from edge function
      const { data, error: fnError } = await supabase.functions.invoke('game-stats-tracker', {
        body: { action: 'get_stats', user_id: userId }
      });

      // Handle edge function errors gracefully - use defaults silently
      if (fnError || !data || data.error) {
        // Silently use default stats - this is expected when tables don't exist yet
        setDefaultData(userId, setStats, setHistory, setDrinkingStats, setAchievements, setAllAchievements);
        setLoading(false);
        return;
      }

      // Set stats with defaults if not found
      setStats(data.stats || getDefaultStats(userId));
      setHistory(data.history || []);
      setDrinkingStats(data.drinkingStats || []);
      
      // Process achievements
      const unlockedIds = new Set((data.achievements || []).map((a: any) => a.achievement_id));
      const allAchievementsList = data.allAchievements?.length > 0 ? data.allAchievements : ACHIEVEMENTS;
      
      const processedAchievements = allAchievementsList.map((a: any) => ({
        ...a,
        unlocked: unlockedIds.has(a.achievement_id),
        unlockedAt: data.achievements?.find((ua: any) => ua.achievement_id === a.achievement_id)?.unlocked_at
      }));
      
      setAchievements(processedAchievements);
      setAllAchievements(allAchievementsList);
    } catch {
      // Silently use default stats on any error - don't log or show errors
      // This is expected behavior when the database tables don't exist yet
      setDefaultData(userId, setStats, setHistory, setDrinkingStats, setAchievements, setAllAchievements);
    }
    
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchAllData();
    } else {
      setLoading(false);
    }
  }, [userId, fetchAllData]);


  const recordGame = useCallback(async (params: RecordGameParams) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase.functions.invoke('game-stats-tracker', {
        body: { 
          action: 'record_game', 
          user_id: userId,
          ...params 
        }
      });

      if (error) {
        // Silently fail - stats recording is optional
        return null;
      }

      // Refresh stats after recording
      await fetchAllData();

      return data;
    } catch {
      // Silently fail - stats recording is optional
      return null;
    }
  }, [userId, fetchAllData]);

  const getWinRate = () => {
    if (!stats || stats.total_games === 0) return 0;
    return Math.round((stats.wins / stats.total_games) * 100);
  };

  const getAvgScore = () => {
    if (!stats || stats.total_games === 0) return 0;
    return Math.round(stats.total_score / stats.total_games);
  };
  
  const getDrinkingWinRate = () => {
    if (!stats || stats.drinking_games_played === 0) return 0;
    return Math.round((stats.drinking_game_wins / stats.drinking_games_played) * 100);
  };

  const getAvgDrinksPerGame = () => {
    if (!stats || stats.drinking_games_played === 0) return 0;
    return Math.round((stats.total_drinks_taken / stats.drinking_games_played) * 10) / 10;
  };

  const getGameBreakdown = () => {
    if (!stats?.games_by_type || Object.keys(stats.games_by_type).length === 0) {
      // Fallback to history-based calculation
      const breakdown: Record<string, { played: number; wins: number; totalScore: number }> = {};
      history.forEach(g => {
        if (!breakdown[g.game_type]) breakdown[g.game_type] = { played: 0, wins: 0, totalScore: 0 };
        breakdown[g.game_type].played++;
        if (g.result === 'win') breakdown[g.game_type].wins++;
        breakdown[g.game_type].totalScore += g.score;
      });
      return Object.entries(breakdown).map(([game, data]) => ({ 
        game, 
        gameName: GAME_NAMES[game] || game,
        ...data 
      }));
    }

    return Object.entries(stats.games_by_type).map(([game, data]) => ({
      game,
      gameName: GAME_NAMES[game] || game,
      played: data.played,
      wins: data.wins,
      totalScore: data.total_score,
      drinkingPlayed: data.drinking_played || 0,
      totalDrinks: data.total_drinks || 0
    }));
  };

  const getMonthlyPerformance = () => {
    if (!stats?.monthly_stats || stats.monthly_stats.length === 0) return [];
    return stats.monthly_stats.map(m => ({
      month: m.month,
      games: m.games,
      wins: m.wins,
      winRate: m.games > 0 ? Math.round((m.wins / m.games) * 100) : 0,
      avgScore: m.games > 0 ? Math.round(m.total_score / m.games) : 0,
      drinkingGames: m.drinking_games,
      drinks: m.drinks
    }));
  };

  const getRecentPerformance = () => {
    if (!history || history.length === 0) return [];
    return history.slice(0, 10).map(g => ({ 
      date: g.played_at, 
      score: g.score, 
      result: g.result,
      game: g.game_type,
      drinkingMode: g.drinking_mode
    }));
  };

  const getAchievementProgress = () => {
    const total = achievements.length || 1;
    const unlocked = achievements.filter(a => a.unlocked).length;
    const totalPoints = achievements.reduce((sum, a) => sum + (a.unlocked ? a.points : 0), 0);
    const maxPoints = achievements.reduce((sum, a) => sum + a.points, 0);
    
    return {
      unlocked,
      total,
      percentage: total > 0 ? Math.round((unlocked / total) * 100) : 0,
      points: totalPoints,
      maxPoints
    };
  };

  const getAchievementsByCategory = () => {
    const categories: Record<string, Achievement[]> = {};
    achievements.forEach(a => {
      if (!categories[a.category]) categories[a.category] = [];
      categories[a.category].push(a);
    });
    return categories;
  };

  const getDrinkingGameBreakdown = () => {
    if (!drinkingStats || drinkingStats.length === 0) return [];
    return drinkingStats.map(ds => ({
      game: ds.game_type,
      gameName: GAME_NAMES[ds.game_type] || ds.game_type,
      totalGames: ds.total_games,
      totalDrinks: ds.total_drinks,
      avgDrinks: ds.avg_drinks_per_game,
      lightGames: ds.light_intensity_games,
      mediumGames: ds.medium_intensity_games,
      heavyGames: ds.heavy_intensity_games,
      maxDrinks: ds.most_drinks_single_game
    }));
  };

  return { 
    stats, 
    history, 
    achievements, 
    drinkingStats,
    loading, 
    error,
    getWinRate, 
    getAvgScore, 
    getDrinkingWinRate,
    getAvgDrinksPerGame,
    getGameBreakdown, 
    getMonthlyPerformance,
    getRecentPerformance, 
    getAchievementProgress,
    getAchievementsByCategory,
    getDrinkingGameBreakdown,
    recordGame,
    refetch: fetchAllData 
  };
};
