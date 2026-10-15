'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode as QrIcon,
  CheckCircle2,
  AlertCircle,
  Receipt,
  Coffee,
  Loader2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { catalogService, posService } from '@/services';
import { Product, DiningTable, Order, PaymentMethod } from '@/types';
import { ApiError } from '@/lib/api';
import { formatRupiah } from '@/utils';
import { TAX_PERCENTAGE, QUICK_CASH_DENOMINATIONS } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

export default function PosCashierPage() {
  const router = useRouter();
  const { user, activeTenant, isLoading } = useAuth();
  const { activeStore } = useStore();

  const roleName = user?.is_internal ? 'SUPER_ADMIN' : activeTenant?.role?.toUpperCase();

  useEffect(() => {
    if (isLoading) return;
    if (roleName === 'INVENTORY') {
      router.replace('/dashboard/inventory');
    }
  }, [roleName, isLoading, router]);

  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState('');

  // Checkout & Payment State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Success Receipt State
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // Fetch Products & Tables using dedicated services
  const loadData = useCallback(async () => {
    if (!activeStore) return;
    setLoading(true);
    try {
      const [prodRes, tableRes] = await Promise.all([
        catalogService.getProducts(),
        posService.getTables(),
      ]);
      setProducts(prodRes.data || []);
      setTables(tableRes.data || []);
    } catch (err) {
      console.error('Failed to load POS data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeStore]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Cart operations
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, notes: '' }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const updateNotes = (productId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, notes } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setSelectedTableId('');
    setCustomerName('');
    setCustomerPhone('');
    setDiscountAmount(0);
    setOrderNotes('');
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + Number(item.product.selling_price) * item.quantity, 0);
  const tax = Math.round(Math.max(0, subtotal - discountAmount) * TAX_PERCENTAGE);
  const total = Math.max(0, subtotal - discountAmount + tax);

  const formatCurrency = formatRupiah;


  // Filtered products
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle Order & Payment Submission
  const handleProceedCheckout = () => {
    if (cart.length === 0) return;
    setCashTendered(String(total));
    setCheckoutError(null);
    setCheckoutModalOpen(true);
  };

  const handleExecutePayment = async () => {
    setProcessingPayment(true);
    setCheckoutError(null);

    try {
      // 1. Create Order
      const orderPayload = {
        table_id: selectedTableId || null,
        customer_name: customerName || 'Tamu Kasir',
        customer_phone: customerPhone || null,
        discount_amount: discountAmount,
        tax_amount: tax,
        service_charge: 0,
        notes: orderNotes || null,
        items: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
          discount_amount: 0,
          notes: item.notes || null,
        })),
      };

      const orderRes = await posService.createOrder(orderPayload);
      const createdOrder = orderRes.data;

      // 2. Process Payment
      const tenderedNumber = Number(cashTendered) || total;
      if (paymentMethod === 'CASH' && tenderedNumber < total) {
        throw new Error('Nominal uang tunai kurang dari total tagihan.');
      }

      await posService.processPayment(createdOrder.id, {
        method: paymentMethod,
        amount: total,
        provider: null,
        provider_reference: null,
        metadata: {
          received_amount: paymentMethod === 'CASH' ? tenderedNumber : total,
          change_amount: paymentMethod === 'CASH' ? Math.max(0, tenderedNumber - total) : 0,
        },
      });


      // 3. Success
      setCompletedOrder({
        ...createdOrder,
        total_amount: total,
      });
      setCheckoutModalOpen(false);
      setReceiptModalOpen(true);
      clearCart();
      loadData(); // Reload table statuses
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setCheckoutError(err.message || 'Gagal memproses pembayaran.');
      } else {
        setCheckoutError((err as Error).message || 'Terjadi kesalahan sistem.');
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const tenderedNum = Number(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - total);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-4">
      {/* Left Column: Product Catalog Grid */}
      <div className="flex-1 flex flex-col min-w-0 bg-card rounded-2xl border border-border p-4 shadow-xs overflow-hidden">
        {/* Search & Actions Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-border/60">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk atau SKU..."
              className="pl-9 h-9 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex text-xs py-1">
            {filteredProducts.length} Produk
          </Badge>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pt-3 pr-1">
          {loading ? (
            <div className="h-full flex items-center justify-center text-muted-foreground text-xs gap-2">
              <Loader2 className="size-4 animate-spin text-amber-600" /> Memuat katalog...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <Coffee className="size-10 mb-2 opacity-30" />
              <p className="text-sm font-medium">Tidak ada produk ditemukan</p>
              <p className="text-xs">Coba kata kunci lain atau tambahkan produk baru di menu Katalog.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group relative flex flex-col justify-between p-2.5 rounded-xl border border-border/70 bg-background hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer select-none overflow-hidden"
                >
                  <div className="space-y-2">
                    {/* Thumbnail Image */}
                    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-muted/60 border border-border/40">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-amber-500/5">
                          <Coffee className="size-6 text-amber-600/60" />
                        </div>
                      )}
                      <span className="absolute top-1.5 right-1.5 size-6 rounded-md bg-black/50 backdrop-blur-xs text-white flex items-center justify-center group-hover:bg-amber-600 transition-colors shadow-xs">
                        <Plus className="size-3.5" />
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                        {product.sku}
                      </span>
                      <h4 className="text-xs font-semibold text-foreground line-clamp-1 leading-tight group-hover:text-amber-600 transition-colors">
                        {product.name}
                      </h4>
                    </div>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-border/40 flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      {formatCurrency(product.selling_price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Order Cart & Bill Breakdown */}
      <div className="w-full lg:w-96 flex flex-col bg-card rounded-2xl border border-border p-4 shadow-xs overflow-hidden shrink-0">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-4 text-amber-600" />
            <h3 className="text-sm font-bold text-foreground">Keranjang Pesanan</h3>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* Customer & Table Selectors */}
        <div className="py-2.5 space-y-2 border-b border-border/60 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Meja (Dine-in)</label>
              <select
                value={selectedTableId}
                onChange={(e) => setSelectedTableId(e.target.value)}
                className="w-full h-8 mt-0.5 rounded-lg border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Takeaway / Antre</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code}) {t.is_occupied ? '• Terisi' : '• Kosong'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-muted-foreground uppercase">Nama Tamu</label>
              <Input
                placeholder="Pelanggan"
                className="h-8 mt-0.5 text-xs"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-10">
              <ShoppingCart className="size-8 opacity-20 mb-2" />
              <p className="text-xs font-medium">Keranjang masih kosong</p>
              <p className="text-[10px]">Klik produk di sebelah kiri untuk menambahkan pesanan</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-2.5 rounded-xl border border-border/60 bg-background/50 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{item.product.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {formatCurrency(item.product.selling_price)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {formatCurrency(Number(item.product.selling_price) * item.quantity)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <input
                    type="text"
                    placeholder="Catatan (Less sugar, es...)"
                    value={item.notes || ''}
                    onChange={(e) => updateNotes(item.product.id, e.target.value)}
                    className="h-6 w-36 text-[10px] bg-transparent border-b border-border/80 px-1 focus:outline-none focus:border-amber-600"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="size-6 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="text-xs font-bold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="size-6 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted"
                    >
                      <Plus className="size-3" />
                    </button>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors ml-1"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Bill Breakdown Summary */}
        <div className="pt-3 border-t border-border/60 space-y-1.5 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>PPN (11%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between font-bold text-sm text-foreground pt-1 border-t border-border/40">
            <span>Total Tagihan</span>
            <span className="text-amber-700 dark:text-amber-400 text-base">{formatCurrency(total)}</span>
          </div>

          <Button
            onClick={handleProceedCheckout}
            disabled={cart.length === 0}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md shadow-amber-600/20 mt-2 py-5"
          >
            Bayar Pesanan ({formatCurrency(total)})
          </Button>
        </div>
      </div>

      {/* Checkout Payment Dialog */}
      <Dialog open={checkoutModalOpen} onOpenChange={setCheckoutModalOpen}>
        <DialogContent onClose={() => setCheckoutModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Pembayaran Kasir</DialogTitle>
            <DialogDescription>
              Pilih metode bayar dan masukkan nominal transaksi untuk menyelesaikan pesanan
            </DialogDescription>
          </DialogHeader>

          {checkoutError && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="size-4 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          <div className="space-y-4">
            {/* Total Amount Banner */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="text-xs font-medium text-amber-800 dark:text-amber-300">Total Yang Wajib Dibayar</span>
              <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400 mt-0.5">
                {formatCurrency(total)}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Metode Pembayaran</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'CASH', label: 'Tunai', icon: Banknote },
                  { id: 'QRIS', label: 'QRIS', icon: QrIcon },
                  { id: 'EDC', label: 'Debit/EDC', icon: CreditCard },
                  { id: 'TRANSFER', label: 'Transfer', icon: Receipt },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        isSelected
                          ? 'border-amber-600 bg-amber-600 text-white shadow-xs'
                          : 'border-border bg-card text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="size-4 mb-1" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cash Tendered Input & Quick Denominations */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Uang Tunai Diterima (Rp)
                </label>
                <Input
                  type="number"
                  value={cashTendered}
                  onChange={(e) => setCashTendered(e.target.value)}
                  placeholder="0"
                  className="text-lg font-bold"
                />

                {/* Quick Bills Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {[total, ...QUICK_CASH_DENOMINATIONS].map((amt) => (
                    <button

                      key={amt}
                      type="button"
                      onClick={() => setCashTendered(String(amt))}
                      className="px-2.5 py-1 rounded-md border border-border bg-muted/50 text-[11px] font-semibold hover:bg-muted transition-colors"
                    >
                      {amt === total ? 'Uang Pas' : formatCurrency(amt)}
                    </button>
                  ))}
                </div>

                {/* Change Calculation */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/60 border border-border/60 text-xs">
                  <span className="font-medium text-muted-foreground">Kembalian:</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(changeDue)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCheckoutModalOpen(false)} disabled={processingPayment}>
              Batal
            </Button>
            <Button
              onClick={handleExecutePayment}
              disabled={processingPayment || (paymentMethod === 'CASH' && tenderedNum < total)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold"
            >
              {processingPayment ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Memproses...
                </>
              ) : (
                'Selesaikan Pembayaran'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Success & Receipt Dialog */}
      <Dialog open={receiptModalOpen} onOpenChange={setReceiptModalOpen}>
        <DialogContent onClose={() => setReceiptModalOpen(false)}>
          <div className="text-center space-y-3 py-2">
            <div className="size-14 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-8" />
            </div>
            <DialogTitle className="text-xl">Pembayaran Berhasil!</DialogTitle>
            <DialogDescription>
              Pesanan #{completedOrder?.order_number} telah diselesaikan. Resep bahan baku telah otomatis dipotong dari inventaris.
            </DialogDescription>
          </div>

          <div className="my-4 p-4 rounded-xl border border-border bg-muted/30 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nomor Pesanan:</span>
              <span className="font-mono font-bold">{completedOrder?.order_number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pelanggan:</span>
              <span className="font-semibold">{completedOrder?.customer_name || 'Tamu Kasir'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode Bayar:</span>
              <Badge variant="outline">{paymentMethod}</Badge>
            </div>
            <div className="flex justify-between pt-2 border-t border-border/60 font-bold text-sm">
              <span>Total Terbayar:</span>
              <span className="text-amber-700 dark:text-amber-400">
                {formatCurrency(completedOrder?.total_amount || 0)}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium"
              onClick={() => setReceiptModalOpen(false)}
            >
              Pesanan Baru
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
