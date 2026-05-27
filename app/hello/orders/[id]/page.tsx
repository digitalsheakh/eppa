'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Menu, ArrowLeft, Package, User, MapPin, CreditCard, Truck, CheckCircle, Save } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

interface Order {
  id: string; reference?: string; customerName: string; email: string; phone: string;
  address: string; total: number; status: string; createdAt: string;
  paymentMethod?: string; notes?: string; courier?: string; trackingNumber?: string;
}
interface Item { productName: string; quantity: number; price: number; }

const STATUSES = ['pending','pending_payment','confirmed','processing','dispatched','delivered','cancelled'];
const STATUS_STYLES: Record<string, string> = {
  pending:         'bg-yellow-100 text-yellow-700',
  pending_payment: 'bg-orange-100 text-orange-700',
  confirmed:       'bg-blue-100 text-blue-700',
  processing:      'bg-purple-100 text-purple-700',
  dispatched:      'bg-indigo-100 text-indigo-700',
  delivered:       'bg-green-100 text-green-700',
  cancelled:       'bg-red-100 text-red-700',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [tracking, setTracking] = useState({ courier: '', trackingNumber: '' });
  const [savingTracking, setSavingTracking] = useState(false);
  const [savedTracking, setSavedTracking] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch(`/api/orders/${id}`).then(r => r.json()),
    ]).then(([orders, orderItems]) => {
      const found = Array.isArray(orders) ? orders.find((o: Order) => o.id === id) : null;
      if (found) {
        setOrder(found);
        setTracking({ courier: found.courier || '', trackingNumber: found.trackingNumber || '' });
      }
      setItems(Array.isArray(orderItems) ? orderItems : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleStatus = async (status: string) => {
    if (!order) return;
    setUpdatingStatus(true);
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setOrder(o => o ? { ...o, status } : null);
    setUpdatingStatus(false);
  };

  const saveTracking = async () => {
    setSavingTracking(true);
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(tracking) });
    setOrder(o => o ? { ...o, ...tracking } : null);
    setSavingTracking(false);
    setSavedTracking(true);
    setTimeout(() => setSavedTracking(false), 2500);
  };

  const ref = order?.reference ? `#${order.reference}` : `#${id?.slice(0, 8)}`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 hover:bg-gray-100 rounded">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={() => router.push('/hello/orders')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors">
            <ArrowLeft className="w-4 h-4" /> Orders
          </button>
          <span className="text-gray-300">/</span>
          <h1 className="font-bold text-gray-900">{loading ? '...' : ref}</h1>
        </header>

        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : !order ? (
          <div className="p-6 text-center text-gray-500">Order not found.</div>
        ) : (
          <main className="flex-1 p-4 sm:p-6">
            <div className="max-w-4xl mx-auto space-y-4">

              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-gray-200 rounded-xl p-4 sm:p-5">
                <div>
                  <p className="text-2xl font-bold text-gray-900 font-mono">{ref}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-semibold px-3 py-1.5 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status === 'pending_payment' ? 'Awaiting Payment' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <select
                    value={order.status}
                    disabled={updatingStatus}
                    onChange={e => handleStatus(e.target.value)}
                    className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
                  >
                    {STATUSES.map(s => (
                      <option key={s} value={s}>
                        {s === 'pending_payment' ? 'Awaiting Payment' : s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-4">

                  {/* Items */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-400" />
                      <h2 className="font-semibold text-gray-900 text-sm">Order Items</h2>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {items.map((item, i) => (
                        <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                            <p className="text-xs text-gray-400">£{item.price.toFixed(2)} × {item.quantity}</p>
                          </div>
                          <p className="font-bold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-5 py-3.5 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-700">Order Total</span>
                      <span className="text-lg font-bold text-gray-900">£{order.total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Tracking */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-gray-400" />
                      <h2 className="font-semibold text-gray-900 text-sm">Tracking Information</h2>
                    </div>
                    <div className="p-5 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Courier</label>
                          <select
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-black transition-colors bg-white"
                            value={tracking.courier}
                            onChange={e => setTracking(t => ({ ...t, courier: e.target.value }))}
                          >
                            <option value="">Select courier...</option>
                            <option value="Royal Mail">Royal Mail</option>
                            <option value="Parcelforce">Parcelforce</option>
                            <option value="Evri">Evri</option>
                            <option value="Yodel">Yodel</option>
                            <option value="DPD">DPD</option>
                            <option value="DHL">DHL</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tracking Number</label>
                          <input
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:border-black transition-colors"
                            placeholder="e.g. AB123456789GB"
                            value={tracking.trackingNumber}
                            onChange={e => setTracking(t => ({ ...t, trackingNumber: e.target.value }))}
                          />
                        </div>
                      </div>
                      <button onClick={saveTracking} disabled={savingTracking}
                        className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors disabled:opacity-50">
                        {savingTracking ? <Loader2 className="w-4 h-4 animate-spin" /> : savedTracking ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {savedTracking ? 'Saved!' : 'Save Tracking'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="space-y-4">

                  {/* Customer */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <h2 className="font-semibold text-gray-900 text-sm">Customer</h2>
                    </div>
                    <div className="p-5 space-y-2 text-sm">
                      <p className="font-semibold text-gray-900">{order.customerName}</p>
                      <p className="text-gray-500">{order.email}</p>
                      {order.phone && <p className="text-gray-500">{order.phone}</p>}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <h2 className="font-semibold text-gray-900 text-sm">Delivery Address</h2>
                    </div>
                    <div className="p-5 text-sm text-gray-600 leading-relaxed">
                      {order.address || '—'}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <h2 className="font-semibold text-gray-900 text-sm">Payment</h2>
                    </div>
                    <div className="p-5 text-sm">
                      <p className="text-gray-600">{order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Card Payment'}</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">£{order.total.toFixed(2)}</p>
                    </div>
                  </div>

                  {order.notes && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm">
                      <p className="font-semibold text-amber-800 mb-1">Order Notes</p>
                      <p className="text-amber-700">{order.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        )}
      </div>
    </div>
  );
}
