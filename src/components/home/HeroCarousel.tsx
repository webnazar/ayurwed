'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselItem {
  id: number;
  title: string;
  image: string;
  link: string | null;
}

export default function HeroCarousel({ carousels }: { carousels: CarouselItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carousels.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % carousels.length);
    }, 5000); // Auto-slide every 5 seconds
    return () => clearInterval(interval);
  }, [carousels.length]);

  if (!carousels || carousels.length === 0) return null;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? carousels.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % carousels.length);
  };

  return (
    <div className="w-full max-w-7xl mx-auto py-4 md:px-6 lg:px-8 md:py-6">
      <div className="relative w-full aspect-video bg-slate-100 overflow-hidden md:rounded-[2rem] lg:rounded-[2.5rem] md:shadow-2xl md:ring-1 md:ring-brand-green/10 group">
        {/* Slides */}
      <div 
        className="flex w-full h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {carousels.map((c) => (
          <div key={c.id} className="relative w-full h-full flex-shrink-0">
            {c.link ? (
              <Link href={c.link} className="block w-full h-full cursor-pointer">
                <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
              </Link>
            ) : (
              <img src={c.image} alt={c.title} className="w-full h-full object-cover" />
            )}
            {/* Optional subtle gradient overlay at bottom if text needs to be overlaid later */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {carousels.length > 1 && (
        <>
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-brand-gold"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
            {carousels.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex 
                    ? 'w-8 h-2.5 bg-brand-gold shadow-[0_0_10px_rgba(234,179,8,0.5)]' 
                    : 'w-2.5 h-2.5 bg-card/50 hover:bg-card/80'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
      </div>
    </div>
  );
}
