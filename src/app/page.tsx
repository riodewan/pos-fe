'use client';

import React from 'react';
import Link from 'next/link';
import { Coffee, ArrowRight, ShieldCheck, QrCode, Utensils, BarChart3, Layers, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-amber-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-border/40 backdrop-blur-md sticky top-0 z-40 bg-background/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20">
              <Coffee className="size-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight">Kopi Nusantara POS</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                SaaS Enterprise
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Halo, <strong className="text-foreground">{user?.name}</strong>
                </span>
                <Link href="/dashboard">
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                    Masuk Dashboard
                  </Button>
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
                  <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                    Daftar Baru
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs font-semibold mb-6">
          <Layers className="size-3.5" /> Multi-Tenant & Multi-Outlet Architecture
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-[1.15]">
          Sistem POS & Inventory Modern untuk{' '}
          <span className="text-amber-600 dark:text-amber-500">Coffee Shop & F&B</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Kelola pesanan kasir cepat, meja dine-in, scan QR pelanggan otomatis, perhitungan resep bahan baku (HPP riil), dan laporan keuangan multi-toko dalam satu platform terpadu.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <Link href="/login">
            <Button size="lg" className="bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25 px-6">
              Buka POS Kasir & Dashboard <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="px-6">
              Lihat Demo Dashboard
            </Button>
          </Link>
        </div>

        {/* Modules Grid */}
        <div className="mt-16 sm:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          <Card className="hover:border-amber-500/40 transition-colors shadow-xs">
            <CardHeader className="pb-3">
              <div className="size-10 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mb-2">
                <Store className="size-5" />
              </div>
              <CardTitle>POS & Kasir Cepat</CardTitle>
              <CardDescription>
                Antarmuka kasir intuitif untuk pesanan dine-in & takeaway, perhitungan pajak & diskon otomatis.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Mendukung berbagai metode pembayaran (Tunai dengan hitung kembalian, QRIS statis/dinamis, EDC, Transfer).
            </CardContent>
          </Card>

          <Card className="hover:border-amber-500/40 transition-colors shadow-xs">
            <CardHeader className="pb-3">
              <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center mb-2">
                <QrCode className="size-5" />
              </div>
              <CardTitle>QR Code Self-Ordering</CardTitle>
              <CardDescription>
                Pelanggan cukup scan QR di meja, memilih menu, dan memesan langsung dari smartphone tanpa antre.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Otomatis terhubung ke dapur kasir dan menandai status meja terisi (*occupied*) secara real-time.
            </CardContent>
          </Card>

          <Card className="hover:border-amber-500/40 transition-colors shadow-xs">
            <CardHeader className="pb-3">
              <div className="size-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-2">
                <BarChart3 className="size-5" />
              </div>
              <CardTitle>Resep & Deduksi Stok Riil</CardTitle>
              <CardDescription>
                Setiap cangkir kopi yang terjual otomatis memotong gramatur biji kopi dan mililiter susu di gudang.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground">
              Perhitungan HPP otomatis (*Moving Average Cost*), deteksi bahan terbuang (*wastage*), dan audit stok fisik.
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 POS Coffee & F&B Multi-Tenant SaaS Platform. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-emerald-600" /> PostgreSQL Native Isolation
            </span>
            <span>Laravel 11 Backend + Next.js Frontend</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
