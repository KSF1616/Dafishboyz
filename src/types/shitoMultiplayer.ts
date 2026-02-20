// Types for multiplayer Adult SHITO game

export type ShitoColumn = 'S' | 'H' | 'I' | 'T' | 'O';
export const SHITO_COLUMNS: ShitoColumn[] = ['S', 'H', 'I', 'T', 'O'];

export interface CallingCard {
  id: string;
  name: string;
  url: string;
}

export interface BingoCard {
  id: string;
  name: string;
  url: string;
}

export interface BoardGrid {
  S: BingoCard[];
  H: BingoCard[];
  I: BingoCard[];
  T: BingoCard[];
  O: BingoCard[];
}

export interface ShitoRoom {
  id: string;
  room_code: string;
  host_id: string;
  host_name: string;
  status: 'waiting' | 'playing' | 'finished';
  current_card: CallingCard | null;
  current_column: ShitoColumn | null;
  called_cards: { card: CallingCard; column: ShitoColumn }[];
  drawn_card_ids: string[];
  winner_id: string | null;
  winner_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShitoPlayer {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string;
  board_grid: BoardGrid;
  marked_cells: string[];
  is_host: boolean;
  is_connected: boolean;
  joined_at: string;
  updated_at: string;
}

export interface ShitoMessage {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string;
  message: string;
  message_type: 'chat' | 'system' | 'game';
  created_at: string;
}

export interface MultiplayerState {
  mode: 'menu' | 'creating' | 'joining' | 'lobby' | 'playing';
  room: ShitoRoom | null;
  players: ShitoPlayer[];
  messages: ShitoMessage[];
  currentPlayer: ShitoPlayer | null;
  playerId: string;
  playerName: string;
  isHost: boolean;
  error: string | null;
}

// Fallback icons if Supabase images aren't available
export const FALLBACK_ICONS = [
  { id: 'toilet', emoji: '🚽', name: 'Toilet' },
  { id: 'plunger', emoji: '🪠', name: 'Plunger' },
  { id: 'roll', emoji: '🧻', name: 'TP Roll' },
  { id: 'poop', emoji: '💩', name: 'Poop' },
  { id: 'fly', emoji: '🪰', name: 'Fly' },
  { id: 'skunk', emoji: '🦨', name: 'Skunk' },
  { id: 'nose', emoji: '👃', name: 'Nose' },
  { id: 'soap', emoji: '🧼', name: 'Soap' },
  { id: 'bucket', emoji: '🪣', name: 'Bucket' },
  { id: 'spray', emoji: '🧴', name: 'Spray' },
  { id: 'trash', emoji: '🗑️', name: 'Trash' },
  { id: 'diaper', emoji: '🩲', name: 'Diaper' },
  { id: 'dog', emoji: '🐕', name: 'Dog' },
  { id: 'cat', emoji: '🐈', name: 'Cat' },
  { id: 'bird', emoji: '🐦', name: 'Bird' },
  { id: 'worm', emoji: '🪱', name: 'Worm' },
  { id: 'mushroom', emoji: '🍄', name: 'Mushroom' },
  { id: 'banana', emoji: '🍌', name: 'Banana Peel' },
  { id: 'corn', emoji: '🌽', name: 'Corn' },
  { id: 'beans', emoji: '🫘', name: 'Beans' },
  { id: 'shower', emoji: '🚿', name: 'Shower' },
  { id: 'bomb', emoji: '💣', name: 'Bomb' },
  { id: 'fire', emoji: '🔥', name: 'Fire' },
  { id: 'cloud', emoji: '☁️', name: 'Stink Cloud' },
  { id: 'warning', emoji: '⚠️', name: 'Warning' },
];

export const getColumnColor = (column: ShitoColumn): string => {
  const colors: Record<ShitoColumn, string> = {
    S: 'bg-red-500',
    H: 'bg-orange-500',
    I: 'bg-yellow-500',
    T: 'bg-green-500',
    O: 'bg-blue-500',
  };
  return colors[column];
};

export const getColumnGradient = (column: ShitoColumn): string => {
  const colors: Record<ShitoColumn, string> = {
    S: 'from-red-500 to-red-600',
    H: 'from-orange-500 to-orange-600',
    I: 'from-yellow-500 to-yellow-600',
    T: 'from-green-500 to-green-600',
    O: 'from-blue-500 to-blue-600',
  };
  return colors[column];
};

export const getFallbackEmoji = (name: string): string => {
  const icon = FALLBACK_ICONS.find(i => i.name.toLowerCase() === name.toLowerCase());
  return icon?.emoji || '❓';
};

export const generateRoomCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const generatePlayerId = (): string => {
  return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
