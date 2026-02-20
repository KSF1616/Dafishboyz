import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { PlayerStats, Achievement, PlayerAchievement, TimeFilter, SortBy } from '@/types/leaderboard';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { LeaderboardFilters } from '@/components/leaderboard/LeaderboardFilters';
import { AchievementsGrid } from '@/components/leaderboard/AchievementsGrid';
import { PlayerStatsCard } from '@/components/leaderboard/PlayerStatsCard';
import { Trophy, Medal, Award, ArrowLeft, Loader2 } from 'lucide-react';

export default function Leaderboard() {
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all-time');
  const [sortBy, setSortBy] = useState<SortBy>('points');
  const [activeTab, setActiveTab] = useState<'rankings' | 'achievements'>('rankings');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(null);

  useEffect(() => {
    fetchData();
  }, [timeFilter, sortBy]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Map sort options to actual column names in the database
      const sortColumn = sortBy === 'points' ? 'total_points' 
        : sortBy === 'wins' ? 'total_wins' 
        : sortBy === 'streak' ? 'best_streak' 
        : 'total_games_played';
      
      const { data: playersData, error: playersError } = await supabase
        .from('player_stats')
        .select('*')
        .order(sortColumn, { ascending: false })
        .limit(50);
      
      if (playersError) {
        console.error('Error fetching players:', playersError);
        // Don't throw, just set empty array
      }
      
      // Try to fetch from game_achievements table (the correct table name)
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('game_achievements')
        .select('*');
      
      if (achievementsError) {
        console.error('Error fetching achievements:', achievementsError);
        // Don't throw, just set empty array
      }
      
      // Map the data to ensure it has all required fields
      const mappedPlayers: PlayerStats[] = (playersData || []).map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        username: p.username || 'Anonymous',
        avatar_url: p.avatar_url,
        total_games_played: p.total_games_played || p.total_games || 0,
        total_wins: p.total_wins || p.wins || 0,
        total_losses: p.total_losses || p.losses || 0,
        total_draws: p.total_draws || 0,
        total_points: p.total_points || p.total_score || 0,
        current_streak: p.current_streak || 0,
        best_streak: p.best_streak || 0,
        created_at: p.created_at,
        updated_at: p.updated_at
      }));
      
      // Map achievements to expected format
      const mappedAchievements: Achievement[] = (achievementsData || []).map((a: any) => ({
        id: a.id,
        key: a.achievement_id || a.key,
        name: a.name,
        description: a.description,
        icon: a.icon,
        category: a.category,
        points: a.points,
        requirement_type: a.requirement_type,
        requirement_value: a.requirement_value,
        rarity: a.rarity
      }));
      
      setPlayers(mappedPlayers);
      setAchievements(mappedAchievements);
    } catch (err: any) {
      console.error('Error in fetchData:', err);
      setError(err.message || 'Failed to load leaderboard data');
      setPlayers([]);
      setAchievements([]);
    }
    
    setLoading(false);
  };

  const topThree = players.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Global Leaderboard</h1>
            <p className="text-gray-400">Compete with players worldwide</p>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          {['rankings', 'achievements'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all capitalize
                ${activeTab === tab ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
              {tab}
            </button>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : activeTab === 'rankings' ? (
          <>
            <LeaderboardFilters timeFilter={timeFilter} setTimeFilter={setTimeFilter} sortBy={sortBy} setSortBy={setSortBy} />
            
            {topThree.length >= 3 && (
              <div className="grid grid-cols-3 gap-4 mb-8">
                {[1, 0, 2].map((idx, pos) => {
                  const p = topThree[idx];
                  if (!p) return null;
                  const icons = [Trophy, Medal, Award];
                  const colors = ['text-yellow-400', 'text-gray-300', 'text-amber-600'];
                  const Icon = icons[idx];
                  return (
                    <div key={p.id} className={`bg-gray-800/50 rounded-xl p-4 text-center border border-gray-700
                      ${idx === 0 ? 'transform scale-105 border-yellow-500/50' : ''}`}>
                      <Icon className={`w-8 h-8 mx-auto mb-2 ${colors[idx]}`} />
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 
                        flex items-center justify-center text-white text-xl font-bold mb-2">
                        {p.username?.charAt(0) || '?'}
                      </div>
                      <p className="font-bold text-white">{p.username || 'Anonymous'}</p>
                      <p className="text-yellow-400 font-semibold">{(p.total_points || 0).toLocaleString()} pts</p>
                    </div>
                  );
                })}
              </div>
            )}
            
            {players.length === 0 ? (
              <div className="bg-gray-800/50 rounded-xl p-8 text-center">
                <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No players on the leaderboard yet.</p>
                <p className="text-gray-500 text-sm mt-2">Play some games to get on the board!</p>
              </div>
            ) : (
              <LeaderboardTable players={players} sortBy={sortBy} />
            )}
          </>
        ) : (
          <>
            {achievements.length === 0 ? (
              <div className="bg-gray-800/50 rounded-xl p-8 text-center">
                <Award className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No achievements available yet.</p>
              </div>
            ) : (
              <AchievementsGrid achievements={achievements} earnedAchievements={[]} filter="all" />
            )}
          </>
        )}
      </div>
    </div>
  );
}
