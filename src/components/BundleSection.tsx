import React from 'react';
import { games } from '@/data/gamesData';
import { useCart } from '@/contexts/CartContext';

const BundleSection: React.FC = () => {
  const { addToCart } = useCart();
  
  // Total: $120 reduced to $102 (15% off)
  const originalPrice = 120.00;
  const bundlePrice = 102.00;
  const savings = originalPrice - bundlePrice;
  const savingsPercent = Math.round((savings / originalPrice) * 100);


  const handleBuyBundle = () => {
    // Create a bundle "game" item with the bundle price
    const bundleItem = {
      id: 'complete-bundle',
      name: 'Complete Collection Bundle (All 6 Games)',
      description: 'All 6 games + FREE Shipping',
      price: bundlePrice,
      image: games[0]?.image || '/placeholder.svg',
      players: '2-12',
      duration: 'Varies',
      ages: '17+',
      category: 'Bundle'
    };
    addToCart(bundleItem, 'physical');
    alert(`Complete Collection Bundle ($${bundlePrice.toFixed(2)}) added to cart!`);
  };

  return (
    <section className="py-16 bg-gradient-to-r from-amber-900/30 to-lime-900/30">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 md:p-12 border border-amber-500/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/20 to-lime-500/20 rounded-full blur-3xl" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-block bg-lime-500 text-black px-4 py-1 rounded-full text-sm font-bold mb-4">SAVE ${savings.toFixed(0)} ({savingsPercent}% OFF)</span>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                Complete Collection <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-lime-400">Bundle</span>
              </h2>
              <p className="text-gray-400 mb-6">
                Get all 6 games and save ${savings.toFixed(0)} + FREE shipping!
              </p>
              <ul className="space-y-2 mb-6">
                {games.map(game => (
                  <li key={game.id} className="flex items-center justify-between text-gray-300">
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {game.name}
                    </span>
                    <span className="text-gray-500">${game.price.toFixed(2)}</span>
                  </li>
                ))}
                <li className="flex items-center gap-2 text-lime-400 font-bold pt-2 border-t border-gray-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  FREE Shipping Included!
                </li>
              </ul>
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-gray-500 line-through">${originalPrice.toFixed(2)}</p>
                  <p className="text-4xl font-black text-white">${bundlePrice.toFixed(2)}</p>
                </div>
                <button onClick={handleBuyBundle} className="px-8 py-4 bg-gradient-to-r from-amber-500 to-lime-500 hover:from-amber-400 hover:to-lime-400 text-black font-bold rounded-xl transition-all transform hover:scale-105">
                  Get Bundle
                </button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {games.map(game => (
                <img key={game.id} src={game.image} alt={game.name} className="rounded-xl shadow-lg aspect-square object-cover" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BundleSection;
