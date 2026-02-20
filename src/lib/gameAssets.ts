/**
 * Centralized Game Assets Configuration
 * 
 * This file provides a single source of truth for all game asset URLs,
 * bucket names, and folder paths. It normalizes game IDs and provides
 * consistent access to Supabase storage assets.
 */

// Base Supabase URL
export const SUPABASE_URL = 'https://yrfjejengmkqpjbluexn.supabase.co';

// Signed URLs with long-expiry tokens for game assets
export const GAME_ASSET_URLS = {
  // SHITO Game Assets
  shito: {
    callingCards: `${SUPABASE_URL}/storage/v1/object/sign/game-cards/SHITO-calling-cards-singles/shito-calling-cards.xlsx?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ODhkOTE0OC02YWU5LTQ0MjItODg0NC00ZDI2YTk1MjA5MTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJnYW1lLWNhcmRzL1NISVRPLWNhbGxpbmctY2FyZHMtc2luZ2xlcy9zaGl0by1jYWxsaW5nLWNhcmRzLnhsc3giLCJpYXQiOjE3NzAxNjYyNTAsImV4cCI6MTkyNzg0NjI1MH0.MWGaT6DKDs4YfngDMBXXMhYp3SZVjlucDWzOSBGJ5iI`,
    bingoCards: `${SUPABASE_URL}/storage/v1/object/sign/game-cards/shito-bingo-cards/shito-bingo-cards.xlsx?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ODhkOTE0OC02YWU5LTQ0MjItODg0NC00ZDI2YTk1MjA5MTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJnYW1lLWNhcmRzL3NoaXRvLWJpbmdvLWNhcmRzL3NoaXRvLWJpbmdvLWNhcmRzLnhsc3giLCJpYXQiOjE3NzAxNjY3MTMsImV4cCI6MTkyNzg0NjcxM30.cQYDDUwTFemc3Fk6omot6rBesW2cCPf0DdPUYS2Ot0s`,
    // Storage paths for dynamic loading
    callingCardsFolder: 'SHITO-calling-cards-singles',
    bingoCardsFolder: 'shito-bingo-cards',
  },
  
  // Shitz Creek Game Assets (normalized from "up-shitz-creek")
  'shitz-creek': {
    board: `${SUPABASE_URL}/storage/v1/object/sign/Game%20Boards/shitz-creek-board.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ODhkOTE0OC02YWU5LTQ0MjItODg0NC00ZDI2YTk1MjA5MTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJHYW1lIEJvYXJkcy9zaGl0ei1jcmVlay1ib2FyZC5wbmciLCJpYXQiOjE3NzAxNjExNjUsImV4cCI6MTkyNzg0MTE2NX0.Xn3sx9I6C0ohj7_owafAE_Wfgm6vlzUIBgocwx5VYpE`,
    shitPileCards: `${SUPABASE_URL}/storage/v1/object/sign/game-cards/up-shitz-creek-shit-pile-cards/up-shitz-creek-shit-pile-cards.xlsx?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ODhkOTE0OC02YWU5LTQ0MjItODg0NC00ZDI2YTk1MjA5MTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJnYW1lLWNhcmRzL3VwLXNoaXR6LWNyZWVrLXNoaXQtcGlsZS1jYXJkcy91cC1zaGl0ei1jcmVlay1zaGl0LXBpbGUtY2FyZHMueGxzeCIsImlhdCI6MTc3MDE2NzA2MiwiZXhwIjoxOTI3ODQ3MDYyfQ.obTRupX09a58hWUbicyfBRyaIF5K8-raWWocqok-k8Q`,
    // Storage paths for dynamic loading
    boardBucket: 'Game Boards',
    boardFile: 'shitz-creek-board.png',
    cardsFolder: 'up-shitz-creek-shit-pile-cards',
  },
  
  // Slanging Shit Game Assets (normalized from "slanging-cards")
  'slanging-shit': {
    charadesCards: `${SUPABASE_URL}/storage/v1/object/sign/game-cards/slanging-shit-cards/slanging-shit-cards.xlsx?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ODhkOTE0OC02YWU5LTQ0MjItODg0NC00ZDI2YTk1MjA5MTciLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJnYW1lLWNhcmRzL3NsYW5naW5nLXNoaXQtY2FyZHMvc2xhbmdpbmctc2hpdC1jYXJkcy54bHN4IiwiaWF0IjoxNzcwMTY3MzM0LCJleHAiOjE5Mjc4NDczMzR9.c06BE3rp9BazDbcAjFQHXkf3m1Du7CYd_GFcUtauLRs`,
    // Storage paths for dynamic loading
    cardsFolder: 'slanging-shit-cards',
  },
};

// Bucket configurations
export const STORAGE_BUCKETS = {
  gameCards: 'game-cards',
  gameBoards: 'Game Boards', // Note: Has space in name
  audio: 'audio',
  marketing: 'marketing',
};

