import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Check, SkipForward, X, Trophy, RotateCcw, Lightbulb, Timer, ThumbsUp, ThumbsDown, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Props {
  gameData: Record<string, any>;
  isMyTurn: boolean;
  onAction: (action: string, data?: any) => void;
  players: { player_id: string; player_name: string; isBot?: boolean; avatar?: string }[];
  currentPlayerId: string;
  isPaused?: boolean;
  onHint?: () => void;
}

interface CharadesCard {
  id: string;
  card_name: string;
  card_number: number;
}

export default function PracticeSlangingShitBoard({
  gameData,
  isMyTurn,
  onAction,
  players,
  currentPlayerId,
  isPaused,
  onHint
}: Props) {
  // ── DB card loading ─────────────────────────────────────────────────────
  const [allCards, setAllCards] = useState<CharadesCard[]>([]);
  const [loadingCards, setLoadingCards] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const scores = gameData.scores || {};
  const usedPhrases = gameData.usedPhrases || [];
  const roundActive = gameData.roundActive || false;
  const currentActor = gameData.currentActor || 0;
  const currentPhrase = gameData.currentPhrase || null;
  const winner = gameData.winner || null;
  const hasUsedPass = gameData.hasUsedPass || false;
  const roundNumber = gameData.roundNumber || 1;

  const [timeLeft, setTimeLeft] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const [botGuessing, setBotGuessing] = useState(false);
  const [botGuessResult, setBotGuessResult] = useState<'correct' | 'wrong' | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const winScore = 10;

  const isActor = players[currentActor]?.player_id === currentPlayerId;
  const currentActorPlayer = players[currentActor];

  // ── Load real cards from database ───────────────────────────────────────
  useEffect(() => {
    loadCardsFromDB();
  }, []);

  const loadCardsFromDB = async () => {
    setLoadingCards(true);
    setLoadError(null);
    try {
      const { data, error } = await supabase.functions.invoke('game-card-loader', {
        body: { action: 'get-cards', gameId: 'slanging-shit' }
      });

      if (error) throw new Error(error.message || 'Failed to load cards');
      
      const responseData = data?.data || data;
      
      if (!responseData?.success || !responseData?.cards?.length) {
        throw new Error('No charades cards found in database');
      }

      const cards: CharadesCard[] = responseData.cards.map((c: any) => ({
        id: c.id,
        card_name: c.card_name?.trim() || '',
        card_number: c.card_number
      })).filter((c: CharadesCard) => c.card_name.length > 0);

      console.log(`Practice mode: Loaded ${cards.length} real Slanging Shit phrases from database`);
      setAllCards(cards);
      setLoadingCards(false);
    } catch (e: any) {
      console.error('Failed to load charades cards for practice:', e);
      setLoadError(e.message || 'Failed to load cards');
      setLoadingCards(false);
    }
  };

  // Initialize game
  useEffect(() => {
    if (Object.keys(scores).length === 0 && players.length > 0) {
      const initScores: Record<string, number> = {};
      players.forEach(p => {
        initScores[p.player_id] = 0;
      });
      onAction('init', { scores: initScores, currentActor: 0, roundNumber: 1 });
    }
  }, [players.length]);

  // Timer effect
  useEffect(() => {
    if (!isRunning || timeLeft <= 0 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (timeLeft <= 0 && isRunning) endRound();
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, isPaused]);

  // Check for winner
  useEffect(() => {
    const winningPlayer = Object.entries(scores).find(([_, s]) => (s as number) >= winScore);
    if (winningPlayer && !winner) {
      onAction('win', { winner: winningPlayer[0] });
    }
  }, [scores]);

  // Bot guessing simulation
  useEffect(() => {
    if (!roundActive || !currentPhrase || isPaused) return;
    
    const botGuessers = players.filter(p => p.isBot && p.player_id !== currentActorPlayer?.player_id);
    if (botGuessers.length === 0) return;

    const guessInterval = setInterval(() => {
      if (!isRunning || isPaused) return;
      
      const timeBonus = (60 - timeLeft) / 60;
      const guessChance = 0.15 + (timeBonus * 0.3);
      
      if (Math.random() < guessChance) {
        setBotGuessing(true);
        
        setTimeout(() => {
          if (Math.random() < 0.7) {
            setBotGuessResult('correct');
            setTimeout(() => {
              correctGuess();
              setBotGuessing(false);
              setBotGuessResult(null);
            }, 500);
          } else {
            setBotGuessResult('wrong');
            setTimeout(() => {
              setBotGuessing(false);
              setBotGuessResult(null);
            }, 1000);
          }
        }, 800);
      }
    }, 3000);

    return () => clearInterval(guessInterval);
  }, [roundActive, currentPhrase, isRunning, isPaused, timeLeft]);

  const drawPhrase = (): string | null => {
    // Use real DB cards instead of fake phrases
    const available = allCards.filter(c => !usedPhrases.includes(c.card_name));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)].card_name;
  };

  const startRound = () => {
    const phrase = drawPhrase();
    if (!phrase) return;

    setTimeLeft(60);
    setIsRunning(true);
    onAction('startRound', {
      currentPhrase: phrase,
      usedPhrases: [...usedPhrases, phrase],
      roundActive: true,
      hasUsedPass: false
    });
  };

  const endRound = () => {
    setIsRunning(false);
    const nextActor = (currentActor + 1) % players.length;
    onAction('endRound', {
      roundActive: false,
      currentPhrase: null,
      currentActor: nextActor,
      roundNumber: roundNumber + 1
    });
  };

  const correctGuess = () => {
    const actorId = players[currentActor]?.player_id;
    const newScores = { ...scores, [actorId]: (scores[actorId] || 0) + 1 };

    const phrase = drawPhrase();
    if (!phrase) {
      onAction('correct', { scores: newScores });
      endRound();
      return;
    }

    onAction('correct', {
      scores: newScores,
      currentPhrase: phrase,
      usedPhrases: [...usedPhrases, phrase]
    });
  };

  const passCard = () => {
    if (hasUsedPass) return;

    const phrase = drawPhrase();
    if (!phrase) {
      endRound();
      return;
    }

    onAction('pass', {
      currentPhrase: phrase,
      usedPhrases: [...usedPhrases, phrase],
      hasUsedPass: true
    });
  };

  // Bot actor simulation
  useEffect(() => {
    if (!roundActive || !currentActorPlayer?.isBot || isPaused) return;

    if (!currentPhrase && !isRunning) {
      setTimeout(() => {
        startRound();
      }, 1500);
    }
  }, [roundActive, currentActorPlayer, currentPhrase, isRunning, isPaused]);

  // ── Loading state ───────────────────────────────────────────────────────
  if (loadingCards) {
    return (
      <div className="bg-gradient-to-br from-orange-900 to-red-900 rounded-xl p-6 text-center">
        <Loader2 className="w-10 h-10 text-orange-400 animate-spin mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white mb-1">Loading Charades Cards...</h3>
        <p className="text-orange-300 text-sm">Fetching real phrases from the database</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-gradient-to-br from-orange-900 to-red-900 rounded-xl p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <h3 className="text-xl font-bold text-white mb-1">Failed to Load Cards</h3>
        <p className="text-red-300 text-sm mb-3">{loadError}</p>
        <Button onClick={loadCardsFromDB} className="bg-orange-600 hover:bg-orange-700">
          <RotateCcw className="w-4 h-4 mr-2" />Retry
        </Button>
      </div>
    );
  }

  if (winner) {
    const winnerName = players.find(p => p.player_id === winner)?.player_name || 'Unknown';
    return (
      <div className="bg-gradient-to-br from-orange-900 to-red-900 rounded-xl p-6 text-center">
        <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-bounce" />
        <h2 className="text-3xl font-bold text-yellow-400 mb-2">Game Over!</h2>
        <p className="text-xl text-white mb-4">{winnerName} wins!</p>
        <div className="bg-black/30 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-orange-300 mb-2">Final Scores</h3>
          {players.map(p => (
            <div key={p.player_id} className="flex justify-between items-center text-white py-1">
              <span className="flex items-center gap-2">
                {p.isBot && <span>{p.avatar || 'Bot'}</span>}
                {p.player_name}
              </span>
              <span className="font-bold text-amber-400">{scores[p.player_id] || 0} pts</span>
            </div>
          ))}
        </div>
        <Button
          onClick={() => onAction('reset', {
            scores: {},
            usedPhrases: [],
            roundActive: false,
            currentActor: 0,
            currentPhrase: null,
            winner: null,
            hasUsedPass: false,
            roundNumber: 1
          })}
          className="bg-orange-600 hover:bg-orange-500"
        >
          <RotateCcw className="w-4 h-4 mr-2" />Play Again
        </Button>
      </div>
    );
  }

  const remainingCards = allCards.filter(c => !usedPhrases.includes(c.card_name)).length;

  return (
    <div className="bg-gradient-to-br from-orange-900 to-red-900 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white">Slanging Shit</h3>
          <p className="text-orange-300 text-xs">{remainingCards} of {allCards.length} real phrases remaining</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-orange-300 text-sm">Round {roundNumber}</span>
          {onHint && (
            <Button onClick={onHint} variant="outline" size="sm" className="text-orange-300 border-orange-500">
              <Lightbulb className="w-4 h-4 mr-1" />Hint
            </Button>
          )}
        </div>
      </div>

      <p className="text-center text-orange-300 mb-4">Act it out like charades - No talking!</p>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Acting area */}
        <div className="space-y-4">
          <div className="bg-black/30 rounded-lg p-4 text-center">
            <div className="text-6xl mb-2">
              {currentActorPlayer?.isBot ? currentActorPlayer.avatar || 'Bot' : ''}
            </div>
            <p className="text-white font-semibold">
              {currentActorPlayer?.player_name}
              {currentActorPlayer?.isBot && <span className="text-purple-300 ml-1">[Bot]</span>}
            </p>
            <p className="text-orange-300 text-sm">is acting!</p>
          </div>

          {roundActive && isActor && currentPhrase && (
            <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg p-4 text-center">
              <p className="text-yellow-900 text-sm mb-1">Your Phrase:</p>
              <p className="text-xl font-bold text-white">{currentPhrase}</p>
            </div>
          )}

          {roundActive && currentActorPlayer?.isBot && (
            <div className="bg-purple-500/20 rounded-lg p-4 text-center">
              <p className="text-purple-300">
                {currentActorPlayer.player_name} is acting out the phrase...
              </p>
              <p className="text-white text-sm mt-2">Try to guess what it is!</p>
            </div>
          )}

          {roundActive && !isActor && (
            <div className="bg-blue-500/20 rounded-lg p-4 text-center">
              <p className="text-blue-300">Watch and guess!</p>
              {botGuessing && (
                <div className="mt-2 flex items-center justify-center gap-2">
                  {botGuessResult === 'correct' ? (
                    <><ThumbsUp className="w-5 h-5 text-green-400" /><span className="text-green-400">Bot guessed correctly!</span></>
                  ) : botGuessResult === 'wrong' ? (
                    <><ThumbsDown className="w-5 h-5 text-red-400" /><span className="text-red-400">Wrong guess...</span></>
                  ) : (
                    <span className="text-yellow-300 animate-pulse">Bot is guessing...</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Timer and controls */}
        <div className="space-y-4">
          <div className={`bg-black/30 rounded-lg p-4 text-center ${timeLeft <= 10 && isRunning ? 'animate-pulse ring-2 ring-red-500' : ''}`}>
            <Timer className={`w-8 h-8 mx-auto mb-2 ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`} />
            <div className={`text-5xl font-bold mb-2 ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`}>
              {timeLeft}s
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${timeLeft <= 10 ? 'bg-red-500' : 'bg-orange-500'}`}
                style={{ width: `${(timeLeft / 60) * 100}%` }}
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {!roundActive && isActor && (
              <Button onClick={startRound} disabled={isPaused} className="bg-green-600 hover:bg-green-500">
                <Play className="w-4 h-4 mr-2" />Start Round
              </Button>
            )}
            {roundActive && isActor && (
              <>
                <Button onClick={correctGuess} disabled={isPaused} className="bg-green-600 hover:bg-green-500">
                  <Check className="w-4 h-4 mr-2" />Correct!
                </Button>
                <Button onClick={passCard} disabled={hasUsedPass || isPaused} variant="outline">
                  <SkipForward className="w-4 h-4 mr-2" />Pass {hasUsedPass && '(Used)'}
                </Button>
                <Button onClick={endRound} disabled={isPaused} variant="destructive">
                  <X className="w-4 h-4 mr-2" />End
                </Button>
              </>
            )}
            {!roundActive && !isActor && (
              <div className="text-center text-orange-300 py-4">
                Waiting for {currentActorPlayer?.player_name} to start...
              </div>
            )}
          </div>

          <div className="bg-black/30 rounded-lg p-3">
            <h4 className="text-white font-bold mb-2">Scores (First to {winScore})</h4>
            <div className="space-y-1">
              {players.map((p, i) => (
                <div
                  key={p.player_id}
                  className={`flex justify-between items-center py-1 px-2 rounded ${
                    i === currentActor ? 'bg-orange-600/30' : ''
                  }`}
                >
                  <span className={`flex items-center gap-2 ${i === currentActor ? 'text-yellow-400' : 'text-white'}`}>
                    {p.isBot && <span>{p.avatar || 'Bot'}</span>}
                    {p.player_name}
                    {i === currentActor && ' (Acting)'}
                  </span>
                  <span className="font-bold text-amber-400">{scores[p.player_id] || 0} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 bg-black/20 rounded-lg p-3">
        <h4 className="text-orange-300 font-semibold mb-1">How to Play:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>The actor sees a real "shit" phrase and acts it out without talking</li>
          <li>Other players try to guess what the phrase is</li>
          <li>Correct guesses earn the actor 1 point</li>
          <li>You can pass once per round if the phrase is too hard</li>
          <li>First to {winScore} points wins!</li>
        </ul>
      </div>
    </div>
  );
}
