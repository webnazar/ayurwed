import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, id, flag, value } = await req.json();

  try {
    if (type === 'manufacturer') {
      await db.manufacturerProfile.update({
        where: { id: Number(id) },
        data: {
          [flag]: value,
          ...(flag === 'isFeatured' && value ? { listingTier: 'featured' } : {}),
          ...(flag === 'isPremium' && value && !flag.includes('featured') ? { listingTier: 'premium' } : {}),
        },
      });
    } else if (type === 'product') {
      await db.product.update({ where: { id: Number(id) }, data: { [flag]: value } });
    } else if (type === 'consultant') {
      await db.consultantProfile.update({ where: { id: Number(id) }, data: { [flag]: value } });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
