import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'CONSULTANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { appointmentId, patientId, items, consultantJudgment, dosageInstructions, followUpAdvice, status } = body;

    if (!appointmentId || !patientId || !items) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    // Get consultant profile ID
    const consultant = await prisma.consultantProfile.findUnique({
      where: { userId: Number(session.user.id) }
    });

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant profile not found' }, { status: 404 });
    }

    // Upsert prescription
    const prescription = await prisma.prescription.upsert({
      where: { appointmentId },
      update: {
        consultantJudgment: consultantJudgment || '',
        dosageInstructions: dosageInstructions || '',
        followUpAdvice: followUpAdvice || null,
        status: status || 'DRAFT',
        items: {
          deleteMany: {}, // Clear existing items
          create: items.map((item: any) => ({
            preparationId: item.preparationId,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions || ''
          }))
        }
      },
      create: {
        appointmentId,
        patientId,
        consultantId: consultant.id,
        consultantJudgment: consultantJudgment || '',
        dosageInstructions: dosageInstructions || '',
        followUpAdvice: followUpAdvice || null,
        status: status || 'DRAFT',
        items: {
          create: items.map((item: any) => ({
            preparationId: item.preparationId,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions || ''
          }))
        }
      },
      include: {
        items: true
      }
    });

    // If finalizing the prescription, also mark the appointment as COMPLETED
    if (status === 'PRESCRIBED') {
      await prisma.appointment.update({
        where: { id: appointmentId },
        data: { status: 'COMPLETED' }
      });

      // Spawn a fulfillment record and patient notification
      const existingFulfillment = await prisma.fulfillment.findUnique({
        where: { prescriptionId: prescription.id }
      });

      if (!existingFulfillment) {
        await prisma.fulfillment.create({
          data: {
            prescriptionId: prescription.id,
            consultantId: consultant.id,
            patientId: Number(patientId),
            method: consultant.fulfillmentMethod || 'COURIER',
            status: 'PENDING'
          }
        });

        // Notify patient
        await prisma.notification.create({
          data: {
            userId: Number(patientId),
            title: 'Prescription Finalized & Pending Fulfillment',
            message: `Dr. ${session.user.name} has finalized your prescription. The medicine fulfillment status is currently PENDING. Please proceed to order your medicines.`,
            isRead: false
          }
        });
      }
    }

    return NextResponse.json({ prescription });
  } catch (error) {
    console.error('Prescription save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
