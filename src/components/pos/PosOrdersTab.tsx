'use client';

import React, { useState, useMemo } from 'react';
import {
  ClipboardList,
  Clock,
  QrCode,
  Printer,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  Filter,
  Check,
  ChefHat,
  Coffee,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { formatRupiah } from '@/utils';
import { Button } from '@/components/common/Button';
import { SearchInput } from '@/components/common/SearchInput';
import { Select } from '@/components/common/Select';
import { EmptyState } from '@/components/common/EmptyState';

export interface PosOrder {
  id: string;
  orderNumber: string;
  table: string;
  customerName: string;
  customerPhone?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }>;
  totalAmount: number;
  source: 'POS' | 'QR';
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  paymentStatus: 'PAID' | 'UNPAID';
  createdAt: string;
  elapsedMinutes: number;
}

export const INITIAL_ORDERS_LIST: PosOrder[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-2026-0042',
    table: 'Meja 3',
    customerName: 'Marshanda',
    customerPhone: '081245678909',
    items: [
      { name: 'Kopi Susu Gula Aren', quantity: 1, price: 28000, notes: 'Less sugar 50%' },
      { name: 'Matcha Latte', quantity: 2, price: 30000, notes: 'Es sedikit' },
    ],
    totalAmount: 98710,
    source: 'POS',
    status: 'PREPARING',
    paymentStatus: 'PAID',
    createdAt: '15:10',
    elapsedMinutes: 8,
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-2026-0041',
    table: 'Meja 1',
    customerName: 'Budi Santoso',
    customerPhone: '081234567890',
    items: [
      { name: 'Americano', quantity: 1, price: 22000 },
      { name: 'Croissant', quantity: 1, price: 25000, notes: 'Dihangatkan' },
    ],
    totalAmount: 47000,
    source: 'QR',
    status: 'READY',
    paymentStatus: 'PAID',
    createdAt: '15:02',
    elapsedMinutes: 16,
  },
  {
    id: 'ord-3',
    orderNumber: 'ORD-2026-0040',
    table: 'Meja 5',
    customerName: 'Dewi Lestari',
    customerPhone: '081298765432',
    items: [
      { name: 'Cappucino', quantity: 2, price: 28000 },
      { name: 'Chocolate Croissant', quantity: 2, price: 28000 },
    ],
    totalAmount: 112000,
    source: 'QR',
    status: 'PENDING',
    paymentStatus: 'UNPAID',
    createdAt: '14:55',
    elapsedMinutes: 23,
  },
  {
    id: 'ord-4',
    orderNumber: 'ORD-2026-0039',
    table: 'Takeaway',
    customerName: 'Rizky Maulan',
    items: [
      { name: 'Chicken Sandwich', quantity: 1, price: 45000, notes: 'Saus dipisah' },
    ],
    totalAmount: 45000,
    source: 'POS',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    createdAt: '14:40',
    elapsedMinutes: 38,
  },
  {
    id: 'ord-5',
    orderNumber: 'ORD-2026-0038',
    table: 'Meja 2',
    customerName: 'Siti Rahma',
    items: [
      { name: 'Pasta Carbonara', quantity: 1, price: 48000 },
      { name: 'Iced Lychee Tea', quantity: 1, price: 24000 },
    ],
    totalAmount: 72000,
    source: 'POS',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    createdAt: '14:20',
    elapsedMinutes: 58,
  },
];

interface PosOrdersTabProps {
  onBackToRegister: () => void;
  onPrintBill?: (order: PosOrder) => void;
}

