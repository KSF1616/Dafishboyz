import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, Download, Package, ArrowRight, Gift, Sparkles, Volume2, VolumeX, Wrench, Clock, Calendar, ExternalLink, Mail, Loader2, PartyPopper, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MrDoody from '@/components/MrDoody';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface CartItem {
  game: {
    id: string;
    name: string;
    price: number;
    image?: string;
  };
  quantity: number;
  type: 'physical' | 'digital';
}

interface CheckoutSuccessProps {
  orderId: string;
  email: string;
  hasDigital: boolean;
  hasPhysical: boolean;
  onContinue: () => void;
  freeTrialDays?: number;
  freeTrialFeature?: string;
  cartItems?: CartItem[];
  subtotal?: number;
  shipping?: number;
  tax?: number;
  discount?: number;
  promoCode?: string;
  total?: number;
  shippingAddress?: any;
  billingAddress?: any;
}

export const CheckoutSuccess: React.FC<CheckoutSuccessProps> = ({
  orderId,
  email,
  hasDigital,
  hasPhysical,
  onContinue,
  freeTrialDays,
  freeTrialFeature,
  cartItems = [],
  subtotal = 0,
  shipping = 0,
  tax = 0,
  discount = 0,
  promoCode,
  total = 0,
  shippingAddress,
  billingAddress
}) => {
  const { user } = useAuth();
  const [mrDoodyAwarded, setMrDoodyAwarded] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationPhase, setCelebrationPhase] = useState<'initial' | 'reveal' | 'complete'>('initial');
  const [trialActivated, setTrialActivated] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState<Date | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [confettiParticles, setConfettiParticles] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number; rotation: number }>>([]);
  const mrDoodyAwardedRef = useRef(false);

  // Check if already owned and auto-award for physical purchases
  useEffect(() => {
    const checkAndAwardMrDoody = async () => {
      // Prevent double execution
      if (mrDoodyAwardedRef.current) return;
      
      // Check localStorage first
      const alreadyOwned = localStorage.getItem('mrDoodyOwned') === 'true';
      
      if (alreadyOwned) {
        setMrDoodyAwarded(true);
        return;
      }

      // If this is a physical purchase, automatically award Mr. Doody
      if (hasPhysical && !alreadyOwned) {
        mrDoodyAwardedRef.current = true;
        
        // Set localStorage immediately
        localStorage.setItem('mrDoodyOwned', 'true');
        localStorage.setItem('mrDoodyClaimedDate', new Date().toISOString());
        
        // Generate confetti particles
        const particles = Array.from({ length: 50 }, (_, i) => ({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][Math.floor(Math.random() * 8)],
          delay: Math.random() * 0.5,
          rotation: Math.random() * 360
        }));
        setConfettiParticles(particles);
        
        // Start celebration animation
        setShowCelebration(true);
        setCelebrationPhase('initial');
        
        // Phase 1: Initial sparkle (1 second)
        setTimeout(() => {
          setCelebrationPhase('reveal');
        }, 1000);
        
        // Phase 2: Reveal Mr. Doody (2 seconds later)
        setTimeout(() => {
          setCelebrationPhase('complete');
          setMrDoodyAwarded(true);
        }, 3000);
        
        // Award in database for cross-device persistence
        try {
          await supabase.functions.invoke('mr-doody-manager', {
            body: {
              action: 'award',
              email: email,
              user_id: user?.id || null,
              order_id: orderId,
              source: 'purchase',
              metadata: {
                purchase_type: 'physical_game',
                cart_items: cartItems.map(item => item.game.name)
              }
            }
          });
          console.log('Mr. Doody awarded and saved to database');
        } catch (err) {
          console.error('Error saving Mr. Doody to database:', err);
          // Still awarded locally, just not synced
        }
      }
    };

    checkAndAwardMrDoody();
  }, [hasPhysical, email, orderId, user?.id, cartItems]);

  // Send order confirmation email and activate free trial
  useEffect(() => {
    const sendOrderConfirmation = async () => {
      if (!email || !orderId || emailSent || emailSending) return;
      
      setEmailSending(true);
      setEmailError(null);
      
      try {
        // Prepare items for the email
        const items = cartItems.map(item => ({
          id: item.game.id,
          name: item.game.name,
          price: item.game.price,
          quantity: item.quantity,
          type: item.type,
          image: item.game.image
        }));

        // Call the order confirmation edge function
        const { data, error } = await supabase.functions.invoke('send-order-confirmation', {
          body: {
            orderId,
            email,
            items: items.length > 0 ? items : [{ id: 'unknown', name: 'Order Items', price: subtotal, quantity: 1, type: hasPhysical ? 'physical' : 'digital' }],
            subtotal,
            shipping,
            tax,
            discount,
            promoCode,
            total: total || subtotal + shipping + tax - discount,
            shippingAddress: hasPhysical ? shippingAddress : undefined,
            billingAddress,
            activateFreeTrial: true
          }
        });

        if (error) {
          console.error('Error sending order confirmation:', error);
          setEmailError('Failed to send confirmation email');
        } else {
          setEmailSent(true);
          if (data?.trialActivated && data?.trialEndDate) {
            setTrialActivated(true);
            setTrialEndDate(new Date(data.trialEndDate));
          }
          console.log('Order confirmation sent:', data);
        }
      } catch (err) {
        console.error('Error sending order confirmation:', err);
        setEmailError('Failed to send confirmation email');
      } finally {
        setEmailSending(false);
      }
    };

    sendOrderConfirmation();
  }, [email, orderId, cartItems, subtotal, shipping, tax, discount, promoCode, total, shippingAddress, billingAddress, hasPhysical, emailSent, emailSending]);

  // Legacy trial activation (fallback if promo code was used)
  useEffect(() => {
    const activateTrial = async () => {
      if (freeTrialDays && email && !trialActivated) {
        try {
          // Call the edge function to create/confirm the trial
          const { data, error } = await supabase.functions.invoke('free-trial-manager', {
            body: { 
              email, 
              order_id: orderId,
              promo_code: 'FREETOOLS30'
            },
          });

          if (!error && data) {
            setTrialActivated(true);
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + freeTrialDays);
            setTrialEndDate(endDate);
          }
        } catch (err) {
          console.error('Error activating trial:', err);
          // Still show the trial info even if activation fails
          setTrialActivated(true);
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + freeTrialDays);
          setTrialEndDate(endDate);
        }
      }
    };

    activateTrial();
  }, [freeTrialDays, email, orderId, trialActivated]);

  return (
    <div className="text-center py-12 relative">
      {/* Celebration Overlay for Mr. Doody Award */}
      {showCelebration && hasPhysical && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          {/* Confetti */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {confettiParticles.map((particle) => (
              <div
                key={particle.id}
                className="absolute animate-confetti-fall"
                style={{
                  left: `${particle.x}%`,
                  top: '-5%',
                  animationDelay: `${particle.delay}s`,
                  transform: `rotate(${particle.rotation}deg)`
                }}
              >
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: particle.color }}
                />
              </div>
            ))}
          </div>

          <div className="relative z-10 max-w-md mx-4">
            {/* Sparkle ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              {[...Array(12)].map((_, i) => (
                <Sparkles
                  key={i}
                  className="absolute text-yellow-400 animate-ping"
                  style={{
                    transform: `rotate(${i * 30}deg) translateY(-120px)`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1.5s'
                  }}
                  size={24}
                />
              ))}
            </div>

            {/* Main celebration card */}
            <div className={`bg-gradient-to-br from-amber-400 via-yellow-400 to-amber-500 rounded-3xl p-8 shadow-2xl transform transition-all duration-1000 ${
              celebrationPhase === 'initial' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
            }`}>
              {/* Stars decoration */}
              <div className="absolute -top-4 -left-4">
                <Star className="w-8 h-8 text-yellow-300 fill-yellow-300 animate-pulse" />
              </div>
              <div className="absolute -top-4 -right-4">
                <Star className="w-8 h-8 text-yellow-300 fill-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
                <Star className="w-6 h-6 text-yellow-300 fill-yellow-300 animate-pulse" style={{ animationDelay: '0.25s' }} />
              </div>

              {/* Header */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <PartyPopper className="w-8 h-8 text-amber-800 animate-bounce" />
                <h2 className="text-2xl font-bold text-amber-900">SURPRISE GIFT!</h2>
                <PartyPopper className="w-8 h-8 text-amber-800 animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>

              {/* Mr. Doody reveal */}
              <div className={`relative transition-all duration-700 ${
                celebrationPhase === 'reveal' || celebrationPhase === 'complete' ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
              }`}>
                <div className="relative mx-auto w-fit">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 rounded-full blur-2xl opacity-60 animate-pulse" />
                  
                  <MrDoody 
                    size="xl" 
                    animated={true} 
                    interactive={false}
                    mood="excited"
                    isDancing={celebrationPhase === 'complete'}
                    enableSounds={false}
                  />
                </div>

                <h3 className="text-xl font-bold text-amber-900 mt-4">
                  Meet Mr. Doody!
                </h3>
                <p className="text-amber-800 text-sm mt-1">
                  Your new pocket hug buddy
                </p>
              </div>

              {/* Message */}
              <div className={`mt-4 bg-white/40 rounded-xl p-4 transition-all duration-500 ${
                celebrationPhase === 'complete' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}>
                <p className="text-amber-900 text-sm italic">
                  "I'm Mr. Doody, a gift from Dafish Boyz. Keep lil dude around to ward off bad vibes and crappy people. <span className="font-bold">Let that shit go!</span>"
                </p>
              </div>

              {/* Features unlocked */}
              {celebrationPhase === 'complete' && (
                <div className="mt-4 animate-fadeIn">
                  <p className="text-xs text-amber-800 mb-2">Features Unlocked:</p>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {['5 Moods', 'Dance Mode', 'Sound Effects', 'Mini Game', 'Hug Tracking'].map((feature) => (
                      <span key={feature} className="px-2 py-0.5 bg-white/50 rounded text-amber-900 text-xs font-medium">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Continue button */}
              {celebrationPhase === 'complete' && (
                <Button 
                  onClick={() => setShowCelebration(false)}
                  className="mt-6 bg-amber-800 hover:bg-amber-900 text-white font-bold px-8 animate-bounce"
                >
                  <Heart className="w-4 h-4 mr-2 fill-red-400 text-red-400" />
                  Awesome! Continue
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12 text-green-500" />
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h2>
      <p className="text-gray-400 mb-6">Order #{orderId.slice(0, 8).toUpperCase()}</p>
      
      {/* Email Status Indicator */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {emailSending ? (
          <div className="flex items-center gap-2 text-amber-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Sending confirmation email...</span>
          </div>
        ) : emailSent ? (
          <div className="flex items-center gap-2 text-green-400">
            <Mail className="w-4 h-4" />
            <span className="text-sm">Confirmation email sent!</span>
          </div>
        ) : emailError ? (
          <div className="flex items-center gap-2 text-red-400">
            <Mail className="w-4 h-4" />
            <span className="text-sm">{emailError}</span>
          </div>
        ) : null}
      </div>
      
      <p className="text-gray-300 mb-8">
        A confirmation email has been sent to <span className="text-amber-400">{email}</span>
      </p>

      {/* 30-Day Free Trial Banner (Always show for purchases) */}
      {trialActivated && !freeTrialDays && (
        <div className="max-w-md mx-auto mb-6 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl p-4 border border-emerald-500/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/30 rounded-lg flex items-center justify-center">
              <Gift className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="text-left">
              <p className="text-emerald-400 font-semibold">30-Day Free Trial Activated!</p>
              <p className="text-sm text-emerald-300/80">
                Enjoy free access to all digital game tools until {trialEndDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto space-y-4 mb-8">

        {hasDigital && (
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <Download className="w-6 h-6 text-amber-400" />
            </div>
            <div className="text-left">
              <p className="text-white font-medium">Digital Games Ready</p>
              <p className="text-sm text-gray-400">Access your games instantly in your account</p>
            </div>
          </div>
        )}
        
        {hasPhysical && (
          <>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Physical Games Shipping</p>
                <p className="text-sm text-gray-400">Estimated delivery: 5-7 business days</p>
              </div>
            </div>
            
            {/* Free Trial Bonus for FREETOOLS30 code */}
            {freeTrialDays && freeTrialFeature && (
              <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl p-5 border-2 border-emerald-500/50 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />
                
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Wrench className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-emerald-400 font-bold text-lg">Free Trial Activated!</p>
                        <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold">
                          BONUS
                        </span>
                      </div>
                      <p className="text-emerald-300/80 text-sm">
                        {freeTrialDays} days of premium {freeTrialFeature}
                      </p>
                    </div>
                  </div>
                  
                  {/* Trial details */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                      <Clock className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">Duration</p>
                      <p className="text-white font-semibold">{freeTrialDays} Days</p>
                    </div>
                    <div className="bg-gray-900/50 rounded-lg p-3 text-center">
                      <Calendar className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-400">Expires</p>
                      <p className="text-white font-semibold">
                        {trialEndDate 
                          ? trialEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                          : new Date(Date.now() + freeTrialDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* Features included */}
                  <div className="bg-gray-900/30 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-400 mb-2">Features Included:</p>
                    <div className="flex flex-wrap gap-1">
                      {['Digital Scorekeeping', 'Dice Roller', 'Card Deck', 'Timer', 'Stats'].map((feature) => (
                        <span key={feature} className="px-2 py-0.5 bg-emerald-500/20 rounded text-emerald-300 text-xs">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* CTA to view trial */}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="w-full border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                    onClick={() => window.location.href = '/profile?tab=tools'}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Trial Status in Profile
                  </Button>
                </div>
              </div>
            )}
            
            {/* Mr. Doody Awarded Banner (shown after celebration) */}
            {mrDoodyAwarded && !showCelebration && (
              <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 rounded-xl p-4 border-2 border-green-500/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-green-400 font-medium flex items-center gap-2">
                      Mr. Doody Unlocked!
                      <span className="text-xs bg-green-500/30 px-2 py-0.5 rounded-full">BONUS GIFT</span>
                    </p>
                    <p className="text-sm text-green-300/80">
                      Visit your profile to interact with Mr. Doody!
                    </p>
                  </div>
                  <MrDoody 
                    size="sm" 
                    animated={true} 
                    interactive={false}
                    mood="love"
                    enableSounds={false}
                  />
                </div>
              </div>
            )}

            {/* Features preview */}
            {mrDoodyAwarded && !showCelebration && (
              <div className="bg-gray-800/30 rounded-xl p-3 border border-gray-700/50">
                <p className="text-xs text-gray-400 mb-2">Mr. Doody Features Unlocked:</p>
                <div className="flex flex-wrap gap-1 justify-center">
                  {['5 Moods', 'Dance Mode', 'Sound Effects', 'Mini Game', 'Hug Tracking'].map((feature) => (
                    <span key={feature} className="px-2 py-0.5 bg-amber-500/20 rounded text-amber-300 text-xs">
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>


      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onContinue} className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
          Continue Shopping <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        {mrDoodyAwarded && (
          <Button 
            variant="outline" 
            className="border-amber-500 text-amber-400 hover:bg-amber-500/10"
            onClick={() => window.location.href = '/profile'}
          >
            <Gift className="w-4 h-4 mr-2" />
            Visit Mr. Doody
          </Button>
        )}
        {freeTrialDays && (
          <Button 
            variant="outline" 
            className="border-emerald-500 text-emerald-400 hover:bg-emerald-500/10"
            onClick={() => window.location.href = '/profile?tab=tools'}
          >
            <Wrench className="w-4 h-4 mr-2" />
            Access Game Tools
          </Button>
        )}
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti-fall {
          animation: confetti-fall 3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
