import { NextRequest, NextResponse } from 'next/server';
import { addSubscriber, getSubscribers } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    await addSubscriber(email);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/subscribers error:', error);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const subscribers = await getSubscribers();
    return NextResponse.json(subscribers);
  } catch (error) {
    console.error('GET /api/subscribers error:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}
