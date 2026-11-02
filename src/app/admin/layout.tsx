'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
  LayoutGrid,
  Store,
  Menu as MenuIcon,
  Lock,
  ArrowLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { PageLoader } from '@/components/common/PageLoader';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { NemuLogo } from '@/components/common/NemuLogo';
import { getInitials } from '@/utils';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    title: 'MAIN MENU',
    items: [
      {
        href: '/admin',
        label: 'Overview Platform',
        icon: LayoutGrid,
      },
      {
        href: '/admin/tenants',
        label: 'Mitra Bisnis & Toko',
        icon: Building2,
      },
      {
        href: '/admin/users',
        label: 'Akun & Pengguna Mitra',
        icon: Users,
      },
      {
        href: '/admin/approvals',
        label: 'Pusat Approval',
        icon: CheckCircle,
      },
    ],
  },
  {
    title: 'MASTER & SISTEM',
    items: [
      {
        href: '/admin/master-data',
        label: 'Data Master Global',
        icon: Database,
      },
      {
        href: '/admin/audit-logs',
        label: 'Log Audit Global',
        icon: FileText,
      },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isInternalAdmin, logout } = useAuth();
  const { isLoading, isAuthenticated } = useRequireAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Close mobile sidebar & user dropdown on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  }, [pathname]);

  const handleLogout = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    setIsLoggingOut(true);
    try {
      await logout?.();
    } finally {
      router.replace('/login');
    }
  };

  if (isLoggingOut) {
    return <PageLoader text="Keluar dari sesi Admin Platform..." />;
  }

  if (isLoading || !isAuthenticated) {
    return <PageLoader text="Memverifikasi hak akses platform..." />;
  }

  // Access check: only internal admin allowed (when logged in as a non-internal user)
  if (!isInternalAdmin && !user?.is_internal) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 text-neutral-900 text-center">
        <div className="size-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4 shadow-xs">
          <Lock className="size-8" />
        </div>
        <h1 className="text-lg font-bold mb-1">Akses Terbatas: Admin Internal</h1>
        <p className="text-xs text-neutral-500 max-w-md mb-6 leading-relaxed">
          Halaman ini khusus untuk Administrator Platform NemuPOS. Akun Anda saat ini (
          {user?.email || 'Guest'}) tidak memiliki otorisasi Admin Internal.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs font-bold transition-all shadow-xs"
          >
            <ArrowLeft className="size-4" />
            <span>Kembali ke Dashboard Toko</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <LogOut className="size-4 text-red-500" />
            <span>Keluar / Ganti Akun</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F8F9FA]">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden animate-in fade-in duration-150"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation (Matching NemuHub UI) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[#141414] text-white transition-transform duration-200 flex flex-col',
          mobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:sticky lg:top-0 lg:h-screen lg:translate-x-0'
        )}
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            {/* Brand Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-800/60">
              <Link href="/admin" className="flex items-center gap-2">
                <NemuLogo size="md" />
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-orange-400 bg-orange-950/60 border border-orange-500/40 px-1.5 py-0.5 rounded-md">
                  Hub Admin
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                aria-label="Tutup menu"
              >
                <MenuIcon className="size-4" />
              </button>
            </div>

            {/* Navigation Groups */}
            <nav className="overflow-y-auto px-3.5 py-4 space-y-5 max-h-[calc(100vh-160px)]">
              {ADMIN_NAV_GROUPS.map((group) => (
                <div key={group.title}>
                  <p className="px-2.5 pb-2 text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider">
                    {group.title}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const IconComponent = item.icon;
                      const active =
                        item.href === '/admin'
                          ? pathname === '/admin'
                          : pathname?.startsWith(item.href);

                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 h-9 px-3 rounded-xl text-[13px] font-medium transition-colors',
                            active
                              ? 'bg-white/10 text-white font-semibold'
                              : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                          )}
                        >
                          <IconComponent
                            className={cn(
                              'size-4 shrink-0',
                              active ? 'text-white' : 'text-neutral-400'
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>

          <div>
            {/* Shortcut to Dashboard Outlet (if user also has a tenant) */}
            {user?.tenants && user.tenants.length > 0 && (
              <div className="p-3 pb-0">
                <Link
                  href="/dashboard"
                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800/80 border border-neutral-800 text-xs text-neutral-300 hover:text-white transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Store className="size-4 text-[#FF5C38]" />
                    <div>
                      <p className="font-bold text-[11.5px] text-white leading-tight">
                        Dashboard Outlet
                      </p>
                      <p className="text-[10px] text-neutral-400 leading-tight">
                        Buka Mode POS Toko
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="size-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}

            {/* Bottom Admin Profile Footer */}
            <div className="p-3 border-t border-neutral-800/80 bg-[#171717] mt-3">
              <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="size-8 rounded-full bg-[#2E2E2E] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                    {getInitials(user?.name) || 'AD'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-semibold text-white truncate leading-tight">
                      {user?.name || 'NemuPOS Hub'}
                    </p>
                    <div className="flex items-center gap-2 text-[10.5px] text-neutral-400 mt-0.5">
                      <span className="text-emerald-400 font-medium">Admin Internal</span>
                      <span>&bull;</span>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="text-red-400 hover:text-red-300 font-semibold transition-colors cursor-pointer"
                      >
                        Keluar
                      </button>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Keluar dari akun Admin"
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors shrink-0 cursor-pointer"
                >
                  <LogOut className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-neutral-800/80 bg-[#141414] text-white px-6 flex items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 -ml-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
              aria-label="Buka menu"
            >
              <MenuIcon className="size-5" />
            </button>

            {/* Quick Action Badges (NemuHub Style) */}
            <div className="hidden sm:flex items-center gap-1.5 bg-[#1F1F1F] p-1.5 rounded-xl border border-neutral-800 shadow-xs">
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
                  pathname === '/admin'
                    ? 'bg-[#FF5C38] text-white shadow-xs'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                )}
              >
                <ShieldCheck
                  className={cn(
                    'size-3.5',
                    pathname === '/admin' ? 'text-white' : 'text-[#FF5C38]'
                  )}
                />
                <span>Platform</span>
              </Link>

              <Link
                href="/admin/users"
                className={cn(
                  'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
                  pathname?.startsWith('/admin/users')
                    ? 'bg-[#FF5C38] text-white shadow-xs'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                )}
              >
                <Users
                  className={cn(
                    'size-3.5',
                    pathname?.startsWith('/admin/users') ? 'text-white' : 'text-[#FF5C38]'
                  )}
                />
                <span>Akun Mitra</span>
              </Link>

              <Link
                href="/admin/approvals"
                className={cn(
                  'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
                  pathname?.startsWith('/admin/approvals')
                    ? 'bg-[#FF5C38] text-white shadow-xs'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                )}
              >
                <CheckCircle
                  className={cn(
                    'size-3.5',
                    pathname?.startsWith('/admin/approvals') ? 'text-white' : 'text-[#FF5C38]'
                  )}
                />
                <span>Approval KYB</span>
              </Link>

              <Link
                href="/admin/master-data"
                className={cn(
                  'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
                  pathname?.startsWith('/admin/master-data')
                    ? 'bg-[#FF5C38] text-white shadow-xs'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                )}
              >
                <Database
                  className={cn(
                    'size-3.5',
                    pathname?.startsWith('/admin/master-data') ? 'text-white' : 'text-[#FF5C38]'
                  )}
                />
                <span>Master Data</span>
              </Link>
            </div>
          </div>

          {/* Right Header */}
          <div className="flex items-center gap-3">
            {user?.tenants && user.tenants.length > 0 && (
              <Link
                href="/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-800 bg-[#1E1E1E] hover:bg-neutral-800 text-xs font-bold text-neutral-200 hover:text-white transition-all shadow-2xs"
                title="Buka Dashboard POS Outlet"
              >
                <Store className="size-3.5 text-[#FF5C38]" />
                <span>Buka POS Outlet</span>
              </Link>
            )}

            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-neutral-800 bg-[#1E1E1E] hover:bg-neutral-800 text-neutral-200 shadow-2xs cursor-pointer transition-colors"
              >
                <div className="size-6 rounded-full bg-orange-100 text-[#FF5C38] flex items-center justify-center text-[11px] font-bold">
                  {getInitials(user?.name) || 'AD'}
                </div>
                <span className="text-xs font-medium hidden sm:inline">
                  {user?.name || 'Admin Internal'}
                </span>
                <ChevronDown
                  className={cn(
                    'size-3 text-neutral-400 transition-transform',
                    userDropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {userDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 rounded-xl bg-[#1C1C1C] border border-neutral-800 shadow-xl py-1.5 z-50 text-xs text-neutral-200 animate-in fade-in duration-100">
                    <div className="px-3.5 py-2.5 border-b border-neutral-800/80">
                      <p className="font-semibold text-white truncate">{user?.name || 'Admin'}</p>
                      <p className="text-[10.5px] text-neutral-400 truncate mt-0.5">
                        {user?.email || ''}
                      </p>
                      <span className="inline-block mt-1.5 text-[10px] font-bold text-[#FF5C38] bg-[#FF5C38]/10 px-1.5 py-0.5 rounded">
                        SUPER ADMIN
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-3.5 py-2.5 hover:bg-red-500/10 text-red-400 hover:text-red-300 font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="size-3.5" />
                      <span>Keluar dari Akun</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Children Container (Clean NemuHub Light Theme) */}
        <main className="flex-1 bg-[#F8F9FA] p-6 lg:p-8 min-w-0">
          <Suspense fallback={<LoadingScreen message="Memuat halaman admin..." />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
