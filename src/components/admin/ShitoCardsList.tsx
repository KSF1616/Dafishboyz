import React, { useState } from 'react';
import { Trash2, Edit2, Check, X, Loader2, Eye, Download, Search, Grid, List } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export interface ShitoCard {
  id: string;
  name: string;
  fileName: string;
  url: string;
  createdAt: string;
}

interface ShitoCardsListProps {
  cards: ShitoCard[];
  loading: boolean;
  onRefresh: () => void;
}

const ShitoCardsList: React.FC<ShitoCardsListProps> = ({ cards, loading, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteCard, setDeleteCard] = useState<ShitoCard | null>(null);
  const [previewCard, setPreviewCard] = useState<ShitoCard | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const { toast } = useToast();

  const filteredCards = cards.filter(card =>
    card.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startEditing = (card: ShitoCard) => {
    setEditingId(card.id);
    setEditName(card.name);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveRename = async (card: ShitoCard) => {
    if (!editName.trim() || editName === card.name) {
      cancelEditing();
      return;
    }

    setIsRenaming(true);

    try {
      // Create new filename
      const sanitizedName = editName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      const extension = card.fileName.split('.').pop() || 'png';
      const newFileName = `${sanitizedName}-${Date.now()}.${extension}`;
      // Download the file
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('game-cards')
        .download(`shito-calling-cards.singles/${card.fileName}`);

      if (downloadError) throw downloadError;

      // Upload with new name
      const { error: uploadError } = await supabase.storage
        .from('game-cards')
        .upload(`shito-calling-cards.singles/${newFileName}`, fileData, {
          contentType: `image/${extension}`,
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Delete old file
      await supabase.storage
        .from('game-cards')
        .remove([`shito-calling-cards.singles/${card.fileName}`]);

      toast({
        title: 'Card Renamed',
        description: `Successfully renamed to "${editName}"`
      });

      onRefresh();
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
    if (!deleteCard) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase.storage
        .from('game-cards')
        .remove([`shito-calling-cards.singles/${deleteCard.fileName}`]);

      if (error) throw error;


      toast({
        title: 'Card Deleted',
        description: `"${deleteCard.name}" has been removed`
      });

      onRefresh();
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete Failed',
        description: error.message,
        variant: 'destructive'
      });
    }

    setIsDeleting(false);
    setDeleteCard(null);
  };

  const downloadCard = (card: ShitoCard) => {
    const link = document.createElement('a');
    link.href = card.url;
    link.download = card.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search cards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {filteredCards.length} of {cards.length} cards
          </span>
          <div className="flex border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Cards Display */}
      {filteredCards.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {cards.length === 0 ? (
            <>
              <p className="text-lg font-medium">No cards uploaded yet</p>
              <p className="text-sm">Upload some images to get started</p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium">No cards match your search</p>
              <p className="text-sm">Try a different search term</p>
            </>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-all"
            >
              {/* Image */}
              <div 
                className="aspect-square bg-gray-100 dark:bg-gray-900 cursor-pointer"
                onClick={() => setPreviewCard(card)}
              >
                <img
                  src={card.url}
                  alt={card.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Hover Actions */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button
                  onClick={() => setPreviewCard(card)}
                  className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white shadow-sm"
                  title="Preview"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => downloadCard(card)}
                  className="p-1.5 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white shadow-sm"
                  title="Download"
                >
                  <Download className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={() => setDeleteCard(card)}
                  className="p-1.5 bg-red-500/90 rounded-lg hover:bg-red-500 shadow-sm"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Name */}
              <div className="p-2">
                {editingId === card.id ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-7 text-xs"
                      disabled={isRenaming}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename(card);
                        if (e.key === 'Escape') cancelEditing();
                      }}
                    />
                    <button
                      onClick={() => saveRename(card)}
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
                    <p className="text-sm font-medium truncate flex-1" title={card.name}>
                      {card.name}
                    </p>
                    <button
                      onClick={() => startEditing(card)}
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
          {filteredCards.map((card) => (
            <div
              key={card.id}
              className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all"
            >
              {/* Thumbnail */}
              <div 
                className="w-16 h-16 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden cursor-pointer flex-shrink-0"
                onClick={() => setPreviewCard(card)}
              >
                <img
                  src={card.url}
                  alt={card.name}
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {editingId === card.id ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="h-8"
                      disabled={isRenaming}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveRename(card);
                        if (e.key === 'Escape') cancelEditing();
                      }}
                    />
                    <button
                      onClick={() => saveRename(card)}
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
                    <p className="font-medium truncate">{card.name}</p>
                    <p className="text-sm text-gray-500 truncate">{card.fileName}</p>
                  </>
                )}
              </div>

              {/* Actions */}
              {editingId !== card.id && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewCard(card)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(card)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadCard(card)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteCard(card)}
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

      {/* Preview Dialog */}
      <Dialog open={!!previewCard} onOpenChange={() => setPreviewCard(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{previewCard?.name}</DialogTitle>
          </DialogHeader>
          {previewCard && (
            <div className="flex flex-col items-center gap-4">
              <div className="w-full max-h-[60vh] bg-gray-100 dark:bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center">
                <img
                  src={previewCard.url}
                  alt={previewCard.name}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => downloadCard(previewCard)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDeleteCard(previewCard);
                    setPreviewCard(null);
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
      <AlertDialog open={!!deleteCard} onOpenChange={() => setDeleteCard(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Card?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteCard?.name}"? This action cannot be undone.
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

export default ShitoCardsList;
