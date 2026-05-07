import { NextResponse } from 'next/server';
import { getStripePublishableKey } from '@/lib/stripeConfig';

export async function GET() {
  const key = await getStripePublishableKey();
  return NextResponse.json({ publishableKey: key });
}
