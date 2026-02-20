import React from 'react';
import { SubscriptionPlan, formatPrice, formatBillingInterval } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { X, Crown, Zap, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';

interface PlanChangeModalProps {
  currentPlanId: string;
  plans: Record<string, SubscriptionPlan>;
  onChangePlan: (planId: string) => void;
  onClose: () => void;
  loading: boolean;
}

const PlanChangeModal: React.FC<PlanChangeModalProps> = ({
  currentPlanId,
  plans,
  onChangePlan,
  onClose,
  loading
}) => {
  const currentPlan = plans[currentPlanId];
  const isMonthly = currentPlanId === 'monthly';
  const targetPlanId = isMonthly ? 'annual' : 'monthly';
  const targetPlan = plans[targetPlanId];

  const calculateSavings = () => {
    if (!plans.monthly || !plans.annual) return 0;
    const monthlyYearlyCost = plans.monthly.price_cents * 12;
    const annualCost = plans.annual.price_cents;
    return monthlyYearlyCost - annualCost;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-white">
            {isMonthly ? 'Upgrade to Annual' : 'Change Your Plan'}
          </h2>
          <p className="text-purple-200 mt-1">
            {isMonthly 
              ? 'Save 33% with an annual subscription!' 
              : 'Switch to a different billing cycle'}
          </p>
        </div>

        <div className="p-6">
          {/* Current Plan */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Current Plan</p>
            <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                {currentPlanId === 'annual' ? (
                  <Crown className="w-5 h-5 text-amber-500" />
                ) : (
                  <Zap className="w-5 h-5 text-purple-500" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white">
                  {currentPlan?.name || 'Monthly Pass'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {formatPrice(currentPlan?.price_cents || 999)}{formatBillingInterval(currentPlan?.interval || 'month')}
                </p>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center mb-6">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <ArrowRight className="w-5 h-5 text-purple-600 dark:text-purple-400 rotate-90" />
            </div>
          </div>

          {/* Target Plan */}
          <div className="mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              {isMonthly ? 'Upgrade to' : 'Switch to'}
            </p>
            <div className={`p-4 rounded-xl border-2 ${
              isMonthly 
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' 
                : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isMonthly 
                    ? 'bg-amber-100 dark:bg-amber-900/50' 
                    : 'bg-purple-100 dark:bg-purple-900/50'
                }`}>
                  {targetPlanId === 'annual' ? (
                    <Crown className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Zap className="w-5 h-5 text-purple-500" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {targetPlan?.name || (isMonthly ? 'Annual Pass' : 'Monthly Pass')}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {formatPrice(targetPlan?.price_cents || (isMonthly ? 7999 : 999))}
                    {formatBillingInterval(targetPlan?.interval || (isMonthly ? 'year' : 'month'))}
                  </p>
                </div>
                {isMonthly && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    SAVE 33%
                  </span>
                )}
              </div>

              {/* Features */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <ul className="space-y-2">
                  {(targetPlan?.features || (isMonthly 
                    ? ['All 6 games', 'Save 33%', 'Exclusive content', 'Physical game discount']
                    : ['All 6 games', 'Unlimited plays', 'Priority support', 'New games first']
                  )).map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Savings Info */}
          {isMonthly && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
              <p className="text-green-800 dark:text-green-300 text-sm">
                <span className="font-bold">You'll save {formatPrice(calculateSavings())}</span> per year by switching to the annual plan!
              </p>
            </div>
          )}

          {/* Proration Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
            <p className="text-blue-800 dark:text-blue-300 text-sm">
              {isMonthly 
                ? "You'll be charged the prorated difference for the remaining time in your current billing period."
                : "You'll receive a prorated credit for the remaining time on your annual plan."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={() => onChangePlan(targetPlanId)}
              disabled={loading}
              className={`flex-1 ${
                isMonthly 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <>{isMonthly ? 'Upgrade Now' : 'Switch Plan'}</>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanChangeModal;
