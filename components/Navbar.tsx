'use client';
import Link from 'next/link';
import { ShoppingCart, Menu, X, Search, User, ChevronRight, Package, Droplets, LayoutGrid, MapPin, RefreshCw, Truck } from 'lucide-react';
import { useCartStore } from '@/lib/cartStore';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import Logo from './Logo';
import CartDrawer from './CartDrawer';

const NAV_LINKS = [
  { label: 'All Products',  href: '/shop',                icon: LayoutGrid },
  { label: 'Carrier Bags',  href: '/shop?q=carrier+bags', icon: Package },
  { label: 'Wet Towels',    href: '/shop?q=wet+towels',   icon: Droplets },
  { label: 'Track Order',   href: '/track-order',          icon: MapPin },
];

export default function Navbar() {
  const { itemCount, openCart, isCartOpen } = useCartStore(s => ({
    itemCount: s.itemCount(),
    openCart: s.openCart,
    isCartOpen: s.isCartOpen,
  }));
  const [open, setOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = (open || isCartOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open, isCartOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchVal.trim())}`);
      setOpen(false);
    }
  };

  return (
    <>
      {/* Announcement strip */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Truck className="w-3.5 h-3.5 text-accent-400 shrink-0" />
            <span>Free next-day delivery on orders over £50</span>
          </div>
          <span className="hidden sm:block text-xs text-gray-400">0800 123 4567</span>
        </div>
      </div>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">

          {/* Logo */}
          <Link href="/" className="shrink-0" aria-label="TakeawayBag home">
            <Logo width={152} height={34} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5 ml-2">
            {NAV_LINKS.map(({ label, href }) => (
              <Link key={label} href={href}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                {label}
              </Link>
            ))}
            <Link href="/account"
              className="text-sm font-medium text-accent-600 hover:text-accent-700 px-3 py-2 rounded-lg hover:bg-accent-50 transition-colors whitespace-nowrap flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> Reorder
            </Link>
          </nav>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-2">
            <div className="flex w-full border border-gray-200 rounded-full overflow-hidden focus-within:border-accent-400 focus-within:ring-2 focus-within:ring-accent-100 transition-all bg-white">
              <input
                type="text"
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search products..."
                className="flex-1 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none"
              />
              <button type="submit"
                className="bg-accent-500 hover:bg-accent-600 px-4 flex items-center justify-center shrink-0 rounded-full m-1 transition-colors">
                <Search className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </form>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <Link href="/account"
              className="hidden md:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors px-2.5 py-2 rounded-lg hover:bg-gray-50">
              <User className="w-4 h-4" />
              <span>Account</span>
            </Link>

            <button
              onClick={openCart}
              className="relative flex items-center gap-1.5 bg-accent-500 hover:bg-accent-600 text-white px-3.5 py-2 rounded-full transition-colors text-sm font-semibold shadow-sm">
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
              className="md:hidden p-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
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
              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm md:hidden"
              onClick={() => setOpen(false)}
            />
            <motion.div key="dr"
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white z-50 flex flex-col shadow-2xl md:hidden border-l border-gray-100"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <Logo width={144} height={32} />
                <button onClick={() => setOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="px-4 pt-4 pb-2">
                <form onSubmit={handleSearch}
                  className="flex border border-gray-200 rounded-full overflow-hidden focus-within:border-accent-400 focus-within:ring-2 focus-within:ring-accent-100 bg-white">
                  <input type="text" value={searchVal} onChange={e => setSearchVal(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 px-4 py-2 text-sm focus:outline-none bg-transparent text-gray-900 placeholder:text-gray-400" />
                  <button type="submit"
                    className="bg-accent-500 px-4 flex items-center justify-center rounded-full m-1 hover:bg-accent-600 transition-colors">
                    <Search className="w-3.5 h-3.5 text-white" />
                  </button>
                </form>
              </div>

              <nav className="flex-1 overflow-y-auto px-3 py-3">
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 px-2 mb-2">Shop</p>
                {NAV_LINKS.map(({ label, href, icon: Icon }) => (
                  <Link key={label} href={href} onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-accent-600 transition-colors mb-1">
                    <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-accent-500" />
                    </div>
                    {label}
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                  </Link>
                ))}

                <div className="my-3 border-t border-gray-100" />
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 px-2 mb-2">Account</p>

                <Link href="/account" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors mb-1">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  My Account
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </Link>

                <Link href="/account" onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-accent-600 transition-colors mb-1">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
                    <RefreshCw className="w-4 h-4 text-accent-500" />
                  </div>
                  Reorder
                  <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />
                </Link>

                <button onClick={() => { setOpen(false); openCart(); }}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-accent-600 transition-colors mb-1">
                  <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center shrink-0">
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
                  className="w-full bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold py-3 rounded-full flex items-center justify-center gap-2 transition-colors">
                  <ShoppingCart className="w-4 h-4" /> View Cart &amp; Checkout
                </button>
                <p className="text-center text-xs text-gray-400 mt-2">Free delivery on orders over £50</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer />
    </>
  );
}
