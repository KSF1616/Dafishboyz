import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dice1, Dice2, Dice3, Dice4, Dice5, Dice6,
  Trophy, RotateCcw, Lightbulb, Loader2,
  Shuffle, Check, Info, AlertTriangle, Users, ArrowRight,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  getSpaceEffect, getSpaceColor, SpaceEffect, SPACE_EFFECTS,
  parseCardEffect, ParsedCardAction,
  findNextSpaceOfType, findClosestSpaceOfType,
  SpaceType,
} from '@/data/shitzCreekSpaceEffects';
import ShitzCreekDeckTracker from '@/components/lobby/ShitzCreekDeckTracker';
import {
  DeckState,
  initializeDeck,
  drawFromDeck,
} from '@/lib/shitzCreekDeck';
import BotCardRevealOverlay, { type BotCardRevealData } from '@/components/practice/BotCardRevealOverlay';

// ─── Types ────────────────────────────────────────────────────────────

interface Props {
  gameData: Record<string, any>;
  isMyTurn: boolean;
  onAction: (action: string, data?: any) => void;
  players: { player_id: string; player_name: string; isBot?: boolean; avatar?: string }[];
  currentPlayerId: string;
  isPaused?: boolean;
  onHint?: () => void;
  /** When a bot draws a card, this data drives the animated reveal overlay */
  botCardReveal?: BotCardRevealData | null;
  /** Called when the bot card reveal overlay auto-dismisses or is tapped away */
  onBotCardDismiss?: () => void;
}


/** Row shape from the parsed_game_cards table (via game-card-loader) */
interface DbCard {
  id: string;
  game_id: string;
  card_type: string;
  card_name: string;
  card_text: string | null;
  card_effect: string;
  card_category: string;
  card_number: number;
  drink_count: number;
  metadata: Record<string, any>;
  source_file: string;
}

// ─── Constants ────────────────────────────────────────────────────────

const BOARD_SPACES = [
  { x: 8, y: 88 }, { x: 16, y: 86 }, { x: 24, y: 82 }, { x: 32, y: 78 },
  { x: 40, y: 74 }, { x: 48, y: 70 }, { x: 56, y: 66 }, { x: 64, y: 62 },
  { x: 72, y: 56 }, { x: 78, y: 48 }, { x: 82, y: 40 }, { x: 84, y: 32 },
  { x: 82, y: 24 }, { x: 76, y: 18 }, { x: 68, y: 14 }, { x: 58, y: 12 },
  { x: 48, y: 14 }, { x: 38, y: 18 }, { x: 28, y: 24 }, { x: 20, y: 32 },
  { x: 18, y: 42 }, { x: 22, y: 50 }, { x: 30, y: 56 }, { x: 40, y: 58 },
  { x: 50, y: 55 }, { x: 58, y: 48 },
];

const TOTAL_SPACES = BOARD_SPACES.length;
const FINISH_SPACE = TOTAL_SPACES - 1;

// ─── Small sub-components ─────────────────────────────────────────────

const DiceIcon = ({ value }: { value: number }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1] || Dice1;
  return <Icon className="w-12 h-12 text-white" />;
};

const PaddleIcon = ({ count, size = 'md' }: { count: number; size?: 'sm' | 'md' }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" className={`${sizeClass} text-amber-400`} fill="currentColor">
          <ellipse cx="12" cy="6" rx="6" ry="4" />
          <rect x="10" y="8" width="4" height="14" rx="1" />
        </svg>
      ))}
      {count > 5 && <span className="text-amber-400 text-xs">+{count - 5}</span>}
    </div>
  );
};

// ─── Helpers for card display ─────────────────────────────────────────

function getCardActionIcon(action: ParsedCardAction | null): string {
  if (!action) return '💩';
  switch (action.type) {
    case 'paddle_gain': case 'go_to_space_and_gain_paddle': return '🏆';
    case 'paddle_lose': return '😢';
    case 'paddle_steal': return '🦝';
    case 'paddle_gift_right': case 'paddle_gift_choose': return '🎁';
    case 'move_forward': return '🚀';
    case 'move_back': return '⬅️';
    case 'lose_turn': return '⏸️';
    case 'extra_turn': case 'draw_again': return '🎲';
    case 'go_to_space': return '📍';
    case 'take_lead': return '👑';
    case 'send_player_to': case 'move_player_behind_last': return '😈';
    case 'bring_player': case 'bring_all_players': return '🧲';
    case 'behind_leader': return '🏃';
    case 'go_back_with_player': case 'move_both_to_space': return '👥';
    case 'skip_yellow': return '🛡️';
    case 'move_ahead_of_player': return '🏎️';
    default: return '💩';
  }
}

function getCardActionColor(action: ParsedCardAction | null): string {
  if (!action) return 'from-amber-700 to-amber-900';
  switch (action.type) {
    case 'paddle_gain': case 'go_to_space_and_gain_paddle': case 'extra_turn': case 'take_lead':
      return 'from-green-600 to-emerald-800';
    case 'paddle_lose': case 'lose_turn': case 'move_back': case 'behind_leader':
      return 'from-red-600 to-red-900';
    case 'paddle_steal': case 'send_player_to': case 'move_player_behind_last':
      return 'from-purple-600 to-purple-900';
    case 'go_to_space': case 'move_both_to_space':
      return 'from-blue-600 to-blue-900';
    case 'skip_yellow':
      return 'from-yellow-500 to-amber-700';
    default:
      return 'from-amber-700 to-amber-900';
  }
}

// ─── Main Component ───────────────────────────────────────────────────

