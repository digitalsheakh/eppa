'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { Product } from '@/lib/db';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="aspect-square bg-gray-100 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-gray-100 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
        <div className="h-8 bg-gray-100 rounded-lg animate-pulse mt-3" />
      </div>
    </div>
  );
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] } },
};

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
    <section className="bg-white py-12 sm:py-16 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          className="flex items-end justify-between mb-7"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-1.5">Collection</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-black">Featured Fragrances</h2>
          </div>
          {!loading && products.length > 0 && (
            <Link href="/shop"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-black hover:underline transition-colors">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="py-16 border border-gray-200 rounded-xl flex flex-col items-center gap-3 text-center"
          >
            <p className="text-xs font-bold tracking-widest uppercase text-gray-400">No products yet</p>
            <p className="text-sm text-gray-400 max-w-xs">Products will appear here once added via the admin panel.</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {products.slice(0, 6).map(p => (
              <motion.div key={p.id} variants={itemVariants}>
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && products.length > 0 && (
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Link href="/shop"
              className="inline-flex items-center gap-2 border border-black text-black text-sm font-semibold px-6 py-3 rounded-lg hover:bg-black hover:text-white transition-colors">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}
