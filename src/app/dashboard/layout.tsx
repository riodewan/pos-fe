'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Coffee,
  ShoppingCart,
  LogOut,
  ChevronDown,
  Store as StoreIcon,
  Menu as MenuIcon,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SIDEBAR_NAV_ITEMS } from '@/constants';
import { getInitials } from '@/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {

  const pathname = usePathname();
  const { user, activeTenant, logout } = useAuth();
  const { stores, activeStore, selectStore } = useStore();
  const { isLoading, isAuthenticated } = useRequireAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-xl bg-amber-600 animate-pulse flex items-center justify-center text-white">
            <Coffee className="size-5" />
          </div>
          <span className="text-sm font-medium text-muted-foreground">Memuat sesi operasional...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-50/50 dark:bg-zinc-950">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-border/60 bg-card transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-0 -translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Brand Header */}
          <div className="flex h-16 items-center justify-between border-b border-border/60 px-5">
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="size-9 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-sm shadow-amber-600/30">
                <Coffee className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm tracking-tight leading-none text-foreground">
                  {activeTenant?.name || 'Kopi Nusantara'}
                </span>
                <span className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                  {activeTenant?.role || 'Tenant POS'}
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1 rounded-md text-muted-foreground hover:bg-muted"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {SIDEBAR_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User & Sign Out Footer */}
          <div className="border-t border-border/60 p-3 bg-muted/30">
            <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-card border border-border/40">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xs font-bold shrink-0">
                  {getInitials(user?.name)}
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-semibold text-foreground truncate">{user?.name}</span>
                  <span className="text-[10px] text-muted-foreground truncate">{user?.email}</span>
                </div>
              </div>
              <button
                onClick={() => logout()}
                title="Keluar"
                className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navbar */}
        <header className="sticky top-0 z-30 h-16 border-b border-border/60 bg-card/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-border text-foreground hover:bg-muted"
            >
              <MenuIcon className="size-5" />
            </button>

            {/* Store Switcher */}
            <div className="relative">
              <button
                onClick={() => setStoreDropdownOpen(!storeDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/80 bg-background text-xs font-medium hover:bg-muted/60 transition-colors"
              >
                <StoreIcon className="size-3.5 text-amber-600" />
                <span className="font-semibold text-foreground">
                  {activeStore ? activeStore.name : 'Pilih Outlet Toko'}
                </span>
                {activeStore && (
                  <Badge variant="outline" className="text-[10px] py-0 px-1.5 font-mono">
                    {activeStore.code}
                  </Badge>
                )}
                <ChevronDown className="size-3 text-muted-foreground ml-0.5" />
              </button>

              {/* Store Dropdown Menu */}
              {storeDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setStoreDropdownOpen(false)}
                  />
                  <div className="absolute left-0 mt-1.5 z-40 w-56 rounded-xl border border-border bg-card p-1.5 shadow-lg animate-in fade-in zoom-in-95">
                    <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Daftar Outlet Aktif ({stores.length})
                    </div>
                    {stores.map((store) => (
                      <button
                        key={store.id}
                        onClick={() => {
                          selectStore(store.id);
                          setStoreDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                          activeStore?.id === store.id
                            ? 'bg-amber-600/10 text-amber-800 dark:text-amber-300 font-semibold'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span>{store.name}</span>
                          <span className="text-[10px] text-muted-foreground">{store.code}</span>
                        </div>
                        {activeStore?.id === store.id && (
                          <div className="size-1.5 rounded-full bg-amber-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard/pos">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs">
                <ShoppingCart className="mr-1.5 size-3.5" /> Buka Kasir POS
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Children Container */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
