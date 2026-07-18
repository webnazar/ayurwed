import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, BookOpen, Filter, ArrowUpRight } from 'lucide-react';
import { fetchBloggerPosts } from '@/lib/blogger';

export const revalidate = 60; // Revalidate every minute

interface KnowledgePageProps {
  searchParams: Promise<{ category?: string; search?: string }>;
}

export default async function KnowledgePage(props: KnowledgePageProps) {
  const searchParams = await props.searchParams;
  const selectedCategory = searchParams.category || '';
  const searchKeyword = searchParams.search || '';

  const { posts, allLabels } = await fetchBloggerPosts(selectedCategory, searchKeyword);

  return (
    <div className="max-w-7xl mx-auto layout-padding-minimal py-10">
      {/* Header */}
      <div className="text-center sm:text-left pb-0 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-brand-green tracking-tight">Ayurveda Knowledge Hub</h1>
        <p className="text-sm sm:text-base text-brand-foreground/70">
          Clinical research, herbal guides, dietary wisdom, and lifestyle routines from certified Ayurvedic experts.
        </p>

        {/* Global Search */}
        <form method="GET" action="/knowledge" className="relative mt-8 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-foreground/40" />
          <input
            type="text"
            name="search"
            defaultValue={searchKeyword}
            placeholder="Search articles..."
            className="w-full bg-card text-brand-foreground text-sm sm:text-base border border-border rounded-full py-4 pl-12 pr-6 shadow-sm focus:outline-none focus:border-brand-gold focus:ring-4 focus:ring-brand-gold/10 transition-all"
          />
          {selectedCategory && (
            <input type="hidden" name="category" value={selectedCategory} />
          )}
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-green text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brand-gold hover:text-brand-green transition-colors">
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-card rounded-3xl p-6 border border-border shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-brand-green font-bold border-b border-brand-green-light pb-3">
              <Filter className="h-5 w-5" />
              <span>Filter</span>
            </div>



            <div className="space-y-2">
              <h3 className="text-sm font-bold text-brand-green">Categories</h3>
              <Link href="/knowledge" className={`flex items-center justify-between text-sm py-2 px-3 rounded-full transition-colors ${!selectedCategory ? 'bg-brand-green text-white font-semibold' : 'text-brand-foreground/80 hover:bg-brand-green-light'}`}>
                <span>All Articles</span>
              </Link>
              {allLabels.map((label) => (
                <Link key={label} href={`/knowledge?category=${encodeURIComponent(label)}${searchKeyword ? `&search=${searchKeyword}` : ''}`}
                  className={`flex items-center justify-between gap-2 text-sm py-2 px-3 rounded-full transition-colors ${selectedCategory === label ? 'bg-brand-green text-white font-semibold' : 'text-brand-foreground/80 hover:bg-brand-green-light'}`}>
                  <span className="flex items-center gap-1.5">{label}</span>
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid */}
        <main className="lg:col-span-3">
          {posts.length === 0 ? (
            <div className="bg-card rounded-3xl p-16 text-center border border-border shadow-sm space-y-4">
              <BookOpen className="h-12 w-12 text-brand-gold mx-auto animate-pulse-slow" />
              <h3 className="text-xl font-bold text-brand-green">No Articles Found</h3>
              <p className="text-sm text-brand-foreground/60 max-w-sm mx-auto">Try adjusting your search or category filter.</p>
              <Link href="/knowledge" className="inline-block bg-brand-green text-white px-6 py-2.5 rounded-full text-sm font-semibold">Clear Filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {posts.map(art => {
                return (
                  <a key={art.id} href={art.url} target="_blank" rel="noopener noreferrer"
                    className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
                    <div className="relative h-48 bg-slate-100 overflow-hidden flex-shrink-0">
                      <Image
                        src={art.featuredImage || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'}
                        alt={art.title} fill sizes="(max-width: 640px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        {art.labels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {art.labels.slice(0, 2).map(label => (
                              <span key={label} className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-brand-gold-light/40 text-brand-green border border-border">
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                        <h3 className="font-bold text-brand-green group-hover:text-brand-gold transition-colors line-clamp-2">{art.title}</h3>
                        <p className="text-xs text-brand-foreground/70 line-clamp-2 leading-relaxed">{art.excerpt}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-brand-green-light">
                        <span className="text-xs text-brand-foreground/50">By {art.authorName}</span>
                        <span className="text-brand-green hover:text-brand-gold text-xs font-bold flex items-center gap-0.5 transition-colors">
                          Read Full Article <ArrowUpRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
