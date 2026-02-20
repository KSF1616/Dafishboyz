import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Target, Trophy, RotateCcw, Lightbulb, Users, Heart, Sparkles } from 'lucide-react';

interface Props {
  gameData: Record<string, any>;
  isMyTurn: boolean;
  onAction: (action: string, data?: any) => void;
  players: { player_id: string; player_name: string; isBot?: boolean; avatar?: string }[];
  currentPlayerId: string;
  isPaused?: boolean;
  onHint?: () => void;
}

// Poop Ball SVG Component
const PoopBall = ({ className = "", animate = false }: { className?: string; animate?: boolean }) => (
  <svg viewBox="0 0 40 40" className={`${className} ${animate ? 'animate-bounce' : ''}`}>
    <defs>
      <radialGradient id="poopGradient" cx="30%" cy="30%">
        <stop offset="0%" stopColor="#8B6914" />
        <stop offset="100%" stopColor="#5D4E37" />
      </radialGradient>
    </defs>
    <ellipse cx="20" cy="32" rx="12" ry="6" fill="#4A3728" />
    <ellipse cx="20" cy="26" rx="10" ry="5" fill="#5D4E37" />
    <ellipse cx="20" cy="20" rx="8" ry="5" fill="#6B5B45" />
    <ellipse cx="20" cy="14" rx="6" ry="4" fill="#7B6B55" />
    <ellipse cx="20" cy="9" rx="4" ry="3" fill="#8B7B65" />
    <circle cx="16" cy="18" r="2" fill="#333" />
    <circle cx="24" cy="18" r="2" fill="#333" />
    <path d="M17 24 Q20 27 23 24" stroke="#333" strokeWidth="1.5" fill="none" />
  </svg>
);

// Toilet Hoop Component
const ToiletHoop = ({ highlight = false }: { highlight?: boolean }) => (
  <div className={`relative transition-all duration-300 ${highlight ? 'scale-110' : ''}`}>
    <svg viewBox="0 0 120 100" className="w-40 h-32">
      <rect x="30" y="0" width="60" height="25" rx="5" fill="#E8E8E8" stroke="#CCC" strokeWidth="2" />
      <rect x="50" y="5" width="20" height="5" rx="2" fill="#CCC" />
      <ellipse cx="60" cy="65" rx="45" ry="30" fill="#F5F5F5" stroke="#DDD" strokeWidth="3" />
      <ellipse cx="60" cy="60" rx="38" ry="25" fill="none" stroke={highlight ? "#FFD700" : "#E0E0E0"} strokeWidth="8" />
      <ellipse cx="60" cy="60" rx="30" ry="18" fill="#87CEEB" opacity="0.5" />
      <ellipse cx="60" cy="60" rx="30" ry="18" fill="none" stroke="#6BB3D9" strokeWidth="2" strokeDasharray="5,3" />
      {highlight && (
        <ellipse cx="60" cy="60" rx="35" ry="22" fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.6" className="animate-pulse" />
      )}
    </svg>
  </div>
);

const SHOOTING_POSITIONS = [
  { id: 1, name: 'Close', distance: 1, x: 50, y: 80 },
  { id: 2, name: 'Free Throw', distance: 2, x: 30, y: 65 },
  { id: 3, name: 'Mid Left', distance: 3, x: 15, y: 50 },
  { id: 4, name: 'Mid Right', distance: 3, x: 85, y: 50 },
  { id: 5, name: '3PT Left', distance: 4, x: 10, y: 30 },
  { id: 6, name: '3PT Right', distance: 4, x: 90, y: 30 },
  { id: 7, name: 'Half Court', distance: 5, x: 50, y: 15 },
];

const LETGO_LETTERS = ['L', 'E', 'T', 'G', 'O'];

