import React from 'react';

interface Props {
  count: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  animate?: boolean;
}

export default function ShitzCreekPaddle({ count, size = 'md', showCount = true, animate = false }: Props) {
  const sizeClasses = {
    sm: 'w-8 h-16',
    md: 'w-12 h-24',
    lg: 'w-16 h-32'
  };

  const paddleSize = sizeClasses[size];

  return (
    <div className="flex items-center gap-2">
      <div className={`relative ${animate ? 'animate-bounce' : ''}`}>
        {/* Paddle SVG */}
        <svg viewBox="0 0 40 100" className={paddleSize} fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Handle */}
          <rect x="16" y="50" width="8" height="45" rx="2" fill="#8B4513" stroke="#5D3A1A" strokeWidth="1" />
          <rect x="17" y="52" width="2" height="40" fill="#A0522D" opacity="0.5" />
          
          {/* Paddle head */}
          <ellipse cx="20" cy="25" rx="18" ry="23" fill="#DEB887" stroke="#8B4513" strokeWidth="2" />
          <ellipse cx="20" cy="25" rx="14" ry="18" fill="#F5DEB3" />
          
          {/* Wood grain lines */}
          <path d="M10 15 Q20 20 30 15" stroke="#D2B48C" strokeWidth="1" fill="none" />
          <path d="M8 25 Q20 30 32 25" stroke="#D2B48C" strokeWidth="1" fill="none" />
          <path d="M10 35 Q20 40 30 35" stroke="#D2B48C" strokeWidth="1" fill="none" />
          
          {/* Highlight */}
          <ellipse cx="15" cy="20" rx="4" ry="6" fill="white" opacity="0.3" />
        </svg>
        
        {/* Badge for count */}
        {showCount && count > 0 && (
          <div className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-amber-700">
            {count}
          </div>
        )}
      </div>
      
      {/* Additional paddles indicator */}
      {count > 1 && (
        <div className="flex -space-x-4">
          {Array.from({ length: Math.min(count - 1, 3) }).map((_, i) => (
            <svg key={i} viewBox="0 0 40 100" className="w-6 h-12 opacity-60" fill="none">
              <rect x="16" y="50" width="8" height="45" rx="2" fill="#8B4513" />
              <ellipse cx="20" cy="25" rx="18" ry="23" fill="#DEB887" stroke="#8B4513" strokeWidth="2" />
            </svg>
          ))}
        </div>
      )}
    </div>
  );
}

// Paddle action types
export type PaddleAction = 'receive' | 'lose' | 'steal' | 'find';

export interface PaddleEvent {
  action: PaddleAction;
  playerId: string;
  fromPlayerId?: string;
  reason: string;
}
