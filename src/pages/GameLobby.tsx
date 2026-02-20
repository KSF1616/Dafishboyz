import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';

import { LobbyProvider, useLobby } from '@/contexts/LobbyContext';
import { VoiceChatProvider } from '@/contexts/VoiceChatContext';
import { BotProvider, useBots } from '@/contexts/BotContext';
import { DrinkingGameProvider } from '@/contexts/DrinkingGameContext';
import { useFriends } from '@/contexts/FriendsContext';
import { useLogo } from '@/contexts/LogoContext';
import { useDrinkingGame } from '@/contexts/DrinkingGameContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Play, LogOut, FileText, Users, Trophy, RotateCcw, UserPlus, Globe, Lock, Layers, Eye, Tv, Wine, Loader2, Bot } from 'lucide-react';
import PlayersList from '@/components/lobby/PlayersList';
import ChatPanel from '@/components/lobby/ChatPanel';
import GameRulesPanel from '@/components/lobby/GameRulesPanel';
import GameBoard from '@/components/lobby/GameBoard';
import CardViewer from '@/components/lobby/CardViewer';
import GameCardViewer from '@/components/lobby/GameCardViewer';
import InviteModal from '@/components/lobby/InviteModal';
import InviteFriendsModal from '@/components/lobby/InviteFriendsModal';
import RoomBrowser from '@/components/lobby/RoomBrowser';
import VoiceChatPanel from '@/components/lobby/VoiceChatPanel';
import SpectatorsList from '@/components/lobby/SpectatorsList';
import BotPlayerManager from '@/components/lobby/BotPlayerManager';
import FloatingPartyButton from '@/components/FloatingPartyButton';
import DrinkingGamePanel from '@/components/DrinkingGamePanel';
import { games } from '@/data/gamesData';
import { supabase } from '@/lib/supabase';
import { isShitzCreek } from '@/lib/gameAssets';
import {
  executeBotShitzCreekFullTurn,
  ShitzCreekDbCard,
} from '@/lib/shitzCreekBotLogic';




const GAME_TITLES: Record<string, string> = { 
  'up-shitz-creek': 'Up Shitz Creek', 
  'o-craps': "O'Craps", 
  'shito': 'Shito', 
  'slanging-shit': 'Slanging Shit',
  'let-that-shit-go': 'Let That Shit Go',
  'drop-deuce': 'Drop A Deuce'
};

// Games that are for children (no drinking mode)
const CHILD_GAMES = ['drop-deuce'];


