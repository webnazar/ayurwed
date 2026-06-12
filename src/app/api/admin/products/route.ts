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

// GET — list all products with relations
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const status = searchParams.get('status') || '';

    const where: any = {};
    if (search) where.name = { contains: search };
    if (categoryId) where.categoryId = Number(categoryId);
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;
    if (status === 'featured') where.isFeatured = true;

    const products = await db.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { id: true, name: true } },
        manufacturer: { select: { id: true, companyName: true } },
        indications: { select: { id: true, name: true } },
        _count: { select: { reviews: true, enquiries: true } },
      },
    });

    return NextResponse.json(products);
  } catch (err: any) {
    console.error('[ADMIN_PRODUCTS_GET_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST — create product
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, description, ingredients, benefits, usage, mrp, images, categoryId, manufacturerId, isActive, isFeatured, isSponsored, isShopProduct, indicationIds } = body;

    if (!name || !description || !categoryId || !manufacturerId) {
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
    }

    let baseSlug = slugify(name);
    let slug = baseSlug;
    let suffix = 1;
    while (await db.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const product = await db.product.create({
      data: {
        name,
        slug,
        description,
        ingredients: ingredients || [],
        benefits: benefits || [],
        usage: usage || '',
        mrp: mrp ? Number(mrp) : null,
        images: images || [],
        categoryId: Number(categoryId),
        manufacturerId: Number(manufacturerId),
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
        isSponsored: isSponsored ?? false,
        isShopProduct: isShopProduct ?? false,
        indications: indicationIds && indicationIds.length > 0
          ? { connect: indicationIds.map((id: number) => ({ id })) }
          : undefined,
      },
      include: {
        category: { select: { id: true, name: true } },
        manufacturer: { select: { id: true, companyName: true } },
        indications: { select: { id: true, name: true } },
        _count: { select: { reviews: true, enquiries: true } },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (err: any) {
    console.error('[ADMIN_PRODUCTS_POST_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH — update product
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, productId, name, description, ingredients, benefits, usage, mrp, images, categoryId, manufacturerId, isActive, isFeatured, isSponsored, isShopProduct, indicationIds } = body;

    const targetId = id || productId;
    if (!targetId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = slugify(name);
    }
    if (description !== undefined) updateData.description = description;
    if (ingredients !== undefined) updateData.ingredients = ingredients;
    if (benefits !== undefined) updateData.benefits = benefits;
    if (usage !== undefined) updateData.usage = usage;
    if (mrp !== undefined) updateData.mrp = mrp ? Number(mrp) : null;
    if (images !== undefined) updateData.images = images;
    if (categoryId !== undefined) updateData.categoryId = Number(categoryId);
    if (manufacturerId !== undefined) updateData.manufacturerId = Number(manufacturerId);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (isSponsored !== undefined) updateData.isSponsored = isSponsored;
    if (isShopProduct !== undefined) updateData.isShopProduct = isShopProduct;
    if (indicationIds !== undefined) {
      updateData.indications = { set: indicationIds.map((id: number) => ({ id })) };
    }

    const updatedProduct = await db.product.update({
      where: { id: Number(targetId) },
      data: updateData,
      include: {
        category: { select: { id: true, name: true } },
        manufacturer: { select: { id: true, companyName: true } },
        indications: { select: { id: true, name: true } },
        _count: { select: { reviews: true, enquiries: true } },
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (err: any) {
    console.error('[ADMIN_PRODUCTS_PATCH_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE — delete product
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await db.product.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[ADMIN_PRODUCTS_DELETE_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
