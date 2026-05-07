'use client';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/cartStore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  CheckCircle2, Loader2, ShoppingBag, CreditCard, Building2, Copy, Check,
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
      {inp('addressLine1', 'Address Line 1', true, '123 High Street')}
      {inp('addressLine2', 'Address Line 2', false, 'Flat 2')}
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

    const { error: submitErr } = await elements.submit();
    if (submitErr) { setError(submitErr.message ?? 'Payment error'); setLoading(false); return; }

    // Create order first to get reference
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
    if (!orderRes.ok) { setError(orderData.error ?? 'Failed to create order'); setLoading(false); return; }

    // Create payment intent
    const piRes = await fetch('/api/stripe/payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: total + delivery,
        customerName: form.customerName,
        customerEmail: form.email,
      }),
    });
    const piData = await piRes.json();
    if (!piRes.ok || !piData.clientSecret) { setError(piData.error ?? 'Payment setup failed'); setLoading(false); return; }

    const { error: confirmErr } = await stripe.confirmPayment({
      elements,
      clientSecret: piData.clientSecret,
      confirmParams: { return_url: `${window.location.origin}/checkout?success=true` },
      redirect: 'if_required',
    });

    if (confirmErr) {
      setError(confirmErr.message ?? 'Payment failed');
      setLoading(false);
      return;
    }

    clearCart();
    onSuccess(orderData.reference);
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

// ─── Bank transfer form ───────────────────────────────────────────────────────