export function PosOrdersTab({ onBackToRegister, onPrintBill }: PosOrdersTabProps) {
  const [orders, setOrders] = useState<PosOrder[]>(INITIAL_ORDERS_LIST);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'POS' | 'QR'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Counters
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const preparingCount = orders.filter((o) => o.status === 'PREPARING').length;
  const readyCount = orders.filter((o) => o.status === 'READY').length;
  const qrOrdersCount = orders.filter((o) => o.source === 'QR').length;

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Status
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;

      // Source
      if (sourceFilter !== 'ALL' && o.source !== sourceFilter) return false;

      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = o.orderNumber.toLowerCase().includes(q);
        const matchCust = o.customerName.toLowerCase().includes(q);
        const matchTable = o.table.toLowerCase().includes(q);
        const matchItems = o.items.some((i) => i.name.toLowerCase().includes(q));
        if (!matchNum && !matchCust && !matchTable && !matchItems) return false;
      }

      return true;
    });
  }, [orders, statusFilter, sourceFilter, searchQuery]);

  const handleUpdateStatus = (
    orderId: string,
    newStatus: PosOrder['status']
  ) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: newStatus,
              paymentStatus: newStatus === 'COMPLETED' ? 'PAID' : o.paymentStatus,
            }
          : o
      )
    );
  };

  const renderStatusBadge = (status: PosOrder['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Clock className="size-3 text-amber-600" /> Menunggu Konfirmasi
          </span>
        );
      case 'PREPARING':
        return (
          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <ChefHat className="size-3 text-blue-600" /> Sedang Dimasak
          </span>
        );
      case 'READY':
        return (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="size-3 text-emerald-600" /> Siap Disajikan
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="text-[11px] font-medium text-neutral-600 bg-neutral-100 border border-neutral-300 px-2.5 py-0.5 rounded-full">
            Selesai
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="text-[11px] font-medium text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
            Dibatalkan
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* KPI Stats Overview Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-neutral-200/80 bg-white shadow-2xs">
          <p className="text-[11px] text-neutral-500 font-medium">Antrean Menunggu</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
            <Clock className="size-5 text-amber-400" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200/80 bg-white shadow-2xs">
          <p className="text-[11px] text-neutral-500 font-medium">Sedang Dimasak (KDS)</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xl font-bold text-blue-600">{preparingCount}</p>
            <ChefHat className="size-5 text-blue-400" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200/80 bg-white shadow-2xs">
          <p className="text-[11px] text-neutral-500 font-medium">Siap Saji / Diantar</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xl font-bold text-emerald-600">{readyCount}</p>
            <CheckCircle2 className="size-5 text-emerald-400" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-neutral-200/80 bg-white shadow-2xs">
          <p className="text-[11px] text-neutral-500 font-medium">Pesanan Masuk QR</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xl font-bold text-purple-600">{qrOrdersCount}</p>
            <QrCode className="size-5 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-neutral-200/80 shadow-2xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {[
            { id: 'ALL', label: 'Semua Pesanan' },
            { id: 'PENDING', label: `Menunggu (${pendingCount})` },
            { id: 'PREPARING', label: `Diproses (${preparingCount})` },
            { id: 'READY', label: `Siap Saji (${readyCount})` },
            { id: 'COMPLETED', label: 'Selesai' },
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st.id
                  ? 'bg-[#FF5C38] text-white shadow-2xs'
                  : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Source & Search Filters */}
        <div className="flex items-center gap-2.5">
          <div className="w-36 shrink-0">
            <Select
              size="sm"
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value as any)}
              className="text-xs font-semibold"
            >
              <option value="ALL">Semua Sumber</option>
              <option value="POS">Kasir (POS)</option>
              <option value="QR">QR Meja</option>
            </Select>
          </div>

          <div className="w-full sm:w-60">
            <SearchInput
              size="sm"
              placeholder="Cari order, meja, tamu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>
        </div>
      </div>

      {/* Orders Cards Grid */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-12 text-center">
          <EmptyState
            title="TIDAK ADA PESANAN"
            description="Tidak ada pesanan aktif pada filter ini. Pesanan baru dari kasir atau QR akan tampil di sini."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-4 rounded-2xl border border-neutral-200/80 bg-white hover:border-neutral-300 transition-all shadow-2xs flex flex-col justify-between space-y-3"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-neutral-900">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        order.source === 'QR'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {order.source}
                    </span>
                  </div>

                  {renderStatusBadge(order.status)}
                </div>

                <div className="flex items-center justify-between text-xs text-neutral-600 pb-2 border-b border-neutral-100">
                  <span className="font-bold text-neutral-900">
                    {order.customerName} • {order.table}
                  </span>
                  <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                    <Clock className="size-3" /> {order.createdAt} ({order.elapsedMinutes}m lalu)
                  </span>
                </div>

                {/* Items List */}
                <div className="py-2 space-y-1.5">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between text-xs text-neutral-800"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="font-semibold text-neutral-900">
                          {item.quantity}x
                        </span>{' '}
                        <span>{item.name}</span>
                        {item.notes && (
                          <p className="text-[11px] text-amber-700 italic pl-5">
                            * {item.notes}
                          </p>
                        )}
                      </div>
                      <span className="font-semibold text-neutral-700 shrink-0">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-neutral-400">Total Tagihan</p>
                  <p className="text-sm font-bold text-neutral-900">
                    {formatRupiah(order.totalAmount)}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1.5">
                  {order.status === 'PENDING' && (
                    <Button
                      variant="primary"
                      size="xs"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                    >
                      Terima & Masak
                    </Button>
                  )}

                  {order.status === 'PREPARING' && (
                    <Button
                      variant="primary"
                      size="xs"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleUpdateStatus(order.id, 'READY')}
                    >
                      Tandai Siap
                    </Button>
                  )}

                  {order.status === 'READY' && (
                    <Button
                      variant="primary"
                      size="xs"
                      className="bg-[#FF5C38] hover:bg-[#E04B28] text-white"
                      onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                    >
                      Selesaikan
                    </Button>
                  )}

                  {onPrintBill && (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onPrintBill(order)}
                      title="Cetak Struk"
                    >
                      <Printer className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
