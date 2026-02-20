import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, FileJson, X } from 'lucide-react';

interface Props {
  onFileLoad: (content: string, fileName: string) => void;
  isLoading: boolean;
}

export const BulkImportDropzone: React.FC<Props> = ({ onFileLoad, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.name.match(/\.(csv|json)$/i)) {
      alert('Please upload a CSV or JSON file');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setSelectedFile(file.name);
      onFileLoad(content, file.name);
    };
    reader.readAsText(file);
  }, [onFileLoad]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
        isDragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'
      } ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      <input type="file" accept=".csv,.json" onChange={handleChange} className="hidden" id="bulk-file-input" disabled={isLoading} />
      
      <div className="flex justify-center gap-4 mb-4">
        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
          <FileSpreadsheet className="w-8 h-8 text-green-600" />
        </div>
        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
          <FileJson className="w-8 h-8 text-amber-600" />
        </div>
      </div>
      
      <label htmlFor="bulk-file-input" className="cursor-pointer">
        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-300 mb-2">
          <Upload className="w-5 h-5" />
          <span className="font-medium">Drop CSV or JSON file here</span>
        </div>
        <p className="text-sm text-gray-500">or click to browse</p>
      </label>
      
      {selectedFile && (
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
          <span className="text-sm">{selectedFile}</span>
          <button onClick={() => setSelectedFile(null)}><X className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
};
