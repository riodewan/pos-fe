'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Printer,
  ChefHat,
  Calendar,
  QrCode,
  Package,
  TrendingUp,
  CreditCard,
  Store,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Sparkles,
  ChevronRight,
  Clock,
  Coffee,
  Users,
  Check,
  Smartphone,
  Layers,
  Banknote,
  Sliders,
  DollarSign,
} from 'lucide-react';
import { NemuLogo } from '@/components/common/NemuLogo';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, user, logout } = useAuth();
  const [activePreviewTab, setActivePreviewTab] = useState<'pos' | 'kds' | 'table' | 'qr'>('pos');
  const [outletCount, setOutletCount] = useState(2);
  const [dailyTransactions, setDailyTransactions] = useState(150);

  // ROI calculations
  const hoursSavedPerMonth = Math.round(outletCount * 45);
  const stockWastePrevented = Math.round(outletCount * dailyTransactions * 30 * 1200);

  return (
    <div className="min-h-screen flex flex-col bg-[#0D0D0D] text-white selection:bg-[#FF5C38] selection:text-white">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#121212]/90 border-b border-neutral-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <NemuLogo size="md" theme="dark" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-neutral-300">
            <Link
              href="#fitur"
              className="hover:text-white transition-colors"
            >
              Fitur Lengkap
            </Link>
            <Link
              href="#preview"
              className="hover:text-white transition-colors"
            >
              Demo Interaktif
            </Link>
            <Link
              href="#kalkulator"
              className="hover:text-white transition-colors"
            >
              Kalkulator Efisiensi
            </Link>
            <Link
              href="/dashboard/pos"
              className="flex items-center gap-1.5 text-neutral-300 hover:text-[#FF5C38] transition-colors"
            >
              <Printer className="size-3.5 text-[#FF5C38]" />
              <span>POS Terminal</span>
            </Link>
            <Link
              href="/dashboard/kds"
              className="flex items-center gap-1.5 text-neutral-300 hover:text-[#FF5C38] transition-colors"
            >
              <ChefHat className="size-3.5 text-[#FF5C38]" />
              <span>KDS Dapur</span>
            </Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                <Link href="/dashboard">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-4 py-2 rounded-xl shadow-xs text-xs"
                  >
                    Buka Dashboard
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => logout?.()}
                  className="px-3 py-1.5 rounded-xl border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Keluar
                </button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl text-neutral-300 hover:text-white hover:bg-neutral-800/60 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Masuk
                  </button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-4 py-2 rounded-xl shadow-xs text-xs"
                  >
                    Mulai Sekarang
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-16 sm:pt-24 pb-20 px-4 sm:px-6">
        {/* Glow ambient background lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-[#FF5C38]/20 via-[#FF5C38]/5 to-transparent blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-20 right-10 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-neutral-800 bg-[#171717]/80 backdrop-blur-md text-[11px] font-bold text-neutral-300 shadow-xs">
            <span className="size-2 rounded-full bg-[#FF5C38] animate-ping" />
            <span className="text-[#FF5C38]">Platform Operasional F&B</span>
            <span className="text-neutral-500">•</span>
            <span>Kasir, Dapur & Multi-Outlet</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] text-white">
            Kelola POS, Dapur, & Multi-Outlet{' '}
            <span className="bg-gradient-to-r from-[#FF5C38] via-orange-400 to-[#FF8566] bg-clip-text text-transparent">
              Lebih Cepat
            </span>{' '}
            dengan NemuHUB.
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-neutral-400 max-w-3xl mx-auto leading-relaxed">
            Satu sistem terpadu untuk Kasir (POS) kilat, Kitchen Display System (KDS) real-time, Reservasi meja visual, QR Order mandiri, dan pembukuan keuangan multi-cabang tanpa selisih.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/register">
              <Button
                variant="primary"
                size="lg"
                className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-6 py-3.5 rounded-xl shadow-lg shadow-[#FF5C38]/25 text-sm flex items-center gap-2 cursor-pointer transition-all"
              >
                <span>Mulai Coba Gratis</span>
                <ArrowRight className="size-4" />
              </Button>
            </Link>

            <Link href="/dashboard/pos">
              <button
                type="button"
                className="px-5 py-3 rounded-xl border border-neutral-800 bg-[#1A1A1A] hover:bg-neutral-800 text-neutral-200 text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Printer className="size-4 text-[#FF5C38]" />
                <span>Buka Demo POS Kasir</span>
              </button>
            </Link>

            <Link href="/dashboard/kds">
              <button
                type="button"
                className="px-5 py-3 rounded-xl border border-neutral-800 bg-[#1A1A1A] hover:bg-neutral-800 text-neutral-200 text-sm font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <ChefHat className="size-4 text-amber-400" />
                <span>Buka Demo KDS Dapur</span>
              </button>
            </Link>
          </div>

          {/* Social Proof Stats Banner */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-[#141414] border border-neutral-800/80 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-[#FF5C38]">99.98%</p>
              <p className="text-xs text-neutral-400 mt-1 font-medium">Uptime Stabilitas</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#141414] border border-neutral-800/80 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">&lt; 1.8 dtk</p>
              <p className="text-xs text-neutral-400 mt-1 font-medium">Kecepatan Transaksi</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#141414] border border-neutral-800/80 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-white">500+</p>
              <p className="text-xs text-neutral-400 mt-1 font-medium">Outlet F&B Aktif</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#141414] border border-neutral-800/80 text-center">
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">0%</p>
              <p className="text-xs text-neutral-400 mt-1 font-medium">Selisih Rekonsiliasi</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Interactive Live Showcase / Preview Section */}
      <section id="preview" className="py-16 px-4 sm:px-6 bg-[#111111] border-y border-neutral-800/80">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Eksplorasi Antarmuka NemuHUB
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Lihat bagaimana setiap modul dirancang untuk kenyamanan staf kasir, barista, koki dapur, hingga pelanggan.
            </p>
          </div>

          {/* Interactive Tab Switcher */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
            {[
              { id: 'pos', label: 'POS Terminal Kasir', icon: Printer },
              { id: 'kds', label: 'Kitchen Display (KDS)', icon: ChefHat },
              { id: 'table', label: 'Reservasi & Denah Meja', icon: Calendar },
              { id: 'qr', label: 'Customer QR Self-Order', icon: QrCode },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activePreviewTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActivePreviewTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-[#FF5C38] text-white shadow-md shadow-[#FF5C38]/20'
                      : 'bg-[#1C1C1C] border border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="size-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Preview Window Card */}
          <div className="rounded-3xl border border-neutral-800 bg-[#161616] p-4 sm:p-6 shadow-2xl relative overflow-hidden">
            {/* Top window dots */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-red-500/80" />
                <span className="size-3 rounded-full bg-amber-500/80" />
                <span className="size-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-neutral-500">
                  nemuhub.id/dashboard/{activePreviewTab}
                </span>
              </div>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                Live Interactive Mode
              </span>
            </div>

            {/* Mockup Canvas */}
            <div className="pt-4">
              {activePreviewTab === 'pos' && (
                <div className="bg-[#1C1C1C] rounded-2xl border border-neutral-800 p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5">
                  {/* Left: Menu Grid */}
                  <div className="md:col-span-8 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">Menu Kopi & Pastry</span>
                        <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">
                          Outlet Menteng
                        </span>
                      </div>
                      <div className="flex gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FF5C38] text-white text-[11px] font-bold">
                          Dine-in
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-neutral-800 text-neutral-400 text-[11px] font-bold">
                          Takeaway
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {[
                        { name: 'Kopi Susu Gula Aren', price: 'Rp 20.000', cat: 'Signature Coffee' },
                        { name: 'Americano Double Shot', price: 'Rp 22.000', cat: 'Coffee' },
                        { name: 'Creamy Matcha Latte', price: 'Rp 28.000', cat: 'Non-Coffee' },
                        { name: 'Butter Croissant', price: 'Rp 25.000', cat: 'Pastry' },
                        { name: 'Pain Au Chocolat', price: 'Rp 27.000', cat: 'Pastry' },
                        { name: 'Vanilla Ice Cream Latte', price: 'Rp 30.000', cat: 'Signature' },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-neutral-800 bg-[#222222] hover:border-[#FF5C38]/60 transition-all cursor-pointer group"
                        >
                          <div className="h-16 rounded-lg bg-neutral-800 flex items-center justify-center text-2xl mb-2 group-hover:scale-105 transition-transform">
                            ☕
                          </div>
                          <p className="text-xs font-bold text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-neutral-400">{item.cat}</p>
                          <p className="text-xs font-bold text-[#FF5C38] mt-1.5">{item.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Cart Summary */}
                  <div className="md:col-span-4 bg-[#222222] rounded-2xl border border-neutral-800 p-4 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                        <span className="font-bold text-xs text-white">Pesanan Meja 4</span>
                        <span className="text-[10px] font-mono text-neutral-400">#ORD-0024</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between items-center text-neutral-300">
                          <span>2x Kopi Susu Aren</span>
                          <span className="font-mono font-semibold">40.000</span>
                        </div>
                        <div className="flex justify-between items-center text-neutral-300">
                          <span>1x Butter Croissant</span>
                          <span className="font-mono font-semibold">25.000</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-neutral-800 space-y-2">
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>Subtotal</span>
                        <span>65.000</span>
                      </div>
                      <div className="flex justify-between text-xs text-neutral-400">
                        <span>PPN (11%)</span>
                        <span>7.150</span>
                      </div>
                      <div className="flex justify-between text-sm font-extrabold text-white pt-1 border-t border-neutral-800">
                        <span>Total Bayar</span>
                        <span className="text-[#FF5C38]">Rp 72.150</span>
                      </div>
                      <Link href="/dashboard/pos" className="block pt-1">
                        <Button
                          variant="primary"
                          className="w-full bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold py-2.5 rounded-xl text-xs"
                        >
                          Bayar & Cetak Struk
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'kds' && (
                <div className="bg-[#1C1C1C] rounded-2xl border border-neutral-800 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      table: 'Meja 3 (Dine-in)',
                      id: '#ORD-0018',
                      status: 'Pesanan Baru',
                      statusColor: 'bg-[#FF5C38]',
                      time: '02:14 lalu',
                      items: ['2x Kopi Susu Aren (Less Sugar)', '1x Croissant Panas'],
                    },
                    {
                      table: 'Meja 5 (Dine-in)',
                      id: '#ORD-0012',
                      status: 'Sedang Dimasak',
                      statusColor: 'bg-amber-500',
                      time: '06:45 lalu',
                      items: ['1x Americano Double Shot', '1x Chocolate Roll'],
                    },
                    {
                      table: 'Takeaway - Budi',
                      id: '#ORD-0020',
                      status: 'Siap Saji',
                      statusColor: 'bg-emerald-500',
                      time: '11:20 lalu',
                      items: ['3x Matcha Latte Ice'],
                    },
                  ].map((ticket, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl border border-neutral-800 bg-[#222222] space-y-3"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                        <div>
                          <p className="text-xs font-bold text-white">{ticket.table}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">{ticket.id}</p>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${ticket.statusColor}`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-xs text-neutral-200">
                        {ticket.items.map((it, idx) => (
                          <p key={idx} className="flex items-center gap-1.5">
                            <span className="size-1 rounded-full bg-[#FF5C38]" /> {it}
                          </p>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3 text-amber-400" /> {ticket.time}
                        </span>
                        <span className="text-[#FF5C38] font-bold cursor-pointer hover:underline">
                          Selesaikan →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activePreviewTab === 'table' && (
                <div className="bg-[#1C1C1C] rounded-2xl border border-neutral-800 p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Denah Meja Outlet Menteng</span>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <span className="size-2 rounded-full bg-emerald-400" /> Kosong (8)
                      </span>
                      <span className="flex items-center gap-1.5 text-[#FF5C38]">
                        <span className="size-2 rounded-full bg-[#FF5C38]" /> Terisi (4)
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-400">
                        <span className="size-2 rounded-full bg-amber-400" /> Reservasi (2)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {[
                      { num: 1, cap: 2, status: 'Kosong', color: 'border-emerald-500/40 bg-emerald-500/10' },
                      { num: 2, cap: 2, status: 'Kosong', color: 'border-emerald-500/40 bg-emerald-500/10' },
                      { num: 3, cap: 4, status: 'Terisi', color: 'border-[#FF5C38]/40 bg-[#FF5C38]/10' },
                      { num: 4, cap: 4, status: 'Terisi', color: 'border-[#FF5C38]/40 bg-[#FF5C38]/10' },
                      { num: 5, cap: 6, status: 'Reservasi', color: 'border-amber-500/40 bg-amber-500/10' },
                      { num: 6, cap: 6, status: 'Kosong', color: 'border-emerald-500/40 bg-emerald-500/10' },
                    ].map((tbl) => (
                      <div
                        key={tbl.num}
                        className={`p-3.5 rounded-xl border ${tbl.color} text-center space-y-1 cursor-pointer transition-transform hover:scale-105`}
                      >
                        <p className="text-base font-extrabold text-white">Meja {tbl.num}</p>
                        <p className="text-[10px] text-neutral-400">{tbl.cap} Orang</p>
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 text-neutral-300">
                          {tbl.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activePreviewTab === 'qr' && (
                <div className="bg-[#1C1C1C] rounded-2xl border border-neutral-800 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-around gap-6">
                  <div className="space-y-3 max-w-sm text-center sm:text-left">
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-bold">
                      Scan Meja & Bayar Instan
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      Pemesanan Meja Mandiri tanpa Antrean Kasir
                    </h3>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      Pelanggan cukup scan QR di atas meja dengan kamera HP. Menu digital langsung terbuka, pesanan otomatis masuk ke kasir dan dapur.
                    </p>
                    <Link href="/q/demo" className="inline-block pt-1">
                      <Button
                        variant="primary"
                        size="sm"
                        className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold text-xs"
                      >
                        Coba Layar Pelanggan (/q/[token])
                      </Button>
                    </Link>
                  </div>

                  {/* QR Card Graphic */}
                  <div className="p-5 rounded-2xl bg-white text-neutral-900 shadow-xl flex flex-col items-center space-y-2 border border-neutral-200">
                    <p className="text-[11px] font-bold tracking-tight">Kopi Mantap - Meja 4</p>
                    <div className="size-36 p-2 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center justify-center">
                      <QrCode className="size-28 text-neutral-900" />
                    </div>
                    <p className="text-[10px] text-neutral-500 font-semibold">
                      Scan untuk Pesan & Bayar QRIS
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Bento Grid: 6 Core Modules Deep Dive */}
      <section id="fitur" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Solusi Lengkap untuk Segala Kebutuhan F&B
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400">
            Dari kedai kopi artisanal satu cabang hingga jaringan resto multi-outlet dengan puluhan cabang di berbagai kota.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bento 1: POS Kasir Cepat */}
          <div className="p-6 rounded-3xl border border-neutral-800 bg-[#161616] hover:border-[#FF5C38]/40 transition-all space-y-3">
            <div className="size-11 rounded-2xl bg-red-500/10 text-[#FF5C38] flex items-center justify-center">
              <Printer className="size-5 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-white">POS Kasir Kilat & Offline-Ready</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Transaksi kasir dine-in, takeaway, delivery tanpa lag. Dilengkapi split bill per item/orang, multi-diskon, dan cetak struk thermal via Bluetooth.
            </p>
          </div>

          {/* Bento 2: Kitchen Display System (KDS) */}
          <div className="p-6 rounded-3xl border border-neutral-800 bg-[#161616] hover:border-[#FF5C38]/40 transition-all space-y-3">
            <div className="size-11 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <ChefHat className="size-5 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-white">Kitchen Display System (KDS)</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Otomasi antrean dapur dengan timer status Masak/Siap Saji. Pisahkan pesanan bar minuman dan dapur makanan secara otomatis.
            </p>
          </div>

          {/* Bento 3: Reservasi & Manajemen Meja */}
          <div className="p-6 rounded-3xl border border-neutral-800 bg-[#161616] hover:border-[#FF5C38]/40 transition-all space-y-3">
            <div className="size-11 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Calendar className="size-5 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-white">Reservasi & Tata Letak Meja</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Denah meja visual interaktif area indoor, outdoor, dan VIP. Atur kapasitas dan terima reservasi pelanggan tanpa bentrok jadwal.
            </p>
          </div>

          {/* Bento 4: QR Self-Ordering Mandiri */}
          <div className="p-6 rounded-3xl border border-neutral-800 bg-[#161616] hover:border-[#FF5C38]/40 transition-all space-y-3">
            <div className="size-11 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <QrCode className="size-5 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-white">QR Code Order Mandiri</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Tingkatkan omset per meja dengan menu digital QR. Pelanggan pesan langsung dan bayar QRIS instan tanpa menunggu pelayan.
            </p>
          </div>

          {/* Bento 5: Inventori & HPP Berbasis Resep */}
          <div className="p-6 rounded-3xl border border-neutral-800 bg-[#161616] hover:border-[#FF5C38]/40 transition-all space-y-3">
            <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Package className="size-5 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-white">Inventori Resep & HPP Otomatis</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Setiap cangkir kopi yang terjual langsung memotong gramasi biji kopi, susu, dan sirup secara riil. Pantau COGS dan sisa stok akurat.
            </p>
          </div>

          {/* Bento 6: Rekonsiliasi MDR & Keuangan */}
          <div className="p-6 rounded-3xl border border-neutral-800 bg-[#161616] hover:border-[#FF5C38]/40 transition-all space-y-3">
            <div className="size-11 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Banknote className="size-5 stroke-[2.2]" />
            </div>
            <h3 className="text-base font-bold text-white">Rekonsiliasi MDR & Finansial</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Pisahkan nominal bruto, potongan fee MDR QRIS/EDC, dan pencairan bersih (settlement) ke rekening bank tanpa hitung manual.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Interactive ROI & Efficiency Calculator */}
      <section id="kalkulator" className="py-20 px-4 sm:px-6 bg-[#131313] border-t border-neutral-800/80">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <span className="px-3 py-1 rounded-full bg-[#FF5C38]/10 text-[#FF5C38] text-xs font-bold">
              Kalkulator Efisiensi
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Hitung Penghematan & Waktu di Outlet Anda
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Geser nilai untuk melihat estimasi waktu dan penghematan biaya bahan baku setiap bulan.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl border border-neutral-800 bg-[#181818] grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Sliders */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center text-xs font-bold text-neutral-200 mb-2">
                  <span>Jumlah Outlet Aktif</span>
                  <span className="text-[#FF5C38] font-extrabold text-sm">{outletCount} Cabang</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={outletCount}
                  onChange={(e) => setOutletCount(Number(e.target.value))}
                  className="w-full accent-[#FF5C38] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold text-neutral-200 mb-2">
                  <span>Rata-rata Transaksi / Hari per Cabang</span>
                  <span className="text-[#FF5C38] font-extrabold text-sm">{dailyTransactions} Transaksi</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={800}
                  step={25}
                  value={dailyTransactions}
                  onChange={(e) => setDailyTransactions(Number(e.target.value))}
                  className="w-full accent-[#FF5C38] cursor-pointer"
                />
              </div>
            </div>

            {/* Calculated Results Card */}
            <div className="p-6 rounded-2xl bg-[#222222] border border-neutral-700/80 space-y-4 text-center">
              <div>
                <p className="text-xs font-semibold text-neutral-400">Waktu Rekonsiliasi & Input Yang Dihemat</p>
                <p className="text-3xl sm:text-4xl font-extrabold text-[#FF5C38] mt-1">
                  ~{hoursSavedPerMonth} Jam / bln
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-800">
                <p className="text-xs font-semibold text-neutral-400">Estimasi Pencegahan Kebocoran Bahan</p>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1">
                  Rp {stockWastePrevented.toLocaleString('id-ID')} / bln
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Big CTA Banner */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-[#FF5C38] to-[#D9381E] p-8 sm:p-14 text-center text-white relative shadow-2xl space-y-6">
          <div className="size-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-2">
            <Store className="size-8 text-white stroke-[2.2]" />
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight">
            Siap Mengembangkan Bisnis F&B Anda Lebih Cepat?
          </h2>

          <p className="text-xs sm:text-sm text-white/90 max-w-xl mx-auto leading-relaxed">
            Bergabunglah dengan ratusan pemilik coffee shop, cafe, dan resto yang telah beralih ke NemuHUB. Gratis uji coba penuh tanpa syarat kartu kredit.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/register">
              <Button
                variant="primary"
                size="lg"
                className="bg-white hover:bg-neutral-100 text-neutral-900 font-extrabold px-8 py-3.5 rounded-xl shadow-lg text-sm cursor-pointer"
              >
                Daftar Sekarang Gratis
              </Button>
            </Link>

            <Link href="/dashboard/pos">
              <button
                type="button"
                className="px-6 py-3.5 rounded-xl border border-white/30 bg-black/20 hover:bg-black/30 text-white text-sm font-bold transition-all cursor-pointer"
              >
                Buka Layar Kasir POS
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-neutral-800/80 bg-[#0E0E0E] py-12 px-4 sm:px-6 text-neutral-400 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 pb-10 border-b border-neutral-800">
          <div className="md:col-span-2 space-y-3">
            <NemuLogo size="md" theme="dark" />
            <p className="text-neutral-400 max-w-sm leading-relaxed text-xs">
              Platform operasional all-in-one untuk POS kasir, KDS dapur, reservasi meja, dan inventori multi-outlet F&B di Indonesia.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Modul Utama</h4>
            <div className="space-y-2">
              <Link href="/dashboard/pos" className="block hover:text-white transition-colors">POS Terminal</Link>
              <Link href="/dashboard/kds" className="block hover:text-white transition-colors">Kitchen Display (KDS)</Link>
              <Link href="/dashboard/reservations" className="block hover:text-white transition-colors">Reservasi Meja</Link>
              <Link href="/dashboard/qr-order" className="block hover:text-white transition-colors">QR Order Mandiri</Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Operasional</h4>
            <div className="space-y-2">
              <Link href="/dashboard/inventory" className="block hover:text-white transition-colors">Inventori & Bahan</Link>
              <Link href="/dashboard/recipes" className="block hover:text-white transition-colors">Resep & HPP</Link>
              <Link href="/dashboard/reports" className="block hover:text-white transition-colors">Laporan Penjualan</Link>
              <Link href="/dashboard/finance" className="block hover:text-white transition-colors">Keuangan & Rekonsiliasi</Link>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-3 text-xs uppercase tracking-wider">Perusahaan</h4>
            <div className="space-y-2">
              <Link href="/dashboard/settings/profile" className="block hover:text-white transition-colors">Profile Outlet</Link>
              <Link href="/dashboard/settings/account" className="block hover:text-white transition-colors">Profile Akun</Link>
              <Link href="/dashboard/settings" className="block hover:text-white transition-colors">Pengaturan Sistem</Link>
              <Link href="/login" className="block hover:text-white transition-colors">Portal Masuk</Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© 2026 NemuHUB. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-neutral-300">Kebijakan Privasi</Link>
            <Link href="#" className="hover:text-neutral-300">Syarat Layanan</Link>
            <Link href="#" className="hover:text-neutral-300">Pusat Bantuan</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
