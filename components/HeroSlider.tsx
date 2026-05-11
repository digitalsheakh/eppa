'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Hero() {
  const [images, setImages] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          const imgs = data.filter(p => p.active && p.image).map((p: any) => p.image);
          if (imgs.length === 0) setImages([]);
          else if (imgs.length === 1) setImages([imgs[0]]);
          else setImages(imgs.slice(0, 6));
        }
      })
      .catch(() => setImages([]));
  }, []);

  const total = images.length;
  const go = useCallback((n: number, d: number) => { setDir(d); setIdx((n + total) % total); }, [total]);

  useEffect(() => {
    if (total < 2) return;
    const t = setTimeout(() => go(idx + 1, 1), 4000);
    return () => clearTimeout(t);
  }, [idx, go, total]);

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <>
      {/* Free delivery strip */}
      <div className="bg-black text-white text-center py-2.5 px-4">
        <p className="text-xs sm:text-sm font-medium tracking-wide">
          Free Delivery on Every Order over £50
        </p>
      </div>

      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20">
          <div className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12 lg:gap-20">

            {/* Text */}
            <motion.div
              className="flex-1 min-w-0 text-center sm:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-black leading-tight tracking-tight mb-4 sm:mb-6">
                Once Smelt<br />Never Forgotten
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-sm mx-auto sm:mx-0">
                Discover our exclusive collection of premium fragrances. Trusted quality, fast delivery.
              </p>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 justify-center sm:justify-start">
                <Link href="/shop"
                  className="inline-flex items-center gap-2 bg-black hover:bg-gray-900 text-white font-semibold rounded-lg px-6 py-3 text-sm transition-colors">
                  Shop Now <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/track-order"
                  className="inline-flex items-center gap-2 border border-gray-300 hover:border-gray-900 text-gray-700 hover:text-black font-semibold rounded-lg px-6 py-3 text-sm transition-colors bg-white">
                  Track Order
                </Link>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              className="w-full sm:w-72 lg:w-[420px] shrink-0"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                {images.length > 0 ? (
                  <AnimatePresence custom={dir} mode="wait">
                    <motion.img
                      key={idx}
                      src={images[idx]}
                      alt="Eppa's Shop fragrance"
                      custom={dir}
                      variants={variants}
                      initial="enter" animate="center" exit="exit"
                      transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/f8f8f8/333?text=Fragrance'; }}
                    />
                  </AnimatePresence>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-300">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M12 2C8 2 6 5 6 8c0 4 6 14 6 14s6-10 6-14c0-3-2-6-6-6z"/>
                      <circle cx="12" cy="8" r="2"/>
                    </svg>
                    <p className="text-sm">Add fragrances in admin</p>
                  </div>
                )}
                {total > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => go(i, i > idx ? 1 : -1)}
                        className={`rounded-full transition-all duration-300 ${i === idx ? 'w-5 h-1.5 bg-black' : 'w-1.5 h-1.5 bg-black/30 hover:bg-black/60'}`} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
