'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function HeroCard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      {/* Tagline/badge above the card */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide border border-brand-gold/30">
          <Sparkles className="h-4 w-4 animate-pulse-slow" />
          <span>CONNECTING HERITAGE WITH MODERN WELLNESS</span>
        </div>
      </div>

      {/* Brand-green-light Full-Width Card */}
      <div className="bg-brand-green-light rounded-[32px] sm:rounded-[48px] shadow-2xl overflow-hidden border border-brand-gold/15 w-full mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
          {/* Left Column: Brand & CTAs */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:pt-6 lg:pb-6 lg:px-16 flex flex-col justify-center space-y-6 text-center text-brand-green bg-brand-green-light">
            
            {/* Logo containing name, icon and slogan */}
            <div className="flex justify-center">
              <div className="max-w-[240px] sm:max-w-[280px] lg:max-w-[320px]">
                <img
                  src="/ayurwed.webp"
                  alt="AYURWED Logo"
                  className="w-full h-auto object-contain transition-transform duration-300 hover:scale-[1.02]"
                />
              </div>
            </div>

            <p className="text-base sm:text-lg text-brand-green/80 leading-relaxed font-medium max-w-2xl mx-auto">
              India's complete Ayurveda ecosystem connecting consumers, clinical consultants, premium manufacturers, and AI-driven personalized wellness.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-2">
              <Link
                href="/products"
                className="w-full sm:w-auto bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green px-8 py-4 rounded-full font-bold text-base transition-all duration-300 shadow-lg hover:shadow-xl text-center"
              >
                Explore Products
              </Link>
              <Link
                href="/consultants"
                className="w-full sm:w-auto border-2 border-brand-green text-brand-green hover:bg-brand-green hover:text-white px-8 py-4 rounded-full font-bold text-base transition-all duration-300 text-center"
              >
                Book Consultation
              </Link>
            </div>
          </div>

          {/* Right Column: Ayuri Assistant standing from the bottom side of the card */}
          <div className="lg:col-span-5 bg-brand-green-light relative overflow-hidden flex items-end justify-center border-t lg:border-t-0 lg:border-l border-brand-green-light/20">
            {/* Floating Ask Ayuri AI tag */}
            <div className="absolute top-6 right-6 bg-brand-green/10 backdrop-blur-sm border border-brand-green/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-brand-green flex items-center gap-1.5 z-20">
              <span className="inline-block h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
              <span>Ask Ayuri AI</span>
            </div>
            
            {/* Ayuri Image standing from the bottom side of the card */}
            <img
              src="/ayuri.webp"
              alt="Ayuri AI Assistant"
              className="h-[320px] sm:h-[380px] lg:h-[450px] w-auto object-contain relative z-10 transition-transform duration-500 hover:scale-[1.03] pointer-events-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
