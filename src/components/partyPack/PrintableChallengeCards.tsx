import React from 'react';
import { PartyPackTheme, ChallengeCard, getDifficultyColor } from '@/types/partyPack';
import { Zap, Smile, Palette, Users, Star } from 'lucide-react';

interface PrintableChallengeCardsProps {
  theme: PartyPackTheme;
  cards: Omit<ChallengeCard, 'theme'>[];
  cardsPerPage?: number;
}

const PrintableChallengeCards: React.FC<PrintableChallengeCardsProps> = ({
  theme,
  cards,
  cardsPerPage = 9
}) => {
  const getCategoryIcon = (category: ChallengeCard['category']) => {
    switch (category) {
      case 'action': return <Zap className="w-5 h-5" />;
      case 'silly': return <Smile className="w-5 h-5" />;
      case 'creative': return <Palette className="w-5 h-5" />;
      case 'team': return <Users className="w-5 h-5" />;
      default: return <Star className="w-5 h-5" />;
    }
  };

  const getDifficultyStars = (difficulty: ChallengeCard['difficulty']) => {
    const count = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;
    return Array.from({ length: count }).map((_, i) => (
      <Star key={i} className="w-3 h-3 fill-current" />
    ));
  };

  const getDifficultyBgColor = (difficulty: ChallengeCard['difficulty']) => {
    switch (difficulty) {
      case 'easy': return '#22c55e';
      case 'medium': return '#f59e0b';
      case 'hard': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Split cards into pages
  const pages = [];
  for (let i = 0; i < cards.length; i += cardsPerPage) {
    pages.push(cards.slice(i, i + cardsPerPage));
  }

  return (
    <>
      {pages.map((pageCards, pageIndex) => (
        <div key={pageIndex} className="w-[8.5in] h-[11in] p-4 bg-white print:p-2 print:break-after-page">
          {pageIndex === 0 && (
            <div className="text-center mb-3">
              <h2 className="text-lg font-bold text-gray-600">Cut out cards along the dotted lines!</h2>
            </div>
          )}
          <div className="grid grid-cols-3 gap-3">
            {pageCards.map((card, index) => (
              <div
                key={card.id}
                className="aspect-[2.5/3.5] rounded-xl border-2 border-dashed border-gray-300 p-1"
              >
                <div 
                  className="w-full h-full rounded-lg overflow-hidden flex flex-col"
                  style={{ 
                    background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                  }}
                >
                  {/* Card Header */}
                  <div className="p-2 flex items-center justify-between">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20"
                    >
                      <span className="text-white">
                        {getCategoryIcon(card.category)}
                      </span>
                    </div>
                    <div 
                      className="px-2 py-0.5 rounded-full flex items-center gap-1"
                      style={{ backgroundColor: getDifficultyBgColor(card.difficulty) }}
                    >
                      <span className="text-white flex">
                        {getDifficultyStars(card.difficulty)}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 bg-white mx-2 rounded-lg p-3 flex flex-col items-center justify-center text-center">
                    <h3 
                      className="text-lg font-black mb-2"
                      style={{ color: theme.primaryColor }}
                    >
                      {card.title}
                    </h3>
                    <p className="text-sm text-gray-600 leading-tight">
                      {card.description}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="p-2 flex items-center justify-center">
                    <span className="text-xs font-bold text-white/80 uppercase">
                      {card.category} Challenge
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Card Backs Page */}
      <div className="w-[8.5in] h-[11in] p-4 bg-white print:p-2 print:break-after-page">
        <div className="text-center mb-3">
          <h2 className="text-lg font-bold text-gray-600">Card Backs (print on back side)</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: cardsPerPage }).map((_, index) => (
            <div
              key={index}
              className="aspect-[2.5/3.5] rounded-xl border-2 border-dashed border-gray-300 p-1"
            >
              <div 
                className="w-full h-full rounded-lg flex flex-col items-center justify-center"
                style={{ 
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                }}
              >
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-2">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-black text-white">CHALLENGE</h3>
                <p className="text-sm font-bold text-white/80">CARD</p>
                <div className="mt-2 flex gap-1">
                  {[theme.primaryColor, theme.secondaryColor, theme.accentColor].map((color, i) => (
                    <div 
                      key={i}
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: color, opacity: 0.5 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PrintableChallengeCards;
