import React, { useState } from 'react';
import MrDoody, { MrDoodyMood } from './MrDoody';
import { Gift, Heart, X, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MrDoodyGiftCardProps {
  onClose?: () => void;
  showCloseButton?: boolean;
  variant?: 'modal' | 'inline' | 'compact';
  onClaim?: () => void;
  claimed?: boolean;
}

const MrDoodyGiftCard: React.FC<MrDoodyGiftCardProps> = ({
  onClose,
  showCloseButton = true,
  variant = 'modal',
  onClaim,
  claimed = false
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isClaimed, setIsClaimed] = useState(claimed);
  const [mood, setMood] = useState<MrDoodyMood>('happy');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleClaim = () => {
    setIsClaimed(true);
    setShowCelebration(true);
    setMood('excited');
    
    // Save to localStorage
    localStorage.setItem('mrDoodyOwned', 'true');
    localStorage.setItem('mrDoodyClaimedDate', new Date().toISOString());
    
    setTimeout(() => {
      setShowCelebration(false);
      setMood('love');
    }, 3000);
    
    onClaim?.();
  };

  if (variant === 'compact') {
    return (
      <div className="bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl p-4 border-2 border-amber-400 shadow-lg">
        <div className="flex items-center gap-4">
          <MrDoody size="sm" animated={true} interactive={true} mood={mood} enableSounds={soundEnabled} />
          <div className="flex-1">
            <h4 className="font-bold text-amber-900 flex items-center gap-2">
              <Gift className="w-4 h-4" /> Mr. Doody
            </h4>
            <p className="text-xs text-amber-800 mt-1">Your pocket hug buddy!</p>
          </div>
        </div>
      </div>
    );
  }

  const cardContent = (
    <div 
      className={`relative ${variant === 'modal' ? 'max-w-md mx-auto' : 'w-full'}`}
      style={{ perspective: '1000px' }}
    >
      {/* Celebration overlay */}
      {showCelebration && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="text-6xl animate-bounce">🎉</div>
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute text-2xl animate-ping"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: '1s'
              }}
            >
              {['⭐', '✨', '💫', '🌟'][Math.floor(Math.random() * 4)]}
            </div>
          ))}
        </div>
      )}

      <div 
        className={`relative transition-transform duration-700 ${isFlipped ? '' : ''}`}
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front of Card */}
        <div 
          className={`bg-gradient-to-br from-amber-50 via-amber-100 to-yellow-100 rounded-2xl shadow-2xl overflow-hidden border-4 border-amber-400 ${isFlipped ? 'invisible' : ''}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Sound toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="absolute top-3 left-3 z-10 p-1.5 rounded-full bg-white/80 hover:bg-white transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-gray-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showCloseButton && onClose && (
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 z-10 p-1 rounded-full bg-white/80 hover:bg-white transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          )}
          
          {/* Decorative Header */}
          <div className="bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500 py-3 px-4 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              {[...Array(20)].map((_, i) => (
                <Sparkles 
                  key={i} 
                  className="absolute text-white animate-pulse" 
                  style={{ 
                    left: `${Math.random() * 100}%`, 
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`,
                    width: '12px',
                    height: '12px'
                  }} 
                />
              ))}
            </div>
            <h3 className="text-center text-white font-bold text-xl tracking-wide relative z-10">
              SPECIAL GIFT
            </h3>
          </div>
          
          {/* Main Content */}
          <div className="p-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="relative">
                <div className={`absolute -inset-4 bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 rounded-full blur-xl opacity-50 ${showCelebration ? 'animate-spin' : 'animate-pulse'}`} style={{ animationDuration: '3s' }} />
                <MrDoody 
                  size="lg" 
                  animated={true} 
                  interactive={true} 
                  mood={mood}
                  enableSounds={soundEnabled}
                  isDancing={showCelebration}
                />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-amber-900 mb-2">
              Meet Mr. Doody!
            </h2>
            
            <p className="text-amber-800 text-sm mb-4">
              Your new pocket hug buddy
            </p>
            
            <div className="bg-white/60 rounded-xl p-4 mb-4 border border-amber-300">
              <p className="text-amber-900 italic leading-relaxed">
                "I'm <span className="font-bold">Mr. Doody</span>, a gift from <span className="font-bold text-amber-700">Dafish Boyz</span>. 
                Keep lil dude around to ward off bad vibes and crappy people. 
                <span className="font-bold"> Let that shit go!</span>"
              </p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-amber-700 text-sm mb-4">
              <Heart className="w-4 h-4 fill-red-400 text-red-400" />
              <span>Click Mr. Doody for a hug!</span>
              <Heart className="w-4 h-4 fill-red-400 text-red-400" />
            </div>

            {/* Mood selector */}
            <div className="flex justify-center gap-1 mb-4">
              {(['happy', 'excited', 'sleepy', 'love', 'surprised'] as MrDoodyMood[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`px-2 py-1 rounded-full text-xs transition-all ${
                    mood === m 
                      ? 'bg-amber-500 text-white' 
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            
            <div className="flex gap-3 justify-center">
              <Button 
                onClick={() => setIsFlipped(true)}
                variant="outline"
                className="border-amber-400 text-amber-700 hover:bg-amber-100"
              >
                Flip Card
              </Button>
              
              {!isClaimed ? (
                <Button 
                  onClick={handleClaim}
                  className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Claim Mr. Doody
                </Button>
              ) : (
                <Button 
                  disabled
                  className="bg-green-500 text-white font-bold"
                >
                  Claimed!
                </Button>
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="bg-gradient-to-r from-amber-200 to-yellow-200 py-2 px-4 text-center">
            <p className="text-amber-800 text-xs font-medium">
              A Dafish Boyz Original • Pocket Hug Collection
            </p>
          </div>
        </div>
        
        {/* Back of Card */}
        <div 
          className={`absolute inset-0 bg-gradient-to-br from-amber-600 via-amber-700 to-yellow-700 rounded-2xl shadow-2xl overflow-hidden border-4 border-amber-400 ${!isFlipped ? 'invisible' : ''}`}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className="h-full flex flex-col items-center justify-center p-6 text-center">
            <div className="mb-6">
              <div className="w-24 h-24 rounded-full bg-amber-500/30 flex items-center justify-center mb-4 mx-auto">
                <MrDoody size="sm" animated={true} interactive={false} mood="happy" enableSounds={false} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Dafish Boyz</h3>
              <p className="text-amber-200 text-sm">Game Creators & Vibe Protectors</p>
            </div>
            
            <div className="bg-white/10 rounded-xl p-4 mb-6 max-w-xs">
              <p className="text-amber-100 text-sm leading-relaxed">
                Mr. Doody is more than just a character - he's a reminder that sometimes 
                you just gotta let that shit go and keep moving forward!
              </p>
            </div>
            
            <div className="space-y-2 text-amber-200 text-xs">
              <p>Ward off bad vibes</p>
              <p>Protect against crappy people</p>
              <p>Always there for a pocket hug</p>
            </div>
            
            <div className="mt-4 bg-white/10 rounded-lg p-3">
              <p className="text-amber-100 text-xs font-medium">Mr. Doody Features:</p>
              <div className="flex flex-wrap gap-1 mt-2 justify-center">
                {['5 Moods', 'Dance Mode', 'Sound Effects', 'Mini Game', 'Hug Tracking'].map((feature) => (
                  <span key={feature} className="px-2 py-0.5 bg-amber-500/30 rounded text-amber-100 text-xs">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
            
            <Button 
              onClick={() => setIsFlipped(false)}
              variant="outline"
              className="mt-6 border-amber-300 text-amber-100 hover:bg-amber-600"
            >
              Flip Back
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="animate-in zoom-in-95 duration-300">
          {cardContent}
        </div>
      </div>
    );
  }

  return cardContent;
};

export default MrDoodyGiftCard;
