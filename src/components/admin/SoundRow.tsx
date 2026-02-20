import React, { useRef } from 'react';
import { Play, Square, Upload, VolumeX, Volume1, Volume2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface SoundItem {
  key: string;
  label: string;
  keywords: string[];
  icon: string;
  color: string;
  url?: string;
  fileName?: string;
}

interface SoundRowProps {
  sound: SoundItem;
  volume: number;
  setVolume: (v: number) => void;
  isPlaying: boolean;
  onPlay: () => void;
  onReplace: (file: File) => void;
}

const SoundRow: React.FC<SoundRowProps> = ({ sound, volume, setVolume, isPlaying, onPlay, onReplace }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) onReplace(file);
    e.target.value = '';
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 50 ? Volume1 : Volume2;

  return (
    <div className={`relative overflow-hidden rounded-xl border-2 transition-all ${
      isPlaying ? 'border-indigo-500 shadow-lg shadow-indigo-500/20' : 'border-gray-200 dark:border-gray-700'
    }`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${sound.color} opacity-5`} />
      
      <div className="relative p-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${sound.color} flex items-center justify-center text-2xl shadow-lg`}>
          {sound.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold">{sound.label}</h3>
            {sound.url ? (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                <Check className="w-3 h-3" /> Ready
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                <X className="w-3 h-3" /> Missing
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">
            {sound.fileName || `Upload file with: ${sound.keywords.join(', ')}`}
          </p>
        </div>

        <div className="flex items-center gap-2 w-40">
          <VolumeIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <Slider value={[volume]} onValueChange={([v]) => setVolume(v)} max={100} className="flex-1" />
          <span className="text-xs w-8 text-right text-gray-500">{volume}%</span>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" variant={isPlaying ? 'default' : 'outline'} onClick={onPlay}
            disabled={!sound.url} className={isPlaying ? `bg-gradient-to-r ${sound.color}` : ''}>
            {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          
          <input ref={inputRef} type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
          <Button size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
            <Upload className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isPlaying && (
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div className={`h-full bg-gradient-to-r ${sound.color} animate-pulse`} style={{ width: '100%' }} />
        </div>
      )}
    </div>
  );
};

export default SoundRow;
