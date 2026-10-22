'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
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

type PaymentOption = 'QRIS' | 'EWALLET' | 'VA';

function CustomerMenuSkeleton() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/60 dark:bg-zinc-950 pb-20">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border/60 p-4 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-28 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </header>

      <main className="max-w-md mx-auto w-full p-4 space-y-4">
        {/* Search bar skeleton */}
        <Skeleton className="h-10 w-full rounded-xl" />

        {/* Categories pills skeleton */}
        <div className="flex gap-2 overflow-hidden py-1">
          <Skeleton className="h-7 w-20 rounded-full shrink-0" />
          <Skeleton className="h-7 w-24 rounded-full shrink-0" />
          <Skeleton className="h-7 w-20 rounded-full shrink-0" />
          <Skeleton className="h-7 w-28 rounded-full shrink-0" />
        </div>

        {/* Product Items skeleton */}
        <div className="space-y-3 pt-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border/60 shadow-xs gap-3"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Skeleton className="size-16 rounded-xl shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
              </div>
              <Skeleton className="size-8 rounded-xl shrink-0" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function CustomerQrContent({ token }: { token: string }) {
  const [session, setSession] = useState<PublicQrResolved | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cart & Customer details
  const [cart, setCart] = useState<CustomerCartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
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
    }, 8000);
    return () => clearInterval(interval);
  }, [confirmedOrder, token]);

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

    setCountdownSeconds(900);
    setPaymentModalOpen(true);
  };

  // Step 2: Execute Direct Self-Service Payment & Order Creation
  const handleConfirmExecutePayment = async () => {
    setProcessingPayment(true);
    try {
      const payload = {
        customer_name: customerName.trim(),
        customer_phone: customerPhone.trim() || null,
        notes: orderNotes.trim() || null,
        payment_method: selectedPayment === 'QRIS' ? 'QRIS' : 'ONLINE',
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
      setCheckoutOpen(false);
      setCart([]);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        alert(err.message || 'Gagal memproses pembayaran pesanan.');
      } else {
        alert('Terjadi kesalahan saat memproses pembayaran.');
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
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <div className="size-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-4">
          <AlertCircle className="size-8" />
        </div>
        <h2 className="text-xl font-bold text-foreground">QR Code Tidak Valid</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-background">
        <div className="w-full max-w-md bg-card rounded-2xl border border-border p-6 shadow-elevated space-y-6 text-center">
          {/* Success Banner */}
          <div className="space-y-2">
            <div className="size-16 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto animate-in zoom-in-75">
              <CheckCircle2 className="size-10" />
            </div>
            <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 font-bold px-3 py-1 gap-1.5 inline-flex items-center">
              <Check className="size-3 stroke-[2.5]" />
              <span>LUNAS VIA QRIS</span>
            </Badge>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              Pembayaran Berhasil!
            </h2>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Terima kasih <strong className="text-foreground">{customerName}</strong>. Pesanan Anda sudah dibayar dan otomatis masuk ke antrean barista.
            </p>
          </div>

          {/* Real-time Order Preparation Stepper */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/60 text-left space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Utensils className="size-3.5 text-foreground" /> Status Dapur / Barista
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">
                #{confirmedOrder.order_number}
              </span>
            </div>

            {/* Step 1: Paid */}
            <div className="flex items-start gap-3">
              <div className="size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs shrink-0 mt-0.5">
                <Check className="size-3.5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-foreground">Pembayaran QRIS Diterima</p>
                <p className="text-[11px] text-muted-foreground">Transaksi diverifikasi otomatis</p>
              </div>
            </div>

            {/* Step 2: Preparing */}
            <div className="flex items-start gap-3">
              <div
                className={`size-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                  isPreparing
                    ? 'bg-primary text-primary-foreground animate-pulse'
                    : isReady || isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isReady || isCompleted ? <Check className="size-3.5" /> : <Loader2 className="size-3.5 animate-spin" />}
              </div>
              <div className="text-xs">
                <p className="font-bold text-foreground">Sedang Disiapkan Barista</p>
                <p className="text-[11px] text-muted-foreground">
                  {isPreparing ? 'Pesanan sedang diracik/dimasak di dapur' : 'Selesai disiapkan'}
                </p>
              </div>
            </div>

            {/* Step 3: Ready / Served */}
            <div className="flex items-start gap-3">
              <div
                className={`size-6 rounded-full flex items-center justify-center text-xs shrink-0 mt-0.5 ${
                  isReady
                    ? 'bg-emerald-600 text-white'
                    : isCompleted
                    ? 'bg-emerald-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="size-3.5" /> : <Coffee className="size-3.5" />}
              </div>
              <div className="text-xs">
                <p className={`font-bold ${isReady ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-foreground'}`}>
                  {isReady ? 'Siap Disajikan!' : isCompleted ? 'Pesanan Selesai' : 'Siap Saji'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {isReady ? 'Staf kami segera mengantarkan ke meja Anda' : 'Disajikan langsung ke meja Anda'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Details Receipt Box */}
          <div className="p-4 rounded-2xl border border-border bg-card text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Outlet:</span>
              <span className="font-semibold text-foreground">{session.store.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nomor Meja:</span>
              <span className="font-bold text-foreground">{session.table.name} ({session.table.code})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode Bayar:</span>
              <span className="font-semibold text-foreground">QRIS Instan (Lunas)</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-border/50 font-bold text-sm">
              <span>Total Terbayar:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                {formatCurrency(confirmedOrder.total_amount)}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5">
              <Coffee className="size-3.5 text-muted-foreground shrink-0" />
              <span>Silakan duduk santai di meja Anda. Pihak cafe akan langsung menyajikan pesanan Anda!</span>
            </p>
            <Button
              onClick={() => {
                setConfirmedOrder(null);
                setCart([]);
              }}
              variant="outline"
              className="w-full text-xs font-semibold py-4 rounded-xl"
            >
              Pesan Menu Tambahan
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // MAIN MENU CATALOG VIEW
  // ============================================================
  return (
    <div className="min-h-screen flex flex-col bg-background pb-28">
      {/* Store & Table Header */}
      <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-md border-b border-border/80 px-4 py-3 shadow-hairline">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-md bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
              <Coffee className="size-4" strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm text-foreground leading-tight truncate">
                {session.store.name}
              </h1>
              <p className="text-[11px] text-muted-foreground truncate">
                Meja <strong className="text-foreground">{session.table.name}</strong> ({session.table.code})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle />
            <Badge variant="outline" className="text-[11px] font-medium gap-1">
              <Sparkles className="size-3 text-foreground" /> Self-Order
            </Badge>
          </div>
        </div>
      </header>

      {/* Menu Catalog Section */}
      <main className="max-w-md mx-auto w-full p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Daftar Menu</h2>
            <p className="text-xs text-muted-foreground">Pesan & bayar langsung dari tempat duduk Anda</p>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {session.products.length} Pilihan
          </span>
        </div>

        {/* Product Cards with Photos */}
        <div className="space-y-3">
          {session.products.map((prod) => {
            const inCart = cart.find((i) => i.productId === prod.id);
            return (
              <div
                key={prod.id}
                className="group p-3 rounded-2xl border border-border/70 bg-card shadow-xs flex items-center gap-3.5 hover:border-foreground/25 hover:shadow-md transition-all"
              >
                {/* Product Photo Thumbnail */}
                <div className="relative size-20 sm:size-24 rounded-xl overflow-hidden shrink-0 bg-muted/60 border border-border/50">
                  {prod.image_url ? (
                    <img
                      src={prod.image_url}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-accent text-foreground">
                      <Coffee className="size-6 opacity-60" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                  <div>
                    <h3 className="text-sm font-bold text-foreground leading-snug line-clamp-1 group-hover:text-foreground transition-colors">
                      {prod.name}
                    </h3>
                    {prod.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                        {prod.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-border/30">
                    <span className="text-xs font-bold text-foreground">
                      {formatCurrency(Number(prod.selling_price))}
                    </span>

                    {/* Cart Controls */}
                    <div className="shrink-0">
                      {inCart ? (
                        <div className="flex items-center gap-2 bg-muted/70 p-1 rounded-lg border border-border/60">
                          <button
                            onClick={() => updateQuantity(prod.id, -1)}
                            className="size-6 rounded-md bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-transform"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="text-xs font-bold w-4 text-center">{inCart.quantity}</span>
                          <button
                            onClick={() => updateQuantity(prod.id, 1)}
                            className="size-6 rounded-md bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-transform"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => addToCart(prod)}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-7 px-2.5 rounded-lg shadow-xs"
                        >
                          <Plus className="size-3 mr-1" /> Tambah
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && !checkoutOpen && !paymentModalOpen && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-xs">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setCheckoutOpen(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                  {totalItems}
                </div>
                <span className="text-sm font-bold">Lihat Pesanan</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold">
                <span>{formatCurrency(totalPayable)}</span>
                <ArrowRight className="size-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 1: CHECKOUT & CUSTOMER INFO DRAWER */}
      {/* ============================================================ */}
      {checkoutOpen && !paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl border border-border p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="text-base font-bold text-foreground">Ringkasan & Pembayaran</h3>
              <button
                onClick={() => setCheckoutOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Tutup
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-3 text-xs p-2.5 rounded-xl bg-muted/40 border border-border/50"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="size-11 rounded-lg overflow-hidden shrink-0 bg-muted border border-border/40">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Coffee className="size-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate">{item.name}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatCurrency(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-foreground">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="size-6 rounded-md bg-card border border-border flex items-center justify-center hover:bg-muted"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="font-bold w-3 text-center">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="size-6 rounded-md bg-card border border-border flex items-center justify-center hover:bg-muted"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Customer Information Form */}
            <form onSubmit={handleProceedToPayment} className="space-y-3 pt-2 border-t border-border/60">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Nama Anda (Wajib)
                </label>
                <Input
                  placeholder="Mis: Rina Wijaya"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Nomor WhatsApp (Opsional)
                </label>
                <Input
                  placeholder="08123456789"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Catatan untuk Dapur
                </label>
                <Input
                  placeholder="Mis: Less ice, gula dipisah..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              {/* Direct Payment Method Selection */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <label className="text-xs font-bold text-foreground flex items-center justify-between">
                  <span>Metode Pembayaran Mandiri</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Langsung Lunas</span>
                </label>

                <div className="grid grid-cols-1 gap-2">
                  {/* Option 1: QRIS */}
                  <label
                    onClick={() => setSelectedPayment('QRIS')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPayment === 'QRIS'
                        ? 'border-foreground bg-accent text-foreground ring-1 ring-foreground'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-[10px]">
                        QRIS
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">QRIS (Semua E-Wallet & M-Banking)</p>
                        <p className="text-[10px] text-muted-foreground">GoPay, OVO, ShopeePay, BCA, Mandiri, Dana</p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] border-emerald-500/30">
                      Instan
                    </Badge>
                  </label>

                  {/* Option 2: E-Wallet */}
                  <label
                    onClick={() => setSelectedPayment('EWALLET')}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedPayment === 'EWALLET'
                        ? 'border-foreground bg-accent text-foreground ring-1 ring-foreground'
                        : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                        <CreditCard className="size-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">E-Wallet Apps</p>
                        <p className="text-[10px] text-muted-foreground">GoPay, OVO, DANA, LinkAja</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="pt-2 border-t border-border/50 space-y-1 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {taxAmount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>PPN ({taxPct}%)</span>
                    <span>{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1 font-extrabold text-sm border-t border-border/40">
                  <span>Total Pembayaran</span>
                  <span className="text-foreground text-base">
                    {formatCurrency(totalPayable)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-5 mt-2 gap-2 shadow-md"
              >
                <span>Bayar Sekarang ({formatCurrency(totalPayable)})</span>
                <ChevronRight className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2: DYNAMIC QRIS PAYMENT MODAL GATEWAY */}
      {/* ============================================================ */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-card rounded-3xl border border-border p-6 space-y-4 shadow-2xl animate-in zoom-in-95 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-xs tracking-wider">
                  QRIS
                </div>
                <span className="text-xs font-bold text-foreground">Pembayaran Mandiri</span>
              </div>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Batal
              </button>
            </div>

            {/* Total Display */}
            <div>
              <span className="text-xs text-muted-foreground">Total yang harus dibayar</span>
              <h3 className="text-2xl font-black text-foreground mt-0.5">
                {formatCurrency(totalPayable)}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {session.table.name} ({session.table.code}) • {customerName}
              </p>
            </div>

            {/* Dynamic QRIS Barcode Box */}
            <div className="relative p-4 rounded-2xl bg-white border border-zinc-200 shadow-inner flex flex-col items-center justify-center mx-auto w-56">
              <QRCodeSVG
                value={`https://qris.id/pay/${token}?amount=${totalPayable}&t=${Date.now()}`}
                size={180}
                level="H"
                includeMargin={false}
              />
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                <ShieldCheck className="size-3 text-emerald-600" /> Standar QRIS Nasional
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="size-3.5 text-foreground" />
              <span>Sisa Waktu Bayar: </span>
              <span className="font-mono font-bold text-foreground">
                {String(Math.floor(countdownSeconds / 60)).padStart(2, '0')}:
                {String(countdownSeconds % 60).padStart(2, '0')}
              </span>
            </div>

            <div className="text-[11px] text-muted-foreground leading-relaxed bg-muted/40 p-2.5 rounded-xl border border-border/50 text-left space-y-1">
              <p className="font-semibold text-foreground">Petunjuk Pembayaran:</p>
              <p>1. Buka aplikasi m-Banking (BCA, Mandiri, BRI) atau E-Wallet (GoPay, OVO, Dana, ShopeePay).</p>
              <p>2. Scan kode QRIS di atas dan selesaikan transaksi.</p>
            </div>

            {/* Interactive Payment Execution Simulation */}
            <Button
              onClick={handleConfirmExecutePayment}
              disabled={processingPayment}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-5 shadow-lg shadow-emerald-600/25"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Memverifikasi Pembayaran...
                </>
              ) : (
                'Simulasikan Pembayaran Berhasil'
              )}
            </Button>
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
