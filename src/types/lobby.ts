export interface GameRoom {
  id: string;
  room_code: string;
  game_type: string;
  host_id: string;
  host_name: string;
  status: 'waiting' | 'playing' | 'finished' | 'paused';
  max_players: number;
  min_players: number;
  current_turn: number;
  game_data: Record<string, any>;
  settings: Record<string, any>;
  is_private: boolean;
  allow_spectators: boolean;
  spectator_count?: number;
  created_at: string;
  updated_at: string;
  started_at?: string;
  finished_at?: string;
}

export interface RoomSpectator {
  id: string;
  room_id: string;
  spectator_id: string;
  spectator_name: string;
  user_id?: string;
  joined_at: string;
  last_seen_at: string;
  is_connected: boolean;
}



export interface RoomPlayer {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string;
  user_id?: string;
  is_host: boolean;
  is_ready: boolean;
  is_connected: boolean;
  player_order: number;
  team?: string;
  score: number;
  player_data: Record<string, any>;
  joined_at: string;
  last_seen_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string;
  message: string;
  message_type: 'chat' | 'system' | 'game_event' | 'emote' | 'sticker';
  metadata: Record<string, any>;
  created_at: string;
}

export interface GameInvite {
  id: string;
  room_id: string;
  invite_code: string;
  created_by: string;
  max_uses: number;
  uses_count: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

export interface GameAction {
  id: string;
  room_id: string;
  player_id: string;
  action_type: string;
  action_data: Record<string, any>;
  turn_number: number;
  created_at: string;
}

export interface SyncedCard {
  id: string;
  cardId: string;
  ownerId: string | null;
  location: 'deck' | 'hand' | 'discard' | 'table' | 'removed';
  position: number;
  isFlipped: boolean;
  metadata?: Record<string, any>;
}

export interface CardGameState {
  deckCards: SyncedCard[];
  discardPile: SyncedCard[];
  tableCards: SyncedCard[];
  playerHands: Record<string, SyncedCard[]>;
  currentDrawer: string | null;
  lastAction: CardAction | null;
  shuffleSeed: number;
}

export interface CardAction {
  type: 'draw' | 'discard' | 'play' | 'shuffle' | 'flip' | 'move' | 'deal';
  playerId: string;
  cardIds: string[];
  from?: 'deck' | 'hand' | 'discard' | 'table';
  to?: 'deck' | 'hand' | 'discard' | 'table';
  timestamp: number;
}

export interface GameRules {
  title: string;
  objective: string;
  setup: string[];
  howToPlay: string[];
  winning: string;
}

export const GAME_RULES: Record<string, GameRules> = {
  'up-shitz-creek': {
    title: 'Up Shitz Creek',
    objective: 'Be the first player to reach the Latrine (finish) with TWO or more paddles to win!',
    setup: ['Each player starts with one paddle', 'Place all players at the start space', 'Shuffle the shit pile cards'],
    howToPlay: ['Roll dice and move spaces', 'Land on shit pile to draw cards', 'Use cards to steal paddles or gain advantages', 'If you reach the Latrine with less than 2 paddles, you must go back to start, receive one paddle, and travel back through the creek'],
    winning: 'First player to reach the Latrine with TWO or more paddles wins! Players with only one or no paddle must return to start.'
  },
  'o-craps': {
    title: "O'CRAPS",
    objective: 'Be the last player with chips to win the Shit Pot!',
    setup: ['Each player starts with 4 chips: White, Blue, Purple, Black', 'Place a toilet in the center as the Shit Pot', 'Players sit in a circle'],
    howToPlay: ['Roll 3 dice if 3+ chips, 2 dice if 2 chips, 1 die if 1 chip, skip if 0', 'C = Chip to Center (Shit Pot)', 'R = Pass chip to Right', 'A = Give chip to Any player', 'P = Pass chip to Left', 'S = Safe (keep chip)', 'Poo = Roll that die again'],
    winning: 'Last player with chips wins the Shit Pot!'
  },
  'shito': {
    title: 'SHITO',
    objective: 'Complete a full row or column on your unique board!',
    setup: ['Each player gets a unique 5x4 board (no duplicates)', 'Columns are labeled S-H-I-T-O', 'Use poop-shaped chips to cover spaces'],
    howToPlay: ['Caller rolls SHITO dice (S, H, I, T, O, or Poo)', 'Caller draws a calling card showing an icon', 'If letter rolled, cover that icon ONLY in that column', 'If Poo rolled, cover that icon in ANY column (wild!)', 'First to complete row/column hits SHITO button'],
    winning: 'First to spell SHITO (complete column) or full row wins!'
  },
  'slanging-shit': {
    title: 'Slanging Shit',
    objective: 'Act out phrases like charades for others to guess!',
    setup: ['Turn on camera so players can see you', 'Draw cards from the Slanging Shit pile', 'You get ONE pass per round'],
    howToPlay: ['Actor draws a card and acts it out - NO TALKING', '60 seconds per round', 'Correct guesses earn points', 'Use your one pass wisely'],
    winning: 'First player to 10 points wins!'
  },
  'let-that-shit-go': {
    title: 'Let That Shit Go',
    objective: 'Play basketball with poop balls and a toilet seat hoop! Two modes available.',
    setup: [
      'Choose game mode: Multiplayer LETGO or Emotional Release',
      'Multiplayer: Players take turns shooting from different positions',
      'Emotional: Enter 3 things you want to release emotionally'
    ],
    howToPlay: [
      'MULTIPLAYER LETGO MODE:',
      '• Select a shooting position and take your shot',
      '• If you make it, the next player must match your exact shot',
      '• Miss a match shot and you earn a letter (L-E-T-G-O)',
      '• Spell LETGO and you\'re eliminated!',
      '',
      'EMOTIONAL RELEASE MODE:',
      '• Type 3 things you want to let go of emotionally',
      '• Shoot 12 poop balls at the toilet hoop',
      '• Each made shot represents releasing emotional baggage',
      '• Focus on what you\'re letting go with each shot'
    ],
    winning: 'Multiplayer: Last player standing (without spelling LETGO) wins! Emotional: Complete all 12 shots for emotional release - the more you make, the more you let go!'
  }
};
