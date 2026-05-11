import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || "Eppa's Shop <orders@eppa.shop>";

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  reference: string;
  total: number;
  address: string;
  paymentMethod: string;
  items: { productName: string; quantity: number; price: number }[];
  bankDetails?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    sortCode?: string;
  };
}

function orderEmailHtml(d: OrderEmailData): string {
  const isBankTransfer = d.paymentMethod === 'bank_transfer';
  const itemRows = d.items.map(i => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333">${i.productName}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;text-align:center">${i.quantity}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;text-align:right">£${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`).join('');

  const bankSection = isBankTransfer && d.bankDetails ? `
    <div style="background:#fffbeb;border:1px solid #fcd34d;border-radius:8px;padding:20px;margin:24px 0">
      <p style="margin:0 0 12px;font-weight:700;color:#92400e;font-size:15px">⚠️ Action Required: Complete Your Bank Transfer</p>
      <table style="width:100%;border-collapse:collapse">
        ${d.bankDetails.bankName ? `<tr><td style="padding:4px 0;font-size:13px;color:#78350f;width:140px">Bank</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#451a03">${d.bankDetails.bankName}</td></tr>` : ''}
        ${d.bankDetails.accountName ? `<tr><td style="padding:4px 0;font-size:13px;color:#78350f">Account Name</td><td style="padding:4px 0;font-size:13px;font-weight:600;color:#451a03">${d.bankDetails.accountName}</td></tr>` : ''}
        ${d.bankDetails.accountNumber ? `<tr><td style="padding:4px 0;font-size:13px;color:#78350f">Account Number</td><td style="padding:4px 0;font-size:14px;font-weight:700;color:#451a03;font-family:monospace">${d.bankDetails.accountNumber}</td></tr>` : ''}
        ${d.bankDetails.sortCode ? `<tr><td style="padding:4px 0;font-size:13px;color:#78350f">Sort Code</td><td style="padding:4px 0;font-size:14px;font-weight:700;color:#451a03;font-family:monospace">${d.bankDetails.sortCode}</td></tr>` : ''}
        <tr><td style="padding:8px 0 4px;font-size:13px;color:#78350f;border-top:1px solid #fcd34d">Reference</td><td style="padding:8px 0 4px;font-size:16px;font-weight:800;color:#92400e;font-family:monospace;border-top:1px solid #fcd34d">${d.reference}</td></tr>
        <tr><td style="padding:4px 0;font-size:13px;color:#78350f">Amount</td><td style="padding:4px 0;font-size:15px;font-weight:700;color:#451a03">£${d.total.toFixed(2)}</td></tr>
      </table>
      <p style="margin:12px 0 0;font-size:12px;color:#92400e">Please use <strong>${d.reference}</strong> as your payment reference so we can match your transfer and process your order promptly.</p>
    </div>` : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px">

        <!-- Header -->
        <tr><td style="background:#1a5c38;border-radius:12px 12px 0 0;padding:32px;text-align:center">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:3px;color:#86efac;text-transform:uppercase">Order Confirmed</p>
          <h1 style="margin:0;font-size:32px;font-weight:800;color:#ffffff">Thank You, ${d.customerName.split(' ')[0]}!</h1>
          <p style="margin:12px 0 0;font-size:14px;color:#bbf7d0">Your order has been placed successfully.</p>
        </td></tr>

        <!-- Reference badge -->
        <tr><td style="background:#ffffff;padding:24px 32px 0;text-align:center">
          <p style="margin:0 0 8px;font-size:13px;color:#6b7280">Your order reference number</p>
          <div style="display:inline-block;background:#f0fdf4;border:2px solid #86efac;border-radius:8px;padding:10px 28px">
            <span style="font-family:monospace;font-size:22px;font-weight:800;color:#15803d;letter-spacing:2px">${d.reference}</span>
          </div>
          ${isBankTransfer ? '<p style="margin:10px 0 0;font-size:12px;color:#dc2626;font-weight:600">Use this reference when making your bank transfer.</p>' : '<p style="margin:10px 0 0;font-size:12px;color:#6b7280">Keep this for your records.</p>'}
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:24px 32px">

          ${bankSection}

          <!-- Order items -->
          <p style="margin:0 0 12px;font-size:15px;font-weight:700;color:#111827">Order Summary</p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <thead>
              <tr>
                <th style="text-align:left;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f3f4f6">Product</th>
                <th style="text-align:center;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f3f4f6">Qty</th>
                <th style="text-align:right;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f3f4f6">Total</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr><td colspan="3" style="padding-top:12px">
                <div style="display:flex;justify-content:flex-end">
                  <table>
                    <tr>
                      <td style="font-size:16px;font-weight:800;color:#111827;text-align:right;padding-top:4px">Order Total:&nbsp;&nbsp;£${d.total.toFixed(2)}</td>
                    </tr>
                  </table>
                </div>
              </td></tr>
            </tfoot>
          </table>

          <!-- Delivery address -->
          <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-top:24px">
            <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#9ca3af;text-transform:uppercase;letter-spacing:1px">Delivery Address</p>
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">${d.address.replace(/,\s*/g, '<br>')}</p>
          </div>

          <!-- Payment status -->
          <div style="margin-top:16px;padding:12px 16px;border-radius:8px;background:${isBankTransfer ? '#fffbeb' : '#f0fdf4'};border:1px solid ${isBankTransfer ? '#fde68a' : '#bbf7d0'}">
            <p style="margin:0;font-size:13px;color:${isBankTransfer ? '#92400e' : '#15803d'};font-weight:600">
              ${isBankTransfer ? '⏳ Payment pending: awaiting bank transfer' : '✓ Payment received'}
            </p>
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f3f4f6;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center">
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280">Questions? Contact us at <a href="mailto:hello@eppa.shop" style="color:#15803d">hello@eppa.shop</a></p>
          <p style="margin:0;font-size:12px;color:#9ca3af">Eppa's Shop</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  if (!resend || !data.customerEmail) return;

  try {
    await resend.emails.send({
      from: FROM,
      to: data.customerEmail,
      subject: `Order Confirmed: ${data.reference} | Eppa's Shop`,
      html: orderEmailHtml(data),
    });
  } catch (err) {
    // Email failure should never block order creation
    console.error('Email send failed:', err);
  }
}


