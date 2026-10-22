'use client';

import React, { useState } from 'react';
import {
  X,
  QrCode,
  User,
  Coffee,
  ChevronLeft,
  ChevronRight,
  Printer,
  Send,
  Store,
  Truck,
  Check,
  CreditCard,
  Clock,
  Ban,
} from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { OrderTimeline, TimelineEvent } from '@/components/common/OrderTimeline';
import { formatRupiah } from '@/utils';

export interface TransactionItemDetail {
  id: string | number;
  name: string;
  qty: number;
  variant?: string;
  price: number;
  image?: string;
}

export interface DetailedTransaction {
  id: string;
  transactionNumber: string;
  orderNumber: string;
  dateTime: string;
  diningType: 'Dine-in' | 'Takeaway' | 'Delivery';
  channel: 'QR Order' | 'Kasir' | 'GrabFood' | 'ShopeeFood' | 'GoFood';
  tableOrCustomer: string;
  cashierName: string;
  paymentTime: string;
  items: TransactionItemDetail[];
  subtotal: number;
  tax: number;
  serviceFee: number;
  discount: number;
  total: number;
  paymentMethod: 'QRIS' | 'Tunai' | 'GrabPay' | 'ShopeePay' | 'GoPay' | string;
  paymentStatus: 'Lunas' | 'Sebagian' | 'Dibatalkan';
  paymentReference?: string;
  timeline?: TimelineEvent[];
}

