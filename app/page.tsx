import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSlider from '@/components/HeroSlider';
import ProductsSection from '@/components/ProductsSection';
import Testimonials from '@/components/Testimonials';

export const metadata: Metadata = {
  title: "Eppa's Shop: Eppa.Shop",
  description:
    'A New Era of Online Shopping! Trusted quality, fast delivery, and exceptional customer support. We make online shopping easy, convenient, and reliable.',
  alternates: { canonical: 'https://www.eppa.shop' },
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
