import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  LogOut, 
  RefreshCw, 
  Image as ImageIcon,
  FolderOpen,
  Zap,
  Info,
  Upload,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  Eye,
  Download,
  Search,
  Grid,
  List,
  ChevronDown,
  Gamepad2,
  LayoutGrid,
  Layers,
  Map,
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import ZipUploadSection from '@/components/admin/ZipUploadSection';

interface GameAsset {
  id: string;
  name: string;
  fileName: string;
  url: string;
  createdAt: string;
  size?: number;
}

interface PendingUpload {
  file: File;
  preview: string;
  name: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface BucketConfig {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const BUCKETS: BucketConfig[] = [
  {
    id: 'game-cards/shito-bingo-cards',
    name: 'Shito Bingo Cards',
    description: 'Icons for player bingo cards in Shito game (matches physical game)',
    icon: <LayoutGrid className="w-5 h-5" />,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30'
  },
  {
    id: 'game-cards/SHITO-calling-cards-singles',
    name: 'SHITO Calling Cards',
    description: 'Calling card images for Shito game (primary folder)',
    icon: <Layers className="w-5 h-5" />,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30'
  },
  {
    id: 'game-cards/up-shitz-creek-shit-pile-cards',
    name: 'Shitz Creek Shit Pile Cards',
    description: 'Shit Pile cards for Up Shitz Creek game',
    icon: <Layers className="w-5 h-5" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  {
    id: 'game-cards/slanging-shit-cards',
    name: 'Slanging Shit Cards',
    description: 'Charades cards for Slanging Shit game',
    icon: <Gamepad2 className="w-5 h-5" />,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30'
  },
  {
    id: 'Game Boards',
    name: 'Game Boards',
    description: 'Game board images (Shitz Creek board, etc.)',
    icon: <Map className="w-5 h-5" />,
    color: 'text-teal-600',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30'
  }
];

// Simplified bucket list for ZIP upload dropdown
const BUCKET_OPTIONS = BUCKETS.map(b => ({
  id: b.id,
  name: b.name,
  description: b.description
}));


// Helper to parse bucket ID into bucket name and folder path
const parseBucketId = (bucketId: string): { bucket: string; folder: string } => {
  // Special case for "Game Boards" bucket (has space, no folder)
  if (bucketId === 'Game Boards') {
    return { bucket: 'Game Boards', folder: '' };
  }
  
  const parts = bucketId.split('/');
  if (parts.length >= 2) {
    return { bucket: parts[0], folder: parts.slice(1).join('/') };
  }
  return { bucket: bucketId, folder: '' };
};




const AdminGameAssets: React.FC = () => {
  const [selectedBucket, setSelectedBucket] = useState<BucketConfig>(BUCKETS[0]);
  const [assets, setAssets] = useState<GameAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Upload state
  const [isDragging, setIsDragging] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  // Edit/Delete state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteAsset, setDeleteAsset] = useState<GameAsset | null>(null);
  const [previewAsset, setPreviewAsset] = useState<GameAsset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  
  const { toast } = useToast();
  const { user, signOut, isDemo } = useAuth();

  // Get parsed bucket info
  const { bucket: bucketName, folder: folderPath } = parseBucketId(selectedBucket.id);

  // Fetch assets from selected bucket
  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const { bucket, folder } = parseBucketId(selectedBucket.id);
      
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit: 200,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      if (data) {
        const imageFiles = data.filter(f => 
          f.name.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)
        );

        const assetList: GameAsset[] = imageFiles.map((f, i) => {
          const filePath = folder ? `${folder}/${f.name}` : f.name;
          const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);
          
          const baseName = f.name.replace(/\.[^/.]+$/, '');
          const cleanName = baseName.replace(/-\d{13}$/, '');
          const displayName = cleanName
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());

          return {
            id: `asset-${i}-${f.name}`,
            name: displayName,
            fileName: f.name,
            url: urlData.publicUrl,
            createdAt: f.created_at || new Date().toISOString(),
            size: f.metadata?.size
          };
        });

        setAssets(assetList);
      }
    } catch (error: any) {
      console.error('Error fetching assets:', error);
      toast({
        title: 'Error',
        description: `Failed to load assets from ${selectedBucket.name}`,
        variant: 'destructive'
      });
    }
    setLoading(false);
  }, [selectedBucket, toast]);


  useEffect(() => {
    fetchAssets();
    setPendingUploads([]);
    setSearchTerm('');
  }, [selectedBucket, fetchAssets]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAssets();
    setRefreshing(false);
    toast({
      title: 'Refreshed',
      description: 'Asset list has been updated'
    });
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback((files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      toast({
        title: 'Invalid files',
        description: 'Please select image files (PNG, JPG, GIF, WebP, SVG)',
        variant: 'destructive'
      });
      return;
    }

    const newUploads: PendingUpload[] = imageFiles.map(file => {
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const displayName = baseName
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());

      return {
        file,
        preview: URL.createObjectURL(file),
        name: displayName,
        status: 'pending' as const
      };
    });

    setPendingUploads(prev => [...prev, ...newUploads]);
  }, [toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const updateUploadName = (index: number, name: string) => {
    setPendingUploads(prev => prev.map((upload, i) => 
      i === index ? { ...upload, name } : upload
    ));
  };

  const removeUpload = (index: number) => {
    setPendingUploads(prev => {
      const upload = prev[index];
      if (upload) {
        URL.revokeObjectURL(upload.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadAll = async () => {
    if (pendingUploads.length === 0) return;

    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    const { bucket, folder } = parseBucketId(selectedBucket.id);

    for (let i = 0; i < pendingUploads.length; i++) {
      const upload = pendingUploads[i];
      if (upload.status !== 'pending') continue;

      setPendingUploads(prev => prev.map((u, idx) => 
        idx === i ? { ...u, status: 'uploading' as const } : u
      ));

      try {
        const sanitizedName = upload.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        const extension = upload.file.name.split('.').pop()?.toLowerCase() || 'png';
        const fileName = `${sanitizedName}-${Date.now()}.${extension}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(filePath, upload.file, {
            contentType: upload.file.type,
            upsert: false
          });

        if (uploadError) throw uploadError;

        setPendingUploads(prev => prev.map((u, idx) => 
          idx === i ? { ...u, status: 'success' as const } : u
        ));
        successCount++;

      } catch (error: any) {
        console.error('Upload error:', error);
        setPendingUploads(prev => prev.map((u, idx) => 
          idx === i ? { ...u, status: 'error' as const, error: error.message } : u
        ));
        errorCount++;
      }
    }

    setIsUploading(false);

    if (successCount > 0) {
      toast({
        title: 'Upload Complete!',
        description: `Successfully uploaded ${successCount} file${successCount > 1 ? 's' : ''}${errorCount > 0 ? `. ${errorCount} failed.` : ''}`
      });
      fetchAssets();
      
      setTimeout(() => {
        setPendingUploads(prev => prev.filter(u => u.status !== 'success'));
      }, 2000);
    } else if (errorCount > 0) {
      toast({
        title: 'Upload Failed',
        description: `Failed to upload ${errorCount} file${errorCount > 1 ? 's' : ''}`,
        variant: 'destructive'
      });
    }
  };

  const clearAllUploads = () => {
    pendingUploads.forEach(upload => URL.revokeObjectURL(upload.preview));
    setPendingUploads([]);
  };

  // Edit/Delete handlers
  const startEditing = (asset: GameAsset) => {
    setEditingId(asset.id);
    setEditName(asset.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveRename = async (asset: GameAsset) => {
    if (!editName.trim() || editName === asset.name) {
      cancelEditing();
      return;
    }

    setIsRenaming(true);

    try {
      const { bucket, folder } = parseBucketId(selectedBucket.id);
      
      const sanitizedName = editName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const extension = asset.fileName.split('.').pop() || 'png';
      const newFileName = `${sanitizedName}-${Date.now()}.${extension}`;
      
      const oldFilePath = folder ? `${folder}/${asset.fileName}` : asset.fileName;
      const newFilePath = folder ? `${folder}/${newFileName}` : newFileName;

      const { data: fileData, error: downloadError } = await supabase.storage
        .from(bucket)
        .download(oldFilePath);

      if (downloadError) throw downloadError;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(newFilePath, fileData, {
          contentType: `image/${extension}`,
          upsert: false
        });

      if (uploadError) throw uploadError;

      await supabase.storage
        .from(bucket)
        .remove([oldFilePath]);

      toast({
        title: 'Asset Renamed',
        description: `Successfully renamed to "${editName}"`
      });

      fetchAssets();
    } catch (error: any) {
      console.error('Rename error:', error);
      toast({
        title: 'Rename Failed',
        description: error.message,
        variant: 'destructive'
      });
    }

    setIsRenaming(false);
    cancelEditing();
  };

  const handleDelete = async () => {
    if (!deleteAsset) return;

    setIsDeleting(true);

    try {
      const { bucket, folder } = parseBucketId(selectedBucket.id);
      const filePath = folder ? `${folder}/${deleteAsset.fileName}` : deleteAsset.fileName;
      
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: 'Asset Deleted',
        description: `"${deleteAsset.name}" has been removed`
      });

      fetchAssets();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive'
      });
    }

    setIsDeleting(false);
    setDeleteAsset(null);
  };


  const downloadAsset = (asset: GameAsset) => {
    const link = document.createElement('a');
    link.href = asset.url;
    link.download = asset.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = pendingUploads.filter(u => u.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Demo Mode Banner */}
        {isDemo && (
          <div className="mb-6 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/50 rounded-xl p-4 flex items-center gap-3">
            <Zap className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-600 dark:text-amber-400">Demo Mode Active</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                You're using a demo account. Some storage operations may be limited.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/admin" 
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin
            </Link>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Title Section */}
        <div className="bg-gradient-to-r from-slate-700 via-gray-700 to-zinc-700 rounded-3xl p-8 mb-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <FolderOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black">Game Assets Manager</h1>
              <p className="text-white/80 mt-1">
                Upload and manage game cards, boards, and assets
              </p>
            </div>
          </div>
          
          <div className="relative z-10 mt-6 flex flex-wrap gap-4">
            {BUCKETS.map(bucket => (
              <div 
                key={bucket.id}
                className={`rounded-xl px-4 py-2 cursor-pointer transition-all ${
                  selectedBucket.id === bucket.id 
                    ? 'bg-white/30 ring-2 ring-white' 
                    : 'bg-white/10 hover:bg-white/20'
                }`}
                onClick={() => setSelectedBucket(bucket)}
              >
                <p className="text-white/70 text-xs">{bucket.name}</p>
                <p className="text-lg font-semibold">
                  {selectedBucket.id === bucket.id ? assets.length : '—'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Bucket Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${selectedBucket.bgColor}`}>
                <span className={selectedBucket.color}>{selectedBucket.icon}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold">{selectedBucket.name}</h2>
                <p className="text-gray-500 text-sm">{selectedBucket.description}</p>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Switch Bucket
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {BUCKETS.map(bucket => (
                  <DropdownMenuItem
                    key={bucket.id}
                    onClick={() => setSelectedBucket(bucket)}
                    className={`gap-3 ${selectedBucket.id === bucket.id ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                  >
                    <span className={bucket.color}>{bucket.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{bucket.name}</p>
                      <p className="text-xs text-gray-500">{bucket.id}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>



        {/* ZIP File Extractor Section */}
        <ZipUploadSection
          onExtractComplete={fetchAssets}
          buckets={BUCKET_OPTIONS}
          selectedBucketId={selectedBucket.id}
        />

        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-8 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Storage Bucket: {selectedBucket.id}</p>
            <p className="text-blue-600 dark:text-blue-400">
              {selectedBucket.description}. Uploaded files will automatically be available in the game.
            </p>
          </div>
        </div>


        {/* Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-3 rounded-xl ${selectedBucket.bgColor}`}>
              <ImageIcon className={`w-6 h-6 ${selectedBucket.color}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Upload New Assets</h2>
              <p className="text-gray-500 text-sm">
                Drag and drop images or click to browse
              </p>
            </div>
          </div>
          
          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
                isDragging ? 'bg-blue-500 text-white' : `${selectedBucket.bgColor} ${selectedBucket.color}`
              }`}>
                <Upload className="w-8 h-8" />
              </div>
              
              <div>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {isDragging ? 'Drop images here!' : 'Drag & drop images here'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse • PNG, JPG, GIF, WebP, SVG supported
                </p>
              </div>
            </div>
          </div>

          {/* Pending Uploads */}
          {pendingUploads.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                  Files to Upload ({pendingUploads.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAllUploads}
                    disabled={isUploading}
                  >
                    Clear All
                  </Button>
                  <Button
                    size="sm"
                    onClick={uploadAll}
                    disabled={isUploading || pendingCount === 0}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload All ({pendingCount})
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {pendingUploads.map((upload, index) => (
                  <div
                    key={index}
                    className={`relative bg-white dark:bg-gray-800 rounded-xl border overflow-hidden transition-all ${
                      upload.status === 'success'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                        : upload.status === 'error'
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : upload.status === 'uploading'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {upload.status === 'uploading' && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-10">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      </div>
                    )}
                    
                    {upload.status === 'success' && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10">
                        <Check className="w-12 h-12 text-green-500" />
                      </div>
                    )}

                    {upload.status === 'pending' && (
                      <button
                        onClick={() => removeUpload(index)}
                        className="absolute top-2 right-2 z-20 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <div className="aspect-square bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                      <img
                        src={upload.preview}
                        alt={upload.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="p-3">
                      <Label className="text-xs text-gray-500">File Name</Label>
                      <Input
                        value={upload.name}
                        onChange={(e) => updateUploadName(index, e.target.value)}
                        disabled={upload.status !== 'pending'}
                        placeholder="Enter name"
                        className="mt-1 text-sm"
                      />
                      
                      {upload.status === 'error' && (
                        <div className="mt-2 flex items-center gap-1 text-red-500 text-xs">
                          <X className="w-3 h-3" />
                          <span>{upload.error || 'Upload failed'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Assets List Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl ${selectedBucket.bgColor}`}>
                <FolderOpen className={`w-6 h-6 ${selectedBucket.color}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Uploaded Assets</h2>
                <p className="text-gray-500 text-sm">
                  {assets.length} file{assets.length !== 1 ? 's' : ''} in {selectedBucket.id}
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {filteredAssets.length} of {assets.length} files
              </span>
              <div className="flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Assets Display */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {assets.length === 0 ? (
                <>
                  <FolderOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No assets uploaded yet</p>
                  <p className="text-sm">Upload some files to get started</p>
                </>
              ) : (
                <>
                  <Search className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No assets match your search</p>
                  <p className="text-sm">Try a different search term</p>
                </>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
                >
                  <div 
                    className="aspect-square bg-gray-100 dark:bg-gray-900 cursor-pointer"
                    onClick={() => setPreviewAsset(asset)}
                  >
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => setPreviewAsset(asset)}
                      className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white shadow-sm"
                      title="Preview"
                    >
                      <Eye className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => downloadAsset(asset)}
                      className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white shadow-sm"
                      title="Download"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setDeleteAsset(asset)}
                      className="p-1.5 bg-red-500/90 rounded-lg hover:bg-red-500 shadow-sm"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <div className="p-2">
                    {editingId === asset.id ? (
                      <div className="flex items-center gap-1">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-7 text-xs"
                          disabled={isRenaming}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(asset);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                        />
                        <button
                          onClick={() => saveRename(asset)}
                          disabled={isRenaming}
                          className="p-1 text-green-500 hover:bg-green-50 rounded"
                        >
                          {isRenaming ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={isRenaming}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-medium truncate flex-1" title={asset.name}>
                          {asset.name}
                        </p>
                        <button
                          onClick={() => startEditing(asset)}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
                >
                  <div 
                    className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
                    onClick={() => setPreviewAsset(asset)}
                  >
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    {editingId === asset.id ? (
                      <div className="flex items-center gap-2">
                        <Input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-8"
                          disabled={isRenaming}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveRename(asset);
                            if (e.key === 'Escape') cancelEditing();
                          }}
                        />
                        <button
                          onClick={() => saveRename(asset)}
                          disabled={isRenaming}
                          className="p-1.5 text-green-500 hover:bg-green-50 rounded"
                        >
                          {isRenaming ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={isRenaming}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <p className="font-medium truncate">{asset.name}</p>
                        <p className="text-sm text-gray-500 truncate">{asset.fileName}</p>
                      </>
                    )}
                  </div>

                  {editingId !== asset.id && (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewAsset(asset)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(asset)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => downloadAsset(asset)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteAsset(asset)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link to="/admin">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Admin Dashboard
            </Button>
          </Link>
          <Link to="/admin/shito-cards">
            <Button variant="outline" className="gap-2">
              <Layers className="w-4 h-4" />
              Shito Calling Cards
            </Button>
          </Link>
        </div>
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewAsset} onOpenChange={() => setPreviewAsset(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewAsset?.name}</DialogTitle>
          </DialogHeader>
          {previewAsset && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-full max-h-[60vh] bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
                <img
                  src={previewAsset.url}
                  alt={previewAsset.name}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>
              <div className="text-sm text-gray-500 text-center">
                <p>Bucket: {selectedBucket.id}</p>
                <p>File: {previewAsset.fileName}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => downloadAsset(previewAsset)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDeleteAsset(previewAsset);
                    setPreviewAsset(null);
                  }}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteAsset} onOpenChange={() => setDeleteAsset(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteAsset?.name}" from {selectedBucket.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminGameAssets;
