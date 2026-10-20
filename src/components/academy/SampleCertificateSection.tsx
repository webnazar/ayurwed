'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Award, Download, Eye, ShieldCheck, CheckCircle2, FileText, Sparkles, X, ZoomIn } from 'lucide-react';

export default function SampleCertificateSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="py-24 bg-[#fdf6e3] dark:bg-background border-t border-border relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-green/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto layout-padding-minimal relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-brand-gold/20 text-brand-gold-dark px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-brand-gold/30">
            <Award className="h-4 w-4" /> Recognized Qualification
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-green tracking-tight">
            Official Sample Certificate
          </h2>
          <p className="text-base sm:text-lg text-brand-foreground/80 leading-relaxed font-medium">
            Upon successful completion of the CAI program, graduates receive an official physical and digital credential authorizing them as a <strong className="text-brand-green">CAI Certified Doctor / Practitioner</strong> with complimentary access to the AI Prescription platform during their subscription period.
          </p>
        </div>

        {/* Main Certificate Card & Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Certificate Image Frame Container */}
          <div className="lg:col-span-7 group relative">
            <div className="relative rounded-3xl p-3 sm:p-5 bg-gradient-to-br from-brand-gold/30 via-brand-green/20 to-brand-gold/40 shadow-2xl border border-brand-gold/30 backdrop-blur-md transform transition-all duration-300 group-hover:scale-[1.01]">
              
              {/* Inner Card Frame */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-brand-gold/40 bg-card shadow-inner">
                <Image
                  src="/academy/ayurwed-certificate.png"
                  alt="Official AYURWED Certificate in Ancient Intelligence (CAI) Sample"
                  width={1200}
                  height={850}
                  className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  priority
                />

                {/* Hover Overlay with Action Buttons */}
                <div className="absolute inset-0 bg-brand-green/40 opacity-0 group-hover:opacity-100 backdrop-blur-xs transition-opacity duration-300 flex items-center justify-center gap-4 p-4">
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-5 py-3 bg-white text-brand-green rounded-full font-bold text-sm shadow-xl hover:bg-brand-gold hover:text-brand-green-dark transition-all flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 duration-300"
                  >
                    <ZoomIn className="h-4 w-4" /> Full Screen Preview
                  </button>
                  <a
                    href="/academy/ayurwed-certificate.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    download="ayurwed-certificate-sample.pdf"
                    className="px-5 py-3 bg-brand-green text-white rounded-full font-bold text-sm shadow-xl hover:bg-brand-gold hover:text-brand-green-dark transition-all flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 duration-300"
                  >
                    <Download className="h-4 w-4" /> Download PDF
                  </a>
                </div>
              </div>

              {/* Verified Badge Overlay */}
              <div className="absolute -bottom-4 -right-4 bg-brand-green text-white px-4 py-2 rounded-2xl font-bold text-xs shadow-lg border-2 border-brand-gold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-brand-gold" />
                <span>Verified Credential</span>
              </div>
            </div>
          </div>

          {/* Certificate Features & CTA Details */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-2xl font-bold text-brand-green flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-brand-gold" /> Certificate Features
              </h3>

              <ul className="space-y-4">
                {[
                  {
                    title: 'Official CAI Designation',
                    desc: 'Grants the title of CAI Certified Doctor / Practitioner recognized across the AYURWED ecosystem.',
                  },
                  {
                    title: 'Verifiable Digital Seal & QR',
                    desc: 'Contains a unique tamper-proof ID code and QR link for instant online credential verification.',
                  },
                  {
                    title: 'Academic Council Authorization',
                    desc: 'Signed by the AYURWED Academic Board and Clinical AI Research Division.',
                  },
                  {
                    title: 'Prescription Software Privilege',
                    desc: 'Grants complimentary access to our AI Clinical Prescription Software during your active subscription period.',
                  },
                  {
                    title: 'High-Resolution Print & Digital Copy',
                    desc: 'Available as a physical framed diploma and instant downloadable PDF.',
                  },
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-green flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-sm text-brand-foreground">{feat.title}</h4>
                      <p className="text-xs text-brand-foreground/70 leading-relaxed mt-0.5">{feat.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex-1 py-3.5 px-4 bg-card border-2 border-brand-green text-brand-green rounded-2xl font-bold text-sm hover:bg-brand-green hover:text-white transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <Eye className="h-4 w-4" /> Preview Certificate
                </button>

                <a
                  href="/academy/ayurwed-certificate.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download="ayurwed-certificate-sample.pdf"
                  className="flex-1 py-3.5 px-4 bg-brand-green text-white rounded-2xl font-bold text-sm hover:bg-brand-gold hover:text-brand-green-dark transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="h-4 w-4" /> Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Preview Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative max-w-5xl w-full bg-card rounded-3xl overflow-hidden border border-border shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-brand-gold" />
                <h3 className="font-bold text-brand-green text-base sm:text-lg">
                  AYURWED Certificate Sample Preview
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href="/academy/ayurwed-certificate.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download="ayurwed-certificate-sample.pdf"
                  className="px-4 py-2 bg-brand-green text-white text-xs font-bold rounded-full hover:bg-brand-gold hover:text-brand-green transition-colors flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" /> Download PDF
                </a>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-muted text-foreground/60 hover:text-foreground transition-colors"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body Image */}
            <div className="p-4 sm:p-6 max-h-[80vh] overflow-y-auto flex items-center justify-center bg-muted/10">
              <Image
                src="/academy/ayurwed-certificate.png"
                alt="AYURWED Certificate High Resolution Preview"
                width={1600}
                height={1130}
                className="w-full h-auto rounded-xl shadow-lg border border-border"
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
