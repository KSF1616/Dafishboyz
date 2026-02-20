import React, { useState, useEffect } from 'react';
import { ArrowLeft, Layout, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BoardElementPalette } from '@/components/admin/boardEditor/BoardElementPalette';
import { BoardCanvas } from '@/components/admin/boardEditor/BoardCanvas';
import { BoardElementProperties } from '@/components/admin/boardEditor/BoardElementProperties';
import { BoardEditorToolbar } from '@/components/admin/BoardEditorToolbar';
import { BoardEditorSavedBoards } from '@/components/admin/BoardEditorSavedBoards';
import { BoardElement, BoardConfiguration, DragItem, ElementType, ELEMENT_PALETTE } from '@/types/boardEditor';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { games } from '@/data/gamesData';

const VALID_ELEMENT_TYPES: ElementType[] = ['player-position', 'game-zone', 'card-deck', 'dice-area', 'score-track', 'path-tile', 'obstacle', 'bonus-zone', 'start-zone', 'end-zone', 'text-label', 'image'];

const BoardEditor: React.FC = () => {
  const [elements, setElements] = useState<BoardElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [boardName, setBoardName] = useState('New Board');
  const [selectedGame, setSelectedGame] = useState(games[0].id);
  const [gridSize, setGridSize] = useState(20);
  const [backgroundColor, setBackgroundColor] = useState('#f3f4f6');
  const [savedBoards, setSavedBoards] = useState<BoardConfiguration[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, isDemo } = useAuth();

  useEffect(() => { fetchSavedBoards(); }, [selectedGame, isDemo]);

  const fetchSavedBoards = async () => {
    if (isDemo) {
      const stored = localStorage.getItem(`demo_boards_${selectedGame}`);
      if (stored) setSavedBoards(JSON.parse(stored));
      else setSavedBoards([]);
      return;
    }
    const { data } = await supabase.from('board_configurations').select('*').eq('game_id', selectedGame).order('created_at', { ascending: false });
    if (data) setSavedBoards(data);
  };

  const selectedElement = elements.find(e => e.id === selectedId) || null;

  const handleAddElement = (item: DragItem, x: number, y: number) => {
    const newElement: BoardElement = {
      id: `el-${Date.now()}`, type: item.type, x, y, width: item.defaultWidth, height: item.defaultHeight,
      rotation: 0, label: item.label, color: item.defaultColor, zIndex: elements.length, properties: {}
    };
    setElements([...elements, newElement]);
    setSelectedId(newElement.id);
  };

  const handleUpdateElement = (id: string, updates: Partial<BoardElement>) => {
    setElements(elements.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const handleDeleteElement = (id: string) => {
    setElements(elements.filter(e => e.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const config: BoardConfiguration = {
      id: editingId || `demo-${Date.now()}`, game_id: selectedGame, name: boardName, is_active: false,
      board_data: { elements, gridSize, boardWidth: 800, boardHeight: 500, backgroundColor }
    };
    if (isDemo) {
      const stored = localStorage.getItem(`demo_boards_${selectedGame}`);
      const boards: BoardConfiguration[] = stored ? JSON.parse(stored) : [];
      const existingIdx = boards.findIndex(b => b.id === config.id);
      if (existingIdx >= 0) boards[existingIdx] = config; else boards.unshift(config);
      localStorage.setItem(`demo_boards_${selectedGame}`, JSON.stringify(boards));
      setIsSaving(false);
      toast({ title: 'Saved!', description: `Board "${boardName}" saved.` });
      fetchSavedBoards(); return;
    }
    const { error } = editingId 
      ? await supabase.from('board_configurations').update(config).eq('id', editingId)
      : await supabase.from('board_configurations').insert(config);
    setIsSaving(false);
    if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); return; }
    toast({ title: 'Saved!', description: `Board "${boardName}" saved.` });
    fetchSavedBoards();
  };

  const handleLoad = (board: BoardConfiguration) => {
    setElements(board.board_data.elements || []);
    setBoardName(board.name);
    setGridSize(board.board_data.gridSize || 20);
    setBackgroundColor(board.board_data.backgroundColor || '#f3f4f6');
    setEditingId(board.id || null);
    setShowSaved(false);
  };

  const handleDelete = async (id: string) => {
    if (isDemo) {
      const stored = localStorage.getItem(`demo_boards_${selectedGame}`);
      const boards: BoardConfiguration[] = stored ? JSON.parse(stored) : [];
      localStorage.setItem(`demo_boards_${selectedGame}`, JSON.stringify(boards.filter(b => b.id !== id)));
      fetchSavedBoards(); toast({ title: 'Deleted' }); return;
    }
    await supabase.from('board_configurations').delete().eq('id', id);
    fetchSavedBoards(); toast({ title: 'Deleted' });
  };

  const handleSetActive = async (id: string) => {
    if (isDemo) {
      const stored = localStorage.getItem(`demo_boards_${selectedGame}`);
      const boards: BoardConfiguration[] = stored ? JSON.parse(stored) : [];
      const updated = boards.map(b => ({ ...b, is_active: b.id === id }));
      localStorage.setItem(`demo_boards_${selectedGame}`, JSON.stringify(updated));
      fetchSavedBoards(); toast({ title: 'Board activated!' }); return;
    }
    await supabase.from('board_configurations').update({ is_active: false }).eq('game_id', selectedGame);
    await supabase.from('board_configurations').update({ is_active: true }).eq('id', id);
    fetchSavedBoards(); toast({ title: 'Board activated!' });
  };

  const handleClear = () => { setElements([]); setSelectedId(null); setEditingId(null); setBoardName('New Board'); };

  const handleExport = () => {
    const data = JSON.stringify({ name: boardName, game_id: selectedGame, elements, gridSize, backgroundColor }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${boardName}.json`; a.click();
  };

  const validateBoardData = (data: any): { valid: boolean; error?: string } => {
    if (!data || typeof data !== 'object') return { valid: false, error: 'Invalid JSON structure' };
    if (!data.name || typeof data.name !== 'string') return { valid: false, error: 'Missing or invalid board name' };
    if (!Array.isArray(data.elements)) return { valid: false, error: 'Missing or invalid elements array' };
    for (let i = 0; i < data.elements.length; i++) {
      const el = data.elements[i];
      if (!el.id || !el.type) return { valid: false, error: `Element ${i + 1}: missing id or type` };
      if (!VALID_ELEMENT_TYPES.includes(el.type)) return { valid: false, error: `Element ${i + 1}: invalid type "${el.type}"` };
      if (typeof el.x !== 'number' || typeof el.y !== 'number') return { valid: false, error: `Element ${i + 1}: invalid position` };
      if (typeof el.width !== 'number' || typeof el.height !== 'number') return { valid: false, error: `Element ${i + 1}: invalid dimensions` };
    }
    return { valid: true };
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const data = JSON.parse(content);
        const validation = validateBoardData(data);
        if (!validation.valid) {
          toast({ title: 'Import Failed', description: validation.error, variant: 'destructive' }); return;
        }
        setElements(data.elements);
        setBoardName(data.name || 'Imported Board');
        if (data.gridSize) setGridSize(data.gridSize);
        if (data.backgroundColor) setBackgroundColor(data.backgroundColor);
        if (data.game_id && games.find(g => g.id === data.game_id)) setSelectedGame(data.game_id);
        setEditingId(null);
        toast({ title: 'Import Successful', description: `Loaded "${data.name}" with ${data.elements.length} elements.` });
      } catch (err) {
        toast({ title: 'Import Failed', description: 'Invalid JSON file. Please select a valid board export file.', variant: 'destructive' });
      }
    };
    reader.onerror = () => { toast({ title: 'Import Failed', description: 'Could not read file.', variant: 'destructive' }); };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link to="/admin/upload" className="text-purple-600 hover:text-purple-700"><ArrowLeft className="w-5 h-5" /></Link>
            <div className="flex items-center gap-2">
              <Layout className="w-6 h-6 text-purple-600" />
              <h1 className="text-2xl font-bold">Board Editor</h1>
              {isDemo && <span className="px-2 py-1 bg-amber-500/20 text-amber-500 text-xs rounded-full flex items-center gap-1"><Zap className="w-3 h-3" />Demo</span>}
            </div>
          </div>
        </div>
        <BoardEditorToolbar boardName={boardName} selectedGame={selectedGame} gridSize={gridSize} backgroundColor={backgroundColor} isSaving={isSaving}
          onNameChange={setBoardName} onGameChange={(g) => { setSelectedGame(g); handleClear(); }} onGridSizeChange={setGridSize} onBackgroundChange={setBackgroundColor}
          onSave={handleSave} onLoad={() => setShowSaved(!showSaved)} onClear={handleClear} onExport={handleExport} onImport={handleImport} />
        {showSaved && (
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
            <h3 className="font-semibold mb-3">Saved Boards for {games.find(g => g.id === selectedGame)?.name}</h3>
            <BoardEditorSavedBoards boards={savedBoards} onLoad={handleLoad} onDelete={handleDelete} onSetActive={handleSetActive} />
          </div>
        )}
        <div className="mt-4 grid grid-cols-12 gap-4">
          <div className="col-span-2"><BoardElementPalette onDragStart={() => {}} /></div>
          <div className="col-span-8">
            <BoardCanvas elements={elements} selectedId={selectedId} backgroundColor={backgroundColor} gridSize={gridSize}
              onSelectElement={setSelectedId} onUpdateElement={handleUpdateElement} onDeleteElement={handleDeleteElement} onAddElement={handleAddElement} />
          </div>
          <div className="col-span-2">
            <BoardElementProperties element={selectedElement} onUpdate={(updates) => selectedId && handleUpdateElement(selectedId, updates)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BoardEditor;
