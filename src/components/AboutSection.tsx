import React from 'react';
import { useLogo } from '@/contexts/LogoContext';

const AboutSection: React.FC = () => {
  const { logoUrl } = useLogo();
  
  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-black text-white mb-6">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-lime-400">Dafish Boyz</span>
            </h2>
            <p className="text-gray-300 text-lg mb-6">
              This Grammy realized her grandsons were stressed and needed relief so we began with Let That Shit Go and rolled with it from there. And we all know that laughter is the best medicine, especially when life gets a little... crappy. 
              Our games are designed to bring people together, break the ice, and create unforgettable memories.
            </p>

            <p className="text-gray-400 mb-6">
              Founded in 2020, Dafish Boyz started with a simple mission: make game nights fun again. 
              We've sold over 50,000 games and counting, bringing joy to households across the country.
            </p>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-amber-400">50K+</p>
                <p className="text-gray-500 text-sm">Games Sold</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-lime-400">4.9</p>
                <p className="text-gray-500 text-sm">Avg Rating</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-purple-400">6</p>
                <p className="text-gray-500 text-sm">Fun Games</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl shadow-amber-500/20 w-full max-w-md aspect-square flex items-center justify-center p-8 relative overflow-hidden">
              {/* Background glow effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
              <div className="absolute top-1/4 left-1/4 w-40 h-40 bg-lime-500/10 rounded-full blur-2xl"></div>
              
              {/* Logo - Dynamic from LogoContext */}
              <img 
                src={logoUrl} 
                alt="Dafish Boyz FunShit Games Logo" 
                className="w-full h-full object-contain max-w-xs relative z-10 rounded-xl"
                style={{
                  filter: 'drop-shadow(0 0 30px rgba(245, 158, 11, 0.4))'
                }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              
              {/* Corner decorations */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-amber-500/50 rounded-tl-lg"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-amber-500/50 rounded-tr-lg"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-amber-500/50 rounded-bl-lg"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-amber-500/50 rounded-br-lg"></div>
            </div>
          </div>
        </div>
        
        {/* Additional branding section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-4 bg-gray-900/50 px-8 py-4 rounded-2xl border border-amber-500/20">
            <img 
              src={logoUrl} 
              alt="Dafish Boyz" 
              className="w-12 h-12 object-contain rounded-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div className="text-left">
              <p className="text-amber-400 font-bold">Dafish Boyz FunShit Games</p>
              <p className="text-gray-500 text-sm">Making game nights unforgettable since 2020</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
