import { NextRequest, NextResponse } from 'next/server';
import { getOrderByReference } from '@/lib/db';

export async function GET(req: NextRequest) {
  const ref = new URL(req.url).searchParams.get('ref')?.trim().toUpperCase();
  if (!ref) return NextResponse.json({ error: 'Reference required' }, { status: 400 });

  const order = await getOrderByReference(ref);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  return NextResponse.json({
    reference: order.reference,
    status: order.status,
    courier: order.courier || '',
    trackingNumber: order.trackingNumber || '',
    createdAt: order.createdAt,
  });
}
