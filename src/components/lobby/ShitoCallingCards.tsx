import React, { useState, useEffect } from 'react';
import { Loader2, Dices, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ShitoCallingCard,
  ShitoColumn,
  SHITO_COLUMNS,
  loadCallingCardsFromDb,
  drawRandomCallingCard,
  getColumnColor,
} from '@/lib/shitoCardService';
import { SHITO_ICONS } from '@/data/shitoIcons';

// ─── Re-export types for backward compat ──────────────────────────────

export type CallingCard = ShitoCallingCard;

// ─── Props ────────────────────────────────────────────────────────────

interface Props {
  onCardDrawn?: (card: ShitoCallingCard, column: ShitoColumn) => void;
  drawnCards: string[];
  isDrawing: boolean;
  currentCard: ShitoCallingCard | null;
  currentColumn?: ShitoColumn | null;
  /** Pre-loaded calling cards from the parent board — avoids a duplicate DB fetch */
  callingCards?: ShitoCallingCard[];
  /** Show link to the full Shito tools page */
  showToolsLink?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────

export default function ShitoCallingCards({
  onCardDrawn,
  drawnCards,
  isDrawing,
  currentCard,
  currentColumn,
  callingCards: parentCards,
  showToolsLink = true,
}: Props) {
  const [cards, setCards] = useState<ShitoCallingCard[]>(parentCards || []);
  const [loading, setLoading] = useState(!parentCards || parentCards.length === 0);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  // Sync with parent cards when they change
  useEffect(() => {
    if (parentCards && parentCards.length > 0) {
      setCards(parentCards);
      setLoading(false);
      setUseFallback(false);
      setError(null);
    }
  }, [parentCards]);

  // Only load from DB if parent didn't supply cards
  useEffect(() => {
    if (parentCards && parentCards.length > 0) return;
    loadCards();
  }, []);

  const loadCards = async () => {
    setLoading(true);
    setError(null);
    try {
      const dbCards = await loadCallingCardsFromDb();
      if (dbCards.length > 0) {
        setCards(dbCards);
        setUseFallback(false);
        console.log(`✅ Loaded ${dbCards.length} real SHITO calling cards from DB`);
      } else {
        loadFallback();
      }
    } catch (err: any) {
      console.error('Failed to load SHITO calling cards from DB:', err);
      setError(err?.message || 'Failed to load cards');
      loadFallback();
    }
    setLoading(false);
  };

  const loadFallback = () => {
    const fallbackCards: ShitoCallingCard[] = SHITO_ICONS.map((icon, i) => ({
      id: `fallback-${i}`,
      dbId: `fallback-${i}`,
      name: icon.name,
      iconId: icon.id,
      emoji: icon.emoji,
      color: icon.color,
      cardNumber: i + 1,
    }));
    setCards(fallbackCards);
    setUseFallback(true);
  };

  const availableCards = cards.filter(c => !drawnCards.includes(c.id));
  const shouldReshuffle = availableCards.length === 0 && cards.length > 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
        <p className="text-amber-300/60 text-xs mt-2">Loading calling cards from DB...</p>
      </div>
    );
  }

  return (
    <div className="bg-black/30 rounded-lg p-4">
      <h4 className="text-amber-300 font-bold text-sm mb-2 flex items-center gap-2">
        Calling Cards
        <span className="text-[10px] bg-amber-700/60 px-1.5 py-0.5 rounded-full text-amber-200">
          {cards.length}
        </span>
      </h4>

      {/* Error banner */}
      {error && (
        <div className="bg-red-900/40 border border-red-500/30 rounded p-2 mb-2 flex items-center gap-1.5 text-[10px] text-red-300">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{error}</span>
          <button onClick={loadCards} className="ml-auto flex-shrink-0">
            <RefreshCw className="w-3 h-3 hover:text-white" />
          </button>
        </div>
      )}

      {/* Column Display */}
      {currentColumn && (
        <div className="flex justify-center mb-2">
          <div
            className={`${getColumnColor(currentColumn)} text-white font-black text-xl px-4 py-1 rounded-lg animate-pulse`}
          >
            {currentColumn}
          </div>
        </div>
      )}

      {/* S-H-I-T-O Mini Headers */}
      <div className="flex justify-center gap-1 mb-2">
        {SHITO_COLUMNS.map(col => (
          <div
            key={col}
            className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center transition-all ${
              currentColumn === col
                ? `${getColumnColor(col)} text-white scale-110`
                : 'bg-white/20 text-white/60'
            }`}
          >
            {col}
          </div>
        ))}
      </div>

      {/* Current card display */}
      <div
        className={`relative aspect-[3/4] max-w-[120px] mx-auto bg-amber-800 rounded-lg overflow-hidden ${
          isDrawing ? 'animate-pulse' : ''
        }`}
      >
        {currentCard ? (
          currentCard.imageUrl ? (
            <img
              src={currentCard.imageUrl}
              alt={currentCard.name}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-700 to-amber-900">
              {currentCard.emoji ? (
                <span className="text-4xl">{currentCard.emoji}</span>
              ) : (
                <span className="text-2xl font-black text-amber-300">
                  {currentCard.name.charAt(0)}
                </span>
              )}
              <span className="text-xs text-amber-200 mt-1 px-1 text-center leading-tight">
                {currentCard.name}
              </span>
            </div>
          )
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-700 to-amber-900">
            <Dices className="w-8 h-8 text-amber-300" />
            <span className="text-xs text-amber-200 mt-1">Draw Card</span>
          </div>
        )}

        {/* Column badge on card */}
        {currentColumn && currentCard && (
          <div
            className={`absolute top-1 right-1 w-6 h-6 rounded flex items-center justify-center font-bold text-sm ${getColumnColor(
              currentColumn
            )} text-white`}
          >
            {currentColumn}
          </div>
        )}
      </div>

      <div className="mt-2 text-center">
        <p className="text-amber-200 text-xs">
          {shouldReshuffle
            ? 'Reshuffling deck...'
            : `${availableCards.length} of ${cards.length} cards remaining`}
        </p>
        {useFallback ? (
          <p className="text-amber-400/60 text-[10px] mt-1">Using fallback icons</p>
        ) : parentCards && parentCards.length > 0 ? (
          <p className="text-green-400/60 text-[10px] mt-1">Synced with game board</p>
        ) : (
          <p className="text-green-400/60 text-[10px] mt-1">Real cards from DB</p>
        )}
      </div>

      {/* Called cards history (mini) */}
      {drawnCards.length > 0 && (
        <div className="mt-3 border-t border-white/10 pt-2">
          <p className="text-[10px] text-amber-300/60 mb-1">
            Called: {drawnCards.length} / {cards.length}
          </p>
          <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
            {drawnCards.slice().reverse().slice(0, 12).map((id, idx) => {
              const card = cards.find(c => c.id === id);
              if (!card) return null;
              return (
                <div
                  key={id}
                  className={`w-6 h-6 rounded flex items-center justify-center text-[10px] ${
                    idx === 0 ? 'bg-amber-500/40 ring-1 ring-amber-400' : 'bg-white/10'
                  }`}
                  title={card.name}
                >
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={card.name} className="w-5 h-5 object-contain" />
                  ) : card.emoji ? (
                    <span className="text-xs">{card.emoji}</span>
                  ) : (
                    <span className="text-amber-300 font-bold">{card.name.charAt(0)}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Link to full tools page */}
      {showToolsLink && (
        <Link
          to="/shito-calling-cards"
          className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-amber-300 hover:text-amber-200 transition-colors bg-white/5 hover:bg-white/10 rounded-lg py-2"
        >
          <ExternalLink className="w-3 h-3" />
          Open Shito Tools (Print & Call)
        </Link>
      )}
    </div>
  );
}

// ─── Exported helper: draw a calling card ─────────────────────────────
// Used by ShitoBoard to draw a card during gameplay.
// Now loads from DB on first call and caches the deck.

let _cachedCallingCards: ShitoCallingCard[] | null = null;

export const drawCallingCard = async (
  drawnCards: string[],
  /** Optional pre-loaded cards to use instead of fetching from DB */
  preloadedCards?: ShitoCallingCard[]
): Promise<{ card: ShitoCallingCard | null; column: ShitoColumn }> => {
  // Use preloaded cards if provided
  if (preloadedCards && preloadedCards.length > 0) {
    _cachedCallingCards = preloadedCards;
  }

  // Load & cache the deck on first draw
  if (!_cachedCallingCards) {
    try {
      _cachedCallingCards = await loadCallingCardsFromDb();
      console.log(`✅ drawCallingCard: cached ${_cachedCallingCards.length} cards from DB`);
    } catch (err) {
      console.error('drawCallingCard: DB load failed, using fallback', err);
      _cachedCallingCards = SHITO_ICONS.map((icon, i) => ({
        id: `fallback-${i}`,
        dbId: `fallback-${i}`,
        name: icon.name,
        iconId: icon.id,
        emoji: icon.emoji,
        color: icon.color,
        cardNumber: i + 1,
      }));
    }
  }

  return drawRandomCallingCard(_cachedCallingCards, drawnCards);
};

/** Reset the cached deck (e.g. when reshuffling) */
export const resetCallingCardCache = () => {
  _cachedCallingCards = null;
};
