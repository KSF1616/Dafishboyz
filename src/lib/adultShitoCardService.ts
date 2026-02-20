/**
 * adultShitoCardService.ts
 * ─────────────────────────────────────────────────────────────────────
 * Loads Adult SHITO calling cards and bingo icons from the
 * `parsed_game_cards` database table via the `game-card-loader`
 * Supabase edge function.
 *
 * Load order (cascading fallback):
 *   1. DB  → gameId: 'adult-shito'
 *   2. DB  → gameId: 'shito'  (regular SHITO data as fallback)
 *   3. Storage → image files in game-cards bucket folders
 *   4. Fallback icons (hardcoded emoji set)
 *
 * For each DB card we also attempt to resolve an image URL from
 * the game-cards storage bucket so the existing UI can display
 * card images when available.
 * ─────────────────────────────────────────────────────────────────────
 */

import { supabase } from '@/lib/supabase';
import type { CallingCard, BingoCard } from '@/types/shitoMultiplayer';
import { FALLBACK_ICONS } from '@/types/shitoMultiplayer';

// ─── Raw DB row shape ─────────────────────────────────────────────────

interface DbRow {
  id: string;
  game_id: string;
  card_type: string;
  card_name: string;
  card_text: string | null;
  card_effect: string | null;
  card_category: string | null;
  card_number: number;
  drink_count: number;
  metadata: Record<string, any> | null;
  source_file: string;
}

// ─── Storage folder paths to probe for images ─────────────────────────

const CALLING_CARD_FOLDERS = [
  'SHITO-calling-cards',
  'shito-calling-cards',
  'SHITO-calling-cards-singles',
  'shito-calling-cards.singles',
  'SHITO-calling-cards.singles',
];

const BINGO_CARD_FOLDERS = [
  'shito-bingo-cards',
  'SHITO-bingo-cards',
  'shito-bingo-cards.singles',
  'SHITO-bingo-cards.singles',
];

// ─── Result type ──────────────────────────────────────────────────────

