import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, FileText, ChevronLeft, ChevronRight, Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { games } from '@/data/gamesData';

interface CardViewerProps {
  isOpen: boolean;
  onClose: () => void;
  gameType?: string;
}

interface GamePDF {
  name: string;
  url: string;
}

export default function CardViewer({ isOpen, onClose, gameType = 'up-shitz-creek' }: CardViewerProps) {
  const [viewMode, setViewMode] = useState<'pdf' | 'images'>('pdf');
  const [currentCard, setCurrentCard] = useState(1);
  const [loading, setLoading] = useState(true);
  const [gamePDFs, setGamePDFs] = useState<GamePDF[]>([]);
  const [selectedPDF, setSelectedPDF] = useState<string | null>(null);
  const totalCards = 20;

  const gameName = games.find(g => g.id === gameType)?.name || 'Game';

  useEffect(() => {
    if (isOpen) fetchGamePDFs();
  }, [isOpen, gameType]);

  const fetchGamePDFs = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.storage.from('game-cards').list();
      if (data) {
        const pdfs = data.filter(f => f.name.startsWith(gameType) && f.name.endsWith('.pdf')).map(f => {
          const { data: urlData } = supabase.storage.from('game-cards').getPublicUrl(f.name);
          return { name: f.name, url: urlData.publicUrl };
        });
        setGamePDFs(pdfs);
        if (pdfs.length > 0) setSelectedPDF(pdfs[0].url);
      }
    } catch (err) {
      console.error('Error fetching PDFs:', err);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-amber-900 to-yellow-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-amber-700">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5" />{gameName} Cards Reference
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-amber-800"><X className="w-5 h-5" /></Button>
        </div>
        
        <div className="p-4">
          <div className="flex gap-2 mb-4">
            <Button onClick={() => setViewMode('pdf')} variant={viewMode === 'pdf' ? 'default' : 'outline'} className={viewMode === 'pdf' ? 'bg-yellow-600' : ''}>View PDF</Button>
            <Button onClick={() => setViewMode('images')} variant={viewMode === 'images' ? 'default' : 'outline'} className={viewMode === 'images' ? 'bg-yellow-600' : ''}>View Cards</Button>
          </div>

          {viewMode === 'pdf' ? (
            <div className="bg-black/30 rounded-lg p-4">
              {loading ? (
                <div className="flex items-center justify-center h-[60vh]"><Loader2 className="w-8 h-8 text-yellow-400 animate-spin" /></div>
              ) : gamePDFs.length > 0 && selectedPDF ? (
                <>
                  {gamePDFs.length > 1 && (
                    <div className="flex gap-2 mb-4 flex-wrap">
                      {gamePDFs.map(pdf => (
                        <Button key={pdf.name} size="sm" variant={selectedPDF === pdf.url ? 'default' : 'outline'} onClick={() => setSelectedPDF(pdf.url)} className="text-xs">{pdf.name.split('-cards-')[1]?.replace('.pdf', '') || pdf.name}</Button>
                      ))}
                    </div>
                  )}
                  <iframe src={selectedPDF} className="w-full h-[55vh] rounded-lg bg-white" title="Game Cards PDF" />
                  <a href={selectedPDF} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-yellow-300 text-sm mt-2 hover:text-yellow-200"><ExternalLink className="w-4 h-4" />Open in new tab</a>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-[60vh] text-yellow-300">
                  <AlertCircle className="w-12 h-12 mb-4" />
                  <p className="text-lg font-medium">No PDF uploaded for {gameName}</p>
                  <p className="text-sm text-yellow-400/70 mt-2">Game owners can upload PDFs in the admin section</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-black/30 rounded-lg p-4">
              <div className="flex items-center justify-center gap-4">
                <Button onClick={() => setCurrentCard(c => Math.max(1, c - 1))} disabled={currentCard === 1} variant="outline" size="sm"><ChevronLeft /></Button>
                <img src={`/game-cards/${gameType}/card-${currentCard}.png`} alt={`Card ${currentCard}`} className="max-h-[50vh] rounded-lg shadow-lg" onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder.svg'; }} />
                <Button onClick={() => setCurrentCard(c => Math.min(totalCards, c + 1))} disabled={currentCard === totalCards} variant="outline" size="sm"><ChevronRight /></Button>
              </div>
              <p className="text-white text-center mt-2">Card {currentCard} of {totalCards}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
