'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Leaf, Lock, Mail, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);
    toast.loading('Signing you in...');

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      toast.dismiss();

      if (res?.error) {
        toast.error(res.error || 'Authentication failed');
      } else {
        toast.success('Welcome back to Ayurwed!');
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error('Something went wrong during sign-in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-gold-light flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 border border-border shadow-xl rounded-3xl sm:px-10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <img
                src="/ayurwed.webp"
                alt="AYURWED Logo"
                className="h-40 sm:h-44 w-auto object-contain mx-auto transition-transform duration-300 hover:scale-[1.02]"
              />
            </Link>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-brand-green uppercase tracking-wider">
                Email address
              </label>
              <div className="mt-1 relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="appearance-none block w-full px-10 py-3 border border-brand-green-border/15 rounded-2xl bg-brand-green-light/40 placeholder-brand-foreground/30 focus:outline-none focus:ring-brand-gold focus:border-brand-gold text-sm"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-green" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-bold text-brand-green uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-10 py-3 border border-brand-green-border/15 rounded-2xl bg-brand-green-light/40 placeholder-brand-foreground/30 focus:outline-none focus:ring-brand-gold focus:border-brand-gold text-sm"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-green" />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-bold py-3.5 px-4 rounded-full shadow hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-brand-foreground/50 font-bold">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In Button */}
            <div>
              <button
                type="button"
                onClick={() => signIn('google', { callbackUrl })}
                className="w-full bg-card hover:bg-muted text-gray-700 font-bold py-3.5 px-4 rounded-full border border-border hover:border-gray-400 transition-all duration-300 flex items-center justify-center gap-3 shadow-sm"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google logo"
                  className="h-5 w-5"
                />
                <span>Sign in with Google</span>
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-brand-green-light pt-6 text-center text-xs text-brand-foreground/60">
            <p>
              New to Ayurwed?{' '}
              <Link href="/register" className="font-semibold text-brand-gold hover:text-brand-green">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-gold-light flex items-center justify-center">
        <div className="text-brand-green font-bold animate-pulse">Loading Ayurwed Login...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
