import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

const SITE_URL = 'https://www.eppa.shop';
const SITE_NAME = "Eppa's Shop";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Eppa's Shop: Eppa.Shop",
    template: "%s | Eppa's Shop",
  },
  description:
    'A New Era of Online Shopping! Trusted quality, fast delivery, and exceptional customer support. We make online shopping easy, convenient, and reliable.',
  keywords: [
    "eppa's shop", 'eppa shop', 'eppa.shop', 'bags uk', 'carrier bags', 'paper bags',
    'plastic bags', 'wet towels', 'food packaging', 'online shopping uk', 'fast delivery uk',
  ],
  authors: [{ name: "Eppa's Shop", url: SITE_URL }],
  creator: "Eppa's Shop",
  publisher: "Eppa's Shop",
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
    title: "Eppa's Shop: Eppa.Shop",
    description:
      'A New Era of Online Shopping! Trusted quality, fast delivery, and exceptional customer support. We make online shopping easy, convenient, and reliable.',
    images: [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: "Eppa's Shop" }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Eppa's Shop: Eppa.Shop",
    description: 'A New Era of Online Shopping! Trusted quality, fast delivery, and exceptional customer support.',
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
  name: "Eppa's Shop",
  url: SITE_URL,
  logo: `${SITE_URL}/eppa_logo.png`,
  description:
    'A New Era of Online Shopping! Trusted quality, fast delivery, and exceptional customer support.',
  email: 'hello@eppa.shop',
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
    'https://www.facebook.com/eppasshop',
    'https://www.instagram.com/eppasshop',
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
