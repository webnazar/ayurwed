import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import { db } from '@/lib/db';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, dbOrderId, isMock } = await req.json();

    // Bypass verification for test environments
    if (isMock) {
      await db.order.update({
        where: { id: dbOrderId },
        data: {
          paymentStatus: 'PAID',
          status: 'PROCESSING'
        }
      });
      return NextResponse.json({ success: true, message: 'Mock Payment verified successfully' }, { status: 200 });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const secret = process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder';

    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Payment is successful
      await db.order.update({
        where: { id: dbOrderId },
        data: {
          paymentStatus: 'PAID',
          status: 'PROCESSING'
        }
      });

      return NextResponse.json({ success: true, message: 'Payment verified successfully' }, { status: 200 });
    } else {
      await db.order.update({
        where: { id: dbOrderId },
        data: { paymentStatus: 'FAILED' }
      });
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
