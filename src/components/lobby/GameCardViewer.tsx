import React, { useState, useEffect, useCallback } from 'react';
import { X, Loader2, AlertCircle, Shuffle, Hand, Eye, Play, RefreshCw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { games } from '@/data/gamesData';
import { GameCard } from '@/types/gameCards';
import { SyncedCard, CardGameState } from '@/types/lobby';
import { useLobby } from '@/contexts/LobbyContext';
import PlayingCard from './PlayingCard';
import CardPile from './CardPile';
import CardZoomModal from './CardZoomModal';

interface GameCardViewerProps {
  isOpen: boolean;
  onClose: () => void;
  gameType: string;
  mode?: 'view' | 'play';
}

export default function GameCardViewer({ isOpen, onClose, gameType, mode: initialMode = 'view' }: GameCardViewerProps) {
  const { currentRoom, playerId, playerName, cardGameState, updateCardGameState, players = [] } = useLobby();
  const [loading, setLoading] = useState(true);
  const [allCards, setAllCards] = useState<GameCard[]>([]);
  const [zoomCard, setZoomCard] = useState<GameCard | null>(null);
  const [mode, setMode] = useState(initialMode);
  const [localState, setLocalState] = useState<CardGameState | null>(null);
  
  const gameName = games.find(g => g.id === gameType || g.slug === gameType)?.name || 'Game';
  const effectiveState = cardGameState || localState;
  const safePlayers = Array.isArray(players) ? players : [];
  const myHand = effectiveState?.playerHands?.[playerId] || [];

  useEffect(() => {
    if (isOpen) fetchCards();
  }, [isOpen, gameType]);

  useEffect(() => {
    if (cardGameState) setLocalState(cardGameState);
  }, [cardGameState]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('game_cards').select('*').eq('game_id', gameType).order('uploaded_at', { ascending: false });
      if (data) setAllCards(data);
    } catch (err) { console.error('Error fetching cards:', err); }
    setLoading(false);
  };

  const initializeDeck = useCallback(async () => {
    const seed = Date.now();
    const syncedCards: SyncedCard[] = allCards.map((card, idx) => ({
      id: `${card.id}-${idx}`, cardId: card.id, ownerId: null, location: 'deck' as const,
      position: idx, isFlipped: false, metadata: { cardType: card.card_type, fileName: card.file_name }
    }));
    const shuffled = shuffleWithSeed(syncedCards, seed).map((c, i) => ({ ...c, position: i }));
    const newState: CardGameState = { deckCards: shuffled, discardPile: [], tableCards: [], playerHands: {}, currentDrawer: null, lastAction: null, shuffleSeed: seed };
    setLocalState(newState);
    if (currentRoom) await updateCardGameState(newState, { type: 'shuffle', playerId, cardIds: [], timestamp: seed });
  }, [allCards, currentRoom, playerId, updateCardGameState]);

  const shuffleWithSeed = <T,>(arr: T[], seed: number): T[] => {
    const shuffled = [...arr];
    let s = seed;
    for (let i = shuffled.length - 1; i > 0; i--) {
      const x = Math.sin(s++) * 10000;
      const j = Math.floor((x - Math.floor(x)) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleDraw = useCallback(async () => {
    if (!effectiveState || effectiveState.deckCards.length === 0) return;
    const [drawn, ...rest] = effectiveState.deckCards;
    const drawnCard: SyncedCard = { ...drawn, ownerId: playerId, location: 'hand', isFlipped: true };
    const newState: CardGameState = {
      ...effectiveState, deckCards: rest,
      playerHands: { ...effectiveState.playerHands, [playerId]: [...myHand, drawnCard] },
      lastAction: { type: 'draw', playerId, cardIds: [drawn.id], from: 'deck', to: 'hand', timestamp: Date.now() }
    };
    setLocalState(newState);
    if (currentRoom) await updateCardGameState(newState, newState.lastAction!);
  }, [effectiveState, playerId, myHand, currentRoom, updateCardGameState]);

  const handleDiscard = useCallback(async (card: SyncedCard) => {
    if (!effectiveState) return;
    const discarded: SyncedCard = { ...card, location: 'discard', ownerId: null, isFlipped: true };
    const newHand = myHand.filter(c => c.id !== card.id);
    const newState: CardGameState = {
      ...effectiveState, discardPile: [discarded, ...effectiveState.discardPile],
      playerHands: { ...effectiveState.playerHands, [playerId]: newHand },
      lastAction: { type: 'discard', playerId, cardIds: [card.id], from: 'hand', to: 'discard', timestamp: Date.now() }
    };
    setLocalState(newState);
    if (currentRoom) await updateCardGameState(newState, newState.lastAction!);
  }, [effectiveState, playerId, myHand, currentRoom, updateCardGameState]);

  const getCardData = (syncedCard: SyncedCard): GameCard | undefined => 
    allCards.find(c => c.id === syncedCard.cardId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white">{gameName} Cards</h2>
            {currentRoom && <span className="px-2 py-1 bg-green-600/30 text-green-400 text-xs rounded-full flex items-center gap-1"><Users className="w-3 h-3" /> Synced</span>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant={mode === 'view' ? 'default' : 'outline'} size="sm" onClick={() => setMode('view')} className={mode === 'view' ? 'bg-purple-600' : ''}><Eye className="w-4 h-4 mr-1" /> View</Button>
            <Button variant={mode === 'play' ? 'default' : 'outline'} size="sm" onClick={() => setMode('play')} className={mode === 'play' ? 'bg-green-600' : ''}><Play className="w-4 h-4 mr-1" /> Play</Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-gray-700"><X className="w-5 h-5" /></Button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>
        ) : allCards.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400"><AlertCircle className="w-12 h-12 mb-4" /><p>No cards uploaded for {gameName}</p></div>
        ) : mode === 'play' ? (
          <PlayMode state={effectiveState} myHand={myHand} onDraw={handleDraw} onDiscard={handleDiscard} onInit={initializeDeck} onZoom={setZoomCard} getCardData={getCardData} players={safePlayers} playerId={playerId} />
        ) : (

          <ViewMode cards={allCards} onZoom={setZoomCard} />
        )}
      </div>
      <CardZoomModal isOpen={!!zoomCard} onClose={() => setZoomCard(null)} card={zoomCard} />
    </div>
  );
}

function PlayMode({ state, myHand, onDraw, onDiscard, onInit, onZoom, getCardData, players, playerId }: any) {
  // Safety check for players array
  const safePlayers = Array.isArray(players) ? players : [];
  
  if (!state || state.deckCards.length === 0 && myHand.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        <Shuffle className="w-16 h-16 text-purple-400 mb-4" />
        <p className="text-gray-400 mb-4">Initialize the deck to start playing</p>
        <Button onClick={onInit} className="bg-purple-600 hover:bg-purple-700"><RefreshCw className="w-4 h-4 mr-2" /> Initialize & Shuffle Deck</Button>
      </div>
    );
  }
  
  // Safety check for playerHands
  const playerHands = state?.playerHands || {};
  
  return (
    <div className="flex-1 p-6 overflow-auto">
      <div className="flex justify-center gap-12 mb-6">
        <CardPile cards={state.deckCards || []} type="draw" onDraw={onDraw} />
        <CardPile cards={state.discardPile || []} type="discard" />
      </div>
      {Object.entries(playerHands).map(([pid, hand]: [string, any]) => {
        const player = safePlayers.find((p: any) => p?.player_id === pid);
        const isMe = pid === playerId;
        const safeHand = Array.isArray(hand) ? hand : [];
        
        return (
          <div key={pid} className={`mb-4 p-4 rounded-xl ${isMe ? 'bg-purple-900/30 border border-purple-500/50' : 'bg-gray-800/50'}`}>
            <div className="flex items-center gap-2 mb-3"><Hand className="w-5 h-5 text-purple-400" /><span className="text-white font-medium">{isMe ? 'Your Hand' : player?.player_name || 'Player'} ({safeHand.length})</span></div>
            <div className="flex flex-wrap gap-3">
              {safeHand.map((card: SyncedCard) => {
                const cardData = getCardData(card);
                return (
                  <div key={card.id} className="relative group">
                    <PlayingCard card={cardData} isFlipped={isMe ? card.isFlipped : false} onClick={() => isMe && onZoom(cardData)} />
                    {isMe && <button onClick={() => onDiscard(card)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity">×</button>}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

    </div>
  );
}

function ViewMode({ cards, onZoom }: { cards: GameCard[]; onZoom: (c: GameCard) => void }) {
  const [filter, setFilter] = useState<'all' | 'prompt' | 'response'>('all');
  const filtered = filter === 'all' ? cards : cards.filter(c => c.card_type === filter);
  return (
    <div className="flex-1 p-4 overflow-auto">
      <div className="flex gap-2 mb-4">
        {['all', 'prompt', 'response'].map(f => (
          <Button key={f} onClick={() => setFilter(f as any)} variant={filter === f ? 'default' : 'outline'} className={filter === f ? 'bg-purple-600' : ''}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({f === 'all' ? cards.length : cards.filter(c => c.card_type === f).length})
          </Button>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.map(card => (
          <div key={card.id} className="bg-gray-800 rounded-lg p-3 hover:bg-gray-700 cursor-pointer transition-colors" onClick={() => onZoom(card)}>
            <div className={`h-32 rounded mb-2 flex items-center justify-center ${card.card_type === 'prompt' ? 'bg-purple-900/50' : 'bg-amber-900/50'}`}>
              {card.image_url ? <img src={card.image_url} alt={card.file_name} className="h-full w-full object-cover rounded" /> : <span className="text-4xl">📄</span>}
            </div>
            <p className="text-white text-sm truncate">{card.file_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
