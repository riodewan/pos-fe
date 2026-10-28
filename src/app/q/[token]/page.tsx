'use client';

import React, { useState, useEffect, useMemo, use, Suspense } from 'react';
import {
  Coffee,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  QrCode as QrIcon,
  CreditCard,
  ShieldCheck,
  Clock,
  ChevronRight,
  Check,
  Utensils,
  Receipt,
  Sparkles,
  Search,
  X,
  MapPin,
  ShoppingBag,
  Store,
  ChevronDown,
  Info,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { publicService } from '@/services';
import { PublicQrResolved, Order, OrderStatus } from '@/types';
import { ApiError } from '@/lib/api';
import { formatRupiah } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/common/ThemeToggle';

interface CustomerCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  notes?: string;
}

type PaymentOption = 'QRIS' | 'CASH_COUNTER';

function CustomerMenuSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-zinc-950 p-4 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center gap-3">
            <Skeleton className="size-11 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-5 w-36 rounded" />
              <Skeleton className="h-3.5 w-24 rounded" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>

        {/* Search Skeleton */}
        <Skeleton className="h-11 w-full rounded-xl" />

        {/* Product Cards Grid Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-neutral-200/80 dark:border-zinc-800 shadow-xs flex items-center gap-3.5"
            >
              <Skeleton className="size-20 rounded-xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
                <Skeleton className="h-5 w-20 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CustomerQrContent({ token }: { token: string }) {
  const [session, setSession] = useState<PublicQrResolved | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Cart & Customer details
  const [cart, setCart] = useState<CustomerCartItem[]>([]);
  const [mobileCartDrawerOpen, setMobileCartDrawerOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Payment Gateway State
  const [selectedPayment, setSelectedPayment] = useState<PaymentOption>('QRIS');
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [countdownSeconds, setCountdownSeconds] = useState(900); // 15 mins

  // Confirmed Order State & Live Tracker
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [liveOrderStatus, setLiveOrderStatus] = useState<OrderStatus>('PREPARING');

  // Fetch Public QR Data
  useEffect(() => {
    async function resolveQr() {
      setLoading(true);
      setErrorMsg(null);
      try {
        const res = await publicService.resolveQrToken(token);
        setSession(res.data);
      } catch (err: unknown) {
        if (err instanceof ApiError) {
          setErrorMsg(err.message || 'QR code tidak valid atau telah kedaluwarsa.');
        } else {
          setErrorMsg('Gagal memuat menu. Periksa koneksi internet Anda.');
        }
      } finally {
        setLoading(false);
      }
    }
    if (token) {
      resolveQr();
    }
  }, [token]);

  // Payment Countdown Timer
  useEffect(() => {
    if (!paymentModalOpen || countdownSeconds <= 0) return;
    const interval = setInterval(() => {
      setCountdownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentModalOpen, countdownSeconds]);

  // Live Order Status Polling (after order is placed)
  useEffect(() => {
    if (!confirmedOrder || !token) return;
    const interval = setInterval(async () => {
      try {
        const res = await publicService.trackCustomerOrder(token, confirmedOrder.id);
        if (res.data) {
          setLiveOrderStatus(res.data.status);
        }
      } catch (err) {
        // silently catch tracking error
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [confirmedOrder, token]);

  // Clean table name helper (avoids "Meja Meja 01")
  const tableNameFormatted = useMemo(() => {
    if (!session?.table?.name) return 'Meja Pelanggan';
    const raw = session.table.name.trim();
    return raw.toLowerCase().startsWith('meja') ? raw : `Meja ${raw}`;
  }, [session?.table?.name]);

  // Categories helper
  const categories = useMemo(() => {
    if (!session?.products) return ['Semua'];
    const cats = new Set<string>();
    cats.add('Semua');

    session.products.forEach((p) => {
      const lower = `${p.name} ${p.description || ''}`.toLowerCase();
      if (lower.includes('latte') || lower.includes('coffee') || lower.includes('kopi') || lower.includes('espresso') || lower.includes('americano')) {
        cats.add('Coffee');
      } else if (lower.includes('tea') || lower.includes('matcha') || lower.includes('teh')) {
        cats.add('Tea & Latte');
      } else if (lower.includes('croissant') || lower.includes('roti') || lower.includes('bread') || lower.includes('pastry') || lower.includes('cake')) {
        cats.add('Pastry & Bakery');
      } else {
        cats.add('Lainnya');
      }
    });

    return Array.from(cats);
  }, [session?.products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    if (!session?.products) return [];
    return session.products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'Semua') {
        const lower = `${p.name} ${p.description || ''}`.toLowerCase();
        if (selectedCategory === 'Coffee') {
          if (!lower.includes('latte') && !lower.includes('coffee') && !lower.includes('kopi') && !lower.includes('espresso') && !lower.includes('americano')) return false;
        } else if (selectedCategory === 'Tea & Latte') {
          if (!lower.includes('tea') && !lower.includes('matcha') && !lower.includes('teh')) return false;
        } else if (selectedCategory === 'Pastry & Bakery') {
          if (!lower.includes('croissant') && !lower.includes('roti') && !lower.includes('bread') && !lower.includes('pastry') && !lower.includes('cake')) return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q));
      }

      return true;
    });
  }, [session?.products, selectedCategory, searchQuery]);

  // Cart Actions
  const addToCart = (prod: PublicQrResolved['products'][0]) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === prod.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === prod.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          productId: prod.id,
          name: prod.name,
          price: Number(prod.selling_price),
          quantity: 1,
          imageUrl: prod.image_url,
          notes: '',
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CustomerCartItem[]
    );
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Calculate tax if configured
  const taxPct = session?.settings?.tax_percentage || 0;
  const taxAmount = taxPct > 0 ? Math.round((subtotal * taxPct) / 100) : 0;
  const totalPayable = subtotal + taxAmount;

  const formatCurrency = formatRupiah;

  // Step 1: Open Payment Gateway Step
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Mohon isi nama Anda terlebih dahulu.');
      return;
    }
    if (cart.length === 0) return;

    if (selectedPayment === 'CASH_COUNTER') {
      handleConfirmExecutePayment();
    } else {
      setCountdownSeconds(900);
      setPaymentModalOpen(true);
    }
  };

  // Step 2: Execute Direct Self-Service Payment & Order Creation
  const handleConfirmExecutePayment = async () => {
    setProcessingPayment(true);
    try {
      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || null,
        notes: orderNotes.trim() || null,
        payment_method: selectedPayment === 'QRIS' ? 'QRIS' : 'CASH',
        items: cart.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
          notes: i.notes || null,
        })),
      };

      const res = await publicService.submitCustomerOrder(token, payload);
      const newOrder = res.data;

      setConfirmedOrder(newOrder);
      setLiveOrderStatus(newOrder.status || 'PREPARING');
      setPaymentModalOpen(false);
      setMobileCartDrawerOpen(false);
      setCart([]);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        alert(err.message || 'Gagal memproses pesanan.');
      } else {
        alert('Terjadi kesalahan saat memproses pesanan.');
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return <CustomerMenuSkeleton />;
  }

  if (errorMsg || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-neutral-50 dark:bg-zinc-950">
        <div className="size-16 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 flex items-center justify-center mb-4">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900 dark:text-zinc-100">QR Code Tidak Valid</h2>
        <p className="text-sm text-neutral-500 dark:text-zinc-400 mt-2 max-w-sm leading-relaxed">
          {errorMsg || 'Token QR tidak ditemukan atau sudah kedaluwarsa. Silakan tanyakan kepada staf atau kasir.'}
        </p>
      </div>
    );
  }

  // ============================================================
  // CONFIRMED ORDER & LIVE TRACKING VIEW
  // ============================================================
  if (confirmedOrder) {
    const isPreparing = liveOrderStatus === 'PREPARING' || liveOrderStatus === 'CONFIRMED' || liveOrderStatus === 'PENDING';
    const isReady = liveOrderStatus === 'READY';
    const isCompleted = liveOrderStatus === 'COMPLETED';

    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-neutral-50 dark:bg-zinc-950">
        <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl border border-neutral-200/90 dark:border-zinc-800 p-6 sm:p-7 shadow-xl space-y-6 text-center animate-in fade-in zoom-in-95">
          {/* Success Banner */}
          <div className="space-y-2">
            <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="size-9" />
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Check className="size-3.5 stroke-[2.5]" />
              <span>PESANAN BERHASIL DITERIMA</span>
            </span>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-zinc-100 tracking-tight pt-1">
              Terima Kasih, {customerName}!
            </h2>
            <p className="text-xs text-neutral-500 dark:text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Pesanan Anda sudah masuk ke antrean barista. Silakan duduk santai di {tableNameFormatted}.
            </p>
          </div>

          {/* Real-time Order Preparation Stepper */}
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-zinc-800/50 border border-neutral-200/80 dark:border-zinc-700/80 text-left space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200/70 dark:border-zinc-700/60">
              <span className="text-xs font-bold text-neutral-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="size-3.5 text-orange-600" /> Status Dapur / Barista
              </span>
              <span className="text-xs font-mono font-semibold text-neutral-500 dark:text-zinc-400">
                #{confirmedOrder.order_number}
              </span>
            </div>

            {/* Step 1: Order confirmed */}
            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs">
                <Check className="size-3.5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-neutral-900 dark:text-zinc-100">Pesanan Dikonfirmasi</p>
                <p className="text-[11px] text-neutral-500 dark:text-zinc-400">Diverifikasi untuk {tableNameFormatted}</p>
              </div>
            </div>

            {/* Step 2: Preparing */}
            <div className="flex items-start gap-3">
              <div
                className={`size-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs ${
                  isPreparing
                    ? 'bg-orange-500 text-white ring-4 ring-orange-500/20 animate-pulse'
                    : isReady || isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-neutral-200 dark:bg-zinc-700 text-neutral-400'
                }`}
              >
                {isReady || isCompleted ? (
                  <Check className="size-3.5" />
                ) : (
                  <Loader2 className="size-3.5 animate-spin" />
                )}
              </div>
              <div className="text-xs">
                <p className="font-bold text-neutral-900 dark:text-zinc-100">Sedang Disiapkan Barista</p>
                <p className="text-[11px] text-neutral-500 dark:text-zinc-400">
                  {isPreparing ? 'Pesanan sedang diracik dan disiapkan' : 'Selesai disiapkan'}
                </p>
              </div>
            </div>

            {/* Step 3: Ready / Served */}
            <div className="flex items-start gap-3">
              <div
                className={`size-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 shadow-xs ${
                  isReady
                    ? 'bg-emerald-600 text-white ring-4 ring-emerald-600/20'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-neutral-200 dark:bg-zinc-700 text-neutral-400'
                }`}
              >
                {isCompleted ? <Check className="size-3.5" /> : <Coffee className="size-3.5" />}
              </div>
              <div className="text-xs">
                <p className={`font-bold ${isReady ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-neutral-900 dark:text-zinc-100'}`}>
                  {isReady ? 'Siap Diantar ke Meja!' : isCompleted ? 'Pesanan Selesai' : 'Siap Saji'}
                </p>
                <p className="text-[11px] text-neutral-500 dark:text-zinc-400">
                  {isReady ? 'Staf segera menyajikan pesanan Anda' : 'Disajikan langsung ke meja Anda'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Details Receipt Box */}
          <div className="p-4 rounded-2xl border border-neutral-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-zinc-400">Outlet:</span>
              <span className="font-semibold text-neutral-900 dark:text-zinc-100">{session.store.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-zinc-400">Nomor Meja:</span>
              <span className="font-bold text-neutral-900 dark:text-zinc-100">{tableNameFormatted} ({session.table.code})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500 dark:text-zinc-400">Metode Bayar:</span>
              <span className="font-semibold text-neutral-900 dark:text-zinc-100">
                {selectedPayment === 'QRIS' ? 'QRIS Instan (Lunas)' : 'Bayar di Kasir'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-neutral-100 dark:border-zinc-800 font-bold text-sm">
              <span>Total Pesanan:</span>
              <span className="text-orange-600 dark:text-orange-400 font-extrabold">
                {formatCurrency(confirmedOrder.total_amount)}
              </span>
            </div>
          </div>

          <Button
            onClick={() => {
              setConfirmedOrder(null);
              setCart([]);
            }}
            variant="outline"
            className="w-full text-xs font-semibold py-3.5 rounded-xl border-neutral-300 dark:border-zinc-700"
          >
            Pesan Menu Tambahan
          </Button>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN MENU CATALOG VIEW (RESPONSIVE DESKTOP & MOBILE)
  // ============================================================
  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 pb-28 text-neutral-900 dark:text-zinc-100">
      {/* Top Banner & Header */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-neutral-200/80 dark:border-zinc-800 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-600/20">
              <Coffee className="size-5" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-zinc-100 leading-tight truncate">
                {session.store.name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/60">
                  <MapPin className="size-3" />
                  <span>{tableNameFormatted}</span>
                </span>
                <span className="text-[11px] text-neutral-400 hidden sm:inline">•</span>
                <span className="text-[11px] text-neutral-500 dark:text-zinc-400 hidden sm:inline">Self-Order Dine In</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-zinc-800 border border-neutral-200 dark:border-zinc-700 text-xs font-medium text-neutral-700 dark:text-zinc-300">
              <Sparkles className="size-3.5 text-orange-500" />
              <span>Buka Sekarang</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 py-5 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Catalog Menu (8 Cols on Desktop) */}
          <div className="lg:col-span-8 space-y-5">
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari menu kopi, minuman, atau makanan..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm text-neutral-900 dark:text-zinc-100 placeholder:text-neutral-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 dark:hover:text-zinc-200 p-1"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Category Pills Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-sm font-semibold'
                        : 'bg-white dark:bg-zinc-900 text-neutral-600 dark:text-zinc-300 hover:bg-neutral-100 dark:hover:bg-zinc-800 border border-neutral-200/80 dark:border-zinc-800'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Menu Header Count */}
            <div className="flex items-center justify-between text-xs text-neutral-500 dark:text-zinc-400 px-1">
              <span>Menampilkan {filteredProducts.length} menu</span>
              <span>{tableNameFormatted}</span>
            </div>

            {/* Product Cards Grid: 1 col on mobile, 2 cols on tablet/desktop */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {filteredProducts.map((prod) => {
                  const inCart = cart.find((i) => i.productId === prod.id);

                  return (
                    <div
                      key={prod.id}
                      className="group p-3.5 rounded-2xl border border-neutral-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900 shadow-2xs hover:shadow-md hover:border-orange-500/40 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3.5">
                        {/* Product Photo Thumbnail */}
                        <div className="relative size-20 sm:size-24 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-zinc-800 border border-neutral-200/60 dark:border-zinc-700/60">
                          {prod.image_url ? (
                            <img
                              src={prod.image_url}
                              alt={prod.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 dark:text-zinc-500">
                              <Coffee className="size-6 opacity-60" />
                            </div>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-neutral-900 dark:text-zinc-100 leading-snug line-clamp-1 group-hover:text-orange-600 transition-colors">
                            {prod.name}
                          </h3>
                          {prod.description && (
                            <p className="text-[11px] text-neutral-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                              {prod.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bottom Row: Price & Quantity Controls */}
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-neutral-100 dark:border-zinc-800">
                        <span className="text-sm font-extrabold text-neutral-900 dark:text-zinc-100">
                          {formatCurrency(Number(prod.selling_price))}
                        </span>

                        <div className="shrink-0">
                          {inCart ? (
                            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-zinc-800 p-1 rounded-xl border border-neutral-200/70 dark:border-zinc-700">
                              <button
                                type="button"
                                onClick={() => updateQuantity(prod.id, -1)}
                                className="size-6 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 flex items-center justify-center text-neutral-800 dark:text-zinc-200 hover:bg-neutral-50 active:scale-95 transition-transform shadow-2xs"
                                title="Kurangi"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="text-xs font-bold w-4 text-center">{inCart.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(prod.id, 1)}
                                className="size-6 rounded-lg bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 flex items-center justify-center text-neutral-800 dark:text-zinc-200 hover:bg-neutral-50 active:scale-95 transition-transform shadow-2xs"
                                title="Tambah"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => addToCart(prod)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold shadow-xs shadow-orange-600/20 transition-all"
                            >
                              <Plus className="size-3.5 stroke-[2.5]" />
                              <span>Tambah</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-16 text-center space-y-2 bg-white dark:bg-zinc-900 rounded-2xl border border-neutral-200/80 dark:border-zinc-800 p-6">
                <Coffee className="size-8 text-neutral-400 mx-auto" />
                <h3 className="text-sm font-semibold text-neutral-800 dark:text-zinc-200">Tidak ada menu ditemukan</h3>
                <p className="text-xs text-neutral-500">Coba ubah kata kunci pencarian atau kategori filter.</p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Desktop Sticky Cart Summary (4 Cols ~ 33%) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-20">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-neutral-200/90 dark:border-zinc-800 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="size-4 text-orange-600" />
                  <h3 className="font-bold text-sm text-neutral-900 dark:text-zinc-100">Pesanan Anda</h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800/50">
                  {tableNameFormatted}
                </span>
              </div>

              {cart.length > 0 ? (
                <>
                  {/* Cart Items List */}
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between gap-3 text-xs p-2.5 rounded-xl bg-neutral-50 dark:bg-zinc-800/40 border border-neutral-100 dark:border-zinc-800"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="size-10 rounded-lg overflow-hidden shrink-0 bg-neutral-200 dark:bg-zinc-700">
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                                <Coffee className="size-4" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-neutral-900 dark:text-zinc-100 truncate">{item.name}</p>
                            <p className="text-[10px] text-neutral-400">
                              {formatCurrency(item.price)} × {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, -1)}
                            className="size-5 rounded bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 flex items-center justify-center hover:bg-neutral-50"
                          >
                            <Minus className="size-2.5" />
                          </button>
                          <span className="font-bold w-3 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.productId, 1)}
                            className="size-5 rounded bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 flex items-center justify-center hover:bg-neutral-50"
                          >
                            <Plus className="size-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Customer Information Form */}
                  <form onSubmit={handleProceedToPayment} className="space-y-3 pt-3 border-t border-neutral-100 dark:border-zinc-800 text-xs">
                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-700 dark:text-zinc-300">
                        Nama Pemesan <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Budi Santoso"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-zinc-700 bg-neutral-50/50 dark:bg-zinc-800/50 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-700 dark:text-zinc-300">
                        Catatan Dapur (Opsional)
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Less ice, gula dipisah"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-zinc-700 bg-neutral-50/50 dark:bg-zinc-800/50 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                      />
                    </div>

                    {/* Payment Options */}
                    <div className="space-y-1.5 pt-1">
                      <label className="font-semibold text-neutral-700 dark:text-zinc-300">
                        Metode Pembayaran
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPayment('QRIS')}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            selectedPayment === 'QRIS'
                              ? 'border-orange-600 bg-orange-50/40 dark:bg-orange-950/20 text-orange-900 dark:text-orange-300 ring-1 ring-orange-600'
                              : 'border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-neutral-600 dark:text-zinc-400'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-[11px]">QRIS Instan</span>
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-600 text-white font-black">QRIS</span>
                          </div>
                          <span className="text-[10px] text-neutral-400 mt-1">BCA, GoPay, OVO</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedPayment('CASH_COUNTER')}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                            selectedPayment === 'CASH_COUNTER'
                              ? 'border-orange-600 bg-orange-50/40 dark:bg-orange-950/20 text-orange-900 dark:text-orange-300 ring-1 ring-orange-600'
                              : 'border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-neutral-600 dark:text-zinc-400'
                          }`}
                        >
                          <div className="flex items-center justify-between w-full">
                            <span className="font-bold text-[11px]">Bayar di Kasir</span>
                            <Store className="size-3 text-neutral-400" />
                          </div>
                          <span className="text-[10px] text-neutral-400 mt-1">Tunai / EDC</span>
                        </button>
                      </div>
                    </div>

                    {/* Breakdown */}
                    <div className="pt-2 border-t border-neutral-100 dark:border-zinc-800 space-y-1">
                      <div className="flex justify-between text-neutral-500 dark:text-zinc-400">
                        <span>Subtotal ({totalItems} item)</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      {taxAmount > 0 && (
                        <div className="flex justify-between text-neutral-500 dark:text-zinc-400">
                          <span>PPN ({taxPct}%)</span>
                          <span>{formatCurrency(taxAmount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-2 font-bold text-sm text-neutral-900 dark:text-zinc-100 border-t border-neutral-100 dark:border-zinc-800">
                        <span>Total Bayar</span>
                        <span className="text-orange-600 dark:text-orange-400 text-base font-extrabold">
                          {formatCurrency(totalPayable)}
                        </span>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={processingPayment}
                      className="w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-bold py-3.5 rounded-2xl shadow-md shadow-orange-600/25 flex items-center justify-center gap-2 text-xs transition-all mt-3"
                    >
                      {processingPayment ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Memproses Pesanan...</span>
                        </>
                      ) : (
                        <>
                          <span>Konfirmasi & Bayar ({formatCurrency(totalPayable)})</span>
                          <ArrowRight className="size-4" />
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <div className="size-12 rounded-full bg-neutral-100 dark:bg-zinc-800 text-neutral-400 flex items-center justify-center mx-auto">
                    <ShoppingBag className="size-5" />
                  </div>
                  <p className="text-xs font-semibold text-neutral-700 dark:text-zinc-300">Keranjang masih kosong</p>
                  <p className="text-[11px] text-neutral-400 max-w-[200px] mx-auto">
                    Pilih menu yang Anda inginkan untuk memulai pemesanan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Cart Bar (Mobile Only) */}
      {cart.length > 0 && !mobileCartDrawerOpen && !paymentModalOpen && (
        <div className="lg:hidden fixed bottom-4 inset-x-4 z-40">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setMobileCartDrawerOpen(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-orange-600 text-white font-semibold shadow-xl shadow-orange-600/30 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-full bg-white/25 flex items-center justify-center text-xs font-bold">
                  {totalItems}
                </div>
                <div className="text-left">
                  <span className="text-xs font-bold block leading-none">Lihat Pesanan</span>
                  <span className="text-[10px] text-white/80">{tableNameFormatted}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <span>{formatCurrency(totalPayable)}</span>
                <ChevronRight className="size-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Slide-over / Bottom Drawer on Mobile for Checkout */}
      {mobileCartDrawerOpen && !paymentModalOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs p-0">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-t-3xl border-t border-neutral-200 dark:border-zinc-800 p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="size-4 text-orange-600" />
                <h3 className="font-bold text-sm text-neutral-900 dark:text-zinc-100">Ringkasan Pesanan</h3>
              </div>
              <button
                onClick={() => setMobileCartDrawerOpen(false)}
                className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-zinc-200 p-1"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-3 text-xs p-2.5 rounded-xl bg-neutral-50 dark:bg-zinc-800/40 border border-neutral-100 dark:border-zinc-800"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-10 rounded-lg overflow-hidden shrink-0 bg-neutral-200 dark:bg-zinc-700">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400">
                          <Coffee className="size-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-neutral-900 dark:text-zinc-100 truncate">{item.name}</p>
                      <p className="text-[10px] text-neutral-400">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="size-6 rounded-md bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 flex items-center justify-center"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="font-bold w-3 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="size-6 rounded-md bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-700 flex items-center justify-center"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Information Form */}
            <form onSubmit={handleProceedToPayment} className="space-y-3 pt-2 border-t border-neutral-100 dark:border-zinc-800 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-zinc-300">
                  Nama Anda <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rina Wijaya"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-zinc-700 bg-neutral-50/50 dark:bg-zinc-800/50 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-neutral-700 dark:text-zinc-300">
                  Catatan untuk Dapur (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Mis: Less sugar, es sedikit..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 dark:border-zinc-700 bg-neutral-50/50 dark:bg-zinc-800/50 text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Payment Method Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-neutral-700 dark:text-zinc-300">
                  Pilih Cara Bayar
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPayment('QRIS')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      selectedPayment === 'QRIS'
                        ? 'border-orange-600 bg-orange-50/40 dark:bg-orange-950/20 text-orange-900 dark:text-orange-300 ring-1 ring-orange-600'
                        : 'border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-neutral-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-[11px]">QRIS Instan</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-600 text-white font-black">QRIS</span>
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-1">BCA, GoPay, OVO</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPayment('CASH_COUNTER')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      selectedPayment === 'CASH_COUNTER'
                        ? 'border-orange-600 bg-orange-50/40 dark:bg-orange-950/20 text-orange-900 dark:text-orange-300 ring-1 ring-orange-600'
                        : 'border-neutral-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-neutral-600 dark:text-zinc-400'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-[11px]">Bayar di Kasir</span>
                      <Store className="size-3 text-neutral-400" />
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-1">Tunai / EDC</span>
                  </button>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="pt-2 border-t border-neutral-100 dark:border-zinc-800 space-y-1">
                <div className="flex justify-between text-neutral-500 dark:text-zinc-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-neutral-500 dark:text-zinc-400">
                    <span>PPN ({taxPct}%)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 font-bold text-sm text-neutral-900 dark:text-zinc-100 border-t border-neutral-100 dark:border-zinc-800">
                  <span>Total Pembayaran</span>
                  <span className="text-orange-600 dark:text-orange-400 text-base font-extrabold">
                    {formatCurrency(totalPayable)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 rounded-2xl shadow-md shadow-orange-600/25 flex items-center justify-center gap-2 text-xs transition-all mt-2"
              >
                <span>Lanjut ke Pembayaran ({formatCurrency(totalPayable)})</span>
                <ChevronRight className="size-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2: DYNAMIC QRIS MODAL */}
      {/* ============================================================ */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl border border-neutral-200/90 dark:border-zinc-800 p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[11px] tracking-wider">
                  QRIS
                </div>
                <span className="text-xs font-bold text-neutral-900 dark:text-zinc-100">Pembayaran Mandiri</span>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-zinc-200 p-1"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Total Display */}
            <div>
              <span className="text-xs text-neutral-500 dark:text-zinc-400">Total Tagihan</span>
              <h3 className="text-2xl font-black text-neutral-900 dark:text-zinc-100 mt-0.5">
                {formatCurrency(totalPayable)}
              </h3>
              <p className="text-[11px] text-neutral-500 dark:text-zinc-400 mt-0.5">
                {tableNameFormatted} • {customerName}
              </p>
            </div>

            {/* QRIS Code */}
            <div className="relative p-4 rounded-2xl bg-white border border-neutral-200 shadow-inner flex flex-col items-center justify-center mx-auto w-56">
              <QRCodeSVG
                value={`https://qris.id/pay/${token}?amount=${totalPayable}&t=${Date.now()}`}
                size={180}
                level="H"
                includeMargin={false}
              />
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                <ShieldCheck className="size-3 text-emerald-600" /> Standar QRIS Nasional
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 dark:text-zinc-400">
              <Clock className="size-3.5 text-neutral-700 dark:text-zinc-300" />
              <span>Sisa Waktu Bayar: </span>
              <span className="font-mono font-bold text-neutral-900 dark:text-zinc-100">
                {String(Math.floor(countdownSeconds / 60)).padStart(2, '0')}:
                {String(countdownSeconds % 60).padStart(2, '0')}
              </span>
            </div>

            <div className="text-[11px] text-neutral-500 dark:text-zinc-400 leading-relaxed bg-neutral-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-neutral-100 dark:border-zinc-800 text-left space-y-1">
              <p className="font-semibold text-neutral-800 dark:text-zinc-200">Petunjuk Pembayaran:</p>
              <p>1. Buka m-Banking (BCA, Mandiri, BRI) atau E-Wallet (GoPay, OVO, ShopeePay).</p>
              <p>2. Scan kode QRIS di atas dan selesaikan pembayaran.</p>
            </div>

            {/* Confirmation simulation button */}
            <button
              onClick={handleConfirmExecutePayment}
              disabled={processingPayment}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-600/25 text-xs flex items-center justify-center gap-2 transition-all"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Memverifikasi Pembayaran...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Saya Sudah Bayar (Konfirmasi)</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function QrOrderInner({ params }: { params: Promise<{ token: string }> }) {
  const resolved = use(params);
  return <CustomerQrContent token={resolved.token} />;
}

export default function CustomerQrSelfOrderPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <Suspense fallback={<CustomerMenuSkeleton />}>
      <QrOrderInner params={params} />
    </Suspense>
  );
}
