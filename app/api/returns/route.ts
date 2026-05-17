import { NextRequest, NextResponse } from 'next/server';
import { createReturnRequest, getReturnRequests, updateReturnStatus } from '@/lib/db';

export async function GET() {
  try {
    const returns = await getReturnRequests();
    return NextResponse.json(returns);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch returns' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, orderReference, customerName, email, reason } = body;
    if (!orderId || !reason) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    const id = await createReturnRequest({ orderId, orderReference, customerName, email, reason });
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to submit return' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json();
    await updateReturnStatus(id, status);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update return' }, { status: 500 });
  }
}
