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
      indications: { select: { id: true, name: true } },
      symptoms: { select: { id: true, name: true } },
      _count: { select: { shopOrderItems: true, shopReviews: true, prescriptionItems: true } },
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

  // Batch array handling for CSV import
  if (Array.isArray(body)) {
    const results = { successful: 0, failed: 0, errors: [] as string[] };
    for (const item of body) {
      try {
        const {
          name, description, shortDesc, botanicalName, type,
          volume, volumeUnit, weight, weightUnit, count, countUnit,
          ingredients, benefits, usage, category, manufacturerId, brand, brandName, sku, barcode,
          mrp, sellingPrice, stock, unit, images, tags, targetAudience, isActive, isFeatured
        } = item;

        if (!name?.trim()) throw new Error('Product name required');
        const mrpNum = parseFloat(mrp) || parseFloat(sellingPrice) || 0;
        const sellingPriceNum = parseFloat(sellingPrice) || mrpNum;

        let mId: number | null = manufacturerId ? parseInt(manufacturerId) : null;
        if (!mId && (brand || brandName)) {
          const bName = String(brand || brandName).trim();
          const foundM = await db.manufacturer.findFirst({
            where: { companyName: { equals: bName } }
          });
          if (foundM) mId = foundM.id;
        }

        let existing = null;
        if (sku && String(sku).trim()) {
          existing = await db.product.findFirst({
            where: { sku: String(sku).trim() }
          });
        }
        if (!existing) {
          existing = await db.product.findFirst({
            where: { name: name.trim() }
          });
        }

        if (existing) {
          await db.product.update({
            where: { id: existing.id },
            data: {
              description: description !== undefined ? String(description) : existing.description,
              shortDesc: shortDesc !== undefined ? (shortDesc || null) : existing.shortDesc,
              category: category !== undefined ? (category || null) : existing.category,
              manufacturerId: mId !== null ? mId : existing.manufacturerId,
              sku: sku !== undefined ? (String(sku).trim() || null) : existing.sku,
              barcode: barcode !== undefined ? (String(barcode).trim() || null) : existing.barcode,
              mrp: mrpNum > 0 ? mrpNum : existing.mrp,
              sellingPrice: sellingPriceNum > 0 ? sellingPriceNum : existing.sellingPrice,
              stock: stock !== undefined ? (parseInt(stock) || 0) : existing.stock,
              unit: unit !== undefined ? (unit || null) : existing.unit,
              isActive: isActive !== undefined ? Boolean(isActive) : existing.isActive,
              isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
            }
          });
        } else {
          let slug = slugify(name);
          let finalSlug = slug;
          let suffix = 1;
          while (await db.product.findUnique({ where: { slug: finalSlug } })) {
            finalSlug = `${slug}-${suffix++}`;
          }

          await db.product.create({
            data: {
              name: name.trim(),
              slug: finalSlug,
              description: description ? String(description) : '',
              shortDesc: shortDesc || null,
              botanicalName: botanicalName || null,
              type: type || 'READY_PRODUCT',
              volume: volume ? parseInt(volume) : null,
              volumeUnit: volumeUnit || null,
              weight: weight ? parseInt(weight) : null,
              weightUnit: weightUnit || null,
              count: count ? parseInt(count) : null,
              countUnit: countUnit || null,
              ingredients: ingredients || null,
              benefits: benefits || null,
              usage: usage || null,
              category: category || null,
              manufacturerId: mId,
              sku: sku?.trim() || null,
              barcode: (barcode || item.eanBarcode || item.ean)?.trim() || null,
              mrp: mrpNum,
              sellingPrice: sellingPriceNum,
              stock: parseInt(stock) || 0,
              unit: unit || null,
              images: JSON.stringify(images || []),
              tags: tags || null,
              targetAudience: targetAudience || 'BOTH',
              isActive: isActive !== false,
              isFeatured: !!isFeatured,
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

  const {
    name, description, shortDesc, botanicalName, type,
    volume, volumeUnit, weight, weightUnit, count, countUnit,
    ingredients, benefits, usage, category, manufacturerId, sku, barcode,
    mrp, sellingPrice, stock, unit, images, tags, targetAudience, isActive, isFeatured, indicationIds, symptomIds
  } = body;

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
      botanicalName: botanicalName || null,
      type: type || 'READY_PRODUCT',
      volume: volume ? parseInt(volume) : null,
      volumeUnit: volumeUnit || null,
      weight: weight ? parseInt(weight) : null,
      weightUnit: weightUnit || null,
      count: count ? parseInt(count) : null,
      countUnit: countUnit || null,
      ingredients: ingredients || null,
      benefits: benefits || null,
      usage: usage || null,
      category: category || null,
      manufacturerId: manufacturerId ? parseInt(manufacturerId) : null,
      sku: sku?.trim() || null,
      barcode: (barcode || body.eanBarcode || body.ean)?.trim() || null,
      mrp: parseFloat(mrp),
      sellingPrice: parseFloat(sellingPrice),
      stock: parseInt(stock) || 0,
      unit: unit || null,
      images: JSON.stringify(images || []),
      tags: tags || null,
      targetAudience: targetAudience || 'BOTH',
      isActive: isActive !== false,
      isFeatured: !!isFeatured,
      indications: Array.isArray(indicationIds) && indicationIds.length > 0 ? {
        connect: indicationIds.map((id: number) => ({ id }))
      } : undefined,
      symptoms: Array.isArray(symptomIds) && symptomIds.length > 0 ? {
        connect: symptomIds.map((id: number) => ({ id }))
      } : undefined,
    },
    include: {
      manufacturer: { select: { id: true, companyName: true, logo: true } },
      indications: { select: { id: true, name: true } },
      symptoms: { select: { id: true, name: true } },
    },
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
  const {
    id, name, description, shortDesc, botanicalName, type,
    volume, volumeUnit, weight, weightUnit, count, countUnit,
    ingredients, benefits, usage, category, manufacturerId, sku, barcode,
    mrp, sellingPrice, stock, unit, images, tags, targetAudience, isActive, isFeatured, indicationIds, symptomIds
  } = body;
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const product = await db.product.update({
    where: { id },
    data: {
      name: name?.trim(),
      description,
      shortDesc: shortDesc || null,
      botanicalName: botanicalName || null,
      type: type || undefined,
      volume: volume !== undefined ? (volume ? parseInt(volume) : null) : undefined,
      volumeUnit: volumeUnit || null,
      weight: weight !== undefined ? (weight ? parseInt(weight) : null) : undefined,
      weightUnit: weightUnit || null,
      count: count !== undefined ? (count ? parseInt(count) : null) : undefined,
      countUnit: countUnit || null,
      ingredients: ingredients || null,
      benefits: benefits || null,
      usage: usage || null,
      category: category || null,
      manufacturerId: manufacturerId ? parseInt(manufacturerId) : null,
      sku: sku?.trim() || null,
      barcode: barcode !== undefined ? (barcode?.trim() || null) : (body.eanBarcode !== undefined ? (body.eanBarcode?.trim() || null) : undefined),
      mrp: mrp ? parseFloat(mrp) : undefined,
      sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined,
      stock: stock !== undefined ? parseInt(stock) : undefined,
      unit: unit || null,
      images: images ? JSON.stringify(images) : undefined,
      tags: tags || null,
      targetAudience: targetAudience || undefined,
      isActive: isActive !== undefined ? !!isActive : undefined,
      isFeatured: isFeatured !== undefined ? !!isFeatured : undefined,
      indications: Array.isArray(indicationIds) ? {
        set: indicationIds.map((indId: number) => ({ id: indId }))
      } : undefined,
      symptoms: Array.isArray(symptomIds) ? {
        set: symptomIds.map((symId: number) => ({ id: symId }))
      } : undefined,
    },
    include: {
      manufacturer: { select: { id: true, companyName: true, logo: true } },
      indications: { select: { id: true, name: true } },
      symptoms: { select: { id: true, name: true } },
    },
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
