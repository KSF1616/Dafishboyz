// Stripe Configuration
// This file contains the Stripe publishable key for frontend use

// Live publishable key for production
export const STRIPE_PUBLISHABLE_KEY = 'pk_live_51SwtrTLytcGvPyGjsFtkEs58LPhf0KLxdCgZVHemfFvyqAQUG0HkzXmQ9FLAedonUzE1r5SCrGIhjcjU21ql5L4E00XpNeyuaf';

// Stripe configuration options
export const stripeConfig = {
  publishableKey: STRIPE_PUBLISHABLE_KEY,
  // Checkout session options
  checkout: {
    // Allowed shipping countries for physical products
    shippingCountries: ['US', 'CA', 'GB', 'AU'],
    // Default currency
    currency: 'usd',
    // Billing address collection
    billingAddressCollection: 'required' as const,
  },
  // Subscription plans
  plans: {
    monthly: {
      id: 'monthly',
      name: 'Monthly Pass',
      amount: 999, // $9.99 in cents
      interval: 'month' as const,
    },
    annual: {
      id: 'annual',
      name: 'Annual Pass',
      amount: 7999, // $79.99 in cents
      interval: 'year' as const,
    },
  },
};

// Helper to format price from cents to dollars
export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

// Helper to get plan details
export function getPlanDetails(planId: string) {
  return stripeConfig.plans[planId as keyof typeof stripeConfig.plans] || null;
}

export default stripeConfig;
