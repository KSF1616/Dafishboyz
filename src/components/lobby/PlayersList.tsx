import React from 'react';
import { RoomPlayer } from '@/types/lobby';
import { Crown, CheckCircle, Circle, Wifi, WifiOff, UserX, Loader2, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLobby } from '@/contexts/LobbyContext';
import { useBots } from '@/contexts/BotContext';
import { BotPlayer } from '@/types/bot';

interface Props {
  players?: RoomPlayer[] | null;
  currentTurn?: number;
  isPlaying?: boolean;
  currentPlayerId?: string;
  isLoading?: boolean;
}

const PlayersList: React.FC<Props> = ({ 
  players, 
  currentTurn = 0, 
  isPlaying = false, 
  currentPlayerId = '',
  isLoading = false
}) => {
  const { currentRoom, kickPlayer } = useLobby();
  const { bots, removeBot, isBotPlayer } = useBots();
  const isHost = currentRoom?.host_id === currentPlayerId;
  
  // Safety check for players array - handle undefined, null, and non-array values
  const safePlayers = Array.isArray(players) ? players : [];
  
  // Combine real players with bots
  const allPlayers = [
    ...safePlayers,
    ...bots.map((bot, idx) => ({
      id: bot.id,
      room_id: currentRoom?.id || '',
      player_id: bot.id,
      player_name: bot.name,
      is_host: false,
      is_ready: true,
      is_connected: true,
      player_order: safePlayers.length + idx,
      score: bot.score,
      player_data: bot.playerData,
      joined_at: new Date().toISOString(),
      last_seen_at: new Date().toISOString(),
      isBot: true,
      botData: bot
    } as RoomPlayer & { isBot: boolean; botData: BotPlayer }))
  ];

  const handleKick = (playerId: string) => {
    if (isBotPlayer(playerId)) {
      removeBot(playerId);
    } else if (confirm('Are you sure you want to kick this player?')) {
      kickPlayer(playerId);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <span>Players</span>
        </h3>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
          <span className="ml-2 text-gray-400">Loading players...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <span>Players</span>
        <span className="text-sm text-gray-400">({allPlayers.length}/{currentRoom?.max_players || 4})</span>
      </h3>
      <div className="space-y-2">
        {allPlayers.length === 0 ? (
          <div className="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-gray-600 text-gray-500">
            No players yet...
          </div>
        ) : (
          allPlayers.map((player: any, idx) => {
            // Skip null/undefined players
            if (!player) return null;
            
            const isBot = player.isBot || isBotPlayer(player.player_id);
            const botData = player.botData as BotPlayer | undefined;
            
            return (
              <div
                key={player.player_id || `player-${idx}`}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  isPlaying && currentTurn === idx
                    ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50'
                    : isBot 
                      ? 'bg-cyan-900/20 border border-cyan-700/30'
                      : 'bg-gray-700/50'
                } ${player.player_id === currentPlayerId ? 'ring-2 ring-purple-500' : ''}`}
              >

                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold relative ${
                    isBot 
                      ? 'bg-cyan-600' 
                      : ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'][idx % 4]
                  }`}>
                    {isBot ? (
                      botData?.avatar || <Bot className="w-5 h-5" />
                    ) : (
                      player.player_name?.charAt(0)?.toUpperCase() || '?'
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                      isBot ? 'bg-cyan-400' : player.is_connected ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      {isBot && <Bot className="w-2 h-2 text-gray-900 absolute top-0.5 left-0.5" />}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{player.player_name || 'Unknown'}</span>
                      {player.is_host && <Crown className="w-4 h-4 text-yellow-400" />}
                      {isBot && (
                        <span className="text-xs bg-cyan-600/30 text-cyan-300 px-1.5 py-0.5 rounded flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          Bot
                        </span>
                      )}
                      {player.player_id === currentPlayerId && (
                        <span className="text-xs text-purple-400">(You)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isPlaying && currentTurn === idx && (
                        <span className="text-xs text-yellow-400">Current Turn</span>
                      )}
                      {isPlaying && (player.score || 0) > 0 && (
                        <span className="text-xs text-green-400">Score: {player.score}</span>
                      )}
                      {isBot && botData && (
                        <span className="text-xs text-gray-400 capitalize">{botData.difficulty} • {botData.personality}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isPlaying && (
                    <div className="flex items-center gap-1">
                      {player.is_ready || player.is_host || isBot ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500" />
                      )}
                      <span className={`text-sm ${player.is_ready || player.is_host || isBot ? 'text-green-400' : 'text-gray-500'}`}>
                        {player.is_host ? 'Host' : isBot ? 'Ready' : player.is_ready ? 'Ready' : 'Not Ready'}
                      </span>
                    </div>
                  )}
                  {isHost && !player.is_host && player.player_id !== currentPlayerId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleKick(player.player_id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-1"
                      title={isBot ? 'Remove Bot' : 'Kick Player'}
                    >
                      <UserX className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
        {allPlayers.length < (currentRoom?.max_players || 4) && allPlayers.length > 0 && (
          <div className="flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-gray-600 text-gray-500">
            Waiting for players...
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersList;
