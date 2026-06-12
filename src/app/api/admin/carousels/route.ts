import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const carousels = await db.carousel.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return NextResponse.json(carousels);
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const title = formData.get('title') as string;
    const link = formData.get('link') as string;
    const isActive = formData.get('isActive') === 'true';
    const sortOrder = parseInt(formData.get('sortOrder') as string) || 0;
    const file = formData.get('image') as File;

    if (!title || !file) {
      return NextResponse.json({ message: 'Title and image are required' }, { status: 400 });
    }

    // Check limit
    const count = await db.carousel.count();
    if (count >= 5) {
      return NextResponse.json({ message: 'Maximum of 5 carousels allowed' }, { status: 400 });
    }

    // Handle File Upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Create unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'carousel');
    const filePath = path.join(uploadDir, filename);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    // Save file
    await fs.writeFile(filePath, buffer);
    const imageUrl = `/carousel/${filename}`;

    const carousel = await db.carousel.create({
      data: {
        title,
        image: imageUrl,
        link: link || null,
        isActive,
        sortOrder,
      },
    });

    return NextResponse.json(carousel, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
