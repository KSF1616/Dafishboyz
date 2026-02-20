import React, { useState, useEffect, useCallback, useRef } from 'react';
import MrDoody, { MrDoodyMood } from './MrDoody';
import { Button } from '@/components/ui/button';
import { Trophy, Star, Target, Zap, RefreshCw, Volume2, VolumeX, Award, Flame } from 'lucide-react';

interface MrDoodyMiniGameProps {
  onClose?: () => void;
  onScoreUpdate?: (score: number, mode: 'speed' | 'challenge') => void;
  onStreakUpdate?: (streak: number) => void;
  onBodyPartTap?: (part: string) => void;
  onMoodChange?: (mood: string) => void;
  onDance?: () => void;
}

type BodyPart = 'head' | 'leftEye' | 'rightEye' | 'nose' | 'mouth' | 'belly' | 'leftHand' | 'rightHand' | 'leftFoot' | 'rightFoot';

interface Challenge {
  part: BodyPart;
  label: string;
  points: number;
}

const BODY_PARTS: { part: BodyPart; label: string }[] = [
  { part: 'head', label: 'Head' },
  { part: 'leftEye', label: 'Left Eye' },
  { part: 'rightEye', label: 'Right Eye' },
  { part: 'nose', label: 'Nose' },
  { part: 'mouth', label: 'Mouth' },
  { part: 'belly', label: 'Belly' },
  { part: 'leftHand', label: 'Left Hand' },
  { part: 'rightHand', label: 'Right Hand' },
  { part: 'leftFoot', label: 'Left Foot' },
  { part: 'rightFoot', label: 'Right Foot' },
];

