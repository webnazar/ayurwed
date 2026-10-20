import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    const brands = await db.manufacturer.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { products: true } } },
    });
    const result = brands.map((b) => ({
      ...b,
      certifications: (() => { try { return JSON.parse(b.certifications || '[]'); } catch { return []; } })(),
    }));
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[ADMIN_BRANDS_GET_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Failed to fetch brands' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    const body = await req.json();

    // Batch array handling for CSV import
    if (Array.isArray(body)) {
      const results = { successful: 0, failed: 0, errors: [] as string[] };
      for (const item of body) {
        try {
          const name = item.companyName || item.name;
          if (!name?.trim()) throw new Error('Brand name is required');
          const { slogan, description, logo, manufacturingLicense, certifications, gstNumber, website, contactEmail, contactPhone, isVerified, isFeatured } = item;

          let slug = slugify(name);
          const existing = await db.manufacturer.findFirst({
            where: { OR: [{ companyName: name.trim() }, { slug }] }
          });

          let certsJson = '[]';
          if (certifications) {
            if (typeof certifications === 'string') {
              try {
                certsJson = JSON.stringify(JSON.parse(certifications));
              } catch {
                certsJson = JSON.stringify([]);
              }
            } else if (Array.isArray(certifications)) {
              certsJson = JSON.stringify(certifications);
            }
          }

          if (existing) {
            await db.manufacturer.update({
              where: { id: existing.id },
              data: {
                slogan: slogan !== undefined ? (slogan ? String(slogan).trim() : null) : existing.slogan,
                description: description !== undefined ? String(description) : existing.description,
                logo: logo !== undefined ? (logo || null) : existing.logo,
                manufacturingLicense: manufacturingLicense !== undefined ? (manufacturingLicense || null) : existing.manufacturingLicense,
                certifications: certifications !== undefined ? certsJson : existing.certifications,
                gstNumber: gstNumber !== undefined ? (gstNumber || null) : existing.gstNumber,
                website: website !== undefined ? (website || null) : existing.website,
                contactEmail: contactEmail !== undefined ? (contactEmail || null) : existing.contactEmail,
                contactPhone: contactPhone !== undefined ? (contactPhone || null) : existing.contactPhone,
                isVerified: isVerified !== undefined ? Boolean(isVerified) : existing.isVerified,
                isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : existing.isFeatured,
              }
            });
          } else {
            let finalSlug = slug;
            let suffix = 1;
            while (await db.manufacturer.findUnique({ where: { slug: finalSlug } })) {
              finalSlug = `${slug}-${suffix++}`;
            }

            await db.manufacturer.create({
              data: {
                companyName: name.trim(),
                slug: finalSlug,
                slogan: slogan ? String(slogan).trim() : null,
                description: description ? String(description) : '',
                logo: logo || null,
                manufacturingLicense: manufacturingLicense || null,
                certifications: certsJson,
                gstNumber: gstNumber || null,
                website: website || null,
                contactEmail: contactEmail || null,
                contactPhone: contactPhone || null,
                isVerified: Boolean(isVerified),
                isFeatured: Boolean(isFeatured),
              }
            });
          }
          results.successful++;
        } catch (e: any) {
          results.failed++;
          results.errors.push(`Row error (${item.companyName || item.name || 'Unknown'}): ${e.message}`);
        }
      }
      return NextResponse.json({ success: true, ...results }, { status: 201 });
    }

    const name = body.companyName || body.name;
    const { slogan, description, logo, manufacturingLicense, certifications, gstNumber, website, contactEmail, contactPhone, isVerified, isFeatured } = body;
    if (!name?.trim()) return NextResponse.json({ error: 'Brand name is required' }, { status: 400 });

    let slug = slugify(name);
    const existing = await db.manufacturer.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    let certsJson = '[]';
    if (certifications) {
      if (typeof certifications === 'string') {
        try {
          certsJson = JSON.stringify(JSON.parse(certifications));
        } catch {
          certsJson = JSON.stringify([]);
        }
      } else if (Array.isArray(certifications)) {
        certsJson = JSON.stringify(certifications);
      }
    }

    const brand = await db.manufacturer.create({
      data: {
        companyName: name.trim(),
        slug,
        slogan: slogan ? slogan.trim() : null,
        description: description || '',
        logo: logo || null,
        manufacturingLicense: manufacturingLicense || null,
        certifications: certsJson,
        gstNumber: gstNumber || null,
        website: website || null,
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        isVerified: Boolean(isVerified),
        isFeatured: Boolean(isFeatured),
      },
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({
      ...brand,
      certifications: (() => { try { return JSON.parse(brand.certifications || '[]'); } catch { return []; } })(),
    });
  } catch (err: any) {
    console.error('[ADMIN_BRANDS_POST_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Failed to create brand' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    const body = await req.json();
    const { id, companyName, name, slogan, description, logo, manufacturingLicense, certifications, gstNumber, website, contactEmail, contactPhone, isVerified, isFeatured } = body;
    if (!id) return NextResponse.json({ error: 'Brand ID is required' }, { status: 400 });

    const brandId = Number(id);
    if (isNaN(brandId)) {
      return NextResponse.json({ error: 'Invalid Brand ID' }, { status: 400 });
    }

    const existing = await db.manufacturer.findUnique({ where: { id: brandId } });
    if (!existing) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    const brandName = name || companyName;

    let certsJson: string | undefined = undefined;
    if (certifications !== undefined) {
      if (typeof certifications === 'string') {
        try {
          certsJson = JSON.stringify(JSON.parse(certifications));
        } catch {
          certsJson = JSON.stringify([]);
        }
      } else if (Array.isArray(certifications)) {
        certsJson = JSON.stringify(certifications);
      } else {
        certsJson = JSON.stringify([]);
      }
    }

    const brand = await db.manufacturer.update({
      where: { id: brandId },
      data: {
        ...(brandName ? { companyName: brandName.trim() } : {}),
        ...(slogan !== undefined ? { slogan: slogan ? slogan.trim() : null } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(logo !== undefined ? { logo: logo || null } : {}),
        ...(manufacturingLicense !== undefined ? { manufacturingLicense: manufacturingLicense || null } : {}),
        ...(certsJson !== undefined ? { certifications: certsJson } : {}),
        ...(gstNumber !== undefined ? { gstNumber: gstNumber || null } : {}),
        ...(website !== undefined ? { website: website || null } : {}),
        ...(contactEmail !== undefined ? { contactEmail: contactEmail || null } : {}),
        ...(contactPhone !== undefined ? { contactPhone: contactPhone || null } : {}),
        ...(isVerified !== undefined ? { isVerified: Boolean(isVerified) } : {}),
        ...(isFeatured !== undefined ? { isFeatured: Boolean(isFeatured) } : {}),
      },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({
      ...brand,
      certifications: (() => { try { return JSON.parse(brand.certifications || '[]'); } catch { return []; } })(),
    });
  } catch (err: any) {
    console.error('[ADMIN_BRANDS_PATCH_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Failed to update brand' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required' }, { status: 401 });
    }
    const { searchParams } = new URL(req.url);
    const id = parseInt(searchParams.get('id') || '');
    if (!id || isNaN(id)) return NextResponse.json({ error: 'Valid Brand ID is required' }, { status: 400 });

    const linked = await db.product.count({ where: { manufacturerId: id } });
    if (linked > 0 && searchParams.get('force') !== 'true') {
      return NextResponse.json({
        error: `Cannot delete: ${linked} products are associated with this brand. Unlink or use force delete.`,
        linkedProducts: linked,
      }, { status: 409 });
    }

    if (linked > 0 && searchParams.get('force') === 'true') {
      await db.product.updateMany({
        where: { manufacturerId: id },
        data: { manufacturerId: null }
      });
    }

    await db.manufacturer.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Brand deleted successfully' });
  } catch (err: any) {
    console.error('[ADMIN_BRANDS_DELETE_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Failed to delete brand' }, { status: 500 });
  }
}
