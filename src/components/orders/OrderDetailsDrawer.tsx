'use client';

import React, { useState } from 'react';
import {
  X,
  QrCode,
  User,
  Coffee,
  FileText,
  ChevronLeft,
  ChevronRight,
  Check,
  Store,
  Truck,
} from 'lucide-react';
import { StatusBadge, Button } from '@/components/common';
import { OrderTimeline, TimelineEvent } from '@/components/common/OrderTimeline';
import { formatRupiah } from '@/utils';

export interface OrderItemDetail {
  id: string | number;
  name: string;
  qty: number;
  variant?: string;
  notes?: string;
  price: number;
  iconBg?: string;
}

export interface DetailedOrder {
  id: string;
  orderNumber: string;
  dateTime: string;
  status: 'Baru' | 'Diproses' | 'Siap diambil' | 'Selesai' | 'Dibatalkan';
  paymentStatus: 'Lunas' | 'Menunggu' | 'Dibatalkan';
  diningType: 'Dine-in' | 'Takeaway' | 'Delivery';
  channel: 'QR Order' | 'Kasir' | 'GrabFood' | 'ShopeeFood' | 'GoFood';
  tableOrCustomer: string;
  items: OrderItemDetail[];
  subtotal: number;
  tax: number;
  fee: number;
  discount: number;
  total: number;
  notes?: string;
  paymentMethod: string;
  timeline?: TimelineEvent[];
}

