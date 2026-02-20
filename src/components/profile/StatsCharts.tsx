import React, { useState } from 'react';
import { GameHistoryRecord, GAME_NAMES, GAME_COLORS, MonthlyStats } from '@/types/stats';
import { BarChart3, PieChart, TrendingUp, Calendar, Beer, Gamepad2 } from 'lucide-react';

interface Props {
  history: GameHistoryRecord[];
  gameBreakdown: { 
    game: string; 
    gameName?: string;
    played: number; 
    wins: number; 
    totalScore: number;
    drinkingPlayed?: number;
    totalDrinks?: number;
  }[];
  monthlyPerformance?: {
    month: string;
    games: number;
    wins: number;
    winRate: number;
    avgScore: number;
    drinkingGames: number;
    drinks: number;
  }[];
}

const StatsCharts: React.FC<Props> = ({ history = [], gameBreakdown = [], monthlyPerformance = [] }) => {
  const [chartView, setChartView] = useState<'performance' | 'games' | 'monthly' | 'drinking'>('performance');
  
  const safeHistory = history || [];
  const recentGames = safeHistory.slice(0, 15).reverse();
  const maxScore = recentGames.length > 0 ? Math.max(...recentGames.map(g => g.score), 100) : 100;

  const winLossData = {
    wins: safeHistory.filter(g => g.result === 'win').length,
    losses: safeHistory.filter(g => g.result === 'loss').length,
    draws: safeHistory.filter(g => g.result === 'draw').length,
  };
  const total = winLossData.wins + winLossData.losses + winLossData.draws || 1;

  const drinkingGames = safeHistory.filter(g => g.drinking_mode);
  const hasDrinkingData = drinkingGames.length > 0;

  const formatMonth = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Chart View Selector */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setChartView('performance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            chartView === 'performance' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Performance
        </button>
        <button
          onClick={() => setChartView('games')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            chartView === 'games' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Gamepad2 className="w-4 h-4" />
          By Game
        </button>
        <button
          onClick={() => setChartView('monthly')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
            chartView === 'monthly' 
              ? 'bg-purple-600 text-white' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Monthly
        </button>
        {hasDrinkingData && (
          <button
            onClick={() => setChartView('drinking')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              chartView === 'drinking' 
                ? 'bg-amber-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Beer className="w-4 h-4" />
            Drinking
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Main Chart Area */}
        {chartView === 'performance' && (
          <>
            {/* Score Trend Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-500" />
                Recent Performance (Last 15 Games)
              </h3>
              <div className="h-48 flex items-end gap-1">
                {recentGames.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-gray-500">No games yet</div>
                ) : (
                  recentGames.map((game, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                      <div
                        className={`w-full rounded-t transition-all cursor-pointer ${
                          game.result === 'win' ? 'bg-green-500 hover:bg-green-400' : 
                          game.result === 'loss' ? 'bg-red-500 hover:bg-red-400' : 
                          'bg-yellow-500 hover:bg-yellow-400'
                        } ${game.drinking_mode ? 'ring-2 ring-amber-400' : ''}`}
                        style={{ height: `${Math.max((game.score / maxScore) * 100, 5)}%` }}
                      />
                      <span className="text-xs text-gray-500 truncate w-full text-center">{game.score}</span>
                      
                      {/* Tooltip */}
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                        <div className="font-semibold">{GAME_NAMES[game.game_type] || game.game_type}</div>
                        <div>Score: {game.score}</div>
                        <div className="capitalize">{game.result}</div>
                        {game.drinking_mode && <div className="text-amber-400">Drinking Mode</div>}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-center gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-500 rounded" /> Win</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-500 rounded" /> Loss</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-500 rounded" /> Draw</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-300 rounded ring-2 ring-amber-400" /> Drinking</div>
              </div>
            </div>

            {/* Win/Loss Pie */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-blue-500" />
                Win/Loss Ratio
              </h3>
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#22c55e" strokeWidth="3"
                      strokeDasharray={`${(winLossData.wins / total) * 100} 100`} />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#ef4444" strokeWidth="3"
                      strokeDasharray={`${(winLossData.losses / total) * 100} 100`}
                      strokeDashoffset={`-${(winLossData.wins / total) * 100}`} />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="#eab308" strokeWidth="3"
                      strokeDasharray={`${(winLossData.draws / total) * 100} 100`}
                      strokeDashoffset={`-${((winLossData.wins + winLossData.losses) / total) * 100}`} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {Math.round((winLossData.wins / total) * 100)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Wins: {winLossData.wins}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-500 rounded" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Losses: {winLossData.losses}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-500 rounded" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Draws: {winLossData.draws}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {chartView === 'games' && (
          <>
            {/* Games Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg md:col-span-2">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Gamepad2 className="w-5 h-5 text-purple-500" />
                Performance by Game
              </h3>
              {gameBreakdown.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No games played yet</div>
              ) : (
                <div className="space-y-4">
                  {gameBreakdown.map((game) => {
                    const winRate = game.played > 0 ? Math.round((game.wins / game.played) * 100) : 0;
                    const color = GAME_COLORS[game.game] || '#8B5CF6';
                    
                    return (
                      <div key={game.game} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: color }}
                            />
                            <span className="font-medium text-gray-900 dark:text-white">
                              {game.gameName || GAME_NAMES[game.game] || game.game}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{game.played} played</span>
                            <span className="text-green-600">{game.wins} wins</span>
                            <span className="font-semibold">{winRate}%</span>
                          </div>
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all"
                            style={{ 
                              width: `${winRate}%`,
                              backgroundColor: color
                            }}
                          />
                        </div>
                        {(game.drinkingPlayed || 0) > 0 && (
                          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                            <Beer className="w-3 h-3" />
                            {game.drinkingPlayed} drinking games • {game.totalDrinks} drinks
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {chartView === 'monthly' && (
          <>
            {/* Monthly Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg md:col-span-2">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Monthly Performance
              </h3>
              {monthlyPerformance.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No monthly data yet</div>
              ) : (
                <div className="space-y-4">
                  {/* Chart */}
                  <div className="h-48 flex items-end gap-2">
                    {monthlyPerformance.slice(-12).map((month, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                        <div className="w-full flex flex-col gap-0.5" style={{ height: '100%' }}>
                          <div 
                            className="w-full bg-green-500 rounded-t transition-all"
                            style={{ height: `${month.winRate}%` }}
                          />
                          <div 
                            className="w-full bg-red-400 rounded-b transition-all"
                            style={{ height: `${100 - month.winRate}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 truncate">{formatMonth(month.month)}</span>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          <div className="font-semibold">{formatMonth(month.month)}</div>
                          <div>Games: {month.games}</div>
                          <div>Wins: {month.wins}</div>
                          <div>Win Rate: {month.winRate}%</div>
                          <div>Avg Score: {month.avgScore}</div>
                          {month.drinkingGames > 0 && (
                            <div className="text-amber-400">Drinking: {month.drinkingGames} games</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Stats Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-2 text-gray-500">Month</th>
                          <th className="text-center py-2 text-gray-500">Games</th>
                          <th className="text-center py-2 text-gray-500">Wins</th>
                          <th className="text-center py-2 text-gray-500">Win %</th>
                          <th className="text-center py-2 text-gray-500">Avg Score</th>
                          <th className="text-center py-2 text-gray-500">Drinking</th>
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyPerformance.slice(-6).reverse().map((month) => (
                          <tr key={month.month} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-2 font-medium text-gray-900 dark:text-white">{formatMonth(month.month)}</td>
                            <td className="py-2 text-center text-gray-600 dark:text-gray-400">{month.games}</td>
                            <td className="py-2 text-center text-green-600">{month.wins}</td>
                            <td className="py-2 text-center font-semibold text-gray-900 dark:text-white">{month.winRate}%</td>
                            <td className="py-2 text-center text-gray-600 dark:text-gray-400">{month.avgScore}</td>
                            <td className="py-2 text-center text-amber-600">{month.drinkingGames > 0 ? month.drinkingGames : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {chartView === 'drinking' && hasDrinkingData && (
          <>
            {/* Drinking Game Stats */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Beer className="w-5 h-5 text-amber-500" />
                Drinking Game Performance
              </h3>
              <div className="h-48 flex items-end gap-2">
                {drinkingGames.slice(0, 15).reverse().map((game, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div
                      className={`w-full rounded-t transition-all ${
                        game.result === 'win' ? 'bg-amber-500' : 'bg-orange-400'
                      }`}
                      style={{ height: `${Math.max((game.drinks_taken / 10) * 100, 10)}%` }}
                    />
                    <span className="text-xs text-gray-500">{game.drinks_taken}</span>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      <div className="font-semibold">{GAME_NAMES[game.game_type] || game.game_type}</div>
                      <div>Drinks: {game.drinks_taken}</div>
                      <div>Intensity: {game.drinking_intensity || 'N/A'}</div>
                      <div className="capitalize">{game.result}</div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 text-center mt-2">Drinks per game (last 15 drinking games)</p>
            </div>

            {/* Intensity Breakdown */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-5 h-5 text-orange-500" />
                Intensity Breakdown
              </h3>
              <div className="space-y-4">
                {['light', 'medium', 'heavy'].map((intensity) => {
                  const count = drinkingGames.filter(g => g.drinking_intensity === intensity).length;
                  const percentage = drinkingGames.length > 0 ? Math.round((count / drinkingGames.length) * 100) : 0;
                  const colors = {
                    light: 'bg-green-500',
                    medium: 'bg-amber-500',
                    heavy: 'bg-red-500'
                  };
                  
                  return (
                    <div key={intensity} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="capitalize text-gray-700 dark:text-gray-300">{intensity}</span>
                        <span className="text-gray-500">{count} games ({percentage}%)</span>
                      </div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${colors[intensity as keyof typeof colors]} rounded-full transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatsCharts;