// Game ID normalization map - converts various game ID formats to canonical form
export const GAME_ID_ALIASES: Record<string, string> = {
  // Shitz Creek aliases
  'up-shitz-creek': 'shitz-creek',
  'upshitzcreek': 'shitz-creek',
  'shitzcreek': 'shitz-creek',
  'shitz-creek': 'shitz-creek',
  
  // Slanging Shit aliases
  'slanging-cards': 'slanging-shit',
  'slanging-shit-cards': 'slanging-shit',
  'slanging-shit-charades-cards': 'slanging-shit',
  'slanging-shit': 'slanging-shit',
  'slangingshit': 'slanging-shit',
  
  // SHITO aliases
  'shito': 'shito',
  'SHITO': 'shito',
  
  // O'Craps aliases
  'o-craps': 'o-craps',
  'ocraps': 'o-craps',
  
  // Let That Shit Go aliases
  'let-that-shit-go': 'let-that-shit-go',
  'letgo': 'let-that-shit-go',
  'letthatshitgo': 'let-that-shit-go',
};

/**
 * Normalize a game ID to its canonical form
 */
export function normalizeGameId(gameId: string): string {
  const lowerId = gameId.toLowerCase().trim();
  return GAME_ID_ALIASES[lowerId] || GAME_ID_ALIASES[gameId] || gameId;
}

/**
 * Get the display name for a game
 */
export function getGameDisplayName(gameId: string): string {
  const normalized = normalizeGameId(gameId);
  const names: Record<string, string> = {
    'shitz-creek': 'Up Shitz Creek',
    'shito': 'SHITO',
    'slanging-shit': 'Slanging Shit',
    'o-craps': "O'Craps",
    'let-that-shit-go': 'Let That Shit Go',
  };
  return names[normalized] || gameId;
}

/**
 * Get asset URLs for a specific game
 */
export function getGameAssets(gameId: string) {
  const normalized = normalizeGameId(gameId);
  
  switch (normalized) {
    case 'shitz-creek':
      return GAME_ASSET_URLS['shitz-creek'];
    case 'shito':
      return GAME_ASSET_URLS.shito;
    case 'slanging-shit':
      return GAME_ASSET_URLS['slanging-shit'];
    default:
      return null;
  }
}

/**
 * Get the Shitz Creek board image URL
 */
export function getShitzCreekBoardUrl(): string {
  return GAME_ASSET_URLS['shitz-creek'].board;
}

/**
 * Get the Shitz Creek shit pile cards URL
 */
export function getShitzCreekCardsUrl(): string {
  return GAME_ASSET_URLS['shitz-creek'].shitPileCards;
}

/**
 * Get SHITO calling cards URL
 */
export function getShitoCallingCardsUrl(): string {
  return GAME_ASSET_URLS.shito.callingCards;
}

/**
 * Get SHITO bingo cards URL
 */
export function getShitoBingoCardsUrl(): string {
  return GAME_ASSET_URLS.shito.bingoCards;
}

/**
 * Get Slanging Shit charades cards URL
 */
export function getSlangingShitCardsUrl(): string {
  return GAME_ASSET_URLS['slanging-shit'].charadesCards;
}

/**
 * Storage folder paths for each game's assets
 */
export const GAME_STORAGE_PATHS = {
  'shitz-creek': {
    board: {
      bucket: 'Game Boards',
      path: 'shitz-creek-board.png',
    },
    cards: {
      bucket: 'game-cards',
      folder: 'up-shitz-creek-shit-pile-cards',
    },
  },
  'shito': {
    callingCards: {
      bucket: 'game-cards',
      folder: 'SHITO-calling-cards-singles',
    },
    bingoCards: {
      bucket: 'game-cards',
      folder: 'shito-bingo-cards',
    },
  },
  'slanging-shit': {
    cards: {
      bucket: 'game-cards',
      folder: 'slanging-shit-cards',
    },
  },
};

/**
 * Get storage path configuration for a game
 */
export function getGameStoragePaths(gameId: string) {
  const normalized = normalizeGameId(gameId);
  return GAME_STORAGE_PATHS[normalized as keyof typeof GAME_STORAGE_PATHS] || null;
}

/**
 * Check if a game ID matches a specific game (handles aliases)
 */
export function isGame(gameId: string, targetGame: string): boolean {
  return normalizeGameId(gameId) === normalizeGameId(targetGame);
}

/**
 * Check if game is Shitz Creek (handles up-shitz-creek alias)
 */
export function isShitzCreek(gameId: string): boolean {
  return isGame(gameId, 'shitz-creek');
}

/**
 * Check if game is Slanging Shit (handles slanging-cards alias)
 */
export function isSlangingShit(gameId: string): boolean {
  return isGame(gameId, 'slanging-shit');
}
