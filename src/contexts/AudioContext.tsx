import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

interface AudioContextType {
  playIntro: () => void;
  playWinSound: () => void;
  playDiceRoll: () => void;
  playTimerBeep: () => void;
  playVictory: () => void;
  playFart: () => void;
  playToiletFlush: () => void;
  playSplash: () => void;
  playBubbles: () => void;
  playDafishBoyz: () => void;
  speakText: (text: string) => void;
  stopAll: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  isLoaded: boolean;
  speechEnabled: boolean;
  toggleSpeech: () => void;
  audioStatus: Record<string, boolean>;
}

const AudioCtx = createContext<AudioContextType>({
  playIntro: () => {}, playWinSound: () => {}, playDiceRoll: () => {}, playTimerBeep: () => {},
  playVictory: () => {}, playFart: () => {}, playToiletFlush: () => {}, playSplash: () => {},
  playBubbles: () => {}, playDafishBoyz: () => {}, speakText: () => {}, stopAll: () => {}, isMuted: false, toggleMute: () => {},
  isLoaded: false, speechEnabled: true, toggleSpeech: () => {}, audioStatus: {}
});

export const useAudio = () => useContext(AudioCtx);

interface AudioFile {
  blobUrl?: string;
  signedUrl: string;
  filename: string;
  mimeType: string;
}

interface AudioUrls {
  intro?: AudioFile;
  win?: AudioFile;
  dice?: AudioFile;
  beep?: AudioFile;
  victory?: AudioFile;
  fart?: AudioFile;
  flush?: AudioFile;
  splash?: AudioFile;
  bubbles?: AudioFile;
  dafishboyz?: AudioFile;
}

// Direct URL for DaFish Boyz theme song - always available as fallback
const DAFISH_BOYZ_DIRECT_URL = 'https://yrfjejengmkqpjbluexn.supabase.co/storage/v1/object/public/audio/DaFish_Boyz%20(1).mp3';

