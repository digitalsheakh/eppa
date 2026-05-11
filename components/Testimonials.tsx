'use client';
import { motion } from 'framer-motion';

const REVIEWS = [
  {
    title: 'Amazing Fragrance',
    text: 'The scent is absolutely incredible. Long lasting and exactly as described. Will definitely be ordering again!',
    name: 'Sophie R.',
    time: '2 days ago',
  },
  {
    title: 'Fast Delivery',
    text: 'Ordered in the morning and it arrived the next day. The fragrance is beautiful and the packaging was lovely.',
    name: 'James K.',
    time: '4 days ago',
  },
  {
    title: 'Highly Recommend',
    text: 'Genuinely one of the best fragrances I\'ve tried. Great value and the customer service was excellent.',
    name: 'Priya M.',
    time: '1 week ago',
  },
  {
    title: 'Love It',
    text: 'Perfect gift idea. The scent is unique and lasts all day. Very happy with my purchase.',
    name: 'Daniel T.',
    time: '3 days ago',
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-black text-base leading-none">★</span>
      ))}
    </div>
  );
}

function ReviewCard({ title, text, name, time }: typeof REVIEWS[0]) {
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 flex flex-col gap-2 h-full">
      <Stars />
      <p className="font-semibold text-black text-sm">{title}</p>
      <p className="text-sm text-gray-600 leading-relaxed flex-1">{text}</p>
      <p className="text-xs text-gray-400 mt-2">{name} &middot; {time}</p>
    </div>
  );
}

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE } },
};

export default function Testimonials() {
  return (
    <section className="bg-white border-t border-gray-100 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs font-bold tracking-[0.2em] uppercase text-gray-400 mb-2">Reviews</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-black">What Our Customers Say</h2>
        </motion.div>

        {/* Desktop grid */}
        <motion.div
          className="hidden sm:grid sm:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {REVIEWS.map(r => (
            <motion.div key={r.title} variants={cardVariants}>
              <ReviewCard {...r} />
            </motion.div>
          ))}
        </motion.div>

        {/* Mobile slider */}
        <div className="sm:hidden flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 scrollbar-none">
          {REVIEWS.map(r => (
            <div key={r.title} className="snap-start shrink-0 w-[80vw]">
              <ReviewCard {...r} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
