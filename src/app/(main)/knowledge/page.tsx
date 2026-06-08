import React from 'react';
import { db } from '@/lib/db';
import Link from 'next/link';
import Image from 'next/image';
import { Search, BookOpen, Leaf, HeartPulse, Utensils, Activity, FlaskConical, ArrowUpRight, Filter } from 'lucide-react';

export const revalidate = 0;

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  HERB:      { label: 'Herbs',      icon: <Leaf className="h-4 w-4" />,        color: 'bg-emerald-100 text-emerald-700' },
  CONDITION: { label: 'Conditions', icon: <HeartPulse className="h-4 w-4" />,  color: 'bg-rose-100 text-rose-700' },
  DIET:      { label: 'Diet',       icon: <Utensils className="h-4 w-4" />,    color: 'bg-amber-100 text-amber-700' },
  LIFESTYLE: { label: 'Lifestyle',  icon: <Activity className="h-4 w-4" />,    color: 'bg-indigo-100 text-indigo-700' },
  RESEARCH:  { label: 'Research',   icon: <FlaskConical className="h-4 w-4" />, color: 'bg-cyan-100 text-cyan-700' },
};

interface KnowledgePageProps {
  searchParams: { type?: string; search?: string };
}

export default async function KnowledgePage({ searchParams }: KnowledgePageProps) {
  const selectedType = searchParams.type || '';
  const searchKeyword = searchParams.search || '';

  const where: any = { isPublished: true };
  if (selectedType) where.type = selectedType;
  if (searchKeyword) where.title = { contains: searchKeyword };

  const [articles, counts] = await Promise.all([
    db.knowledgeArticle.findMany({
      where,
      orderBy: { publishedAt: 'desc' },
      include: { author: { select: { name: true } } },
    }),
    db.knowledgeArticle.groupBy({
      by: ['type'],
      where: { isPublished: true },
      _count: { type: true },
    }),
  ]);

  const countMap = Object.fromEntries(counts.map(c => [c.type, c._count.type]));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center sm:text-left border-b border-brand-green-border/10 pb-8 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-green tracking-tight">Ayurveda Library</h1>
        <p className="text-sm sm:text-base text-brand-foreground/70">
          Clinical research, herbal guides, dietary wisdom, and lifestyle routines from certified Ayurvedic experts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-10">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-brand-green font-bold border-b border-brand-green-light pb-3">
              <Filter className="h-5 w-5" />
              <span>Filter</span>
            </div>

            <form method="GET" action="/knowledge" className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-foreground/40" />
              <input type="text" name="search" defaultValue={searchKeyword}
                placeholder="Search articles..."
                className="w-full bg-brand-green-light/40 text-sm border border-brand-green-border/10 rounded-full py-2.5 pl-9 pr-4 focus:outline-none focus:border-brand-gold" />
              {selectedType && <input type="hidden" name="type" value={selectedType} />}
            </form>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-brand-green">Categories</h3>
              <Link href="/knowledge" className={`flex items-center justify-between text-sm py-2 px-3 rounded-full transition-colors ${!selectedType ? 'bg-brand-green text-white font-semibold' : 'text-brand-foreground/80 hover:bg-brand-green-light'}`}>
                <span>All Articles</span>
                <span className="text-[10px] font-bold opacity-75">{articles.length + (selectedType ? 0 : 0)}</span>
              </Link>
              {Object.entries(TYPE_CONFIG).map(([type, cfg]) => (
                <Link key={type} href={`/knowledge?type=${type}${searchKeyword ? `&search=${searchKeyword}` : ''}`}
                  className={`flex items-center justify-between gap-2 text-sm py-2 px-3 rounded-full transition-colors ${selectedType === type ? 'bg-brand-green text-white font-semibold' : 'text-brand-foreground/80 hover:bg-brand-green-light'}`}>
                  <span className="flex items-center gap-1.5">{cfg.icon}{cfg.label}</span>
                  <span className="text-[10px] font-bold opacity-75">{countMap[type] || 0}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <main className="lg:col-span-3">
          {articles.length === 0 ? (
            <div className="bg-white rounded-3xl p-16 text-center border border-brand-green-border/10 shadow-sm space-y-4">
              <BookOpen className="h-12 w-12 text-brand-gold mx-auto animate-pulse-slow" />
              <h3 className="text-xl font-bold text-brand-green">No Articles Found</h3>
              <p className="text-sm text-brand-foreground/60 max-w-sm mx-auto">Try adjusting your search or category filter.</p>
              <Link href="/knowledge" className="inline-block bg-brand-green text-white px-6 py-2.5 rounded-full text-sm font-semibold">Clear Filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {articles.map(art => {
                const cfg = TYPE_CONFIG[art.type] || TYPE_CONFIG.RESEARCH;
                return (
                  <Link key={art.id} href={`/knowledge/${art.type.toLowerCase()}/${art.slug}`}
                    className="bg-white rounded-3xl overflow-hidden border border-brand-green-border/10 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
                    <div className="relative h-48 bg-slate-100 overflow-hidden flex-shrink-0">
                      <Image
                        src={art.featuredImage || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'}
                        alt={art.title} fill sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                        <h3 className="font-bold text-brand-green group-hover:text-brand-gold transition-colors line-clamp-2">{art.title}</h3>
                        <p className="text-xs text-brand-foreground/70 line-clamp-2 leading-relaxed">{art.excerpt}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-brand-green-light">
                        <span className="text-xs text-brand-foreground/50">By {art.author?.name}</span>
                        <span className="text-brand-green hover:text-brand-gold text-xs font-bold flex items-center gap-0.5 transition-colors">
                          Read <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
