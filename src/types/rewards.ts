export type RewardCategory = 'accessory' | 'sound' | 'dance' | 'theme';
export type RewardRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type AccessorySlot = 'head' | 'face' | 'neck' | 'body' | 'hand';

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: RewardCategory;
  rarity: RewardRarity;
  icon: string;
  previewImage?: string;
  // For accessories
  slot?: AccessorySlot;
  color?: string;
  // For sounds
  soundType?: 'hug' | 'giggle' | 'dance' | 'special';
  // For dances
  danceStyle?: string;
  // For themes
  themeColors?: ThemeColors;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
  background: string;
}

export interface AchievementRewardLink {
  achievementId: string;
  rewardId: string;
}

export interface PlayerInventory {
  unlockedRewards: string[];
  equippedItems: EquippedItems;
  favoriteItems: string[];
  rewardUnlockDates: Record<string, string>;
}

export interface EquippedItems {
  headAccessory?: string;
  faceAccessory?: string;
  neckAccessory?: string;
  bodyAccessory?: string;
  handAccessory?: string;
  activeSound?: string;
  activeDance?: string;
  activeTheme?: string;
}

export interface RewardNotification {
  reward: Reward;
  unlockedAt: string;
  fromAchievement: string;
}

// Accessory rendering data
export interface AccessoryRenderData {
  id: string;
  slot: AccessorySlot;
  svgPath: string;
  transform?: string;
  color: string;
  zIndex: number;
}

// Dance animation data
export interface DanceAnimation {
  id: string;
  name: string;
  frames: DanceFrame[];
  duration: number;
  loop: boolean;
}

export interface DanceFrame {
  bodyRotation: number;
  bodyTranslateY: number;
  leftArmRotation: number;
  rightArmRotation: number;
  leftLegRotation: number;
  rightLegRotation: number;
}

// Sound effect data
export interface SoundEffect {
  id: string;
  name: string;
  type: 'hug' | 'giggle' | 'dance' | 'special';
  frequency: number;
  waveType: OscillatorType;
  duration: number;
  modulation?: {
    type: 'frequency' | 'amplitude';
    rate: number;
    depth: number;
  };
}
