import React from 'react';
import { Layers, RotateCcw } from 'lucide-react';
import { SyncedCard } from '@/types/lobby';

interface CardPileProps {
  cards: SyncedCard[];
  type: 'draw' | 'discard';
  onDraw?: () => void;
  onShuffle?: () => void;
  disabled?: boolean;
  label?: string;
}

export default function CardPile({ cards, type, onDraw, onShuffle, disabled = false, label }: CardPileProps) {
  const count = cards.length;
  const isDraw = type === 'draw';
  const stackLayers = Math.min(count, 5);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-sm font-medium text-gray-300">{label || (isDraw ? 'Draw Pile' : 'Discard Pile')}</span>
      
      <div 
        className={`relative w-28 h-40 ${!disabled && isDraw && count > 0 ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
        onClick={!disabled && isDraw && count > 0 ? onDraw : undefined}
      >
        {count === 0 ? (
          <div className="w-full h-full rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center bg-gray-800/50">
            <span className="text-gray-500 text-sm">Empty</span>
          </div>
        ) : (
          <>
            {/* Stacked cards effect */}
            {Array.from({ length: stackLayers }).map((_, i) => (
              <div
                key={i}
                className={`absolute rounded-lg shadow-md border-2 ${
                  isDraw 
                    ? 'bg-gradient-to-br from-purple-900 to-purple-700 border-purple-500' 
                    : 'bg-gradient-to-br from-gray-700 to-gray-600 border-gray-500'
                }`}
                style={{
                  width: '100%',
                  height: '100%',
                  top: `${-i * 2}px`,
                  left: `${i * 1}px`,
                  zIndex: stackLayers - i
                }}
              />
            ))}
            
            {/* Top card */}
            <div className={`absolute inset-0 rounded-lg shadow-lg border-2 flex items-center justify-center ${
              isDraw 
                ? 'bg-gradient-to-br from-purple-800 to-purple-600 border-purple-400' 
                : 'bg-gradient-to-br from-gray-600 to-gray-500 border-gray-400'
            }`} style={{ zIndex: stackLayers + 1 }}>
              <div className="text-center">
                <Layers className="w-8 h-8 text-white/80 mx-auto mb-1" />
                <span className="text-2xl font-bold text-white">{count}</span>
                <span className="text-xs text-white/60 block">cards</span>
              </div>
            </div>
          </>
        )}
      </div>

      {onShuffle && isDraw && (
        <button
          onClick={onShuffle}
          disabled={disabled || count === 0}
          className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-3 h-3" /> Shuffle
        </button>
      )}
    </div>
  );
}
