import React, { useState, useRef } from 'react';
import { Game } from '@/types/game';
import { Share2, X } from 'lucide-react';
import Header from './Header';
import HeroSection from './HeroSection';
import FeaturesSection from './FeaturesSection';
import GamesSection from './GamesSection';
import BundleSection from './BundleSection';
import HowToPlaySection from './HowToPlaySection';
import PricingSection from './PricingSection';
import ReviewsSection from './ReviewsSection';
import AboutSection from './AboutSection';
import FAQSection from './FAQSection';
import NewsletterSection from './NewsletterSection';
import Footer from './Footer';
import CartModal from './CartModal';
import GameDetailModal from './GameDetailModal';
import FloatingLogo from './FloatingLogo';
import { useLogo } from '@/contexts/LogoContext';
import { useMarketingAssets } from '@/hooks/useMarketingAssets';
import { Button } from '@/components/ui/button';

const AppLayout: React.FC = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameModalOpen, setGameModalOpen] = useState(false);
  const [flyerOpen, setFlyerOpen] = useState(false);
  const { flyerUrl } = useMarketingAssets();
  const { logoUrl } = useLogo();

  const gamesRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (section: string) => {
    const refs: Record<string, React.RefObject<HTMLDivElement>> = {
      games: gamesRef, pricing: pricingRef, reviews: reviewsRef, about: aboutRef
    };
    refs[section]?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleViewDetails = (game: Game) => {
    setSelectedGame(game);
    setGameModalOpen(true);
  };

  const shareFlyer = async () => {
    if (!flyerUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'DaFish Boyz Games', text: 'Check out these awesome party games!', url: flyerUrl });
      } catch (e) { navigator.clipboard.writeText(flyerUrl); }
    } else {
      navigator.clipboard.writeText(flyerUrl);
      alert('Flyer link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative">
      <FloatingLogo />
      {/* Background watermark using dynamic logo from LogoContext */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-[0.03]"
          style={{ backgroundImage: `url(${logoUrl})` }}
        />
      </div>



      <div className="relative z-10">
        <Header onCartClick={() => setCartOpen(true)} onNavClick={scrollToSection} />
        <HeroSection onShopClick={() => scrollToSection('games')} onPricingClick={() => scrollToSection('pricing')} />
        <FeaturesSection />
        <div ref={gamesRef}><GamesSection onViewDetails={handleViewDetails} /></div>
        <BundleSection />
        <HowToPlaySection />
        <div ref={pricingRef}><PricingSection /></div>
        <div ref={reviewsRef}><ReviewsSection /></div>
        <div ref={aboutRef}><AboutSection /></div>
        <FAQSection />
        <NewsletterSection />
        <Footer />
      </div>
      
      {flyerUrl && (
        <button
          onClick={() => setFlyerOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform"
          title="Share with friends"
        >
          <Share2 className="w-6 h-6" />
        </button>
      )}

      {flyerOpen && flyerUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setFlyerOpen(false)}>
          <div className="relative max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setFlyerOpen(false)} className="absolute -top-12 right-0 text-white hover:text-gray-300">
              <X className="w-8 h-8" />
            </button>
            <img src={flyerUrl} alt="Game Flyer" className="w-full rounded-lg shadow-2xl" />
            <div className="mt-4 flex gap-3 justify-center">
              <Button onClick={shareFlyer} className="bg-gradient-to-r from-purple-600 to-pink-600">
                <Share2 className="w-4 h-4 mr-2" /> Share Flyer
              </Button>
              <Button variant="outline" onClick={() => window.open(flyerUrl, '_blank')} className="border-white text-white hover:bg-white/10">
                Download
              </Button>
            </div>
          </div>
        </div>
      )}

      <CartModal isOpen={cartOpen} onClose={() => setCartOpen(false)} />
      <GameDetailModal game={selectedGame} isOpen={gameModalOpen} onClose={() => setGameModalOpen(false)} />
    </div>
  );
};

export default AppLayout;
