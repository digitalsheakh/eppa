import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: "Refund Policy — Eppa's Shop" };

export default function RefundPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to store
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">Refund Policy</h1>
          <p className="text-sm text-gray-400 mb-10">Last updated: May 2025</p>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-10 space-y-8 text-sm text-gray-600 leading-relaxed">

            <section>
              <h2 className="text-base font-bold text-black mb-3">Overview</h2>
              <p>
                At Eppa&apos;s Shop, we want you to be completely happy with your purchase. If for any reason
                you are not satisfied, we offer a straightforward returns and refund process outlined below.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-black mb-3">Returns Window</h2>
              <p>
                You have <strong className="text-black">14 days</strong> from the date of delivery to request a return.
                Items must be unused, in their original condition, and in the original packaging.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-black mb-3">Non-Returnable Items</h2>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Opened or used fragrance bottles</li>
                <li>Items purchased on sale or with a discount code</li>
                <li>Gift cards</li>
              </ul>
            </section>

            <section>
              <h2 className="text-base font-bold text-black mb-3">How to Request a Refund</h2>
              <ol className="list-decimal list-inside space-y-2">
                <li>Contact us at <a href="mailto:support@eppa.shop" className="text-black font-semibold hover:underline">support@eppa.shop</a> with your order reference number.</li>
                <li>We will review your request within 1–2 business days.</li>
                <li>If approved, we will provide return instructions and a return address.</li>
                <li>Once we receive and inspect the item, your refund will be processed.</li>
              </ol>
            </section>

            <section>
              <h2 className="text-base font-bold text-black mb-3">Refund Processing Time</h2>
              <p>
                Approved refunds are processed within <strong className="text-black">5–7 business days</strong> to the original
                payment method. Bank transfer orders are refunded via bank transfer.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-black mb-3">Damaged or Incorrect Items</h2>
              <p>
                If you received a damaged, defective, or incorrect item, please contact us within
                <strong className="text-black"> 48 hours</strong> of delivery with a photo. We will arrange a replacement
                or full refund at no extra cost to you.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-black mb-3">Contact</h2>
              <p>
                For any refund queries, please reach out via our{' '}
                <Link href="/contact" className="text-black font-semibold hover:underline">Contact page</Link>{' '}
                or email <a href="mailto:support@eppa.shop" className="text-black font-semibold hover:underline">support@eppa.shop</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
