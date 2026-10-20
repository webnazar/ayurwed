import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { 
  Sparkles, BookOpen, Brain, Leaf, HeartHandshake, ShieldCheck, 
  Award, Target, Cpu, CheckCircle2, ShoppingBag, Stethoscope, 
  Users, PhoneCall, ArrowRight, FileText, Check, Laptop, Store
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us — Ancient Intelligence Meets Modern Wellness | AYURWED',
  description: 'Discover AYURWED: A unified Ayurvedic ecosystem featuring direct doctor listings with zero platform fees, complimentary AI clinical diagnosis software for subscribed doctors, authentic Ayurvedic e-commerce, CAI academy certification, and a rich knowledge center.',
  keywords: [
    'About Ayurwed',
    'Ancient Intelligence',
    'Ayurvedic Doctors Directory',
    'Ayurveda Marketplace',
    'Ayurvedic Clinical Software',
    'CAI Certification',
    'Ayurveda Knowledge Center',
    'Direct Ayurvedic Consultation'
  ],
  alternates: {
    canonical: 'https://www.ayurwed.com/about',
  },
  openGraph: {
    title: 'About Us — Ancient Intelligence Meets Modern Wellness | AYURWED',
    description: 'Discover AYURWED: A unified Ayurvedic ecosystem featuring direct doctor listings with zero platform fees, complimentary AI clinical software for subscribed doctors, authentic e-commerce, and CAI certification.',
    url: 'https://www.ayurwed.com/about',
    siteName: 'AYURWED',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: 'https://www.ayurwed.com/icon.png',
        width: 512,
        height: 512,
        alt: 'About AYURWED',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us — Ancient Intelligence Meets Modern Wellness | AYURWED',
    description: 'Discover how AYURWED bridges ancient Ayurvedic wisdom and modern AI technology across healthcare, e-commerce, and education.',
    images: ['https://www.ayurwed.com/icon.png'],
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#fdf6e3] dark:bg-background text-brand-green-dark dark:text-foreground">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-28 sm:pb-32 bg-gradient-to-b from-brand-green/5 via-transparent to-transparent">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand-gold/15 rounded-full blur-3xl"></div>
          <div className="absolute top-48 -left-24 w-80 h-80 bg-brand-green/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto layout-padding-minimal text-center relative z-10 space-y-6">
          <div className="flex justify-center mb-6">
            <img
              src="/ayurwed.webp"
              alt="AYURWED Logo"
              className="h-44 sm:h-60 w-auto object-contain drop-shadow-md"
            />
          </div>

          <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold-dark px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold uppercase tracking-widest border border-brand-gold/30">
            <Sparkles className="h-4 w-4" /> Redefining Ayurvedic Healthcare
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-brand-green tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Ancient Intelligence <br />
            <span className="text-brand-gold relative">
              Powered by Modern Innovation
              <svg className="absolute w-full h-3 -bottom-2 left-0 text-brand-gold/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="transparent"/>
              </svg>
            </span>
          </h1>
          
          <p className="text-base sm:text-xl text-brand-foreground/80 max-w-3xl mx-auto leading-relaxed pt-2 font-medium">
            AYURWED is an integrated Ayurvedic ecosystem bridging verified doctor discovery with zero platform fees, clinical AI prescription software for practitioners, authentic e-commerce, and world-class CAI certification.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link 
              href="/doctors" 
              className="btn-green px-7 py-3 rounded-full text-sm font-bold shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Stethoscope className="h-4 w-4" /> Find Doctors (Zero Fee)
            </Link>
            <Link 
              href="/shop" 
              className="btn-gold px-7 py-3 rounded-full text-sm font-bold shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <ShoppingBag className="h-4 w-4" /> Explore Ayurvedic Store
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Core Pillars of AYURWED */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto layout-padding-minimal space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-brand-gold-dark">Unified Ecosystem</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-green">The 4 Pillars of AYURWED</h2>
            <p className="text-brand-foreground/75 text-sm sm:text-base leading-relaxed">
              We have redesigned our platform to remove intermediaries, empower independent clinical practitioners, and make authentic Ayurveda accessible to all.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Pillar 1: Doctor Listing */}
            <div className="bg-[#fdf6e3] dark:bg-background border border-brand-green/20 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-extrabold text-brand-green">Independent Doctor Directory</h3>
                <p className="text-xs text-brand-foreground/75 leading-relaxed">
                  We list verified, certified Ayurvedic doctors. Patients can browse profiles and directly contact doctors via phone, WhatsApp, or clinic visit with <strong>zero platform consultation fees</strong>.
                </p>
              </div>
              <div className="pt-6 border-t border-brand-green/10 mt-6">
                <span className="text-[11px] font-black text-brand-green flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-brand-gold" /> 100% Free for Patients
                </span>
              </div>
            </div>

            {/* Pillar 2: Clinical AI Software */}
            <div className="bg-[#fdf6e3] dark:bg-background border border-brand-green/20 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 text-brand-gold-dark flex items-center justify-center">
                  <Laptop className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-extrabold text-brand-green">Clinical AI Software</h3>
                <p className="text-xs text-brand-foreground/75 leading-relaxed">
                  Subscribed doctors receive our proprietary AI diagnosis assistant and digital prescription generator complimentary throughout their subscription period to modernize their clinic practice.
                </p>
              </div>
              <div className="pt-6 border-t border-brand-green/10 mt-6">
                <span className="text-[11px] font-black text-brand-green flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-brand-gold" /> Included with Subscription
                </span>
              </div>
            </div>

            {/* Pillar 3: Authentic E-Commerce */}
            <div className="bg-[#fdf6e3] dark:bg-background border border-brand-green/20 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center">
                  <Store className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-extrabold text-brand-green">Ayurvedic Marketplace</h3>
                <p className="text-xs text-brand-foreground/75 leading-relaxed">
                  A premier marketplace selling our exclusive <strong>AYURWED branded formulations</strong> alongside authentic classical products from renowned Ayurvedic manufacturers across India.
                </p>
              </div>
              <div className="pt-6 border-t border-brand-green/10 mt-6">
                <span className="text-[11px] font-black text-brand-green flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-brand-gold" /> 100% Quality Verified
                </span>
              </div>
            </div>

            {/* Pillar 4: CAI Academy & Knowledge */}
            <div className="bg-[#fdf6e3] dark:bg-background border border-brand-green/20 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all duration-300">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-gold/15 text-brand-gold-dark flex items-center justify-center">
                  <Award className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-extrabold text-brand-green">CAI Academy & Articles</h3>
                <p className="text-xs text-brand-foreground/75 leading-relaxed">
                  Offering the Certificate in Ancient Intelligence (CAI) for clinical practitioners, plus a comprehensive Knowledge Center of classical wisdom, herb profiles, and wellness guides.
                </p>
              </div>
              <div className="pt-6 border-t border-brand-green/10 mt-6">
                <span className="text-[11px] font-black text-brand-green flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-brand-gold" /> Classical Wisdom + AI
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Detailed Breakdown: Direct Care & No Platform Fees */}
      <section className="py-20 bg-brand-green text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        
        <div className="max-w-7xl mx-auto layout-padding-minimal relative z-10 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/10 text-brand-gold px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                <HeartHandshake className="h-4 w-4" /> Patient-First Model
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                No Intermediaries. Direct Doctor-Patient Trust.
              </h2>
              <p className="text-brand-green-light text-base sm:text-lg leading-relaxed">
                We have eliminated the traditional online consultation middleman model. Instead of charging patients a booking commission or holding patient fees, we operate a transparent directory:
              </p>
              
              <div className="space-y-3 pt-2">
                {[
                  { title: 'Zero Platform Fee for Patients', desc: 'Patients can search doctors by specialty, city, experience, or rating and contact them directly without paying any fee to AYURWED.' },
                  { title: 'Independent Doctor Practice', desc: 'Doctors retain 100% of their consultation fees and communicate directly with patients according to their own clinical schedule.' },
                  { title: 'Subscription Model for Doctors', desc: 'Doctors pay a flat subscription fee to be listed in our verified directory and receive our state-of-the-art AI clinical prescription software at zero extra cost.' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-black/20 p-4 rounded-2xl border border-white/10">
                    <CheckCircle2 className="h-5 w-5 text-brand-gold shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-brand-gold">{item.title}</h4>
                      <p className="text-xs text-brand-green-light mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 bg-card dark:bg-card text-card-foreground rounded-3xl p-8 sm:p-10 shadow-2xl border border-white/10 space-y-6">
              <div className="flex items-center gap-3 border-b border-border pb-4">
                <div className="p-3 bg-brand-green/10 text-brand-green rounded-2xl">
                  <Laptop className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-brand-green">Clinical AI Software</h3>
                  <p className="text-xs text-muted-foreground font-semibold">Complimentary with Doctor Subscription</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
                When an Ayurvedic practitioner subscribes to the AYURWED directory, they unlock full access to our clinical suite:
              </p>

              <div className="space-y-3">
                {[
                  'Intelligent Prakriti & Dosha symptom analysis assistance',
                  'Classical indication matching from ancient Ayurvedic treatises',
                  'Herb-drug interaction and contraindication warnings',
                  'Instant digital prescription issuance with verified clinic branding',
                  'Complete patient history and longitudinal treatment tracking',
                  'Continuous software updates throughout the subscription period'
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs font-semibold text-foreground/85">
                    <div className="w-5 h-5 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-border">
                <Link
                  href="/register?role=CONSULTANT"
                  className="w-full btn-gold py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  Register as Doctor & Get Software <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. E-Commerce: AYURWED Branded & Multibrand Marketplace */}
      <section className="py-20 bg-[#fdf6e3] dark:bg-background">
        <div className="max-w-7xl mx-auto layout-padding-minimal space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-brand-gold-dark">Authentic Ayurvedic Store</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-green">Pure Formulations, Delivered to Your Door</h2>
            <p className="text-brand-foreground/75 text-sm sm:text-base leading-relaxed">
              AYURWED operates a dedicated e-commerce store bringing together authentic in-house Ayurvedic formulations alongside trusted products from India&apos;s most reputed classical manufacturers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-5 hover:border-brand-gold/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-brand-gold/20 text-brand-gold-dark flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-brand-green">AYURWED Branded Formulations</h3>
              <p className="text-xs sm:text-sm text-brand-foreground/75 leading-relaxed">
                Formulated using traditional Ayurvedic extraction techniques, organic herbs, and validated classical principles. Every batch of our proprietary remedies undergoes rigorous quality checks for purity and potency.
              </p>
              <ul className="space-y-2 text-xs text-brand-foreground/80 pt-2 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-gold shrink-0" /> Zero synthetic fillers or artificial preservatives</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-gold shrink-0" /> Ethically sourced medicinal herbs and botanicals</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-gold shrink-0" /> Standardized potency and classical authenticity</li>
              </ul>
            </div>

            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-5 hover:border-brand-green/40 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-brand-green/10 text-brand-green flex items-center justify-center">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-extrabold text-brand-green">Leading Manufacturer Products</h3>
              <p className="text-xs sm:text-sm text-brand-foreground/75 leading-relaxed">
                In addition to our branded catalog, we partner with time-honored Ayurvedic pharmacies and GMP-certified manufacturers to offer a comprehensive range of classical churnas, asavas, arishtas, and wellness supplements.
              </p>
              <ul className="space-y-2 text-xs text-brand-foreground/80 pt-2 font-medium">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" /> Formulations from India&apos;s most reputed Ayurvedic brands</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" /> Strict batch verification and genuine manufacturer seals</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-brand-green shrink-0" /> Pan-India doorstep delivery with secure checkout</li>
              </ul>
            </div>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 btn-green px-8 py-3.5 rounded-full text-sm font-bold shadow-md hover:shadow-lg"
            >
              Browse Products in the Store <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Academy & Knowledge Center */}
      <section className="py-20 bg-card border-t border-border">
        <div className="max-w-7xl mx-auto layout-padding-minimal space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-stretch">
            
            {/* Academy Box */}
            <div className="bg-[#fdf6e3] dark:bg-background border border-brand-green/20 rounded-[2.5rem] p-8 sm:p-10 flex flex-col justify-between shadow-sm">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-brand-gold/20 text-brand-gold-dark rounded-2xl">
                    <Award className="h-6 w-6" />
                  </div>
                  <span className="bg-brand-green text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    CAI Certification
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-green">AYURWED Academy</h3>
                <p className="text-xs sm:text-sm text-brand-foreground/80 leading-relaxed">
                  Our flagship program, <strong>Certificate in Ancient Intelligence (CAI)</strong>, trains doctors, interns, and healthcare professionals to master the fusion of authentic Ayurveda and modern AI diagnostic technologies.
                </p>
                <div className="space-y-2 text-xs font-semibold text-brand-foreground/85">
                  <p className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-gold" /> Comprehensive multi-module video & text curriculum</p>
                  <p className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-gold" /> Hands-on training on AI clinical prescription tools</p>
                  <p className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-gold" /> Verified digital certificate and credential badge</p>
                </div>
              </div>

              <div className="pt-8 border-t border-brand-green/10 mt-6">
                <Link
                  href="/academy"
                  className="btn-gold px-6 py-3 rounded-full text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shadow"
                >
                  Explore Academy & Enroll <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Knowledge Center Box */}
            <div className="bg-[#fdf6e3] dark:bg-background border border-brand-green/20 rounded-[2.5rem] p-8 sm:p-10 flex flex-col justify-between shadow-sm">
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-brand-green/10 text-brand-green rounded-2xl">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <span className="bg-brand-gold text-brand-green text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Open Access
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-green">Ayurveda Knowledge Center</h3>
                <p className="text-xs sm:text-sm text-brand-foreground/80 leading-relaxed">
                  A public repository of researched articles, seasonal dietary recommendations (Ritucharya), herb monographs, and clinical case studies crafted to educate users and deepen practitioners&apos; understanding.
                </p>
                <div className="space-y-2 text-xs font-semibold text-brand-foreground/85">
                  <p className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-green" /> Classical Dravyaguna (materia medica) guides</p>
                  <p className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-green" /> Lifestyle tips for Vata, Pitta, and Kapha balances</p>
                  <p className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-green" /> Evidence-based insights on herbal formulations</p>
                </div>
              </div>

              <div className="pt-8 border-t border-brand-green/10 mt-6">
                <Link
                  href="/knowledge"
                  className="btn-green px-6 py-3 rounded-full text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shadow"
                >
                  Read Knowledge Articles <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 6. Commitment, Vision, Mission, Promise */}
      <section className="py-20 bg-brand-green text-white border-t border-brand-green-border">
        <div className="max-w-7xl mx-auto layout-padding-minimal text-center space-y-16">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <Award className="h-8 w-8 text-brand-gold mx-auto" />
              <h4 className="text-lg font-bold text-white">Our Commitment</h4>
              <p className="text-xs text-brand-green-light leading-relaxed">
                Empower doctors with smart clinical software, offer patients direct consultation access with zero commission, and supply authentic formulations.
              </p>
            </div>

            <div className="space-y-3">
              <Target className="h-8 w-8 text-brand-gold mx-auto" />
              <h4 className="text-lg font-bold text-white">Our Vision</h4>
              <p className="text-xs text-brand-green-light leading-relaxed">
                To build India&apos;s most trusted digital ecosystem for Ayurveda by uniting classical ancient intelligence, clinical software, and pure herbal products.
              </p>
            </div>

            <div className="space-y-3">
              <Cpu className="h-8 w-8 text-brand-gold mx-auto" />
              <h4 className="text-lg font-bold text-white">Our Mission</h4>
              <p className="text-xs text-brand-green-light leading-relaxed">
                Preserve timeless Vedic healing, support independent Ayurvedic practitioners, and provide consumers transparent access to genuine wellness.
              </p>
            </div>
          </div>

          <div className="bg-black/20 border border-white/10 rounded-[2rem] p-8 sm:p-12 max-w-4xl mx-auto space-y-6">
            <Sparkles className="h-10 w-10 text-brand-gold mx-auto" />
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Our Guiding Promise</h3>
            <p className="text-base sm:text-lg text-brand-green-light italic max-w-2xl mx-auto leading-relaxed">
              &quot;At AYURWED, technology supports and empowers—it never replaces human expertise. Ancient Intelligence guides. Certified Doctors decide. Patients come first.&quot;
            </p>
            <p className="text-xs text-brand-gold font-bold uppercase tracking-widest">The AYURWED Standard of Care</p>
          </div>
          
        </div>
      </section>

    </div>
  );
}
