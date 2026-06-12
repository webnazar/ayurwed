import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

function slugify(text: string) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
}

// GET — manufacturer's own products
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'MANUFACTURER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const profile = await db.manufacturerProfile.findUnique({ where: { userId: (session.user as any).id } });
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const products = await db.product.findMany({
      where: { manufacturerId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
        indications: { select: { id: true, name: true } },
        _count: { select: { reviews: true, enquiries: true } },
      },
    });
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — create preparation (inactive by default, pending admin approval)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'MANUFACTURER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const profile = await db.manufacturerProfile.findUnique({ where: { userId: (session.user as any).id } });
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const body = await req.json();
    const { name, description, ingredients, benefits, usage, mrp, categoryId, images, indicationIds, isShopProduct } = body;
    if (!name || !mrp || !categoryId) return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });

    let slug = slugify(name);
    let suffix = 1;
    while (await db.product.findUnique({ where: { slug } })) slug = `${slugify(name)}-${suffix++}`;

    const product = await db.product.create({
      data: {
        name, slug, description, usage: usage || '',
        ingredients: ingredients || [], benefits: benefits || [],
        mrp: Number(mrp), images: images || [],
        categoryId: Number(categoryId), manufacturerId: profile.id,
        isActive: false, isFeatured: false, isSponsored: false, isShopProduct: isShopProduct || false,
        indications: indicationIds?.length > 0 ? {
          connect: indicationIds.map((id: string) => ({ id: Number(id) }))
        } : undefined,
      },
      include: { category: { select: { id: true, name: true } }, indications: { select: { id: true, name: true } }, _count: { select: { reviews: true, enquiries: true } } },
    });
    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH — update own product
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'MANUFACTURER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const profile = await db.manufacturerProfile.findUnique({ where: { userId: (session.user as any).id } });
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const body = await req.json();
    const { id, ...rest } = body;
    const product = await db.product.findFirst({ where: { id: Number(id), manufacturerId: profile.id } });
    if (!product) return NextResponse.json({ error: 'Not found or not yours' }, { status: 404 });

    const updateData: any = {};
    if (rest.name) { updateData.name = rest.name; updateData.slug = slugify(rest.name); }
    if (rest.description !== undefined) updateData.description = rest.description;
    if (rest.usage !== undefined) updateData.usage = rest.usage;
    if (rest.mrp !== undefined) updateData.mrp = Number(rest.mrp);
    if (rest.images !== undefined) updateData.images = rest.images;
    if (rest.categoryId !== undefined) updateData.categoryId = Number(rest.categoryId);
    if (rest.ingredients !== undefined) updateData.ingredients = rest.ingredients;
    if (rest.benefits !== undefined) updateData.benefits = rest.benefits;
    if (rest.isShopProduct !== undefined) updateData.isShopProduct = rest.isShopProduct;
    
    if (rest.indicationIds !== undefined) {
      updateData.indications = {
        set: rest.indicationIds.map((id: string) => ({ id: Number(id) }))
      };
    }

    const updated = await db.product.update({
      where: { id: Number(id) }, data: updateData,
      include: { category: { select: { id: true, name: true } }, indications: { select: { id: true, name: true } }, _count: { select: { reviews: true, enquiries: true } } },
    });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE — delete own product
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'MANUFACTURER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const profile = await db.manufacturerProfile.findUnique({ where: { userId: (session.user as any).id } });
    if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const product = await db.product.findFirst({ where: { id: Number(id), manufacturerId: profile.id } });
    if (!product) return NextResponse.json({ error: 'Not found or not yours' }, { status: 404 });

    await db.product.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
