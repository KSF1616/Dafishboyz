import { useState, useEffect, useCallback } from 'react';
import { 
  MrDoodyStats, 
  UnlockedAchievement, 
  AchievementProgress,
  AchievementNotification 
} from '@/types/mrDoodyAchievements';
import { MR_DOODY_ACHIEVEMENTS, getAchievementById } from '@/data/mrDoodyAchievements';

const DEFAULT_STATS: MrDoodyStats = {
  totalHugs: 0,
  danceCount: 0,
  uniqueBodyPartsTapped: [],
  miniGameHighScore: 0,
  miniGameGamesPlayed: 0,
  totalMiniGameScore: 0,
  moodsExplored: [],
  consecutiveHugs: 0,
  maxConsecutiveHugs: 0,
  totalPlayTime: 0,
  charactersUnlocked: 1,
  perfectGames: 0,
  speedModeHighScore: 0,
  challengeModeHighScore: 0,
  streakRecord: 0,
  belliesTickled: 0,
  headsPatted: 0,
  feetTapped: 0,
  handshakes: 0,
  kissesSent: 0,
  noseBops: 0,
  eyeWinks: 0,
  dailyHugStreak: 0,
  maxDailyHugStreak: 0,
  lastHugDate: '',
  secretsFound: 0
};

const STORAGE_KEYS = {
  stats: 'mrDoodyStats',
  achievements: 'mrDoodyUnlockedAchievements'
};

