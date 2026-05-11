'use client';
import { useEffect, useState } from 'react';
import { Loader2, Menu, Mail, Download } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

interface Subscriber { email: string; subscribedAt: string; }

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch('/api/subscribers')
      .then(r => r.json())
      .then(d => { setSubscribers(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const exportCSV = () => {
    const rows = [['Email', 'Subscribed At'], ...subscribers.map(s => [s.email, new Date(s.subscribedAt).toLocaleString('en-GB')])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'subscribers.csv';
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:ml-56 flex flex-col min-h-screen">
        <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 sm:px-6 gap-3 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="md:hidden p-1.5 hover:bg-gray-100 rounded">
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-bold text-gray-900">Subscribers</h1>
          {!loading && subscribers.length > 0 && (
            <button onClick={exportCSV}
              className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-black border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          )}
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {/* Stats */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6 flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-black">{loading ? '—' : subscribers.length}</p>
              <p className="text-xs text-gray-400">Total Subscribers</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
              <Mail className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="text-sm font-semibold text-gray-600">No subscribers yet</p>
              <p className="text-xs text-gray-400 mt-1">Subscribers from the footer newsletter form will appear here.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Subscribed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscribers.map(s => (
                    <tr key={s.email} className="hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                            {s.email.charAt(0).toUpperCase()}
                          </div>
                          <a href={`mailto:${s.email}`} className="text-gray-900 hover:underline font-medium">{s.email}</a>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-gray-400 text-xs hidden sm:table-cell">
                        {s.subscribedAt ? new Date(s.subscribedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
