import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getStripeSecretKey } from '@/lib/stripeConfig';

export async function POST(req: NextRequest) {
  try {
    const secretKey = await getStripeSecretKey();
    if (!secretKey) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const stripe = new Stripe(secretKey);
    const { amount, currency = 'gbp', customerName, customerEmail } = await req.json();

    // Find or create Stripe customer so name/email show in dashboard
    let customerId: string | undefined;
    if (customerEmail) {
      const existing = await stripe.customers.list({ email: customerEmail, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
        if (customerName) {
          await stripe.customers.update(customerId, { name: customerName });
        }
      } else {
        const customer = await stripe.customers.create({
          email: customerEmail,
          name: customerName || undefined,
        });
        customerId = customer.id;
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      customer: customerId,
      receipt_email: customerEmail || undefined,
      metadata: { customerName: customerName || '', customerEmail: customerEmail || '' },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