export interface AdultShitoLoadResult {
  callingCards: CallingCard[];
  bingoIcons: BingoCard[];
  source: 'db-adult-shito' | 'db-shito' | 'storage' | 'fallback';
  sourceDetail: string;
  useFallback: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────

/** Extract the cards array from the edge function response */
function extractCards(data: any): DbRow[] {
  if (Array.isArray(data)) return data;
  if (data?.cards && Array.isArray(data.cards)) return data.cards;
  if (data?.data?.cards && Array.isArray(data.data.cards)) return data.data.cards;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
}

/** Normalise a card name into a filesystem-friendly id */
function toIconId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Try to find images in a list of storage folders. Returns a Map<lowercaseName, publicUrl>. */
async function probeStorageFolders(
  folders: string[],
  minFiles = 1,
): Promise<{ imageMap: Map<string, string>; folder: string } | null> {
  for (const folder of folders) {
    try {
      const { data, error } = await supabase.storage
        .from('game-cards')
        .list(folder, { limit: 300 });

      if (error || !data) continue;

      const imageFiles = data.filter((f) =>
        /\.(png|jpe?g|gif|webp)$/i.test(f.name),
      );
      if (imageFiles.length < minFiles) continue;

      const imageMap = new Map<string, string>();
      for (const f of imageFiles) {
        const { data: urlData } = supabase.storage
          .from('game-cards')
          .getPublicUrl(`${folder}/${f.name}`);
        const key = f.name
          .replace(/\.(png|jpe?g|gif|webp)$/i, '')
          .toLowerCase()
          .replace(/[-_]/g, ' ');
        imageMap.set(key, urlData.publicUrl);
      }
      return { imageMap, folder };
    } catch {
      // continue to next folder
    }
  }
  return null;
}

/** Resolve a card name to a storage image URL using fuzzy matching */
function resolveImageUrl(
  cardName: string,
  imageMap: Map<string, string>,
): string {
  const lower = cardName.toLowerCase().trim();

  // Exact match
  if (imageMap.has(lower)) return imageMap.get(lower)!;

  // Normalised match (strip special chars)
  const norm = lower.replace(/[^a-z0-9 ]/g, '');
  for (const [key, url] of imageMap) {
    if (key.replace(/[^a-z0-9 ]/g, '') === norm) return url;
  }

  // Partial / contains match
  for (const [key, url] of imageMap) {
    if (key.includes(norm) || norm.includes(key)) return url;
  }

  return '';
}

// ─── Load from DB via edge function ───────────────────────────────────

async function loadFromDb(
  gameId: string,
  cardType: string,
): Promise<DbRow[]> {
  try {
    const { data, error } = await supabase.functions.invoke(
      'game-card-loader',
      {
        body: { action: 'get-cards', gameId, cardType },
      },
    );
    if (error) {
      console.warn(
        `[AdultShitoService] Edge function error for ${gameId}/${cardType}:`,
        error,
      );
      return [];
    }
    const rows = extractCards(data);
    console.log(
      `[AdultShitoService] Loaded ${rows.length} rows for ${gameId}/${cardType}`,
    );
    return rows;
  } catch (err) {
    console.warn(
      `[AdultShitoService] Exception loading ${gameId}/${cardType}:`,
      err,
    );
    return [];
  }
}

/** Convert DB rows → CallingCard[], optionally enriching with storage images */
function dbRowsToCallingCards(
  rows: DbRow[],
  imageMap?: Map<string, string>,
): CallingCard[] {
  return rows.map((row, idx) => {
    const meta = row.metadata || {};
    const name = row.card_name || `Card ${idx + 1}`;
    let url =
      meta.imageUrl || meta.image_url || meta.url || '';

    // Try storage image resolution
    if (!url && imageMap) {
      url = resolveImageUrl(name, imageMap);
    }

    return {
      id: `cc-${row.card_number ?? idx}`,
      name,
      url,
    };
  });
}

/** Convert DB rows → BingoCard[] (icon pool), optionally enriching with storage images */
function dbRowsToBingoIcons(
  rows: DbRow[],
  imageMap?: Map<string, string>,
): BingoCard[] {
  return rows.map((row, idx) => {
    const meta = row.metadata || {};
    const name = row.card_name || `Icon ${idx + 1}`;
    let url =
      meta.imageUrl || meta.image_url || meta.url || '';

    if (!url && imageMap) {
      url = resolveImageUrl(name, imageMap);
    }

    return {
      id: `bi-${row.card_number ?? idx}`,
      name,
      url,
    };
  });
}

// ─── Storage-only loader (original approach) ──────────────────────────

async function loadCallingCardsFromStorage(): Promise<{
  cards: CallingCard[];
  folder: string;
} | null> {
  const result = await probeStorageFolders(CALLING_CARD_FOLDERS, 1);
  if (!result) return null;

  const cards: CallingCard[] = [];
  let idx = 0;
  for (const [key, url] of result.imageMap) {
    const displayName = key
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
    cards.push({ id: `cc-${idx}`, name: displayName, url });
    idx++;
  }
  return { cards, folder: result.folder };
}

async function loadBingoIconsFromStorage(): Promise<{
  icons: BingoCard[];
  folder: string;
} | null> {
  // Try bingo folders first
  let result = await probeStorageFolders(BINGO_CARD_FOLDERS, 25);
  // Fall back to calling card folders
  if (!result) result = await probeStorageFolders(CALLING_CARD_FOLDERS, 25);
  if (!result) return null;

  const icons: BingoCard[] = [];
  let idx = 0;
  for (const [key, url] of result.imageMap) {
    const displayName = key
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());
    icons.push({ id: `bi-${idx}`, name: displayName, url });
    idx++;
  }
  return { icons, folder: result.folder };
}

// ─── Fallback icons ───────────────────────────────────────────────────

function getFallbackCallingCards(): CallingCard[] {
  return FALLBACK_ICONS.map((icon, i) => ({
    id: `fallback-${i}`,
    name: icon.name,
    url: '',
  }));
}

function getFallbackBingoIcons(): BingoCard[] {
  return FALLBACK_ICONS.map((icon, i) => ({
    id: `fallback-bi-${i}`,
    name: icon.name,
    url: '',
  }));
}

// ─── Main loader ──────────────────────────────────────────────────────

/**
 * Load all Adult SHITO cards with cascading fallback:
 *   1. DB adult-shito
 *   2. DB shito (regular)
 *   3. Storage images
 *   4. Hardcoded fallback icons
 */
