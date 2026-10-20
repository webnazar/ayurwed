import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'CONSULTANT' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let consultantId: number | null = null;
    if (session.user.role === 'CONSULTANT') {
      const consultant = await db.consultantProfile.findUnique({
        where: { userId: Number(session.user.id) }
      });
      consultantId = consultant?.id || null;
    }

    const customMedicines = await db.customMedicine.findMany({
      where: {
        OR: [
          ...(consultantId ? [{ consultantId }] : []),
          { consultantId: null }
        ],
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, customMedicines });
  } catch (error) {
    console.error('Failed to fetch custom medicines:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'CONSULTANT' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, type, dosage, instructions, composition, manufacturer, price } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Medicine name is required' }, { status: 400 });
    }

    let consultantId: number | null = null;
    if (session.user.role === 'CONSULTANT') {
      const consultant = await db.consultantProfile.findUnique({
        where: { userId: Number(session.user.id) }
      });
      consultantId = consultant?.id || null;
    }

    const customMedicine = await db.customMedicine.create({
      data: {
        name: name.trim(),
        type: type || 'CUSTOM',
        dosage: dosage || null,
        instructions: instructions || null,
        composition: composition || null,
        manufacturer: manufacturer || 'External / Own Clinic',
        price: price ? parseFloat(price) : null,
        consultantId,
        isActive: true
      }
    });

    return NextResponse.json({ success: true, customMedicine });
  } catch (error) {
    console.error('Failed to create custom medicine:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'CONSULTANT' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Medicine ID is required' }, { status: 400 });
    }

    let consultantId: number | null = null;
    if (session.user.role === 'CONSULTANT') {
      const consultant = await db.consultantProfile.findUnique({
        where: { userId: Number(session.user.id) }
      });
      consultantId = consultant?.id || null;
    }

    // Soft delete custom medicine if owned by consultant or admin
    await db.customMedicine.updateMany({
      where: {
        id: Number(id),
        ...(session.user.role === 'CONSULTANT' ? { consultantId } : {})
      },
      data: { isActive: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete custom medicine:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

