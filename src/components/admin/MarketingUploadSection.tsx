import React, { useState, useEffect, useCallback } from 'react';
import { Image, Upload, Trash2, Copy, Share2, RefreshCw, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface MarketingFile {
  name: string;
  url: string;
  isLogo: boolean;
  isFlyer: boolean;
}

const MarketingUploadSection: React.FC = () => {
  const [files, setFiles] = useState<MarketingFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchFiles = async () => {
    const { data } = await supabase.storage.from('marketing').list();
    if (data) {
      const marketingFiles = data.filter(f => f.name !== '.emptyFolderPlaceholder').map(f => {
        const { data: urlData } = supabase.storage.from('marketing').getPublicUrl(f.name);
        const n = f.name.toLowerCase();
        return { 
          name: f.name, 
          url: urlData.publicUrl,
          isLogo: n.includes('logo'),
          isFlyer: n.includes('flyer') || n.includes('promo')
        };
      });
      setFiles(marketingFiles);
    }
  };

  useEffect(() => { fetchFiles(); }, []);

  const handleUpload = async (fileList: FileList) => {
    setUploading(true);
    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') continue;
      const { error } = await supabase.storage.from('marketing').upload(file.name, file, { upsert: true });
      if (error) toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
      else toast({ title: 'Uploaded', description: file.name });
    }
    setUploading(false);
    fetchFiles();
  };

  const handleDelete = async (name: string) => {
    await supabase.storage.from('marketing').remove([name]);
    toast({ title: 'Deleted', description: name });
    fetchFiles();
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Copied!', description: 'URL copied to clipboard' });
  };

  const shareFlyer = async (file: MarketingFile) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'DaFish Boyz Games', text: 'Check out these awesome party games!', url: file.url });
      } catch (e) { copyUrl(file.url); }
    } else { copyUrl(file.url); }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    if (e.dataTransfer.files) handleUpload(e.dataTransfer.files);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
          <Image className="w-8 h-8 text-pink-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Marketing Assets</h2>
          <p className="text-gray-500">Upload logos, flyers, and promotional images</p>
        </div>
        <Button variant="ghost" size="sm" onClick={fetchFiles} className="ml-auto">
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver ? 'border-pink-500 bg-pink-50 dark:bg-pink-900/20' : 'border-gray-300 dark:border-gray-600'
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-600 dark:text-gray-400 mb-2">Drag & drop images here</p>
        <p className="text-sm text-gray-500 mb-4">Name files with: logo, flyer, promo</p>
        <input type="file" accept="image/*,.pdf" multiple className="hidden" id="marketing-upload"
          onChange={(e) => e.target.files && handleUpload(e.target.files)} />
        <Button asChild disabled={uploading} className="bg-pink-500 hover:bg-pink-600">
          <label htmlFor="marketing-upload" className="cursor-pointer">
            {uploading ? 'Uploading...' : 'Browse Files'}
          </label>
        </Button>
      </div>

      {files.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {files.map(f => (
            <div key={f.name} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-start gap-3">
                <img src={f.url} alt={f.name} className="w-16 h-16 object-cover rounded" 
                  onError={(e) => (e.currentTarget.src = '/placeholder.svg')} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{f.name}</p>
                  <div className="flex gap-1 mt-1">
                    {f.isLogo && <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Logo</span>}
                    {f.isFlyer && <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">Flyer</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => setPreviewUrl(f.url)}><Eye className="w-3 h-3" /></Button>
                <Button size="sm" variant="outline" onClick={() => copyUrl(f.url)}><Copy className="w-3 h-3" /></Button>
                {f.isFlyer && <Button size="sm" variant="outline" onClick={() => shareFlyer(f)}><Share2 className="w-3 h-3" /></Button>}
                <Button size="sm" variant="ghost" onClick={() => handleDelete(f.name)}><Trash2 className="w-3 h-3 text-red-500" /></Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewUrl && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewUrl(null)}>
          <img src={previewUrl} alt="Preview" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default MarketingUploadSection;
