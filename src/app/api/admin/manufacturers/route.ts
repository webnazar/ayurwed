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
  const manufacturers = await db.manufacturer.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { products: true } } },
  });
  const result = manufacturers.map((m) => ({
    ...m,
    certifications: (() => { try { return JSON.parse(m.certifications || '[]'); } catch { return []; } })(),
  }));
  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const body = await req.json();
  const { companyName, description, logo, manufacturingLicense, certifications, gstNumber, website, contactEmail, contactPhone, isVerified, isFeatured } = body;
  if (!companyName?.trim()) return NextResponse.json({ error: 'Company name required' }, { status: 400 });

  let slug = slugify(companyName);
  const existing = await db.manufacturer.findUnique({ where: { slug } });
  if (existing) slug = `${slug}-${Date.now()}`;

  const manufacturer = await db.manufacturer.create({
    data: {
      companyName: companyName.trim(),
      slug,
      description: description || '',
      logo: logo || null,
      manufacturingLicense: manufacturingLicense || null,
      certifications: JSON.stringify(certifications || []),
      gstNumber: gstNumber || null,
      website: website || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      isVerified: !!isVerified,
      isFeatured: !!isFeatured,
    },
  });
  return NextResponse.json({
    ...manufacturer,
    certifications: (() => { try { return JSON.parse(manufacturer.certifications || '[]'); } catch { return []; } })(),
  });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const body = await req.json();
  const { id, companyName, description, logo, manufacturingLicense, certifications, gstNumber, website, contactEmail, contactPhone, isVerified, isFeatured } = body;
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const manufacturer = await db.manufacturer.update({
    where: { id },
    data: {
      companyName: companyName?.trim(),
      description,
      logo: logo || null,
      manufacturingLicense: manufacturingLicense || null,
      certifications: JSON.stringify(certifications || []),
      gstNumber: gstNumber || null,
      website: website || null,
      contactEmail: contactEmail || null,
      contactPhone: contactPhone || null,
      isVerified: !!isVerified,
      isFeatured: !!isFeatured,
    },
  });
  return NextResponse.json({
    ...manufacturer,
    certifications: (() => { try { return JSON.parse(manufacturer.certifications || '[]'); } catch { return []; } })(),
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
  await db.manufacturer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
