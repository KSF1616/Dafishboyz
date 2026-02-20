import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle, FileText, X, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { games } from '@/data/gamesData';
import { CardType } from '@/types/gameCards';

interface PDFDropzoneProps {
  onFileSelect: (file: File, gameId: string, cardType: CardType, description: string) => void;
  isUploading: boolean;
  selectedGame: string;
  onGameChange: (gameId: string) => void;
}

export const PDFDropzone: React.FC<PDFDropzoneProps> = ({ onFileSelect, isUploading, selectedGame, onGameChange }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileValid, setFileValid] = useState(false);
  const [cardType, setCardType] = useState<CardType>('prompt');
  const [description, setDescription] = useState('');

  const validateFile = (file: File): string | null => {
    if (file.type !== 'application/pdf') return 'Only PDF files are allowed';
    if (file.size > 50 * 1024 * 1024) return 'File size must be less than 50MB';
    return null;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDrag = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); }, []);
  const handleDragIn = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); setDragError(null); }, []);
  const handleDragOut = useCallback((e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);

  const processFile = (file: File) => {
    const error = validateFile(file);
    if (error) { setDragError(error); setSelectedFile(null); setFileValid(false); }
    else { setDragError(null); setSelectedFile(file); setFileValid(true); }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleUpload = () => {
    if (!selectedGame) { setDragError('Please select a game first'); return; }
    if (selectedFile && fileValid) {
      onFileSelect(selectedFile, selectedGame, cardType, description);
      setSelectedFile(null); setFileValid(false); setDescription('');
    }
  };

  const clearFile = () => { setSelectedFile(null); setFileValid(false); setDragError(null); };

  return (
    <div className="space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>Select Game</Label>
          <Select value={selectedGame} onValueChange={onGameChange}>
            <SelectTrigger className="mt-2"><SelectValue placeholder="Choose a game..." /></SelectTrigger>
            <SelectContent>{games.map(g => (<SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>))}</SelectContent>
          </Select>
        </div>
        <div>
          <Label>Card Type</Label>
          <Select value={cardType} onValueChange={(v) => setCardType(v as CardType)}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="prompt">Prompt Cards</SelectItem>
              <SelectItem value="response">Response Cards</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div onDragEnter={handleDragIn} onDragLeave={handleDragOut} onDragOver={handleDrag} onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${isDragging ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'} ${isUploading ? 'pointer-events-none opacity-70' : ''}`}>
        <input type="file" accept=".pdf" onChange={handleFileInput} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploading} />
        <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-purple-500 animate-bounce' : 'text-gray-400'}`} />
        <p className="text-lg font-medium">{isDragging ? 'Drop PDF here!' : 'Drag & drop PDF'}</p>
        <p className="text-sm text-gray-500 mt-1">or click to browse (max 50MB)</p>
      </div>

      {selectedFile && fileValid && (
        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-green-500" />
              <div><p className="font-medium">{selectedFile.name}</p><p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p></div>
            </div>
            <Button variant="ghost" size="sm" onClick={clearFile}><X className="w-4 h-4" /></Button>
          </div>
          <Textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} className="mb-3" rows={2} />
          <Button onClick={handleUpload} disabled={isUploading} className="w-full bg-purple-600 hover:bg-purple-700">
            {isUploading ? 'Uploading...' : `Upload ${cardType} cards`}
          </Button>
        </div>
      )}

      {dragError && <div className="p-3 bg-red-50 rounded-lg flex items-center gap-2 text-red-600"><AlertCircle className="w-5 h-5" />{dragError}</div>}
    </div>
  );
};
