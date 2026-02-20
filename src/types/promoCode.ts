export type PromoCodeType = 'percentage' | 'fixed' | 'free_trial' | 'free_shipping';

export interface PromoCode {
  code: string;
  type: PromoCodeType;
  value: number; // percentage (0-100) or fixed amount in dollars
  description: string;
  minOrderAmount?: number;
  maxDiscount?: number;
  validFrom?: string;
  validUntil?: string;
  usageLimit?: number;
  usageCount?: number;
  applicableTo?: 'all' | 'physical' | 'digital' | 'bundle';
  requiresPhysical?: boolean; // Code only valid if cart has physical items
  isActive: boolean;
  freeTrialDays?: number; // For free_trial type, number of days
  freeTrialFeature?: string; // For free_trial type, what feature is unlocked
}

export interface AppliedPromoCode {
  code: string;
  discount: number;
  description: string;
  freeTrialDays?: number;
  freeTrialFeature?: string;
  freeShipping?: boolean;
}

export interface PromoCodeValidation {
  isValid: boolean;
  error?: string;
  promoCode?: PromoCode;
  discount?: number;
  freeTrialDays?: number;
  freeTrialFeature?: string;
  freeShipping?: boolean;
}
