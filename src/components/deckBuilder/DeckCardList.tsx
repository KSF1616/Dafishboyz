import React, { useState } from 'react';
import { DeckCard } from '@/types/deckBuilder';
import { DeckCardItem } from './DeckCardItem';
import { Layers } from 'lucide-react';

interface DeckCardListProps {
  cards: DeckCard[];
  onReorder: (cards: DeckCard[]) => void;
  onRemove: (id: string) => void;
  maxCards: number;
}

export const DeckCardList: React.FC<DeckCardListProps> = ({ cards, onReorder, onRemove, maxCards }) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) return;
    
    const newCards = [...cards];
    const [draggedCard] = newCards.splice(dragIndex, 1);
    newCards.splice(dropIndex, 0, draggedCard);
    onReorder(newCards);
    setDragIndex(null);
  };

  const handleDragEnd = () => setDragIndex(null);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
        <Layers className="w-12 h-12 mb-3" />
        <p className="text-lg font-medium">No cards in deck</p>
        <p className="text-sm">Select cards from the left panel</p>
      </div>
    );
  }

  return (
    <div className="space-y-2" onDragEnd={handleDragEnd}>
      <div className="flex justify-between text-sm text-gray-500 mb-3">
        <span>{cards.length} cards</span>
        <span className={cards.length > maxCards ? 'text-red-500' : ''}>{cards.length}/{maxCards} max</span>
      </div>
      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
        {cards.map((card, index) => (
          <DeckCardItem
            key={`${card.id}-${index}`}
            card={card}
            index={index}
            onRemove={onRemove}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDragging={dragIndex === index}
          />
        ))}
      </div>
    </div>
  );
};
