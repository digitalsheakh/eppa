import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Eppa's Shop <eppa.shop.uk@gmail.com>";
  const to = process.env.ADMIN_EMAIL || 'eppa.shop.uk@gmail.com';

  if (!key) {
    return NextResponse.json({ error: 'RESEND_API_KEY not set in environment' }, { status: 500 });
  }

  try {
    const resend = new Resend(key);
    const result = await resend.emails.send({
      from,
      to,
      subject: "Eppa's Shop — Email test",
      html: '<p>Email is working correctly on Vercel.</p>',
    });
    return NextResponse.json({ ok: true, result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
