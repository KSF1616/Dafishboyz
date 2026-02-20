import React from 'react';
import { FileText, ZoomIn } from 'lucide-react';
import { GameCard } from '@/types/gameCards';

interface PlayingCardProps {
  card?: GameCard;
  isFlipped: boolean;
  onClick?: () => void;
  onZoom?: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  selected?: boolean;
  showZoomHint?: boolean;
}

const sizeClasses = {
  sm: 'w-20 h-28',
  md: 'w-28 h-40',
  lg: 'w-36 h-52'
};

export default function PlayingCard({ 
  card, isFlipped, onClick, onZoom, size = 'md', disabled = false, selected = false, showZoomHint = true
}: PlayingCardProps) {
  const sizeClass = sizeClasses[size];
  const isPrompt = card?.card_type === 'prompt';

  return (
    <div 
      className={`relative cursor-pointer perspective-1000 ${sizeClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} group`}
      onClick={disabled ? undefined : onClick}
      onDoubleClick={disabled ? undefined : onZoom}
    >
      <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Card Back */}
        <div className={`absolute inset-0 backface-hidden rounded-lg shadow-lg border-2 ${
          isPrompt ? 'bg-gradient-to-br from-purple-900 to-purple-700 border-purple-500' 
                   : 'bg-gradient-to-br from-amber-900 to-yellow-700 border-amber-500'
        } flex items-center justify-center`}>
          <div className="text-center">
            <div className={`w-12 h-12 mx-auto mb-2 rounded-full ${isPrompt ? 'bg-purple-600' : 'bg-amber-600'} flex items-center justify-center`}>
              <FileText className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs font-bold text-white/80">{isPrompt ? 'PROMPT' : 'RESPONSE'}</span>
          </div>
        </div>
        
        {/* Card Front */}
        <div className={`absolute inset-0 backface-hidden rotate-y-180 rounded-lg shadow-lg border-2 ${
          selected ? 'border-green-400 ring-2 ring-green-400' : 'border-gray-300'
        } bg-white overflow-hidden`}>
          {card?.image_url ? (
            <img src={card.image_url} alt={card.file_name} className="w-full h-full object-cover" />
          ) : card?.file_url ? (
            <iframe src={card.file_url} className="w-full h-full pointer-events-none" title={card.file_name} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <p className="text-xs text-gray-500 p-2 text-center">{card?.description || 'Card'}</p>
            </div>
          )}
          
          {/* Zoom hint overlay */}
          {showZoomHint && onZoom && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-white text-center">
                <ZoomIn className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Double-click to zoom</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Selection indicator */}
      {selected && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
      )}
    </div>
  );
}
