import React, { useState } from 'react';
import { FileText, Trash2, ExternalLink, Download, Edit2, Check, X, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { games } from '@/data/gamesData';
import { GameCard, CardType } from '@/types/gameCards';

interface GameCardsListProps {
  cards: GameCard[];
  onDelete: (card: GameCard) => void;
  onUpdate: (card: GameCard, updates: { card_type?: CardType; description?: string }) => void;
  onPreview: (card: GameCard) => void;
}

export const GameCardsList: React.FC<GameCardsListProps> = ({ cards, onDelete, onUpdate, onPreview }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editType, setEditType] = useState<CardType>('prompt');
  const [editDesc, setEditDesc] = useState('');

  const startEdit = (card: GameCard) => {
    setEditingId(card.id);
    setEditType(card.card_type);
    setEditDesc(card.description || '');
  };

  const saveEdit = (card: GameCard) => {
    onUpdate(card, { card_type: editType, description: editDesc });
    setEditingId(null);
  };

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatSize = (bytes?: number) => bytes ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : '';

  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No cards uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {cards.map(card => (
        <div key={card.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          {editingId === card.id ? (
            <div className="space-y-3">
              <div className="flex gap-3">
                <Select value={editType} onValueChange={(v) => setEditType(v as CardType)}>
                  <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prompt">Prompt</SelectItem>
                    <SelectItem value="response">Response</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Description" className="flex-1" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => saveEdit(card)}><Check className="w-4 h-4 mr-1" />Save</Button>
                <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="w-4 h-4 mr-1" />Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-8 h-8 text-purple-500 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium truncate">{games.find(g => g.id === card.game_id)?.name || card.game_id}</span>
                    <Badge variant={card.card_type === 'prompt' ? 'default' : 'secondary'}>{card.card_type}</Badge>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{card.file_name}</p>
                  <p className="text-xs text-gray-400">{formatDate(card.uploaded_at)} {formatSize(card.file_size)}</p>
                  {card.description && <p className="text-xs text-gray-500 mt-1">{card.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button variant="ghost" size="icon" onClick={() => onPreview(card)} title="Preview"><Eye className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => startEdit(card)} title="Edit"><Edit2 className="w-4 h-4" /></Button>
                <a href={card.file_url} download className="p-2 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"><Download className="w-4 h-4" /></a>
                <a href={card.file_url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-gray-200 dark:hover:bg-gray-500 rounded"><ExternalLink className="w-4 h-4" /></a>
                <Button variant="ghost" size="icon" onClick={() => onDelete(card)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
