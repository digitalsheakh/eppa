'use client';
import { ShoppingCart, Check } from 'lucide-react';
import { useCartStore } from '@/lib/cartStore';
import { Product } from '@/lib/db';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { productSlug } from '@/lib/utils';

export default function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore(s => s.addItem);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({ id: product.id, name: product.name, price: product.price, unit: product.unit, image: product.image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const imgSrc = !imgError && product.image ? product.image : `https://placehold.co/400x400/f3f4f6/9ca3af?text=Bag`;

  return (
    <motion.div
      whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
      transition={{ duration: 0.2 }}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden flex flex-col shadow-sm"
    >
      {/* Image */}
      <Link href={`/shop/${productSlug(product.name, product.id)}`}
        className="block relative overflow-hidden bg-gray-50 aspect-square">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-500 border border-gray-300 bg-white px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
        {product.stock > 0 && product.stock <= 10 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Only {product.stock} left
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] text-accent-500 font-bold tracking-wider uppercase mb-0.5">per {product.unit}</p>
        <Link href={`/shop/${productSlug(product.name, product.id)}`}>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 mb-2 hover:text-primary-700 transition-colors">{product.name}</h3>
        </Link>

        <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-gray-100">
          <span className="text-base font-bold text-gray-900">£{product.price.toFixed(2)}</span>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full transition-all min-w-[68px] justify-center ${
              added
                ? 'bg-green-500 text-white'
                : product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-accent-500 text-white hover:bg-accent-600'
            }`}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span key="c" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1">
                  <Check className="w-3 h-3" /> Done
                </motion.span>
              ) : (
                <motion.span key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1">
                  <ShoppingCart className="w-3 h-3" /> Add
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
