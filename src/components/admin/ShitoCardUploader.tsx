import React, { useState, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface PendingUpload {
  file: File;
  preview: string;
  name: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

interface ShitoCardUploaderProps {
  onUploadComplete: () => void;
}

const ShitoCardUploader: React.FC<ShitoCardUploaderProps> = ({ onUploadComplete }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

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
        description: 'Please select image files (PNG, JPG, GIF, WebP)',
        variant: 'destructive'
      });
      return;
    }

    const newUploads: PendingUpload[] = imageFiles.map(file => {
      // Generate a default name from the filename
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

    for (let i = 0; i < pendingUploads.length; i++) {
      const upload = pendingUploads[i];
      if (upload.status !== 'pending') continue;

      // Update status to uploading
      setPendingUploads(prev => prev.map((u, idx) => 
        idx === i ? { ...u, status: 'uploading' as const } : u
      ));

      try {
        // Create filename from the custom name
        const sanitizedName = upload.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        const extension = upload.file.name.split('.').pop()?.toLowerCase() || 'png';
        const fileName = `${sanitizedName}-${Date.now()}.${extension}`;

        // Upload to Supabase storage - game-cards bucket, shito-calling-cards.singles folder
        const { error: uploadError } = await supabase.storage
          .from('game-cards')
          .upload(`shito-calling-cards.singles/${fileName}`, upload.file, {
            contentType: upload.file.type,
            upsert: false
          });


        if (uploadError) {
          throw uploadError;
        }

        // Update status to success
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
        description: `Successfully uploaded ${successCount} image${successCount > 1 ? 's' : ''}${errorCount > 0 ? `. ${errorCount} failed.` : ''}`
      });
      onUploadComplete();
      
      // Clear successful uploads after a delay
      setTimeout(() => {
        setPendingUploads(prev => prev.filter(u => u.status !== 'success'));
      }, 2000);
    } else if (errorCount > 0) {
      toast({
        title: 'Upload Failed',
        description: `Failed to upload ${errorCount} image${errorCount > 1 ? 's' : ''}`,
        variant: 'destructive'
      });
    }
  };

  const clearAll = () => {
    pendingUploads.forEach(upload => URL.revokeObjectURL(upload.preview));
    setPendingUploads([]);
  };

  const pendingCount = pendingUploads.filter(u => u.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
          isDragging
            ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-amber-400'
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
            isDragging ? 'bg-amber-500 text-white' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
          }`}>
            <Upload className="w-8 h-8" />
          </div>
          
          <div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              {isDragging ? 'Drop images here!' : 'Drag & drop images here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to browse • PNG, JPG, GIF, WebP supported
            </p>
          </div>
        </div>
      </div>

      {/* Pending Uploads */}
      {pendingUploads.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-700 dark:text-gray-300">
              Images to Upload ({pendingUploads.length})
            </h3>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={clearAll}
                disabled={isUploading}
              >
                Clear All
              </Button>
              <Button
                size="sm"
                onClick={uploadAll}
                disabled={isUploading || pendingCount === 0}
                className="bg-amber-500 hover:bg-amber-600"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingUploads.map((upload, index) => (
              <div
                key={index}
                className={`relative bg-white dark:bg-gray-800 rounded-xl border overflow-hidden transition-all ${
                  upload.status === 'success'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : upload.status === 'error'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : upload.status === 'uploading'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Status Overlay */}
                {upload.status === 'uploading' && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  </div>
                )}
                
                {upload.status === 'success' && (
                  <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  </div>
                )}

                {/* Remove Button */}
                {upload.status === 'pending' && (
                  <button
                    onClick={() => removeUpload(index)}
                    className="absolute top-2 right-2 z-20 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Image Preview */}
                <div className="aspect-square bg-gray-100 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                  <img
                    src={upload.preview}
                    alt={upload.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Name Input */}
                <div className="p-3">
                  <Label className="text-xs text-gray-500">Icon Name</Label>
                  <Input
                    value={upload.name}
                    onChange={(e) => updateUploadName(index, e.target.value)}
                    disabled={upload.status !== 'pending'}
                    placeholder="Enter icon name"
                    className="mt-1 text-sm"
                  />
                  
                  {upload.status === 'error' && (
                    <div className="mt-2 flex items-center gap-1 text-red-500 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      <span>{upload.error || 'Upload failed'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {pendingUploads.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No images selected yet</p>
          <p className="text-sm">Drag and drop or click above to add images</p>
        </div>
      )}
    </div>
  );
};

export default ShitoCardUploader;
