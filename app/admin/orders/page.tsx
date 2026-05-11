'use client';
import { useEffect, useState } from 'react';
import { Order } from '@/lib/db';
import { Loader2, Package, ShoppingBag, Home, Menu, X, Eye, TrendingUp, Clock, CheckCircle, DollarSign, Settings, Users } from 'lucide-react';
import Link from 'next/link';

const STATUSES = ['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'];

const STATUS_STYLES: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  dispatched: 'bg-indigo-100 text-indigo-700',
  delivered:  'bg-primary-100 text-primary-700',
  cancelled:  'bg-red-100 text-red-700',
};

function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const links = [
    { href: '/admin/products',  icon: Package,    label: 'Products' },
    { href: '/admin/orders',    icon: ShoppingBag, label: 'Orders' },
    { href: '/admin/customers', icon: Users,       label: 'Customers' },
    { href: '/admin/settings',  icon: Settings,   label: 'Settings' },
    { href: '/',                icon: Home,        label: 'View Store' },
  ];
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-gray-900 text-white z-40 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <span className="font-bold text-base">
            Eppas<span className="text-accent-400"> Shop</span>
          </span>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-5 pt-5 pb-2">Menu</p>
        <nav className="flex flex-col gap-1 px-3 flex-1">
          {links.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} onClick={onClose}
              className="admin-link text-gray-300 hover:text-white hover:bg-white/10">
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="p-5 border-t border-gray-800">
          <p className="text-xs text-gray-600">Admin Dashboard</p>
        </div>
      </aside>
    </>
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [selected, setSelected] = useState<Order | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [trackingForm, setTrackingForm] = useState({ courier: '', trackingNumber: '' });
  const [savingTracking, setSavingTracking] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/orders')
      .then(r => r.json())
      .then(data => { setOrders(Array.isArray(data) ? data.reverse() : []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleStatus = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`/api/orders/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setUpdating(null);
  };

  const viewOrder = async (order: Order) => {
    setSelected(order);
    setItems([]);
    setTrackingForm({ courier: order.courier || '', trackingNumber: order.trackingNumber || '' });
    const res = await fetch(`/api/orders/${order.id}`);
    setItems(await res.json());
  };

  const saveTracking = async () => {
    if (!selected) return;
    setSavingTracking(true);
    await fetch(`/api/orders/${selected.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trackingForm),
    });
    setOrders(prev => prev.map(o => o.id === selected.id ? { ...o, ...trackingForm } : o));
    setSelected(prev => prev ? { ...prev, ...trackingForm } : null);
    setSavingTracking(false);
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 hover:bg-gray-100 rounded">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-bold text-gray-900">Orders</h1>
          <button onClick={load} className="ml-auto text-xs text-accent-600 hover:text-accent-700 font-medium">
            Refresh
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: 'Total Orders', value: stats.total, icon: TrendingUp, color: 'text-gray-900', bg: 'bg-gray-100' },
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-700', bg: 'bg-yellow-100' },
              { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'text-accent-700', bg: 'bg-accent-100' },
              { label: 'Revenue', value: `£${stats.revenue.toFixed(2)}`, icon: DollarSign, color: 'text-accent-700', bg: 'bg-accent-100' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 p-4 rounded-sm">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 ${s.bg} flex items-center justify-center rounded`}>
                    <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                  </div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
                <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-6 h-6 animate-spin text-accent-500" />
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block bg-white border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Order ID', 'Customer', 'Total', 'Date', 'Status', ''].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-gray-500">{order.id}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{order.customerName}</p>
                          <p className="text-gray-400 text-xs">{order.email}</p>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-900">£{order.total.toFixed(2)}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
                        <td className="px-4 py-3">
                          <select
                            value={order.status}
                            disabled={updating === order.id}
                            onChange={e => handleStatus(order.id, e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer outline-none ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => viewOrder(order)} className="p-2 hover:bg-accent-50 text-accent-600 rounded transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {orders.length === 0 && (
                  <div className="text-center py-16 text-gray-400">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm">No orders yet.</p>
                  </div>
                )}
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden space-y-3">
                {orders.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-gray-200 text-gray-400">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm">No orders yet.</p>
                  </div>
                ) : orders.map(order => (
                  <div key={order.id} className="bg-white border border-gray-200 p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{order.customerName}</p>
                        <p className="text-xs text-gray-400 font-mono">{order.id}</p>
                      </div>
                      <p className="font-bold text-gray-900">£{order.total.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <select
                        value={order.status}
                        disabled={updating === order.id}
                        onChange={e => handleStatus(order.id, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer outline-none ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                      </select>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-GB')}</span>
                        <button onClick={() => viewOrder(order)} className="p-1.5 hover:bg-accent-50 text-accent-600 rounded">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Order detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white rounded-t-xl sm:rounded-sm shadow-2xl w-full sm:max-w-md">
            <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="font-bold text-gray-900 text-sm">{selected.id}</h2>
                <p className="text-gray-400 text-xs">{new Date(selected.createdAt).toLocaleString('en-GB')}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="bg-gray-50 border border-gray-100 rounded-sm p-4 space-y-1.5 text-sm mb-5">
                <p><span className="text-gray-500">Customer:</span> <strong className="text-gray-900">{selected.customerName}</strong></p>
                <p><span className="text-gray-500">Email:</span> <span className="text-gray-700">{selected.email}</span></p>
                <p><span className="text-gray-500">Phone:</span> <span className="text-gray-700">{selected.phone}</span></p>
                <p><span className="text-gray-500">Address:</span> <span className="text-gray-700">{selected.address}</span></p>
                {selected.notes && <p><span className="text-gray-500">Notes:</span> <span className="text-gray-700">{selected.notes}</span></p>}
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900 mb-3">Items Ordered</h3>
                <div className="space-y-2">
                  {items.length === 0
                    ? <div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 className="w-4 h-4 animate-spin" /> Loading items...</div>
                    : items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm border-b border-gray-50 pb-2">
                        <span className="text-gray-700">{item.productName} <span className="text-gray-400">× {item.quantity}</span></span>
                        <span className="font-semibold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))
                  }
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between font-bold text-base">
                  <span className="text-gray-700">Total</span>
                  <span className="text-accent-600">£{selected.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Tracking section */}
              <div className="mt-5 pt-5 border-t border-gray-100">
                <h3 className="font-bold text-sm text-gray-900 mb-3">Tracking Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Courier</label>
                    <select
                      className="input text-sm"
                      value={trackingForm.courier}
                      onChange={e => setTrackingForm(f => ({ ...f, courier: e.target.value }))}
                    >
                      <option value="">Select courier...</option>
                      <option value="royal_mail">Royal Mail</option>
                      <option value="parcelforce">Parcelforce</option>
                      <option value="evri">Evri</option>
                      <option value="yodel">Yodel</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Tracking Number</label>
                    <input
                      className="input text-sm font-mono"
                      placeholder="e.g. AB123456789GB"
                      value={trackingForm.trackingNumber}
                      onChange={e => setTrackingForm(f => ({ ...f, trackingNumber: e.target.value }))}
                    />
                  </div>
                  <button
                    onClick={saveTracking}
                    disabled={savingTracking}
                    className="btn-primary w-full justify-center py-2.5 text-sm">
                    {savingTracking ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Tracking'}
                  </button>
                  {selected.courier && selected.trackingNumber && (
                    <p className="text-xs text-gray-400 text-center">
                      Currently: {selected.courier} &mdash; {selected.trackingNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
