import { Reward, AchievementRewardLink, DanceAnimation, SoundEffect } from '@/types/rewards';

// All available rewards
export const REWARDS: Reward[] = [
  // ===== ACCESSORIES - HEAD =====
  {
    id: 'party-hat',
    name: 'Party Hat',
    description: 'A festive party hat for celebrations!',
    category: 'accessory',
    rarity: 'common',
    icon: '🎉',
    slot: 'head',
    color: '#FF6B6B'
  },
  {
    id: 'golden-crown',
    name: 'Golden Crown',
    description: 'A majestic golden crown fit for royalty',
    category: 'accessory',
    rarity: 'legendary',
    icon: '👑',
    slot: 'head',
    color: '#FFD700'
  },
  {
    id: 'wizard-hat',
    name: 'Wizard Hat',
    description: 'A mystical wizard hat with stars',
    category: 'accessory',
    rarity: 'epic',
    icon: '🧙',
    slot: 'head',
    color: '#4B0082'
  },
  {
    id: 'flower-crown',
    name: 'Flower Crown',
    description: 'A beautiful crown made of flowers',
    category: 'accessory',
    rarity: 'rare',
    icon: '🌸',
    slot: 'head',
    color: '#FFB6C1'
  },
  {
    id: 'halo',
    name: 'Angel Halo',
    description: 'A glowing golden halo',
    category: 'accessory',
    rarity: 'epic',
    icon: '😇',
    slot: 'head',
    color: '#FFD700'
  },
  {
    id: 'top-hat',
    name: 'Top Hat',
    description: 'A distinguished top hat',
    category: 'accessory',
    rarity: 'uncommon',
    icon: '🎩',
    slot: 'head',
    color: '#1a1a1a'
  },
  {
    id: 'santa-hat',
    name: 'Santa Hat',
    description: 'Ho ho ho! A festive Santa hat',
    category: 'accessory',
    rarity: 'rare',
    icon: '🎅',
    slot: 'head',
    color: '#DC143C'
  },
  {
    id: 'chef-hat',
    name: 'Chef Hat',
    description: 'A professional chef\'s toque',
    category: 'accessory',
    rarity: 'uncommon',
    icon: '👨‍🍳',
    slot: 'head',
    color: '#FFFFFF'
  },

  // ===== ACCESSORIES - FACE =====
  {
    id: 'cool-sunglasses',
    name: 'Cool Sunglasses',
    description: 'Super cool aviator sunglasses',
    category: 'accessory',
    rarity: 'common',
    icon: '😎',
    slot: 'face',
    color: '#1a1a1a'
  },
  {
    id: 'heart-glasses',
    name: 'Heart Glasses',
    description: 'Adorable heart-shaped glasses',
    category: 'accessory',
    rarity: 'rare',
    icon: '💕',
    slot: 'face',
    color: '#FF69B4'
  },
  {
    id: 'star-glasses',
    name: 'Star Glasses',
    description: 'Fabulous star-shaped glasses',
    category: 'accessory',
    rarity: 'epic',
    icon: '⭐',
    slot: 'face',
    color: '#FFD700'
  },
  {
    id: 'monocle-fancy',
    name: 'Fancy Monocle',
    description: 'A distinguished monocle with chain',
    category: 'accessory',
    rarity: 'rare',
    icon: '🧐',
    slot: 'face',
    color: '#C0C0C0'
  },
  {
    id: 'rainbow-glasses',
    name: 'Rainbow Glasses',
    description: 'Colorful rainbow-tinted glasses',
    category: 'accessory',
    rarity: 'legendary',
    icon: '🌈',
    slot: 'face',
    color: '#FF0000'
  },

  // ===== ACCESSORIES - NECK =====
  {
    id: 'red-bowtie',
    name: 'Red Bowtie',
    description: 'A classic red bowtie',
    category: 'accessory',
    rarity: 'common',
    icon: '🎀',
    slot: 'neck',
    color: '#DC143C'
  },
  {
    id: 'gold-chain',
    name: 'Gold Chain',
    description: 'A shiny gold chain necklace',
    category: 'accessory',
    rarity: 'rare',
    icon: '⛓️',
    slot: 'neck',
    color: '#FFD700'
  },
  {
    id: 'pearl-necklace',
    name: 'Pearl Necklace',
    description: 'An elegant pearl necklace',
    category: 'accessory',
    rarity: 'epic',
    icon: '📿',
    slot: 'neck',
    color: '#FFFAF0'
  },
  {
    id: 'rainbow-scarf',
    name: 'Rainbow Scarf',
    description: 'A colorful flowing rainbow scarf',
    category: 'accessory',
    rarity: 'legendary',
    icon: '🧣',
    slot: 'neck',
    color: '#FF6B6B'
  },

  // ===== ACCESSORIES - BODY =====
  {
    id: 'superhero-cape',
    name: 'Superhero Cape',
    description: 'A flowing red superhero cape',
    category: 'accessory',
    rarity: 'epic',
    icon: '🦸',
    slot: 'body',
    color: '#DC143C'
  },
  {
    id: 'royal-robe',
    name: 'Royal Robe',
    description: 'A luxurious purple royal robe',
    category: 'accessory',
    rarity: 'legendary',
    icon: '👘',
    slot: 'body',
    color: '#4B0082'
  },
  {
    id: 'sparkle-vest',
    name: 'Sparkle Vest',
    description: 'A glittery disco vest',
    category: 'accessory',
    rarity: 'rare',
    icon: '✨',
    slot: 'body',
    color: '#C0C0C0'
  },
  {
    id: 'angel-wings',
    name: 'Angel Wings',
    description: 'Beautiful white angel wings',
    category: 'accessory',
    rarity: 'legendary',
    icon: '👼',
    slot: 'body',
    color: '#FFFFFF'
  },

  // ===== ACCESSORIES - HAND =====
  {
    id: 'magic-wand',
    name: 'Magic Wand',
    description: 'A sparkly magic wand',
    category: 'accessory',
    rarity: 'rare',
    icon: '🪄',
    slot: 'hand',
    color: '#9370DB'
  },
  {
    id: 'trophy',
    name: 'Golden Trophy',
    description: 'A shiny golden trophy',
    category: 'accessory',
    rarity: 'epic',
    icon: '🏆',
    slot: 'hand',
    color: '#FFD700'
  },
  {
    id: 'heart-balloon',
    name: 'Heart Balloon',
    description: 'A cute heart-shaped balloon',
    category: 'accessory',
    rarity: 'uncommon',
    icon: '🎈',
    slot: 'hand',
    color: '#FF69B4'
  },
  {
    id: 'teddy-bear',
    name: 'Teddy Bear',
    description: 'An adorable teddy bear friend',
    category: 'accessory',
    rarity: 'rare',
    icon: '🧸',
    slot: 'hand',
    color: '#D2691E'
  },

  // ===== SOUND EFFECTS =====
  {
    id: 'squeaky-hug',
    name: 'Squeaky Hug',
    description: 'A cute squeaky sound when hugging',
    category: 'sound',
    rarity: 'common',
    icon: '🔊',
    soundType: 'hug'
  },
  {
    id: 'musical-hug',
    name: 'Musical Hug',
    description: 'A melodic tune when hugging',
    category: 'sound',
    rarity: 'rare',
    icon: '🎵',
    soundType: 'hug'
  },
  {
    id: 'sparkle-sound',
    name: 'Sparkle Sound',
    description: 'Magical sparkle sounds',
    category: 'sound',
    rarity: 'epic',
    icon: '✨',
    soundType: 'special'
  },
  {
    id: 'giggle-burst',
    name: 'Giggle Burst',
    description: 'An infectious giggling sound',
    category: 'sound',
    rarity: 'uncommon',
    icon: '😂',
    soundType: 'giggle'
  },
  {
    id: 'disco-beat',
    name: 'Disco Beat',
    description: 'Funky disco beats when dancing',
    category: 'sound',
    rarity: 'rare',
    icon: '🕺',
    soundType: 'dance'
  },
  {
    id: 'orchestra-fanfare',
    name: 'Orchestra Fanfare',
    description: 'A grand orchestral fanfare',
    category: 'sound',
    rarity: 'legendary',
    icon: '🎺',
    soundType: 'special'
  },
  {
    id: 'retro-bleep',
    name: 'Retro Bleep',
    description: '8-bit retro game sounds',
    category: 'sound',
    rarity: 'uncommon',
    icon: '🎮',
    soundType: 'giggle'
  },
  {
    id: 'nature-chime',
    name: 'Nature Chime',
    description: 'Peaceful wind chime sounds',
    category: 'sound',
    rarity: 'rare',
    icon: '🍃',
    soundType: 'hug'
  },

  // ===== DANCE MOVES =====
  {
    id: 'basic-bounce',
    name: 'Basic Bounce',
    description: 'A simple bouncy dance',
    category: 'dance',
    rarity: 'common',
    icon: '💃',
    danceStyle: 'bounce'
  },
  {
    id: 'disco-fever',
    name: 'Disco Fever',
    description: 'Classic disco dance moves',
    category: 'dance',
    rarity: 'rare',
    icon: '🪩',
    danceStyle: 'disco'
  },
  {
    id: 'robot-dance',
    name: 'Robot Dance',
    description: 'Mechanical robot movements',
    category: 'dance',
    rarity: 'uncommon',
    icon: '🤖',
    danceStyle: 'robot'
  },
  {
    id: 'happy-spin',
    name: 'Happy Spin',
    description: 'Joyful spinning dance',
    category: 'dance',
    rarity: 'rare',
    icon: '🌀',
    danceStyle: 'spin'
  },
  {
    id: 'breakdance',
    name: 'Breakdance',
    description: 'Cool breakdancing moves',
    category: 'dance',
    rarity: 'epic',
    icon: '🔥',
    danceStyle: 'breakdance'
  },
  {
    id: 'ballet-twirl',
    name: 'Ballet Twirl',
    description: 'Elegant ballet movements',
    category: 'dance',
    rarity: 'epic',
    icon: '🩰',
    danceStyle: 'ballet'
  },
  {
    id: 'moonwalk',
    name: 'Moonwalk',
    description: 'The legendary moonwalk',
    category: 'dance',
    rarity: 'legendary',
    icon: '🌙',
    danceStyle: 'moonwalk'
  },
  {
    id: 'victory-dance',
    name: 'Victory Dance',
    description: 'Celebratory victory dance',
    category: 'dance',
    rarity: 'legendary',
    icon: '🏆',
    danceStyle: 'victory'
  },

  // ===== COLOR THEMES =====
  {
    id: 'theme-sunset',
    name: 'Sunset Theme',
    description: 'Warm sunset colors',
    category: 'theme',
    rarity: 'uncommon',
    icon: '🌅',
    themeColors: {
      primary: '#FF6B6B',
      secondary: '#FFE66D',
      accent: '#4ECDC4',
      highlight: '#FF8E72',
      background: '#2C1810'
    }
  },
  {
    id: 'theme-ocean',
    name: 'Ocean Theme',
    description: 'Cool ocean blues',
    category: 'theme',
    rarity: 'uncommon',
    icon: '🌊',
    themeColors: {
      primary: '#0077B6',
      secondary: '#00B4D8',
      accent: '#90E0EF',
      highlight: '#CAF0F8',
      background: '#03045E'
    }
  },
  {
    id: 'theme-forest',
    name: 'Forest Theme',
    description: 'Natural forest greens',
    category: 'theme',
    rarity: 'rare',
    icon: '🌲',
    themeColors: {
      primary: '#2D6A4F',
      secondary: '#40916C',
      accent: '#74C69D',
      highlight: '#B7E4C7',
      background: '#1B4332'
    }
  },
  {
    id: 'theme-galaxy',
    name: 'Galaxy Theme',
    description: 'Cosmic space colors',
    category: 'theme',
    rarity: 'epic',
    icon: '🌌',
    themeColors: {
      primary: '#7B2CBF',
      secondary: '#9D4EDD',
      accent: '#C77DFF',
      highlight: '#E0AAFF',
      background: '#10002B'
    }
  },
  {
    id: 'theme-candy',
    name: 'Candy Theme',
    description: 'Sweet candy colors',
    category: 'theme',
    rarity: 'rare',
    icon: '🍬',
    themeColors: {
      primary: '#FF69B4',
      secondary: '#FFB6C1',
      accent: '#87CEEB',
      highlight: '#98FB98',
      background: '#FFF0F5'
    }
  },
  {
    id: 'theme-golden',
    name: 'Golden Theme',
    description: 'Luxurious gold colors',
    category: 'theme',
    rarity: 'legendary',
    icon: '💛',
    themeColors: {
      primary: '#FFD700',
      secondary: '#FFA500',
      accent: '#DAA520',
      highlight: '#FFFACD',
      background: '#2C2416'
    }
  },
  {
    id: 'theme-rainbow',
    name: 'Rainbow Theme',
    description: 'All the colors of the rainbow!',
    category: 'theme',
    rarity: 'legendary',
    icon: '🌈',
    themeColors: {
      primary: '#FF0000',
      secondary: '#FF7F00',
      accent: '#00FF00',
      highlight: '#0000FF',
      background: '#1a1a2e'
    }
  }
];

