import { PlayerStats, PlayerAchievement } from '@/types/leaderboard';
import { AchievementBadge } from './AchievementBadge';
import { Trophy, Target, Flame, TrendingUp, Gamepad2 } from 'lucide-react';

interface PlayerStatsCardProps {
  player: PlayerStats;
  achievements: PlayerAchievement[];
  rank: number;
}

export function PlayerStatsCard({ player, achievements, rank }: PlayerStatsCardProps) {
  const winRate = player.total_games_played > 0 
    ? ((player.total_wins / player.total_games_played) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 
          flex items-center justify-center text-white text-2xl font-bold shadow-lg">
          {player.username.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-white">{player.username}</h3>
          <p className="text-gray-400">Rank #{rank}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-semibold">
              {player.total_points.toLocaleString()} pts
            </span>
            {player.current_streak >= 3 && (
              <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-sm flex items-center gap-1">
                <Flame className="w-4 h-4" /> {player.current_streak} streak
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <Gamepad2 className="w-6 h-6 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{player.total_games_played}</p>
          <p className="text-gray-400 text-sm">Games</p>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <Trophy className="w-6 h-6 text-green-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{player.total_wins}</p>
          <p className="text-gray-400 text-sm">Wins</p>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{winRate}%</p>
          <p className="text-gray-400 text-sm">Win Rate</p>
        </div>
        <div className="bg-gray-700/30 rounded-xl p-4 text-center">
          <TrendingUp className="w-6 h-6 text-orange-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{player.best_streak}</p>
          <p className="text-gray-400 text-sm">Best Streak</p>
        </div>
      </div>

      {achievements.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Achievements</h4>
          <div className="flex flex-wrap gap-3">
            {achievements.slice(0, 6).map((pa) => pa.achievement && (
              <AchievementBadge key={pa.id} achievement={pa.achievement} earnedAt={pa.earned_at} size="sm" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
