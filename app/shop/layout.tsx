import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Buy Takeaway Bags UK | Carrier Bags, Wet Towels & Packaging',
  description:
    'Shop our full range of takeaway bags, carrier bags, wet towels and food packaging. Wholesale prices, next-day delivery. Order online today.',
  alternates: { canonical: 'https://www.takeawaybag.co.uk/shop' },
};

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
