'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/lib/db';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShoppingCart, Check, ArrowLeft, Truck, ShieldCheck, RotateCcw, Package, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/cartStore';
import Link from 'next/link';
import { idFromSlug } from '@/lib/utils';

function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="h-4 skeleton rounded w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="aspect-square skeleton rounded-sm" />
        <div className="space-y-4">
          <div className="h-3 skeleton rounded w-1/4" />
          <div className="h-8 skeleton rounded w-3/4" />
          <div className="h-4 skeleton rounded w-1/3" />
          <div className="h-10 skeleton rounded w-1/4" />
          <div className="h-px bg-gray-100 my-2" />
          <div className="h-12 skeleton rounded w-full" />
          <div className="h-12 skeleton rounded w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const addItem = useCartStore(s => s.addItem);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then((data: Product[]) => {
        if (!Array.isArray(data)) { setLoading(false); return; }
        const id = idFromSlug(slug);
        // Case-insensitive match — Firestore IDs are stored lowercased in URLs
        const found = id ? data.find(p => p.id.toLowerCase() === id.toLowerCase()) : null;
        setProduct(found ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleAdd = () => {
    if (!product) return;
    addItem({ id: product.id, name: product.name, price: product.price, unit: product.unit, image: product.image });
    for (let i = 0; i < qty - 1; i++) {
      addItem({ id: product.id, name: product.name, price: product.price, unit: product.unit, image: product.image });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const imgSrc = !imgError && product?.image ? product.image : `https://placehold.co/600x600/f3f4f6/9ca3af?text=Product`;

  return (
    <>
      <Navbar />
      <main className="bg-white min-h-screen">
        {loading ? (
          <ProductSkeleton />
        ) : !product ? (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Product not found</h2>
            <p className="text-gray-500 mb-6">This product may have been removed or is no longer available.</p>
            <Link href="/shop" className="btn-primary">Back to Shop</Link>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 py-8"
          >
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
              <Link href="/" className="hover:text-primary-600 transition-colors">Home</Link>
              <span>/</span>
              <Link href="/shop" className="hover:text-primary-600 transition-colors">Shop</Link>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate max-w-xs">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
              {/* Image */}
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
                className="relative"
              >
                <div className="aspect-square bg-gray-50 border border-gray-100 rounded-sm overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                </div>
                {product.stock > 0 && product.stock <= 10 && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-sm">
                    Only {product.stock} left!
                  </span>
                )}
                {product.stock === 0 && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-500 border border-gray-300 bg-white px-4 py-2 rounded-sm">Out of Stock</span>
                  </div>
                )}
              </motion.div>

              {/* Details */}
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}
                className="flex flex-col"
              >
                <p className="eyebrow mb-2">{product.category}</p>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-snug">{product.name}</h1>
                <p className="text-sm text-gray-500 mb-4">Sold per <span className="font-semibold text-gray-700">{product.unit}</span></p>

                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-extrabold text-gray-900">£{product.price.toFixed(2)}</span>
                  <span className={`text-sm font-semibold px-2 py-0.5 rounded-sm ${product.stock > 0 ? 'text-green-700 bg-green-50' : 'text-gray-500 bg-gray-100'}`}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>

                {/* Quantity + Add to cart */}
                {product.stock > 0 && (
                  <div className="flex items-center gap-3 mb-5">
                    <div className="flex items-center border border-gray-300 rounded-sm overflow-hidden">
                      <button
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="px-3 py-2.5 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center text-sm font-semibold text-gray-900">{qty}</span>
                      <button
                        onClick={() => setQty(q => q + 1)}
                        className="px-3 py-2.5 text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-sm text-gray-500">= <span className="font-semibold text-gray-900">£{(product.price * qty).toFixed(2)}</span></span>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAdd}
                  disabled={product.stock === 0 || added}
                  className={`w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-full transition-all mb-3 ${
                    added
                      ? 'bg-green-500 text-white'
                      : product.stock === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-accent-500 hover:bg-accent-600 text-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <AnimatePresence mode="wait">
                    {added ? (
                      <motion.span key="added" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <Check className="w-4 h-4" /> Added to Cart!
                      </motion.span>
                    ) : (
                      <motion.span key="add" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                        <ShoppingCart className="w-4 h-4" /> Add to Cart
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                <Link href="/checkout" className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-full transition-all">
                  Buy Now · £{(product.price * qty).toFixed(2)}
                </Link>

                {/* Trust badges */}
                <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-3 gap-3">
                  {[
                    { icon: Truck,       text: 'Next Day Delivery' },
                    { icon: ShieldCheck, text: 'Quality Guarantee' },
                    { icon: RotateCcw,   text: 'Easy Returns' },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex flex-col items-center gap-1.5 text-center">
                      <Icon className="w-5 h-5 text-accent-500" />
                      <span className="text-xs text-gray-500 font-medium">{text}</span>
                    </div>
                  ))}
                </div>

                {/* Description */}
                {product.description && (
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Product Description</h3>
                    <div
                      className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none prose-p:text-gray-600 prose-li:text-gray-600"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </>
  );
}
