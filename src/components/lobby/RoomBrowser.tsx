import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { GameRoom } from '@/types/lobby';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Users, Play, Search, RefreshCw, Globe, Eye } from 'lucide-react';
import { games } from '@/data/gamesData';

interface Props {
  onJoinRoom: (code: string) => void;
  onSpectateRoom?: (code: string) => void;
  selectedGame: string;
  onSelectGame: (slug: string) => void;
}

const RoomBrowser: React.FC<Props> = ({ onJoinRoom, onSpectateRoom, selectedGame, onSelectGame }) => {
  const [rooms, setRooms] = useState<(GameRoom & { player_count: number; spectator_count: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('game_rooms').select('*').in('status', ['waiting', 'playing']).eq('is_private', false).order('created_at', { ascending: false }).limit(20);
      if (data) {
        const roomsWithCount = await Promise.all(data.map(async (room) => {
          const { count: playerCount } = await supabase.from('room_players').select('*', { count: 'exact', head: true }).eq('room_id', room.id);
          const { count: spectatorCount } = await supabase.from('room_spectators').select('*', { count: 'exact', head: true }).eq('room_id', room.id);
          return { ...room, player_count: playerCount || 0, spectator_count: spectatorCount || 0 };
        }));
        setRooms(roomsWithCount);
      }
    } catch (err) { console.error('Error:', err); }
    setLoading(false);
  };

  useEffect(() => { fetchRooms(); }, []);

  // Safety check for rooms array
  const safeRooms = Array.isArray(rooms) ? rooms : [];
  
  const filteredRooms = safeRooms.filter(room => {
    if (!room) return false;
    if (selectedGame && room.game_type !== selectedGame) return false;
    if (searchQuery && !room.host_name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const getGameName = (slug: string) => games.find(g => g.slug === slug)?.name || slug;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by host..." className="pl-10 bg-gray-700 border-gray-600 text-white" />
        </div>
        <Button onClick={fetchRooms} variant="outline" className="border-gray-600" disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button size="sm" variant={!selectedGame ? 'default' : 'outline'} onClick={() => onSelectGame('')} className={!selectedGame ? 'bg-purple-600' : 'border-gray-600'}>All</Button>
        {games.map(g => (
          <Button key={g.slug} size="sm" variant={selectedGame === g.slug ? 'default' : 'outline'} onClick={() => onSelectGame(g.slug)} className={selectedGame === g.slug ? 'bg-purple-600' : 'border-gray-600'}>{g.name}</Button>
        ))}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Globe className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No public rooms available</p>
          </div>
        ) : (
          filteredRooms.map(room => (
            <div key={room.id} className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${room.status === 'playing' ? 'bg-green-600/30' : 'bg-purple-600/30'}`}>
                  <Play className={`w-5 h-5 ${room.status === 'playing' ? 'text-green-400' : 'text-purple-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium">{getGameName(room.game_type)}</p>
                    {room.status === 'playing' && <span className="text-xs bg-green-600/30 text-green-300 px-2 py-0.5 rounded">Live</span>}
                  </div>
                  <p className="text-sm text-gray-400">Host: {room.host_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Users className="w-4 h-4" /><span>{room.player_count}/{room.max_players}</span>
                  {room.spectator_count > 0 && <><Eye className="w-4 h-4 ml-2" /><span>{room.spectator_count}</span></>}
                </div>
                <div className="flex gap-1">
                  {room.status === 'waiting' && room.player_count < room.max_players && (
                    <Button size="sm" onClick={() => onJoinRoom(room.room_code)} className="bg-green-600 hover:bg-green-700">Join</Button>
                  )}
                  {room.allow_spectators !== false && onSpectateRoom && (
                    <Button size="sm" variant="outline" onClick={() => onSpectateRoom(room.room_code)} className="border-blue-500 text-blue-400 hover:bg-blue-600/20">
                      <Eye className="w-4 h-4 mr-1" />Watch
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RoomBrowser;
