import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { BotProvider, useBots } from '@/contexts/BotContext';
import PracticeControls from '@/components/practice/PracticeControls';
import CoachBotPanel from '@/components/practice/CoachBotPanel';
import { 
  PracticeModeState, 
  GameMove, 
  PracticeSettings,
  DEFAULT_PRACTICE_SETTINGS,
  GAME_DISPLAY_NAMES
} from '@/types/practiceMode';
import { 
  getRandomTip, 
  getSituationalHint, 
  getWelcomeMessage,
  explainMove,
  analyzeMove
} from '@/lib/coachBotLogic';
import { games } from '@/data/gamesData';
import { 
  Play, 
  ArrowLeft, 
  Bot, 
  Gamepad2, 
  Trophy, 
  Target,
  Zap,
  GraduationCap,
  Sparkles,
  Dice5,
  Users
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  executeBotShitzCreekFullTurn,
  ShitzCreekDbCard,
} from '@/lib/shitzCreekBotLogic';
import type { BotCardRevealData } from '@/components/practice/BotCardRevealOverlay';

// Import all game boards
import OCrapsBoard from '@/components/lobby/OCrapsBoard';
import PracticeShitoBoard from '@/components/practice/PracticeShitoBoard';
import PracticeShitzCreekBoard from '@/components/practice/PracticeShitzCreekBoard';
import PracticeLetgoBoard from '@/components/practice/PracticeLetgoBoard';
import PracticeSlangingShitBoard from '@/components/practice/PracticeSlangingShitBoard';

