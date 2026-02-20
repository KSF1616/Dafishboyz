import React from 'react';
import { LetgoStats } from '@/hooks/useLetgoStats';
import { Target, Trophy, Heart, TrendingUp, TrendingDown, Minus, Gamepad2, Zap } from 'lucide-react';

interface Props {
  stats: LetgoStats;
}

const LetgoStatsDisplay: React.FC<Props> = ({ stats }) => {
  const getTrendIcon = () => {
    if (stats.improvementTrend > 2) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (stats.improvementTrend < -2) return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-yellow-500" />;
  };

  const getTrendText = () => {
    if (stats.improvementTrend > 2) return 'Improving!';
    if (stats.improvementTrend < -2) return 'Needs Practice';
    return 'Steady';
  };

  return (
    <div className="space-y-6">
      {/* Header Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Gamepad2 className="w-5 h-5" />
            <span className="text-sm opacity-80">Total Games</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalGames}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-5 h-5" />
            <span className="text-sm opacity-80">Accuracy</span>
          </div>
          <p className="text-3xl font-bold">{stats.overallAccuracy}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5" />
            <span className="text-sm opacity-80">Total Shots</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalShotsTaken}</p>
          <p className="text-xs opacity-80">{stats.totalShotsMade} made</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            {getTrendIcon()}
            <span className="text-sm opacity-80">Trend</span>
          </div>
          <p className="text-2xl font-bold">{getTrendText()}</p>
          <p className="text-xs opacity-80">
            {stats.improvementTrend > 0 ? '+' : ''}{stats.improvementTrend}%
          </p>
        </div>
      </div>

      {/* Mode-specific stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Multiplayer LETGO Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Multiplayer LETGO
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Games Played</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats.multiplayer.gamesPlayed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Wins</span>
              <span className="font-bold text-green-600">{stats.multiplayer.wins}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Losses</span>
              <span className="font-bold text-red-600">{stats.multiplayer.losses}</span>
            </div>
            <div className="border-t pt-4 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Win Rate</span>
                <span className="font-bold text-purple-600 text-xl">{stats.multiplayer.winRate}%</span>
              </div>
              {/* Win rate progress bar */}
              <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.multiplayer.winRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emotional Release Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-4">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Emotional Release
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Sessions Completed</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats.emotional.gamesCompleted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Shots</span>
              <span className="font-bold text-gray-900 dark:text-white">{stats.emotional.totalShots}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Shots Made</span>
              <span className="font-bold text-emerald-600">{stats.emotional.shotsMade}</span>
            </div>
            <div className="border-t pt-4 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Release Accuracy</span>
                <span className="font-bold text-emerald-600 text-xl">{stats.emotional.accuracy}%</span>
              </div>
              {/* Accuracy progress bar */}
              <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${stats.emotional.accuracy}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Accuracy Over Time Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Accuracy Over Time
        </h3>
        <div className="h-48 flex items-end gap-1">
          {stats.accuracyHistory.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Play some games to see your progress!
            </div>
          ) : (
            stats.accuracyHistory.map((game, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                <div
                  className={`w-full rounded-t transition-all cursor-pointer ${
                    game.gameMode === 'multiplayer' 
                      ? game.result === 'win' ? 'bg-purple-500 hover:bg-purple-400' : 'bg-pink-500 hover:bg-pink-400'
                      : 'bg-emerald-500 hover:bg-emerald-400'
                  }`}
                  style={{ height: `${Math.max(game.accuracy, 5)}%` }}
                />
                <span className="text-xs text-gray-500">{Math.round(game.accuracy)}%</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {game.gameMode === 'multiplayer' ? 'LETGO' : 'Emotional'} - {game.result}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded" />
            <span className="text-sm text-gray-600 dark:text-gray-400">LETGO Win</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-500 rounded" />
            <span className="text-sm text-gray-600 dark:text-gray-400">LETGO Loss</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Emotional</span>
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-amber-500" />
          Weekly Progress
        </h3>
        <div className="space-y-3">
          {stats.weeklyStats.filter(w => w.gamesPlayed > 0).length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              Play games to track your weekly progress!
            </div>
          ) : (
            stats.weeklyStats.map((week, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-xs text-gray-500 w-20">
                  {new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex-1 h-6 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                    style={{ width: `${week.accuracy}%` }}
                  />
                  {week.gamesPlayed > 0 && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium">
                      {Math.round(week.accuracy)}% ({week.gamesPlayed} games)
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500 w-16 text-right">
                  {week.shotsMade}/{week.shotsTaken}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Games */}
      {stats.recentGames.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Recent Games</h3>
          <div className="space-y-2">
            {stats.recentGames.slice(0, 5).map((game, i) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {game.game_mode === 'multiplayer' ? (
                    <Trophy className={`w-5 h-5 ${game.game_result === 'win' ? 'text-yellow-500' : 'text-gray-400'}`} />
                  ) : (
                    <Heart className="w-5 h-5 text-pink-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {game.game_mode === 'multiplayer' ? 'LETGO Match' : 'Emotional Release'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(game.played_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    game.game_result === 'win' ? 'text-green-600' : 
                    game.game_result === 'loss' ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {game.game_result === 'win' ? 'WIN' : 
                     game.game_result === 'loss' ? 'LOSS' : 'COMPLETED'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {game.shots_made}/{game.shots_taken} shots ({Math.round((game.shots_made / game.shots_taken) * 100)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LetgoStatsDisplay;
