export type CharacterMood = 'happy' | 'sleepy' | 'excited' | 'surprised' | 'love' | 'angry' | 'proud';

export interface CharacterColors {
  primary: string;
  secondary: string;
  accent: string;
  highlight: string;
}

export interface CharacterAccessory {
  type: 'crown' | 'tiara' | 'hat' | 'eyepatch' | 'monocle' | 'bowtie' | 'cape' | 'sword' | 'wand' | 'hook';
  color: string;
}

export interface CollectibleCharacter {
  id: string;
  name: string;
  title: string;
  description: string;
  personality: string;
  colors: CharacterColors;
  accessories: CharacterAccessory[];
  unlockRequirement: UnlockRequirement;
  uniqueSounds: string[];
  catchphrase: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UnlockRequirement {
  type: 'games_won' | 'games_played' | 'emotional_release' | 'tournament_wins' | 'hugs_given' | 'letgo_wins' | 'purchase' | 'accuracy' | 'streak';
  count: number;
  description: string;
}

export interface PlayerCollectibles {
  unlockedCharacters: string[];
  selectedCharacter: string;
  characterStats: Record<string, CharacterStats>;
  achievements: Achievement[];
}

export interface CharacterStats {
  hugsGiven: number;
  timesSelected: number;
  unlockedAt: string;
  favoriteCount: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
  reward?: string; // Character ID that gets unlocked
}

export interface CharacterReaction {
  trigger: string;
  animation: string;
  sound: string;
  emoji: string;
}
