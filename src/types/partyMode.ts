// Party Mode Types for Drop A Deuce

export interface PartyTheme {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  gradientFrom: string;
  gradientVia: string;
  gradientTo: string;
  confettiColors: string[];
  icon: string;
  backgroundPattern?: string;
}

export interface PlaylistTrack {
  id: string;
  name: string;
  artist: string;
  duration: number; // in seconds
  bpm?: number;
  mood: 'energetic' | 'chill' | 'silly' | 'intense';
  frequencies: number[]; // For generating audio
}

export interface PartyPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: PlaylistTrack[];
  icon: string;
}

export interface ChallengeTimer {
  duration: number;
  isRunning: boolean;
  timeRemaining: number;
  mode: 'countdown' | 'random' | 'sudden-death';
  warningThreshold: number;
}

export interface SoundEffect {
  id: string;
  name: string;
  icon: string;
  category: 'funny' | 'celebration' | 'alert' | 'ambient';
  frequencies?: number[];
  duration?: number;
}

export interface PartyModeState {
  isActive: boolean;
  currentTheme: PartyTheme;
  currentPlaylist: PartyPlaylist | null;
  currentTrackIndex: number;
  isPlaying: boolean;
  volume: number;
  timer: ChallengeTimer;
  roundNumber: number;
  scores: Record<string, number>;
  showConfetti: boolean;
  confettiIntensity: 'low' | 'medium' | 'high' | 'extreme';
}

export interface PartyModeSettings {
  autoPlayMusic: boolean;
  soundEffectsEnabled: boolean;
  confettiEnabled: boolean;
  timerSounds: boolean;
  randomTimerVariation: number; // 0-10 seconds variation
  challengeCardsEnabled: boolean;
}

// Predefined themes
export const PARTY_THEMES: PartyTheme[] = [
  {
    id: 'classic-party',
    name: 'Classic Party',
    description: 'The original party vibes',
    primaryColor: '#ec4899',
    secondaryColor: '#8b5cf6',
    accentColor: '#fbbf24',
    gradientFrom: 'from-pink-500',
    gradientVia: 'via-purple-500',
    gradientTo: 'to-indigo-500',
    confettiColors: ['#ec4899', '#8b5cf6', '#fbbf24', '#22c55e', '#3b82f6'],
    icon: '🎉'
  },
  {
    id: 'neon-glow',
    name: 'Neon Glow',
    description: 'Electric neon party lights',
    primaryColor: '#00ff88',
    secondaryColor: '#ff00ff',
    accentColor: '#00ffff',
    gradientFrom: 'from-green-400',
    gradientVia: 'via-pink-500',
    gradientTo: 'to-cyan-400',
    confettiColors: ['#00ff88', '#ff00ff', '#00ffff', '#ffff00', '#ff6600'],
    icon: '✨'
  },
  {
    id: 'tropical-fiesta',
    name: 'Tropical Fiesta',
    description: 'Beach party vibes',
    primaryColor: '#f97316',
    secondaryColor: '#14b8a6',
    accentColor: '#facc15',
    gradientFrom: 'from-orange-400',
    gradientVia: 'via-teal-400',
    gradientTo: 'to-yellow-400',
    confettiColors: ['#f97316', '#14b8a6', '#facc15', '#f472b6', '#84cc16'],
    icon: '🌴'
  },
  {
    id: 'space-disco',
    name: 'Space Disco',
    description: 'Intergalactic dance party',
    primaryColor: '#6366f1',
    secondaryColor: '#a855f7',
    accentColor: '#f0abfc',
    gradientFrom: 'from-indigo-600',
    gradientVia: 'via-purple-600',
    gradientTo: 'to-pink-500',
    confettiColors: ['#6366f1', '#a855f7', '#f0abfc', '#c4b5fd', '#818cf8'],
    icon: '🚀'
  },
  {
    id: 'rainbow-blast',
    name: 'Rainbow Blast',
    description: 'All the colors!',
    primaryColor: '#ef4444',
    secondaryColor: '#22c55e',
    accentColor: '#3b82f6',
    gradientFrom: 'from-red-500',
    gradientVia: 'via-yellow-500',
    gradientTo: 'to-blue-500',
    confettiColors: ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#8b5cf6'],
    icon: '🌈'
  },
  {
    id: 'midnight-rave',
    name: 'Midnight Rave',
    description: 'Dark mode party',
    primaryColor: '#f43f5e',
    secondaryColor: '#0ea5e9',
    accentColor: '#a3e635',
    gradientFrom: 'from-rose-600',
    gradientVia: 'via-slate-900',
    gradientTo: 'to-sky-600',
    confettiColors: ['#f43f5e', '#0ea5e9', '#a3e635', '#f472b6', '#38bdf8'],
    icon: '🌙'
  }
];

