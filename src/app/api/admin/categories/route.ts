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

    const categories = await db.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        _count: { select: { products: true } }
      }
    });

    return NextResponse.json(categories);
  } catch (err: any) {
    console.error('[ADMIN_CATEGORIES_GET_ERROR]', err);
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

    // Batch array handling
    if (Array.isArray(body)) {
      const results = { successful: 0, failed: 0, errors: [] as string[] };
      for (const item of body) {
        try {
          const { name, slug: customSlug, description, icon, image, sortOrder, isActive } = item;
          if (!name) throw new Error('Name is required');

          const existing = await db.category.findFirst({
            where: { OR: [{ name }, { slug: customSlug || slugify(name) }] }
          });

          if (existing) {
            await db.category.update({
              where: { id: existing.id },
              data: {
                description: description !== undefined ? description : existing.description,
                icon: icon !== undefined ? icon : existing.icon,
                image: image !== undefined ? image : existing.image,
                sortOrder: sortOrder !== undefined ? Number(sortOrder) : existing.sortOrder,
                isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
              }
            });
          } else {
            let baseSlug = customSlug ? slugify(customSlug) : slugify(name);
            let finalSlug = baseSlug;
            let suffix = 1;
            while (await db.category.findUnique({ where: { slug: finalSlug } })) {
              finalSlug = `${baseSlug}-${suffix++}`;
            }

            await db.category.create({
              data: {
                name,
                slug: finalSlug,
                description: description || null,
                icon: icon || null,
                image: image || null,
                sortOrder: sortOrder ? Number(sortOrder) : 0,
                isActive: isActive !== undefined ? Boolean(isActive) : true,
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

    // Single item handling
    const { name, slug: customSlug, description, icon, image, sortOrder, isActive } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const existingName = await db.category.findUnique({ where: { name } });
    if (existingName) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
    }

    let baseSlug = customSlug ? slugify(customSlug) : slugify(name);
    let finalSlug = baseSlug;
    let suffix = 1;
    while (await db.category.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${suffix++}`;
    }

    const newCategory = await db.category.create({
      data: {
        name: name.trim(),
        slug: finalSlug,
        description: description ? description.trim() : null,
        icon: icon ? icon.trim() : null,
        image: image ? image.trim() : null,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
      include: {
        _count: { select: { products: true } }
      }
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (err: any) {
    console.error('[ADMIN_CATEGORIES_POST_ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, name, slug: customSlug, description, icon, image, sortOrder, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const existing = await db.category.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (name && name !== existing.name) {
      const duplicateName = await db.category.findUnique({ where: { name } });
      if (duplicateName && duplicateName.id !== existing.id) {
        return NextResponse.json({ error: 'A category with this name already exists' }, { status: 400 });
      }
    }

    let finalSlug = existing.slug;
    if (customSlug && customSlug !== existing.slug) {
      let baseSlug = slugify(customSlug);
      finalSlug = baseSlug;
      let suffix = 1;
      while (true) {
        const dup = await db.category.findUnique({ where: { slug: finalSlug } });
        if (!dup || dup.id === existing.id) break;
        finalSlug = `${baseSlug}-${suffix++}`;
      }
    } else if (name && !customSlug && name !== existing.name) {
      let baseSlug = slugify(name);
      finalSlug = baseSlug;
      let suffix = 1;
      while (true) {
        const dup = await db.category.findUnique({ where: { slug: finalSlug } });
        if (!dup || dup.id === existing.id) break;
        finalSlug = `${baseSlug}-${suffix++}`;
      }
    }

    const updated = await db.category.update({
      where: { id: existing.id },
      data: {
        name: name ? name.trim() : existing.name,
        slug: finalSlug,
        description: description !== undefined ? (description ? description.trim() : null) : existing.description,
        icon: icon !== undefined ? (icon ? icon.trim() : null) : existing.icon,
        image: image !== undefined ? (image ? image.trim() : null) : existing.image,
        sortOrder: sortOrder !== undefined ? Number(sortOrder) : existing.sortOrder,
        isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
      },
      include: {
        _count: { select: { products: true } }
      }
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[ADMIN_CATEGORIES_PUT_ERROR]', err);
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
    const { id, isActive, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const updated = await db.category.update({
      where: { id: Number(id) },
      data: {
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
        ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) } : {}),
      },
      include: {
        _count: { select: { products: true } }
      }
    });

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[ADMIN_CATEGORIES_PATCH_ERROR]', err);
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
    const force = searchParams.get('force') === 'true';

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const categoryId = Number(id);
    const category = await db.category.findUnique({
      where: { id: categoryId },
      include: { _count: { select: { products: true } } }
    });

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    if (category._count.products > 0 && !force) {
      return NextResponse.json({
        error: `Cannot delete: ${category._count.products} products are linked to this category. Unlink them first or use force delete.`,
        productsCount: category._count.products
      }, { status: 409 });
    }

    // If force delete, unlink products
    if (category._count.products > 0 && force) {
      await db.product.updateMany({
        where: { categoryId },
        data: { categoryId: null }
      });
    }

    await db.category.delete({
      where: { id: categoryId }
    });

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (err: any) {
    console.error('[ADMIN_CATEGORIES_DELETE_ERROR]', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
