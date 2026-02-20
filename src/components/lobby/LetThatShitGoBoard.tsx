import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, Target, Users, User, RotateCcw, Trophy, X, Check, Heart, Save } from 'lucide-react';
import { useAudio } from '@/contexts/AudioContext';
import { useAuth } from '@/contexts/AuthContext';
import { useLetgoStats, LetgoGameData } from '@/hooks/useLetgoStats';

interface Props {
  gameData: Record<string, any>;
  isMyTurn: boolean;
  onAction: (action: string, data?: any) => void;
  players: { player_id: string; player_name: string }[];
  currentPlayerId: string;
  isSpectator?: boolean;
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

// Toilet Seat Hoop Component
const ToiletHoop = ({ highlight = false }: { highlight?: boolean }) => (
  <div className={`relative transition-all duration-300 ${highlight ? 'scale-110' : ''}`}>
    <svg viewBox="0 0 120 100" className="w-48 h-40">
      {/* Toilet tank */}
      <rect x="30" y="0" width="60" height="25" rx="5" fill="#E8E8E8" stroke="#CCC" strokeWidth="2" />
      <rect x="50" y="5" width="20" height="5" rx="2" fill="#CCC" />
      
      {/* Toilet bowl outer */}
      <ellipse cx="60" cy="65" rx="45" ry="30" fill="#F5F5F5" stroke="#DDD" strokeWidth="3" />
      
      {/* Toilet seat */}
      <ellipse cx="60" cy="60" rx="38" ry="25" fill="none" stroke={highlight ? "#FFD700" : "#E0E0E0"} strokeWidth="8" />
      
      {/* Inner bowl (the hoop opening) */}
      <ellipse cx="60" cy="60" rx="30" ry="18" fill="#87CEEB" opacity="0.5" />
      <ellipse cx="60" cy="60" rx="30" ry="18" fill="none" stroke="#6BB3D9" strokeWidth="2" strokeDasharray="5,3" />
      
      {/* Highlight glow */}
      {highlight && (
        <ellipse cx="60" cy="60" rx="35" ry="22" fill="none" stroke="#FFD700" strokeWidth="2" opacity="0.6" className="animate-pulse" />
      )}
    </svg>
  </div>
);

// Shooting positions for LETGO game
const SHOOTING_POSITIONS = [
  { id: 1, name: 'Close Range', distance: 1, x: 50, y: 85 },
  { id: 2, name: 'Free Throw', distance: 2, x: 30, y: 70 },
  { id: 3, name: 'Mid Range Left', distance: 3, x: 15, y: 50 },
  { id: 4, name: 'Mid Range Right', distance: 3, x: 85, y: 50 },
  { id: 5, name: 'Three Point Left', distance: 4, x: 5, y: 30 },
  { id: 6, name: 'Three Point Right', distance: 4, x: 95, y: 30 },
  { id: 7, name: 'Half Court', distance: 5, x: 50, y: 10 },
];

const LETGO_LETTERS = ['L', 'E', 'T', 'G', 'O'];

export default function LetThatShitGoBoard({ gameData, isMyTurn, onAction, players, currentPlayerId, isSpectator }: Props) {
  const { playWinSound, playDiceRoll, playVictory } = useAudio();
  const { user } = useAuth();
  const { saveGame } = useLetgoStats(user?.id);
  
  // Game state
  const gameMode = gameData.gameMode || null; // 'multiplayer' | 'emotional'
  const phase = gameData.phase || 'setup'; // 'setup' | 'playing' | 'shooting' | 'finished'
  const currentShooter = gameData.currentShooter || 0;
  const selectedPosition = gameData.selectedPosition || null;
  const playerLetters = gameData.playerLetters || {}; // { playerId: ['L', 'E'] }
  const lastShot = gameData.lastShot || null; // { playerId, position, made }
  const winner = gameData.winner || null;
  const eliminatedPlayers = gameData.eliminatedPlayers || [];
  
  // Emotional release mode state
  const emotionalItems = gameData.emotionalItems || {}; // { playerId: ['item1', 'item2', 'item3'] }
  const shotsMade = gameData.shotsMade || {}; // { playerId: number }
  const totalShots = gameData.totalShots || {}; // { playerId: number }
  
  // Local state
  const [isAnimating, setIsAnimating] = useState(false);
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 85 });
  const [showResult, setShowResult] = useState<'made' | 'missed' | null>(null);
  const [emotionalInput, setEmotionalInput] = useState(['', '', '']);
  const [localSelectedPosition, setLocalSelectedPosition] = useState<number | null>(null);
  const [statsSaved, setStatsSaved] = useState(false);
  const [savingStats, setSavingStats] = useState(false);
  
  // Track shots for current game session
  const [sessionShots, setSessionShots] = useState({ taken: 0, made: 0 });
  
  const isCurrentShooter = players[currentShooter]?.player_id === currentPlayerId;
  const myLetters = playerLetters[currentPlayerId] || [];
  const amEliminated = eliminatedPlayers.includes(currentPlayerId);
  
  // Calculate shot success probability based on distance
  const calculateShotSuccess = (distance: number): boolean => {
    const baseChance = 0.8 - (distance * 0.12); // 80% at close range, decreasing with distance
    return Math.random() < baseChance;
  };
  
  // Save game stats when game finishes
  const saveGameStats = async () => {
    if (!user?.id || statsSaved || isSpectator) return;
    
    setSavingStats(true);
    
    const isWinner = winner === currentPlayerId;
    const myMadeShots = shotsMade[currentPlayerId] || sessionShots.made;
    const myTotalShots = totalShots[currentPlayerId] || sessionShots.taken;
    const myItems = emotionalItems[currentPlayerId] || [];
    const myLettersEarned = playerLetters[currentPlayerId] || [];
    
    const gameStats: LetgoGameData = {
      gameMode: gameMode as 'multiplayer' | 'emotional',
      shotsTaken: myTotalShots,
      shotsMade: myMadeShots,
      gameResult: gameMode === 'multiplayer' 
        ? (isWinner ? 'win' : 'loss') 
        : 'completed',
      emotionalItems: myItems,
      lettersEarned: myLettersEarned
    };
    
    const success = await saveGame(gameStats);
    if (success) {
      setStatsSaved(true);
      
      // Update localStorage for collectible character unlocks
      const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0') + 1;
      localStorage.setItem('gamesPlayed', gamesPlayed.toString());
      
      if (gameMode === 'multiplayer') {
        if (isWinner) {
          const gamesWon = parseInt(localStorage.getItem('gamesWon') || '0') + 1;
          localStorage.setItem('gamesWon', gamesWon.toString());
          
          const letgoWins = parseInt(localStorage.getItem('letgoWins') || '0') + 1;
          localStorage.setItem('letgoWins', letgoWins.toString());
        }
      } else if (gameMode === 'emotional') {
        const emotionalReleaseCount = parseInt(localStorage.getItem('emotionalReleaseCount') || '0') + 1;
        localStorage.setItem('emotionalReleaseCount', emotionalReleaseCount.toString());
      }
      
      // Update overall accuracy
      const totalShotsTaken = parseInt(localStorage.getItem('totalShotsTaken') || '0') + myTotalShots;
      const totalShotsMade = parseInt(localStorage.getItem('totalShotsMade') || '0') + myMadeShots;
      localStorage.setItem('totalShotsTaken', totalShotsTaken.toString());
      localStorage.setItem('totalShotsMade', totalShotsMade.toString());
      
      if (totalShotsTaken >= 50) {
        const overallAccuracy = Math.round((totalShotsMade / totalShotsTaken) * 100);
        localStorage.setItem('overallAccuracy', overallAccuracy.toString());
      }
    }
    setSavingStats(false);
  };

  // Handle game mode selection
  const selectGameMode = (mode: 'multiplayer' | 'emotional') => {
    if (isSpectator) return;
    setStatsSaved(false);
    setSessionShots({ taken: 0, made: 0 });
    onAction('setMode', { 
      gameMode: mode, 
      phase: mode === 'emotional' ? 'emotional_setup' : 'playing',
      playerLetters: {},
      emotionalItems: {},
      shotsMade: {},
      totalShots: {},
      eliminatedPlayers: [],
      currentShooter: 0
    });
  };
  
  // Handle emotional items submission
  const submitEmotionalItems = () => {
    if (emotionalInput.some(item => !item.trim())) return;
    const newEmotionalItems = { ...emotionalItems, [currentPlayerId]: emotionalInput };
    const newShotsMade = { ...shotsMade, [currentPlayerId]: 0 };
    const newTotalShots = { ...totalShots, [currentPlayerId]: 0 };
    onAction('submitEmotional', { 
      emotionalItems: newEmotionalItems,
      shotsMade: newShotsMade,
      totalShots: newTotalShots,
      phase: 'playing'
    });
  };
  
  // Handle position selection (multiplayer mode)
  const selectPosition = (positionId: number) => {
    if (!isCurrentShooter || isSpectator || isAnimating) return;
    setLocalSelectedPosition(positionId);
  };
  
  // Handle shooting
  const takeShot = async () => {
    if (isSpectator || isAnimating) return;
    
    setIsAnimating(true);
    playDiceRoll();
    
    const position = gameMode === 'multiplayer' 
      ? SHOOTING_POSITIONS.find(p => p.id === localSelectedPosition)
      : SHOOTING_POSITIONS[Math.floor(Math.random() * SHOOTING_POSITIONS.length)];
    
    if (!position) {
      setIsAnimating(false);
      return;
    }
    
    // Animate ball
    setBallPosition({ x: position.x, y: position.y });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Move ball toward hoop
    setBallPosition({ x: 50, y: 40 });
    
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const made = calculateShotSuccess(position.distance);
    setShowResult(made ? 'made' : 'missed');
    
    // Track session shots
    setSessionShots(prev => ({
      taken: prev.taken + 1,
      made: prev.made + (made ? 1 : 0)
    }));
    
    if (made) {
      playWinSound();
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update game state based on mode
    if (gameMode === 'multiplayer') {
      handleMultiplayerShot(position.id, made);
    } else {
      handleEmotionalShot(made);
    }
    
    setShowResult(null);
    setBallPosition({ x: 50, y: 85 });
    setIsAnimating(false);
    setLocalSelectedPosition(null);
  };
  
  // Handle multiplayer LETGO shot
  const handleMultiplayerShot = (positionId: number, made: boolean) => {
    const newLastShot = { playerId: currentPlayerId, position: positionId, made };
    let newPlayerLetters = { ...playerLetters };
    let newEliminatedPlayers = [...eliminatedPlayers];
    let newWinner = null;
    
    // If there was a previous shot to match
    if (lastShot && lastShot.made && lastShot.playerId !== currentPlayerId) {
      // Current player needed to match the shot
      if (!made) {
        // Failed to match - earn a letter
        const currentLetters = newPlayerLetters[currentPlayerId] || [];
        if (currentLetters.length < 5) {
          newPlayerLetters[currentPlayerId] = [...currentLetters, LETGO_LETTERS[currentLetters.length]];
        }
        
        // Check if player is eliminated (spelled LETGO)
        if (newPlayerLetters[currentPlayerId]?.length >= 5) {
          newEliminatedPlayers.push(currentPlayerId);
        }
      }
    }
    
    // Check for winner (last player standing)
    const activePlayers = players.filter(p => !newEliminatedPlayers.includes(p.player_id));
    if (activePlayers.length === 1) {
      newWinner = activePlayers[0].player_id;
      playVictory();
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
      selectedPosition: null,
      winner: newWinner,
      phase: newWinner ? 'finished' : 'playing'
    });
  };
  
  // Handle emotional release shot
  const handleEmotionalShot = (made: boolean) => {
    const newShotsMade = { ...shotsMade };
    const newTotalShots = { ...totalShots };
    
    newTotalShots[currentPlayerId] = (newTotalShots[currentPlayerId] || 0) + 1;
    if (made) {
      newShotsMade[currentPlayerId] = (newShotsMade[currentPlayerId] || 0) + 1;
    }
    
    const isComplete = newTotalShots[currentPlayerId] >= 12;
    
    onAction('emotionalShot', {
      shotsMade: newShotsMade,
      totalShots: newTotalShots,
      phase: isComplete ? 'finished' : 'playing'
    });
    
    if (isComplete) {
      playVictory();
    }
  };
  
  // Reset game
  const resetGame = () => {
    setStatsSaved(false);
    setSessionShots({ taken: 0, made: 0 });
    onAction('reset', {
      gameMode: null,
      phase: 'setup',
      playerLetters: {},
      emotionalItems: {},
      shotsMade: {},
      totalShots: {},
      eliminatedPlayers: [],
      currentShooter: 0,
      lastShot: null,
      winner: null,
      selectedPosition: null
    });
    setEmotionalInput(['', '', '']);
  };
  
  // Winner screen
  if (winner || phase === 'finished') {
    const winnerName = players.find(p => p.player_id === winner)?.player_name || 'You';
    const myMadeShots = shotsMade[currentPlayerId] || 0;
    const myTotalShots = totalShots[currentPlayerId] || 12;
    const myItems = emotionalItems[currentPlayerId] || [];
    
    return (
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 rounded-xl p-6 text-center">
        <Sparkles className="w-16 h-16 text-yellow-400 mx-auto mb-4 animate-pulse" />
        {gameMode === 'multiplayer' ? (
          <>
            <h2 className="text-3xl font-bold text-yellow-400 mb-2">WINNER!</h2>
            <p className="text-xl text-white mb-4">{winnerName} is the champion!</p>
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-emerald-300 mb-2">Final Standings</h3>
              {players.map(p => (
                <div key={p.player_id} className="flex justify-between items-center text-white py-1">
                  <span>{p.player_name}</span>
                  <span className="font-mono text-amber-400">
                    {(playerLetters[p.player_id] || []).join('') || '---'}
                  </span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold text-emerald-400 mb-2">Emotional Release Complete!</h2>
            <p className="text-xl text-white mb-4">You made {myMadeShots} of {myTotalShots} shots</p>
            <div className="bg-black/30 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-emerald-300 mb-2 flex items-center justify-center gap-2">
                <Heart className="w-5 h-5 text-pink-400" />
                You Released:
              </h3>
              {myItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-white py-1 justify-center">
                  <Check className="w-4 h-4 text-green-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p className="text-emerald-300 text-sm italic">
              {myMadeShots >= 10 ? "Amazing! You've truly let it all go!" :
               myMadeShots >= 7 ? "Great job releasing that emotional weight!" :
               myMadeShots >= 4 ? "You're on your way to emotional freedom!" :
               "Every shot counts. Keep working on letting go!"}
            </p>
          </>
        )}
        
        {/* Save Stats Button */}
        {!isSpectator && user && (
          <div className="mt-4 mb-2">
            {statsSaved ? (
              <div className="flex items-center justify-center gap-2 text-green-400">
                <Check className="w-5 h-5" />
                <span>Stats saved to your profile!</span>
              </div>
            ) : (
              <Button
                onClick={saveGameStats}
                disabled={savingStats}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500"
              >
                {savingStats ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Stats to Profile
                  </>
                )}
              </Button>
            )}
          </div>
        )}
        
        {!isSpectator && (
          <Button onClick={resetGame} className="mt-2 bg-gradient-to-r from-emerald-600 to-teal-600">
            <RotateCcw className="w-4 h-4 mr-2" />Play Again
          </Button>
        )}
      </div>
    );
  }
  
  // Game mode selection
  if (!gameMode || phase === 'setup') {
    return (
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 rounded-xl p-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Let That Shit Go!</h2>
          <p className="text-emerald-300">Choose your game mode</p>
        </div>
        
        <div className="flex justify-center mb-6">
          <ToiletHoop />
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => selectGameMode('multiplayer')}
            disabled={isSpectator}
            className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl p-6 text-left transition-all hover:scale-105 disabled:opacity-50"
          >
            <Users className="w-10 h-10 text-white mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Multiplayer LETGO</h3>
            <p className="text-purple-200 text-sm">
              Like HORSE! Players take turns shooting. Match the shot or earn a letter. 
              Spell LETGO and you're out. Last one standing wins!
            </p>
          </button>
          
          <button
            onClick={() => selectGameMode('emotional')}
            disabled={isSpectator}
            className="bg-gradient-to-br from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 rounded-xl p-6 text-left transition-all hover:scale-105 disabled:opacity-50"
          >
            <Heart className="w-10 h-10 text-white mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">Emotional Release</h3>
            <p className="text-emerald-200 text-sm">
              Type 3 things you want to release emotionally. Shoot 12 balls and achieve 
              emotional freedom with every shot made!
            </p>
          </button>
        </div>
      </div>
    );
  }
  
  // Emotional items input
  if (gameMode === 'emotional' && phase === 'emotional_setup' && !emotionalItems[currentPlayerId]) {
    return (
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 rounded-xl p-6">
        <div className="text-center mb-6">
          <Heart className="w-12 h-12 text-pink-400 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-white mb-2">What Do You Want to Release?</h2>
          <p className="text-emerald-300">Enter 3 things you want to let go of emotionally</p>
        </div>
        
        <div className="max-w-md mx-auto space-y-4">
          {[0, 1, 2].map(idx => (
            <div key={idx} className="flex items-center gap-3">
              <span className="text-2xl font-bold text-emerald-400">{idx + 1}.</span>
              <Input
                value={emotionalInput[idx]}
                onChange={(e) => {
                  const newInput = [...emotionalInput];
                  newInput[idx] = e.target.value;
                  setEmotionalInput(newInput);
                }}
                placeholder={`Thing ${idx + 1} to release...`}
                className="bg-emerald-800/50 border-emerald-600 text-white placeholder:text-emerald-400/50"
              />
            </div>
          ))}
          
          <Button
            onClick={submitEmotionalItems}
            disabled={emotionalInput.some(item => !item.trim())}
            className="w-full mt-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500"
          >
            <Heart className="w-4 h-4 mr-2" />
            Start Releasing
          </Button>
        </div>
      </div>
    );
  }
  
  // Main game view
  return (
    <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-cyan-900 rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Let That Shit Go!</h2>
        <span className="text-emerald-300 text-sm">
          {gameMode === 'multiplayer' ? 'LETGO Mode' : 'Emotional Release'}
        </span>
      </div>
      
      {/* Game status */}
      {gameMode === 'multiplayer' && (
        <div className="bg-black/30 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-emerald-300">
              {isCurrentShooter && !amEliminated ? "Your turn to shoot!" : 
               `${players[currentShooter]?.player_name}'s turn`}
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
                <p className="text-white text-sm truncate">{p.player_name}</p>
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
      )}
      
      {gameMode === 'emotional' && (
        <div className="bg-black/30 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-emerald-300">Shots: {totalShots[currentPlayerId] || 0} / 12</span>
            <span className="text-green-400">Made: {shotsMade[currentPlayerId] || 0}</span>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: 12 }).map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 flex-1 rounded ${
                  idx < (totalShots[currentPlayerId] || 0) 
                    ? idx < (shotsMade[currentPlayerId] || 0) ? 'bg-green-500' : 'bg-red-500'
                    : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          <div className="mt-3 text-center">
            <p className="text-emerald-300 text-sm">Releasing:</p>
            <p className="text-white italic">
              {(emotionalItems[currentPlayerId] || []).join(' • ')}
            </p>
          </div>
        </div>
      )}
      
      {/* Court and hoop */}
      <div className="relative bg-gradient-to-b from-emerald-800/50 to-emerald-900/50 rounded-xl p-4 min-h-[400px]">
        {/* Toilet hoop at top */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <ToiletHoop highlight={showResult === 'made'} />
        </div>
        
        {/* Shot result overlay */}
        {showResult && (
          <div className={`absolute inset-0 flex items-center justify-center z-20 pointer-events-none`}>
            <div className={`text-6xl font-bold animate-bounce ${
              showResult === 'made' ? 'text-green-400' : 'text-red-400'
            }`}>
              {showResult === 'made' ? 'SWISH!' : 'MISS!'}
            </div>
          </div>
        )}
        
        {/* Shooting positions (multiplayer mode) */}
        {gameMode === 'multiplayer' && isCurrentShooter && !amEliminated && !isAnimating && (
          <div className="absolute inset-0">
            {SHOOTING_POSITIONS.map(pos => (
              <button
                key={pos.id}
                onClick={() => selectPosition(pos.id)}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all ${
                  localSelectedPosition === pos.id 
                    ? 'scale-125 z-10' 
                    : 'hover:scale-110'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  localSelectedPosition === pos.id 
                    ? 'bg-yellow-500 ring-4 ring-yellow-300' 
                    : 'bg-emerald-600 hover:bg-emerald-500'
                }`}>
                  <Target className="w-6 h-6 text-white" />
                </div>
                <p className="text-xs text-white text-center mt-1 whitespace-nowrap">{pos.name}</p>
              </button>
            ))}
          </div>
        )}
        
        {/* Animated poop ball */}
        <div 
          className="absolute w-12 h-12 transition-all duration-500 ease-out z-30"
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
          {gameMode === 'multiplayer' ? (
            isCurrentShooter && !amEliminated && !isSpectator && (
              <Button
                onClick={takeShot}
                disabled={isAnimating || !localSelectedPosition}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-lg px-8 py-6"
              >
                {isAnimating ? 'Shooting...' : localSelectedPosition ? 'SHOOT!' : 'Select Position'}
              </Button>
            )
          ) : (
            !isSpectator && (totalShots[currentPlayerId] || 0) < 12 && (
              <Button
                onClick={takeShot}
                disabled={isAnimating}
                className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-lg px-8 py-6"
              >
                {isAnimating ? 'Releasing...' : 'LET IT GO!'}
              </Button>
            )
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-4 bg-black/30 rounded-lg p-3">
        <h4 className="text-emerald-300 font-semibold mb-2">How to Play:</h4>
        {gameMode === 'multiplayer' ? (
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• Select a shooting position and take your shot</li>
            <li>• If you make it, the next player must match your shot</li>
            <li>• Miss a match shot? You earn a letter (L-E-T-G-O)</li>
            <li>• Spell LETGO and you're out! Last player wins!</li>
          </ul>
        ) : (
          <ul className="text-sm text-gray-300 space-y-1">
            <li>• You have 12 shots to release your emotional baggage</li>
            <li>• Each made shot represents letting go of negativity</li>
            <li>• Focus on what you want to release with each shot</li>
            <li>• The more you make, the more you let go!</li>
          </ul>
        )}
      </div>
    </div>
  );
}
