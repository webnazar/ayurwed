'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Award, HelpCircle, CheckCircle2 } from 'lucide-react';

export default function AcfpInfoCard() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gradient-to-br from-[#fdf6e3] to-white border border-brand-gold/30 rounded-3xl overflow-hidden shadow-sm transition-all duration-300">
      {/* Header (Trigger) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none hover:bg-brand-gold/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-brand-gold/20 p-2 rounded-xl text-brand-gold-dark">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-brand-green text-sm sm:text-base">
              What is an AYURWED Certified Consultant & Fulfillment Partner?
            </h4>
            <p className="text-[11px] text-brand-foreground/50 font-medium">
              Click to learn about this exclusive clinical designation
            </p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-brand-gold-dark" />
        ) : (
          <ChevronDown className="h-5 w-5 text-brand-gold-dark" />
        )}
      </button>

      {/* Content */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-[500px] border-t border-brand-gold/20' : 'max-h-0'
        }`}
      >
        <div className="p-6 space-y-4 text-sm text-brand-foreground/80 leading-relaxed">
          <p>
            <strong>AYURWED Certified Consultant & Fulfillment Partners (ACFP)</strong> are verified Ayurvedic practitioners who have successfully completed AYURWED certification, adopted the Ancient Intelligence Prescription Platform, and are capable of providing end-to-end patient care.
          </p>
          <div className="space-y-2.5 pt-2">
            <p className="font-bold text-brand-green text-xs uppercase tracking-wider">
              They provide:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Personalized Consultation',
                'AI-Assisted Prescription',
                'Preparation-Based Treatment',
                'Digital Patient Records',
                'Offline Clinical Practice',
                'Online Consultation',
                'Medicine Fulfillment',
                'Long-Term Follow-up'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-semibold text-brand-foreground/70">
                  <CheckCircle2 className="h-4 w-4 text-brand-gold flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-brand-foreground/50 border-t border-brand-green-light/20 pt-3">
            This designation represents AYURWED's commitment to quality, trust, and personalized Ayurvedic healthcare.
          </p>
        </div>
      </div>
    </div>
  );
}
