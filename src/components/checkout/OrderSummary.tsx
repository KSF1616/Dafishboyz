
import React from 'react';
import { CartItem } from '@/types/game';
import { Package, Download, Gift, Truck } from 'lucide-react';
import { AppliedPromoCode } from '@/types/promoCode';

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  discount?: number;
  appliedCode?: AppliedPromoCode | null;
  freeShipping?: boolean;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ 
  items, 
  subtotal, 
  shipping, 
  tax, 
  total,
  discount = 0,
  appliedCode,
  freeShipping = false
}) => {
  const displayShipping = freeShipping ? 0 : shipping;
  
  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
      
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={`${item.game.id}-${item.type}`} className="flex items-center gap-3">
            <img src={item.game.image} alt={item.game.name} className="w-12 h-12 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="text-white font-medium text-sm">{item.game.name}</p>
              <div className="flex items-center gap-1 text-xs text-gray-400">
                {item.type === 'physical' ? (
                  <><Package className="w-3 h-3" /> Physical</>
                ) : (
                  <><Download className="w-3 h-3" /> Digital</>
                )}
                <span className="ml-2">Qty: {item.quantity}</span>
              </div>
            </div>
            <p className="text-white font-medium">${(item.game.price * item.quantity).toFixed(2)}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-700 pt-4 space-y-2">
        <div className="flex justify-between text-gray-400">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-green-400">
            <span className="flex items-center gap-1">
              <Gift className="w-3 h-3" />
              Promo Discount
            </span>
            <span>-${discount.toFixed(2)}</span>
          </div>
        )}
        
        {shipping > 0 && (
          <div className="flex justify-between text-gray-400">
            <span className="flex items-center gap-1">
              {freeShipping && <Truck className="w-3 h-3 text-green-400" />}
              Shipping
            </span>
            {freeShipping ? (
              <span className="text-green-400">
                <span className="line-through text-gray-500 mr-2">${shipping.toFixed(2)}</span>
                FREE
              </span>
            ) : (
              <span>${shipping.toFixed(2)}</span>
            )}
          </div>
        )}
        
        <div className="flex justify-between text-gray-400">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        
        {appliedCode?.freeTrialDays && (
          <div className="flex justify-between text-amber-400 text-sm bg-amber-500/10 rounded-lg p-2 mt-2">
            <span className="flex items-center gap-1">
              <Gift className="w-3 h-3" />
              Bonus
            </span>
            <span>{appliedCode.freeTrialDays} days free tools</span>
          </div>
        )}
        
        <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-gray-700">
          <span>Total</span>
          <span className="text-amber-400">${total.toFixed(2)}</span>
        </div>
        
        {discount > 0 && (
          <p className="text-green-400 text-xs text-right">
            You're saving ${discount.toFixed(2)}!
          </p>
        )}
      </div>
    </div>
  );
};

