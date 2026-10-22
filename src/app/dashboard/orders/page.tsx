'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  ChevronDown,
  Sparkles,
  Play,
  ShoppingBag,
  Check,
  X,
  MoreVertical,
  QrCode,
  Store,
  ChevronLeft,
  ChevronRight,
  Eye,
  RefreshCw,
  UtensilsCrossed,
} from 'lucide-react';
import {
  StatusBadge,
  EmptyState,
  DataTable,
  ColumnDef,
  ChannelBadge,
} from '@/components/common';
import { OrderDetailsDrawer, DetailedOrder } from '@/components/orders/OrderDetailsDrawer';
import { formatRupiah } from '@/utils';

type FilterStatus = 'Semua' | 'Baru' | 'Diproses' | 'Siap diambil' | 'Selesai' | 'Dibatalkan';

export default function OrdersPage() {
  // Filter states
  const [selectedStatusTab, setSelectedStatusTab] = useState<FilterStatus>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('Semua channel');
  const [selectedType, setSelectedType] = useState<string>('Semua tipe');
  const [selectedPayment, setSelectedPayment] = useState<string>('Semua pembayaran');

  // Preview Mode: 'populated' (Screenshot 3) vs 'empty' (Screenshot 4)
  const [previewMode, setPreviewMode] = useState<'populated' | 'empty'>('populated');

  // Slide-over Drawer state
  const [selectedOrder, setSelectedOrder] = useState<DetailedOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Selected checkbox rows
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Mock Orders dataset matching Screenshot 3 & Screenshots 1-2
  const mockOrders: DetailedOrder[] = [
    {
      id: '1',
      orderNumber: 'ORD-10',
      dateTime: '14 Okt 2026, 09:40',
      status: 'Baru',
      paymentStatus: 'Lunas',
      diningType: 'Dine-in',
      channel: 'QR Order',
      tableOrCustomer: 'Meja 04',
      items: [
        {
          id: 'i1',
          name: 'Kopi Susu Gula Aren',
          qty: 1,
          variant: 'Regular, Less Ice',
          price: 28000,
          iconBg: 'bg-amber-100 text-amber-800',
        },
        {
          id: 'i2',
          name: 'Matcha Latte',
          qty: 1,
          variant: 'Regular',
          notes: 'Tanpa es untuk matcha latte ya.',
          price: 30000,
          iconBg: 'bg-emerald-100 text-emerald-800',
        },
      ],
      subtotal: 58000,
      tax: 0,
      fee: 0,
      discount: 0,
      total: 58000,
      notes: '-',
      paymentMethod: 'QRIS',
    },
    {
      id: '2',
      orderNumber: 'ORD-09',
      dateTime: '14 Okt 2026, 09:35',
      status: 'Diproses',
      paymentStatus: 'Menunggu',
      diningType: 'Dine-in',
      channel: 'Kasir',
      tableOrCustomer: 'Meja 01',
      items: [
        { id: 'i3', name: 'Americano', qty: 2, variant: 'Hot', price: 50000 },
        { id: 'i4', name: 'Croissant Butter', qty: 1, price: 26000 },
      ],
      subtotal: 76000,
      tax: 0,
      fee: 0,
      discount: 0,
      total: 76000,
      notes: 'Gula dipisah',
      paymentMethod: 'Tunai (Kasir)',
    },
    {
      id: '3',
      orderNumber: 'ORD-08',
      dateTime: '14 Okt 2026, 09:20',
      status: 'Siap diambil',
      paymentStatus: 'Lunas',
      diningType: 'Delivery',
      channel: 'GrabFood',
      tableOrCustomer: 'Budi Santoso',
      items: [
        { id: 'i5', name: 'Cafe Latte', qty: 2, price: 60000 },
        { id: 'i6', name: 'Pain au Chocolat', qty: 1, price: 32000 },
      ],
      subtotal: 92000,
      tax: 0,
      fee: 0,
      discount: 0,
      total: 92000,
      notes: 'Driver tolong antar ke lantai 3',
      paymentMethod: 'GrabPay',
    },
    {
      id: '4',
      orderNumber: 'ORD-07',
      dateTime: '14 Okt 2026, 09:10',
      status: 'Selesai',
      paymentStatus: 'Lunas',
      diningType: 'Dine-in',
      channel: 'QR Order',
      tableOrCustomer: 'Meja 02',
      items: [
        { id: 'i7', name: 'Kopi Susu Gula Aren', qty: 2, price: 58000 },
      ],
      subtotal: 58000,
      tax: 0,
      fee: 0,
      discount: 0,
      total: 58000,
      notes: '-',
      paymentMethod: 'QRIS',
    },
    {
      id: '5',
      orderNumber: 'ORD-06',
      dateTime: '14 Okt 2026, 08:56',
      status: 'Dibatalkan',
      paymentStatus: 'Dibatalkan',
      diningType: 'Delivery',
      channel: 'ShopeeFood',
      tableOrCustomer: 'Andi Wijaya',
      items: [
        { id: 'i8', name: 'Caramel Macchiato', qty: 1, price: 35000 },
        { id: 'i9', name: 'Donut Coklat', qty: 1, price: 23000 },
      ],
      subtotal: 58000,
      tax: 0,
      fee: 0,
      discount: 0,
      total: 58000,
      notes: 'Dibatalkan oleh pelanggan',
      paymentMethod: 'ShopeePay',
    },
    {
      id: '6',
      orderNumber: 'ORD-05',
      dateTime: '14 Okt 2026, 08:47',
      status: 'Selesai',
      paymentStatus: 'Lunas',
      diningType: 'Dine-in',
      channel: 'QR Order',
      tableOrCustomer: 'Meja 06',
      items: [
        { id: 'i10', name: 'Matcha Latte', qty: 1, price: 30000 },
        { id: 'i11', name: 'Almond Croissant', qty: 1, price: 28000 },
      ],
      subtotal: 58000,
      tax: 0,
      fee: 0,
      discount: 0,
      total: 58000,
      notes: '-',
      paymentMethod: 'QRIS',
    },
    {
      id: '7',
      orderNumber: 'ORD-04',
      dateTime: '14 Okt 2026, 08:45',
      status: 'Selesai',
      paymentStatus: 'Lunas',
      diningType: 'Delivery',
      channel: 'GoFood',
      tableOrCustomer: 'Amanda',
      items: [
        { id: 'i12', name: 'Vanilla Latte', qty: 2, price: 56000 },
        { id: 'i13', name: 'Cinnamon Roll', qty: 1, price: 20000 },
      ],
      subtotal: 76000,
      tax: 0,
      fee: 0,
      discount: 0,
      total: 76000,
      notes: '-',
      paymentMethod: 'GoPay',
    },
    {
      id: '8',
      orderNumber: 'ORD-03',
      dateTime: '14 Okt 2026, 08:40',
      status: 'Selesai',
      paymentStatus: 'Lunas',
      diningType: 'Dine-in',
      channel: 'Kasir',
      tableOrCustomer: 'Meja 08',
      items: [
        { id: 'i14', name: 'Es Kopi Susu', qty: 2, price: 58000 },
      ],
      subtotal: 58000,
      tax: 0,
      fee: 0,
      discount: 0,
      total: 58000,
      notes: '-',
      paymentMethod: 'Debit BCA',
    },
    {
      id: '9',
      orderNumber: 'ORD-02',
      dateTime: '14 Okt 2026, 08:35',
      status: 'Selesai',
      paymentStatus: 'Lunas',
      diningType: 'Takeaway',
      channel: 'Kasir',
      tableOrCustomer: 'Pelanggan umum',
      items: [
        { id: 'i15', name: 'Cappuccino', qty: 2, price: 60000 },
        { id: 'i16', name: 'Brownies', qty: 2, price: 32000 },
      ],
      subtotal: 92000,
      tax: 0,
      fee: 0,
      discount: 0,
      total: 92000,
      notes: 'Bungkus terpisah',
      paymentMethod: 'QRIS',
    },
    {
      id: '10',
      orderNumber: 'ORD-01',
      dateTime: '14 Okt 2026, 08:30',
      status: 'Selesai',
      paymentStatus: 'Lunas',
      diningType: 'Dine-in',
      channel: 'QR Order',
      tableOrCustomer: 'Meja 09',
      items: [
        { id: 'i17', name: 'Kopi Susu Gula Aren', qty: 2, price: 56000 },
        { id: 'i18', name: 'Waffle Ice Cream', qty: 1, price: 20000 },
      ],
      subtotal: 76000,
      tax: 0,
      fee: 0,
      discount: 0,
      total: 76000,
      notes: '-',
      paymentMethod: 'QRIS',
    },
  ];

  const isEmpty = previewMode === 'empty';

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    if (isEmpty) return [];

    return mockOrders.filter((ord) => {
      // Tab status filter
      if (selectedStatusTab !== 'Semua' && ord.status !== selectedStatusTab) {
        return false;
      }
      // Channel filter
      if (selectedChannel !== 'Semua channel' && ord.channel !== selectedChannel) {
        return false;
      }
      // Type filter
      if (selectedType !== 'Semua tipe' && ord.diningType !== selectedType) {
        return false;
      }
      // Payment filter
      if (selectedPayment !== 'Semua pembayaran' && ord.paymentStatus !== selectedPayment) {
        return false;
      }
      // Search text query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = ord.orderNumber.toLowerCase().includes(q);
        const matchCustomer = ord.tableOrCustomer.toLowerCase().includes(q);
        if (!matchNumber && !matchCustomer) return false;
      }
      return true;
    });
  }, [
    isEmpty,
    mockOrders,
    selectedStatusTab,
    selectedChannel,
    selectedType,
    selectedPayment,
    searchQuery,
  ]);

  const handleRowClick = (order: DetailedOrder) => {
    setSelectedOrder(order);
    setDrawerOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRowIds(filteredOrders.map((o) => o.id));
    } else {
      setSelectedRowIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    setSelectedRowIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handlePrevOrder = () => {
    if (!selectedOrder) return;
    const currentIndex = filteredOrders.findIndex((o) => o.id === selectedOrder.id);
    if (currentIndex > 0) {
      setSelectedOrder(filteredOrders[currentIndex - 1]);
    }
  };

  const handleNextOrder = () => {
    if (!selectedOrder) return;
    const currentIndex = filteredOrders.findIndex((o) => o.id === selectedOrder.id);
    if (currentIndex < filteredOrders.length - 1) {
      setSelectedOrder(filteredOrders[currentIndex + 1]);
    }
  };

  // Column definitions for the reusable DataTable
  const columns: ColumnDef<DetailedOrder>[] = [
    {
      key: 'orderNumber',
      header: 'No. Pesanan',
      render: (ord) => (
        <span className="font-semibold text-neutral-900 whitespace-nowrap">
          {ord.orderNumber}
        </span>
      ),
    },
    {
      key: 'waktu',
      header: 'Waktu',
      render: (ord) => (
        <span className="text-neutral-500 whitespace-nowrap">
          {ord.dateTime.split(', ')[1] || '09:40'}
        </span>
      ),
    },
    {
      key: 'channel',
      header: 'Channel',
      render: (ord) => <ChannelBadge channel={ord.channel} />,
    },
    {
      key: 'diningType',
      header: 'Tipe',
      render: (ord) => (
        <span className="text-neutral-600 whitespace-nowrap">{ord.diningType}</span>
      ),
    },
    {
      key: 'tableOrCustomer',
      header: 'Pelanggan / Meja',
      render: (ord) => (
        <span className="font-semibold text-neutral-800 whitespace-nowrap">
          {ord.tableOrCustomer}
        </span>
      ),
    },
    {
      key: 'items',
      header: 'Item',
      render: (ord) => {
        const totalItemsCount = ord.items.reduce((sum, i) => sum + i.qty, 0);
        return <span className="text-neutral-600 whitespace-nowrap">{totalItemsCount} Item</span>;
      },
    },
    {
      key: 'total',
      header: 'Total',
      render: (ord) => (
        <span className="font-bold text-neutral-900 whitespace-nowrap">
          {formatRupiah(ord.total)}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Pembayaran',
      render: (ord) => {
        if (ord.paymentStatus === 'Lunas') {
          return (
            <StatusBadge variant="success" icon={<Check className="size-3 stroke-[2.5]" />}>
              Lunas
            </StatusBadge>
          );
        }
        if (ord.paymentStatus === 'Menunggu') {
          return (
            <StatusBadge variant="warning" dot>
              Menunggu
            </StatusBadge>
          );
        }
        return <StatusBadge variant="neutral">Dibatalkan</StatusBadge>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (ord) => {
        switch (ord.status) {
          case 'Baru':
            return <StatusBadge variant="danger" dot>Baru</StatusBadge>;
          case 'Diproses':
            return <StatusBadge variant="warning" dot>Diproses</StatusBadge>;
          case 'Siap diambil':
            return <StatusBadge variant="info" dot>Siap diambil</StatusBadge>;
          case 'Selesai':
            return <StatusBadge variant="success" dot>Selesai</StatusBadge>;
          default:
            return <StatusBadge variant="neutral" dot>Dibatalkan</StatusBadge>;
        }
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (ord) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(ord);
          }}
          className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          aria-label="Aksi"
        >
          <MoreVertical className="size-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-5 sm:p-6 lg:p-7 space-y-5 max-w-[1520px] mx-auto animate-in fade-in duration-200">
      {/* ======================================================== */}
      {/* 1. PAGE HEADER (Screenshot 3 & 4)                        */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#111827] tracking-tight">
            Pesanan
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Pantau dan kelola semua pesanan dari berbagai channel dalam satu tempat
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher: Populated vs Empty preview for QA/User */}
          <button
            type="button"
            onClick={() => setPreviewMode(isEmpty ? 'populated' : 'empty')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-colors shadow-2xs"
            title="Klik untuk berpindah antara tampilan data terisi dan kosong"
          >
            <Eye className="size-3.5 text-[#2563EB]" />
            <span>Mode: {isEmpty ? 'Data Kosong' : 'Data Terisi'}</span>
          </button>

          {/* Auto Update indicator badge matching Screenshot 3 */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-400/80 bg-emerald-50 text-emerald-700 text-xs font-semibold shadow-2xs">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Auto Update</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. FILTER TABS (Screenshot 3)                            */}
      {/* ======================================================== */}
      <div className="flex items-center border-b border-neutral-200 gap-1 overflow-x-auto text-xs no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedStatusTab('Semua')}
          className={`px-5 py-2.5 font-bold transition-all relative ${
            selectedStatusTab === 'Semua'
              ? 'text-[#FF5C38]'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <span>Semua</span>
          {selectedStatusTab === 'Semua' && (
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF5C38]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('Baru')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-bold transition-all relative ${
            selectedStatusTab === 'Baru'
              ? 'text-[#FF5C38]'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Sparkles className="size-3.5" />
          <span>Baru</span>
          {selectedStatusTab === 'Baru' && (
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF5C38]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('Diproses')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-bold transition-all relative ${
            selectedStatusTab === 'Diproses'
              ? 'text-[#FF5C38]'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Play className="size-3 fill-current ml-0.5" />
          <span>Diproses</span>
          {selectedStatusTab === 'Diproses' && (
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF5C38]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('Siap diambil')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-bold transition-all relative ${
            selectedStatusTab === 'Siap diambil'
              ? 'text-[#FF5C38]'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <ShoppingBag className="size-3.5" />
          <span>Siap diambil</span>
          {selectedStatusTab === 'Siap diambil' && (
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF5C38]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('Selesai')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-bold transition-all relative ${
            selectedStatusTab === 'Selesai'
              ? 'text-[#FF5C38]'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Check className="size-3.5 stroke-[2.5]" />
          <span>Selesai</span>
          {selectedStatusTab === 'Selesai' && (
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF5C38]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('Dibatalkan')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-bold transition-all relative ${
            selectedStatusTab === 'Dibatalkan'
              ? 'text-[#FF5C38]'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <X className="size-3.5 stroke-[2.5]" />
          <span>Dibatalkan</span>
          {selectedStatusTab === 'Dibatalkan' && (
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF5C38]" />
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. FILTER CONTROLS BAR (Screenshot 3)                    */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Date Picker */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-neutral-200/90 shadow-2xs font-semibold text-neutral-800 cursor-pointer hover:bg-neutral-50">
            <span>Hari ini (14/10/2026)</span>
            <Calendar className="size-3.5 text-neutral-400" />
          </div>

          {/* Channel Dropdown */}
          <div className="relative">
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="appearance-none bg-white border border-neutral-200/90 shadow-2xs rounded-xl px-3 py-2 pr-7 font-semibold text-neutral-800 hover:bg-neutral-50 cursor-pointer focus:outline-none"
            >
              <option>Semua channel</option>
              <option>QR Order</option>
              <option>Kasir</option>
              <option>GrabFood</option>
              <option>ShopeeFood</option>
              <option>GoFood</option>
            </select>
            <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Type Dropdown */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="appearance-none bg-white border border-neutral-200/90 shadow-2xs rounded-xl px-3 py-2 pr-7 font-semibold text-neutral-800 hover:bg-neutral-50 cursor-pointer focus:outline-none"
            >
              <option>Semua tipe</option>
              <option>Dine-in</option>
              <option>Takeaway</option>
              <option>Delivery</option>
            </select>
            <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Payment Dropdown */}
          <div className="relative">
            <select
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value)}
              className="appearance-none bg-white border border-neutral-200/90 shadow-2xs rounded-xl px-3 py-2 pr-7 font-semibold text-neutral-800 hover:bg-neutral-50 cursor-pointer focus:outline-none"
            >
              <option>Semua pembayaran</option>
              <option>Lunas</option>
              <option>Menunggu</option>
              <option>Dibatalkan</option>
            </select>
            <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] lg:w-72">
          <input
            type="text"
            placeholder="Cari nomor pesanan, nama pel..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-neutral-200/90 shadow-2xs rounded-xl pl-3.5 pr-8 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
          <Search className="size-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. ORDERS DATA TABLE (Reused Global DataTable)           */}
      {/* ======================================================== */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        selectable
        selectedIds={selectedRowIds}
        onToggleSelect={(id) => handleSelectRow(id)}
        onToggleSelectAll={() => handleSelectAll(selectedRowIds.length !== filteredOrders.length)}
        onRowClick={handleRowClick}
        emptyTitle="BELUM ADA PESANAN"
        emptyDescription="Pesanan yang masuk akan muncul di sini."
        entityName="pesanan"
      />

      {/* ======================================================== */}
      {/* 6. SLIDE-OVER ORDER DETAILS DRAWER (Screenshots 1 & 2)   */}
      {/* ======================================================== */}
      <OrderDetailsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        order={selectedOrder}
        onAccept={(id) => {
          alert(`Pesanan ${selectedOrder?.orderNumber} diterima!`);
          setDrawerOpen(false);
        }}
        onReject={(id) => {
          alert(`Pesanan ${selectedOrder?.orderNumber} ditolak.`);
          setDrawerOpen(false);
        }}
        onPrev={handlePrevOrder}
        onNext={handleNextOrder}
      />
    </div>
  );
}
