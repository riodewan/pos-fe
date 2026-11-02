'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Building2,
  CheckCircle,
  Database,
  FileText,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ExternalLink,
  Store,
  Menu,
  X,
  Lock,
  ArrowLeft,
  Bell,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/common/PageLoader';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const ADMIN_NAV_ITEMS: NavItem[] = [
  {
    href: '/admin',
    label: 'Overview Platform',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/tenants',
    label: 'Kelola Tenant',
    icon: Building2,
  },
  {
    href: '/admin/approvals',
    label: 'Pusat Approval',
    icon: CheckCircle,
  },
  {
    href: '/admin/master-data',
    label: 'Data Master',
    icon: Database,
  },
  {
    href: '/admin/audit-logs',
    label: 'Log Audit Global',
    icon: FileText,
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isInternalAdmin, isLoading, logout } = useAuth();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  if (isLoading) {
    return <PageLoader text="Memverifikasi hak akses platform..." />;
  }

  // Access check: only internal admin allowed
  if (!isInternalAdmin && !user?.is_internal) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="size-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-4">
          <Lock className="size-8" />
        </div>
        <h1 className="text-xl font-bold mb-2">Akses Terbatas: Admin Internal</h1>
        <p className="text-xs text-neutral-400 max-w-md mb-6 leading-relaxed">
          Halaman ini khusus untuk Administrator Platform NemuPOS. Akun Anda saat ini ({user?.email || 'Guest'}) tidak memiliki otorisasi Admin Internal.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs font-bold transition-all shadow-lg"
        >
          <ArrowLeft className="size-4" />
          <span>Kembali ke Dashboard Toko</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-neutral-100 flex flex-col md:flex-row">
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col justify-between border-r border-neutral-800/80 bg-[#141414] shrink-0 sticky top-0 h-screen">
        <div>
          {/* Brand & Admin Badge */}
          <div className="p-5 border-b border-neutral-800/80">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-gradient-to-br from-[#FF5C38] to-[#E02626] flex items-center justify-center text-white shadow-lg shadow-orange-950/40">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <span className="text-sm font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  NemuPOS <span className="text-[#FF5C38]">Admin</span>
                </span>
                <span className="inline-block text-[9.5px] font-bold uppercase tracking-wider text-orange-400 bg-orange-950/50 border border-orange-800/40 px-1.5 py-0.2 rounded mt-0.5">
                  Internal Platform
                </span>
              </div>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="p-3 space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Menu Utama Platform
            </div>
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#FF5C38] text-white shadow-md shadow-orange-950/30'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Switcher: Jump to Tenant POS */}
        <div className="p-3 border-t border-neutral-800/80 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 text-xs text-neutral-300 hover:text-white transition-all group"
          >
            <div className="flex items-center gap-2">
              <Store className="size-4 text-[#FF5C38]" />
              <div className="text-left">
                <p className="font-bold text-[11px] leading-tight text-white">Dashboard Outlet</p>
                <p className="text-[10px] text-neutral-500 leading-tight">Buka Mode POS Toko</p>
              </div>
            </div>
            <ExternalLink className="size-3.5 text-neutral-500 group-hover:text-white" />
          </Link>

          <div className="flex items-center justify-between px-2 pt-1 text-[11px] text-neutral-500">
            <span>Platform v2.4 (Enterprise)</span>
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-6 border-b border-neutral-800/80 bg-[#141414] flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="md:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
            >
              {mobileSidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-neutral-400">
                Sistem SaaS Multi-Tenant Beroperasi Normal
              </span>
            </div>
          </div>

          {/* Right Header: Switch to Store & User Profile */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-700 bg-neutral-800/70 hover:bg-neutral-800 text-xs font-bold text-neutral-200 hover:text-white transition-all"
            >
              <Store className="size-3.5 text-[#FF5C38]" />
              <span>Buka POS Outlet</span>
            </Link>

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-neutral-800 text-xs transition-colors cursor-pointer"
              >
                <div className="size-8 rounded-xl bg-orange-600/30 border border-orange-500/40 text-orange-400 flex items-center justify-center font-bold text-xs">
                  {user?.name?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="text-left hidden md:block">
                  <p className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                    {user?.name || 'Admin'}
                  </p>
                  <p className="text-[10px] text-orange-400 leading-tight">Admin Internal</p>
                </div>
                <ChevronDown className={`size-3.5 text-neutral-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1C1C1C] border border-neutral-800 shadow-2xl py-1.5 z-50 text-xs text-neutral-200 animate-in fade-in zoom-in-95"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-neutral-800">
                    <p className="font-bold text-white truncate">{user?.name}</p>
                    <p className="text-[10.5px] text-neutral-400 truncate">{user?.email}</p>
                  </div>
                  <Link
                    href="/dashboard/settings/account"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-neutral-200 hover:text-white transition-colors"
                  >
                    <span>Profile Akun</span>
                  </Link>
                  <div className="border-t border-neutral-800 my-1" />
                  <button
                    type="button"
                    onClick={() => logout?.()}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileSidebarOpen && (
          <div className="md:hidden border-b border-neutral-800 bg-[#171717] p-4 space-y-2 animate-in slide-in-from-top-2">
            {ADMIN_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold ${
                    isActive
                      ? 'bg-[#FF5C38] text-white'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Body Content */}
        <main className="flex-1 bg-[#0A0A0A] p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
