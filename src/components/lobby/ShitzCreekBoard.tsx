import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Loader2, Volume2, VolumeX, Info, Shuffle, Check, Users, ArrowRight, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

import PlayerPiece from './PlayerPiece';
import ShitzCreekPaddle from './ShitzCreekPaddle';
import ShitzCreekDeckTracker from './ShitzCreekDeckTracker';
import BotCardRevealOverlay from '@/components/practice/BotCardRevealOverlay';
import type { BotCardRevealData } from '@/components/practice/BotCardRevealOverlay';
import { useAudio } from '@/contexts/AudioContext';
import {
  getSpaceEffect, getSpaceColor, SpaceEffect, SPACE_EFFECTS,
  parseCardEffect, ParsedCardAction, findNextSpaceOfType, findClosestSpaceOfType,
  SpaceType,
} from '@/data/shitzCreekSpaceEffects';
import {
  getShitzCreekBoardUrl,
  GAME_STORAGE_PATHS,
} from '@/lib/gameAssets';
import {
  DeckState,
  initializeDeck,
  drawFromDeck,
} from '@/lib/shitzCreekDeck';


// ─── Types ────────────────────────────────────────────────────────────

interface Props {
  gameData: Record<string, any>;
  isMyTurn: boolean;
  onAction: (action: string, data?: any) => void;
  players: { player_id: string; player_name: string }[];
  currentPlayerId: string;
}

/** Shape of a card row from the parsed_game_cards table */
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

const POOP_FACES = [
  { emoji: '💩', expression: 'happy', color: '#8B4513' },
  { emoji: '💩', expression: 'angry', color: '#6B3410' },
  { emoji: '💩', expression: 'silly', color: '#A0522D' },
  { emoji: '💩', expression: 'cool', color: '#5D3A1A' },
  { emoji: '💩', expression: 'sleepy', color: '#7B3F00' },
  { emoji: '💩', expression: 'wink', color: '#964B00' },
];

const DiceIcon = ({ value }: { value: number }) => {
  const icons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];
  const Icon = icons[value - 1] || Dice1;
  return <Icon className="w-10 h-10 text-white" />;
};

// Board space positions (percentage-based for overlay on the board image)
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

// ─── Component ────────────────────────────────────────────────────────

