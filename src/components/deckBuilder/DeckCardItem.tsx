import React from 'react';
import { GripVertical, X, FileText } from 'lucide-react';
import { DeckCard } from '@/types/deckBuilder';

interface DeckCardItemProps {
  card: DeckCard;
  index: number;
  onRemove: (id: string) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, index: number) => void;
  isDragging: boolean;
}

export const DeckCardItem: React.FC<DeckCardItemProps> = ({
  card, index, onRemove, onDragStart, onDragOver, onDrop, isDragging
}) => {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border-2 
        ${isDragging ? 'border-purple-400 opacity-50' : 'border-gray-200 dark:border-gray-600'}
        hover:border-purple-300 cursor-grab active:cursor-grabbing transition-all`}
    >
      <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <span className="text-sm font-medium text-gray-500 w-6">{index + 1}</span>
      <div className={`p-1.5 rounded ${card.card_type === 'prompt' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
        <FileText className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{card.file_name}</p>
        <p className="text-xs text-gray-500 capitalize">{card.card_type}</p>
      </div>
      <button
        onClick={() => onRemove(card.id)}
        className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
