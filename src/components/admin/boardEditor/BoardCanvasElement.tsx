import React from 'react';
import { User, Square, Layers, Dice5, BarChart, Circle, Play, Flag, Type, Move, X } from 'lucide-react';
import { BoardElement } from '@/types/boardEditor';

const iconMap: Record<string, React.ReactNode> = {
  'player-position': <User className="w-6 h-6" />,
  'game-zone': <Square className="w-6 h-6" />,
  'card-deck': <Layers className="w-6 h-6" />,
  'dice-area': <Dice5 className="w-6 h-6" />,
  'score-track': <BarChart className="w-6 h-6" />,
  'path-tile': <Circle className="w-6 h-6" />,
  'start-zone': <Play className="w-6 h-6" />,
  'end-zone': <Flag className="w-6 h-6" />,
  'text-label': <Type className="w-6 h-6" />,
};

interface Props {
  element: BoardElement;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onResize: (width: number, height: number) => void;
}

export const BoardCanvasElement: React.FC<Props> = ({ element, isSelected, onSelect, onDelete, onDragStart }) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={`absolute flex flex-col items-center justify-center rounded-lg cursor-move transition-all ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2' : 'hover:ring-2 hover:ring-purple-300'}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        backgroundColor: element.color + '30',
        borderColor: element.color,
        borderWidth: 2,
        transform: `rotate(${element.rotation}deg)`,
        zIndex: element.zIndex,
      }}
    >
      {isSelected && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 z-10">
            <X className="w-3 h-3" />
          </button>
          <div className="absolute -top-2 -left-2 p-1 bg-purple-500 rounded-full text-white">
            <Move className="w-3 h-3" />
          </div>
        </>
      )}
      <div style={{ color: element.color }}>{iconMap[element.type]}</div>
      <span className="text-xs mt-1 font-medium truncate max-w-full px-1" style={{ color: element.color }}>{element.label}</span>
    </div>
  );
};
