'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, ShoppingBag } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Captured application error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-[#fdf6e3] dark:bg-background text-foreground">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <AlertCircle className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-brand-green">Something Went Wrong</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We encountered a temporary issue while loading this page. Please try refreshing or return to the home page.
          </p>
          {error?.digest && (
            <p className="text-[10px] text-muted-foreground/60 font-mono pt-1">
              Ref ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto btn-gold px-6 py-3 rounded-full text-xs font-black flex items-center justify-center gap-2 shadow hover:shadow-md transition-all cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" /> Try Again
          </button>

          <Link
            href="/"
            className="w-full sm:w-auto btn-green px-6 py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow hover:shadow-md transition-all"
          >
            <Home className="h-4 w-4" /> Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
