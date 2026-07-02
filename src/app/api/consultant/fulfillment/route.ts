import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'CONSULTANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const consultant = await db.consultantProfile.findUnique({
      where: { userId: Number(session.user.id) }
    });

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { fulfillmentId, status, trackingNumber } = body;

    if (!fulfillmentId || !status) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const fulfillment = await db.fulfillment.findFirst({
      where: {
        id: Number(fulfillmentId),
        consultantId: consultant.id
      }
    });

    if (!fulfillment) {
      return NextResponse.json({ error: 'Fulfillment order not found' }, { status: 404 });
    }

    const updated = await db.fulfillment.update({
      where: { id: fulfillment.id },
      data: {
        status,
        trackingNumber: trackingNumber !== undefined ? trackingNumber : undefined
      }
    });

    // Create in-app notification for patient
    await db.notification.create({
      data: {
        userId: fulfillment.patientId,
        title: `Medicine Order Update: ${status}`,
        message: `Your medicine order status has been updated to ${status}.${
          trackingNumber ? ` Tracking details: ${trackingNumber}.` : ''
        }`,
        isRead: false
      }
    });

    return NextResponse.json({ success: true, fulfillment: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
