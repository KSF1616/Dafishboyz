import React from 'react';
import { BoardElement } from '@/types/boardEditor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface Props {
  element: BoardElement | null;
  onUpdate: (updates: Partial<BoardElement>) => void;
}

export const BoardElementProperties: React.FC<Props> = ({ element, onUpdate }) => {
  if (!element) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
        <h3 className="font-semibold text-sm mb-3 text-gray-700 dark:text-gray-300">Properties</h3>
        <p className="text-sm text-gray-400">Select an element to edit</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg space-y-4">
      <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Properties</h3>
      
      <div>
        <Label className="text-xs">Label</Label>
        <Input value={element.label} onChange={(e) => onUpdate({ label: e.target.value })} className="mt-1 h-8 text-sm" />
      </div>

      <div>
        <Label className="text-xs">Color</Label>
        <div className="flex gap-2 mt-1">
          <input type="color" value={element.color} onChange={(e) => onUpdate({ color: e.target.value })} className="w-10 h-8 rounded cursor-pointer" />
          <Input value={element.color} onChange={(e) => onUpdate({ color: e.target.value })} className="flex-1 h-8 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label className="text-xs">Width</Label>
          <Input type="number" value={element.width} onChange={(e) => onUpdate({ width: Number(e.target.value) })} className="mt-1 h-8 text-sm" />
        </div>
        <div>
          <Label className="text-xs">Height</Label>
          <Input type="number" value={element.height} onChange={(e) => onUpdate({ height: Number(e.target.value) })} className="mt-1 h-8 text-sm" />
        </div>
      </div>

      <div>
        <Label className="text-xs">Rotation: {element.rotation}°</Label>
        <Slider value={[element.rotation]} onValueChange={([v]) => onUpdate({ rotation: v })} min={0} max={360} step={15} className="mt-2" />
      </div>

      <div>
        <Label className="text-xs">Layer (Z-Index)</Label>
        <Input type="number" value={element.zIndex} onChange={(e) => onUpdate({ zIndex: Number(e.target.value) })} className="mt-1 h-8 text-sm" min={0} max={100} />
      </div>
    </div>
  );
};
