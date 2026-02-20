import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, Shuffle, Volume2, VolumeX, RotateCcw, Sparkles, Dices, AlertTriangle, RefreshCw, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ShitoCallingCard,
  ShitoColumn,
  SHITO_COLUMNS,
  loadCallingCardsFromDb,
  drawRandomCallingCard,
  getColumnColor,
  getColumnGradient,
} from '@/lib/shitoCardService';
import { SHITO_ICONS } from '@/data/shitoIcons';

interface ShitoCallingCardPlayerProps {
  compact?: boolean;
  /** Pre-loaded calling cards — avoids a duplicate DB fetch */
  callingCards?: ShitoCallingCard[];
}

const ShitoCallingCardPlayer: React.FC<ShitoCallingCardPlayerProps> = ({
  compact = false,
  callingCards: parentCards,
}) => {
  const [cards, setCards] = useState<ShitoCallingCard[]>(parentCards || []);
  const [drawnCards, setDrawnCards] = useState<string[]>([]);
  const [currentCard, setCurrentCard] = useState<ShitoCallingCard | null>(null);
  const [currentColumn, setCurrentColumn] = useState<ShitoColumn | null>(null);
  const [loading, setLoading] = useState(!parentCards || parentCards.length === 0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [rollingColumn, setRollingColumn] = useState<ShitoColumn>('S');
  const [useFallback, setUseFallback] = useState(false);

  // Sync with parent cards
  useEffect(() => {
    if (parentCards && parentCards.length > 0) {
      setCards(parentCards);
      setLoading(false);
      setUseFallback(false);
      setLoadError(null);
    }
  }, [parentCards]);

  useEffect(() => {
    if (parentCards && parentCards.length > 0) return;
    loadCards();
  }, []);

  const loadCards = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const dbCards = await loadCallingCardsFromDb();
      if (dbCards.length > 0) {
        setCards(dbCards);
        setUseFallback(false);
        console.log(`✅ ShitoCallingCardPlayer: loaded ${dbCards.length} real calling cards from DB`);
      } else {
        loadFallback();
      }
    } catch (err: any) {
      console.error('ShitoCallingCardPlayer: DB load failed', err);
      setLoadError(err?.message || 'Failed to load cards');
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

  const playDrawSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
    } catch {}
  }, [soundEnabled]);

  const playDiceSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 400;
      osc.type = 'square';
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }, [soundEnabled]);

  const drawCard = useCallback(() => {
    if (isDrawing || isRollingDice || cards.length === 0) return;

    setIsDrawing(true);
    setIsRollingDice(true);
    playDrawSound();

    // Roll dice for column
    let diceIterations = 0;
    const maxDiceIterations = 15;

    const diceInterval = setInterval(() => {
      const randomColumn = SHITO_COLUMNS[Math.floor(Math.random() * SHITO_COLUMNS.length)];
      setRollingColumn(randomColumn);
      playDiceSound();
      diceIterations++;

      if (diceIterations >= maxDiceIterations) {
        clearInterval(diceInterval);

        const finalColumn = SHITO_COLUMNS[Math.floor(Math.random() * SHITO_COLUMNS.length)];
        setRollingColumn(finalColumn);
        setCurrentColumn(finalColumn);
        setIsRollingDice(false);

        // Animate through cards — use the real DB cards for the animation too
        let cardIterations = 0;
        const maxCardIterations = 8;

        const cardInterval = setInterval(() => {
          const randomCard = cards[Math.floor(Math.random() * cards.length)];
          setCurrentCard(randomCard);
          cardIterations++;

          if (cardIterations >= maxCardIterations) {
            clearInterval(cardInterval);

            // Draw from the correct pool using the shared drawRandomCallingCard
            const result = drawRandomCallingCard(cards, drawnCards);
            const finalCard = result.card;

            if (finalCard) {
              setCurrentCard(finalCard);
              setDrawnCards(prev => {
                const newDrawn = [...prev, finalCard.id];
                // If all cards drawn, auto-reshuffle
                if (newDrawn.length >= cards.length) {
                  return [finalCard.id]; // Keep only the latest
                }
                return newDrawn;
              });
            }
            setIsDrawing(false);
          }
        }, 100);
      }
    }, 80);
  }, [cards, drawnCards, isDrawing, isRollingDice, playDrawSound, playDiceSound]);

  const resetDeck = () => {
    setDrawnCards([]);
    setCurrentCard(null);
    setCurrentColumn(null);
  };

  const availableCards = cards.filter(c => !drawnCards.includes(c.id));
  const drawnCardsList = cards.filter(c => drawnCards.includes(c.id));

  const getColumnBgColor = (column: ShitoColumn) => getColumnColor(column);

  // ─── Render card visual ─────────────────────────────────────────

  const renderCardVisual = (card: ShitoCallingCard | null, sizeClass: string) => {
    if (!card) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-700 to-amber-900">
          <Dices className={`${sizeClass === 'large' ? 'w-16 h-16' : 'w-6 h-6'} text-amber-300`} />
          <p className="text-amber-200 text-sm mt-1">Tap to draw</p>
        </div>
      );
    }

    if (card.imageUrl) {
      return <img src={card.imageUrl} alt={card.name} className="w-full h-full object-contain" />;
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-700 to-amber-900">
        {card.emoji ? (
          <span className={sizeClass === 'large' ? 'text-8xl' : 'text-3xl'}>{card.emoji}</span>
        ) : (
          <span className={`${sizeClass === 'large' ? 'text-5xl' : 'text-2xl'} font-black text-amber-300`}>
            {card.name.charAt(0)}
          </span>
        )}
      </div>
    );
  };

  // ─── Loading ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
        <p className="text-amber-300/60 text-sm mt-3">Loading SHITO calling cards from DB...</p>
      </div>
    );
  }

  // ─── Compact mode ───────────────────────────────────────────────

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl p-4 text-white">
        <div className="flex items-center gap-4">
          {currentColumn && (
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-black text-2xl text-white ${getColumnBgColor(currentColumn)}`}>
              {currentColumn}
            </div>
          )}

          <div className={`relative w-16 h-20 bg-amber-800 rounded-lg overflow-hidden flex-shrink-0 ${isDrawing ? 'animate-pulse' : ''}`}>
            {renderCardVisual(currentCard, 'small')}
          </div>

          <div className="flex-1">
            <p className="font-bold text-lg mb-1">
              {currentCard ? `${currentColumn}-${currentCard.name}` : 'Draw a card!'}
            </p>
            <p className="text-amber-200 text-sm">{availableCards.length} cards remaining</p>
          </div>

          <button
            onClick={drawCard}
            disabled={isDrawing}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold transition-all disabled:opacity-50"
          >
            Draw
          </button>
        </div>
      </div>
    );
  }

  // ─── Full mode ──────────────────────────────────────────────────

  return (
    <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 rounded-3xl p-8 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black">Shito Calling Cards</h3>
              <p className="text-white/70 text-sm">
                {useFallback
                  ? 'Using fallback icons'
                  : `${cards.length} real cards from DB`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {loadError && (
              <button onClick={loadCards} className="p-2 hover:bg-white/20 rounded-lg transition-all" title="Retry loading">
                <RefreshCw className="w-5 h-5 text-red-300" />
              </button>
            )}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 hover:bg-white/20 rounded-lg transition-all"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Error banner */}
        {loadError && (
          <div className="bg-red-900/40 border border-red-500/30 rounded-lg p-2 mb-4 flex items-center gap-2 text-sm text-red-200">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        {/* S-H-I-T-O Column Headers */}
        <div className="flex justify-center gap-2 mb-6">
          {SHITO_COLUMNS.map(col => (
            <div
              key={col}
              className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-2xl transition-all duration-300 ${
                isRollingDice && rollingColumn === col
                  ? `bg-gradient-to-br ${getColumnGradient(col)} scale-125 shadow-lg`
                  : currentColumn === col
                  ? `bg-gradient-to-br ${getColumnGradient(col)} scale-110 shadow-lg ring-4 ring-white`
                  : 'bg-white/20'
              }`}
            >
              {col}
            </div>
          ))}
        </div>

        {/* Main card display */}
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="flex-1 flex flex-col items-center">
            {currentColumn && !isRollingDice && (
              <div className={`mb-4 px-8 py-3 rounded-2xl bg-gradient-to-r ${getColumnGradient(currentColumn)} shadow-lg animate-bounce`}>
                <span className="text-4xl font-black">{currentColumn}</span>
              </div>
            )}

            {isRollingDice && (
              <div className="mb-4 px-8 py-3 rounded-2xl bg-white/30 shadow-lg">
                <div className="flex items-center gap-2">
                  <Dices className="w-8 h-8 animate-spin" />
                  <span className="text-2xl font-black">{rollingColumn}</span>
                </div>
              </div>
            )}

            <div className={`relative w-48 h-64 bg-amber-800 rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-300 ${isDrawing ? 'scale-95 rotate-2' : 'hover:scale-105'}`}>
              {renderCardVisual(currentCard, 'large')}
              {currentCard && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <p className="text-white font-bold text-center text-lg">{currentCard.name}</p>
                </div>
              )}
              {currentColumn && currentCard && (
                <div className={`absolute top-2 right-2 w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl ${getColumnBgColor(currentColumn)}`}>
                  {currentColumn}
                </div>
              )}
            </div>

            <div className="mt-4 text-center">
              <p className="text-amber-200">
                {availableCards.length === 0
                  ? 'Deck empty - tap reset!'
                  : `${availableCards.length} of ${cards.length} cards remaining`}
              </p>
              {/* Deck progress bar */}
              <div className="w-48 h-2 bg-black/30 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    availableCards.length > cards.length * 0.5
                      ? 'bg-green-400'
                      : availableCards.length > cards.length * 0.25
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                  }`}
                  style={{ width: `${cards.length > 0 ? (availableCards.length / cards.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col gap-4">
            <button
              onClick={drawCard}
              disabled={isDrawing || isRollingDice}
              className="px-8 py-4 bg-white text-amber-600 font-black text-xl rounded-2xl hover:bg-amber-100 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
            >
              <Dices className={`w-6 h-6 ${isRollingDice ? 'animate-spin' : ''}`} />
              {isRollingDice ? 'Rolling...' : isDrawing ? 'Drawing...' : 'Roll & Draw'}
            </button>

            <button
              onClick={resetDeck}
              className="px-8 py-3 bg-white/20 hover:bg-white/30 font-bold rounded-xl transition-all flex items-center gap-2 justify-center"
            >
              <RotateCcw className="w-5 h-5" />
              Reset Deck
            </button>

            <button
              onClick={() => setShowHistory(!showHistory)}
              className="px-8 py-3 bg-white/10 hover:bg-white/20 font-bold rounded-xl transition-all"
            >
              {showHistory ? 'Hide' : 'Show'} History ({drawnCards.length})
            </button>

            <Link
              to="/practice?game=shito"
              className="px-8 py-3 bg-purple-500/30 hover:bg-purple-500/50 font-bold rounded-xl transition-all flex items-center gap-2 justify-center text-center"
            >
              <Gamepad2 className="w-5 h-5" />
              Practice with Bots
            </Link>
          </div>
        </div>

        {/* History panel */}
        {showHistory && drawnCardsList.length > 0 && (
          <div className="mt-8 bg-black/20 rounded-2xl p-4">
            <h4 className="font-bold mb-3">Called Cards ({drawnCardsList.length} / {cards.length})</h4>
            <div className="flex flex-wrap gap-2">
              {drawnCardsList.map((card, index) => (
                <div key={card.id} className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                  <span className="text-amber-300 font-bold text-sm">{index + 1}.</span>
                  {card.imageUrl ? (
                    <img src={card.imageUrl} alt={card.name} className="w-8 h-8 object-contain" />
                  ) : card.emoji ? (
                    <span className="text-2xl">{card.emoji}</span>
                  ) : (
                    <span className="text-lg font-bold text-amber-300">{card.name.charAt(0)}</span>
                  )}
                  <span className="text-sm">{card.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 p-4 bg-black/20 rounded-xl">
          <h4 className="font-bold text-amber-300 mb-2">How It Works:</h4>
          <ol className="text-white/80 text-sm space-y-1 list-decimal list-inside">
            <li>Tap "Roll & Draw" to roll the dice and draw a calling card</li>
            <li>The dice reveals which column (S, H, I, T, or O) the icon belongs to</li>
            <li>Players check their bingo cards for that icon in that column</li>
            <li>If they have it, they cover that space with a chip!</li>
            <li>First to complete a row, column, or diagonal yells "SHITO!"</li>
          </ol>
          <p className="text-white/50 text-xs mt-3">
            {useFallback
              ? 'Currently using fallback emoji icons. Connect to the database for real card images.'
              : `Using ${cards.length} real calling cards loaded from the game database.`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShitoCallingCardPlayer;
