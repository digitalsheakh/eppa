import { NextRequest, NextResponse } from 'next/server';
import { getOrders, createOrder, getNextOrderRef } from '@/lib/db';
import { sendOrderConfirmation, sendAdminOrderNotification } from '@/lib/email';
import { getStripeSettings } from '@/lib/stripeConfig';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const orders = await getOrders();
    const filtered = email
      ? orders.filter(o => o.email?.toLowerCase() === email.toLowerCase())
      : orders;
    return NextResponse.json(filtered);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { order, items } = await req.json();
    const ref = await getNextOrderRef();
    const orderId = await createOrder({ ...order, reference: ref }, items);

    if (order.email) {
      const settings = await getStripeSettings().catch(() => null);
      sendOrderConfirmation({
        customerName: order.customerName || 'Customer',
        customerEmail: order.email,
        reference: ref,
        total: order.total,
        address: order.address || `${order.addressLine1 || ''}, ${order.city || ''}, ${order.postcode || ''}`.trim(),
        paymentMethod: order.paymentMethod || 'card',
        items,
        bankDetails: settings ? {
          bankName: settings.bankName,
          accountName: settings.accountName,
          accountNumber: settings.accountNumber,
          sortCode: settings.sortCode,
        } : undefined,
      });
    }

    // Notify admin
    sendAdminOrderNotification({
      customerName: order.customerName || 'Customer',
      customerEmail: order.email,
      reference: ref,
      total: order.total,
      address: order.address || `${order.addressLine1 || ''}, ${order.city || ''}, ${order.postcode || ''}`.trim(),
      paymentMethod: order.paymentMethod || 'card',
      items,
    });

    return NextResponse.json({ orderId, reference: ref }, { status: 201 });
  } catch (error) {
    console.error('POST /api/orders error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
