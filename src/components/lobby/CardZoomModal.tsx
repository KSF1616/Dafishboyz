import React from 'react';
import { X, Download, ExternalLink, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameCard } from '@/types/gameCards';

interface CardZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: GameCard | null;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export default function CardZoomModal({ 
  isOpen, onClose, card, onPrevious, onNext, hasPrevious = false, hasNext = false 
}: CardZoomModalProps) {
  if (!isOpen || !card) return null;

  const isPrompt = card.card_type === 'prompt';
  const hasImage = !!card.image_url;
  const hasFile = !!card.file_url;

  return (
    <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={`flex justify-between items-center p-4 rounded-t-xl ${
          isPrompt ? 'bg-purple-900' : 'bg-amber-900'
        }`}>
          <div>
            <span className={`text-xs font-bold px-2 py-1 rounded ${
              isPrompt ? 'bg-purple-600 text-purple-100' : 'bg-amber-600 text-amber-100'
            }`}>
              {isPrompt ? 'PROMPT CARD' : 'RESPONSE CARD'}
            </span>
            <h3 className="text-white font-medium mt-1">{card.file_name}</h3>
          </div>
          <div className="flex items-center gap-2">
            {(hasImage || hasFile) && (
              <>
                <a href={card.image_url || card.file_url} download className="text-white/70 hover:text-white">
                  <Download className="w-5 h-5" />
                </a>
                <a href={card.image_url || card.file_url} target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white">
                  <ExternalLink className="w-5 h-5" />
                </a>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/10">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Card Content */}
        <div className="flex-1 bg-white rounded-b-xl overflow-hidden relative min-h-[400px]">
          {hasImage ? (
            <img src={card.image_url} alt={card.file_name} className="w-full h-full object-contain max-h-[70vh]" />
          ) : hasFile ? (
            <iframe src={card.file_url} className="w-full h-[70vh]" title={card.file_name} />
          ) : (
            <div className="w-full h-[70vh] flex flex-col items-center justify-center bg-gray-100">
              <FileText className="w-16 h-16 text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">{card.description || 'No preview available'}</p>
            </div>
          )}
          
          {/* Navigation Arrows */}
          {hasPrevious && (
            <button onClick={onPrevious} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full">
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {hasNext && (
            <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full">
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {card.description && (
          <p className="text-gray-300 text-sm mt-2 text-center">{card.description}</p>
        )}
      </div>
    </div>
  );
}
