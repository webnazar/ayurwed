import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const role = session.user.role;
    if (!['ADMIN', 'CONSULTANT', 'CONSUMER'].includes(role as string)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const rawFolder = (formData.get('folder') as string) || 'misc';
    // Security: sanitize folder against directory traversal (e.g., ../../)
    const folder = rawFolder.replace(/[^a-zA-Z0-9_\-]/g, '') || 'misc';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, WebP and GIF images are allowed.' }, { status: 415 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 5MB.' }, { status: 413 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Use caller-supplied filename if provided, else generate a unique one
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const customName = (formData.get('filename') as string | null)?.trim();
    const safeName = customName
      ? `${customName.replace(/[^a-z0-9_\-]/gi, '_')}.${ext}`
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const uploadDir = join(process.cwd(), 'public', 'uploads', folder);

    // Ensure dir exists
    await mkdir(uploadDir, { recursive: true });

    const filepath = join(uploadDir, safeName);
    await writeFile(filepath, buffer);

    const publicUrl = `/uploads/${folder}/${safeName}`;
    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (err: any) {
    console.error('[UPLOAD_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
