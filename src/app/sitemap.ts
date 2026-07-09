import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXTAUTH_URL || 'https://ayurwed.com').replace(/\/$/, '');

  // 1. Static Pages
  const staticRoutes = [
    '',
    '/doctors',
    '/academy',
    '/knowledge',
    '/about',
    '/terms',
    '/privacy',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Active & Verified Doctor Profiles
  let doctorRoutes: MetadataRoute.Sitemap = [];
  try {
    const consultants = await db.consultantProfile.findMany({
      where: {
        isVerified: true,
        isCaiCertified: true,
      },
      select: {
        userId: true,
      },
    });
    
    doctorRoutes = consultants.map((c) => ({
      url: `${baseUrl}/doctors/${c.userId}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error('[SITEMAP_DOCTORS_ERROR]', error);
  }

  // 3. Active Medicine & Herb Preparations
  let prepRoutes: MetadataRoute.Sitemap = [];
  try {
    const preparations = await db.preparation.findMany({
      where: {
        isActive: true,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
    });

    prepRoutes = preparations.map((p) => ({
      url: `${baseUrl}/preparations/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('[SITEMAP_PREPARATIONS_ERROR]', error);
  }

  // 4. Published Knowledge Articles
  let articleRoutes: MetadataRoute.Sitemap = [];
  try {
    const articles = await db.knowledgeArticle.findMany({
      where: {
        isPublished: true,
      },
      select: {
        slug: true,
        type: true,
        updatedAt: true,
      },
    });

    articleRoutes = articles.map((a) => ({
      url: `${baseUrl}/knowledge/${a.type.toLowerCase()}/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error('[SITEMAP_ARTICLES_ERROR]', error);
  }

  return [...staticRoutes, ...doctorRoutes, ...prepRoutes, ...articleRoutes];
}
