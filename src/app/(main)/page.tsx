import React from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, ShieldCheck, HeartPulse, Sparkles, MessageSquare, ArrowUpRight, Award, Star, Smartphone } from 'lucide-react';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import AyuriTriggerButton from '@/components/layout/AyuriTriggerButton';
import HeroCard from '@/components/home/HeroCard';
import HeroCarousel from '@/components/home/HeroCarousel';

export const revalidate = 0; // Dynamic rendering to fetch latest db updates

export default async function HomePage() {
  // Fetch active carousels
  const carousels = await db.carousel.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    take: 5,
  });

  // 1. Fetch Featured & Premium Products
  const featuredProducts = await db.product.findMany({
    where: { 
      isActive: true,
      OR: [
        { isFeatured: true },
        { manufacturer: { isPremium: true } }
      ]
    },
    take: 3,
    include: { category: true, manufacturer: true }
  });

  // 2. Fetch Verified Consultants
  const consultants = await db.consultantProfile.findMany({
    where: { isVerified: true },
    take: 2,
    include: { user: true }
  });

  // 3. Fetch Knowledge Articles
  const articles = await db.knowledgeArticle.findMany({
    where: { isPublished: true },
    take: 2,
    include: { author: true }
  });

  // 4. Fetch active testimonials
  const testimonials = await db.testimonial.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    take: 3,
  });

  return (
    <div className="space-y-16 pb-20">
      {/* 1. Carousel Section */}
      {carousels.length > 0 && (
        <section className="w-full relative z-20 -mb-16">
          <HeroCarousel carousels={carousels} />
        </section>
      )}

      {/* 2. Hero Card (Logo & Ayuri Section) */}
      <section className="relative overflow-hidden bg-white text-brand-green py-16">
        {/* Soft background glow circles */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-brand-green-light rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-brand-gold/10 rounded-full blur-2xl pointer-events-none" />

        <HeroCard />
      </section>

      {/* 3. How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold text-brand-green">The Wellness Journey</h2>
          <p className="text-brand-foreground/75 max-w-xl mx-auto">Three simple steps to transition from chronic issues to pure holistic wellness.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-8 border border-brand-green-border/10 shadow-sm hover:shadow-md transition-all duration-300 text-center space-y-4">
            <div className="inline-flex p-4 bg-brand-green-light rounded-full text-brand-green">
              <Leaf className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-brand-green">1. Discover Slugs</h3>
            <p className="text-sm text-brand-foreground/70 leading-relaxed">
              Browse classical certifications, pure adaptogenic single herbs, daily preparations, and learn about your Dosha types.
            </p>
          </div>
          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-8 border border-brand-green-border/10 shadow-sm hover:shadow-md transition-all duration-300 text-center space-y-4">
            <div className="inline-flex p-4 bg-brand-gold/15 rounded-full text-brand-gold-dark">
              <MessageSquare className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-brand-green">2. Consult Experts</h3>
            <p className="text-sm text-brand-foreground/70 leading-relaxed">
              Book live, secure video or chat sessions with certified Ayurvedic doctors specializing in internal medicine, Panchakarma, and ENT.
            </p>
          </div>
          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-8 border border-brand-green-border/10 shadow-sm hover:shadow-md transition-all duration-300 text-center space-y-4">
            <div className="inline-flex p-4 bg-emerald-100 rounded-full text-emerald-700">
              <HeartPulse className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-brand-green">3. Heal Naturally</h3>
            <p className="text-sm text-brand-foreground/70 leading-relaxed">
              Receive custom diet sheets, specialized preparation regimes, and follow-up consultation routines tailored to your Prakriti.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-brand-green-border/10 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-brand-green">Featured Preparations</h2>
            <p className="text-brand-foreground/70 mt-1">Sourced from certified, GMP/AYUSH premium manufacturers.</p>
          </div>
          <Link href="/preparations" className="text-brand-gold hover:text-brand-green font-bold flex items-center gap-1 group">
            <span>View All Products</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {featuredProducts.map((p) => (
            <div key={p.id} className="bg-white rounded-3xl overflow-hidden border border-brand-green-border/10 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group">
              <div className="relative h-64 bg-slate-50 overflow-hidden">
                <Image
                  src={Array.isArray(p.images) ? (p.images as string[])[0] : 'https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=400&q=80'}
                  alt={p.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-brand-gold text-brand-green font-bold text-xs px-3 py-1 rounded-full uppercase">
                  {p.tag || 'Popular'}
                </span>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-brand-green/80 uppercase tracking-wider">
                    {p.category?.name || 'Wellness'}
                  </span>
                  <h3 className="text-lg font-bold text-brand-green group-hover:text-brand-gold transition-colors duration-200 line-clamp-1">
                    {p.name}
                  </h3>
                  <p className="text-sm text-brand-foreground/70 line-clamp-2">
                    {p.description}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-brand-green-light">
                  <div>
                    <span className="text-xl font-extrabold text-brand-green">
                      {formatPrice(Number(p.price))}
                    </span>
                    {p.comparePrice && (
                      <span className="text-sm text-brand-foreground/40 line-through ml-2">
                        {formatPrice(Number(p.comparePrice))}
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/preparations/${p.slug}`}
                    className="bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200"
                  >
                    Details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Ayuri Chatbot Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-brand-green-light rounded-3xl p-8 sm:p-12 text-brand-green relative overflow-hidden shadow-sm border border-brand-green/10">
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 bg-white/50 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-1.5 bg-brand-green/10 text-brand-green px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Award className="h-4 w-4" />
              <span>Meet Ayuri — Official AI Guide</span>
            </span>
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight md:whitespace-nowrap">
              Instant Ayurvedic Wisdom, Tailored to You
            </h2>
            <p className="text-brand-green/70 text-sm sm:text-base leading-relaxed">
              Not sure which product matches your body profile? Ask Ayuri about herbal ingredients, dosage plans, lifestyle guidelines, and get instant, clinically grounded guidance.
            </p>
            <div className="pt-2">
              <AyuriTriggerButton />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Consultants */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-brand-green-border/10 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-brand-green">Verified Specialists</h2>
            <p className="text-brand-foreground/70 mt-1">Book professional diagnostic audits & customized Panchakarma routines.</p>
          </div>
          <Link href="/consultants" className="text-brand-gold hover:text-brand-green font-bold flex items-center gap-1 group">
            <span>View All Doctors</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {consultants.map((c) => (
            <div key={c.id} className="bg-white rounded-3xl p-6 border border-brand-green-border/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row gap-6">
              <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-brand-green-light flex-shrink-0 mx-auto">
                <Image
                  src={c.user?.avatar || 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=150&q=80'}
                  alt={c.user?.name || 'Doctor'}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <div className="flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-brand-green">{c.user?.name}</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                      <ShieldCheck className="h-3 w-3" />
                      <span>Verified</span>
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-brand-gold-dark">{c.specialization}</p>
                  <p className="text-sm text-brand-foreground/70 line-clamp-2">{c.bio}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {(c.languages as string[]).map((l) => (
                      <span key={l} className="bg-brand-green-light text-brand-green text-[10px] font-medium px-2.5 py-0.5 rounded-full">
                        {l}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-brand-green-light">
                  <div>
                    <span className="text-xs text-brand-foreground/50 block">Consultation Fee</span>
                    <span className="text-lg font-extrabold text-brand-green">{formatPrice(Number(c.consultationFee))}</span>
                  </div>
                  <Link
                    href={`/consultants/${c.userId}`}
                    className="bg-brand-gold hover:bg-brand-green hover:text-white text-brand-green px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300"
                  >
                    Book Appointment
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Knowledge Hub Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-end gap-4 border-b border-brand-green-border/10 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-brand-green">Ayurveda Library</h2>
            <p className="text-brand-foreground/70 mt-1">Read clinical research, recipes, and lifestyle suggestions.</p>
          </div>
          <Link href="/knowledge" className="text-brand-gold hover:text-brand-green font-bold flex items-center gap-1 group">
            <span>Browse Library</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
          {articles.map((art) => (
            <div key={art.id} className="bg-white rounded-3xl overflow-hidden border border-brand-green-border/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row group">
              <div className="relative h-48 sm:h-auto sm:w-48 bg-slate-150 flex-shrink-0">
                <Image
                  src={art.featuredImage || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80'}
                  alt={art.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 192px"
                  className="object-cover"
                />
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="bg-brand-gold/15 text-brand-gold-dark text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider inline-block">
                    {art.type}
                  </span>
                  <h3 className="text-base font-bold text-brand-green group-hover:text-brand-gold transition-colors duration-200">
                    {art.title}
                  </h3>
                  <p className="text-sm text-brand-foreground/70 line-clamp-2">
                    {art.excerpt}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-brand-foreground/40 font-medium">By {art.author?.name}</span>
                  <Link
                    href={`/knowledge/${art.type.toLowerCase()}/${art.slug}`}
                    className="text-brand-green hover:text-brand-gold font-bold text-xs flex items-center gap-0.5"
                  >
                    <span>Read Article</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6.5. Mobile App Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#f2efe4] rounded-3xl overflow-hidden border border-brand-green-border/10 shadow-sm flex flex-col md:flex-row items-center justify-between p-8 sm:p-12 gap-8">
          <div className="space-y-6 max-w-xl">
            <span className="inline-flex items-center gap-1.5 bg-brand-green/10 text-brand-green px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <Smartphone className="h-4 w-4" />
              <span>Ayurwed Mobile App</span>
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-brand-green">
              Ancient Wisdom in Your Pocket
            </h2>
            <p className="text-brand-foreground/85 text-sm sm:text-base leading-relaxed">
              Scan product ingredients, chat with Ayuri AI instantly, schedule secure consultations, and manage your health dashboard. Download the official Ayurwed app today.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              {/* App Store Button */}
              <a
                href="#app-download-ios"
                className="flex items-center gap-3 bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green px-6 py-3 rounded-2xl font-bold shadow-md transition-all duration-300 border border-transparent hover:border-brand-green/10 group/btn"
              >
                <img
                  src="https://icons.getbootstrap.com/assets/icons/apple.svg"
                  alt="Apple Store"
                  className="h-6 w-6 invert group-hover/btn:invert-0 transition-all duration-300"
                />
                <div className="text-left leading-none">
                  <span className="text-[10px] font-medium block opacity-75">Download on the</span>
                  <span className="text-sm font-extrabold">App Store</span>
                </div>
              </a>

              {/* Play Store Button */}
              <a
                href="#app-download-android"
                className="flex items-center gap-3 bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green px-6 py-3 rounded-2xl font-bold shadow-md transition-all duration-300 border border-transparent hover:border-brand-green/10 group/btn"
              >
                <img
                  src="https://icons.getbootstrap.com/assets/icons/google-play.svg"
                  alt="Google Play"
                  className="h-6 w-6 invert group-hover/btn:invert-0 transition-all duration-300"
                />
                <div className="text-left leading-none">
                  <span className="text-[10px] font-medium block opacity-75">GET IT ON</span>
                  <span className="text-sm font-extrabold">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Premium mockup phone container */}
          <div className="relative w-full max-w-[260px] h-[340px] flex items-center justify-center flex-shrink-0">
            <div className="absolute w-[240px] h-[320px] bg-brand-green rounded-[40px] border-[6px] border-brand-gold shadow-lg overflow-hidden flex flex-col justify-between p-4">
              {/* Phone Status bar mock */}
              <div className="flex justify-between items-center text-[10px] text-brand-gold font-bold">
                <span>9:41</span>
                <div className="h-3 w-12 bg-black/30 rounded-full" />
                <span>5G</span>
              </div>
              
              {/* App screen preview content */}
              <div className="flex-grow flex flex-col justify-center items-center text-center space-y-5 pt-4">
                <div className="bg-white/95 p-3 rounded-2xl shadow-md max-w-[170px] flex items-center justify-center">
                  <img src="/logo.png" alt="Ayurwed logo" className="w-full h-auto object-contain" />
                </div>
                <span className="inline-block bg-brand-gold text-brand-green text-[9px] font-bold px-3 py-1 rounded-full animate-pulse-slow">
                  Companion App Active
                </span>
              </div>

              {/* Phone Home indicator mock */}
              <div className="w-20 h-1 bg-brand-gold/60 rounded-full mx-auto" />
            </div>
            {/* Ambient gold glow */}
            <div className="absolute inset-0 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      {testimonials.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-brand-green text-center mb-10">What Our Wellness Circle Says</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(t => (
              <div key={t.id} className="bg-white rounded-3xl p-6 border border-brand-green-border/15 shadow-sm space-y-4">
                <div className="flex gap-0.5 text-brand-gold">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-brand-foreground/80 leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="pt-2 border-t border-brand-green-light flex items-center gap-3">
                  {t.avatar ? (
                    <img src={t.avatar} alt={t.name} className="h-9 w-9 rounded-full object-cover border border-brand-gold/20 flex-shrink-0" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-brand-green-light flex items-center justify-center flex-shrink-0">
                      <span className="text-brand-green font-bold text-sm">{t.name.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
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
    </div>
  );
}