// Link achievements to rewards
export const ACHIEVEMENT_REWARDS: AchievementRewardLink[] = [
  // Hug achievements
  { achievementId: 'first-hug', rewardId: 'party-hat' },
  { achievementId: 'hug-beginner', rewardId: 'cool-sunglasses' },
  { achievementId: 'hug-enthusiast', rewardId: 'red-bowtie' },
  { achievementId: 'hug-master', rewardId: 'superhero-cape' },
  { achievementId: 'hug-champion', rewardId: 'golden-crown' },
  { achievementId: 'legendary-hugger', rewardId: 'royal-robe' },
  
  // Dance achievements
  { achievementId: 'first-dance', rewardId: 'basic-bounce' },
  { achievementId: 'dance-party', rewardId: 'disco-fever' },
  { achievementId: 'disco-fever', rewardId: 'disco-beat' },
  { achievementId: 'dance-legend', rewardId: 'moonwalk' },
  
  // Exploration achievements
  { achievementId: 'body-part-explorer', rewardId: 'magic-wand' },
  { achievementId: 'mood-ring', rewardId: 'heart-glasses' },
  { achievementId: 'belly-tickler', rewardId: 'giggle-burst' },
  { achievementId: 'head-patter', rewardId: 'flower-crown' },
  { achievementId: 'happy-feet', rewardId: 'happy-spin' },
  { achievementId: 'friendly-handshake', rewardId: 'gold-chain' },
  { achievementId: 'kiss-collector', rewardId: 'heart-balloon' },
  { achievementId: 'nose-bopper', rewardId: 'squeaky-hug' },
  { achievementId: 'wink-master', rewardId: 'star-glasses' },
  
  // Mini game achievements
  { achievementId: 'mini-game-rookie', rewardId: 'retro-bleep' },
  { achievementId: 'mini-game-addict', rewardId: 'robot-dance' },
  { achievementId: 'mini-game-master', rewardId: 'trophy' },
  { achievementId: 'mini-game-legend', rewardId: 'victory-dance' },
  { achievementId: 'speed-demon', rewardId: 'breakdance' },
  { achievementId: 'challenge-champion', rewardId: 'sparkle-sound' },
  { achievementId: 'streak-master', rewardId: 'theme-sunset' },
  { achievementId: 'streak-legend', rewardId: 'theme-galaxy' },
  { achievementId: 'point-collector', rewardId: 'sparkle-vest' },
  
  // Social achievements
  { achievementId: 'daily-hugger', rewardId: 'musical-hug' },
  { achievementId: 'dedicated-friend', rewardId: 'pearl-necklace' },
  { achievementId: 'best-friend-forever', rewardId: 'angel-wings' },
  
  // Special achievements
  { achievementId: 'character-collector', rewardId: 'theme-forest' },
  { achievementId: 'collector-extraordinaire', rewardId: 'theme-rainbow' },
  { achievementId: 'night-owl', rewardId: 'theme-ocean' },
  { achievementId: 'early-bird', rewardId: 'nature-chime' },
  { achievementId: 'hug-marathon', rewardId: 'orchestra-fanfare' },
  
  // Additional rewards
  { achievementId: 'hug-enthusiast', rewardId: 'teddy-bear' },
  { achievementId: 'dance-party', rewardId: 'top-hat' },
  { achievementId: 'mini-game-master', rewardId: 'wizard-hat' },
  { achievementId: 'dedicated-friend', rewardId: 'halo' },
  { achievementId: 'legendary-hugger', rewardId: 'rainbow-glasses' },
  { achievementId: 'collector-extraordinaire', rewardId: 'rainbow-scarf' },
  { achievementId: 'best-friend-forever', rewardId: 'theme-golden' },
  { achievementId: 'dance-legend', rewardId: 'ballet-twirl' },
  { achievementId: 'streak-legend', rewardId: 'monocle-fancy' },
  { achievementId: 'point-collector', rewardId: 'theme-candy' },
  { achievementId: 'hug-champion', rewardId: 'chef-hat' },
  { achievementId: 'hug-marathon', rewardId: 'santa-hat' },
];

