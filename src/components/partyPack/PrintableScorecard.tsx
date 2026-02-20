import React from 'react';
import { PartyPackTheme } from '@/types/partyPack';
import { Trophy, Star, Target, Zap } from 'lucide-react';

interface PrintableScorecardProps {
  theme: PartyPackTheme;
  gameMode: 'dropChase' | 'hotPoo' | 'both';
  maxPlayers?: number;
  maxRounds?: number;
}

const PrintableScorecard: React.FC<PrintableScorecardProps> = ({
  theme,
  gameMode,
  maxPlayers = 8,
  maxRounds = 10
}) => {
  const getGameTitle = () => {
    switch (gameMode) {
      case 'dropChase': return 'Drop & Chase';
      case 'hotPoo': return 'Hot Poo';
      case 'both': return 'Drop A Deuce';
    }
  };


  const getGameIcon = () => {
    switch (gameMode) {
      case 'dropChase': return <Target className="w-6 h-6 text-white" />;
      case 'hotPoo': return <Zap className="w-6 h-6 text-white" />;
      case 'both': return <Star className="w-6 h-6 text-white" />;
    }
  };

  return (
    <div 
      className="w-[8.5in] h-[11in] p-6 bg-white print:p-4"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {getGameIcon()}
          </div>
          <div>
            <h1 className="text-2xl font-black" style={{ color: theme.primaryColor }}>
              {getGameTitle()} Scorecard
            </h1>
            <p className="text-sm text-gray-500">Track your scores and crown the winner!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-8 h-8" style={{ color: theme.accentColor }} />
        </div>
      </div>

      {/* Date Field */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-600">Date:</span>
          <div className="border-b-2 border-gray-300 w-40 h-6"></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-600">Winner:</span>
          <div className="border-b-2 border-gray-300 w-40 h-6"></div>
        </div>
      </div>

      {/* Score Table */}
      <div className="border-2 rounded-xl overflow-hidden" style={{ borderColor: theme.primaryColor }}>
        <table className="w-full">
          <thead>
            <tr style={{ backgroundColor: theme.primaryColor }}>
              <th className="text-white font-bold py-2 px-3 text-left w-32 border-r border-white/30">
                Player Name
              </th>
              {Array.from({ length: maxRounds }, (_, i) => (
                <th key={i} className="text-white font-bold py-2 px-1 text-center text-sm border-r border-white/30 w-10">
                  R{i + 1}
                </th>
              ))}
              <th className="text-white font-bold py-2 px-3 text-center w-16" style={{ backgroundColor: theme.accentColor }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: maxPlayers }, (_, playerIndex) => (
              <tr 
                key={playerIndex} 
                className={playerIndex % 2 === 0 ? 'bg-white' : ''}
                style={{ backgroundColor: playerIndex % 2 === 1 ? `${theme.primaryColor}10` : undefined }}
              >
                <td className="py-3 px-3 border-r border-gray-200">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: theme.secondaryColor }}
                    >
                      {playerIndex + 1}
                    </div>
                    <div className="border-b border-gray-300 flex-1 h-5"></div>
                  </div>
                </td>
                {Array.from({ length: maxRounds }, (_, roundIndex) => (
                  <td key={roundIndex} className="py-3 px-1 text-center border-r border-gray-200">
                    <div className="w-8 h-8 mx-auto border-2 border-gray-200 rounded-lg"></div>
                  </td>
                ))}
                <td className="py-3 px-3 text-center" style={{ backgroundColor: `${theme.accentColor}20` }}>
                  <div className="w-12 h-8 mx-auto border-2 rounded-lg" style={{ borderColor: theme.accentColor }}></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Scoring Guide */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div 
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${theme.primaryColor}15` }}
        >
          <h3 className="font-bold text-sm mb-2" style={{ color: theme.primaryColor }}>
            Drop & Chase Scoring:
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Dropper makes it safely = +1 point</li>
            <li>• Chaser tags the Dropper = +1 point</li>
            <li>• First to 5 points wins!</li>
          </ul>
        </div>
        <div 
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${theme.secondaryColor}15` }}
        >
          <h3 className="font-bold text-sm mb-2" style={{ color: theme.secondaryColor }}>
            Hot Poo Scoring:
          </h3>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Survive a round = +1 point</li>
            <li>• Caught holding Hot Poo = OUT</li>
            <li>• Last player standing wins!</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">Drop A Deuce Party Pack • www.dafishboyz.com</p>
      </div>
    </div>
  );
};

export default PrintableScorecard;