function BankTransferForm({ total, delivery, form, onSuccess }: {
  total: number;
  delivery: number;
  form: DeliveryForm;
  onSuccess: (ref: string, bank: BankDetails) => void;
}) {
  const { items, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bank, setBank] = useState<BankDetails | null>(null);

  useEffect(() => {
    fetch('/api/stripe/bank-details').then(r => r.json()).then(setBank);
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order: {
            ...form,
            address: `${form.addressLine1}${form.addressLine2 ? ', ' + form.addressLine2 : ''}, ${form.city}, ${form.postcode}`,
            total: total + delivery,
            paymentMethod: 'bank_transfer',
            status: 'pending_payment',
          },
          items: items.map(i => ({ productId: i.id, productName: i.name, quantity: i.quantity, price: i.price })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      clearCart();
      onSuccess(data.reference, bank ?? {} as BankDetails);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePlaceOrder} className="space-y-4">
      {bank && (bank.accountName || bank.accountNumber) && (
        <div className="bg-blue-50 border border-blue-200 rounded-sm p-4 space-y-2 text-sm">
          <p className="font-semibold text-blue-900 mb-2">Bank Transfer Details</p>
          {bank.bankName && <div className="flex justify-between"><span className="text-blue-700">Bank</span><span className="font-medium text-blue-900">{bank.bankName}</span></div>}
          {bank.accountName && <div className="flex justify-between"><span className="text-blue-700">Account Name</span><span className="font-medium text-blue-900">{bank.accountName}</span></div>}
          {bank.accountNumber && <div className="flex justify-between"><span className="text-blue-700">Account Number</span><span className="font-mono font-medium text-blue-900">{bank.accountNumber}</span></div>}
          {bank.sortCode && <div className="flex justify-between"><span className="text-blue-700">Sort Code</span><span className="font-mono font-medium text-blue-900">{bank.sortCode}</span></div>}
          <p className="text-xs text-blue-600 pt-2 border-t border-blue-200">Your unique order reference will be shown after placing the order. Use it as the payment reference.</p>
        </div>
      )}
      <p className="text-sm text-gray-600">Place your order now and complete the bank transfer using your order reference number. Your order will be processed once payment is received.</p>
      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-sm">{error}</p>}
      <button type="submit" disabled={loading}
        className="btn-primary w-full justify-center py-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</>
          : <><Building2 className="w-4 h-4" /> Place Order · £{(total + delivery).toFixed(2)}</>}
      </button>
    </form>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  sortCode: string;
}

// ─── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ reference, paymentMethod, bank }: {
  reference: string;
  paymentMethod: 'card' | 'bank';
  bank: BankDetails | null;
}) {
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

          {paymentMethod === 'bank' && bank && (bank.accountName || bank.accountNumber) && (
            <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 text-left mb-6">
              <p className="text-sm font-bold text-amber-900 mb-3">Complete Your Bank Transfer</p>
              <div className="space-y-1.5 text-sm">
                {bank.bankName && <div className="flex justify-between"><span className="text-amber-700">Bank</span><span className="font-medium text-amber-900">{bank.bankName}</span></div>}
                {bank.accountName && <div className="flex justify-between"><span className="text-amber-700">Account Name</span><span className="font-medium text-amber-900">{bank.accountName}</span></div>}
                {bank.accountNumber && <div className="flex justify-between"><span className="text-amber-700">Account Number</span><span className="font-mono font-bold text-amber-900">{bank.accountNumber}</span></div>}
                {bank.sortCode && <div className="flex justify-between"><span className="text-amber-700">Sort Code</span><span className="font-mono font-bold text-amber-900">{bank.sortCode}</span></div>}
                <div className="flex justify-between pt-2 border-t border-amber-200">
                  <span className="text-amber-700">Reference</span>
                  <span className="font-mono font-bold text-amber-900">{reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-700">Amount</span>
                  <span className="font-bold text-amber-900">£{/* shown in parent */}</span>
                </div>
              </div>
              <p className="text-xs text-amber-700 mt-3">⚠️ Use <strong>{reference}</strong> as your payment reference so we can match your transfer.</p>
            </div>
          )}

          {paymentMethod === 'card' && (
            <p className="text-sm text-gray-500 mb-6">Payment confirmed. We'll process your order and be in touch shortly.</p>
          )}

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
  const delivery = subtotal >= 75 ? 0 : 6.99;

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loadingStripe, setLoadingStripe] = useState(true);
  const [successData, setSuccessData] = useState<{ ref: string; method: 'card' | 'bank'; bank: BankDetails | null } | null>(null);

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
    if (paymentMethod !== 'card') return;
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
  }, [paymentMethod, subtotal, delivery]);

  if (successData) {
    return <SuccessScreen reference={successData.ref} paymentMethod={successData.method} bank={successData.bank} />;
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

            {/* Payment method selector */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6">
              <p className="text-sm font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Payment Method</p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <button type="button" onClick={() => setPaymentMethod('card')}
                  className={`flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 p-3 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-all text-center ${paymentMethod === 'card' ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <CreditCard className="w-5 h-5 shrink-0" />
                  <span>Card / Apple & Google Pay</span>
                </button>
                <button type="button" onClick={() => setPaymentMethod('bank')}
                  className={`flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 p-3 rounded-xl border-2 text-xs sm:text-sm font-semibold transition-all text-center ${paymentMethod === 'bank' ? 'border-accent-500 bg-accent-50 text-accent-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                  <Building2 className="w-5 h-5 shrink-0" />
                  <span>Bank Transfer</span>
                </button>
              </div>

              {paymentMethod === 'card' && (
                loadingStripe ? (
                  <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary-600" /></div>
                ) : stripePromise && clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: 'stripe' } }}>
                    <StripeForm total={subtotal} delivery={delivery} form={form}
                      onSuccess={ref => setSuccessData({ ref, method: 'card', bank: null })} />
                  </Elements>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    Stripe is not configured yet. Go to <a href="/admin/settings" className="underline font-medium">Admin → Settings</a> to add your Stripe keys.
                  </div>
                )
              )}

              {paymentMethod === 'bank' && (
                <BankTransferForm total={subtotal} delivery={delivery} form={form}
                  onSuccess={(ref, bank) => setSuccessData({ ref, method: 'bank', bank })} />
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
                {delivery > 0 && <p className="text-xs text-gray-400">Add £{(75 - subtotal).toFixed(2)} more for free delivery</p>}
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
