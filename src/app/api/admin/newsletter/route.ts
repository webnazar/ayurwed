import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, isActive } = await req.json();
    if (!id) return NextResponse.json({ error: 'Subscriber ID required' }, { status: 400 });

    const activeState = Boolean(isActive);

    try {
      const updated = await db.newsletterSubscriber.update({
        where: { id: String(id) },
        data: { isActive: activeState },
      });
      return NextResponse.json({ success: true, subscriber: updated });
    } catch (e) {
      await db.$executeRawUnsafe(`
        UPDATE newsletter_subscribers SET isActive = ${activeState ? 'true' : 'false'} WHERE id = '${String(id)}'
      `);
      return NextResponse.json({ success: true, id, isActive: activeState });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error updating subscriber' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Subscriber ID required' }, { status: 400 });

    try {
      await db.newsletterSubscriber.delete({
        where: { id: String(id) },
      });
    } catch (e) {
      await db.$executeRawUnsafe(`DELETE FROM newsletter_subscribers WHERE id = '${String(id)}'`);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error deleting subscriber' }, { status: 500 });
  }
}
