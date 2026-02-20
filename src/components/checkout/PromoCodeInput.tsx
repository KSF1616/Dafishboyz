import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tag, X, Check, Loader2, Gift, Truck } from 'lucide-react';
import { AppliedPromoCode, PromoCode, PromoCodeValidation } from '@/types/promoCode';
import { findPromoCode } from '@/data/promoCodes';
import { CartItem } from '@/types/game';

interface PromoCodeInputProps {
  cart: CartItem[];
  subtotal: number;
  appliedCode: AppliedPromoCode | null;
  onApplyCode: (code: AppliedPromoCode | null) => void;
  hasBundle?: boolean;
}

export const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  cart,
  subtotal,
  appliedCode,
  onApplyCode,
  hasBundle = false
}) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const hasPhysical = cart.some(item => item.type === 'physical');
  const hasDigital = cart.some(item => item.type === 'digital');

  const validatePromoCode = (promoCode: PromoCode): PromoCodeValidation => {
    const now = new Date();

    // Check if code is active
    if (!promoCode.isActive) {
      return { isValid: false, error: 'This promo code is no longer active' };
    }

    // Check date validity
    if (promoCode.validFrom && new Date(promoCode.validFrom) > now) {
      return { isValid: false, error: 'This promo code is not yet valid' };
    }
    if (promoCode.validUntil && new Date(promoCode.validUntil) < now) {
      return { isValid: false, error: 'This promo code has expired' };
    }

    // Check minimum order amount
    if (promoCode.minOrderAmount && subtotal < promoCode.minOrderAmount) {
      return { 
        isValid: false, 
        error: `Minimum order of $${promoCode.minOrderAmount.toFixed(2)} required` 
      };
    }

    // Check if requires physical items
    if (promoCode.requiresPhysical && !hasPhysical) {
      return { 
        isValid: false, 
        error: 'This code is only valid for physical game purchases' 
      };
    }

    // Check applicable item types
    if (promoCode.applicableTo === 'physical' && !hasPhysical) {
      return { isValid: false, error: 'This code only applies to physical items' };
    }
    if (promoCode.applicableTo === 'digital' && !hasDigital) {
      return { isValid: false, error: 'This code only applies to digital items' };
    }
    if (promoCode.applicableTo === 'bundle' && !hasBundle) {
      return { isValid: false, error: 'This code only applies to bundle purchases' };
    }

    // Calculate discount
    let discount = 0;
    if (promoCode.type === 'percentage') {
      let applicableAmount = subtotal;
      if (promoCode.applicableTo === 'physical') {
        applicableAmount = cart
          .filter(item => item.type === 'physical')
          .reduce((sum, item) => sum + item.game.price * item.quantity, 0);
      } else if (promoCode.applicableTo === 'digital') {
        applicableAmount = cart
          .filter(item => item.type === 'digital')
          .reduce((sum, item) => sum + item.game.price * item.quantity, 0);
      }
      discount = (applicableAmount * promoCode.value) / 100;
      if (promoCode.maxDiscount) {
        discount = Math.min(discount, promoCode.maxDiscount);
      }
    } else if (promoCode.type === 'fixed') {
      discount = promoCode.value;
    }

    return { isValid: true, promoCode, discount };
  };

  const handleApply = async () => {
    if (!code.trim()) {
      setError('Please enter a promo code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const promoCode = findPromoCode(code);

    if (!promoCode) {
      setError('Invalid promo code');
      setLoading(false);
      return;
    }

    const validation = validatePromoCode(promoCode);

    if (!validation.isValid) {
      setError(validation.error || 'Invalid promo code');
      setLoading(false);
      return;
    }

    const applied: AppliedPromoCode = {
      code: promoCode.code,
      discount: validation.discount || 0,
      description: promoCode.description,
      freeTrialDays: promoCode.freeTrialDays,
      freeTrialFeature: promoCode.freeTrialFeature,
      freeShipping: promoCode.type === 'free_shipping'
    };

    // Handle free shipping separately
    if (promoCode.type === 'free_shipping') {
      applied.description = 'Free shipping applied!';
    }

    onApplyCode(applied);
    setSuccess('Promo code applied!');
    setCode('');
    setLoading(false);
  };

  const handleRemove = () => {
    onApplyCode(null);
    setSuccess('');
    setError('');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-gray-300">
        <Tag className="w-4 h-4" />
        <span className="text-sm font-medium">Promo Code</span>
      </div>

      {appliedCode ? (
        <div className="bg-green-900/30 border border-green-700 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-400" />
              <div>
                <span className="text-green-400 font-semibold">{appliedCode.code}</span>
                <p className="text-green-300 text-xs">{appliedCode.description}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-gray-400 hover:text-white h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {appliedCode.discount > 0 && (
            <p className="text-green-400 text-sm mt-2 font-medium">
              -${appliedCode.discount.toFixed(2)} discount
            </p>
          )}
          
          {appliedCode.freeTrialDays && (
            <div className="flex items-center gap-2 mt-2 text-amber-400 text-sm">
              <Gift className="w-4 h-4" />
              <span>{appliedCode.freeTrialDays} days free: {appliedCode.freeTrialFeature}</span>
            </div>
          )}
          
          {appliedCode.freeShipping && (
            <div className="flex items-center gap-2 mt-2 text-blue-400 text-sm">
              <Truck className="w-4 h-4" />
              <span>Free shipping on this order!</span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError('');
            }}
            placeholder="Enter code"
            className="bg-gray-800 border-gray-700 text-white uppercase"
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          />
          <Button
            onClick={handleApply}
            disabled={loading}
            variant="outline"
            className="border-amber-500 text-amber-500 hover:bg-amber-500 hover:text-black"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
          </Button>
        </div>
      )}

      {error && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <X className="w-3 h-3" /> {error}
        </p>
      )}

      {success && !appliedCode && (
        <p className="text-green-400 text-sm flex items-center gap-1">
          <Check className="w-3 h-3" /> {success}
        </p>
      )}

      {/* Available codes hint */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Try: SAVE10, WELCOME15, HOLIDAY25</p>
        {hasPhysical && (
          <p className="text-amber-500/70 flex items-center gap-1">
            <Gift className="w-3 h-3" />
            Physical purchase? Use FREETOOLS30 for 30 days free game tools!
          </p>
        )}
      </div>
    </div>
  );
};
