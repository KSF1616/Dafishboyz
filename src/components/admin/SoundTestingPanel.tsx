import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Square, Upload, RefreshCw, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import SoundRow from './SoundRow';


interface SoundItem {
  key: string;
  label: string;
  keywords: string[];
  icon: string;
  color: string;
  url?: string;
  fileName?: string;
}

const SOUND_CATEGORIES: SoundItem[] = [
  { key: 'fart', label: 'Fart Sound', keywords: ['fart', 'toot'], icon: '💨', color: 'from-green-500 to-emerald-600' },
  { key: 'flush', label: 'Toilet Flush', keywords: ['flush', 'toilet'], icon: '🚽', color: 'from-blue-500 to-cyan-600' },
  { key: 'splash', label: 'Splash', keywords: ['splash', 'water'], icon: '💦', color: 'from-cyan-500 to-teal-600' },
  { key: 'bubbles', label: 'Bubbles', keywords: ['bubble', 'gurgle'], icon: '🫧', color: 'from-purple-500 to-violet-600' },
  { key: 'dice', label: 'Dice Roll', keywords: ['dice', 'roll'], icon: '🎲', color: 'from-orange-500 to-amber-600' },
  { key: 'victory', label: 'Victory', keywords: ['victory', 'win', 'fanfare'], icon: '🏆', color: 'from-yellow-500 to-amber-600' },
];

const SoundTestingPanel: React.FC = () => {
  const [sounds, setSounds] = useState<SoundItem[]>(SOUND_CATEGORIES);
  const [masterVolume, setMasterVolume] = useState(70);
  const [volumes, setVolumes] = useState<Record<string, number>>({});
  const [playing, setPlaying] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadSounds();
    const initial: Record<string, number> = {};
    SOUND_CATEGORIES.forEach(s => initial[s.key] = 70);
    setVolumes(initial);
  }, []);

  const loadSounds = async () => {
    setLoading(true);
    const { data } = await supabase.storage.from('audio').list();
    if (data) {
      const updated = SOUND_CATEGORIES.map(cat => {
        const file = data.find(f => cat.keywords.some(k => f.name.toLowerCase().includes(k)));
        if (file) {
          const { data: urlData } = supabase.storage.from('audio').getPublicUrl(file.name);
          return { ...cat, url: urlData.publicUrl, fileName: file.name };
        }
        return cat;
      });
      setSounds(updated);
    }
    setLoading(false);
  };

  const playSound = (sound: SoundItem) => {
    if (!sound.url) return toast({ title: 'No sound', description: 'Upload a sound first', variant: 'destructive' });
    if (playing === sound.key) { audioRef.current?.pause(); setPlaying(null); return; }
    audioRef.current?.pause();
    audioRef.current = new Audio(sound.url);
    audioRef.current.volume = (volumes[sound.key] / 100) * (masterVolume / 100);
    audioRef.current.play();
    setPlaying(sound.key);
    audioRef.current.onended = () => setPlaying(null);
  };

  const handleReplace = async (key: string, file: File) => {
    const sound = sounds.find(s => s.key === key);
    if (sound?.fileName) await supabase.storage.from('audio').remove([sound.fileName]);
    const newName = `${key}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('audio').upload(newName, file, { upsert: true });
    if (error) toast({ title: 'Upload failed', variant: 'destructive' });
    else { toast({ title: 'Sound replaced!' }); loadSounds(); }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
            <Wand2 className="w-8 h-8 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Sound Effects Testing</h2>
            <p className="text-gray-500">Preview, test volumes, and replace game sounds</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={loadSounds} disabled={loading}>
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
        <div className="flex items-center gap-4">
          <Volume2 className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium w-28">Master Volume</span>
          <Slider value={[masterVolume]} onValueChange={([v]) => setMasterVolume(v)} max={100} className="flex-1" />
          <span className="text-sm w-10 text-right">{masterVolume}%</span>
        </div>
      </div>

      <div className="grid gap-4">
        {sounds.map(sound => (
          <SoundRow key={sound.key} sound={sound} volume={volumes[sound.key] || 70}
            setVolume={(v) => setVolumes(prev => ({ ...prev, [sound.key]: v }))}
            isPlaying={playing === sound.key} onPlay={() => playSound(sound)}
            onReplace={(f) => handleReplace(sound.key, f)} />
        ))}
      </div>
    </div>
  );
};

export default SoundTestingPanel;
