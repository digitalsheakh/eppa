'use client';
import { useEffect, useState, Suspense } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/db';
import { useSearchParams } from 'next/navigation';

const SORT_OPTIONS = [
  { label: 'Name A-Z',        value: 'name_asc' },
  { label: 'Name Z-A',        value: 'name_desc' },
  { label: 'Price: Low-High', value: 'price_asc' },
  { label: 'Price: High-Low', value: 'price_desc' },
];

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2.5">
        <div className="h-2 skeleton rounded w-1/3" />
        <div className="h-3.5 skeleton rounded w-full" />
        <div className="h-3 skeleton rounded w-3/4" />
        <div className="h-9 skeleton rounded mt-3" />
      </div>
    </div>
  );
}

function ShopContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name_asc');
  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearch(q);
  }, [searchParams]);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = products
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'name_asc')   return a.name.localeCompare(b.name);
      if (sort === 'name_desc')  return b.name.localeCompare(a.name);
      if (sort === 'price_asc')  return a.price - b.price;
      return b.price - a.price;
    });

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="eyebrow mb-1.5">All Products</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fragrances &amp; More</h1>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <input
                    className="input pl-10 pr-8 h-10 w-52 text-sm"
                    placeholder="Search products..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Sort */}
                <div className="relative flex items-center">
                  <SlidersHorizontal className="absolute left-3 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <select
                    className="input h-10 text-sm pl-9 pr-4 cursor-pointer appearance-none"
                    value={sort}
                    onChange={e => setSort(e.target.value)}
                  >
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="py-20 border border-gray-200 rounded-xl bg-white flex flex-col items-center gap-3 text-center"
            >
              <Search className="w-10 h-10 text-gray-300" />
              <p className="eyebrow">Nothing found</p>
              <p className="text-sm text-gray-500">
                {search ? <>No products match <strong className="text-gray-900">&quot;{search}&quot;</strong>.</> : 'No products available yet.'}
              </p>
              {search && <button onClick={() => setSearch('')} className="text-sm text-black font-semibold hover:underline mt-1">Clear search</button>}
            </motion.div>
          ) : (
            <motion.div
              initial="hidden" animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
            >
              <AnimatePresence>
                {filtered.map(p => (
                  <motion.div key={p.id}
                    variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    layout
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200 h-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl overflow-hidden">
              <div className="aspect-square skeleton" />
              <div className="p-3 space-y-2">
                <div className="h-3 skeleton rounded w-full" />
                <div className="h-8 skeleton rounded mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
