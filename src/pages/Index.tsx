
import React from 'react';
import AppLayout from '@/components/AppLayout';
import { AppProvider } from '@/contexts/AppContext';
import { CartProvider } from '@/contexts/CartContext';
import { AudioProvider } from '@/contexts/AudioContext';

const Index: React.FC = () => {
  return (
    <AppProvider>
      <CartProvider>
        <AudioProvider>
          <AppLayout />
        </AudioProvider>
      </CartProvider>
    </AppProvider>
  );
};

export default Index;
