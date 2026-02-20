/**
 * Persistent card deck manager for Up Shitz Creek.
 *
 * Instead of drawing randomly with replacement, this tracks a draw pile and
 * discard pile like a real physical card deck. When the draw pile is exhausted
 * the discard pile is shuffled back in.
 *
 * The DeckState is stored inside gameData so it persists across turns and
 * syncs in multiplayer via the lobby's realtime channel.
 */

// ─── Types ────────────────────────────────────────────────────────────

export interface DeckState {
  /** Card IDs remaining in the draw pile (top of deck = index 0). */
  drawPile: string[];
  /** Card IDs that have been drawn and are in the discard pile. */
  discardPile: string[];
  /** Total number of unique cards in the full deck. */
  totalCards: number;
  /** Timestamp (ms) of the last reshuffle – used to trigger animations. */
  lastShuffled: number;
  /** How many times the deck has been reshuffled from discard. */
  reshuffleCount: number;
}

// ─── Fisher-Yates shuffle ─────────────────────────────────────────────

export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ─── Initialise a fresh deck ──────────────────────────────────────────

/**
 * Create an initial DeckState from a list of card IDs.
 * All cards are shuffled into the draw pile; discard is empty.
 */
export function initializeDeck(cardIds: string[]): DeckState {
  return {
    drawPile: shuffleArray(cardIds),
    discardPile: [],
    totalCards: cardIds.length,
    lastShuffled: Date.now(),
    reshuffleCount: 0,
  };
}

// ─── Draw a card ──────────────────────────────────────────────────────

export interface DrawResult {
  /** The ID of the drawn card. `null` if the deck is completely empty (no cards at all). */
  cardId: string | null;
  /** The updated deck state after drawing. */
  deckState: DeckState;
  /** Whether a reshuffle happened before this draw. */
  reshuffled: boolean;
}

/**
 * Draw the top card from the draw pile.
 *
 * If the draw pile is empty, the discard pile is shuffled back in first
 * (a "reshuffle"). If both piles are empty, returns `cardId: null`.
 */
export function drawFromDeck(deck: DeckState): DrawResult {
  let drawPile = [...deck.drawPile];
  let discardPile = [...deck.discardPile];
  let reshuffled = false;
  let lastShuffled = deck.lastShuffled;
  let reshuffleCount = deck.reshuffleCount;

  // If draw pile is empty, reshuffle discard back in
  if (drawPile.length === 0) {
    if (discardPile.length === 0) {
      // No cards at all
      return {
        cardId: null,
        deckState: { ...deck },
        reshuffled: false,
      };
    }

    drawPile = shuffleArray(discardPile);
    discardPile = [];
    reshuffled = true;
    lastShuffled = Date.now();
    reshuffleCount += 1;
  }

  // Draw the top card
  const cardId = drawPile.shift()!;
  discardPile.push(cardId);

  return {
    cardId,
    deckState: {
      drawPile,
      discardPile,
      totalCards: deck.totalCards,
      lastShuffled,
      reshuffleCount,
    },
    reshuffled,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────

/** Check whether the draw pile is empty (a reshuffle will happen on next draw). */
export function isDeckEmpty(deck: DeckState): boolean {
  return deck.drawPile.length === 0;
}

/** Number of cards remaining in the draw pile. */
export function cardsRemaining(deck: DeckState): number {
  return deck.drawPile.length;
}

/** Number of cards in the discard pile. */
export function cardsDiscarded(deck: DeckState): number {
  return deck.discardPile.length;
}
