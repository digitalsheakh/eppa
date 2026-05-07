import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, updateOrderTracking, getOrderItems } from '@/lib/db';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    if (body.courier !== undefined || body.trackingNumber !== undefined) {
      await updateOrderTracking(params.id, body.courier ?? '', body.trackingNumber ?? '');
    } else if (body.status) {
      await updateOrderStatus(params.id, body.status);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /api/orders/[id] error:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const items = await getOrderItems(params.id);
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order items' }, { status: 500 });
  }
}
