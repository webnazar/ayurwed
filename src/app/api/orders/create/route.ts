import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import Razorpay from 'razorpay';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'secret_placeholder',
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // We strictly enforce logged-in checkout based on our plan
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'You must be logged in to checkout' }, { status: 401 });
    }

    const { items, shippingAddress } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Securely calculate subtotal server-side by fetching actual preparation prices from the database
    const itemIds = items.map((i: any) => Number(i.id));
    const databaseItems = await db.preparation.findMany({
      where: { id: { in: itemIds } },
      select: { id: true, mrp: true }
    });

    const dbItemMap = new Map(databaseItems.map(item => [item.id, Number(item.mrp || 0)]));

    let subtotal = 0;
    for (const item of items) {
      const dbPrice = dbItemMap.get(Number(item.id));
      if (dbPrice === undefined) {
        return NextResponse.json({ error: `Item with ID ${item.id} not found` }, { status: 400 });
      }
      subtotal += dbPrice * Number(item.quantity);
      // Ensure we use the server-validated price in subsequent db updates
      item.mrp = dbPrice;
    }

    const shipping = subtotal > 999 ? 0 : 50;
    const totalAmount = subtotal + shipping;

    // Create Order in Database
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const dbOrder = await db.order.create({
      data: {
        orderNumber,
        userId: Number(session.user.id),
        totalAmount,
        shippingAddress,
        status: 'PENDING',
        paymentStatus: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            extractId: Number(item.id),
            quantity: Number(item.quantity),
            price: item.mrp,
            total: item.mrp * Number(item.quantity)
          }))
        }
      }
    });

    // Generate Razorpay Order
    const options = {
      amount: Math.round(totalAmount * 100), // amount in smallest currency unit (paise)
      currency: "INR",
      receipt: orderNumber,
    };

    let razorpayOrder;
    
    // Mock Razorpay order if keys are not configured or empty
    const keyId = process.env.RAZORPAY_KEY_ID;
    if (!keyId || keyId === 'rzp_test_placeholder' || keyId === 'rzp_test_dummykey' || keyId.trim() === '') {
      razorpayOrder = {
        id: `fake_order_${Date.now()}`,
        amount: options.amount,
        currency: options.currency,
      };
    } else {
      razorpayOrder = await razorpay.orders.create(options);
    }

    return NextResponse.json({
      dbOrderId: dbOrder.id,
      orderNumber: dbOrder.orderNumber,
      razorpayOrder
    });

  } catch (error: any) {
    console.error('Error creating order:', error);
    
    // Handle Razorpay specific error objects
    let errorMessage = 'Failed to create order';
    if (error && error.error && error.error.description) {
      errorMessage = `Razorpay Error: ${error.error.description}`;
    } else if (error && error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json({ 
      error: errorMessage,
      details: typeof error === 'object' ? JSON.stringify(error) : String(error)
    }, { status: 500 });
  }
}
