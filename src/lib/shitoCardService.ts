/**
 * shitoCardService.ts
 * ─────────────────────────────────────────────────────────────────────
 * Shared service for loading the 24 real SHITO calling cards and
 * 36 real bingo cards from the `parsed_game_cards` database table
 * via the `game-card-loader` Supabase edge function.
 *
 * gameId  : 'shito'
 * cardType: 'calling-cards' | 'bingo-cards'
 * ─────────────────────────────────────────────────────────────────────
 */

import { supabase } from '@/lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────

export type ShitoColumn = 'S' | 'H' | 'I' | 'T' | 'O';
export const SHITO_COLUMNS: readonly ShitoColumn[] = ['S', 'H', 'I', 'T', 'O'];

/** Raw row shape from the parsed_game_cards table */
export interface DbShitoCard {
  id: string;
  game_id: string;
  card_type: string;
  card_name: string;
  card_text: string | null;
  card_effect: string;
  card_category: string;
  card_number: number;
  drink_count: number;
  metadata: Record<string, any> | null;
  source_file: string;
}

/** A calling card icon used during gameplay */
export interface ShitoCallingCard {
  id: string;           // DB row id or generated id
  dbId: string;         // Original DB id for dedup
  name: string;         // Display name (e.g. "Toilet")
  iconId: string;       // Normalized id for matching (e.g. "toilet")
  emoji?: string;       // Fallback emoji
  color?: string;       // Accent color
  imageUrl?: string;    // Image URL from metadata or storage
  cardNumber: number;   // 1-24
}

/** A 5×5 bingo card grid — each cell is a calling-card iconId */
export type BingoGrid = Record<ShitoColumn, string[]>;

/** A pre-made bingo card loaded from the database */
export interface ShitoBingoCard {
  id: string;
  dbId: string;
  name: string;         // e.g. "Card #1"
  cardNumber: number;   // 1-36
  grid: BingoGrid;      // 5 columns × 5 rows
}

// ─── Response parsing helper ──────────────────────────────────────────

function extractCards(data: any): DbShitoCard[] {
  const payload = data as any;
  if (Array.isArray(payload)) return payload;
  if (payload?.cards && Array.isArray(payload.cards)) return payload.cards;
  if (payload?.data?.cards && Array.isArray(payload.data.cards)) return payload.data.cards;
  if (payload?.data && Array.isArray(payload.data)) return payload.data;
  throw new Error('Unexpected response shape from game-card-loader');
}

// ─── Load calling cards (24) ──────────────────────────────────────────

export async function loadCallingCardsFromDb(): Promise<ShitoCallingCard[]> {
  const { data, error } = await supabase.functions.invoke('game-card-loader', {
    body: { action: 'get-cards', gameId: 'shito', cardType: 'calling-cards' },
  });
  if (error) throw error;

  const rows = extractCards(data);

  // Filter to calling-cards type (in case the edge function doesn't filter)
  const callingRows = rows.filter(
    (r: DbShitoCard) =>
      r.card_type === 'calling-cards' ||
      r.card_type === 'calling_cards' ||
      r.card_type === 'calling card' ||
      r.card_type === 'calling-card'
  );

  // If no type-filtered results, use all rows (the edge fn may have already filtered)
  const finalRows = callingRows.length > 0 ? callingRows : rows;

  return finalRows.map((row: DbShitoCard, idx: number) => {
    const meta = row.metadata || {};
    const iconId = (
      meta.iconId ||
      meta.icon_id ||
      row.card_name
    )
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    return {
      id: `cc-${row.card_number || idx}`,
      dbId: row.id,
      name: row.card_name || `Card ${idx + 1}`,
      iconId,
      emoji: meta.emoji || meta.icon || undefined,
      color: meta.color || undefined,
      imageUrl: meta.imageUrl || meta.image_url || meta.url || undefined,
      cardNumber: row.card_number || idx + 1,
    };
  });
}

// ─── Load bingo cards (36) ────────────────────────────────────────────

