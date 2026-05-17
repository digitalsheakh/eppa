import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "Eppa's Shop <orders@eppa.shop>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'eppa.shop.uk@gmail.com';

export async function POST(req: NextRequest) {
  const { name, email, subject, message } = await req.json();
  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
  }
  if (!resend) {
    return NextResponse.json({ error: 'Email not configured.' }, { status: 500 });
  }

  const html = `<!DOCTYPE html><html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">
        <tr><td style="background:#000;border-radius:12px 12px 0 0;padding:24px 32px">
          <p style="margin:0 0 2px;font-size:11px;font-weight:700;letter-spacing:3px;color:#999;text-transform:uppercase">Eppa's Shop</p>
          <h1 style="margin:0;font-size:20px;font-weight:800;color:#fff">New Contact Message</h1>
        </td></tr>
        <tr><td style="background:#fff;padding:28px 32px">
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <tr><td style="padding:6px 0;font-size:12px;color:#9ca3af;width:90px;vertical-align:top">From</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#111">${name}</td></tr>
            <tr><td style="padding:6px 0;font-size:12px;color:#9ca3af;vertical-align:top">Email</td><td style="padding:6px 0;font-size:14px;color:#111"><a href="mailto:${email}" style="color:#000">${email}</a></td></tr>
            <tr><td style="padding:6px 0;font-size:12px;color:#9ca3af;vertical-align:top">Subject</td><td style="padding:6px 0;font-size:14px;font-weight:600;color:#111">${subject}</td></tr>
          </table>
          <div style="background:#f9fafb;border-radius:8px;padding:16px;border:1px solid #e5e7eb">
            <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px">Message</p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>
          <div style="margin-top:20px">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="background:#000;color:#fff;padding:10px 22px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700">Reply to ${name.split(' ')[0]}</a>
          </div>
        </td></tr>
        <tr><td style="background:#f3f4f6;border-radius:0 0 12px 12px;padding:16px 32px;text-align:center">
          <p style="margin:0;font-size:12px;color:#9ca3af">Eppa's Shop — Contact Form Submission</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      replyTo: email,
      subject: `Contact: ${subject} — from ${name}`,
      html,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact email failed:', err);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
