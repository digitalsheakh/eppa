'use client';
import Link from 'next/link';
import { ShoppingBag, Search, X, ChevronRight, User, MapPin } from 'lucide-react';
import { useCartStore } from '@/lib/cartStore';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Logo from './Logo';
import CartDrawer from './CartDrawer';

export default function Navbar() {
  const { itemCount, openCart, isCartOpen } = useCartStore(s => ({
    itemCount: s.itemCount(),
    openCart: s.openCart,
    isCartOpen: s.isCartOpen,
  }));
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { setOpen(false); setSearchOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = (open || isCartOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open, isCartOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchVal.trim())}`);
      setSearchOpen(false);
      setOpen(false);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">

          {/* Logo — left */}
          <Link href="/" className="shrink-0" aria-label="Eppa's Shop">
            <Logo width={62} height={20} />
          </Link>

          {/* Desktop nav — centre */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-700 hover:text-black transition-colors">Home</Link>
            <Link href="/shop" className="text-sm text-gray-700 hover:text-black transition-colors">Shop</Link>
            <Link href="/contact" className="text-sm text-gray-700 hover:text-black transition-colors">Contact</Link>
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-3">
            {/* Desktop search */}
            <div className="hidden md:flex items-center">
              <AnimatePresence mode="wait">
                {searchOpen ? (
                  <motion.form
                    key="open"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSearch}
                    className="flex items-center border border-gray-300 rounded-full overflow-hidden bg-white"
                  >
                    <input
                      autoFocus
                      type="text"
                      value={searchVal}
                      onChange={e => setSearchVal(e.target.value)}
                      placeholder="Search..."
                      className="flex-1 px-3 py-1.5 text-sm text-gray-900 focus:outline-none bg-transparent"
                    />
                    <button type="button" onClick={() => { setSearchOpen(false); setSearchVal(''); }}
                      className="p-1.5 text-gray-400 hover:text-gray-700">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.form>
                ) : (
                  <motion.button key="closed" onClick={() => setSearchOpen(true)}
                    className="p-1.5 text-gray-600 hover:text-black transition-colors">
                    <Search className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <Link href="/account" className="hidden md:block p-1.5 text-gray-600 hover:text-black transition-colors">
              <User style={{ width: 18, height: 18 }} />
            </Link>

            {/* Cart */}
            <button onClick={openCart}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-900 hover:text-black transition-colors p-1.5">
              <ShoppingBag style={{ width: 18, height: 18 }} />
              <span className="text-sm font-semibold">{itemCount}</span>
            </button>

            {/* Mobile hamburger */}
            <button className="md:hidden p-1.5 text-gray-600" onClick={() => setOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div key="bd"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div key="dr"
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 left-0 h-full w-72 bg-white z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <Logo width={55} height={18} />
                <button onClick={() => setOpen(false)} className="p-2 text-gray-400 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex-1 px-4 py-4 space-y-1">
                {[['Home', '/'], ['Shop', '/shop'], ['Contact', '/contact'], ['My Account', '/account']].map(([label, href]) => (
                  <Link key={label} href={href} onClick={() => setOpen(false)}
                    className="flex items-center justify-between px-3 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition-colors">
                    {label}
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </Link>
                ))}
              </nav>
              <div className="px-4 py-4 border-t border-gray-100">
                <button onClick={() => { setOpen(false); openCart(); }}
                  className="w-full bg-black text-white text-sm font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> View Cart ({itemCount})
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer />
    </>
  );
}
