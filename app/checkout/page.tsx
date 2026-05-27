'use client';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/cartStore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  CheckCircle2, Loader2, CreditCard, Copy, Check,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// ─── Delivery form ───────────────────────────────────────────────────────────

interface DeliveryForm {
  customerName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  notes: string;
}

function DeliveryFields({ form, onChange }: { form: DeliveryForm; onChange: (f: DeliveryForm) => void }) {
  const set = (k: keyof DeliveryForm, v: string) => onChange({ ...form, [k]: v });
  const inp = (k: keyof DeliveryForm, label: string, req = true, ph = '') => (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
        {label} {req ? <span className="text-red-500">*</span> : <span className="text-gray-400 font-normal">(optional)</span>}
      </label>
      <input
        type={k === 'email' ? 'email' : k === 'phone' ? 'tel' : 'text'}
        required={req}
        value={form[k]}
        onChange={e => set(k, e.target.value)}
        className="input"
        placeholder={ph}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      {inp('customerName', 'Full Name', true, 'John Smith')}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {inp('phone', 'Phone Number', true, '+44 7700 000000')}
        {inp('email', 'Email Address', false, 'john@example.com')}
      </div>
      {inp('addressLine1', 'House Number / Name', true, '123 or Flat 2')}
      {inp('addressLine2', 'Street Name', true, 'High Street')}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {inp('city', 'City / Town', true, 'London')}
        {inp('postcode', 'Postcode', true, 'SW1A 1AA')}
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
          Order Notes <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={form.notes}
          onChange={e => set('notes', e.target.value)}
          className="input"
          rows={3}
          placeholder="Any special instructions..."
        />
      </div>
    </div>
  );
}

// ─── Stripe card form ─────────────────────────────────────────────────────────

function StripeForm({ total, delivery, form, onSuccess }: {
  total: number;
  delivery: number;
  form: DeliveryForm;
  onSuccess: (ref: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { items, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError('');

    try {
      const { error: submitErr } = await elements.submit();
      if (submitErr) { 
        setError(submitErr.message ?? 'Payment error'); 
        setLoading(false); 
        return; 
      }

      // Confirm payment first
      const { error: confirmErr } = await stripe.confirmPayment({
        elements,
        confirmParams: { 
          return_url: `${window.location.origin}/checkout?success=true` 
        },
        redirect: 'if_required',
      });

      if (confirmErr) {
        setError(confirmErr.message ?? 'Payment failed');
        setLoading(false);
        return;
      }

      // Create order after successful payment
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            ...form,
            address: `${form.addressLine1}${form.addressLine2 ? ', ' + form.addressLine2 : ''}, ${form.city}, ${form.postcode}`,
            total: total + delivery,
            paymentMethod: 'card',
          },
          items: items.map(i => ({ productId: i.id, productName: i.name, quantity: i.quantity, price: i.price })),
        }),
      });
      
      const orderData = await orderRes.json();
      if (!orderRes.ok) { 
        setError(orderData.error ?? 'Failed to create order'); 
        setLoading(false); 
        return; 
      }

      clearCart();
      onSuccess(orderData.reference);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="space-y-4">
      <PaymentElement options={{ layout: 'tabs' }} />
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-sm">{error}</p>}
      <button type="submit" disabled={loading || !stripe}
        className="btn-primary w-full justify-center py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
          : <><CreditCard className="w-4 h-4" /> Pay £{(total + delivery).toFixed(2)}</>}
      </button>
    </form>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ reference }: { reference: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Navbar />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-gray-50 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md bg-white border border-gray-200 p-10 rounded-sm w-full">
          <div className="w-14 h-14 bg-primary-600 flex items-center justify-center mx-auto mb-6 rounded-full">
            <CheckCircle2 className="w-7 h-7 text-white" />
          </div>
          <p className="text-xs font-bold tracking-widest uppercase text-primary-600 mb-2">Order Confirmed</p>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Thank You!</h2>

          <p className="text-sm text-gray-500 mb-2">Your order reference number:</p>
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="font-mono text-lg font-bold text-gray-900 border border-gray-200 bg-gray-50 px-5 py-3 rounded-sm">{reference}</span>
            <button onClick={copy} className="p-2 text-gray-400 hover:text-primary-600 transition-colors" title="Copy reference">
              {copied ? <Check className="w-4 h-4 text-primary-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <p className="text-sm text-gray-500 mb-6">Payment confirmed. We'll process your order and be in touch shortly.</p>

          <button onClick={() => router.push('/shop')} className="btn-primary w-full justify-center">
            Continue Shopping
          </button>
        </div>
      </motion.div>
      <Footer />
    </>
  );
}

