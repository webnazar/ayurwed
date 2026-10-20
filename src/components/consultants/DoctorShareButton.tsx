'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Copy, Check, X, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

interface DoctorShareButtonProps {
  doctorName: string;
  specialization?: string;
  className?: string;
  variant?: 'button' | 'icon' | 'outline';
}

export default function DoctorShareButton({
  doctorName,
  specialization = 'Ayurvedic Specialist',
  className = '',
  variant = 'button',
}: DoctorShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href);
    }
  }, []);

  const shareText = `Consult Dr. ${doctorName} (${specialization}) on AYURWED — Certified Ayurvedic Doctors Directory:`;

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `Dr. ${doctorName} | AYURWED`,
          text: shareText,
          url: shareUrl || (typeof window !== 'undefined' ? window.location.href : ''),
        });
        toast.success('Shared successfully!');
        setIsOpen(false);
      } catch (err) {
        // User cancelled or share failed, fallback to modal
      }
    } else {
      setIsOpen(true);
    }
  };

  const handleCopyLink = async () => {
    const url = shareUrl || window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Doctor profile link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      toast.error('Failed to copy link.');
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${shareText}\n${shareUrl}`);

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
      bg: 'bg-[#229ED9] hover:bg-[#1e8bc0]',
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.828.942z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {variant === 'icon' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`p-2 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95 shadow-sm inline-flex items-center justify-center ${className}`}
          title="Share Doctor Profile"
          aria-label="Share Doctor Profile"
        >
          <Share2 className="h-4 w-4" />
        </button>
      ) : variant === 'outline' ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-all active:scale-95 shadow-sm ${className}`}
          title="Share Doctor Profile"
        >
          <Share2 className="h-3.5 w-3.5 text-brand-green" />
          <span>Share</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-card border border-border hover:border-brand-green/40 hover:bg-brand-green/5 text-xs sm:text-sm font-bold text-brand-green shadow-sm hover:shadow transition-all active:scale-95 ${className}`}
          title="Share Doctor Profile"
        >
          <Share2 className="h-4 w-4 text-brand-green" />
          <span>Share Profile</span>
        </button>
      )}

      {/* Share Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div
            className="bg-card rounded-3xl p-6 sm:p-7 border border-border shadow-2xl w-full max-w-md space-y-6 animate-in zoom-in-95 duration-200 relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-brand-green/10 text-brand-green">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-title-primary">Share Doctor Profile</h3>
                  <p className="text-xs text-muted-foreground">Dr. {doctorName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick social share buttons */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Share via Social Media
              </span>
              <div className="grid grid-cols-5 gap-2.5">
                {socialLinks.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl ${item.bg} text-white shadow-sm hover:shadow-md transition-all active:scale-95 group`}
                    title={`Share on ${item.name}`}
                  >
                    <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
                    <span className="text-[10px] font-semibold tracking-tight leading-tight line-clamp-1">{item.name}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Direct Copy Link field */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                Profile Link
              </span>
              <div className="flex items-center gap-2 bg-muted/40 border border-border rounded-2xl p-1.5 pl-3">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="bg-transparent text-xs text-foreground flex-grow focus:outline-none select-all truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-green text-white hover:bg-brand-green/90 text-xs font-bold transition-all active:scale-95 flex-shrink-0 shadow-sm"
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

            {/* Native share sheet trigger if supported */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-border hover:bg-muted text-xs font-bold text-muted-foreground hover:text-foreground transition-all"
              >
                <Smartphone className="h-4 w-4" />
                <span>More sharing options...</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
