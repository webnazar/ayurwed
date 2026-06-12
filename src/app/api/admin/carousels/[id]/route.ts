import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const formData = await req.formData();
    
    // Could be a status toggle only, handled by checking if it's JSON instead of FormData
    // Since we now use FormData for everything in the form, let's parse safely:
    const title = formData.get('title') as string;
    const link = formData.get('link') as string;
    const isActiveStr = formData.get('isActive');
    const sortOrderStr = formData.get('sortOrder');
    const file = formData.get('image') as File | null;

    const dataToUpdate: any = {};
    if (title !== null) dataToUpdate.title = title;
    if (link !== null) dataToUpdate.link = link || null;
    if (isActiveStr !== null) dataToUpdate.isActive = isActiveStr === 'true';
    if (sortOrderStr !== null) dataToUpdate.sortOrder = parseInt(sortOrderStr as string);

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
      const uploadDir = path.join(process.cwd(), 'public', 'carousel');
      const filePath = path.join(uploadDir, filename);

      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(filePath, buffer);
      dataToUpdate.image = `/carousel/${filename}`;
    }

    const carousel = await db.carousel.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json(carousel);
  } catch (error: any) {
    // Fallback if they send JSON (e.g. from the quick toggleStatus button)
    try {
      const id = parseInt(params.id);
      const data = await req.json();
      const carousel = await db.carousel.update({
        where: { id },
        data: {
          isActive: data.isActive,
        },
      });
      return NextResponse.json(carousel);
    } catch {
      return NextResponse.json({ message: error.message || 'Failed to update' }, { status: 500 });
    }
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    await db.carousel.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
