'use client';

import React from 'react';
import Link from 'next/link';
import { Coffee, ArrowRight, ShieldCheck, QrCode, BarChart3, Layers, Store } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground bg-grid">
      {/* Top Navigation */}
      <header className="border-b border-border/80 backdrop-blur-md sticky top-0 z-40 bg-background/85">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
              <Coffee className="size-4" strokeWidth={2.2} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm tracking-tight">Kopi Nusantara</span>
              <span className="hidden sm:inline-block text-[11px] font-medium px-2 py-0.5 rounded-full border border-border bg-surface text-muted-foreground">
                POS & Inventory
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button size="sm">Dashboard</Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => logout()}>
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Mulai Sekarang
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-28 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-[12px] font-medium text-muted-foreground mb-8">
          <Layers className="size-3.5 text-foreground" />
          <span>Multi-Tenant & Multi-Outlet Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.04em] max-w-3xl leading-[1.08] text-foreground">
          Sistem POS & Inventaris presisi untuk bisnis F&B.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Dirancang untuk kecepatan operasional kasir, pemesanan meja mandiri via QR Code, perhitungan HPP otomatis berbasis resep riil, dan pembukuan multi-outlet.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href={isAuthenticated ? "/dashboard/pos" : "/login"}>
            <Button size="lg" className="px-5">
              Buka Layar Kasir POS <ArrowRight className="ml-1.5 size-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="px-5">
              Lihat Dashboard
            </Button>
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 text-left w-full">
          <Card className="hover:border-foreground/30 transition-all">
            <CardHeader className="pb-3">
              <div className="size-9 rounded-md border border-border bg-surface text-foreground flex items-center justify-center mb-3">
                <Store className="size-4" strokeWidth={1.75} />
              </div>
              <CardTitle>POS & Kasir Cepat</CardTitle>
              <CardDescription>
                Antarmuka kasir dine-in & takeaway tanpa lag, hitung diskon, pajak, dan kembalian tunai akurat.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[13px] text-muted-foreground">
              Mendukung transaksi Tunai, QRIS statis & dinamis, EDC, dan cetak struk thermal standar.
            </CardContent>
          </Card>

          <Card className="hover:border-foreground/30 transition-all">
            <CardHeader className="pb-3">
              <div className="size-9 rounded-md border border-border bg-surface text-foreground flex items-center justify-center mb-3">
                <QrCode className="size-4" strokeWidth={1.75} />
              </div>
              <CardTitle>Pemesanan Meja QR</CardTitle>
              <CardDescription>
                Pelanggan scan kode QR di meja, pesan menu, dan langsung selesaikan pembayaran mandiri.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[13px] text-muted-foreground">
              Sinkronisasi instan ke antrean dapur tanpa perlu instalasi aplikasi oleh tamu resto.
            </CardContent>
          </Card>

          <Card className="hover:border-foreground/30 transition-all">
            <CardHeader className="pb-3">
              <div className="size-9 rounded-md border border-border bg-surface text-foreground flex items-center justify-center mb-3">
                <BarChart3 className="size-4" strokeWidth={1.75} />
              </div>
              <CardTitle>Deduksi Resep & HPP</CardTitle>
              <CardDescription>
                Tiap porsi menu memotong gramatur bahan baku gudang secara otomatis di tingkat database.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-[13px] text-muted-foreground">
              Moving average cost real-time, pencatatan bahan rusak (wastage), dan audit stock opname mingguan.
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/80 py-6 text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Kopi Nusantara POS. Multi-Tenant Enterprise Architecture.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
              Isolasi Data Toko Aman
            </span>
            <span>Next.js + Laravel 11</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
