'use client';

import React, { useState, Suspense } from 'react';
import { signIn, signOut, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin/dashboard';

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
    toast.loading('Authenticating admin...');

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
        // Fetch session to check role
        const session = await getSession();
        
        if (session?.user?.role !== 'ADMIN') {
          toast.error('Access Denied: Administrator privileges required');
          await signOut({ redirect: false });
          setLoading(false);
          return;
        }

        toast.success('Welcome back to Ayurwed Admin Portal');
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-green/20 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3">
        <ThemeToggle />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block group">
            <img
              src="/ayurwed.webp"
              alt="AYURWED Logo"
              className="h-32 sm:h-36 w-auto object-contain mx-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>
          <div className="mt-4 flex items-center justify-center gap-2">
            <ShieldCheck className="h-5 w-5 text-brand-gold" />
            <span className="text-sm font-semibold tracking-widest text-brand-gold uppercase">
              Admin Portal
            </span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl py-8 px-4 shadow-2xl rounded-3xl sm:px-10">
          <h2 className="text-xl font-bold text-white text-center mb-6">
            Administrator Sign In
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="admin-email" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Admin Email
              </label>
              <div className="mt-1.5 relative">
                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ayurwed.com"
                  className="appearance-none block w-full px-10 py-3 border border-slate-700 rounded-2xl bg-slate-800/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent text-sm"
                />
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label htmlFor="admin-password" className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="mt-1.5 relative">
                <input
                  id="admin-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-10 py-3 border border-slate-700 rounded-2xl bg-slate-800/60 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-gold focus:border-transparent text-sm"
                />
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-gold hover:bg-yellow-400 text-slate-950 font-bold py-3.5 px-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <span>Sign In to Admin</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-slate-800 pt-6 text-center text-xs text-slate-400">
            <Link href="/login" className="inline-flex items-center gap-1.5 hover:text-brand-gold transition-colors font-medium">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Switch to User Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-brand-gold font-bold animate-pulse">Loading Admin Portal...</div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}
