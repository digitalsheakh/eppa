'use client';
import { useEffect, useState } from 'react';
import { Loader2, Menu, Mail, Download, Send, CheckCircle, AlertCircle } from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';

interface Subscriber { email: string; subscribedAt: string; }

type SendStatus = null | 'sending' | { sent: number; failed: number; total: number } | 'error';

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sendStatus, setSendStatus] = useState<SendStatus>(null);

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

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;
    setSendStatus('sending');
    try {
      const res = await fetch('/api/subscribers/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, body }),
      });
      const data = await res.json();
      if (res.ok) {
        setSendStatus({ sent: data.sent, failed: data.failed, total: data.total });
        setSubject('');
        setBody('');
      } else {
        setSendStatus('error');
      }
    } catch {
      setSendStatus('error');
    }
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

        <main className="flex-1 p-4 sm:p-6 space-y-5">
          {/* Stats */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-gray-700" />
            </div>
            <div>
              <p className="text-2xl font-bold text-black">{loading ? '—' : subscribers.length}</p>
              <p className="text-xs text-gray-400">Total Subscribers</p>
            </div>
          </div>

          {/* Email Composer */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center gap-2">
              <Send className="w-4 h-4 text-gray-400" />
              <h2 className="font-semibold text-gray-900 text-sm">Send Marketing Email</h2>
              <span className="ml-auto text-xs text-gray-400">
                {loading ? '—' : `${subscribers.length} recipient${subscribers.length !== 1 ? 's' : ''}`}
              </span>
            </div>
            <div className="p-5 space-y-4">
              {sendStatus && sendStatus !== 'sending' && (
                <div className={`flex items-center gap-2.5 p-3.5 rounded-xl text-sm font-semibold ${
                  sendStatus === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}>
                  {sendStatus === 'error'
                    ? <><AlertCircle className="w-4 h-4 shrink-0" /> Failed to send. Check your email configuration.</>
                    : <><CheckCircle className="w-4 h-4 shrink-0" /> Sent to {(sendStatus as { sent: number }).sent} subscriber{(sendStatus as { sent: number }).sent !== 1 ? 's' : ''}{(sendStatus as { failed: number }).failed > 0 ? `, ${(sendStatus as { failed: number }).failed} failed` : ''}.</>
                  }
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject</label>
                <input
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-black transition-colors"
                  placeholder="e.g. New arrivals just dropped 🌟"
                  value={subject}
                  onChange={e => { setSubject(e.target.value); setSendStatus(null); }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Message</label>
                <textarea
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-black transition-colors resize-none"
                  placeholder="Write your message here..."
                  rows={6}
                  value={body}
                  onChange={e => { setBody(e.target.value); setSendStatus(null); }}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSend}
                  disabled={!subject.trim() || !body.trim() || sendStatus === 'sending' || subscribers.length === 0}
                  className="flex items-center gap-2 bg-black hover:bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {sendStatus === 'sending'
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                    : <><Send className="w-4 h-4" /> Send to All Subscribers</>
                  }
                </button>
                {subscribers.length === 0 && !loading && (
                  <p className="text-xs text-gray-400">No subscribers to send to yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Subscriber list */}
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : subscribers.length === 0 ? (
            <div className="text-center py-16 bg-white border border-gray-200 rounded-xl">
              <Mail className="w-10 h-10 mx-auto mb-3 text-gray-200" />
              <p className="text-sm font-semibold text-gray-600">No subscribers yet</p>
              <p className="text-xs text-gray-400 mt-1">Subscribers from the footer newsletter form and new registrations will appear here.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900 text-sm">Subscriber List</h2>
              </div>
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
