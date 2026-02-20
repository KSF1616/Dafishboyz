import React from 'react';
import { SHITO_ICONS as FALLBACK_ICONS, ShitoIcon } from '@/data/shitoIcons';
import {
  ShitoCallingCard,
  ShitoColumn as ServiceShitoColumn,
  SHITO_COLUMNS as SERVICE_COLUMNS,
  getColumnColor as serviceGetColumnColor,
  getColumnTextColor as serviceGetColumnTextColor,
  generateBoardFromCallingCards,
} from '@/lib/shitoCardService';

// ─── Re-export types and constants for backward compat ────────────────

export type ShitoColumn = ServiceShitoColumn;
export const COLUMNS = SERVICE_COLUMNS;

// ─── Icon definitions (fallback emoji set) ────────────────────────────
// These are used when DB cards haven't loaded yet.

export const SHITO_ICONS = [
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
];

// ─── Dynamic icon registry ────────────────────────────────────────────
// When DB calling cards are loaded, they can be registered here for
// global lookup by ShitoBoard and other components.

let _dbCallingCards: ShitoCallingCard[] = [];

export const registerDbCallingCards = (cards: ShitoCallingCard[]) => {
  _dbCallingCards = cards;
};

export const getDbCallingCards = (): ShitoCallingCard[] => _dbCallingCards;

// ─── Seeded random for consistent board generation ────────────────────

const seededRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  return () => {
    hash = (hash * 1103515245 + 12345) & 0x7fffffff;
    return hash / 0x7fffffff;
  };
};

// ─── Generate a unique player board ───────────────────────────────────
// Now supports both DB calling cards and fallback emoji icons.

export const generateUniquePlayerBoard = (playerId: string, existingSeeds: string[]): string[][] => {
  // If DB calling cards are available, use the service's board generator
  if (_dbCallingCards.length > 0) {
    const grid = generateBoardFromCallingCards(_dbCallingCards, playerId);
    // Convert BingoGrid to string[][] for backward compat
    return SERVICE_COLUMNS.map(col => grid[col]);
  }

  // Fallback: use local emoji icons
  let seed = playerId;
  let attempts = 0;

  while (attempts < 100) {
    const random = seededRandom(seed);
    const shuffled = [...SHITO_ICONS].sort(() => random() - 0.5);
    const board: string[][] = [];

    for (let col = 0; col < 5; col++) {
      const column: string[] = [];
      for (let row = 0; row < 5; row++) {
        // FREE space at center (col 2, row 2)
        if (col === 2 && row === 2) {
          column.push('FREE');
        } else {
          const idx = (col * 5 + row) % shuffled.length;
          column.push(shuffled[idx].id);
        }
      }
      board.push(column);
    }

    const boardKey = board.flat().join(',');
    if (!existingSeeds.includes(boardKey)) {
      return board;
    }

    seed = seed + attempts.toString();
    attempts++;
  }

  return generatePlayerBoard(playerId);
};

// ─── Generate a random player board (legacy) ──────────────────────────

export const generatePlayerBoard = (seed: string): string[][] => {
  const shuffled = [...SHITO_ICONS].sort(() => Math.random() - 0.5);
  const board: string[][] = [];

  for (let col = 0; col < 5; col++) {
    const column: string[] = [];
    for (let row = 0; row < 5; row++) {
      if (col === 2 && row === 2) {
        column.push('FREE');
      } else {
        const idx = (col * 5 + row) % shuffled.length;
        column.push(shuffled[idx].id);
      }
    }
    board.push(column);
  }
  return board;
};

// ─── Get icon by ID ───────────────────────────────────────────────────
// Checks DB calling cards first, then falls back to local emoji icons.

export const getIcon = (id: string): { id: string; emoji?: string; name: string; imageUrl?: string } | undefined => {
  if (id === 'FREE') return { id: 'FREE', name: 'FREE', emoji: undefined };

  // Check DB calling cards first
  const dbCard = _dbCallingCards.find(
    c =>
      c.iconId === id ||
      c.name.toLowerCase() === id.toLowerCase() ||
      c.iconId === id.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  );

  if (dbCard) {
    return {
      id: dbCard.iconId,
      emoji: dbCard.emoji,
      name: dbCard.name,
      imageUrl: dbCard.imageUrl,
    };
  }

  // Fallback to local emoji icons
  const local = SHITO_ICONS.find(i => i.id === id);
  if (local) return { id: local.id, emoji: local.emoji, name: local.name };

  return undefined;
};

// ─── Icon display component ───────────────────────────────────────────

export const IconDisplay = ({ iconId, size = 'md' }: { iconId: string; size?: 'sm' | 'md' | 'lg' }) => {
  if (iconId === 'FREE') {
    return (
      <div className="flex flex-col items-center">
        <svg
          viewBox="0 0 24 24"
          className={`${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6'} text-yellow-300`}
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
        {size !== 'sm' && <span className="text-[8px] font-black text-yellow-300">FREE</span>}
      </div>
    );
  }

  const icon = getIcon(iconId);
  const sizeClass = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-4xl' : 'text-2xl';
  const imgSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7';

  if (icon?.imageUrl) {
    return <img src={icon.imageUrl} alt={icon.name} className={`${imgSize} object-contain`} />;
  }

  if (icon?.emoji) {
    return <span className={sizeClass}>{icon.emoji}</span>;
  }

  // Letter fallback
  return (
    <span className={`${sizeClass} font-bold text-amber-300`}>
      {(icon?.name || iconId || '?').charAt(0).toUpperCase()}
    </span>
  );
};

// ─── Column color helpers ─────────────────────────────────────────────

export const getColumnColor = (column: ShitoColumn): string => serviceGetColumnColor(column);

export const getColumnTextColor = (column: ShitoColumn): string => serviceGetColumnTextColor(column);
