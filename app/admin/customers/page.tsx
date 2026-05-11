'use client';
import { useEffect, useState } from 'react';
import { Loader2, Menu, X, Search, ChevronDown, ChevronUp, Mail, Phone } from 'lucide-react';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';

interface Order {
  id: string;
  reference?: string;
  customerName: string;
  email: string;
  phone?: string;
  total: number;
  status: string;
  createdAt: string;
  items?: { name: string; qty: number; price: number }[];
}

interface Customer {
  email: string;
  name: string;
  phone: string;
  orders: Order[];
  totalSpend: number;
  lastOrder: string;
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

function CustomerRow({ customer }: { customer: Customer }) {
  const [expanded, setExpanded] = useState(false);
  const initial = customer.name.charAt(0).toUpperCase();

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center font-bold text-sm shrink-0">
          {initial}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{customer.name}</p>
          <p className="text-xs text-gray-400 truncate">{customer.email}</p>
        </div>

        {/* Stats */}
        <div className="hidden sm:flex items-center gap-6 shrink-0">
          <div className="text-right">
            <p className="text-xs text-gray-400">Orders</p>
            <p className="text-sm font-bold text-gray-900">{customer.orders.length}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400">Total Spend</p>
            <p className="text-sm font-bold text-gray-900">£{customer.totalSpend.toFixed(2)}</p>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-gray-400">Last Order</p>
            <p className="text-sm font-medium text-gray-700">
              {customer.lastOrder
                ? new Date(customer.lastOrder).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—'}
            </p>
          </div>
        </div>

        {expanded
          ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
          : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50 space-y-4">
          {/* Contact details */}
          <div className="flex flex-wrap gap-4 text-sm">
            <a href={`mailto:${customer.email}`}
              className="flex items-center gap-1.5 text-accent-600 hover:text-accent-700 font-medium">
              <Mail className="w-3.5 h-3.5" /> {customer.email}
            </a>
            {customer.phone && (
              <a href={`tel:${customer.phone}`}
                className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 font-medium">
                <Phone className="w-3.5 h-3.5" /> {customer.phone}
              </a>
            )}
          </div>

          {/* Mobile stats */}
          <div className="flex gap-4 sm:hidden text-sm">
            <div><span className="text-gray-400 text-xs">Orders: </span><span className="font-bold">{customer.orders.length}</span></div>
            <div><span className="text-gray-400 text-xs">Spent: </span><span className="font-bold">£{customer.totalSpend.toFixed(2)}</span></div>
          </div>

          {/* Orders list */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order History</p>
            <div className="space-y-2">
              {customer.orders.map(order => (
                <div key={order.id}
                  className="flex items-center justify-between gap-3 bg-white border border-gray-100 rounded-lg px-3 py-2.5">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{order.reference || order.id}</p>
                    <p className="text-xs text-gray-400">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUS_STYLES[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                    <span className="text-sm font-bold text-gray-900">£{Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/orders')
      .then(r => r.json())
      .then((orders: Order[]) => {
        if (!Array.isArray(orders)) { setLoading(false); return; }

        // Group orders by email
        const map = new Map<string, Customer>();
        for (const order of orders) {
          const email = (order.email || '').toLowerCase().trim();
          if (!email) continue;
          if (!map.has(email)) {
            map.set(email, {
              email,
              name: order.customerName || email,
              phone: order.phone || '',
              orders: [],
              totalSpend: 0,
              lastOrder: '',
            });
          }
          const c = map.get(email)!;
          c.orders.push(order);
          c.totalSpend += Number(order.total) || 0;
          if (!c.lastOrder || order.createdAt > c.lastOrder) c.lastOrder = order.createdAt;
          if (!c.phone && order.phone) c.phone = order.phone;
          if (order.customerName && (!c.name || c.name === email)) c.name = order.customerName;
        }

        // Sort by most recent order
        const list = Array.from(map.values()).sort((a, b) =>
          new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime()
        );

        // Sort each customer's orders newest first
        for (const c of list) {
          c.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        setCustomers(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const totalRevenue = customers.reduce((s, c) => s + c.totalSpend, 0);

  return (
    <div className="min-h-screen bg-gray-50 md:pl-60">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Top bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 md:px-6 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden text-gray-600 hover:text-gray-900">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-gray-900">Customers</h1>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="input pl-9 py-2 text-sm rounded-lg"
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <main className="px-4 md:px-6 py-6 max-w-5xl">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Customers', value: customers.length.toString(), icon: Users },
            { label: 'Total Orders',    value: customers.reduce((s, c) => s + c.orders.length, 0).toString(), icon: ShoppingBag },
            { label: 'Total Revenue',   value: `£${totalRevenue.toFixed(2)}`, icon: Package },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Icon className="w-4 h-4 text-accent-500" />
                <p className="text-xs text-gray-500 font-medium">{label}</p>
              </div>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* Customer list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">{search ? 'No customers match your search' : 'No customers yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(c => <CustomerRow key={c.email} customer={c} />)}
          </div>
        )}
      </main>
    </div>
  );
}
