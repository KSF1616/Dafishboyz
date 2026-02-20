import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Dices, Volume2, VolumeX, RotateCcw, Sparkles, Trophy, Users, 
  Printer, RefreshCw, Plus, Minus, Star, Check, X, Wifi, WifiOff, Crown,
  Globe, UserPlus, LogIn, Wine, Database, HardDrive, AlertCircle
} from 'lucide-react';
import { DAFISH_BOYZ_LOGO_URL } from '@/lib/logoUrl';
import { loadAdultShitoCards, type AdultShitoLoadResult } from '@/lib/adultShitoCardService';
import FloatingPartyButton from '@/components/FloatingPartyButton';
import ShitoMultiplayerLobby from '@/components/shito/ShitoMultiplayerLobby';
import ShitoChat from '@/components/shito/ShitoChat';
import DrinkingGamePanel from '@/components/DrinkingGamePanel';
import { useShitoMultiplayer } from '@/hooks/useShitoMultiplayer';
import { useDrinkingGame } from '@/contexts/DrinkingGameContext';
import {
  ShitoColumn,
  SHITO_COLUMNS,
  CallingCard,
  BingoCard,
  BoardGrid,
  FALLBACK_ICONS,
  getColumnColor,
  getColumnGradient,
  getFallbackEmoji,
} from '@/types/shitoMultiplayer';

type GameMode = 'local' | 'online';
type ActiveTab = 'play' | 'cards';

interface LocalPlayerBoard {
  id: string;
  playerName: string;
  grid: BoardGrid;
  markedCells: string[];
}


