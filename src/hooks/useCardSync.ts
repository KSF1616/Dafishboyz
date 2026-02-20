import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { SyncedCard, CardAction, CardGameState } from '@/types/lobby';
import { GameCard } from '@/types/gameCards';

interface UseCardSyncProps {
  roomId: string | null;
  playerId: string;
  gameType: string;
  enabled?: boolean;
}

const createInitialState = (): CardGameState => ({
  deckCards: [],
  discardPile: [],
  tableCards: [],
  playerHands: {},
  currentDrawer: null,
  lastAction: null,
  shuffleSeed: Date.now()
});

export function useCardSync({ roomId, playerId, gameType, enabled = true }: UseCardSyncProps) {
  const [cardState, setCardState] = useState<CardGameState>(createInitialState());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const seededRandom = useCallback((seed: number) => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }, []);

  const shuffleWithSeed = useCallback(<T,>(arr: T[], seed: number): T[] => {
    const shuffled = [...arr];
    let currentSeed = seed;
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(currentSeed++) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, [seededRandom]);

  const broadcastAction = useCallback(async (action: CardAction, state: CardGameState) => {
    if (!roomId || !channelRef.current) return;
    channelRef.current.send({ type: 'broadcast', event: 'card_action', payload: { action, state } });
    await supabase.from('game_rooms').update({ game_data: { cardState: state }, updated_at: new Date().toISOString() }).eq('id', roomId);
  }, [roomId]);

  const initializeDeck = useCallback(async (cards: GameCard[], seed?: number) => {
    const shuffleSeed = seed || Date.now();
    const syncedCards: SyncedCard[] = cards.map((card, idx) => ({
      id: `${card.id}-${idx}`, cardId: card.id, ownerId: null, location: 'deck' as const, position: idx, isFlipped: false,
      metadata: { cardType: card.card_type, fileName: card.file_name }
    }));
    const shuffled = shuffleWithSeed(syncedCards, shuffleSeed).map((c, i) => ({ ...c, position: i }));
    const newState: CardGameState = { deckCards: shuffled, discardPile: [], tableCards: [], playerHands: {}, currentDrawer: null, lastAction: null, shuffleSeed };
    setCardState(newState);
    setIsInitialized(true);
    if (roomId) await broadcastAction({ type: 'shuffle', playerId, cardIds: [], timestamp: Date.now() }, newState);
    return newState;
  }, [playerId, roomId, shuffleWithSeed, broadcastAction]);

  // Subscribe to realtime channel
  useEffect(() => {
    if (!roomId || !enabled) return;

    const channel = supabase.channel(`cards:${roomId}`)
      .on('broadcast', { event: 'card_action' }, ({ payload }) => {
        if (payload?.state) {
          setCardState(payload.state);
          setIsSyncing(false);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Fetch existing state from room
          const { data } = await supabase.from('game_rooms').select('game_data').eq('id', roomId).single();
          if (data?.game_data?.cardState) {
            setCardState(data.game_data.cardState);
            setIsInitialized(true);
          }
        }
      });

    channelRef.current = channel;
    return () => { supabase.removeChannel(channel); channelRef.current = null; };
  }, [roomId, enabled]);

  return { cardState, setCardState, isInitialized, isSyncing, setIsSyncing, initializeDeck, broadcastAction, channelRef };
}

export default useCardSync;
