import React, { useRef } from 'react';
import { Save, FolderOpen, Trash2, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { games } from '@/data/gamesData';

interface Props {
  boardName: string;
  selectedGame: string;
  gridSize: number;
  backgroundColor: string;
  isSaving: boolean;
  onNameChange: (name: string) => void;
  onGameChange: (gameId: string) => void;
  onGridSizeChange: (size: number) => void;
  onBackgroundChange: (color: string) => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  onExport: () => void;
  onImport: (file: File) => void;
}

export const BoardEditorToolbar: React.FC<Props> = ({
  boardName, selectedGame, gridSize, backgroundColor, isSaving,
  onNameChange, onGameChange, onGridSizeChange, onBackgroundChange,
  onSave, onLoad, onClear, onExport, onImport
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input so same file can be imported again
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[150px]">
          <Label className="text-xs">Board Name</Label>
          <Input value={boardName} onChange={(e) => onNameChange(e.target.value)} placeholder="My Board" className="mt-1 h-9" />
        </div>
        <div className="w-40">
          <Label className="text-xs">Game</Label>
          <Select value={selectedGame} onValueChange={onGameChange}>
            <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {games.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="w-24">
          <Label className="text-xs">Grid</Label>
          <Select value={String(gridSize)} onValueChange={(v) => onGridSizeChange(Number(v))}>
            <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10px</SelectItem>
              <SelectItem value="20">20px</SelectItem>
              <SelectItem value="25">25px</SelectItem>
              <SelectItem value="50">50px</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-20">
          <Label className="text-xs">BG</Label>
          <input type="color" value={backgroundColor} onChange={(e) => onBackgroundChange(e.target.value)} className="mt-1 w-full h-9 rounded cursor-pointer" />
        </div>
        <div className="flex gap-2">
          <Button onClick={onSave} disabled={isSaving} size="sm" className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-1" />{isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button onClick={onLoad} variant="outline" size="sm"><FolderOpen className="w-4 h-4 mr-1" />Load</Button>
          <Button onClick={handleImportClick} variant="outline" size="sm" className="text-blue-600 hover:text-blue-700">
            <Upload className="w-4 h-4 mr-1" />Import
          </Button>
          <Button onClick={onExport} variant="outline" size="sm"><Download className="w-4 h-4" /></Button>
          <Button onClick={onClear} variant="outline" size="sm" className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
        </div>
      </div>
      <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileChange} className="hidden" />
    </div>
  );
};
