import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Fragrances | Eppa's Shop",
  description:
    "Shop fragrances at Eppa's Shop. Trusted quality, fast delivery, and exceptional customer support.",
  alternates: { canonical: 'https://www.eppa.shop/shop' },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