// Dance animation definitions
export const DANCE_ANIMATIONS: Record<string, DanceAnimation> = {
  'basic-bounce': {
    id: 'basic-bounce',
    name: 'Basic Bounce',
    frames: [
      { bodyRotation: 0, bodyTranslateY: 0, leftArmRotation: 0, rightArmRotation: 0, leftLegRotation: 0, rightLegRotation: 0 },
      { bodyRotation: 0, bodyTranslateY: -8, leftArmRotation: -15, rightArmRotation: 15, leftLegRotation: 5, rightLegRotation: -5 },
      { bodyRotation: 0, bodyTranslateY: 0, leftArmRotation: 0, rightArmRotation: 0, leftLegRotation: 0, rightLegRotation: 0 },
      { bodyRotation: 0, bodyTranslateY: -5, leftArmRotation: 15, rightArmRotation: -15, leftLegRotation: -5, rightLegRotation: 5 },
    ],
    duration: 600,
    loop: true
  },
  'disco': {
    id: 'disco',
    name: 'Disco Fever',
    frames: [
      { bodyRotation: -5, bodyTranslateY: 0, leftArmRotation: -45, rightArmRotation: 45, leftLegRotation: 10, rightLegRotation: -10 },
      { bodyRotation: 5, bodyTranslateY: -5, leftArmRotation: 45, rightArmRotation: -45, leftLegRotation: -10, rightLegRotation: 10 },
      { bodyRotation: -5, bodyTranslateY: 0, leftArmRotation: -30, rightArmRotation: 60, leftLegRotation: 15, rightLegRotation: -15 },
      { bodyRotation: 5, bodyTranslateY: -5, leftArmRotation: 60, rightArmRotation: -30, leftLegRotation: -15, rightLegRotation: 15 },
    ],
    duration: 400,
    loop: true
  },
  'robot': {
    id: 'robot',
    name: 'Robot Dance',
    frames: [
      { bodyRotation: 0, bodyTranslateY: 0, leftArmRotation: -90, rightArmRotation: 0, leftLegRotation: 0, rightLegRotation: 0 },
      { bodyRotation: 0, bodyTranslateY: 0, leftArmRotation: 0, rightArmRotation: -90, leftLegRotation: 0, rightLegRotation: 0 },
      { bodyRotation: 0, bodyTranslateY: 0, leftArmRotation: 0, rightArmRotation: 0, leftLegRotation: -20, rightLegRotation: 0 },
      { bodyRotation: 0, bodyTranslateY: 0, leftArmRotation: 0, rightArmRotation: 0, leftLegRotation: 0, rightLegRotation: -20 },
    ],
    duration: 800,
    loop: true
  },
  'spin': {
    id: 'spin',
    name: 'Happy Spin',
    frames: [
      { bodyRotation: 0, bodyTranslateY: -3, leftArmRotation: 30, rightArmRotation: 30, leftLegRotation: 0, rightLegRotation: 0 },
      { bodyRotation: 90, bodyTranslateY: -5, leftArmRotation: 45, rightArmRotation: 45, leftLegRotation: 5, rightLegRotation: 5 },
      { bodyRotation: 180, bodyTranslateY: -3, leftArmRotation: 30, rightArmRotation: 30, leftLegRotation: 0, rightLegRotation: 0 },
      { bodyRotation: 270, bodyTranslateY: -5, leftArmRotation: 45, rightArmRotation: 45, leftLegRotation: 5, rightLegRotation: 5 },
    ],
    duration: 500,
    loop: true
  },
  'breakdance': {
    id: 'breakdance',
    name: 'Breakdance',
    frames: [
      { bodyRotation: -15, bodyTranslateY: 0, leftArmRotation: -60, rightArmRotation: 60, leftLegRotation: 30, rightLegRotation: -30 },
      { bodyRotation: 0, bodyTranslateY: -10, leftArmRotation: 90, rightArmRotation: -90, leftLegRotation: 0, rightLegRotation: 0 },
      { bodyRotation: 15, bodyTranslateY: 0, leftArmRotation: 60, rightArmRotation: -60, leftLegRotation: -30, rightLegRotation: 30 },
      { bodyRotation: 0, bodyTranslateY: -10, leftArmRotation: -90, rightArmRotation: 90, leftLegRotation: 0, rightLegRotation: 0 },
    ],
    duration: 350,
    loop: true
  },
  'ballet': {
    id: 'ballet',
    name: 'Ballet Twirl',
    frames: [
      { bodyRotation: 0, bodyTranslateY: 0, leftArmRotation: -120, rightArmRotation: 120, leftLegRotation: 0, rightLegRotation: 30 },
      { bodyRotation: 45, bodyTranslateY: -8, leftArmRotation: -90, rightArmRotation: 90, leftLegRotation: 0, rightLegRotation: 45 },
      { bodyRotation: 90, bodyTranslateY: -5, leftArmRotation: -120, rightArmRotation: 120, leftLegRotation: 0, rightLegRotation: 30 },
      { bodyRotation: 135, bodyTranslateY: -8, leftArmRotation: -90, rightArmRotation: 90, leftLegRotation: 0, rightLegRotation: 45 },
    ],
    duration: 600,
    loop: true
  },
  'moonwalk': {
    id: 'moonwalk',
    name: 'Moonwalk',
    frames: [
      { bodyRotation: 5, bodyTranslateY: 0, leftArmRotation: 20, rightArmRotation: -20, leftLegRotation: -15, rightLegRotation: 15 },
      { bodyRotation: 5, bodyTranslateY: -2, leftArmRotation: -20, rightArmRotation: 20, leftLegRotation: 15, rightLegRotation: -15 },
      { bodyRotation: 5, bodyTranslateY: 0, leftArmRotation: 20, rightArmRotation: -20, leftLegRotation: -15, rightLegRotation: 15 },
      { bodyRotation: 5, bodyTranslateY: -2, leftArmRotation: -20, rightArmRotation: 20, leftLegRotation: 15, rightLegRotation: -15 },
    ],
    duration: 500,
    loop: true
  },
  'victory': {
    id: 'victory',
    name: 'Victory Dance',
    frames: [
      { bodyRotation: -10, bodyTranslateY: 0, leftArmRotation: -150, rightArmRotation: 150, leftLegRotation: 20, rightLegRotation: -20 },
      { bodyRotation: 10, bodyTranslateY: -12, leftArmRotation: -120, rightArmRotation: 120, leftLegRotation: -20, rightLegRotation: 20 },
      { bodyRotation: -10, bodyTranslateY: 0, leftArmRotation: -150, rightArmRotation: 150, leftLegRotation: 20, rightLegRotation: -20 },
      { bodyRotation: 10, bodyTranslateY: -12, leftArmRotation: -120, rightArmRotation: 120, leftLegRotation: -20, rightLegRotation: 20 },
    ],
    duration: 400,
    loop: true
  }
};

