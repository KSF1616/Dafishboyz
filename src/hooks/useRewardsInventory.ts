import { useState, useEffect, useCallback } from 'react';
import { 
  PlayerInventory, 
  EquippedItems, 
  Reward, 
  RewardNotification,
  AccessorySlot 
} from '@/types/rewards';
import { 
  REWARDS, 
  ACHIEVEMENT_REWARDS, 
  getRewardById,
  getRewardsForAchievement 
} from '@/data/rewardsData';

const STORAGE_KEY = 'mrDoodyInventory';

const defaultInventory: PlayerInventory = {
  unlockedRewards: [],
  equippedItems: {},
  favoriteItems: [],
  rewardUnlockDates: {}
};

export const useRewardsInventory = () => {
  const [inventory, setInventory] = useState<PlayerInventory>(defaultInventory);
  const [newRewards, setNewRewards] = useState<RewardNotification[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Internal sync function that doesn't depend on state
  const syncWithAchievementsInternal = useCallback(() => {
    const savedAchievements = localStorage.getItem('mrDoodyUnlockedAchievements');
    if (!savedAchievements) return;

    try {
      const unlocked = JSON.parse(savedAchievements);
      const achievementIds = unlocked.map((a: any) => a.achievementId);
      
      setInventory(prev => {
        const newlyUnlocked: RewardNotification[] = [];
        
        achievementIds.forEach((achievementId: string) => {
          const rewards = getRewardsForAchievement(achievementId);
          rewards.forEach(reward => {
            if (!prev.unlockedRewards.includes(reward.id)) {
              newlyUnlocked.push({
                reward,
                unlockedAt: new Date().toISOString(),
                fromAchievement: achievementId
              });
            }
          });
        });

        if (newlyUnlocked.length > 0) {
          setNewRewards(prevRewards => [...prevRewards, ...newlyUnlocked]);
          return {
            ...prev,
            unlockedRewards: [
              ...prev.unlockedRewards,
              ...newlyUnlocked.map(n => n.reward.id)
            ],
            rewardUnlockDates: {
              ...prev.rewardUnlockDates,
              ...Object.fromEntries(newlyUnlocked.map(n => [n.reward.id, n.unlockedAt]))
            }
          };
        }
        return prev;
      });
    } catch (e) {
      console.error('Failed to sync achievements:', e);
    }
  }, []);

  // Load inventory from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setInventory({
          ...defaultInventory,
          ...parsed
        });
      } catch (e) {
        console.error('Failed to parse inventory:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Sync with achievements on load
  useEffect(() => {
    if (isLoaded) {
      syncWithAchievementsInternal();
    }
  }, [isLoaded, syncWithAchievementsInternal]);

  // Save inventory to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    }
  }, [inventory, isLoaded]);

  // Check for new rewards based on unlocked achievements
  const checkForNewRewards = useCallback((unlockedAchievementIds: string[]) => {
    const newlyUnlocked: RewardNotification[] = [];
    
    unlockedAchievementIds.forEach(achievementId => {
      const rewards = getRewardsForAchievement(achievementId);
      rewards.forEach(reward => {
        if (!inventory.unlockedRewards.includes(reward.id)) {
          newlyUnlocked.push({
            reward,
            unlockedAt: new Date().toISOString(),
            fromAchievement: achievementId
          });
        }
      });
    });

    if (newlyUnlocked.length > 0) {
      setNewRewards(prev => [...prev, ...newlyUnlocked]);
      setInventory(prev => ({
        ...prev,
        unlockedRewards: [
          ...prev.unlockedRewards,
          ...newlyUnlocked.map(n => n.reward.id)
        ],
        rewardUnlockDates: {
          ...prev.rewardUnlockDates,
          ...Object.fromEntries(newlyUnlocked.map(n => [n.reward.id, n.unlockedAt]))
        }
      }));
    }

    return newlyUnlocked;
  }, [inventory.unlockedRewards]);

  // Unlock a specific reward
  const unlockReward = useCallback((rewardId: string, achievementId?: string) => {
    if (inventory.unlockedRewards.includes(rewardId)) return false;

    const reward = getRewardById(rewardId);
    if (!reward) return false;

    const notification: RewardNotification = {
      reward,
      unlockedAt: new Date().toISOString(),
      fromAchievement: achievementId || 'manual'
    };

    setNewRewards(prev => [...prev, notification]);
    setInventory(prev => ({
      ...prev,
      unlockedRewards: [...prev.unlockedRewards, rewardId],
      rewardUnlockDates: {
        ...prev.rewardUnlockDates,
        [rewardId]: notification.unlockedAt
      }
    }));

    return true;
  }, [inventory.unlockedRewards]);

  // Equip an item
  const equipItem = useCallback((rewardId: string) => {
    const reward = getRewardById(rewardId);
    if (!reward || !inventory.unlockedRewards.includes(rewardId)) return false;

    setInventory(prev => {
      const newEquipped = { ...prev.equippedItems };

      switch (reward.category) {
        case 'accessory':
          if (reward.slot) {
            const slotKey = `${reward.slot}Accessory` as keyof EquippedItems;
            newEquipped[slotKey] = rewardId;
          }
          break;
        case 'sound':
          newEquipped.activeSound = rewardId;
          break;
        case 'dance':
          newEquipped.activeDance = rewardId;
          break;
        case 'theme':
          newEquipped.activeTheme = rewardId;
          break;
      }

      return { ...prev, equippedItems: newEquipped };
    });

    return true;
  }, [inventory.unlockedRewards]);

  // Unequip an item
  const unequipItem = useCallback((category: string, slot?: AccessorySlot) => {
    setInventory(prev => {
      const newEquipped = { ...prev.equippedItems };

      switch (category) {
        case 'accessory':
          if (slot) {
            const slotKey = `${slot}Accessory` as keyof EquippedItems;
            delete newEquipped[slotKey];
          }
          break;
        case 'sound':
          delete newEquipped.activeSound;
          break;
        case 'dance':
          delete newEquipped.activeDance;
          break;
        case 'theme':
          delete newEquipped.activeTheme;
          break;
      }

      return { ...prev, equippedItems: newEquipped };
    });
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((rewardId: string) => {
    setInventory(prev => {
      const isFavorite = prev.favoriteItems.includes(rewardId);
      return {
        ...prev,
        favoriteItems: isFavorite
          ? prev.favoriteItems.filter(id => id !== rewardId)
          : [...prev.favoriteItems, rewardId]
      };
    });
  }, []);

  // Check if item is equipped
  const isEquipped = useCallback((rewardId: string): boolean => {
    const equipped = inventory.equippedItems;
    return Object.values(equipped).includes(rewardId);
  }, [inventory.equippedItems]);

  // Check if item is unlocked
  const isUnlocked = useCallback((rewardId: string): boolean => {
    return inventory.unlockedRewards.includes(rewardId);
  }, [inventory.unlockedRewards]);

  // Check if item is favorite
  const isFavorite = useCallback((rewardId: string): boolean => {
    return inventory.favoriteItems.includes(rewardId);
  }, [inventory.favoriteItems]);

  // Get all unlocked rewards
  const getUnlockedRewards = useCallback((): Reward[] => {
    return inventory.unlockedRewards
      .map(id => getRewardById(id))
      .filter(Boolean) as Reward[];
  }, [inventory.unlockedRewards]);

  // Get equipped items as Reward objects
  const getEquippedRewards = useCallback((): Record<string, Reward | undefined> => {
    const result: Record<string, Reward | undefined> = {};
    const equipped = inventory.equippedItems;

    if (equipped.headAccessory) result.head = getRewardById(equipped.headAccessory);
    if (equipped.faceAccessory) result.face = getRewardById(equipped.faceAccessory);
    if (equipped.neckAccessory) result.neck = getRewardById(equipped.neckAccessory);
    if (equipped.bodyAccessory) result.body = getRewardById(equipped.bodyAccessory);
    if (equipped.handAccessory) result.hand = getRewardById(equipped.handAccessory);
    if (equipped.activeSound) result.sound = getRewardById(equipped.activeSound);
    if (equipped.activeDance) result.dance = getRewardById(equipped.activeDance);
    if (equipped.activeTheme) result.theme = getRewardById(equipped.activeTheme);

    return result;
  }, [inventory.equippedItems]);

  // Get unlock date for a reward
  const getUnlockDate = useCallback((rewardId: string): string | undefined => {
    return inventory.rewardUnlockDates[rewardId];
  }, [inventory.rewardUnlockDates]);

  // Clear new reward notifications
  const clearNewReward = useCallback((rewardId: string) => {
    setNewRewards(prev => prev.filter(n => n.reward.id !== rewardId));
  }, []);

  const clearAllNewRewards = useCallback(() => {
    setNewRewards([]);
  }, []);

  // Get stats
  const getStats = useCallback(() => {
    const unlocked = inventory.unlockedRewards.length;
    const total = REWARDS.length;
    const equipped = Object.values(inventory.equippedItems).filter(Boolean).length;
    const favorites = inventory.favoriteItems.length;

    const byCategory = {
      accessory: inventory.unlockedRewards.filter(id => {
        const r = getRewardById(id);
        return r?.category === 'accessory';
      }).length,
      sound: inventory.unlockedRewards.filter(id => {
        const r = getRewardById(id);
        return r?.category === 'sound';
      }).length,
      dance: inventory.unlockedRewards.filter(id => {
        const r = getRewardById(id);
        return r?.category === 'dance';
      }).length,
      theme: inventory.unlockedRewards.filter(id => {
        const r = getRewardById(id);
        return r?.category === 'theme';
      }).length,
    };

    return { unlocked, total, equipped, favorites, byCategory };
  }, [inventory]);

  // Sync with achievements (public method)
  const syncWithAchievements = useCallback(() => {
    syncWithAchievementsInternal();
  }, [syncWithAchievementsInternal]);

  return {
    inventory,
    newRewards,
    isLoaded,
    // Actions
    checkForNewRewards,
    unlockReward,
    equipItem,
    unequipItem,
    toggleFavorite,
    syncWithAchievements,
    // Queries
    isEquipped,
    isUnlocked,
    isFavorite,
    getUnlockedRewards,
    getEquippedRewards,
    getUnlockDate,
    getStats,
    // Notifications
    clearNewReward,
    clearAllNewRewards
  };
};

export default useRewardsInventory;
