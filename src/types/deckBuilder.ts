export interface DeckCard {
  id: string;
  game_id: string;
  card_type: 'prompt' | 'response';
  file_url: string;
  file_name: string;
  description?: string;
  category?: string;
}

export interface CardDeckConfig {
  id?: string;
  name: string;
  description: string;
  game_mode: string;
  min_cards: number;
  max_cards: number;
  card_ids: string[];
  card_order: number[];
  category_limits: Record<string, { min: number; max: number }>;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryBalance {
  category: string;
  count: number;
  percentage: number;
  suggested: number;
  status: 'good' | 'low' | 'high';
}

export interface DeckValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const GAME_MODES = [
  { id: 'standard', name: 'Standard', minCards: 30, maxCards: 60 },
  { id: 'quick', name: 'Quick Play', minCards: 20, maxCards: 40 },
  { id: 'party', name: 'Party Mode', minCards: 50, maxCards: 100 },
  { id: 'tournament', name: 'Tournament', minCards: 40, maxCards: 80 },
  { id: 'custom', name: 'Custom', minCards: 10, maxCards: 200 },
];

export const CATEGORY_SUGGESTIONS: Record<string, number> = {
  prompt: 30,
  response: 70,
};
