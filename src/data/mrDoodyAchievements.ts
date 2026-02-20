import { MrDoodyAchievement } from '@/types/mrDoodyAchievements';

export const MR_DOODY_ACHIEVEMENTS: MrDoodyAchievement[] = [
  // Hug Achievements
  {
    id: 'first-hug',
    name: 'First Hug',
    description: 'Give Mr. Doody your very first hug',
    category: 'hugs',
    rarity: 'bronze',
    icon: '🤗',
    requirement: {
      type: 'count',
      target: 1,
      trackingKey: 'totalHugs'
    }
  },
  {
    id: 'hug-beginner',
    name: 'Hug Beginner',
    description: 'Give 10 hugs to your pocket buddy',
    category: 'hugs',
    rarity: 'bronze',
    icon: '💚',
    requirement: {
      type: 'count',
      target: 10,
      trackingKey: 'totalHugs'
    }
  },
  {
    id: 'hug-enthusiast',
    name: 'Hug Enthusiast',
    description: 'Give 50 hugs to your pocket buddy',
    category: 'hugs',
    rarity: 'silver',
    icon: '💙',
    requirement: {
      type: 'count',
      target: 50,
      trackingKey: 'totalHugs'
    }
  },
  {
    id: 'hug-master',
    name: 'Hug Master',
    description: 'Give 100 hugs to your pocket buddy',
    category: 'hugs',
    rarity: 'gold',
    icon: '💜',
    requirement: {
      type: 'count',
      target: 100,
      trackingKey: 'totalHugs'
    }
  },
  {
    id: 'hug-champion',
    name: 'Hug Champion',
    description: 'Give 250 hugs to your pocket buddy',
    category: 'hugs',
    rarity: 'platinum',
    icon: '💛',
    requirement: {
      type: 'count',
      target: 250,
      trackingKey: 'totalHugs'
    }
  },
  {
    id: 'legendary-hugger',
    name: 'Legendary Hugger',
    description: 'Give 500 total hugs - you are a hugging legend!',
    category: 'hugs',
    rarity: 'diamond',
    icon: '👑',
    requirement: {
      type: 'count',
      target: 500,
      trackingKey: 'totalHugs'
    },
    reward: {
      type: 'title',
      value: 'Legendary Hugger',
      description: 'Unlock the "Legendary Hugger" title'
    }
  },
  
  // Dance Achievements
  {
    id: 'first-dance',
    name: 'First Dance',
    description: 'Make Mr. Doody dance for the first time',
    category: 'interactions',
    rarity: 'bronze',
    icon: '💃',
    requirement: {
      type: 'count',
      target: 1,
      trackingKey: 'danceCount'
    }
  },
  {
    id: 'dance-party',
    name: 'Dance Party',
    description: 'Trigger 10 dances - Mr. Doody loves to boogie!',
    category: 'interactions',
    rarity: 'silver',
    icon: '🕺',
    requirement: {
      type: 'count',
      target: 10,
      trackingKey: 'danceCount'
    }
  },
  {
    id: 'disco-fever',
    name: 'Disco Fever',
    description: 'Trigger 50 dances - the dance floor is yours!',
    category: 'interactions',
    rarity: 'gold',
    icon: '🪩',
    requirement: {
      type: 'count',
      target: 50,
      trackingKey: 'danceCount'
    }
  },
  {
    id: 'dance-legend',
    name: 'Dance Legend',
    description: 'Trigger 100 dances - you are a dance legend!',
    category: 'interactions',
    rarity: 'platinum',
    icon: '🌟',
    requirement: {
      type: 'count',
      target: 100,
      trackingKey: 'danceCount'
    }
  },
  
  // Exploration Achievements
  {
    id: 'body-part-explorer',
    name: 'Body Part Explorer',
    description: 'Tap all 10 of Mr. Doody\'s body parts',
    category: 'exploration',
    rarity: 'silver',
    icon: '🔍',
    requirement: {
      type: 'unique',
      target: 10,
      trackingKey: 'uniqueBodyPartsTapped'
    }
  },
  {
    id: 'mood-ring',
    name: 'Mood Ring',
    description: 'Try all 5 different moods',
    category: 'exploration',
    rarity: 'silver',
    icon: '🎭',
    requirement: {
      type: 'unique',
      target: 5,
      trackingKey: 'moodsExplored'
    }
  },
  {
    id: 'belly-tickler',
    name: 'Belly Tickler',
    description: 'Tickle Mr. Doody\'s belly 25 times',
    category: 'exploration',
    rarity: 'bronze',
    icon: '😂',
    requirement: {
      type: 'count',
      target: 25,
      trackingKey: 'belliesTickled'
    }
  },
  {
    id: 'head-patter',
    name: 'Head Patter',
    description: 'Pat Mr. Doody\'s head 25 times',
    category: 'exploration',
    rarity: 'bronze',
    icon: '✨',
    requirement: {
      type: 'count',
      target: 25,
      trackingKey: 'headsPatted'
    }
  },
  {
    id: 'happy-feet',
    name: 'Happy Feet',
    description: 'Tap Mr. Doody\'s feet 50 times',
    category: 'exploration',
    rarity: 'silver',
    icon: '🦶',
    requirement: {
      type: 'count',
      target: 50,
      trackingKey: 'feetTapped'
    }
  },
  {
    id: 'friendly-handshake',
    name: 'Friendly Handshake',
    description: 'Give 20 handshakes',
    category: 'exploration',
    rarity: 'bronze',
    icon: '🤝',
    requirement: {
      type: 'count',
      target: 20,
      trackingKey: 'handshakes'
    }
  },
  {
    id: 'kiss-collector',
    name: 'Kiss Collector',
    description: 'Send 30 kisses to Mr. Doody',
    category: 'exploration',
    rarity: 'silver',
    icon: '😘',
    requirement: {
      type: 'count',
      target: 30,
      trackingKey: 'kissesSent'
    }
  },
  {
    id: 'nose-bopper',
    name: 'Nose Bopper',
    description: 'Bop Mr. Doody\'s nose 20 times',
    category: 'exploration',
    rarity: 'bronze',
    icon: '👃',
    requirement: {
      type: 'count',
      target: 20,
      trackingKey: 'noseBops'
    }
  },
  {
    id: 'wink-master',
    name: 'Wink Master',
    description: 'Make Mr. Doody wink 40 times',
    category: 'exploration',
    rarity: 'silver',
    icon: '😉',
    requirement: {
      type: 'count',
      target: 40,
      trackingKey: 'eyeWinks'
    }
  },
  
  // Mini Game Achievements
  {
    id: 'mini-game-rookie',
    name: 'Mini Game Rookie',
    description: 'Play your first mini game',
    category: 'minigame',
    rarity: 'bronze',
    icon: '🎮',
    requirement: {
      type: 'count',
      target: 1,
      trackingKey: 'miniGameGamesPlayed'
    }
  },
  {
    id: 'mini-game-addict',
    name: 'Mini Game Addict',
    description: 'Play 25 mini games',
    category: 'minigame',
    rarity: 'silver',
    icon: '🕹️',
    requirement: {
      type: 'count',
      target: 25,
      trackingKey: 'miniGameGamesPlayed'
    }
  },
  {
    id: 'mini-game-master',
    name: 'Mini Game Master',
    description: 'Score 500+ points in a single game',
    category: 'minigame',
    rarity: 'gold',
    icon: '🏆',
    requirement: {
      type: 'score',
      target: 500,
      trackingKey: 'miniGameHighScore'
    }
  },
  {
    id: 'mini-game-legend',
    name: 'Mini Game Legend',
    description: 'Score 1000+ points in a single game',
    category: 'minigame',
    rarity: 'platinum',
    icon: '🌟',
    requirement: {
      type: 'score',
      target: 1000,
      trackingKey: 'miniGameHighScore'
    }
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Score 300+ points in Speed Mode',
    category: 'minigame',
    rarity: 'gold',
    icon: '⚡',
    requirement: {
      type: 'score',
      target: 300,
      trackingKey: 'speedModeHighScore'
    }
  },
  {
    id: 'challenge-champion',
    name: 'Challenge Champion',
    description: 'Score 400+ points in Challenge Mode',
    category: 'minigame',
    rarity: 'gold',
    icon: '🎯',
    requirement: {
      type: 'score',
      target: 400,
      trackingKey: 'challengeModeHighScore'
    }
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Achieve a 10-tap streak in mini game',
    category: 'minigame',
    rarity: 'silver',
    icon: '🔥',
    requirement: {
      type: 'streak',
      target: 10,
      trackingKey: 'streakRecord'
    }
  },
  {
    id: 'streak-legend',
    name: 'Streak Legend',
    description: 'Achieve a 25-tap streak in mini game',
    category: 'minigame',
    rarity: 'platinum',
    icon: '💥',
    requirement: {
      type: 'streak',
      target: 25,
      trackingKey: 'streakRecord'
    }
  },
  {
    id: 'point-collector',
    name: 'Point Collector',
    description: 'Accumulate 5000 total points across all games',
    category: 'minigame',
    rarity: 'gold',
    icon: '💰',
    requirement: {
      type: 'count',
      target: 5000,
      trackingKey: 'totalMiniGameScore'
    }
  },
  
  // Social/Special Achievements
  {
    id: 'daily-hugger',
    name: 'Daily Hugger',
    description: 'Hug Mr. Doody for 7 days in a row',
    category: 'social',
    rarity: 'silver',
    icon: '📅',
    requirement: {
      type: 'streak',
      target: 7,
      trackingKey: 'dailyHugStreak'
    }
  },
  {
    id: 'dedicated-friend',
    name: 'Dedicated Friend',
    description: 'Hug Mr. Doody for 30 days in a row',
    category: 'social',
    rarity: 'gold',
    icon: '🗓️',
    requirement: {
      type: 'streak',
      target: 30,
      trackingKey: 'dailyHugStreak'
    }
  },
  {
    id: 'best-friend-forever',
    name: 'Best Friend Forever',
    description: 'Hug Mr. Doody for 100 days in a row',
    category: 'social',
    rarity: 'diamond',
    icon: '💎',
    requirement: {
      type: 'streak',
      target: 100,
      trackingKey: 'dailyHugStreak'
    },
    reward: {
      type: 'title',
      value: 'Best Friend Forever',
      description: 'Unlock the "BFF" title'
    }
  },
  {
    id: 'character-collector',
    name: 'Character Collector',
    description: 'Unlock 3 different pocket hug characters',
    category: 'special',
    rarity: 'silver',
    icon: '🎪',
    requirement: {
      type: 'count',
      target: 3,
      trackingKey: 'charactersUnlocked'
    }
  },
  {
    id: 'collector-extraordinaire',
    name: 'Collector Extraordinaire',
    description: 'Unlock all 8 pocket hug characters',
    category: 'special',
    rarity: 'diamond',
    icon: '👑',
    requirement: {
      type: 'count',
      target: 8,
      trackingKey: 'charactersUnlocked'
    },
    reward: {
      type: 'title',
      value: 'Collector Extraordinaire',
      description: 'Unlock the ultimate collector title'
    }
  },
  
  // Secret Achievements
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Hug Mr. Doody between midnight and 4am',
    category: 'special',
    rarity: 'gold',
    icon: '🦉',
    requirement: {
      type: 'count',
      target: 1,
      trackingKey: 'secretsFound'
    },
    secret: true
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Hug Mr. Doody between 5am and 6am',
    category: 'special',
    rarity: 'gold',
    icon: '🐦',
    requirement: {
      type: 'count',
      target: 1,
      trackingKey: 'secretsFound'
    },
    secret: true
  },
  {
    id: 'hug-marathon',
    name: 'Hug Marathon',
    description: 'Give 50 hugs in a single session',
    category: 'special',
    rarity: 'platinum',
    icon: '🏃',
    requirement: {
      type: 'count',
      target: 50,
      trackingKey: 'consecutiveHugs'
    },
    secret: true
  }
];

