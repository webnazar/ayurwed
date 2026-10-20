import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Login required' }, { status: 401 });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const userId = Number((session.user as any).id);

    // Fetch order to verify ownership & status
    const order = await db.shopOrder.findFirst({
      where: { id: Number(orderId), userId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
      return NextResponse.json(
        { error: `Cannot cancel order in ${order.status} state` },
        { status: 400 }
      );
    }

    // Cancel order
    const updatedOrder = await db.shopOrder.update({
      where: { id: order.id },
      data: {
        status: 'CANCELLED',
      },
    });

    // Restore stock for cancelled products
    for (const item of order.items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Error cancelling order:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
