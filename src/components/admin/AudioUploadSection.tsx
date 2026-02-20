import React, { useState, useEffect, useCallback } from 'react';
import { Volume2, Upload, Trash2, Play, Pause, RefreshCw, AlertCircle, CheckCircle, Music, FileAudio } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AudioFile {
  name: string;
  url: string;
  size: number;
}

interface UploadState {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit for Supabase

const AudioUploadSection: React.FC = () => {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const { toast } = useToast();
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const fetchFiles = async () => {
    try {
      const { data, error } = await supabase.storage.from('audio').list();
      if (error) {
        console.error('Error fetching audio files:', error);
        toast({ title: 'Error', description: 'Could not fetch audio files', variant: 'destructive' });
        return;
      }
      if (data) {
        const audioFiles = data.filter(f => f.name !== '.emptyFolderPlaceholder').map(f => {
          const { data: urlData } = supabase.storage.from('audio').getPublicUrl(f.name);
          return { name: f.name, url: urlData.publicUrl, size: f.metadata?.size || 0 };
        });
        setFiles(audioFiles);
      }
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleUpload = async (fileList: FileList) => {
    setUploading(true);
    
    for (const file of Array.from(fileList)) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        toast({ 
          title: 'Invalid file type', 
          description: `${file.name} is not an audio file`, 
          variant: 'destructive' 
        });
        continue;
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        const currentSize = formatFileSize(file.size);
        const maxSize = formatFileSize(MAX_FILE_SIZE);
        toast({ 
          title: 'File too large', 
          description: `${file.name} is ${currentSize}. Maximum allowed is ${maxSize}. Try compressing your audio file.`, 
          variant: 'destructive' 
        });
        setUploadState({
          fileName: file.name,
          progress: 0,
          status: 'error',
          error: `File size (${currentSize}) exceeds ${maxSize} limit. Compress your audio or use a shorter clip.`
        });
        continue;
      }

      // Start upload with progress simulation
      setUploadState({
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      });

      // Simulate progress while uploading
      const progressInterval = setInterval(() => {
        setUploadState(prev => {
          if (!prev || prev.status !== 'uploading') return prev;
          const newProgress = Math.min(prev.progress + 5, 90);
          return { ...prev, progress: newProgress };
        });
      }, 100);

      try {
        console.log(`📤 Uploading ${file.name} (${formatFileSize(file.size)})...`);
        
        const { error } = await supabase.storage.from('audio').upload(file.name, file, { 
          upsert: true,
          contentType: file.type
        });
        
        clearInterval(progressInterval);
        
        if (error) {
          console.error('Upload error:', error);
          
          // Parse specific error messages
          let errorMessage = error.message;
          if (error.message.includes('Request Entity Too Large') || error.message.includes('413')) {
            errorMessage = 'File is too large. Try compressing it or using a shorter audio clip.';
          } else if (error.message.includes('Invalid') || error.message.includes('JSON')) {
            errorMessage = 'Upload failed - the file may be too large or there was a network issue. Try a smaller file.';
          } else if (error.message.includes('network') || error.message.includes('timeout')) {
            errorMessage = 'Network error - check your connection and try again.';
          }
          
          setUploadState({
            fileName: file.name,
            progress: 0,
            status: 'error',
            error: errorMessage
          });
          
          toast({ 
            title: 'Upload failed', 
            description: errorMessage, 
            variant: 'destructive' 
          });
        } else {
          console.log(`✅ Successfully uploaded ${file.name}`);
          
          setUploadState({
            fileName: file.name,
            progress: 100,
            status: 'success'
          });
          
          toast({ 
            title: 'Upload successful!', 
            description: `${file.name} has been uploaded to the audio bucket.` 
          });
          
          // Clear success state after 3 seconds
          setTimeout(() => setUploadState(null), 3000);
        }
      } catch (err: any) {
        clearInterval(progressInterval);
        console.error('Upload exception:', err);
        
        // Handle JSON parse errors (usually means response wasn't JSON - likely an error page)
        let errorMessage = 'Upload failed';
        if (err.message?.includes('JSON') || err.message?.includes('Unexpected token')) {
          errorMessage = 'File too large or network error. Try a smaller file (under 10MB recommended).';
        } else {
          errorMessage = err.message || 'Unknown error occurred';
        }
        
        setUploadState({
          fileName: file.name,
          progress: 0,
          status: 'error',
          error: errorMessage
        });
        
        toast({ 
          title: 'Upload failed', 
          description: errorMessage, 
          variant: 'destructive' 
        });
      }
    }
    
    setUploading(false);
    fetchFiles();
  };

  const handleDelete = async (name: string) => {
    try {
      await supabase.storage.from('audio').remove([name]);
      toast({ title: 'Deleted', description: name });
      fetchFiles();
    } catch (err) {
      toast({ title: 'Delete failed', variant: 'destructive' });
    }
  };

  const togglePlay = (url: string) => {
    if (playing === url) { 
      audioRef.current?.pause(); 
      setPlaying(null); 
    } else { 
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(url); 
      audioRef.current.play().catch(e => {
        console.error('Play error:', e);
        toast({ title: 'Playback error', description: 'Could not play audio', variant: 'destructive' });
      });
      setPlaying(url); 
      audioRef.current.onended = () => setPlaying(null); 
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); 
    setDragOver(false);
    if (e.dataTransfer.files) handleUpload(e.dataTransfer.files);
  }, []);

