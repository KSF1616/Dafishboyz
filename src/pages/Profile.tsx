import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePlayerStats } from '@/hooks/usePlayerStats';
import { useLetgoStats } from '@/hooks/useLetgoStats';
import { useMrDoodyAchievements } from '@/hooks/useMrDoodyAchievements';
import ProfileHeader from '@/components/profile/ProfileHeader';
import StatsOverview from '@/components/profile/StatsOverview';
import StatsCharts from '@/components/profile/StatsCharts';
import AchievementsList from '@/components/profile/AchievementsList';
import GameHistoryList from '@/components/profile/GameHistoryList';
import DrinkingStatsPanel from '@/components/profile/DrinkingStatsPanel';
import MrDoodyCollection from '@/components/profile/MrDoodyCollection';
import MrDoodyMiniGame from '@/components/MrDoodyMiniGame';
import LetgoStatsDisplay from '@/components/profile/LetgoStatsDisplay';
import CollectibleCharacter from '@/components/CollectibleCharacter';
import FreeTrialStatus from '@/components/profile/FreeTrialStatus';
import SubscriptionDashboard from '@/components/profile/SubscriptionDashboard';
import { COLLECTIBLE_CHARACTERS, getRarityColor, getRarityBgColor } from '@/data/collectibleCharacters';
import { MR_DOODY_ACHIEVEMENTS, CATEGORY_INFO } from '@/data/mrDoodyAchievements';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Trophy, BarChart3, Gamepad2, LogOut, RefreshCw, Gift, Target, Sparkles, Crown, Star, Zap, Lock, Users, Award, Flame, Wrench, CreditCard, Beer, History, TrendingUp } from 'lucide-react';


