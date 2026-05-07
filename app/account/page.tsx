'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import type { UserProfile } from '@/contexts/AuthContext';
import {
  User, Package, LogOut, Loader2, KeyRound, MapPin, Save, CheckCircle2,
  LogIn, UserPlus, ShoppingBag, Clock, XCircle, Truck, CheckCircle,
  AlertCircle, Edit2, Eye, EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS: Record<string, { label: string; color: string; icon: any }> = {
  pending:         { label: 'Pending',         color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  pending_payment: { label: 'Awaiting Payment', color: 'bg-orange-100 text-orange-700', icon: Clock },
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

// ─── Order History ────────────────────────────────────────────────────────────

interface Order { id: string; reference?: string; customerName: string; email: string; total: number; status: string; createdAt: string; }

function OrderHistory({ email }: { email: string }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders?email=${encodeURIComponent(email)}`)
      .then(r => r.json())
      .then(d => { setOrders(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [email]);

  if (loading) return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => <div key={i} className="h-20 skeleton rounded-xl" />)}
    </div>
  );

  if (!orders.length) return (
    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
      <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-3" />
      <p className="text-sm font-semibold text-gray-600">No orders yet</p>
      <p className="text-xs text-gray-400 mt-1">Your orders will appear here once you shop.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {orders.map(order => (
        <div key={order.id}
          className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{order.reference || order.id}</p>
              <p className="text-xs text-gray-500">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 sm:flex-row-reverse sm:text-right">
            <StatusBadge status={order.status} />
            <span className="text-sm font-bold text-gray-900">£{Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

type DashTab = 'orders' | 'address';

function AccountDashboard() {
  const { user, profile, logout, saveProfile } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [tab, setTab] = useState<DashTab>('orders');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* Profile card */}
      <div className="relative bg-gradient-to-br from-primary-700 to-primary-500 rounded-2xl p-5 overflow-hidden">
        <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full pointer-events-none" />
        <div className="absolute right-8 bottom-0 w-20 h-20 bg-white/5 rounded-full pointer-events-none" />
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-xl font-bold shrink-0 overflow-hidden">
              {user?.photoURL
                ? <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
                : initial}
            </div>
            <div className="min-w-0">
              <p className="text-white/70 text-xs font-medium">Welcome back</p>
              <h2 className="text-white text-lg font-bold leading-tight truncate">{name}</h2>
              <p className="text-white/60 text-xs truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-medium transition-colors shrink-0 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl"
          >
            {loggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
            Sign out
          </button>
        </div>
      </div>

      {/* Tabs + content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-100">
          {([
            { key: 'orders',  label: 'Orders',   icon: Package },
            { key: 'address', label: 'Delivery',  icon: MapPin },
          ] as { key: DashTab; label: string; icon: any }[]).map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-semibold transition-all ${
                tab === t.key
                  ? 'text-primary-600 border-b-2 border-primary-600 bg-primary-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              <t.icon className="w-4 h-4" />{t.label}
            </button>
          ))}
        </div>

        <div className="p-4 sm:p-5">
          <AnimatePresence mode="wait">
            {tab === 'orders' && (
              <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <OrderHistory email={user?.email ?? ''} />
              </motion.div>
            )}

            {tab === 'address' && (
              <motion.div key="address" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {saved && (
                  <div className="flex items-center gap-2 text-sm text-primary-700 bg-primary-50 border border-primary-200 rounded-xl px-3 py-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> Details saved successfully!
                  </div>
                )}
                {!editing ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500">Auto-filled at checkout.</p>
                      <button onClick={() => setEditing(true)}
                        className="flex items-center gap-1.5 text-sm text-primary-600 font-semibold hover:text-primary-700">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Full Name', value: form.displayName },
                        { label: 'Phone', value: form.phone },
                        { label: 'Address Line 1', value: form.addressLine1 },
                        { label: 'Address Line 2', value: form.addressLine2 },
                        { label: 'City', value: form.city },
                        { label: 'Postcode', value: form.postcode },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-[10px] text-gray-400 font-medium mb-0.5 uppercase tracking-wide">{label}</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {value || <span className="text-gray-300 font-normal">Not set</span>}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-3">
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
                        className="flex-1 sm:flex-none btn-primary px-5 py-2.5 gap-2 text-sm justify-center disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Details
                      </button>
                      <button type="button" onClick={() => setEditing(false)}
                        className="flex-1 sm:flex-none px-5 py-2.5 text-sm text-gray-500 hover:text-gray-700 font-medium border border-gray-200 rounded-sm text-center">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-1">Reset Password</h2>
          <p className="text-sm text-gray-500 mb-5">Enter your email and we'll send a reset link.</p>
          <form onSubmit={handleReset} className="space-y-4">
            <input required name="email" type="email" value={form.email} onChange={handle}
              className="input rounded-xl" placeholder="your@email.com" />
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">{error}</p>}
            {success && <p className="text-sm text-primary-700 bg-primary-50 border border-primary-100 px-3 py-2 rounded-xl">{success}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 rounded-xl">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><KeyRound className="w-4 h-4" /> Send Reset Email</>}
            </button>
          </form>
          <button onClick={() => setShowReset(false)}
            className="mt-4 text-sm text-gray-500 hover:text-primary-600 w-full text-center transition-colors">
            ← Back to Sign In
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto">
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

        <AnimatePresence mode="wait">
          <motion.form key={tab}
            initial={{ opacity: 0, x: tab === 'login' ? -6 : 6 }}
            animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            onSubmit={handleSubmit} className="space-y-3">

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
            {success && <p className="text-sm text-primary-700 bg-primary-50 border border-primary-100 px-3 py-2 rounded-xl">{success}</p>}

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-sm rounded-xl mt-1">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                tab === 'login'
                  ? <><LogIn className="w-4 h-4" /> Sign In</>
                  : <><UserPlus className="w-4 h-4" /> Create Account</>}
            </button>

            {tab === 'login' && (
              <button type="button" onClick={() => setShowReset(true)}
                className="text-xs text-gray-500 hover:text-primary-600 w-full text-center pt-1 transition-colors">
                Forgot your password?
              </button>
            )}
          </motion.form>
        </AnimatePresence>
      </div>
    </motion.div>
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
              <div className="w-10 h-10 rounded-full border-4 border-primary-100 border-t-primary-600 animate-spin" />
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          </div>
        ) : user ? (
          <AccountDashboard />
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-primary-600 flex items-center justify-center mx-auto mb-4 rounded-2xl shadow-lg shadow-primary-200">
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
