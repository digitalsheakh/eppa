'use client';
import { useEffect, useState } from 'react';
import { Settings, Save, Loader2, Eye, EyeOff, Menu, X, Package, ShoppingBag, Home, CreditCard, Building2, CheckCircle2, Users } from 'lucide-react';
import Link from 'next/link';

function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const links = [
    { href: '/admin/products',  icon: Package,    label: 'Products' },
    { href: '/admin/orders',    icon: ShoppingBag, label: 'Orders' },
    { href: '/admin/customers', icon: Users,       label: 'Customers' },
    { href: '/admin/settings',  icon: Settings,    label: 'Settings' },
    { href: '/',                icon: Home,        label: 'View Store' },
  ];
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onClose} />}
      <aside className={`fixed top-0 left-0 h-full w-60 bg-gray-900 text-white z-40 flex flex-col transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-5 border-b border-gray-800 flex items-center justify-between">
          <span className="font-bold text-base tracking-tight">Eppas<span className="text-accent-400"> Shop</span></span>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <nav className="flex flex-col gap-1 px-3 pt-4 flex-1">
          {links.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm font-medium transition-colors
                ${href === '/admin/settings' ? 'bg-primary-600 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}>
              <Icon className="w-4 h-4" /> {label}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default function AdminSettingsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [form, setForm] = useState({
    publishableKey: '',
    secretKey: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    sortCode: '',
  });

  useEffect(() => {
    fetch('/api/stripe/settings')
      .then(r => r.json())
      .then(data => {
        setForm({
          publishableKey: data.publishableKey ?? '',
          secretKey: data.secretKey ?? '',
          bankName: data.bankName ?? '',
          accountName: data.accountName ?? '',
          accountNumber: data.accountNumber ?? '',
          sortCode: data.sortCode ?? '',
        });
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await fetch('/api/stripe/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen bg-gray-100 md:pl-60">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 bg-white border border-gray-200 rounded-sm">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-500">Manage Stripe keys and bank transfer details</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary-600" /></div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6 max-w-2xl">

            {/* Stripe Keys */}
            <div className="bg-white border border-gray-200 rounded-sm p-6">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
                <CreditCard className="w-5 h-5 text-primary-600" />
                <h2 className="font-bold text-gray-900">Stripe Payment Keys</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Publishable Key (pk_live_... or pk_test_...)</label>
                  <input
                    type="text"
                    value={form.publishableKey}
                    onChange={e => set('publishableKey', e.target.value)}
                    className="input font-mono text-xs"
                    placeholder="pk_live_..."
                  />
                  <p className="text-xs text-gray-400 mt-1">Used on the frontend. Safe to expose.</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Secret Key (sk_live_... or sk_test_...)</label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={form.secretKey}
                      onChange={e => set('secretKey', e.target.value)}
                      className="input font-mono text-xs pr-10"
                      placeholder="sk_live_..."
                    />
                    <button type="button" onClick={() => setShowSecret(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Keep this secret. Never share publicly.</p>
                </div>
              </div>
            </div>

            {/* Bank Transfer Details */}
            <div className="bg-white border border-gray-200 rounded-sm p-6">
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
                <Building2 className="w-5 h-5 text-primary-600" />
                <h2 className="font-bold text-gray-900">Bank Transfer Details</h2>
              </div>
              <p className="text-xs text-gray-500 mb-4">These details are shown to customers who choose to pay by bank transfer.</p>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Bank Name</label>
                    <input type="text" value={form.bankName} onChange={e => set('bankName', e.target.value)} className="input" placeholder="e.g. Barclays" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Account Name</label>
                    <input type="text" value={form.accountName} onChange={e => set('accountName', e.target.value)} className="input" placeholder="Eppas Shop" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Account Number</label>
                    <input type="text" value={form.accountNumber} onChange={e => set('accountNumber', e.target.value)} className="input font-mono" placeholder="12345678" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Sort Code</label>
                    <input type="text" value={form.sortCode} onChange={e => set('sortCode', e.target.value)} className="input font-mono" placeholder="00-00-00" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={saving}
                className="btn-primary px-6 py-3 gap-2 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              {saved && (
                <span className="flex items-center gap-1.5 text-sm text-primary-600 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Saved successfully
                </span>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