// Helper to determine MIME type from filename
const getMimeType = (filename: string): string => {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.mp3') || lower.includes('mp3')) return 'audio/mpeg';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.ogg')) return 'audio/ogg';
  if (lower.endsWith('.m4a')) return 'audio/mp4';
  if (lower.endsWith('.aac')) return 'audio/aac';
  if (lower.endsWith('.webm')) return 'audio/webm';
  // Default to mp3 for files without clear extension
  return 'audio/mpeg';
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  const [audioUrls, setAudioUrls] = useState<AudioUrls>({});
  const [audioStatus, setAudioStatus] = useState<Record<string, boolean>>({});
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    loadAudioFiles();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      synthRef.current = window.speechSynthesis;
    }
    
    // Cleanup blob URLs on unmount
    return () => {
      Object.values(audioUrls).forEach(file => {
        if (file?.blobUrl) {
          URL.revokeObjectURL(file.blobUrl);
        }
      });
    };
  }, []);

  const loadAudioFiles = async () => {
    try {
      console.log('🔊 Loading audio files from Supabase...');
      
      // Always set up the DaFish Boyz fallback URL first
      const urls: AudioUrls = {
        dafishboyz: {
          signedUrl: DAFISH_BOYZ_DIRECT_URL,
          filename: 'DaFish_Boyz (1).mp3',
          mimeType: 'audio/mpeg'
        }
      };
      const status: Record<string, boolean> = {
        dafishboyz: true
      };
      
      console.log('✅ DaFish Boyz theme song URL set:', DAFISH_BOYZ_DIRECT_URL);
      
      const { data, error } = await supabase.storage.from('audio').list();
      
      if (error) {
        console.log('ℹ️ Audio bucket not accessible or empty - using fallback URLs');
        setAudioUrls(urls);
        setAudioStatus(status);
        setIsLoaded(true);
        return;
      }
      
      console.log('📁 Audio bucket files found:', data?.length || 0);
      
      if (data && data.length > 0) {
        for (const file of data) {
          if (file.name === '.emptyFolderPlaceholder') continue;
          
          const name = file.name.toLowerCase();
          const mimeType = getMimeType(file.name);
          
          // Determine which sound category this file belongs to
          let category: keyof AudioUrls | null = null;
          
          // Match Dafish Boyz song - flexible matching for various file names
          // Supports: Dafish_Boyz, DaFish Boyz, dafishboyz, da_fish_boyz, etc.
          if (name.includes('dafish') || name.includes('da_fish') || name.includes('dafishboyz') ||
              name.includes('dafish_boyz') || name.includes('da fish') ||
              name.includes('boyz') || (name.includes('fish') && name.includes('boy'))) {
            category = 'dafishboyz';
          }
          else if (name.includes('intro') || name.includes('open')) {
            category = 'intro';
          }
          else if (name.includes('victory') || name.includes('fanfare')) {
            category = 'victory';
          }
          else if (name.includes('win')) {
            category = 'win';
          }
          else if (name.includes('dice') || name.includes('roll')) {
            category = 'dice';
          }
          else if (name.includes('beep') || name.includes('timer')) {
            category = 'beep';
          }
          else if (name.includes('fart') || name.includes('toot')) {
            category = 'fart';
          }
          else if (name.includes('flush') || name.includes('toilet')) {
            category = 'flush';
          }
          else if (name.includes('splash') || name.includes('water')) {
            category = 'splash';
          }
          else if (name.includes('bubble') || name.includes('gurgle')) {
            category = 'bubbles';
          }

          
          if (!category) continue;
          
          // Try to download the file as a blob for reliable playback
          try {
            const { data: blobData, error: downloadError } = await supabase.storage
              .from('audio')
              .download(file.name);
            
            if (downloadError || !blobData) {
              // Silently skip files that can't be downloaded - they may not exist or be accessible
              // Try signed URL as fallback without logging errors
              try {
                const { data: signedUrlData } = await supabase.storage
                  .from('audio')
                  .createSignedUrl(file.name, 3600);
                
                if (signedUrlData?.signedUrl) {
                  urls[category] = {
                    signedUrl: signedUrlData.signedUrl,
                    filename: file.name,
                    mimeType
                  };
                  status[category] = true;
                }
              } catch {
                // Silently skip - file not available
              }
              continue;
            }
            
            // Create blob URL with correct MIME type
            const blob = new Blob([blobData], { type: mimeType });
            const blobUrl = URL.createObjectURL(blob);
            
            urls[category] = {
              blobUrl,
              signedUrl: '', // Not needed when we have blob
              filename: file.name,
              mimeType
            };
            status[category] = true;
            
            console.log(`✅ Loaded ${category} audio`);
          } catch {
            // Silently skip files that fail to load
            continue;
          }
        }
      }
      
      if (Object.keys(urls).length > 0) {
        console.log('🎶 Audio files loaded:', Object.keys(urls).join(', '));
      }
      setAudioUrls(urls);
      setAudioStatus(status);
      
      setIsLoaded(true);
    } catch (err) { 
      // Even on error, ensure DaFish Boyz fallback is available
      console.log('ℹ️ Audio loading error - using fallback URLs');
      setAudioUrls({
        dafishboyz: {
          signedUrl: DAFISH_BOYZ_DIRECT_URL,
          filename: 'DaFish_Boyz (1).mp3',
          mimeType: 'audio/mpeg'
        }
      });
      setAudioStatus({ dafishboyz: true });
      setIsLoaded(true);
    }
  };




  const playSound = useCallback((key: keyof AudioUrls, volume = 0.5) => {
    const audioFile = audioUrls[key];
    
    // Silently skip if muted or no audio file available
    if (isMuted || !audioFile) {
      return;
    }
    
    try {
      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
        currentAudioRef.current = null;
      }
      
      // Prefer blob URL over signed URL
      const audioUrl = audioFile.blobUrl || audioFile.signedUrl;
      
      if (!audioUrl) {
        return;
      }
      
      // Create audio element
      const audio = new Audio();
      audio.volume = volume;
      audio.preload = 'auto';
      
      audio.onended = () => {
        currentAudioRef.current = null;
      };
      
      // Silently handle errors - audio playback is optional
      audio.onerror = () => {
        currentAudioRef.current = null;
      };
      
      // Set the source
      audio.src = audioUrl;
      currentAudioRef.current = audio;
      
      // Play the audio - silently handle any errors
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Silently handle play errors (user interaction required, format not supported, etc.)
          currentAudioRef.current = null;
        });
      }
    } catch {
      // Silently handle any errors
    }
  }, [isMuted, audioUrls]);


  const speakText = useCallback((text: string) => {
    if (isMuted || !speechEnabled || !synthRef.current) return;
    synthRef.current.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9; u.pitch = 1; u.volume = 0.8;
    synthRef.current.speak(u);
  }, [isMuted, speechEnabled]);

  const stopAll = useCallback(() => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    synthRef.current?.cancel();
  }, []);

  return (
    <AudioCtx.Provider value={{
      playIntro: () => playSound('intro', 0.5),
      playWinSound: () => playSound(audioUrls.victory ? 'victory' : 'win', 0.7),
      playDiceRoll: () => playSound('dice', 0.6),
      playTimerBeep: () => playSound('beep', 0.4),
      playVictory: () => playSound('victory', 0.8),
      playFart: () => playSound('fart', 0.6),
      playToiletFlush: () => playSound('flush', 0.7),
      playSplash: () => playSound('splash', 0.5),
      playBubbles: () => playSound('bubbles', 0.4),
      playDafishBoyz: () => playSound('dafishboyz', 0.8),
      speakText, stopAll, isMuted,
      toggleMute: () => setIsMuted(p => !p),
      isLoaded, speechEnabled,
      toggleSpeech: () => setSpeechEnabled(p => !p),
      audioStatus
    }}>
      {children}
    </AudioCtx.Provider>
  );
};