// Sound effect definitions
export const SOUND_EFFECTS: Record<string, SoundEffect> = {
  'squeaky-hug': {
    id: 'squeaky-hug',
    name: 'Squeaky Hug',
    type: 'hug',
    frequency: 800,
    waveType: 'sine',
    duration: 0.3,
    modulation: { type: 'frequency', rate: 20, depth: 100 }
  },
  'musical-hug': {
    id: 'musical-hug',
    name: 'Musical Hug',
    type: 'hug',
    frequency: 440,
    waveType: 'sine',
    duration: 0.5,
    modulation: { type: 'frequency', rate: 5, depth: 50 }
  },
  'sparkle-sound': {
    id: 'sparkle-sound',
    name: 'Sparkle Sound',
    type: 'special',
    frequency: 1200,
    waveType: 'sine',
    duration: 0.4,
    modulation: { type: 'amplitude', rate: 30, depth: 0.5 }
  },
  'giggle-burst': {
    id: 'giggle-burst',
    name: 'Giggle Burst',
    type: 'giggle',
    frequency: 600,
    waveType: 'sine',
    duration: 0.25,
    modulation: { type: 'frequency', rate: 15, depth: 150 }
  },
  'disco-beat': {
    id: 'disco-beat',
    name: 'Disco Beat',
    type: 'dance',
    frequency: 150,
    waveType: 'square',
    duration: 0.2
  },
  'orchestra-fanfare': {
    id: 'orchestra-fanfare',
    name: 'Orchestra Fanfare',
    type: 'special',
    frequency: 523,
    waveType: 'sawtooth',
    duration: 0.8,
    modulation: { type: 'frequency', rate: 3, depth: 30 }
  },
  'retro-bleep': {
    id: 'retro-bleep',
    name: 'Retro Bleep',
    type: 'giggle',
    frequency: 440,
    waveType: 'square',
    duration: 0.15
  },
  'nature-chime': {
    id: 'nature-chime',
    name: 'Nature Chime',
    type: 'hug',
    frequency: 880,
    waveType: 'sine',
    duration: 0.6,
    modulation: { type: 'amplitude', rate: 8, depth: 0.3 }
  }
};

