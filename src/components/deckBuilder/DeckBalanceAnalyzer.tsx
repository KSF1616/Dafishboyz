import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { DeckCard, CategoryBalance, CATEGORY_SUGGESTIONS } from '@/types/deckBuilder';

interface DeckBalanceAnalyzerProps {
  cards: DeckCard[];
}

export const DeckBalanceAnalyzer: React.FC<DeckBalanceAnalyzerProps> = ({ cards }) => {
  const totalCards = cards.length;
  
  const analyzeBalance = (): CategoryBalance[] => {
    const counts: Record<string, number> = { prompt: 0, response: 0 };
    cards.forEach(card => { counts[card.card_type] = (counts[card.card_type] || 0) + 1; });
    
    return Object.entries(counts).map(([category, count]) => {
      const percentage = totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
      const suggested = CATEGORY_SUGGESTIONS[category] || 50;
      const diff = Math.abs(percentage - suggested);
      
      let status: 'good' | 'low' | 'high' = 'good';
      if (diff > 15) status = percentage < suggested ? 'low' : 'high';
      
      return { category, count, percentage, suggested, status };
    });
  };

  const balance = analyzeBalance();
  
  if (totalCards === 0) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <p className="text-sm text-gray-500 text-center">Add cards to see balance analysis</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium flex items-center gap-2">
        <Info className="w-4 h-4 text-blue-500" /> Category Balance
      </h4>
      {balance.map(({ category, count, percentage, suggested, status }) => (
        <div key={category} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="capitalize font-medium">{category}</span>
            <span className={status === 'good' ? 'text-green-600' : status === 'low' ? 'text-amber-600' : 'text-red-600'}>
              {count} ({percentage}%)
            </span>
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${status === 'good' ? 'bg-green-500' : status === 'low' ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-1 text-xs">
            {status === 'good' ? (
              <><CheckCircle className="w-3 h-3 text-green-500" /><span className="text-green-600">Good balance</span></>
            ) : (
              <><AlertTriangle className="w-3 h-3 text-amber-500" /><span className="text-amber-600">Suggested: ~{suggested}%</span></>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
