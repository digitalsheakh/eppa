import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ArrowLeft, Truck, Clock, MapPin, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: "Delivery Policy — Eppa's Shop" };

export default function DeliveryPolicyPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-black transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to store
          </Link>

          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">Delivery Policy</h1>
          <p className="text-sm text-gray-400 mb-10">Last updated: May 2025</p>

          {/* Quick info cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
            {[
              { icon: Truck,       title: 'Free Delivery', sub: 'On orders over £20' },
              { icon: Clock,       title: '1–3 Days',      sub: 'Standard delivery' },
              { icon: MapPin,      title: 'UK Only',       sub: 'We ship across the UK' },
            ].map(({ icon: Icon, title, sub }) => (
              <div key={title} className="bg-white border border-gray-100 rounded-xl p-4 flex flex-col gap-2">
                <Icon className="w-5 h-5 text-gray-700" />
                <p className="font-bold text-black text-sm">{title}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-6 sm:p-10 space-y-8 text-sm text-gray-600 leading-relaxed">

            <section>
              <h2 className="text-base font-bold text-black mb-3">Delivery Options &amp; Costs</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 pr-4 font-semibold text-black">Method</th>
                      <th className="text-left py-2 pr-4 font-semibold text-black">Estimated Time</th>
                      <th className="text-left py-2 font-semibold text-black">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr>
                      <td className="py-2.5 pr-4">Standard Delivery</td>
                      <td className="py-2.5 pr-4">1–3 business days</td>
                      <td className="py-2.5">£6.99</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4">Free Delivery</td>
                      <td className="py-2.5 pr-4">1–3 business days</td>
                      <td className="py-2.5 font-semibold text-black">FREE on orders over £20</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-black mb-3">Order Processing</h2>
              <p>
                Orders are processed Monday to Friday, excluding UK bank holidays. Orders placed before
                <strong className="text-black"> 2pm</strong> on a working day are typically dispatched the same day.
                Orders placed after 2pm or on weekends will be processed the next working day.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-black mb-3">Tracking Your Order</h2>
              <p>
                Once your order has been dispatched, you will receive a confirmation with tracking details.
                You can track your order anytime via our{' '}
                <Link href="/track-order" className="text-black font-semibold hover:underline">Track Order</Link> page.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-black mb-3">Delivery Area</h2>
              <p>
                We currently deliver to all addresses within the <strong className="text-black">United Kingdom</strong>.
                We do not currently ship internationally. If you have a specific request, please{' '}
                <Link href="/contact" className="text-black font-semibold hover:underline">contact us</Link>.
              </p>
            </section>

            <section>
              <div className="flex gap-3 bg-gray-50 border border-gray-100 rounded-xl p-4">
                <AlertCircle className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-black mb-1">Delays</p>
                  <p>
                    Delivery times are estimates and may be affected by courier delays, public holidays, or high
                    demand periods. We are not liable for delays outside our control but will always keep you informed.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-base font-bold text-black mb-3">Contact</h2>
              <p>
                If you have any delivery questions, please visit our{' '}
                <Link href="/contact" className="text-black font-semibold hover:underline">Contact page</Link> or email{' '}
                <a href="mailto:eppa.shop.uk@gmail.com" className="text-black font-semibold hover:underline">eppa.shop.uk@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
