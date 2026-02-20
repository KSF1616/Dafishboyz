import React from 'react';
import { PartyPackTheme } from '@/types/partyPack';
import { PartyPopper, Star, Sparkles, Trophy, Music, Gift, Cake, Crown } from 'lucide-react';

interface PrintableDecorationsProps {
  theme: PartyPackTheme;
  childName: string;
  decorationType: 'banner' | 'doorSign' | 'cupcakeToppers' | 'photoProps';
}

const PrintableDecorations: React.FC<PrintableDecorationsProps> = ({
  theme,
  childName,
  decorationType
}) => {
  // Banner Letters
  if (decorationType === 'banner') {
    const bannerText = 'HAPPY BIRTHDAY';
    return (
      <div className="w-[8.5in] min-h-[11in] p-4 bg-white print:p-2">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-600">Cut out each flag and string together!</h2>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {bannerText.split('').filter(c => c !== ' ').map((letter, index) => (
            <div
              key={index}
              className="aspect-[3/4] rounded-t-lg relative flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)'
              }}
            >
              <span className="text-5xl font-black text-white drop-shadow-lg">
                {letter}
              </span>
              {/* Hole for string */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
            </div>
          ))}
        </div>
        
        {/* Additional name banner */}
        <div className="mt-6 text-center mb-2">
          <h2 className="text-lg font-bold text-gray-600">Name Banner (optional)</h2>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {(childName || 'NAME').toUpperCase().split('').slice(0, 10).map((letter, index) => (
            <div
              key={index}
              className="aspect-[3/4] rounded-t-lg relative flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${theme.accentColor}, ${theme.primaryColor})`,
                clipPath: 'polygon(0 0, 100% 0, 100% 85%, 50% 100%, 0 85%)'
              }}
            >
              <span className="text-4xl font-black text-white drop-shadow-lg">
                {letter}
              </span>
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Door Sign
  if (decorationType === 'doorSign') {
    return (
      <div className="w-[8.5in] h-[11in] p-4 bg-white flex items-center justify-center">
        <div 
          className="w-[7in] h-[9in] rounded-3xl border-8 relative overflow-hidden flex flex-col items-center justify-center p-8"
          style={{ 
            borderColor: theme.primaryColor,
            background: `linear-gradient(135deg, ${theme.backgroundColor} 0%, white 50%, ${theme.backgroundColor} 100%)`
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-4 left-4">
            <PartyPopper className="w-12 h-12" style={{ color: theme.primaryColor }} />
          </div>
          <div className="absolute top-4 right-4">
            <Sparkles className="w-12 h-12" style={{ color: theme.secondaryColor }} />
          </div>
          <div className="absolute bottom-4 left-4">
            <Gift className="w-12 h-12" style={{ color: theme.accentColor }} />
          </div>
          <div className="absolute bottom-4 right-4">
            <Cake className="w-12 h-12" style={{ color: theme.primaryColor }} />
          </div>

          {/* Main content */}
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <Crown className="w-10 h-10 text-white" />
          </div>
          
          <h1 
            className="text-4xl font-black text-center mb-2"
            style={{ color: theme.primaryColor }}
          >
            WELCOME TO
          </h1>
          
          <div 
            className="px-8 py-4 rounded-2xl mb-4"
            style={{ background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})` }}
          >
            <h2 className="text-5xl font-black text-white text-center">
              {childName || "[Name]"}'s
            </h2>
          </div>
          
          <h3 
            className="text-5xl font-black text-center mb-4"
            style={{ color: theme.secondaryColor }}
          >
            DROP A DEUCE
          </h3>

          
          <h4 
            className="text-4xl font-black text-center"
            style={{ color: theme.accentColor }}
          >
            PARTY!
          </h4>

          {/* Mascot */}
          <img 
            src="https://d64gsuwffb70l.cloudfront.net/692bcf0e39ef29fa4b4a1d04_1765399642855_9cc0e6d2.jpg"
            alt="Party Mascot"
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg mt-4"
          />
        </div>
      </div>
    );
  }

  // Cupcake Toppers
  if (decorationType === 'cupcakeToppers') {
    const topperDesigns = [
      { icon: Star, text: 'DROP' },
      { icon: Sparkles, text: 'DEUCE' },
      { icon: Trophy, text: 'WINNER' },
      { icon: PartyPopper, text: 'PARTY' },
      { icon: Crown, text: 'VIP' },
      { icon: Music, text: 'FUN' },
      { icon: Gift, text: 'YAY!' },
      { icon: Cake, text: childName?.slice(0, 6) || 'PARTY' }
    ];

    return (
      <div className="w-[8.5in] h-[11in] p-4 bg-white">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-600">Cut out circles and attach to toothpicks!</h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {topperDesigns.map((design, index) => (
            <React.Fragment key={index}>
              {/* Front */}
              <div 
                className="w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 mx-auto"
                style={{ 
                  borderColor: theme.primaryColor,
                  background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`
                }}
              >
                <design.icon className="w-8 h-8 text-white mb-1" />
                <span className="text-xs font-black text-white">{design.text}</span>
              </div>
              {/* Back (mirror) */}
              <div 
                className="w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 mx-auto"
                style={{ 
                  borderColor: theme.secondaryColor,
                  background: `linear-gradient(135deg, ${theme.secondaryColor}, ${theme.primaryColor})`
                }}
              >
                <design.icon className="w-8 h-8 text-white mb-1" />
                <span className="text-xs font-black text-white">{design.text}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
        
        {/* Extra round toppers */}
        <div className="mt-6 grid grid-cols-6 gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i}
              className="w-16 h-16 rounded-full flex items-center justify-center border-2 mx-auto"
              style={{ 
                borderColor: i % 2 === 0 ? theme.primaryColor : theme.secondaryColor,
                backgroundColor: i % 2 === 0 ? `${theme.primaryColor}20` : `${theme.secondaryColor}20`
              }}
            >
              <Sparkles className="w-6 h-6" style={{ color: i % 2 === 0 ? theme.primaryColor : theme.secondaryColor }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Photo Props
  if (decorationType === 'photoProps') {
    return (
      <div className="w-[8.5in] h-[11in] p-4 bg-white">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold text-gray-600">Cut out and attach to sticks for photo booth fun!</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Speech bubbles */}
          <div 
            className="p-4 rounded-2xl relative"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <p className="text-2xl font-black text-white text-center">DROP IT!</p>
            <div 
              className="absolute -bottom-4 left-8 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-transparent"
              style={{ borderTopColor: theme.primaryColor }}
            />
          </div>
          
          <div 
            className="p-4 rounded-2xl relative"
            style={{ backgroundColor: theme.secondaryColor }}
          >
            <p className="text-2xl font-black text-white text-center">DEUCE!</p>
            <div 
              className="absolute -bottom-4 right-8 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-transparent"
              style={{ borderTopColor: theme.secondaryColor }}
            />
          </div>

          <div 
            className="p-4 rounded-2xl relative"
            style={{ backgroundColor: theme.accentColor }}
          >
            <p className="text-2xl font-black text-white text-center">WINNER!</p>
            <div 
              className="absolute -bottom-4 left-8 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-transparent"
              style={{ borderTopColor: theme.accentColor }}
            />
          </div>

          <div 
            className="p-4 rounded-2xl relative"
            style={{ backgroundColor: theme.primaryColor }}
          >
            <p className="text-2xl font-black text-white text-center">HOT POO!</p>
            <div 
              className="absolute -bottom-4 right-8 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[20px] border-transparent"
              style={{ borderTopColor: theme.primaryColor }}
            />
          </div>
        </div>

        {/* Props */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {/* Crown */}
          <div className="flex flex-col items-center">
            <div 
              className="w-32 h-20 flex items-center justify-center"
              style={{ 
                backgroundColor: theme.accentColor,
                clipPath: 'polygon(0% 100%, 10% 50%, 25% 80%, 50% 30%, 75% 80%, 90% 50%, 100% 100%)'
              }}
            />
            <span className="text-xs text-gray-500 mt-1">Crown</span>
          </div>

          {/* Star */}
          <div className="flex flex-col items-center">
            <Star className="w-24 h-24" style={{ color: theme.primaryColor, fill: theme.primaryColor }} />
            <span className="text-xs text-gray-500 mt-1">Star</span>
          </div>

          {/* Trophy */}
          <div className="flex flex-col items-center">
            <Trophy className="w-24 h-24" style={{ color: theme.secondaryColor }} />
            <span className="text-xs text-gray-500 mt-1">Trophy</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PrintableDecorations;
