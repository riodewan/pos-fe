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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, activeTenant, logout } = useAuth();
  const { stores, activeStore, selectStore } = useStore();
  const { isLoading, isAuthenticated } = useRequireAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

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

  const activeItem = accessibleItems.find(isItemActive);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden animate-in fade-in duration-150"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-60 border-r border-sidebar-border bg-sidebar transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="h-full flex flex-col">
          {/* Brand */}
          <div className="h-14 flex items-center justify-between px-4">
            <Link href={brandHomeHref} className="flex items-center gap-2.5 min-w-0">
              <div className="size-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                <Coffee className="size-4" strokeWidth={2.25} />
              </div>
              <span className="font-semibold text-sm tracking-tight text-foreground truncate">
                {activeTenant?.name || 'Kopi Nusantara'}
              </span>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded-md text-muted-foreground hover:bg-accent"
              aria-label="Tutup menu"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
            {NAV_GROUP_ORDER.map((group) => {
              const items = accessibleItems.filter((i) => (i.group || 'Operasional') === group);
              if (items.length === 0) return null;
              return (
                <div key={group}>
                  <p className="px-2 pb-1.5 text-[11px] font-medium text-muted-foreground/80">{group}</p>
                  <div className="space-y-0.5">
                    {items.map((item) => {
                      const Icon = item.icon;
                      const active = isItemActive(item);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-2.5 h-8 px-2 rounded-md text-[13px] transition-colors',
                            active
                              ? 'bg-sidebar-accent text-foreground font-medium'
                              : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground'
                          )}
                        >
                          <Icon
                            className={cn('size-4 shrink-0', active ? 'text-foreground' : 'text-muted-foreground')}
                            strokeWidth={1.75}
                          />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>

          {/* User Footer */}
          <div className="border-t border-sidebar-border p-3">
            <div className="flex items-center gap-2.5 px-1">
              <div className="size-8 rounded-full bg-gradient-to-br from-neutral-200 to-neutral-400 dark:from-neutral-600 dark:to-neutral-800 text-foreground flex items-center justify-center text-[11px] font-semibold shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium text-foreground truncate leading-tight">{user?.name}</p>
                <p className="text-[11px] text-muted-foreground truncate leading-tight mt-0.5">
                  {activeTenant?.role || user?.email}
                </p>
              </div>
              <button
                onClick={() => logout()}
                title="Keluar"
                aria-label="Keluar"
                className="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors shrink-0"
              >
                <LogOut className="size-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-14 border-b border-border bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 -ml-1 rounded-md text-foreground hover:bg-accent"
              aria-label="Buka menu"
            >
              <MenuIcon className="size-5" />
            </button>

            {/* Breadcrumb: Store switcher / current page */}
            <div className="relative">
              <button
                onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
                className="flex items-center gap-2 h-8 px-2 rounded-md text-[13px] font-medium text-foreground hover:bg-accent transition-colors"
              >
                <span className="size-4 rounded-full bg-gradient-to-br from-emerald-400 to-sky-500 shrink-0" />
                <span className="truncate max-w-[160px]">
                  {activeStore ? activeStore.name : 'Pilih Outlet'}
                </span>
                <ChevronsUpDown className="size-3.5 text-muted-foreground" />
              </button>

              {storeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setStoreDropdownOpen(false)} />
                  <div className="absolute left-0 mt-1.5 z-40 w-64 rounded-lg bg-popover p-1 shadow-elevated animate-in fade-in zoom-in-[0.98] duration-100">
                    <p className="px-2 pt-1.5 pb-1 text-[11px] font-medium text-muted-foreground">
                      Outlet ({stores.length})
                    </p>
                    {stores.map((store) => {
                      const selected = activeStore?.id === store.id;
                      return (
                        <button
                          key={store.id}
                          onClick={() => {
                            selectStore(store.id);
                            setStoreDropdownOpen(false);
                          }}
                          className={cn(
                            'w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-[13px] transition-colors hover:bg-accent',
                            selected ? 'text-foreground font-medium' : 'text-muted-foreground'
                          )}
                        >
                          <div className="flex flex-col text-left min-w-0">
                            <span className="truncate text-foreground">{store.name}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">{store.code}</span>
                          </div>
                          {selected && <Check className="size-4 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {activeItem && (
              <>
                <Slash className="size-3.5 text-border -rotate-12 shrink-0 hidden sm:block" />
                <span className="hidden sm:block text-[13px] text-muted-foreground truncate">
                  {activeItem.label}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {userRole !== 'INVENTORY' && pathname !== '/dashboard/pos' && (
              <Link href="/dashboard/pos">
                <Button size="sm">
                  <ShoppingCart className="size-3.5" /> <span className="hidden sm:inline">Buka Kasir</span>
                </Button>
              </Link>
            )}
          </div>
        </header>

        {/* Page Children Container */}
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8 max-w-[1280px] w-full mx-auto">
          <Suspense fallback={<LoadingScreen message="Memuat halaman..." />}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
