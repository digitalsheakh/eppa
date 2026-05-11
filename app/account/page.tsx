'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile } from '@/contexts/AuthContext';
import { useCartStore } from '@/lib/cartStore';
import {
  User, Package, LogOut, Loader2, KeyRound, MapPin, Save, CheckCircle2,
  LogIn, UserPlus, ShoppingBag, Clock, XCircle, Truck, CheckCircle,
  AlertCircle, Edit2, Eye, EyeOff, RefreshCw, FileText, X, ChevronRight,
  Phone, Mail, Home,
} from 'lucide-react';

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS: Record<string, { label: string; color: string; icon: any }> = {
  pending:         { label: 'Pending',         color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  pending_payment: { label: 'Awaiting Payment', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  confirmed:       { label: 'Confirmed',        color: 'bg-blue-100 text-blue-700',    icon: CheckCircle2 },
  processing:      { label: 'Processing',       color: 'bg-purple-100 text-purple-700', icon: AlertCircle },
  dispatched:      { label: 'Dispatched',       color: 'bg-indigo-100 text-indigo-700', icon: Truck },
  delivered:       { label: 'Delivered',        color: 'bg-green-100 text-green-700',  icon: CheckCircle },
  cancelled:       { label: 'Cancelled',        color: 'bg-red-100 text-red-700',      icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS[status] ?? STATUS.pending;
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${s.color}`}>
      <Icon className="w-3 h-3" />{s.label}
    </span>
  );
}

// ─── Google SVG ───────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem { name: string; qty: number; price: number; image?: string; id?: string; unit?: string; }
interface Order {
  id: string; reference?: string; customerName: string; email: string;
  total: number; status: string; createdAt: string;
  items?: OrderItem[]; phone?: string;
  addressLine1?: string; city?: string; postcode?: string;
  courier?: string; trackingNumber?: string;
}

// ─── Reorder Modal ───────────────────────────────────────────────────────────

function ReorderModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const addItem = useCartStore(s => s.addItem);
  const openCart = useCartStore(s => s.openCart);
  const [added, setAdded] = useState(false);

  const handleReorder = () => {
    if (!order.items) return;
    for (const item of order.items) {
      for (let i = 0; i < item.qty; i++) {
        addItem({ id: item.id || item.name, name: item.name, price: item.price, unit: item.unit || 'each', image: item.image || '' });
      }
    }
    setAdded(true);
    setTimeout(() => { onClose(); openCart(); }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Reorder</h3>
            <p className="text-xs text-gray-500">{order.reference || order.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto max-h-[50vh] space-y-3">
          {order.items && order.items.length > 0 ? order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-200" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">Qty: {item.qty} &times; £{item.price.toFixed(2)}</p>
              </div>
              <p className="text-sm font-bold text-gray-900 shrink-0">£{(item.qty * item.price).toFixed(2)}</p>
            </div>
          )) : (
            <p className="text-sm text-gray-400 text-center py-6">No item details available for this order.</p>
          )}
        </div>

        <div className="p-5 border-t border-gray-100 bg-gray-50">
          <div className="flex justify-between text-sm mb-4">
            <span className="text-gray-500">Original total</span>
            <span className="font-bold text-gray-900">£{Number(order.total).toFixed(2)}</span>
          </div>
          <button onClick={handleReorder} disabled={added || !order.items?.length}
            className={`w-full py-3 rounded-full text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              added ? 'bg-green-500 text-white' : 'bg-black hover:bg-gray-900 text-white'
            } disabled:opacity-50`}>
            {added ? <><CheckCircle className="w-4 h-4" /> Added to Cart!</>
              : <><RefreshCw className="w-4 h-4" /> Add All to Cart</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Invoice Modal ───────────────────────────────────────────────────────────

function InvoiceModal({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Invoice</h3>
              <p className="text-xs text-gray-500 mt-0.5">{order.reference || order.id}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>

          {/* Order info */}
          <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Date</p>
              <p className="font-medium text-gray-900">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Status</p>
              <StatusBadge status={order.status} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Customer</p>
              <p className="font-medium text-gray-900">{order.customerName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Email</p>
              <p className="font-medium text-gray-900 truncate">{order.email}</p>
            </div>
          </div>

          {/* Items table */}
          <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
            <div className="bg-gray-50 px-4 py-2.5 grid grid-cols-12 gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
            {order.items && order.items.map((item, i) => (
              <div key={i} className="px-4 py-3 grid grid-cols-12 gap-2 text-sm border-t border-gray-100 items-center">
                <div className="col-span-6 font-medium text-gray-900 truncate">{item.name}</div>
                <div className="col-span-2 text-center text-gray-600">{item.qty}</div>
                <div className="col-span-2 text-right text-gray-600">£{item.price.toFixed(2)}</div>
                <div className="col-span-2 text-right font-semibold text-gray-900">£{(item.qty * item.price).toFixed(2)}</div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-between items-center py-3 border-t-2 border-gray-900">
            <span className="text-sm font-bold text-gray-900">Total</span>
            <span className="text-lg font-bold text-gray-900">£{Number(order.total).toFixed(2)}</span>
          </div>

          {/* Tracking */}
          {order.courier && order.trackingNumber && (
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm">
              <p className="font-semibold text-gray-700">Tracking: {order.courier}</p>
              <p className="text-gray-600 font-mono text-xs mt-0.5">{order.trackingNumber}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

type DashTab = 'orders' | 'reorder' | 'address';

function AccountDashboard() {
  const { user, profile, logout, saveProfile } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [tab, setTab] = useState<DashTab>('orders');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [reorderOrder, setReorderOrder] = useState<Order | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [form, setForm] = useState<UserProfile>({
    displayName: profile?.displayName || user?.displayName || '',
    phone: profile?.phone || '',
    addressLine1: profile?.addressLine1 || '',
    addressLine2: profile?.addressLine2 || '',
    city: profile?.city || '',
    postcode: profile?.postcode || '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        displayName: profile.displayName || user?.displayName || '',
        phone: profile.phone || '',
        addressLine1: profile.addressLine1 || '',
        addressLine2: profile.addressLine2 || '',
        city: profile.city || '',
        postcode: profile.postcode || '',
      });
    }
  }, [profile, user]);

  useEffect(() => {
    if (!user?.email) return;
    fetch(`/api/orders?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(d => { setOrders(Array.isArray(d) ? d : []); setLoadingOrders(false); })
      .catch(() => setLoadingOrders(false));
  }, [user?.email]);

  const set = (k: keyof UserProfile, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveProfile(form);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
    setSaving(false);
  };

  const handleLogout = async () => { setLoggingOut(true); await logout(); };

  const initial = (user?.displayName || user?.email || 'U').charAt(0).toUpperCase();
  const name = user?.displayName || profile?.displayName || 'Customer';
  const totalSpent = orders.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  const TABS = [
    { key: 'orders' as DashTab,  label: 'My Orders',  icon: Package },
    { key: 'reorder' as DashTab, label: 'Reorder',    icon: RefreshCw },
    { key: 'address' as DashTab, label: 'My Details',  icon: MapPin },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Profile header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-5 sm:px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/15 border-2 border-white/25 flex items-center justify-center text-white text-xl font-bold shrink-0 overflow-hidden">
                {user?.photoURL
                  ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  : initial}
              </div>
              <div className="min-w-0">
                <h2 className="text-white text-lg font-bold leading-tight truncate">{name}</h2>
                <p className="text-white/60 text-xs truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} disabled={loggingOut}
              className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-medium transition-colors shrink-0 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-full">
              {loggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {[
            { label: 'Orders', value: orders.length.toString() },
            { label: 'Delivered', value: deliveredOrders.length.toString() },
            { label: 'Total Spent', value: `£${totalSpent.toFixed(0)}` },
          ].map(s => (
            <div key={s.label} className="px-4 py-3 text-center">
              <p className="text-lg font-bold text-gray-900">{s.value}</p>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white rounded-xl border border-gray-100 p-1 shadow-sm">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              tab === t.key
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5">

          {/* ── Orders tab ── */}
          {tab === 'orders' && (
            loadingOrders ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded-xl" />)}</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-600">No orders yet</p>
                <p className="text-xs text-gray-400 mt-1">Your orders will appear here once you shop.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(order => (
                  <div key={order.id} className="border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{order.reference || order.id}</p>
                          <p className="text-xs text-gray-500">
                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={order.status} />
                        <span className="text-sm font-bold text-gray-900">£{Number(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="px-4 pb-3 flex gap-2">
                      <button onClick={() => setInvoiceOrder(order)}
                        className="text-xs font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <FileText className="w-3 h-3" /> Invoice
                      </button>
                      <button onClick={() => setReorderOrder(order)}
                        className="text-xs font-medium text-gray-700 hover:text-black flex items-center gap-1 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                        <RefreshCw className="w-3 h-3" /> Reorder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Reorder tab ── */}
          {tab === 'reorder' && (
            loadingOrders ? (
              <div className="space-y-3">{[1, 2].map(i => <div key={i} className="h-24 skeleton rounded-xl" />)}</div>
            ) : deliveredOrders.length === 0 ? (
              <div className="text-center py-12">
                <RefreshCw className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-600">No delivered orders to reorder</p>
                <p className="text-xs text-gray-400 mt-1">Once you receive an order, you can quickly reorder it here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-gray-500 mb-1">Click any order to add all its items to your cart.</p>
                {orders.filter(o => o.items && o.items.length > 0).map(order => (
                  <button key={order.id} onClick={() => setReorderOrder(order)}
                    className="w-full text-left border border-gray-100 rounded-xl p-4 hover:border-gray-300 hover:bg-gray-50 transition-all group">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900">{order.reference || order.id}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {order.items?.length} item{order.items?.length !== 1 ? 's' : ''} &middot; £{Number(order.total).toFixed(2)}
                        </p>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {order.items?.slice(0, 3).map((item, i) => (
                            <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{item.name}</span>
                          ))}
                          {(order.items?.length || 0) > 3 && (
                            <span className="text-[10px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">+{(order.items?.length || 0) - 3} more</span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-black transition-colors shrink-0" />
                    </div>
                  </button>
                ))}
              </div>
            )
          )}

          {/* ── Address / Details tab ── */}
          {tab === 'address' && (
            <>
              {saved && (
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2 mb-4">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> Details saved successfully!
                </div>
              )}
              {!editing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Delivery Details</p>
                    <button onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 text-xs text-gray-700 font-semibold hover:text-black bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">These details are auto-filled at checkout.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Full Name', value: form.displayName, icon: User },
                      { label: 'Phone', value: form.phone, icon: Phone },
                      { label: 'Address', value: [form.addressLine1, form.addressLine2].filter(Boolean).join(', '), icon: Home },
                      { label: 'City', value: form.city, icon: MapPin },
                      { label: 'Postcode', value: form.postcode, icon: Mail },
                    ].map(({ label, value, icon: Icon }) => (
                      <div key={label} className="flex items-start gap-3 bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shrink-0 border border-gray-200">
                          <Icon className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{label}</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {value || <span className="text-gray-300 font-normal">Not set</span>}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSave} className="space-y-4">
                  <p className="text-sm font-semibold text-gray-900">Edit Delivery Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {([
                      { key: 'displayName', label: 'Full Name', ph: 'John Smith', type: 'text' },
                      { key: 'phone', label: 'Phone Number', ph: '+44 7700 000000', type: 'tel' },
                      { key: 'addressLine1', label: 'Address Line 1', ph: '123 High Street', type: 'text' },
                      { key: 'addressLine2', label: 'Address Line 2 (optional)', ph: 'Flat 2', type: 'text' },
                      { key: 'city', label: 'City / Town', ph: 'London', type: 'text' },
                      { key: 'postcode', label: 'Postcode', ph: 'SW1A 1AA', type: 'text' },
                    ] as { key: keyof UserProfile; label: string; ph: string; type: string }[]).map(f => (
                      <div key={f.key}>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">{f.label}</label>
                        <input type={f.type} value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                          className="input rounded-xl" placeholder={f.ph} />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={saving}
                      className="btn-primary px-5 py-2.5 gap-2 text-sm justify-center disabled:opacity-50">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Details
                    </button>
                    <button type="button" onClick={() => setEditing(false)}
                      className="px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium border border-gray-200 rounded-full transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {reorderOrder && <ReorderModal order={reorderOrder} onClose={() => setReorderOrder(null)} />}
      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
    </div>
  );
}

// ─── Auth forms ───────────────────────────────────────────────────────────────

type AuthTab = 'login' | 'register';

function AuthForms() {
  const { login, loginWithGoogle, register, resetPassword } = useAuth();
  const [tab, setTab] = useState<AuthTab>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReset, setShowReset] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      if (tab === 'register') {
        if (form.password !== form.confirmPassword) throw new Error('Passwords do not match');
        if (form.password.length < 6) throw new Error('Password must be at least 6 characters');
        await register(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
    } catch (err: any) {
      setError(
        err.code === 'auth/user-not-found'      ? 'No account found with this email' :
        err.code === 'auth/wrong-password'       ? 'Incorrect password' :
        err.code === 'auth/invalid-credential'   ? 'Invalid email or password' :
        err.code === 'auth/email-already-in-use' ? 'An account with this email already exists' :
        err.code === 'auth/invalid-email'        ? 'Please enter a valid email address' :
        err.message ?? 'Something went wrong'
      );
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setError(''); setGoogleLoading(true);
    try { await loginWithGoogle(); }
    catch (err: any) { setError(err.message ?? 'Google sign-in failed'); }
    finally { setGoogleLoading(false); }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await resetPassword(form.email);
      setSuccess('Password reset email sent! Check your inbox.');
      setShowReset(false);
    } catch { setError('Failed to send reset email. Check the address and try again.'); }
    finally { setLoading(false); }
  };

  if (showReset) {
    return (
      <div className="max-w-sm mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Reset Password</h2>
          <p className="text-sm text-gray-500 mb-5">Enter your email and we'll send a reset link.</p>
          <form onSubmit={handleReset} className="space-y-4">
            <input required name="email" type="email" value={form.email} onChange={handle}
              className="input rounded-xl" placeholder="your@email.com" />
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>}
            {success && <p className="text-sm text-green-700 bg-green-50 border border-green-100 px-3 py-2 rounded-xl">{success}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 rounded-xl">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><KeyRound className="w-4 h-4" /> Send Reset Email</>}
            </button>
          </form>
          <button onClick={() => setShowReset(false)}
            className="mt-4 text-sm text-gray-500 hover:text-black w-full text-center transition-colors">
            ← Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      {/* Tab switcher */}
      <div className="flex bg-gray-100 rounded-2xl p-1 mb-4">
        {(['login', 'register'] as AuthTab[]).map(t => (
          <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); }}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {t === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sm:p-6">
        {/* Google */}
        <button onClick={handleGoogle} disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 py-3 rounded-xl text-sm font-semibold text-gray-700 transition-all mb-4 disabled:opacity-50">
          {googleLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400 font-medium">or with email</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
              <input required name="name" type="text" value={form.name} onChange={handle}
                className="input rounded-xl" placeholder="John Smith" />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address</label>
            <input required name="email" type="email" value={form.email} onChange={handle}
              className="input rounded-xl" placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="relative">
              <input required name="password" type={showPw ? 'text' : 'password'}
                value={form.password} onChange={handle}
                className="input rounded-xl pr-10" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {tab === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm Password</label>
              <input required name="confirmPassword" type="password" value={form.confirmPassword}
                onChange={handle} className="input rounded-xl" placeholder="••••••••" />
            </div>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>}
          {success && <p className="text-sm text-green-700 bg-green-50 border border-green-100 px-3 py-2 rounded-xl">{success}</p>}

          <button type="submit" disabled={loading}
            className="btn-primary w-full justify-center py-3 text-sm rounded-xl mt-1">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
              tab === 'login'
                ? <><LogIn className="w-4 h-4" /> Sign In</>
                : <><UserPlus className="w-4 h-4" /> Create Account</>}
          </button>

          {tab === 'login' && (
            <button type="button" onClick={() => setShowReset(true)}
              className="text-xs text-gray-500 hover:text-black w-full text-center pt-1 transition-colors">
              Forgot your password?
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { user, loading, ready } = useAuth();

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen py-8 px-4">
        {!ready ? (
          <div className="max-w-sm mx-auto mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <p className="text-sm font-semibold text-amber-800 mb-2">Firebase not configured</p>
            <p className="text-xs text-amber-700">Add Firebase credentials to <code className="bg-amber-100 px-1 rounded">.env.local</code>.</p>
          </div>
        ) : loading ? (
          <div className="flex justify-center pt-16">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-black animate-spin" />
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          </div>
        ) : user ? (
          <AccountDashboard />
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gray-900 flex items-center justify-center mx-auto mb-4 rounded-2xl">
                <User className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">My Account</h1>
              <p className="text-sm text-gray-500 mt-1">Sign in to track orders and save your details</p>
            </div>
            <AuthForms />
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
