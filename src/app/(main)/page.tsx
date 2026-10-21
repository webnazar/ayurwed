import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Leaf,
  ShieldCheck,
  Award,
  Star,
  Smartphone,
  ShoppingBag,
  Truck,
  Sparkles,
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import HeroCard from '@/components/home/HeroCard';
import HeroCarousel from '@/components/home/HeroCarousel';
import SafeImage from '@/components/ui/SafeImage';
import type { Metadata } from 'next';
import { SYMPTOM_QUICK_CHIPS } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'AYURWED — Ancient Intelligence | Authentic Ayurvedic Healthcare & Remedies',
  description: 'Ayurwed brings you Ancient Intelligence. Discover pure Ayurveda remedies, book clinical doctor consultations, and explore classical formulations verified for quality.',
  alternates: {
    canonical: 'https://www.ayurwed.com',
  },
  openGraph: {
    title: 'AYURWED — Ancient Intelligence | Authentic Ayurvedic Healthcare & Remedies',
    description: 'Ayurwed brings you Ancient Intelligence. Discover pure Ayurveda remedies, book clinical doctor consultations, and explore classical formulations verified for quality.',
    url: 'https://www.ayurwed.com',
    siteName: 'AYURWED',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://www.ayurwed.com/icon.png',
        width: 512,
        height: 512,
        alt: 'AYURWED — Ancient Intelligence',
      },
    ],
  },
};

export const revalidate = 0; // Dynamic rendering to fetch latest db updates

function getProductThumbnail(images: any): string | null {
  if (!images) return null;
  let list: string[] = [];
  if (Array.isArray(images)) {
    list = images;
  } else if (typeof images === 'string') {
    try {
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) list = parsed;
      else if (typeof parsed === 'string') list = [parsed];
    } catch {
      if (images.trim() && !images.startsWith('[') && !images.startsWith('{')) {
        list = [images.trim()];
      }
    }
  }

  const valid = list.find(
    (url) =>
      typeof url === 'string' &&
      url.trim().length > 0 &&
      url !== '[]' &&
      url !== '/placeholder-product.png'
  );

  return valid ? valid.trim() : null;
}

const POPULAR_CATEGORIES = [
  { name: 'Capsules', slug: 'Capsule', icon: '💊', desc: 'Concentrated daily herbal extracts' },
  { name: 'Tablets & Vati', slug: 'Tablet', icon: '🌿', desc: 'Classical compressed herbs & rasayanas' },
  { name: 'Syrup & Liquid', slug: 'Syrup & Liquid', icon: '🍯', desc: 'Fast-acting fermented Asavas & Arishtas' },
  { name: 'Powders (Churna)', slug: 'Powder', icon: '🍃', desc: 'Pure micronized single & multi-herbs' },
  { name: 'Ayurvedic Oils', slug: 'Oil', icon: '🪔', desc: 'Traditional medicated massage & hair oils' },
  { name: 'Herbal Ghee', slug: 'Ghee', icon: '🧈', desc: 'Nourishing medicated Ghritas & rasayanas' },
];

