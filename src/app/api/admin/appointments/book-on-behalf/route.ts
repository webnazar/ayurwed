import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const {
      patientId, newPatientName, newPatientPhone, newPatientEmail, newPatientGender, newPatientAge,
      consultantId, date, slot, type, concern, visitType,
      bypassLimits, paymentStatus, chronicDiseases, allergies
    } = await req.json();

    let targetUserId: number;

    // 1. Resolve Patient
    if (patientId) {
      targetUserId = Number(patientId);
      const existingUser = await db.user.findUnique({ where: { id: targetUserId } });
      if (!existingUser) {
        return NextResponse.json({ error: 'Selected patient user not found' }, { status: 404 });
      }
    } else if (newPatientName && (newPatientPhone || newPatientEmail)) {
      // Auto-register new patient
      const searchEmail = newPatientEmail || `patient_${Date.now()}@ayurwed.org`;
      let user = await db.user.findFirst({
        where: {
          OR: [
            newPatientPhone ? { phone: newPatientPhone } : undefined,
            newPatientEmail ? { email: newPatientEmail } : undefined,
          ].filter(Boolean) as any
        }
      });

      if (!user) {
        const hashedPassword = await bcrypt.hash('Patient123!', 10);
        user = await db.user.create({
          data: {
            name: newPatientName,
            email: searchEmail,
            phone: newPatientPhone || null,
            password: hashedPassword,
            role: 'CONSUMER',
          }
        });
      }
      targetUserId = user.id;
    } else {
      return NextResponse.json({ error: 'Please select an existing patient or fill in new patient details.' }, { status: 400 });
    }

    // 2. Resolve Consultant
    const consultant = await db.consultantProfile.findUnique({
      where: { id: Number(consultantId) },
      include: { user: true }
    });

    if (!consultant) {
      return NextResponse.json({ error: 'Doctor/Consultant not found' }, { status: 404 });
    }

    // 3. Resolve Fee
    const resolvedFee = visitType === 'FOLLOW_UP' ? Number(consultant.followUpFee) : Number(consultant.consultationFee);

    // 4. Resolve Scheduled Date & Time
    const [timeStr, ampm] = slot.split(' ');
    let [hours, minutes] = timeStr.split(':').map(Number);
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    const scheduledAt = new Date(`${date}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);

    // 5. Anti-Abuse Checks (if not explicitly bypassed by Admin)
    if (!bypassLimits) {
      const activeAppt = await db.appointment.findFirst({
        where: {
          userId: targetUserId,
          consultantId: Number(consultantId),
          status: { in: ['PENDING', 'CONFIRMED'] },
        }
      });

      if (activeAppt) {
        return NextResponse.json(
          { error: 'Patient already has an active appointment with this doctor. Toggle "Admin Override" to force book.' },
          { status: 400 }
        );
      }
    }

    // Get Target User Phone & Name
    const targetUser = await db.user.findUnique({ where: { id: targetUserId } });

    // 6. Create Appointment
    const appointment = await db.appointment.create({
      data: {
        consultantId: Number(consultantId),
        userId: targetUserId,
        scheduledAt,
        type: type || 'VIDEO',
        concern: concern || 'Booked via Admin Phone Service',
        fee: paymentStatus === 'COMPLIMENTARY' ? 0 : resolvedFee,
        status: 'CONFIRMED', // Admin booked appointments are auto-confirmed
        patientName: newPatientName || targetUser?.name || 'Patient',
        patientAge: newPatientAge ? Number(newPatientAge) : null,
        patientGender: newPatientGender || 'Male',
        patientPhone: newPatientPhone || targetUser?.phone || null,
        chronicDiseases: chronicDiseases || null,
        allergies: allergies || null,
      },
      include: {
        consultant: { include: { user: { select: { name: true } } } },
        user: { select: { name: true, email: true, phone: true } }
      }
    });

    return NextResponse.json({
      success: true,
      message: `Appointment successfully booked for ${appointment.patientName} with Dr. ${appointment.consultant?.user?.name}!`,
      appointment
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
