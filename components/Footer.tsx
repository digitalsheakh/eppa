'use client';
import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
    } catch {}
    setSubmitted(true);
  };

  return (
    <footer className="bg-white border-t border-gray-200">

      {/* Inner circle signup */}
      <div className="border-b border-gray-200">
        <motion.div
          className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 text-center"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-3">Newsletter</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2 tracking-tight">
            Join The Inner Circle
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Giveaways, free samples and much more.
          </p>
          {submitted ? (
            <motion.p
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-sm font-semibold text-black"
            >
              ✓ You&apos;re in! Welcome to the inner circle.
            </motion.p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-black transition-colors"
              />
              <button type="submit"
                className="bg-black hover:bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </form>
          )}
        </motion.div>
      </div>

      {/* Bottom bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Link href="/" aria-label="Eppa's Shop">
          <Logo width={70} height={22} />
        </Link>
        <p className="text-xs text-gray-400 order-last sm:order-none">
          &copy; {new Date().getFullYear()} Eppa&apos;s Shop. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <Link href="/refund-policy" className="hover:text-black transition-colors">Refund Policy</Link>
          <Link href="/delivery-policy" className="hover:text-black transition-colors">Delivery Policy</Link>
        </div>
      </div>
    </footer>
  );
}
