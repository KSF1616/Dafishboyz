import React from 'react';
import { Tournament } from '@/types/tournament';
import { Trophy, Users, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  tournament: Tournament;
  onJoin: (id: string) => void;
  onView: (tournament: Tournament) => void;
}

const TournamentCard: React.FC<Props> = ({ tournament, onJoin, onView }) => {
  const statusColors = {
    registration: 'bg-green-500/20 text-green-400',
    in_progress: 'bg-amber-500/20 text-amber-400',
    completed: 'bg-gray-500/20 text-gray-400',
    cancelled: 'bg-red-500/20 text-red-400'
  };

  const prizeBreakdown = [
    { place: '1st', amount: (tournament.prize_pool * tournament.prize_distribution.first_place_percent / 100).toFixed(2) },
    { place: '2nd', amount: (tournament.prize_pool * tournament.prize_distribution.second_place_percent / 100).toFixed(2) },
    { place: '3rd', amount: (tournament.prize_pool * tournament.prize_distribution.third_place_percent / 100).toFixed(2) }
  ];

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 hover:border-amber-500/50 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white">{tournament.name}</h3>
          <p className="text-gray-400 text-sm">{tournament.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[tournament.status]}`}>
          {tournament.status.replace('_', ' ')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center gap-2 text-gray-300">
          <Users className="w-4 h-4 text-purple-400" />
          <span>{tournament.current_participants}/{tournament.max_participants}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>{new Date(tournament.start_date).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Prize Pool Section */}
      <div className="bg-gradient-to-r from-amber-900/30 to-lime-900/30 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-bold">Entry Fee: ${tournament.entry_fee}</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-lime-400" />
            <span className="text-lime-400 font-bold">Prize Pool: ${tournament.prize_pool}</span>
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          {prizeBreakdown.map(p => (
            <div key={p.place} className="text-gray-300">
              <span className="text-gray-500">{p.place}:</span> ${p.amount}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          * Prize pool funded by player entry fees. Winners receive payouts directly.
        </p>
      </div>

      <div className="flex gap-2">
        {tournament.status === 'registration' && (
          <Button onClick={() => onJoin(tournament.id)} className="flex-1 bg-gradient-to-r from-amber-500 to-lime-500 text-black font-bold">
            Join (${tournament.entry_fee})
          </Button>
        )}
        <Button onClick={() => onView(tournament)} variant="outline" className="flex-1 border-gray-600">
          View Details
        </Button>
      </div>
    </div>
  );
};

export default TournamentCard;
