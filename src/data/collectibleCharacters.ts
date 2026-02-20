import { CollectibleCharacter, Achievement } from '@/types/collectibles';

export const COLLECTIBLE_CHARACTERS: CollectibleCharacter[] = [
  {
    id: 'mr-doody',
    name: 'Mr. Doody',
    title: 'The Original Pocket Hug',
    description: 'Your first pocket hug buddy! Mr. Doody is here to help you let that shit go.',
    personality: 'Friendly, warm, and always ready for a hug. The OG pocket companion.',
    colors: {
      primary: '#8B4513',
      secondary: '#A0522D',
      accent: '#654321',
      highlight: '#D2691E'
    },
    accessories: [],
    unlockRequirement: {
      type: 'purchase',
      count: 1,
      description: 'Purchase any physical game'
    },
    uniqueSounds: ['hug', 'giggle', 'squeak'],
    catchphrase: 'Let that shit go!',
    rarity: 'common'
  },
  {
    id: 'sir-flush',
    name: 'Sir Flush',
    title: 'Knight of the Porcelain Throne',
    description: 'A noble knight who has conquered many battles. His armor shines with victories!',
    personality: 'Brave, honorable, and always ready to defend your honor. Speaks in old English.',
    colors: {
      primary: '#4169E1',
      secondary: '#6495ED',
      accent: '#1E3A8A',
      highlight: '#87CEEB'
    },
    accessories: [
      { type: 'crown', color: '#FFD700' },
      { type: 'sword', color: '#C0C0C0' }
    ],
    unlockRequirement: {
      type: 'games_won',
      count: 10,
      description: 'Win 10 games in any mode'
    },
    uniqueSounds: ['fanfare', 'clang', 'noble'],
    catchphrase: 'For honor and hygiene!',
    rarity: 'rare'
  },
  {
    id: 'princess-plop',
    name: 'Princess Plop',
    title: 'Royal Releaser of Emotions',
    description: 'A graceful princess who helps you release your emotional burdens with elegance.',
    personality: 'Elegant, compassionate, and wise. She understands the importance of letting go.',
    colors: {
      primary: '#FF69B4',
      secondary: '#FFB6C1',
      accent: '#DB7093',
      highlight: '#FFC0CB'
    },
    accessories: [
      { type: 'tiara', color: '#E5E4E2' },
      { type: 'wand', color: '#FFD700' }
    ],
    unlockRequirement: {
      type: 'emotional_release',
      count: 5,
      description: 'Complete Emotional Release mode 5 times'
    },
    uniqueSounds: ['sparkle', 'chime', 'gentle'],
    catchphrase: 'Release with grace, darling!',
    rarity: 'rare'
  },
  {
    id: 'captain-clog',
    name: 'Captain Clog',
    title: 'Pirate of the Seven Sewers',
    description: 'A fearless pirate captain who has sailed through the roughest waters. Tournament champion!',
    personality: 'Adventurous, bold, and a bit mischievous. Loves treasure and victory!',
    colors: {
      primary: '#2F4F4F',
      secondary: '#708090',
      accent: '#1C1C1C',
      highlight: '#CD853F'
    },
    accessories: [
      { type: 'hat', color: '#1C1C1C' },
      { type: 'eyepatch', color: '#000000' },
      { type: 'hook', color: '#C0C0C0' }
    ],
    unlockRequirement: {
      type: 'tournament_wins',
      count: 1,
      description: 'Win a tournament'
    },
    uniqueSounds: ['arrr', 'splash', 'coins'],
    catchphrase: 'Arrr, flush yer troubles away!',
    rarity: 'epic'
  },
  {
    id: 'duke-dookie',
    name: 'Duke Dookie',
    title: 'The Distinguished Gentleman',
    description: 'A refined aristocrat with impeccable taste. He brings class to every game.',
    personality: 'Sophisticated, witty, and slightly pompous. Enjoys tea and board games.',
    colors: {
      primary: '#4B0082',
      secondary: '#6A5ACD',
      accent: '#2E0854',
      highlight: '#9370DB'
    },
    accessories: [
      { type: 'monocle', color: '#FFD700' },
      { type: 'bowtie', color: '#8B0000' }
    ],
    unlockRequirement: {
      type: 'games_played',
      count: 25,
      description: 'Play 25 games total'
    },
    uniqueSounds: ['posh', 'sip', 'hmm'],
    catchphrase: 'Quite splendid, indeed!',
    rarity: 'rare'
  },
  {
    id: 'lady-loo',
    name: 'Lady Loo',
    title: 'Mistress of Hugs',
    description: 'The most loving character in the collection. She gives the warmest hugs!',
    personality: 'Nurturing, loving, and incredibly supportive. A true hugger at heart.',
    colors: {
      primary: '#DC143C',
      secondary: '#FF6B6B',
      accent: '#8B0000',
      highlight: '#FFB3BA'
    },
    accessories: [
      { type: 'tiara', color: '#FF69B4' },
      { type: 'cape', color: '#DC143C' }
    ],
    unlockRequirement: {
      type: 'hugs_given',
      count: 100,
      description: 'Give 100 hugs to your pocket buddies'
    },
    uniqueSounds: ['love', 'heart', 'aww'],
    catchphrase: 'Hugs make everything better!',
    rarity: 'epic'
  },
  {
    id: 'baron-bog',
    name: 'Baron Bog',
    title: 'The Mysterious Shadow',
    description: 'A mysterious figure who emerges from the shadows. Master of the LETGO game.',
    personality: 'Mysterious, wise, and slightly spooky. Speaks in riddles.',
    colors: {
      primary: '#1C1C1C',
      secondary: '#2F2F2F',
      accent: '#0D0D0D',
      highlight: '#4A4A4A'
    },
    accessories: [
      { type: 'cape', color: '#4B0082' },
      { type: 'monocle', color: '#FF0000' }
    ],
    unlockRequirement: {
      type: 'letgo_wins',
      count: 5,
      description: 'Win 5 LETGO multiplayer games'
    },
    uniqueSounds: ['spooky', 'whoosh', 'mystery'],
    catchphrase: 'From darkness, find release...',
    rarity: 'epic'
  },
  {
    id: 'queen-commode',
    name: 'Queen Commode',
    title: 'Ruler of the Realm',
    description: 'The legendary queen who rules over all pocket hugs. Only the most dedicated can unlock her!',
    personality: 'Regal, powerful, and benevolent. She rewards true dedication.',
    colors: {
      primary: '#FFD700',
      secondary: '#FFA500',
      accent: '#B8860B',
      highlight: '#FFFACD'
    },
    accessories: [
      { type: 'crown', color: '#FFD700' },
      { type: 'cape', color: '#4B0082' },
      { type: 'wand', color: '#FFD700' }
    ],
    unlockRequirement: {
      type: 'accuracy',
      count: 75,
      description: 'Achieve 75% accuracy over 50+ shots'
    },
    uniqueSounds: ['royal', 'trumpet', 'majestic'],
    catchphrase: 'Long live the flush!',
    rarity: 'legendary'
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-win',
    name: 'First Victory',
    description: 'Win your first game',
    icon: '🏆',
    progress: 0,
    target: 1
  },
  {
    id: 'game-master',
    name: 'Game Master',
    description: 'Win 10 games',
    icon: '👑',
    progress: 0,
    target: 10,
    reward: 'sir-flush'
  },
  {
    id: 'emotional-healer',
    name: 'Emotional Healer',
    description: 'Complete Emotional Release mode 5 times',
    icon: '💝',
    progress: 0,
    target: 5,
    reward: 'princess-plop'
  },
  {
    id: 'tournament-champion',
    name: 'Tournament Champion',
    description: 'Win a tournament',
    icon: '🏅',
    progress: 0,
    target: 1,
    reward: 'captain-clog'
  },
  {
    id: 'dedicated-player',
    name: 'Dedicated Player',
    description: 'Play 25 games',
    icon: '🎮',
    progress: 0,
    target: 25,
    reward: 'duke-dookie'
  },
  {
    id: 'hug-master',
    name: 'Hug Master',
    description: 'Give 100 hugs',
    icon: '🤗',
    progress: 0,
    target: 100,
    reward: 'lady-loo'
  },
  {
    id: 'letgo-champion',
    name: 'LETGO Champion',
    description: 'Win 5 LETGO multiplayer games',
    icon: '🎯',
    progress: 0,
    target: 5,
    reward: 'baron-bog'
  },
  {
    id: 'sharpshooter',
    name: 'Sharpshooter',
    description: 'Achieve 75% accuracy over 50+ shots',
    icon: '🎯',
    progress: 0,
    target: 75,
    reward: 'queen-commode'
  },
  {
    id: 'collector',
    name: 'Collector',
    description: 'Unlock all characters',
    icon: '✨',
    progress: 0,
    target: 8
  }
];

export const getCharacterById = (id: string): CollectibleCharacter | undefined => {
  return COLLECTIBLE_CHARACTERS.find(c => c.id === id);
};

export const getRarityColor = (rarity: CollectibleCharacter['rarity']): string => {
  switch (rarity) {
    case 'common': return 'text-gray-500';
    case 'rare': return 'text-blue-500';
    case 'epic': return 'text-purple-500';
    case 'legendary': return 'text-yellow-500';
    default: return 'text-gray-500';
  }
};

export const getRarityBgColor = (rarity: CollectibleCharacter['rarity']): string => {
  switch (rarity) {
    case 'common': return 'bg-gray-500/20';
    case 'rare': return 'bg-blue-500/20';
    case 'epic': return 'bg-purple-500/20';
    case 'legendary': return 'bg-yellow-500/20';
    default: return 'bg-gray-500/20';
  }
};

export const getRarityBorderColor = (rarity: CollectibleCharacter['rarity']): string => {
  switch (rarity) {
    case 'common': return 'border-gray-400';
    case 'rare': return 'border-blue-400';
    case 'epic': return 'border-purple-400';
    case 'legendary': return 'border-yellow-400';
    default: return 'border-gray-400';
  }
};
