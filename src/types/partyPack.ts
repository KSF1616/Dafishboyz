// Party Pack Types for Drop A Deuce

export interface PartyPackTheme {
  id: string;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface InvitationTemplate {
  id: string;
  name: string;
  theme: PartyPackTheme;
  fields: {
    childName: string;
    partyDate: string;
    partyTime: string;
    location: string;
    rsvpPhone: string;
    rsvpEmail: string;
    specialInstructions: string;
  };
}

export interface ScorecardPlayer {
  name: string;
  rounds: number[];
  total: number;
}

export interface Scorecard {
  id: string;
  theme: PartyPackTheme;
  gameMode: 'dropChase' | 'hotPoo' | 'both';
  maxRounds: number;
  maxPlayers: number;
}

export interface NameTag {
  id: string;
  theme: PartyPackTheme;
  playerName: string;
  character: 'poop' | 'toilet' | 'plunger' | 'star';
}

export interface PartyDecoration {
  id: string;
  type: 'banner' | 'sign' | 'cupcakeTopper' | 'doorSign' | 'tableCard';
  name: string;
  theme: PartyPackTheme;
}

export interface ChallengeCard {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'action' | 'silly' | 'creative' | 'team';
  theme: PartyPackTheme;
}

// Predefined themes
export const partyPackThemes: PartyPackTheme[] = [
  {
    id: 'rainbow-blast',
    name: 'Rainbow Blast',
    primaryColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    accentColor: '#f59e0b',
    backgroundColor: '#fdf2f8',
    textColor: '#1f2937',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-purple-500'
  },
  {
    id: 'ocean-party',
    name: 'Ocean Party',
    primaryColor: '#06b6d4',
    secondaryColor: '#3b82f6',
    accentColor: '#10b981',
    backgroundColor: '#ecfeff',
    textColor: '#1f2937',
    gradientFrom: 'from-cyan-500',
    gradientTo: 'to-blue-500'
  },
  {
    id: 'sunshine-fun',
    name: 'Sunshine Fun',
    primaryColor: '#f59e0b',
    secondaryColor: '#ef4444',
    accentColor: '#84cc16',
    backgroundColor: '#fffbeb',
    textColor: '#1f2937',
    gradientFrom: 'from-amber-500',
    gradientTo: 'to-orange-500'
  },
  {
    id: 'jungle-adventure',
    name: 'Jungle Adventure',
    primaryColor: '#22c55e',
    secondaryColor: '#84cc16',
    accentColor: '#a855f7',
    backgroundColor: '#f0fdf4',
    textColor: '#1f2937',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-lime-500'
  },
  {
    id: 'galaxy-glow',
    name: 'Galaxy Glow',
    primaryColor: '#a855f7',
    secondaryColor: '#6366f1',
    accentColor: '#ec4899',
    backgroundColor: '#faf5ff',
    textColor: '#1f2937',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-indigo-500'
  }
];

// Predefined challenge cards
export const challengeCards: Omit<ChallengeCard, 'theme'>[] = [
  // Easy - Action
  { id: 'c1', title: 'Silly Walk', description: 'Walk around the circle like a penguin!', difficulty: 'easy', category: 'action' },
  { id: 'c2', title: 'Jump Around', description: 'Do 5 jumping jacks as fast as you can!', difficulty: 'easy', category: 'action' },
  { id: 'c3', title: 'Spin Time', description: 'Spin around 3 times without falling!', difficulty: 'easy', category: 'action' },
  { id: 'c4', title: 'Hop On One Foot', description: 'Hop around the circle on one foot!', difficulty: 'easy', category: 'action' },
  
  // Easy - Silly
  { id: 'c5', title: 'Funny Face', description: 'Make the funniest face you can for 10 seconds!', difficulty: 'easy', category: 'silly' },
  { id: 'c6', title: 'Animal Sounds', description: 'Make 3 different animal sounds!', difficulty: 'easy', category: 'silly' },
  { id: 'c7', title: 'Robot Talk', description: 'Talk like a robot for the next round!', difficulty: 'easy', category: 'silly' },
  { id: 'c8', title: 'Freeze Dance', description: 'Strike a silly pose and freeze for 10 seconds!', difficulty: 'easy', category: 'silly' },
  
  // Medium - Action
  { id: 'c9', title: 'Crab Walk', description: 'Crab walk around the entire circle!', difficulty: 'medium', category: 'action' },
  { id: 'c10', title: 'Balance Act', description: 'Balance on one foot for 15 seconds!', difficulty: 'medium', category: 'action' },
  { id: 'c11', title: 'Backward Walk', description: 'Walk backward around the circle with eyes closed!', difficulty: 'medium', category: 'action' },
  { id: 'c12', title: 'Bunny Hops', description: 'Bunny hop around the circle twice!', difficulty: 'medium', category: 'action' },
  
  // Medium - Silly
  { id: 'c13', title: 'Sing a Song', description: 'Sing "Happy Birthday" in a silly voice!', difficulty: 'medium', category: 'silly' },
  { id: 'c14', title: 'Monster Impression', description: 'Do your best monster impression!', difficulty: 'medium', category: 'silly' },
  { id: 'c15', title: 'Slow Motion', description: 'Move in slow motion for 20 seconds!', difficulty: 'medium', category: 'silly' },
  { id: 'c16', title: 'Superhero Pose', description: 'Strike 3 different superhero poses!', difficulty: 'medium', category: 'silly' },
  
  // Medium - Creative
  { id: 'c17', title: 'Story Time', description: 'Make up a 30-second story about a flying poop!', difficulty: 'medium', category: 'creative' },
  { id: 'c18', title: 'Dance Move', description: 'Create a new dance move and name it!', difficulty: 'medium', category: 'creative' },
  { id: 'c19', title: 'Rhyme Time', description: 'Make up a rhyme using the word "poop"!', difficulty: 'medium', category: 'creative' },
  { id: 'c20', title: 'Compliment King', description: 'Give everyone in the circle a unique compliment!', difficulty: 'medium', category: 'creative' },
  
  // Hard - Action
  { id: 'c21', title: 'Wheelbarrow', description: 'Find a partner and wheelbarrow walk around the circle!', difficulty: 'hard', category: 'action' },
  { id: 'c22', title: 'Leap Frog', description: 'Leap frog over 3 seated players!', difficulty: 'hard', category: 'action' },
  { id: 'c23', title: 'Bear Crawl', description: 'Bear crawl around the circle twice!', difficulty: 'hard', category: 'action' },
  
  // Hard - Silly
  { id: 'c24', title: 'Opera Singer', description: 'Sing your name in opera style!', difficulty: 'hard', category: 'silly' },
  { id: 'c25', title: 'Tongue Twister', description: 'Say "She sells seashells" 5 times fast!', difficulty: 'hard', category: 'silly' },
  { id: 'c26', title: 'Backward Talk', description: 'Say your name backward 3 times!', difficulty: 'hard', category: 'silly' },
  
  // Team Challenges
  { id: 'c27', title: 'Group Wave', description: 'Lead everyone in doing "the wave"!', difficulty: 'easy', category: 'team' },
  { id: 'c28', title: 'Mirror Mirror', description: 'Pick a partner and mirror their moves for 20 seconds!', difficulty: 'medium', category: 'team' },
  { id: 'c29', title: 'Conga Line', description: 'Start a conga line around the room!', difficulty: 'medium', category: 'team' },
  { id: 'c30', title: 'Group Cheer', description: 'Lead everyone in a "Drop A Deuce" cheer!', difficulty: 'easy', category: 'team' }
];

// Helper function to get difficulty color
export const getDifficultyColor = (difficulty: ChallengeCard['difficulty']): string => {
  switch (difficulty) {
    case 'easy': return 'bg-green-500';
    case 'medium': return 'bg-yellow-500';
    case 'hard': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

// Helper function to get category icon
export const getCategoryIcon = (category: ChallengeCard['category']): string => {
  switch (category) {
    case 'action': return '🏃';
    case 'silly': return '🤪';
    case 'creative': return '🎨';
    case 'team': return '👥';
    default: return '⭐';
  }
};
