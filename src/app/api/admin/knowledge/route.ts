import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function adminGuard() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const guard = await adminGuard();
  if (guard) return guard;

  const articles = await db.knowledgeArticle.findMany({
    orderBy: { createdAt: 'desc' },
    include: { author: { select: { id: true, name: true } } },
  });
  return NextResponse.json(articles);
}

export async function POST(req: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { title, excerpt, content, type, tags, featuredImage, isPublished } = body;

  if (!title?.trim() || !content?.trim() || !excerpt?.trim() || !type) {
    return NextResponse.json({ error: 'Title, excerpt, content and type are required' }, { status: 400 });
  }

  const slug = title.trim().toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

  // Ensure unique slug
  const existing = await db.knowledgeArticle.findFirst({ where: { slug } });
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const article = await db.knowledgeArticle.create({
    data: {
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt.trim(),
      content: content.trim(),
      type,
      tags: tags || [],
      featuredImage: featuredImage?.trim() || null,
      isPublished: isPublished ?? false,
      publishedAt: isPublished ? new Date() : null,
      authorId: Number(session!.user.id),
    },
    include: { author: { select: { id: true, name: true } } },
  });
  return NextResponse.json(article, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  const updateData: any = {};
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.excerpt !== undefined) updateData.excerpt = data.excerpt.trim();
  if (data.content !== undefined) updateData.content = data.content.trim();
  if (data.type !== undefined) updateData.type = data.type;
  if (data.tags !== undefined) updateData.tags = data.tags;
  if (data.featuredImage !== undefined) updateData.featuredImage = data.featuredImage?.trim() || null;
  if (data.isPublished !== undefined) {
    updateData.isPublished = data.isPublished;
    if (data.isPublished) updateData.publishedAt = new Date();
  }

  const article = await db.knowledgeArticle.update({
    where: { id: Number(id) },
    data: updateData,
    include: { author: { select: { id: true, name: true } } },
  });
  return NextResponse.json(article);
}

export async function DELETE(req: NextRequest) {
  const guard = await adminGuard();
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

  await db.knowledgeArticle.delete({ where: { id: Number(id) } });
  return NextResponse.json({ success: true });
}