export default function PracticeShitzCreekBoard({
  gameData,
  isMyTurn,
  onAction,
  players,
  currentPlayerId,
  isPaused,
  onHint,
  botCardReveal,
  onBotCardDismiss,
}: Props) {

  // ── Local UI state ────────────────────────────────────────────────
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState('');
  const [boardImage, setBoardImage] = useState<string | null>(null);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [showSpaceInfo, setShowSpaceInfo] = useState(false);

  // DB card deck
  const [dbCards, setDbCards] = useState<DbCard[]>([]);
  const [dbCardsMap, setDbCardsMap] = useState<Map<string, DbCard>>(new Map());
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);

  // Card modal
  const [showCardModal, setShowCardModal] = useState(false);
  const [drawnDbCard, setDrawnDbCard] = useState<DbCard | null>(null);
  const [parsedAction, setParsedAction] = useState<ParsedCardAction | null>(null);
  const [isDrawingCard, setIsDrawingCard] = useState(false);
  const [waitingForCard, setWaitingForCard] = useState(false);

  // Player picker modal (for needsPlayerSelect actions)
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);
  const [playerPickerPrompt, setPlayerPickerPrompt] = useState('');
  const [pendingAction, setPendingAction] = useState<ParsedCardAction | null>(null);

  // Landed space tracking
  const [landedSpaceEffect, setLandedSpaceEffect] = useState<SpaceEffect | null>(null);
  const [landedSpaceIndex, setLandedSpaceIndex] = useState<number | null>(null);

  const gameDataRef = useRef(gameData);
  useEffect(() => { gameDataRef.current = gameData; }, [gameData]);

  const deckInitRef = useRef(false);

  // ── Derived game state ────────────────────────────────────────────
  const positions: Record<string, number> = gameData.positions || {};
  const paddles: Record<string, number> = gameData.paddles || {};
  const dice: number = gameData.dice || 1;
  const currentTurn: number = gameData.currentTurn || 0;
  const winner: string | null = gameData.winner || null;
  const skipTurn: Record<string, boolean> = gameData.skipTurn || {};
  const extraRoll: Record<string, boolean> = gameData.extraRoll || {};
  const skipYellow: Record<string, boolean> = gameData.skipYellow || {};
  const lastCard = gameData.lastCard || null;
  const deckState: DeckState | null = gameData.deckState || null;

  const currentPlayer = players[currentTurn];
  const isCurrentPlayer = currentPlayer?.player_id === currentPlayerId;

  // ── Initialisation ────────────────────────────────────────────────

  useEffect(() => {
    loadBoardImage();
    loadCardsFromDb();
  }, []);

  useEffect(() => {
    if (Object.keys(positions).length === 0 && players.length > 0) {
      const initPositions: Record<string, number> = {};
      const initPaddles: Record<string, number> = {};
      players.forEach(p => {
        initPositions[p.player_id] = 0;
        initPaddles[p.player_id] = 1;
      });
      onAction('init', { positions: initPositions, paddles: initPaddles, currentTurn: 0 });
    }
  }, [players.length]);

  // Initialise the deck in gameData once cards are loaded
  useEffect(() => {
    if (dbCards.length > 0 && !deckState && !deckInitRef.current) {
      deckInitRef.current = true;
      const newDeck = initializeDeck(dbCards.map(c => c.id));
      onAction('initDeck', { deckState: newDeck });
      console.log(`🃏 Practice: Initialized deck with ${newDeck.drawPile.length} cards`);
    }
  }, [dbCards, deckState]);

  // ── Load board image ──────────────────────────────────────────────

  const loadBoardImage = async () => {
    try {
      const { data } = await supabase.storage.from('Game Boards').list('', {
        limit: 100,
        search: 'shitz-creek',
      });
      if (data && data.length > 0) {
        const boardFile = data.find(
          f => f.name.toLowerCase().includes('shitz-creek') && f.name.match(/\.(png|jpg|jpeg|gif|webp)$/i),
        );
        if (boardFile) {
          const { data: urlData } = supabase.storage.from('Game Boards').getPublicUrl(boardFile.name);
          setBoardImage(urlData.publicUrl);
          setLoadingBoard(false);
          return;
        }
      }
      const { data: fallbackData } = await supabase.storage.from('game-boards').list('shitz-creek-board');
      if (fallbackData && fallbackData.length > 0) {
        const boardFile = fallbackData.find(f => f.name.match(/\.(png|jpg|jpeg|gif|webp)$/i));
        if (boardFile) {
          const { data: urlData } = supabase.storage.from('game-boards').getPublicUrl(`shitz-creek-board/${boardFile.name}`);
          setBoardImage(urlData.publicUrl);
        }
      }
    } catch (err) {
      console.log('Board image not found:', err);
    }
    setLoadingBoard(false);
  };

  // ── Load real cards from DB via edge function ─────────────────────

  const loadCardsFromDb = async () => {
    setCardsLoading(true);
    setCardsError(null);
    try {
      const { data, error } = await supabase.functions.invoke('game-card-loader', {
        body: { action: 'get-cards', gameId: 'shitz-creek' },
      });
      if (error) throw error;

      const payload = data as any;
      let cards: DbCard[] = [];

      if (payload?.cards && Array.isArray(payload.cards)) {
        cards = payload.cards;
      } else if (payload?.data?.cards && Array.isArray(payload.data.cards)) {
        cards = payload.data.cards;
      } else {
        throw new Error('Unexpected response shape from game-card-loader');
      }

      setDbCards(cards);
      const map = new Map<string, DbCard>();
      cards.forEach(c => map.set(c.id, c));
      setDbCardsMap(map);
      console.log(`✅ Practice: Loaded ${cards.length} real shit-pile cards from DB`);
    } catch (err: any) {
      console.error('Practice: Failed to load cards from DB:', err);
      setCardsError(err?.message || 'Failed to load cards');
    }
    setCardsLoading(false);
  };

  // ── Helpers ───────────────────────────────────────────────────────

  const getPlayerColor = (index: number): string => {
    const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500'];
    return colors[index % colors.length];
  };

  const getPlayerToRight = (): string | null => {
    const idx = players.findIndex(p => p.player_id === currentPlayer?.player_id);
    if (idx < 0 || players.length < 2) return null;
    return players[(idx + 1) % players.length].player_id;
  };

  const getClosestPlayer = (): string | null => {
    const playerId = currentPlayer?.player_id;
    if (!playerId) return null;
    const myPos = positions[playerId] || 0;
    let closest: string | null = null;
    let closestDist = Infinity;
    players.forEach(p => {
      if (p.player_id === playerId) return;
      const dist = Math.abs((positions[p.player_id] || 0) - myPos);
      if (dist < closestDist) { closestDist = dist; closest = p.player_id; }
    });
    return closest;
  };

  // ── Apply space effect after landing ──────────────────────────────

  const applySpaceEffect = useCallback(
    (spaceIndex: number, currentPositions: Record<string, number>, currentPaddles: Record<string, number>, playerId: string) => {
      const effect = getSpaceEffect(spaceIndex);
      setLandedSpaceIndex(spaceIndex);
      setLandedSpaceEffect(effect);

      if (effect.type === 'none') {
        return { positions: currentPositions, paddles: currentPaddles, needsCard: false, message: effect.text };
      }

      const newPositions = { ...currentPositions };
      const newPaddles = { ...currentPaddles };
      let msg = effect.text;

      if (effect.spaceType === 'shit_pile' && skipYellow[playerId]) {
        const newSkipYellow = { ...skipYellow, [playerId]: false };
        onAction('update', { skipYellow: newSkipYellow });
        return { positions: newPositions, paddles: newPaddles, needsCard: false, message: 'You skipped this yellow (Shit Pile) space!' };
      }

      switch (effect.type) {
        case 'paddle_gain':
          newPaddles[playerId] = (newPaddles[playerId] || 1) + (effect.value || 1);
          break;
        case 'paddle_lose':
          if (newPaddles[playerId] > 0) {
            newPaddles[playerId] = Math.max(0, (newPaddles[playerId] || 1) - (effect.value || 1));
          }
          break;
        case 'move_forward':
          newPositions[playerId] = Math.min(FINISH_SPACE, (newPositions[playerId] || 0) + (effect.value || 2));
          break;
        case 'move_back':
          newPositions[playerId] = Math.max(0, (newPositions[playerId] || 0) - (effect.value || 2));
          break;
        case 'go_to_start':
          newPositions[playerId] = 0;
          break;
        case 'take_lead': {
          const maxPos = Math.max(...Object.values(newPositions).map(p => p || 0));
          if (maxPos > (newPositions[playerId] || 0)) {
            newPositions[playerId] = Math.min(maxPos + 1, FINISH_SPACE);
          }
          break;
        }
        case 'skip_turn':
          return { positions: newPositions, paddles: newPaddles, needsCard: false, message: msg, skipTurn: true };
        case 'extra_roll':
          return { positions: newPositions, paddles: newPaddles, needsCard: false, message: msg, extraRoll: true };
        case 'swap_random': {
          const otherPlayers = players.filter(p => p.player_id !== playerId);
          if (otherPlayers.length > 0) {
            const randomPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
            const myPos = newPositions[playerId] || 0;
            const theirPos = newPositions[randomPlayer.player_id] || 0;
            newPositions[playerId] = theirPos;
            newPositions[randomPlayer.player_id] = myPos;
            msg = `Swapped positions with ${randomPlayer.player_name}!`;
          }
          break;
        }
        case 'draw_card':
          return { positions: newPositions, paddles: newPaddles, needsCard: true, message: msg };
      }

      return { positions: newPositions, paddles: newPaddles, needsCard: false, message: msg };
    },
    [players, skipYellow, onAction],
  );

  // ── Draw a card from the persistent deck ──────────────────────────

  const drawCard = () => {
    if (dbCards.length === 0) {
      setMessage('No cards loaded! Try refreshing.');
      return;
    }

    const currentDeck = gameDataRef.current.deckState as DeckState | null;
    if (!currentDeck) {
      const newDeck = initializeDeck(dbCards.map(c => c.id));
      onAction('initDeck', { deckState: newDeck });
      setMessage('Deck initialised! Draw again.');
      return;
    }

    setIsDrawingCard(true);
    setTimeout(() => {
      const latestDeck = (gameDataRef.current.deckState as DeckState) || currentDeck;
      const result = drawFromDeck(latestDeck);

      if (!result.cardId) {
        setMessage('No cards in deck!');
        setIsDrawingCard(false);
        return;
      }

      // Persist updated deck state
      onAction('updateDeck', { deckState: result.deckState });

      if (result.reshuffled) {
        setMessage('Discard pile reshuffled back into the deck!');
      }

      const card = dbCardsMap.get(result.cardId) || dbCards.find(c => c.id === result.cardId);
      if (!card) {
        setMessage('Card not found in local data!');
        setIsDrawingCard(false);
        return;
      }

      const action = parseCardEffect(card.card_effect);
      setDrawnDbCard(card);
      setParsedAction(action);
      setIsDrawingCard(false);
    }, 800);
  };

  // ── Execute a parsed card action ──────────────────────────────────

  const executeAction = useCallback(
    (action: ParsedCardAction, targetPlayerId?: string): boolean => {
      const gd = gameDataRef.current;
      const pos = { ...(gd.positions || {}) };
      const pad = { ...(gd.paddles || {}) };
      const sk = { ...(gd.skipTurn || {}) };
      const er = { ...(gd.extraRoll || {}) };
      const sy = { ...(gd.skipYellow || {}) };

      const playerId = currentPlayer?.player_id;
      if (!playerId) return false;

      if (!pad[playerId]) pad[playerId] = 1;
      const myPos = pos[playerId] || 0;

      switch (action.type) {
        case 'move_back':
          pos[playerId] = Math.max(0, myPos - (action.value || 2));
          setMessage(`Moved back ${action.value || 2} spaces!`);
          break;
        case 'move_forward':
          pos[playerId] = Math.min(FINISH_SPACE, myPos + (action.value || 2));
          setMessage(`Moved forward ${action.value || 2} spaces!`);
          break;
        case 'paddle_gain':
          pad[playerId] = (pad[playerId] || 1) + 1;
          setMessage('Got a paddle! +1');
          break;
        case 'paddle_lose':
          pad[playerId] = Math.max(0, (pad[playerId] || 1) - 1);
          setMessage('Lost a paddle! -1');
          break;
        case 'paddle_steal':
          if (targetPlayerId && (pad[targetPlayerId] || 0) > 0) {
            pad[targetPlayerId]--;
            pad[playerId] = (pad[playerId] || 1) + 1;
            setMessage(`Stole a paddle from ${players.find(p => p.player_id === targetPlayerId)?.player_name}!`);
          } else {
            setMessage('Target has no paddles to steal!');
          }
          break;
        case 'paddle_gift_right': {
          const rightId = getPlayerToRight();
          if (rightId && pad[playerId] > 0) {
            pad[playerId]--;
            pad[rightId] = (pad[rightId] || 1) + 1;
            setMessage(`Gifted a paddle to ${players.find(p => p.player_id === rightId)?.player_name}!`);
          } else {
            setMessage('No paddle to gift!');
          }
          break;
        }
        case 'paddle_gift_choose':
          if (targetPlayerId && pad[playerId] > 0) {
            pad[playerId]--;
            pad[targetPlayerId] = (pad[targetPlayerId] || 1) + 1;
            setMessage(`Gifted a paddle to ${players.find(p => p.player_id === targetPlayerId)?.player_name}!`);
          } else {
            setMessage('No paddle to gift!');
          }
          break;
        case 'lose_turn':
          sk[playerId] = true;
          setMessage('You lose your next turn!');
          break;
        case 'extra_turn':
          er[playerId] = true;
          setMessage('Take another turn!');
          break;
        case 'draw_again':
          setMessage('Draw again!');
          break;
        case 'go_to_space': {
          if (action.targetSpace) {
            const target =
              action.targetSpace === 'shit_pile'
                ? findClosestSpaceOfType(myPos, action.targetSpace)
                : findNextSpaceOfType(myPos, action.targetSpace);
            pos[playerId] = target;
            setMessage(`Moved to ${SPACE_EFFECTS[target]?.spaceName || action.targetSpace} (space ${target})!`);
          }
          break;
        }
        case 'go_to_space_and_gain_paddle': {
          if (action.targetSpace) {
            const target = findClosestSpaceOfType(myPos, action.targetSpace);
            pos[playerId] = target;
            pad[playerId] = (pad[playerId] || 1) + 1;
            setMessage('Moved to Paddle Shop and got a free paddle!');
          }
          break;
        }
        case 'take_lead': {
          const maxPos = Math.max(...Object.values(pos).map(p => (typeof p === 'number' ? p : 0)));
          if (maxPos > myPos) pos[playerId] = Math.min(maxPos + 1, FINISH_SPACE);
          setMessage('You took the lead!');
          break;
        }
        case 'move_ahead_of_player':
          if (targetPlayerId) {
            const theirPos = pos[targetPlayerId] || 0;
            pos[playerId] = Math.min(theirPos + 1, FINISH_SPACE);
            setMessage(`Moved ahead of ${players.find(p => p.player_id === targetPlayerId)?.player_name}!`);
          }
          break;
        case 'behind_leader': {
          const leaderPos = Math.max(...Object.values(pos).map(p => (typeof p === 'number' ? p : 0)));
          pos[playerId] = Math.max(0, leaderPos - (action.value || 3));
          setMessage('Moved to 3 spaces behind the leader!');
          break;
        }
        case 'send_player_to':
          if (targetPlayerId && action.targetSpace) {
            const target = findClosestSpaceOfType(pos[targetPlayerId] || 0, action.targetSpace);
            pos[targetPlayerId] = target;
            setMessage(`Sent ${players.find(p => p.player_id === targetPlayerId)?.player_name} to ${SPACE_EFFECTS[target]?.spaceName || action.targetSpace}!`);
          }
          break;
        case 'bring_player':
          if (targetPlayerId) {
            pos[targetPlayerId] = myPos;
            setMessage(`Brought ${players.find(p => p.player_id === targetPlayerId)?.player_name} to your space!`);
          }
          break;
        case 'bring_all_players':
          players.forEach(p => { pos[p.player_id] = myPos; });
          setMessage('Brought all players to your space!');
          break;
        case 'go_back_with_player': {
          const closestId = getClosestPlayer();
          const backSpaces = action.value || 3;
          pos[playerId] = Math.max(0, myPos - backSpaces);
          if (closestId) {
            pos[closestId] = Math.max(0, (pos[closestId] || 0) - backSpaces);
            setMessage(`You and ${players.find(p => p.player_id === closestId)?.player_name} went back ${backSpaces} spaces!`);
          } else {
            setMessage(`Went back ${backSpaces} spaces!`);
          }
          break;
        }
        case 'move_player_behind_last':
          if (targetPlayerId) {
            const minPos = Math.min(...Object.values(pos).map(p => (typeof p === 'number' ? p : 0)));
            pos[targetPlayerId] = Math.max(0, minPos - 1);
            setMessage(`Moved ${players.find(p => p.player_id === targetPlayerId)?.player_name} behind last place!`);
          }
          break;
        case 'skip_yellow':
          sy[playerId] = true;
          setMessage('You can skip the next yellow (Shit Pile) space!');
          break;
        case 'move_both_to_space': {
          if (action.targetSpace) {
            const target = findClosestSpaceOfType(myPos, action.targetSpace);
            pos[playerId] = target;
            if (targetPlayerId) {
              pos[targetPlayerId] = target;
              setMessage(`You and ${players.find(p => p.player_id === targetPlayerId)?.player_name} moved to ${SPACE_EFFECTS[target]?.spaceName}!`);
            }
          }
          break;
        }
      }

      // Check for win after card effect
      if ((pos[playerId] || 0) >= FINISH_SPACE && (pad[playerId] || 0) >= 2) {
        onAction('win', { winner: playerId, positions: pos, paddles: pad });
        return false;
      }

      onAction('cardEffect', {
        positions: pos,
        paddles: pad,
        skipTurn: sk,
        extraRoll: er,
        skipYellow: sy,
        lastCard: { text: action.text, type: action.type },
      });

      return action.type === 'draw_again';
    },
    [currentPlayer, players, onAction],
  );

  // ── Handle "Continue" after viewing drawn card ────────────────────

  const handleCardContinue = useCallback(() => {
    if (!parsedAction) {
      closeCardModal();
      nextTurn();
      return;
    }

    if (parsedAction.needsPlayerSelect) {
      const otherPlayers = players.filter(p => p.player_id !== currentPlayer?.player_id);
      if (otherPlayers.length === 0) {
        setMessage('No other players to target!');
        closeCardModal();
        setTimeout(() => nextTurn(), 800);
        return;
      }

      let prompt = 'Select a player';
      switch (parsedAction.type) {
        case 'paddle_steal': prompt = 'Select a player to steal a paddle from'; break;
        case 'paddle_gift_choose': prompt = 'Select a player to gift a paddle to'; break;
        case 'send_player_to': prompt = `Select a player to send to ${parsedAction.targetSpace?.replace('_', ' ')}`; break;
        case 'bring_player': prompt = 'Select a player to bring to your space'; break;
        case 'move_ahead_of_player': prompt = 'Select a player to move ahead of'; break;
        case 'move_player_behind_last': prompt = 'Select a player to move behind last place'; break;
        case 'move_both_to_space': prompt = `Select a player to move to ${parsedAction.targetSpace?.replace('_', ' ')} with you`; break;
      }

      setPlayerPickerPrompt(prompt);
      setPendingAction(parsedAction);
      setShowCardModal(false);
      setShowPlayerPicker(true);
      setWaitingForCard(false);
      return;
    }

    const shouldDrawAgain = executeAction(parsedAction);
    setShowCardModal(false);
    setWaitingForCard(false);
    setDrawnDbCard(null);
    setParsedAction(null);

    if (shouldDrawAgain) {
      setTimeout(() => {
        setShowCardModal(true);
        setWaitingForCard(true);
        setDrawnDbCard(null);
        setParsedAction(null);
      }, 600);
    } else {
      setTimeout(() => nextTurn(), 1000);
    }
  }, [parsedAction, players, currentPlayer, executeAction]);

  // ── Handle player selection from picker ───────────────────────────

  const handlePlayerSelected = useCallback(
    (targetPlayerId: string) => {
      if (!pendingAction) return;
      const shouldDrawAgain = executeAction(pendingAction, targetPlayerId);
      setShowPlayerPicker(false);
      setPendingAction(null);
      setDrawnDbCard(null);
      setParsedAction(null);

      if (shouldDrawAgain) {
        setTimeout(() => {
          setShowCardModal(true);
          setWaitingForCard(true);
          setDrawnDbCard(null);
          setParsedAction(null);
        }, 600);
      } else {
        setTimeout(() => nextTurn(), 1000);
      }
    },
    [pendingAction, executeAction],
  );

  // ── Close modals ──────────────────────────────────────────────────

  const closeCardModal = () => {
    setShowCardModal(false);
    setWaitingForCard(false);
    setDrawnDbCard(null);
    setParsedAction(null);
  };

  // ── Roll dice ─────────────────────────────────────────────────────

  const rollDice = () => {
    if (!isCurrentPlayer || rolling || isPaused || waitingForCard || showPlayerPicker) return;

    const playerId = currentPlayer.player_id;

    if (skipTurn[playerId]) {
      const newSkip = { ...skipTurn, [playerId]: false };
      setMessage('Turn skipped!');
      onAction('update', { skipTurn: newSkip });
      setTimeout(() => nextTurn(newSkip), 1000);
      return;
    }

    setRolling(true);
    setMessage('');
    setLandedSpaceEffect(null);
    setLandedSpaceIndex(null);

    setTimeout(() => {
      const latestData = gameDataRef.current;
      const latestPositions = latestData.positions || {};
      const latestPaddles = latestData.paddles || {};

      const roll = Math.floor(Math.random() * 6) + 1;
      const currentPos = latestPositions[playerId] || 0;
      const newPos = Math.min(currentPos + roll, FINISH_SPACE);

      const newPaddles = { ...latestPaddles };
      if (!newPaddles[playerId]) newPaddles[playerId] = 1;

      if (newPos >= FINISH_SPACE) {
        if (newPaddles[playerId] >= 2) {
          onAction('win', {
            winner: playerId,
            dice: roll,
            positions: { ...latestPositions, [playerId]: FINISH_SPACE },
            paddles: newPaddles,
          });
          setRolling(false);
          return;
        } else {
          setMessage('Need 2 paddles to win! Collect more paddles!');
        }
      }

      const newPositions = { ...latestPositions, [playerId]: newPos };
      const result = applySpaceEffect(newPos, newPositions, newPaddles, playerId);

      setMessage(result.message || '');

      if (result.needsCard) {
        setWaitingForCard(true);
        setShowCardModal(true);
        setDrawnDbCard(null);
        setParsedAction(null);
        onAction('move', { dice: roll, positions: result.positions, paddles: result.paddles });
        setRolling(false);
        return;
      }

      if ((result as any).skipTurn) {
        onAction('move', {
          dice: roll,
          positions: result.positions,
          paddles: result.paddles,
          skipTurn: { ...skipTurn, [playerId]: true },
        });
        setRolling(false);
        setTimeout(() => nextTurn(), 1500);
        return;
      }

      if ((result as any).extraRoll) {
        onAction('move', {
          dice: roll,
          positions: result.positions,
          paddles: result.paddles,
          extraRoll: { ...extraRoll, [playerId]: true },
        });
        setRolling(false);
        return;
      }

      onAction('move', { dice: roll, positions: result.positions, paddles: result.paddles });
      setRolling(false);

      setTimeout(() => nextTurn(), 1500);
    }, 800);
  };

  // ── Next turn ─────────────────────────────────────────────────────

  const nextTurn = (currentSkip?: Record<string, boolean>) => {
    const next = (currentTurn + 1) % players.length;
    onAction('nextTurn', {
      currentTurn: next,
      lastCard: null,
      skipTurn: currentSkip || skipTurn,
      extraRoll: {},
    });
    setMessage('');
    setLandedSpaceEffect(null);
    setLandedSpaceIndex(null);
  };

  // ── Winner screen ─────────────────────────────────────────────────

  if (winner) {
    const winnerPlayer = players.find(p => p.player_id === winner);
    const winnerName = winnerPlayer?.player_name || 'Unknown';
    return (
      <div className="bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900 rounded-xl p-6 text-center">
        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
        <h2 className="text-3xl font-bold text-yellow-400 mb-2">Winner!</h2>
        <p className="text-xl text-white">
          {winnerName} {winnerPlayer?.isBot ? '(Bot)' : ''} made it up Shitz Creek!
        </p>
        <Button
          onClick={() =>
            onAction('reset', {
              positions: {},
              paddles: {},
              winner: null,
              currentTurn: 0,
              dice: 1,
              skipTurn: {},
              extraRoll: {},
              skipYellow: {},
              lastCard: null,
              deckState: null, // Will be re-initialised
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

  // ── Render ────────────────────────────────────────────────────────

  const displaySpaceIndex = landedSpaceIndex !== null ? landedSpaceIndex : (positions[currentPlayer?.player_id] || 0);
  const displaySpaceEffect = landedSpaceEffect || getSpaceEffect(positions[currentPlayer?.player_id] || 0);

  return (
    <div className="bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900 rounded-xl p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-white">Up Shitz Creek</h3>
        <div className="flex gap-2 items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSpaceInfo(!showSpaceInfo)}
            className="text-amber-200 hover:text-white"
          >
            <Info className="w-4 h-4 mr-1" />
            Spaces
          </Button>
          {onHint && (
            <Button onClick={onHint} variant="outline" size="sm" className="text-amber-300 border-amber-500">
              <Lightbulb className="w-4 h-4 mr-1" />
              Hint
            </Button>
          )}
        </div>
      </div>

      {/* Deck Tracker */}
      <div className="mb-3">
        <ShitzCreekDeckTracker deckState={deckState} loading={cardsLoading} />
      </div>

      {/* Cards loading error */}
      {cardsError && (
        <div className="bg-red-900/60 border border-red-500/50 rounded-lg p-3 mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <div className="text-sm text-red-200 flex-1">
            <span className="font-semibold">Card loading failed:</span> {cardsError}
          </div>
          <Button variant="link" size="sm" onClick={loadCardsFromDb} className="text-red-300 underline p-0 h-auto">
            Retry
          </Button>
        </div>
      )}

      {/* Space Info Panel */}
      {showSpaceInfo && (
        <div className="bg-black/50 rounded-lg p-3 mb-4 max-h-48 overflow-y-auto">
          <h4 className="text-amber-300 font-bold mb-2">Space Effects:</h4>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {SPACE_EFFECTS.map((effect, idx) => (
              <div key={idx} className={`flex items-center gap-1 p-1 rounded ${getSpaceColor(effect)}`}>
                <span>{effect.emoji}</span>
                <span className="text-white">
                  {idx}: {effect.type === 'none' ? (idx === 0 ? 'Start' : idx === 25 ? 'Finish' : 'Safe') : effect.type.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skip-yellow token indicator */}
      {currentPlayer && skipYellow[currentPlayer.player_id] && (
        <div className="bg-yellow-600/40 border border-yellow-500/50 rounded-lg p-2 mb-3 text-center text-yellow-200 text-sm flex items-center justify-center gap-2">
          <span>🛡️</span> Skip Yellow Space token active!
        </div>
      )}

      {/* Game Board */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-blue-900 via-blue-700 to-green-800 rounded-xl overflow-hidden border-4 border-amber-600 mb-4">
        {loadingBoard ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        ) : boardImage ? (
          <img
            src={boardImage}
            alt="Shitz Creek Game Board"
            className="absolute inset-0 w-full h-full object-contain bg-amber-900"
          />
        ) : (
          <>
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path
                d={`M ${BOARD_SPACES.map(s => `${s.x},${s.y}`).join(' L ')}`}
                fill="none"
                stroke="rgba(139, 69, 19, 0.5)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {BOARD_SPACES.map((space, idx) => {
              const effect = getSpaceEffect(idx);
              return (
                <div
                  key={idx}
                  className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-xs transform -translate-x-1/2 -translate-y-1/2 border-2 border-white/50 ${getSpaceColor(effect)}`}
                  style={{ left: `${space.x}%`, top: `${space.y}%` }}
                  title={effect.text}
                >
                  {effect.emoji}
                </div>
              );
            })}
          </>
        )}

        {/* Player pieces */}
        {players.map((player, idx) => {
          const pos = positions[player.player_id] || 0;
          const space = BOARD_SPACES[Math.min(pos, BOARD_SPACES.length - 1)];
          const offset = idx * 3;

          return (
            <div
              key={player.player_id}
              className={`absolute w-8 h-8 rounded-full flex items-center justify-center text-lg transition-all duration-500 ${getPlayerColor(idx)} ring-2 ring-white shadow-lg`}
              style={{
                left: `${space.x + offset}%`,
                top: `${space.y - 5}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: player.player_id === currentPlayerId ? 10 : 5,
              }}
              title={`${player.player_name} - Space ${pos}`}
            >
              {player.isBot ? player.avatar || '🤖' : '💩'}
            </div>
          );
        })}
      </div>

      {/* Current space effect display */}
      {currentPlayer && (
        <div className={`rounded-lg p-2 mb-3 text-center text-white text-sm ${getSpaceColor(displaySpaceEffect)}`}>
          <span className="mr-2">{displaySpaceEffect.emoji}</span>
          Space {displaySpaceIndex}: {displaySpaceEffect.text}
        </div>
      )}

      {/* Dice and controls */}
      <div className="flex justify-center items-center gap-4 mb-4">
        <div className={`bg-amber-700 rounded-xl p-3 ${rolling ? 'animate-bounce' : ''}`}>
          <DiceIcon value={dice} />
        </div>
        <Button
          onClick={rollDice}
          disabled={!isCurrentPlayer || rolling || isPaused || waitingForCard || showPlayerPicker}
          className="bg-yellow-600 hover:bg-yellow-500 text-lg px-6 py-4"
        >
          {rolling
            ? 'Rolling...'
            : waitingForCard
              ? 'Draw Card First!'
              : skipTurn[currentPlayer?.player_id]
                ? 'Skip Turn'
                : extraRoll[currentPlayer?.player_id]
                  ? 'Roll Again!'
                  : 'Roll Dice'}
        </Button>
      </div>

      {/* Message */}
      {message && message !== displaySpaceEffect.text && (
        <div className="bg-red-600/50 rounded-lg p-3 mb-4 text-center text-white animate-pulse">
          {message}
        </div>
      )}

      {/* Last card effect */}
      {lastCard && (
        <div className="bg-yellow-600/30 rounded-lg p-3 mb-4 text-center text-yellow-200">
          {lastCard.text}
        </div>
      )}

      {/* Players list */}
      <div className="bg-black/30 rounded-lg p-3">
        <h4 className="text-white font-bold mb-2">Players</h4>
        <div className="space-y-2">
          {players.map((p, idx) => (
            <div
              key={p.player_id}
              className={`flex justify-between items-center py-2 px-3 rounded ${
                idx === currentTurn ? 'bg-amber-600/50 ring-1 ring-amber-400' : 'bg-white/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full ${getPlayerColor(idx)} flex items-center justify-center text-sm`}>
                  {p.isBot ? p.avatar || '🤖' : '💩'}
                </div>
                <span className={`${p.player_id === currentPlayerId ? 'text-green-400' : 'text-white'}`}>
                  {p.player_name} {p.player_id === currentPlayerId && '(You)'}
                  {p.isBot && <span className="text-xs text-purple-300 ml-1">[Bot]</span>}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {skipYellow[p.player_id] && (
                  <span className="text-xs bg-yellow-600/50 text-yellow-200 px-1.5 py-0.5 rounded" title="Skip Yellow token">
                    🛡️
                  </span>
                )}
                {skipTurn[p.player_id] && (
                  <span className="text-xs bg-gray-600/50 text-gray-300 px-1.5 py-0.5 rounded">
                    Skip
                  </span>
                )}
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                  {getSpaceEffect(positions[p.player_id] || 0).emoji} Space {positions[p.player_id] || 0}
                </span>
                <PaddleIcon count={paddles[p.player_id] || 1} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 bg-black/20 rounded-lg p-3">
        <h4 className="text-amber-300 font-semibold mb-1">How to Play:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>Roll the dice and move up the creek</li>
          <li>Each space has a unique effect - check the Space Guide!</li>
          <li>Land on shit-pile spaces to draw a real card from the deck</li>
          <li>Cards are drawn without replacement - when the deck runs out, the discard pile is reshuffled back in</li>
          <li>Some cards let you target other players</li>
          <li>Collect 2 paddles to be able to win</li>
          <li>Reach the finish with 2 paddles to win!</li>
        </ul>
      </div>

      {/* ─── Card Modal ──────────────────────────────────────────── */}
      {showCardModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-amber-900 to-yellow-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border-4 border-amber-600">
            <h3 className="text-xl font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
              <span className="text-3xl">💩</span> Shit Pile Card!
            </h3>

            {/* Card display */}
            <div className={`relative aspect-[3/4] rounded-xl overflow-hidden mb-4 ${isDrawingCard ? 'animate-pulse' : ''}`}>
              {drawnDbCard && parsedAction ? (
                <div
                  className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${getCardActionColor(parsedAction)} p-6`}
                  style={{ animation: 'fadeIn 0.4s ease-out' }}
                >
                  <div className="text-6xl mb-4">{getCardActionIcon(parsedAction)}</div>
                  <div className="bg-black/30 rounded-lg px-4 py-2 mb-3">
                    <p className="text-amber-300 text-xs font-mono">{drawnDbCard.card_name}</p>
                  </div>
                  <p className="text-white font-bold text-xl text-center leading-tight">
                    {drawnDbCard.card_effect}
                  </p>
                  {parsedAction.needsPlayerSelect && (
                    <div className="mt-3 flex items-center gap-1 text-yellow-300 text-sm">
                      <Users className="w-4 h-4" />
                      <span>Choose a player next</span>
                    </div>
                  )}
                  {parsedAction.targetSpace && (
                    <div className="mt-2 text-amber-200 text-xs">
                      Target: {parsedAction.targetSpace.replace('_', ' ').toUpperCase()} space
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-700 to-amber-900">
                  <div className="text-7xl mb-4 animate-bounce">💩</div>
                  <p className="text-amber-200 font-bold text-lg">Shit Pile</p>
                  <p className="text-amber-300/70 text-sm mt-1">Draw a card!</p>
                </div>
              )}
            </div>

            {/* Effect description */}
            {parsedAction && (
              <div className="bg-gradient-to-r from-yellow-600/80 to-amber-600/80 rounded-lg p-4 mb-4 text-center border-2 border-yellow-400">
                <p className="text-white font-bold text-lg">{parsedAction.text}</p>
                <p className="text-amber-200 text-xs mt-1 capitalize">{parsedAction.type.replace(/_/g, ' ')}</p>
              </div>
            )}

            {/* Draw / Continue buttons */}
            {!drawnDbCard ? (
              <Button
                onClick={drawCard}
                disabled={isDrawingCard || dbCards.length === 0}
                className="w-full bg-amber-600 hover:bg-amber-500 text-lg py-6 font-bold"
              >
                {isDrawingCard ? (
                  <>
                    <Shuffle className="w-5 h-5 mr-2 animate-spin" />
                    Drawing...
                  </>
                ) : dbCards.length === 0 ? (
                  <>
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    {cardsLoading ? 'Loading Cards...' : 'No Cards Loaded'}
                  </>
                ) : (
                  <>
                    <Shuffle className="w-5 h-5 mr-2" />
                    Draw Card
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleCardContinue}
                className="w-full bg-green-600 hover:bg-green-500 text-lg py-6 font-bold animate-pulse"
              >
                <Check className="w-5 h-5 mr-2" />
                {parsedAction?.needsPlayerSelect ? 'Choose Player' : 'Continue'}
              </Button>
            )}

            {/* Deck status in modal */}
            <div className="mt-3">
              <ShitzCreekDeckTracker deckState={deckState} loading={cardsLoading} />
            </div>
          </div>
        </div>
      )}

      {/* ─── Player Picker Modal ─────────────────────────────────── */}
      {showPlayerPicker && pendingAction && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border-4 border-purple-500">
            <h3 className="text-xl font-bold text-white mb-2 text-center flex items-center justify-center gap-2">
              <Users className="w-6 h-6 text-purple-300" />
              Choose a Player
            </h3>
            <p className="text-purple-200 text-sm text-center mb-4">{playerPickerPrompt}</p>

            <div className="bg-black/30 rounded-lg p-3 mb-4 text-center">
              <span className="text-2xl mr-2">{getCardActionIcon(pendingAction)}</span>
              <span className="text-white font-bold">{pendingAction.text}</span>
            </div>

            <div className="space-y-2">
              {players
                .filter(p => p.player_id !== currentPlayer?.player_id)
                .map(p => (
                  <button
                    key={p.player_id}
                    onClick={() => handlePlayerSelected(p.player_id)}
                    className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 border-2 border-transparent hover:border-purple-400 rounded-xl p-4 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{p.isBot ? p.avatar || '🤖' : '💩'}</span>
                      <div className="text-left">
                        <p className="text-white font-bold">
                          {p.player_name}
                          {p.isBot && <span className="text-xs text-purple-300 ml-1">[Bot]</span>}
                        </p>
                        <p className="text-purple-300 text-xs">
                          Space {positions[p.player_id] || 0} &middot; {paddles[p.player_id] || 1} paddle
                          {(paddles[p.player_id] || 1) !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" />
                  </button>
                ))}
            </div>

            <Button
              variant="outline"
              onClick={() => {
                setShowPlayerPicker(false);
                setPendingAction(null);
                setTimeout(() => nextTurn(), 500);
              }}
              className="w-full mt-4 border-purple-500 text-purple-200 hover:bg-purple-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* ─── Bot Card Reveal Overlay ─────────────────────────────── */}
      {botCardReveal && onBotCardDismiss && (
        <BotCardRevealOverlay
          data={botCardReveal}
          onDismiss={onBotCardDismiss}
          duration={2500}
        />
      )}
    </div>
  );
}
