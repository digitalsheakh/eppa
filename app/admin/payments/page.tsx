'use client';
import { useEffect, useState } from 'react';
import { Loader2, Menu, PoundSterling, CreditCard, Building2, TrendingUp, ShoppingBag, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

interface Order {
  id: string; reference?: string; customerName: string; total: number;
  status: string; createdAt: string; paymentMethod?: string;
}

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/orders').then(r => r.json())
      .then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const paid = orders.filter(o => o.status !== 'cancelled');
  const revenue = paid.reduce((s, o) => s + o.total, 0);
  const cardOrders = paid.filter(o => o.paymentMethod !== 'bank_transfer');
  const bankOrders = paid.filter(o => o.paymentMethod === 'bank_transfer');
  const cardRevenue = cardOrders.reduce((s, o) => s + o.total, 0);
  const bankRevenue = bankOrders.reduce((s, o) => s + o.total, 0);
  const avgOrder = paid.length > 0 ? revenue / paid.length : 0;

  // Group by month
  const byMonth: Record<string, number> = {};
  paid.forEach(o => {
    const month = new Date(o.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
    byMonth[month] = (byMonth[month] || 0) + o.total;
  });
  const monthEntries = Object.entries(byMonth).slice(-6).reverse();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 hover:bg-gray-100 rounded">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-bold text-gray-900">Payments & Revenue</h1>
        </header>

        <main className="flex-1 p-4 sm:p-6 space-y-5">
          {loading ? (
            <div className="flex justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { label: 'Total Revenue', value: `£${revenue.toFixed(2)}`, icon: PoundSterling, color: 'text-gray-900', bg: 'bg-gray-100' },
                  { label: 'Card Payments', value: `£${cardRevenue.toFixed(2)}`, icon: CreditCard, color: 'text-blue-700', bg: 'bg-blue-100' },
                  { label: 'Bank Transfers', value: `£${bankRevenue.toFixed(2)}`, icon: Building2, color: 'text-purple-700', bg: 'bg-purple-100' },
                  { label: 'Avg. Order Value', value: `£${avgOrder.toFixed(2)}`, icon: TrendingUp, color: 'text-green-700', bg: 'bg-green-100' },
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Monthly breakdown */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900 text-sm">Revenue by Month</h2>
                  </div>
                  <div className="p-5 space-y-3">
                    {monthEntries.length === 0 ? (
                      <p className="text-sm text-gray-400 text-center py-6">No data yet.</p>
                    ) : monthEntries.map(([month, amt]) => {
                      const pct = revenue > 0 ? (amt / revenue) * 100 : 0;
                      return (
                        <div key={month}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium text-gray-700">{month}</span>
                            <span className="font-bold text-gray-900">£{amt.toFixed(2)}</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-black rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payment method split */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900 text-sm">Payment Methods</h2>
                  </div>
                  <div className="p-5 space-y-4">
                    {[
                      { label: 'Card Payments', count: cardOrders.length, revenue: cardRevenue, icon: CreditCard, color: 'bg-blue-500' },
                      { label: 'Bank Transfers', count: bankOrders.length, revenue: bankRevenue, icon: Building2, color: 'bg-purple-500' },
                    ].map(m => (
                      <div key={m.label} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-9 h-9 ${m.color} bg-opacity-10 rounded-lg flex items-center justify-center`}>
                          <m.icon className="w-4 h-4 text-gray-700" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                          <p className="text-xs text-gray-500">{m.count} order{m.count !== 1 ? 's' : ''}</p>
                        </div>
                        <p className="font-bold text-gray-900">£{m.revenue.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent transactions */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-gray-400" />
                  <h2 className="font-semibold text-gray-900 text-sm">Recent Transactions</h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {paid.slice(0, 20).map(order => (
                    <Link key={order.id} href={`/admin/orders/${order.id}`}
                      className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors group">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 font-mono">#{order.reference || order.id.slice(0,8)}</p>
                        <p className="text-xs text-gray-400">{order.customerName} · {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            order.paymentMethod === 'bank_transfer' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                          }`}>
                            {order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Card'}
                          </span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-bold text-gray-900">£{order.total.toFixed(2)}</p>
                          <p className={`text-xs font-semibold ${
                            order.status === 'delivered' ? 'text-green-600'
                            : order.status === 'cancelled' ? 'text-red-500'
                            : 'text-gray-400'
                          }`}>{order.status === 'pending_payment' ? 'Awaiting Payment' : order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
