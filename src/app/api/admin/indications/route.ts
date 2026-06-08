import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const indications = await db.indication.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } }
      }
    });

    return NextResponse.json(indications);
  } catch (err: any) {
    console.error('[ADMIN_INDICATIONS_GET_ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, isActive } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    let baseSlug = slugify(name);
    let slug = baseSlug;
    let suffix = 1;
    while (await db.indication.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const indication = await db.indication.create({
      data: {
        name,
        slug,
        description: description || null,
        isActive: isActive ?? true,
      },
      include: {
        _count: { select: { products: true } }
      }
    });

    return NextResponse.json(indication, { status: 201 });
  } catch (err: any) {
    console.error('[ADMIN_INDICATIONS_POST_ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, description, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await db.indication.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        _count: { select: { products: true } }
      }
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[ADMIN_INDICATIONS_PATCH_ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await db.indication.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[ADMIN_INDICATIONS_DELETE_ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