const PracticeModeContent: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedGame = searchParams.get('game');
  
  const { addBot, clearBots, executeBotTurn } = useBots();
  
  const [practiceState, setPracticeState] = useState<PracticeModeState>({
    isActive: false,
    isPaused: false,
    selectedGame: preselectedGame || null,
    difficulty: 'medium',
    botCount: 2,
    moveHistory: [],
    currentMoveIndex: -1,
    hintsEnabled: true,
    coachMessages: [],
    gameState: {}
  });
  
  const [settings, setSettings] = useState<PracticeSettings>(DEFAULT_PRACTICE_SETTINGS);
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [coachMinimized, setCoachMinimized] = useState(false);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [players, setPlayers] = useState<any[]>([]);

  // ── Bot card reveal overlay state ─────────────────────────────────
  const [botCardReveal, setBotCardReveal] = useState<BotCardRevealData | null>(null);
  const botCardRevealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);


  // ── Shitz Creek DB cards for bot card-draw logic ──────────────────
  const [shitzCreekDbCards, setShitzCreekDbCards] = useState<ShitzCreekDbCard[]>([]);
  const shitzCreekCardsLoadedRef = useRef(false);

  // Load real shit-pile cards from DB when the selected game is up-shitz-creek
  useEffect(() => {
    if (practiceState.selectedGame !== 'up-shitz-creek') return;
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
          console.log(`✅ PracticeMode: Loaded ${cards.length} Shitz Creek cards from DB for bot turns`);
        }
      } catch (err) {
        console.error('PracticeMode: Failed to load Shitz Creek cards for bots:', err);
      }
    };

    loadCards();
  }, [practiceState.selectedGame]);


  const startPractice = useCallback(() => {
    if (!practiceState.selectedGame) return;
    
    clearBots();
    
    const newBots = [];
    for (let i = 0; i < practiceState.botCount; i++) {
      const bot = addBot(practiceState.difficulty);
      newBots.push(bot);
    }
    
    const humanPlayer = {
      player_id: 'player',
      player_name: 'You',
      is_host: true,
      is_ready: true,
      isBot: false
    };
    
    const botPlayers = newBots.map(bot => ({
      player_id: bot.id,
      player_name: bot.name,
      is_host: false,
      is_ready: true,
      isBot: true,
      avatar: bot.avatar,
      difficulty: bot.difficulty
    }));
    
    const allPlayers = [humanPlayer, ...botPlayers];
    setPlayers(allPlayers);
    
    const initialGameState = initializeGameState(practiceState.selectedGame, allPlayers);
    const welcomeMsg = getWelcomeMessage(practiceState.selectedGame);
    
    setPracticeState(prev => ({
      ...prev,
      isActive: true,
      isPaused: false,
      moveHistory: [],
      currentMoveIndex: -1,
      coachMessages: [welcomeMsg],
      gameState: initialGameState
    }));
    
    setCurrentTurn(0);
  }, [practiceState.selectedGame, practiceState.botCount, practiceState.difficulty, addBot, clearBots]);

  const initializeGameState = (gameId: string, allPlayers: any[]): Record<string, any> => {
    switch (gameId) {
      case 'o-craps':
        const playerChips: Record<string, string[]> = {};
        allPlayers.forEach(p => {
          playerChips[p.player_id] = ['white', 'blue', 'purple', 'black'];
        });
        return {
          phase: 'waiting',
          currentTurn: 0,
          playerChips,
          centerPot: [],
          diceResults: [],
          rerollIndices: [],
          winner: null
        };
      
      case 'shito':
        return { 
          boards: {}, 
          chips: {}, 
          calledItems: [], 
          currentCaller: 0, 
          winner: null,
          phase: 'waiting',
          lastCard: null,
          lastColumn: null
        };
      case 'up-shitz-creek':
        return { 
          positions: {}, 
          paddles: {},
          currentTurn: 0, 
          winner: null,
          dice: 1,
          skipTurn: {},
          extraRoll: {},
          skipYellow: {},
          lastCard: null,
          deckState: null, // Will be initialised by the board when cards load from DB
          phase: 'rolling'
        };


      
      case 'let-that-shit-go':
        return { 
          playerLetters: {},
          shotsMade: {},
          totalShots: {},
          eliminatedPlayers: [],
          currentShooter: 0,
          lastShot: null,
          winner: null,
          phase: 'playing'
        };
      
      case 'slanging-shit':
        return {
          scores: {},
          usedPhrases: [],
          roundActive: false,
          currentActor: 0,
          currentPhrase: null,
          winner: null,
          hasUsedPass: false,
          roundNumber: 1
        };
      
      default:
        return { currentTurn: 0 };
    }
  };

  const handlePauseToggle = useCallback(() => {
    setPracticeState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const handleUndo = useCallback(() => {
    if (practiceState.currentMoveIndex < 0) return;
    const moveToUndo = practiceState.moveHistory[practiceState.currentMoveIndex];
    if (!moveToUndo) return;
    
    setPracticeState(prev => ({
      ...prev,
      gameState: moveToUndo.gameStateBefore,
      currentMoveIndex: prev.currentMoveIndex - 1
    }));
    
    const playerIndex = players.findIndex(p => p.player_id === moveToUndo.playerId);
    if (playerIndex >= 0) setCurrentTurn(playerIndex);
  }, [practiceState.currentMoveIndex, practiceState.moveHistory, players]);

  const handleRedo = useCallback(() => {
    if (practiceState.currentMoveIndex >= practiceState.moveHistory.length - 1) return;
    const moveToRedo = practiceState.moveHistory[practiceState.currentMoveIndex + 1];
    if (!moveToRedo) return;
    
    setPracticeState(prev => ({
      ...prev,
      gameState: moveToRedo.gameStateAfter,
      currentMoveIndex: prev.currentMoveIndex + 1
    }));
  }, [practiceState.currentMoveIndex, practiceState.moveHistory]);

  const handleHint = useCallback(() => {
    if (!practiceState.selectedGame) return;
    let hint = getSituationalHint(practiceState.selectedGame, practiceState.gameState);
    if (!hint) hint = getRandomTip(practiceState.selectedGame);
    setPracticeState(prev => ({ ...prev, coachMessages: [...prev.coachMessages, hint!] }));
  }, [practiceState.selectedGame, practiceState.gameState]);

  const handleToggleHints = useCallback(() => {
    setPracticeState(prev => ({ ...prev, hintsEnabled: !prev.hintsEnabled }));
  }, []);

  const handleRestart = useCallback(() => { startPractice(); }, [startPractice]);

  const handleClearMessages = useCallback(() => {
    setPracticeState(prev => ({ ...prev, coachMessages: [] }));
  }, []);

  const recordMove = useCallback((playerId: string, action: string, data: Record<string, any>, newGameState: Record<string, any>) => {
    const player = players.find(p => p.player_id === playerId);
    const move: GameMove = {
      id: `move_${Date.now()}`,
      playerId,
      playerName: player?.player_name || 'Unknown',
      isBot: player?.isBot || false,
      action,
      data,
      timestamp: Date.now(),
      gameStateBefore: { ...practiceState.gameState },
      gameStateAfter: newGameState
    };
    
    setPracticeState(prev => {
      const newHistory = prev.moveHistory.slice(0, prev.currentMoveIndex + 1);
      return {
        ...prev,
        moveHistory: [...newHistory, move],
        currentMoveIndex: newHistory.length,
        gameState: newGameState
      };
    });
    
    if (practiceState.selectedGame) {
      const explanation = explainMove(practiceState.selectedGame, action, data);
      setPracticeState(prev => ({ ...prev, coachMessages: [...prev.coachMessages, explanation] }));
      
      if (!player?.isBot && practiceState.hintsEnabled) {
        const feedback = analyzeMove(practiceState.selectedGame, action, practiceState.gameState, newGameState);
        if (feedback) {
          setTimeout(() => {
            setPracticeState(prev => ({ ...prev, coachMessages: [...prev.coachMessages, feedback] }));
          }, 1000);
        }
      }
    }
  }, [players, practiceState.gameState, practiceState.selectedGame, practiceState.hintsEnabled]);

  const handleGameAction = useCallback((action: string, data?: any) => {
    if (practiceState.isPaused) return;
    
    const currentPlayer = players[currentTurn];
    
    // Use functional update to avoid stale closure issues
    setPracticeState(prev => {
      const newGameState = { ...prev.gameState, ...data };
      
      // Only record significant moves
      const significantActions = ['move', 'placeChip', 'shotResult', 'correct', 'win', 'drawCard', 'cardEffect'];
      if (currentPlayer && significantActions.includes(action)) {
        const move: GameMove = {
          id: `move_${Date.now()}`,
          playerId: currentPlayer.player_id,
          playerName: currentPlayer.player_name || 'Unknown',
          isBot: currentPlayer.isBot || false,
          action,
          data: data || {},
          timestamp: Date.now(),
          gameStateBefore: { ...prev.gameState },
          gameStateAfter: newGameState
        };
        
        const newHistory = prev.moveHistory.slice(0, prev.currentMoveIndex + 1);
        
        return {
          ...prev,
          moveHistory: [...newHistory, move],
          currentMoveIndex: newHistory.length,
          gameState: newGameState
        };
      }
      
      return { ...prev, gameState: newGameState };
    });
    
    // Handle turn changes based on game-specific logic
    if (data?.currentTurn !== undefined) {
      setCurrentTurn(data.currentTurn);
    } else if (data?.currentCaller !== undefined) {
      setCurrentTurn(data.currentCaller);
    } else if (data?.currentShooter !== undefined) {
      setCurrentTurn(data.currentShooter);
    } else if (data?.currentActor !== undefined) {
      setCurrentTurn(data.currentActor);
    }
  }, [currentTurn, players, practiceState.isPaused]);



  // Bot turn execution for all games
  useEffect(() => {
    if (!practiceState.isActive || practiceState.isPaused || players.length === 0) return;
    
    const currentPlayer = players[currentTurn];
    if (!currentPlayer?.isBot) return;
    
    const timeout = setTimeout(async () => {
      // ── SHITO: bot caller/chip logic is handled entirely inside PracticeShitoBoard ──
      // The board component auto-rolls, draws calling cards, places bot chips, and
      // advances turns internally, so we skip the generic bot-turn handler here.
      if (practiceState.selectedGame === 'shito') {
        return;
      }

      // ── Up Shitz Creek: use the full bot turn logic with real DB cards ──
      if (practiceState.selectedGame === 'up-shitz-creek') {
        const turnResult = executeBotShitzCreekFullTurn(
          practiceState.gameState,
          currentPlayer.player_id,
          players,
          shitzCreekDbCards,
          currentTurn,
        );

        // Record the move — use 'cardEffect' if a card was drawn so it's tracked in history
        const actionName = turnResult.drawnCard ? 'cardEffect' : 'move';

        // Apply the new game state
        handleGameAction(turnResult.newGameData.winner ? 'win' : actionName, turnResult.newGameData);

        // ── Show bot card reveal overlay if a card was drawn ──
        if (turnResult.drawnCard) {
          // Resolve the target player name
          const targetName = turnResult.drawnCard.targetPlayerId
            ? players.find(p => p.player_id === turnResult.drawnCard!.targetPlayerId)?.player_name
            : undefined;

          // Clear any previous reveal timer
          if (botCardRevealTimerRef.current) {
            clearTimeout(botCardRevealTimerRef.current);
          }

          setBotCardReveal({
            botName: currentPlayer.player_name,
            botAvatar: currentPlayer.avatar,
            card: {
              card_name: turnResult.drawnCard.card.card_name,
              card_effect: turnResult.drawnCard.card.card_effect,
              card_category: turnResult.drawnCard.card.card_category,
            },
            parsedAction: turnResult.drawnCard.parsedAction,
            targetPlayerName: targetName,
          });

          // Safety auto-clear after 4s in case the overlay dismiss callback doesn't fire
          botCardRevealTimerRef.current = setTimeout(() => {
            setBotCardReveal(null);
          }, 4000);
        }

        // Feed coach messages from the bot turn
        if (turnResult.messages.length > 0) {
          setPracticeState(prev => ({
            ...prev,
            coachMessages: [...prev.coachMessages, ...turnResult.messages],
          }));
        }

        // If bot gets an extra roll, schedule another turn for the same bot
        if (turnResult.extraRoll && !turnResult.newGameData.winner) {
          // The currentTurn stays the same (already set in newGameData)
          // The next iteration of this useEffect will fire for the same bot
        }

        return;
      }





      // ── All other games: use the generic executeBotTurn ──
      const result = await executeBotTurn(
        practiceState.selectedGame!,
        practiceState.gameState,
        players,
        currentPlayer.player_id
      );
      
      if (result && result.action) {
        // Apply bot action based on game type
        const currentGameData = practiceState.gameState;
        let newGameData = { ...currentGameData };
        
        if (practiceState.selectedGame === 'let-that-shit-go') {
          // Let That Shit Go bot action - shoot
          if (result.action.type === 'shoot') {
            const { playerId, made } = result.action;
            const gameMode = currentGameData.gameMode;
            
            if (gameMode === 'multiplayer') {
              const lastShot = { playerId, made };
              let playerLetters = { ...currentGameData.playerLetters };
              let eliminatedPlayers = [...(currentGameData.eliminatedPlayers || [])];
              
              if (currentGameData.lastShot?.made && currentGameData.lastShot?.playerId !== playerId && !made) {
                const currentLetters = playerLetters[playerId] || [];
                const LETGO_LETTERS = ['L', 'E', 'T', 'G', 'O'];
                if (currentLetters.length < 5) {
                  playerLetters[playerId] = [...currentLetters, LETGO_LETTERS[currentLetters.length]];
                }
                if (playerLetters[playerId]?.length >= 5) {
                  eliminatedPlayers.push(playerId);
                }
              }
              
              const activePlayers = players.filter(p => !eliminatedPlayers.includes(p.player_id));
              const winner = activePlayers.length === 1 ? activePlayers[0].player_id : null;
              
              newGameData = {
                ...newGameData,
                lastShot,
                playerLetters,
                eliminatedPlayers,
                winner,
                phase: winner ? 'finished' : 'playing',
                currentShooter: (currentGameData.currentShooter + 1) % players.length
              };
              handleGameAction('shotResult', newGameData);
            } else if (gameMode === 'emotional') {
              const shotsMade = { ...currentGameData.shotsMade };
              const totalShots = { ...currentGameData.totalShots };
              
              totalShots[playerId] = (totalShots[playerId] || 0) + 1;
              if (made) {
                shotsMade[playerId] = (shotsMade[playerId] || 0) + 1;
              }
              
              newGameData = {
                ...newGameData,
                shotsMade,
                totalShots,
                phase: totalShots[playerId] >= 12 ? 'finished' : 'playing'
              };
              handleGameAction('emotionalShot', newGameData);
            }
          }
        } else if (practiceState.selectedGame === 'o-craps') {
          // O'Craps bot actions
          handleGameAction(result.action.type, result.action);
        } else if (practiceState.selectedGame === 'shito') {
          // Shito bot action - mark cell
          if (result.action.type === 'mark_cell') {
            const { playerId, row, col } = result.action;
            const boards = { ...currentGameData.boards };
            if (boards[playerId]) {
              const newBoard = boards[playerId].map((r: any[], rIdx: number) =>
                r.map((cell: any, cIdx: number) =>
                  rIdx === row && cIdx === col ? { ...cell, marked: true } : cell
                )
              );
              boards[playerId] = newBoard;
              newGameData = { ...newGameData, boards };
            }
            handleGameAction('markCell', newGameData);
          }
        } else if (practiceState.selectedGame === 'slanging-shit') {
          // Slanging Shit bot action - guess
          if (result.action.type === 'guess') {
            const { playerId, guess, isCorrect } = result.action;
            const guesses = [...(currentGameData.guesses || []), { playerId, guess, isCorrect }];
            newGameData = { ...newGameData, guesses, lastGuess: { playerId, guess, isCorrect } };
            
            if (isCorrect) {
              const scores = { ...currentGameData.scores };
              scores[playerId] = (scores[playerId] || 0) + 1;
              newGameData = { ...newGameData, scores };
            }
            handleGameAction('guess', newGameData);
          }
        }
      }
    }, settings.slowMotion ? 3000 : 1500);
    
    return () => clearTimeout(timeout);
  }, [currentTurn, practiceState.isActive, practiceState.isPaused, practiceState.selectedGame, practiceState.gameState, players, executeBotTurn, handleGameAction, settings.slowMotion, shitzCreekDbCards]);



  // Auto hints
  useEffect(() => {
    if (!practiceState.isActive || !practiceState.hintsEnabled || practiceState.isPaused) return;
    const currentPlayer = players[currentTurn];
    if (currentPlayer?.isBot) return;
    
    const timeout = setTimeout(() => { handleHint(); }, settings.hintDelay);
    return () => clearTimeout(timeout);
  }, [currentTurn, practiceState.isActive, practiceState.hintsEnabled, practiceState.isPaused, players, settings.hintDelay, handleHint]);

  const renderGameSelector = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-black/30 backdrop-blur-sm border-b border-purple-500/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button onClick={() => navigate('/')} variant="ghost" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-5 h-5 mr-2" />Back to Home
            </Button>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-purple-400" />Practice Mode
            </h1>
            <div className="w-32" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full text-purple-300 text-sm mb-4">
            <Sparkles className="w-4 h-4" />Learn & Improve Your Skills
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Practice with <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">AI Coach</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Start instantly with bot opponents. Pause anytime, undo moves, and get strategic hints from your personal coach bot.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-12">
          {[
            { icon: Zap, title: 'Instant Start', desc: 'No room setup needed' },
            { icon: Bot, title: 'AI Opponents', desc: 'Practice against smart bots' },
            { icon: Target, title: 'Undo Moves', desc: 'Learn from mistakes' },
            { icon: GraduationCap, title: 'Coach Bot', desc: 'Get strategic hints' }
          ].map((feature, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-purple-500/20 text-center">
              <feature.icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <h3 className="font-semibold text-white">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="bg-white/5 backdrop-blur-sm border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Gamepad2 className="w-6 h-6 text-purple-400" />Select a Game to Practice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4">
                {games.filter(g => g.id !== 'drop-deuce').map(game => (
                  <button
                    key={game.id}
                    onClick={() => setPracticeState(prev => ({ ...prev, selectedGame: game.id }))}
                    className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                      practiceState.selectedGame === game.id
                        ? 'border-purple-500 ring-2 ring-purple-500/50 scale-105'
                        : 'border-white/10 hover:border-purple-500/50'
                    }`}
                  >
                    <img src={game.image} alt={game.name} className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="font-bold text-white">{game.name}</h3>
                      <p className="text-gray-300 text-xs">{game.players} players</p>
                    </div>
                    {practiceState.selectedGame === game.id && (
                      <div className="absolute top-2 right-2 bg-purple-500 text-white p-1 rounded-full">
                        <Trophy className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {practiceState.selectedGame && (
                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white mb-2 block">Difficulty</Label>
                      <Select
                        value={practiceState.difficulty}
                        onValueChange={(v: 'easy' | 'medium' | 'hard') => setPracticeState(prev => ({ ...prev, difficulty: v }))}
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy - Learning Mode</SelectItem>
                          <SelectItem value="medium">Medium - Balanced</SelectItem>
                          <SelectItem value="hard">Hard - Challenge Mode</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white mb-2 block">Bot Opponents: {practiceState.botCount}</Label>
                      <Slider
                        value={[practiceState.botCount]}
                        onValueChange={([v]) => setPracticeState(prev => ({ ...prev, botCount: v }))}
                        min={1} max={5} step={1} className="py-2"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Auto Hints</Label>
                      <Switch checked={practiceState.hintsEnabled} onCheckedChange={(v) => setPracticeState(prev => ({ ...prev, hintsEnabled: v }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Show Bot Thinking</Label>
                      <Switch checked={settings.showBotThinking} onCheckedChange={(v) => setSettings(prev => ({ ...prev, showBotThinking: v }))} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Slow Motion</Label>
                      <Switch checked={settings.slowMotion} onCheckedChange={(v) => setSettings(prev => ({ ...prev, slowMotion: v }))} />
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={startPractice}
                disabled={!practiceState.selectedGame}
                size="lg"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg py-6"
              >
                <Play className="w-6 h-6 mr-2" />Start Practice Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderPracticeSession = () => {
    const currentPlayer = players[currentTurn];
    const isMyTurn = currentPlayer?.player_id === 'player';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-amber-900/20 to-slate-900">
        <div className="bg-black/30 backdrop-blur-sm border-b border-amber-500/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                onClick={() => { clearBots(); setPracticeState(prev => ({ ...prev, isActive: false })); }}
                variant="ghost" className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />Exit Practice
              </Button>
              <div className="flex items-center gap-4">
                <span className="text-amber-300 font-medium">{GAME_DISPLAY_NAMES[practiceState.selectedGame!] || practiceState.selectedGame}</span>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm">Practice Mode</span>
              </div>
              <span className="text-gray-400 text-sm">Move {practiceState.currentMoveIndex + 1} of {practiceState.moveHistory.length}</span>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-4">
          <PracticeControls
            isPaused={practiceState.isPaused}
            canUndo={practiceState.currentMoveIndex >= 0}
            canRedo={practiceState.currentMoveIndex < practiceState.moveHistory.length - 1}
            hintsEnabled={practiceState.hintsEnabled}
            soundEnabled={soundEnabled}
            onPauseToggle={handlePauseToggle}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onHint={handleHint}
            onToggleHints={handleToggleHints}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            onSettings={() => setShowSettings(true)}
            onRestart={handleRestart}
          />
        </div>

        <div className="container mx-auto px-4 mb-4">
          <div className={`text-center py-3 rounded-lg ${isMyTurn ? 'bg-green-500/20 border border-green-500/30' : 'bg-amber-500/20 border border-amber-500/30'}`}>
            {isMyTurn ? (
              <span className="text-green-300 font-medium">Your Turn - Make your move!</span>
            ) : (
              <span className="text-amber-300 font-medium flex items-center justify-center gap-2">
                <Bot className="w-5 h-5 animate-pulse" />{currentPlayer?.player_name} is thinking...
              </span>
            )}
          </div>
        </div>

        <div className="container mx-auto px-4 pb-8">
          <div className="grid lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 relative">
              <Card className="bg-white/5 backdrop-blur-sm border-amber-500/30 overflow-hidden">
                <CardContent className="p-6">
                  {practiceState.isPaused && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                      <div className="text-center">
                        <div className="text-4xl mb-4">⏸️</div>
                        <h3 className="text-2xl font-bold text-white mb-2">Game Paused</h3>
                        <p className="text-gray-300">Take your time to think about your next move</p>
                        <Button onClick={handlePauseToggle} className="mt-4 bg-green-600 hover:bg-green-700">
                          <Play className="w-4 h-4 mr-2" />Resume Game
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {practiceState.selectedGame === 'o-craps' && (
                    <OCrapsBoard
                      gameData={practiceState.gameState}
                      isMyTurn={isMyTurn && !practiceState.isPaused}
                      onAction={handleGameAction}
                      players={players}
                      currentPlayerId="player"
                    />
                  )}
                  
                  {practiceState.selectedGame === 'shito' && (
                    <PracticeShitoBoard
                      gameData={practiceState.gameState}
                      isMyTurn={isMyTurn && !practiceState.isPaused}
                      onAction={handleGameAction}
                      players={players}
                      currentPlayerId="player"
                      isPaused={practiceState.isPaused}
                      onHint={handleHint}
                    />
                  )}
                  
                  {practiceState.selectedGame === 'up-shitz-creek' && (
                    <PracticeShitzCreekBoard
                      gameData={practiceState.gameState}
                      isMyTurn={isMyTurn && !practiceState.isPaused}
                      onAction={handleGameAction}
                      players={players}
                      currentPlayerId="player"
                      isPaused={practiceState.isPaused}
                      onHint={handleHint}
                      botCardReveal={botCardReveal}
                      onBotCardDismiss={() => {
                        setBotCardReveal(null);
                        if (botCardRevealTimerRef.current) {
                          clearTimeout(botCardRevealTimerRef.current);
                          botCardRevealTimerRef.current = null;
                        }
                      }}
                    />
                  )}

                  
                  {practiceState.selectedGame === 'let-that-shit-go' && (
                    <PracticeLetgoBoard
                      gameData={practiceState.gameState}
                      isMyTurn={isMyTurn && !practiceState.isPaused}
                      onAction={handleGameAction}
                      players={players}
                      currentPlayerId="player"
                      isPaused={practiceState.isPaused}
                      onHint={handleHint}
                    />
                  )}
                  
                  {practiceState.selectedGame === 'slanging-shit' && (
                    <PracticeSlangingShitBoard
                      gameData={practiceState.gameState}
                      isMyTurn={isMyTurn && !practiceState.isPaused}
                      onAction={handleGameAction}
                      players={players}
                      currentPlayerId="player"
                      isPaused={practiceState.isPaused}
                      onHint={handleHint}
                    />
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card className="bg-white/5 backdrop-blur-sm border-amber-500/30">
                <CardHeader className="pb-2"><CardTitle className="text-white text-lg">Players</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {players.map((player, index) => (
                    <div key={player.player_id} className={`flex items-center gap-3 p-2 rounded-lg ${index === currentTurn ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-white/5'}`}>
                      <div className="text-2xl">{player.isBot ? player.avatar : '👤'}</div>
                      <div className="flex-1">
                        <div className="text-white font-medium flex items-center gap-2">
                          {player.player_name}
                          {player.isBot && <span className="text-xs px-1.5 py-0.5 bg-purple-500/30 text-purple-300 rounded">{player.difficulty}</span>}
                        </div>
                        {index === currentTurn && <span className="text-amber-400 text-xs">Current Turn</span>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-white/5 backdrop-blur-sm border-amber-500/30">
                <CardHeader className="pb-2"><CardTitle className="text-white text-lg">Recent Moves</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {practiceState.moveHistory.slice(-5).reverse().map((move, i) => (
                      <div key={move.id} className={`text-sm p-2 rounded ${i === 0 ? 'bg-amber-500/20 text-amber-200' : 'bg-white/5 text-gray-400'}`}>
                        <span className="font-medium">{move.playerName}:</span> {move.action}
                      </div>
                    ))}
                    {practiceState.moveHistory.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No moves yet</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="fixed bottom-4 right-4 z-50">
          <CoachBotPanel
            messages={practiceState.coachMessages}
            isMinimized={coachMinimized}
            onToggleMinimize={() => setCoachMinimized(!coachMinimized)}
            onClearMessages={handleClearMessages}
            gameName={GAME_DISPLAY_NAMES[practiceState.selectedGame!] || 'Game'}
          />
        </div>

        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="bg-slate-900 border-purple-500/30">
            <DialogHeader><DialogTitle className="text-white">Practice Settings</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <Label className="text-white">Show Bot Thinking</Label>
                <Switch checked={settings.showBotThinking} onCheckedChange={(v) => setSettings(prev => ({ ...prev, showBotThinking: v }))} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-white">Auto Hints</Label>
                <Switch checked={settings.autoHints} onCheckedChange={(v) => setSettings(prev => ({ ...prev, autoHints: v }))} />
              </div>
              <div>
                <Label className="text-white mb-2 block">Hint Delay: {settings.hintDelay / 1000}s</Label>
                <Slider value={[settings.hintDelay]} onValueChange={([v]) => setSettings(prev => ({ ...prev, hintDelay: v }))} min={1000} max={10000} step={500} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-white">Slow Motion</Label>
                <Switch checked={settings.slowMotion} onCheckedChange={(v) => setSettings(prev => ({ ...prev, slowMotion: v }))} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return practiceState.isActive ? renderPracticeSession() : renderGameSelector();
};

const PracticeMode: React.FC = () => (
  <BotProvider>
    <PracticeModeContent />
  </BotProvider>
);

export default PracticeMode;
