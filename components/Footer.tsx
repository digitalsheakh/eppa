'use client';
import Link from 'next/link';
import { FaFacebookF, FaInstagram, FaYoutube, FaXTwitter } from 'react-icons/fa6';
import { SiVisa, SiMastercard, SiPaypal, SiAmericanexpress } from 'react-icons/si';
import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import Logo from './Logo';

const SECTIONS = [
  {
    title: 'Information',
    links: [
      ['About Us',             '/shop'],
      ['Delivery Information', '/shop'],
      ['Terms & Conditions',   '/shop'],
      ['Returns Policy',       '/shop'],
      ['Sustainability',       '/shop'],
      ['Blog',                 '/shop'],
    ],
  },
  {
    title: 'My Account',
    links: [
      ['Track Order', '/track-order'],
      ['My Account',  '/account'],
      ['My Orders',   '/account'],
    ],
  },
  {
    title: 'Customer Service',
    links: [
      ['Contact Us',          '/shop'],
      ['Returns & Exchanges', '/shop'],
      ['Site Map',            '/shop'],
    ],
  },
];

const SOCIALS = [
  { icon: FaFacebookF, href: '#', label: 'Facebook' },
  { icon: FaInstagram, href: '#', label: 'Instagram' },
  { icon: FaXTwitter,  href: '#', label: 'X' },
  { icon: FaYoutube,   href: '#', label: 'YouTube' },
];

export default function Footer() {
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (t: string) => setOpen(o => o === t ? null : t);

  return (
    <footer className="bg-gray-50 border-t border-gray-200">

      {/* ── Desktop layout ── */}
      <div className="hidden sm:block">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <Link href="/" aria-label="TakeawayBag home"><Logo width={130} height={38} className="max-h-10" /></Link>
            <p className="text-sm text-gray-500 mt-2.5 leading-relaxed">
              The UK's leading supplier of takeaway bags, carrier bags and food packaging.
            </p>
            <p className="text-sm font-semibold text-gray-700 mt-3 mb-2">Follow us</p>
            <div className="flex gap-2.5">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a key={label} href={href} aria-label={label}
                  className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-gray-500 hover:text-accent-500 hover:border-accent-400 transition-colors bg-white">
                  <Icon className="w-3 h-3" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {SECTIONS.map(({ title, links }) => (
            <div key={title}>
              <p className="text-sm font-bold text-gray-900 mb-4">{title}</p>
              <ul className="space-y-2.5">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
              {title === 'Customer Service' && (
                <div className="mt-5">
                  <p className="text-xs text-gray-400 mb-0.5">Call us</p>
                  <a href="tel:08001234567" className="text-sm font-semibold text-gray-700 hover:text-accent-500 transition-colors">0800 123 4567</a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Mobile layout ── */}
      <div className="sm:hidden">
        {/* Top — logo + tagline + social */}
        <div className="px-5 py-4 border-b border-gray-200">
          <Link href="/" aria-label="TakeawayBag home"><Logo width={120} height={34} className="max-h-9" /></Link>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            The UK's leading supplier of takeaway bags &amp; food packaging. Free next-day delivery over £50.
          </p>
          <div className="flex items-center gap-2 mt-2.5">
            {SOCIALS.map(({ icon: Icon, href, label }) => (
              <a key={label} href={href} aria-label={label}
                className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-accent-500 hover:border-accent-400 transition-colors bg-white">
                <Icon className="w-3 h-3" />
              </a>
            ))}
            <span className="text-xs text-gray-400 ml-2">
              Call us: <a href="tel:08001234567" className="font-semibold text-gray-700">0800 123 4567</a>
            </span>
          </div>
        </div>

        {/* Accordion sections */}
        {SECTIONS.map(({ title, links }) => (
          <div key={title} className="border-b border-gray-200">
            <button
              onClick={() => toggle(title)}
              className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-gray-900"
            >
              {title}
              {open === title ? <Minus className="w-4 h-4 text-gray-400" /> : <Plus className="w-4 h-4 text-gray-400" />}
            </button>
            {open === title && (
              <ul className="px-5 pb-4 space-y-3">
                {links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {/* Bottom bar — shared */}
      <div className="border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400 order-2 sm:order-1">
            &copy; {new Date().getFullYear()} TakeawayBag.co.uk. All rights reserved.
          </p>
          <div className="flex items-center gap-2 order-1 sm:order-2">
            {[
              { Icon: SiVisa,            color: 'text-[#1a1f71]' },
              { Icon: SiMastercard,      color: 'text-[#eb001b]' },
              { Icon: SiPaypal,          color: 'text-[#003087]' },
              { Icon: SiAmericanexpress, color: 'text-[#007bc1]' },
            ].map(({ Icon, color }, i) => (
              <div key={i} className="h-6 px-2 border border-gray-200 rounded flex items-center justify-center bg-white">
                <Icon className={`w-6 h-3.5 ${color}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
