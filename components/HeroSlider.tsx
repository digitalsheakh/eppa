'use client';
import Link from 'next/link';
import { ArrowRight, MapPin, ShieldCheck, Truck, HeartHandshake, Star } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TRUST_ITEMS = [
  { icon: Truck,          line1: 'Fast Next Day Delivery', line2: 'On orders over £50' },
  { icon: Star,           line1: '5-Star Customer Service', line2: 'We\'re always here to help' },
  { icon: ShieldCheck,    line1: 'Quality Guaranteed',      line2: 'Premium products only' },
  { icon: HeartHandshake, line1: 'Easy Returns',            line2: 'Hassle-free up to 28 days' },
];

export default function Hero() {
  const [images, setImages] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [trustIdx, setTrustIdx] = useState(0);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then((data: any[]) => {
        if (Array.isArray(data)) {
          const imgs = data.filter(p => p.active && p.image).map((p: any) => p.image);
          if (imgs.length === 0) setImages(['https://placehold.co/600x600/fff7f0/f26522?text=Fragrances']);
          else if (imgs.length === 1) setImages([imgs[0], imgs[0], imgs[0]]);
          else setImages(imgs.slice(0, 5));
        }
      })
      .catch(() => setImages(['https://placehold.co/600x600/fff7f0/f26522?text=Fragrances']));
  }, []);

  const total = images.length;
  const go = useCallback((n: number, d: number) => { setDir(d); setIdx((n + total) % total); }, [total]);

  useEffect(() => {
    if (total < 2) return;
    const t = setTimeout(() => go(idx + 1, 1), 4000);
    return () => clearTimeout(t);
  }, [idx, go, total]);

  // Trust slider auto-advances
  useEffect(() => {
    const t = setInterval(() => setTrustIdx(i => (i + 1) % TRUST_ITEMS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const imgVariants = {
    enter: (d: number) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (d: number) => ({ x: d > 0 ? '-100%' : '100%', opacity: 0 }),
  };

  return (
    <>
      {/* Hero section */}
      <section className="bg-gradient-to-br from-white via-orange-50/30 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14 lg:py-20">
          <div className="flex flex-row items-center gap-6 sm:gap-12 lg:gap-20">

            {/* Text */}
            <motion.div
              className="flex-1 min-w-0"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-accent-50 border border-accent-100 rounded-full px-3 py-1 mb-4"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-pulse" />
                <span className="text-xs font-semibold text-accent-600 tracking-wide">Fragrances Now Available</span>
              </motion.div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-3 sm:mb-5">
                A New Era of<br className="hidden sm:block" />
                <span className="text-accent-500"> Online Shopping</span>
              </h1>

              <p className="text-sm sm:text-base text-gray-500 leading-relaxed mb-5 sm:mb-8 max-w-md">
                Trusted quality, fast delivery, and exceptional customer support. We make online shopping easy, convenient, and reliable.
              </p>

              {/* Min order badge */}
              <div className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5 sm:mb-8">
                <ShieldCheck className="w-3.5 h-3.5 text-accent-400 shrink-0" />
                Minimum order £20
              </div>

              <motion.div
                className="flex flex-col sm:flex-row gap-3"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Link href="/shop"
                  className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 active:bg-accent-700 hover:scale-105 text-white font-bold rounded-2xl transition-all duration-200 text-sm px-6 py-3 shadow-md shadow-accent-200">
                  Shop Fragrances <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/track-order"
                  className="inline-flex items-center justify-center gap-2 border border-gray-200 hover:border-gray-300 hover:scale-105 text-gray-700 hover:text-gray-900 font-semibold rounded-2xl transition-all duration-200 text-sm px-6 py-3 bg-white">
                  <MapPin className="w-4 h-4" /> Track Order
                </Link>
              </motion.div>
            </motion.div>

            {/* Image slider */}
            <motion.div
              className="w-36 sm:w-64 lg:w-[420px] shrink-0"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
            >
              <div className="relative aspect-square rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 shadow-xl shadow-gray-100">
                <AnimatePresence custom={dir} mode="wait">
                  {images.length > 0 && (
                    <motion.img
                      key={idx}
                      src={images[idx]}
                      alt="Eppa's Shop fragrances"
                      custom={dir}
                      variants={imgVariants}
                      initial="enter" animate="center" exit="exit"
                      transition={{ type: 'tween', duration: 0.35, ease: 'easeInOut' }}
                      className="absolute inset-0 w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/600x600/fff7f0/f26522?text=Fragrances'; }}
                    />
                  )}
                </AnimatePresence>
                {total > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {images.map((_, i) => (
                      <button key={i} onClick={() => go(i, i > idx ? 1 : -1)}
                        className={`rounded-full transition-all duration-300 ${i === idx ? 'w-5 h-1.5 bg-accent-500' : 'w-1.5 h-1.5 bg-white/70 hover:bg-white'}`} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust slider — one item at a time, slides in/out */}
      <div className="bg-white border-b border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-0">
          {/* Desktop: all 4 in grid */}
          <div className="hidden sm:grid grid-cols-4 divide-x divide-gray-100">
            {TRUST_ITEMS.map(({ icon: Icon, line1, line2 }) => (
              <div key={line1} className="flex items-center gap-3 px-6 py-4">
                <div className="w-8 h-8 rounded-xl bg-accent-50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-accent-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{line1}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{line2}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: one at a time slider */}
          <div className="sm:hidden relative h-14 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {(() => {
                const { icon: Icon, line1, line2 } = TRUST_ITEMS[trustIdx];
                return (
                  <motion.div
                    key={trustIdx}
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -40, opacity: 0 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="absolute flex items-center gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-accent-50 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-accent-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-900">{line1}</p>
                      <p className="text-[10px] text-gray-400">{line2}</p>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
            {/* Dots */}
            <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1">
              {TRUST_ITEMS.map((_, i) => (
                <button key={i} onClick={() => setTrustIdx(i)}
                  className={`rounded-full transition-all duration-300 ${i === trustIdx ? 'w-3.5 h-1 bg-accent-500' : 'w-1 h-1 bg-gray-300'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
