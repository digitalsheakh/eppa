import { NextRequest, NextResponse } from 'next/server';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  try {
    const { name, email } = await req.json();
    if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
    await sendWelcomeEmail(name || 'there', email);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Welcome email route error:', err);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
