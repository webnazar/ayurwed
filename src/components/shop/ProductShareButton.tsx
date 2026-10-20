'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, X, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProductShareButtonProps {
  productName: string;
  category?: string;
  brandName?: string;
  sellingPrice?: number;
  className?: string;
  variant?: 'button' | 'icon';
}

export default function ProductShareButton({
  productName,
  category,
  brandName,
  sellingPrice,
  className = '',
  variant = 'button',
}: ProductShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  const priceText = sellingPrice ? ` for ₹${sellingPrice}` : '';
  const brandText = brandName ? ` by ${brandName}` : '';
  const shareText = `Check out ${productName}${brandText}${priceText} on AYURWED — Authentic Classical Ayurvedic Healthcare & Marketplace:`;

  const handleShareClick = async () => {
    const url = shareUrl || (typeof window !== 'undefined' ? window.location.href : 'https://www.ayurwed.com');
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${productName} | AYURWED`,
          text: shareText,
          url,
        });
        toast.success('Shared successfully!');
      } catch (err) {
        // Fallback to modal if native share was cancelled or failed
        setIsOpen(true);
      }
    } else {
      setIsOpen(true);
    }
  };

  const handleCopyLink = async () => {
    const url = shareUrl || (typeof window !== 'undefined' ? window.location.href : 'https://www.ayurwed.com');
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Product link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy link.');
    }
  };

  const currentUrl = shareUrl || 'https://www.ayurwed.com';
  const encodedUrl = encodeURIComponent(currentUrl);
  const encodedText = encodeURIComponent(`${shareText}\n${currentUrl}`);

  const socialLinks = [
    {
      name: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodedText}`,
      bg: 'bg-[#25D366] hover:bg-[#20ba5a]',
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      ),
    },
    {
      name: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'bg-[#1877F2] hover:bg-[#166fe5]',
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
    {
      name: 'X (Twitter)',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodedUrl}`,
      bg: 'bg-black hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700',
      icon: (
        <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bg: 'bg-[#0A66C2] hover:bg-[#095196]',
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      ),
    },
    {
      name: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(shareText)}`,
      bg: 'bg-[#0088cc] hover:bg-[#0077b5]',
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      ),
    },
    {
      name: 'Email',
      href: `mailto:?subject=${encodeURIComponent(`${productName} — Authentic Ayurveda on AYURWED`)}&body=${encodedText}`,
      bg: 'bg-emerald-700 hover:bg-emerald-800',
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={handleShareClick}
          aria-label={`Share ${productName}`}
          title="Share Product"
          className={`p-2.5 rounded-full bg-card hover:bg-brand-green/10 text-foreground/70 hover:text-brand-green border border-border hover:border-brand-green/30 transition-all shadow-xs flex items-center justify-center ${className}`}
        >
          <Share2 className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleShareClick}
          title="Share this product"
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card hover:bg-muted text-foreground/80 hover:text-brand-green border border-border text-xs font-bold transition-all shadow-xs active:scale-95 ${className}`}
        >
          <Share2 className="h-3.5 w-3.5 text-brand-green" />
          <span>Share</span>
        </button>
      )}

      {/* Share Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-md w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-brand-green/10 text-brand-green rounded-xl">
                  <Share2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-foreground">Share Product</h3>
                  <p className="text-xs text-foreground/50 line-clamp-1">{productName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-muted text-foreground/50 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Quick Share Grid */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/50 block">
                Share via Social & Apps
              </span>
              <div className="grid grid-cols-3 gap-2.5">
                {socialLinks.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${s.bg} text-white p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-transform hover:scale-105 shadow-xs`}
                  >
                    {s.icon}
                    <span className="text-[11px] font-extrabold">{s.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Copy Link Input Bar */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-foreground/50 block">
                Direct Product Link
              </span>
              <div className="flex items-center gap-2 bg-muted/60 border border-border rounded-2xl p-1.5 pl-3">
                <input
                  type="text"
                  readOnly
                  value={currentUrl}
                  className="bg-transparent text-xs text-foreground/80 focus:outline-none flex-1 truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-white" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
