import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { fulfillmentId } = body;

    if (!fulfillmentId) {
      return NextResponse.json({ error: 'Missing fulfillmentId' }, { status: 400 });
    }

    const fulfillment = await db.fulfillment.findFirst({
      where: {
        id: Number(fulfillmentId),
        patientId: Number(session.user.id)
      },
      include: {
        consultant: true
      }
    });

    if (!fulfillment) {
      return NextResponse.json({ error: 'Fulfillment order not found or unauthorized' }, { status: 404 });
    }

    if (fulfillment.status !== 'PENDING') {
      return NextResponse.json({ error: 'Order already processed' }, { status: 400 });
    }

    const updated = await db.fulfillment.update({
      where: { id: fulfillment.id },
      data: {
        status: 'CONFIRMED'
      }
    });

    // Create in-app notification for consultant
    await db.notification.create({
      data: {
        userId: fulfillment.consultant.userId,
        title: 'New Medicine Order Placed',
        message: `A patient has confirmed their medicine order for prescription #${fulfillment.prescriptionId}. Please prepare the medicines.`,
        isRead: false
      }
    });

    return NextResponse.json({ success: true, fulfillment: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
