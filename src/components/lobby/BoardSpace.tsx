import React from 'react';

interface BoardSpaceProps {
  space: { x: number; y: number };
  index: number;
  isSpecial: boolean;
}

export default function BoardSpace({ space, index, isSpecial }: BoardSpaceProps) {
  return (
    <div
      className={`absolute w-6 h-6 rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-xs font-bold transition-all duration-300
        ${isSpecial 
          ? 'bg-gradient-to-br from-yellow-400 to-amber-600 animate-pulse shadow-lg shadow-yellow-500/50 ring-2 ring-yellow-300' 
          : 'bg-gradient-to-br from-green-400 to-green-600 hover:scale-110'
        }
        ${index === 0 ? 'ring-2 ring-white bg-gradient-to-br from-blue-400 to-blue-600' : ''}
        ${index === 25 ? 'ring-2 ring-amber-300 bg-gradient-to-br from-amber-400 to-amber-600 animate-bounce' : ''}
      `}
      style={{ left: `${space.x}%`, top: `${space.y}%` }}
    >
      {isSpecial ? (
        <span className="animate-spin-slow">💩</span>
      ) : index === 0 ? (
        <span>🚣</span>
      ) : index === 25 ? (
        <span>🏁</span>
      ) : (
        <span className="text-white text-[10px]">{index}</span>
      )}
    </div>
  );
}
