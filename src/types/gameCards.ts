export type CardType = 'prompt' | 'response';

export interface GameCard {
  id: string;
  game_id: string;
  card_type: CardType;
  file_url: string;
  file_name: string;
  uploaded_at: string;
  uploaded_by: string;
  file_size?: number;
  page_count?: number;
  description?: string;
}

export interface GameCardInsert {
  game_id: string;
  card_type: CardType;
  file_url: string;
  file_name: string;
  file_size?: number;
  page_count?: number;
  description?: string;
}

export interface GameCardUpdate {
  card_type?: CardType;
  description?: string;
  file_url?: string;
  file_name?: string;
}

// Gameplay card types
export interface PlayableCard {
  id: string;
  cardData: GameCard;
  isFlipped: boolean;
  isInHand: boolean;
  isDiscarded: boolean;
  position: number;
}

export interface CardDeck {
  drawPile: PlayableCard[];
  discardPile: PlayableCard[];
  playerHands: Record<string, PlayableCard[]>;
}

export interface CardGameState {
  deck: CardDeck;
  currentPrompt: PlayableCard | null;
  selectedResponses: Record<string, PlayableCard>;
  roundNumber: number;
  phase: 'drawing' | 'selecting' | 'judging' | 'scoring';
}
