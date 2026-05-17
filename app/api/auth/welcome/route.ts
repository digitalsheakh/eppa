import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';
import { addSubscriber } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
    await Promise.all([
      sendWelcomeEmail(name || 'there', email),
      addSubscriber(email).catch(() => {}),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Welcome email route error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
