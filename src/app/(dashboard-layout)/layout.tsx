'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Users,
  CheckSquare,
  BookOpen,
  Leaf,
  ChevronRight,
  Sparkles,
  Award,
  Tag,
  FolderTree,
  Package,
  BarChart3,
  MessageSquare,
  Building2,
  Star,
  UserCircle,
  Inbox,
  HeartPulse,
  ShoppingBag,
  ShoppingCart,
  Mail,
  LayoutDashboard,
  Activity,
  Layers,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import NotificationDropdown from '@/components/layout/NotificationDropdown';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  React.useEffect(() => {
    if (session?.user?.role === 'CONSUMER') {
      fetch('/api/consumer/courses/check')
        .then((res) => res.json())
        .then((data) => {
          if (data.enrolled) {
            setIsEnrolled(true);
          }
        })
        .catch((err) => console.error('Error checking course enrollment:', err));
    }
  }, [session]);

  const handleToggle = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopCollapsed(!desktopCollapsed);
    }
  };

  // Role check fallback
  const role = session?.user?.role || 'CONSUMER';
  const name = session?.user?.name || 'User';

  const menuItems = {
    CONSUMER: [
      { name: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
      { name: 'My Shop Orders', href: '/user/myorders', icon: Package },
      ...(isEnrolled ? [{ name: 'My CAI Course', href: '/user/cai', icon: Award }] : []),
      { name: 'My Profile', href: '/user/profile', icon: UserCircle },
    ],
    CONSULTANT: [
      { name: 'Dashboard', href: '/consultant/dashboard', icon: LayoutDashboard },
      { name: 'My Shop Orders', href: '/user/myorders', icon: Package },
      ...(isEnrolled ? [{ name: 'My CAI Course', href: '/user/cai', icon: Award }] : []),
      { name: 'My Profile', href: '/user/profile', icon: UserCircle },
    ],
    MANUFACTURER: [
      ...(isEnrolled ? [{ name: 'My CAI Course', href: '/user/cai', icon: Award }] : []),
    ],

    ADMIN: [
      { name: 'Dashboard', href: '/admin/dashboard', icon: BarChart3 },
      { name: 'Shop Orders', href: '/admin/shop-orders', icon: ShoppingBag },
      { name: 'CAI Fee & Offer', href: '/admin/academy', icon: Award },
      ...(isEnrolled ? [{ name: 'My CAI Course', href: '/user/cai', icon: Award }] : []),
      { name: 'Carousel', href: '/admin/carousels', icon: Sparkles },
      { name: 'Categories', href: '/admin/categories', icon: Layers },
      { name: 'Symptoms', href: '/admin/symptoms', icon: Activity },
      { name: 'Brands', href: '/admin/brands', icon: Building2 },
      { name: 'Products', href: '/admin/products', icon: ShoppingCart },
      { name: 'Shop Coupons', href: '/admin/coupons', icon: Tag },
      { name: 'Enquiries', href: '/admin/enquiries', icon: Inbox },
      { name: 'Newsletter Subs', href: '/admin/newsletter', icon: Mail },
      { name: 'Testimonials', href: '/admin/testimonials', icon: MessageSquare },
    ],
  };

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'ADMIN': return 'Administrator';
      case 'CONSULTANT': return 'Certified Doctor';
      default: return 'Wellness Seeker';
    }
  };

  const currentMenu = menuItems[role as keyof typeof menuItems] || menuItems.CONSUMER;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-card text-brand-green justify-between border-r border-border">
      {/* Brand & Menu */}
      <div className="flex flex-col flex-1 overflow-hidden space-y-6">
        <div className="p-6 border-b border-border flex-shrink-0">
          <Link href="/" className="flex items-center">
            <img
              src="/ayurwed-logo-2.webp"
              alt="AYURWED"
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 hover:scale-105"
            />
          </Link>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1.5 pb-4">
          {currentMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-brand-gold text-brand-green dark:text-black font-bold shadow'
                    : 'text-brand-foreground/70 hover:bg-muted hover:text-brand-foreground'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile & Logout Footer */}
      <div className="p-4 border-t border-border space-y-4">
        {/* Profile Footer Link */}
        {(role !== 'ADMIN') && (
          <Link
            href="/user/profile"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              pathname === '/user/profile'
                ? 'bg-brand-gold text-brand-green dark:text-black font-bold shadow'
                : 'text-brand-foreground/70 hover:bg-muted hover:text-brand-foreground'
            }`}
          >
            <UserCircle className="h-5 w-5 flex-shrink-0" />
            <span>My Profile</span>
          </Link>
        )}

        {/* Admin User Management Footer Link */}
        {role === 'ADMIN' && (
          <Link
            href="/admin/users"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              pathname === '/admin/users'
                ? 'bg-brand-gold text-brand-green dark:text-black font-bold shadow'
                : 'text-brand-foreground/70 hover:bg-muted hover:text-brand-foreground'
            }`}
          >
            <Users className="h-5 w-5 flex-shrink-0" />
            <span>User Management</span>
          </Link>
        )}

        {/* Profile Card */}
        <div className="px-4 py-3 bg-muted border border-border rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-brand-gold text-brand-green dark:text-black font-bold rounded-full flex items-center justify-center text-sm shadow flex-shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-brand-foreground truncate">{name}</p>
              <p className="text-[10px] font-semibold text-brand-foreground/70 uppercase tracking-wider">
                {getRoleLabel(role)}
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={async () => {
            await signOut({ redirect: false });
            window.location.href = '/';
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 text-left"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block transition-all duration-300 flex-shrink-0 bg-card overflow-hidden h-full ${
        desktopCollapsed ? 'w-0 border-r-0' : 'w-64 border-r border-border'
      }`}>
        <div className="w-64 h-full">
          {sidebarContent}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">
        {/* Dashboard Top Header */}
        <header className="bg-card border-b border-border h-16 flex items-center justify-between layout-padding-minimal flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggle}
              className="p-2 text-brand-green hover:bg-brand-green-light rounded-xl"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-brand-foreground/60">
              <Link href="/" className="hover:text-brand-green">Home</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-brand-green font-bold">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-brand-gold/15 text-brand-gold-dark font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {role} Workspace
            </span>
            <NotificationDropdown />
            <ThemeToggle />
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-grow layout-padding-minimal-all overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Overlay mask */}
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer container */}
          <div className="relative w-64 max-w-xs flex-col flex bg-card h-full shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 bg-brand-green-light rounded-full text-brand-green hover:bg-brand-gold focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </div>
  );
}