// Helper functions
export const getRewardById = (id: string): Reward | undefined => {
  return REWARDS.find(r => r.id === id);
};

export const getRewardsByCategory = (category: string): Reward[] => {
  return REWARDS.filter(r => r.category === category);
};

export const getRewardsByRarity = (rarity: string): Reward[] => {
  return REWARDS.filter(r => r.rarity === rarity);
};

export const getRewardsForAchievement = (achievementId: string): Reward[] => {
  const links = ACHIEVEMENT_REWARDS.filter(ar => ar.achievementId === achievementId);
  return links.map(link => getRewardById(link.rewardId)).filter(Boolean) as Reward[];
};

export const getRewardRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'text-gray-500';
    case 'uncommon': return 'text-green-500';
    case 'rare': return 'text-blue-500';
    case 'epic': return 'text-purple-500';
    case 'legendary': return 'text-yellow-500';
    default: return 'text-gray-500';
  }
};

export const getRewardRarityBgColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'bg-gray-500/20';
    case 'uncommon': return 'bg-green-500/20';
    case 'rare': return 'bg-blue-500/20';
    case 'epic': return 'bg-purple-500/20';
    case 'legendary': return 'bg-yellow-500/20';
    default: return 'bg-gray-500/20';
  }
};

export const getRewardRarityBorderColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'border-gray-400';
    case 'uncommon': return 'border-green-400';
    case 'rare': return 'border-blue-400';
    case 'epic': return 'border-purple-400';
    case 'legendary': return 'border-yellow-400';
    default: return 'border-gray-400';
  }
};

export const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'accessory': return '👒';
    case 'sound': return '🔊';
    case 'dance': return '💃';
    case 'theme': return '🎨';
    default: return '🎁';
  }
};

export const getSlotIcon = (slot: string): string => {
  switch (slot) {
    case 'head': return '🎩';
    case 'face': return '👓';
    case 'neck': return '📿';
    case 'body': return '👔';
    case 'hand': return '✋';
    default: return '🎁';
  }
};
