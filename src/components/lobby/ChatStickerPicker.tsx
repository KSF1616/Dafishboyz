import React, { useState } from 'react';
import { GAME_STICKERS, GameSticker } from '@/types/chat';
import { Sticker, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Props {
  onSelectSticker: (sticker: GameSticker) => void;
  onClose: () => void;
}

const ChatStickerPicker: React.FC<Props> = ({ onSelectSticker, onClose }) => {
  const categories = ['poop', 'toilet', 'dice', 'victory', 'reaction'] as const;
  
  const getStickersByCategory = (cat: string) => 
    GAME_STICKERS.filter(s => s.category === cat);

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-lg border border-gray-700 shadow-xl z-50">
      <div className="flex items-center justify-between p-2 border-b border-gray-700">
        <div className="flex items-center gap-2 text-white text-sm font-medium">
          <Sticker className="w-4 h-4" />
          <span>Game Stickers</span>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <Tabs defaultValue="poop" className="p-2">
        <TabsList className="grid grid-cols-5 bg-gray-700 h-8">
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat} className="text-xs capitalize data-[state=active]:bg-purple-600">
              {cat === 'poop' ? '💩' : cat === 'toilet' ? '🚽' : cat === 'dice' ? '🎲' : cat === 'victory' ? '🏆' : '😀'}
            </TabsTrigger>
          ))}
        </TabsList>
        {categories.map(cat => (
          <TabsContent key={cat} value={cat} className="mt-2">
            <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              {getStickersByCategory(cat).map(sticker => (
                <button
                  key={sticker.id}
                  onClick={() => onSelectSticker(sticker)}
                  className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors flex flex-col items-center"
                  title={sticker.name}
                >
                  <img src={sticker.url} alt={sticker.name} className="w-10 h-10" />
                </button>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ChatStickerPicker;
