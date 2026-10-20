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

    if (Array.isArray(body)) {
      const results = { successful: 0, failed: 0, errors: [] as string[] };
      for (const item of body) {
        try {
          const { name, description, symptomsKeywords, isActive } = item;
          if (!name) throw new Error("Name is required");
          
          const existing = await db.indication.findUnique({ where: { name } });
          if (existing) {
            await db.indication.update({
              where: { id: existing.id },
              data: {
                description: description !== undefined ? description : existing.description,
                symptomsKeywords: symptomsKeywords !== undefined ? symptomsKeywords : existing.symptomsKeywords,
                isActive: isActive !== undefined ? (String(isActive).toLowerCase() === 'true' || isActive === true) : existing.isActive,
              }
            });
          } else {
            let baseSlug = slugify(name);
            let slug = baseSlug;
            let suffix = 1;
            while (await db.indication.findUnique({ where: { slug } })) {
              slug = `${baseSlug}-${suffix++}`;
            }
            await db.indication.create({
              data: {
                name,
                slug,
                description: description || null,
                symptomsKeywords: symptomsKeywords || null,
                isActive: isActive !== undefined ? (String(isActive).toLowerCase() === 'true' || isActive === true) : true,
              }
            });
          }
          results.successful++;
        } catch (e: any) {
          results.failed++;
          results.errors.push(`Row error (${item.name || 'Unknown'}): ${e.message}`);
        }
      }
      return NextResponse.json({ success: true, ...results }, { status: 201 });
    }

    const { name, description, symptomsKeywords, isActive } = body;

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
        symptomsKeywords: symptomsKeywords || null,
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
    const { id, name, description, symptomsKeywords, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (description !== undefined) updateData.description = description;
    if (symptomsKeywords !== undefined) updateData.symptomsKeywords = symptomsKeywords;
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
