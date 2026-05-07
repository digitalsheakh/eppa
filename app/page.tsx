import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSlider from '@/components/HeroSlider';
import ProductsSection from '@/components/ProductsSection';
import Testimonials from '@/components/Testimonials';

export const metadata: Metadata = {
  title: 'Takeaway Bags UK | Buy Online | Free Next Day Delivery | TakeawayBag.co.uk',
  description:
    "Buy takeaway bags online from the UK's #1 supplier. Carrier bags, wet towels, food packaging & more. Free next-day delivery on orders over £50. Trusted by 10,000+ restaurants & takeaways.",
  alternates: { canonical: 'https://www.takeawaybag.co.uk' },
};

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSlider />
        <ProductsSection />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
