import React, { useEffect } from 'react';
import { useVoiceChat } from '@/contexts/VoiceChatContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mic, MicOff, Phone, PhoneOff, Settings, Radio, Hand } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import VoicePlayerControls from './VoicePlayerControls';

interface VoiceChatPanelProps {
  roomId: string;
  playerId: string;
  playerName: string;
}

const VoiceChatPanel: React.FC<VoiceChatPanelProps> = ({ roomId, playerId, playerName }) => {
  const {
    isConnected, isMuted, isPushToTalkActive, participants, settings,
    joinVoiceChat, leaveVoiceChat, toggleMute, setPlayerVolume, mutePlayer,
    updateSettings, startPushToTalk, stopPushToTalk
  } = useVoiceChat();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { if (e.code === 'Space' && !e.repeat && settings.mode === 'push-to-talk' && isConnected) { e.preventDefault(); startPushToTalk(); } };
    const handleKeyUp = (e: KeyboardEvent) => { if (e.code === 'Space' && settings.mode === 'push-to-talk' && isConnected) { e.preventDefault(); stopPushToTalk(); } };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [settings.mode, isConnected, startPushToTalk, stopPushToTalk]);

  const handleConnect = () => isConnected ? leaveVoiceChat() : joinVoiceChat(roomId, playerId, playerName);

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Radio className="w-5 h-5 text-purple-400" /> Voice Chat
        </h3>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" className="text-gray-400"><Settings className="w-4 h-4" /></Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 bg-gray-800 border-gray-700">
              <div className="space-y-4">
                <h4 className="font-medium text-white">Voice Settings</h4>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Mode</Label>
                  <div className="flex gap-2">
                    <Button size="sm" variant={settings.mode === 'push-to-talk' ? 'default' : 'outline'} onClick={() => updateSettings({ mode: 'push-to-talk' })} className={settings.mode === 'push-to-talk' ? 'bg-purple-600' : 'border-gray-600 text-gray-300'}>
                      <Hand className="w-3 h-3 mr-1" /> PTT
                    </Button>
                    <Button size="sm" variant={settings.mode === 'voice-activation' ? 'default' : 'outline'} onClick={() => updateSettings({ mode: 'voice-activation' })} className={settings.mode === 'voice-activation' ? 'bg-purple-600' : 'border-gray-600 text-gray-300'}>
                      <Mic className="w-3 h-3 mr-1" /> Voice
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Input Volume</Label>
                  <Slider value={[settings.inputVolume]} onValueChange={([v]) => updateSettings({ inputVolume: v })} max={100} />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Output Volume</Label>
                  <Slider value={[settings.outputVolume]} onValueChange={([v]) => updateSettings({ outputVolume: v })} max={100} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Noise Suppression</Label>
                  <Switch checked={settings.noiseSuppression} onCheckedChange={(v) => updateSettings({ noiseSuppression: v })} />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300">Echo Cancellation</Label>
                  <Switch checked={settings.echoCancellation} onCheckedChange={(v) => updateSettings({ echoCancellation: v })} />
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <Button onClick={handleConnect} className={`flex-1 ${isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
          {isConnected ? <><PhoneOff className="w-4 h-4 mr-2" /> Disconnect</> : <><Phone className="w-4 h-4 mr-2" /> Connect</>}
        </Button>
        {isConnected && (
          <Button onClick={toggleMute} variant="outline" className={`${isMuted ? 'border-red-500 text-red-400' : 'border-gray-600 text-gray-300'}`}>
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        )}
      </div>

      {isConnected && settings.mode === 'push-to-talk' && (
        <div className={`mb-4 p-3 rounded-lg text-center ${isPushToTalkActive ? 'bg-green-900/50 border border-green-500' : 'bg-gray-700/50 border border-gray-600'}`}>
          <p className="text-sm text-gray-300">{isPushToTalkActive ? 'Transmitting...' : 'Hold SPACE to talk'}</p>
        </div>
      )}

      {isConnected && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400 mb-2">Participants ({participants.length})</p>
          {participants.map(p => (
            <VoicePlayerControls key={p.odplayerId} participant={p} isLocalPlayer={p.odplayerId === playerId} onVolumeChange={(v) => setPlayerVolume(p.odplayerId, v)} onMuteToggle={(m) => mutePlayer(p.odplayerId, m)} />
          ))}
        </div>
      )}

      {!isConnected && <p className="text-center text-gray-500 text-sm py-4">Click Connect to join voice chat</p>}
    </div>
  );
};

export default VoiceChatPanel;
