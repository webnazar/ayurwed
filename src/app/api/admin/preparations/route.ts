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

// GET — list all preparations with relations
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (search) where.name = { contains: search };
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (status === 'featured') where.isFeatured = true;

    const preparations = await db.preparation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        indications: { select: { id: true, name: true } },
        _count: { select: { reviews: true, enquiries: true } },
      },
    });

    return NextResponse.json(preparations);
  } catch (err: any) {
    console.error('[ADMIN_EXTRACTS_GET_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST — create preparation
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
          const { name, type, mrp, volume, volumeUnit, weight, weightUnit, count, countUnit, description, usage, ingredients, benefits } = item;
          if (!name) throw new Error("Name is required");
          


          const existing = await db.preparation.findFirst({ where: { name } });
          
          const parseList = (str: any) => {
            if (!str) return [];
            if (Array.isArray(str)) return str;
            return String(str).split(',').map(s => s.trim()).filter(Boolean);
          };

          const dataToUpdateOrCreate = {
            description: description || 'Imported product',
            usage: usage || '',
            type: type || 'READY_PRODUCT',
            mrp: mrp ? Number(mrp) : null,
            volume: volume ? Number(volume) : null,
            volumeUnit: volumeUnit || null,
            weight: weight ? Number(weight) : null,
            weightUnit: weightUnit || null,
            count: count ? Number(count) : null,
            countUnit: countUnit || null,
            ingredients: JSON.stringify(parseList(ingredients)),
            benefits: JSON.stringify(parseList(benefits)),
            images: JSON.stringify([])
          };

          if (existing) {
            await db.preparation.update({
              where: { id: existing.id },
              data: dataToUpdateOrCreate
            });
          } else {
            let baseSlug = slugify(name);
            let slug = baseSlug;
            let suffix = 1;
            while (await db.preparation.findUnique({ where: { slug } })) {
              slug = `${baseSlug}-${suffix++}`;
            }
            await db.preparation.create({
              data: {
                name,
                slug,
                ...dataToUpdateOrCreate
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

    const { name, type, volume, volumeUnit, weight, weightUnit, count, countUnit, description, ingredients, benefits, usage, mrp, images, isActive, isFeatured, isSponsored, indicationIds } = body;

    if (!name || !description) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    let baseSlug = slugify(name);
    let slug = baseSlug;
    let suffix = 1;
    while (await db.preparation.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const preparation = await db.preparation.create({
      data: {
        name,
        slug,
        description,
        ingredients: JSON.stringify(ingredients || []),
        benefits: JSON.stringify(benefits || []),
        usage: usage || '',
        type: type || 'LIQUID_EXTRACT',
        volume: volume ? Number(volume) : null,
        volumeUnit: volumeUnit || null,
        weight: weight ? Number(weight) : null,
        weightUnit: weightUnit || null,
        count: count ? Number(count) : null,
        countUnit: countUnit || null,
        mrp: mrp ? Number(mrp) : null,
        images: JSON.stringify(images || []),
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        isSponsored: isSponsored ?? false,
        indications: indicationIds && indicationIds.length > 0
          ? { connect: indicationIds.map((id: number) => ({ id })) }
          : undefined,
      },
      include: {
        indications: { select: { id: true, name: true } },
        _count: { select: { reviews: true, enquiries: true } },
      },
    });

    return NextResponse.json(preparation, { status: 201 });
  } catch (err: any) {
    console.error('[ADMIN_EXTRACTS_POST_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH — update preparation
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, extractId, name, type, volume, volumeUnit, weight, weightUnit, count, countUnit, description, ingredients, benefits, usage, mrp, images, isActive, isFeatured, isSponsored, indicationIds } = body;

    const targetId = id || extractId;
    if (!targetId) {
      return NextResponse.json({ error: 'Preparation ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (description !== undefined) updateData.description = description;
    if (ingredients !== undefined) updateData.ingredients = JSON.stringify(ingredients);
    if (benefits !== undefined) updateData.benefits = JSON.stringify(benefits);
    if (usage !== undefined) updateData.usage = usage;
    if (type !== undefined) updateData.type = type;
    if (volume !== undefined) updateData.volume = volume ? Number(volume) : null;
    if (volumeUnit !== undefined) updateData.volumeUnit = volumeUnit || null;
    if (weight !== undefined) updateData.weight = weight ? Number(weight) : null;
    if (weightUnit !== undefined) updateData.weightUnit = weightUnit || null;
    if (count !== undefined) updateData.count = count ? Number(count) : null;
    if (countUnit !== undefined) updateData.countUnit = countUnit || null;
    if (mrp !== undefined) updateData.mrp = mrp ? Number(mrp) : null;
    if (images !== undefined) updateData.images = JSON.stringify(images);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isSponsored !== undefined) updateData.isSponsored = isSponsored;
    if (indicationIds !== undefined) {
      updateData.indications = { set: indicationIds.map((id: number) => ({ id })) };
    }

    const updatedExtract = await db.preparation.update({
      where: { id: Number(targetId) },
      data: updateData,
      include: {
        indications: { select: { id: true, name: true } },
        _count: { select: { reviews: true, enquiries: true } },
      },
    });

    return NextResponse.json(updatedExtract);
  } catch (err: any) {
    console.error('[ADMIN_EXTRACTS_PATCH_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE — delete preparation
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Preparation ID is required' }, { status: 400 });
    }

    await db.preparation.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[ADMIN_EXTRACTS_DELETE_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