const Profile: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { 
    stats, 
    history, 
    achievements, 
    drinkingStats,
    loading, 
    getWinRate, 
    getAvgScore, 
    getDrinkingWinRate,
    getAvgDrinksPerGame,
    getGameBreakdown, 
    getMonthlyPerformance,
    getAchievementProgress,
    refetch 
  } = usePlayerStats(user?.id);
  const { stats: letgoStats, loading: letgoLoading, refetch: refetchLetgo } = useLetgoStats(user?.id);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [activeStatsTab, setActiveStatsTab] = useState<'overview' | 'charts' | 'history' | 'drinking'>('overview');
  
  // Get initial tab from URL parameter
  const initialTab = searchParams.get('tab') || 'stats';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update tab when URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['stats', 'letgo', 'achievements', 'collection', 'tools', 'subscription'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Update URL without adding to history
    const newParams = new URLSearchParams(searchParams);
    if (value === 'stats') {
      newParams.delete('tab');
    } else {
      newParams.set('tab', value);
    }
    setSearchParams(newParams, { replace: true });
  };

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const userStats = {
    totalGames: stats?.total_games || 0, wins: stats?.wins || 0, losses: stats?.losses || 0, draws: 0,
    winRate: getWinRate(), totalScore: stats?.total_score || 0, averageScore: getAvgScore(),
    favoriteGame: stats?.favorite_game || null, currentStreak: stats?.current_streak || 0,
    bestStreak: stats?.best_streak || 0, gameBreakdown: []
  };

  const handleRefreshAll = () => {
    refetch();
    refetchLetgo();
  };

  // Get unlocked characters from localStorage
  const unlockedCharacters = JSON.parse(localStorage.getItem('unlockedCharacters') || '["mr-doody"]');

  const getRarityIcon = (rarity: 'common' | 'rare' | 'epic' | 'legendary') => {
    switch (rarity) {
      case 'common': return <Star className="w-3 h-3" />;
      case 'rare': return <Zap className="w-3 h-3" />;
      case 'epic': return <Crown className="w-3 h-3" />;
      case 'legendary': return <Sparkles className="w-3 h-3" />;
    }
  };

  const achievementProgress = getAchievementProgress();
  const hasDrinkingGames = (stats?.drinking_games_played || 0) > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefreshAll}><RefreshCw className="w-4 h-4" /></Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/lobby')}><Gamepad2 className="w-4 h-4 mr-2" /> Play</Button>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="w-4 h-4" /></Button>
          </div>
        </div>

        <ProfileHeader stats={userStats} />

        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="stats"><BarChart3 className="w-4 h-4 mr-2" /> Statistics</TabsTrigger>
              <TabsTrigger value="letgo"><Target className="w-4 h-4 mr-2" /> Let That Shit Go</TabsTrigger>
              <TabsTrigger value="achievements"><Trophy className="w-4 h-4 mr-2" /> Achievements</TabsTrigger>
              <TabsTrigger value="collection"><Gift className="w-4 h-4 mr-2" /> Collection</TabsTrigger>
              <TabsTrigger value="tools"><Wrench className="w-4 h-4 mr-2" /> Game Tools</TabsTrigger>
              <TabsTrigger value="subscription"><CreditCard className="w-4 h-4 mr-2" /> Subscription</TabsTrigger>
            </TabsList>

            
            <TabsContent value="stats" className="mt-6 space-y-6">
              {/* Stats Sub-Navigation */}
              <div className="flex flex-wrap gap-2 bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm">
                <button
                  onClick={() => setActiveStatsTab('overview')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeStatsTab === 'overview' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveStatsTab('charts')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeStatsTab === 'charts' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Charts
                </button>
                <button
                  onClick={() => setActiveStatsTab('history')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    activeStatsTab === 'history' 
                      ? 'bg-purple-600 text-white' 
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <History className="w-4 h-4" />
                  Game History
                </button>
                {hasDrinkingGames && (
                  <button
                    onClick={() => setActiveStatsTab('drinking')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      activeStatsTab === 'drinking' 
                        ? 'bg-amber-600 text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Beer className="w-4 h-4" />
                    Drinking Stats
                    <span className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full">21+</span>
                  </button>
                )}
              </div>

              {/* Stats Content */}
              {activeStatsTab === 'overview' && (
                <StatsOverview 
                  stats={stats} 
                  winRate={getWinRate()} 
                  avgScore={getAvgScore()} 
                  drinkingWinRate={getDrinkingWinRate()}
                  avgDrinksPerGame={getAvgDrinksPerGame()}
                />
              )}
              
              {activeStatsTab === 'charts' && (
                <StatsCharts 
                  history={history} 
                  gameBreakdown={getGameBreakdown()} 
                  monthlyPerformance={getMonthlyPerformance()}
                />
              )}
              
              {activeStatsTab === 'history' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <History className="w-5 h-5 text-purple-500" />
                    Game History
                  </h3>
                  <GameHistoryList history={history} loading={loading} />
                </div>
              )}
              
              {activeStatsTab === 'drinking' && hasDrinkingGames && (
                <DrinkingStatsPanel 
                  drinkingStats={drinkingStats}
                  totalDrinkingGames={stats?.drinking_games_played || 0}
                  totalDrinks={stats?.total_drinks_taken || 0}
                  drinkingWins={stats?.drinking_game_wins || 0}
                  avgDrinksPerGame={getAvgDrinksPerGame()}
                  favoriteDrinkingGame={stats?.favorite_drinking_game || null}
                />
              )}
            </TabsContent>
            
            <TabsContent value="letgo" className="mt-6">
              {letgoLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
                </div>
              ) : letgoStats ? (
                <LetgoStatsDisplay stats={letgoStats} />
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
                  <Target className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Games Yet</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Play "Let That Shit Go" to start tracking your stats!
                  </p>
                  <Button 
                    onClick={() => navigate('/lobby')}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600"
                  >
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Play Now
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="achievements" className="mt-6">
              <AchievementsList 
                achievements={achievements} 
                achievementProgress={achievementProgress}
              />
            </TabsContent>
            
            <TabsContent value="collection" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Main Collection Component */}
                <MrDoodyCollection />
                
                {/* Character Showcase */}
                <div className="space-y-6">
                  {/* Mr. Doody Mini Game Card */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5" />
                        Pocket Hug Tap Game
                      </h3>
                      <p className="text-purple-100 text-sm">Play the interactive mini-game!</p>
                    </div>
                    <div className="p-6">
                      <div className="text-center mb-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
                          <Gamepad2 className="w-10 h-10 text-amber-600" />
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">Tap Challenge</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                          Tap your pocket buddy's body parts to score points!
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">High Score</div>
                            <div className="text-xl font-bold text-purple-600">
                              {localStorage.getItem('mrDoodyMiniGameHighScore') || '0'}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Game Modes</div>
                            <div className="text-xl font-bold text-pink-600">3</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>Challenge Mode - Follow the prompts</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-orange-500" />
                          <span>Speed Mode - 30 second rush</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-pink-500" />
                          <span>Free Play - Explore interactions</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => setShowMiniGame(true)}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      >
                        <Gamepad2 className="w-4 h-4 mr-2" />
                        Play Now
                      </Button>
                    </div>
                  </div>

                  {/* Character Unlock Progress */}
                  <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-4">
                      <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Unlock Progress
                      </h3>
                      <p className="text-indigo-100 text-sm">
                        {unlockedCharacters.length} / {COLLECTIBLE_CHARACTERS.length} characters unlocked
                      </p>
                    </div>
                    <div className="p-4">
                      <div className="space-y-3">
                        {COLLECTIBLE_CHARACTERS.filter(c => !unlockedCharacters.includes(c.id)).slice(0, 4).map((char) => {
                          const req = char.unlockRequirement;
                          let current = 0;
                          
                          switch (req.type) {
                            case 'games_won':
                              current = stats?.wins || parseInt(localStorage.getItem('gamesWon') || '0');
                              break;
                            case 'games_played':
                              current = stats?.total_games || parseInt(localStorage.getItem('gamesPlayed') || '0');
                              break;
                            case 'emotional_release':
                              current = parseInt(localStorage.getItem('emotionalReleaseCount') || '0');
                              break;
                            case 'tournament_wins':
                              current = parseInt(localStorage.getItem('tournamentWins') || '0');
                              break;
                            case 'hugs_given':
                              current = parseInt(localStorage.getItem('mrDoodyInteractions') || '0');
                              break;
                            case 'letgo_wins':
                              current = stats?.games_by_type?.['let-that-shit-go']?.wins || parseInt(localStorage.getItem('letgoWins') || '0');
                              break;
                            case 'accuracy':
                              current = parseInt(localStorage.getItem('overallAccuracy') || '0');
                              break;
                          }
                          
                          const percentage = Math.min((current / req.count) * 100, 100);
                          
                          return (
                            <div key={char.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                              <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: char.colors.primary + '30' }}
                              >
                                <Lock className="w-4 h-4" style={{ color: char.colors.primary }} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                    {char.name}
                                  </span>
                                  <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs ${getRarityBgColor(char.rarity)} ${getRarityColor(char.rarity)}`}>
                                    {getRarityIcon(char.rarity)}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full rounded-full transition-all"
                                      style={{ 
                                        width: `${percentage}%`,
                                        backgroundColor: char.colors.primary
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs text-gray-500 whitespace-nowrap">
                                    {current}/{req.count}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {COLLECTIBLE_CHARACTERS.filter(c => !unlockedCharacters.includes(c.id)).length > 4 && (
                        <p className="text-center text-sm text-gray-500 mt-3">
                          +{COLLECTIBLE_CHARACTERS.filter(c => !unlockedCharacters.includes(c.id)).length - 4} more to unlock
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* All Characters Showcase */}
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
                  <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    Character Gallery
                  </h3>
                  <p className="text-amber-100 text-sm">Meet all the pocket hug buddies!</p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
                    {COLLECTIBLE_CHARACTERS.map((char) => {
                      const isUnlocked = unlockedCharacters.includes(char.id);
                      
                      return (
                        <div 
                          key={char.id}
                          className={`text-center p-3 rounded-xl transition-all ${
                            isUnlocked 
                              ? 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800' 
                              : 'bg-gray-100 dark:bg-gray-800 opacity-60'
                          }`}
                        >
                          <div className="relative mb-2">
                            {isUnlocked ? (
                              <CollectibleCharacter
                                character={char}
                                size="sm"
                                animated={false}
                                interactive={false}
                              />
                            ) : (
                              <div 
                                className="w-20 h-30 mx-auto rounded-full flex items-center justify-center"
                                style={{ backgroundColor: char.colors.primary + '20' }}
                              >
                                <Lock className="w-6 h-6 text-gray-400" />
                              </div>
                            )}
                            <div className={`absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full ${getRarityBgColor(char.rarity)}`}>
                              {getRarityIcon(char.rarity)}
                            </div>
                          </div>
                          <h5 className={`font-bold text-xs ${isUnlocked ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
                            {char.name}
                          </h5>
                          <p className={`text-xs ${getRarityColor(char.rarity)}`}>
                            {char.rarity}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Game Tools Tab */}
            <TabsContent value="tools" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Free Trial Status */}
                <FreeTrialStatus />
                
                {/* Available Tools */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                      <Wrench className="w-5 h-5" />
                      Digital Game Tools
                    </h3>
                    <p className="text-blue-100 text-sm">Enhance your gaming experience</p>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Our digital game tools are designed to complement your physical games, making gameplay smoother and more enjoyable.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Star className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Digital Scorekeeping</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Automatically track scores for all games. No more paper and pencil!
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Zap className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Interactive Dice Roller</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Perfect for O Craps and other dice games. Realistic physics and animations.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Crown className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Digital Card Deck</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Virtual cards for all games. Shuffle, deal, and draw with ease.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">Statistics Tracking</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Track your game history, win rates, and personal records.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        Purchase any physical game and use code <span className="font-bold text-purple-600">FREETOOLS30</span> at checkout for 30 days free access!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="mt-6">
              <SubscriptionDashboard />
            </TabsContent>
          </Tabs>

        </div>
      </div>

      {/* Mini Game Modal */}
      {showMiniGame && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-h-[90vh] overflow-y-auto">
            <MrDoodyMiniGame 
              onClose={() => setShowMiniGame(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
