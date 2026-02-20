import { PlayerStats, SortBy } from '@/types/leaderboard';
import { Trophy, Medal, Award, TrendingUp, Flame } from 'lucide-react';

interface LeaderboardTableProps {
  players: PlayerStats[];
  sortBy: SortBy;
  currentUserId?: string;
}

export function LeaderboardTable({ players, sortBy, currentUserId }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 text-center font-bold text-gray-400">{rank}</span>;
  };

  const getWinRate = (p: PlayerStats) => {
    const total = p.total_wins + p.total_losses + p.total_draws;
    return total > 0 ? ((p.total_wins / total) * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-900/50">
            <tr className="text-left text-gray-400 text-sm">
              <th className="px-4 py-3 w-16">Rank</th>
              <th className="px-4 py-3">Player</th>
              <th className="px-4 py-3 text-center">Games</th>
              <th className="px-4 py-3 text-center">W/L/D</th>
              <th className="px-4 py-3 text-center">Win %</th>
              <th className="px-4 py-3 text-center">Streak</th>
              <th className="px-4 py-3 text-right">Points</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700/50">
            {players.map((player, idx) => (
              <tr key={player.id} className={`hover:bg-gray-700/30 transition-colors
                ${player.user_id === currentUserId ? 'bg-purple-900/20 border-l-2 border-purple-500' : ''}`}>
                <td className="px-4 py-3">{getRankIcon(idx + 1)}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 
                      flex items-center justify-center text-white font-bold">
                      {player.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{player.username}</p>
                      {player.current_streak >= 3 && (
                        <span className="flex items-center gap-1 text-xs text-orange-400">
                          <Flame className="w-3 h-3" /> {player.current_streak} streak
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-gray-300">{player.total_games_played}</td>
                <td className="px-4 py-3 text-center">
                  <span className="text-green-400">{player.total_wins}</span>/
                  <span className="text-red-400">{player.total_losses}</span>/
                  <span className="text-gray-400">{player.total_draws}</span>
                </td>
                <td className="px-4 py-3 text-center text-gray-300">{getWinRate(player)}%</td>
                <td className="px-4 py-3 text-center">
                  <span className="text-orange-400 font-semibold">{player.best_streak}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-yellow-400 font-bold">{player.total_points.toLocaleString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
