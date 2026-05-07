'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search, Package, Truck, CheckCircle, Clock, XCircle, ExternalLink, Loader2 } from 'lucide-react';

const COURIERS: Record<string, { name: string; url: (n: string) => string }> = {
  royal_mail:   { name: 'Royal Mail',   url: n => `https://www.royalmail.com/track-your-item#/tracking-results/${n}` },
  parcelforce:  { name: 'Parcelforce',  url: n => `https://www.parcelforce.com/track-trace?trackNumber=${n}` },
  evri:         { name: 'Evri',         url: n => `https://www.evri.com/track-a-parcel/tracking#/${n}` },
  yodel:        { name: 'Yodel',        url: n => `https://www.yodel.co.uk/tracking/${n}` },
};

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Package; color: string; bg: string }> = {
  pending:          { label: 'Order Received',   icon: Clock,         color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
  confirmed:        { label: 'Confirmed',         icon: CheckCircle,   color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  processing:       { label: 'Processing',        icon: Package,       color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  dispatched:       { label: 'Dispatched',        icon: Truck,         color: 'text-accent-700', bg: 'bg-accent-50 border-accent-200' },
  delivered:        { label: 'Delivered',         icon: CheckCircle,   color: 'text-green-700',  bg: 'bg-green-50 border-green-200' },
  cancelled:        { label: 'Cancelled',         icon: XCircle,       color: 'text-red-700',    bg: 'bg-red-50 border-red-200' },
  pending_payment:  { label: 'Awaiting Payment',  icon: Clock,         color: 'text-yellow-700', bg: 'bg-yellow-50 border-yellow-200' },
};

const STEPS = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered'];

interface TrackResult {
  reference: string;
  status: string;
  courier: string;
  trackingNumber: string;
  createdAt: string;
}

export default function TrackOrderPage() {
  const [ref, setRef] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ref.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch(`/api/track?ref=${encodeURIComponent(ref.trim().toUpperCase())}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Order not found'); }
      else { setResult(data); }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepIdx = result ? STEPS.indexOf(result.status) : -1;
  const statusCfg = result ? (STATUS_CONFIG[result.status] ?? STATUS_CONFIG.pending) : null;
  const courierCfg = result?.courier ? COURIERS[result.courier] : null;
  const trackingUrl = courierCfg && result?.trackingNumber ? courierCfg.url(result.trackingNumber) : null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-center">
            <p className="eyebrow mb-2">Order Tracking</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Track Your Order</h1>
            <p className="text-sm text-gray-500 mt-2">Enter your order reference to see the latest status.</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          {/* Search form */}
          <form onSubmit={handleTrack} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Order Reference</label>
            <div className="flex gap-3">
              <input
                className="input flex-1"
                placeholder="e.g. TB-ABC123"
                value={ref}
                onChange={e => setRef(e.target.value.toUpperCase())}
              />
              <button type="submit" disabled={loading}
                className="btn-primary shrink-0 px-5">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4" /> Track</>}
              </button>
            </div>
            {error && <p className="text-sm text-red-600 mt-3 font-medium">{error}</p>}
            <p className="text-xs text-gray-400 mt-3">Your reference number starts with TB- and was emailed to you when you placed your order.</p>
          </form>

          {/* Results */}
          {result && statusCfg && (
            <div className="space-y-4">
              {/* Status badge */}
              <div className={`border rounded-2xl p-5 flex items-center gap-4 ${statusCfg.bg}`}>
                <div className={`w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm`}>
                  <statusCfg.icon className={`w-6 h-6 ${statusCfg.color}`} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Ref: {result.reference}</p>
                  <p className={`text-lg font-bold ${statusCfg.color}`}>{statusCfg.label}</p>
                  {result.createdAt && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ordered: {new Date(result.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress steps */}
              {!['cancelled', 'pending_payment'].includes(result.status) && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <p className="text-sm font-bold text-gray-900 mb-4">Order Progress</p>
                  <div className="flex items-center gap-0">
                    {STEPS.map((step, i) => {
                      const done = i <= stepIdx;
                      const active = i === stepIdx;
                      return (
                        <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                            done ? 'bg-accent-500 text-white' : 'bg-gray-100 text-gray-400'
                          } ${active ? 'ring-4 ring-accent-100' : ''}`}>
                            {i + 1}
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className={`absolute ml-8 h-0.5 w-full ${done && i < stepIdx ? 'bg-accent-400' : 'bg-gray-200'}`} style={{ display: 'none' }} />
                          )}
                          <p className="text-[10px] text-center text-gray-500 font-medium capitalize hidden sm:block">
                            {STATUS_CONFIG[step]?.label ?? step}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-500 rounded-full transition-all duration-500"
                      style={{ width: stepIdx >= 0 ? `${((stepIdx + 1) / STEPS.length) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              )}

              {/* Courier tracking */}
              {result.courier && result.trackingNumber && (
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                  <p className="text-sm font-bold text-gray-900 mb-3">Courier Information</p>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Courier</p>
                      <p className="font-semibold text-gray-900">{courierCfg?.name ?? result.courier}</p>
                      <p className="text-xs text-gray-400 mt-1.5">Tracking Number</p>
                      <p className="font-mono font-bold text-gray-900 text-sm">{result.trackingNumber}</p>
                    </div>
                    {trackingUrl && (
                      <a href={trackingUrl} target="_blank" rel="noopener noreferrer"
                        className="btn-primary shrink-0 gap-2">
                        Track on {courierCfg?.name} <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {result.status === 'dispatched' && !result.trackingNumber && (
                <div className="bg-accent-50 border border-accent-200 rounded-2xl p-4 text-sm text-accent-700">
                  Your order has been dispatched. Tracking details will appear here shortly.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
