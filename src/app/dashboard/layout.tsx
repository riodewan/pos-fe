'use client';

import React, { useState, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Coffee,
  ChevronsUpDown,
  Menu as MenuIcon,
  ClipboardList,
  CreditCard,
  LayoutGrid,
  QrCode,
  Package,
  TrendingUp,
  Banknote,
  Users,
  ShieldCheck,
  History,
  Printer,
  ChefHat,
  Mail,
  ChevronDown,
  Calendar,
  Lock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { getInitials } from '@/utils';
import { cn } from '@/lib/utils';
import { NemuLogo } from '@/components/common/NemuLogo';
import { getLandingPageForRole } from '@/constants/navigation';

interface NavigationItemDef {
  href: string;
  label: string;
  icon: React.ElementType;
  permissions: string[];
  roles: string[];
  isActive: (pathname: string, currentTab: string | null) => boolean;
}

interface NavigationGroupDef {
  title: string;
  items: NavigationItemDef[];
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, activeTenant, logout, canAccess } = useAuth();
  const { isLoading, isAuthenticated } = useRequireAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Current tab from search params
  const currentTab =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('tab') : null;

  // Normalized active user role and default landing page
  const userRole = user?.is_internal ? 'SUPER_ADMIN' : activeTenant?.role?.toUpperCase() || '';
  const brandHomeHref = getLandingPageForRole(userRole, !!user?.is_internal);

  // Navigation items mapping with required database permissions & role fallbacks
  const navigationGroups: NavigationGroupDef[] = useMemo(
    () => [
      {
        title: 'MAIN MENU',
        items: [
          {
            href: '/dashboard',
            label: 'Dashboard',
            icon: LayoutGrid,
            permissions: ['report.sales', 'report.financial', 'audit.view'],
            roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'],
            isActive: (p) => p === '/dashboard',
          },
          {
            href: '/dashboard/orders',
            label: 'Pesanan',
            icon: ClipboardList,
            permissions: ['order.view', 'order.create'],
            roles: [
              'OWNER',
              'MANAGER',
              'CASHIER',
              'KASIR',
              'SERVER',
              'BARISTA',
              'DAPUR',
              'KITCHEN',
              'INVENTORY',
              'GUDANG',
              'SUPER_ADMIN',
            ],
            isActive: (p, tab) =>
              p === '/dashboard/orders' || (p === '/dashboard/pos' && tab === 'orders'),
          },
          {
            href: '/dashboard/transactions',
            label: 'Transaksi',
            icon: CreditCard,
            permissions: ['payment.view', 'payment.process'],
            roles: ['OWNER', 'MANAGER', 'CASHIER', 'KASIR', 'SUPER_ADMIN'],
            isActive: (p) => p === '/dashboard/transactions',
          },
          {
            href: '/dashboard/catalog',
            label: 'Menu',
            icon: Coffee,
            permissions: ['product.view', 'menu.view'],
            roles: [
              'OWNER',
              'MANAGER',
              'CASHIER',
              'KASIR',
              'INVENTORY',
              'GUDANG',
              'DAPUR',
              'BARISTA',
              'SUPER_ADMIN',
            ],
            isActive: (p) => p === '/dashboard/catalog',
          },
          {
            href: '/dashboard/tables',
            label: 'Meja',
            icon: LayoutGrid,
            permissions: ['table.view', 'table.create'],
            roles: ['OWNER', 'MANAGER', 'CASHIER', 'KASIR', 'SERVER', 'SUPER_ADMIN'],
            isActive: (p) => p === '/dashboard/tables',
          },
          {
            href: '/dashboard/qr-order',
            label: 'QR Order',
            icon: QrCode,
            permissions: ['qr.view', 'qr.generate'],
            roles: ['OWNER', 'MANAGER', 'CASHIER', 'KASIR', 'SUPER_ADMIN'],
            isActive: (p) => p === '/dashboard/qr-order',
          },
        ],
      },
      {
        title: 'OPERASIONAL',
        items: [
          {
            href: '/dashboard/inventory',
            label: 'Inventori & Stok',
            icon: Package,
            permissions: ['inventory.view', 'purchase.view', 'ingredient.view'],
            roles: ['OWNER', 'MANAGER', 'INVENTORY', 'GUDANG', 'DAPUR', 'SUPER_ADMIN'],
            isActive: (p) => p === '/dashboard/inventory',
          },
          {
            href: '/dashboard/reports',
            label: 'Laporan',
            icon: TrendingUp,
            permissions: ['report.sales', 'report.financial'],
            roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'],
            isActive: (p) => p === '/dashboard/reports',
          },
          {
            href: '/dashboard/finance',
            label: 'Keuangan & Rekonsiliasi',
            icon: Banknote,
            permissions: ['report.financial', 'payment.view'],
            roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'],
            isActive: (p) => p === '/dashboard/finance',
          },
        ],
      },
      {
        title: 'DATA & PENGELOLAAN',
        items: [
          {
            href: '/dashboard/customers',
            label: 'Pelanggan',
            icon: Users,
            permissions: ['customer.view', 'order.view'],
            roles: ['OWNER', 'MANAGER', 'CASHIER', 'KASIR', 'SUPER_ADMIN'],
            isActive: (p) => p === '/dashboard/customers',
          },
          {
            href: '/dashboard/staff',
            label: 'Staff & Akses',
            icon: ShieldCheck,
            permissions: ['user.view', 'role.view'],
            roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'],
            isActive: (p, tab) =>
              p.startsWith('/dashboard/staff') ||
              (p === '/dashboard/settings' && tab === 'staff'),
          },
        ],
      },
    ],
    []
  );

  // Filter menu items dynamically according to permissions. Completely hides unauthorized menus!
  const filteredNavGroups = useMemo(() => {
    return navigationGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          canAccess({ permissions: item.permissions, roles: item.roles })
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [navigationGroups, canAccess]);

  // Quick Action Header Badges Access Checks
  const canAccessPos = canAccess({
    permissions: ['order.create', 'payment.process'],
    roles: ['OWNER', 'MANAGER', 'CASHIER', 'KASIR', 'SUPER_ADMIN'],
  });

  const canAccessKds = canAccess({
    permissions: ['order.view'],
    roles: [
      'OWNER',
      'MANAGER',
      'BARISTA',
      'DAPUR',
      'KITCHEN',
      'CASHIER',
      'KASIR',
      'SUPER_ADMIN',
    ],
  });

  const canAccessReservations = canAccess({
    permissions: ['table.view'],
    roles: ['OWNER', 'MANAGER', 'CASHIER', 'KASIR', 'SERVER', 'SUPER_ADMIN'],
  });

  const hasAnyTerminalAccess = canAccessPos || canAccessKds || canAccessReservations;

  // Settings permission check
  const canAccessSettings = canAccess({
    permissions: ['tenant.settings', 'tenant.update', 'store.update'],
    roles: ['OWNER', 'SUPER_ADMIN'],
  });

  // Staff permission check
  const canAccessStaff = canAccess({
    permissions: ['user.view', 'role.view'],
    roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'],
  });

  // Check if current visited page is forbidden for the current user
  const isCurrentPageForbidden = useMemo(() => {
    if (!user || user.is_internal) return false;
    if (activeTenant?.role?.toUpperCase() === 'OWNER') return false;

    for (const group of navigationGroups) {
      for (const item of group.items) {
        if (
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname.startsWith(item.href))
        ) {
          const allowed = canAccess({ permissions: item.permissions, roles: item.roles });
          if (!allowed) return true;
        }
      }
    }

    if (pathname.startsWith('/dashboard/settings') && !canAccessSettings) {
      return true;
    }

    if (
      (pathname.startsWith('/dashboard/pos') && !canAccessPos) ||
      (pathname.startsWith('/dashboard/kds') && !canAccessKds) ||
      (pathname.startsWith('/dashboard/reservations') && !canAccessReservations)
    ) {
      return true;
    }

    return false;
  }, [
    user,
    activeTenant,
    pathname,
    canAccess,
    navigationGroups,
    canAccessSettings,
    canAccessPos,
    canAccessKds,
    canAccessReservations,
  ]);

  const isPosPage = pathname === '/dashboard/pos' && currentTab !== 'orders';
  const isKdsPage =
    pathname === '/dashboard/kds' || (pathname === '/dashboard/pos' && currentTab === 'orders');
  const isReservationsPage =
    pathname === '/dashboard/reservations' || pathname === '/dashboard/reservasi';
  const isTerminalPage = isPosPage || isKdsPage || isReservationsPage;

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
                className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                aria-label="Tutup menu"
              >
                <MenuIcon className="size-4" />
              </button>
            </div>

            {/* Navigation Groups - Only shows authorized menus */}
            <nav className="overflow-y-auto px-3.5 py-4 space-y-5 max-h-[calc(100vh-145px)]">
              {filteredNavGroups.map((group) => (
                <div key={group.title}>
                  <p className="px-2.5 pb-2 text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider">
                    {group.title}
                  </p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const IconComponent = item.icon;
                      const active = item.isActive(pathname, currentTab);

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

          {/* Bottom Outlet & User Footer */}
          <div className="p-3 border-t border-neutral-800/80 bg-[#171717]">
            <div className="flex items-center justify-between p-2 rounded-xl bg-neutral-900 border border-neutral-800">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-full bg-[#2E2E2E] text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                  {getInitials(activeTenant?.name) || 'KM'}
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
                        pathname === '/dashboard/settings/profile' ||
                          pathname === '/dashboard/profile'
                          ? 'text-white font-bold underline decoration-[#FF5C38] decoration-2 underline-offset-2'
                          : 'hover:text-neutral-200'
                      )}
                    >
                      Profile
                    </Link>
                    {canAccessSettings && (
                      <>
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
                      </>
                    )}
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
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 border-b border-neutral-800/80 bg-[#141414] text-white px-6 flex items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3 min-w-0">
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
                className="lg:hidden p-1.5 -ml-1 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
                aria-label="Buka menu"
              >
                <MenuIcon className="size-5" />
              </button>
            )}

            {/* Quick Action Badges - Only shown if user has access */}
            {hasAnyTerminalAccess && (
              <div className="flex items-center gap-1.5 bg-[#1F1F1F] p-1.5 rounded-xl border border-neutral-800 shadow-xs">
                {canAccessPos && (
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
                )}

                {canAccessKds && (
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
                )}

                {canAccessReservations && (
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
                )}
              </div>
            )}
          </div>

          {/* Right Header */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/notifications"
              className={cn(
                'size-9 rounded-xl border flex items-center justify-center transition-colors shadow-2xs cursor-pointer',
                pathname.startsWith('/dashboard/notifications')
                  ? 'bg-[#FF5C38] border-[#FF5C38] text-white shadow-xs'
                  : 'border-neutral-800 bg-[#1E1E1E] hover:bg-neutral-800 text-neutral-300'
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
                  {user?.name || 'Staf Outlet'}
                </span>
                <ChevronDown
                  className={cn(
                    'size-3 text-neutral-400 transition-transform',
                    userDropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-xl bg-[#1C1C1C] border border-neutral-800 shadow-xl py-1.5 z-50 text-xs text-neutral-200 animate-in fade-in duration-100"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-neutral-800/80">
                    <p className="font-semibold text-white truncate">{user?.name || 'Staf'}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{user?.email || ''}</p>
                    <span className="inline-block mt-1 text-[10px] font-bold text-[#FF5C38] bg-[#FF5C38]/10 px-1.5 py-0.2 rounded">
                      {activeTenant?.role || 'Staff'}
                    </span>
                  </div>

                  <Link
                    href="/dashboard/settings/account"
                    className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 text-neutral-200 hover:text-white transition-colors"
                  >
                    <span>Profile Akun</span>
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

        {/* Page Children Container with Access Guard */}
        <main className="flex-1 bg-[#F8F9FA] min-w-0">
          {isCurrentPageForbidden ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center animate-in fade-in duration-200">
              <div className="size-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mb-4 shadow-xs">
                <Lock className="size-8" />
              </div>
              <h2 className="text-lg font-bold text-neutral-900 mb-1">
                Akses Halaman Dibatasi
              </h2>
              <p className="text-xs text-neutral-500 max-w-md mb-6 leading-relaxed">
                Peran akun Anda ({activeTenant?.role || 'Staf'}) tidak memiliki hak akses untuk melihat halaman ini. Silakan hubungi Owner outlet jika membutuhkan akses.
              </p>
              <Link href={brandHomeHref}>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-[#FF5C38] hover:bg-[#E04B28] text-xs h-9 px-4"
                >
                  Kembali ke Halaman Utama
                </Button>
              </Link>
            </div>
          ) : (
            <Suspense fallback={<LoadingScreen message="Memuat halaman..." />}>
              {children}
            </Suspense>
          )}
        </main>
      </div>
    </div>
  );
}
