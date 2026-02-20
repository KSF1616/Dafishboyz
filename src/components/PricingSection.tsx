import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pricingPlans } from '@/data/gamesData';
import PricingCard from './PricingCard';
import { PricingPlan } from '@/types/game';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Tag, LogIn } from 'lucide-react';
import { useLogo } from '@/contexts/LogoContext';
import { Button } from '@/components/ui/button';

const PricingSection: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { logoUrl } = useLogo();

  const handleSelectPlan = async (plan: PricingPlan) => {
    // Require login for all subscriptions
    if (!user) {
      navigate('/login?redirect=/profile&tab=subscription');
      return;
    }




    setLoading(plan.id);
    try {
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: {
          action: 'create-subscription',
          planId: plan.id,
          email: user.email,
          userId: user.id,
          successUrl: `${window.location.origin}/profile?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/profile?subscription=canceled`
        }

      });

      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      alert('Failed to start checkout: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(null);
    }
  };

  return (
    <section id="pricing" className="py-20 bg-gray-900 relative">
      {/* Promotional Ribbon */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 via-lime-500 to-amber-500 py-3 px-4 text-center transform -rotate-0 shadow-lg">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <Tag className="w-5 h-5 text-black animate-bounce" />
            <span className="text-black font-bold text-sm md:text-base">
              Get 10% off all physical games when mentioning you're a Shitty Game Player (SGP)!
            </span>
            <Tag className="w-5 h-5 text-black animate-bounce" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pt-12">
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
          <span className="inline-block bg-lime-500/20 text-lime-400 px-4 py-2 rounded-full text-sm font-bold mb-4">
            PLAY ONLINE
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-lime-400">Subscription</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Play all our games online with friends from anywhere. One-time access or unlimited monthly play!
          </p>
          
          {/* Login prompt for non-authenticated users */}
          {!user && (
            <div className="mt-6 inline-flex items-center gap-3 bg-gray-800/50 border border-gray-700 rounded-xl px-6 py-3">
              <LogIn className="w-5 h-5 text-purple-400" />
              <span className="text-gray-300">
                <button 
                  onClick={() => navigate('/login')}
                  className="text-purple-400 hover:text-purple-300 font-semibold underline underline-offset-2"
                >
                  Sign in
                </button>
                {' '}to subscribe and manage your plan
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {pricingPlans.map(plan => (
            <PricingCard 
              key={plan.id} 
              plan={plan} 
              onSelect={handleSelectPlan}
              loading={loading === plan.id}
            />
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
            <img 
              src={logoUrl} 
              alt="Dafish Boyz" 
              className="w-4 h-4 object-contain opacity-50"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <span>All plans include instant access. Cancel anytime. No hidden fees.</span>
          </div>
          
          {/* Link to subscription management */}
          {user && (
            <div className="mt-4">
              <Button
                variant="link"
                onClick={() => navigate('/profile?tab=subscription')}
                className="text-purple-400 hover:text-purple-300"
              >
                Manage your subscription in your profile
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
