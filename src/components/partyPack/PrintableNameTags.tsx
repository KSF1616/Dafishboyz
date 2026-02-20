import React from 'react';
import { PartyPackTheme } from '@/types/partyPack';
import { Star, Sparkles, Trophy, Crown } from 'lucide-react';

interface PrintableNameTagsProps {
  theme: PartyPackTheme;
  names: string[];
}

const PrintableNameTags: React.FC<PrintableNameTagsProps> = ({ theme, names }) => {
  // Pad names array to fill a full sheet (8 tags per page)
  const paddedNames = [...names];
  while (paddedNames.length < 8) {
    paddedNames.push('');
  }

  const icons = [Star, Sparkles, Trophy, Crown];

  return (
    <div className="w-[8.5in] min-h-[11in] p-4 bg-white print:p-2">
      <div className="grid grid-cols-2 gap-4">
        {paddedNames.slice(0, 8).map((name, index) => {
          const IconComponent = icons[index % icons.length];
          return (
            <div
              key={index}
              className="h-[2.5in] rounded-2xl border-4 relative overflow-hidden flex flex-col items-center justify-center p-4"
              style={{ 
                borderColor: theme.primaryColor,
                background: `linear-gradient(135deg, ${theme.backgroundColor} 0%, white 100%)`
              }}
            >
              {/* Decorative circles */}
              <div 
                className="absolute -top-6 -left-6 w-16 h-16 rounded-full opacity-20"
                style={{ backgroundColor: theme.primaryColor }}
              />
              <div 
                className="absolute -bottom-6 -right-6 w-16 h-16 rounded-full opacity-20"
                style={{ backgroundColor: theme.secondaryColor }}
              />
              <div 
                className="absolute top-2 right-2 w-8 h-8 rounded-full opacity-30"
                style={{ backgroundColor: theme.accentColor }}
              />

              {/* Icon */}
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                style={{ backgroundColor: theme.primaryColor }}
              >
                <IconComponent className="w-6 h-6 text-white" />
              </div>

              {/* "Hello My Name Is" text */}
              <div 
                className="px-4 py-1 rounded-full text-xs font-bold text-white mb-2"
                style={{ backgroundColor: theme.secondaryColor }}
              >
                HELLO, MY NAME IS
              </div>

              {/* Name area */}
              <div className="w-full flex-1 flex items-center justify-center">
                {name ? (
                  <span 
                    className="text-2xl font-black text-center"
                    style={{ color: theme.primaryColor }}
                  >
                    {name}
                  </span>
                ) : (
                  <div 
                    className="w-4/5 h-8 border-b-4"
                    style={{ borderColor: theme.primaryColor }}
                  />
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center gap-1 mt-2">
                <span className="text-xs font-bold" style={{ color: theme.accentColor }}>
                  Drop A Deuce Party
                </span>

                <Sparkles className="w-3 h-3" style={{ color: theme.accentColor }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrintableNameTags;
