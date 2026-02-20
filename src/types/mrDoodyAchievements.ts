export type AchievementCategory = 'hugs' | 'interactions' | 'exploration' | 'minigame' | 'social' | 'special';
export type AchievementRarity = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface MrDoodyAchievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  icon: string;
  requirement: AchievementRequirement;
  reward?: AchievementReward;
  secret?: boolean;
}

export interface AchievementRequirement {
  type: 'count' | 'unique' | 'streak' | 'score' | 'time' | 'combo';
  target: number;
  trackingKey: string;
}

export interface AchievementReward {
  type: 'title' | 'badge' | 'character' | 'accessory' | 'sound';
  value: string;
  description: string;
}

export interface UnlockedAchievement {
  achievementId: string;
  unlockedAt: string;
  progress: number;
}

export interface AchievementProgress {
  achievementId: string;
  currentProgress: number;
  targetProgress: number;
  percentage: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface MrDoodyStats {
  totalHugs: number;
  danceCount: number;
  uniqueBodyPartsTapped: string[];
  miniGameHighScore: number;
  miniGameGamesPlayed: number;
  totalMiniGameScore: number;
  moodsExplored: string[];
  consecutiveHugs: number;
  maxConsecutiveHugs: number;
  totalPlayTime: number;
  charactersUnlocked: number;
  perfectGames: number;
  speedModeHighScore: number;
  challengeModeHighScore: number;
  streakRecord: number;
  belliesTickled: number;
  headsPatted: number;
  feetTapped: number;
  handshakes: number;
  kissesSent: number;
  noseBops: number;
  eyeWinks: number;
  dailyHugStreak: number;
  maxDailyHugStreak: number;
  lastHugDate: string;
  firstHugDate?: string;
  secretsFound: number;
}

export interface AchievementNotification {
  achievement: MrDoodyAchievement;
  unlockedAt: string;
  isNew: boolean;
}
