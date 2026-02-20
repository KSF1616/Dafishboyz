/**
 * Game Card Service
 * 
 * Provides functions to fetch parsed game card data from the database.
 * Cards are pre-parsed from Excel files and stored in the parsed_game_cards table.
 * 
 * Table schema (13 columns):
 * id, game_id, card_type, card_name, card_text, card_effect, 
 * card_category, card_number, drink_count, metadata, source_file, 
 * created_at, updated_at
 */

import { supabase } from './supabase';
import { normalizeGameId, GAME_ASSET_URLS } from './gameAssets';

export interface ParsedGameCard {
  id: string;
  game_id: string;
  card_type: string;
  card_name: string | null;
  card_text: string | null;
  card_effect: string | null;
  card_category: string | null;
  card_number: number | null;
  drink_count: number;
  metadata: Record<string, unknown>;
  source_file: string;
  created_at: string;
  updated_at: string;
}

export interface CardQueryOptions {
  gameId?: string;
  cardType?: string;
  category?: string;
  limit?: number;
  offset?: number;
  shuffle?: boolean;
}

/**
 * Test if the parsed_game_cards table is accessible via PostgREST
 */
export async function testTableAccess(): Promise<{
  accessible: boolean;
  count: number | null;
  error: string | null;
  details: string;
}> {
  try {
    console.log('[GameCardService] Testing parsed_game_cards table access...');
    
    // Try a simple count query
    const { count, error, status, statusText } = await supabase
      .from('parsed_game_cards')
      .select('id', { count: 'exact', head: true });
    
    if (error) {
      console.error('[GameCardService] Table access error:', error);
      return {
        accessible: false,
        count: null,
        error: `${error.message} (code: ${error.code})`,
        details: `Status: ${status} ${statusText}. Hint: ${error.hint || 'none'}. Details: ${error.details || 'none'}`,
      };
    }
    
    console.log('[GameCardService] Table accessible! Count:', count);
    return {
      accessible: true,
      count: count,
      error: null,
      details: `Table is accessible via PostgREST. Current row count: ${count}`,
    };
  } catch (err) {
    console.error('[GameCardService] Table access exception:', err);
    return {
      accessible: false,
      count: null,
      error: String(err),
      details: 'Exception thrown during table access test',
    };
  }
}

/**
 * Test inserting a row directly into the table (and then delete it)
 */
export async function testTableInsert(): Promise<{
  canInsert: boolean;
  canDelete: boolean;
  error: string | null;
  details: string;
}> {
  const testId = `test-${Date.now()}`;
  
  try {
    console.log('[GameCardService] Testing direct insert into parsed_game_cards...');
    
    // Try inserting a test row
    const { data: insertData, error: insertError } = await supabase
      .from('parsed_game_cards')
      .insert({
        game_id: 'test',
        card_type: 'test',
        card_name: 'Connection Test Card',
        card_text: 'This is a test card to verify database write access',
        card_effect: null,
        card_category: 'test',
        card_number: 0,
        drink_count: 0,
        metadata: { test: true, timestamp: new Date().toISOString() },
        source_file: 'connection-test',
      })
      .select()
      .single();
    
    if (insertError) {
      console.error('[GameCardService] Insert test failed:', insertError);
      return {
        canInsert: false,
        canDelete: false,
        error: `Insert failed: ${insertError.message} (code: ${insertError.code})`,
        details: `Hint: ${insertError.hint || 'none'}. Details: ${insertError.details || 'none'}`,
      };
    }
    
    console.log('[GameCardService] Insert succeeded! Row:', insertData);
    
    // Clean up - delete the test row
    const { error: deleteError } = await supabase
      .from('parsed_game_cards')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.error('[GameCardService] Delete test failed:', deleteError);
      return {
        canInsert: true,
        canDelete: false,
        error: `Insert OK but delete failed: ${deleteError.message}`,
        details: `Test row with id ${insertData.id} was inserted but could not be deleted`,
      };
    }
    
    console.log('[GameCardService] Delete succeeded! Full read/write access confirmed.');
    return {
      canInsert: true,
      canDelete: true,
      error: null,
      details: 'Full read/write/delete access confirmed on parsed_game_cards table',
    };
  } catch (err) {
    console.error('[GameCardService] Insert test exception:', err);
    return {
      canInsert: false,
      canDelete: false,
      error: String(err),
      details: 'Exception thrown during insert test',
    };
  }
}