const LobbyContent: React.FC = () => {
  const navigate = useNavigate();
  const { logoUrl } = useLogo();

  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { updatePresence } = useFriends();
  const { 
    playerId, 
    playerName, 
    setPlayerName, 
    currentRoom, 
    players = [], 
    spectators = [], 
    messages = [], 
    isSpectator, 
    isLoading,
    createRoom, 
    joinRoom, 
    joinAsSpectator, 
    leaveRoom, 
    sendMessage, 
    toggleReady, 
    startGame, 
    updateGameState, 
    nextTurn, 
    endGame 
  } = useLobby();
  
  const { bots, executeBotTurn, isBotPlayer, clearBots } = useBots();
  
  const [nameInput, setNameInput] = useState(playerName);
  const [codeInput, setCodeInput] = useState(searchParams.get('code') || '');
  const [selectedGameSlug, setSelectedGameSlug] = useState(searchParams.get('game') || '');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState('');
  const [showCards, setShowCards] = useState(false);
  const [showGameCards, setShowGameCards] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showFriendsInvite, setShowFriendsInvite] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('create');
  const [isJoining, setIsJoining] = useState(false);
  const [botThinking, setBotThinking] = useState(false);

  // ── Shitz Creek DB cards for real bot card-draw logic ──────────────
  const [shitzCreekDbCards, setShitzCreekDbCards] = useState<ShitzCreekDbCard[]>([]);
  const shitzCreekCardsLoadedRef = useRef(false);


  // Check if coming from spectator page
  const spectateMode = searchParams.get('spectate') === 'true';
  const spectatorNameParam = searchParams.get('name');

  // Safe array access with defaults
  const safePlayers = Array.isArray(players) ? players : [];
  const safeSpectators = Array.isArray(spectators) ? spectators : [];
  const safeMessages = Array.isArray(messages) ? messages : [];
  
  // Combine real players with bots for game logic
  const allPlayers = [
    ...safePlayers,
    ...bots.map((bot, idx) => ({
      player_id: bot.id,
      player_name: bot.name,
      is_ready: true,
      is_host: false,
      score: bot.score,
      player_order: safePlayers.length + idx
    }))
  ];

  const isHost = currentRoom?.host_id === playerId;
  const totalPlayerCount = safePlayers.length + bots.length;
  const allReady = totalPlayerCount >= 1 && safePlayers.every(p => p?.is_ready || p?.is_host) && (totalPlayerCount >= 2 || bots.length > 0);
  const canStartWithBots = totalPlayerCount >= 2 || (safePlayers.length === 1 && bots.length >= 1);
  const isPlaying = currentRoom?.status === 'playing';
  const isFinished = currentRoom?.status === 'finished';
  const currentTurnIndex = currentRoom?.current_turn || 0;
  const currentTurnPlayer = allPlayers[currentTurnIndex];
  const isMyTurn = currentTurnPlayer?.player_id === playerId && !isSpectator;
  const isBotTurn = currentTurnPlayer && isBotPlayer(currentTurnPlayer.player_id);

  // ── Load Shitz Creek DB cards for bot card-draw logic ───────────────
  useEffect(() => {
    if (!currentRoom || !isShitzCreek(currentRoom.game_type)) return;
    if (shitzCreekCardsLoadedRef.current && shitzCreekDbCards.length > 0) return;

    const loadCards = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('game-card-loader', {
          body: { action: 'get-cards', gameId: 'shitz-creek' },
        });
        if (error) throw error;

        const payload = data as any;
        let cards: ShitzCreekDbCard[] = [];
        if (payload?.cards && Array.isArray(payload.cards)) {
          cards = payload.cards;
        } else if (payload?.data?.cards && Array.isArray(payload.data.cards)) {
          cards = payload.data.cards;
        }

        if (cards.length > 0) {
          setShitzCreekDbCards(cards);
          shitzCreekCardsLoadedRef.current = true;
          console.log(`✅ GameLobby: Loaded ${cards.length} Shitz Creek cards from DB for bot turns`);
        }
      } catch (err) {
        console.error('GameLobby: Failed to load Shitz Creek cards for bots:', err);
      }
    };

    loadCards();
  }, [currentRoom?.game_type]);

  // Handle bot turns
  const handleBotTurn = useCallback(async () => {
    if (!isBotTurn || !currentRoom || botThinking) return;
    
    setBotThinking(true);
    
    try {
      // ── Up Shitz Creek: use the full bot turn logic with real DB cards ──
      if (isShitzCreek(currentRoom.game_type)) {
        const currentGameData = currentRoom.game_data || {};

        const turnResult = executeBotShitzCreekFullTurn(
          currentGameData,
          currentTurnPlayer.player_id,
          allPlayers,
          shitzCreekDbCards,
          currentTurnIndex,
        );

        // Strip the practice-mode currentTurn from newGameData – multiplayer
        // manages turn index via the game_rooms.current_turn column.
        const { currentTurn: _ct, ...gameDataPayload } = turnResult.newGameData;

        // Embed a card-reveal payload so all clients can show the overlay
        if (turnResult.drawnCard) {
          const targetName = turnResult.drawnCard.targetPlayerId
            ? allPlayers.find(p => p.player_id === turnResult.drawnCard!.targetPlayerId)?.player_name
            : undefined;

          (gameDataPayload as any).lastCardReveal = {
            playerId: currentTurnPlayer.player_id,
            playerName: currentTurnPlayer.player_name,
            card: {
              card_name: turnResult.drawnCard.card.card_name,
              card_effect: turnResult.drawnCard.card.card_effect,
              card_category: turnResult.drawnCard.card.card_category,
            },
            parsedAction: turnResult.drawnCard.parsedAction,
            targetPlayerName: targetName,
            timestamp: Date.now(),
          };
        }

        // Check for winner
        if (turnResult.newGameData.winner) {
          await updateGameState(gameDataPayload);
          await endGame(turnResult.newGameData.winner);
          setBotThinking(false);
          return;
        }

        // Persist the updated game state
        await updateGameState(gameDataPayload);

        // Send a summary chat message
        if (turnResult.messages.length > 0) {
          const summary = turnResult.messages.slice(0, 3).join(' | ');
          await sendMessage(`${currentTurnPlayer.player_name}: ${summary}`, 'chat');
        }

        // Handle extra roll vs normal turn advance
        const hasExtraRoll = turnResult.extraRoll;
        setTimeout(async () => {
          if (!hasExtraRoll) {
            await nextTurn();
          }
          // If extra roll, don't advance – the same bot gets another turn.
          // Setting botThinking to false will re-trigger the auto-execute effect.
          setBotThinking(false);
        }, turnResult.drawnCard ? 2800 : 800);

        return;
      }

      // ── All other games: use the generic executeBotTurn ──────────────
      const result = await executeBotTurn(
        currentRoom.game_type,
        currentRoom.game_data || {},
        allPlayers,
        currentTurnPlayer.player_id
      );
      
      if (result) {
        // Send bot chat message if any
        if (result.chatMessage) {
          await sendMessage(`${currentTurnPlayer.player_name}: ${result.chatMessage}`, 'chat');
        }
        
        // Execute the bot's action based on game type and action type
        if (result.action.type !== 'wait' && result.action.type !== 'no_match') {
          const currentGameData = currentRoom.game_data || {};
          let newGameData = { ...currentGameData };
          
          if (currentRoom.game_type === 'let-that-shit-go') {
            // Let That Shit Go bot action - shoot
            if (result.action.type === 'shoot') {
              const { playerId: pid, made } = result.action;
              const gameMode = currentGameData.gameMode;
              
              if (gameMode === 'multiplayer') {
                const lastShot = { playerId: pid, made };
                let playerLetters = { ...currentGameData.playerLetters };
                let eliminatedPlayers = [...(currentGameData.eliminatedPlayers || [])];
                
                if (currentGameData.lastShot?.made && currentGameData.lastShot?.playerId !== pid && !made) {
                  const currentLetters = playerLetters[pid] || [];
                  const LETGO_LETTERS = ['L', 'E', 'T', 'G', 'O'];
                  if (currentLetters.length < 5) {
                    playerLetters[pid] = [...currentLetters, LETGO_LETTERS[currentLetters.length]];
                  }
                  if (playerLetters[pid]?.length >= 5) {
                    eliminatedPlayers.push(pid);
                  }
                }
                
                const activePlayers = allPlayers.filter(p => !eliminatedPlayers.includes(p.player_id));
                const winner = activePlayers.length === 1 ? activePlayers[0].player_id : null;
                
                newGameData = {
                  ...newGameData,
                  lastShot,
                  playerLetters,
                  eliminatedPlayers,
                  winner,
                  phase: winner ? 'finished' : 'playing'
                };
              } else if (gameMode === 'emotional') {
                const shotsMade = { ...currentGameData.shotsMade };
                const totalShots = { ...currentGameData.totalShots };
                
                totalShots[pid] = (totalShots[pid] || 0) + 1;
                if (made) {
                  shotsMade[pid] = (shotsMade[pid] || 0) + 1;
                }
                
                newGameData = {
                  ...newGameData,
                  shotsMade,
                  totalShots,
                  phase: totalShots[pid] >= 12 ? 'finished' : 'playing'
                };
              }
            }
          } else if (currentRoom.game_type === 'o-craps') {
            if (result.action.type === 'rolled' || result.action.type === 'rerolled') {
              newGameData = { ...newGameData, ...result.action };
            } else if (result.action.type === 'resolve') {
              newGameData = { ...newGameData, ...result.action };
            }
          } else if (currentRoom.game_type === 'shito') {
            if (result.action.type === 'mark_cell') {
              const { playerId: pid, row, col } = result.action;
              const boards = { ...currentGameData.boards };
              if (boards[pid]) {
                const newBoard = boards[pid].map((r: any[], rIdx: number) =>
                  r.map((cell: any, cIdx: number) =>
                    rIdx === row && cIdx === col ? { ...cell, marked: true } : cell
                  )
                );
                boards[pid] = newBoard;
                newGameData = { ...newGameData, boards };
              }
            }
          } else if (currentRoom.game_type === 'slanging-shit') {
            if (result.action.type === 'guess') {
              const { playerId: pid, guess, isCorrect } = result.action;
              const guesses = [...(currentGameData.guesses || []), { playerId: pid, guess, isCorrect }];
              newGameData = { ...newGameData, guesses, lastGuess: { playerId: pid, guess, isCorrect } };
              
              if (isCorrect) {
                const scores = { ...currentGameData.scores };
                scores[pid] = (scores[pid] || 0) + 1;
                newGameData = { ...newGameData, scores };
              }
            }
          }
          
          await updateGameState(newGameData);
        }
        
        setTimeout(async () => {
          await nextTurn();
          setBotThinking(false);
        }, 500);
        return;
      }
    } catch (err) {
      console.error('Bot turn error:', err);
    }
    setBotThinking(false);
  }, [isBotTurn, currentRoom, botThinking, executeBotTurn, allPlayers, currentTurnPlayer, currentTurnIndex, sendMessage, updateGameState, nextTurn, endGame, shitzCreekDbCards]);


  // Auto-execute bot turns
  useEffect(() => {
    if (isPlaying && isBotTurn && !botThinking) {
      const timer = setTimeout(handleBotTurn, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, isBotTurn, botThinking, handleBotTurn]);


  // Auto-join as spectator if coming from spectator page
  useEffect(() => {
    const autoJoinSpectator = async () => {
      if (spectateMode && codeInput && spectatorNameParam && !currentRoom && !isJoining) {
        setIsJoining(true);
        setNameInput(spectatorNameParam);
        setPlayerName(spectatorNameParam);
        try {
          await joinAsSpectator(codeInput, spectatorNameParam);
        } catch (err) {
          console.error('Error joining as spectator:', err);
          setError('Failed to join as spectator');
        } finally {
          setIsJoining(false);
        }
      }
    };
    autoJoinSpectator();
  }, [spectateMode, codeInput, spectatorNameParam, currentRoom, isJoining]);

  useEffect(() => { 
    if (currentRoom) updatePresence('in_game', currentRoom.room_code); 
    return () => { if (currentRoom) updatePresence('online'); }; 
  }, [currentRoom]);

  // Clear bots when leaving room
  useEffect(() => {
    return () => {
      if (!currentRoom) {
        clearBots();
      }
    };
  }, [currentRoom, clearBots]);


  const handleCreate = async () => { 
    if (!nameInput.trim() || !selectedGameSlug) { 
      setError('Enter name and select game'); 
      return; 
    } 
    setPlayerName(nameInput.trim()); 
    await createRoom(selectedGameSlug, nameInput.trim(), isPrivate); 
  };
  
  const handleJoin = async (code?: string) => { 
    const roomCode = code || codeInput.trim();
    if (!nameInput.trim() || !roomCode) { 
      setError('Enter name and code'); 
      return; 
    } 
    setPlayerName(nameInput.trim()); 
    const success = await joinRoom(roomCode, nameInput.trim());
    if (!success) {
      setError('Room not found or full');
    }
  };
  
  const handleSpectate = async (code: string) => { 
    if (!nameInput.trim()) { 
      setError('Enter your name first'); 
      return; 
    } 
    setPlayerName(nameInput.trim()); 
    if (!await joinAsSpectator(code, nameInput.trim())) {
      setError('Cannot spectate this room');
    }
  };
  
  const handleGameAction = async (action: string, data?: any) => { 
    if (isSpectator) return; 
    if (action === 'endTurn') await nextTurn(); 
    else if (action === 'gameOver') await endGame(data?.winnerId); 
    else if (action === 'win') {
      // Handle win action - update game state and end game
      await updateGameState(data);
      await endGame(data?.winner);
    }
    else {
      // For move, cardEffect, skipTurn, etc. - just pass the data directly
      // Don't spread currentRoom.game_data here since updateGameState already does that
      await updateGameState(data);
    }
  };


  // Show loading state while joining
  if (isLoading || isJoining) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
          <h2 className="text-xl font-bold text-white mb-2">
            {isSpectator || spectateMode ? 'Joining as Spectator...' : 'Joining Room...'}
          </h2>
          <p className="text-gray-400">Loading game data, please wait...</p>
        </div>
      </div>
    );
  }

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full">
          <div className="flex items-center justify-between mb-4">
            <Link to="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <img src={logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded-lg" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => navigate('/spectator')} 
              className="border-blue-500 text-blue-400 hover:bg-blue-600/20"
            >
              <Tv className="w-4 h-4 mr-2" />Watch Games
            </Button>
          </div>
          
          {/* Logo and Title - Dynamic from LogoContext */}
          <div className="flex items-center gap-3 mb-6">
            <img src={logoUrl} alt="Dafish Boyz" className="w-12 h-12 object-contain rounded-xl shadow-lg shadow-amber-500/20" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
            <div>
              <h1 className="text-2xl font-bold text-white">Game Lobby</h1>
              <p className="text-xs text-gray-500">Dafish Boyz FunShit Games</p>
            </div>
          </div>
          
          <Input 
            value={nameInput} 
            onChange={(e) => setNameInput(e.target.value)} 
            placeholder="Your Name" 
            className="bg-gray-700 border-gray-600 text-white mb-4" 
          />
          {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="join">Join</TabsTrigger>
              <TabsTrigger value="browse">Browse</TabsTrigger>
              <TabsTrigger value="spectate" className="flex items-center gap-1">
                <Tv className="w-3 h-3" />Watch
              </TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="space-y-4">
              <select 
                value={selectedGameSlug} 
                onChange={(e) => setSelectedGameSlug(e.target.value)} 
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2"
              >
                <option value="">Select Game</option>
                {games.map(g => <option key={g.slug} value={g.slug}>{g.name}</option>)}
              </select>
              <div className="flex gap-2">
                <Button 
                  variant={isPrivate ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setIsPrivate(true)} 
                  className={isPrivate ? 'bg-purple-600' : 'border-gray-600'}
                >
                  <Lock className="w-4 h-4 mr-1" />Private
                </Button>
                <Button 
                  variant={!isPrivate ? 'default' : 'outline'} 
                  size="sm" 
                  onClick={() => setIsPrivate(false)} 
                  className={!isPrivate ? 'bg-purple-600' : 'border-gray-600'}
                >
                  <Globe className="w-4 h-4 mr-1" />Public
                </Button>
              </div>
              
              {/* Solo Play Hint */}
              <div className="bg-cyan-900/20 border border-cyan-700/50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-cyan-300 text-sm">
                  <Bot className="w-4 h-4" />
                  <span className="font-medium">Solo Play Available!</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Create a room and add bot players to play alone or practice.
                </p>
              </div>
              
              <Button 
                onClick={handleCreate} 
                disabled={!selectedGameSlug} 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Users className="w-4 h-4 mr-2" />Create Room
              </Button>
            </TabsContent>
            <TabsContent value="join" className="space-y-4">
              <Input 
                value={codeInput} 
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())} 
                placeholder="Room Code" 
                className="bg-gray-700 border-gray-600 text-white font-mono text-center" 
                maxLength={6} 
              />
              <Button 
                onClick={() => handleJoin()} 
                disabled={!codeInput} 
                className="w-full bg-green-600"
              >
                Join Room
              </Button>
            </TabsContent>
            <TabsContent value="browse">
              <RoomBrowser 
                onJoinRoom={(code) => handleJoin(code)} 
                onSpectateRoom={handleSpectate} 
                selectedGame={selectedGameSlug} 
                onSelectGame={setSelectedGameSlug} 
              />
            </TabsContent>
            <TabsContent value="spectate" className="space-y-4">
              <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-6 text-center border border-blue-500/30">
                <Tv className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-white mb-2">Spectator Mode</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Watch live games without joining as a player. See strategies, learn the games, and chat with other spectators!
                </p>
                <Button 
                  onClick={() => navigate('/spectator')}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Browse Live Games
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <Eye className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Watch & Learn</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-3">
                  <Users className="w-6 h-6 text-green-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Chat with Others</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{GAME_TITLES[currentRoom.game_type] || currentRoom.game_type}</h1>
              {isSpectator && (
                <span className="bg-blue-600/30 text-blue-300 text-sm px-2 py-1 rounded flex items-center gap-1">
                  <Eye className="w-4 h-4" />Spectating
                </span>
              )}
              {bots.length > 0 && (
                <span className="bg-cyan-600/30 text-cyan-300 text-sm px-2 py-1 rounded flex items-center gap-1">
                  <Bot className="w-4 h-4" />{bots.length} Bot{bots.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-gray-400">Room: <span className="text-purple-400 font-mono">{currentRoom.room_code}</span></p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => setShowGameCards(true)} variant="outline" className="border-purple-600 text-purple-400">
              <Layers className="w-4 h-4 mr-2" />Cards
            </Button>
            {!isSpectator && (
              <Button onClick={() => setShowFriendsInvite(true)} variant="outline" className="border-green-600 text-green-400">
                <UserPlus className="w-4 h-4 mr-2" />Invite
              </Button>
            )}
            <Button onClick={leaveRoom} variant="destructive">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {isFinished ? (
              <div className="bg-gradient-to-br from-yellow-900/50 to-amber-900/50 rounded-xl p-8 text-center">
                <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Game Over!</h2>
                {isHost && !isSpectator && (
                  <Button onClick={() => { updateGameState({}); startGame(); }} className="bg-green-600">
                    <RotateCcw className="w-4 h-4 mr-2" />Play Again
                  </Button>
                )}
              </div>
            ) : isPlaying ? (
              <div className="relative">
                {/* Bot thinking indicator */}
                {botThinking && (
                  <div className="absolute top-2 right-2 z-10 bg-cyan-900/90 text-cyan-300 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{currentTurnPlayer?.player_name} is thinking...</span>
                  </div>
                )}
                <GameBoard 
                  gameType={currentRoom.game_type} 
                  gameData={currentRoom.game_data || {}} 
                  isMyTurn={isMyTurn} 
                  onAction={handleGameAction} 
                  players={allPlayers as any} 
                  currentPlayerId={playerId} 
                  isSpectator={isSpectator}
                  roomId={currentRoom.id}
                />

              </div>
            ) : (
              <div className="bg-gray-800 rounded-xl p-8 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Waiting for Players</h2>
                <p className="text-gray-400 mb-4">
                  {totalPlayerCount} player{totalPlayerCount !== 1 ? 's' : ''} in room
                  {totalPlayerCount < 2 && ' - Need at least 2 players to start'}
                </p>
                
                {/* Bot info */}
                {bots.length > 0 && (
                  <p className="text-cyan-400 text-sm mb-4">
                    {bots.length} bot player{bots.length > 1 ? 's' : ''} ready to play!
                  </p>
                )}
                
                {!isSpectator && (
                  isHost ? (
                    <Button 
                      onClick={startGame} 
                      disabled={!canStartWithBots} 
                      className="bg-green-600"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {canStartWithBots ? 'Start Game' : 'Need 2+ Players'}
                    </Button>
                  ) : (
                    <Button onClick={toggleReady} className="bg-purple-600">
                      {safePlayers.find(p => p?.player_id === playerId)?.is_ready ? 'Not Ready' : 'Ready!'}
                    </Button>
                  )
                )}
                {isSpectator && <p className="text-gray-400">Waiting for host to start...</p>}
              </div>
            )}
            <GameRulesPanel gameType={currentRoom.game_type} />
          </div>
          <div className="space-y-4">
            <PlayersList 
              players={safePlayers} 
              currentTurn={currentTurnIndex} 
              isPlaying={isPlaying} 
              currentPlayerId={playerId} 
            />
            
            {/* Bot Player Manager - Only show when not playing */}
            {!isPlaying && (
              <BotPlayerManager 
                isHost={isHost}
                maxPlayers={currentRoom.max_players || 4}
                currentPlayerCount={safePlayers.length}
                disabled={isSpectator}
              />
            )}
            
            <SpectatorsList spectators={safeSpectators} />
            <VoiceChatPanel roomId={currentRoom.id} playerId={playerId} playerName={playerName} />
            <ChatPanel 
              messages={safeMessages} 
              onSendMessage={sendMessage} 
              currentPlayerId={playerId} 
              roomId={currentRoom.id} 
            />
          </div>
        </div>
      </div>
      <GameCardViewer isOpen={showGameCards} onClose={() => setShowGameCards(false)} gameType={currentRoom.game_type} mode="play" />
      <InviteModal isOpen={showInvite} onClose={() => setShowInvite(false)} roomCode={currentRoom.room_code} gameName={GAME_TITLES[currentRoom.game_type] || currentRoom.game_type} />
      <InviteFriendsModal isOpen={showFriendsInvite} onClose={() => setShowFriendsInvite(false)} roomCode={currentRoom.room_code} gameName={GAME_TITLES[currentRoom.game_type] || currentRoom.game_type} />
      
      {/* Floating Party Button */}
      <FloatingPartyButton />
    </div>
  );
};

const GameLobby: React.FC = () => (
  <LobbyProvider>
    <VoiceChatProvider>
      <BotProvider>
        <DrinkingGameProvider>
          <LobbyContent />
        </DrinkingGameProvider>
      </BotProvider>
    </VoiceChatProvider>
  </LobbyProvider>
);

export default GameLobby;
