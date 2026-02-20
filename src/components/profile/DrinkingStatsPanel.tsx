import React from 'react';
import { DrinkingGameStats, GAME_NAMES, GAME_COLORS } from '@/types/stats';
import { Beer, Trophy, TrendingUp, Flame, Target, Award, Wine, PartyPopper } from 'lucide-react';

interface Props {
  drinkingStats: DrinkingGameStats[];
  totalDrinkingGames: number;
  totalDrinks: number;
  drinkingWins: number;
  avgDrinksPerGame: number;
  favoriteDrinkingGame: string | null;
}

const DrinkingStatsPanel: React.FC<Props> = ({
  drinkingStats,
  totalDrinkingGames,
  totalDrinks,
  drinkingWins,
  avgDrinksPerGame,
  favoriteDrinkingGame
}) => {
  if (totalDrinkingGames === 0) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-8 text-center">
        <Beer className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Drinking Games Yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Enable drinking mode in any adult game to start tracking your party stats!
        </p>
        <div className="inline-flex items-center gap-2 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 px-4 py-2 rounded-full text-sm">
          <span className="font-bold">21+</span>
          <span>Please drink responsibly</span>
        </div>
      </div>
    );
  }

  const winRate = totalDrinkingGames > 0 ? Math.round((drinkingWins / totalDrinkingGames) * 100) : 0;
  const safeDrinkingStats = drinkingStats || [];
  const maxDrinksSingleGame = safeDrinkingStats.length > 0 ? Math.max(...safeDrinkingStats.map(s => s.most_drinks_single_game), 0) : 0;

  // Calculate intensity distribution
  const totalIntensityGames = drinkingStats.reduce((sum, s) => 
    sum + s.light_intensity_games + s.medium_intensity_games + s.heavy_intensity_games, 0);
  const lightPercentage = totalIntensityGames > 0 
    ? Math.round((drinkingStats.reduce((sum, s) => sum + s.light_intensity_games, 0) / totalIntensityGames) * 100) : 0;
  const mediumPercentage = totalIntensityGames > 0 
    ? Math.round((drinkingStats.reduce((sum, s) => sum + s.medium_intensity_games, 0) / totalIntensityGames) * 100) : 0;
  const heavyPercentage = totalIntensityGames > 0 
    ? Math.round((drinkingStats.reduce((sum, s) => sum + s.heavy_intensity_games, 0) / totalIntensityGames) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-4">
          <Beer className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">Drinking Game Stats</h2>
            <p className="text-amber-100">Your party performance</p>
          </div>
          <div className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm font-bold">
            21+
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <PartyPopper className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <div className="text-3xl font-bold">{totalDrinkingGames}</div>
            <div className="text-sm opacity-80">Games Played</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <Wine className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <div className="text-3xl font-bold">{totalDrinks}</div>
            <div className="text-sm opacity-80">Total Drinks</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <div className="text-3xl font-bold">{winRate}%</div>
            <div className="text-sm opacity-80">Win Rate</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 opacity-80" />
            <div className="text-3xl font-bold">{avgDrinksPerGame.toFixed(1)}</div>
            <div className="text-sm opacity-80">Avg/Game</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Intensity Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Intensity Preference
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-green-600 font-medium">Light</span>
                <span className="text-gray-500">{lightPercentage}%</span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all"
                  style={{ width: `${lightPercentage}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-amber-600 font-medium">Medium</span>
                <span className="text-gray-500">{mediumPercentage}%</span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all"
                  style={{ width: `${mediumPercentage}%` }}
                />
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-red-600 font-medium">Heavy</span>
                <span className="text-gray-500">{heavyPercentage}%</span>
              </div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full transition-all"
                  style={{ width: `${heavyPercentage}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-sm">Most Drinks (Single Game)</span>
              <span className="text-2xl font-bold text-amber-600">{maxDrinksSingleGame}</span>
            </div>
          </div>
        </div>

        {/* Favorite Drinking Game */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            Drinking Game Breakdown
          </h3>
          
          {drinkingStats.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No drinking game data yet</p>
          ) : (
            <div className="space-y-3">
              {drinkingStats.sort((a, b) => b.total_games - a.total_games).map((stat) => {
                const gameColor = GAME_COLORS[stat.game_type] || '#8B5CF6';
                const isFavorite = stat.game_type === favoriteDrinkingGame;
                
                return (
                  <div 
                    key={stat.game_type}
                    className={`p-3 rounded-lg transition-all ${
                      isFavorite 
                        ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700' 
                        : 'bg-gray-50 dark:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: gameColor }}
                        />
                        <span className="font-medium text-gray-900 dark:text-white">
                          {GAME_NAMES[stat.game_type] || stat.game_type}
                        </span>
                        {isFavorite && (
                          <span className="bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 text-xs px-2 py-0.5 rounded-full">
                            Favorite
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{stat.total_games} games</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-amber-600">{stat.total_drinks}</div>
                        <div className="text-gray-500">Drinks</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-blue-600">{stat.avg_drinks_per_game.toFixed(1)}</div>
                        <div className="text-gray-500">Avg/Game</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-red-600">{stat.most_drinks_single_game}</div>
                        <div className="text-gray-500">Max</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Responsible Drinking Notice */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-semibold">Remember:</span> Drink responsibly. Know your limits. 
          Never drink and drive. Stats are for fun - your health comes first!
        </p>
      </div>
    </div>
  );
};

export default DrinkingStatsPanel;
