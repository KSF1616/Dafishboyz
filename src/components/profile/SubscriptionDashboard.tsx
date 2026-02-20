import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { 
  Subscription, 
  BillingHistoryItem, 
  SubscriptionPlan,
  formatPrice,
  formatBillingInterval,
  getStatusColor,
  getStatusLabel
} from '@/types/subscription';
import BillingHistory from './BillingHistory';
import PlanChangeModal from './PlanChangeModal';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Crown,
  Zap,
  Star,
  ArrowUpRight,
  Loader2,
  Sparkles,
  PartyPopper,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const SubscriptionDashboard: React.FC = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [plans, setPlans] = useState<Record<string, SubscriptionPlan>>({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [checkoutInProgress, setCheckoutInProgress] = useState(false);

  const fetchSubscription = async () => {
    if (!user?.email) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: {
          action: 'get-subscription',
          email: user.email,
          userId: user.id
        }
      });

      if (error) throw error;
      setSubscription(data.subscription);
      setPlans(data.plans || {});
      setError(null);
    } catch (err: any) {
      console.error('Error fetching subscription:', err);
      // Don't show error for initial load - just means no subscription yet
      if (err.message && !err.message.includes('not found')) {
        setError('Unable to load subscription data. Please try again.');
      }
    }
  };

  const fetchBillingHistory = async () => {
    if (!user?.email) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: {
          action: 'get-billing-history',
          email: user.email,
          userId: user.id,
          limit: 10
        }
      });

      if (error) throw error;
      setBillingHistory(data.history || []);
    } catch (err: any) {
      console.error('Error fetching billing history:', err);
      // Silent fail for billing history - not critical
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchSubscription(), fetchBillingHistory()]);
      setLoading(false);
    };
    
    if (user) {
      loadData();
    }
  }, [user]);

  // Check for subscription success from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const subscriptionStatus = params.get('subscription');
    
    if (subscriptionStatus === 'success' && sessionId) {
      confirmSubscription(sessionId);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (subscriptionStatus === 'canceled') {
      setError('Checkout was canceled. You can try again when you\'re ready.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const confirmSubscription = async (sessionId: string) => {
    if (!user?.email) return;
    
    setActionLoading('confirming');
    setSuccessMessage(null);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: {
          action: 'confirm-subscription',
          sessionId,
          email: user.email,
          userId: user.id
        }
      });

      if (error) throw error;
      
      // Show success message
      setSuccessMessage('🎉 Your subscription is now active! Welcome aboard!');
      
      // Refresh data
      await Promise.all([fetchSubscription(), fetchBillingHistory()]);
      
      // Auto-hide success message after 10 seconds
      setTimeout(() => setSuccessMessage(null), 10000);
    } catch (err: any) {
      console.error('Error confirming subscription:', err);
      setError('There was an issue confirming your subscription. If you were charged, please contact support.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user?.email) {
      setError('Please log in to subscribe.');
      return;
    }
    
    setActionLoading(planId);
    setCheckoutInProgress(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: {
          action: 'create-subscription',
          planId,
          email: user.email,
          userId: user.id,
          successUrl: `${window.location.origin}/profile?subscription=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/profile?subscription=canceled`
        }
      });

      if (error) throw error;
      
      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (err: any) {
      console.error('Error creating subscription:', err);
      setError('Unable to start checkout. Please try again or contact support.');
      setCheckoutInProgress(false);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async (immediate: boolean = false) => {
    if (!subscription) return;
    
    const confirmMessage = immediate 
      ? 'Are you sure you want to cancel immediately? You will lose access right away.'
      : 'Are you sure you want to cancel? You will retain access until the end of your billing period.';
    
    if (!confirm(confirmMessage)) return;
    
    setActionLoading('cancel');
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: {
          action: 'cancel-subscription',
          subscriptionId: subscription.id,
          immediate
        }
      });

      if (error) throw error;
      await fetchSubscription();
      setSuccessMessage(data.message || 'Subscription canceled successfully.');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Error canceling subscription:', err);
      setError('Unable to cancel subscription. Please try again or contact support.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivate = async () => {
    if (!subscription) return;
    
    setActionLoading('reactivate');
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: {
          action: 'reactivate-subscription',
          subscriptionId: subscription.id
        }
      });

      if (error) throw error;
      await fetchSubscription();
      setSuccessMessage(data.message || 'Subscription reactivated successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Error reactivating subscription:', err);
      setError('Unable to reactivate subscription. Please try again or contact support.');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePlanChange = async (newPlanId: string) => {
    if (!subscription || !user?.email) return;
    
    setActionLoading('change');
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('subscription-manager', {
        body: {
          action: 'change-plan',
          subscriptionId: subscription.id,
          newPlanId,
          email: user.email,
          userId: user.id
        }
      });

      if (error) throw error;
      await Promise.all([fetchSubscription(), fetchBillingHistory()]);
      setShowPlanModal(false);
      setSuccessMessage(data.message || 'Plan changed successfully!');
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      console.error('Error changing plan:', err);
      setError('Unable to change plan. Please try again or contact support.');
    } finally {
      setActionLoading(null);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading subscription data...</p>
        </div>
      </div>
    );
  }

  // Checkout in progress state
  if (checkoutInProgress && actionLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg max-w-md">
          <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <ExternalLink className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Redirecting to Checkout...
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            You'll be redirected to our secure payment page powered by Stripe.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Secure payment processing</span>
          </div>
        </div>
      </div>
    );
  }

  // Confirming subscription state
  if (actionLoading === 'confirming') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg max-w-md">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-green-600 dark:text-green-400 animate-spin" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Confirming Your Subscription...
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Please wait while we activate your subscription.
          </p>
        </div>
      </div>
    );
  }

  // Success message banner
  const SuccessBanner = successMessage && (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center flex-shrink-0">
          <PartyPopper className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-green-800 dark:text-green-300">{successMessage}</p>
        </div>
        <button 
          onClick={() => setSuccessMessage(null)}
          className="text-green-600 hover:text-green-700 dark:text-green-400"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // Error message banner
  const ErrorBanner = error && (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-red-800 dark:text-red-300">{error}</p>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            Need help? Contact us at support@dafishboyz.com
          </p>
        </div>
        <button 
          onClick={() => setError(null)}
          className="text-red-600 hover:text-red-700 dark:text-red-400"
        >
          <XCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // No subscription - show plans
  if (!subscription) {
    return (
      <div className="space-y-6">
        {SuccessBanner}
        {ErrorBanner}
        
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Unlock All Games</h3>
              <p className="text-purple-200">Subscribe to play all games online with friends</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Monthly Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-2 border-transparent hover:border-purple-500 transition-all">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Monthly Pass</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Billed monthly</p>
                </div>
                <Zap className="w-8 h-8 text-purple-500" />
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-black text-gray-900 dark:text-white">$9.99</span>
                <span className="text-gray-500 dark:text-gray-400">/month</span>
              </div>
              
              <ul className="space-y-3 mb-6">
                {['All 6 games', 'Unlimited plays', 'Priority support', 'New games first'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={() => handleSubscribe('monthly')}
                disabled={!!actionLoading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {actionLoading === 'monthly' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Starting Checkout...</>
                ) : (
                  <>Subscribe Monthly</>
                )}
              </Button>
            </div>
          </div>

          {/* Annual Plan */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden border-2 border-amber-500 relative">
            <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              SAVE 33%
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white">Annual Pass</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Billed yearly</p>
                </div>
                <Crown className="w-8 h-8 text-amber-500" />
              </div>
              
              <div className="mb-6">
                <span className="text-4xl font-black text-gray-900 dark:text-white">$79.99</span>
                <span className="text-gray-500 dark:text-gray-400">/year</span>
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                  That's just $6.67/month!
                </p>
              </div>
              
              <ul className="space-y-3 mb-6">
                {['All 6 games', 'Save 33%', 'Exclusive content', 'Physical game discount'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                onClick={() => handleSubscribe('annual')}
                disabled={!!actionLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
              >
                {actionLoading === 'annual' ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Starting Checkout...</>
                ) : (
                  <>Subscribe Annually</>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-green-500" />
            <span>Secure checkout</span>
          </div>
          <span>•</span>
          <span>Cancel anytime</span>
          <span>•</span>
          <span>Instant access</span>
        </div>
      </div>
    );
  }

  // Has subscription - show dashboard
  const currentPlan = plans[subscription.plan_id];
  const nextPaymentDate = subscription.current_period_end 
    ? new Date(subscription.current_period_end)
    : null;

  return (
    <div className="space-y-6">
      {SuccessBanner}
      {ErrorBanner}
      
      {/* Current Plan Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                {subscription.plan_id === 'annual' ? (
                  <Crown className="w-7 h-7 text-white" />
                ) : (
                  <Zap className="w-7 h-7 text-white" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{subscription.plan_name}</h3>
                <p className="text-purple-200">
                  {formatPrice(subscription.price_cents)}{formatBillingInterval(subscription.billing_interval)}
                </p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
              {getStatusLabel(subscription.status)}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Next Payment */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {subscription.cancel_at_period_end ? 'Access Until' : 'Next Payment'}
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {nextPaymentDate ? nextPaymentDate.toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  }) : 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Billing Amount */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Billing Amount</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {formatPrice(subscription.price_cents)}{formatBillingInterval(subscription.billing_interval)}
                </p>
              </div>
            </div>
            
            {/* Status */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                {subscription.cancel_at_period_end ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {subscription.cancel_at_period_end 
                    ? 'Cancels at period end' 
                    : subscription.status === 'active' 
                      ? 'Auto-renews' 
                      : getStatusLabel(subscription.status)
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Cancellation Warning */}
          {subscription.cancel_at_period_end && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-300">
                    Your subscription is set to cancel
                  </p>
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                    You'll retain access until {nextPaymentDate?.toLocaleDateString()}. 
                    Want to keep your subscription?
                  </p>
                  <Button
                    onClick={handleReactivate}
                    disabled={actionLoading === 'reactivate'}
                    variant="outline"
                    size="sm"
                    className="mt-3 border-amber-500 text-amber-700 hover:bg-amber-100 dark:border-amber-600 dark:text-amber-400 dark:hover:bg-amber-900/30"
                  >
                    {actionLoading === 'reactivate' ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Reactivating...</>
                    ) : (
                      <><RefreshCw className="w-4 h-4 mr-2" /> Reactivate Subscription</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            {!subscription.cancel_at_period_end && (
              <>
                <Button
                  onClick={() => setShowPlanModal(true)}
                  variant="outline"
                  className="flex-1 min-w-[140px]"
                >
                  <ArrowUpRight className="w-4 h-4 mr-2" />
                  {subscription.plan_id === 'monthly' ? 'Upgrade to Annual' : 'Change Plan'}
                </Button>
                <Button
                  onClick={() => handleCancelSubscription(false)}
                  disabled={actionLoading === 'cancel'}
                  variant="outline"
                  className="flex-1 min-w-[140px] border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  {actionLoading === 'cancel' ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Canceling...</>
                  ) : (
                    <><XCircle className="w-4 h-4 mr-2" /> Cancel Subscription</>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Included */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
        <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          What's Included
        </h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {(currentPlan?.features || ['All 6 games', 'Unlimited plays', 'Priority support', 'New games first']).map((feature, i) => (
            <div key={i} className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <BillingHistory history={billingHistory} />

      {/* Plan Change Modal */}
      {showPlanModal && (
        <PlanChangeModal
          currentPlanId={subscription.plan_id}
          plans={plans}
          onChangePlan={handlePlanChange}
          onClose={() => setShowPlanModal(false)}
          loading={actionLoading === 'change'}
        />
      )}
    </div>
  );
};

export default SubscriptionDashboard;