export default function ShitzCreekBoard({ gameData, isMyTurn, onAction, players, currentPlayerId }: Props) {
  const { playWinSound, playFart, playToiletFlush, playSplash, playBubbles, speakText, speechEnabled, toggleSpeech } = useAudio();

  // Core game state (driven by gameData prop)
  const positions = gameData.positions || {};
  const paddles = gameData.paddles || {};
  const dice = gameData.dice || 1;
  const lastCard = gameData.lastCard;
  const winner = gameData.winner;
  const skipTurn = gameData.skipTurn || {};
  const extraRoll = gameData.extraRoll || {};
  const skipYellow = gameData.skipYellow || {};

  // Deck state from gameData (persistent across turns, synced in multiplayer)
  const deckState: DeckState | null = gameData.deckState || null;

  // Local UI state
  const [rolling, setRolling] = useState(false);
  const [message, setMessage] = useState('');
  const [boardImage, setBoardImage] = useState<string | null>(null);
  const [loadingBoard, setLoadingBoard] = useState(true);
  const [showSpaceInfo, setShowSpaceInfo] = useState(false);

  // Card deck loaded from DB (full card objects for display)
  const [dbCards, setDbCards] = useState<DbCard[]>([]);
  const [dbCardsMap, setDbCardsMap] = useState<Map<string, DbCard>>(new Map());
  const [cardsLoading, setCardsLoading] = useState(true);
  const [cardsError, setCardsError] = useState<string | null>(null);

  // Card modal state
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
  // Landed space tracking
  const [landedSpaceEffect, setLandedSpaceEffect] = useState<SpaceEffect | null>(null);
  const [landedSpaceIndex, setLandedSpaceIndex] = useState<number | null>(null);

  // ── Remote / bot card reveal overlay state ─────────────────────────
  const [remoteCardReveal, setRemoteCardReveal] = useState<BotCardRevealData | null>(null);
  const lastRevealTimestampRef = useRef<number>(0);

  // Ref to always have latest gameData in callbacks
  const gameDataRef = useRef(gameData);
  useEffect(() => { gameDataRef.current = gameData; }, [gameData]);

  // Track whether we've already initialised the deck for this session
  const deckInitRef = useRef(false);

  // ── Detect remote card reveals from gameData.lastCardReveal ────────
  useEffect(() => {
    const reveal = gameData.lastCardReveal;
    if (!reveal || !reveal.timestamp) return;
    // Only show if it's a new reveal we haven't seen, and it's not from us
    if (reveal.timestamp <= lastRevealTimestampRef.current) return;
    if (reveal.playerId === currentPlayerId) return;

    lastRevealTimestampRef.current = reveal.timestamp;
    setRemoteCardReveal({
      botName: reveal.playerName || 'Player',
      card: {
        card_name: reveal.card?.card_name || 'Unknown Card',
        card_effect: reveal.card?.card_effect || '',
        card_category: reveal.card?.card_category,
      },
      parsedAction: reveal.parsedAction,
      targetPlayerName: reveal.targetPlayerName,
    });
  }, [gameData.lastCardReveal, currentPlayerId]);


  // ─── Initialisation ─────────────────────────────────────────────

  useEffect(() => {
    if (players.length > 0 && Object.keys(positions).length === 0) {
      const initPositions: Record<string, number> = {};
      const initPaddles: Record<string, number> = {};
      players.forEach(p => { initPositions[p.player_id] = 0; initPaddles[p.player_id] = 1; });
      onAction('init', { positions: initPositions, paddles: initPaddles });
    }
  }, [players.length]);

  useEffect(() => { loadBoardImage(); loadCardsFromDb(); }, []);
  useEffect(() => { if (winner) playWinSound(); }, [winner]);

  // Initialise the deck in gameData once cards are loaded and no deck exists yet
  useEffect(() => {
    if (dbCards.length > 0 && !deckState && !deckInitRef.current) {
      deckInitRef.current = true;
      const newDeck = initializeDeck(dbCards.map(c => c.id));
      onAction('initDeck', { deckState: newDeck });
      console.log(`🃏 Initialized deck with ${newDeck.drawPile.length} cards`);
    }
  }, [dbCards, deckState]);

  // ─── Load board image ───────────────────────────────────────────

  const loadBoardImage = async () => {
    try {
      const directUrl = getShitzCreekBoardUrl();
      if (directUrl) {
        const testImg = new Image();
        testImg.onload = () => { setBoardImage(directUrl); setLoadingBoard(false); };
        testImg.onerror = () => loadBoardFromStorage();
        testImg.src = directUrl;
        return;
      }
      await loadBoardFromStorage();
    } catch { setLoadingBoard(false); }
  };

  const loadBoardFromStorage = async () => {
    try {
      const storagePaths = GAME_STORAGE_PATHS['shitz-creek'];
      const { data: urlData } = supabase.storage.from(storagePaths.board.bucket).getPublicUrl(storagePaths.board.path);
      if (urlData?.publicUrl) { setBoardImage(urlData.publicUrl); }
    } catch {}
    setLoadingBoard(false);
  };

  // ─── Load real cards from DB ────────────────────────────────────

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
        cards = payload.cards as DbCard[];
      } else if (payload?.data?.cards && Array.isArray(payload.data.cards)) {
        cards = payload.data.cards as DbCard[];
      } else {
        throw new Error('Unexpected response shape');
      }
      setDbCards(cards);
      // Build a lookup map for fast card retrieval by ID
      const map = new Map<string, DbCard>();
      cards.forEach(c => map.set(c.id, c));
      setDbCardsMap(map);
      console.log(`✅ Loaded ${cards.length} real shit-pile cards from DB`);
    } catch (err: any) {
      console.error('Failed to load cards from DB:', err);
      setCardsError(err?.message || 'Failed to load cards');
    }
    setCardsLoading(false);
  };

  // ─── Audio helpers ──────────────────────────────────────────────

  const playSpaceSound = (effect: SpaceEffect) => {
    if (effect.type === 'paddle_gain' || effect.type === 'take_lead' || effect.type === 'extra_roll') playBubbles();
    else if (effect.type === 'paddle_lose' || effect.type === 'go_to_start') playFart();
    else if (effect.type === 'move_back' || effect.type === 'skip_turn') playSplash();
    else if (effect.type === 'draw_card') playToiletFlush();
  };

  const playCardSound = (action: ParsedCardAction) => {
    const t = action.type;
    if (t === 'paddle_gain' || t === 'take_lead' || t === 'extra_turn' || t === 'go_to_space_and_gain_paddle') playBubbles();
    else if (t === 'paddle_lose' || t === 'lose_turn') playFart();
    else if (t === 'move_back' || t === 'go_to_space' || t === 'behind_leader') playSplash();
    else if (t === 'paddle_steal' || t === 'send_player_to' || t === 'move_player_behind_last') playToiletFlush();
  };

  // ─── Apply space effect after landing ───────────────────────────

  const applySpaceEffect = useCallback((spaceIndex: number, currentPositions: Record<string, number>, currentPaddles: Record<string, number>) => {
    const effect = getSpaceEffect(spaceIndex);
    setLandedSpaceIndex(spaceIndex);
    setLandedSpaceEffect(effect);

    if (effect.type === 'none') {
      setMessage(effect.text);
      speakText(effect.text);
      return { positions: currentPositions, paddles: currentPaddles, needsCard: false };
    }

    playSpaceSound(effect);
    speakText(effect.text);
    setMessage(effect.text);

    const newPositions = { ...currentPositions };
    const newPaddles = { ...currentPaddles };

    // Check if player has a skip-yellow token and landed on a shit_pile (yellow) space
    if (effect.spaceType === 'shit_pile' && skipYellow[currentPlayerId]) {
      const newSkipYellow = { ...skipYellow, [currentPlayerId]: false };
      onAction('setSkipYellow', { skipYellow: newSkipYellow });
      setMessage('You skipped this yellow (Shit Pile) space!');
      speakText('You skipped this yellow space!');
      return { positions: newPositions, paddles: newPaddles, needsCard: false };
    }

    switch (effect.type) {
      case 'paddle_gain':
        newPaddles[currentPlayerId] = (newPaddles[currentPlayerId] || 1) + (effect.value || 1);
        break;
      case 'paddle_lose':
        newPaddles[currentPlayerId] = Math.max(0, (newPaddles[currentPlayerId] || 1) - (effect.value || 1));
        break;
      case 'move_forward':
        newPositions[currentPlayerId] = Math.min(FINISH_SPACE, (newPositions[currentPlayerId] || 0) + (effect.value || 2));
        break;
      case 'move_back':
        newPositions[currentPlayerId] = Math.max(0, (newPositions[currentPlayerId] || 0) - (effect.value || 2));
        break;
      case 'go_to_start':
        newPositions[currentPlayerId] = 0;
        break;
      case 'take_lead': {
        const maxPos = Math.max(...Object.values(newPositions).map(p => p || 0));
        if (maxPos > (newPositions[currentPlayerId] || 0))
          newPositions[currentPlayerId] = Math.min(maxPos + 1, FINISH_SPACE);
        break;
      }
      case 'skip_turn':
        onAction('setSkip', { skipTurn: { ...skipTurn, [currentPlayerId]: true } });
        break;
      case 'extra_roll':
        onAction('setExtraRoll', { extraRoll: { ...extraRoll, [currentPlayerId]: true } });
        break;
      case 'swap_random': {
        const others = players.filter(p => p.player_id !== currentPlayerId);
        if (others.length > 0) {
          const rp = others[Math.floor(Math.random() * others.length)];
          const myPos = newPositions[currentPlayerId] || 0;
          const theirPos = newPositions[rp.player_id] || 0;
          newPositions[currentPlayerId] = theirPos;
          newPositions[rp.player_id] = myPos;
          setMessage(`Swapped positions with ${rp.player_name}!`);
        }
        break;
      }
      case 'draw_card':
        return { positions: newPositions, paddles: newPaddles, needsCard: true };
    }

    return { positions: newPositions, paddles: newPaddles, needsCard: false };
  }, [currentPlayerId, players, skipTurn, extraRoll, skipYellow, onAction, speakText]);

  // ─── Draw a card from the persistent deck ───────────────────────

  const drawCard = () => {
    if (dbCards.length === 0) {
      setMessage('No cards loaded! Try refreshing.');
      return;
    }

    const currentDeck = gameDataRef.current.deckState as DeckState | null;
    if (!currentDeck) {
      // Fallback: deck not initialised yet – init now
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
        setMessage('No cards in deck! Something went wrong.');
        setIsDrawingCard(false);
        return;
      }

      // Persist the updated deck state
      onAction('updateDeck', { deckState: result.deckState });

      if (result.reshuffled) {
        setMessage('Discard pile reshuffled back into the deck!');
        speakText('The discard pile has been shuffled back into the deck!');
      }

      // Look up the full card object
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
      playCardSound(action);
      speakText(card.card_effect);
    }, 800);
  };

  // ─── Get player to the right (for paddle_gift_right) ────────────

  const getPlayerToRight = (): string | null => {
    const idx = players.findIndex(p => p.player_id === currentPlayerId);
    if (idx < 0 || players.length < 2) return null;
    return players[(idx + 1) % players.length].player_id;
  };

  // ─── Get closest player (for go_back_with_player) ───────────────

  const getClosestPlayer = (): string | null => {
    const myPos = positions[currentPlayerId] || 0;
    let closest: string | null = null;
    let closestDist = Infinity;
    players.forEach(p => {
      if (p.player_id === currentPlayerId) return;
      const dist = Math.abs((positions[p.player_id] || 0) - myPos);
      if (dist < closestDist) { closestDist = dist; closest = p.player_id; }
    });
    return closest;
  };

  // ─── Execute a parsed card action (no player select needed) ─────

  const executeAction = useCallback((action: ParsedCardAction, targetPlayerId?: string) => {
    const gd = gameDataRef.current;
    const pos = { ...(gd.positions || {}) };
    const pad = { ...(gd.paddles || {}) };
    const sk = { ...(gd.skipTurn || {}) };
    const er = { ...(gd.extraRoll || {}) };
    const sy = { ...(gd.skipYellow || {}) };

    if (!pad[currentPlayerId]) pad[currentPlayerId] = 1;
    const myPos = pos[currentPlayerId] || 0;

    switch (action.type) {
      case 'move_back':
        pos[currentPlayerId] = Math.max(0, myPos - (action.value || 2));
        break;
      case 'move_forward':
        pos[currentPlayerId] = Math.min(FINISH_SPACE, myPos + (action.value || 2));
        break;
      case 'paddle_gain':
        pad[currentPlayerId] = (pad[currentPlayerId] || 1) + 1;
        break;
      case 'paddle_lose':
        pad[currentPlayerId] = Math.max(0, (pad[currentPlayerId] || 1) - 1);
        break;
      case 'paddle_steal':
        if (targetPlayerId && pad[targetPlayerId] > 0) {
          pad[targetPlayerId]--;
          pad[currentPlayerId] = (pad[currentPlayerId] || 1) + 1;
          setMessage(`Stole a paddle from ${players.find(p => p.player_id === targetPlayerId)?.player_name}!`);
        }
        break;
      case 'paddle_gift_right': {
        const rightId = getPlayerToRight();
        if (rightId && pad[currentPlayerId] > 0) {
          pad[currentPlayerId]--;
          pad[rightId] = (pad[rightId] || 1) + 1;
          setMessage(`Gifted a paddle to ${players.find(p => p.player_id === rightId)?.player_name}!`);
        }
        break;
      }
      case 'paddle_gift_choose':
        if (targetPlayerId && pad[currentPlayerId] > 0) {
          pad[currentPlayerId]--;
          pad[targetPlayerId] = (pad[targetPlayerId] || 1) + 1;
          setMessage(`Gifted a paddle to ${players.find(p => p.player_id === targetPlayerId)?.player_name}!`);
        }
        break;
      case 'lose_turn':
        sk[currentPlayerId] = true;
        setMessage('You lose your next turn!');
        break;
      case 'extra_turn':
        er[currentPlayerId] = true;
        setMessage('Take another turn!');
        break;
      case 'draw_again':
        setMessage('Draw again!');
        break;
      case 'go_to_space': {
        if (action.targetSpace) {
          const target = action.targetSpace === 'shit_pile'
            ? findClosestSpaceOfType(myPos, action.targetSpace)
            : findNextSpaceOfType(myPos, action.targetSpace);
          pos[currentPlayerId] = target;
          setMessage(`Moved to ${SPACE_EFFECTS[target]?.spaceName || action.targetSpace} (space ${target})!`);
        }
        break;
      }
      case 'go_to_space_and_gain_paddle': {
        if (action.targetSpace) {
          const target = findClosestSpaceOfType(myPos, action.targetSpace);
          pos[currentPlayerId] = target;
          pad[currentPlayerId] = (pad[currentPlayerId] || 1) + 1;
          setMessage(`Moved to Paddle Shop and got a free paddle!`);
        }
        break;
      }
      case 'take_lead': {
        const maxPos = Math.max(...Object.values(pos).map(p => (typeof p === 'number' ? p : 0)));
        if (maxPos > myPos) pos[currentPlayerId] = Math.min(maxPos + 1, FINISH_SPACE);
        setMessage('You took the lead!');
        break;
      }
      case 'move_ahead_of_player':
        if (targetPlayerId) {
          const theirPos = pos[targetPlayerId] || 0;
          pos[currentPlayerId] = Math.min(theirPos + 1, FINISH_SPACE);
          setMessage(`Moved ahead of ${players.find(p => p.player_id === targetPlayerId)?.player_name}!`);
        }
        break;
      case 'behind_leader': {
        const leaderPos = Math.max(...Object.values(pos).map(p => (typeof p === 'number' ? p : 0)));
        pos[currentPlayerId] = Math.max(0, leaderPos - (action.value || 3));
        setMessage(`Moved to 3 spaces behind the leader!`);
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
        pos[currentPlayerId] = Math.max(0, myPos - backSpaces);
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
        sy[currentPlayerId] = true;
        setMessage('You can skip the next yellow (Shit Pile) space!');
        break;
      case 'move_both_to_space': {
        if (action.targetSpace) {
          const target = findClosestSpaceOfType(myPos, action.targetSpace);
          pos[currentPlayerId] = target;
          if (targetPlayerId) {
            pos[targetPlayerId] = target;
            setMessage(`You and ${players.find(p => p.player_id === targetPlayerId)?.player_name} moved to ${SPACE_EFFECTS[target]?.spaceName}!`);
          }
        }
        break;
      }
    }

    // Dispatch the update (deckState is already persisted separately via updateDeck)
    onAction('cardEffect', {
      positions: pos,
      paddles: pad,
      skipTurn: sk,
      extraRoll: er,
      skipYellow: sy,
      lastCard: { text: action.text, type: action.type },
    });

    return action.type === 'draw_again';
  }, [currentPlayerId, players, onAction, speakText]);

  // ─── Handle "Continue" after viewing drawn card ─────────────────

  const handleCardContinue = useCallback(() => {
    if (!parsedAction) {
      closeCardModal();
      return;
    }

    if (parsedAction.needsPlayerSelect) {
      const otherPlayers = players.filter(p => p.player_id !== currentPlayerId);
      if (otherPlayers.length === 0) {
        setMessage('No other players to target!');
        closeCardModal();
        return;
      }
      let prompt = 'Select a player';
      switch (parsedAction.type) {
        case 'paddle_steal': prompt = 'Select a player to steal a paddle from'; break;
        case 'paddle_gift_choose': prompt = 'Select a player to gift a paddle to'; break;
        case 'send_player_to': prompt = `Select a player to send to ${parsedAction.targetSpace}`; break;
        case 'bring_player': prompt = 'Select a player to bring to your space'; break;
        case 'move_ahead_of_player': prompt = 'Select a player to move ahead of'; break;
        case 'move_player_behind_last': prompt = 'Select a player to move behind last place'; break;
        case 'move_both_to_space': prompt = `Select a player to move to ${parsedAction.targetSpace} with you`; break;
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
    }
  }, [parsedAction, players, currentPlayerId, executeAction]);

  // ─── Handle player selection from picker ────────────────────────

  const handlePlayerSelected = useCallback((targetPlayerId: string) => {
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
    }
  }, [pendingAction, executeAction]);

  // ─── Close modals ───────────────────────────────────────────────

  const closeCardModal = () => {
    setShowCardModal(false);
    setWaitingForCard(false);
    setDrawnDbCard(null);
    setParsedAction(null);
  };

  // ─── Roll dice ──────────────────────────────────────────────────

  const rollDice = useCallback(() => {
    const gd = gameDataRef.current;
    const curPos = gd.positions || {};
    const curPad = gd.paddles || {};
    const curSkip = gd.skipTurn || {};
    const curExtra = gd.extraRoll || {};

    if (!isMyTurn || rolling || waitingForCard || showPlayerPicker) return;

    if (curSkip[currentPlayerId]) {
      onAction('skipTurn', { skipTurn: { ...curSkip, [currentPlayerId]: false } });
      setMessage('Turn skipped!');
      return;
    }

    setRolling(true);
    setMessage('');
    setLandedSpaceEffect(null);
    setLandedSpaceIndex(null);

    setTimeout(() => {
      const latest = gameDataRef.current;
      const latestPos = latest.positions || {};
      const latestPad = latest.paddles || {};

      const roll = Math.floor(Math.random() * 6) + 1;
      const currentPos = latestPos[currentPlayerId] || 0;
      const landingSpace = Math.min(currentPos + roll, FINISH_SPACE);

      const newPad = { ...latestPad };
      if (!newPad[currentPlayerId]) newPad[currentPlayerId] = 1;

      if (landingSpace >= FINISH_SPACE) {
        if (newPad[currentPlayerId] >= 2) {
          playToiletFlush();
          onAction('win', { winner: currentPlayerId, dice: roll, positions: { ...latestPos, [currentPlayerId]: FINISH_SPACE }, paddles: newPad });
          setRolling(false);
          return;
        } else {
          setMessage('Need 2 paddles to win! Collect more paddles!');
          speakText('You need two paddles to win!');
        }
      }

      const newPos = { ...latestPos, [currentPlayerId]: landingSpace };
      const result = applySpaceEffect(landingSpace, newPos, newPad);

      if (result.needsCard) {
        setWaitingForCard(true);
        setShowCardModal(true);
        setDrawnDbCard(null);
        setParsedAction(null);
        onAction('move', { dice: roll, positions: result.positions, paddles: result.paddles });
      } else {
        const newExtra = { ...curExtra };
        if (newExtra[currentPlayerId]) delete newExtra[currentPlayerId];
        onAction('move', { dice: roll, positions: result.positions, paddles: result.paddles, extraRoll: newExtra });
      }

      setRolling(false);
    }, 1000);
  }, [isMyTurn, rolling, waitingForCard, showPlayerPicker, currentPlayerId, onAction, applySpaceEffect, playToiletFlush, speakText]);

  // ─── Helpers ────────────────────────────────────────────────────

  const getPlayerPoop = (index: number) => POOP_FACES[index % POOP_FACES.length];

  const getCardActionIcon = (action: ParsedCardAction | null) => {
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
  };

  const getCardActionColor = (action: ParsedCardAction | null) => {
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
  };

  // ─── Winner screen ──────────────────────────────────────────────

  if (winner) {
    return (
      <div className="bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900 rounded-xl p-8 text-center">
        <h2 className="text-3xl font-bold text-yellow-400 mb-4">Winner!</h2>
        <p className="text-xl text-white">{players.find(p => p.player_id === winner)?.player_name} made it up Shitz Creek!</p>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────

  const displaySpaceIndex = landedSpaceIndex !== null ? landedSpaceIndex : (positions[currentPlayerId] || 0);
  const displaySpaceEffect = landedSpaceEffect || getSpaceEffect(positions[currentPlayerId] || 0);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-900 rounded-xl p-4 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-2xl font-bold text-white">Up Shitz Creek</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowSpaceInfo(!showSpaceInfo)} className="text-amber-200 hover:text-white">
              <Info className="w-4 h-4 mr-1" /> Space Guide
            </Button>
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
            <div className="text-sm text-red-200">
              <span className="font-semibold">Card loading failed:</span> {cardsError}
              <Button variant="link" size="sm" onClick={loadCardsFromDb} className="text-red-300 underline ml-2 p-0 h-auto">
                Retry
              </Button>
            </div>
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
                  <span className="text-white">{idx}: {effect.spaceName || 'Safe'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Game Board */}
        <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-blue-900 via-blue-700 to-green-800 rounded-xl overflow-hidden border-4 border-amber-600">
          {loadingBoard ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          ) : boardImage ? (
            <img src={boardImage} alt="Shitz Creek Game Board" className="absolute inset-0 w-full h-full object-contain bg-amber-900" />
          ) : (
            <>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d={`M ${BOARD_SPACES.map(s => `${s.x},${s.y}`).join(' L ')}`} fill="none" stroke="rgba(139,69,19,0.6)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {BOARD_SPACES.map((space, idx) => {
                const effect = getSpaceEffect(idx);
                return (
                  <div key={idx} className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-xs transform -translate-x-1/2 -translate-y-1/2 border-2 border-white/50 ${getSpaceColor(effect)}`} style={{ left: `${space.x}%`, top: `${space.y}%` }} title={effect.text}>
                    {effect.emoji}
                  </div>
                );
              })}
            </>
          )}

          {/* Player pieces */}
          {players.map((player, idx) => {
            const pos = positions[player.player_id] || 0;
            const spacePos = BOARD_SPACES[Math.min(pos, BOARD_SPACES.length - 1)];
            return (
              <PlayerPiece key={player.player_id} player={player} position={spacePos} poop={getPlayerPoop(idx)} offset={idx * 8} isCurrentPlayer={player.player_id === currentPlayerId} playerIndex={idx} />
            );
          })}
        </div>

        {/* Dice display */}
        <div className="flex justify-center my-4">
          <div className={`bg-amber-700 rounded-xl p-3 ${rolling ? 'animate-bounce' : ''}`}>
            <DiceIcon value={dice} />
          </div>
        </div>

        {/* Current space effect */}
        <div className={`rounded-lg p-2 mb-3 text-center text-white text-sm ${getSpaceColor(displaySpaceEffect)}`}>
          <span className="mr-2">{displaySpaceEffect.emoji}</span>
          Space {displaySpaceIndex}: {displaySpaceEffect.text}
        </div>

        {/* Last card effect */}
        {lastCard && (
          <div className="bg-yellow-600/50 rounded-lg p-3 mb-3 text-center text-white animate-pulse">
            {lastCard.text}
          </div>
        )}

        {/* General message */}
        {message && message !== displaySpaceEffect.text && (
          <div className="bg-red-600/50 rounded-lg p-3 mb-3 text-center text-white">
            {message}
          </div>
        )}

        {/* Skip-yellow token indicator */}
        {skipYellow[currentPlayerId] && (
          <div className="bg-yellow-600/40 border border-yellow-500/50 rounded-lg p-2 mb-3 text-center text-yellow-200 text-sm flex items-center justify-center gap-2">
            <span>🛡️</span> You have a Skip Yellow Space token active!
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-2 mb-4">
          <Button onClick={rollDice} disabled={!isMyTurn || rolling || waitingForCard || showPlayerPicker} className="bg-yellow-600 hover:bg-yellow-500">
            {rolling ? 'Rolling...' : waitingForCard ? 'Draw Card First!' : skipTurn[currentPlayerId] ? 'Skip Turn' : extraRoll[currentPlayerId] ? 'Roll Again!' : 'Roll Dice'}
          </Button>
          <Button onClick={() => onAction('endTurn', {})} disabled={!isMyTurn || waitingForCard} variant="outline">
            End Turn
          </Button>
          <Button onClick={toggleSpeech} variant="outline" size="icon" title={speechEnabled ? 'Mute announcements' : 'Enable announcements'}>
            {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
        </div>

        {/* Players list */}
        <div className="bg-black/30 rounded-lg p-3">
          <h4 className="text-white font-bold mb-2">Players</h4>
          {players.map((p, idx) => (
            <div key={p.player_id} className={`flex justify-between items-center py-1 rounded px-2 ${p.player_id === currentPlayerId ? 'text-green-400' : 'text-white'}`}>
              <span className="flex items-center gap-2">
                <span className="text-lg">{getPlayerPoop(idx).emoji}</span>
                {p.player_name} {p.player_id === currentPlayerId && '(You)'}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded">
                  {getSpaceEffect(positions[p.player_id] || 0).emoji} Space {positions[p.player_id] || 0}
                </span>
                <ShitzCreekPaddle count={paddles[p.player_id] || 1} size="sm" />
              </div>
            </div>
          ))}
        </div>
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
                <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${getCardActionColor(parsedAction)} p-6 animate-fadeIn`}>
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
              <Button onClick={drawCard} disabled={isDrawingCard || dbCards.length === 0} className="w-full bg-amber-600 hover:bg-amber-500 text-lg py-6 font-bold">
                {isDrawingCard ? (
                  <><Shuffle className="w-5 h-5 mr-2 animate-spin" /> Drawing...</>
                ) : dbCards.length === 0 ? (
                  <><AlertTriangle className="w-5 h-5 mr-2" /> No Cards Loaded</>
                ) : (
                  <><Shuffle className="w-5 h-5 mr-2" /> Draw Card</>
                )}
              </Button>
            ) : (
              <Button onClick={handleCardContinue} className="w-full bg-green-600 hover:bg-green-500 text-lg py-6 font-bold animate-pulse">
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
              {players.filter(p => p.player_id !== currentPlayerId).map((p, idx) => (
                <button
                  key={p.player_id}
                  onClick={() => handlePlayerSelected(p.player_id)}
                  className="w-full flex items-center justify-between bg-white/10 hover:bg-white/20 border-2 border-transparent hover:border-purple-400 rounded-xl p-4 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getPlayerPoop(players.indexOf(p)).emoji}</span>
                    <div className="text-left">
                      <p className="text-white font-bold">{p.player_name}</p>
                      <p className="text-purple-300 text-xs">
                        Space {positions[p.player_id] || 0} &middot; {paddles[p.player_id] || 1} paddle{(paddles[p.player_id] || 1) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-purple-400 group-hover:text-white transition-colors" />
                </button>
              ))}
            </div>

            <Button variant="outline" onClick={() => { setShowPlayerPicker(false); setPendingAction(null); }} className="w-full mt-4 border-purple-500 text-purple-200 hover:bg-purple-800">
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
