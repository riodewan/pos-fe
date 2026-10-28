'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Coffee,
  ShoppingCart,
  LogOut,
  ChevronsUpDown,
  Check,
  Menu as MenuIcon,
  X,
  Slash,
  ClipboardList,
  CreditCard,
  LayoutGrid,
  QrCode,
  Package,
  TrendingUp,
  Banknote,
  Users,
  ShieldCheck,
  Bell,
  Printer,
  ChefHat,
  Ticket,
  Mail,
  ChevronDown,
  Calendar,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { SIDEBAR_NAV_ITEMS, NAV_GROUP_ORDER, NavItem } from '@/constants/navigation';
import { getInitials } from '@/utils';
import { cn } from '@/lib/utils';
import { NemuLogo } from '@/components/common/NemuLogo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, activeTenant, logout } = useAuth();
  const { stores, activeStore, selectStore } = useStore();
  const { isLoading, isAuthenticated } = useRequireAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex bg-background">
        {/* Sidebar Skeleton */}
        <div className="hidden lg:flex w-60 flex-col border-r border-border p-3 gap-4">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <Skeleton className="size-7 rounded-md" />
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <div className="space-y-1.5 flex-1 pt-2">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <Skeleton key={i} className="h-8 w-full rounded-md" />
            ))}
          </div>
          <Skeleton className="h-11 w-full rounded-md" />
        </div>

        {/* Content Skeleton */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 border-b border-border px-6 flex items-center justify-between">
            <Skeleton className="h-5 w-48 rounded" />
            <Skeleton className="h-8 w-28 rounded-md" />
          </header>
          <main className="p-6 lg:p-8">
            <LoadingScreen message="Memuat sesi kerja..." />
            <div className="hidden">
              <Suspense fallback={null}>{children}</Suspense>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const userRole = user?.is_internal ? 'SUPER_ADMIN' : activeTenant?.role?.toUpperCase() || '';
  const brandHomeHref =
    userRole === 'CASHIER'
      ? '/dashboard/pos'
      : userRole === 'INVENTORY'
      ? '/dashboard/inventory'
      : '/dashboard';

  const accessibleItems = SIDEBAR_NAV_ITEMS.filter((item) => {
    if (!item.roles || item.roles.length === 0) return true;
    return userRole ? item.roles.includes(userRole) : false;
  });

  const currentTab =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;

  const isItemActive = (item: NavItem) => {
    const isOrdersLink = item.href.includes('?tab=orders');
    const isPosLink = item.href === '/dashboard/pos';
    if (isOrdersLink) return pathname === '/dashboard/pos' && currentTab === 'orders';
    if (isPosLink) return pathname === '/dashboard/pos' && currentTab !== 'orders';
    return pathname === item.href;
  };

  const isPosPage = pathname === '/dashboard/pos' && currentTab !== 'orders';
  const isKdsPage =
    pathname === '/dashboard/kds' || (pathname === '/dashboard/pos' && currentTab === 'orders');
  const isReservationsPage =
    pathname === '/dashboard/reservations' || pathname === '/dashboard/reservasi';
  const isTerminalPage = isPosPage || isKdsPage || isReservationsPage;

  return (
    <div className="min-h-screen flex bg-[#F8F9FA]">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden animate-in fade-in duration-150"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-[#141414] text-white transition-transform duration-200 flex flex-col',
          isTerminalPage
            ? mobileMenuOpen
              ? 'translate-x-0'
              : '-translate-x-full'
            : mobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full lg:sticky lg:top-0 lg:h-screen lg:translate-x-0'
        )}
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            {/* Brand Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-800/60">
              <Link href={brandHomeHref} className="flex items-center">
                <NemuLogo size="md" />
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800"
                aria-label="Tutup menu"
              >
                <MenuIcon className="size-4" />
              </button>
            </div>

            {/* Navigation Groups */}
            <nav className="overflow-y-auto px-3.5 py-4 space-y-5 max-h-[calc(100vh-145px)]">
              {/* Group 1: MAIN MENU */}
              <div>
                <p className="px-2.5 pb-2 text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider">
                  MAIN MENU
                </p>
                <div className="space-y-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 h-9 px-3 rounded-xl text-[13px] font-medium transition-colors',
                      pathname === '/dashboard'
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <LayoutGrid className="size-4 shrink-0 text-neutral-400" />
                    <span className="truncate">Dashboard</span>
                  </Link>

                  <Link
                    href="/dashboard/orders"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 h-9 px-3 rounded-xl text-[13px] font-medium transition-colors',
                      pathname === '/dashboard/orders' || (pathname === '/dashboard/pos' && currentTab === 'orders')
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <ClipboardList className="size-4 shrink-0 text-neutral-400" />
                    <span className="truncate">Pesanan</span>
                  </Link>

                  <Link
                    href="/dashboard/transactions"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 h-9 px-3 rounded-xl text-[13px] font-medium transition-colors',
                      pathname === '/dashboard/transactions'
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <CreditCard className="size-4 shrink-0 text-neutral-400" />
                    <span className="truncate">Transaksi</span>
                  </Link>

                  <Link
                    href="/dashboard/catalog"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 h-9 px-3 rounded-xl text-[13px] font-medium transition-colors',
                      pathname === '/dashboard/catalog'
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Coffee className="size-4 shrink-0 text-neutral-400" />
                    <span className="truncate">Menu</span>
                  </Link>

                  <Link
                    href="/dashboard/tables"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 h-9 px-3 rounded-xl text-[13px] font-medium transition-colors',
                      pathname === '/dashboard/tables'
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <LayoutGrid className="size-4 shrink-0 text-neutral-400" />
                    <span className="truncate">Meja</span>
                  </Link>

                  <Link
                    href="/dashboard/qr-order"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 h-9 px-3 rounded-xl text-[13px] font-medium transition-colors',
                      pathname === '/dashboard/qr-order'
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <QrCode className="size-4 shrink-0 text-neutral-400" />
                    <span className="truncate">QR Order</span>
                  </Link>
                </div>
              </div>

              {/* Group 2: OPERASIONAL */}
              <div>
                <p className="px-2.5 pb-2 text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider">
                  OPERASIONAL
                </p>
                <div className="space-y-1">
                  <div>
                    <Link
                      href="/dashboard/inventory"
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 h-9 px-3 rounded-xl text-[13px] font-medium transition-colors',
                        pathname === '/dashboard/inventory'
                          ? 'bg-white/10 text-white font-semibold'
                          : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <Package className="size-4 shrink-0 text-neutral-400" />
                      <span className="truncate">Inventori & Stok</span>
                    </Link>

                    {/* Submenu under Inventori & Stok matching Figma Sidebar */}
                    {pathname.startsWith('/dashboard/inventory') && (
                      <div className="pl-9 pr-2 py-1.5 space-y-1.5 border-l border-white/10 ml-5 text-xs">
                        <Link
                          href="/dashboard/inventory?tab=bahan"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-0.5 text-neutral-400 hover:text-white transition-colors"
                        >
                          Ringkasan Stok
                        </Link>
                        <Link
                          href="/dashboard/inventory?tab=stock-in"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-0.5 text-neutral-400 hover:text-white transition-colors"
                        >
                          Stok & Mutasi
                        </Link>
                        <Link
                          href="/dashboard/inventory?tab=po"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-0.5 text-neutral-400 hover:text-white transition-colors"
                        >
                          Pembelian
                        </Link>
                        <Link
                          href="/dashboard/inventory?tab=adjustment"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-0.5 text-neutral-400 hover:text-white transition-colors"
                        >
                          Penyesuaian Stok
                        </Link>
                        <Link
                          href="/dashboard/inventory?tab=stock-out"
                          onClick={() => setMobileMenuOpen(false)}
                          className="block py-0.5 text-neutral-400 hover:text-white transition-colors"
                        >
                          Riwayat Stok
                        </Link>
                      </div>
                    )}
                  </div>

                  <Link
                    href="/dashboard/reports"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 h-9 px-3 rounded-xl text-[13px] font-medium transition-colors',
                      pathname === '/dashboard/reports'
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <TrendingUp className="size-4 shrink-0 text-neutral-400" />
                    <span className="truncate">Laporan</span>
                  </Link>

                  <Link
                    href="/dashboard/finance"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 h-9 px-3 rounded-xl text-[13px] font-medium transition-colors',
                      pathname === '/dashboard/finance'
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Banknote className="size-4 shrink-0 text-neutral-400" />
                    <span className="truncate">Keuangan & Rekonsiliasi</span>
                  </Link>
                </div>
              </div>

              {/* Group 3: DATA & PENGELOLAAN */}
              <div>
                <p className="px-2.5 pb-2 text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider">
                  DATA & PENGELOLAAN
                </p>
                <div className="space-y-1">
                  <Link
                    href="/dashboard/customers"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 h-9 px-3 rounded-xl text-[13px] font-medium transition-colors',
                      pathname === '/dashboard/customers'
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Users className="size-4 shrink-0 text-neutral-400" />
                    <span className="truncate">Pelanggan</span>
                  </Link>

                  <Link
                    href="/dashboard/staff"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 h-9 px-3 rounded-xl text-[13px] font-medium transition-colors',
                      pathname.startsWith('/dashboard/staff') || (pathname === '/dashboard/settings' && currentTab === 'staff')
                        ? 'bg-white/10 text-white font-semibold'
                        : 'text-neutral-400 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <ShieldCheck className="size-4 shrink-0 text-neutral-400" />
                    <span className="truncate">Staff & Akses</span>
                  </Link>
                </div>
              </div>
            </nav>
          </div>

          {/* Bottom Outlet & User Footer */}
          <div className="p-3 border-t border-neutral-800/80 bg-[#171717]">
            <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-full bg-[#2E2E2E] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  KM
                </div>
                <div className="min-w-0">
                  <p className="text-[12.5px] font-semibold text-white truncate leading-tight">
                    {activeTenant?.name || 'Kopi Mantap'}
                  </p>
                  <div className="flex items-center gap-2 text-[10.5px] text-neutral-400 mt-0.5">
                    <Link
                      href="/dashboard/settings/profile"
                      className={cn(
                        'transition-colors',
                        pathname === '/dashboard/settings/profile' || pathname === '/dashboard/profile'
                          ? 'text-white font-bold underline decoration-[#FF5C38] decoration-2 underline-offset-2'
                          : 'hover:text-neutral-200'
                      )}
                    >
                      Profile
                    </Link>
                    <span>&bull;</span>
                    <Link
                      href="/dashboard/settings"
                      className={cn(
                        'transition-colors',
                        pathname === '/dashboard/settings'
                          ? 'text-white font-bold underline decoration-[#FF5C38] decoration-2 underline-offset-2'
                          : 'hover:text-neutral-200'
                      )}
                    >
                      Pengaturan
                    </Link>
                  </div>
                </div>
              </div>
              <ChevronsUpDown className="size-3.5 text-neutral-400 shrink-0" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header matching Figma screenshot */}
        <header className="sticky top-0 z-30 h-16 border-b border-neutral-800/80 bg-[#141414] text-white px-6 flex items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
            {/* If terminal full-screen (POS, KDS, Reservasi), show brand logo & drawer toggle matching Screenshots */}
            {isTerminalPage ? (
              <div className="flex items-center gap-3 mr-2">
                <Link href={brandHomeHref} className="flex items-center">
                  <NemuLogo size="sm" />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                  aria-label="Buka menu navigasi"
                >
                  <MenuIcon className="size-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-1.5 -ml-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800"
                aria-label="Buka menu"
              >
                <MenuIcon className="size-5" />
              </button>
            )}

            {/* Quick Action Badges matching Figma screenshot: POS, KDS, Reservasi */}
            <div className="flex items-center gap-1.5 bg-[#1F1F1F] p-1.5 rounded-xl border border-neutral-800 shadow-xs">
              <Link
                href="/dashboard/pos"
                className={cn(
                  'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
                  isPosPage
                    ? 'bg-[#FF5C38] text-white shadow-xs'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                )}
              >
                <Printer
                  className={cn(
                    'size-3.5',
                    isPosPage ? 'text-white' : 'text-[#FF5C38]'
                  )}
                />
                <span>POS</span>
              </Link>

              <Link
                href="/dashboard/kds"
                className={cn(
                  'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
                  isKdsPage
                    ? 'bg-[#FF5C38] text-white shadow-xs'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                )}
              >
                <ChefHat
                  className={cn(
                    'size-3.5',
                    isKdsPage ? 'text-white' : 'text-[#FF5C38]'
                  )}
                />
                <span>KDS</span>
              </Link>

              <Link
                href="/dashboard/reservations"
                className={cn(
                  'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all',
                  isReservationsPage
                    ? 'bg-[#FF5C38] text-white shadow-xs'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                )}
              >
                <Calendar
                  className={cn(
                    'size-3.5',
                    isReservationsPage ? 'text-white' : 'text-[#FF5C38]'
                  )}
                />
                <span>Reservasi</span>
              </Link>
            </div>
          </div>

          {/* Right Header: Mail & User profile matching Figma screenshot */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/notifications"
              className={cn(
                "size-9 rounded-xl border flex items-center justify-center transition-colors shadow-2xs cursor-pointer",
                pathname.startsWith('/dashboard/notifications')
                  ? "bg-[#FF5C38] border-[#FF5C38] text-white shadow-xs"
                  : "border-neutral-800 bg-[#1E1E1E] hover:bg-neutral-800 text-neutral-300"
              )}
              title="Notifikasi"
            >
              <Mail className="size-4" />
            </Link>

            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-full border border-neutral-800 bg-[#1E1E1E] hover:bg-neutral-800 text-neutral-200 shadow-2xs cursor-pointer transition-colors"
              >
                <div className="size-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[11px] font-bold">
                  {getInitials(user?.name) || 'AP'}
                </div>
                <span className="text-xs font-medium hidden sm:inline">
                  {user?.name || 'Andi Pratama'}
                </span>
                <ChevronDown className={cn("size-3 text-neutral-400 transition-transform", userDropdownOpen && "rotate-180")} />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1C1C1C] border border-neutral-800 shadow-xl py-1.5 z-50 text-xs text-neutral-200 animate-in fade-in duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-neutral-800/80">
                    <p className="font-semibold text-white truncate">{user?.name || 'Andi Pratama'}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{user?.email || 'andi.pratama@example.com'}</p>
                  </div>
                  <Link
                    href="/dashboard/settings/account"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-neutral-200 hover:text-white transition-colors"
                  >
                    <span>Profile Akun</span>
                  </Link>
                  <Link
                    href="/dashboard/settings/profile"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-neutral-200 hover:text-white transition-colors"
                  >
                    <span>Profile Outlet</span>
                  </Link>
                  <Link
                    href="/dashboard/staff"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-neutral-200 hover:text-white transition-colors"
                  >
                    <span>Staff & Akses</span>
                  </Link>
                  <div className="border-t border-neutral-800/80 my-1" />
                  <button
                    type="button"
                    onClick={() => logout?.()}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                  >
                    <span>Keluar</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Children Container */}
        <main className="flex-1 bg-[#F8F9FA] min-w-0">
          <Suspense fallback={<LoadingScreen message="Memuat halaman..." />}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
