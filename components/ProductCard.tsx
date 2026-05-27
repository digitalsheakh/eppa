'use client';
import { Check } from 'lucide-react';
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

  const imgSrc = !imgError && product.image ? product.image : `https://placehold.co/400x400/f8f8f8/999?text=Product`;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col group hover:border-gray-400 transition-colors">
      {/* Image */}
      <Link href={`/shop/${productSlug(product.name, product.id)}`}
        className="block relative bg-gray-50 aspect-square overflow-hidden">
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImgError(true)}
        />
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-600 border border-gray-300 bg-white px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
        {product.stock > 0 && product.stock <= 10 && (
          <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            Only {product.stock} left
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/shop/${productSlug(product.name, product.id)}`}>
          <h3 className="text-sm font-semibold text-black leading-snug line-clamp-2 mb-1 hover:underline min-h-[2.5rem]">{product.name}</h3>
        </Link>
        <p className="text-sm font-bold text-black mb-3">£{product.price.toFixed(2)}</p>

        <div className="flex gap-2 mt-auto">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleAdd}
            disabled={product.stock === 0}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-colors ${
              added
                ? 'bg-black text-white'
                : product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-black hover:bg-gray-900 text-white'
            }`}
          >
            <AnimatePresence mode="wait">
              {added ? (
                <motion.span key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-1">
                  <Check className="w-3 h-3" /> Added
                </motion.span>
              ) : (
                <motion.span key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Add
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <Link href={`/shop/${productSlug(product.name, product.id)}`}
            className="flex-1 text-xs font-semibold py-2 rounded-lg border border-gray-300 hover:border-black text-center transition-colors text-black">
            Choose
          </Link>
        </div>
      </div>
    </div>
  );
}