const AdultShitoGame: React.FC = () => {
  const [searchParams] = useSearchParams();
  const roomCodeFromUrl = searchParams.get('room');

  const [activeTab, setActiveTab] = useState<ActiveTab>('play');
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  
  // Calling cards state — loaded from DB via adultShitoCardService
  const [callingCards, setCallingCards] = useState<CallingCard[]>([]);
  const [bingoIcons, setBingoIcons] = useState<BingoCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [useFallback, setUseFallback] = useState(false);
  const [cardSource, setCardSource] = useState<AdultShitoLoadResult['source']>('fallback');
  const [cardSourceDetail, setCardSourceDetail] = useState<string>('');

  // Local game state
  const [localDrawnCardIds, setLocalDrawnCardIds] = useState<string[]>([]);
  const [localCurrentCard, setLocalCurrentCard] = useState<CallingCard | null>(null);
  const [localCurrentColumn, setLocalCurrentColumn] = useState<ShitoColumn | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollingColumn, setRollingColumn] = useState<ShitoColumn>('S');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [localPlayerBoards, setLocalPlayerBoards] = useState<LocalPlayerBoard[]>([]);
  const [numPlayers, setNumPlayers] = useState(2);
  const [localWinner, setLocalWinner] = useState<string | null>(null);
  const [localCalledCards, setLocalCalledCards] = useState<{card: CallingCard, column: ShitoColumn}[]>([]);

  // Multiplayer hook
  const multiplayer = useShitoMultiplayer({ bingoIcons, callingCards });

  // Online game join modal state
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState(roomCodeFromUrl || '');
  const [playerNameInput, setPlayerNameInput] = useState('');
  // ─── Load cards from DB via adultShitoCardService ────────────────────
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const result = await loadAdultShitoCards();
        if (cancelled) return;

        setCallingCards(result.callingCards);
        setBingoIcons(result.bingoIcons);
        setUseFallback(result.useFallback);
        setCardSource(result.source);
        setCardSourceDetail(result.sourceDetail);

        console.log(
          `[AdultShitoGame] Cards loaded — source: ${result.source}, ` +
          `calling: ${result.callingCards.length}, bingo: ${result.bingoIcons.length}`,
        );
      } catch (err) {
        console.error('[AdultShitoGame] Failed to load cards:', err);
        // Absolute last-resort fallback
        setCallingCards(FALLBACK_ICONS.map((icon, i) => ({ id: `fallback-${i}`, name: icon.name, url: '' })));
        setBingoIcons(FALLBACK_ICONS.map((icon, i) => ({ id: `fallback-bi-${i}`, name: icon.name, url: '' })));
        setUseFallback(true);
        setCardSource('fallback');
        setCardSourceDetail('Error loading cards — using fallback icons');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  /** Helper to render the source badge icon */
  const SourceIcon = cardSource === 'db-adult-shito' || cardSource === 'db-shito'
    ? Database
    : cardSource === 'storage'
    ? HardDrive
    : AlertCircle;

  const sourceColor = cardSource === 'db-adult-shito'
    ? 'text-emerald-400'
    : cardSource === 'db-shito'
    ? 'text-cyan-400'
    : cardSource === 'storage'
    ? 'text-green-300'
    : 'text-yellow-300';

  const sourceDotColor = cardSource === 'db-adult-shito'
    ? 'bg-emerald-400'
    : cardSource === 'db-shito'
    ? 'bg-cyan-400'
    : cardSource === 'storage'
    ? 'bg-green-400'
    : 'bg-yellow-400';



  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const generateLocalPlayerBoards = () => {
    const boards: LocalPlayerBoard[] = [];
    
    for (let p = 0; p < numPlayers; p++) {
      const grid: BoardGrid = { S: [], H: [], I: [], T: [], O: [] };
      
      SHITO_COLUMNS.forEach((column) => {
        const columnPool = shuffleArray(bingoIcons);
        grid[column] = columnPool.slice(0, 5);
      });
      
      grid['I'][2] = { id: 'free', name: 'FREE', url: '' };
      
      boards.push({
        id: `player-${p}-${Date.now()}`,
        playerName: `Player ${p + 1}`,
        grid,
        markedCells: ['I-2'],
      });
    }
    
    setLocalPlayerBoards(boards);
    setLocalWinner(null);
    setLocalCalledCards([]);
  };

  const playSound = useCallback((frequency: number, duration: number) => {
    if (!soundEnabled) return;
    
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.log('Audio not available');
    }
  }, [soundEnabled]);

  // Local game roll and draw
  const localRollAndDraw = useCallback(() => {
    if (isRolling || callingCards.length === 0) return;
    
    setIsRolling(true);
    playSound(400, 0.1);
    
    let iterations = 0;
    const maxIterations = 15;
    
    const diceInterval = setInterval(() => {
      const randomColumn = SHITO_COLUMNS[Math.floor(Math.random() * SHITO_COLUMNS.length)];
      setRollingColumn(randomColumn);
      playSound(300 + Math.random() * 200, 0.05);
      iterations++;
      
      if (iterations >= maxIterations) {
        clearInterval(diceInterval);
        
        const finalColumn = SHITO_COLUMNS[Math.floor(Math.random() * SHITO_COLUMNS.length)];
        setRollingColumn(finalColumn);
        setLocalCurrentColumn(finalColumn);
        
        setTimeout(() => {
          let available = callingCards.filter(c => !localDrawnCardIds.includes(c.id));
          if (available.length === 0) {
            setLocalDrawnCardIds([]);
            available = callingCards;
          }
          
          const finalCard = available[Math.floor(Math.random() * available.length)];
          setLocalCurrentCard(finalCard);
          setLocalDrawnCardIds(prev => [...prev, finalCard.id]);
          setLocalCalledCards(prev => [...prev, { card: finalCard, column: finalColumn }]);
          setIsRolling(false);
          playSound(800, 0.2);
        }, 300);
      }
    }, 80);
  }, [callingCards, localDrawnCardIds, isRolling, playSound]);

  // Online game roll and draw
  const onlineRollAndDraw = useCallback(async () => {
    if (isRolling || !multiplayer.state.isHost) return;
    
    setIsRolling(true);
    playSound(400, 0.1);
    
    let iterations = 0;
    const maxIterations = 15;
    
    const diceInterval = setInterval(() => {
      const randomColumn = SHITO_COLUMNS[Math.floor(Math.random() * SHITO_COLUMNS.length)];
      setRollingColumn(randomColumn);
      playSound(300 + Math.random() * 200, 0.05);
      iterations++;
      
      if (iterations >= maxIterations) {
        clearInterval(diceInterval);
        
        multiplayer.rollAndDraw().then((result) => {
          if (result) {
            setRollingColumn(result.column);
            playSound(800, 0.2);
          }
          setIsRolling(false);
        });
      }
    }, 80);
  }, [isRolling, multiplayer, playSound]);

  const localMarkCell = (boardIndex: number, column: ShitoColumn, rowIndex: number) => {
    if (!localCurrentCard || !localCurrentColumn || localWinner) return;
    
    const board = localPlayerBoards[boardIndex];
    const cellIcon = board.grid[column][rowIndex];
    const cellKey = `${column}-${rowIndex}`;
    
    if (board.markedCells.includes(cellKey)) return;
    if (column !== localCurrentColumn) return;
    if (cellIcon.name.toLowerCase() !== localCurrentCard.name.toLowerCase() && cellIcon.id !== 'free') return;
    
    const updatedBoards = [...localPlayerBoards];
    updatedBoards[boardIndex] = {
      ...board,
      markedCells: [...board.markedCells, cellKey],
    };
    setLocalPlayerBoards(updatedBoards);
    playSound(600, 0.1);
    
    checkLocalWin(updatedBoards[boardIndex]);
  };

  const onlineMarkCell = async (column: ShitoColumn, rowIndex: number) => {
    const success = await multiplayer.markCell(column, rowIndex);
    if (success) {
      playSound(600, 0.1);
    }
  };

  const checkLocalWin = (board: LocalPlayerBoard) => {
    const marked = board.markedCells;
    
    for (let row = 0; row < 5; row++) {
      if (SHITO_COLUMNS.every(col => marked.includes(`${col}-${row}`))) {
        setLocalWinner(board.playerName);
        playSound(1000, 0.5);
        return;
      }
    }
    
    for (const col of SHITO_COLUMNS) {
      if ([0, 1, 2, 3, 4].every(row => marked.includes(`${col}-${row}`))) {
        setLocalWinner(board.playerName);
        playSound(1000, 0.5);
        return;
      }
    }
    
    if (SHITO_COLUMNS.every((col, i) => marked.includes(`${col}-${i}`))) {
      setLocalWinner(board.playerName);
      playSound(1000, 0.5);
      return;
    }
    
    if (SHITO_COLUMNS.every((col, i) => marked.includes(`${col}-${4 - i}`))) {
      setLocalWinner(board.playerName);
      playSound(1000, 0.5);
      return;
    }
  };

  const resetLocalGame = () => {
    setLocalCurrentCard(null);
    setLocalCurrentColumn(null);
    setLocalDrawnCardIds([]);
    setLocalCalledCards([]);
    setLocalWinner(null);
    generateLocalPlayerBoards();
  };

  const handleCreateRoom = async () => {
    if (!playerNameInput.trim()) return;
    const success = await multiplayer.createRoom(playerNameInput);
    if (success) {
      setShowJoinModal(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerNameInput.trim() || !joinRoomCode.trim()) return;
    const success = await multiplayer.joinRoom(joinRoomCode, playerNameInput);
    if (success) {
      setShowJoinModal(false);
    }
  };

  const availableCards = callingCards.filter(c => !localDrawnCardIds.includes(c.id));

  // Get current game state based on mode
  const currentCard = gameMode === 'online' ? multiplayer.state.room?.current_card : localCurrentCard;
  const currentColumn = gameMode === 'online' ? multiplayer.state.room?.current_column as ShitoColumn | null : localCurrentColumn;
  const calledCards = gameMode === 'online' ? multiplayer.state.room?.called_cards || [] : localCalledCards;
  const winner = gameMode === 'online' ? multiplayer.state.room?.winner_name : localWinner;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-pink-200 text-xl">Loading Adult SHITO...</p>
          <p className="text-pink-300/60 text-sm mt-2">Fetching cards from database...</p>

        </div>
      </div>
    );
  }

  // Mode Selection Screen
  if (!gameMode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-900 to-red-900">
        <header className="bg-gradient-to-r from-purple-800 via-pink-800 to-red-800 text-white py-6 px-4 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src={DAFISH_BOYZ_LOGO_URL} alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-md" />
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold">Back to Games</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔞</span>
              <h1 className="text-xl md:text-2xl font-black">Adult SHITO</h1>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-red-400 mb-4">
              Adult SHITO
            </h1>
            <p className="text-xl text-pink-200">Choose how you want to play!</p>
            
            {/* Asset Status Badge */}
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              <span className={`w-2 h-2 ${sourceDotColor} rounded-full ${useFallback ? 'animate-pulse' : ''}`}></span>
              <SourceIcon className={`w-4 h-4 ${sourceColor}`} />
              <span className={`text-sm ${sourceColor}`}>
                {useFallback
                  ? 'Using default icons'
                  : `${callingCards.length} cards loaded`}
              </span>
            </div>
            {cardSourceDetail && (
              <p className="text-xs text-pink-300/50 mt-1">{cardSourceDetail}</p>
            )}

          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Local Play */}
            <button
              onClick={() => setGameMode('local')}
              className="group bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-left hover:bg-white/20 transition-all transform hover:scale-105"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-3">Local Play</h2>
              <p className="text-pink-200 mb-4">
                Play on one device with friends gathered around. Perfect for parties!
              </p>
              <ul className="space-y-2 text-pink-300/80 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  1-8 players on one screen
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  No internet required
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Print cards for physical play
                </li>
              </ul>
            </button>

            {/* Online Play */}
            <button
              onClick={() => {
                setGameMode('online');
                setShowJoinModal(true);
              }}
              className="group bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-left hover:bg-white/20 transition-all transform hover:scale-105"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Globe className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-black text-white mb-3">Online Play</h2>
              <p className="text-pink-200 mb-4">
                Create a room and invite friends to play from anywhere!
              </p>
              <ul className="space-y-2 text-pink-300/80 text-sm">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Real-time multiplayer
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Shareable room links
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400" />
                  Built-in chat
                </li>
              </ul>
            </button>
          </div>
        </main>

        <FloatingPartyButton />
      </div>
    );
  }

  // Online Game - Join/Create Modal
  if (gameMode === 'online' && showJoinModal && multiplayer.state.mode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-900 to-red-900">
        <header className="bg-gradient-to-r from-purple-800 via-pink-800 to-red-800 text-white py-6 px-4 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
              onClick={() => {
                setGameMode(null);
                setShowJoinModal(false);
              }}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-bold">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-green-400" />
              <h1 className="text-xl md:text-2xl font-black">Online SHITO</h1>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8">
            <h2 className="text-3xl font-black text-white text-center mb-8">Join or Create Game</h2>

            {multiplayer.state.error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
                <p className="text-red-300 text-center">{multiplayer.state.error}</p>
                <button
                  onClick={multiplayer.clearError}
                  className="text-red-400 text-sm underline mt-2 block mx-auto"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Name Input */}
            <div className="mb-6">
              <label className="block text-pink-300 text-sm font-bold mb-2">Your Name</label>
              <input
                type="text"
                value={playerNameInput}
                onChange={(e) => setPlayerNameInput(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                maxLength={20}
              />
            </div>

            {/* Create Room */}
            <button
              onClick={handleCreateRoom}
              disabled={!playerNameInput.trim() || multiplayer.state.mode === 'creating'}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl mb-4 transition-all"
            >
              <UserPlus className="w-5 h-5" />
              {multiplayer.state.mode === 'creating' ? 'Creating...' : 'Create New Room'}
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-white/60">or join existing</span>
              </div>
            </div>

            {/* Join Room */}
            <div className="mb-4">
              <label className="block text-pink-300 text-sm font-bold mb-2">Room Code</label>
              <input
                type="text"
                value={joinRoomCode}
                onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 text-center text-2xl tracking-widest"
                maxLength={6}
              />
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={!playerNameInput.trim() || !joinRoomCode.trim() || multiplayer.state.mode === 'joining'}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg rounded-xl transition-all"
            >
              <LogIn className="w-5 h-5" />
              {multiplayer.state.mode === 'joining' ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </main>

        <FloatingPartyButton />
      </div>
    );
  }

  // Online Game - Lobby
  if (gameMode === 'online' && multiplayer.state.mode === 'lobby' && multiplayer.state.room) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-900 to-red-900">
        <header className="bg-gradient-to-r from-purple-800 via-pink-800 to-red-800 text-white py-6 px-4 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={DAFISH_BOYZ_LOGO_URL} alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-md" />
              <span className="font-bold">Adult SHITO</span>
            </div>
            <div className="flex items-center gap-3">
              <Wifi className="w-5 h-5 text-green-400" />
              <span className="text-sm">Online</span>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-8">
          <ShitoMultiplayerLobby
            room={multiplayer.state.room}
            players={multiplayer.state.players}
            isHost={multiplayer.state.isHost}
            onStartGame={multiplayer.startGame}
            onLeaveRoom={multiplayer.leaveRoom}
          />
        </main>

        <ShitoChat
          messages={multiplayer.state.messages}
          currentPlayerId={multiplayer.state.playerId}
          onSendMessage={multiplayer.sendMessage}
        />

        <FloatingPartyButton />
      </div>
    );
  }

  // Main Game UI (both local and online playing state)
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-pink-900 to-red-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-800 via-pink-800 to-red-800 text-white py-6 px-4 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => {
              if (gameMode === 'online') {
                multiplayer.leaveRoom();
              }
              setGameMode(null);
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img src={DAFISH_BOYZ_LOGO_URL} alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-md" />
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold">Exit Game</span>
          </button>
          <div className="flex items-center gap-3">
            {gameMode === 'online' ? (
              <>
                <Wifi className="w-5 h-5 text-green-400" />
                <span className="text-sm bg-white/20 px-3 py-1 rounded-lg">
                  Room: {multiplayer.state.room?.room_code}
                </span>
              </>
            ) : (
              <span className="text-2xl">🔞</span>
            )}
            <h1 className="text-xl md:text-2xl font-black">Adult SHITO</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-red-400 mb-4">
            Adult SHITO
          </h1>
          <p className="text-xl text-pink-200">
            {gameMode === 'online' 
              ? `Playing with ${multiplayer.state.players.filter(p => p.is_connected).length} players`
              : 'The grown-up version of our hilarious bingo game!'}
          </p>
          {!useFallback && cardSourceDetail && (
            <p className="text-sm text-pink-300/60 mt-2">
              {cardSourceDetail}
            </p>
          )}

        </div>

        {/* Tab Navigation (Local only) */}
        {gameMode === 'local' && (
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('play')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-lg transition-all ${
                activeTab === 'play'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20 shadow'
              }`}
            >
              <Dices className="w-5 h-5" />
              Play Game
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-lg transition-all ${
                activeTab === 'cards'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-white hover:bg-white/20 shadow'
              }`}
            >
              <Printer className="w-5 h-5" />
              Print Cards
            </button>
          </div>
        )}

        {(activeTab === 'play' || gameMode === 'online') && (
          <div className="space-y-8">
            {/* Winner Banner */}
            {winner && (
              <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 rounded-3xl p-8 text-center animate-pulse">
                <Trophy className="w-20 h-20 text-white mx-auto mb-4" />
                <h2 className="text-4xl font-black text-white mb-2">SHITO!</h2>
                <p className="text-2xl text-white/90">{winner} WINS!</p>
                {(gameMode === 'local' || multiplayer.state.isHost) && (
                  <button
                    onClick={gameMode === 'online' ? multiplayer.resetGame : resetLocalGame}
                    className="mt-6 px-8 py-3 bg-white text-amber-600 font-bold rounded-xl hover:bg-amber-100 transition-all"
                  >
                    Play Again
                  </button>
                )}
              </div>
            )}

            {/* Game Controls */}
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Player Count (Local only) */}
                {gameMode === 'local' && (
                  <div className="flex items-center gap-4">
                    <Users className="w-6 h-6 text-pink-300" />
                    <span className="text-white font-bold">Players:</span>
                    <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
                      <button
                        onClick={() => setNumPlayers(Math.max(1, numPlayers - 1))}
                        className="p-1 hover:bg-white/20 rounded-lg transition-all text-white"
                      >
                        <Minus className="w-5 h-5" />
                      </button>
                      <span className="font-bold text-lg w-8 text-center text-white">{numPlayers}</span>
                      <button
                        onClick={() => setNumPlayers(Math.min(8, numPlayers + 1))}
                        className="p-1 hover:bg-white/20 rounded-lg transition-all text-white"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Online Players List */}
                {gameMode === 'online' && (
                  <div className="flex items-center gap-3 flex-wrap">
                    {multiplayer.state.players.filter(p => p.is_connected).map(player => (
                      <div
                        key={player.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl ${
                          player.is_host ? 'bg-yellow-500/30' : 'bg-white/20'
                        }`}
                      >
                        {player.is_host && <Crown className="w-4 h-4 text-yellow-400" />}
                        <span className="text-white font-medium">{player.player_name}</span>
                        {player.player_id === multiplayer.state.playerId && (
                          <span className="text-xs text-pink-300">(You)</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Sound Toggle */}
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all text-white"
                >
                  {soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                </button>

                {/* Reset Button */}
                {(gameMode === 'local' || multiplayer.state.isHost) && (
                  <button
                    onClick={gameMode === 'online' ? multiplayer.resetGame : resetLocalGame}
                    className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all text-white"
                  >
                    <RotateCcw className="w-5 h-5" />
                    New Game
                  </button>
                )}
              </div>
            </div>

            {/* S-H-I-T-O Column Headers */}
            <div className="flex justify-center gap-3 mb-4">
              {SHITO_COLUMNS.map((col) => (
                <div
                  key={col}
                  className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center font-black text-2xl md:text-3xl transition-all duration-300 ${
                    isRolling && rollingColumn === col
                      ? `bg-gradient-to-br ${getColumnGradient(col)} scale-125 shadow-lg`
                      : currentColumn === col
                      ? `bg-gradient-to-br ${getColumnGradient(col)} scale-110 shadow-lg ring-4 ring-white`
                      : 'bg-white/20 text-white/60'
                  } text-white`}
                >
                  {col}
                </div>
              ))}
            </div>

            {/* Caller Section */}
            <div className="bg-gradient-to-br from-pink-800/50 to-purple-800/50 backdrop-blur-sm rounded-3xl p-8">
              <h3 className="text-2xl font-black text-white text-center mb-6">
                {gameMode === 'online' && !multiplayer.state.isHost 
                  ? `${multiplayer.state.room?.host_name}'s Turn to Call`
                  : 'Caller'}
              </h3>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                {/* Current Column Display */}
                {currentColumn && !isRolling && (
                  <div className={`px-8 py-4 rounded-2xl bg-gradient-to-r ${getColumnGradient(currentColumn)} shadow-lg`}>
                    <span className="text-5xl font-black text-white">{currentColumn}</span>
                  </div>
                )}
                
                {isRolling && (
                  <div className="px-8 py-4 rounded-2xl bg-white/30 shadow-lg">
                    <div className="flex items-center gap-3">
                      <Dices className="w-10 h-10 text-white animate-spin" />
                      <span className="text-4xl font-black text-white">{rollingColumn}</span>
                    </div>
                  </div>
                )}

                {/* Current Card */}
                <div className={`relative w-48 h-64 bg-purple-900 rounded-2xl overflow-hidden shadow-2xl transform transition-all duration-300 ${isRolling ? 'scale-95 rotate-2' : 'hover:scale-105'}`}>
                  {currentCard ? (
                    <>
                      {currentCard.url ? (
                        <img 
                          src={currentCard.url} 
                          alt={currentCard.name} 
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-700 to-pink-700">
                          <span className="text-8xl">{getFallbackEmoji(currentCard.name)}</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p className="text-white font-bold text-center text-lg">{currentCard.name}</p>
                      </div>
                      {currentColumn && (
                        <div className={`absolute top-2 right-2 w-10 h-10 rounded-lg flex items-center justify-center font-black text-xl ${getColumnColor(currentColumn)} text-white`}>
                          {currentColumn}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-700 to-pink-700">
                      <Dices className="w-16 h-16 mb-4 text-pink-300" />
                      <p className="text-pink-200 text-sm">Tap to draw</p>
                    </div>
                  )}
                </div>

                {/* Roll & Draw Button */}
                {(gameMode === 'local' || multiplayer.state.isHost) && (
                  <button
                    onClick={gameMode === 'online' ? onlineRollAndDraw : localRollAndDraw}
                    disabled={isRolling || !!winner}
                    className="px-10 py-5 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-400 hover:to-purple-400 text-white font-black text-xl rounded-2xl shadow-lg transform hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 flex items-center gap-3"
                  >
                    <Dices className={`w-8 h-8 ${isRolling ? 'animate-spin' : ''}`} />
                    {isRolling ? 'Rolling...' : 'Roll & Draw'}
                  </button>
                )}

                {gameMode === 'online' && !multiplayer.state.isHost && (
                  <div className="text-center text-pink-200">
                    <p>Waiting for host to roll...</p>
                  </div>
                )}
              </div>

              <div className="mt-4 text-center">
                <p className="text-pink-200">
                  {gameMode === 'local' 
                    ? (availableCards.length === 0 ? 'Deck empty - will reshuffle!' : `${availableCards.length} of ${callingCards.length} cards remaining`)
                    : `${calledCards.length} cards called`}
                </p>
              </div>
            </div>

            {/* Player Boards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {gameMode === 'local' ? (
                // Local player boards
                localPlayerBoards.map((board, boardIndex) => (
                  <div 
                    key={board.id}
                    className={`bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden ${localWinner === board.playerName ? 'ring-4 ring-yellow-400' : ''}`}
                  >
                    <div className="bg-gradient-to-r from-pink-600 to-purple-600 p-4 text-white text-center">
                      <h4 className="text-2xl font-black tracking-wider">SHITO</h4>
                      <p className="text-sm text-white/80">{board.playerName}</p>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-1 p-2 bg-black/20">
                      {SHITO_COLUMNS.map((col) => (
                        <div
                          key={col}
                          className={`${getColumnColor(col)} text-white font-black text-xl py-2 text-center rounded-lg ${
                            localCurrentColumn === col ? 'ring-2 ring-white animate-pulse' : ''
                          }`}
                        >
                          {col}
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-2">
                      {[0, 1, 2, 3, 4].map((rowIndex) => (
                        <div key={rowIndex} className="grid grid-cols-5 gap-1 mb-1">
                          {SHITO_COLUMNS.map((col) => {
                            const icon = board.grid[col][rowIndex];
                            const cellKey = `${col}-${rowIndex}`;
                            const isMarked = board.markedCells.includes(cellKey);
                            const isFreeSpace = icon.id === 'free';
                            const canMark = localCurrentColumn === col && 
                              localCurrentCard && 
                              (icon.name.toLowerCase() === localCurrentCard.name.toLowerCase() || isFreeSpace) &&
                              !isMarked &&
                              !localWinner;
                            
                            return (
                              <button
                                key={cellKey}
                                onClick={() => localMarkCell(boardIndex, col, rowIndex)}
                                disabled={!canMark}
                                className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 transition-all relative ${
                                  isMarked
                                    ? 'bg-gradient-to-br from-pink-500 to-purple-500'
                                    : isFreeSpace
                                    ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                    : canMark
                                    ? 'bg-yellow-500/50 ring-2 ring-yellow-300 cursor-pointer animate-pulse'
                                    : 'bg-white/10 hover:bg-white/20'
                                }`}
                              >
                                {isMarked && !isFreeSpace ? (
                                  <Check className="w-8 h-8 text-white" />
                                ) : isFreeSpace ? (
                                  <div className="text-center">
                                    <Star className="w-6 h-6 text-white mx-auto" />
                                    <p className="text-white font-black text-xs">FREE</p>
                                  </div>
                                ) : icon.url ? (
                                  <img src={icon.url} alt={icon.name} className="w-full h-full object-contain" />
                                ) : (
                                  <span className="text-2xl">{getFallbackEmoji(icon.name)}</span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-2">
                      <button
                        onClick={() => checkLocalWin(board)}
                        disabled={!!localWinner}
                        className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-black text-xl rounded-xl transition-all disabled:opacity-50"
                      >
                        SHITO!
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                // Online player boards
                multiplayer.state.players.filter(p => p.is_connected).map((player) => {
                  const isCurrentPlayer = player.player_id === multiplayer.state.playerId;
                  const board = player.board_grid;
                  const markedCells = player.marked_cells;
                  
                  return (
                    <div 
                      key={player.id}
                      className={`bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden ${
                        multiplayer.state.room?.winner_id === player.player_id ? 'ring-4 ring-yellow-400' : ''
                      } ${isCurrentPlayer ? 'ring-2 ring-pink-400' : ''}`}
                    >
                      <div className={`p-4 text-white text-center ${
                        player.is_host 
                          ? 'bg-gradient-to-r from-yellow-600 to-amber-600' 
                          : 'bg-gradient-to-r from-pink-600 to-purple-600'
                      }`}>
                        <div className="flex items-center justify-center gap-2">
                          {player.is_host && <Crown className="w-5 h-5" />}
                          <h4 className="text-2xl font-black tracking-wider">SHITO</h4>
                        </div>
                        <p className="text-sm text-white/80">
                          {player.player_name} {isCurrentPlayer && '(You)'}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-5 gap-1 p-2 bg-black/20">
                        {SHITO_COLUMNS.map((col) => (
                          <div
                            key={col}
                            className={`${getColumnColor(col)} text-white font-black text-xl py-2 text-center rounded-lg ${
                              currentColumn === col ? 'ring-2 ring-white animate-pulse' : ''
                            }`}
                          >
                            {col}
                          </div>
                        ))}
                      </div>
                      
                      <div className="p-2">
                        {[0, 1, 2, 3, 4].map((rowIndex) => (
                          <div key={rowIndex} className="grid grid-cols-5 gap-1 mb-1">
                            {SHITO_COLUMNS.map((col) => {
                              const icon = board[col][rowIndex];
                              const cellKey = `${col}-${rowIndex}`;
                              const isMarked = markedCells.includes(cellKey);
                              const isFreeSpace = icon.id === 'free';
                              const canMark = isCurrentPlayer &&
                                currentColumn === col && 
                                currentCard && 
                                (icon.name.toLowerCase() === currentCard.name.toLowerCase() || isFreeSpace) &&
                                !isMarked &&
                                !winner;
                              
                              return (
                                <button
                                  key={cellKey}
                                  onClick={() => isCurrentPlayer && onlineMarkCell(col, rowIndex)}
                                  disabled={!canMark}
                                  className={`aspect-square rounded-lg flex flex-col items-center justify-center p-1 transition-all relative ${
                                    isMarked
                                      ? 'bg-gradient-to-br from-pink-500 to-purple-500'
                                      : isFreeSpace
                                      ? 'bg-gradient-to-br from-amber-400 to-orange-500'
                                      : canMark
                                      ? 'bg-yellow-500/50 ring-2 ring-yellow-300 cursor-pointer animate-pulse'
                                      : 'bg-white/10'
                                  } ${!isCurrentPlayer ? 'cursor-default' : ''}`}
                                >
                                  {isMarked && !isFreeSpace ? (
                                    <Check className="w-8 h-8 text-white" />
                                  ) : isFreeSpace ? (
                                    <div className="text-center">
                                      <Star className="w-6 h-6 text-white mx-auto" />
                                      <p className="text-white font-black text-xs">FREE</p>
                                    </div>
                                  ) : icon.url ? (
                                    <img src={icon.url} alt={icon.name} className="w-full h-full object-contain" />
                                  ) : (
                                    <span className="text-2xl">{getFallbackEmoji(icon.name)}</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                      
                      {isCurrentPlayer && (
                        <div className="p-2">
                          <button
                            onClick={multiplayer.claimWin}
                            disabled={!!winner}
                            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-black text-xl rounded-xl transition-all disabled:opacity-50"
                          >
                            SHITO!
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Called Cards History */}
            {calledCards.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="w-full flex items-center justify-between text-white font-bold mb-4"
                >
                  <span>Called Cards ({calledCards.length})</span>
                  <span>{showHistory ? '▲' : '▼'}</span>
                </button>
                
                {showHistory && (
                  <div className="flex flex-wrap gap-2">
                    {calledCards.map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2"
                      >
                        <span className={`w-6 h-6 rounded flex items-center justify-center font-bold text-sm text-white ${getColumnColor(item.column)}`}>
                          {item.column}
                        </span>
                        {item.card.url ? (
                          <img src={item.card.url} alt={item.card.name} className="w-8 h-8 object-contain" />
                        ) : (
                          <span className="text-2xl">{getFallbackEmoji(item.card.name)}</span>
                        )}
                        <span className="text-sm text-white">{item.card.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Print Cards Tab (Local only) */}
        {gameMode === 'local' && activeTab === 'cards' && (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-red-600 p-6 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Printable Adult SHITO Cards</h3>
                    <p className="text-white/70 text-sm">
                      {useFallback ? 'Using default icons' : `Using custom images from ${loadedFromFolder || 'storage'}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-white/20 rounded-xl px-4 py-2">
                    <button
                      onClick={() => setNumPlayers(Math.max(1, numPlayers - 1))}
                      className="p-1 hover:bg-white/20 rounded-lg transition-all"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-lg w-8 text-center">{numPlayers}</span>
                    <button
                      onClick={() => setNumPlayers(Math.min(12, numPlayers + 1))}
                      className="p-1 hover:bg-white/20 rounded-lg transition-all"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                    <span className="text-sm ml-2">cards</span>
                  </div>
                  
                  <button
                    onClick={generateLocalPlayerBoards}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-bold transition-all"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Shuffle
                  </button>
                  
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-2 bg-white text-pink-600 hover:bg-pink-100 rounded-xl font-bold transition-all"
                  >
                    <Printer className="w-5 h-5" />
                    Print Cards
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-pink-50 border-b border-pink-200 print:hidden">
              <p className="text-pink-800 text-sm text-center">
                Each card is unique! Click "Shuffle" to generate new random cards. 
                Print and cut out cards for each player.
              </p>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4 print:p-4">
              {localPlayerBoards.map((board, cardIndex) => (
                <div 
                  key={board.id}
                  className="border-2 border-gray-300 rounded-2xl overflow-hidden bg-white print:break-inside-avoid"
                >
                  <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-red-500 p-3 text-white text-center">
                    <h4 className="text-2xl font-black tracking-wider">SHITO</h4>
                    <p className="text-xs text-white/80">Card #{cardIndex + 1} - Adult Edition</p>
                  </div>
                  
                  <div className="grid grid-cols-5 gap-1 p-2 bg-gray-100">
                    {SHITO_COLUMNS.map((col) => (
                      <div
                        key={col}
                        className={`${getColumnColor(col)} text-white font-black text-2xl py-2 text-center rounded-lg`}
                      >
                        {col}
                      </div>
                    ))}
                  </div>
                  
                  <div className="p-2">
                    {[0, 1, 2, 3, 4].map((rowIndex) => (
                      <div key={rowIndex} className="grid grid-cols-5 gap-1 mb-1">
                        {SHITO_COLUMNS.map((col) => {
                          const icon = board.grid[col][rowIndex];
                          const isFreeSpace = icon.id === 'free';
                          
                          return (
                            <div
                              key={`${col}-${rowIndex}`}
                              className={`aspect-square border-2 rounded-lg flex flex-col items-center justify-center p-1 ${
                                isFreeSpace 
                                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-600' 
                                  : 'bg-white border-gray-200'
                              }`}
                            >
                              {isFreeSpace ? (
                                <div className="text-center">
                                  <Star className="w-6 h-6 text-white mx-auto" />
                                  <p className="text-white font-black text-xs">FREE</p>
                                </div>
                              ) : icon.url ? (
                                <img src={icon.url} alt={icon.name} className="w-full h-full object-contain" />
                              ) : (
                                <span className="text-2xl md:text-3xl">{getFallbackEmoji(icon.name)}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gray-100 p-2 text-center">
                    <p className="text-xs text-gray-500">Yell "SHITO!" when you win!</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Rules */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mt-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-pink-400" />
            How to Play Adult SHITO
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-pink-500/20 rounded-xl p-4">
              <h3 className="font-bold text-pink-300 mb-2 flex items-center gap-2">
                <span className="w-8 h-8 bg-pink-500 text-white rounded-full flex items-center justify-center font-black">1</span>
                Setup
              </h3>
              <ul className="space-y-2 text-pink-100 text-sm">
                <li>• Each player gets a unique SHITO card</li>
                <li>• Mark your FREE space in the center</li>
                <li>• One person is the caller</li>
              </ul>
            </div>
            <div className="bg-purple-500/20 rounded-xl p-4">
              <h3 className="font-bold text-purple-300 mb-2 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-black">2</span>
                Gameplay
              </h3>
              <ul className="space-y-2 text-purple-100 text-sm">
                <li>• Caller clicks "Roll & Draw"</li>
                <li>• Dice shows column (S, H, I, T, or O)</li>
                <li>• Card shows the icon to find</li>
                <li>• Players mark matching icons in that column</li>
              </ul>
            </div>
            <div className="bg-red-500/20 rounded-xl p-4">
              <h3 className="font-bold text-red-300 mb-2 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center font-black">3</span>
                Winning
              </h3>
              <ul className="space-y-2 text-red-100 text-sm">
                <li>• Complete a row (5 across)</li>
                <li>• Complete a column (5 down)</li>
                <li>• Complete a diagonal</li>
                <li>• Yell "SHITO!" when you win!</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Buy CTA */}
        <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-red-600 rounded-2xl p-8 text-center text-white mt-8">
          <h2 className="text-2xl font-black mb-4">Want the Full SHITO Experience?</h2>
          <p className="text-white/90 mb-6">
            Get the complete SHITO game with premium boards, custom markers, and exclusive icons!
          </p>
          <Link
            to="/?game=shito"
            className="inline-block px-8 py-4 bg-white text-purple-600 font-black text-lg rounded-2xl hover:bg-purple-100 transition-all transform hover:scale-105 shadow-lg"
          >
            Buy SHITO - $20.00
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 px-4 mt-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">© 2025 DaFish Boyz Games. All rights reserved.</p>
          <Link to="/" className="text-pink-400 hover:text-pink-300 mt-2 inline-block">
            Back to All Games
          </Link>
        </div>
      </footer>

      {/* Chat (Online only) */}
      {gameMode === 'online' && multiplayer.state.room && (
        <ShitoChat
          messages={multiplayer.state.messages}
          currentPlayerId={multiplayer.state.playerId}
          onSendMessage={multiplayer.sendMessage}
        />
      )}

      {/* Floating Party Button */}
      <FloatingPartyButton />

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default AdultShitoGame;
