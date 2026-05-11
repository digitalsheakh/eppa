'use client';
import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { Product } from '@/lib/db';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2.5">
        <div className="h-2 skeleton rounded-full w-1/3" />
        <div className="h-3.5 skeleton rounded-full w-full" />
        <div className="h-3 skeleton rounded-full w-3/4" />
        <div className="h-9 skeleton rounded-full mt-3" />
      </div>
    </div>
  );
}

export default function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => { setProducts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="py-14 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="eyebrow mb-2">Featured Products</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Featured Fragrances
            </h2>
          </div>
          {!loading && products.length > 0 && (
            <Link href="/shop"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-accent-500 hover:text-accent-600 transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 border border-gray-200 rounded-xl bg-white flex flex-col items-center gap-3 text-center">
            <p className="eyebrow">No products yet</p>
            <p className="text-sm text-gray-400 max-w-xs">Products will appear here once added via the admin panel.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {products.slice(0, 10).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="text-center mt-10">
            <Link href="/shop" className="btn-primary">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
