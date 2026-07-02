'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Leaf, Lock, Mail, User, Phone, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'CONSUMER' | 'CONSULTANT'>('CONSUMER');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    toast.loading('Creating your account...');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, phone, password, role }),
      });

      const data = await res.json();
      toast.dismiss();

      if (res.ok) {
        toast.success('Account created! Logging you in...');
        
        // Log user in automatically
        const loginRes = await signIn('credentials', {
          email,
          password,
          redirect: false,
        });

        if (loginRes?.error) {
          router.push('/login');
        } else {
          router.push('/dashboard');
        }
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      toast.dismiss();
      toast.error('Something went wrong. Please try again.');
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
          <div className="text-center mb-8 space-y-4">
            <Link href="/" className="inline-block">
              <img
                src="/ayurwed.webp"
                alt="AYURWED Logo"
                className="h-40 sm:h-44 w-auto object-contain mx-auto transition-transform duration-300 hover:scale-[1.02]"
              />
            </Link>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-green">
              Begin Your Wellness Journey
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-brand-green uppercase tracking-wider">Full Name</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rohan Mehra"
                  className="appearance-none block w-full px-10 py-2.5 border border-brand-green-border/15 rounded-2xl bg-brand-green-light/40 focus:outline-none focus:ring-brand-gold focus:border-brand-gold text-sm"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-green" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-green uppercase tracking-wider">Email Address</label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rohan@example.com"
                  className="appearance-none block w-full px-10 py-2.5 border border-brand-green-border/15 rounded-2xl bg-brand-green-light/40 focus:outline-none focus:ring-brand-gold focus:border-brand-gold text-sm"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-green" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-green uppercase tracking-wider">Phone Number</label>
              <div className="mt-1 relative">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="appearance-none block w-full px-10 py-2.5 border border-brand-green-border/15 rounded-2xl bg-brand-green-light/40 focus:outline-none focus:ring-brand-gold focus:border-brand-gold text-sm"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-green" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-green uppercase tracking-wider">Password</label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-10 py-2.5 border border-brand-green-border/15 rounded-2xl bg-brand-green-light/40 focus:outline-none focus:ring-brand-gold focus:border-brand-gold text-sm"
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-green" />
              </div>
            </div>

            {/* Account Type Selection */}
            <div>
              <label className="block text-xs font-bold text-brand-green uppercase tracking-wider mb-2">Account Type</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { key: 'CONSUMER', label: 'User' },
                  { key: 'CONSULTANT', label: 'Doctor' },
                ] as const).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setRole(opt.key)}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold transition-all text-center ${
                      role === opt.key
                        ? 'bg-brand-green border-brand-green text-white shadow-sm'
                        : 'bg-card border-border text-brand-foreground/70'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-green hover:bg-brand-gold hover:text-brand-green text-white font-bold py-3 px-4 rounded-full shadow hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Register</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-4">
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
                onClick={() => {
                  document.cookie = `google_auth_role=${role}; path=/; max-age=600`; // valid for 10 minutes
                  signIn('google', { callbackUrl: '/dashboard' });
                }}
                className="w-full bg-card hover:bg-muted text-gray-700 font-bold py-3 px-4 rounded-full border border-border hover:border-gray-400 transition-all duration-300 flex items-center justify-center gap-3 shadow-sm text-sm"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google logo"
                  className="h-5 w-5"
                />
                <span>Sign up with Google</span>
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-brand-green-light pt-6 text-center text-xs text-brand-foreground/60">
            <p>
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-brand-gold hover:text-brand-green">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
