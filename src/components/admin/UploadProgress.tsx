import React from 'react';
import { FileText, CheckCircle, Loader2, AlertCircle, CloudUpload, HardDrive } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface UploadProgressProps {
  fileName: string;
  progress: number;
  isComplete: boolean;
  error?: string | null;
  storageType?: 'supabase' | 'local';
}

export const UploadProgress: React.FC<UploadProgressProps> = ({ fileName, progress, isComplete, error, storageType = 'supabase' }) => {
  const hasError = !!error;
  
  const getStatusColor = () => {
    if (hasError) return 'bg-red-100 dark:bg-red-900/30';
    if (isComplete) return 'bg-green-100 dark:bg-green-900/30';
    return 'bg-purple-100 dark:bg-purple-900/30';
  };

  const getIcon = () => {
    if (hasError) return <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />;
    if (isComplete) return <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />;
    return <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />;
  };

  const getStatusText = () => {
    if (hasError) return 'Failed';
    if (isComplete) return 'Complete';
    if (progress < 30) return 'Preparing...';
    if (progress < 70) return 'Uploading...';
    if (progress < 100) return 'Finalizing...';
    return `${Math.round(progress)}%`;
  };

  return (
    <div className={`rounded-xl p-6 border-2 shadow-sm transition-all ${hasError ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800' : isComplete ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${getStatusColor()}`}>{getIcon()}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{fileName}</span>
            <div className="flex items-center gap-2">
              {storageType === 'supabase' ? <CloudUpload className="w-4 h-4 text-blue-500" /> : <HardDrive className="w-4 h-4 text-gray-500" />}
              <span className={`text-sm font-medium ${hasError ? 'text-red-500' : isComplete ? 'text-green-500' : 'text-gray-500'}`}>{getStatusText()}</span>
            </div>
          </div>
          
          <Progress value={hasError ? 100 : progress} className={`h-2 ${hasError ? '[&>div]:bg-red-500' : isComplete ? '[&>div]:bg-green-500' : ''}`} />
          
          {hasError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}
          {isComplete && !hasError && (
            <p className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Stored in {storageType === 'supabase' ? 'Supabase Storage' : 'public/game-cards'}
            </p>
          )}
        </div>
        
        {!isComplete && !hasError && <Loader2 className="w-5 h-5 text-purple-500 animate-spin flex-shrink-0" />}
      </div>
    </div>
  );
};
