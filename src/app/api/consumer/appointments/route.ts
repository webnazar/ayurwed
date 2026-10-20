import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const appointments = await db.appointment.findMany({
      where: { userId: Number((session.user as any).id) },
      orderBy: { scheduledAt: 'desc' },
      include: {
        consultant: {
          include: { user: { select: { name: true, avatar: true } } },
        },
      },
    });
    return NextResponse.json(appointments);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id, status } = await req.json();
    const appt = await db.appointment.findFirst({ where: { id: Number(id), userId: Number((session.user as any).id) } });
    if (!appt) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (appt.status !== 'PENDING') return NextResponse.json({ error: 'Cannot cancel non-pending appointment' }, { status: 400 });
    const updated = await db.appointment.update({
      where: { id: Number(id) }, data: { status },
      include: { consultant: { include: { user: { select: { name: true, avatar: true } } } } },
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { 
      consultantId, date, slot, type, concern, visitType,
      patientName, patientAge, patientGender, patientPhone, patientRelation,
      chronicDiseases, allergies
    } = await req.json();

    const consultant = await db.consultantProfile.findUnique({
      where: { id: Number(consultantId) }
    });

    if (!consultant) {
      return NextResponse.json({ error: 'Consultant not found' }, { status: 404 });
    }

    const resolvedFee = visitType === 'FOLLOW_UP' ? Number(consultant.followUpFee) : Number(consultant.consultationFee);

    // 1. Doctor-specific active appointment check
    const existingActiveAppt = await db.appointment.findFirst({
      where: {
        userId: Number((session.user as any).id),
        consultantId: Number(consultantId),
        status: { in: ['PENDING', 'CONFIRMED'] },
      }
    });

    if (existingActiveAppt) {
      return NextResponse.json(
        { error: 'You already have an active appointment with this doctor. Please complete or cancel your current appointment before scheduling a new one.' },
        { status: 400 }
      );
    }

    // 2. Anti-Abuse Protection for Free Consultations
    if (resolvedFee === 0) {
      // Check if patient has any active free consultation with ANY doctor
      const activeFreeAppt = await db.appointment.findFirst({
        where: {
          userId: Number((session.user as any).id),
          fee: 0,
          status: { in: ['PENDING', 'CONFIRMED'] },
        },
        include: {
          consultant: {
            include: { user: { select: { name: true } } }
          }
        }
      });

      if (activeFreeAppt) {
        const docName = activeFreeAppt.consultant?.user?.name || 'Doctor';
        return NextResponse.json(
          { error: `You already have an active free consultation scheduled with Dr. ${docName}. Free consultations are limited to 1 active session at a time platform-wide.` },
          { status: 400 }
        );
      }

      // Check 24-hour cooldown limit for free consultations
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentFreeAppt = await db.appointment.findFirst({
        where: {
          userId: Number((session.user as any).id),
          fee: 0,
          createdAt: { gte: twentyFourHoursAgo },
        }
      });

      if (recentFreeAppt) {
        return NextResponse.json(
          { error: 'To prevent spam bookings, free consultations are limited to one per patient every 24 hours.' },
          { status: 400 }
        );
      }
    }
    
    if (consultant.userId === Number((session.user as any).id)) {
      return NextResponse.json({ error: 'Doctors cannot book consultations with themselves.' }, { status: 400 });
    }

    const [timeStr, ampm] = slot.split(' ');
    let [hours, minutes] = timeStr.split(':').map(Number);
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    const scheduledAt = new Date(`${date}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:00`);

    if (isNaN(scheduledAt.getTime()) || scheduledAt < new Date()) {
      return NextResponse.json({ error: 'Cannot book an appointment for a past date or time.' }, { status: 400 });
    }

    // 3. Slot Collision Guard (Prevent two patients from double-booking the exact same slot)
    const slotOccupied = await db.appointment.findFirst({
      where: {
        consultantId: Number(consultantId),
        scheduledAt,
        status: { in: ['PENDING', 'CONFIRMED'] },
      }
    });

    if (slotOccupied) {
      return NextResponse.json(
        { error: 'This time slot has already been booked by another patient. Please select a different time slot.' },
        { status: 400 }
      );
    }

    const appointment = await db.appointment.create({
      data: {
        consultantId: Number(consultantId),
        userId: Number((session.user as any).id),
        scheduledAt,
        type,
        concern,
        fee: resolvedFee,
        patientName,
        patientAge: patientAge ? Number(patientAge) : null,
        patientGender,
        patientPhone,
        patientRelation,
        chronicDiseases,
        allergies,
      }
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
