import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CartItem, Game } from '@/types/game';

interface CartContextType {
  cart: CartItem[];
  addToCart: (game: Game, type: 'digital' | 'physical') => void;
  removeFromCart: (gameId: string) => void;
  updateQuantity: (gameId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (game: Game, type: 'digital' | 'physical') => {
    setCart(prev => {
      const existing = prev.find(item => item.game.id === game.id && item.type === type);
      if (existing) {
        return prev.map(item =>
          item.game.id === game.id && item.type === type
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { game, quantity: 1, type }];
    });
  };

  const removeFromCart = (gameId: string) => {
    setCart(prev => prev.filter(item => item.game.id !== gameId));
  };

  const updateQuantity = (gameId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(gameId);
      return;
    }
    setCart(prev => prev.map(item =>
      item.game.id === gameId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => setCart([]);

  const total = cart.reduce((sum, item) => sum + item.game.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
