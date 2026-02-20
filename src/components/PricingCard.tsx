
import React from 'react';
import { PricingPlan } from '@/types/game';
import { Loader2, Check } from 'lucide-react';

interface PricingCardProps {
  plan: PricingPlan;
  onSelect: (plan: PricingPlan) => void;
  loading?: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, onSelect, loading }) => {
  return (
    <div
      className={`relative rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${
        plan.popular
          ? 'bg-gradient-to-br from-amber-500 to-lime-500 text-black shadow-2xl shadow-amber-500/30 scale-105'
          : 'bg-gradient-to-br from-gray-800 to-gray-900 border border-amber-500/30 text-white'
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-lime-400 px-4 py-1 rounded-full text-sm font-bold">
          MOST POPULAR
        </div>
      )}
      <h3 className={`text-xl font-bold mb-2 ${plan.popular ? 'text-black' : 'text-amber-400'}`}>
        {plan.name}
      </h3>
      <div className="mb-4">
        <span className="text-4xl font-black">${plan.price}</span>
        <span className={`text-sm ${plan.popular ? 'text-black/70' : 'text-gray-400'}`}>
          {plan.period}
        </span>
      </div>
      <ul className="space-y-3 mb-6">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2">
            <Check className={`w-5 h-5 flex-shrink-0 ${plan.popular ? 'text-black' : 'text-lime-400'}`} />
            <span className={`text-sm ${plan.popular ? 'text-black/80' : 'text-gray-300'}`}>
              {feature}
            </span>
          </li>
        ))}
      </ul>
      <button
        onClick={() => onSelect(plan)}
        disabled={loading}
        className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
          plan.popular
            ? 'bg-black text-lime-400 hover:bg-gray-900 disabled:opacity-70'
            : 'bg-gradient-to-r from-amber-500 to-lime-500 text-black hover:from-amber-400 hover:to-lime-400 disabled:opacity-70'
        }`}
      >
        {loading ? (
          <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
        ) : (
          plan.id === 'daily' ? 'Get 24-Hour Access' : 'Subscribe Now'
        )}
      </button>

    </div>
  );
};

export default PricingCard;
