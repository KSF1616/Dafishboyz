import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { GameRoom } from '@/types/lobby';
import { games } from '@/data/gamesData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Users, 
  Play, 
  Search, 
  RefreshCw, 
  ArrowLeft, 
  Tv, 
  Flame, 
  Clock, 
  Filter,
  ChevronDown,
  Star,
  TrendingUp,
  Radio,
  Gamepad2,
  Volume2,
  VolumeX,
  Wine,
  Zap
} from 'lucide-react';
import { Bot } from 'lucide-react';

interface LiveGame extends GameRoom {
  player_count: number;
  spectator_count: number;
  game_image?: string;
  game_name?: string;
  duration_minutes?: number;
  has_drinking_mode?: boolean;
  has_bots?: boolean;
}


const Spectator: React.FC = () => {
  const navigate = useNavigate();
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [filteredGames, setFilteredGames] = useState<LiveGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGameType, setSelectedGameType] = useState<string>('');
  const [sortBy, setSortBy] = useState<'viewers' | 'newest' | 'players'>('viewers');
  const [spectatorName, setSpectatorName] = useState(localStorage.getItem('spectatorName') || '');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch live games
  const fetchLiveGames = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('game_rooms')
        .select('*')
        .in('status', ['playing', 'waiting'])
        .eq('is_private', false)
        .eq('allow_spectators', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        const gamesWithCounts = await Promise.all(
          data.map(async (room) => {
            const { count: playerCount } = await supabase
              .from('room_players')
              .select('*', { count: 'exact', head: true })
              .eq('room_id', room.id);
            
            const { count: spectatorCount } = await supabase
              .from('room_spectators')
              .select('*', { count: 'exact', head: true })
              .eq('room_id', room.id);

            const gameInfo = games.find(g => g.slug === room.game_type);
            const startTime = room.started_at ? new Date(room.started_at) : new Date(room.created_at);
            const durationMinutes = Math.floor((Date.now() - startTime.getTime()) / 60000);

            return {
              ...room,
              player_count: playerCount || 0,
              spectator_count: spectatorCount || 0,
              game_image: gameInfo?.image,
              game_name: gameInfo?.name || room.game_type,
              duration_minutes: durationMinutes,
              has_drinking_mode: room.settings?.drinking_mode || false
            };
          })
        );
        setLiveGames(gamesWithCounts);
      }
    } catch (err) {
      console.error('Error fetching live games:', err);
    }
    setLoading(false);
  };

  // Set up real-time subscription for game updates
  useEffect(() => {
    fetchLiveGames();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('spectator-live-games')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'game_rooms' },
        () => {
          // Refetch when any game room changes
          fetchLiveGames();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_players' },
        () => {
          // Refetch when players change
          fetchLiveGames();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'room_spectators' },
        () => {
          // Refetch when spectators change
          fetchLiveGames();
        }
      )
      .subscribe();

    // Auto-refresh every 30 seconds as backup
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchLiveGames, 30000);
    }
    
    return () => {
      supabase.removeChannel(channel);
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);



  // Filter and sort games
  useEffect(() => {
    let filtered = [...liveGames];

    // Filter by game type
    if (selectedGameType) {
      filtered = filtered.filter(g => g.game_type === selectedGameType);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(g => 
        g.host_name?.toLowerCase().includes(query) ||
        g.game_name?.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'viewers':
        filtered.sort((a, b) => b.spectator_count - a.spectator_count);
        break;
      case 'players':
        filtered.sort((a, b) => b.player_count - a.player_count);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    setFilteredGames(filtered);
  }, [liveGames, selectedGameType, searchQuery, sortBy]);

  const handleWatchGame = (roomCode: string) => {
    if (!spectatorName.trim()) {
      setSelectedRoom(roomCode);
      setShowNamePrompt(true);
      return;
    }
    localStorage.setItem('spectatorName', spectatorName);
    navigate(`/lobby?code=${roomCode}&spectate=true&name=${encodeURIComponent(spectatorName)}`);
  };

  const confirmWatch = () => {
    if (spectatorName.trim() && selectedRoom) {
      localStorage.setItem('spectatorName', spectatorName);
      navigate(`/lobby?code=${selectedRoom}&spectate=true&name=${encodeURIComponent(spectatorName)}`);
    }
  };

  const getGameTypeColor = (gameType: string) => {
    const colors: Record<string, string> = {
      'up-shitz-creek': 'from-blue-600 to-cyan-500',
      'o-craps': 'from-red-600 to-orange-500',
      'shito': 'from-purple-600 to-pink-500',
      'slanging-shit': 'from-green-600 to-emerald-500',
      'let-that-shit-go': 'from-amber-600 to-yellow-500',
      'drop-deuce': 'from-pink-600 to-rose-500'
    };
    return colors[gameType] || 'from-gray-600 to-gray-500';
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return 'Just started';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Featured games (most viewers)
  const featuredGames = [...liveGames]
    .filter(g => g.status === 'playing')
    .sort((a, b) => b.spectator_count - a.spectator_count)
    .slice(0, 3);

  // Stats
  const totalViewers = liveGames.reduce((sum, g) => sum + g.spectator_count, 0);
  const totalPlayers = liveGames.reduce((sum, g) => sum + g.player_count, 0);
  const liveCount = liveGames.filter(g => g.status === 'playing').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900">
      {/* Header */}
      <div className="bg-black/50 border-b border-purple-500/30 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/')} 
                className="text-gray-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Tv className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Spectator Mode</h1>
                  <p className="text-xs text-gray-400">Watch live games</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`border-gray-600 ${autoRefresh ? 'text-green-400' : 'text-gray-400'}`}
              >
                <Radio className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-pulse' : ''}`} />
                {autoRefresh ? 'Live' : 'Paused'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLiveGames}
                disabled={loading}
                className="border-gray-600"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <Radio className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{liveCount}</p>
                <p className="text-xs text-gray-400">Live Games</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalViewers}</p>
                <p className="text-xs text-gray-400">Watching</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{totalPlayers}</p>
                <p className="text-xs text-gray-400">Players</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{liveGames.length}</p>
                <p className="text-xs text-gray-400">Total Rooms</p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Games */}
        {featuredGames.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-bold text-white">Featured Live Games</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {featuredGames.map((game, index) => (
                <div 
                  key={game.id}
                  className="relative bg-gray-800 rounded-xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all group cursor-pointer"
                  onClick={() => handleWatchGame(game.room_code)}
                >
                  {/* Game Image */}
                  <div className="relative h-40 overflow-hidden">
                    {game.game_image ? (
                      <img 
                        src={game.game_image} 
                        alt={game.game_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-br ${getGameTypeColor(game.game_type)}`} />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Live Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        LIVE
                      </span>
                      {index === 0 && (
                        <span className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-black text-xs font-bold rounded-full">
                          <Star className="w-3 h-3" />
                          TOP
                        </span>
                      )}
                    </div>

                    {/* Viewer Count */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 text-white text-xs rounded-full">
                      <Eye className="w-3 h-3" />
                      {game.spectator_count}
                    </div>

                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                  </div>

                  {/* Game Info */}
                  <div className="p-4">
                    <h3 className="font-bold text-white mb-1">{game.game_name}</h3>
                    <p className="text-sm text-gray-400 mb-3">Hosted by {game.host_name}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {game.player_count}/{game.max_players}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDuration(game.duration_minutes || 0)}
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                        Playing
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700/50">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by host or game..."
                className="pl-10 bg-gray-700 border-gray-600 text-white"
              />
            </div>

            {/* Game Type Filter */}
            <div className="flex gap-2 flex-wrap">
              <Button
                size="sm"
                variant={!selectedGameType ? 'default' : 'outline'}
                onClick={() => setSelectedGameType('')}
                className={!selectedGameType ? 'bg-purple-600' : 'border-gray-600'}
              >
                All Games
              </Button>
              {games.map(g => (
                <Button
                  key={g.slug}
                  size="sm"
                  variant={selectedGameType === g.slug ? 'default' : 'outline'}
                  onClick={() => setSelectedGameType(g.slug)}
                  className={selectedGameType === g.slug ? 'bg-purple-600' : 'border-gray-600'}
                >
                  {g.name}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2 text-sm"
            >
              <option value="viewers">Most Viewers</option>
              <option value="players">Most Players</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        {/* All Games Grid */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            All Live Games
            <span className="text-sm font-normal text-gray-400">({filteredGames.length})</span>
          </h2>
        </div>

        {loading && liveGames.length === 0 ? (
          <div className="text-center py-16">
            <RefreshCw className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-spin" />
            <p className="text-gray-400">Loading live games...</p>
          </div>
        ) : filteredGames.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/30 rounded-xl border border-gray-700/50">
            <Tv className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Live Games</h3>
            <p className="text-gray-400 mb-6">
              {selectedGameType || searchQuery 
                ? 'No games match your filters. Try adjusting your search.'
                : 'No one is playing right now. Be the first to start a game!'}
            </p>
            <Button 
              onClick={() => navigate('/lobby')}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Play className="w-4 h-4 mr-2" />
              Start a Game
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredGames.map(game => (
              <div 
                key={game.id}
                className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all group"
              >
                {/* Game Thumbnail */}
                <div className="relative h-32 overflow-hidden">
                  {game.game_image ? (
                    <img 
                      src={game.game_image} 
                      alt={game.game_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${getGameTypeColor(game.game_type)}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    {game.status === 'playing' ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-600 text-white text-xs font-bold rounded-full">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        LIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-yellow-600 text-white text-xs font-bold rounded-full">
                        WAITING
                      </span>
                    )}
                  </div>

                  {/* Viewer Count */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 text-white text-xs rounded-full">
                    <Eye className="w-3 h-3" />
                    {game.spectator_count}
                  </div>

                  {/* Game Name Overlay */}
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white font-bold text-sm truncate">{game.game_name}</p>
                  </div>
                </div>

                {/* Game Details */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-gray-300 truncate">Host: {game.host_name}</p>
                    <span className="text-xs text-gray-500">{game.room_code}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {game.player_count}/{game.max_players} players
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(game.duration_minutes || 0)}
                    </span>
                  </div>

                  <Button
                    onClick={() => handleWatchGame(game.room_code)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Watch Game
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-12 bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400" />
            Spectator Tips
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Eye className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Watch & Learn</p>
                <p className="text-xs text-gray-400">Observe strategies from experienced players before joining.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Volume2 className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Chat with Others</p>
                <p className="text-xs text-gray-400">Join the spectator chat to discuss the game with other viewers.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Play className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">Join Anytime</p>
                <p className="text-xs text-gray-400">If a spot opens up, you can request to join as a player.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-purple-500/30">
            <h3 className="text-xl font-bold text-white mb-2">Enter Your Name</h3>
            <p className="text-gray-400 text-sm mb-4">Choose a display name for spectating.</p>
            <Input
              value={spectatorName}
              onChange={(e) => setSpectatorName(e.target.value)}
              placeholder="Your name"
              className="bg-gray-700 border-gray-600 text-white mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowNamePrompt(false)}
                className="flex-1 border-gray-600"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmWatch}
                disabled={!spectatorName.trim()}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                <Eye className="w-4 h-4 mr-2" />
                Start Watching
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Spectator;
