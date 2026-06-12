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
  FolderTree,
  Package,
  BarChart3,
  MessageSquare,
  Building2,
  Star,
  UserCircle,
  Inbox,
  HeartPulse,
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

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
      { name: 'My Appointments', href: '/dashboard/consumer/appointments', icon: Calendar },
      { name: 'My Courses', href: '/dashboard/consumer/courses', icon: BookOpen },
      { name: 'My Profile', href: '/dashboard/consumer/profile', icon: UserCircle },
    ],
    CONSULTANT: [
      { name: 'Appointments Schedule', href: '/dashboard/consultant/schedule', icon: Calendar },
      { name: 'Availability Slots', href: '/dashboard/consultant/availability', icon: Settings },
      { name: 'My Profile', href: '/dashboard/consultant/profile', icon: UserCircle },
      { name: 'Subscription Plans', href: '/dashboard/consultant/plans', icon: Star },
    ],
    MANUFACTURER: [
      { name: 'My Products', href: '/dashboard/manufacturer/products', icon: Leaf },
      { name: 'My Profile', href: '/dashboard/manufacturer/profile', icon: UserCircle },
      { name: 'Subscription Plans', href: '/dashboard/manufacturer/plans', icon: Star },
      { name: 'Enquiries Received', href: '/dashboard/manufacturer/enquiries', icon: Inbox },
    ],
    ADMIN: [
      { name: 'Dashboard', href: '/dashboard/admin/stats', icon: BarChart3 },
      { name: 'Carousel Master', href: '/dashboard/admin/carousels', icon: Sparkles },
      { name: 'User Management', href: '/dashboard/admin/users', icon: Users },
      { name: 'Category Master', href: '/dashboard/admin/categories', icon: FolderTree },
      { name: 'Indication Master', href: '/dashboard/admin/indications', icon: HeartPulse },
      { name: 'Product Master', href: '/dashboard/admin/products', icon: Package },
      { name: 'Orders Management', href: '/dashboard/admin/orders', icon: ShoppingBag },
      { name: 'Product Approvals', href: '/dashboard/admin/approvals', icon: CheckSquare },
      { name: 'Featured & Sponsored', href: '/dashboard/admin/featured', icon: Star },
      { name: 'Enquiries', href: '/dashboard/admin/enquiries', icon: Inbox },
      { name: 'Testimonials', href: '/dashboard/admin/testimonials', icon: MessageSquare },
    ],
  };

  const getRoleLabel = (r: string) => {
    switch (r) {
      case 'ADMIN': return 'Administrator';
      case 'CONSULTANT': return 'Certified Doctor';
      case 'MANUFACTURER': return 'Manufacturer';
      default: return 'Wellness Seeker';
    }
  };

  const currentMenu = menuItems[role as keyof typeof menuItems] || menuItems.CONSUMER;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white text-brand-green justify-between border-r border-brand-green-border/10">
      {/* Brand & Menu */}
      <div className="flex flex-col flex-1 overflow-hidden space-y-6">
        <div className="p-6 border-b border-brand-green-border/20 flex-shrink-0">
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
                    ? 'bg-brand-gold text-brand-green font-bold shadow'
                    : 'text-brand-green/70 hover:bg-brand-green-light/50 hover:text-brand-green'
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
      <div className="p-4 border-t border-brand-green-border/20 space-y-4">
        {/* Profile Card */}
        <div className="px-4 py-3 bg-brand-green-light/50 border border-brand-green/10 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-brand-gold text-brand-green font-bold rounded-full flex items-center justify-center text-sm shadow flex-shrink-0">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-brand-green truncate">{name}</p>
              <p className="text-[10px] font-semibold text-brand-green/70 uppercase tracking-wider">
                {getRoleLabel(role)}
              </p>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 text-left"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-brand-gold-light flex overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block transition-all duration-300 flex-shrink-0 bg-white overflow-hidden h-full ${
        desktopCollapsed ? 'w-0 border-r-0' : 'w-64 border-r border-brand-green-border/10'
      }`}>
        <div className="w-64 h-full">
          {sidebarContent}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 h-full overflow-hidden">
        {/* Dashboard Top Header */}
        <header className="bg-white border-b border-brand-green-border/10 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggle}
              className="p-2 text-brand-green hover:bg-brand-green-light rounded-xl"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-brand-foreground/60">
              <Link href="/" className="hover:text-brand-green">Storefront</Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-brand-green font-bold">Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs bg-brand-gold/15 text-brand-gold-dark font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {role} Workspace
            </span>
          </div>
        </header>

        {/* Content Wrapper */}
        <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
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
          <div className="relative w-64 max-w-xs flex-col flex bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300">
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
