import React, { useState, useEffect, useCallback } from 'react';
import { useLogo } from '@/contexts/LogoContext';

interface LogoPosition {
  x: number;
  y: number;
  dx: number;
  dy: number;
  rotation: number;
  scale: number;
}

const FloatingLogo: React.FC = () => {
  const { logoUrl } = useLogo();
  const [position, setPosition] = useState<LogoPosition>({
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10,
    dx: (Math.random() - 0.5) * 0.5,
    dy: (Math.random() - 0.5) * 0.5,
    rotation: 0,
    scale: 0.8 + Math.random() * 0.4
  });
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const updatePosition = useCallback(() => {
    if (isPaused) return;
    
    setPosition(prev => {
      let newX = prev.x + prev.dx;
      let newY = prev.y + prev.dy;
      let newDx = prev.dx;
      let newDy = prev.dy;
      let newRotation = prev.rotation + 0.5;

      // Bounce off edges with some randomness
      if (newX <= 5 || newX >= 90) {
        newDx = -newDx * (0.8 + Math.random() * 0.4);
        newDy += (Math.random() - 0.5) * 0.2;
      }
      if (newY <= 5 || newY >= 85) {
        newDy = -newDy * (0.8 + Math.random() * 0.4);
        newDx += (Math.random() - 0.5) * 0.2;
      }

      // Keep within bounds
      newX = Math.max(5, Math.min(90, newX));
      newY = Math.max(5, Math.min(85, newY));

      // Limit speed
      const maxSpeed = 0.8;
      const speed = Math.sqrt(newDx * newDx + newDy * newDy);
      if (speed > maxSpeed) {
        newDx = (newDx / speed) * maxSpeed;
        newDy = (newDy / speed) * maxSpeed;
      }

      // Add slight random movement
      if (Math.random() < 0.02) {
        newDx += (Math.random() - 0.5) * 0.3;
        newDy += (Math.random() - 0.5) * 0.3;
      }

      return {
        x: newX,
        y: newY,
        dx: newDx,
        dy: newDy,
        rotation: newRotation % 360,
        scale: prev.scale
      };
    });
  }, [isPaused]);

  useEffect(() => {
    const interval = setInterval(updatePosition, 50);
    return () => clearInterval(interval);
  }, [updatePosition]);

  // Randomly hide and show the logo
  useEffect(() => {
    const toggleVisibility = () => {
      if (Math.random() < 0.3) {
        setIsVisible(false);
        setTimeout(() => setIsVisible(true), 3000 + Math.random() * 5000);
      }
    };
    
    const interval = setInterval(toggleVisibility, 15000 + Math.random() * 10000);
    return () => clearInterval(interval);
  }, []);

  // Don't render when hidden
  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-40 transition-opacity duration-1000"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: `translate(-50%, -50%) rotate(${position.rotation}deg) scale(${position.scale})`,
        opacity: imageLoaded ? 0.12 : 0
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <img
        src={logoUrl}
        alt="Dafish Boyz Logo"
        className="w-20 h-20 md:w-24 md:h-24 object-contain drop-shadow-lg rounded-xl"
        style={{
          filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.4))'
        }}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageLoaded(false)}
      />
    </div>
  );
};

export default FloatingLogo;
