import { NextResponse } from 'next/server';
import { getStripeSettings } from '@/lib/stripeConfig';

export async function GET() {
  const s = await getStripeSettings();
  return NextResponse.json({
    bankName: s.bankName,
    accountName: s.accountName,
    accountNumber: s.accountNumber,
    sortCode: s.sortCode,
  });
}
