import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Dices, RotateCcw, Lightbulb, Loader2, AlertTriangle, RefreshCw, ExternalLink, Printer, Bot, ChevronRight } from 'lucide-react';
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
  drawRandomCallingCard,
  getColumnColor,
} from '@/lib/shitoCardService';
import { SHITO_ICONS } from '@/data/shitoIcons';

// ─── Types ────────────────────────────────────────────────────────────

interface Props {
  gameData: Record<string, any>;
  isMyTurn: boolean;
  onAction: (action: string, data?: any) => void;
  players: { player_id: string; player_name: string; isBot?: boolean }[];
  currentPlayerId: string;
  isPaused?: boolean;
  onHint?: () => void;
}

// ─── Poop Chip SVG ────────────────────────────────────────────────────

const PoopChip = () => (
  <svg viewBox="0 0 24 24" className="w-full h-full">
    <ellipse cx="12" cy="18" rx="8" ry="4" fill="#5D3A1A" />
    <ellipse cx="12" cy="14" rx="6" ry="3" fill="#6B4423" />
    <ellipse cx="12" cy="10" rx="5" ry="3" fill="#7B5033" />
    <ellipse cx="12" cy="7" rx="3" ry="2" fill="#8B6043" />
    <circle cx="9" cy="10" r="1" fill="#333" />
    <circle cx="14" cy="10" r="1" fill="#333" />
    <path d="M10 13 Q12 15 14 13" stroke="#333" strokeWidth="0.8" fill="none" />
  </svg>
);

const FreeSpaceStar = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 text-yellow-300" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// ─── Board dimensions (physical SHITO: 5 cols × 5 rows) ──────────────

const ROWS = 5;

// ─── Bot caller animation dots ────────────────────────────────────────

const BotThinkingDots = () => (
  <span className="inline-flex gap-0.5 ml-1">
    <span className="w-1.5 h-1.5 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
    <span className="w-1.5 h-1.5 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
    <span className="w-1.5 h-1.5 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
  </span>
);

// ─── Component ────────────────────────────────────────────────────────

