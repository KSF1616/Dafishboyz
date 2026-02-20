import { PromoCode } from '@/types/promoCode';

export const promoCodes: PromoCode[] = [
  {
    code: 'SAVE10',
    type: 'percentage',
    value: 10,
    description: '10% off your entire order',
    isActive: true,
    applicableTo: 'all'
  },
  {
    code: 'SAVE20',
    type: 'percentage',
    value: 20,
    description: '20% off orders over $50',
    minOrderAmount: 50,
    isActive: true,
    applicableTo: 'all'
  },
  {
    code: 'WELCOME15',
    type: 'percentage',
    value: 15,
    description: '15% off for new customers',
    maxDiscount: 25,
    isActive: true,
    applicableTo: 'all'
  },
  {
    code: 'BUNDLEDEAL',
    type: 'fixed',
    value: 10,
    description: '$10 off bundle purchases',
    minOrderAmount: 80,
    isActive: true,
    applicableTo: 'bundle'
  },
  {
    code: 'FREETOOLS30',
    type: 'free_trial',
    value: 0,
    description: '30 days free access to digital game tools',
    isActive: true,
    requiresPhysical: true,
    freeTrialDays: 30,
    freeTrialFeature: 'Digital Game Tools',
    applicableTo: 'physical'
  },

  {
    code: 'HOLIDAY25',
    type: 'percentage',
    value: 25,
    description: '25% off holiday special',
    maxDiscount: 30,
    isActive: true,
    validFrom: '2025-12-01',
    validUntil: '2025-12-31',
    applicableTo: 'all'
  },
  {
    code: 'FREESHIP',
    type: 'free_shipping',
    value: 0,
    description: 'Free shipping on physical orders',
    minOrderAmount: 40,
    isActive: true,
    applicableTo: 'physical'
  },
  {
    code: 'DIGITAL20',
    type: 'percentage',
    value: 20,
    description: '20% off digital downloads',
    isActive: true,
    applicableTo: 'digital'
  }
];

export const findPromoCode = (code: string): PromoCode | undefined => {
  return promoCodes.find(
    p => p.code.toUpperCase() === code.toUpperCase() && p.isActive
  );
};
