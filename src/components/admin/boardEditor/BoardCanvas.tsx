import React, { useRef } from 'react';
import { BoardElement, DragItem } from '@/types/boardEditor';
import { BoardCanvasElement } from './BoardCanvasElement';

interface Props {
  elements: BoardElement[];
  selectedId: string | null;
  backgroundColor: string;
  gridSize: number;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<BoardElement>) => void;
  onDeleteElement: (id: string) => void;
  onAddElement: (item: DragItem, x: number, y: number) => void;
}

export const BoardCanvas: React.FC<Props> = ({
  elements, selectedId, backgroundColor, gridSize,
  onSelectElement, onUpdateElement, onDeleteElement, onAddElement
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const data = e.dataTransfer.getData('application/json');
    const elementId = e.dataTransfer.getData('element-id');
    
    const x = Math.round((e.clientX - rect.left) / gridSize) * gridSize;
    const y = Math.round((e.clientY - rect.top) / gridSize) * gridSize;
    
    if (elementId) {
      onUpdateElement(elementId, { x, y });
    } else if (data) {
      const item: DragItem = JSON.parse(data);
      onAddElement(item, x, y);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  return (
    <div
      ref={canvasRef}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => onSelectElement(null)}
      className="relative w-full h-[500px] rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden"
      style={{
        backgroundColor,
        backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }}
    >
      {elements.map((el) => (
        <BoardCanvasElement
          key={el.id}
          element={el}
          isSelected={selectedId === el.id}
          onSelect={() => onSelectElement(el.id)}
          onDelete={() => onDeleteElement(el.id)}
          onDragStart={(e) => {
            e.dataTransfer.setData('element-id', el.id);
          }}
          onResize={(w, h) => onUpdateElement(el.id, { width: w, height: h })}
        />
      ))}
      {elements.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
          <p>Drag elements here to build your board</p>
        </div>
      )}
    </div>
  );
};
