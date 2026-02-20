import React from 'react';

interface PlayerPieceProps {
  player: { player_id: string; player_name: string };
  position: { x: number; y: number };
  poop: { emoji: string; expression: string; color: string };
  offset: number;
  isCurrentPlayer: boolean;
  playerIndex: number;
}

// Custom poop face SVGs for each player
const PoopFace = ({ expression, color, isCurrentPlayer }: { expression: string; color: string; isCurrentPlayer: boolean }) => {
  const faces: Record<string, JSX.Element> = {
    happy: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <ellipse cx="20" cy="25" rx="14" ry="12" fill={color} />
        <ellipse cx="20" cy="15" rx="10" ry="8" fill={color} />
        <ellipse cx="20" cy="8" rx="6" ry="5" fill={color} />
        <circle cx="15" cy="22" r="3" fill="white" />
        <circle cx="25" cy="22" r="3" fill="white" />
        <circle cx="15" cy="22" r="1.5" fill="black" />
        <circle cx="25" cy="22" r="1.5" fill="black" />
        <path d="M14 28 Q20 33 26 28" stroke="white" strokeWidth="2" fill="none" />
      </svg>
    ),
    angry: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <ellipse cx="20" cy="25" rx="14" ry="12" fill={color} />
        <ellipse cx="20" cy="15" rx="10" ry="8" fill={color} />
        <ellipse cx="20" cy="8" rx="6" ry="5" fill={color} />
        <circle cx="15" cy="22" r="3" fill="white" />
        <circle cx="25" cy="22" r="3" fill="white" />
        <circle cx="15" cy="23" r="1.5" fill="black" />
        <circle cx="25" cy="23" r="1.5" fill="black" />
        <line x1="11" y1="18" x2="18" y2="20" stroke={color} strokeWidth="3" />
        <line x1="29" y1="18" x2="22" y2="20" stroke={color} strokeWidth="3" />
        <path d="M14 30 Q20 27 26 30" stroke="white" strokeWidth="2" fill="none" />
      </svg>
    ),
    silly: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <ellipse cx="20" cy="25" rx="14" ry="12" fill={color} />
        <ellipse cx="20" cy="15" rx="10" ry="8" fill={color} />
        <ellipse cx="20" cy="8" rx="6" ry="5" fill={color} />
        <circle cx="14" cy="22" r="3" fill="white" />
        <circle cx="26" cy="22" r="3" fill="white" />
        <circle cx="13" cy="21" r="1.5" fill="black" />
        <circle cx="27" cy="23" r="1.5" fill="black" />
        <ellipse cx="20" cy="30" rx="4" ry="3" fill="#FF69B4" />
      </svg>
    ),
    cool: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <ellipse cx="20" cy="25" rx="14" ry="12" fill={color} />
        <ellipse cx="20" cy="15" rx="10" ry="8" fill={color} />
        <ellipse cx="20" cy="8" rx="6" ry="5" fill={color} />
        <rect x="9" y="19" width="22" height="6" rx="2" fill="black" />
        <rect x="10" y="20" width="8" height="4" rx="1" fill="#333" />
        <rect x="22" y="20" width="8" height="4" rx="1" fill="#333" />
        <path d="M15 29 Q20 32 25 29" stroke="white" strokeWidth="2" fill="none" />
      </svg>
    ),
    sleepy: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <ellipse cx="20" cy="25" rx="14" ry="12" fill={color} />
        <ellipse cx="20" cy="15" rx="10" ry="8" fill={color} />
        <ellipse cx="20" cy="8" rx="6" ry="5" fill={color} />
        <line x1="12" y1="22" x2="18" y2="22" stroke="black" strokeWidth="2" />
        <line x1="22" y1="22" x2="28" y2="22" stroke="black" strokeWidth="2" />
        <ellipse cx="20" cy="29" rx="3" ry="2" fill="white" />
      </svg>
    ),
    wink: (
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <ellipse cx="20" cy="25" rx="14" ry="12" fill={color} />
        <ellipse cx="20" cy="15" rx="10" ry="8" fill={color} />
        <ellipse cx="20" cy="8" rx="6" ry="5" fill={color} />
        <circle cx="15" cy="22" r="3" fill="white" />
        <circle cx="15" cy="22" r="1.5" fill="black" />
        <path d="M22 22 Q25 20 28 22" stroke="black" strokeWidth="2" fill="none" />
        <path d="M14 28 Q20 33 26 28" stroke="white" strokeWidth="2" fill="none" />
      </svg>
    ),
  };
  
  return (
    <div className={`relative ${isCurrentPlayer ? 'animate-bounce' : ''}`}>
      {faces[expression] || faces.happy}
      {isCurrentPlayer && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping" />
      )}
    </div>
  );
};

export default function PlayerPiece({ player, position, poop, offset, isCurrentPlayer, playerIndex }: PlayerPieceProps) {
  return (
    <div
      className={`absolute w-10 h-10 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-in-out z-10
        ${isCurrentPlayer ? 'scale-125 z-20' : 'hover:scale-110'}
      `}
      style={{ 
        left: `${position.x + (offset % 3) * 2}%`, 
        top: `${position.y - Math.floor(offset / 3) * 3}%` 
      }}
      title={`${player.player_name}${isCurrentPlayer ? ' (You)' : ''}`}
    >
      <PoopFace expression={poop.expression} color={poop.color} isCurrentPlayer={isCurrentPlayer} />
      <div className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] font-bold px-1 rounded whitespace-nowrap
        ${isCurrentPlayer ? 'bg-green-500 text-white' : 'bg-black/70 text-white'}
      `}>
        {player.player_name.slice(0, 6)}
      </div>
    </div>
  );
}