export interface TransactionDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: DetailedTransaction | null;
  onPrintReceipt?: (transactionId: string) => void;
  onSendReceipt?: (transactionId: string) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export function TransactionDetailsDrawer({
  isOpen,
  onClose,
  transaction,
  onPrintReceipt,
  onSendReceipt,
  onPrev,
  onNext,
}: TransactionDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');

  if (!isOpen || !transaction) return null;

  const getPaymentStatusBadge = () => {
    switch (transaction.paymentStatus) {
      case 'Lunas':
        return (
          <StatusBadge variant="success" icon={<Check className="size-3" />}>
            Lunas
          </StatusBadge>
        );
      case 'Sebagian':
        return (
          <StatusBadge variant="warning" icon={<Clock className="size-3" />}>
            Sebagian
          </StatusBadge>
        );
      case 'Dibatalkan':
        return (
          <StatusBadge variant="neutral" icon={<Ban className="size-3" />}>
            Dibatalkan
          </StatusBadge>
        );
      default:
        return <StatusBadge variant="neutral">{transaction.paymentStatus}</StatusBadge>;
    }
  };

  const getChannelBadge = () => {
    switch (transaction.channel) {
      case 'QR Order':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-100">
            <QrCode className="size-3.5" />
            <span>QR Order</span>
          </div>
        );
      case 'Kasir':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-100">
            <Store className="size-3.5" />
            <span>Kasir</span>
          </div>
        );
      case 'GrabFood':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100">
            <Truck className="size-3.5" />
            <span>GrabFood</span>
          </div>
        );
      case 'ShopeeFood':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-100">
            <Truck className="size-3.5" />
            <span>ShopeeFood</span>
          </div>
        );
      case 'GoFood':
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-100">
            <Truck className="size-3.5" />
            <span>GoFood</span>
          </div>
        );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[460px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-neutral-100 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1 rounded-full text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="size-5" />
          </button>

          {/* Badges row */}
          <div className="flex items-center gap-2 mb-3">
            <StatusBadge variant="danger" dot>
              Baru
            </StatusBadge>
            {getPaymentStatusBadge()}
            <StatusBadge variant="info" dot>
              {transaction.diningType}
            </StatusBadge>
          </div>

          {/* ID & Date */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                {transaction.transactionNumber}
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">{transaction.dateTime}</p>
            </div>

            <div className="flex items-center gap-2">
              {getChannelBadge()}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-xs font-medium border border-neutral-200">
                <User className="size-3.5 text-teal-600" />
                <span>{transaction.tableOrCustomer}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-200 px-6">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 pt-3 text-sm font-semibold border-b-2 transition-colors relative flex-1 text-center ${
              activeTab === 'details'
                ? 'border-[#E5484D] text-[#E5484D]'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Detail Transaksi
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-3 pt-3 text-sm font-semibold border-b-2 transition-colors relative flex-1 text-center ${
              activeTab === 'history'
                ? 'border-[#E5484D] text-[#E5484D]'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Riwayat
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {activeTab === 'details' ? (
            <>
              {/* Section 1: Informasi Umum */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-neutral-900">Informasi Umum</h3>
                <div className="bg-neutral-50/70 rounded-xl p-3.5 border border-neutral-100 space-y-2.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 font-medium">No. Pesanan</span>
                    <span className="font-semibold text-neutral-900 underline cursor-pointer">
                      {transaction.orderNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 font-medium">Tipe Pesanan</span>
                    <span className="font-medium text-neutral-800">{transaction.diningType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 font-medium">Channel</span>
                    <span className="font-medium text-neutral-800 flex items-center gap-1.5">
                      <QrCode className="size-3.5 text-blue-500" />
                      {transaction.channel}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 font-medium">Waktu Pembayaran</span>
                    <span className="font-medium text-neutral-800">{transaction.paymentTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 font-medium">Kasir</span>
                    <span className="font-medium text-neutral-800">{transaction.cashierName}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Item Pesanan */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-neutral-900">
                  Item Pesanan ({transaction.items.length})
                </h3>
                <div className="space-y-2.5">
                  {transaction.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-neutral-50/70 border border-neutral-100 rounded-xl flex items-start gap-3"
                    >
                      {/* Thumbnail photo / fallback icon */}
                      <div className="size-11 rounded-lg bg-amber-100/60 border border-amber-200/50 flex items-center justify-center text-amber-700 shrink-0 overflow-hidden relative shadow-sm">
                        <Coffee className="size-5 text-amber-800/80" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-semibold text-neutral-900">
                            <span className="text-blue-600 font-bold mr-1">({item.qty})</span>
                            {item.name}
                          </p>
                          <span className="text-xs font-semibold text-neutral-900 shrink-0">
                            {formatRupiah(item.price)}
                          </span>
                        </div>
                        {item.variant && (
                          <p className="text-[11px] text-neutral-400 mt-0.5">{item.variant}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Breakdown */}
                <div className="pt-2 border-t border-neutral-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span className="text-neutral-800 font-medium">
                      {formatRupiah(transaction.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Pajak (10%)</span>
                    <span className="text-neutral-800 font-medium">
                      {formatRupiah(transaction.tax)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Nesos Fee</span>
                    <span className="text-neutral-800 font-medium">
                      {formatRupiah(transaction.serviceFee)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Diskon</span>
                    <span className="text-neutral-800 font-medium">
                      - {formatRupiah(transaction.discount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                    <span>Total</span>
                    <span>{formatRupiah(transaction.total)}</span>
                  </div>
                </div>
              </div>

              {/* Section 3: Pembayaran */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-neutral-900">Pembayaran (1)</h3>
                <div className="p-3.5 bg-neutral-50/70 border border-neutral-100 rounded-xl space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 font-medium">Metode</span>
                    <span className="font-semibold text-neutral-900 flex items-center gap-1.5">
                      <CreditCard className="size-3.5 text-neutral-600" />
                      {transaction.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 font-medium">Nominal</span>
                    <span className="font-semibold text-neutral-900">
                      {formatRupiah(transaction.total)}
                    </span>
                  </div>
                  {transaction.paymentReference && (
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400 font-medium">Referensi</span>
                      <span className="font-mono text-[11px] text-neutral-600">
                        {transaction.paymentReference}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-400 font-medium">Status</span>
                    {getPaymentStatusBadge()}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* Tab: Riwayat */
            <div>
              <OrderTimeline
                events={
                  transaction.timeline || [
                    {
                      id: '1',
                      time: '09:40',
                      title: 'Pesanan dibuat',
                      description: `Pesanan dibuat melalui ${transaction.channel} di ${transaction.tableOrCustomer}`,
                      author: 'Sistem',
                      status: 'completed',
                    },
                    {
                      id: '2',
                      time: '09:40',
                      title: 'Pembayaran berhasil',
                      description: `Pembayaran ${transaction.paymentMethod} terverifikasi`,
                      metadata: [
                        { label: 'Metode', value: transaction.paymentMethod },
                        { label: 'Nominal', value: formatRupiah(transaction.total) },
                        {
                          label: 'Referensi',
                          value: transaction.paymentReference || 'PAY-123456',
                        },
                      ],
                      author: 'Sistem',
                      status: 'active',
                    },
                    {
                      id: '3',
                      time: '09:43',
                      title: 'Pesanan diterima',
                      description: 'Pesanan diterima kasir',
                      author: `${transaction.cashierName} (Cashier)`,
                      status: 'completed',
                    },
                    {
                      id: '4',
                      time: '09:43',
                      title: 'Pesanan diproses',
                      description: 'Pesanan mulai disiapkan',
                      author: 'Siti (Kitchen)',
                      status: 'completed',
                    },
                    {
                      id: '5',
                      time: '09:55',
                      title: 'Pesanan siap diambil',
                      description: 'Semua item selesai disiapkan',
                      author: 'Siti (Kitchen)',
                      status: 'completed',
                    },
                    {
                      id: '6',
                      time: '09:58',
                      title: 'Transaksi selesai & ditutup',
                      description: 'Transaksi penjualan berhasil diselesaikan',
                      author: `${transaction.cashierName} (Cashier)`,
                      status: 'completed',
                    },
                  ]
                }
              />
            </div>
          )}
        </div>

        {/* Drawer Bottom Actions */}
        <div className="p-4 border-t border-neutral-100 flex items-center justify-between gap-3 bg-white">
          <button
            onClick={onPrev}
            className="p-2.5 rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-colors"
          >
            <ChevronLeft className="size-4" />
          </button>

          <div className="flex-1 flex items-center gap-2.5">
            <button
              onClick={() => onPrintReceipt?.(transaction.id)}
              className="flex-1 h-10 px-4 rounded-xl border border-[#E5484D] text-[#E5484D] hover:bg-red-50 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Printer className="size-3.5" />
              Cetak Struk
            </button>
            <button
              onClick={() => onSendReceipt?.(transaction.id)}
              className="flex-1 h-10 px-4 rounded-xl bg-[#E5484D] hover:bg-[#D93D42] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Send className="size-3.5" />
              Kirim Struk
            </button>
          </div>

          <button
            onClick={onNext}
            className="p-2.5 rounded-xl border border-neutral-200 text-neutral-500 hover:bg-neutral-50 transition-colors"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </>
  );
}
