'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
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
  RefreshCw,
  Clock,
  ClipboardList,
  User,
  Phone,
  FileText,
  XCircle,
  Check,
  Eye,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { catalogService, posService } from '@/services';
import { Product, DiningTable, Order, OrderItem, PaymentMethod, OrderStatus } from '@/types';
import { ApiError } from '@/lib/api';
import { formatRupiah } from '@/utils';
import { TAX_PERCENTAGE, QUICK_CASH_DENOMINATIONS } from '@/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
}

function PosCashierContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, activeTenant, isLoading } = useAuth();
  const { activeStore } = useStore();

  const roleName = user?.is_internal ? 'SUPER_ADMIN' : activeTenant?.role?.toUpperCase();

  useEffect(() => {
    if (isLoading) return;
    if (roleName === 'INVENTORY') {
      router.replace('/dashboard/inventory');
    }
  }, [roleName, isLoading, router]);

  // Tab State: 'register' (Kasir POS Baru) | 'orders' (Daftar & Antrean Pesanan Masuk)
  const initialTab = searchParams.get('tab') === 'orders' ? 'orders' : 'register';
  const [activeTab, setActiveTab] = useState<'register' | 'orders'>(initialTab);

  // Sync tab with URL search parameter if it changes
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl === 'orders') {
      setActiveTab('orders');
    } else if (tabFromUrl === 'register') {
      setActiveTab('register');
    }
  }, [searchParams]);

  // Catalog & Tables State
  const [products, setProducts] = useState<Product[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Cart State (Register Mode)
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [orderNotes, setOrderNotes] = useState('');

  // Orders Monitor State (Orders Mode)
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'QR' | 'POS'>('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Cancel Order Modal State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(false);

  // Checkout & Payment State
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [targetOrderForPayment, setTargetOrderForPayment] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Success Receipt State
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // Fetch Products & Tables
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

  // Fetch Orders
  const loadOrders = useCallback(async (isSilent = false) => {
    if (!activeStore) return;
    if (!isSilent) setLoadingOrders(true);
    try {
      const ordersRes = await posService.getOrders({ per_page: 50 });
      setOrders(ordersRes.data || []);
      setLastRefreshedAt(new Date());
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      if (!isSilent) setLoadingOrders(false);
    }
  }, [activeStore]);

  useEffect(() => {
    loadData();
    loadOrders();
  }, [loadData, loadOrders]);

  // Auto polling orders every 15s
  useEffect(() => {
    if (!autoRefresh || !activeStore) return;
    const interval = setInterval(() => {
      loadOrders(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, activeStore, loadOrders]);

  // Cart operations (Register mode)
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

  // Calculations for register cart
  const subtotal = cart.reduce((acc, item) => acc + Number(item.product.selling_price) * item.quantity, 0);
  const tax = Math.round(Math.max(0, subtotal - discountAmount) * TAX_PERCENTAGE);
  const total = Math.max(0, subtotal - discountAmount + tax);

  const formatCurrency = formatRupiah;

  // Filtered products for catalog
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered orders for orders monitor
  const filteredOrders = orders.filter((order) => {
    // Status filter
    if (statusFilter !== 'ALL' && order.status !== statusFilter) {
      return false;
    }
    // Source filter
    if (sourceFilter !== 'ALL' && order.source !== sourceFilter) {
      return false;
    }
    // Search query
    if (orderSearchQuery.trim()) {
      const q = orderSearchQuery.toLowerCase();
      const matchOrderNum = order.order_number?.toLowerCase().includes(q);
      const matchCustomer = order.customer_name?.toLowerCase().includes(q);
      const matchTable = order.table?.name?.toLowerCase().includes(q) || order.table?.code?.toLowerCase().includes(q);
      const matchNotes = order.notes?.toLowerCase().includes(q);
      if (!matchOrderNum && !matchCustomer && !matchTable && !matchNotes) {
        return false;
      }
    }
    return true;
  });

  // Count active pending orders (especially from QR code)
  const pendingOrdersCount = orders.filter((o) => o.status === 'PENDING').length;
  const qrOrdersCount = orders.filter((o) => o.source === 'QR').length;

  // Open Checkout Modal for Register Cart
  const handleProceedCartCheckout = () => {
    if (cart.length === 0) return;
    setTargetOrderForPayment(null);
    setCashTendered(String(total));
    setCheckoutError(null);
    setCheckoutModalOpen(true);
  };

  // Open Checkout Modal for an Existing Order (from Orders Queue)
  const handleOpenExistingOrderPayment = (order: Order) => {
    setTargetOrderForPayment(order);
    const orderTotal = Number(order.total_amount);
    setCashTendered(String(orderTotal));
    setCheckoutError(null);
    setCheckoutModalOpen(true);
  };

  // Execute Payment (Handles both new cart order and existing QR/POS order)
  const handleExecutePayment = async () => {
    setProcessingPayment(true);
    setCheckoutError(null);

    try {
      let orderToPay: Order;
      let payableAmount: number;

      if (targetOrderForPayment) {
        // Paying an existing order (e.g. from QR)
        orderToPay = targetOrderForPayment;
        payableAmount = Number(orderToPay.total_amount);
      } else {
        // 1. Create Order first for Cart
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
        orderToPay = orderRes.data;
        payableAmount = total;
      }

      // 2. Validate Cash Amount
      const tenderedNumber = Number(cashTendered) || payableAmount;
      if (paymentMethod === 'CASH' && tenderedNumber < payableAmount) {
        throw new Error('Nominal uang tunai kurang dari total tagihan.');
      }

      // 3. Process Payment via API
      await posService.processPayment(orderToPay.id, {
        method: paymentMethod,
        amount: payableAmount,
        provider: null,
        provider_reference: null,
        metadata: {
          received_amount: paymentMethod === 'CASH' ? tenderedNumber : payableAmount,
          change_amount: paymentMethod === 'CASH' ? Math.max(0, tenderedNumber - payableAmount) : 0,
        },
      });

      // 4. Success State & Receipt
      setCompletedOrder({
        ...orderToPay,
        total_amount: payableAmount,
      });
      setCheckoutModalOpen(false);
      setReceiptModalOpen(true);

      if (!targetOrderForPayment) {
        clearCart();
      }

      // Refresh data
      loadData();
      loadOrders(true);
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

  // Update Status of an Order (e.g. PENDING -> PREPARING -> READY -> COMPLETED)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    setActionLoadingId(orderId);
    try {
      await posService.updateOrderStatus(orderId, newStatus);
      await loadOrders(true);
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert(err instanceof ApiError ? err.message : 'Gagal memperbarui status pesanan');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Open Cancel Dialog
  const handleOpenCancelDialog = (order: Order) => {
    setOrderToCancel(order);
    setCancelReason('Pesanan dibatalkan atas permintaan pelanggan.');
    setCancelModalOpen(true);
  };

  // Confirm Order Cancellation
  const handleConfirmCancelOrder = async () => {
    if (!orderToCancel) return;
    setCancellingOrder(true);
    try {
      await posService.cancelOrder(orderToCancel.id, cancelReason);
      setCancelModalOpen(false);
      setOrderToCancel(null);
      await loadOrders(true);
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert(err instanceof ApiError ? err.message : 'Gagal membatalkan pesanan');
    } finally {
      setCancellingOrder(false);
    }
  };

  // Calculate change due in checkout modal
  const activePayableAmount = targetOrderForPayment ? Number(targetOrderForPayment.total_amount) : total;
  const tenderedNum = Number(cashTendered) || 0;
  const changeDue = Math.max(0, tenderedNum - activePayableAmount);

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header Mode Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/70 rounded-2xl p-2.5 sm:px-4 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'register'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <ShoppingCart className="size-4" />
            <span>Kasir Baru (POS)</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <ClipboardList className="size-4" />
            <span>Pesanan Masuk & QR</span>
            {pendingOrdersCount > 0 && (
              <span className="flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-red-500 text-white animate-pulse">
                {pendingOrdersCount} Baru
              </span>
            )}
          </button>
        </div>

        {/* Status / Quick Action Stats */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {activeTab === 'orders' && (
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex text-[11px]">
                Update: {lastRefreshedAt ? lastRefreshedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => loadOrders(false)}
                disabled={loadingOrders}
                className="h-8 text-xs gap-1.5"
              >
                <RefreshCw className={`size-3.5 ${loadingOrders ? 'animate-spin text-indigo-600' : ''}`} />
                <span className="hidden sm:inline">Segarkan</span>
              </Button>
            </div>
          )}

          {activeStore && (
            <Badge variant="outline" className="text-xs font-medium py-1">
              Store: {activeStore.name}
            </Badge>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODE 1: KASIR POS BARU (PRODUCT GRID & CART) */}
      {/* ============================================================ */}
      {activeTab === 'register' && (
        <div className="h-[calc(100vh-10.5rem)] flex flex-col lg:flex-row gap-4">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl border border-border/60 bg-background space-y-2.5"
                    >
                      <Skeleton className="w-full aspect-[4/3] rounded-lg" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3 w-16 rounded" />
                        <Skeleton className="h-3.5 w-full rounded" />
                      </div>
                      <div className="pt-2 border-t border-border/40 flex justify-between items-center">
                        <Skeleton className="h-4 w-20 rounded" />
                      </div>
                    </div>
                  ))}
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
                      className="group relative flex flex-col justify-between p-2.5 rounded-xl border border-border/70 bg-background hover:border-indigo-500/50 hover:shadow-md transition-all cursor-pointer select-none overflow-hidden"
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
                            <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground bg-indigo-500/5">
                              <Coffee className="size-6 text-indigo-600/60" />
                            </div>
                          )}
                          <span className="absolute top-1.5 right-1.5 size-6 rounded-md bg-black/50 backdrop-blur-xs text-white flex items-center justify-center group-hover:bg-indigo-600 transition-colors shadow-xs">
                            <Plus className="size-3.5" />
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono font-semibold text-muted-foreground">
                            {product.sku}
                          </span>
                          <h4 className="text-xs font-semibold text-foreground line-clamp-1 leading-tight group-hover:text-indigo-600 transition-colors">
                            {product.name}
                          </h4>
                        </div>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-border/40 flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
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
                <ShoppingCart className="size-4 text-indigo-600" />
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
                    placeholder="Contoh: Budi"
                    className="h-8 mt-0.5 text-xs"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">No. HP (Opsional)</label>
                  <Input
                    placeholder="0812..."
                    className="h-8 mt-0.5 text-xs"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-muted-foreground uppercase">Diskon (Rp)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    className="h-8 mt-0.5 text-xs"
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value) || 0))}
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Catatan Keseluruhan</label>
                <Input
                  placeholder="Catatan pesanan..."
                  className="h-8 mt-0.5 text-xs"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto py-2 space-y-2 pr-1">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                  <ShoppingCart className="size-8 mb-2 opacity-30" />
                  <p className="text-xs font-medium">Keranjang masih kosong</p>
                  <p className="text-[11px] text-muted-foreground">Klik item pada katalog menu untuk menambahkan.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-xl border border-border/60 bg-muted/20 space-y-1.5 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="font-semibold text-foreground truncate">{item.product.name}</h4>
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
                        className="h-6 w-36 text-[10px] bg-transparent border-b border-border/80 px-1 focus:outline-none focus:border-indigo-600"
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
                <span className="text-indigo-600 dark:text-indigo-400 text-base">{formatCurrency(total)}</span>
              </div>

              <Button
                onClick={handleProceedCartCheckout}
                disabled={cart.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm shadow-indigo-600/20 mt-2 py-5"
              >
                Bayar Pesanan ({formatCurrency(total)})
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: ANTREAN PESANAN MASUK (QR & KASIR MONITOR) */}
      {/* ============================================================ */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {/* Controls Bar: Filters & Search */}
          <div className="flex flex-col lg:flex-row gap-3 bg-card border border-border/70 rounded-2xl p-4 shadow-xs">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Cari No. Order, Meja, Nama Tamu, atau Catatan..."
                className="pl-9 h-9 text-xs"
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
              />
            </div>

            {/* Source Filter Pills */}
            <div className="flex items-center gap-1.5 border border-border/60 rounded-xl p-1 bg-muted/30">
              <button
                onClick={() => setSourceFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  sourceFilter === 'ALL'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Semua Sumber
              </button>
              <button
                onClick={() => setSourceFilter('QR')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  sourceFilter === 'QR'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <QrIcon className="size-3.5" />
                <span>Scan QR Meja ({qrOrdersCount})</span>
              </button>
              <button
                onClick={() => setSourceFilter('POS')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  sourceFilter === 'POS'
                    ? 'bg-card text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ShoppingCart className="size-3.5" />
                <span>Kasir POS</span>
              </button>
            </div>

            {/* Status Filter Dropdown / Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
              {[
                { id: 'ALL', label: 'Semua Status' },
                { id: 'PENDING', label: 'Menunggu' },
                { id: 'PREPARING', label: 'Disiapkan' },
                { id: 'READY', label: 'Siap Saji' },
                { id: 'COMPLETED', label: 'Selesai' },
                { id: 'CANCELLED', label: 'Batal' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    statusFilter === s.id
                      ? 'border-indigo-600 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-border/60 bg-card text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders Grid Display */}
          {loadingOrders ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="flex flex-col justify-between bg-card rounded-2xl border border-border/60 shadow-xs p-4 space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-border/40">
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-24 rounded" />
                      <Skeleton className="h-3 w-32 rounded" />
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-full rounded" />
                    <Skeleton className="h-3 w-4/5 rounded" />
                  </div>
                  <div className="pt-3 border-t border-border/40 flex justify-between items-center">
                    <Skeleton className="h-4 w-20 rounded" />
                    <Skeleton className="h-8 w-24 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center bg-card rounded-2xl border border-dashed border-border/80 p-8">
              <ClipboardList className="size-12 text-muted-foreground/30 mb-3" />
              <h3 className="text-base font-bold text-foreground">Tidak Ada Pesanan Ditemukan</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                {sourceFilter === 'QR'
                  ? 'Belum ada pesanan dari scan QR meja dengan filter status yang dipilih.'
                  : 'Pesanan yang masuk dari pelanggan via QR Code meja atau kasir akan langsung tampil di sini.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredOrders.map((order) => {
                const itemsList: OrderItem[] =
                  order.order_items ||
                  (order as unknown as { orderItems?: OrderItem[] }).orderItems ||
                  order.items ||
                  [];
                const isPaid = order.payments && order.payments.length > 0;
                const isQrSource = order.source === 'QR';
                const isPending = order.status === 'PENDING';
                const isPreparing = order.status === 'PREPARING';
                const isReady = order.status === 'READY';
                const isCompleted = order.status === 'COMPLETED';
                const isCancelled = order.status === 'CANCELLED';

                return (
                  <div
                    key={order.id}
                    className={`flex flex-col justify-between bg-card rounded-2xl border transition-all shadow-xs overflow-hidden ${
                      isPending && isQrSource
                        ? 'border-indigo-500/70 ring-2 ring-indigo-500/15 bg-indigo-500/[0.015]'
                        : isCompleted
                        ? 'border-border/60 opacity-80'
                        : isCancelled
                        ? 'border-destructive/30 bg-destructive/5 opacity-70'
                        : 'border-border hover:border-indigo-500/40'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-4 pb-3 border-b border-border/50 bg-muted/20">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-foreground tracking-tight">
                              #{order.order_number}
                            </span>

                            {/* Source Badge */}
                            {isQrSource ? (
                              <Badge className="bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30 text-[10px] gap-1 px-1.5 py-0.5">
                                <QrIcon className="size-3" /> Scan QR Meja
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] gap-1 px-1.5 py-0.5">
                                <ShoppingCart className="size-3" /> Kasir POS
                              </Badge>
                            )}
                          </div>

                          {/* Time & Table Information */}
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1 font-semibold text-foreground">
                              {order.table ? `${order.table.name} (${order.table.code})` : 'Takeaway / Antre'}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-[11px]">
                              <Clock className="size-3" />
                              {new Date(order.created_at).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>

                        {/* Order Status Badge */}
                        <div>
                          {isPending && (
                            <Badge className="bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30 text-[11px] font-bold">
                              Menunggu
                            </Badge>
                          )}
                          {isPreparing && (
                            <Badge className="bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-500/40 text-[11px] font-bold">
                              Sedang Disiapkan
                            </Badge>
                          )}
                          {isReady && (
                            <Badge className="bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/40 text-[11px] font-bold">
                              Siap Saji
                            </Badge>
                          )}
                          {isCompleted && (
                            <Badge variant="outline" className="text-muted-foreground text-[11px]">
                              Selesai
                            </Badge>
                          )}
                          {isCancelled && (
                            <Badge className="bg-destructive/15 text-destructive border-destructive/30 text-[11px]">
                              Dibatalkan
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Customer Info & Notes */}
                      <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-foreground truncate max-w-[200px]">
                          <User className="size-3.5 shrink-0 text-muted-foreground" />
                          {order.customer_name || 'Tamu Resto'}
                          {order.customer_phone ? ` (${order.customer_phone})` : ''}
                        </span>

                        {/* Payment Status Badge */}
                        {isPaid ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <CheckCircle2 className="size-3" /> Lunas (QRIS/Online)
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                            Belum Bayar
                          </span>
                        )}
                      </div>

                      {order.notes && (
                        <div className="mt-1.5 p-2 rounded-lg bg-indigo-500/10 text-indigo-900 dark:text-indigo-200 text-[11px] flex items-start gap-1.5">
                          <FileText className="size-3.5 shrink-0 mt-0.5" />
                          <span className="italic leading-tight">{order.notes}</span>
                        </div>
                      )}
                    </div>

                    {/* Ordered Items List */}
                    <div className="p-4 py-3 flex-1 overflow-y-auto max-h-56 space-y-2 text-xs divide-y divide-border/30">
                      {itemsList.map((item, idx) => (
                        <div key={idx} className="pt-2 first:pt-0 flex items-start gap-2.5">
                          {/* Item Thumbnail */}
                          <div className="size-11 rounded-lg overflow-hidden bg-muted/60 border border-border/50 shrink-0">
                            {item.product?.image_url ? (
                              <img
                                src={item.product.image_url}
                                alt={item.product_name}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-indigo-500/5 text-indigo-600/60">
                                <Coffee className="size-4" />
                              </div>
                            )}
                          </div>

                          {/* Item Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <span className="font-semibold text-foreground truncate">
                                {item.product_name || item.product?.name}
                              </span>
                              <span className="font-bold text-foreground shrink-0">
                                {formatCurrency(item.subtotal || Number(item.unit_price) * Number(item.quantity))}
                              </span>
                            </div>

                            <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                              <span className="px-1.5 py-0.2 rounded bg-muted font-bold text-foreground">
                                {Number(item.quantity)}x
                              </span>
                              <span>@ {formatCurrency(item.unit_price)}</span>
                            </div>

                            {item.notes && (
                              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 italic mt-0.5 truncate">
                                Catatan: {item.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Card Footer: Bill Total & Action Buttons */}
                    <div className="p-4 pt-3 border-t border-border/50 bg-muted/20 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground font-medium">Total Pembayaran:</span>
                        <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </div>

                      {/* Action Buttons based on order lifecycle */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {/* Step 1: Pending -> Preparing */}
                        {isPending && (
                          <Button
                            size="xs"
                            onClick={() => handleUpdateOrderStatus(order.id, 'PREPARING')}
                            disabled={actionLoadingId === order.id}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-1.5"
                          >
                            {actionLoadingId === order.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              'Terima & Siapkan'
                            )}
                          </Button>
                        )}

                        {/* Step 2: Preparing -> Ready */}
                        {isPreparing && (
                          <Button
                            size="xs"
                            onClick={() => handleUpdateOrderStatus(order.id, 'READY')}
                            disabled={actionLoadingId === order.id}
                            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-1.5"
                          >
                            {actionLoadingId === order.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              'Tandai Siap Saji'
                            )}
                          </Button>
                        )}

                        {/* Step 3: Close Order (if Ready or already Paid) */}
                        {(isReady || (isPaid && isPreparing)) && (
                          <Button
                            size="xs"
                            onClick={() => handleUpdateOrderStatus(order.id, 'COMPLETED')}
                            disabled={actionLoadingId === order.id}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1.5 shadow-xs"
                          >
                            {actionLoadingId === order.id ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              'Close Order'
                            )}
                          </Button>
                        )}

                        {/* Cashier Payment Button (if unpaid) */}
                        {!isPaid && !isCancelled && (
                          <Button
                            size="xs"
                            onClick={() => handleOpenExistingOrderPayment(order)}
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs py-1.5 gap-1"
                          >
                            <CreditCard className="size-3.5" /> Bayar di Kasir
                          </Button>
                        )}

                        {/* View Receipt for completed orders */}
                        {isCompleted && (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => {
                              setCompletedOrder(order);
                              setReceiptModalOpen(true);
                            }}
                            className="flex-1 text-xs py-1.5 gap-1"
                          >
                            <Receipt className="size-3.5" /> Lihat Struk
                          </Button>
                        )}

                        {/* Cancel Button */}
                        {!isCompleted && !isCancelled && (
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleOpenCancelDialog(order)}
                            className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            title="Batalkan Pesanan"
                          >
                            <XCircle className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* CHECKOUT PAYMENT DIALOG (Works for Cart or Existing Order) */}
      {/* ============================================================ */}
      <Dialog open={checkoutModalOpen} onOpenChange={setCheckoutModalOpen}>
        <DialogContent onClose={() => setCheckoutModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {targetOrderForPayment
                ? `Pembayaran Pesanan #${targetOrderForPayment.order_number}`
                : 'Pembayaran Kasir'}
            </DialogTitle>
            <DialogDescription>
              {targetOrderForPayment
                ? `Pelanggan: ${targetOrderForPayment.customer_name || 'Tamu'} • ${
                    targetOrderForPayment.table ? targetOrderForPayment.table.name : 'Takeaway'
                  }`
                : 'Pilih metode bayar dan masukkan nominal transaksi untuk menyelesaikan pesanan.'}
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
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                Total Yang Wajib Dibayar
              </span>
              <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-0.5">
                {formatCurrency(activePayableAmount)}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Metode Pembayaran
              </label>
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
                          ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs'
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
                  {[activePayableAmount, ...QUICK_CASH_DENOMINATIONS].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCashTendered(String(amt))}
                      className="px-2.5 py-1 rounded-md border border-border bg-muted/50 text-[11px] font-semibold hover:bg-muted transition-colors"
                    >
                      {amt === activePayableAmount ? 'Uang Pas' : formatCurrency(amt)}
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
            <Button
              variant="outline"
              onClick={() => setCheckoutModalOpen(false)}
              disabled={processingPayment}
            >
              Batal
            </Button>
            <Button
              onClick={handleExecutePayment}
              disabled={processingPayment || (paymentMethod === 'CASH' && tenderedNum < activePayableAmount)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-sm shadow-emerald-600/20"
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

      {/* ============================================================ */}
      {/* CANCEL ORDER DIALOG */}
      {/* ============================================================ */}
      <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
        <DialogContent onClose={() => setCancelModalOpen(false)}>
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="size-5" /> Batalkan Pesanan #{orderToCancel?.order_number}
            </DialogTitle>
            <DialogDescription>
              Pesanan yang dibatalkan tidak akan dapat diproses kembali. Berikan alasan pembatalan.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase">Alasan Pembatalan</label>
            <Input
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Contoh: Tamu membatalkan pesanan..."
              className="text-xs"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancellingOrder}
            >
              Kembali
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmCancelOrder}
              disabled={cancellingOrder || !cancelReason.trim()}
            >
              {cancellingOrder ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Membatalkan...
                </>
              ) : (
                'Konfirmasi Batalkan'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================ */}
      {/* PAYMENT SUCCESS & RECEIPT DIALOG */}
      {/* ============================================================ */}
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
              <span className="text-muted-foreground">Sumber Pesanan:</span>
              <Badge variant="outline">
                {completedOrder?.source === 'QR' ? '📱 Scan QR Meja' : '🛒 Kasir POS'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pelanggan:</span>
              <span className="font-semibold">{completedOrder?.customer_name || 'Tamu Resto'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Metode Bayar:</span>
              <Badge variant="outline">{paymentMethod}</Badge>
            </div>
            <div className="flex justify-between pt-2 border-t border-border/60 font-bold text-sm">
              <span>Total Terbayar:</span>
              <span className="text-indigo-600 dark:text-indigo-400">
                {formatCurrency(completedOrder?.total_amount || 0)}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-xs"
              onClick={() => setReceiptModalOpen(false)}
            >
              Tutup & Kembali
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PosTerminalSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-28 rounded-lg" />
          <Skeleton className="h-8 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-36 rounded-lg" />
      </div>

      <div className="h-[calc(100vh-10.5rem)] flex flex-col lg:flex-row gap-4">
        <div className="flex-1 flex flex-col bg-card rounded-2xl border border-border/60 p-4 space-y-4">
          <Skeleton className="h-9 w-full rounded-xl" />
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 flex-1 overflow-hidden">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="p-2.5 rounded-xl border border-border/50 bg-background space-y-2">
                <Skeleton className="w-full aspect-[4/3] rounded-lg" />
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-3.5 w-3/4 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full lg:w-96 flex flex-col bg-card rounded-2xl border border-border/60 p-4 space-y-4 shrink-0">
          <div className="flex justify-between items-center pb-3 border-b border-border/50">
            <Skeleton className="h-4 w-28 rounded" />
            <Skeleton className="h-3 w-14 rounded" />
          </div>
          <div className="space-y-2 pb-3 border-b border-border/50">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-8 w-full rounded-lg" />
          </div>
          <div className="space-y-3 flex-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/30">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-28 rounded" />
                  <Skeleton className="h-3 w-16 rounded" />
                </div>
                <Skeleton className="h-6 w-16 rounded-lg" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function PosCashierPage() {
  return (
    <Suspense fallback={<PosTerminalSkeleton />}>
      <PosCashierContent />
    </Suspense>
  );
}
