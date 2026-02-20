import React, { useState, useCallback } from 'react';
import { Upload, Image, Check, X, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { DAFISH_BOYZ_LOGO_URL } from '@/lib/logoUrl';

const LogoUploadSection: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, GIF, WebP, SVG)",
        variant: "destructive"
      });
    }
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const uploadLogo = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 90));
      }, 200);

      // Upload as dafishboyz-logo.png to match the expected filename
      const { error: uploadError } = await supabase.storage
        .from('marketing')
        .upload('dafishboyz-logo.png', selectedFile, {
          contentType: selectedFile.type,
          upsert: true
        });

      clearInterval(progressInterval);

      if (uploadError) throw uploadError;

      setUploadProgress(100);

      toast({
        title: "Logo Uploaded Successfully!",
        description: "Your new logo will appear across the site. Refresh the page to see it.",
      });

      // Clear the preview after successful upload
      setTimeout(() => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setUploadProgress(0);
        // Force page reload to refresh the logo
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Logo upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-br from-amber-100 to-lime-100 dark:from-amber-900/30 dark:to-lime-900/30 rounded-xl">
          <Image className="w-8 h-8 text-amber-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-lime-600 bg-clip-text text-transparent">
            Brand Logo
          </h2>
          <p className="text-gray-500 text-sm">Upload your company logo for branding across the site</p>
        </div>
      </div>

      {/* Current Logo Display */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 mb-3 font-medium">Current Logo (dafishboyz-logo.png):</p>
        <div className="flex items-center gap-4">
          <div className="relative">
            <img 
              src={DAFISH_BOYZ_LOGO_URL} 
              alt="Current Logo" 
              className="w-20 h-20 object-contain rounded-xl border-2 border-amber-500/30 shadow-lg"
            />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              DAFISH BOYZ Logo Active
            </p>
            <p className="text-xs text-gray-500">
              File: marketing/dafishboyz-logo.png
            </p>
            <p className="text-xs text-green-600 mt-1">
              This logo is displayed across all pages
            </p>
          </div>
        </div>
      </div>

      {/* Upload Area */}
      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragging 
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-amber-400 hover:bg-amber-50/50 dark:hover:bg-amber-900/10'
          }`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            id="logo-upload"
          />
          <label htmlFor="logo-upload" className="cursor-pointer">
            <div className="flex flex-col items-center gap-3">
              <div className={`p-4 rounded-full transition-colors ${
                isDragging ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
              }`}>
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">
                  {isDragging ? 'Drop your logo here' : 'Drag & drop to replace logo'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse (PNG, JPG, GIF, WebP, SVG)
                </p>
              </div>
              <p className="text-xs text-gray-400">
                Will be saved as dafishboyz-logo.png in the marketing bucket
              </p>
            </div>
          </label>
        </div>
      ) : (
        <div className="border-2 border-amber-500 rounded-xl p-6 bg-amber-50/50 dark:bg-amber-900/10">
          <div className="flex items-start gap-6">
            {/* Preview */}
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Logo Preview" 
                className="w-32 h-32 object-contain rounded-xl border-2 border-amber-500/50 shadow-lg bg-white dark:bg-gray-800"
              />
              <div className="absolute -top-2 -right-2">
                <button
                  onClick={cancelUpload}
                  className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Info & Actions */}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">
                {selectedFile?.name}
              </h4>
              <p className="text-sm text-gray-500 mb-2">
                {selectedFile && (selectedFile.size / 1024).toFixed(1)} KB
              </p>
              <p className="text-xs text-amber-600 mb-4">
                Will replace: dafishboyz-logo.png
              </p>

              {/* Progress Bar */}
              {isUploading && (
                <div className="mb-4">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-lime-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {uploadProgress === 100 ? 'Upload complete!' : `Uploading... ${uploadProgress}%`}
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={uploadLogo}
                  disabled={isUploading}
                  className="bg-gradient-to-r from-amber-500 to-lime-500 hover:from-amber-600 hover:to-lime-600 text-black font-semibold"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : uploadProgress === 100 ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Uploaded!
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Logo
                    </>
                  )}
                </Button>
                {!isUploading && uploadProgress !== 100 && (
                  <Button
                    variant="outline"
                    onClick={cancelUpload}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
          <Image className="w-4 h-4" />
          Logo Tips
        </h4>
        <ul className="text-sm text-blue-600 dark:text-blue-300 space-y-1">
          <li>• Use a square image for best results across all placements</li>
          <li>• PNG with transparent background works best</li>
          <li>• Your logo will be saved as dafishboyz-logo.png</li>
          <li>• The logo appears in the header, footer, hero section, and about page</li>
        </ul>
      </div>
    </div>
  );
};

export default LogoUploadSection;