export default async function HomePage() {
  let carousels: any[] = [];
  let displayProducts: any[] = [];
  let testimonials: any[] = [];

  try {
    // 1. Fetch active carousels
    carousels = await db.carousel.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  } catch (err) {
    console.error('Error fetching carousels on HomePage:', err);
  }

  try {
    // 2. Fetch Featured & Top eCommerce Products
    const featuredDbProducts = await db.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        manufacturer: { select: { id: true, companyName: true } },
        indications: { select: { id: true, name: true } },
      },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    displayProducts = featuredDbProducts;
    if (displayProducts.length < 4) {
      const additional = await db.product.findMany({
        where: {
          isActive: true,
          id: { notIn: featuredDbProducts.map((p) => p.id) },
        },
        include: {
          manufacturer: { select: { id: true, companyName: true } },
          indications: { select: { id: true, name: true } },
        },
        take: 8 - displayProducts.length,
        orderBy: { createdAt: 'desc' },
      });
      displayProducts = [...displayProducts, ...additional];
    }
  } catch (err) {
    console.error('Error fetching products on HomePage:', err);
  }

  try {
    // 3. Fetch active testimonials
    testimonials = await db.testimonial.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      take: 3,
    });
  } catch (err) {
    console.error('Error fetching testimonials on HomePage:', err);
  }

  // 4. Fetch dynamic categories from Category master
  const fetchCategories = async () => {
    try {
      return await db.category.findMany({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      });
    } catch {
      try {
        const simple = await db.category.findMany({
          where: { isActive: true },
          select: { id: true, name: true, slug: true, description: true, sortOrder: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        });
        return simple.map((c) => ({ ...c, icon: null }));
      } catch {
        return [];
      }
    }
  };

  const dbCategories = await fetchCategories();

  const displayCategories = dbCategories.length > 0
    ? dbCategories.map((c) => ({
        name: c.name,
        slug: c.slug,
        icon: c.icon || '🌿',
        desc: c.description || `Classical Ayurvedic ${c.name} formulations`,
      }))
    : POPULAR_CATEGORIES;

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Carousel Section */}
      {carousels.length > 0 && (
        <section className="w-full relative z-20">
          <HeroCarousel carousels={carousels} />
        </section>
      )}

      {/* 3. eCommerce Quality & Trust Badges */}
      <section className="max-w-7xl mx-auto layout-padding-minimal">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-card rounded-3xl p-5 sm:p-6 border border-border shadow-sm flex items-center gap-4 group hover:border-brand-green/30 transition-all">
            <div className="p-3.5 rounded-2xl bg-brand-green/10 text-brand-green flex-shrink-0 group-hover:scale-110 transition-transform">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-title-primary">100% Classical Herbs</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Pure single & compound extracts</p>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-5 sm:p-6 border border-border shadow-sm flex items-center gap-4 group hover:border-brand-green/30 transition-all">
            <div className="p-3.5 rounded-2xl bg-brand-gold/15 text-brand-gold-dark flex-shrink-0 group-hover:scale-110 transition-transform">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-title-primary">GMP Certified Quality</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Licensed manufacturing units</p>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-5 sm:p-6 border border-border shadow-sm flex items-center gap-4 group hover:border-brand-green/30 transition-all">
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 flex-shrink-0 group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-title-primary">Lab Tested Potency</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Heavy metal & purity verified</p>
            </div>
          </div>

          <div className="bg-card rounded-3xl p-5 sm:p-6 border border-border shadow-sm flex items-center gap-4 group hover:border-brand-green/30 transition-all">
            <div className="p-3.5 rounded-2xl bg-brand-green/10 text-brand-green flex-shrink-0 group-hover:scale-110 transition-transform">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-title-primary">Pan-India Express</h4>
              <p className="text-xs text-muted-foreground mt-0.5">Direct dispatch to your doorstep</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Shop by Concern / Symptoms */}
      <section className="max-w-7xl mx-auto layout-padding-minimal space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-gold-dark">Targeted Ayurveda</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-title-primary tracking-tight mt-1">
              Shop by Health Concern
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Select your specific health goal to discover classical remedies and proven herbal formulations.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-green hover:text-brand-gold transition-colors flex-shrink-0"
          >
            <span>Explore All Concerns</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {SYMPTOM_QUICK_CHIPS.map((chip) => (
            <Link
              key={chip.id}
              href={`/shop?search=${encodeURIComponent(chip.symptoms[0])}`}
              className="bg-card hover:bg-brand-green/5 border border-border hover:border-brand-green/30 rounded-3xl p-4 sm:p-5 text-center flex flex-col items-center justify-between space-y-2 group transition-all duration-200 shadow-sm hover:shadow"
            >
              <span className="text-2xl sm:text-3xl block group-hover:scale-125 transition-transform duration-200">
                {chip.icon}
              </span>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-title-primary group-hover:text-brand-green transition-colors leading-tight">
                  {chip.label}
                </h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Featured Products Grid */}
      <section className="max-w-7xl mx-auto layout-padding-minimal space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-gold-dark">Authentic Store</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-title-primary tracking-tight mt-1">
              Featured Formulations & Products
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Handpicked classical extracts, churnas, vati, and preparations for daily vitality.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-green hover:text-brand-gold transition-colors flex-shrink-0"
          >
            <span>View All Products</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayProducts.map((p) => {
            const thumbnail = getProductThumbnail(p.images);
            const mrp = Number(p.mrp);
            const sellingPrice = Number(p.sellingPrice);
            const discountPct = mrp > sellingPrice ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;
            const primaryIndication = p.indications?.[0]?.name;

            return (
              <div
                key={p.id}
                className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative"
              >
                {/* Product Thumbnail */}
                <Link href={`/shop/${p.slug}`} className="relative aspect-square bg-muted/30 overflow-hidden block">
                  {thumbnail ? (
                    <SafeImage
                      src={thumbnail}
                      fallbackSrc="/icon.webp"
                      fallbackClassName="h-full w-full object-contain p-8 bg-emerald-50/50 group-hover:scale-105 transition-transform duration-500"
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <img
                      src="/icon.webp"
                      alt={p.name}
                      className="w-full h-full object-contain p-8 bg-emerald-50/50 group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {discountPct > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                        {discountPct}% OFF
                      </span>
                    )}
                    {p.isFeatured && (
                      <span className="bg-brand-gold text-brand-green text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                        FEATURED
                      </span>
                    )}
                  </div>
                  {p.type && (
                    <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase">
                      {p.type.replace('_', ' ')}
                    </span>
                  )}
                </Link>

                {/* Product Info */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    {p.manufacturer && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block line-clamp-1">
                        {p.manufacturer.companyName}
                      </span>
                    )}
                    <Link href={`/shop/${p.slug}`}>
                      <h3 className="text-sm font-bold text-title-primary group-hover:text-brand-green transition-colors line-clamp-2">
                        {p.name}
                      </h3>
                    </Link>
                    {primaryIndication && (
                      <span className="inline-block bg-brand-green/10 text-brand-green text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        {primaryIndication}
                      </span>
                    )}
                    {p.shortDesc && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {p.shortDesc}
                      </p>
                    )}
                  </div>

                  {/* Price & CTA */}
                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                    <div>
                      <span className="text-base font-extrabold text-title-primary">
                        {formatPrice(sellingPrice)}
                      </span>
                      {mrp > sellingPrice && (
                        <span className="text-xs text-muted-foreground line-through ml-1.5">
                          {formatPrice(mrp)}
                        </span>
                      )}
                    </div>
                    <Link
                      href={`/shop/${p.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-green hover:bg-brand-green/90 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
                    >
                      <ShoppingBag className="h-3.5 w-3.5" />
                      <span>Details</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Dynamic Category & Formulations */}
      <section className="max-w-7xl mx-auto layout-padding-minimal space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-5">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-brand-gold-dark">Browse Dispensary</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-title-primary tracking-tight mt-1">
              Explore by Category
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Choose the delivery format and category that best suits your daily wellness and digestive preferences.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-green hover:text-brand-gold transition-colors flex-shrink-0"
          >
            <span>All Categories</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {displayCategories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/shop?category=${encodeURIComponent(cat.name)}`}
              className="bg-card rounded-3xl p-5 border border-border shadow-sm hover:shadow-md hover:border-brand-green/30 transition-all text-center flex flex-col justify-between items-center group"
            >
              <span className="text-3xl block group-hover:scale-125 transition-transform duration-200 mb-2">
                {cat.icon}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-title-primary group-hover:text-brand-green transition-colors">
                {cat.name}
              </h4>
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                {cat.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Ayuri AI Ecosystem & Chatbot Card */}
      <section className="relative overflow-hidden py-2">
        <HeroCard />
      </section>

      {/* 8. Mobile App Banner (Kept exactly as requested) */}
      <section className="max-w-7xl mx-auto layout-padding-minimal">
        <div className="bg-brand-gold-light rounded-3xl overflow-hidden border border-border shadow-sm flex flex-col md:flex-row items-center justify-between p-8 sm:p-12 gap-8">
          <div className="space-y-6 max-w-xl">
            <span className="inline-flex items-center gap-1.5 bg-brand-green/10 text-brand-green dark:text-brand-gold-dark px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Smartphone className="h-4 w-4" />
              <span>Ayurwed Mobile App</span>
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-title-primary">
              Ancient Intelligence in Your Pocket
            </h2>
            <p className="text-brand-foreground/85 text-sm sm:text-base leading-relaxed">
              Explore authentic remedies, chat with Ayuri AI guide, discover verified doctors, and learn classical Ayurveda wisdom. Download the official Ayurwed app today.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              {/* App Store Button */}
              <a
                href="#app-download-ios"
                className="inline-block transition-transform duration-300 hover:scale-105 active:scale-95"
                title="Download on the App Store"
              >
                <img
                  src="/app-store-badge.svg"
                  alt="Download on the App Store"
                  className="h-12 w-auto object-contain"
                />
              </a>

              {/* Play Store Button */}
              <a
                href="#app-download-android"
                className="inline-block transition-transform duration-300 hover:scale-105 active:scale-95"
                title="Get it on Google Play"
              >
                <img
                  src="/google-play-badge.svg"
                  alt="Get it on Google Play"
                  className="h-12 w-auto object-contain"
                />
              </a>
            </div>
          </div>

          {/* Premium mockup phone container */}
          <div className="relative w-full max-w-[260px] h-[340px] flex items-center justify-center flex-shrink-0">
            <div className="absolute w-[240px] h-[320px] bg-card rounded-[40px] border-[6px] border-brand-gold shadow-lg overflow-hidden flex flex-col justify-between p-4">
              {/* Phone Status bar mock */}
              <div className="flex justify-between items-center text-[10px] text-brand-green dark:text-brand-gold-dark font-bold">
                <span>9:41</span>
                <div className="h-3 w-12 bg-black/10 rounded-full" />
                <span>5G</span>
              </div>
              
              {/* App screen preview content */}
              <div className="flex-grow flex flex-col justify-center items-center text-center space-y-4">
                <div className="w-36 h-auto flex items-center justify-center">
                  <img src="/ayurwed.webp" alt="Ayurwed logo" className="w-full h-auto object-contain drop-shadow-sm" />
                </div>
                <span className="inline-block bg-brand-green/10 text-brand-green text-[10px] font-bold px-3 py-0.5 rounded-full">
                  App Active
                </span>
              </div>

              {/* Phone Home indicator mock */}
              <div className="w-20 h-1 bg-brand-green/30 rounded-full mx-auto" />
            </div>
            {/* Ambient gold glow */}
            <div className="absolute inset-0 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 9. Testimonials (Kept exactly as requested) */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto layout-padding-minimal">
          <h2 className="text-3xl font-bold text-brand-green text-center mb-10">What Our Wellness Circle Says</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-card rounded-3xl p-6 border border-brand-green-border/15 shadow-sm flex flex-col space-y-4 h-full">
                <div className="flex gap-0.5 text-brand-gold">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-brand-foreground/80 leading-relaxed italic flex-grow">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="pt-4 mt-auto border-t border-brand-green-light flex items-center gap-3">
                  <SafeImage 
                    src={t.avatar && t.avatar.trim().length > 0 ? t.avatar : "/avatar.webp"} 
                    alt={t.name} 
                    className="h-9 w-9 rounded-full object-cover border border-brand-gold/20 flex-shrink-0" 
                    fallbackSrc="/avatar.webp"
                  />
                  <div>
                    <span className="text-xs font-bold text-brand-green block">{t.name}</span>
                    <span className="text-[10px] text-brand-foreground/40 block">{t.subtitle}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 10. Video Introduction Section (Kept exactly as requested) */}
      <section className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-10">
        <div className="text-center space-y-4 mb-8">
          <h2 className="text-3xl font-bold text-brand-green">Experience AYURWED</h2>
          <p className="text-brand-foreground/75 max-w-xl mx-auto">Watch our introduction video to learn about the Ancient Extract Intelligence System.</p>
        </div>
        <div className="relative aspect-video rounded-3xl md:rounded-[2rem] lg:rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-brand-green/20 bg-black transform hover:scale-[1.01] transition-transform duration-300">
          <iframe
            src="https://www.youtube.com/embed/O6X58iklHfo"
            title="AYURWED Introduction Video"
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </section>
    </div>
  );
}
