import React, { useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music, ListMusic, Disc3 } from 'lucide-react';
import { usePartyMode } from '@/contexts/PartyModeContext';
import { PartyPlaylist as PlaylistType } from '@/types/partyMode';

interface PartyPlaylistProps {
  compact?: boolean;
}

const PartyPlaylist: React.FC<PartyPlaylistProps> = ({ compact = false }) => {
  const { 
    state, 
    playlists, 
    setPlaylist, 
    playMusic, 
    pauseMusic, 
    nextTrack, 
    prevTrack,
    setVolume 
  } = usePartyMode();
  
  const [showPlaylists, setShowPlaylists] = useState(false);
  
  const { currentPlaylist, currentTrackIndex, isPlaying, volume, currentTheme } = state;
  const currentTrack = currentPlaylist?.tracks[currentTrackIndex];
  
  const handlePlayPause = () => {
    if (isPlaying) {
      pauseMusic();
    } else {
      playMusic();
    }
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };
  
  const selectPlaylist = (playlist: PlaylistType) => {
    setPlaylist(playlist);
    setShowPlaylists(false);
  };
  
  if (compact) {
    return (
      <div 
        className="rounded-xl p-4 text-white"
        style={{
          background: `linear-gradient(135deg, ${currentTheme.primaryColor}80, ${currentTheme.secondaryColor}80)`
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlayPause}
            disabled={!currentPlaylist}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              currentPlaylist 
                ? 'bg-white/20 hover:bg-white/30' 
                : 'bg-white/10 cursor-not-allowed'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          
          <div className="flex-1 min-w-0">
            {currentTrack ? (
              <>
                <p className="font-bold text-sm truncate">{currentTrack.name}</p>
                <p className="text-white/60 text-xs truncate">{currentTrack.artist}</p>
              </>
            ) : (
              <p className="text-white/60 text-sm">Select a playlist</p>
            )}
          </div>
          
          <button
            onClick={() => setShowPlaylists(!showPlaylists)}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all"
          >
            <ListMusic className="w-5 h-5" />
          </button>
        </div>
        
        {showPlaylists && (
          <div className="mt-3 space-y-2">
            {playlists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={() => selectPlaylist(playlist)}
                className={`w-full p-2 rounded-lg text-left flex items-center gap-2 transition-all ${
                  currentPlaylist?.id === playlist.id
                    ? 'bg-white/30'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <span>{playlist.icon}</span>
                <span className="text-sm font-medium">{playlist.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.secondaryColor})`
          }}
        >
          <Music className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-white font-bold text-lg">Party Playlist</h3>
          <p className="text-gray-400 text-sm">
            {currentPlaylist ? currentPlaylist.name : 'Select a playlist'}
          </p>
        </div>
      </div>
      
      {/* Playlist Selection */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {playlists.map((playlist) => (
          <button
            key={playlist.id}
            onClick={() => selectPlaylist(playlist)}
            className={`p-4 rounded-xl text-left transition-all ${
              currentPlaylist?.id === playlist.id
                ? 'bg-gradient-to-br ring-2 ring-white'
                : 'bg-white/5 hover:bg-white/10'
            }`}
            style={currentPlaylist?.id === playlist.id ? {
              background: `linear-gradient(135deg, ${currentTheme.primaryColor}40, ${currentTheme.secondaryColor}40)`
            } : {}}
          >
            <div className="text-2xl mb-2">{playlist.icon}</div>
            <p className="text-white font-bold text-sm">{playlist.name}</p>
            <p className="text-gray-400 text-xs">{playlist.tracks.length} tracks</p>
          </button>
        ))}
      </div>
      
      {/* Now Playing */}
      {currentPlaylist && (
        <div 
          className="rounded-xl p-4 mb-4"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.primaryColor}30, ${currentTheme.secondaryColor}30)`
          }}
        >
          <div className="flex items-center gap-4">
            {/* Album Art / Visualizer */}
            <div 
              className="w-16 h-16 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.secondaryColor})`
              }}
            >
              {isPlaying ? (
                <Disc3 className="w-10 h-10 text-white animate-spin" style={{ animationDuration: '2s' }} />
              ) : (
                <Music className="w-8 h-8 text-white" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold truncate">
                {currentTrack?.name || 'No track selected'}
              </p>
              <p className="text-gray-400 text-sm truncate">
                {currentTrack?.artist || 'Unknown artist'}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500">
                  {currentTrack?.bpm} BPM
                </span>
                <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-gray-400 capitalize">
                  {currentTrack?.mood}
                </span>
              </div>
            </div>
          </div>
          
          {/* Track Progress Indicator */}
          {isPlaying && (
            <div className="flex items-center justify-center gap-1 mt-4">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-white/60 rounded-full animate-pulse"
                  style={{
                    height: `${10 + Math.random() * 20}px`,
                    animationDelay: `${i * 0.05}s`,
                    animationDuration: '0.5s'
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <button
          onClick={prevTrack}
          disabled={!currentPlaylist}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            currentPlaylist 
              ? 'bg-white/10 hover:bg-white/20' 
              : 'bg-white/5 cursor-not-allowed'
          }`}
        >
          <SkipBack className="w-5 h-5 text-white" />
        </button>
        
        <button
          onClick={handlePlayPause}
          disabled={!currentPlaylist}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-105 ${
            currentPlaylist
              ? isPlaying 
                ? 'bg-red-500 hover:bg-red-400' 
                : 'bg-green-500 hover:bg-green-400'
              : 'bg-gray-700 cursor-not-allowed'
          }`}
        >
          {isPlaying ? (
            <Pause className="w-8 h-8 text-white" />
          ) : (
            <Play className="w-8 h-8 text-white ml-1" />
          )}
        </button>
        
        <button
          onClick={nextTrack}
          disabled={!currentPlaylist}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            currentPlaylist 
              ? 'bg-white/10 hover:bg-white/20' 
              : 'bg-white/5 cursor-not-allowed'
          }`}
        >
          <SkipForward className="w-5 h-5 text-white" />
        </button>
      </div>
      
      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setVolume(volume === 0 ? 0.7 : 0)}
          className="p-2 hover:bg-white/10 rounded-lg transition-all"
        >
          {volume === 0 ? (
            <VolumeX className="w-5 h-5 text-gray-400" />
          ) : (
            <Volume2 className="w-5 h-5 text-white" />
          )}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 h-2 bg-white/20 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${currentTheme.primaryColor} ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%)`
          }}
        />
        
        <span className="text-gray-400 text-sm w-10 text-right">
          {Math.round(volume * 100)}%
        </span>
      </div>
      
      {/* Track List */}
      {currentPlaylist && (
        <div className="mt-4">
          <p className="text-gray-400 text-sm mb-2">Tracks</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {currentPlaylist.tracks.map((track, index) => (
              <div
                key={track.id}
                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                  index === currentTrackIndex
                    ? 'bg-white/10'
                    : 'hover:bg-white/5'
                }`}
              >
                <span className="text-gray-500 text-sm w-6">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm truncate ${
                    index === currentTrackIndex ? 'text-white font-medium' : 'text-gray-300'
                  }`}>
                    {track.name}
                  </p>
                </div>
                <span className="text-gray-500 text-xs">{track.duration}s</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PartyPlaylist;
