'use client';

const REVIEWS = [
  {
    title: 'Best Carrier Bag Shop',
    text: 'Good quality carrier bags great value and very quick efficient service. Always use this company for my carrier bags and will continue to use them in the future.',
    name: 'Mohammed Ali',
    time: '2 days ago',
  },
  {
    title: 'Quality Tissue Paper',
    text: 'Lovely quality tissue paper and delivered very quickly. Good rice too.',
    name: 'Sarah Johnson',
    time: '4 days ago',
  },
  {
    title: 'Fast Next Day Delivery',
    text: 'Ordered 500 carrier bags and they arrived the very next morning. Exactly what I needed for my business. Will definitely reorder.',
    name: 'James Patel',
    time: '1 week ago',
  },
  {
    title: 'Great Value for Money',
    text: 'Really impressed with the quality and price. Our customers love how sturdy the bags are. Delivery was next day as promised.',
    name: 'Priya Shah',
    time: '3 days ago',
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 mb-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-yellow-400 text-lg leading-none">★</span>
      ))}
    </div>
  );
}

function ReviewCard({ title, text, name, time }: typeof REVIEWS[0]) {
  return (
    <div className="bg-[#f4f4f4] rounded-2xl p-5 flex flex-col gap-2 h-full">
      <Stars />
      <p className="font-bold text-gray-900 text-sm">{title}</p>
      <p className="text-sm text-gray-600 leading-relaxed flex-1">{text}</p>
      <p className="text-xs text-gray-400 mt-2">{name} &middot; {time}</p>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="bg-white border-t border-gray-100 py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-7">
          <p className="eyebrow mb-1.5">What Our Customers Say</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Trusted by 10,000+ Businesses</h2>
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid sm:grid-cols-4 gap-4">
          {REVIEWS.map(r => <ReviewCard key={r.title} {...r} />)}
        </div>

        {/* Mobile slider — swipe horizontally */}
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
