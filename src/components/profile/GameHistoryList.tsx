import React, { useState } from 'react';
import { GameHistoryRecord, GAME_NAMES, GAME_COLORS } from '@/types/stats';
import { Trophy, X, Minus, Clock, Users, Beer, Filter, Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

interface GameHistoryListProps {
  history: GameHistoryRecord[];
  loading: boolean;
}

const GameHistoryList: React.FC<GameHistoryListProps> = ({ history, loading }) => {
  const [filter, setFilter] = useState<'all' | 'wins' | 'losses' | 'drinking'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showCount, setShowCount] = useState(10);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 animate-pulse">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-white dark:bg-gray-800 rounded-xl">
        <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p className="text-xl font-medium">No games played yet</p>
        <p className="text-sm mt-2">Start playing to build your history!</p>
      </div>
    );
  }

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win': return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'loss': return <X className="w-5 h-5 text-red-500" />;
      case 'draw': return <Minus className="w-5 h-5 text-gray-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'loss': return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'draw': return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
      default: return 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700';
    }
  };

  // Filter and sort
  let filteredHistory = [...history];
  
  if (filter === 'wins') filteredHistory = filteredHistory.filter(g => g.result === 'win');
  else if (filter === 'losses') filteredHistory = filteredHistory.filter(g => g.result === 'loss');
  else if (filter === 'drinking') filteredHistory = filteredHistory.filter(g => g.drinking_mode);

  if (sortBy === 'score') {
    filteredHistory.sort((a, b) => b.score - a.score);
  }

  const displayedHistory = filteredHistory.slice(0, showCount);

  // Stats summary
  const stats = {
    totalGames: history.length,
    wins: history.filter(g => g.result === 'win').length,
    losses: history.filter(g => g.result === 'loss').length,
    drinkingGames: history.filter(g => g.drinking_mode).length,
    avgScore: Math.round(history.reduce((sum, g) => sum + g.score, 0) / history.length)
  };

  return (
    <div className="space-y-4">
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.totalGames}</div>
          <div className="text-xs text-purple-500">Total Games</div>
        </div>
        <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.wins}</div>
          <div className="text-xs text-green-500">Wins</div>
        </div>
        <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.losses}</div>
          <div className="text-xs text-red-500">Losses</div>
        </div>
        <div className="bg-amber-100 dark:bg-amber-900/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-amber-600">{stats.drinkingGames}</div>
          <div className="text-xs text-amber-500">Drinking Games</div>
        </div>
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.avgScore}</div>
          <div className="text-xs text-blue-500">Avg Score</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
              filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('wins')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1 ${
              filter === 'wins' ? 'bg-green-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Trophy className="w-3 h-3" /> Wins
          </button>
          <button
            onClick={() => setFilter('losses')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1 ${
              filter === 'losses' ? 'bg-red-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <X className="w-3 h-3" /> Losses
          </button>
          <button
            onClick={() => setFilter('drinking')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1 ${
              filter === 'drinking' ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Beer className="w-3 h-3" /> Drinking
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setSortBy('date')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1 ${
              sortBy === 'date' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <Calendar className="w-3 h-3" /> Date
          </button>
          <button
            onClick={() => setSortBy('score')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1 ${
              sortBy === 'score' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <TrendingUp className="w-3 h-3" /> Score
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="space-y-2">
        {displayedHistory.map((game) => {
          const isExpanded = expandedId === game.id;
          const gameColor = GAME_COLORS[game.game_type] || '#8B5CF6';
          
          return (
            <div 
              key={game.id} 
              className={`rounded-xl border transition-all ${getResultColor(game.result)} ${
                isExpanded ? 'shadow-lg' : 'hover:shadow-md'
              }`}
            >
              <div 
                className="p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : game.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getResultIcon(game.result)}
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: gameColor }}
                      />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {GAME_NAMES[game.game_type] || game.game_type}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {new Date(game.played_at).toLocaleDateString('en-US', { 
                            month: 'short', day: 'numeric', year: 'numeric', 
                            hour: '2-digit', minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {game.drinking_mode && (
                      <div className="flex items-center gap-1 text-amber-600 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full text-xs">
                        <Beer className="w-3 h-3" />
                        {game.drinks_taken} drinks
                      </div>
                    )}
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">{game.score} pts</div>
                      {game.players_count > 1 && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="w-3 h-3" /> {game.players_count} players
                        </div>
                      )}
                    </div>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
              </div>
              
              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Duration</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {game.duration_minutes ? `${game.duration_minutes} min` : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Room Code</span>
                      <div className="font-medium text-gray-900 dark:text-white font-mono">
                        {game.room_code || 'Local'}
                      </div>
                    </div>
                    {game.drinking_mode && (
                      <>
                        <div>
                          <span className="text-gray-500">Intensity</span>
                          <div className="font-medium text-amber-600 capitalize">
                            {game.drinking_intensity || 'N/A'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Drinks Taken</span>
                          <div className="font-medium text-amber-600">
                            {game.drinks_taken}
                          </div>
                        </div>
                      </>
                    )}
                    {game.opponents && game.opponents.length > 0 && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Opponents</span>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {game.opponents.map(o => o.name).join(', ')}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Load More */}
      {filteredHistory.length > showCount && (
        <button
          onClick={() => setShowCount(prev => prev + 10)}
          className="w-full py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
        >
          Load More ({filteredHistory.length - showCount} remaining)
        </button>
      )}

      {filteredHistory.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Filter className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No games match the current filter</p>
        </div>
      )}
    </div>
  );
};

export default GameHistoryList;
