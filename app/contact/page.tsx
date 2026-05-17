'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, MessageSquare, Clock, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || 'Something went wrong. Please email us directly.');
      }
    } catch {
      setError('Something went wrong. Please email us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <p className="eyebrow mb-2">Get In Touch</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-black mb-3">Contact Us</h1>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Have a question or need help? We&apos;re here and happy to assist.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Info cards */}
            <motion.div
              className="lg:col-span-2 space-y-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {[
                {
                  icon: Mail,
                  title: 'Email Us',
                  desc: 'For orders, returns, and general enquiries.',
                  value: 'eppa.shop.uk@gmail.com',
                  href: 'mailto:eppa.shop.uk@gmail.com',
                },
                {
                  icon: MessageSquare,
                  title: 'Fragrance Advice',
                  desc: 'Not sure which scent to pick? We love helping.',
                  value: 'eppa.shop.uk@gmail.com',
                  href: 'mailto:eppa.shop.uk@gmail.com',
                },
                {
                  icon: Clock,
                  title: 'Response Time',
                  desc: 'We typically reply within 24 hours on business days.',
                  value: 'Mon–Fri, 9am–5pm',
                  href: null,
                },
              ].map(({ icon: Icon, title, desc, value, href }) => (
                <div key={title} className="bg-white border border-gray-100 rounded-2xl p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-black" />
                  </div>
                  <div>
                    <p className="font-bold text-black text-sm mb-0.5">{title}</p>
                    <p className="text-xs text-gray-400 mb-1">{desc}</p>
                    {href ? (
                      <a href={href} className="text-sm font-semibold text-black hover:underline">{value}</a>
                    ) : (
                      <p className="text-sm font-semibold text-black">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Contact form */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-8">
                {sent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-10 gap-4"
                  >
                    <div className="w-14 h-14 rounded-full bg-black flex items-center justify-center">
                      <CheckCircle2 className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-black">Message Sent!</h2>
                    <p className="text-sm text-gray-500 max-w-xs">
                      Thank you for getting in touch. We&apos;ll get back to you within 24 hours.
                    </p>
                    <button
                      onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                      className="mt-2 text-sm font-semibold text-black hover:underline"
                    >
                      Send another message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                        <input
                          className="input"
                          placeholder="John Smith"
                          required
                          value={form.name}
                          onChange={e => set('name', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                        <input
                          type="email"
                          className="input"
                          placeholder="john@example.com"
                          required
                          value={form.email}
                          onChange={e => set('email', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Subject <span className="text-red-500">*</span></label>
                      <input
                        className="input"
                        placeholder="e.g. Question about my order"
                        required
                        value={form.subject}
                        onChange={e => set('subject', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Message <span className="text-red-500">*</span></label>
                      <textarea
                        className="input resize-none"
                        rows={5}
                        placeholder="Tell us how we can help..."
                        required
                        value={form.message}
                        onChange={e => set('message', e.target.value)}
                      />
                    </div>
                    {error && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
                    )}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-black hover:bg-gray-900 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-60"
                    >
                      {loading
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
                        : <><Send className="w-4 h-4" /> Send Message</>
                      }
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
