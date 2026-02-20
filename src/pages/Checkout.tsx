
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { AddressForm } from '@/components/checkout/AddressForm';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { CheckoutSuccess } from '@/components/checkout/CheckoutSuccess';
import { PromoCodeInput } from '@/components/checkout/PromoCodeInput';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { supabase } from '@/lib/supabase';
import { Loader2, CreditCard, ShieldCheck, ArrowLeft, Tag, Sparkles } from 'lucide-react';
import { Address } from '@/types/checkout';
import { AppliedPromoCode } from '@/types/promoCode';
import { findPromoCode } from '@/data/promoCodes';

const emptyAddress: Address = { firstName: '', lastName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'US' };

export default function Checkout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { cart, total, clearCart } = useCart();
  const [email, setEmail] = useState('');
  const [billing, setBilling] = useState<Address>(emptyAddress);
  const [shipping, setShipping] = useState<Address>(emptyAddress);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [error, setError] = useState('');
  const [appliedPromoCode, setAppliedPromoCode] = useState<AppliedPromoCode | null>(null);

  const hasPhysical = cart.some(item => item.type === 'physical');
  const hasDigital = cart.some(item => item.type === 'digital');
  const hasBundle = cart.some(item => item.game.name.toLowerCase().includes('bundle') || item.game.name.toLowerCase().includes('collection'));
  
  // Check if free shipping promo is applied
  const hasFreeShipping = appliedPromoCode?.freeShipping || appliedPromoCode?.code === 'FREESHIP';
  const baseShippingCost = hasPhysical ? 5.99 : 0;
  const shippingCost = hasFreeShipping ? 0 : baseShippingCost;

  
  // Calculate discount
  const discount = appliedPromoCode?.discount || 0;
  const discountedSubtotal = total - discount;
  const tax = discountedSubtotal * 0.08;
  const grandTotal = discountedSubtotal + shippingCost + tax;

  // Store checkout data for success page
  const [checkoutData, setCheckoutData] = useState<{
    cartItems: typeof cart;
    subtotal: number;
    shipping: number;
    tax: number;
    discount: number;
    promoCode?: string;
    total: number;
    shippingAddress?: Address;
    billingAddress?: Address;
  } | null>(null);

  // Check for success/cancel from Stripe redirect
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setSuccess(true);
      setOrderId('ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase());
      
      // Try to restore checkout data from sessionStorage
      const savedData = sessionStorage.getItem('checkoutData');
      if (savedData) {
        try {
          setCheckoutData(JSON.parse(savedData));
        } catch (e) {
          console.error('Failed to parse checkout data:', e);
        }
      }
    }
  }, [searchParams]);

  // Save checkout data before redirecting to Stripe
  const saveCheckoutData = () => {
    const data = {
      cartItems: cart,
      subtotal: total,
      shipping: shippingCost,
      tax,
      discount,
      promoCode: appliedPromoCode?.code,
      total: grandTotal,
      shippingAddress: hasPhysical ? (sameAsBilling ? billing : shipping) : undefined,
      billingAddress: billing
    };
    sessionStorage.setItem('checkoutData', JSON.stringify(data));
    sessionStorage.setItem('checkoutEmail', email);
  };

  // Restore email from sessionStorage
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('checkoutEmail');
    if (savedEmail && !email) {
      setEmail(savedEmail);
    }
  }, []);

  const handleCheckout = async () => {
    if (!email || !billing.firstName || !billing.line1 || !billing.city) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError('');
    
    // Save checkout data before redirecting
    saveCheckoutData();
    
    try {
      const items = cart.map(item => ({
        id: item.game.id, name: item.game.name, price: item.game.price,
        quantity: item.quantity, type: item.type, image: item.game.image
      }));
      
      const { data, error: fnError } = await supabase.functions.invoke('stripe-checkout', {
        body: {
          action: 'create-checkout-session',
          items,
          customerEmail: email,
          billingAddress: billing,
          shippingAddress: hasPhysical ? (sameAsBilling ? billing : shipping) : undefined,
          promoCode: appliedPromoCode ? {
            code: appliedPromoCode.code,
            discount: appliedPromoCode.discount,
            freeTrialDays: appliedPromoCode.freeTrialDays,
            freeTrialFeature: appliedPromoCode.freeTrialFeature
          } : undefined,
          discount: discount,
          freeShipping: hasFreeShipping,
          successUrl: `${window.location.origin}/checkout?success=true`,
          cancelUrl: `${window.location.origin}/checkout?canceled=true`
        }
      });
      if (fnError) throw fnError;
      if (data?.url) window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const savedEmail = email || sessionStorage.getItem('checkoutEmail') || '';
    const successCartItems = checkoutData?.cartItems || cart;
    const successHasPhysical = successCartItems.some(item => item.type === 'physical') || hasPhysical;
    const successHasDigital = successCartItems.some(item => item.type === 'digital') || hasDigital;
    
    return (
      <div className="min-h-screen bg-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <CheckoutSuccess 
            orderId={orderId} 
            email={savedEmail} 
            hasDigital={successHasDigital} 
            hasPhysical={successHasPhysical} 
            onContinue={() => { 
              clearCart(); 
              sessionStorage.removeItem('checkoutData');
              sessionStorage.removeItem('checkoutEmail');
              navigate('/'); 
            }}
            freeTrialDays={appliedPromoCode?.freeTrialDays || 30}
            freeTrialFeature={appliedPromoCode?.freeTrialFeature || 'Digital Game Tools'}
            cartItems={successCartItems}
            subtotal={checkoutData?.subtotal || total}
            shipping={checkoutData?.shipping || shippingCost}
            tax={checkoutData?.tax || tax}
            discount={checkoutData?.discount || discount}
            promoCode={checkoutData?.promoCode || appliedPromoCode?.code}
            total={checkoutData?.total || grandTotal}
            shippingAddress={checkoutData?.shippingAddress}
            billingAddress={checkoutData?.billingAddress}
          />
        </div>
      </div>
    );
  }


  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Your cart is empty</h2>
          <Button onClick={() => navigate('/')} className="bg-amber-500 hover:bg-amber-600 text-black">Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-400 mb-6"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>
        
        {/* Promo Code Banner */}
        {hasPhysical && !appliedPromoCode && (
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <div>
              <p className="text-amber-400 font-medium">Physical Game Purchaser Bonus!</p>
              <p className="text-gray-300 text-sm">Use code <span className="font-mono bg-gray-800 px-2 py-0.5 rounded text-amber-400">FREETOOLS30</span> for 30 days free access to digital game tools</p>
            </div>
          </div>
        )}
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="bg-gray-800 border-gray-700 mt-1" />
            </div>
            
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <AddressForm address={billing} onChange={setBilling} title="Billing Address" />
            </div>
            
            {hasPhysical && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox checked={sameAsBilling} onCheckedChange={(c) => setSameAsBilling(!!c)} />
                  <Label>Shipping same as billing</Label>
                </div>
                {!sameAsBilling && <AddressForm address={shipping} onChange={setShipping} title="Shipping Address" />}
              </div>
            )}
            
            {/* Promo Code Section */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <PromoCodeInput
                cart={cart}
                subtotal={total}
                appliedCode={appliedPromoCode}
                onApplyCode={setAppliedPromoCode}
                hasBundle={hasBundle}
              />
            </div>
            
            {error && <p className="text-red-400 text-sm">{error}</p>}
            
            <Button onClick={handleCheckout} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-6 text-lg">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CreditCard className="w-5 h-5 mr-2" />Pay ${grandTotal.toFixed(2)}</>}
            </Button>
            
            <div className="flex items-center justify-center gap-2 text-gray-400 text-sm"><ShieldCheck className="w-4 h-4" />Secure checkout powered by Stripe</div>
          </div>
          
          <div className="space-y-4">
            <OrderSummary 
              items={cart} 
              subtotal={total} 
              shipping={baseShippingCost} 
              tax={tax} 
              total={grandTotal}
              discount={discount}
              appliedCode={appliedPromoCode}
              freeShipping={hasFreeShipping}
            />
            
            {/* Available Promo Codes Info */}
            <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 text-gray-400 mb-3">
                <Tag className="w-4 h-4" />
                <span className="text-sm font-medium">Available Promo Codes</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span className="font-mono">SAVE10</span>
                  <span>10% off</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span className="font-mono">WELCOME15</span>
                  <span>15% off (max $25)</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span className="font-mono">HOLIDAY25</span>
                  <span>25% off (limited time)</span>
                </div>
                {hasPhysical && (
                  <div className="flex justify-between text-amber-500/70 pt-2 border-t border-gray-700">
                    <span className="font-mono">FREETOOLS30</span>
                    <span>30 days free tools</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
