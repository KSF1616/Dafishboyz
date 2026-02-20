import React from 'react';
import { Trophy, Target, Flame, TrendingUp, Gamepad2, Award, Beer, PartyPopper, Zap, Clock } from 'lucide-react';
import { PlayerStats } from '@/types/stats';

interface Props {
  stats: PlayerStats | null;
  winRate: number;
  avgScore: number;
  drinkingWinRate?: number;
  avgDrinksPerGame?: number;
}

const StatsOverview: React.FC<Props> = ({ stats, winRate, avgScore, drinkingWinRate = 0, avgDrinksPerGame = 0 }) => {
  const mainCards = [
    { label: 'Total Games', value: stats?.total_games || 0, icon: Gamepad2, color: 'from-purple-500 to-indigo-600' },
    { label: 'Wins', value: stats?.wins || 0, icon: Trophy, color: 'from-green-500 to-emerald-600' },
    { label: 'Losses', value: stats?.losses || 0, icon: Target, color: 'from-red-500 to-rose-600' },
    { label: 'Win Rate', value: `${winRate}%`, icon: TrendingUp, color: 'from-blue-500 to-cyan-600' },
    { label: 'Avg Score', value: avgScore, icon: Award, color: 'from-amber-500 to-orange-600' },
    { label: 'Best Streak', value: stats?.best_streak || 0, icon: Flame, color: 'from-pink-500 to-rose-600' },
  ];

  const drinkingCards = [
    { label: 'Drinking Games', value: stats?.drinking_games_played || 0, icon: Beer, color: 'from-amber-500 to-yellow-600' },
    { label: 'Total Drinks', value: stats?.total_drinks_taken || 0, icon: PartyPopper, color: 'from-orange-500 to-red-500' },
    { label: 'Drinking Wins', value: stats?.drinking_game_wins || 0, icon: Trophy, color: 'from-emerald-500 to-teal-600' },
    { label: 'Drinking Win %', value: `${drinkingWinRate}%`, icon: TrendingUp, color: 'from-cyan-500 to-blue-600' },
    { label: 'Avg Drinks/Game', value: avgDrinksPerGame.toFixed(1), icon: Beer, color: 'from-purple-500 to-pink-600' },
    { label: 'Current Streak', value: stats?.current_streak || 0, icon: Zap, color: 'from-yellow-500 to-amber-600' },
  ];

  const hasDrinkingStats = (stats?.drinking_games_played || 0) > 0;

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-purple-500" />
          Game Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {mainCards.map((card) => (
            <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-xl p-4 text-white shadow-lg transform hover:scale-105 transition-transform`}>
              <card.icon className="w-6 h-6 mb-2 opacity-80" />
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-sm opacity-80">{card.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Drinking Game Stats */}
      {hasDrinkingStats && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Beer className="w-5 h-5 text-amber-500" />
            Drinking Game Stats
            <span className="text-xs bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full">21+</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {drinkingCards.map((card) => (
              <div key={card.label} className={`bg-gradient-to-br ${card.color} rounded-xl p-4 text-white shadow-lg transform hover:scale-105 transition-transform`}>
                <card.icon className="w-6 h-6 mb-2 opacity-80" />
                <div className="text-2xl font-bold">{card.value}</div>
                <div className="text-sm opacity-80">{card.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Quick Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {stats?.highest_score || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Highest Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
              {stats?.favorite_game ? stats.favorite_game.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'N/A'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Favorite Game</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">
              {stats?.total_score || 0}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Score</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">
              {stats?.last_played_at ? new Date(stats.last_played_at).toLocaleDateString() : 'Never'}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Last Played</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
