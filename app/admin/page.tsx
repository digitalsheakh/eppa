'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Logo from '@/components/Logo';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push('/admin/products');
    } else {
      setError('Incorrect password. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <Logo width={80} height={26} />
          </div>
          <h1 className="text-2xl font-bold text-black">Admin Login</h1>
          <p className="text-gray-400 text-sm mt-1">Eppa&apos;s Shop Dashboard</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="Enter admin password"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-red-600 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Logging in...</> : <><Lock className="w-4 h-4" /> Login to Dashboard</>}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          <Link href="/" className="hover:text-black transition-colors inline-flex items-center gap-1">
            <ArrowLeft className="w-3 h-3" /> Back to store
          </Link>
        </p>
      </div>
    </div>
  );
}
