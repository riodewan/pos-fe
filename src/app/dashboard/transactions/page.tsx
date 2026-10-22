'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Search,
  ChevronDown,
  Upload,
  MoreVertical,
  Check,
  Clock,
  X,
} from 'lucide-react';
import {
  DataTable,
  ColumnDef,
  ChannelBadge,
} from '@/components/common';
import {
  TransactionDetailsDrawer,
  DetailedTransaction,
} from '@/components/transactions/TransactionDetailsDrawer';
import { formatRupiah } from '@/utils';

// Payment Status Pill Component matching Figma design
function PaymentStatusBadge({ status }: { status: 'Lunas' | 'Sebagian' | 'Dibatalkan' }) {
  switch (status) {
    case 'Lunas':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E8F5E9] text-[#2E7D32]">
          <span className="size-3.5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-[8px] font-bold">
            <Check className="size-2.5 stroke-[3]" />
          </span>
          <span>Lunas</span>
        </span>
      );
    case 'Sebagian':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FFF8E1] text-[#B78103]">
          <span className="size-3.5 rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-[8px] font-bold">
            <Clock className="size-2.5 stroke-[3]" />
          </span>
          <span>Sebagian</span>
        </span>
      );
    case 'Dibatalkan':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#ECEFF1] text-[#546E7A]">
          <span className="size-3.5 rounded-full bg-[#78909C] text-white flex items-center justify-center text-[8px] font-bold">
            <X className="size-2.5 stroke-[3]" />
          </span>
          <span>Dibatalkan</span>
        </span>
      );
  }
}

