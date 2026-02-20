import React, { useState, useEffect, useRef } from 'react';
import { Printer, RefreshCw, Plus, Minus, Download, Users, Loader2, AlertTriangle, Gamepad2, Dices } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ShitoCallingCard,
  ShitoBingoCard,
  ShitoColumn,
  SHITO_COLUMNS,
  BingoGrid,
  loadCallingCardsFromDb,
  loadBingoCardsFromDb,
  generateBoardFromCallingCards,
  getColumnColor,
  getColumnTextColor,
} from '@/lib/shitoCardService';
import { SHITO_ICONS } from '@/data/shitoIcons';

interface PrintableShitoCardProps {
  /** Pre-loaded calling cards — avoids a duplicate DB fetch */
  callingCards?: ShitoCallingCard[];
  /** Pre-loaded bingo cards — avoids a duplicate DB fetch */
  bingoCards?: ShitoBingoCard[];
}

const PrintableShitoCard: React.FC<PrintableShitoCardProps> = ({
  callingCards: parentCallingCards,
  bingoCards: parentBingoCards,
}) => {
  const [callingCards, setCallingCards] = useState<ShitoCallingCard[]>(parentCallingCards || []);
  const [bingoCards, setBingoCards] = useState<ShitoBingoCard[]>(parentBingoCards || []);
  const [displayedCards, setDisplayedCards] = useState<ShitoBingoCard[]>([]);
  const [numCards, setNumCards] = useState(4);
  const [loading, setLoading] = useState(
    (!parentCallingCards || parentCallingCards.length === 0) &&
    (!parentBingoCards || parentBingoCards.length === 0)
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  // Sync with parent cards
  useEffect(() => {
    if (parentCallingCards && parentCallingCards.length > 0) {
      setCallingCards(parentCallingCards);
      setUseFallback(false);
    }
  }, [parentCallingCards]);

  useEffect(() => {
    if (parentBingoCards && parentBingoCards.length > 0) {
      setBingoCards(parentBingoCards);
    }
  }, [parentBingoCards]);

  // Only load from DB if parent didn't supply cards
  useEffect(() => {
    const hasParentCalling = parentCallingCards && parentCallingCards.length > 0;
    const hasParentBingo = parentBingoCards && parentBingoCards.length > 0;
    if (hasParentCalling && hasParentBingo) {
      setLoading(false);
      return;
    }
    if (hasParentCalling || hasParentBingo) {
      // Only load what's missing
      loadCardsFromDb(!hasParentCalling, !hasParentBingo);
    } else {
      loadCardsFromDb(true, true);
    }
  }, []);

  useEffect(() => {
    selectDisplayedCards();
  }, [bingoCards, callingCards, numCards]);

  const loadCardsFromDb = async (loadCalling = true, loadBingo = true) => {
    setLoading(true);
    setLoadError(null);
    try {
      const promises: Promise<any>[] = [];
      if (loadCalling) promises.push(loadCallingCardsFromDb());
      else promises.push(Promise.resolve(null));
      if (loadBingo) promises.push(loadBingoCardsFromDb());
      else promises.push(Promise.resolve(null));

      const [ccResult, bcResult] = await Promise.allSettled(promises);

      if (loadCalling) {
        const cc = ccResult.status === 'fulfilled' && ccResult.value ? ccResult.value : [];
        if (cc.length > 0) {
          setCallingCards(cc);
          setUseFallback(false);
          console.log(`✅ PrintableShitoCard: ${cc.length} calling cards from DB`);
        } else {
          // Fallback to emoji icons
          const fallback: ShitoCallingCard[] = SHITO_ICONS.map((icon, i) => ({
            id: `fallback-${i}`,
            dbId: `fallback-${i}`,
            name: icon.name,
            iconId: icon.id,
            emoji: icon.emoji,
            color: icon.color,
            cardNumber: i + 1,
          }));
          setCallingCards(fallback);
          setUseFallback(true);
        }
      }

      if (loadBingo) {
        const bc = bcResult.status === 'fulfilled' && bcResult.value ? bcResult.value : [];
        if (bc.length > 0) {
          setBingoCards(bc);
          console.log(`✅ PrintableShitoCard: ${bc.length} bingo cards from DB`);
        }
      }

      if (loadCalling && loadBingo) {
        const cc = ccResult.status === 'fulfilled' ? ccResult.value : [];
        const bc = bcResult.status === 'fulfilled' ? bcResult.value : [];
        if ((!cc || cc.length === 0) && (!bc || bc.length === 0)) {
          setLoadError('No SHITO cards found in database');
        }
      }
    } catch (err: any) {
      console.error('PrintableShitoCard: failed to load', err);
      setLoadError(err?.message || 'Failed to load cards');
      if (loadCalling && callingCards.length === 0) {
        const fallback: ShitoCallingCard[] = SHITO_ICONS.map((icon, i) => ({
          id: `fallback-${i}`,
          dbId: `fallback-${i}`,
          name: icon.name,
          iconId: icon.id,
          emoji: icon.emoji,
          color: icon.color,
          cardNumber: i + 1,
        }));
        setCallingCards(fallback);
        setUseFallback(true);
      }
    }
    setLoading(false);
  };

  const selectDisplayedCards = () => {
    if (bingoCards.length > 0) {
      // Use real pre-made bingo cards from DB
      const shuffled = [...bingoCards].sort(() => Math.random() - 0.5);
      setDisplayedCards(shuffled.slice(0, numCards));
    } else if (callingCards.length > 0) {
      // Generate boards from calling card icons
      const generated: ShitoBingoCard[] = [];
      for (let i = 0; i < numCards; i++) {
        const grid = generateBoardFromCallingCards(callingCards, `print-${i}-${Date.now()}`);
        generated.push({
          id: `gen-${i}`,
          dbId: `gen-${i}`,
          name: `Card #${i + 1}`,
          cardNumber: i + 1,
          grid,
        });
      }
      setDisplayedCards(generated);
    }
  };

  const getCallingCard = (iconId: string): ShitoCallingCard | undefined => {
    return callingCards.find(
      c =>
        c.iconId === iconId ||
        c.name.toLowerCase() === iconId.toLowerCase() ||
        c.iconId === iconId.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    );
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <p className="text-amber-600 text-sm mt-3">Loading SHITO bingo cards from DB...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
      {/* Controls Header */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-6 text-white print:hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black">Printable SHITO Cards</h3>
              <p className="text-white/70 text-sm">
                {useFallback
                  ? 'Using fallback icons'
                  : `${callingCards.length} calling cards, ${bingoCards.length} bingo cards from DB`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
              <button
                onClick={() => setNumCards(Math.max(1, numCards - 1))}
                className="p-1 hover:bg-white/20 rounded-lg transition-all"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="font-bold text-lg w-8 text-center">{numCards}</span>
              <button
                onClick={() => setNumCards(Math.min(bingoCards.length || 12, numCards + 1))}
                className="p-1 hover:bg-white/20 rounded-lg transition-all"
              >
                <Plus className="w-5 h-5" />
              </button>
              <span className="text-sm ml-2">cards</span>
            </div>

            <button
              onClick={selectDisplayedCards}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all"
            >
              <RefreshCw className="w-5 h-5" />
              Shuffle
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2 bg-white text-amber-600 hover:bg-amber-100 rounded-xl font-bold transition-all"
            >
              <Printer className="w-5 h-5" />
              Print Cards
            </button>
          </div>
        </div>

        {/* Quick links to other tools */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-white/20">
          <Link
            to="/practice?game=shito"
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
          >
            <Gamepad2 className="w-4 h-4" />
            Practice with Bots
          </Link>
          <span className="text-white/30">|</span>
          <button
            onClick={() => {
              // Scroll to top and switch tab (parent handles this)
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors"
          >
            <Dices className="w-4 h-4" />
            Use these cards with the Calling Tool above
          </button>
        </div>
      </div>

      {/* Error banner */}
      {loadError && (
        <div className="p-4 bg-red-50 border-b border-red-200 print:hidden flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="text-red-700 text-sm">{loadError}</p>
          <button onClick={() => loadCardsFromDb(true, true)} className="ml-auto text-red-600 hover:text-red-800 text-sm underline">
            Retry
          </button>
        </div>
      )}

      {/* Instructions */}
      <div className="p-4 bg-amber-50 border-b border-amber-200 print:hidden">
        <p className="text-amber-800 text-sm text-center">
          {bingoCards.length > 0
            ? `Showing ${displayedCards.length} of ${bingoCards.length} real pre-made bingo cards from the database. These are the same cards used in the digital game. Click "Shuffle" to pick different cards.`
            : `Generating unique bingo cards from ${callingCards.length} calling card icons. Click "Shuffle" to regenerate.`}
        </p>
      </div>

      {/* Cards Grid */}
      <div
        ref={printRef}
        id="printable-cards"
        className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:p-4"
      >
        {displayedCards.map((card, cardIndex) => (
          <div
            key={card.id}
            className="border-2 border-gray-300 rounded-2xl overflow-hidden bg-white print:break-inside-avoid print:page-break-inside-avoid"
          >
            {/* Card Header */}
            <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-3 text-white text-center">
              <h4 className="text-2xl font-black tracking-wider">SHITO</h4>
              <p className="text-xs text-white/80">{card.name}</p>
            </div>

            {/* Column Headers */}
            <div className="grid grid-cols-5 gap-1 p-2 bg-gray-100">
              {SHITO_COLUMNS.map(col => (
                <div
                  key={col}
                  className={`${getColumnColor(col)} text-white font-black text-2xl py-2 text-center rounded-lg`}
                >
                  {col}
                </div>
              ))}
            </div>

            {/* Card Grid — 5×5 */}
            <div className="p-2">
              {[0, 1, 2, 3, 4].map(rowIndex => (
                <div key={rowIndex} className="grid grid-cols-5 gap-1 mb-1">
                  {SHITO_COLUMNS.map(col => {
                    const iconId = card.grid[col]?.[rowIndex] || '';
                    const isFreeSpace = iconId === 'FREE' || (col === 'I' && rowIndex === 2);
                    const callingCard = !isFreeSpace ? getCallingCard(iconId) : null;

                    return (
                      <div
                        key={`${col}-${rowIndex}`}
                        className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center p-1 ${
                          isFreeSpace
                            ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-600'
                            : 'bg-white border-gray-200 hover:border-amber-400 transition-colors'
                        }`}
                      >
                        {isFreeSpace ? (
                          <div className="text-center">
                            <svg viewBox="0 0 24 24" className="w-6 h-6 mx-auto text-white" fill="currentColor">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                            </svg>
                            <p className="text-white font-black text-xs">FREE</p>
                          </div>
                        ) : callingCard?.imageUrl ? (
                          <img
                            src={callingCard.imageUrl}
                            alt={callingCard.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center">
                            {callingCard?.emoji ? (
                              <span className="text-2xl md:text-3xl">{callingCard.emoji}</span>
                            ) : (
                              <span className="text-xl font-bold text-amber-600">
                                {(callingCard?.name || iconId).charAt(0).toUpperCase()}
                              </span>
                            )}
                            <p className="text-[8px] text-gray-500 truncate w-full leading-tight mt-1 hidden md:block print:block">
                              {callingCard?.name || iconId}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Card Footer */}
            <div className="bg-gray-100 p-2 text-center">
              <p className="text-xs text-gray-500">Yell "SHITO!" when you win!</p>
            </div>
          </div>
        ))}
      </div>

      {/* Calling card reference (print-only) */}
      <div className="hidden print:block p-4 border-t-2 border-gray-300">
        <h4 className="text-lg font-bold text-center mb-3">Calling Card Reference ({callingCards.length} cards)</h4>
        <div className="grid grid-cols-6 gap-2">
          {callingCards.map(card => (
            <div key={card.id} className="flex items-center gap-1 text-xs border rounded p-1">
              {card.imageUrl ? (
                <img src={card.imageUrl} alt={card.name} className="w-5 h-5 object-contain" />
              ) : card.emoji ? (
                <span className="text-sm">{card.emoji}</span>
              ) : (
                <span className="text-sm font-bold text-amber-600">{card.name.charAt(0)}</span>
              )}
              <span className="truncate">{card.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
          #printable-cards, #printable-cards * { visibility: visible; }
          #printable-cards { position: absolute; left: 0; top: 0; width: 100%; }
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; visibility: visible !important; }
          .print\\:break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>
    </div>
  );
};

export default PrintableShitoCard;
