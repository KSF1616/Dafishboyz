import React from 'react';
import { Link } from 'react-router-dom';
import { useLogo } from '@/contexts/LogoContext';

const Footer: React.FC = () => {
  const { logoUrl } = useLogo();
  
  return (
    <footer className="bg-black border-t border-amber-500/30">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img 
                src={logoUrl} 
                alt="Dafish Boyz Logo" 
                className="w-14 h-14 object-contain rounded-lg shadow-lg shadow-amber-500/20"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
              <div>
                <span className="text-xl font-black text-white block">Fun<span className="text-amber-400">Shit</span>Games</span>
                <span className="text-xs text-gray-500">by Dafish Boyz</span>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">Because we all have Shitty days. Premium Fun Shit games helps you release with pleasure.</p>
            {/* Show larger logo below text */}
            <div className="mt-4 p-4 bg-gray-900/50 rounded-xl border border-amber-500/20">
              <img 
                src={logoUrl} 
                alt="Dafish Boyz FunShit Games" 
                className="w-full max-w-[150px] h-auto object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-amber-400 mb-4">Games</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-lime-400 transition-colors">Up Shitz Creek</a></li>
              <li><a href="#" className="hover:text-lime-400 transition-colors">O Craps</a></li>
              <li><a href="#" className="hover:text-lime-400 transition-colors">Shito</a></li>
              <li><a href="#" className="hover:text-lime-400 transition-colors">Let That Shit Go</a></li>
              <li><a href="#" className="hover:text-lime-400 transition-colors">Drop A Deuce</a></li>

              <li><a href="#" className="hover:text-lime-400 transition-colors">Slanging Shit</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-amber-400 mb-4">Physical Game Tools</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>
                <Link to="/drop-deuce-rules" className="hover:text-lime-400 transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                  Drop A Deuce Rules & Music

                </Link>
              </li>
              <li>
                <Link to="/let-that-shit-go-rules" className="hover:text-lime-400 transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Let That Shit Go Rules
                </Link>
              </li>
              <li>
                <Link to="/shito-calling-cards" className="hover:text-lime-400 transition-colors flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                  Shito Calling Cards
                </Link>
              </li>
            </ul>
            <h4 className="font-bold text-amber-400 mb-4 mt-6">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-lime-400 transition-colors">How to Play</a></li>
              <li><a href="#" className="hover:text-lime-400 transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-lime-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-amber-400 mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><a href="#" className="hover:text-lime-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-lime-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-lime-400 transition-colors">Refund Policy</a></li>
              <li><a href="#" className="hover:text-lime-400 transition-colors">Shipping Info</a></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <img 
              src={logoUrl} 
              alt="Dafish Boyz" 
              className="w-8 h-8 object-contain rounded-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <p className="text-gray-500 text-sm">&copy; 2025 Dafish Boyz FunShitGames.com. All rights reserved.</p>
          </div>
          <div className="flex gap-4">
            {['facebook', 'twitter', 'instagram', 'youtube'].map(social => (
              <a 
                key={social} 
                href="#" 
                className="w-10 h-10 bg-gray-800 hover:bg-amber-500 rounded-full flex items-center justify-center text-gray-400 hover:text-black transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10s10-4.477 10-10c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
