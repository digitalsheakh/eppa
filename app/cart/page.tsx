'use client';
import { useCartStore } from '@/lib/cartStore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CartPage() {
  const { items, updateQuantity, removeItem, total } = useCartStore();
  const subtotal = total();
  const delivery = subtotal >= 75 ? 0 : 6.99;
  const grandTotal = subtotal + delivery;

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-50 min-h-screen flex items-center justify-center px-4">
          <div className="text-center max-w-xs">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-7 h-7 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-sm text-gray-500 mb-7">Browse our collection and find something you need.</p>
            <Link href="/shop" className="btn-primary">
              Browse Products <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5">
            <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
            <p className="text-sm text-gray-500 mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex flex-col lg:flex-row gap-5">
          {/* Items */}
          <div className="flex-1">
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <AnimatePresence>
                {items.map((item, i) => (
                  <motion.div key={item.id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                    className={`flex gap-3 p-4 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                    <img
                      src={item.image || `https://placehold.co/80x80/f3f4f6/9ca3af?text=Bag`}
                      alt={item.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 object-cover bg-gray-50 border border-gray-100 rounded-lg shrink-0"
                      onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/80x80/f3f4f6/9ca3af?text=Bag`; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{item.name}</h3>
                        <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1 shrink-0 -mt-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">per {item.unit}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2.5 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2.5 py-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <p className="text-sm font-bold text-gray-900">£{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:w-72 shrink-0">
            <div className="bg-white border border-gray-200 rounded-xl p-5 lg:sticky lg:top-24">
              <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Order Summary</h2>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-900">£{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className={`font-medium ${delivery === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {delivery === 0 ? 'FREE' : `£${delivery.toFixed(2)}`}
                  </span>
                </div>
                {delivery > 0 && (
                  <p className="text-xs text-gray-600 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl">
                    Add £{(75 - subtotal).toFixed(2)} more for free delivery!
                  </p>
                )}
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 mt-4 pt-4 border-t border-gray-100">
                <span>Total</span>
                <span>£{grandTotal.toFixed(2)}</span>
              </div>
              <Link href="/checkout" className="btn-primary w-full justify-center mt-4 py-3.5 rounded-xl text-base">
                Checkout <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/shop" className="block text-center text-sm text-gray-400 hover:text-black mt-3 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
