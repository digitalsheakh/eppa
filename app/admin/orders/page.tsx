'use client';
import { useEffect, useState } from 'react';
import { Loader2, Menu, TrendingUp, Clock, CheckCircle, PoundSterling, ShoppingBag, Search, RotateCcw, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

interface Order {
  id: string; reference?: string; customerName: string; email: string;
  total: number; status: string; createdAt: string; paymentMethod?: string;
}
interface ReturnRequest {
  id: string; orderId: string; orderReference: string; customerName: string;
  email: string; reason: string; status: string; createdAt: string;
}

const STATUS_STYLES: Record<string, string> = {
  pending:         'bg-yellow-100 text-yellow-700',
  pending_payment: 'bg-orange-100 text-orange-700',
  confirmed:       'bg-blue-100 text-blue-700',
  processing:      'bg-purple-100 text-purple-700',
  dispatched:      'bg-indigo-100 text-indigo-700',
  delivered:       'bg-green-100 text-green-700',
  cancelled:       'bg-red-100 text-red-700',
};

const RETURN_STYLES: Record<string, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

type Tab = 'all' | 'awaiting' | 'delivered' | 'returns';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');
  const [updatingReturn, setUpdatingReturn] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [ordersRes, returnsRes] = await Promise.all([
      fetch('/api/orders').then(r => r.json()),
      fetch('/api/returns').then(r => r.json()),
    ]);
    setOrders(Array.isArray(ordersRes) ? ordersRes : []);
    setReturns(Array.isArray(returnsRes) ? returnsRes : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleReturnStatus = async (id: string, status: string) => {
    setUpdatingReturn(id);
    await fetch('/api/returns', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, status }) });
    setReturns(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setUpdatingReturn(null);
  };

  const stats = {
    total: orders.length,
    awaiting: orders.filter(o => ['pending','pending_payment','confirmed','processing'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    revenue: orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0),
  };

  const AWAITING = ['pending','pending_payment','confirmed','processing'];
  const q = search.toLowerCase();

  const filteredOrders = orders.filter(o => {
    const matchTab = tab === 'all' ? true
      : tab === 'awaiting' ? AWAITING.includes(o.status)
      : tab === 'delivered' ? o.status === 'delivered'
      : false;
    const matchSearch = !q || o.customerName?.toLowerCase().includes(q) || o.email?.toLowerCase().includes(q)
      || (o.reference || '').toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const filteredReturns = returns.filter(r =>
    !q || r.customerName?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q)
      || r.orderReference?.toLowerCase().includes(q)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 hover:bg-gray-100 rounded">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-bold text-gray-900">Orders</h1>
          <button onClick={load} className="ml-auto text-xs text-gray-500 hover:text-black font-medium px-3 py-1.5 border border-gray-200 rounded-lg hover:border-gray-400 transition-colors">
            Refresh
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Orders', value: stats.total, icon: TrendingUp, color: 'text-gray-900', bg: 'bg-gray-100' },
              { label: 'Awaiting Despatch', value: stats.awaiting, icon: Clock, color: 'text-yellow-700', bg: 'bg-yellow-100' },
              { label: 'Delivered', value: stats.delivered, icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-100' },
              { label: 'Revenue', value: `£${stats.revenue.toFixed(2)}`, icon: PoundSterling, color: 'text-gray-900', bg: 'bg-gray-100' },
            ].map(s => (
              <div key={s.label} className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 ${s.bg} flex items-center justify-center rounded-lg`}>
                    <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                  </div>
                  <p className="text-xs text-gray-500">{s.label}</p>
                </div>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs + Search */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 gap-0.5">
              {([
                { key: 'all', label: 'All Orders' },
                { key: 'awaiting', label: 'Awaiting Despatch' },
                { key: 'delivered', label: 'Delivered' },
                { key: 'returns', label: `Returns${returns.filter(r => r.status === 'pending').length > 0 ? ` (${returns.filter(r => r.status === 'pending').length})` : ''}` },
              ] as { key: Tab; label: string }[]).map(t => (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                    tab === t.key ? 'bg-black text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, email or order ID..."
                className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : tab === 'returns' ? (
            /* Returns tab */
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {filteredReturns.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <RotateCcw className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                  <p className="text-sm">No return requests yet.</p>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {['Order', 'Customer', 'Reason', 'Date', 'Status', ''].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredReturns.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs font-bold text-gray-900">#{r.orderReference || r.orderId.slice(0,8)}</td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-900">{r.customerName}</p>
                          <p className="text-gray-400 text-xs">{r.email}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-600 max-w-xs">
                          <p className="truncate text-xs">{r.reason}</p>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(r.createdAt).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${RETURN_STYLES[r.status] || 'bg-gray-100 text-gray-600'}`}>
                            {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {r.status === 'pending' && (
                            <div className="flex gap-1.5">
                              <button onClick={() => handleReturnStatus(r.id, 'approved')} disabled={updatingReturn === r.id}
                                className="text-xs px-2.5 py-1 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-medium transition-colors">
                                Approve
                              </button>
                              <button onClick={() => handleReturnStatus(r.id, 'rejected')} disabled={updatingReturn === r.id}
                                className="text-xs px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg font-medium transition-colors">
                                Reject
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            /* Orders table */
            <>
              <div className="hidden sm:block bg-white border border-gray-200 rounded-xl overflow-hidden">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm">{search ? 'No orders match your search.' : 'No orders yet.'}</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        {['Order ID', 'Customer', 'Total', 'Date', 'Status', ''].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.map(order => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <span className="font-bold text-gray-900 font-mono text-sm">
                              #{order.reference || order.id.slice(0, 8)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-gray-900">{order.customerName}</p>
                            <p className="text-gray-400 text-xs">{order.email}</p>
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900">£{order.total.toFixed(2)}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString('en-GB')}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                              {order.status === 'pending_payment' ? 'Awaiting Payment' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <Link href={`/admin/orders/${order.id}`}
                              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-black transition-colors px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg">
                              View <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Mobile */}
              <div className="sm:hidden space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-gray-200 rounded-xl text-gray-400">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="text-sm">{search ? 'No orders match.' : 'No orders yet.'}</p>
                  </div>
                ) : filteredOrders.map(order => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`}
                    className="block bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-bold text-gray-900 font-mono">#{order.reference || order.id.slice(0,8)}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{order.customerName}</p>
                      </div>
                      <p className="font-bold text-gray-900">£{order.total.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                        {order.status === 'pending_payment' ? 'Awaiting Payment' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
