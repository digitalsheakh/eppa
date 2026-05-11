'use client';
import Link from 'next/link';
import { ShoppingCart, Menu, X, Search, User, ChevronRight, Sparkles, LayoutGrid, MapPin, RefreshCw } from 'lucide-react';
import { useCartStore } from '@/lib/cartStore';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Logo from './Logo';
import CartDrawer from './CartDrawer';

const NAV_LINKS = [
  { label: 'All Products',  href: '/shop',               icon: LayoutGrid },
  { label: 'Fragrances',   href: '/shop?q=fragrance',   icon: Sparkles },
  { label: 'Track Order',  href: '/track-order',         icon: MapPin },
];

const ANNOUNCEMENTS = [
  'Free delivery on orders over £50 🚚',
  'Minimum order £20 — shop our fragrances today ✨',
  'Trusted quality · Fast delivery · Easy returns 🌟',
];

export default function Navbar() {
  const { itemCount, openCart, isCartOpen } = useCartStore(s => ({
    itemCount: s.itemCount(),
    openCart: s.openCart,
    isCartOpen: s.isCartOpen,
  }));
  const [open, setOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [annoIdx, setAnnoIdx] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = (open || isCartOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open, isCartOpen]);

  useEffect(() => {
    const t = setInterval(() => setAnnoIdx(i => (i + 1) % ANNOUNCEMENTS.length), 3500);
    return () => clearInterval(t);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchVal.trim())}`);
      setOpen(false);
    }
  };

  return (
    <>
      {/* Announcement strip — rotating */}
      <div className="bg-gray-950 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 relative h-7 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={annoIdx}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="absolute text-xs font-medium text-gray-200 tracking-wide text-center"
            >
              {ANNOUNCEMENTS[annoIdx]}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>

      {/* Main header */}
      <header className="bg-white sticky top-0 z-40 border-b border-gray-100" style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.06)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center gap-3">

          {/* Logo */}
          <Link href="/" className="shrink-0 flex items-center" aria-label="Eppa's Shop home">
            <Logo width={160} height={44} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 ml-4">
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={label} href={href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3.5 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 whitespace-nowrap">
                {label}
              </Link>
            ))}
            <Link href="/account"
              className="text-sm font-semibold text-accent-600 hover:text-accent-700 px-3.5 py-2 rounded-xl hover:bg-orange-50 transition-colors whitespace-nowrap flex items-center gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Reorder
            </Link>
          </nav>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-3 max-w-md">
            <div className="flex w-full border border-gray-200 rounded-2xl overflow-hidden focus-within:border-accent-400 focus-within:ring-2 focus-within:ring-accent-100 transition-all bg-gray-50">
              <input
                type="text"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search fragrances..."
                className="flex-1 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
              />
              <button type="submit"
                className="bg-accent-500 hover:bg-accent-600 px-4 flex items-center justify-center shrink-0 rounded-2xl m-1 transition-colors">
                <Search className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <Link href="/account"
              className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-xl hover:bg-gray-50">
              <User className="w-4 h-4" />
              <span>Account</span>
            </Link>

            <button
              onClick={openCart}
              className="relative flex items-center gap-1.5 bg-accent-500 hover:bg-accent-600 active:bg-accent-700 text-white px-4 py-2 rounded-2xl transition-colors text-sm font-semibold shadow-sm shadow-accent-200">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:block">Cart</span>
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                    className="bg-white text-accent-600 text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-black leading-none">
                    {itemCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <button
              className="md:hidden p-2 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              onClick={() => setOpen(true)}
              aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile nav drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div key="dr"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[88vw] bg-white z-50 flex flex-col shadow-2xl md:hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                <Logo width={140} height={38} />
                <button onClick={() => setOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div className="px-4 pt-4 pb-2">
                <form onSubmit={handleSearch}
                  className="flex border border-gray-200 rounded-2xl overflow-hidden focus-within:border-accent-400 focus-within:ring-2 focus-within:ring-accent-100 bg-gray-50">
                  <input type="text" value={searchVal} onChange={e => setSearchVal(e.target.value)}
                    placeholder="Search fragrances..."
                    className="flex-1 px-4 py-2.5 text-sm focus:outline-none bg-transparent text-gray-900 placeholder:text-gray-400" />
                  <button type="submit"
                    className="bg-accent-500 px-4 flex items-center justify-center rounded-2xl m-1 hover:bg-accent-600 transition-colors">
                    <Search className="w-3.5 h-3.5 text-white" />
                  </button>
                </form>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-2">
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 px-2 mb-2">Shop</p>
                {NAV_LINKS.map(({ label, href, icon: Icon }) => (
                  <Link key={label} href={href} onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-accent-600 transition-colors mb-1">
                    <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-accent-500" />
                    </div>
                    {label}
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                  </Link>
                ))}

                <div className="my-3 border-t border-gray-100" />
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 px-2 mb-2">Account</p>

                <Link href="/account" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-1">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  My Account
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </Link>

                <Link href="/account" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-accent-600 transition-colors mb-1">
                  <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                    <RefreshCw className="w-4 h-4 text-accent-500" />
                  </div>
                  Reorder
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </Link>

                <button onClick={() => { setOpen(false); openCart(); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-accent-600 transition-colors mb-1">
                  <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
                    <ShoppingCart className="w-4 h-4 text-accent-500" />
                  </div>
                  <span className="flex-1 text-left">View Cart</span>
                  {itemCount > 0 && (
                    <span className="bg-accent-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{itemCount}</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                </button>
              </nav>

              <div className="px-4 py-4 border-t border-gray-100 bg-gray-50">
                <button onClick={() => { setOpen(false); openCart(); }}
                  className="w-full bg-accent-500 hover:bg-accent-600 text-white text-sm font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-sm">
                  <ShoppingCart className="w-4 h-4" /> View Cart &amp; Checkout
                </button>
                <p className="text-center text-xs text-gray-400 mt-2">Minimum order £20 · Free delivery over £50</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer />
    </>
  );
}