  const getCategory = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('dafish') || n.includes('boyz') || n.includes('da fish') || n.includes('da_fish') || n.includes('song') || n.includes('theme')) return { label: 'DaFish Boyz Theme', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' };
    if (n.includes('fart') || n.includes('toot')) return { label: 'Fart', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300' };
    if (n.includes('flush') || n.includes('toilet')) return { label: 'Flush', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' };
    if (n.includes('splash') || n.includes('water')) return { label: 'Splash', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300' };
    if (n.includes('bubble') || n.includes('gurgle')) return { label: 'Bubbles', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300' };
    if (n.includes('dice') || n.includes('roll')) return { label: 'Dice', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' };
    if (n.includes('win') || n.includes('victory')) return { label: 'Victory', color: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' };
    return { label: 'Other', color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' };
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
          <Volume2 className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Game Sound Effects</h2>
          <p className="text-gray-500">Upload audio files (MP3, WAV, OGG - max 50MB)</p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchFiles} className="ml-auto">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* File naming guide */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
        <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
          <Music className="w-4 h-4" />
          File Naming Guide
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Name your files with these keywords for automatic categorization:
        </p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 rounded">dafishboyz.mp3</span>
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300 rounded">fart.mp3</span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 rounded">flush.mp3</span>
          <span className="px-2 py-1 bg-cyan-100 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300 rounded">splash.mp3</span>
          <span className="px-2 py-1 bg-teal-100 text-teal-700 dark:bg-teal-900/50 dark:text-teal-300 rounded">bubbles.mp3</span>
          <span className="px-2 py-1 bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300 rounded">dice.mp3</span>
          <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 rounded">victory.mp3</span>
        </div>
      </div>

      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
          dragOver 
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 scale-[1.02]' 
            : 'border-gray-300 dark:border-gray-600 hover:border-green-400 hover:bg-green-50/50 dark:hover:bg-green-900/10'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <FileAudio className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400 mb-2">Drag & drop audio files here</p>
        <p className="text-sm text-gray-500 mb-4">
          Supported: MP3, WAV, OGG, M4A • Max size: 50MB
        </p>
        <input 
          type="file" 
          accept="audio/*" 
          multiple 
          className="hidden" 
          id="audio-upload"
          onChange={(e) => e.target.files && handleUpload(e.target.files)} 
        />
        <Button asChild disabled={uploading} className="bg-green-600 hover:bg-green-700">
          <label htmlFor="audio-upload" className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Browse Files'}
          </label>
        </Button>
      </div>

      {/* Upload progress/status */}
      {uploadState && (
        <div className={`mt-4 p-4 rounded-xl ${
          uploadState.status === 'error' 
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
            : uploadState.status === 'success'
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
        }`}>
          <div className="flex items-center gap-3">
            {uploadState.status === 'uploading' && (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
            {uploadState.status === 'success' && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            {uploadState.status === 'error' && (
              <AlertCircle className="w-5 h-5 text-red-500" />
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">{uploadState.fileName}</p>
              {uploadState.status === 'uploading' && (
                <Progress value={uploadState.progress} className="h-2 mt-2" />
              )}
              {uploadState.error && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{uploadState.error}</p>
              )}
              {uploadState.status === 'success' && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">Upload complete!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tips for large files */}
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <p className="text-sm text-amber-700 dark:text-amber-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            <strong>Tip:</strong> If uploads fail, try compressing your audio file. 
            Use tools like <a href="https://www.onlineconverter.com/compress-mp3" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-800">Online MP3 Compressor</a> to 
            reduce file size while maintaining quality. Files under 10MB work best.
          </span>
        </p>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-3 text-gray-700 dark:text-gray-300">
            Uploaded Audio Files ({files.length})
          </h3>
          <div className="space-y-2">
            {files.map(f => {
              const category = getCategory(f.name);
              return (
                <div key={f.name} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <Button size="sm" variant="ghost" onClick={() => togglePlay(f.url)} className="hover:bg-green-100 dark:hover:bg-green-900/30">
                    {playing === f.url ? <Pause className="w-4 h-4 text-green-600" /> : <Play className="w-4 h-4 text-green-600" />}
                  </Button>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{f.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded ${category.color}`}>
                        {category.label}
                      </span>
                      {f.size > 0 && (
                        <span className="text-xs text-gray-500">{formatFileSize(f.size)}</span>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(f.name)} className="hover:bg-red-100 dark:hover:bg-red-900/30">
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {files.length === 0 && (
        <div className="mt-6 text-center py-8 text-gray-500">
          <Volume2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No audio files uploaded yet</p>
          <p className="text-sm">Upload your first audio file to get started</p>
        </div>
      )}
    </div>
  );
};

export default AudioUploadSection;