export async function loadAdultShitoCards(): Promise<AdultShitoLoadResult> {
  // Pre-load storage image maps in parallel (we'll use them for enrichment or fallback)
  const [callingImgResult, bingoImgResult] = await Promise.all([
    probeStorageFolders(CALLING_CARD_FOLDERS, 1),
    probeStorageFolders([...BINGO_CARD_FOLDERS, ...CALLING_CARD_FOLDERS], 1),
  ]);

  const callingImageMap = callingImgResult?.imageMap;
  const bingoImageMap = bingoImgResult?.imageMap || callingImageMap;

  // ── 1. Try DB: adult-shito ──────────────────────────────────────────
  const [adultCallingRows, adultBingoRows] = await Promise.all([
    loadFromDb('adult-shito', 'calling-cards'),
    loadFromDb('adult-shito', 'bingo-cards'),
  ]);

  if (adultCallingRows.length > 0) {
    const callingCards = dbRowsToCallingCards(adultCallingRows, callingImageMap);
    // For bingo icons: if we have dedicated bingo rows, use them; otherwise reuse calling cards as icon pool
    let bingoIcons: BingoCard[];
    if (adultBingoRows.length >= 25) {
      bingoIcons = dbRowsToBingoIcons(adultBingoRows, bingoImageMap);
    } else {
      // Use calling cards as the bingo icon pool (same as regular SHITO)
      bingoIcons = callingCards.map((c, i) => ({
        id: `bi-${i}`,
        name: c.name,
        url: c.url,
      }));
    }

    console.log(
      `[AdultShitoService] Loaded from DB adult-shito: ${callingCards.length} calling, ${bingoIcons.length} bingo icons`,
    );
    return {
      callingCards,
      bingoIcons,
      source: 'db-adult-shito',
      sourceDetail: `${callingCards.length} calling cards, ${bingoIcons.length} bingo icons from adult-shito DB`,
      useFallback: false,
    };
  }

  // ── 2. Try DB: regular shito ────────────────────────────────────────
  const [shitoCallingRows, shitoBingoRows] = await Promise.all([
    loadFromDb('shito', 'calling-cards'),
    loadFromDb('shito', 'bingo-cards'),
  ]);

  if (shitoCallingRows.length > 0) {
    const callingCards = dbRowsToCallingCards(shitoCallingRows, callingImageMap);
    let bingoIcons: BingoCard[];
    if (shitoBingoRows.length >= 25) {
      bingoIcons = dbRowsToBingoIcons(shitoBingoRows, bingoImageMap);
    } else {
      bingoIcons = callingCards.map((c, i) => ({
        id: `bi-${i}`,
        name: c.name,
        url: c.url,
      }));
    }

    console.log(
      `[AdultShitoService] Loaded from DB shito (fallback): ${callingCards.length} calling, ${bingoIcons.length} bingo icons`,
    );
    return {
      callingCards,
      bingoIcons,
      source: 'db-shito',
      sourceDetail: `${callingCards.length} calling cards, ${bingoIcons.length} bingo icons from shito DB (adult-shito not yet populated)`,
      useFallback: false,
    };
  }

  // ── 3. Try storage images ───────────────────────────────────────────
  const [storageCallingResult, storageBingoResult] = await Promise.all([
    loadCallingCardsFromStorage(),
    loadBingoIconsFromStorage(),
  ]);

  if (storageCallingResult && storageCallingResult.cards.length > 0) {
    const callingCards = storageCallingResult.cards;
    const bingoIcons =
      storageBingoResult && storageBingoResult.icons.length >= 25
        ? storageBingoResult.icons
        : callingCards.map((c, i) => ({
            id: `bi-${i}`,
            name: c.name,
            url: c.url,
          }));

    const folder = storageCallingResult.folder;
    console.log(
      `[AdultShitoService] Loaded from storage: ${callingCards.length} calling from ${folder}`,
    );
    return {
      callingCards,
      bingoIcons,
      source: 'storage',
      sourceDetail: `${callingCards.length} cards from storage (${folder})`,
      useFallback: false,
    };
  }

  // ── 4. Fallback icons ──────────────────────────────────────────────
  console.log('[AdultShitoService] Using fallback icons');
  return {
    callingCards: getFallbackCallingCards(),
    bingoIcons: getFallbackBingoIcons(),
    source: 'fallback',
    sourceDetail: 'Using default fallback icons',
    useFallback: true,
  };
}
