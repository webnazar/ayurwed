import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(_req: Request, props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const product = await db.product.findUnique({
    where: { slug, isActive: true },
    include: {
      manufacturer: true,
      shopReviews: {
        include: { user: { select: { name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Related products (same category)
  const related = await db.product.findMany({
    where: { isActive: true, category: product.category, id: { not: product.id } },
    take: 4,
    include: { manufacturer: { select: { id: true, companyName: true } } },
  });

  return NextResponse.json({
    ...product,
    mrp: Number(product.mrp),
    sellingPrice: Number(product.sellingPrice),
    images: (() => { try { return JSON.parse(product.images || '[]'); } catch { return []; } })(),
    manufacturer: product.manufacturer ? {
      ...product.manufacturer,
      certifications: (() => { try { return JSON.parse(product.manufacturer!.certifications || '[]'); } catch { return []; } })(),
    } : null,
    related: related.map((r) => ({
      ...r,
      mrp: Number(r.mrp),
      sellingPrice: Number(r.sellingPrice),
      images: (() => { try { return JSON.parse(r.images || '[]'); } catch { return []; } })(),
    })),
  });
}