export default function PracticeLetgoBoard({
  gameData,
  isMyTurn,
  onAction,
  players,
  currentPlayerId,
  isPaused,
  onHint
}: Props) {
  const phase = gameData.phase || 'playing';
  const currentShooter = gameData.currentShooter || 0;
  const playerLetters = gameData.playerLetters || {};
  const lastShot = gameData.lastShot || null;
  const winner = gameData.winner || null;
  const eliminatedPlayers = gameData.eliminatedPlayers || [];
  const shotsMade = gameData.shotsMade || {};
  const totalShots = gameData.totalShots || {};

  const [isAnimating, setIsAnimating] = useState(false);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 80 });
  const [showResult, setShowResult] = useState<'made' | 'missed' | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);

  const isCurrentShooter = players[currentShooter]?.player_id === currentPlayerId;
  const myLetters = playerLetters[currentPlayerId] || [];
  const amEliminated = eliminatedPlayers.includes(currentPlayerId);

  // Initialize game
  useEffect(() => {
    if (Object.keys(playerLetters).length === 0 && players.length > 0) {
      const initLetters: Record<string, string[]> = {};
      const initShotsMade: Record<string, number> = {};
      const initTotalShots: Record<string, number> = {};
      players.forEach(p => {
        initLetters[p.player_id] = [];
        initShotsMade[p.player_id] = 0;
        initTotalShots[p.player_id] = 0;
      });
      onAction('init', { 
        playerLetters: initLetters, 
        shotsMade: initShotsMade,
        totalShots: initTotalShots,
        currentShooter: 0,
        eliminatedPlayers: [],
        phase: 'playing'
      });
    }
  }, [players.length]);

  const calculateShotSuccess = (distance: number): boolean => {
    const baseChance = 0.85 - (distance * 0.12);
    return Math.random() < baseChance;
  };

  const selectPosition = (positionId: number) => {
    if (!isCurrentShooter || isPaused || isAnimating || amEliminated) return;
    setSelectedPosition(positionId);
  };

  const takeShot = async () => {
    if (isPaused || isAnimating || !selectedPosition) return;

    setIsAnimating(true);

    const position = SHOOTING_POSITIONS.find(p => p.id === selectedPosition);
    if (!position) {
      setIsAnimating(false);
      return;
    }

    // Animate ball to position
    setBallPosition({ x: position.x, y: position.y });
    await new Promise(resolve => setTimeout(resolve, 400));

    // Animate toward hoop
    setBallPosition({ x: 50, y: 35 });
    await new Promise(resolve => setTimeout(resolve, 500));

    const made = calculateShotSuccess(position.distance);
    setShowResult(made ? 'made' : 'missed');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update game state
    handleShotResult(position.id, made);

    setShowResult(null);
    setBallPosition({ x: 50, y: 80 });
    setIsAnimating(false);
    setSelectedPosition(null);
  };

  const handleShotResult = (positionId: number, made: boolean) => {
    const currentPlayer = players[currentShooter];
    const newLastShot = { playerId: currentPlayer.player_id, position: positionId, made };
    let newPlayerLetters = { ...playerLetters };
    let newEliminatedPlayers = [...eliminatedPlayers];
    let newWinner = null;
    const newShotsMade = { ...shotsMade };
    const newTotalShots = { ...totalShots };

    newTotalShots[currentPlayer.player_id] = (newTotalShots[currentPlayer.player_id] || 0) + 1;
    if (made) {
      newShotsMade[currentPlayer.player_id] = (newShotsMade[currentPlayer.player_id] || 0) + 1;
    }

    // If there was a previous made shot to match
    if (lastShot && lastShot.made && lastShot.playerId !== currentPlayer.player_id) {
      if (!made) {
        // Failed to match - earn a letter
        const currentLetters = newPlayerLetters[currentPlayer.player_id] || [];
        if (currentLetters.length < 5) {
          newPlayerLetters[currentPlayer.player_id] = [...currentLetters, LETGO_LETTERS[currentLetters.length]];
        }

        // Check if eliminated
        if (newPlayerLetters[currentPlayer.player_id]?.length >= 5) {
          newEliminatedPlayers.push(currentPlayer.player_id);
        }
      }
    }

    // Check for winner
    const activePlayers = players.filter(p => !newEliminatedPlayers.includes(p.player_id));
    if (activePlayers.length === 1) {
      newWinner = activePlayers[0].player_id;
    }

    // Next shooter
    let nextShooter = (currentShooter + 1) % players.length;
    while (newEliminatedPlayers.includes(players[nextShooter]?.player_id) && !newWinner) {
      nextShooter = (nextShooter + 1) % players.length;
      if (nextShooter === currentShooter) break;
    }

    onAction('shotResult', {
      lastShot: newLastShot,
      playerLetters: newPlayerLetters,
      eliminatedPlayers: newEliminatedPlayers,
      currentShooter: nextShooter,
      winner: newWinner,
      shotsMade: newShotsMade,
      totalShots: newTotalShots,
      phase: newWinner ? 'finished' : 'playing'
    });
  };

  if (winner) {
    const winnerName = players.find(p => p.player_id === winner)?.player_name || 'Unknown';
    return (
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 rounded-xl p-6 text-center">
        <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
        <h2 className="text-3xl font-bold text-yellow-400 mb-2">WINNER!</h2>
        <p className="text-xl text-white mb-4">{winnerName} is the champion!</p>
        <div className="bg-black/30 rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold text-emerald-300 mb-2">Final Standings</h3>
          {players.map(p => (
            <div key={p.player_id} className="flex justify-between items-center text-white py-1">
              <span className="flex items-center gap-2">
                {p.isBot && <span>{p.avatar || '🤖'}</span>}
                {p.player_name}
              </span>
              <span className="font-mono text-amber-400">
                {(playerLetters[p.player_id] || []).join('') || '-----'}
              </span>
            </div>
          ))}
        </div>
        <Button
          onClick={() => onAction('reset', {
            playerLetters: {},
            eliminatedPlayers: [],
            currentShooter: 0,
            lastShot: null,
            winner: null,
            shotsMade: {},
            totalShots: {},
            phase: 'playing'
          })}
          className="bg-emerald-600 hover:bg-emerald-500"
        >
          <RotateCcw className="w-4 h-4 mr-2" />Play Again
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Let That Shit Go!</h2>
        {onHint && (
          <Button onClick={onHint} variant="outline" size="sm" className="text-emerald-300 border-emerald-500">
            <Lightbulb className="w-4 h-4 mr-1" />Hint
          </Button>
        )}
      </div>

      {/* Game status */}
      <div className="bg-black/30 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-emerald-300">
            {isCurrentShooter && !amEliminated ? "Your turn to shoot!" : 
             `${players[currentShooter]?.player_name}'s turn`}
            {players[currentShooter]?.isBot && <span className="text-purple-300 ml-1">[Bot]</span>}
          </span>
          {lastShot && (
            <span className={`text-sm ${lastShot.made ? 'text-green-400' : 'text-red-400'}`}>
              Last shot: {lastShot.made ? 'MADE!' : 'Missed'}
            </span>
          )}
        </div>

        {/* Player letters */}
        <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
          {players.map(p => (
            <div
              key={p.player_id}
              className={`rounded p-2 text-center ${
                eliminatedPlayers.includes(p.player_id) ? 'bg-red-900/50' :
                p.player_id === players[currentShooter]?.player_id ? 'bg-emerald-600/50' : 'bg-black/20'
              }`}
            >
              <p className="text-white text-sm truncate flex items-center justify-center gap-1">
                {p.isBot && <span>{p.avatar || '🤖'}</span>}
                {p.player_name}
              </p>
              <p className="text-xl font-mono font-bold text-amber-400">
                {(playerLetters[p.player_id] || []).join('') || '-----'}
              </p>
              {eliminatedPlayers.includes(p.player_id) && (
                <span className="text-red-400 text-xs">OUT!</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Court and hoop */}
      <div className="relative bg-gradient-to-b from-emerald-800/50 to-emerald-900/50 rounded-xl p-4 min-h-[350px]">
        {/* Toilet hoop at top */}
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-10">
          <ToiletHoop highlight={showResult === 'made'} />
        </div>

        {/* Shot result overlay */}
        {showResult && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className={`text-5xl font-bold animate-bounce ${
              showResult === 'made' ? 'text-green-400' : 'text-red-400'
            }`}>
              {showResult === 'made' ? 'SWISH!' : 'MISS!'}
            </div>
          </div>
        )}

        {/* Shooting positions */}
        {isCurrentShooter && !amEliminated && !isAnimating && (
          <div className="absolute inset-0">
            {SHOOTING_POSITIONS.map(pos => (
              <button
                key={pos.id}
                onClick={() => selectPosition(pos.id)}
                disabled={isPaused}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                  selectedPosition === pos.id
                    ? 'scale-125 z-10'
                    : 'hover:scale-110'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  selectedPosition === pos.id
                    ? 'bg-yellow-500 ring-4 ring-yellow-300'
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}>
                  <Target className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-white text-center mt-1 whitespace-nowrap">{pos.name}</p>
              </button>
            ))}
          </div>
        )}

        {/* Animated poop ball */}
        <div
          className="absolute w-10 h-10 transition-all duration-500 ease-out z-30"
          style={{
            left: `${ballPosition.x}%`,
            top: `${ballPosition.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <PoopBall className="w-full h-full" animate={isAnimating} />
        </div>

        {/* Shoot button */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          {isCurrentShooter && !amEliminated && (
            <Button
              onClick={takeShot}
              disabled={isAnimating || !selectedPosition || isPaused}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-lg px-8 py-5"
            >
              {isAnimating ? 'Shooting...' : selectedPosition ? 'SHOOT!' : 'Select Position'}
            </Button>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 bg-black/30 rounded-lg p-3">
        <h4 className="text-emerald-300 font-semibold mb-2">How to Play:</h4>
        <ul className="text-sm text-gray-300 space-y-1">
          <li>• Select a shooting position and take your shot</li>
          <li>• If you make it, the next player must match your shot</li>
          <li>• Miss a match shot? You earn a letter (L-E-T-G-O)</li>
          <li>• Spell LETGO and you're out! Last player wins!</li>
        </ul>
      </div>
    </div>
  );
}
