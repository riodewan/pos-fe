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
} from 'lucide-react';
import { publicService } from '@/services';
import { PublicQrResolved } from '@/types';
import { ApiError } from '@/lib/api';
import { formatRupiah } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface CustomerCartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

function CustomerQrContent({ token }: { token: string }) {
  const [session, setSession] = useState<PublicQrResolved | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cart
  const [cart, setCart] = useState<CustomerCartItem[]>([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [submittingOrder, setSubmittingOrder] = useState(false);

  // Order Confirmed State
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [submittedOrderInfo, setSubmittedOrderInfo] = useState<{
    orderNumber?: string;
    customerName: string;
    totalAmount: number;
  } | null>(null);

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

  const formatCurrency = formatRupiah;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName) {
      alert('Mohon isi nama Anda.');
      return;
    }
    if (cart.length === 0) return;

    setSubmittingOrder(true);
    try {
      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone || null,
        notes: orderNotes || null,
        items: cart.map((i) => ({
          product_id: i.productId,
          quantity: i.quantity,
          notes: i.notes || null,
        })),
      };

      const res = await publicService.submitCustomerOrder(token, payload);


      setSubmittedOrderInfo({
        orderNumber: res.data?.order_number || 'ORD-NEW',
        customerName,
        totalAmount: subtotal,
      });
      setOrderSuccess(true);
      setCheckoutOpen(false);
      setCart([]);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        alert(err.message || 'Gagal mengirim pesanan');
      } else {
        alert('Terjadi kesalahan koneksi.');
      }
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
        <div className="size-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white animate-bounce shadow-lg shadow-amber-600/30">
          <Coffee className="size-6" />
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground">Membuka menu meja...</p>
      </div>
    );
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

  if (orderSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-background">
        <div className="size-16 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mb-4 animate-in zoom-in-75">
          <CheckCircle2 className="size-10" />
        </div>
        <Badge variant="success" className="mb-2">Pesanan Terkonfirmasi</Badge>
        <h2 className="text-2xl font-extrabold text-foreground">Pesanan Diterima Dapur!</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xs">
          Terima kasih <strong className="text-foreground">{submittedOrderInfo?.customerName}</strong>. Barista & staf dapur sedang menyiapkan pesanan Anda di <strong>{session.table.name}</strong>.
        </p>

        <div className="mt-6 p-4 rounded-xl border border-border bg-card w-full max-w-xs text-xs space-y-2 text-left">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Outlet:</span>
            <span className="font-semibold text-foreground">{session.store.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Meja:</span>
            <span className="font-semibold text-foreground">{session.table.name} ({session.table.code})</span>
          </div>
          <div className="flex justify-between pt-2 border-t border-border/50 font-bold">
            <span>Estimasi Total:</span>
            <span className="text-amber-700 dark:text-amber-400">
              {formatCurrency(submittedOrderInfo?.totalAmount || 0)}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground mt-4">
          Pembayaran dapat dilakukan di kasir saat pesanan selesai.
        </p>

        <Button
          onClick={() => setOrderSuccess(false)}
          variant="outline"
          className="mt-6 text-xs"
        >
          Pesan Menu Tambahan
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50/60 dark:bg-zinc-950 pb-24">
      {/* Store & Table Header */}
      <header className="sticky top-0 z-30 bg-card/90 backdrop-blur-md border-b border-border/60 p-4 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
              <Coffee className="size-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-foreground leading-tight">
                {session.store.name}
              </h1>
              <p className="text-[11px] text-muted-foreground">
                Dine-in: <strong className="text-amber-700 dark:text-amber-300">{session.table.name}</strong> ({session.table.code})
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
            Self-Order
          </Badge>
        </div>
      </header>

      {/* Menu Catalog Section */}
      <main className="max-w-md mx-auto w-full p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Daftar Menu</h2>
            <p className="text-xs text-muted-foreground">Pilih hidangan dan minuman favorit Anda</p>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {session.products.length} Pilihan
          </span>
        </div>

        {/* Product Cards */}
        <div className="space-y-3">
          {session.products.map((prod) => {
            const inCart = cart.find((i) => i.productId === prod.id);
            return (
              <div
                key={prod.id}
                className="p-3.5 rounded-xl border border-border/80 bg-card shadow-xs flex items-center justify-between gap-3 hover:border-amber-500/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground leading-tight">{prod.name}</h3>
                  {prod.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {prod.description}
                    </p>
                  )}
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-2">
                    {formatCurrency(Number(prod.selling_price))}
                  </p>
                </div>

                <div className="shrink-0">
                  {inCart ? (
                    <div className="flex items-center gap-2 bg-muted/60 p-1 rounded-lg border border-border/60">
                      <button
                        onClick={() => updateQuantity(prod.id, -1)}
                        className="size-7 rounded-md bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-transform"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{inCart.quantity}</span>
                      <button
                        onClick={() => updateQuantity(prod.id, 1)}
                        className="size-7 rounded-md bg-card border border-border flex items-center justify-center text-foreground hover:bg-muted active:scale-95 transition-transform"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => addToCart(prod)}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold h-8 px-3 rounded-lg shadow-xs"
                    >
                      <Plus className="size-3.5 mr-1" /> Tambah
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 p-3 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-xs">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => setCheckoutOpen(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-lg shadow-amber-600/30 transition-all active:scale-[0.99]"
            >
              <div className="flex items-center gap-2.5">
                <div className="size-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                  {totalItems}
                </div>
                <span className="text-sm">Lihat Pesanan</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-bold">
                <span>{formatCurrency(subtotal)}</span>
                <ArrowRight className="size-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Checkout Bottom Sheet / Drawer */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="w-full max-w-md bg-card rounded-t-3xl sm:rounded-2xl border border-border p-5 space-y-4 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-5">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <h3 className="text-base font-bold text-foreground">Konfirmasi Pesanan</h3>
              <button
                onClick={() => setCheckoutOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Kembali
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40"
                >
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {item.quantity} x {formatCurrency(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-foreground">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Customer Information Form */}
            <form onSubmit={handleSubmitOrder} className="space-y-3 pt-2 border-t border-border/60">
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
                  Nomor Telepon / WhatsApp (Opsional)
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
                  placeholder="Mis: Disajikan serentak, less ice..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-between items-center pt-2 font-bold text-sm">
                <span>Total Pesanan</span>
                <span className="text-amber-700 dark:text-amber-400 text-base">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              <Button
                type="submit"
                disabled={submittingOrder}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-5 mt-2"
              >
                {submittingOrder ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Mengirim Pesanan...
                  </>
                ) : (
                  'Kirim Pesanan ke Dapur'
                )}
              </Button>
            </form>
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
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
          <Loader2 className="size-8 animate-spin text-amber-600" />
          <p className="mt-2 text-xs text-muted-foreground">Memuat sesi meja...</p>
        </div>
      }
    >
      <QrOrderInner params={params} />
    </Suspense>
  );
}
