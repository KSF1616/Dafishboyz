import React, { useState, useCallback } from 'react';
import { 
  Archive, 
  Upload, 
  Loader2, 
  Check, 
  X, 
  FolderOpen,
  FileArchive,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ZipUploadSectionProps {
  onExtractComplete: () => void;
  buckets: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  selectedBucketId: string;
}

interface ExtractionResult {
  success: boolean;
  message: string;
  uploadedFiles: string[];
  uploadedCount: number;
  skippedCount: number;
  errors?: string[];
}

const ZipUploadSection: React.FC<ZipUploadSectionProps> = ({
  onExtractComplete,
  buckets,
  selectedBucketId
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFolder, setTargetFolder] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [selectedBucket, setSelectedBucket] = useState(selectedBucketId);
  
  const { toast } = useToast();

  // Parse bucket ID to get bucket name and folder
  const parseBucketId = (bucketId: string): { bucket: string; folder: string } => {
    const parts = bucketId.split('/');
    if (parts.length >= 2) {
      return { bucket: parts[0], folder: parts.slice(1).join('/') };
    }
    return { bucket: bucketId, folder: '' };
  };

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
    
    const files = Array.from(e.dataTransfer.files);
    const zipFile = files.find(f => f.name.toLowerCase().endsWith('.zip'));
    
    if (zipFile) {
      setSelectedFile(zipFile);
      // Auto-suggest folder name from ZIP filename
      const suggestedFolder = zipFile.name.replace(/\.zip$/i, '');
      setTargetFolder(suggestedFolder);
      setResult(null);
    } else {
      toast({
        title: 'Invalid file',
        description: 'Please select a ZIP file',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.zip')) {
      setSelectedFile(file);
      // Auto-suggest folder name from ZIP filename
      const suggestedFolder = file.name.replace(/\.zip$/i, '');
      setTargetFolder(suggestedFolder);
      setResult(null);
    } else if (file) {
      toast({
        title: 'Invalid file',
        description: 'Please select a ZIP file',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const handleExtract = async () => {
    if (!selectedFile || !targetFolder.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please select a ZIP file and specify a target folder',
        variant: 'destructive'
      });
      return;
    }

    setIsExtracting(true);
    setProgress(10);
    setResult(null);

    try {
      const { bucket } = parseBucketId(selectedBucket);
      
      // Create form data
      const formData = new FormData();
      formData.append('zipFile', selectedFile);
      formData.append('targetFolder', targetFolder.trim());
      formData.append('bucketName', bucket);

      setProgress(30);

      // Call the edge function
      const { data, error } = await supabase.functions.invoke('extract-zip', {
        body: formData
      });

      setProgress(90);

      if (error) {
        throw new Error(error.message || 'Failed to extract ZIP file');
      }

      setProgress(100);
      setResult(data as ExtractionResult);

      if (data.success) {
        toast({
          title: 'Extraction Complete!',
          description: `Successfully extracted ${data.uploadedCount} files to ${bucket}/${targetFolder}`
        });
        onExtractComplete();
      } else {
        toast({
          title: 'Extraction Failed',
          description: data.error || 'Unknown error occurred',
          variant: 'destructive'
        });
      }

    } catch (error: any) {
      console.error('Extraction error:', error);
      toast({
        title: 'Extraction Failed',
        description: error.message || 'Failed to extract ZIP file',
        variant: 'destructive'
      });
      setResult({
        success: false,
        message: error.message || 'Failed to extract ZIP file',
        uploadedFiles: [],
        uploadedCount: 0,
        skippedCount: 0,
        errors: [error.message]
      });
    }

    setIsExtracting(false);
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setTargetFolder('');
    setResult(null);
    setProgress(0);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30">
          <Archive className="w-6 h-6 text-purple-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold">ZIP File Extractor</h2>
          <p className="text-gray-500 text-sm">
            Upload a ZIP file to automatically extract and upload all images
          </p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all mb-6 ${
          isDragging
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : selectedFile
            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
        }`}
      >
        <input
          type="file"
          accept=".zip"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isExtracting}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isDragging 
              ? 'bg-purple-500 text-white' 
              : selectedFile
              ? 'bg-green-500 text-white'
              : 'bg-purple-100 dark:bg-purple-900/30 text-purple-600'
          }`}>
            {selectedFile ? (
              <Check className="w-8 h-8" />
            ) : (
              <FileArchive className="w-8 h-8" />
            )}
          </div>
          
          <div>
            {selectedFile ? (
              <>
                <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                  {isDragging ? 'Drop ZIP file here!' : 'Drag & drop a ZIP file here'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  or click to browse • ZIP files only
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Configuration */}
      {selectedFile && (
        <div className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetBucket" className="text-sm font-medium mb-2 block">
                Target Bucket
              </Label>
              <Select value={selectedBucket} onValueChange={setSelectedBucket}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bucket" />
                </SelectTrigger>
                <SelectContent>
                  {buckets.map(bucket => (
                    <SelectItem key={bucket.id} value={bucket.id}>
                      {bucket.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="targetFolder" className="text-sm font-medium mb-2 block">
                Target Folder Name
              </Label>
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-gray-400" />
                <Input
                  id="targetFolder"
                  value={targetFolder}
                  onChange={(e) => setTargetFolder(e.target.value)}
                  placeholder="e.g., SHITO-calling-cards"
                  disabled={isExtracting}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Files will be extracted to: {parseBucketId(selectedBucket).bucket}/{targetFolder || '[folder-name]'}
              </p>
            </div>
          </div>

          {/* Progress */}
          {isExtracting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Extracting and uploading...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleExtract}
              disabled={isExtracting || !targetFolder.trim()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Extract & Upload
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={clearSelection}
              disabled={isExtracting}
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className={`rounded-xl p-4 ${
          result.success 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start gap-3">
            {result.success ? (
              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className={`font-medium ${result.success ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {result.message}
              </p>
              
              {result.success && (
                <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                  <p>Uploaded: {result.uploadedCount} files</p>
                  {result.skippedCount > 0 && (
                    <p>Skipped: {result.skippedCount} files (non-images or system files)</p>
                  )}
                </div>
              )}

              {result.errors && result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">Errors:</p>
                  <ul className="text-sm text-red-500 dark:text-red-400 list-disc list-inside">
                    {result.errors.slice(0, 5).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {result.errors.length > 5 && (
                      <li>...and {result.errors.length - 5} more errors</li>
                    )}
                  </ul>
                </div>
              )}

              {result.success && result.uploadedFiles.length > 0 && (
                <details className="mt-3">
                  <summary className="text-sm text-green-600 dark:text-green-400 cursor-pointer hover:underline">
                    View uploaded files ({result.uploadedFiles.length})
                  </summary>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      {result.uploadedFiles.map((file, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-green-500" />
                          {file}
                        </li>
                      ))}
                    </ul>
                  </div>
                </details>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
              <li>Upload a ZIP file containing game card images</li>
              <li>Only image files (PNG, JPG, GIF, WebP, SVG) will be extracted</li>
              <li>System files (like __MACOSX) are automatically skipped</li>
              <li>Existing files with the same name will be overwritten</li>
              <li>Files are uploaded to the specified folder in the storage bucket</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZipUploadSection;