// 10 Records matching Screenshot 2 exactly
const INITIAL_TRANSACTIONS: DetailedTransaction[] = [
  {
    id: 'trx-10',
    transactionNumber: 'TRX-123456789-010',
    orderNumber: 'ORD-10',
    dateTime: '14 Okt 2026, 09:40',
    diningType: 'Dine-in',
    channel: 'QR Order',
    tableOrCustomer: 'Meja 04',
    cashierName: 'Andi Pratama',
    paymentTime: '14 Okt 2026, 09:40',
    paymentMethod: 'QRIS',
    paymentStatus: 'Lunas',
    paymentReference: 'PAY-123456',
    subtotal: 58000,
    tax: 0,
    serviceFee: 0,
    discount: 0,
    total: 58000,
    items: [
      {
        id: 'item-1',
        name: 'Kopi Susu Gula Aren',
        qty: 1,
        variant: 'Regular, Less Ice',
        price: 28000,
      },
      {
        id: 'item-2',
        name: 'Matcha Latte',
        qty: 1,
        variant: 'Regular',
        price: 30000,
      },
    ],
  },
  {
    id: 'trx-09',
    transactionNumber: 'TRX-123456789-009',
    orderNumber: 'ORD-09',
    dateTime: '14 Okt 2026, 09:35',
    diningType: 'Dine-in',
    channel: 'Kasir',
    tableOrCustomer: 'Meja 01',
    cashierName: 'Andi Pratama',
    paymentTime: '14 Okt 2026, 09:35',
    paymentMethod: 'Tunai',
    paymentStatus: 'Lunas',
    paymentReference: 'CASH-9921',
    subtotal: 76000,
    tax: 0,
    serviceFee: 0,
    discount: 0,
    total: 76000,
    items: [
      { id: 'item-3', name: 'Caramel Macchiato', qty: 2, variant: 'Regular', price: 56000 },
      { id: 'item-4', name: 'Croissant Butter', qty: 1, variant: 'Warm', price: 20000 },
      { id: 'item-4b', name: 'Espresso Single', qty: 1, variant: 'Hot', price: 20000 },
    ],
  },
  {
    id: 'trx-08',
    transactionNumber: 'TRX-123456789-008',
    orderNumber: 'ORD-08',
    dateTime: '14 Okt 2026, 09:20',
    diningType: 'Delivery',
    channel: 'GrabFood',
    tableOrCustomer: 'Budi Santoso',
    cashierName: 'Andi Pratama',
    paymentTime: '14 Okt 2026, 09:20',
    paymentMethod: 'GrabPay',
    paymentStatus: 'Lunas',
    paymentReference: 'GP-8839102',
    subtotal: 92000,
    tax: 0,
    serviceFee: 0,
    discount: 0,
    total: 92000,
    items: [
      { id: 'item-5', name: 'Americano', qty: 2, variant: 'Large', price: 44000 },
      { id: 'item-6', name: 'Cinnamon Roll', qty: 2, variant: 'Original', price: 48000 },
    ],
  },
  {
    id: 'trx-07',
    transactionNumber: 'TRX-123456789-007',
    orderNumber: 'ORD-07',
    dateTime: '14 Okt 2026, 09:10',
    diningType: 'Dine-in',
    channel: 'QR Order',
    tableOrCustomer: 'Meja 02',
    cashierName: 'Andi Pratama',
    paymentTime: '14 Okt 2026, 09:10',
    paymentMethod: 'QRIS',
    paymentStatus: 'Lunas',
    paymentReference: 'PAY-77192',
    subtotal: 58000,
    tax: 0,
    serviceFee: 0,
    discount: 0,
    total: 58000,
    items: [
      { id: 'item-7', name: 'Kopi Susu Gula Aren', qty: 2, variant: 'Normal Ice', price: 56000 },
    ],
  },
  {
    id: 'trx-06',
    transactionNumber: 'TRX-123456789-006',
    orderNumber: 'ORD-06',
    dateTime: '14 Okt 2026, 08:56',
    diningType: 'Delivery',
    channel: 'ShopeeFood',
    tableOrCustomer: 'Andi Wijaya',
    cashierName: 'Andi Pratama',
    paymentTime: '14 Okt 2026, 08:56',
    paymentMethod: 'ShopeePay',
    paymentStatus: 'Dibatalkan',
    paymentReference: 'SP-109283',
    subtotal: 58000,
    tax: 0,
    serviceFee: 0,
    discount: 0,
    total: 58000,
    items: [
      { id: 'item-8', name: 'Vanilla Latte', qty: 1, variant: 'Oat Milk', price: 34000 },
      { id: 'item-9', name: 'Donut Cokelat', qty: 1, variant: 'Glazed', price: 24000 },
    ],
  },
  {
    id: 'trx-05',
    transactionNumber: 'TRX-123456789-005',
    orderNumber: 'ORD-05',
    dateTime: '14 Okt 2026, 08:47',
    diningType: 'Dine-in',
    channel: 'QR Order',
    tableOrCustomer: 'Meja 06',
    cashierName: 'Andi Pratama',
    paymentTime: '14 Okt 2026, 08:47',
    paymentMethod: 'Tunai',
    paymentStatus: 'Sebagian',
    paymentReference: 'SPLIT-1029',
    subtotal: 58000,
    tax: 0,
    serviceFee: 0,
    discount: 0,
    total: 58000,
    items: [
      { id: 'item-10', name: 'Hazelnut Latte', qty: 1, variant: 'Warm', price: 32000 },
      { id: 'item-11', name: 'Muffin Blueberry', qty: 1, variant: 'Warm', price: 26000 },
    ],
  },
  {
    id: 'trx-04',
    transactionNumber: 'TRX-123456789-004',
    orderNumber: 'ORD-04',
    dateTime: '14 Okt 2026, 08:45',
    diningType: 'Delivery',
    channel: 'GoFood',
    tableOrCustomer: 'Amanda',
    cashierName: 'Andi Pratama',
    paymentTime: '14 Okt 2026, 08:45',
    paymentMethod: 'GoPay',
    paymentStatus: 'Lunas',
    paymentReference: 'GP-448102',
    subtotal: 76000,
    tax: 0,
    serviceFee: 0,
    discount: 0,
    total: 76000,
    items: [
      { id: 'item-12', name: 'Kopi Kenangan Mantap', qty: 2, variant: 'Normal', price: 48000 },
      { id: 'item-13', name: 'Cheese Cake Slice', qty: 1, variant: 'Original', price: 28000 },
    ],
  },
  {
    id: 'trx-03',
    transactionNumber: 'TRX-123456789-003',
    orderNumber: 'ORD-03',
    dateTime: '14 Okt 2026, 08:40',
    diningType: 'Dine-in',
    channel: 'Kasir',
    tableOrCustomer: 'Meja 08',
    cashierName: 'Andi Pratama',
    paymentTime: '14 Okt 2026, 08:40',
    paymentMethod: 'QRIS',
    paymentStatus: 'Lunas',
    paymentReference: 'PAY-33102',
    subtotal: 58000,
    tax: 0,
    serviceFee: 0,
    discount: 0,
    total: 58000,
    items: [
      { id: 'item-14', name: 'Espresso Double', qty: 1, variant: 'Hot', price: 22000 },
      { id: 'item-15', name: 'Avocado Coffee', qty: 1, variant: 'Ice', price: 36000 },
    ],
  },
  {
    id: 'trx-02',
    transactionNumber: 'TRX-123456789-002',
    orderNumber: 'ORD-02',
    dateTime: '14 Okt 2026, 08:35',
    diningType: 'Takeaway',
    channel: 'Kasir',
    tableOrCustomer: 'Pelanggan umum',
    cashierName: 'Andi Pratama',
    paymentTime: '14 Okt 2026, 08:35',
    paymentMethod: 'Tunai',
    paymentStatus: 'Lunas',
    paymentReference: 'CASH-0021',
    subtotal: 92000,
    tax: 0,
    serviceFee: 0,
    discount: 0,
    total: 92000,
    items: [
      { id: 'item-16', name: 'Cold Brew Signature', qty: 2, variant: 'Bottle 250ml', price: 50000 },
      { id: 'item-17', name: 'Bagel Smoked Beef', qty: 1, variant: 'Warm', price: 42000 },
      { id: 'item-17b', name: 'Croissant', qty: 1, variant: 'Warm', price: 22000 },
    ],
  },
  {
    id: 'trx-01',
    transactionNumber: 'TRX-123456789-001',
    orderNumber: 'ORD-01',
    dateTime: '14 Okt 2026, 08:30',
    diningType: 'Dine-in',
    channel: 'QR Order',
    tableOrCustomer: 'Meja 09',
    cashierName: 'Andi Pratama',
    paymentTime: '14 Okt 2026, 08:30',
    paymentMethod: 'QRIS',
    paymentStatus: 'Lunas',
    paymentReference: 'PAY-11928',
    subtotal: 76000,
    tax: 0,
    serviceFee: 0,
    discount: 0,
    total: 76000,
    items: [
      { id: 'item-18', name: 'Matcha Espresso Fusion', qty: 1, variant: 'Ice', price: 34000 },
      { id: 'item-19', name: 'Chocolate Lava', qty: 1, variant: 'Warm', price: 32000 },
      { id: 'item-20', name: 'Mineral Water', qty: 1, variant: 'Bottle', price: 10000 },
    ],
  },
];

