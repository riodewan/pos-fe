'use client';

import React, { useState } from 'react';
import {
  X,
  ClipboardList,
  CheckCircle2,
  Clock,
  QrCode,
  Printer,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { Drawer } from '@/components/common/Drawer';
import { Button } from '@/components/common/Button';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatRupiah } from '@/utils';

export interface PosOrderQueueItem {
  id: string;
  orderNumber: string;
  table: string;
  customerName: string;
  itemsCount: number;
  itemsSummary: string;
  totalAmount: number;
  source: 'POS' | 'QR';
  status: 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED';
  createdAt: string;
}

const INITIAL_QUEUE_ORDERS: PosOrderQueueItem[] = [
  {
    id: 'ord-101',
    orderNumber: 'ORD-2026-0042',
    table: 'Meja 3',
    customerName: 'Marshanda',
    itemsCount: 3,
    itemsSummary: '1x Kopi Susu Gula Aren, 2x Matcha Latte',
    totalAmount: 98710,
    source: 'POS',
    status: 'PREPARING',
    createdAt: '15:10',
  },
  {
    id: 'ord-102',
    orderNumber: 'ORD-2026-0041',
    table: 'Meja 1',
    customerName: 'Budi Santoso',
    itemsCount: 2,
    itemsSummary: '1x Americano, 1x Croissant',
    totalAmount: 47000,
    source: 'QR',
    status: 'READY',
    createdAt: '15:02',
  },
  {
    id: 'ord-103',
    orderNumber: 'ORD-2026-0040',
    table: 'Meja 5',
    customerName: 'Dewi Lestari',
    itemsCount: 4,
    itemsSummary: '2x Cappucino, 2x Chocolate Croissant',
    totalAmount: 112000,
    source: 'QR',
    status: 'PENDING',
    createdAt: '14:55',
  },
  {
    id: 'ord-104',
    orderNumber: 'ORD-2026-0039',
    table: 'Takeaway',
    customerName: 'Rizky Maulan',
    itemsCount: 1,
    itemsSummary: '1x Chicken Sandwich',
    totalAmount: 45000,
    source: 'POS',
    status: 'COMPLETED',
    createdAt: '14:40',
  },
];

interface PosOrdersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PosOrdersDrawer({ isOpen, onClose }: PosOrdersDrawerProps) {
  const [orders, setOrders] = useState<PosOrderQueueItem[]>(INITIAL_QUEUE_ORDERS);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  if (!isOpen) return null;

  const filtered = orders.filter((o) =>
    filterStatus === 'ALL' ? true : o.status === filterStatus
  );

  const handleUpdateStatus = (
    orderId: string,
    newStatus: PosOrderQueueItem['status']
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const renderStatusBadge = (status: PosOrderQueueItem['status']) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
            Menunggu
          </span>
        );
      case 'PREPARING':
        return (
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
            Diproses
          </span>
        );
      case 'READY':
        return (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            Siap Saji
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="text-[11px] font-semibold text-neutral-600 bg-neutral-100 border border-neutral-300 px-2.5 py-0.5 rounded-full">
            Selesai
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 md:pl-10">
        <div className="w-screen max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 ease-out">
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="size-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#FF5C38]">
                <ClipboardList className="size-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-neutral-900 leading-snug">
                  Daftar & Antrean Pesanan
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Pantau pesanan kasir POS dan pesanan masuk dari QR meja
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Filter Chips */}
          <div className="px-6 py-2.5 border-b border-neutral-100 bg-neutral-50/50 flex items-center gap-1.5 overflow-x-auto">
            {['ALL', 'PENDING', 'PREPARING', 'READY', 'COMPLETED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  filterStatus === st
                    ? 'bg-[#FF5C38] text-white shadow-2xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {st === 'ALL'
                  ? 'Semua'
                  : st === 'PENDING'
                  ? 'Menunggu'
                  : st === 'PREPARING'
                  ? 'Diproses'
                  : st === 'READY'
                  ? 'Siap Saji'
                  : 'Selesai'}
              </button>
            ))}
          </div>

          {/* Body: Orders List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {filtered.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-300 transition-all shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
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

                <div className="flex items-center justify-between text-xs text-neutral-600">
                  <span className="font-semibold text-neutral-800">
                    {order.customerName} • {order.table}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {order.createdAt}
                  </span>
                </div>

                <p className="text-xs text-neutral-500 line-clamp-1">
                  {order.itemsSummary}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <span className="text-xs font-bold text-neutral-900">
                    {formatRupiah(order.totalAmount)}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {order.status === 'PENDING' && (
                      <Button
                        variant="secondary"
                        size="xs"
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                      >
                        Proses Dapur
                      </Button>
                    )}
                    {order.status === 'PREPARING' && (
                      <Button
                        variant="primary"
                        size="xs"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                      >
                        Siap Disajikan
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
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-neutral-100 bg-white flex justify-end">
            <Button variant="outline" size="sm" onClick={onClose}>
              Tutup
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
