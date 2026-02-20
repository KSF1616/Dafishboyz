export interface DBPromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed' | 'free_trial' | 'free_shipping';
  value: number;
  description: string | null;
  min_order_amount: number | null;
  max_discount: number | null;
  valid_from: string | null;
  valid_until: string | null;
  usage_limit: number | null;
  usage_count: number;
  applicable_to: 'all' | 'physical' | 'digital' | 'bundle';
  requires_physical: boolean;
  free_trial_days: number | null;
  free_trial_feature: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface PromoCodeRedemption {
  id: string;
  promo_code_id: string | null;
  code: string;
  customer_email: string;
  customer_name: string | null;
  order_id: string | null;
  order_total: number | null;
  discount_amount: number | null;
  redeemed_at: string;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, any>;
}

export interface PromoCodeStats {
  totalCodes: number;
  activeCodes: number;
  totalRedemptions: number;
  totalDiscountGiven: number;
  chartData: Array<{
    date: string;
    redemptions: number;
    discount: number;
  }>;
  topCodes: Array<{
    code: string;
    count: number;
  }>;
  recentRedemptions: PromoCodeRedemption[];
}

export interface PromoCodeFormData {
  code: string;
  type: 'percentage' | 'fixed' | 'free_trial' | 'free_shipping';
  value: number;
  description: string;
  min_order_amount?: number;
  max_discount?: number;
  valid_from?: string;
  valid_until?: string;
  usage_limit?: number;
  applicable_to: 'all' | 'physical' | 'digital' | 'bundle';
  requires_physical: boolean;
  free_trial_days?: number;
  free_trial_feature?: string;
  is_active: boolean;
}
