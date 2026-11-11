'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Calendar,
  Search,
  ChevronDown,
  Upload,
  MoreVertical,
  Check,
  Clock,
  X,
  RefreshCw,
  Loader2,
  Download,
} from 'lucide-react';
import {
  DataTable,
  ColumnDef,
  ChannelBadge,
  Button,
  Select,
  SearchInput,
  PageLoader,
} from '@/components/common';
import {
  TransactionDetailsDrawer,
  DetailedTransaction,
} from '@/components/transactions/TransactionDetailsDrawer';
import { BillPrintModal } from '@/components/pos/BillPrintModal';
import { SendReceiptModal } from '@/components/transactions/SendReceiptModal';
import { formatRupiah, formatDateTime, formatTimeOnly } from '@/utils';
import { posService } from '@/services/pos.service';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';

// Payment Status Pill Component matching UI design
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

export default function TransactionsPage() {
  const { activeStore } = useStore();
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<DetailedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<DetailedTransaction | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSendReceiptOpen, setIsSendReceiptOpen] = useState(false);

  // Helper to map DB Payment & Order to DetailedTransaction
  const mapDbPaymentToTransaction = useCallback((p: any): DetailedTransaction => {
    const ord = p.order || {};

    let diningType: DetailedTransaction['diningType'] = 'Dine-in';
    if (ord.channel === 'TAKEAWAY') {
      diningType = 'Takeaway';
    } else if (ord.channel === 'DELIVERY') {
      diningType = 'Delivery';
    }

    let channel: DetailedTransaction['channel'] = 'Kasir';
    if (ord.source === 'QR' || ord.channel === 'QR_ORDER') {
      channel = 'QR Order';
    } else if (ord.channel === 'GrabFood') {
      channel = 'GrabFood';
    } else if (ord.channel === 'ShopeeFood') {
      channel = 'ShopeeFood';
    } else if (ord.channel === 'GoFood') {
      channel = 'GoFood';
    }

    let tableOrCustomer = 'Pelanggan Umum';
    if (ord.table?.name) {
      const raw = ord.table.name.trim();
      tableOrCustomer = raw.toLowerCase().startsWith('meja') ? raw : `Meja ${raw}`;
    } else if (ord.customer_name) {
      tableOrCustomer = ord.customer_name;
    }

    const rawItems = ord.order_items || ord.orderItems || [];
    const items = rawItems.map((it: any) => ({
      id: it.id,
      name: it.product_name || it.product?.name || 'Item Menu',
      qty: Number(it.quantity || 1),
      price: Number(it.subtotal || (Number(it.quantity || 1) * Number(it.unit_price || 0))),
      variant: it.variant || undefined,
    }));

    let mappedPaymentStatus: DetailedTransaction['paymentStatus'] = 'Lunas';
    if (p.status === 'SUCCESS') {
      mappedPaymentStatus = 'Lunas';
    } else if (p.status === 'PENDING') {
      mappedPaymentStatus = 'Sebagian';
    } else {
      mappedPaymentStatus = 'Dibatalkan';
    }

    let mappedMethod = p.method;
    if (p.method === 'QRIS') mappedMethod = 'QRIS';
    else if (p.method === 'CASH') mappedMethod = 'Tunai';
    else if (p.method === 'EDC') mappedMethod = 'EDC / Kartu';

    return {
      id: p.id,
      transactionNumber: p.payment_number,
      orderNumber: ord.order_number || '-',
      dateTime: formatDateTime(p.paid_at || p.created_at, 'id-ID'),
      diningType,
      channel,
      tableOrCustomer,
      cashierName: ord.createdBy?.name || 'Kasir',
      paymentTime: formatTimeOnly(p.paid_at || p.created_at, 'id-ID'),
      items,
      subtotal: Number(ord.subtotal || p.amount),
      tax: Number(ord.tax_amount || 0),
      serviceFee: Number(ord.service_charge || 0),
      discount: Number(ord.discount_amount || 0),
      total: Number(p.amount || 0),
      paymentMethod: mappedMethod,
      paymentStatus: mappedPaymentStatus,
      paymentReference: p.provider_reference || p.payment_number,
    };
  }, []);

  // Fetch transactions from database
  const fetchTransactions = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res: any = await posService.getTransactions({ per_page: 50 });
      const rawList = res.data?.data || res.data || [];
      const mapped = rawList.map(mapDbPaymentToTransaction);
      setTransactions(mapped);
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      toast.error('Gagal memuat transaksi. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mapDbPaymentToTransaction]);

  // Load transactions on mount and store change
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions, activeStore]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((trx) => {
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
  }, [transactions, selectedChannel, selectedType, selectedPaymentStatus, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTransactions.length && filteredTransactions.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTransactions.map((trx) => trx.id));
    }
  };

  const toggleSelectRow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  // Export CSV function
  const handleExportCsv = () => {
    if (filteredTransactions.length === 0) {
      toast.warning('Tidak ada data transaksi untuk diekspor.');
      return;
    }

    const headers = [
      'No. Transaksi',
      'No. Pesanan',
      'Waktu',
      'Channel',
      'Tipe',
      'Pelanggan / Meja',
      'Jumlah Item',
      'Subtotal',
      'Pajak',
      'Biaya Layanan',
      'Diskon',
      'Total',
      'Metode Bayar',
      'Status',
    ];

    const rows = filteredTransactions.map((t) => [
      `"${t.transactionNumber}"`,
      `"${t.orderNumber}"`,
      `"${t.dateTime}"`,
      `"${t.channel}"`,
      `"${t.diningType}"`,
      `"${t.tableOrCustomer}"`,
      t.items.length,
      t.subtotal,
      t.tax,
      t.serviceFee,
      t.discount,
      t.total,
      `"${t.paymentMethod}"`,
      `"${t.paymentStatus}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transaksi_${activeStore?.code || 'outlet'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Data transaksi berhasil diekspor ke CSV.');
  };

  // Column definitions for the reusable DataTable
  const columns: ColumnDef<DetailedTransaction>[] = [
    {
      key: 'transactionNumber',
      header: 'No. Transaksi',
      render: (trx) => (
        <span className="font-semibold text-neutral-900 tracking-tight whitespace-nowrap">
          {trx.transactionNumber}
        </span>
      ),
    },
    {
      key: 'waktu',
      header: 'Waktu',
      render: (trx) => (
        <span className="text-neutral-500 font-normal whitespace-nowrap">
          {trx.dateTime.split(', ')[1] || trx.dateTime}
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
        <span className="text-neutral-600 font-normal whitespace-nowrap">
          {trx.diningType}
        </span>
      ),
    },
    {
      key: 'tableOrCustomer',
      header: 'Pelanggan / Meja',
      render: (trx) => (
        <span className="text-neutral-800 font-semibold whitespace-nowrap">
          {trx.tableOrCustomer}
        </span>
      ),
    },
    {
      key: 'items',
      header: 'Item',
      render: (trx) => (
        <span className="text-neutral-600 whitespace-nowrap">
          {trx.items.reduce((sum, it) => sum + it.qty, 0)} Item
        </span>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (trx) => (
        <span className="font-bold text-neutral-900 whitespace-nowrap">
          {formatRupiah(trx.total)}
        </span>
      ),
    },
    {
      key: 'paymentMethod',
      header: 'Metode',
      render: (trx) => (
        <span className="font-medium text-neutral-700 whitespace-nowrap">
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
          aria-label="Aksi"
        >
          <MoreVertical className="size-4" />
        </button>
      ),
    },
  ];

  if (loading) {
    return <PageLoader text="Memuat riwayat transaksi..." />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-[1600px] mx-auto animate-in fade-in duration-200">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Transaksi</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Riwayat transaksi finansial dan pembayaran pelanggan {activeStore?.name ? `(${activeStore.name})` : ''}
          </p>
        </div>

        {/* Right Header: Refresh & Export Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin text-orange-600' : ''}`} />}
            onClick={() => fetchTransactions(true)}
            disabled={refreshing}
          >
            Muat Ulang
          </Button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-[#E5484D] text-[#E5484D] bg-white hover:bg-red-50 text-xs font-semibold transition-colors shadow-2xs cursor-pointer active:scale-95"
          >
            <span>Export CSV</span>
            <Download className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Channel Select */}
          <Select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            size="sm"
            options={[
              { value: 'all', label: 'Semua Channel' },
              { value: 'QR Order', label: 'QR Order' },
              { value: 'Kasir', label: 'Kasir' },
              { value: 'GrabFood', label: 'GrabFood' },
              { value: 'ShopeeFood', label: 'ShopeeFood' },
              { value: 'GoFood', label: 'GoFood' },
            ]}
          />

          {/* Type Select */}
          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            size="sm"
            options={[
              { value: 'all', label: 'Semua Tipe' },
              { value: 'Dine-in', label: 'Dine-in' },
              { value: 'Takeaway', label: 'Takeaway' },
              { value: 'Delivery', label: 'Delivery' },
            ]}
          />

          {/* Payment Status Select */}
          <Select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            size="sm"
            options={[
              { value: 'all', label: 'Semua Status' },
              { value: 'Lunas', label: 'Lunas' },
              { value: 'Sebagian', label: 'Sebagian' },
              { value: 'Dibatalkan', label: 'Dibatalkan' },
            ]}
          />
        </div>

        {/* Search Input */}
        <div className="min-w-[260px] lg:w-72">
          <SearchInput
            placeholder="Cari transaksi, order, meja..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            size="sm"
          />
        </div>
      </div>

      {/* Transactions Data Table with Loading Skeleton */}
      <DataTable
        columns={columns}
        data={filteredTransactions}
        isLoading={loading}
        keyExtractor={(item) => item.id}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={(id) => toggleSelectRow(id)}
        onToggleSelectAll={toggleSelectAll}
        onRowClick={handleOpenTransaction}
        emptyTitle="BELUM ADA TRANSAKSI"
        emptyDescription="Transaksi pembayaran yang diproses akan tersimpan otomatis dan tampil di sini."
        entityName="transaksi"
      />

      {/* Slide-over Transaction Details Drawer */}
      <TransactionDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        transaction={selectedTransaction}
        onPrintReceipt={(id) => {
          setIsPrintModalOpen(true);
        }}
        onSendReceipt={(id) => {
          setIsSendReceiptOpen(true);
        }}
        onPrev={handlePrevTransaction}
        onNext={handleNextTransaction}
      />

      {/* Modal Cetak Struk Thermal */}
      {selectedTransaction && (
        <BillPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          orderNumber={selectedTransaction.orderNumber || selectedTransaction.transactionNumber}
          items={selectedTransaction.items.map((it) => ({
            id: String(it.id),
            name: it.name,
            quantity: it.qty,
            price: it.qty > 0 ? it.price / it.qty : it.price,
            notes: it.variant,
          }))}
          customerName={selectedTransaction.tableOrCustomer}
          selectedTable={
            selectedTransaction.diningType === 'Dine-in'
              ? selectedTransaction.tableOrCustomer
              : selectedTransaction.diningType
          }
          subtotalAmount={selectedTransaction.subtotal}
          discountAmount={selectedTransaction.discount}
          taxAmount={selectedTransaction.tax}
          serviceFeeAmount={selectedTransaction.serviceFee}
          cashierName={selectedTransaction.cashierName}
          storeName={activeStore?.name || 'NemuPOS Outlet'}
          storeAddress={activeStore?.address || undefined}
          storePhone={activeStore?.phone || undefined}
          paymentMethod={selectedTransaction.paymentMethod}
          paymentStatus={selectedTransaction.paymentStatus}
        />
      )}

      {/* Modal Kirim Struk Digital ke WhatsApp */}
      {selectedTransaction && (
        <SendReceiptModal
          isOpen={isSendReceiptOpen}
          onClose={() => setIsSendReceiptOpen(false)}
          data={{
            orderNumber: selectedTransaction.orderNumber || selectedTransaction.transactionNumber,
            storeName: activeStore?.name || 'NemuHUB POS',
            storeAddress: activeStore?.address || undefined,
            customerName: selectedTransaction.tableOrCustomer,
            dateTime: selectedTransaction.dateTime,
            diningType:
              selectedTransaction.diningType === 'Dine-in'
                ? selectedTransaction.tableOrCustomer
                : selectedTransaction.diningType,
            paymentMethod: selectedTransaction.paymentMethod,
            paymentStatus: selectedTransaction.paymentStatus,
            items: selectedTransaction.items.map((it) => ({
              name: it.name,
              quantity: it.qty,
              price: it.qty > 0 ? it.price / it.qty : it.price,
              notes: it.variant,
            })),
            subtotal: selectedTransaction.subtotal,
            tax: selectedTransaction.tax,
            serviceFee: selectedTransaction.serviceFee,
            discount: selectedTransaction.discount,
            total: selectedTransaction.total,
          }}
        />
      )}
    </div>
  );
}
