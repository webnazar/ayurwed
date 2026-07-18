import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      manufacturer: { select: { id: true, companyName: true, logo: true } },
      _count: { select: { shopOrderItems: true, shopReviews: true } },
    },
  });
  return NextResponse.json(
    products.map((p) => ({
      ...p,
      mrp: Number(p.mrp),
      sellingPrice: Number(p.sellingPrice),
      images: (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })(),
    }))
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const body = await req.json();
  const { name, description, shortDesc, category, manufacturerId, sku, mrp, sellingPrice, stock, unit, images, tags, isActive, isFeatured } = body;

  if (!name?.trim()) return NextResponse.json({ error: 'Product name required' }, { status: 400 });
  if (!mrp || !sellingPrice) return NextResponse.json({ error: 'MRP and Selling Price required' }, { status: 400 });

  let slug = slugify(name);
  const existing = await db.product.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const product = await db.product.create({
    data: {
      name: name.trim(),
      slug,
      description: description || '',
      shortDesc: shortDesc || null,
      category: category || null,
      manufacturerId: manufacturerId ? parseInt(manufacturerId) : null,
      sku: sku?.trim() || null,
      mrp: parseFloat(mrp),
      sellingPrice: parseFloat(sellingPrice),
      stock: parseInt(stock) || 0,
      unit: unit || null,
      images: JSON.stringify(images || []),
      tags: tags || null,
      isActive: isActive !== false,
      isFeatured: !!isFeatured,
    },
    include: { manufacturer: { select: { id: true, companyName: true, logo: true } } },
  });

  return NextResponse.json({
    ...product,
    mrp: Number(product.mrp),
    sellingPrice: Number(product.sellingPrice),
    images: (() => { try { return JSON.parse(product.images || '[]'); } catch { return []; } })(),
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const body = await req.json();
  const { id, name, description, shortDesc, category, manufacturerId, sku, mrp, sellingPrice, stock, unit, images, tags, isActive, isFeatured } = body;
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const product = await db.product.update({
    where: { id },
    data: {
      name: name?.trim(),
      description,
      shortDesc: shortDesc || null,
      category: category || null,
      manufacturerId: manufacturerId ? parseInt(manufacturerId) : null,
      sku: sku?.trim() || null,
      mrp: mrp ? parseFloat(mrp) : undefined,
      sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined,
      stock: stock !== undefined ? parseInt(stock) : undefined,
      unit: unit || null,
      images: images ? JSON.stringify(images) : undefined,
      tags: tags || null,
      isActive: isActive !== undefined ? !!isActive : undefined,
      isFeatured: isFeatured !== undefined ? !!isFeatured : undefined,
    },
    include: { manufacturer: { select: { id: true, companyName: true, logo: true } } },
  });

  return NextResponse.json({
    ...product,
    mrp: Number(product.mrp),
    sellingPrice: Number(product.sellingPrice),
    images: (() => { try { return JSON.parse(product.images || '[]'); } catch { return []; } })(),
  });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get('id') || '');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });
  await db.product.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
