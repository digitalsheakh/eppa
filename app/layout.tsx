import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const SITE_URL = 'https://www.takeawaybag.co.uk';
const SITE_NAME = 'TakeawayBag.co.uk';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Takeaway Bags UK | Next Day Delivery | TakeawayBag.co.uk',
    template: '%s | TakeawayBag.co.uk',
  },
  description:
    'Buy takeaway bags online — UK\'s #1 supplier of carrier bags, takeaway bags, wet towels & food packaging. Free next-day delivery on orders over £50. Trusted by thousands of restaurants, cafes & takeaways.',
  keywords: [
    'takeaway bags', 'takeaway bags uk', 'carrier bags', 'carrier bags uk',
    'takeaway packaging', 'food packaging uk', 'wet towels', 'paper bags takeaway',
    'plastic carrier bags', 'biodegradable takeaway bags', 'restaurant bags',
    'cafe packaging', 'takeaway supplies', 'food bags uk', 'buy takeaway bags',
    'wholesale takeaway bags', 'next day delivery takeaway bags',
  ],
  authors: [{ name: 'TakeawayBag.co.uk', url: SITE_URL }],
  creator: 'TakeawayBag.co.uk',
  publisher: 'TakeawayBag.co.uk',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: 'Takeaway Bags UK | Next Day Delivery | TakeawayBag.co.uk',
    description:
      'UK\'s leading supplier of takeaway bags & carrier bags. Free next-day delivery. Trusted by restaurants, cafes & takeaways across the UK.',
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: 'TakeawayBag.co.uk | Takeaway Bags UK' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Takeaway Bags UK | TakeawayBag.co.uk',
    description: 'UK\'s #1 takeaway bag supplier. Free next-day delivery on orders over £50.',
    images: [`${SITE_URL}/og-image.jpg`],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    // Add your Google Search Console verification ID here when you set it up
    // google: 'your-verification-code',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  name: 'TakeawayBag.co.uk',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "UK's leading online supplier of takeaway bags, carrier bags, wet towels and food packaging. Free next-day delivery.",
  email: 'hello@takeawaybag.co.uk',
  telephone: '+44-800-123-4567',
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'GB',
  },
  areaServed: 'GB',
  priceRange: '££',
  currenciesAccepted: 'GBP',
  paymentAccepted: 'Credit Card, Debit Card, Bank Transfer',
  openingHours: 'Mo-Fr 09:00-17:00',
  sameAs: [
    'https://www.facebook.com/takeawaybag',
    'https://www.instagram.com/takeawaybag',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={SITE_URL} />
      </head>
      <body>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
