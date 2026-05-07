'use client';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TRUST_ITEMS = [
  { line1: 'Free Next Day Delivery', line2: 'On orders over £50' },
  { line1: '5 Star Customer Service', line2: 'Rated Excellent' },
  { line1: 'Returns Accepted', line2: 'Up to 28 Days' },
  { line1: 'Quality Guaranteed', line2: 'Premium Products Only' },
];

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
          if (imgs.length === 0) setImages(['https://placehold.co/600x600/fff7f0/f26522?text=Add+Image']);
          else if (imgs.length === 1) setImages([imgs[0], imgs[0], imgs[0]]);
          else setImages(imgs.slice(0, 5));
        }
      })
      .catch(() => setImages(['https://placehold.co/600x600/fff7f0/f26522?text=Add+Image']));
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
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 lg:py-14">
          <div className="flex flex-row items-center gap-5 sm:gap-10 lg:gap-20">

            {/* Text */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4 sm:mb-7">
                Premium Takeaway Bags Delivered Next Day
              </h1>
              <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
                <Link href="/shop"
                  className="inline-flex items-center justify-center gap-1.5 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-full transition-colors text-xs sm:text-sm px-4 sm:px-7 py-2.5 sm:py-3">
                  Shop Now <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link href="/track-order"
                  className="inline-flex items-center justify-center gap-1.5 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 font-semibold rounded-full transition-colors text-xs sm:text-sm px-4 sm:px-7 py-2.5 sm:py-3 bg-white">
                  <MapPin className="w-3.5 h-3.5" /> Track Order
                </Link>
              </div>
            </div>

            {/* Image slider — no arrows, just dots */}
            <div className="w-32 sm:w-56 lg:w-[400px] shrink-0">
              <div className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                <AnimatePresence custom={dir} mode="wait">
                  {images.length > 0 && (
                    <motion.img
                      key={idx}
                      src={images[idx]}
                      alt="Takeaway bags"
                      custom={dir}
                      variants={variants}
                      initial="enter" animate="center" exit="exit"
                      transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/fff7f0/f26522?text=Add+Image'; }}
                    />
                  )}
                </AnimatePresence>

                {/* Dots only */}
                {total > 1 && (
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => go(i, i > idx ? 1 : -1)}
                        className={`rounded-full transition-all duration-300 ${i === idx ? 'w-4 h-1.5 bg-accent-500' : 'w-1.5 h-1.5 bg-white/70 hover:bg-white'}`} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust bar */}
      <div className="bg-white border-b border-gray-100">
        {/* Desktop */}
        <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-4 divide-x divide-gray-100">
            {TRUST_ITEMS.map(({ line1, line2 }) => (
              <div key={line1} className="px-6 py-3.5">
                <p className="text-sm font-semibold text-gray-900">{line1}</p>
                <p className="text-xs text-gray-400 mt-0.5">{line2}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Mobile marquee */}
        <div className="md:hidden overflow-hidden py-3">
          <div className="flex marquee-track gap-12">
            {[...TRUST_ITEMS, ...TRUST_ITEMS].map(({ line1, line2 }, i) => (
              <div key={i} className="shrink-0">
                <p className="text-xs font-semibold text-gray-800 whitespace-nowrap">{line1}</p>
                <p className="text-[10px] text-gray-400 whitespace-nowrap">{line2}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
