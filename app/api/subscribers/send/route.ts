import { NextRequest, NextResponse } from 'next/server';
import { getSubscribers } from '@/lib/db';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "Eppa's Shop <orders@eppa.shop>";

export async function POST(req: NextRequest) {
  if (!resend) return NextResponse.json({ error: 'Email not configured' }, { status: 500 });

  const { subject, body } = await req.json();
  if (!subject?.trim() || !body?.trim()) {
    return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
  }

  const subscribers = await getSubscribers();
  if (subscribers.length === 0) {
    return NextResponse.json({ error: 'No subscribers' }, { status: 400 });
  }

  const html = `<!DOCTYPE html><html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
        <tr><td style="background:#000;border-radius:12px 12px 0 0;padding:28px 32px;text-align:center">
          <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;color:#999;text-transform:uppercase">Eppa's Shop</p>
        </td></tr>
        <tr><td style="background:#fff;padding:32px;border-radius:0 0 12px 12px">
          <h2 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#111">${subject}</h2>
          <div style="font-size:15px;color:#374151;line-height:1.7;white-space:pre-wrap">${body.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
          <div style="margin-top:32px;text-align:center">
            <a href="https://eppa.vercel.app/shop" style="background:#000;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:700">Shop Now</a>
          </div>
          <p style="margin:28px 0 0;font-size:12px;color:#9ca3af;text-align:center">You are receiving this email because you subscribed to Eppa's Shop updates.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  let sent = 0;
  let failed = 0;

  // Send in batches of 10 to avoid rate limits
  const emails = subscribers.map(s => s.email);
  for (let i = 0; i < emails.length; i += 10) {
    const batch = emails.slice(i, i + 10);
    await Promise.all(batch.map(async (to) => {
      try {
        await resend!.emails.send({ from: FROM, to, subject, html });
        sent++;
      } catch {
        failed++;
      }
    }));
  }

  return NextResponse.json({ ok: true, sent, failed, total: subscribers.length });
}
