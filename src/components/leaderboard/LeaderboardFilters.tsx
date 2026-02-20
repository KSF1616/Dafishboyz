import { TimeFilter, SortBy } from '@/types/leaderboard';
import { Calendar, Trophy, Flame, Gamepad2, Star } from 'lucide-react';

interface LeaderboardFiltersProps {
  timeFilter: TimeFilter;
  setTimeFilter: (filter: TimeFilter) => void;
  sortBy: SortBy;
  setSortBy: (sort: SortBy) => void;
}

export function LeaderboardFilters({ timeFilter, setTimeFilter, sortBy, setSortBy }: LeaderboardFiltersProps) {
  const timeOptions: { value: TimeFilter; label: string }[] = [
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'all-time', label: 'All Time' },
  ];

  const sortOptions: { value: SortBy; label: string; icon: any }[] = [
    { value: 'points', label: 'Points', icon: Star },
    { value: 'wins', label: 'Wins', icon: Trophy },
    { value: 'streak', label: 'Streak', icon: Flame },
    { value: 'games', label: 'Games', icon: Gamepad2 },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1">
        {timeOptions.map(opt => (
          <button
            key={opt.value}
            onClick={() => setTimeFilter(opt.value)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all
              ${timeFilter === opt.value 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 bg-gray-800/50 rounded-lg p-1">
        <span className="text-gray-500 text-sm px-2">Sort:</span>
        {sortOptions.map(opt => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => setSortBy(opt.value)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-1
                ${sortBy === opt.value 
                  ? 'bg-purple-600 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'}`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
