import React from 'react';
import { VoiceParticipant } from '@/types/voiceChat';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

interface VoicePlayerControlsProps {
  participant: VoiceParticipant;
  isLocalPlayer: boolean;
  onVolumeChange: (volume: number) => void;
  onMuteToggle: (muted: boolean) => void;
}

const VoicePlayerControls: React.FC<VoicePlayerControlsProps> = ({
  participant,
  isLocalPlayer,
  onVolumeChange,
  onMuteToggle
}) => {
  const speakingClass = participant.isSpeaking ? 'ring-2 ring-green-500 ring-offset-2 ring-offset-gray-800' : '';
  
  return (
    <div className={`flex items-center gap-3 p-3 bg-gray-700/50 rounded-lg ${speakingClass} transition-all`}>
      <div className="relative">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
          participant.isConnected ? 'bg-gradient-to-br from-purple-500 to-pink-500' : 'bg-gray-600'
        }`}>
          {participant.playerName.charAt(0).toUpperCase()}
        </div>
        {participant.isSpeaking && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium truncate text-sm">
          {participant.playerName}
          {isLocalPlayer && <span className="text-gray-400 ml-1">(You)</span>}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {participant.isMuted ? (
            <MicOff className="w-3 h-3 text-red-400" />
          ) : (
            <Mic className="w-3 h-3 text-green-400" />
          )}
          <span className="text-xs text-gray-400">
            {participant.isMuted ? 'Muted' : participant.isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>
      
      {!isLocalPlayer && (
        <div className="flex items-center gap-2">
          <div className="w-20">
            <Slider
              value={[participant.volume]}
              onValueChange={([v]) => onVolumeChange(v)}
              max={100}
              step={1}
              className="cursor-pointer"
            />
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onMuteToggle(!participant.isMuted)}
            className={participant.isMuted ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-white'}
          >
            {participant.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VoicePlayerControls;