/**
 * Fetch game cards from the database
 */
export async function getGameCards(options: CardQueryOptions = {}): Promise<ParsedGameCard[]> {
  const { gameId, cardType, category, limit, offset, shuffle } = options;
  
  let query = supabase
    .from('parsed_game_cards')
    .select('*');
  
  if (gameId) {
    const normalizedId = normalizeGameId(gameId);
    query = query.eq('game_id', normalizedId);
  }
  
  if (cardType) {
    query = query.eq('card_type', cardType);
  }
  
  if (category) {
    query = query.eq('card_category', category);
  }
  
  // Order by card number for consistent ordering
  query = query.order('card_number', { ascending: true, nullsFirst: false });
  
  if (limit) {
    query = query.limit(limit);
  }
  
  if (offset) {
    query = query.range(offset, offset + (limit || 100) - 1);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('[GameCardService] Error fetching game cards:', error);
    throw error;
  }
  
  let cards = data || [];
  
  // Shuffle if requested
  if (shuffle && cards.length > 0) {
    cards = shuffleArray([...cards]);
  }
  
  return cards;
}

/**
 * Fetch SHITO calling cards
 */
export async function getShitoCallingCards(options: Omit<CardQueryOptions, 'gameId' | 'cardType'> = {}): Promise<ParsedGameCard[]> {
  return getGameCards({
    ...options,
    gameId: 'shito',
    cardType: 'calling-cards',
  });
}

/**
 * Fetch SHITO bingo cards
 */
export async function getShitoBingoCards(options: Omit<CardQueryOptions, 'gameId' | 'cardType'> = {}): Promise<ParsedGameCard[]> {
  return getGameCards({
    ...options,
    gameId: 'shito',
    cardType: 'bingo-cards',
  });
}

/**
 * Fetch Shitz Creek shit pile cards
 */
export async function getShitzCreekCards(options: Omit<CardQueryOptions, 'gameId' | 'cardType'> = {}): Promise<ParsedGameCard[]> {
  return getGameCards({
    ...options,
    gameId: 'shitz-creek',
    cardType: 'shit-pile-cards',
  });
}

/**
 * Fetch Slanging Shit charades cards
 */
export async function getSlangingShitCards(options: Omit<CardQueryOptions, 'gameId' | 'cardType'> = {}): Promise<ParsedGameCard[]> {
  return getGameCards({
    ...options,
    gameId: 'slanging-shit',
    cardType: 'charades-cards',
  });
}

/**
 * Get a random card from a specific game/type
 */
export async function getRandomCard(gameId: string, cardType: string): Promise<ParsedGameCard | null> {
  const cards = await getGameCards({ gameId, cardType, shuffle: true, limit: 1 });
  return cards[0] || null;
}

/**
 * Get card count for a specific game/type
 */
export async function getCardCount(gameId?: string, cardType?: string): Promise<number> {
  let query = supabase
    .from('parsed_game_cards')
    .select('id', { count: 'exact', head: true });
  
  if (gameId) {
    const normalizedId = normalizeGameId(gameId);
    query = query.eq('game_id', normalizedId);
  }
  
  if (cardType) {
    query = query.eq('card_type', cardType);
  }
  
  const { count, error } = await query;
  
  if (error) {
    console.error('[GameCardService] Error getting card count:', error);
    return 0;
  }
  
  return count || 0;
}

/**
 * Get all unique categories for a game/type
 */
export async function getCardCategories(gameId: string, cardType?: string): Promise<string[]> {
  const normalizedId = normalizeGameId(gameId);
  
  let query = supabase
    .from('parsed_game_cards')
    .select('card_category')
    .eq('game_id', normalizedId);
  
  if (cardType) {
    query = query.eq('card_type', cardType);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('[GameCardService] Error getting card categories:', error);
    return [];
  }
  
  // Get unique categories
  const categories = [...new Set(data?.map(d => d.card_category).filter(Boolean) || [])];
  return categories as string[];
}

/**
 * Trigger parsing of Excel files via edge function
 */
