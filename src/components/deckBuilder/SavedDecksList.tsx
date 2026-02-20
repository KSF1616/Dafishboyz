import React from 'react';
import { Layers, Trash2, Edit, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CardDeckConfig, GAME_MODES } from '@/types/deckBuilder';

interface SavedDecksListProps {
  decks: CardDeckConfig[];
  onLoad: (deck: CardDeckConfig) => void;
  onDelete: (id: string) => void;
  currentDeckId?: string;
}

export const SavedDecksList: React.FC<SavedDecksListProps> = ({
  decks, onLoad, onDelete, currentDeckId
}) => {
  if (decks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Layers className="w-10 h-10 mx-auto mb-2 opacity-50" />
        <p>No saved decks yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {decks.map(deck => {
        const mode = GAME_MODES.find(m => m.id === deck.game_mode);
        const isActive = deck.id === currentDeckId;
        
        return (
          <div
            key={deck.id}
            className={`p-4 rounded-lg border-2 transition-all ${
              isActive ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold">{deck.name}</h4>
                {deck.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{deck.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{mode?.name || deck.game_mode}</span>
                  <span>{deck.card_ids.length} cards</span>
                  {deck.is_active && <span className="text-green-600">Active</span>}
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => onLoad(deck)} title="Load deck">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deck.id && onDelete(deck.id)}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                  title="Delete deck"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
