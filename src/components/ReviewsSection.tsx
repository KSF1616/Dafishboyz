import React, { useState } from 'react';
import { reviews } from '@/data/gamesData';
import ReviewCard from './ReviewCard';
import { useLogo } from '@/contexts/LogoContext';

const ReviewsSection: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState(4);
  const { logoUrl } = useLogo();

  return (
    <section id="reviews" className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          {/* Logo above section - Dynamic from LogoContext */}
          <div className="mb-6 flex justify-center">
            <img 
              src={logoUrl} 
              alt="Dafish Boyz" 
              className="w-14 h-14 object-contain opacity-70"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
          </div>
          <span className="inline-block bg-amber-500/20 text-amber-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
            TESTIMONIALS
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            What Players <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-lime-400">Are Saying</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our community thinks about our games.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {reviews.slice(0, visibleCount).map(review => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {visibleCount < reviews.length && (
          <div className="text-center mt-8">
            <button
              onClick={() => setVisibleCount(reviews.length)}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl transition-colors"
            >
              Show More Reviews
            </button>
          </div>
        )}

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-3 bg-gray-800 rounded-full px-6 py-3">
            <img 
              src={logoUrl} 
              alt="Dafish Boyz" 
              className="w-8 h-8 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-lime-500 border-2 border-gray-800" />
              ))}
            </div>
            <span className="text-gray-300">
              Join <span className="text-amber-400 font-bold">50,000+</span> happy DAFISH BOYZ players
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