export default function PracticeShitoBoard({
  gameData,
  isMyTurn,
  onAction,
  players,
  currentPlayerId,
  isPaused,
  onHint,
}: Props) {
  // Game state
  const boards = gameData.boards || {};
  const chips = gameData.chips || {};
  const currentCaller = gameData.currentCaller || 0;
  const lastCard = gameData.lastCard || null;
  const lastColumn = gameData.lastColumn || null;
  const winner = gameData.winner || null;
  const phase = gameData.phase || 'waiting';
  const calledItems = gameData.calledItems || [];
  const drawnCardIds = gameData.drawnCardIds || [];

  const myBoard: BingoGrid | null = boards[currentPlayerId] || null;
  const myChips: string[] = chips[currentPlayerId] || [];
  const isCaller = players[currentCaller]?.player_id === currentPlayerId;
  const currentCallerPlayer = players[currentCaller];
  const isBotCaller = !!currentCallerPlayer?.isBot;

  // Local UI state
  const [isRolling, setIsRolling] = useState(false);
  const [rollingColumn, setRollingColumn] = useState<ShitoColumn>('S');
  const [currentColumn, setCurrentColumn] = useState<ShitoColumn | null>(null);
  const [currentIcon, setCurrentIcon] = useState<ShitoCallingCard | null>(null);

  // Bot caller UI state
  const [botCallerPhase, setBotCallerPhase] = useState<'idle' | 'thinking' | 'rolling' | 'revealing' | 'placing-chips' | 'advancing'>('idle');
  const [botChipFlashes, setBotChipFlashes] = useState<{ playerId: string; chipKey: string }[]>([]);

  // DB cards
  const [callingCards, setCallingCards] = useState<ShitoCallingCard[]>([]);
  const [bingoCards, setBingoCards] = useState<ShitoBingoCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  // Refs for bot action deduplication
  const botCallInProgress = useRef(false);
  const botAdvanceInProgress = useRef(false);
  const botTimers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const botIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Build a fast lookup map for calling cards by iconId / name
  const callingCardMap = React.useMemo(() => {
    const map = new Map<string, ShitoCallingCard>();
    callingCards.forEach(c => {
      map.set(c.iconId, c);
      map.set(c.name.toLowerCase(), c);
      map.set(c.iconId.toLowerCase().replace(/[^a-z0-9]+/g, '-'), c);
    });
    return map;
  }, [callingCards]);

  // ─── Cleanup bot timers on unmount ──────────────────────────────

  useEffect(() => {
    return () => {
      botTimers.current.forEach(t => clearTimeout(t));
      botTimers.current = [];
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
    };
  }, []);

  // ─── Load cards from DB ─────────────────────────────────────────

  useEffect(() => {
    loadCardsFromDb();
  }, []);

  const loadCardsFromDb = async () => {
    setCardsLoading(true);
    setCardsError(null);
    try {
      const [ccResult, bcResult] = await Promise.allSettled([
        loadCallingCardsFromDb(),
        loadBingoCardsFromDb(),
      ]);

      let cc = ccResult.status === 'fulfilled' ? ccResult.value : [];
      const bc = bcResult.status === 'fulfilled' ? bcResult.value : [];

      if (cc.length === 0) {
        cc = SHITO_ICONS.map((icon, i) => ({
          id: `fallback-${i}`,
          dbId: `fallback-${i}`,
          name: icon.name,
          iconId: icon.id,
          emoji: icon.emoji,
          color: icon.color,
          cardNumber: i + 1,
        }));
        setUseFallback(true);
      } else {
        setUseFallback(false);
      }

      setCallingCards(cc);
      setBingoCards(bc);
      console.log(`✅ PracticeShitoBoard: ${cc.length} calling cards, ${bc.length} bingo cards`);
    } catch (err: any) {
      console.error('PracticeShitoBoard: failed to load cards', err);
      setCardsError(err?.message || 'Failed to load cards');
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
    setCardsLoading(false);
  };

  // ─── Initialize boards ──────────────────────────────────────────

  useEffect(() => {
    if (cardsLoading || callingCards.length === 0) return;
    if (boards[currentPlayerId]) return;

    const newBoards: Record<string, BingoGrid> = {};
    const usedBingoIds = new Set<string>();

    players.forEach(p => {
      if (bingoCards.length > 0) {
        const available = bingoCards.filter(bc => !usedBingoIds.has(bc.id));
        const chosen = available.length > 0
          ? available[Math.floor(Math.random() * available.length)]
          : bingoCards[Math.floor(Math.random() * bingoCards.length)];
        newBoards[p.player_id] = chosen.grid;
        usedBingoIds.add(chosen.id);
      } else {
        newBoards[p.player_id] = generateBoardFromCallingCards(callingCards, p.player_id);
      }
    });

    const newChips: Record<string, string[]> = {};
    players.forEach(p => {
      newChips[p.player_id] = [];
    });

    onAction('initBoard', { boards: newBoards, chips: newChips, phase: 'waiting', drawnCardIds: [] });
  }, [cardsLoading, callingCards.length, boards, currentPlayerId]);

  // ─── Get calling card by iconId ─────────────────────────────────

  const getCallingCard = (iconId: string): ShitoCallingCard | undefined => {
    return callingCardMap.get(iconId) ||
      callingCardMap.get(iconId.toLowerCase()) ||
      callingCardMap.get(iconId.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
  };

  // ─── Bot auto-place chips for all bot players ───────────────────

  const botAutoPlaceChips = useCallback((
    cardIconId: string,
    column: ShitoColumn,
    currentChips: Record<string, string[]>,
    currentBoards: Record<string, BingoGrid>,
  ): Record<string, string[]> => {
    const updatedChips = { ...currentChips };
    const flashes: { playerId: string; chipKey: string }[] = [];
    const colIndex = SHITO_COLUMNS.indexOf(column);

    players.forEach(p => {
      if (!p.isBot) return;
      const board = currentBoards[p.player_id];
      if (!board) return;

      const playerChips = [...(updatedChips[p.player_id] || [])];
      const colKey = SHITO_COLUMNS[colIndex];
      const colCells = board[colKey];
      if (!colCells) return;

      for (let row = 0; row < 5; row++) {
        const cellIcon = colCells[row];
        if (!cellIcon || cellIcon === 'FREE') continue;

        const normalizedCell = cellIcon.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        const normalizedCard = cardIconId.toLowerCase().replace(/[^a-z0-9]+/g, '-');

        if (normalizedCell === normalizedCard || cellIcon === cardIconId) {
          const chipKey = `${colIndex}-${row}`;
          if (!playerChips.includes(chipKey)) {
            playerChips.push(chipKey);
            flashes.push({ playerId: p.player_id, chipKey });
          }
        }
      }

      updatedChips[p.player_id] = playerChips;
    });

    if (flashes.length > 0) {
      setBotChipFlashes(flashes);
      const t = setTimeout(() => setBotChipFlashes([]), 1200);
      botTimers.current.push(t);
    }

    return updatedChips;
  }, [players]);

  // ─── Bot caller auto-roll & draw ───────────────────────────────

  useEffect(() => {
    if (!isBotCaller) {
      botCallInProgress.current = false;
      botAdvanceInProgress.current = false;
      setBotCallerPhase('idle');
      return;
    }
    if (phase !== 'waiting') return;
    if (isPaused || cardsLoading || callingCards.length === 0) return;
    if (isRolling) return;
    if (botCallInProgress.current) return;
    if (winner) return;
    // Ensure boards are initialized
    if (!boards[currentPlayerId]) return;

    botCallInProgress.current = true;
    setBotCallerPhase('thinking');

    console.log(`🤖 Bot caller "${currentCallerPlayer?.player_name}" starting turn...`);

    // Phase 1: "Thinking" delay (0.8s)
    const thinkTimer = setTimeout(() => {
      if (winner) { botCallInProgress.current = false; return; }

      setBotCallerPhase('rolling');
      setIsRolling(true);

      // Phase 2: Dice roll animation (1.5s total = 15 iterations × 100ms)
      let iterations = 0;
      const maxIterations = 15;

      botIntervalRef.current = setInterval(() => {
        const randomCol = SHITO_COLUMNS[Math.floor(Math.random() * SHITO_COLUMNS.length)];
        setRollingColumn(randomCol);
        iterations++;

        if (iterations >= maxIterations) {
          if (botIntervalRef.current) {
            clearInterval(botIntervalRef.current);
            botIntervalRef.current = null;
          }

          // Draw the card
          const finalColumn = SHITO_COLUMNS[Math.floor(Math.random() * SHITO_COLUMNS.length)];
          const result = drawRandomCallingCard(callingCards, drawnCardIds);

          setRollingColumn(finalColumn);
          setCurrentColumn(finalColumn);
          setCurrentIcon(result.card);
          setIsRolling(false);
          setBotCallerPhase('revealing');

          const newCalledItems = [
            ...calledItems,
            { column: finalColumn, iconId: result.card?.iconId, name: result.card?.name },
          ];
          const newDrawnIds = result.card ? [...drawnCardIds, result.card.id] : drawnCardIds;

          onAction('drawCard', {
            lastCard: result.card?.iconId || null,
            lastColumn: finalColumn,
            calledItems: newCalledItems,
            drawnCardIds: newDrawnIds,
            phase: 'called',
          });
        }
      }, 100);
    }, 800);

    botTimers.current.push(thinkTimer);

    return () => {
      clearTimeout(thinkTimer);
      if (botIntervalRef.current) {
        clearInterval(botIntervalRef.current);
        botIntervalRef.current = null;
      }
    };
  }, [isBotCaller, phase, isPaused, cardsLoading, callingCards.length, winner, boards, currentPlayerId, isRolling]);

  // ─── Bot auto-advance after card is called ──────────────────────

  useEffect(() => {
    if (!isBotCaller) return;
    if (phase !== 'called') {
      botAdvanceInProgress.current = false;
      return;
    }
    if (!lastCard || !lastColumn) return;
    if (botAdvanceInProgress.current) return;
    if (winner) return;

    botAdvanceInProgress.current = true;
    setBotCallerPhase('placing-chips');

    console.log(`🤖 Bot caller "${currentCallerPlayer?.player_name}" placed card, auto-placing chips & advancing...`);

    // Phase 3: Auto-place bot chips after a short reveal pause (0.6s)
    const chipTimer = setTimeout(() => {
      if (winner) { botAdvanceInProgress.current = false; return; }

      const updatedChips = botAutoPlaceChips(lastCard, lastColumn as ShitoColumn, chips, boards);

      if (JSON.stringify(updatedChips) !== JSON.stringify(chips)) {
        onAction('placeChip', { chips: updatedChips });
      }

      setBotCallerPhase('advancing');

      // Phase 4: Advance to next turn after letting human see the result (1s)
      const advanceTimer = setTimeout(() => {
        if (winner) { botAdvanceInProgress.current = false; return; }

        const next = (currentCaller + 1) % players.length;
        setCurrentColumn(null);
        setCurrentIcon(null);
        setBotCallerPhase('idle');
        botCallInProgress.current = false;
        botAdvanceInProgress.current = false;

        onAction('nextTurn', {
          currentCaller: next,
          phase: 'waiting',
          lastCard: null,
          lastColumn: null,
        });
      }, 1000);

      botTimers.current.push(advanceTimer);
    }, 600);

    botTimers.current.push(chipTimer);

    return () => {
      clearTimeout(chipTimer);
    };
  }, [isBotCaller, phase, lastCard, lastColumn, winner, currentCaller, players.length]);

  // ─── Roll & Draw (human caller) ────────────────────────────────

  const handleRollAndDraw = async () => {
    if (isRolling || isPaused || callingCards.length === 0) return;

    setIsRolling(true);

    let iterations = 0;
    const maxIterations = 12;

    const interval = setInterval(() => {
      const randomCol = SHITO_COLUMNS[Math.floor(Math.random() * SHITO_COLUMNS.length)];
      setRollingColumn(randomCol);
      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(interval);

        const finalColumn = SHITO_COLUMNS[Math.floor(Math.random() * SHITO_COLUMNS.length)];
        const result = drawRandomCallingCard(callingCards, drawnCardIds);

        setRollingColumn(finalColumn);
        setCurrentColumn(finalColumn);
        setCurrentIcon(result.card);
        setIsRolling(false);

        const newCalledItems = [
          ...calledItems,
          { column: finalColumn, iconId: result.card?.iconId, name: result.card?.name },
        ];
        const newDrawnIds = result.card ? [...drawnCardIds, result.card.id] : drawnCardIds;

        onAction('drawCard', {
          lastCard: result.card?.iconId || null,
          lastColumn: finalColumn,
          calledItems: newCalledItems,
          drawnCardIds: newDrawnIds,
          phase: 'called',
        });
      }
    }, 100);
  };

  const nextTurn = () => {
    const next = (currentCaller + 1) % players.length;
    setCurrentColumn(null);
    setCurrentIcon(null);
    onAction('nextTurn', {
      currentCaller: next,
      phase: 'waiting',
      lastCard: null,
      lastColumn: null,
    });
  };

  // ─── Chip placement (human) ─────────────────────────────────────

  const placeChip = (col: number, row: number) => {
    if (!lastCard || phase !== 'called' || isPaused || !myBoard) return;

    const colKey = SHITO_COLUMNS[col];
    const cellIcon = myBoard[colKey]?.[row];
    if (!cellIcon || cellIcon === 'FREE') return;

    const normalizedCell = cellIcon.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const normalizedLast = lastCard.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (normalizedCell !== normalizedLast && cellIcon !== lastCard) return;

    const targetColIndex = SHITO_COLUMNS.indexOf(lastColumn as ShitoColumn);
    if (col !== targetColIndex) return;

    const chipKey = `${col}-${row}`;
    if (myChips.includes(chipKey)) return;

    const newChips = { ...chips, [currentPlayerId]: [...myChips, chipKey] };
    onAction('placeChip', { chips: newChips });
  };

  const isValidPlacement = (col: number, row: number): boolean => {
    if (!lastCard || phase !== 'called' || !myBoard) return false;

    const colKey = SHITO_COLUMNS[col];
    const cellIcon = myBoard[colKey]?.[row];
    if (!cellIcon || cellIcon === 'FREE') return false;

    const normalizedCell = cellIcon.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const normalizedLast = lastCard.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    if (normalizedCell !== normalizedLast && cellIcon !== lastCard) return false;

    const targetColIndex = SHITO_COLUMNS.indexOf(lastColumn as ShitoColumn);
    return col === targetColIndex && !myChips.includes(`${col}-${row}`);
  };

  // ─── Win check (5×5) ───────────────────────────────────────────

  const checkWin = (): boolean => {
    if (!myBoard) return false;

    for (let col = 0; col < 5; col++) {
      if ([0, 1, 2, 3, 4].every(row => {
        const colKey = SHITO_COLUMNS[col];
        const cell = myBoard[colKey]?.[row];
        return cell === 'FREE' || myChips.includes(`${col}-${row}`);
      })) return true;
    }
    for (let row = 0; row < 5; row++) {
      if ([0, 1, 2, 3, 4].every(col => {
        const colKey = SHITO_COLUMNS[col];
        const cell = myBoard[colKey]?.[row];
        return cell === 'FREE' || myChips.includes(`${col}-${row}`);
      })) return true;
    }
    if ([0, 1, 2, 3, 4].every(i => {
      const colKey = SHITO_COLUMNS[i];
      const cell = myBoard[colKey]?.[i];
      return cell === 'FREE' || myChips.includes(`${i}-${i}`);
    })) return true;
    if ([0, 1, 2, 3, 4].every(i => {
      const colKey = SHITO_COLUMNS[4 - i];
      const cell = myBoard[colKey]?.[i];
      return cell === 'FREE' || myChips.includes(`${4 - i}-${i}`);
    })) return true;

    return false;
  };

  const callShito = () => {
    if (checkWin()) {
      onAction('win', { winner: currentPlayerId });
    }
  };

  // ─── Render icon ────────────────────────────────────────────────

  const renderCellIcon = (iconId: string) => {
    if (iconId === 'FREE') {
      return (
        <div className="flex flex-col items-center">
          <FreeSpaceStar />
          <span className="text-[7px] font-black text-yellow-300">FREE</span>
        </div>
      );
    }

    const card = getCallingCard(iconId);
    if (card?.imageUrl) {
      return <img src={card.imageUrl} alt={card.name} className="w-6 h-6 object-contain" />;
    }
    if (card?.emoji) {
      return <span className="text-lg">{card.emoji}</span>;
    }
    return (
      <span className="text-lg font-bold text-amber-300">
        {(card?.name || iconId).charAt(0).toUpperCase()}
      </span>
    );
  };

  // ─── Bot caller phase label ─────────────────────────────────────

  const getBotCallerLabel = (): string => {
    switch (botCallerPhase) {
      case 'thinking': return 'is picking up the dice';
      case 'rolling': return 'is rolling the dice';
      case 'revealing': return 'drew a card!';
      case 'placing-chips': return 'is placing chips';
      case 'advancing': return 'is finishing up';
      default: return 'is the caller';
    }
  };

  // ─── Loading state ──────────────────────────────────────────────

  if (cardsLoading) {
    return (
      <div className="bg-gradient-to-br from-amber-900 to-orange-900 rounded-xl p-8 text-center">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-3" />
        <p className="text-amber-300 font-semibold">Loading SHITO cards from database...</p>
      </div>
    );
  }

  // ─── Winner screen ──────────────────────────────────────────────

  if (winner) {
    const winnerName = players.find(p => p.player_id === winner)?.player_name || 'Unknown';
    return (
      <div className="bg-gradient-to-br from-amber-900 to-orange-900 rounded-xl p-6 text-center">
        <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
        <h2 className="text-3xl font-bold text-yellow-400 mb-2">SHITO!</h2>
        <p className="text-xl text-white">{winnerName} wins!</p>
        <Button
          onClick={() =>
            onAction('reset', {
              boards: {},
              chips: {},
              winner: null,
              phase: 'waiting',
              calledItems: [],
              drawnCardIds: [],
              lastCard: null,
              lastColumn: null,
              currentCaller: 0,
            })
          }
          className="mt-4 bg-amber-600 hover:bg-amber-500"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Play Again
        </Button>
      </div>
    );
  }

  // ─── Main render ────────────────────────────────────────────────

  return (
    <div className="bg-gradient-to-br from-amber-900 to-orange-900 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-bold text-white">SHITO!</h3>
          <span className="text-[10px] bg-amber-700/60 px-2 py-0.5 rounded-full text-amber-200">
            {callingCards.length} cards{useFallback ? ' (fallback)' : ' from DB'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {cardsError && (
            <button onClick={loadCardsFromDb} className="text-red-400 hover:text-red-300" title="Retry loading">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
          <Link
            to="/shito-calling-cards"
            className="text-amber-300 hover:text-amber-200 transition-colors"
            title="Open Shito Tools (Print Cards & Calling System)"
          >
            <Printer className="w-4 h-4" />
          </Link>
          {onHint && (
            <Button onClick={onHint} variant="outline" size="sm" className="text-amber-300 border-amber-500">
              <Lightbulb className="w-4 h-4 mr-1" />
              Hint
            </Button>
          )}
        </div>
      </div>

      {/* Error banner */}
      {cardsError && (
        <div className="bg-red-900/40 border border-red-500/30 rounded-lg p-2 mb-3 flex items-center gap-2 text-xs text-red-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{cardsError}</span>
        </div>
      )}

      {/* Column headers with animation */}
      <div className="flex justify-center gap-2 mb-4">
        {SHITO_COLUMNS.map(col => (
          <div
            key={col}
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg transition-all duration-200 ${
              isRolling && rollingColumn === col
                ? `${getColumnColor(col)} text-white scale-125 shadow-lg`
                : (currentColumn === col || lastColumn === col)
                ? `${getColumnColor(col)} text-white scale-110 shadow-lg ring-2 ring-white`
                : 'bg-white/20 text-white/60'
            }`}
          >
            {col}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-4">

          {/* ── Bot caller banner ─────────────────────────────────── */}
          {isBotCaller && botCallerPhase !== 'idle' && (
            <div className={`rounded-lg p-4 flex flex-col items-center gap-3 transition-all duration-300 ${
              botCallerPhase === 'rolling'
                ? 'bg-gradient-to-r from-amber-600/40 to-orange-600/40 border border-amber-500/50'
                : botCallerPhase === 'revealing'
                ? 'bg-gradient-to-r from-green-600/30 to-emerald-600/30 border border-green-500/40'
                : botCallerPhase === 'placing-chips'
                ? 'bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border border-blue-500/40'
                : 'bg-black/30 border border-amber-500/20'
            }`}>
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-full transition-all duration-300 ${
                  botCallerPhase === 'rolling' ? 'bg-amber-500/30 animate-pulse' :
                  botCallerPhase === 'revealing' ? 'bg-green-500/30' :
                  'bg-amber-500/20'
                }`}>
                  <Bot className={`w-5 h-5 ${
                    botCallerPhase === 'rolling' ? 'text-amber-300 animate-spin' :
                    botCallerPhase === 'revealing' ? 'text-green-300' :
                    'text-amber-400'
                  }`} />
                </div>
                <p className="text-amber-200 font-semibold text-sm">
                  <span className="text-white font-bold">{currentCallerPlayer?.player_name}</span>
                  {' '}{getBotCallerLabel()}
                  {(botCallerPhase === 'thinking' || botCallerPhase === 'rolling' || botCallerPhase === 'placing-chips') && (
                    <BotThinkingDots />
                  )}
                </p>
              </div>

              {/* Rolling dice visual */}
              {botCallerPhase === 'rolling' && (
                <div className="flex items-center gap-2">
                  <Dices className="w-6 h-6 text-amber-300 animate-bounce" />
                  <div className="flex gap-1">
                    {SHITO_COLUMNS.map(c => (
                      <span
                        key={c}
                        className={`w-7 h-7 rounded text-xs font-black flex items-center justify-center transition-all duration-100 ${
                          rollingColumn === c
                            ? `${getColumnColor(c)} text-white scale-110 shadow-md`
                            : 'bg-white/10 text-white/30'
                        }`}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Card reveal */}
              {(botCallerPhase === 'revealing' || botCallerPhase === 'placing-chips' || botCallerPhase === 'advancing') && currentIcon && lastColumn && (
                <div className="flex items-center gap-3 bg-black/20 rounded-lg px-4 py-2">
                  <div className={`${getColumnColor(lastColumn as ShitoColumn)} text-white font-black text-xl px-3 py-1.5 rounded-lg shadow-md`}>
                    {lastColumn}
                  </div>
                  <ChevronRight className="w-4 h-4 text-amber-500" />
                  <div className="flex items-center gap-2">
                    {renderCellIcon(currentIcon.iconId)}
                    <span className="text-white font-bold text-sm">{currentIcon.name}</span>
                  </div>
                </div>
              )}

              {/* Bot chip placement feedback */}
              {botCallerPhase === 'placing-chips' && botChipFlashes.length > 0 && (
                <div className="text-xs text-blue-300 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                  {botChipFlashes.length} bot chip{botChipFlashes.length !== 1 ? 's' : ''} placed
                </div>
              )}

              {/* Advancing indicator */}
              {botCallerPhase === 'advancing' && (
                <p className="text-xs text-amber-400/70 animate-pulse">
                  Next caller in a moment...
                </p>
              )}
            </div>
          )}

          {/* ── Bot caller idle banner (waiting phase, before thinking starts) ── */}
          {isBotCaller && botCallerPhase === 'idle' && phase === 'waiting' && (
            <div className="bg-black/30 rounded-lg p-4 flex flex-col items-center gap-2 border border-amber-500/10">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-400" />
                <p className="text-amber-300 font-semibold text-sm">
                  <span className="text-white font-bold">{currentCallerPlayer?.player_name}</span> is the caller
                </p>
              </div>
              <p className="text-xs text-amber-400/60">Bot will roll automatically...</p>
            </div>
          )}

          {/* ── Human caller controls ─────────────────────────────── */}
          {isCaller && !isBotCaller && (
            <div className="bg-black/30 rounded-lg p-4 flex flex-col items-center gap-3">
              <p className="text-amber-300 font-semibold">You're the Caller!</p>
              <div className="flex items-center gap-4">
                <Button
                  onClick={handleRollAndDraw}
                  disabled={phase !== 'waiting' || isRolling || isPaused}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 font-bold"
                >
                  <Dices className={`w-5 h-5 mr-2 ${isRolling ? 'animate-spin' : ''}`} />
                  {isRolling ? 'Rolling...' : 'Roll & Draw'}
                </Button>
                {phase === 'called' && (
                  <Button onClick={nextTurn} className="bg-green-600 hover:bg-green-500">
                    Next Turn
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Current call display */}
          {lastCard && lastColumn && !isBotCaller && (
            <div className="bg-black/30 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-3">
                <div className={`${getColumnColor(lastColumn as ShitoColumn)} text-white font-black text-2xl px-4 py-2 rounded-lg`}>
                  {lastColumn}
                </div>
                <span className="text-white text-xl">-</span>
                <div className="flex items-center gap-2">
                  {renderCellIcon(lastCard)}
                  <span className="text-white font-bold">
                    {currentIcon?.name || getCallingCard(lastCard)?.name || lastCard}
                  </span>
                </div>
              </div>
              <p className="text-amber-300 text-sm mt-2">
                Find this icon in the <span className="font-bold">{lastColumn}</span> column!
              </p>
            </div>
          )}

          {/* Deck status bar */}
          <div className="bg-black/20 rounded-lg px-3 py-2 flex items-center justify-between text-xs">
            <span className="text-amber-300">
              Cards drawn: {drawnCardIds.length} / {callingCards.length}
            </span>
            <span className="text-amber-400/60">
              {callingCards.length - drawnCardIds.length} remaining
            </span>
            {drawnCardIds.length >= callingCards.length && callingCards.length > 0 && (
              <span className="text-yellow-400 animate-pulse font-semibold">Reshuffling...</span>
            )}
          </div>

          {/* Game Board — 5×5 grid */}
          <div className="bg-black/20 rounded-lg p-3">
            <div className="grid grid-cols-5 gap-1 mb-1">
              {SHITO_COLUMNS.map((l, i) => (
                <div
                  key={i}
                  className={`text-white font-bold text-center py-1 rounded transition-all ${
                    lastColumn === l
                      ? `${getColumnColor(l)} ring-2 ring-white`
                      : 'bg-amber-700'
                  }`}
                >
                  {l}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-1">
              {SHITO_COLUMNS.map((colKey, col) => (
                <div key={col} className="flex flex-col gap-1">
                  {[0, 1, 2, 3, 4].map(row => {
                    const cellIcon = myBoard?.[colKey]?.[row] || '';
                    const isFree = cellIcon === 'FREE';
                    const chipKey = `${col}-${row}`;
                    const hasChip = isFree || myChips.includes(chipKey);
                    const canPlace = !isFree && isValidPlacement(col, row);

                    return (
                      <button
                        key={row}
                        onClick={() => canPlace && placeChip(col, row)}
                        disabled={isPaused}
                        className={`aspect-square rounded flex items-center justify-center transition-all relative ${
                          isFree
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 ring-2 ring-amber-400'
                            : hasChip
                            ? 'bg-amber-600'
                            : canPlace
                            ? 'bg-yellow-500/50 ring-2 ring-yellow-300 cursor-pointer animate-pulse'
                            : 'bg-amber-800/50 hover:bg-amber-700/50'
                        }`}
                      >
                        {isFree ? (
                          renderCellIcon('FREE')
                        ) : hasChip ? (
                          <div className="w-8 h-8">
                            <PoopChip />
                          </div>
                        ) : (
                          renderCellIcon(cellIcon)
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={callShito}
            disabled={isPaused}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 font-bold text-xl py-6"
          >
            SHITO!
          </Button>

          {/* Tools link bar */}
          <div className="flex items-center justify-center gap-4 bg-black/20 rounded-lg p-2">
            <Link
              to="/shito-calling-cards"
              className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Player Cards
            </Link>
            <span className="text-amber-700">|</span>
            <Link
              to="/shito-calling-cards"
              className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Shito Calling Tool
            </Link>
          </div>
        </div>

        {/* Called items history */}
        <div className="space-y-4">
          {/* Current calling card display */}
          {currentIcon && (
            <div className="bg-black/30 rounded-lg p-3">
              <h4 className="text-amber-300 font-bold text-sm mb-2">Current Card</h4>
              <div className="relative aspect-[3/4] max-w-[120px] mx-auto bg-amber-800 rounded-lg overflow-hidden">
                {currentIcon.imageUrl ? (
                  <img src={currentIcon.imageUrl} alt={currentIcon.name} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-700 to-amber-900">
                    {currentIcon.emoji ? (
                      <span className="text-4xl">{currentIcon.emoji}</span>
                    ) : (
                      <span className="text-2xl font-black text-amber-300">{currentIcon.name.charAt(0)}</span>
                    )}
                    <span className="text-xs text-amber-200 mt-1 px-1 text-center leading-tight">{currentIcon.name}</span>
                  </div>
                )}
                {lastColumn && (
                  <div className={`absolute top-1 right-1 w-6 h-6 rounded flex items-center justify-center font-bold text-sm ${getColumnColor(lastColumn as ShitoColumn)} text-white`}>
                    {lastColumn}
                  </div>
                )}
              </div>
              <p className="text-center text-amber-200 text-xs mt-2">
                {useFallback ? 'Fallback icons' : 'Real card from DB'}
              </p>
            </div>
          )}

          {/* Bot players chip status */}
          {players.filter(p => p.isBot).length > 0 && (
            <div className="bg-black/30 rounded-lg p-3">
              <h4 className="text-amber-300 font-bold text-sm mb-2 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5" />
                Bot Players
              </h4>
              <div className="space-y-2">
                {players.filter(p => p.isBot).map(bot => {
                  const botChips = chips[bot.player_id] || [];
                  const isCurrentBotCaller = players[currentCaller]?.player_id === bot.player_id;
                  return (
                    <div
                      key={bot.player_id}
                      className={`flex items-center justify-between p-2 rounded text-xs transition-all ${
                        isCurrentBotCaller
                          ? 'bg-amber-500/20 border border-amber-500/30'
                          : 'bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${isCurrentBotCaller ? 'bg-amber-400 animate-pulse' : 'bg-gray-500'}`} />
                        <span className="text-white font-medium">{bot.player_name}</span>
                        {isCurrentBotCaller && (
                          <span className="text-[9px] bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-full font-semibold">
                            CALLER
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-4">
                          <PoopChip />
                        </div>
                        <span className="text-amber-300 font-bold">{botChips.length}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Called items list */}
          <div className="bg-black/30 rounded-lg p-3">
            <h4 className="text-white font-bold mb-2">Called Items ({calledItems.length})</h4>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {calledItems
                .slice()
                .reverse()
                .map((item: { column: string; iconId: string; name?: string }, idx: number) => (
                  <div
                    key={idx}
                    className={`flex items-center gap-2 p-2 rounded text-sm ${
                      idx === 0 ? 'bg-amber-500/30' : 'bg-white/5'
                    }`}
                  >
                    <span className={`${getColumnColor(item.column as ShitoColumn)} text-white font-bold px-2 py-0.5 rounded text-xs`}>
                      {item.column}
                    </span>
                    {renderCellIcon(item.iconId)}
                    <span className="text-gray-300 text-xs">
                      {item.name || getCallingCard(item.iconId)?.name || item.iconId}
                    </span>
                  </div>
                ))}
              {calledItems.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">No items called yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 bg-black/20 rounded-lg p-3">
        <h4 className="text-amber-300 font-semibold mb-1">How to Play:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>Caller rolls to select a column (S-H-I-T-O) and draws a calling card</li>
          <li>Find the matching icon in that column on your 5x5 bingo board</li>
          <li>Click to place a chip on matching squares (FREE space is always covered!)</li>
          <li>Get 5 in a row/column/diagonal and call SHITO to win!</li>
          <li className="text-amber-400/70 italic">Bot callers roll and draw automatically — watch for their moves!</li>
        </ul>
      </div>
    </div>
  );
}
