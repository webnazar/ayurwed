import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'CONSULTANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { appointmentId, patientId, patientName, patientAge, patientGender, patientHeight, patientWeight, patientBodyTemperature, patientBloodPressure, patientPrakruti, patientActivityLevel, chronicDiseases, allergies, notes, concern, items, consultantJudgment, dosageInstructions, followUpAdvice, status } = body;

    if (!appointmentId || !patientId || !items) {
      return NextResponse.json({ error: 'Missing required data' }, { status: 400 });
    }

    const apptId = Number(appointmentId);
    const patId = Number(patientId);

    // Get consultant profile ID
    const consultant = await db.consultantProfile.findUnique({
      where: { userId: Number(session.user.id) }
    });

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant profile not found' }, { status: 404 });
    }

    // Security: Check that the appointment belongs to this consultant
    const appointment = await db.appointment.findUnique({
      where: { id: apptId }
    });

    if (!appointment || appointment.consultantId !== consultant.id) {
      return NextResponse.json({ error: 'Forbidden: You do not own this consultation appointment' }, { status: 403 });
    }

    // Format items with fallback values for required fields
    const formattedItems = (Array.isArray(items) ? items : []).map((item: any) => ({
      productId: item.productId ? Number(item.productId) : (item.preparationId ? Number(item.preparationId) : null),
      customMedicineId: item.customMedicineId ? Number(item.customMedicineId) : null,
      customName: item.customName || null,
      dosage: item.dosage && String(item.dosage).trim() ? String(item.dosage).trim() : 'As advised',
      frequency: item.frequency && String(item.frequency).trim() ? String(item.frequency).trim() : '1-0-1',
      duration: item.duration && String(item.duration).trim() ? String(item.duration).trim() : '7 days',
      instructions: item.instructions || ''
    }));

    const parsedAge = (patientAge !== null && patientAge !== undefined && !isNaN(Number(patientAge))) ? Number(patientAge) : null;
    const parsedHeight = (patientHeight !== null && patientHeight !== undefined && !isNaN(Number(patientHeight))) ? Number(patientHeight) : null;
    const parsedWeight = (patientWeight !== null && patientWeight !== undefined && !isNaN(Number(patientWeight))) ? Number(patientWeight) : null;
    const parsedTemp = (patientBodyTemperature !== null && patientBodyTemperature !== undefined && !isNaN(Number(patientBodyTemperature))) ? Number(patientBodyTemperature) : null;

    // Upsert prescription
    const prescription = await db.prescription.upsert({
      where: { appointmentId: apptId },
      update: {
        patientId: patId,
        patientAge: parsedAge,
        patientGender: patientGender ? String(patientGender) : null,
        consultantJudgment: consultantJudgment || '',
        dosageInstructions: dosageInstructions || '',
        followUpAdvice: followUpAdvice || null,
        patientHeight: parsedHeight,
        patientWeight: parsedWeight,
        patientBodyTemperature: parsedTemp,
        patientBloodPressure: patientBloodPressure ? String(patientBloodPressure) : null,
        patientPrakruti: patientPrakruti ? String(patientPrakruti) : null,
        patientActivityLevel: patientActivityLevel ? String(patientActivityLevel) : null,
        chronicConditions: chronicDiseases ? String(chronicDiseases) : null,
        status: status || 'DRAFT',
        items: {
          deleteMany: {}, // Clear existing items
          create: formattedItems
        }
      },
      create: {
        appointmentId: apptId,
        patientId: patId,
        consultantId: consultant.id,
        patientAge: parsedAge,
        patientGender: patientGender ? String(patientGender) : null,
        consultantJudgment: consultantJudgment || '',
        dosageInstructions: dosageInstructions || '',
        followUpAdvice: followUpAdvice || null,
        patientHeight: parsedHeight,
        patientWeight: parsedWeight,
        patientBodyTemperature: parsedTemp,
        patientBloodPressure: patientBloodPressure ? String(patientBloodPressure) : null,
        patientPrakruti: patientPrakruti ? String(patientPrakruti) : null,
        patientActivityLevel: patientActivityLevel ? String(patientActivityLevel) : null,
        chronicConditions: chronicDiseases ? String(chronicDiseases) : null,
        status: status || 'DRAFT',
        items: {
          create: formattedItems
        }
      },
      include: {
        items: {
          include: {
            product: true,
            customMedicine: true
          }
        }
      }
    });

    // Update appointment patient details: name, age, gender, height, weight, temperature, blood pressure, prakruti, activity level, chronicDiseases, allergies, notes, and concern
    await db.appointment.update({
      where: { id: apptId },
      data: {
        patientName: patientName !== undefined ? String(patientName) : undefined,
        patientAge: parsedAge,
        patientGender: patientGender !== undefined ? String(patientGender) : undefined,
        patientHeight: parsedHeight,
        patientWeight: parsedWeight,
        patientBodyTemperature: parsedTemp,
        patientBloodPressure: patientBloodPressure ? String(patientBloodPressure) : null,
        patientPrakruti: patientPrakruti ? String(patientPrakruti) : null,
        patientActivityLevel: patientActivityLevel ? String(patientActivityLevel) : null,
        chronicDiseases: chronicDiseases !== undefined ? String(chronicDiseases) : undefined,
        allergies: allergies !== undefined ? String(allergies) : undefined,
        notes: notes !== undefined ? String(notes) : undefined,
        concern: concern !== undefined ? String(concern) : undefined,
      }
    });

    // Also update consumer profile height & weight & temperature & pressure & prakruti & activityLevel & gender if profile exists
    await db.consumerProfile.updateMany({
      where: { userId: patId },
      data: {
        gender: patientGender ? String(patientGender) : undefined,
        height: parsedHeight,
        weight: parsedWeight,
        bodyTemperature: parsedTemp,
        bloodPressure: patientBloodPressure ? String(patientBloodPressure) : undefined,
        prakruti: patientPrakruti ? String(patientPrakruti) : undefined,
        activityLevel: patientActivityLevel ? String(patientActivityLevel) : undefined,
        medicalHistory: chronicDiseases ? String(chronicDiseases) : undefined,
      }
    });

    // If finalizing the prescription, also mark the appointment as COMPLETED
    if (status === 'PRESCRIBED') {
      await db.appointment.update({
        where: { id: apptId },
        data: { status: 'COMPLETED' }
      });

      // Notify patient that prescription is ready
      await db.notification.create({
        data: {
          userId: patId,
          title: 'Prescription Finalized',
          message: `Dr. ${session.user.name} has finalized your prescription. You can view or print your Rx directly from your appointments dashboard.`,
          isRead: false
        }
      });
    }

    return NextResponse.json({ prescription });
  } catch (error: any) {
    console.error('Prescription save error:', error);
    return NextResponse.json({ error: error?.message || 'Internal server error' }, { status: 500 });
  }
}