export const getAchievementById = (id: string): MrDoodyAchievement | undefined => {
  return MR_DOODY_ACHIEVEMENTS.find(a => a.id === id);
};

export const getAchievementsByCategory = (category: string): MrDoodyAchievement[] => {
  return MR_DOODY_ACHIEVEMENTS.filter(a => a.category === category);
};

export const getAchievementsByRarity = (rarity: string): MrDoodyAchievement[] => {
  return MR_DOODY_ACHIEVEMENTS.filter(a => a.rarity === rarity);
};

export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'bronze': return 'text-amber-700';
    case 'silver': return 'text-gray-400';
    case 'gold': return 'text-yellow-500';
    case 'platinum': return 'text-cyan-400';
    case 'diamond': return 'text-purple-400';
    default: return 'text-gray-500';
  }
};

export const getRarityBgColor = (rarity: string): string => {
  switch (rarity) {
    case 'bronze': return 'bg-amber-700/20';
    case 'silver': return 'bg-gray-400/20';
    case 'gold': return 'bg-yellow-500/20';
    case 'platinum': return 'bg-cyan-400/20';
    case 'diamond': return 'bg-purple-400/20';
    default: return 'bg-gray-500/20';
  }
};

export const getRarityBorderColor = (rarity: string): string => {
  switch (rarity) {
    case 'bronze': return 'border-amber-700';
    case 'silver': return 'border-gray-400';
    case 'gold': return 'border-yellow-500';
    case 'platinum': return 'border-cyan-400';
    case 'diamond': return 'border-purple-400';
    default: return 'border-gray-500';
  }
};

export const getRarityGradient = (rarity: string): string => {
  switch (rarity) {
    case 'bronze': return 'from-amber-600 to-amber-800';
    case 'silver': return 'from-gray-300 to-gray-500';
    case 'gold': return 'from-yellow-400 to-amber-500';
    case 'platinum': return 'from-cyan-300 to-blue-500';
    case 'diamond': return 'from-purple-400 to-pink-500';
    default: return 'from-gray-400 to-gray-600';
  }
};

export const CATEGORY_INFO: Record<string, { label: string; icon: string; color: string }> = {
  hugs: { label: 'Hugs', icon: '🤗', color: 'text-pink-500' },
  interactions: { label: 'Interactions', icon: '👆', color: 'text-blue-500' },
  exploration: { label: 'Exploration', icon: '🔍', color: 'text-green-500' },
  minigame: { label: 'Mini Game', icon: '🎮', color: 'text-purple-500' },
  social: { label: 'Social', icon: '👥', color: 'text-orange-500' },
  special: { label: 'Special', icon: '⭐', color: 'text-yellow-500' }
};
