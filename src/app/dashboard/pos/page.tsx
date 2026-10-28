'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Utensils,
  ShoppingBag,
  Bike,
  QrCode,
  LayoutGrid,
  Search,
  ShoppingCart,
  ArrowLeft,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  PosProduct,
  PosProductGrid,
} from '@/components/pos/PosProductGrid';
import {
  PosCartItem,
  PosCartPanel,
} from '@/components/pos/PosCartPanel';
import { PaymentModal } from '@/components/pos/PaymentModal';
import { BillPrintModal } from '@/components/pos/BillPrintModal';
import { DiscountModal } from '@/components/pos/DiscountModal';
import { PosOrdersDrawer } from '@/components/pos/PosOrdersDrawer';
import { PosOrdersTab, PosOrder } from '@/components/pos/PosOrdersTab';
import { TablePickerModal } from '@/components/pos/TablePickerModal';
import {
  TakeawayDetailsModal,
  TakeawayDetails,
} from '@/components/pos/TakeawayDetailsModal';
import {
  DeliveryDetailsModal,
  DeliveryDetails,
} from '@/components/pos/DeliveryDetailsModal';
import {
  QrIncomingOrdersModal,
  QrIncomingOrder,
} from '@/components/pos/QrIncomingOrdersModal';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { SearchInput } from '@/components/common/SearchInput';
import { LoadingScreen } from '@/components/common/LoadingScreen';
import { catalogService, posService } from '@/services';
import { tenantService } from '@/services/tenant.service';
import { useStore } from '@/context/StoreContext';

type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'QR_ORDER';
type PosViewMode = 'register' | 'orders';

function PosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { activeStore } = useStore();

  // Active top-level view: 'register' (Kasir) | 'orders' (Daftar Pesanan / KDS)
  const queryTab = searchParams.get('tab');
  const [activeView, setActiveView] = useState<PosViewMode>(
    queryTab === 'orders' ? 'orders' : 'register'
  );

  useEffect(() => {
    if (queryTab === 'orders') {
      setActiveView('orders');
    } else if (queryTab === 'register') {
      setActiveView('register');
    }
  }, [queryTab]);

  // Mode and order type
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [priceTier, setPriceTier] = useState<string>('NORMAL');
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Products and cart are loaded from / sent to the backend
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [cart, setCart] = useState<PosCartItem[]>([]);

  // Active taxes & fees configured in Pengaturan Outlet
  const [taxFees, setTaxFees] = useState<any[]>([]);
  const [lastOrderNumber, setLastOrderNumber] = useState('');

  // Customer & Table
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [selectedTable, setSelectedTable] = useState('');
  const [selectedTableId, setSelectedTableId] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Workflow Details for Dine-in, Takeaway, Delivery, and QR Order
  const [guestCount, setGuestCount] = useState(2);
  const [takeawayQueue, setTakeawayQueue] = useState('');
  const [packagingFee, setPackagingFee] = useState(0);
  const [packagingOption, setPackagingOption] = useState('');
  const [courierName, setCourierName] = useState<'GoSend' | 'GrabExpress' | 'Kurir Toko'>('GoSend');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Workflow Modals & Drawers state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isBillPrintOpen, setIsBillPrintOpen] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(false);
  const [isTablePickerOpen, setIsTablePickerOpen] = useState(false);
  const [isTakeawayModalOpen, setIsTakeawayModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [isQrIncomingOpen, setIsQrIncomingOpen] = useState(false);

  // Load real products and tax/fee configuration
  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await catalogService.getProducts();
        if (res.data) {
          const mapped: PosProduct[] = res.data.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.selling_price),
            imageUrl: p.image_url || null,
          }));
          setProducts(mapped);
        }
      } catch (e) {
        setProducts([]);
      }
    }
    async function fetchTaxFees() {
      try {
        const res: any = await tenantService.getTaxesFees();
        const list = (res?.data?.data ?? res?.data ?? []) as any[];
        setTaxFees(list.filter((t) => t.is_active));
      } catch {
        setTaxFees([]);
      }
    }
    fetchCatalog();
    fetchTaxFees();
  }, [activeStore]);

  // Handle switching order type
  const handleSelectOrderType = (type: OrderType) => {
    setOrderType(type);
    if (type === 'DINE_IN') {
      if (selectedTable === 'Takeaway' || selectedTable === 'Delivery') {
        setSelectedTable('');
        setSelectedTableId('');
      }
    } else if (type === 'TAKEAWAY') {
      setSelectedTable('Takeaway');
      setSelectedTableId('');
    } else if (type === 'DELIVERY') {
      setSelectedTable('Delivery');
      setSelectedTableId('');
    }
  };

  // Workflow Confirmation Handlers
  const handleConfirmTable = (table: { id: string; name: string }, guests: number) => {
    setSelectedTable(table.name);
    setSelectedTableId(table.id);
    setGuestCount(guests);
    setIsTablePickerOpen(false);
  };

  const handleConfirmTakeaway = (details: TakeawayDetails) => {
    setTakeawayQueue(details.queueNumber);
    setPackagingFee(details.packagingFee);
    setPackagingOption(details.packagingOption);
    if (details.customerName) setCustomerName(details.customerName);
    setIsTakeawayModalOpen(false);
  };

  const handleConfirmDelivery = (details: DeliveryDetails) => {
    setCourierName(details.courier);
    setDeliveryAddress(details.address);
    setDeliveryFee(details.deliveryFee);
    if (details.recipientName) setCustomerName(details.recipientName);
    if (details.recipientPhone) setCustomerPhone(details.recipientPhone);
    if (details.notes) setDeliveryNotes(details.notes);
    setIsDeliveryModalOpen(false);
  };

  const handleLoadQrOrder = (order: QrIncomingOrder) => {
    setCart(order.items);
    setCustomerName(order.customerName);
    if (order.customerPhone) setCustomerPhone(order.customerPhone);
    setSelectedTable(order.table);
    setOrderType('QR_ORDER');
    setIsQrIncomingOpen(false);
  };

  // Filter products by category, search, and favorites
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const q = menuSearch.toLowerCase().trim();
      const matchSearch = !q || p.name.toLowerCase().includes(q);

      // Category (products carry no category data from the backend)
      const matchCat = true;

      // Favorites
      const matchFav = !showOnlyFavorites || Boolean(p.isFavorite);

      return matchSearch && matchCat && matchFav;
    });
  }, [products, menuSearch, selectedCategory, showOnlyFavorites]);

  // Cart operations
  const handleAddToCart = (product: PosProduct) => {
    setCart((prev) => {
      const idx = prev.findIndex((item) => item.product.id === product.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + 1 };
        return next;
      }
      return [...prev, { product, quantity: 1, notes: '' }];
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as PosCartItem[]
    );
  };

  const handleUpdateItemNote = (productId: string, notes: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, notes } : item
      )
    );
  };

  // Calculations
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  // Taxes and fees come from the outlet configuration (database)
  const parseAmount = (value: string) => Number(String(value).replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
  const calcFee = (type: 'Pajak' | 'Biaya') =>
    Math.round(
      taxFees
        .filter((t) => t.type === type)
        .reduce(
          (sum, t) =>
            sum +
            (t.value_type === 'percent'
              ? (subtotal * parseAmount(t.value)) / 100
              : parseAmount(t.value)),
          0
        )
    );
  const tax = cart.length > 0 ? calcFee('Pajak') : 0;
  const nesosFee = cart.length > 0 ? calcFee('Biaya') : 0;
  const deliveryCost = orderType === 'DELIVERY' ? deliveryFee : 0;
  const packagingCost = orderType === 'TAKEAWAY' ? packagingFee : 0;
  const totalAmount = Math.max(
    0,
    subtotal + tax + nesosFee + deliveryCost + packagingCost - discountAmount
  );

  const handlePaymentSuccess = async (
    method: string,
    tendered: number,
    change: number
  ) => {
    try {
      const res: any = await posService.createOrder({
        table_id: selectedTableId || null,
        channel: orderType,
        customer_name: customerName || null,
        customer_phone: customerPhone || null,
        discount_amount: discountAmount,
        tax_amount: tax,
        service_charge: nesosFee,
        notes: orderNotes,
        items: cart.map((c) => ({
          product_id: c.product.id,
          quantity: c.quantity,
          notes: c.notes || null,
        })),
      });
      const created = res?.data?.data ?? res?.data;
      const orderId = created?.id;
      if (orderId) {
        await posService.processPayment(orderId, {
          method: method.toUpperCase() as any,
          amount: Number(created?.total_amount ?? totalAmount),
          metadata: { tendered, change },
        });
        setLastOrderNumber(created?.order_number || '');
      }
    } catch (e: any) {
      window.alert(e?.response?.data?.message || 'Gagal menyimpan pesanan. Silakan coba lagi.');
      return;
    }

    setIsPaymentOpen(false);
    setIsBillPrintOpen(true);
  };



  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Header matching Screenshot 1 & 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            Point of Sales (POS)
            {activeView === 'orders' && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Daftar Pesanan & KDS
              </span>
            )}
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {activeView === 'orders'
              ? 'Pantau antrean pesanan aktif, pesanan masuk dari QR meja, dan status saji dapur.'
              : 'Proses pesanan dengan cepat dan mudah.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">


          {/* Toggle View: Kasir POS vs Daftar Pesanan */}
          {activeView === 'register' ? (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setActiveView('orders')}
              className="text-xs font-semibold px-4 py-2"
              leftIcon={<LayoutGrid className="size-4 text-[#FF5C38]" />}
            >
              Daftar Pesanan
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setActiveView('register')}
              className="bg-[#FF5C38] hover:bg-[#E04B28] text-xs font-semibold px-4 py-2"
              leftIcon={<ShoppingCart className="size-4" />}
            >
              Kembali ke Kasir (POS)
            </Button>
          )}
        </div>
      </div>

      {/* VIEW 1: KASIR BARU (REGISTER) matching Screenshot 1 & 2 */}
      {activeView === 'register' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          {/* Order Type & Filter Bar matching Screenshot 1 & 2 */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Order Mode Segmented Buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <button
                type="button"
                onClick={() => handleSelectOrderType('DINE_IN')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  orderType === 'DINE_IN'
                    ? 'bg-[#FF5C38] text-white shadow-xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Utensils className="size-3.5" />
                <span>Dine-in</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectOrderType('TAKEAWAY')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  orderType === 'TAKEAWAY'
                    ? 'bg-[#FF5C38] text-white shadow-xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <ShoppingBag className="size-3.5" />
                <span>Takeway</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectOrderType('DELIVERY')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  orderType === 'DELIVERY'
                    ? 'bg-[#FF5C38] text-white shadow-xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <Bike className="size-3.5" />
                <span>Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectOrderType('QR_ORDER')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  orderType === 'QR_ORDER'
                    ? 'bg-[#FF5C38] text-white shadow-xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                <QrCode className="size-3.5" />
                <span>QR Order</span>
              </button>
            </div>

            {/* Right side: Price tier dropdown & Search input */}
            <div className="flex items-center gap-3">
              <div className="w-40 shrink-0">
                <Select
                  size="sm"
                  value={priceTier}
                  onChange={(e) => setPriceTier(e.target.value)}
                  className="text-xs font-semibold"
                >
                  <option value="NORMAL">Harga Normal</option>
                  <option value="GOFOOD">Harga GoFood</option>
                  <option value="GRABFOOD">Harga GrabFood</option>
                  <option value="EVENT">Harga Event</option>
                </Select>
              </div>

              <div className="w-full sm:w-64">
                <SearchInput
                  size="sm"
                  placeholder="Cari menu,..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  onClear={() => setMenuSearch('')}
                />
              </div>
            </div>
          </div>

          {/* Special Banner for QR Order mode */}
          {orderType === 'QR_ORDER' && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-purple-900">
              <div className="flex items-center gap-2.5">
                <QrCode className="size-5 text-purple-600 shrink-0" />
                <p>
                  <strong>Mode QR Order Aktif:</strong> Pelanggan dapat memesan mandiri lewat QR Meja. Anda dapat meninjau antrean pesanan masuk dan menariknya langsung ke kasir.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="primary"
                  size="xs"
                  onClick={() => setIsQrIncomingOpen(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold"
                >
                  Tinjau Antrean QR
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setActiveView('orders')}
                  className="border-purple-300 text-purple-700 hover:bg-purple-100"
                >
                  Buka KDS
                </Button>
              </div>
            </div>
          )}

          {/* Main 2-Column Section: Left Product Grid & Right Cart Panel */}
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            {/* Left Column: Product Catalog Grid matching Screenshot 1 */}
            <PosProductGrid
              products={filteredProducts}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              showOnlyFavorites={showOnlyFavorites}
              onToggleFavorites={() => setShowOnlyFavorites((prev) => !prev)}
              onAddToCart={handleAddToCart}

            />

            {/* Right Column: Order Summary / Cart Panel matching Screenshot 1 */}
            <PosCartPanel
              cart={cart}
              customerName={customerName}
              customerPhone={customerPhone}
              selectedTable={selectedTable}
              orderNotes={orderNotes}
              discountAmount={discountAmount}
              orderType={orderType}
              deliveryFee={deliveryFee}
              packagingFee={packagingFee}
              courierName={courierName}
              takeawayQueue={takeawayQueue}
              onUpdateQuantity={handleUpdateQuantity}
              onUpdateItemNote={handleUpdateItemNote}
              onUpdateOrderNotes={setOrderNotes}
              onSelectCustomer={(name, phone) => {
                setCustomerName(name);
                setCustomerPhone(phone);
              }}
              onSelectTable={setSelectedTable}
              onOpenTablePicker={() => setIsTablePickerOpen(true)}
              onOpenDeliveryModal={() => setIsDeliveryModalOpen(true)}
              onOpenTakeawayModal={() => setIsTakeawayModalOpen(true)}
              onOpenQrIncomingModal={() => setIsQrIncomingOpen(true)}
              onOpenDiscountModal={() => setIsDiscountOpen(true)}
              onOpenBillPrint={() => setIsBillPrintOpen(true)}
              onOpenPayment={() => setIsPaymentOpen(true)}
              onClearCart={() => setCart([])}
            />
          </div>
        </div>
      )}

      {/* VIEW 2: DAFTAR PESANAN & KDS QUEUE */}
      {activeView === 'orders' && (
        <div className="animate-in fade-in duration-150">
          <PosOrdersTab
            onBackToRegister={() => setActiveView('register')}
            onPrintBill={(order) => {
              setIsBillPrintOpen(true);
            }}
          />
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentOpen}
        totalAmount={totalAmount}
        customerName={customerName}
        selectedTable={selectedTable}
        onClose={() => setIsPaymentOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* Bill Print Modal */}
      <BillPrintModal
        isOpen={isBillPrintOpen}
        orderNumber={lastOrderNumber}
        cart={cart}
        customerName={customerName}
        customerPhone={customerPhone}
        selectedTable={selectedTable}
        orderNotes={orderNotes}
        discountAmount={discountAmount}
        deliveryCost={deliveryCost}
        packagingCost={packagingCost}
        courierName={courierName}
        onClose={() => setIsBillPrintOpen(false)}
      />

      {/* Discount & Voucher Modal */}
      <DiscountModal
        isOpen={isDiscountOpen}
        subtotal={subtotal}
        currentDiscount={discountAmount}
        onClose={() => setIsDiscountOpen(false)}
        onApplyDiscount={(amount) => setDiscountAmount(amount)}
      />

      {/* Orders Drawer ("Daftar Pesanan" quick drawer) */}
      <PosOrdersDrawer
        isOpen={isOrdersDrawerOpen}
        onClose={() => setIsOrdersDrawerOpen(false)}
      />

      {/* Table Picker Modal for Dine-in */}
      <TablePickerModal
        isOpen={isTablePickerOpen}
        selectedTable={selectedTable}
        guestCount={guestCount}
        onClose={() => setIsTablePickerOpen(false)}
        onSelectTable={handleConfirmTable}
      />

      {/* Takeaway Details Modal */}
      <TakeawayDetailsModal
        isOpen={isTakeawayModalOpen}
        initialDetails={{
          queueNumber: takeawayQueue,
          packagingOption,
          packagingFee,
          pickupTime: 'Segera (10-15 menit)',
          customerName,
        }}
        onClose={() => setIsTakeawayModalOpen(false)}
        onConfirm={handleConfirmTakeaway}
      />

      {/* Delivery Details Modal */}
      <DeliveryDetailsModal
        isOpen={isDeliveryModalOpen}
        initialDetails={{
          courier: courierName,
          recipientName: customerName,
          recipientPhone: customerPhone,
          address: deliveryAddress,
          deliveryFee,
          notes: deliveryNotes,
        }}
        onClose={() => setIsDeliveryModalOpen(false)}
        onConfirm={handleConfirmDelivery}
      />

      {/* QR Incoming Orders Modal */}
      <QrIncomingOrdersModal
        isOpen={isQrIncomingOpen}
        onClose={() => setIsQrIncomingOpen(false)}
        onLoadOrderToCart={handleLoadQrOrder}
        onDirectConfirmToKitchen={(order) => {
          setIsQrIncomingOpen(false);
          setActiveView('orders');
        }}
      />
    </div>
  );
}

export default function PosPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Memuat Point of Sales..." />}>
      <PosContent />
    </Suspense>
  );
}
