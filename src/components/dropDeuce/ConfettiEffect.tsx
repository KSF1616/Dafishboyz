import React, { useEffect, useState, useMemo } from 'react';
import { PartyTheme } from '@/types/partyMode';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  shape: 'square' | 'circle' | 'triangle' | 'star';
  delay: number;
  duration: number;
  swayAmount: number;
}

interface ConfettiEffectProps {
  isActive: boolean;
  intensity?: 'low' | 'medium' | 'high' | 'extreme';
  theme?: PartyTheme;
  onComplete?: () => void;
}

const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  isActive,
  intensity = 'medium',
  theme,
  onComplete
}) => {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  
  const confettiCount = useMemo(() => {
    switch (intensity) {
      case 'low': return 30;
      case 'medium': return 60;
      case 'high': return 100;
      case 'extreme': return 150;
      default: return 60;
    }
  }, [intensity]);
  
  const colors = useMemo(() => {
    return theme?.confettiColors || ['#ec4899', '#8b5cf6', '#fbbf24', '#22c55e', '#3b82f6', '#ef4444'];
  }, [theme]);
  
  useEffect(() => {
    if (isActive) {
      const newPieces: ConfettiPiece[] = [];
      const shapes: ConfettiPiece['shape'][] = ['square', 'circle', 'triangle', 'star'];
      
      for (let i = 0; i < confettiCount; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100,
          y: -10 - Math.random() * 20,
          rotation: Math.random() * 360,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 8 + Math.random() * 12,
          shape: shapes[Math.floor(Math.random() * shapes.length)],
          delay: Math.random() * 0.5,
          duration: 2 + Math.random() * 2,
          swayAmount: 20 + Math.random() * 40
        });
      }
      
      setPieces(newPieces);
      
      // Clear confetti after animation
      const timeout = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 4000);
      
      return () => clearTimeout(timeout);
    } else {
      setPieces([]);
    }
  }, [isActive, confettiCount, colors, onComplete]);
  
  if (!isActive || pieces.length === 0) return null;
  
  const renderShape = (piece: ConfettiPiece) => {
    switch (piece.shape) {
      case 'circle':
        return (
          <div
            className="rounded-full"
            style={{
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color
            }}
          />
        );
      case 'triangle':
        return (
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: `${piece.size / 2}px solid transparent`,
              borderRight: `${piece.size / 2}px solid transparent`,
              borderBottom: `${piece.size}px solid ${piece.color}`
            }}
          />
        );
      case 'star':
        return (
          <svg
            width={piece.size}
            height={piece.size}
            viewBox="0 0 24 24"
            fill={piece.color}
          >
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
        );
      default:
        return (
          <div
            style={{
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: 2
            }}
          />
        );
    }
  };
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            transform: `rotate(${piece.rotation}deg)`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            '--sway-amount': `${piece.swayAmount}px`
          } as React.CSSProperties}
        >
          {renderShape(piece)}
        </div>
      ))}
      
      {/* Burst effect from center */}
      {intensity === 'extreme' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {[...Array(20)].map((_, i) => (
            <div
              key={`burst-${i}`}
              className="absolute animate-confetti-burst"
              style={{
                '--burst-angle': `${(i / 20) * 360}deg`,
                '--burst-distance': `${150 + Math.random() * 100}px`,
                animationDelay: `${Math.random() * 0.2}s`
              } as React.CSSProperties}
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Sparkle overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent animate-pulse" />
      
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 1;
          }
          25% {
            transform: translateY(25vh) translateX(var(--sway-amount)) rotate(180deg);
          }
          50% {
            transform: translateY(50vh) translateX(calc(var(--sway-amount) * -0.5)) rotate(360deg);
          }
          75% {
            transform: translateY(75vh) translateX(var(--sway-amount)) rotate(540deg);
          }
          100% {
            transform: translateY(110vh) translateX(0) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes confetti-burst {
          0% {
            transform: rotate(var(--burst-angle)) translateY(0);
            opacity: 1;
          }
          100% {
            transform: rotate(var(--burst-angle)) translateY(var(--burst-distance));
            opacity: 0;
          }
        }
        
        .animate-confetti-fall {
          animation: confetti-fall linear forwards;
        }
        
        .animate-confetti-burst {
          animation: confetti-burst 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ConfettiEffect;
