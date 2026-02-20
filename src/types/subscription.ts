export interface SubscriptionPlan {
  id: string;
  name: string;
  price_cents: number;
  interval: 'month' | 'year';
  features: string[];
}

export interface Subscription {
  id: string;
  user_id: string | null;
  email: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_id: string;
  plan_name: string;
  status: SubscriptionStatus;
  price_cents: number;
  billing_interval: string;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SubscriptionStatus = 
  | 'active'
  | 'past_due'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'unpaid';

export interface BillingHistoryItem {
  id: string;
  subscription_id: string | null;
  user_id: string | null;
  email: string;
  stripe_invoice_id: string | null;
  stripe_payment_intent_id: string | null;
  amount_cents: number;
  currency: string;
  status: string;
  description: string | null;
  invoice_pdf_url: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

export interface SubscriptionContextType {
  subscription: Subscription | null;
  billingHistory: BillingHistoryItem[];
  plans: Record<string, SubscriptionPlan>;
  loading: boolean;
  error: string | null;
  fetchSubscription: () => Promise<void>;
  fetchBillingHistory: () => Promise<void>;
  createSubscription: (planId: string) => Promise<void>;
  changePlan: (newPlanId: string) => Promise<void>;
  cancelSubscription: (immediate?: boolean) => Promise<void>;
  reactivateSubscription: () => Promise<void>;
}

export const formatPrice = (cents: number): string => {
  return `$${(cents / 100).toFixed(2)}`;
};

export const formatBillingInterval = (interval: string): string => {
  switch (interval) {
    case 'month':
      return '/month';
    case 'year':
      return '/year';
    default:
      return '';
  }
};

export const getStatusColor = (status: SubscriptionStatus): string => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'trialing':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    case 'past_due':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'canceled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    case 'incomplete':
    case 'incomplete_expired':
    case 'unpaid':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const getStatusLabel = (status: SubscriptionStatus): string => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'trialing':
      return 'Trial';
    case 'past_due':
      return 'Past Due';
    case 'canceled':
      return 'Canceled';
    case 'incomplete':
      return 'Incomplete';
    case 'incomplete_expired':
      return 'Expired';
    case 'unpaid':
      return 'Unpaid';
    default:
      return status;
  }
};
