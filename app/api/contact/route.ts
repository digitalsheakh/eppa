import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "Eppa's Shop <eppa.shop.uk@gmail.com>";
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
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden">
        <tr><td style="background:#000000;padding:28px 32px;text-align:center">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:3px;color:#999999;text-transform:uppercase">Eppa's Shop</p>
          <h1 style="margin:0;font-size:24px;font-weight:800;color:#ffffff">💬 New Contact Message</h1>
        </td></tr>
        <tr><td style="background:#ffffff;padding:28px 32px">
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
            <tr><td style="padding:8px 0;font-size:12px;color:#9ca3af;width:90px;vertical-align:top;font-weight:600">From</td><td style="padding:8px 0;font-size:14px;font-weight:600;color:#111827">${name}</td></tr>
            <tr><td style="padding:8px 0;font-size:12px;color:#9ca3af;vertical-align:top;font-weight:600">Email</td><td style="padding:8px 0;font-size:14px;color:#111827"><a href="mailto:${email}" style="color:#000000;font-weight:600;text-decoration:none">${email}</a></td></tr>
            <tr><td style="padding:8px 0;font-size:12px;color:#9ca3af;vertical-align:top;font-weight:600">Subject</td><td style="padding:8px 0;font-size:14px;font-weight:700;color:#111827">${subject}</td></tr>
          </table>
          <div style="background:#f9fafb;border-radius:8px;padding:18px;border:1px solid #e5e7eb">
            <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px">Message</p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.7;white-space:pre-wrap">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>
          <div style="margin-top:24px;text-align:center">
            <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="display:inline-block;background:#000000;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:700">Reply to ${name.split(' ')[0]}</a>
          </div>
        </td></tr>
        <tr><td style="background:#f3f4f6;padding:18px 32px;text-align:center">
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