export interface OrderDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  order: DetailedOrder | null;
  onAccept?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function OrderDetailsDrawer({
  isOpen,
  onClose,
  order,
  onAccept,
  onReject,
  onPrev,
  onNext,
}: OrderDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  if (!isOpen || !order) return null;

  // Status badge config
  const getStatusBadge = () => {
    switch (order.status) {
      case 'Baru':
        return (
          <StatusBadge variant="danger" dot>
            Baru
          </StatusBadge>
        );
      case 'Diproses':
        return (
          <StatusBadge variant="warning" dot>
            Diproses
          </StatusBadge>
        );
      case 'Siap diambil':
        return (
          <StatusBadge variant="info" dot>
            Siap diambil
          </StatusBadge>
        );
      case 'Selesai':
        return (
          <StatusBadge variant="success" dot>
            Selesai
          </StatusBadge>
        );
      case 'Dibatalkan':
      default:
        return (
          <StatusBadge variant="neutral" dot>
            Dibatalkan
          </StatusBadge>
        );
    }
  };

  const getPaymentBadge = () => {
    if (order.paymentStatus === 'Lunas') {
      return (
        <StatusBadge
          variant="success"
          icon={<Check className="size-3 stroke-[2.5]" />}
        >
          Lunas
        </StatusBadge>
      );
    }
    if (order.paymentStatus === 'Menunggu') {
      return (
        <StatusBadge variant="warning" dot>
          Menunggu
        </StatusBadge>
      );
    }
    return (
      <StatusBadge variant="neutral">
        Dibatalkan
      </StatusBadge>
    );
  };

  const defaultTimeline: TimelineEvent[] = [
    {
      time: '09:40',
      title: 'Pesanan dibuat',
      description: `Pesanan dibuat melalui ${order.channel} di ${order.tableOrCustomer}`,
      actor: 'Oleh: Sistem',
      status: 'completed',
    },
    {
      time: '09:40',
      title: 'Pembayaran berhasil',
      description: 'Pembayaran QRIS terverifikasi',
      metadata: [
        { label: 'Metode', value: order.paymentMethod },
        { label: 'Nominal', value: formatRupiah(order.total) },
        { label: 'Referensi', value: `PAY-${order.orderNumber.replace(/[^0-9]/g, '') || '123456'}` },
      ],
      actor: 'Oleh: Sistem',
      status: 'completed',
    },
    {
      time: '09:43',
      title: 'Pesanan diterima',
      description: 'Pesanan diterima kasir',
      actor: 'Oleh: Andi (Cashier)',
      status: order.status === 'Baru' ? 'active' : 'completed',
    },
    {
      time: '09:43',
      title: 'Pesanan diproses',
      description: 'Pesanan mulai disiapkan',
      actor: 'Oleh: Siti (Kitchen)',
      status:
        order.status === 'Diproses'
          ? 'active'
          : order.status === 'Siap diambil' || order.status === 'Selesai'
          ? 'completed'
          : 'pending',
    },
    {
      time: '09:55',
      title: 'Pesanan siap diambil',
      description: 'Semua item selesai disiapkan',
      actor: 'Oleh: Siti (Kitchen)',
      status:
        order.status === 'Siap diambil'
          ? 'active'
          : order.status === 'Selesai'
          ? 'completed'
          : 'pending',
    },
    {
      time: '09:40',
      title: 'Pesanan selesai',
      description: 'Pesanan ditandai selesai',
      actor: 'Oleh: Andi (Cashier)',
      status: order.status === 'Selesai' ? 'completed' : 'pending',
    },
  ];

  const timelineEvents = order.timeline && order.timeline.length > 0 ? order.timeline : defaultTimeline;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-2xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
          {/* ======================================================== */}
          {/* DRAWER HEADER (Matching Screenshots 1 & 2)              */}
          {/* ======================================================== */}
          <div className="p-6 pb-4 border-b border-neutral-100 space-y-4">
            {/* Top row: Badges on left, Close button on right */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                {getStatusBadge()}
                {getPaymentBadge()}
                <StatusBadge variant="info" dot>
                  {order.diningType}
                </StatusBadge>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="size-7 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 hover:text-neutral-800 flex items-center justify-center transition-colors"
                aria-label="Tutup"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Order Title + Channel/Table Badges */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
                  {order.orderNumber}
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {order.dateTime}
                </p>
              </div>

              {/* Channel and Table Badges */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 text-xs font-semibold text-blue-700">
                  <QrCode className="size-3.5 text-blue-600" />
                  <span>{order.channel}</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50/50 text-xs font-semibold text-teal-700">
                  <User className="size-3.5 text-teal-600" />
                  <span>{order.tableOrCustomer}</span>
                </div>
              </div>
            </div>

            {/* Tab Navigation: Detail Pesanan vs Riwayat */}
            <div className="flex border-b border-neutral-200 -mb-4 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`flex-1 pb-3 text-xs font-bold text-center transition-colors relative ${
                  activeTab === 'details'
                    ? 'text-[#FF5C38]'
                    : 'text-neutral-500 hover:text-neutral-800 font-semibold'
                }`}
              >
                <span>Detail Pesanan</span>
                {activeTab === 'details' && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF5C38]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`flex-1 pb-3 text-xs font-bold text-center transition-colors relative ${
                  activeTab === 'history'
                    ? 'text-[#FF5C38]'
                    : 'text-neutral-500 hover:text-neutral-800 font-semibold'
                }`}
              >
                <span>Riwayat</span>
                {activeTab === 'history' && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#FF5C38]" />
                )}
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* DRAWER BODY: TAB CONTENT                                */}
          {/* ======================================================== */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'details' ? (
              /* TAB 1: DETAIL PESANAN (Screenshot 2) */
              <div className="space-y-6 text-xs">
                {/* 1. Item Pesanan */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-neutral-900">
                    Item Pesanan ({order.items.length})
                  </h3>

                  <div className="space-y-2.5">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-xl border border-neutral-100 bg-white shadow-2xs space-y-2"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`size-11 rounded-lg flex items-center justify-center shrink-0 ${
                                item.iconBg || 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              <Coffee className="size-5" />
                            </div>
                            <div>
                              <p className="font-bold text-neutral-900">
                                <span className="text-[#2563EB] font-bold mr-1">
                                  ({item.qty})
                                </span>
                                <span>{item.name}</span>
                              </p>
                              {item.variant && (
                                <p className="text-[11px] text-neutral-400 mt-0.5">
                                  {item.variant}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="font-bold text-neutral-900 text-xs">
                            {formatRupiah(item.price)}
                          </span>
                        </div>

                        {/* Customer custom note callout */}
                        {item.notes && (
                          <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 border border-neutral-100 text-[11px] text-neutral-600">
                            <FileText className="size-3.5 text-neutral-400 shrink-0" />
                            <span className="italic">{item.notes}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Informasi Pesanan */}
                <div className="space-y-2.5 pt-2 border-t border-neutral-100">
                  <h3 className="text-sm font-bold text-neutral-900">
                    Informasi Pesanan
                  </h3>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1">
                      <span className="text-neutral-500">Tipe Pesanan</span>
                      <span className="font-semibold text-neutral-900">
                        {order.diningType}
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-neutral-500">Pelanggan / Meja</span>
                      <span className="font-semibold text-neutral-900">
                        {order.tableOrCustomer}
                      </span>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-neutral-500">Channel</span>
                      <div className="flex items-center gap-1.5 font-semibold text-neutral-900">
                        <QrCode className="size-3.5 text-blue-600" />
                        <span>{order.channel}</span>
                      </div>
                    </div>

                    <div className="flex justify-between py-1">
                      <span className="text-neutral-500">Metode Pembayaran</span>
                      <span className="font-semibold text-neutral-900">
                        {order.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Financial Breakdown */}
                <div className="space-y-2 pt-2 border-t border-neutral-100 text-xs">
                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Subtotal</span>
                    <span className="font-medium text-neutral-800">
                      {formatRupiah(order.subtotal)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Pajak (10%)</span>
                    <span className="font-medium text-neutral-800">
                      {formatRupiah(order.tax)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Nesos Fee</span>
                    <span className="font-medium text-neutral-800">
                      {formatRupiah(order.fee)}
                    </span>
                  </div>

                  <div className="flex justify-between py-1">
                    <span className="text-neutral-500">Diskon</span>
                    <span className="font-medium text-neutral-800">
                      - {formatRupiah(order.discount)}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-neutral-200">
                    <span className="text-sm font-bold text-neutral-900">Total</span>
                    <span className="text-base font-extrabold text-neutral-900">
                      {formatRupiah(order.total)}
                    </span>
                  </div>
                </div>

                {/* 4. Catatan Pesanan */}
                <div className="space-y-1.5 pt-2 border-t border-neutral-100">
                  <h3 className="text-xs font-bold text-neutral-900">
                    Catatan Pesanan
                  </h3>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-neutral-50 text-neutral-500 text-xs">
                    <FileText className="size-3.5 text-neutral-400" />
                    <span>{order.notes || '-'}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 2: RIWAYAT (Screenshot 1) */
              <div className="py-2">
                <OrderTimeline events={timelineEvents} />
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* DRAWER FOOTER: ACTION BUTTONS (Screenshot 2)             */}
          {/* ======================================================== */}
          {activeTab === 'details' && (
            <div className="p-4 border-t border-neutral-200 bg-white flex items-center gap-3">
              <button
                type="button"
                onClick={onPrev}
                className="size-10 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 flex items-center justify-center shrink-0 transition-colors"
                title="Pesanan Sebelumnya"
              >
                <ChevronLeft className="size-4" />
              </button>

              <Button
                variant="outline"
                className="flex-1 border-rose-500 text-rose-500 hover:bg-rose-50"
                onClick={() => onReject?.(order.id)}
              >
                Tolak Pesanan
              </Button>

              <Button
                variant="primary"
                className="flex-1"
                onClick={() => onAccept?.(order.id)}
              >
                Terima Pesanan
              </Button>

              <button
                type="button"
                onClick={onNext}
                className="size-10 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-neutral-600 flex items-center justify-center shrink-0 transition-colors"
                title="Pesanan Berikutnya"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
