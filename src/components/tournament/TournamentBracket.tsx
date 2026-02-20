import React from 'react';
import { TournamentMatch } from '@/types/tournament';
import { Trophy } from 'lucide-react';

interface TournamentBracketProps {
  matches: TournamentMatch[];
  totalRounds: number;
}

const TournamentBracket: React.FC<TournamentBracketProps> = ({ matches, totalRounds }) => {
  const roundNames = ['Round 1', 'Quarter Finals', 'Semi Finals', 'Finals', 'Champion'];
  
  const getMatchesByRound = (round: number) => matches.filter(m => m.round === round);

  const MatchCard: React.FC<{ match: TournamentMatch }> = ({ match }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 min-w-[180px]">
      <div className={`flex items-center justify-between p-2 rounded ${match.winner_id === match.player1_id ? 'bg-green-900/30 border border-green-500/30' : 'bg-gray-700/30'}`}>
        <span className="text-sm text-white truncate">{match.player1_name || 'TBD'}</span>
        <span className="text-sm font-bold text-amber-400">{match.player1_score}</span>
      </div>
      <div className="h-px bg-gray-600 my-1" />
      <div className={`flex items-center justify-between p-2 rounded ${match.winner_id === match.player2_id ? 'bg-green-900/30 border border-green-500/30' : 'bg-gray-700/30'}`}>
        <span className="text-sm text-white truncate">{match.player2_name || 'TBD'}</span>
        <span className="text-sm font-bold text-amber-400">{match.player2_score}</span>
      </div>
      <div className="mt-2 text-center">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          match.status === 'completed' ? 'bg-green-500/20 text-green-400' :
          match.status === 'in_progress' ? 'bg-amber-500/20 text-amber-400' :
          'bg-gray-600/50 text-gray-400'
        }`}>
          {match.status.replace('_', ' ')}
        </span>
      </div>
    </div>
  );

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400">Bracket will be generated when tournament starts</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-8 min-w-max">
        {Array.from({ length: totalRounds }, (_, i) => i + 1).map(round => (
          <div key={round} className="flex flex-col">
            <h4 className="text-center text-sm font-bold text-amber-400 mb-4">
              {roundNames[round - 1] || `Round ${round}`}
            </h4>
            <div className="flex flex-col gap-4 justify-around flex-1">
              {getMatchesByRound(round).map(match => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          </div>
        ))}
        <div className="flex flex-col items-center justify-center">
          <Trophy className="w-12 h-12 text-amber-400 mb-2" />
          <span className="text-amber-400 font-bold">Champion</span>
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
