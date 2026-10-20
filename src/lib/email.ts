import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST || 'smtp.gmail.com';
const port = parseInt(process.env.SMTP_PORT || '587');
const user = process.env.SMTP_USER || '';
const pass = process.env.SMTP_PASS || '';

const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: user && pass ? { user, pass } : undefined,
});

export interface OrderEmailPayload {
  orderNumber: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount?: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  userEmail: string;
  userName: string;
  shippingAddress?: any;
}

export async function sendOrderConfirmationEmail(payload: OrderEmailPayload): Promise<boolean> {
  const { orderNumber, total, subtotal, shipping, discount = 0, items, userEmail, userName } = payload;

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #045829;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right;">₹${item.price.toLocaleString('en-IN')}</td>
      <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">₹${item.total.toLocaleString('en-IN')}</td>
    </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Confirmation - AYURWED</title>
    </head>
    <body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="background-color: #045829; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; letter-spacing: 2px;">AYURWED</h1>
          <p style="margin: 4px 0 0; font-size: 12px; color: #fbbf24; text-transform: uppercase; letter-spacing: 1px;">Ancient Intelligence for Modern Wellness</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="color: #045829; margin-top: 0;">Order Confirmed! 🎉</h2>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">
            Dear <strong>${userName}</strong>,<br>
            Thank you for your order with <strong>AYURWED</strong>. We are preparing your authentic Ayurvedic formulations for shipment.
          </p>

          <div style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <p style="margin: 0 0 8px; font-size: 13px; color: #64748b;"><strong>Order Number:</strong> <span style="color: #0f172a;">${orderNumber}</span></p>
            <p style="margin: 0; font-size: 13px; color: #64748b;"><strong>Status:</strong> <span style="color: #045829; font-weight: bold;">Processing (Prepaid)</span></p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f8fafc; color: #045829;">
                <th style="padding: 8px 10px; text-align: left;">Item</th>
                <th style="padding: 8px 10px; text-align: center;">Qty</th>
                <th style="padding: 8px 10px; text-align: right;">Price</th>
                <th style="padding: 8px 10px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="text-align: right; border-top: 2px solid #e2e8f0; pt-12px; font-size: 14px;">
            <p style="margin: 4px 0; color: #64748b;">Subtotal: <strong>₹${subtotal.toLocaleString('en-IN')}</strong></p>
            ${discount > 0 ? `<p style="margin: 4px 0; color: #ef4444;">Discount: <strong>-₹${discount.toLocaleString('en-IN')}</strong></p>` : ''}
            <p style="margin: 4px 0; color: #64748b;">Shipping: <strong>${shipping === 0 ? 'FREE' : `₹${shipping}`}</strong></p>
            <p style="margin: 8px 0 0; font-size: 18px; color: #045829; font-weight: bold;">Grand Total: ₹${total.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0;">Questions? Contact us at <a href="mailto:support@ayurwed.com" style="color: #045829; font-weight: bold;">support@ayurwed.com</a></p>
          <p style="margin: 4px 0 0;">AYURWED Wellness Circle • www.ayurwed.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  if (!user || !pass) {
    console.log(`[Email Mock] SMTP credentials not set. Simulating order confirmation email to ${userEmail} for Order #${orderNumber}`);
    return true;
  }

  try {
    await transporter.sendMail({
      from: `"AYURWED Wellness" <${user}>`,
      to: userEmail,
      subject: `Order Confirmation #${orderNumber} — AYURWED`,
      html,
    });
    return true;
  } catch (err) {
    console.error('Failed to send order confirmation email:', err);
    return false;
  }
}