export async function sendAdminOrderNotification(data: OrderEmailData): Promise<void> {
  if (!resend) return;
  const adminEmail = process.env.ADMIN_EMAIL || 'digitalsheakh@gmail.com';
  const itemRows = data.items.map(i =>
    `<tr><td style="padding:6px 0;font-size:13px;border-bottom:1px solid #f3f4f6">${i.productName}</td><td style="padding:6px 0;font-size:13px;border-bottom:1px solid #f3f4f6;text-align:center">${i.quantity}</td><td style="padding:6px 0;font-size:13px;border-bottom:1px solid #f3f4f6;text-align:right">£${(i.price * i.quantity).toFixed(2)}</td></tr>`
  ).join('');

  const html = `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f9fafb;padding:24px">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb">
    <div style="background:#f26522;padding:24px;text-align:center">
      <h1 style="margin:0;color:#fff;font-size:22px">New Order Received</h1>
      <p style="margin:8px 0 0;color:#fff;font-size:14px;opacity:.9">Reference: <strong>${data.reference}</strong></p>
    </div>
    <div style="padding:24px">
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <tr><td style="font-size:13px;color:#6b7280;padding:4px 0;width:130px">Customer</td><td style="font-size:13px;font-weight:600;color:#111">${data.customerName}</td></tr>
        <tr><td style="font-size:13px;color:#6b7280;padding:4px 0">Email</td><td style="font-size:13px;color:#111">${data.customerEmail}</td></tr>
        <tr><td style="font-size:13px;color:#6b7280;padding:4px 0">Address</td><td style="font-size:13px;color:#111">${data.address}</td></tr>
        <tr><td style="font-size:13px;color:#6b7280;padding:4px 0">Payment</td><td style="font-size:13px;color:#111">${data.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Card'}</td></tr>
        <tr><td style="font-size:13px;color:#6b7280;padding:4px 0">Total</td><td style="font-size:15px;font-weight:700;color:#f26522">£${data.total.toFixed(2)}</td></tr>
      </table>
      <p style="font-size:13px;font-weight:600;color:#111;margin:0 0 8px">Items Ordered</p>
      <table style="width:100%;border-collapse:collapse">
        <thead><tr>
          <th style="text-align:left;font-size:11px;color:#9ca3af;text-transform:uppercase;padding-bottom:6px">Product</th>
          <th style="text-align:center;font-size:11px;color:#9ca3af;text-transform:uppercase;padding-bottom:6px">Qty</th>
          <th style="text-align:right;font-size:11px;color:#9ca3af;text-transform:uppercase;padding-bottom:6px">Total</th>
        </tr></thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="margin-top:20px;text-align:center">
        <a href="https://www.eppa.shop/admin/orders" style="background:#f26522;color:#fff;padding:10px 24px;border-radius:99px;text-decoration:none;font-size:13px;font-weight:600">View in Admin</a>
      </div>
    </div>
  </div>
</body></html>`;

  try {
    await resend.emails.send({ from: FROM, to: adminEmail, subject: `New Order ${data.reference} - £${data.total.toFixed(2)}`, html });
  } catch (err) {
    console.error('Admin email failed:', err);
  }
}