export const useMrDoodyAchievements = () => {
  const [stats, setStats] = useState<MrDoodyStats>(DEFAULT_STATS);
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [newAchievements, setNewAchievements] = useState<AchievementNotification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load data from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem(STORAGE_KEYS.stats);
    const savedAchievements = localStorage.getItem(STORAGE_KEYS.achievements);
    
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats);
        setStats({ ...DEFAULT_STATS, ...parsed });
      } catch (e) {
        console.error('Failed to parse stats:', e);
      }
    }
    
    if (savedAchievements) {
      try {
        setUnlockedAchievements(JSON.parse(savedAchievements));
      } catch (e) {
        console.error('Failed to parse achievements:', e);
      }
    }

    // Also sync with existing localStorage values
    const existingHugs = parseInt(localStorage.getItem('mrDoodyInteractions') || '0');
    const existingHighScore = parseInt(localStorage.getItem('mrDoodyMiniGameHighScore') || '0');
    const unlockedChars = JSON.parse(localStorage.getItem('unlockedCharacters') || '["mr-doody"]');
    
    setStats(prev => ({
      ...prev,
      totalHugs: Math.max(prev.totalHugs, existingHugs),
      miniGameHighScore: Math.max(prev.miniGameHighScore, existingHighScore),
      charactersUnlocked: unlockedChars.length
    }));
    
    setIsLoaded(true);
  }, []);

  // Save stats to localStorage
  const saveStats = useCallback((newStats: MrDoodyStats) => {
    localStorage.setItem(STORAGE_KEYS.stats, JSON.stringify(newStats));
    // Also update legacy key for compatibility
    localStorage.setItem('mrDoodyInteractions', newStats.totalHugs.toString());
  }, []);

  // Save achievements to localStorage
  const saveAchievements = useCallback((achievements: UnlockedAchievement[]) => {
    localStorage.setItem(STORAGE_KEYS.achievements, JSON.stringify(achievements));
  }, []);

  // Check if an achievement should be unlocked
  const checkAchievement = useCallback((achievement: typeof MR_DOODY_ACHIEVEMENTS[0], currentStats: MrDoodyStats): boolean => {
    const { requirement } = achievement;
    const key = requirement.trackingKey as keyof MrDoodyStats;
    const value = currentStats[key];

    switch (requirement.type) {
      case 'count':
      case 'score':
      case 'streak':
        return typeof value === 'number' && value >= requirement.target;
      case 'unique':
        return Array.isArray(value) && value.length >= requirement.target;
      default:
        return false;
    }
  }, []);

  // Check all achievements and unlock new ones
  const checkAllAchievements = useCallback((currentStats: MrDoodyStats) => {
    const newlyUnlocked: AchievementNotification[] = [];
    
    MR_DOODY_ACHIEVEMENTS.forEach(achievement => {
      const isAlreadyUnlocked = unlockedAchievements.some(u => u.achievementId === achievement.id);
      
      if (!isAlreadyUnlocked && checkAchievement(achievement, currentStats)) {
        const unlocked: UnlockedAchievement = {
          achievementId: achievement.id,
          unlockedAt: new Date().toISOString(),
          progress: achievement.requirement.target
        };
        
        newlyUnlocked.push({
          achievement,
          unlockedAt: unlocked.unlockedAt,
          isNew: true
        });
        
        setUnlockedAchievements(prev => {
          const updated = [...prev, unlocked];
          saveAchievements(updated);
          return updated;
        });
      }
    });
    
    if (newlyUnlocked.length > 0) {
      setNewAchievements(prev => [...prev, ...newlyUnlocked]);
    }
  }, [unlockedAchievements, checkAchievement, saveAchievements]);

  // Update a specific stat
  const updateStat = useCallback((key: keyof MrDoodyStats, value: number | string | string[]) => {
    setStats(prev => {
      const newStats = { ...prev, [key]: value };
      saveStats(newStats);
      checkAllAchievements(newStats);
      return newStats;
    });
  }, [saveStats, checkAllAchievements]);

  // Increment a numeric stat
  const incrementStat = useCallback((key: keyof MrDoodyStats, amount: number = 1) => {
    setStats(prev => {
      const currentValue = prev[key];
      if (typeof currentValue !== 'number') return prev;
      
      const newStats = { ...prev, [key]: currentValue + amount };
      saveStats(newStats);
      checkAllAchievements(newStats);
      return newStats;
    });
  }, [saveStats, checkAllAchievements]);

  // Add to a unique array stat
  const addToUniqueStat = useCallback((key: keyof MrDoodyStats, value: string) => {
    setStats(prev => {
      const currentValue = prev[key];
      if (!Array.isArray(currentValue)) return prev;
      
      if (currentValue.includes(value)) return prev;
      
      const newStats = { ...prev, [key]: [...currentValue, value] };
      saveStats(newStats);
      checkAllAchievements(newStats);
      return newStats;
    });
  }, [saveStats, checkAllAchievements]);

  // Track a hug
  const trackHug = useCallback(() => {
    const now = new Date();
    const today = now.toDateString();
    
    setStats(prev => {
      const newStats = { ...prev };
      newStats.totalHugs += 1;
      newStats.consecutiveHugs += 1;
      newStats.maxConsecutiveHugs = Math.max(newStats.maxConsecutiveHugs, newStats.consecutiveHugs);
      
      // Track first hug date
      if (!newStats.firstHugDate) {
        newStats.firstHugDate = now.toISOString();
      }
      
      // Daily streak tracking
      if (newStats.lastHugDate !== today) {
        const lastDate = newStats.lastHugDate ? new Date(newStats.lastHugDate) : null;
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate && lastDate.toDateString() === yesterday.toDateString()) {
          newStats.dailyHugStreak += 1;
        } else if (!lastDate || lastDate.toDateString() !== today) {
          newStats.dailyHugStreak = 1;
        }
        
        newStats.maxDailyHugStreak = Math.max(newStats.maxDailyHugStreak, newStats.dailyHugStreak);
        newStats.lastHugDate = today;
      }
      
      // Check for secret achievements (time-based)
      const hour = now.getHours();
      if (hour >= 0 && hour < 4) {
        newStats.secretsFound = Math.max(newStats.secretsFound, 1);
      }
      if (hour >= 5 && hour < 6) {
        newStats.secretsFound = Math.max(newStats.secretsFound, 1);
      }
      
      saveStats(newStats);
      checkAllAchievements(newStats);
      return newStats;
    });
  }, [saveStats, checkAllAchievements]);

  // Track a dance
  const trackDance = useCallback(() => {
    incrementStat('danceCount');
  }, [incrementStat]);

  // Track body part tap
  const trackBodyPartTap = useCallback((part: string) => {
    addToUniqueStat('uniqueBodyPartsTapped', part);
    
    // Track specific body part stats
    switch (part) {
      case 'belly':
        incrementStat('belliesTickled');
        break;
      case 'head':
        incrementStat('headsPatted');
        break;
      case 'leftFoot':
      case 'rightFoot':
        incrementStat('feetTapped');
        break;
      case 'leftHand':
      case 'rightHand':
        incrementStat('handshakes');
        break;
      case 'mouth':
        incrementStat('kissesSent');
        break;
      case 'nose':
        incrementStat('noseBops');
        break;
      case 'leftEye':
      case 'rightEye':
        incrementStat('eyeWinks');
        break;
    }
  }, [addToUniqueStat, incrementStat]);

  // Track mood change
  const trackMoodChange = useCallback((mood: string) => {
    addToUniqueStat('moodsExplored', mood);
  }, [addToUniqueStat]);

  // Track mini game score
  const trackMiniGameScore = useCallback((score: number, mode: 'speed' | 'challenge') => {
    setStats(prev => {
      const newStats = { ...prev };
      newStats.miniGameGamesPlayed += 1;
      newStats.totalMiniGameScore += score;
      newStats.miniGameHighScore = Math.max(newStats.miniGameHighScore, score);
      
      if (mode === 'speed') {
        newStats.speedModeHighScore = Math.max(newStats.speedModeHighScore, score);
      } else {
        newStats.challengeModeHighScore = Math.max(newStats.challengeModeHighScore, score);
      }
      
      // Update legacy key
      localStorage.setItem('mrDoodyMiniGameHighScore', newStats.miniGameHighScore.toString());
      
      saveStats(newStats);
      checkAllAchievements(newStats);
      return newStats;
    });
  }, [saveStats, checkAllAchievements]);

  // Track mini game streak
  const trackStreak = useCallback((streak: number) => {
    setStats(prev => {
      if (streak <= prev.streakRecord) return prev;
      
      const newStats = { ...prev, streakRecord: streak };
      saveStats(newStats);
      checkAllAchievements(newStats);
      return newStats;
    });
  }, [saveStats, checkAllAchievements]);

  // Reset session consecutive hugs
  const resetSessionHugs = useCallback(() => {
    setStats(prev => ({
      ...prev,
      consecutiveHugs: 0
    }));
  }, []);

  // Clear a new achievement notification
  const clearNewAchievement = useCallback((achievementId: string) => {
    setNewAchievements(prev => prev.filter(n => n.achievement.id !== achievementId));
  }, []);

  // Clear all new achievement notifications
  const clearAllNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  // Get progress for a specific achievement
  const getAchievementProgress = useCallback((achievementId: string): AchievementProgress | null => {
    const achievement = getAchievementById(achievementId);
    if (!achievement) return null;
    
    const unlocked = unlockedAchievements.find(u => u.achievementId === achievementId);
    const key = achievement.requirement.trackingKey as keyof MrDoodyStats;
    const value = stats[key];
    
    let currentProgress = 0;
    if (typeof value === 'number') {
      currentProgress = value;
    } else if (Array.isArray(value)) {
      currentProgress = value.length;
    }
    
    return {
      achievementId,
      currentProgress,
      targetProgress: achievement.requirement.target,
      percentage: Math.min((currentProgress / achievement.requirement.target) * 100, 100),
      isUnlocked: !!unlocked,
      unlockedAt: unlocked?.unlockedAt
    };
  }, [stats, unlockedAchievements]);

  // Get all achievement progress
  const getAllAchievementProgress = useCallback((): AchievementProgress[] => {
    return MR_DOODY_ACHIEVEMENTS.map(a => getAchievementProgress(a.id)!).filter(Boolean);
  }, [getAchievementProgress]);

  // Get unlocked achievement count
  const getUnlockedCount = useCallback(() => {
    return unlockedAchievements.length;
  }, [unlockedAchievements]);

  // Get total achievement count
  const getTotalCount = useCallback(() => {
    return MR_DOODY_ACHIEVEMENTS.length;
  }, []);

  // Force check achievements (useful after loading)
  useEffect(() => {
    if (isLoaded) {
      checkAllAchievements(stats);
    }
  }, [isLoaded]);

  return {
    stats,
    unlockedAchievements,
    newAchievements,
    isLoaded,
    trackHug,
    trackDance,
    trackBodyPartTap,
    trackMoodChange,
    trackMiniGameScore,
    trackStreak,
    resetSessionHugs,
    updateStat,
    incrementStat,
    addToUniqueStat,
    getAchievementProgress,
    getAllAchievementProgress,
    getUnlockedCount,
    getTotalCount,
    clearNewAchievement,
    clearAllNewAchievements
  };
};

export default useMrDoodyAchievements;