// Predefined playlists with generated music patterns
export const PARTY_PLAYLISTS: PartyPlaylist[] = [
  {
    id: 'party-hits',
    name: 'Party Hits',
    description: 'High energy party music',
    icon: '🎵',
    tracks: [
      { id: '1', name: 'Dance Floor Fever', artist: 'Party Bot', duration: 30, bpm: 128, mood: 'energetic', frequencies: [523.25, 659.25, 783.99, 880.00] },
      { id: '2', name: 'Jump Around', artist: 'Party Bot', duration: 30, bpm: 140, mood: 'energetic', frequencies: [440.00, 554.37, 659.25, 880.00] },
      { id: '3', name: 'Electric Slide', artist: 'Party Bot', duration: 30, bpm: 120, mood: 'energetic', frequencies: [392.00, 493.88, 587.33, 783.99] }
    ]
  },
  {
    id: 'silly-songs',
    name: 'Silly Songs',
    description: 'Goofy tunes for laughs',
    icon: '🤪',
    tracks: [
      { id: '4', name: 'Wobble Wobble', artist: 'Funny Tunes', duration: 30, bpm: 100, mood: 'silly', frequencies: [261.63, 329.63, 392.00, 523.25] },
      { id: '5', name: 'Chicken Dance Remix', artist: 'Funny Tunes', duration: 30, bpm: 110, mood: 'silly', frequencies: [293.66, 349.23, 440.00, 523.25] },
      { id: '6', name: 'Boing Boing', artist: 'Funny Tunes', duration: 30, bpm: 95, mood: 'silly', frequencies: [196.00, 246.94, 293.66, 392.00] }
    ]
  },
  {
    id: 'intense-mode',
    name: 'Intense Mode',
    description: 'Heart-pumping action',
    icon: '🔥',
    tracks: [
      { id: '7', name: 'Final Countdown', artist: 'Epic Sounds', duration: 30, bpm: 150, mood: 'intense', frequencies: [659.25, 783.99, 987.77, 1046.50] },
      { id: '8', name: 'Rush Hour', artist: 'Epic Sounds', duration: 30, bpm: 160, mood: 'intense', frequencies: [587.33, 698.46, 880.00, 1046.50] },
      { id: '9', name: 'Turbo Mode', artist: 'Epic Sounds', duration: 30, bpm: 170, mood: 'intense', frequencies: [523.25, 659.25, 783.99, 1046.50] }
    ]
  },
  {
    id: 'chill-vibes',
    name: 'Chill Vibes',
    description: 'Relaxed party mode',
    icon: '😎',
    tracks: [
      { id: '10', name: 'Smooth Groove', artist: 'Chill Zone', duration: 30, bpm: 85, mood: 'chill', frequencies: [220.00, 277.18, 329.63, 440.00] },
      { id: '11', name: 'Easy Does It', artist: 'Chill Zone', duration: 30, bpm: 80, mood: 'chill', frequencies: [196.00, 246.94, 293.66, 392.00] },
      { id: '12', name: 'Sunset Vibes', artist: 'Chill Zone', duration: 30, bpm: 90, mood: 'chill', frequencies: [261.63, 329.63, 392.00, 493.88] }
    ]
  }
];

// Sound effects library
export const SOUND_EFFECTS: SoundEffect[] = [
  { id: 'airhorn', name: 'Air Horn', icon: '📢', category: 'celebration', frequencies: [800, 1000, 1200], duration: 0.5 },
  { id: 'applause', name: 'Applause', icon: '👏', category: 'celebration', frequencies: [200, 400, 600, 800], duration: 2 },
  { id: 'drumroll', name: 'Drum Roll', icon: '🥁', category: 'alert', frequencies: [150, 200, 250], duration: 1.5 },
  { id: 'buzzer', name: 'Buzzer', icon: '🚨', category: 'alert', frequencies: [200, 180, 160], duration: 1 },
  { id: 'tada', name: 'Ta-Da!', icon: '🎺', category: 'celebration', frequencies: [523.25, 659.25, 783.99, 1046.50], duration: 0.8 },
  { id: 'boing', name: 'Boing', icon: '🦘', category: 'funny', frequencies: [200, 400, 600, 300], duration: 0.4 },
  { id: 'fart', name: 'Toot', icon: '💨', category: 'funny', frequencies: [80, 100, 90, 70], duration: 0.6 },
  { id: 'splat', name: 'Splat', icon: '💥', category: 'funny', frequencies: [100, 150, 80, 60], duration: 0.3 },
  { id: 'whistle', name: 'Whistle', icon: '🎵', category: 'alert', frequencies: [1000, 1200, 1400, 1200, 1000], duration: 0.8 },
  { id: 'pop', name: 'Pop', icon: '🎈', category: 'funny', frequencies: [800, 400], duration: 0.1 },
  { id: 'ding', name: 'Ding', icon: '🔔', category: 'alert', frequencies: [880, 1100], duration: 0.3 },
  { id: 'woohoo', name: 'Woo-hoo!', icon: '🙌', category: 'celebration', frequencies: [400, 500, 600, 800, 1000], duration: 0.6 }
];