export async function loadBingoCardsFromDb(): Promise<ShitoBingoCard[]> {
  const { data, error } = await supabase.functions.invoke('game-card-loader', {
    body: { action: 'get-cards', gameId: 'shito', cardType: 'bingo-cards' },
  });
  if (error) throw error;

  const rows = extractCards(data);

  // Filter to bingo-cards type
  const bingoRows = rows.filter(
    (r: DbShitoCard) =>
      r.card_type === 'bingo-cards' ||
      r.card_type === 'bingo_cards' ||
      r.card_type === 'bingo card' ||
      r.card_type === 'bingo-card' ||
      r.card_type === 'player-card' ||
      r.card_type === 'player_card'
  );

  const finalRows = bingoRows.length > 0 ? bingoRows : rows;

  return finalRows.map((row: DbShitoCard, idx: number) => {
    const meta = row.metadata || {};

    // The grid can be stored in several places in the metadata
    let grid: BingoGrid = meta.grid || meta.board || meta.layout || null;

    // If grid is stored as a flat array or JSON string, parse it
    if (typeof grid === 'string') {
      try { grid = JSON.parse(grid); } catch { grid = null as any; }
    }

    // If grid is stored as a 2D array (5 columns × 5 rows), convert to Record
    if (Array.isArray(grid)) {
      const arr = grid as string[][];
      grid = {
        S: arr[0] || [],
        H: arr[1] || [],
        I: arr[2] || [],
        T: arr[3] || [],
        O: arr[4] || [],
      };
    }

    // If no grid found, try to parse from card_text or card_effect
    if (!grid) {
      const textToParse = row.card_text || row.card_effect || '';
      try {
        const parsed = JSON.parse(textToParse);
        if (parsed && typeof parsed === 'object') {
          grid = parsed.grid || parsed.board || parsed;
        }
      } catch {
        // Not JSON — generate a placeholder grid
        grid = null as any;
      }
    }

    // Ensure grid has proper structure
    if (!grid || !grid.S) {
      grid = { S: [], H: [], I: [], T: [], O: [] };
    }

    // Ensure FREE space in center (I column, row 2 — 0-indexed)
    if (grid.I && grid.I.length >= 3) {
      grid.I[2] = 'FREE';
    }

    return {
      id: `bc-${row.card_number || idx}`,
      dbId: row.id,
      name: row.card_name || `Card #${idx + 1}`,
      cardNumber: row.card_number || idx + 1,
      grid,
    };
  });
}

// ─── Load all SHITO cards at once ─────────────────────────────────────

export async function loadAllShitoCards(): Promise<{
  callingCards: ShitoCallingCard[];
  bingoCards: ShitoBingoCard[];
}> {
  // Try loading both in parallel
  const [callingResult, bingoResult] = await Promise.allSettled([
    loadCallingCardsFromDb(),
    loadBingoCardsFromDb(),
  ]);

  return {
    callingCards: callingResult.status === 'fulfilled' ? callingResult.value : [],
    bingoCards: bingoResult.status === 'fulfilled' ? bingoResult.value : [],
  };
}

// ─── Column color helpers ─────────────────────────────────────────────

export function getColumnColor(column: ShitoColumn): string {
  const colors: Record<ShitoColumn, string> = {
    S: 'bg-red-500',
    H: 'bg-orange-500',
    I: 'bg-yellow-500',
    T: 'bg-green-500',
    O: 'bg-blue-500',
  };
  return colors[column];
}

export function getColumnGradient(column: ShitoColumn): string {
  const colors: Record<ShitoColumn, string> = {
    S: 'from-red-500 to-red-600',
    H: 'from-orange-500 to-orange-600',
    I: 'from-yellow-500 to-yellow-600',
    T: 'from-green-500 to-green-600',
    O: 'from-blue-500 to-blue-600',
  };
  return colors[column];
}

export function getColumnTextColor(column: ShitoColumn): string {
  const colors: Record<ShitoColumn, string> = {
    S: 'text-red-500',
    H: 'text-orange-500',
    I: 'text-yellow-500',
    T: 'text-green-500',
    O: 'text-blue-500',
  };
  return colors[column];
}

// ─── Generate a board from calling cards (fallback if no bingo cards) ─

export function generateBoardFromCallingCards(
  callingCards: ShitoCallingCard[],
  seed?: string
): BingoGrid {
  // Seeded shuffle for deterministic boards
  const seededRandom = (s: string) => {
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
      hash = ((hash << 5) - hash) + s.charCodeAt(i);
      hash |= 0;
    }
    return () => {
      hash = (hash * 1103515245 + 12345) & 0x7fffffff;
      return hash / 0x7fffffff;
    };
  };

  const rng = seed ? seededRandom(seed) : Math.random;
  const shuffled = [...callingCards].sort(() => (typeof rng === 'function' ? rng() : Math.random()) - 0.5);

  // We need 24 cells (5×5 minus FREE space)
  // If we have fewer than 24 calling cards, repeat them
  const pool: string[] = [];
  while (pool.length < 24) {
    const batch = shuffled.map(c => c.iconId);
    pool.push(...batch);
  }
  // Take exactly 24 and shuffle again
  const cells = pool.slice(0, 24).sort(() => (typeof rng === 'function' ? rng() : Math.random()) - 0.5);

  let idx = 0;
  const grid: BingoGrid = { S: [], H: [], I: [], T: [], O: [] };

  for (const col of SHITO_COLUMNS) {
    for (let row = 0; row < 5; row++) {
      if (col === 'I' && row === 2) {
        grid[col].push('FREE');
      } else {
        grid[col].push(cells[idx++]);
      }
    }
  }

  return grid;
}

// ─── Draw a random calling card ───────────────────────────────────────

export function drawRandomCallingCard(
  callingCards: ShitoCallingCard[],
  drawnIds: string[]
): { card: ShitoCallingCard | null; column: ShitoColumn } {
  const column = SHITO_COLUMNS[Math.floor(Math.random() * SHITO_COLUMNS.length)];

  let available = callingCards.filter(c => !drawnIds.includes(c.id));
  if (available.length === 0) available = [...callingCards]; // reshuffle

  const card = available.length > 0
    ? available[Math.floor(Math.random() * available.length)]
    : null;

  return { card, column };
}