export default function TransactionsPage() {
  const [demoMode, setDemoMode] = useState<'populated' | 'empty'>('populated');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<DetailedTransaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    if (demoMode === 'empty') return [];

    return INITIAL_TRANSACTIONS.filter((trx) => {
      if (selectedChannel !== 'all' && trx.channel !== selectedChannel) return false;
      if (selectedType !== 'all' && trx.diningType !== selectedType) return false;
      if (selectedPaymentStatus !== 'all' && trx.paymentStatus !== selectedPaymentStatus)
        return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = trx.transactionNumber.toLowerCase().includes(q);
        const matchOrder = trx.orderNumber.toLowerCase().includes(q);
        const matchCust = trx.tableOrCustomer.toLowerCase().includes(q);
        const matchMethod = trx.paymentMethod.toLowerCase().includes(q);
        if (!matchNumber && !matchOrder && !matchCust && !matchMethod) return false;
      }
      return true;
    });
  }, [demoMode, selectedChannel, selectedType, selectedPaymentStatus, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map((trx) => trx.id));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenTransaction = (trx: DetailedTransaction) => {
    setSelectedTransaction(trx);
    setIsDrawerOpen(true);
  };

  const handlePrevTransaction = () => {
    if (!selectedTransaction) return;
    const currentIndex = filteredTransactions.findIndex((t) => t.id === selectedTransaction.id);
    if (currentIndex > 0) {
      setSelectedTransaction(filteredTransactions[currentIndex - 1]);
    }
  };

  const handleNextTransaction = () => {
    if (!selectedTransaction) return;
    const currentIndex = filteredTransactions.findIndex((t) => t.id === selectedTransaction.id);
    if (currentIndex < filteredTransactions.length - 1) {
      setSelectedTransaction(filteredTransactions[currentIndex + 1]);
    }
  };

  // Column definitions for the reusable DataTable
  const columns: ColumnDef<DetailedTransaction>[] = [
    {
      key: 'transactionNumber',
      header: 'No. Transaksi',
      render: (trx) => (
        <span className="font-normal text-neutral-800 tracking-tight">
          {trx.transactionNumber}
        </span>
      ),
    },
    {
      key: 'waktu',
      header: 'Waktu',
      render: (trx) => (
        <span className="text-neutral-500 font-normal">
          {trx.dateTime.split(', ')[1]}
        </span>
      ),
    },
    {
      key: 'channel',
      header: 'Channel',
      render: (trx) => <ChannelBadge channel={trx.channel} />,
    },
    {
      key: 'diningType',
      header: 'Tipe',
      render: (trx) => (
        <span className="text-neutral-600 font-normal">
          {trx.diningType === 'Takeaway' ? 'Takeway' : trx.diningType}
        </span>
      ),
    },
    {
      key: 'tableOrCustomer',
      header: 'Pelanggan / Meja',
      render: (trx) => (
        <span className="text-neutral-800 font-normal">
          {trx.tableOrCustomer}
        </span>
      ),
    },
    {
      key: 'items',
      header: 'Item',
      render: (trx) => <span className="text-neutral-600">{trx.items.length} Item</span>,
    },
    {
      key: 'total',
      header: 'Total',
      render: (trx) => (
        <span className="font-medium text-neutral-900">
          {formatRupiah(trx.total)}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Metode',
      render: (trx) => (
        <span className="font-normal text-neutral-700">
          {trx.paymentMethod}
        </span>
      ),
    },
    {
      key: 'paymentStatus',
      header: 'Pembayaran',
      render: (trx) => <PaymentStatusBadge status={trx.paymentStatus} />,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (trx) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenTransaction(trx);
          }}
          className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <MoreVertical className="size-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-4 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <Check className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Transaksi</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Lihat semua transaksi yang berhasil maupun dibatalkan
          </p>
        </div>

        {/* Right Header: Export Button & Discrete State Switcher */}
        <div className="flex items-center gap-3">
          {/* Subtle switcher for testing empty state per screenshot 3 */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200 text-xs">
            <button
              onClick={() => setDemoMode('populated')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                demoMode === 'populated'
                  ? 'bg-white text-neutral-800 shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Data Terisi
            </button>
            <button
              onClick={() => setDemoMode('empty')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                demoMode === 'empty'
                  ? 'bg-white text-neutral-800 shadow-2xs font-semibold'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Belum Ada Transaksi
            </button>
          </div>

          <button
            onClick={() => showToast('Mengekspor data transaksi...')}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-[#E5484D] text-[#E5484D] bg-white hover:bg-red-50 text-xs font-semibold transition-colors shadow-2xs"
          >
            <span>Export</span>
            <Upload className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Filters Bar: Clean individual pill elements directly on background */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date Filter */}
        <div className="h-9 px-3.5 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 flex items-center gap-2 shadow-2xs cursor-pointer hover:bg-neutral-50">
          <span>Hari ini (14/10/2026)</span>
          <Calendar className="size-3.5 text-neutral-400" />
        </div>

        {/* Channel Filter */}
        <div className="relative">
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none focus:border-neutral-400 hover:bg-neutral-50"
          >
            <option value="all">Semua channel</option>
            <option value="QR Order">QR Order</option>
            <option value="Kasir">Kasir</option>
            <option value="GrabFood">GrabFood</option>
            <option value="ShopeeFood">ShopeeFood</option>
            <option value="GoFood">GoFood</option>
          </select>
          <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none focus:border-neutral-400 hover:bg-neutral-50"
          >
            <option value="all">Semua tipe</option>
            <option value="Dine-in">Dine-in</option>
            <option value="Takeaway">Takeaway</option>
            <option value="Delivery">Delivery</option>
          </select>
          <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>

        {/* Payment Status Filter */}
        <div className="relative">
          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none focus:border-neutral-400 hover:bg-neutral-50"
          >
            <option value="all">Semua pembayaran</option>
            <option value="Lunas">Lunas</option>
            <option value="Sebagian">Sebagian</option>
            <option value="Dibatalkan">Dibatalkan</option>
          </select>
          <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[260px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nomor transaksi, Nomor p..."
            className="w-full h-9 pl-3.5 pr-9 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 shadow-2xs focus:outline-none focus:border-neutral-400"
          />
          <div className="absolute right-2.5 top-2 size-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
            <Search className="size-3" />
          </div>
        </div>
      </div>

      {/* Global Reusable DataTable matching Screenshot 2 & 3 */}
      <DataTable
        columns={columns}
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={toggleSelectRow}
        onToggleSelectAll={toggleSelectAll}
        onRowClick={handleOpenTransaction}
        emptyTitle="BELUM ADA TRANSAKSI"
        emptyDescription="Transaksi penjualan akan muncul di sini setelah pembayaran dilakukan."
        entityName="pesanan"
      />

      {/* Slide-over Transaction Details Drawer */}
      <TransactionDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        transaction={selectedTransaction}
        onPrintReceipt={(id) => showToast(`Mencetak struk transaksi ${id}...`)}
        onSendReceipt={(id) => showToast(`Mengirim struk transaksi ${id}...`)}
        onPrev={handlePrevTransaction}
        onNext={handleNextTransaction}
      />
    </div>
  );
}
