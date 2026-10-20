'use client';

import React from 'react';
import { Sparkles, MessageSquare, ArrowRight, ShieldCheck } from 'lucide-react';

export default function HeroCard() {
  const handleOpenAyuri = () => {
    const trigger = document.getElementById('ayuri-chat-widget-trigger');
    if (trigger) {
      trigger.click();
    } else {
      const widget = document.getElementById('ayuri-chat-widget');
      if (widget) widget.classList.remove('hidden');
    }
  };

  return (
    <div className="max-w-7xl mx-auto layout-padding-minimal relative z-10">
      <div className="bg-gradient-to-br from-brand-green-light/80 via-brand-green-light/40 to-brand-gold-light/30 dark:from-brand-green/20 dark:via-card dark:to-brand-gold/10 rounded-[32px] sm:rounded-[44px] shadow-xl overflow-hidden border border-brand-green/20 dark:border-brand-gold/20 w-full mx-auto relative">
        {/* Subtle Decorative Background Blobs */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-brand-green/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 right-1/4 w-72 h-72 bg-brand-gold/15 rounded-full blur-2xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch relative z-10">
          {/* Left Content Column */}
          <div className="lg:col-span-7 p-6 sm:p-10 lg:p-12 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Top Tag & Logo Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 bg-brand-green/10 text-brand-green px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider border border-brand-green/15">
                  <Sparkles className="h-3.5 w-3.5 text-brand-gold fill-brand-gold" />
                  <span>Meet Ayuri — Official AI Guide</span>
                </span>

                <div className="flex items-center gap-1.5 text-[11px] font-bold text-foreground/50">
                  <ShieldCheck className="h-3.5 w-3.5 text-brand-green" />
                  <span>Classical &amp; Clinically Grounded</span>
                </div>
              </div>

              {/* Main Heading */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-green tracking-tight leading-tight">
                Instant Ayurvedic Wisdom, Tailored to You
              </h2>

              {/* Ecosystem Narrative */}
              <p className="text-sm sm:text-base text-foreground/80 leading-relaxed font-medium">
                India&apos;s complete Ayurveda ecosystem connecting consumers, clinical consultants, and AI-driven personalized wellness based on custom formulations of generic extracts, powders, capsules, and tablets.
              </p>

              {/* Practical Guidance */}
              <p className="text-xs sm:text-sm text-foreground/60 leading-relaxed">
                Not sure which classical formulation matches your body constitution? Ask Ayuri about herbal ingredients, dosage schedules, lifestyle guidelines, and get instant personalized clarity.
              </p>
            </div>

            {/* Quick Suggestions & CTA */}
            <div className="space-y-4 pt-2 border-t border-brand-green/15 dark:border-brand-gold/15">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold text-foreground/50 uppercase tracking-wide">Popular queries:</span>
                {[
                  'Best herbs for gut health',
                  'Triphala daily dosage',
                  'Immunity boosters',
                ].map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={handleOpenAyuri}
                    className="text-[11px] font-bold bg-card/80 hover:bg-brand-green hover:text-white border border-border hover:border-brand-green px-3 py-1 rounded-full transition-all text-foreground/70 active:scale-95 shadow-2xs"
                  >
                    &ldquo;{prompt}&rdquo;
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <button
                  type="button"
                  onClick={handleOpenAyuri}
                  className="bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-extrabold px-7 py-3.5 rounded-full text-sm sm:text-base flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 group"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat With Ayuri</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <div className="flex items-center gap-2 text-xs font-semibold text-foreground/60 px-2 justify-center sm:justify-start">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Always available • Free Ayurvedic AI Advisor</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Visual Column */}
          <div className="lg:col-span-5 relative flex items-end justify-center overflow-hidden border-t lg:border-t-0 lg:border-l border-brand-green/15 dark:border-brand-gold/15 bg-gradient-to-t from-brand-green-light/40 to-transparent">
            {/* Floating Top Badge */}
            <div className="absolute top-5 right-5 z-20">
              <button
                type="button"
                onClick={handleOpenAyuri}
                className="bg-card/90 hover:bg-brand-green hover:text-white backdrop-blur-md border border-brand-green/20 px-3.5 py-1.5 rounded-full text-xs font-extrabold text-brand-green flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Ask Ayuri AI</span>
              </button>
            </div>

            {/* Ayurwed Watermark Logo */}
            <div className="absolute top-6 left-6 max-w-[130px] opacity-40 pointer-events-none hidden sm:block">
              <img
                src="/ayurwed.webp"
                alt="AYURWED Logo"
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Ayuri Character Illustration */}
            <img
              src="/ayuri.webp"
              alt="Ayuri AI Assistant"
              className="h-[300px] sm:h-[380px] lg:h-[430px] w-auto object-contain object-bottom relative z-10 transition-transform duration-500 hover:scale-[1.02] pointer-events-none drop-shadow-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
