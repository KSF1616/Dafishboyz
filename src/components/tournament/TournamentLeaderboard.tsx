import React from 'react';
import { TournamentLeaderboardEntry } from '@/types/tournament';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

interface TournamentLeaderboardProps {
  entries: TournamentLeaderboardEntry[];
}

const TournamentLeaderboard: React.FC<TournamentLeaderboardProps> = ({ entries }) => {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-amber-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-300" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-gray-500 font-bold">{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-amber-900/30 to-amber-800/20 border-amber-500/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-700/30 to-gray-600/20 border-gray-400/30';
    if (rank === 3) return 'bg-gradient-to-r from-amber-800/20 to-amber-700/10 border-amber-600/30';
    return 'bg-gray-800/30 border-gray-700/30';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-6 h-6 text-amber-400" />
        <h3 className="text-xl font-bold text-white">Tournament Leaderboard</h3>
      </div>

      {entries.map(entry => (
        <div key={entry.user_id} className={`flex items-center gap-4 p-4 rounded-xl border ${getRankBg(entry.rank)}`}>
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800">
            {getRankIcon(entry.rank)}
          </div>
          
          <div className="flex-1">
            <p className="font-bold text-white">{entry.username}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                {entry.tournaments_won} wins
              </span>
              <span>{entry.tournaments_played} played</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-lime-400 font-bold">
              <TrendingUp className="w-4 h-4" />
              {entry.win_rate}% WR
            </div>
          </div>
        </div>
      ))}

      {entries.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p>No leaderboard data yet</p>
        </div>
      )}
    </div>
  );
};

export default TournamentLeaderboard;
