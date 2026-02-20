import { useCallback } from 'react';
import { SyncedCard, CardAction, CardGameState } from '@/types/lobby';

interface UseCardSyncActionsProps {
  cardState: CardGameState;
  setCardState: React.Dispatch<React.SetStateAction<CardGameState>>;
  playerId: string;
  broadcastAction: (action: CardAction, state: CardGameState) => Promise<void>;
}

export function useCardSyncActions({ cardState, setCardState, playerId, broadcastAction }: UseCardSyncActionsProps) {
  
  const drawCard = useCallback(async (count: number = 1) => {
    if (cardState.deckCards.length < count) return null;

    const drawnCards = cardState.deckCards.slice(0, count);
    const remainingDeck = cardState.deckCards.slice(count);
    
    const updatedDrawn: SyncedCard[] = drawnCards.map(card => ({
      ...card,
      ownerId: playerId,
      location: 'hand' as const,
      isFlipped: true
    }));

    const playerHand = cardState.playerHands[playerId] || [];
    const newState: CardGameState = {
      ...cardState,
      deckCards: remainingDeck,
      playerHands: {
        ...cardState.playerHands,
        [playerId]: [...playerHand, ...updatedDrawn]
      },
      lastAction: { type: 'draw', playerId, cardIds: drawnCards.map(c => c.id), from: 'deck', to: 'hand', timestamp: Date.now() }
    };

    setCardState(newState);
    await broadcastAction(newState.lastAction!, newState);
    return updatedDrawn;
  }, [cardState, playerId, setCardState, broadcastAction]);

  const discardCard = useCallback(async (cardId: string) => {
    const playerHand = cardState.playerHands[playerId] || [];
    const cardIndex = playerHand.findIndex(c => c.id === cardId);
    if (cardIndex === -1) return false;

    const card = playerHand[cardIndex];
    const discardedCard: SyncedCard = { ...card, location: 'discard', ownerId: null, isFlipped: true };
    const newHand = playerHand.filter(c => c.id !== cardId);

    const newState: CardGameState = {
      ...cardState,
      discardPile: [discardedCard, ...cardState.discardPile],
      playerHands: { ...cardState.playerHands, [playerId]: newHand },
      lastAction: { type: 'discard', playerId, cardIds: [cardId], from: 'hand', to: 'discard', timestamp: Date.now() }
    };

    setCardState(newState);
    await broadcastAction(newState.lastAction!, newState);
    return true;
  }, [cardState, playerId, setCardState, broadcastAction]);

  const playCard = useCallback(async (cardId: string) => {
    const playerHand = cardState.playerHands[playerId] || [];
    const card = playerHand.find(c => c.id === cardId);
    if (!card) return false;

    const playedCard: SyncedCard = { ...card, location: 'table', isFlipped: true };
    const newHand = playerHand.filter(c => c.id !== cardId);

    const newState: CardGameState = {
      ...cardState,
      tableCards: [...cardState.tableCards, playedCard],
      playerHands: { ...cardState.playerHands, [playerId]: newHand },
      lastAction: { type: 'play', playerId, cardIds: [cardId], from: 'hand', to: 'table', timestamp: Date.now() }
    };

    setCardState(newState);
    await broadcastAction(newState.lastAction!, newState);
    return true;
  }, [cardState, playerId, setCardState, broadcastAction]);

  const reshuffleDiscard = useCallback(async () => {
    if (cardState.discardPile.length === 0) return;

    const seed = Date.now();
    const reshuffled = cardState.discardPile.map(c => ({ ...c, location: 'deck' as const, isFlipped: false, ownerId: null }));

    const newState: CardGameState = {
      ...cardState,
      deckCards: [...cardState.deckCards, ...reshuffled],
      discardPile: [],
      shuffleSeed: seed,
      lastAction: { type: 'shuffle', playerId, cardIds: reshuffled.map(c => c.id), timestamp: Date.now() }
    };

    setCardState(newState);
    await broadcastAction(newState.lastAction!, newState);
  }, [cardState, playerId, setCardState, broadcastAction]);

  return { drawCard, discardCard, playCard, reshuffleDiscard };
}

export default useCardSyncActions;
