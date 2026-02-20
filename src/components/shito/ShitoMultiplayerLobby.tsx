import React, { useState } from 'react';
import { Users, Copy, Check, Play, ArrowLeft, Link2, Share2 } from 'lucide-react';
import { ShitoRoom, ShitoPlayer } from '@/types/shitoMultiplayer';

interface ShitoMultiplayerLobbyProps {
  room: ShitoRoom;
  players: ShitoPlayer[];
  isHost: boolean;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

const ShitoMultiplayerLobby: React.FC<ShitoMultiplayerLobbyProps> = ({
  room,
  players,
  isHost,
  onStartGame,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const shareUrl = `${window.location.origin}/adult-shito?room=${room.room_code}`;

  const copyCode = () => {
    navigator.clipboard.writeText(room.room_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareGame = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Adult SHITO game!',
          text: `Join my Adult SHITO game with code: ${room.room_code}`,
          url: shareUrl,
        });
      } catch (err) {
        copyLink();
      }
    } else {
      copyLink();
    }
  };

  const connectedPlayers = players.filter(p => p.is_connected);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-red-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onLeaveRoom}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
              Leave
            </button>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span className="font-bold">{connectedPlayers.length} Players</span>
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-center mb-2">Game Lobby</h2>
          <p className="text-white/80 text-center">Waiting for players to join...</p>
        </div>

        {/* Room Code Section */}
        <div className="p-6 border-b border-white/10">
          <div className="text-center mb-4">
            <p className="text-pink-300 text-sm mb-2">Share this code with friends:</p>
            <div className="flex items-center justify-center gap-3">
              <div className="bg-white/20 rounded-2xl px-8 py-4">
                <span className="text-4xl font-black tracking-widest text-white">
                  {room.room_code}
                </span>
              </div>
              <button
                onClick={copyCode}
                className="p-4 bg-pink-500 hover:bg-pink-400 rounded-xl transition-all"
              >
                {copied ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <Copy className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Share Options */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
            <button
              onClick={copyLink}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
            >
              <Link2 className="w-5 h-5" />
              {copiedLink ? 'Link Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={shareGame}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
            >
              <Share2 className="w-5 h-5" />
              Share Game
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-pink-400" />
            Players in Lobby
          </h3>
          
          <div className="space-y-3">
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-xl ${
                  player.is_connected
                    ? 'bg-white/10'
                    : 'bg-white/5 opacity-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    player.is_host ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : 'bg-gradient-to-r from-pink-500 to-purple-500'
                  }`}>
                    {player.player_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white">{player.player_name}</p>
                    <p className="text-sm text-white/60">
                      {player.is_host ? 'Host' : 'Player'}
                      {!player.is_connected && ' (Disconnected)'}
                    </p>
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${
                  player.is_connected ? 'bg-green-500' : 'bg-gray-500'
                }`} />
              </div>
            ))}
          </div>

          {connectedPlayers.length < 2 && (
            <p className="text-center text-pink-300/70 mt-4 text-sm">
              Waiting for at least 2 players to start...
            </p>
          )}
        </div>

        {/* Start Game Button (Host Only) */}
        {isHost && (
          <div className="p-6 bg-white/5">
            <button
              onClick={onStartGame}
              disabled={connectedPlayers.length < 2}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-black text-xl rounded-2xl transition-all transform hover:scale-105 disabled:hover:scale-100"
            >
              <Play className="w-6 h-6" />
              Start Game
            </button>
            {connectedPlayers.length < 2 && (
              <p className="text-center text-white/50 mt-2 text-sm">
                Need at least 2 players to start
              </p>
            )}
          </div>
        )}

        {!isHost && (
          <div className="p-6 bg-white/5 text-center">
            <p className="text-white/70">
              Waiting for {room.host_name} to start the game...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShitoMultiplayerLobby;
