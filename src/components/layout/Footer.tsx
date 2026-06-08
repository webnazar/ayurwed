'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Leaf, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success('Thank you for subscribing to our newsletter!');
    setEmail('');
  };

  return (
    <footer className="bg-[#124220] text-brand-green-light border-t border-[#1a5c2e]/40 mt-auto">
      {/* Newsletter signup banner */}
      <div className="bg-brand-green border-b border-brand-green-border/20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-white text-lg sm:text-xl font-semibold">Join the Wellness Circle</h3>
            <p className="text-sm text-brand-green-light mt-1">Get natural remedies, seasonal wellness guides, and exclusive offers.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full md:w-auto max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              className="bg-brand-green-light/10 text-white placeholder-brand-green-light/50 border border-brand-green-border px-4 py-2.5 rounded-l-full focus:outline-none focus:border-brand-gold w-full min-w-[200px]"
              required
            />
            <button
              type="submit"
              className="bg-brand-gold hover:bg-white text-brand-green px-5 py-2.5 rounded-r-full font-semibold flex items-center gap-2 transition-colors duration-200"
            >
              <Send className="h-4 w-4" />
              <span>Subscribe</span>
            </button>
          </form>
        </div>
      </div>

      {/* Main footer directories */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand identity column */}
        <div className="md:col-span-1 space-y-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="bg-white p-0.5 rounded-full h-8 w-8 flex items-center justify-center shadow-sm">
              <img
                src="/icon.png"
                alt="AYURWED Icon"
                className="h-7 w-7 object-contain"
              />
            </div>
            <span className="text-xl font-bold tracking-wider text-white">AYURWED</span>
          </Link>
          <p className="text-sm text-brand-green-light/70 leading-relaxed">
            Ancient Wisdom • Modern Wellness. Connecting Indian heritage with modern clinical research for complete holistic health.
          </p>
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Get the Mobile App</span>
            <div className="flex gap-2">
              <a href="#app-download-ios"
                className="inline-flex items-center gap-1.5 bg-brand-green-light/10 hover:bg-brand-gold hover:text-brand-green text-brand-green-light text-[10px] font-bold px-3 py-1.5 rounded-xl border border-brand-green-border/20 transition-all duration-300">
                App Store
              </a>
              <a href="#app-download-android"
                className="inline-flex items-center gap-1.5 bg-brand-green-light/10 hover:bg-brand-gold hover:text-brand-green text-brand-green-light text-[10px] font-bold px-3 py-1.5 rounded-xl border border-brand-green-border/20 transition-all duration-300">
                Google Play
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold text-white uppercase tracking-wider block">Follow Us</span>
            <div className="flex items-center gap-3 flex-wrap">
              {/* YouTube */}
              <a href="https://youtube.com/@ayurwed" target="_blank" rel="noopener noreferrer"
                title="YouTube @ayurwed"
                className="text-brand-green-light/60 hover:text-red-400 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href="https://instagram.com/ayurwedoffcials" target="_blank" rel="noopener noreferrer"
                title="Instagram @ayurwedoffcials"
                className="text-brand-green-light/60 hover:text-pink-400 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
              {/* Facebook */}
              <a href="https://facebook.com/ayurwedofficial" target="_blank" rel="noopener noreferrer"
                title="Facebook ayurwedofficial"
                className="text-brand-green-light/60 hover:text-blue-400 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="https://linkedin.com/company/ayurwed" target="_blank" rel="noopener noreferrer"
                title="LinkedIn ayurwed"
                className="text-brand-green-light/60 hover:text-sky-400 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              {/* Blogger */}
              <a href="https://ayurwedofficial.blogspot.com" target="_blank" rel="noopener noreferrer"
                title="Blogger ayurwedofficial"
                className="text-brand-green-light/60 hover:text-orange-400 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.976 24H2.026C.9 24 0 23.1 0 21.976V2.026C0 .9.9 0 2.026 0h19.95C23.1 0 24 .9 24 2.026v19.95C24 23.1 23.1 24 21.976 24zM11.183 5.012H8.09c-2.357 0-4.27 1.913-4.27 4.27v5.448c0 2.357 1.913 4.27 4.27 4.27h7.82c2.357 0 4.27-1.913 4.27-4.27v-3.28c0-.834-.676-1.51-1.51-1.51h-.403c-.284-2.577-2.47-4.578-5.084-4.578zm2.318 9.283H8.498a.755.755 0 0 1 0-1.51h5.003a.755.755 0 0 1 0 1.51zm1.51-3.02H8.498a.755.755 0 0 1 0-1.51h6.513a.755.755 0 0 1 0 1.51z"/>
                </svg>
              </a>
              {/* Pinterest */}
              <a href="https://in.pinterest.com/ayurwedofficial" target="_blank" rel="noopener noreferrer"
                title="Pinterest ayurwedofficial"
                className="text-brand-green-light/60 hover:text-red-500 transition-colors duration-200">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Catalog links */}
        <div>
          <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Shop Products</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products?category=skincare" className="hover:text-brand-gold transition-colors">Skincare & Oils</Link></li>
            <li><Link href="/products?category=haircare" className="hover:text-brand-gold transition-colors">Hair Care & Tonics</Link></li>
            <li><Link href="/products?category=wellness-herbs" className="hover:text-brand-gold transition-colors">Wellness Capsules & Herbs</Link></li>
            <li><Link href="/products" className="hover:text-brand-gold transition-colors">All Formulations</Link></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Consultations</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/consultants" className="hover:text-brand-gold transition-colors">Find a Practitioner</Link></li>
            <li><Link href="/knowledge?type=herb" className="hover:text-brand-gold transition-colors">Herb Dictionary</Link></li>
            <li><Link href="/knowledge?type=diet" className="hover:text-brand-gold transition-colors">Dosha Diet Guides</Link></li>
            <li><Link href="/knowledge" className="hover:text-brand-gold transition-colors">Knowledge Center</Link></li>
          </ul>
        </div>

        {/* Contact info */}
        <div>
          <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Ayurwed India</h4>
          <ul className="space-y-2 text-sm text-brand-green-light/80">
            <li>AVS Complex, Green Hills road</li>
            <li>Kottakkal, Kerala, 676503</li>
            <li>Support: support@ayurwed.com</li>
            <li>Phone: +91 (1800) 233-4455</li>
          </ul>
        </div>
      </div>

      {/* Copyright info */}
      <div className="bg-[#0f381b] py-6 border-t border-brand-green-border/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-brand-green-light/50 gap-4">
          <p>© {new Date().getFullYear()} Ayurwed Ecosystem Platform. All Rights Reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-brand-gold">Terms of Service</a>
            <a href="#" className="hover:text-brand-gold">Privacy Policy</a>
            <a href="#" className="hover:text-brand-gold">Ayuri Bot Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