const MrDoodyMiniGame: React.FC<MrDoodyMiniGameProps> = ({ 
  onClose, 
  onScoreUpdate,
  onStreakUpdate,
  onBodyPartTap,
  onMoodChange,
  onDance
}) => {
  const [gameMode, setGameMode] = useState<'free' | 'challenge' | 'speed'>('free');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [speedHighScore, setSpeedHighScore] = useState(0);
  const [challengeHighScore, setChallengeHighScore] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [mood, setMood] = useState<MrDoodyMood>('happy');
  const [isDancing, setIsDancing] = useState(false);
  const [lastTappedPart, setLastTappedPart] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [tapHistory, setTapHistory] = useState<string[]>([]);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [comboMultiplier, setComboMultiplier] = useState(1);
  const [showComboPopup, setShowComboPopup] = useState(false);
  const [lastPoints, setLastPoints] = useState(0);

  const gameModeRef = useRef(gameMode);
  gameModeRef.current = gameMode;

  // Load saved stats
  useEffect(() => {
    const saved = localStorage.getItem('mrDoodyMiniGameHighScore');
    const speedSaved = localStorage.getItem('mrDoodySpeedHighScore');
    const challengeSaved = localStorage.getItem('mrDoodyChallengHighScore');
    const gamesSaved = localStorage.getItem('mrDoodyGamesPlayed');
    const totalSaved = localStorage.getItem('mrDoodyTotalScore');
    const streakSaved = localStorage.getItem('mrDoodyMaxStreak');
    
    if (saved) setHighScore(parseInt(saved));
    if (speedSaved) setSpeedHighScore(parseInt(speedSaved));
    if (challengeSaved) setChallengeHighScore(parseInt(challengeSaved));
    if (gamesSaved) setGamesPlayed(parseInt(gamesSaved));
    if (totalSaved) setTotalScore(parseInt(totalSaved));
    if (streakSaved) setMaxStreak(parseInt(streakSaved));
  }, []);

  // Timer for speed mode
  useEffect(() => {
    if (gameMode === 'speed' && isPlaying && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }
  }, [gameMode, isPlaying, timeLeft]);

  // Update combo multiplier based on streak
  useEffect(() => {
    if (streak >= 20) {
      setComboMultiplier(3);
    } else if (streak >= 10) {
      setComboMultiplier(2);
    } else if (streak >= 5) {
      setComboMultiplier(1.5);
    } else {
      setComboMultiplier(1);
    }
  }, [streak]);

  // Generate new challenge
  const generateChallenge = useCallback(() => {
    const randomPart = BODY_PARTS[Math.floor(Math.random() * BODY_PARTS.length)];
    const points = Math.floor(Math.random() * 3) + 1; // 1-3 points
    setCurrentChallenge({
      part: randomPart.part,
      label: randomPart.label,
      points: points * 10,
    });
  }, []);

  // Start game
  const startGame = (mode: 'challenge' | 'speed') => {
    setGameMode(mode);
    setScore(0);
    setStreak(0);
    setIsPlaying(true);
    setTimeLeft(mode === 'speed' ? 30 : 60);
    setTapHistory([]);
    setComboMultiplier(1);
    generateChallenge();
  };

  // End game
  const endGame = useCallback(() => {
    setIsPlaying(false);
    
    const mode = gameModeRef.current as 'speed' | 'challenge';
    
    // Update games played
    const newGamesPlayed = gamesPlayed + 1;
    setGamesPlayed(newGamesPlayed);
    localStorage.setItem('mrDoodyGamesPlayed', newGamesPlayed.toString());
    
    // Update total score
    const newTotalScore = totalScore + score;
    setTotalScore(newTotalScore);
    localStorage.setItem('mrDoodyTotalScore', newTotalScore.toString());
    
    // Update max streak
    if (streak > maxStreak) {
      setMaxStreak(streak);
      localStorage.setItem('mrDoodyMaxStreak', streak.toString());
      onStreakUpdate?.(streak);
    }
    
    // Update high scores
    let isNewHighScore = false;
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('mrDoodyMiniGameHighScore', score.toString());
      isNewHighScore = true;
    }
    
    if (mode === 'speed' && score > speedHighScore) {
      setSpeedHighScore(score);
      localStorage.setItem('mrDoodySpeedHighScore', score.toString());
    }
    
    if (mode === 'challenge' && score > challengeHighScore) {
      setChallengeHighScore(score);
      localStorage.setItem('mrDoodyChallengHighScore', score.toString());
    }
    
    if (isNewHighScore) {
      setShowCelebration(true);
      setIsDancing(true);
      setTimeout(() => {
        setShowCelebration(false);
        setIsDancing(false);
      }, 3000);
    }
    
    onScoreUpdate?.(score, mode);
  }, [score, highScore, speedHighScore, challengeHighScore, gamesPlayed, totalScore, streak, maxStreak, onScoreUpdate, onStreakUpdate]);

  // Handle body part tap
  const handleBodyPartTap = (part: string) => {
    setLastTappedPart(part);
    setTapHistory(prev => [...prev.slice(-9), part]);
    onBodyPartTap?.(part);

    if (gameMode === 'free') {
      // Free play - just track taps and change mood
      const moods: MrDoodyMood[] = ['happy', 'excited', 'love', 'surprised'];
      const newMood = moods[Math.floor(Math.random() * moods.length)];
      setMood(newMood);
      onMoodChange?.(newMood);
      return;
    }

    if (!isPlaying || !currentChallenge) return;

    if (part === currentChallenge.part) {
      // Correct tap!
      const newStreak = streak + 1;
      setStreak(newStreak);
      
      // Calculate points with combo multiplier
      const basePoints = currentChallenge.points;
      const streakBonus = Math.floor(newStreak / 3) * 5;
      const points = Math.floor((basePoints + streakBonus) * comboMultiplier);
      
      setLastPoints(points);
      setShowComboPopup(true);
      setTimeout(() => setShowComboPopup(false), 500);
      
      setScore(prev => prev + points);
      setMood('excited');
      
      // Dance at milestones
      if (newStreak % 5 === 0) {
        setIsDancing(true);
        onDance?.();
        setTimeout(() => setIsDancing(false), 2000);
      }
      
      // Update max streak in real-time
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
        localStorage.setItem('mrDoodyMaxStreak', newStreak.toString());
        onStreakUpdate?.(newStreak);
      }
      
      generateChallenge();
    } else {
      // Wrong tap
      setStreak(0);
      setComboMultiplier(1);
      setMood('surprised');
      setTimeout(() => setMood('happy'), 500);
    }
  };

  // Handle hug
  const handleHug = () => {
    if (gameMode === 'free') {
      setMood('love');
      onMoodChange?.('love');
      setTimeout(() => setMood('happy'), 2000);
    }
  };

  // Handle mood change in free play
  const handleMoodChange = (newMood: MrDoodyMood) => {
    setMood(newMood);
    onMoodChange?.(newMood);
  };

  // Handle dance toggle
  const handleDanceToggle = () => {
    const newDancing = !isDancing;
    setIsDancing(newDancing);
    if (newDancing) {
      setMood('excited');
      onDance?.();
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-500" />
          Mr. Doody's Tap Game
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowStats(!showStats)}
            className="p-2 rounded-full hover:bg-amber-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Award className={`w-5 h-5 ${showStats ? 'text-amber-500' : 'text-gray-600 dark:text-gray-300'}`} />
          </button>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-full hover:bg-amber-200 dark:hover:bg-gray-700 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <VolumeX className="w-5 h-5 text-gray-400" />
            )}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-amber-200 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="bg-white dark:bg-gray-700 rounded-xl p-4 mb-4 shadow-sm">
          <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            Your Stats
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-2">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Games Played</div>
              <div className="font-bold text-gray-900 dark:text-white">{gamesPlayed}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-2">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Total Score</div>
              <div className="font-bold text-gray-900 dark:text-white">{totalScore.toLocaleString()}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-2">
              <div className="text-gray-500 dark:text-gray-400 text-xs">Best Streak</div>
              <div className="font-bold text-orange-500 flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {maxStreak}
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-600 rounded-lg p-2">
              <div className="text-gray-500 dark:text-gray-400 text-xs">All-Time High</div>
              <div className="font-bold text-purple-500">{highScore}</div>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-2">
              <div className="text-amber-600 dark:text-amber-400 text-xs">Speed Best</div>
              <div className="font-bold text-amber-600">{speedHighScore}</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-2">
              <div className="text-blue-600 dark:text-blue-400 text-xs">Challenge Best</div>
              <div className="font-bold text-blue-600">{challengeHighScore}</div>
            </div>
          </div>
        </div>
      )}

      {/* Score Display */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-white dark:bg-gray-700 rounded-xl p-3 text-center shadow-sm relative overflow-hidden">
          <div className="text-xs text-gray-500 dark:text-gray-400">Score</div>
          <div className="text-2xl font-bold text-amber-600">{score}</div>
          {showComboPopup && (
            <div className="absolute inset-0 flex items-center justify-center bg-amber-500/20 animate-ping">
              <span className="text-amber-600 font-bold">+{lastPoints}</span>
            </div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-xl p-3 text-center shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
          <div className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
            {streak}
            {streak >= 5 && <Flame className="w-4 h-4 animate-pulse" />}
          </div>
          {comboMultiplier > 1 && (
            <div className="text-xs text-orange-400 font-medium">x{comboMultiplier} combo!</div>
          )}
        </div>
        <div className="bg-white dark:bg-gray-700 rounded-xl p-3 text-center shadow-sm">
          <div className="text-xs text-gray-500 dark:text-gray-400">High Score</div>
          <div className="text-2xl font-bold text-purple-500 flex items-center justify-center gap-1">
            <Trophy className="w-4 h-4" />
            {highScore}
          </div>
        </div>
      </div>

      {/* Timer for speed mode */}
      {gameMode === 'speed' && isPlaying && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
            <span>Time Left</span>
            <span className={timeLeft <= 10 ? 'text-red-500 font-bold animate-pulse' : ''}>{timeLeft}s</span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-red-500' : 'bg-amber-500'}`}
              style={{ width: `${(timeLeft / 30) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Challenge Display */}
      {isPlaying && currentChallenge && (
        <div className="bg-gradient-to-r from-amber-400 to-yellow-400 rounded-xl p-4 mb-4 text-center shadow-lg relative overflow-hidden">
          <div className="text-sm text-amber-900 mb-1">Tap the...</div>
          <div className="text-2xl font-bold text-white drop-shadow-md">
            {currentChallenge.label}
          </div>
          <div className="text-sm text-amber-100 mt-1">
            +{Math.floor(currentChallenge.points * comboMultiplier)} points
            {comboMultiplier > 1 && (
              <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                x{comboMultiplier} combo!
              </span>
            )}
          </div>
          {streak >= 5 && (
            <div className="absolute top-2 right-2">
              <Flame className="w-6 h-6 text-orange-600 animate-bounce" />
            </div>
          )}
        </div>
      )}

      {/* Mr. Doody */}
      <div className="flex justify-center mb-4 relative">
        {showCelebration && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="text-4xl animate-bounce">🎉</div>
            <div className="absolute text-2xl animate-ping" style={{ top: '10%', left: '20%' }}>⭐</div>
            <div className="absolute text-2xl animate-ping" style={{ top: '15%', right: '20%', animationDelay: '0.2s' }}>⭐</div>
            <div className="absolute text-xl animate-ping" style={{ bottom: '20%', left: '15%', animationDelay: '0.4s' }}>✨</div>
            <div className="absolute text-xl animate-ping" style={{ bottom: '25%', right: '15%', animationDelay: '0.3s' }}>✨</div>
          </div>
        )}
        <MrDoody
          size="xl"
          animated={true}
          interactive={true}
          mood={mood}
          isDancing={isDancing}
          onBodyPartTap={handleBodyPartTap}
          onHug={handleHug}
          enableSounds={soundEnabled}
          showInteractionHints={gameMode === 'free'}
        />
      </div>

      {/* Last tapped indicator */}
      {lastTappedPart && (
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          Last tapped: <span className="font-medium text-amber-600">{lastTappedPart}</span>
        </div>
      )}

      {/* Game Mode Selection / Controls */}
      {!isPlaying ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => startGame('challenge')}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
            >
              <Target className="w-4 h-4 mr-2" />
              Challenge Mode
            </Button>
            <Button
              onClick={() => startGame('speed')}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              <Zap className="w-4 h-4 mr-2" />
              Speed Mode
            </Button>
          </div>
          <Button
            onClick={() => setGameMode('free')}
            variant="outline"
            className="w-full border-amber-400 text-amber-600 hover:bg-amber-50"
          >
            <Star className="w-4 h-4 mr-2" />
            Free Play
          </Button>
          
          {/* Mood selector in free play */}
          {gameMode === 'free' && (
            <div className="bg-white dark:bg-gray-700 rounded-xl p-4 mt-4">
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">Change Mood:</div>
              <div className="flex justify-center gap-2 flex-wrap">
                {(['happy', 'sleepy', 'excited', 'surprised', 'love'] as MrDoodyMood[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => handleMoodChange(m)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      mood === m 
                        ? 'bg-amber-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-amber-100'
                    }`}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex justify-center mt-3">
                <button
                  onClick={handleDanceToggle}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    isDancing 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white animate-pulse' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-pink-100'
                  }`}
                >
                  {isDancing ? '🎵 Dancing! 🎵' : '💃 Make Him Dance'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Button
          onClick={endGame}
          variant="outline"
          className="w-full border-red-400 text-red-600 hover:bg-red-50"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          End Game
        </Button>
      )}

      {/* Tap History */}
      {tapHistory.length > 0 && (
        <div className="mt-4 bg-white dark:bg-gray-700 rounded-xl p-3">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Recent Taps:</div>
          <div className="flex flex-wrap gap-1">
            {tapHistory.map((part, i) => (
              <span 
                key={i} 
                className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded text-xs"
              >
                {part}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
        <p><strong>Challenge Mode:</strong> Tap the correct body part to score points!</p>
        <p><strong>Speed Mode:</strong> Score as many points as you can in 30 seconds!</p>
        <p><strong>Free Play:</strong> Explore and interact with Mr. Doody!</p>
        <p className="text-amber-600 dark:text-amber-400">
          <Flame className="w-3 h-3 inline" /> Build streaks for combo multipliers!
        </p>
      </div>
    </div>
  );
};

export default MrDoodyMiniGame;
