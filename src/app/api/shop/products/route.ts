import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const manufacturerId = searchParams.get('manufacturer') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '24');
  const skip = (page - 1) * limit;

  const where: any = { isActive: true };
  if (search) where.OR = [
    { name: { contains: search } },
    { description: { contains: search } },
    { tags: { contains: search } },
  ];
  if (category) where.category = category;
  if (manufacturerId) where.manufacturerId = parseInt(manufacturerId);

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      include: { manufacturer: { select: { id: true, companyName: true, logo: true } } },
    }),
    db.product.count({ where }),
  ]);

  const categories = await db.product.findMany({
    where: { isActive: true },
    select: { category: true },
    distinct: ['category'],
  });

  return NextResponse.json({
    products: products.map((p) => ({
      ...p,
      mrp: Number(p.mrp),
      sellingPrice: Number(p.sellingPrice),
      images: (() => { try { return JSON.parse(p.images || '[]'); } catch { return []; } })(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    categories: categories.map((c) => c.category).filter(Boolean),
  });
}