export async function parseExcelCards(
  action: 'parse' | 'parse-all' | 'clear' | 'list-assets' | 'get-cards' | 'check-table' | 'ping',
  options: {
    assetKey?: string;
    customUrl?: string;
    gameId?: string;
    cardType?: string;
  } = {}
): Promise<{
  success: boolean;
  results?: { key: string; success: boolean; count?: number; error?: string }[];
  cards?: ParsedGameCard[];
  assets?: { key: string; gameId: string; cardType: string }[];
  totalParsed?: number;
  message?: string;
  error?: string;
  debug?: Record<string, unknown>;
}> {
  console.log(`[GameCardService] Invoking parse-excel-cards with action: ${action}`, options);
  
  try {
    const { data, error } = await supabase.functions.invoke('parse-excel-cards', {
      body: {
        action,
        ...options,
      },
    });
    
    if (error) {
      console.error('[GameCardService] Edge function error:', error);
      // Check if it's a 504 timeout
      const errorStr = String(error);
      if (errorStr.includes('504') || errorStr.includes('timeout') || errorStr.includes('Gateway')) {
        return { 
          success: false, 
          error: `Edge function timed out (504). The function may be using an incorrect internal URL. Check the edge function logs in the Supabase dashboard for details.`,
          debug: { rawError: errorStr }
        };
      }
      return { success: false, error: errorStr, debug: { rawError: error } };
    }
    
    console.log('[GameCardService] Edge function response:', data);
    return data;
  } catch (err) {
    console.error('[GameCardService] Edge function exception:', err);
    return { success: false, error: String(err), debug: { exception: String(err) } };
  }
}

/**
 * Parse all configured Excel files
 */
export async function parseAllExcelCards() {
  return parseExcelCards('parse-all');
}

/**
 * Parse a specific Excel file by asset key
 */
export async function parseSingleExcelFile(assetKey: string) {
  return parseExcelCards('parse', { assetKey });
}

/**
 * Clear all parsed cards (or filter by game/type)
 */
export async function clearParsedCards(gameId?: string, cardType?: string) {
  // Try edge function first
  const result = await parseExcelCards('clear', { gameId, cardType });
  
  // If edge function fails, try direct delete
  if (!result.success) {
    console.log('[GameCardService] Edge function clear failed, trying direct delete...');
    try {
      let query = supabase.from('parsed_game_cards').delete();
      
      if (gameId) {
        query = query.eq('game_id', normalizeGameId(gameId));
      }
      if (cardType) {
        query = query.eq('card_type', cardType);
      }
      
      // Need a filter for delete - if no filters, delete where id is not null (all rows)
      if (!gameId && !cardType) {
        query = query.neq('id', '00000000-0000-0000-0000-000000000000');
      }
      
      const { error } = await query;
      
      if (error) {
        console.error('[GameCardService] Direct delete failed:', error);
        return { success: false, error: `Both edge function and direct delete failed. Edge: ${result.error}. Direct: ${error.message}` };
      }
      
      return { success: true, message: 'Cards cleared via direct delete (edge function was unavailable)' };
    } catch (err) {
      return { success: false, error: `All clear methods failed: ${String(err)}` };
    }
  }
  
  return result;
}

/**
 * List available assets that can be parsed
 */
export async function listParseableAssets() {
  // Try edge function first
  const result = await parseExcelCards('list-assets');
  
  // If edge function fails, return hardcoded asset list from gameAssets
  if (!result.success || !result.assets || result.assets.length === 0) {
    console.log('[GameCardService] Edge function list-assets failed, using hardcoded asset list');
    const assets = [
      {
        key: 'shito-calling-cards',
        gameId: 'shito',
        cardType: 'calling-cards',
        url: GAME_ASSET_URLS.shito.callingCards,
      },
      {
        key: 'shito-bingo-cards',
        gameId: 'shito',
        cardType: 'bingo-cards',
        url: GAME_ASSET_URLS.shito.bingoCards,
      },
      {
        key: 'shitz-creek-shit-pile-cards',
        gameId: 'shitz-creek',
        cardType: 'shit-pile-cards',
        url: GAME_ASSET_URLS['shitz-creek'].shitPileCards,
      },
      {
        key: 'slanging-shit-charades-cards',
        gameId: 'slanging-shit',
        cardType: 'charades-cards',
        url: GAME_ASSET_URLS['slanging-shit'].charadesCards,
      },
    ];
    
    return { 
      success: true, 
      assets,
      message: result.error ? `Using local asset list (edge function error: ${result.error})` : 'Using local asset list',
    };
  }
  
  return result;
}

// Utility function to shuffle an array
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