// ─── Main checkout page ───────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { items, total } = useCartStore();
  const { user, profile } = useAuth();
  const subtotal = total();
  const delivery = subtotal >= 10 ? 0 : 2.99;

  const [mounted, setMounted] = useState(false);
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loadingStripe, setLoadingStripe] = useState(true);
  const [successData, setSuccessData] = useState<{ ref: string } | null>(null);

  const [form, setForm] = useState<DeliveryForm>({
    customerName: '',
    phone: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postcode: '',
    notes: '',
  });

  // Set mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  // Pre-fill from user profile
  useEffect(() => {
    if (profile) {
      setForm(f => ({
        ...f,
        customerName: profile.displayName || f.customerName,
        phone: profile.phone || f.phone,
        addressLine1: profile.addressLine1 || f.addressLine1,
        addressLine2: profile.addressLine2 || f.addressLine2,
        city: profile.city || f.city,
        postcode: profile.postcode || f.postcode,
      }));
    }
    if (user?.email) setForm(f => ({ ...f, email: user.email || f.email }));
  }, [profile, user]);

  // Load Stripe publishable key and create payment intent
  useEffect(() => {
    if (!mounted) return;
    setLoadingStripe(true);

    fetch('/api/stripe/publishable-key')
      .then(r => r.json())
      .then(async ({ publishableKey }) => {
        if (!publishableKey) { setLoadingStripe(false); return; }
        const promise = loadStripe(publishableKey);
        setStripePromise(promise);

        const piRes = await fetch('/api/stripe/payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: subtotal + delivery }),
        });
        const { clientSecret: cs } = await piRes.json();
        if (cs) setClientSecret(cs);
        setLoadingStripe(false);
      })
      .catch(() => setLoadingStripe(false));
  }, [mounted, subtotal, delivery]);

  if (successData) {
    return <SuccessScreen reference={successData.ref} />;
  }

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        <div className="bg-white border-b border-gray-200">
          <div className="w-full px-4 sm:px-8 py-5">
            <p className="text-xs font-bold tracking-widest uppercase text-primary-600 mb-1">Secure Checkout</p>
            <h1 className="text-2xl font-bold text-gray-900">Complete Your Order</h1>
          </div>
        </div>

        {/* Mobile order total bar */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">{items.length} item{items.length !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-3 text-sm">
            {delivery === 0 && <span className="text-primary-600 font-medium text-xs">Free delivery</span>}
            <span className="font-bold text-gray-900">Total: £{(subtotal + delivery).toFixed(2)}</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col lg:flex-row gap-5">
          {/* Left — delivery + payment */}
          <div className="flex-1 space-y-4">
            {/* Autofill notice */}
            {user && profile && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3 text-sm text-primary-700">
                ✓ Delivery details pre-filled from your account.
              </div>
            )}

            {/* Delivery details */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
              <p className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Delivery Details</p>
              <DeliveryFields form={form} onChange={setForm} />
            </div>

            {/* Payment */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
              <p className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Payment</p>
              
              {!form.customerName || !form.phone || !form.addressLine1 || !form.addressLine2 || !form.city || !form.postcode ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Please fill in your delivery details above to continue</p>
                  <p className="text-xs text-gray-400">All required fields must be completed before payment</p>
                </div>
              ) : loadingStripe ? (
                <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary-600" /></div>
              ) : stripePromise && clientSecret ? (
                <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                  <StripeForm total={subtotal} delivery={delivery} form={form}
                    onSuccess={ref => setSuccessData({ ref })} />
                </Elements>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                  Stripe is not configured yet. Go to <a href="/hello/settings" className="underline font-medium">Admin → Settings</a> to add your Stripe keys.
                </div>
              )}
            </div>
          </div>

          {/* Right — order summary (desktop only) */}
          <div className="hidden lg:block lg:w-80 shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-5 sticky top-24">
              <h2 className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
                Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
              </h2>
              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <img src={item.image || `https://placehold.co/48x48/f3f4f6/9ca3af?text=B`} alt={item.name}
                      className="w-10 h-10 object-cover bg-gray-50 border border-gray-100 rounded shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/48x48/f3f4f6/9ca3af?text=B`; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
                      <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 shrink-0">£{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span className="font-medium text-gray-900">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={`font-medium ${delivery === 0 ? 'text-primary-600' : 'text-gray-900'}`}>
                    {delivery === 0 ? 'FREE' : `£${delivery.toFixed(2)}`}
                  </span>
                </div>
                {delivery > 0 && <p className="text-xs text-gray-400">Add £{(10 - subtotal).toFixed(2)} more for free delivery</p>}
                <div className="flex justify-between font-bold text-base pt-3 border-t border-gray-100">
                  <span>Total</span><span>£{(subtotal + delivery).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
