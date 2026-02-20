import React, { useState } from 'react';
import { Search, Plus, FileText, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DeckCard } from '@/types/deckBuilder';

interface CardSelectorProps {
  availableCards: DeckCard[];
  selectedIds: string[];
  onAddCard: (card: DeckCard) => void;
  filterType: string;
  onFilterChange: (type: string) => void;
}

export const CardSelector: React.FC<CardSelectorProps> = ({
  availableCards, selectedIds, onAddCard, filterType, onFilterChange
}) => {
  const [search, setSearch] = useState('');

  const filtered = availableCards.filter(card => {
    const matchesSearch = card.file_name.toLowerCase().includes(search.toLowerCase()) ||
      card.description?.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || card.card_type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search cards..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>
      <div className="flex gap-2">
        {['all', 'prompt', 'response'].map(type => (
          <Button
            key={type}
            size="sm"
            variant={filterType === type ? 'default' : 'outline'}
            onClick={() => onFilterChange(type)}
            className="capitalize"
          >
            {type}
          </Button>
        ))}
      </div>
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filtered.map(card => {
          const isSelected = selectedIds.includes(card.id);
          return (
            <div
              key={card.id}
              className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                ${isSelected ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-purple-200'}`}
            >
              <div className={`p-1.5 rounded ${card.card_type === 'prompt' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'}`}>
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{card.file_name}</p>
                <p className="text-xs text-gray-500">{card.card_type}</p>
              </div>
              <Button
                size="sm"
                variant={isSelected ? 'secondary' : 'outline'}
                onClick={() => onAddCard(card)}
                disabled={isSelected}
              >
                {isSelected ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8">No cards found</p>
        )}
      </div>
    </div>
  );
};
