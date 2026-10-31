'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Calendar,
  Sparkles,
  Play,
  ShoppingBag,
  Check,
  X,
  MoreVertical,
  RefreshCw,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  StatusBadge,
  DataTable,
  ColumnDef,
  ChannelBadge,
  Select,
  SearchInput,
  Button,
} from '@/components/common';
import { OrderDetailsDrawer, DetailedOrder } from '@/components/orders/OrderDetailsDrawer';
import { formatRupiah, formatDateTime, formatTimeOnly } from '@/utils';
import { posService } from '@/services/pos.service';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';
import { Order, OrderStatus } from '@/types';

type FilterStatus = 'Semua' | 'Baru' | 'Diproses' | 'Siap diambil' | 'Selesai' | 'Dibatalkan';

export default function OrdersPage() {
  const { activeStore } = useStore();
  const { toast } = useToast();

  // Filter states
  const [selectedStatusTab, setSelectedStatusTab] = useState<FilterStatus>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('Semua channel');
  const [selectedType, setSelectedType] = useState<string>('Semua tipe');
  const [selectedPayment, setSelectedPayment] = useState<string>('Semua pembayaran');

  // Real orders state
  const [orders, setOrders] = useState<DetailedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Slide-over Drawer state
  const [selectedOrder, setSelectedOrder] = useState<DetailedOrder | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Selected checkbox rows
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);

  // Helper to map DB Order to DetailedOrder
  const mapDbOrderToDetailedOrder = useCallback((ord: any): DetailedOrder => {
    // Status mapping
    let mappedStatus: DetailedOrder['status'] = 'Baru';
    switch (ord.status) {
      case 'PENDING':
        mappedStatus = 'Baru';
        break;
      case 'PREPARING':
        mappedStatus = 'Diproses';
        break;
      case 'READY':
        mappedStatus = 'Siap diambil';
        break;
      case 'COMPLETED':
        mappedStatus = 'Selesai';
        break;
      case 'CANCELLED':
        mappedStatus = 'Dibatalkan';
        break;
      default:
        mappedStatus = 'Baru';
    }

    // Payment status mapping
    const hasSuccessfulPayment = Array.isArray(ord.payments) && ord.payments.some((p: any) => p.status === 'SUCCESS');
    let mappedPaymentStatus: DetailedOrder['paymentStatus'] = 'Menunggu';
    if (hasSuccessfulPayment) {
      mappedPaymentStatus = 'Lunas';
    } else if (ord.status === 'CANCELLED') {
      mappedPaymentStatus = 'Dibatalkan';
    }

    // Dining type mapping
    let diningType: DetailedOrder['diningType'] = 'Dine-in';
    if (ord.channel === 'TAKEAWAY') {
      diningType = 'Takeaway';
    } else if (ord.channel === 'DELIVERY') {
      diningType = 'Delivery';
    }

    // Channel mapping
    let channel: DetailedOrder['channel'] = 'Kasir';
    if (ord.source === 'QR' || ord.channel === 'QR_ORDER') {
      channel = 'QR Order';
    } else if (ord.channel === 'GrabFood') {
      channel = 'GrabFood';
    } else if (ord.channel === 'ShopeeFood') {
      channel = 'ShopeeFood';
    } else if (ord.channel === 'GoFood') {
      channel = 'GoFood';
    }

    // Table or Customer string
    let tableOrCustomer = 'Pelanggan Umum';
    if (ord.table?.name) {
      const raw = ord.table.name.trim();
      tableOrCustomer = raw.toLowerCase().startsWith('meja') ? raw : `Meja ${raw}`;
    } else if (ord.customer_name) {
      tableOrCustomer = ord.customer_name;
    }

    // Items mapping
    const rawItems = ord.order_items || ord.orderItems || [];
    const items = rawItems.map((it: any) => ({
      id: it.id,
      name: it.product_name || it.product?.name || 'Item Pesanan',
      qty: Number(it.quantity || 1),
      price: Number(it.subtotal || (Number(it.quantity || 1) * Number(it.unit_price || 0))),
      notes: it.notes || undefined,
      variant: it.variant || undefined,
    }));

    // Payment method string
    const firstPayment = ord.payments?.[0];
    let paymentMethod = '-';
    if (firstPayment?.method === 'QRIS') {
      paymentMethod = 'QRIS';
    } else if (firstPayment?.method === 'CASH') {
      paymentMethod = 'Tunai (Kasir)';
    } else if (firstPayment?.method === 'EDC') {
      paymentMethod = 'EDC / Kartu';
    } else if (firstPayment?.method) {
      paymentMethod = firstPayment.method;
    }

    return {
      id: ord.id,
      orderNumber: ord.order_number,
      dateTime: formatDateTime(ord.created_at, 'id-ID'),
      status: mappedStatus,
      paymentStatus: mappedPaymentStatus,
      diningType,
      channel,
      tableOrCustomer,
      items,
      subtotal: Number(ord.subtotal || 0),
      tax: Number(ord.tax_amount || 0),
      fee: Number(ord.service_charge || 0),
      discount: Number(ord.discount_amount || 0),
      total: Number(ord.total_amount || 0),
      notes: ord.notes || '-',
      paymentMethod,
    };
  }, []);

  // Fetch real orders from database
  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res: any = await posService.getOrders({ per_page: 50 });
      const rawList = res.data?.data || res.data || [];
      const mapped = rawList.map(mapDbOrderToDetailedOrder);
      setOrders(mapped);
    } catch (err: any) {
      console.error('Failed to fetch orders:', err);
      toast.error('Gagal memuat pesanan dari database.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [mapDbOrderToDetailedOrder]);

  // Load orders on mount and store change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders, activeStore]);

  // Status counts for tabs
  const statusCounts = useMemo(() => {
    const counts = {
      Semua: orders.length,
      Baru: 0,
      Diproses: 0,
      'Siap diambil': 0,
      Selesai: 0,
      Dibatalkan: 0,
    };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
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
    orders,
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

  // Status transition handlers from OrderDetailsDrawer
  const handleAcceptOrder = async (orderId: string) => {
    try {
      // If status is 'Baru', move to 'PREPARING'
      // If status is 'Diproses', move to 'READY'
      // If status is 'Siap diambil', move to 'COMPLETED'
      let nextStatus = 'PREPARING';
      if (selectedOrder?.status === 'Diproses') {
        nextStatus = 'READY';
      } else if (selectedOrder?.status === 'Siap diambil') {
        nextStatus = 'COMPLETED';
      }

      await posService.updateOrderStatus(orderId, nextStatus);
      toast.success(`Status pesanan ${selectedOrder?.orderNumber} berhasil diperbarui.`);
      setDrawerOpen(false);
      await fetchOrders(true);
    } catch (err: any) {
      toast.error('Gagal memperbarui status pesanan.');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await posService.cancelOrder(orderId, 'Dibatalkan oleh kasir/manajemen');
      toast.info(`Pesanan ${selectedOrder?.orderNumber} telah dibatalkan.`);
      setDrawerOpen(false);
      await fetchOrders(true);
    } catch (err: any) {
      toast.error('Gagal membatalkan pesanan.');
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
          {ord.dateTime.split(', ')[1] || ord.dateTime}
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
      {/* 1. PAGE HEADER                                           */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#111827] tracking-tight">
            Pesanan
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Pantau dan kelola semua pesanan langsung dari database {activeStore?.name ? `(${activeStore.name})` : ''}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin text-orange-600' : ''}`} />}
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
          >
            Muat Ulang
          </Button>

          {/* Auto Update indicator badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-400/80 bg-emerald-50 text-emerald-700 text-xs font-semibold shadow-2xs">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Database Terhubung</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. FILTER TABS                                           */}
      {/* ======================================================== */}
      <div className="flex items-center border-b border-neutral-200 gap-1 overflow-x-auto text-xs no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedStatusTab('Semua')}
          className={`px-4 py-2.5 font-bold transition-all relative flex items-center gap-1.5 ${
            selectedStatusTab === 'Semua'
              ? 'text-[#FF5C38]'
              : 'text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <span>Semua</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-100 font-semibold text-neutral-600">
            {statusCounts.Semua}
          </span>
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
          {statusCounts.Baru > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 font-bold">
              {statusCounts.Baru}
            </span>
          )}
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
          {statusCounts.Diproses > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold">
              {statusCounts.Diproses}
            </span>
          )}
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
          {statusCounts['Siap diambil'] > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 font-bold">
              {statusCounts['Siap diambil']}
            </span>
          )}
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
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-100 text-neutral-600 font-semibold">
            {statusCounts.Selesai}
          </span>
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
          {statusCounts.Dibatalkan > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-200 text-neutral-700 font-medium">
              {statusCounts.Dibatalkan}
            </span>
          )}
          {selectedStatusTab === 'Dibatalkan' && (
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF5C38]" />
          )}
        </button>
      </div>

      {/* ======================================================== */}
      {/* 3. FILTER CONTROLS BAR                                   */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Channel Dropdown */}
          <Select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            size="sm"
            options={[
              { value: 'Semua channel', label: 'Semua channel' },
              { value: 'QR Order', label: 'QR Order' },
              { value: 'Kasir', label: 'Kasir' },
              { value: 'GrabFood', label: 'GrabFood' },
              { value: 'ShopeeFood', label: 'ShopeeFood' },
              { value: 'GoFood', label: 'GoFood' },
            ]}
          />

          {/* Type Dropdown */}
          <Select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            size="sm"
            options={[
              { value: 'Semua tipe', label: 'Semua tipe' },
              { value: 'Dine-in', label: 'Dine-in' },
              { value: 'Takeaway', label: 'Takeaway' },
              { value: 'Delivery', label: 'Delivery' },
            ]}
          />

          {/* Payment Dropdown */}
          <Select
            value={selectedPayment}
            onChange={(e) => setSelectedPayment(e.target.value)}
            size="sm"
            options={[
              { value: 'Semua pembayaran', label: 'Semua pembayaran' },
              { value: 'Lunas', label: 'Lunas' },
              { value: 'Menunggu', label: 'Menunggu' },
              { value: 'Dibatalkan', label: 'Dibatalkan' },
            ]}
          />
        </div>

        {/* Search Input */}
        <div className="min-w-[260px] lg:w-72">
          <SearchInput
            placeholder="Cari nomor pesanan, nama meja/pelanggan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            size="sm"
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. ORDERS DATA TABLE (Reused Global DataTable with Skeleton) */}
      {/* ======================================================== */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        isLoading={loading}
        keyExtractor={(item) => item.id}
        selectable
        selectedIds={selectedRowIds}
        onToggleSelect={(id) => handleSelectRow(id)}
        onToggleSelectAll={() => handleSelectAll(selectedRowIds.length !== filteredOrders.length)}
        onRowClick={handleRowClick}
        emptyTitle="BELUM ADA PESANAN"
        emptyDescription="Pesanan yang masuk dari kasir atau QR meja akan muncul otomatis di sini."
        entityName="pesanan"
      />

      {/* ======================================================== */}
      {/* 5. SLIDE-OVER ORDER DETAILS DRAWER                       */}
      {/* ======================================================== */}
      <OrderDetailsDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        order={selectedOrder}
        onAccept={handleAcceptOrder}
        onReject={handleRejectOrder}
        onPrev={handlePrevOrder}
        onNext={handleNextOrder}
      />
    </div>
  );
}
