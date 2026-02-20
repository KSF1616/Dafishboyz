import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, CheckCircle, XCircle, Sparkles, Gift, Timer, AlertTriangle, Zap, Crown, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface TrialData {
  id: string;
  email: string;
  promo_code: string;
  trial_start_date: string;
  trial_end_date: string;
  is_active: boolean;
  daysRemaining: number;
  isExpired: boolean;
  isActive: boolean;
}

interface TrialStatusResponse {
  hasTrial: boolean;
  trial: TrialData | null;
}

const FreeTrialStatus: React.FC = () => {
  const { user } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrialStatus = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke('free-trial-manager', {
          body: { email: user.email, user_id: user.id },
        });

        if (fnError) throw fnError;
        setTrialStatus(data);
      } catch (err: any) {
        console.error('Error fetching trial status:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrialStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-2"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return null; // Silently fail if there's an error
  }

  if (!trialStatus?.hasTrial) {
    return null; // Don't show anything if no trial
  }

  const trial = trialStatus.trial!;
  const startDate = new Date(trial.trial_start_date);
  const endDate = new Date(trial.trial_end_date);
  const totalDays = 30;
  const daysUsed = totalDays - trial.daysRemaining;
  const progressPercentage = (daysUsed / totalDays) * 100;

  // Determine urgency level for styling
  const getUrgencyStyles = () => {
    if (trial.isExpired) {
      return {
        gradient: 'from-gray-500 to-gray-600',
        progressColor: 'bg-gray-500',
        icon: XCircle,
        iconColor: 'text-gray-500',
        badgeBg: 'bg-gray-100 dark:bg-gray-700',
        badgeText: 'text-gray-600 dark:text-gray-300',
      };
    }
    if (trial.daysRemaining <= 3) {
      return {
        gradient: 'from-red-500 to-orange-500',
        progressColor: 'bg-red-500',
        icon: AlertTriangle,
        iconColor: 'text-red-500',
        badgeBg: 'bg-red-100 dark:bg-red-900/30',
        badgeText: 'text-red-600 dark:text-red-400',
      };
    }
    if (trial.daysRemaining <= 7) {
      return {
        gradient: 'from-amber-500 to-orange-500',
        progressColor: 'bg-amber-500',
        icon: Timer,
        iconColor: 'text-amber-500',
        badgeBg: 'bg-amber-100 dark:bg-amber-900/30',
        badgeText: 'text-amber-600 dark:text-amber-400',
      };
    }
    return {
      gradient: 'from-emerald-500 to-teal-500',
      progressColor: 'bg-emerald-500',
      icon: CheckCircle,
      iconColor: 'text-emerald-500',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-900/30',
      badgeText: 'text-emerald-600 dark:text-emerald-400',
    };
  };

  const styles = getUrgencyStyles();
  const StatusIcon = styles.icon;

  const features = [
    { name: 'Digital Scorekeeping', icon: Star, description: 'Track scores for all games' },
    { name: 'Interactive Dice Roller', icon: Zap, description: 'Perfect for O Craps' },
    { name: 'Digital Card Deck', icon: Crown, description: 'Virtual cards for all games' },
    { name: 'Game Timer', icon: Timer, description: 'Keep games moving' },
    { name: 'Statistics Tracking', icon: Sparkles, description: 'See your game history' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${styles.gradient} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Digital Game Tools</h3>
              <p className="text-white/80 text-sm">
                {trial.isExpired ? 'Trial Expired' : 'Free Trial Active'}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full ${styles.badgeBg}`}>
            <span className={`text-sm font-semibold ${styles.badgeText}`}>
              {trial.promo_code}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Status Banner */}
        <div className={`flex items-center gap-3 p-4 rounded-xl mb-6 ${styles.badgeBg}`}>
          <StatusIcon className={`w-8 h-8 ${styles.iconColor}`} />
          <div className="flex-1">
            {trial.isExpired ? (
              <>
                <h4 className="font-bold text-gray-900 dark:text-white">Trial Expired</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your free trial ended on {endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </>
            ) : (
              <>
                <h4 className="font-bold text-gray-900 dark:text-white">
                  {trial.daysRemaining} Day{trial.daysRemaining !== 1 ? 's' : ''} Remaining
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {trial.daysRemaining <= 3 
                    ? 'Your trial is ending soon! Upgrade now to keep access.'
                    : trial.daysRemaining <= 7
                    ? 'Less than a week left. Consider upgrading!'
                    : 'Enjoy your premium features!'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Countdown Timer */}
        {!trial.isExpired && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Trial Progress</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {daysUsed} of {totalDays} days used
              </span>
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full ${styles.progressColor} rounded-full transition-all duration-500`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Trial Dates */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
            <Clock className="w-5 h-5 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Started</p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 text-center">
            <Timer className="w-5 h-5 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {trial.isExpired ? 'Ended' : 'Expires'}
            </p>
            <p className="font-semibold text-gray-900 dark:text-white">
              {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Features List */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            {trial.isExpired ? 'Features You Had Access To' : 'Features Included'}
          </h4>
          <div className="space-y-2">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <div 
                  key={index}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    trial.isExpired 
                      ? 'bg-gray-100 dark:bg-gray-700/30 opacity-60' 
                      : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    trial.isExpired 
                      ? 'bg-gray-200 dark:bg-gray-600' 
                      : 'bg-purple-100 dark:bg-purple-900/50'
                  }`}>
                    <FeatureIcon className={`w-4 h-4 ${
                      trial.isExpired 
                        ? 'text-gray-400' 
                        : 'text-purple-600 dark:text-purple-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${
                      trial.isExpired 
                        ? 'text-gray-500 dark:text-gray-400' 
                        : 'text-gray-900 dark:text-white'
                    }`}>
                      {feature.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {feature.description}
                    </p>
                  </div>
                  {!trial.isExpired && (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        {trial.isExpired ? (
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-center">
            <h4 className="text-white font-bold mb-1">Miss Your Tools?</h4>
            <p className="text-white/80 text-sm mb-3">
              Use code <span className="font-bold">COMEBACK25</span> for 25% off!
            </p>
            <Button 
              className="bg-white text-purple-600 hover:bg-gray-100"
              onClick={() => window.location.href = '/#pricing'}
            >
              Reactivate Now
            </Button>
          </div>
        ) : trial.daysRemaining <= 7 ? (
          <div className={`bg-gradient-to-r ${styles.gradient} rounded-xl p-4 text-center`}>
            <h4 className="text-white font-bold mb-1">
              {trial.daysRemaining <= 3 ? 'Last Chance!' : 'Upgrade Before It Ends'}
            </h4>
            <p className="text-white/80 text-sm mb-3">
              Keep all your premium features with a subscription
            </p>
            <Button 
              className="bg-white text-gray-900 hover:bg-gray-100"
              onClick={() => window.location.href = '/#pricing'}
            >
              View Plans
            </Button>
          </div>
        ) : (
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            <p>Enjoying your trial? You can upgrade anytime to keep access forever.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FreeTrialStatus;
