import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Dices, Loader2, AlertTriangle, RefreshCw, ExternalLink, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import ShitoDice from './ShitoDice';
import ShitoCallingCards, { drawCallingCard, CallingCard } from './ShitoCallingCards';
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
} from '@/lib/shitoCardService';
import { useAudio } from '@/contexts/AudioContext';

// ─── Types ────────────────────────────────────────────────────────────

interface Props {
  gameData: Record<string, any>;
  isMyTurn: boolean;
  onAction: (action: string, data?: any) => void;
  players: { player_id: string; player_name: string }[];
  currentPlayerId: string;
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

// ─── FREE Space Star SVG ──────────────────────────────────────────────

const FreeSpaceStar = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 text-yellow-300" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

// ─── Board dimensions (physical SHITO: 5 cols × 5 rows) ──────────────

const ROWS = 5;

// ─── Component ────────────────────────────────────────────────────────

export default function ShitoBoard({
  gameData,
  isMyTurn,
  onAction,
  players,
  currentPlayerId,
}: Props) {
  const { playWinSound, playDiceRoll, playVictory } = useAudio();

  // Game state from gameData
  const boards = gameData.boards || {};           // Record<playerId, BingoGrid>
  const chips = gameData.chips || {};             // Record<playerId, string[]>
  const drawnCardIds = gameData.drawnCardIds || [];
  const currentCaller = gameData.currentCaller || 0;
  const lastDiceRoll = gameData.lastDiceRoll || null;
  const lastCard = gameData.lastCard || null;     // iconId of the called card
  const lastColumn = gameData.lastColumn || null;
  const winner = gameData.winner || null;
  const phase = gameData.phase || 'waiting';
  const assignedBingoCardIds = gameData.assignedBingoCardIds || {}; // Record<playerId, bingoCardId>

  const myBoard: BingoGrid | null = boards[currentPlayerId] || null;
  const myChips: string[] = chips[currentPlayerId] || [];
  const isCaller = players[currentCaller]?.player_id === currentPlayerId;

  // Local UI state
  const [isDrawingCard, setIsDrawingCard] = useState(false);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [currentCallingCard, setCurrentCallingCard] = useState<ShitoCallingCard | null>(null);
  const [currentColumn, setCurrentColumn] = useState<ShitoColumn | null>(null);
  const [rollingColumn, setRollingColumn] = useState<ShitoColumn>('S');

  // DB-loaded cards
  const [callingCards, setCallingCards] = useState<ShitoCallingCard[]>([]);
  const [bingoCards, setBingoCards] = useState<ShitoBingoCard[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);

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

      const cc = ccResult.status === 'fulfilled' ? ccResult.value : [];
      const bc = bcResult.status === 'fulfilled' ? bcResult.value : [];

      setCallingCards(cc);
      setBingoCards(bc);

      console.log(`✅ ShitoBoard: ${cc.length} calling cards, ${bc.length} bingo cards from DB`);

      if (cc.length === 0 && bc.length === 0) {
        setCardsError('No SHITO cards found in database');
      }
    } catch (err: any) {
      console.error('ShitoBoard: failed to load cards', err);
      setCardsError(err?.message || 'Failed to load cards');
    }
    setCardsLoading(false);
  };

  // ─── Initialize boards when cards are loaded ────────────────────

  useEffect(() => {
    if (cardsLoading || !currentPlayerId) return;
    if (boards[currentPlayerId]) return; // Already initialized

    assignBoardToPlayer();
  }, [cardsLoading, currentPlayerId, boards]);

  const assignBoardToPlayer = () => {
    // Find which bingo card IDs are already assigned
    const usedIds = new Set(Object.values(assignedBingoCardIds) as string[]);

    let playerGrid: BingoGrid;
    let assignedId = '';

    if (bingoCards.length > 0) {
      // Assign a real pre-made bingo card from the DB
      const available = bingoCards.filter(bc => !usedIds.has(bc.id));
      const chosen = available.length > 0
        ? available[Math.floor(Math.random() * available.length)]
        : bingoCards[Math.floor(Math.random() * bingoCards.length)];

      playerGrid = chosen.grid;
      assignedId = chosen.id;
      console.log(`Assigned bingo card "${chosen.name}" to player ${currentPlayerId}`);
    } else if (callingCards.length > 0) {
      // Fallback: generate a board from calling card icons
      playerGrid = generateBoardFromCallingCards(callingCards, currentPlayerId);
      assignedId = `gen-${currentPlayerId}`;
    } else {
      // Ultimate fallback: empty grid (shouldn't happen)
      playerGrid = { S: [], H: [], I: [], T: [], O: [] };
      assignedId = `empty-${currentPlayerId}`;
    }

    const newBoards = { ...boards, [currentPlayerId]: playerGrid };
    const newChips = { ...chips, [currentPlayerId]: [] };
    const newAssigned = { ...assignedBingoCardIds, [currentPlayerId]: assignedId };

    onAction('initBoard', {
      boards: newBoards,
      chips: newChips,
      assignedBingoCardIds: newAssigned,
    });
  };

  // ─── Sync column from game data ─────────────────────────────────

  useEffect(() => {
    if (lastColumn) setCurrentColumn(lastColumn as ShitoColumn);
  }, [lastColumn]);

  useEffect(() => {
    if (winner) playVictory();
  }, [winner]);

  // ─── Roll & Draw ────────────────────────────────────────────────

  const handleRollAndDraw = async () => {
    if (isRollingDice || isDrawingCard) return;

    setIsRollingDice(true);
    playDiceRoll();

    let iterations = 0;
    const maxIterations = 15;

    const diceInterval = setInterval(() => {
      const randomColumn = SHITO_COLUMNS[Math.floor(Math.random() * SHITO_COLUMNS.length)];
      setRollingColumn(randomColumn);
      iterations++;

      if (iterations >= maxIterations) {
        clearInterval(diceInterval);

        const finalColumn = SHITO_COLUMNS[Math.floor(Math.random() * SHITO_COLUMNS.length)];
        setRollingColumn(finalColumn);
        setCurrentColumn(finalColumn);
        setIsRollingDice(false);

        drawCardWithColumn(finalColumn);
      }
    }, 80);
  };

  const drawCardWithColumn = async (column: ShitoColumn) => {
    setIsDrawingCard(true);
    // Pass pre-loaded calling cards so drawCallingCard uses the same deck
    const result = await drawCallingCard(drawnCardIds, callingCards);

    if (result.card) {
      setCurrentCallingCard(result.card);
      onAction('drawCard', {
        lastCard: result.card.iconId,
        lastColumn: column,
        drawnCardIds: [...drawnCardIds, result.card.id],
        phase: 'called',
        callingCardName: result.card.name,
        callingCardEmoji: result.card.emoji,
        callingCardImageUrl: result.card.imageUrl,
      });
    }
    setIsDrawingCard(false);
  };

  const handleDiceRoll = (result: string) => {
    playDiceRoll();
    onAction('rollDice', { lastDiceRoll: result, phase: 'rolled' });
  };

  const drawCard = async () => {
    setIsDrawingCard(true);
    // Pass pre-loaded calling cards so drawCallingCard uses the same deck
    const result = await drawCallingCard(drawnCardIds, callingCards);
    if (result.card) {
      setCurrentCallingCard(result.card);
      setCurrentColumn(result.column);
      onAction('drawCard', {
        lastCard: result.card.iconId,
        lastColumn: result.column,
        drawnCardIds: [...drawnCardIds, result.card.id],
        phase: 'called',
        callingCardName: result.card.name,
        callingCardEmoji: result.card.emoji,
        callingCardImageUrl: result.card.imageUrl,
      });
    }
    setIsDrawingCard(false);
  };

  const nextTurn = () => {
    const next = (currentCaller + 1) % players.length;
    onAction('nextTurn', {
      currentCaller: next,
      phase: 'waiting',
      lastDiceRoll: null,
      lastCard: null,
      lastColumn: null,
    });
    setCurrentCallingCard(null);
    setCurrentColumn(null);
  };

  // ─── Chip placement ─────────────────────────────────────────────

  const getCallingCardForIcon = useCallback(
    (iconId: string): ShitoCallingCard | undefined => {
      return callingCards.find(
        c =>
          c.iconId === iconId ||
          c.name.toLowerCase() === iconId.toLowerCase() ||
          c.iconId === iconId.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      );
    },
    [callingCards]
  );

  const placeChip = (col: number, row: number) => {
    if (!lastCard || phase !== 'called' || !myBoard) return;

    const colKey = SHITO_COLUMNS[col];
    const cellIcon = myBoard[colKey]?.[row];
    if (!cellIcon || cellIcon === 'FREE') return;

    // Normalize for matching
    const normalizedCell = cellIcon.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const normalizedLast = lastCard.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const iconMatches =
      normalizedCell === normalizedLast ||
      cellIcon === lastCard ||
      cellIcon === currentCallingCard?.iconId;

    if (!iconMatches) return;

    // Check column
    const targetColumn = lastColumn || currentColumn;
    const isWild = lastDiceRoll === 'WILD';
    const correctCol = SHITO_COLUMNS.indexOf(targetColumn as ShitoColumn);

    if (!isWild && col !== correctCol) return;

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

    const iconMatches =
      normalizedCell === normalizedLast ||
      cellIcon === lastCard ||
      cellIcon === currentCallingCard?.iconId;

    if (!iconMatches) return false;

    const targetColumn = lastColumn || currentColumn;
    const isWild = lastDiceRoll === 'WILD';
    const chipKey = `${col}-${row}`;

    return (isWild || col === SHITO_COLUMNS.indexOf(targetColumn as ShitoColumn)) &&
      !myChips.includes(chipKey);
  };

  // ─── Win check (5×5 grid) ──────────────────────────────────────

  const callShito = () => {
    // Check columns (5 down)
    for (let col = 0; col < 5; col++) {
      if ([0, 1, 2, 3, 4].every(row => {
        const colKey = SHITO_COLUMNS[col];
        const cell = myBoard?.[colKey]?.[row];
        return cell === 'FREE' || myChips.includes(`${col}-${row}`);
      })) {
        onAction('win', { winner: currentPlayerId });
        return;
      }
    }
    // Check rows (5 across)
    for (let row = 0; row < 5; row++) {
      if ([0, 1, 2, 3, 4].every(col => {
        const colKey = SHITO_COLUMNS[col];
        const cell = myBoard?.[colKey]?.[row];
        return cell === 'FREE' || myChips.includes(`${col}-${row}`);
      })) {
        onAction('win', { winner: currentPlayerId });
        return;
      }
    }
    // Diagonal top-left to bottom-right
    if ([0, 1, 2, 3, 4].every(i => {
      const colKey = SHITO_COLUMNS[i];
      const cell = myBoard?.[colKey]?.[i];
      return cell === 'FREE' || myChips.includes(`${i}-${i}`);
    })) {
      onAction('win', { winner: currentPlayerId });
      return;
    }
    // Diagonal top-right to bottom-left
    if ([0, 1, 2, 3, 4].every(i => {
      const colKey = SHITO_COLUMNS[4 - i];
      const cell = myBoard?.[colKey]?.[i];
      return cell === 'FREE' || myChips.includes(`${4 - i}-${i}`);
    })) {
      onAction('win', { winner: currentPlayerId });
      return;
    }
  };

  // ─── Icon display helper ────────────────────────────────────────

  const renderCellIcon = (iconId: string, size: 'sm' | 'md' = 'sm') => {
    if (iconId === 'FREE') {
      return (
        <div className="flex flex-col items-center justify-center">
          <FreeSpaceStar />
          <span className="text-[8px] font-black text-yellow-300 leading-none">FREE</span>
        </div>
      );
    }

    const card = getCallingCardForIcon(iconId);
    const sizeClass = size === 'sm' ? 'text-lg' : 'text-2xl';

    if (card?.imageUrl) {
      return (
        <img
          src={card.imageUrl}
          alt={card.name}
          className={`${size === 'sm' ? 'w-6 h-6' : 'w-8 h-8'} object-contain`}
        />
      );
    }

    if (card?.emoji) {
      return <span className={sizeClass}>{card.emoji}</span>;
    }

    // Show first letter as fallback
    return (
      <span className={`${sizeClass} font-bold text-amber-300`}>
        {(card?.name || iconId).charAt(0).toUpperCase()}
      </span>
    );
  };

  // ─── Loading state ──────────────────────────────────────────────

  if (cardsLoading) {
    return (
      <div className="bg-gradient-to-br from-amber-900 to-orange-900 rounded-xl p-8 text-center">
        <Loader2 className="w-10 h-10 text-amber-400 animate-spin mx-auto mb-3" />
        <p className="text-amber-300 font-semibold">Loading SHITO cards from database...</p>
        <p className="text-amber-400/60 text-sm mt-1">24 calling cards + 36 bingo cards</p>
      </div>
    );
  }

  // ─── Winner screen ──────────────────────────────────────────────

  if (winner) {
    return (
      <div className="bg-gradient-to-br from-amber-900 to-orange-900 rounded-xl p-4 text-center py-8">
        <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
        <p className="text-3xl font-bold text-yellow-400">SHITO!</p>
        <p className="text-xl text-white mt-2">
          {players.find(p => p.player_id === winner)?.player_name} wins!
        </p>
      </div>
    );
  }

  // ─── Main render ────────────────────────────────────────────────

  return (
    <div className="bg-gradient-to-br from-amber-900 to-orange-900 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-2xl font-bold text-white">SHITO!</h3>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-amber-700/60 px-2 py-0.5 rounded-full text-amber-200">
            {callingCards.length} calling / {bingoCards.length} bingo
          </span>
          {cardsError && (
            <button onClick={loadCardsFromDb} className="text-red-400 hover:text-red-300">
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
        </div>
      </div>

      {/* Error banner */}
      {cardsError && (
        <div className="bg-red-900/40 border border-red-500/30 rounded-lg p-2 mb-3 flex items-center gap-2 text-xs text-red-300">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{cardsError}</span>
          <Button variant="link" size="sm" onClick={loadCardsFromDb} className="text-red-300 underline ml-auto p-0 h-auto text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* S-H-I-T-O Column Headers with animation */}
      <div className="flex justify-center gap-2 mb-4">
        {SHITO_COLUMNS.map(col => (
          <div
            key={col}
            className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-lg transition-all duration-200 ${
              isRollingDice && rollingColumn === col
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
          {/* Caller controls */}
          {isCaller && (
            <div className="bg-black/30 rounded-lg p-4 flex flex-col items-center gap-3">
              <p className="text-amber-300 font-semibold">You're the Caller!</p>
              <div className="flex items-center gap-4 flex-wrap justify-center">
                <Button
                  onClick={handleRollAndDraw}
                  disabled={phase !== 'waiting' || isRollingDice || isDrawingCard}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 font-bold flex items-center gap-2"
                >
                  <Dices className={`w-5 h-5 ${isRollingDice ? 'animate-spin' : ''}`} />
                  {isRollingDice ? 'Rolling...' : isDrawingCard ? 'Drawing...' : 'Roll & Draw'}
                </Button>

                <ShitoDice
                  onRoll={handleDiceRoll}
                  disabled={phase !== 'waiting' || isRollingDice}
                  lastRoll={lastDiceRoll}
                />

                {phase === 'rolled' && (
                  <Button onClick={drawCard} disabled={isDrawingCard} className="bg-orange-600">
                    {isDrawingCard ? 'Drawing...' : 'Draw Card'}
                  </Button>
                )}
                {phase === 'called' && (
                  <Button onClick={nextTurn} className="bg-green-600">
                    Next Turn
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Current call display */}
          {lastCard && (currentColumn || lastColumn) && (
            <div className="bg-black/30 rounded-lg p-3 text-center">
              <div className="flex items-center justify-center gap-3">
                <div
                  className={`${getColumnColor(
                    (lastColumn || currentColumn) as ShitoColumn
                  )} text-white font-black text-2xl px-4 py-2 rounded-lg`}
                >
                  {lastColumn || currentColumn}
                </div>
                <span className="text-white text-xl">-</span>
                <div className="flex items-center gap-2">
                  {renderCellIcon(lastCard, 'md')}
                  <span className="text-white font-bold">
                    {currentCallingCard?.name ||
                      gameData.callingCardName ||
                      getCallingCardForIcon(lastCard)?.name ||
                      lastCard}
                  </span>
                </div>
              </div>
              <p className="text-amber-300 text-sm mt-2">
                Find this icon in the{' '}
                <span className="font-bold">{lastColumn || currentColumn}</span> column!
              </p>
            </div>
          )}

          {/* Game Board — 5×5 grid matching the physical SHITO game */}
          <div className="bg-black/20 rounded-lg p-3">
            {/* Column headers */}
            <div className="grid grid-cols-5 gap-1 mb-1">
              {SHITO_COLUMNS.map((l, i) => (
                <div
                  key={i}
                  className={`text-white font-bold text-center py-1 rounded transition-all ${
                    lastColumn === l || currentColumn === l
                      ? `${getColumnColor(l)} ring-2 ring-white`
                      : lastDiceRoll === 'WILD'
                      ? 'bg-purple-500'
                      : 'bg-amber-700'
                  }`}
                >
                  {l}
                </div>
              ))}
            </div>

            {/* 5×5 cell grid */}
            <div className="grid grid-cols-5 gap-1">
              {SHITO_COLUMNS.map((colKey, col) => (
                <div key={col} className="flex flex-col gap-1">
                  {[0, 1, 2, 3, 4].map(row => {
                    const cellIcon = myBoard?.[colKey]?.[row] || '';
                    const isFree = cellIcon === 'FREE';
                    const chipKey = `${col}-${row}`;
                    const hasChip = isFree || myChips.includes(chipKey);
                    const canPlace = !isFree && isValidPlacement(col, row) && !myChips.includes(chipKey);

                    return (
                      <button
                        key={row}
                        onClick={() => canPlace && placeChip(col, row)}
                        className={`aspect-square rounded flex items-center justify-center transition-all relative ${
                          isFree
                            ? 'bg-gradient-to-br from-amber-500 to-orange-600 ring-2 ring-amber-400'
                            : hasChip
                            ? 'bg-amber-600'
                            : canPlace
                            ? 'bg-yellow-500/50 ring-2 ring-yellow-300 cursor-pointer animate-pulse'
                            : 'bg-amber-800/50'
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

          {/* SHITO button */}
          <Button
            onClick={callShito}
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
            <span className="text-amber-700">|</span>
            <Link
              to="/practice?game=shito"
              className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 transition-colors"
            >
              <Dices className="w-3.5 h-3.5" />
              Practice Mode
            </Link>
          </div>
        </div>

        {/* Calling Cards Panel — now receives the same DB cards as the board */}
        <div>
          <ShitoCallingCards
            drawnCards={drawnCardIds}
            isDrawing={isDrawingCard || isRollingDice}
            currentCard={currentCallingCard}
            currentColumn={(lastColumn || currentColumn) as ShitoColumn}
            callingCards={callingCards}
            showToolsLink={true}
          />
        </div>
      </div>
    </div>
  );
}
