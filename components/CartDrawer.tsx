'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/cartStore';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const { items, isCartOpen, closeCart, updateQuantity, removeItem, total } = useCartStore();
  const router = useRouter();

  const subtotal = total();
  const delivery = subtotal >= 10 ? 0 : subtotal === 0 ? 0 : 2.99;
  const grandTotal = subtotal + delivery;

  const handleCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="cart-bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            key="cart-dr"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl border-l border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gray-900" />
                <h2 className="font-bold text-gray-900 text-base">Your Cart</h2>
                {items.length > 0 && (
                  <span className="bg-black text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button onClick={closeCart}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="w-7 h-7 text-gray-400" />
                  </div>
                  <p className="font-semibold text-gray-900">Your cart is empty</p>
                  <p className="text-sm text-gray-400">Add some products to get started.</p>
                  <button onClick={closeCart}
                    className="mt-2 bg-black hover:bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <AnimatePresence>
                  {items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}
                      className={`flex gap-3 px-4 py-3.5 ${i > 0 ? 'border-t border-gray-100' : ''}`}
                    >
                      <img
                        src={item.image || `https://placehold.co/64x64/f5f5f4/a8a29e?text=Bag`}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-100 bg-gray-50 shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = `https://placehold.co/64x64/f5f5f4/a8a29e?text=Bag`; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">per {item.unit}</p>
                        <p className="text-sm font-bold text-gray-900 mt-1">£{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <button onClick={() => removeItem(item.id)}
                          className="text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-gray-50">
                <div className="space-y-1.5 text-sm">
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
                  {delivery > 0 && subtotal > 0 && (
                    <p className="text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      Add £{(10 - subtotal).toFixed(2)} more for free delivery
                    </p>
                  )}
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span>£{grandTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm bg-black hover:bg-gray-900 text-white">
                  Checkout <ArrowRight className="w-4 h-4" />
                </button>
                <button onClick={closeCart}
                  className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors py-1">
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
