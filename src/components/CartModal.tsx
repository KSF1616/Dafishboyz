
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { X, Trash2, Package, Download, Tag, Sparkles } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();

  if (!isOpen) return null;

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  const hasPhysical = cart.some(item => item.type === 'physical');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80" onClick={onClose} />
      <div className="relative bg-gray-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden border border-amber-500/30">
        <div className="p-6 border-b border-amber-500/30 flex items-center justify-between">
          <h2 className="text-xl font-bold text-amber-400">Your Cart</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {cart.length === 0 ? (
            <p className="text-gray-400 text-center py-8">Your cart is empty</p>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={`${item.game.id}-${item.type}`} className="flex items-center gap-4 bg-gray-800 rounded-xl p-4">
                  <img src={item.game.image} alt={item.game.name} className="w-16 h-16 rounded-lg object-cover" />
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-sm">{item.game.name}</h4>
                    <div className="flex items-center gap-1 text-xs text-lime-400">
                      {item.type === 'physical' ? <Package className="w-3 h-3" /> : <Download className="w-3 h-3" />}
                      <span className="capitalize">{item.type}</span>
                    </div>
                    <p className="text-amber-400 font-bold">${item.game.price}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.game.id, item.quantity - 1)} className="w-8 h-8 bg-gray-700 rounded text-white hover:bg-gray-600">-</button>
                    <span className="text-white w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.game.id, item.quantity + 1)} className="w-8 h-8 bg-gray-700 rounded text-white hover:bg-gray-600">+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.game.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-6 border-t border-amber-500/30">
            {/* Promo code hint */}
            <div className="bg-gradient-to-r from-amber-500/10 to-lime-500/10 rounded-lg p-3 mb-4 border border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-400 text-sm">
                <Tag className="w-4 h-4" />
                <span className="font-medium">Have a promo code?</span>
              </div>
              <p className="text-gray-400 text-xs mt-1">Apply it at checkout for extra savings!</p>
              {hasPhysical && (
                <div className="flex items-center gap-1 text-xs text-lime-400 mt-2">
                  <Sparkles className="w-3 h-3" />
                  <span>Physical purchase? Try <span className="font-mono bg-gray-800 px-1 rounded">FREETOOLS30</span></span>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mb-4">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-2xl font-bold text-white">${total.toFixed(2)}</span>
            </div>
            <button onClick={handleCheckout} className="w-full py-3 bg-gradient-to-r from-amber-500 to-lime-500 text-black font-bold rounded-xl hover:from-amber-400 hover:to-lime-400 transition-all">
              Proceed to Checkout
            </button>
            <button onClick={clearCart} className="w-full py-2 mt-2 text-gray-400 hover:text-white text-sm">Clear Cart</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;
