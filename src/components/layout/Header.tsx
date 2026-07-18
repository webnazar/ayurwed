'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User, Menu, X, LogOut, LayoutDashboard, ShoppingBag } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useCart } from '@/components/shop/CartContext';
import CartDrawer from '@/components/shop/CartDrawer';

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { totalItems, openCart } = useCart();

  // Hydration fix
  React.useEffect(() => setMounted(true), []); 

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Consult', href: '/doctors' },
    { name: 'Shop', href: '/shop' },
    { name: 'Academy', href: '/academy' },
    { name: 'Knowledge', href: '/knowledge' },
    { name: 'About', href: '/about' },
  ];

  const getDashboardLink = (role: string) => {
    switch (role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'CONSULTANT': return '/consultant/dashboard';
      default: return '/consumer/dashboard';
    }
  };

  return (
    <>
      <CartDrawer />
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md text-brand-green shadow-sm border-b border-border transition-all duration-300">
      <div className="max-w-7xl mx-auto layout-padding-minimal">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center group">
              <img
                src="/ayurwed-logo-2.webp"
                alt="AYURWED"
                className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navLinks.map((link) => {
              const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm lg:text-base font-medium transition-colors duration-200 hover:text-brand-gold py-2 ${
                    isActive ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-brand-green'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Shared Actions Container */}
          <div className="flex items-center space-x-4">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-6">
              <ThemeToggle />


              {session ? (
                <div className="flex items-center space-x-4">
                  {/* Cart Icon */}
                  <button onClick={openCart} className="relative p-2 text-brand-green hover:text-brand-gold transition-colors" title="Cart">
                    <ShoppingBag className="h-5 w-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">
                        {totalItems > 9 ? '9+' : totalItems}
                      </span>
                    )}
                  </button>
                  <Link
                    href={getDashboardLink(session.user?.role as string)}
                    className="flex items-center space-x-2 text-brand-green hover:text-brand-gold transition-colors duration-200"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    <span className="text-sm font-medium">{session.user?.name?.split(' ')[0]}</span>
                  </Link>
                  <button
                    onClick={async () => {
                      await signOut({ redirect: false });
                      window.location.href = '/';
                    }}
                    className="p-2 text-brand-green hover:text-red-400 transition-colors duration-200"
                    title="Sign Out"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-2 bg-brand-green text-white hover:bg-brand-gold hover:text-brand-green px-4 py-2 rounded-full font-medium transition-all duration-300 shadow hover:shadow-lg"
                >
                  <User className="h-5 w-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>

            {/* Mobile Actions */}
            <div className="flex md:hidden items-center space-x-2">
              <ThemeToggle />
              {/* Mobile Cart */}
              <button onClick={openCart} className="relative p-2 text-brand-green hover:text-brand-gold transition-colors">
                <ShoppingBag className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center">{totalItems > 9 ? '9+' : totalItems}</span>
                )}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-brand-green hover:text-brand-gold focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-brand-green dark:bg-card border-t border-brand-green-border px-4 pt-2 pb-6 space-y-4 shadow-inner">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-brand-green-light dark:text-foreground/80 hover:bg-brand-green-border/50 dark:hover:bg-muted hover:text-white dark:hover:text-foreground transition-all duration-200"
            >
              {link.name}
            </Link>
          ))}
          
          <div className="pt-4 border-t border-brand-green-border">
            {session ? (
              <div className="space-y-2">
                <div className="px-3 py-2 text-brand-green-light dark:text-foreground/60 text-sm font-semibold">
                  Signed in as: {session.user?.name}
                </div>
                <Link
                  href={getDashboardLink(session.user?.role as string)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-brand-green-light dark:text-foreground/80 hover:bg-brand-green-border/50 dark:hover:bg-muted hover:text-white dark:hover:text-foreground"
                >
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={async () => {
                    setMobileMenuOpen(false);
                    await signOut({ redirect: false });
                    window.location.href = '/';
                  }}
                  className="flex w-full items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-300 dark:text-red-400 hover:bg-brand-green-border/50 dark:hover:bg-red-500/10 hover:text-white dark:hover:text-red-500 text-left"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center space-x-2 bg-brand-gold text-brand-green dark:text-black hover:bg-brand-green hover:text-white dark:hover:bg-brand-gold/80 dark:hover:text-black px-4 py-2.5 rounded-full font-semibold text-center transition-all"
              >
                <User className="h-5 w-5" />
                <span>Login / Register</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
    </>
  );
}
