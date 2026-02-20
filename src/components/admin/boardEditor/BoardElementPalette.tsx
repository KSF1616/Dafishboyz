import React from 'react';
import { User, Square, Layers, Dice5, BarChart, Circle, Play, Flag, Type } from 'lucide-react';
import { ELEMENT_PALETTE, DragItem } from '@/types/boardEditor';

const iconMap: Record<string, React.ReactNode> = {
  User: <User className="w-5 h-5" />,
  Square: <Square className="w-5 h-5" />,
  Layers: <Layers className="w-5 h-5" />,
  Dice5: <Dice5 className="w-5 h-5" />,
  BarChart: <BarChart className="w-5 h-5" />,
  Circle: <Circle className="w-5 h-5" />,
  Play: <Play className="w-5 h-5" />,
  Flag: <Flag className="w-5 h-5" />,
  Type: <Type className="w-5 h-5" />,
};

interface Props {
  onDragStart: (item: DragItem) => void;
}

export const BoardElementPalette: React.FC<Props> = ({ onDragStart }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
      <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300">Elements</h3>
      <div className="grid grid-cols-2 gap-2">
        {ELEMENT_PALETTE.map((item) => (
          <div
            key={item.type}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('application/json', JSON.stringify(item));
              onDragStart(item);
            }}
            className="flex flex-col items-center gap-1 p-3 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-grab active:cursor-grabbing transition-all"
            style={{ borderColor: item.defaultColor + '40' }}
          >
            <div className="p-2 rounded-lg" style={{ backgroundColor: item.defaultColor + '20', color: item.defaultColor }}>
              {iconMap[item.icon]}
            </div>
            <span className="text-xs text-center text-gray-600 dark:text-gray-400">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
