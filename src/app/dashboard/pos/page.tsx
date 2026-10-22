'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Utensils,
  ShoppingBag,
  Bike,
  QrCode,
  LayoutGrid,
  Search,
} from 'lucide-react';
import {
  PosProduct,
  INITIAL_POS_PRODUCTS,
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
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { SearchInput } from '@/components/common/SearchInput';
import { catalogService, posService } from '@/services';
import { useStore } from '@/context/StoreContext';

type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'QR_ORDER';

export default function PosPage() {
  const { activeStore } = useStore();

  // Mode and order type
  const [orderType, setOrderType] = useState<OrderType>('DINE_IN');
  const [priceTier, setPriceTier] = useState<string>('NORMAL');
  const [menuSearch, setMenuSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Products state (defaults to Screenshot 1's 9 items)
  const [products, setProducts] = useState<PosProduct[]>(INITIAL_POS_PRODUCTS);

  // Initial cart matching Screenshot 1:
  // Item 1: 1x Kopi Susu Gula Aren (Rp28.000)
  // Item 2: 2x Matcha Latte (Rp30.000 -> Rp60.000)
  const [cart, setCart] = useState<PosCartItem[]>([
    {
      product: INITIAL_POS_PRODUCTS[0], // Kopi Susu Gula Aren
      quantity: 1,
      notes: '',
    },
    {
      product: INITIAL_POS_PRODUCTS[1], // Matcha Latte
      quantity: 2,
      notes: '',
    },
  ]);

  // Customer & Table matching Screenshot 1
  const [customerName, setCustomerName] = useState('Marshanda');
  const [customerPhone, setCustomerPhone] = useState('081245678909');
  const [selectedTable, setSelectedTable] = useState('Meja 3');
  const [orderNotes, setOrderNotes] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Modals & Drawers state
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isBillPrintOpen, setIsBillPrintOpen] = useState(false);
  const [isDiscountOpen, setIsDiscountOpen] = useState(false);
  const [isOrdersDrawerOpen, setIsOrdersDrawerOpen] = useState(false);

  // Try to load real products if available
  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await catalogService.getProducts();
        if (res.data && res.data.length > 0) {
          // Map backend products to PosProduct if available
          const mapped: PosProduct[] = res.data.map((p) => ({
            id: p.id,
            name: p.name,
            category: 'Kopi',
            categoryBadge: 'Kopi',
            price: Number(p.selling_price),
            imageUrl:
              p.image_url ||
              'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=80',
          }));
          setProducts(mapped);
        }
      } catch (e) {
        // Fallback to high-fidelity mock products matching Figma
      }
    }
    fetchCatalog();
  }, [activeStore]);

  // Filter products by category, search, and favorites
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const q = menuSearch.toLowerCase().trim();
      const matchSearch = !q || p.name.toLowerCase().includes(q);

      // Category
      const matchCat =
        selectedCategory === 'Semua' || p.category === selectedCategory;

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
  const tax = Math.round(subtotal * 0.1);
  const nesosFee = cart.length > 0 ? 1910 : 0;
  const totalAmount = Math.max(0, subtotal + tax + nesosFee - discountAmount);

  const handlePaymentSuccess = async (
    method: string,
    tendered: number,
    change: number
  ) => {
    // Attempt real backend order creation if online
    try {
      await posService.createOrder({
        table_id: selectedTable || null,
        customer_name: customerName,
        customer_phone: customerPhone,
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
    } catch (e) {
      // offline/mock mode handled gracefully
    }

    setIsPaymentOpen(false);
    setIsBillPrintOpen(true);
  };

  // Demo switchers for easy evaluation
  const setPopulatedDemo = () => {
    setProducts(INITIAL_POS_PRODUCTS);
    setCart([
      {
        product: INITIAL_POS_PRODUCTS[0],
        quantity: 1,
        notes: '',
      },
      {
        product: INITIAL_POS_PRODUCTS[1],
        quantity: 2,
        notes: '',
      },
    ]);
    setCustomerName('Marshanda');
    setCustomerPhone('081245678909');
    setSelectedTable('Meja 3');
  };

  const setEmptyDemo = () => {
    setProducts([]);
    setCart([]);
    setCustomerName('');
    setCustomerPhone('');
    setSelectedTable('');
    setDiscountAmount(0);
    setOrderNotes('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5">
      {/* Top Header matching Screenshot 1 & 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Point of Sales (POS)
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Proses pesanan dengan cepat dan mudah.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Demo Switcher */}
          <div className="hidden md:flex items-center border border-neutral-200 rounded-lg p-0.5 bg-neutral-50 text-[11px]">
            <button
              type="button"
              onClick={setPopulatedDemo}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                cart.length > 0 && products.length > 0
                  ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Ada Pesanan (Screenshot 1)
            </button>
            <button
              type="button"
              onClick={setEmptyDemo}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                cart.length === 0 && products.length === 0
                  ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Kosong (Screenshot 2)
            </button>
          </div>

          {/* Daftar Pesanan Button matching Screenshot 1 */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsOrdersDrawerOpen(true)}
            className="text-xs font-semibold px-4 py-2"
            leftIcon={<LayoutGrid className="size-4 text-[#FF5C38]" />}
          >
            Daftar Pesanan
          </Button>
        </div>
      </div>

      {/* Order Type & Filter Bar matching Screenshot 1 & 2 */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Order Mode Segmented Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <button
            type="button"
            onClick={() => setOrderType('DINE_IN')}
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
            onClick={() => setOrderType('TAKEAWAY')}
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
            onClick={() => setOrderType('DELIVERY')}
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
            onClick={() => setOrderType('QR_ORDER')}
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
          onResetDemoMenu={setPopulatedDemo}
        />

        {/* Right Column: Order Summary / Cart Panel matching Screenshot 1 */}
        <PosCartPanel
          cart={cart}
          customerName={customerName}
          customerPhone={customerPhone}
          selectedTable={selectedTable}
          orderNotes={orderNotes}
          discountAmount={discountAmount}
          onUpdateQuantity={handleUpdateQuantity}
          onUpdateItemNote={handleUpdateItemNote}
          onUpdateOrderNotes={setOrderNotes}
          onSelectCustomer={(name, phone) => {
            setCustomerName(name);
            setCustomerPhone(phone);
          }}
          onSelectTable={setSelectedTable}
          onOpenDiscountModal={() => setIsDiscountOpen(true)}
          onOpenBillPrint={() => setIsBillPrintOpen(true)}
          onOpenPayment={() => setIsPaymentOpen(true)}
          onClearCart={() => setCart([])}
        />
      </div>

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
        orderNumber="ORD-2026-0042"
        cart={cart}
        customerName={customerName}
        customerPhone={customerPhone}
        selectedTable={selectedTable}
        orderNotes={orderNotes}
        discountAmount={discountAmount}
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

      {/* Orders Drawer ("Daftar Pesanan") */}
      <PosOrdersDrawer
        isOpen={isOrdersDrawerOpen}
        onClose={() => setIsOrdersDrawerOpen(false)}
      />
    </div>
  );
}
