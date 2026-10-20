import React from 'react';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowLeft, Eye, ArrowUpRight, Leaf, HeartPulse, Utensils, Activity, FlaskConical } from 'lucide-react';
import { Metadata } from 'next';

export const revalidate = 0;

const TYPE_LABELS: Record<string, string> = {
  HERB: 'Herb Guide', CONDITION: 'Condition', DIET: 'Diet',
  LIFESTYLE: 'Lifestyle', RESEARCH: 'Research',
};

const TYPE_COLORS: Record<string, string> = {
  HERB: 'bg-emerald-100 text-emerald-700',
  CONDITION: 'bg-rose-100 text-rose-700',
  DIET: 'bg-amber-100 text-amber-700',
  LIFESTYLE: 'bg-indigo-100 text-indigo-700',
  RESEARCH: 'bg-cyan-100 text-cyan-700',
};

interface ArticleDetailProps {
  params: Promise<{ type: string; slug: string }>;
}

export async function generateMetadata(props: ArticleDetailProps): Promise<Metadata> {
  const params = await props.params;
  const article = await db.knowledgeArticle.findUnique({ where: { slug: params.slug } });
  if (!article) return { title: 'Article Not Found | AYURWED' };

  const baseUrl = 'https://www.ayurwed.com';
  const pageUrl = `${baseUrl}/knowledge/${params.type.toLowerCase()}/${params.slug}`;
  const title = `${article.title} | AYURWED Knowledge`;
  const desc = article.excerpt || article.content?.replace(/<[^>]+>/g, '').slice(0, 160) || 'Read authentic Ayurveda research and wellness insights on Ayurwed.';
  const imageUrl = article.featuredImage?.startsWith('http')
    ? article.featuredImage
    : article.featuredImage
    ? `${baseUrl}${article.featuredImage.startsWith('/') ? '' : '/'}${article.featuredImage}`
    : `${baseUrl}/icon.png`;

  return {
    title,
    description: desc,
    keywords: [article.title, article.type || 'Ayurveda', 'AYURWED Knowledge', 'Ancient Intelligence'],
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description: desc,
      url: pageUrl,
      siteName: 'AYURWED',
      locale: 'en_IN',
      type: 'article',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
      images: [imageUrl],
    },
  };
}

export default async function ArticleDetailPage(props: ArticleDetailProps) {
  const params = await props.params;
  const article = await db.knowledgeArticle.findUnique({
    where: { slug: params.slug, isPublished: true },
    include: { author: { select: { name: true, avatar: true } } },
  });

  if (!article) notFound();

  // Increment view count (fire-and-forget)
  db.knowledgeArticle.update({ where: { id: article.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const relatedArticles = await db.knowledgeArticle.findMany({
    where: { type: article.type, isPublished: true, id: { not: article.id } },
    take: 3,
    orderBy: { viewCount: 'desc' },
  });

  const tags = Array.isArray(article.tags) ? article.tags as string[] : [];
  const typeLabel = TYPE_LABELS[article.type] || article.type;
  const typeColor = TYPE_COLORS[article.type] || 'bg-muted text-gray-700';

  return (
    <div className="max-w-7xl mx-auto layout-padding-minimal py-10">
      {/* Navigation Row (Breadcrumbs & Back Button) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-brand-foreground/60">
          <Link href="/" className="hover:text-brand-green">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/knowledge" className="hover:text-brand-green">Knowledge Hub</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/knowledge?type=${article.type}`} className="hover:text-brand-green">{typeLabel}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-brand-green font-semibold line-clamp-1">{article.title}</span>
        </div>

        <Link href="/knowledge" className="inline-flex items-center gap-2 text-sm font-bold text-brand-green hover:text-brand-gold transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Knowledge Hub</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <article className="lg:col-span-2 space-y-8">
          {/* Featured image */}
          {article.featuredImage && (
            <div className="relative h-64 sm:h-96 rounded-3xl overflow-hidden">
              <Image src={article.featuredImage} alt={article.title} fill sizes="(max-width: 768px) 100vw, 66vw" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-green/60 to-transparent" />
            </div>
          )}

          {/* Meta */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${typeColor}`}>{typeLabel}</span>
              <div className="flex items-center gap-1 text-xs text-brand-foreground/50">
                <Eye className="h-3.5 w-3.5" /> {article.viewCount} views
              </div>
              {article.publishedAt && (
                <span className="text-xs text-brand-foreground/50">
                  {new Date(article.publishedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-brand-green tracking-tight leading-tight">{article.title}</h1>
            <p className="text-base text-brand-foreground/70 italic leading-relaxed border-l-4 border-brand-gold pl-4">{article.excerpt}</p>
          </div>

          {/* Author */}
          <div className="flex items-center gap-4 bg-brand-gold-light/30 rounded-2xl p-4 border border-brand-gold/20">
            <div className="h-12 w-12 bg-brand-green text-white font-bold rounded-full flex items-center justify-center text-lg flex-shrink-0">
              {article.author?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="font-bold text-brand-green">{article.author?.name || 'Ayurwed Expert'}</p>
              <p className="text-xs text-brand-foreground/60">Certified Ayurvedic Author</p>
            </div>
          </div>

          {/* Content */}
          <div className="bg-card rounded-3xl p-8 border border-border shadow-sm">
            <div className="prose prose-sm max-w-none text-brand-foreground/80 leading-relaxed whitespace-pre-wrap">
              {article.content}
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, i) => (
                <span key={i} className="bg-brand-green-light text-brand-green text-xs font-medium px-3 py-1 rounded-full">#{tag}</span>
              ))}
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Related */}
          <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="font-bold text-brand-green">Related Articles</h3>
            </div>
            {relatedArticles.length === 0 ? (
              <p className="p-5 text-sm text-brand-foreground/50 text-center">No related articles.</p>
            ) : (
              <div className="divide-y divide-brand-green-border/10">
                {relatedArticles.map(rel => (
                  <Link key={rel.id} href={`/knowledge/${rel.type.toLowerCase()}/${rel.slug}`}
                    className="flex gap-3 p-4 hover:bg-brand-gold-light/15 transition-colors group">
                    {rel.featuredImage && (
                      <div className="relative h-14 w-14 rounded-xl overflow-hidden flex-shrink-0">
                        <Image src={rel.featuredImage} alt={rel.title} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <p className="text-sm font-bold text-brand-green group-hover:text-brand-gold line-clamp-2 transition-colors">{rel.title}</p>
                      <span className="text-xs text-brand-foreground/50 flex items-center gap-0.5 mt-1">
                        Read <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Browse by type */}
          <div className="bg-brand-green-light/40 rounded-3xl p-5 space-y-3">
            <h3 className="font-bold text-brand-green text-sm">Browse by Type</h3>
            {Object.entries(TYPE_LABELS).map(([type, label]) => (
              <Link key={type} href={`/knowledge?type=${type}`}
                className="flex items-center gap-2 text-sm text-brand-foreground/70 hover:text-brand-green font-medium transition-colors">
                <ArrowUpRight className="h-3.5 w-3.5" /> {label}
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
