'use client';

import React from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Clock,
  User,
  Users,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  Plus,
  CreditCard,
  Check,
  AlertCircle,
  Coffee,
  CheckCircle2,
} from 'lucide-react';
import { StatusBadge, Button } from '@/components/common';
import { formatRupiah } from '@/utils';

export type TableStatus = 'Kosong' | 'Terisi' | 'Reservasi' | 'Diblokir';

export interface OrderItemPreview {
  id: string;
  name: string;
  variant?: string;
  note?: string;
  qty: number;
  price: number;
}

export interface TableItem {
  id: string;
  tableNumber: number;
  area: 'Indoor' | 'Outdoor' | 'VIP';
  capacity: number; // e.g. 2
  status: TableStatus;
  elapsedTime?: string; // e.g. "00:13:34"
  reservationTime?: string; // e.g. "15:00 WIB"
  customer?: {
    name: string;
    phone: string;
    initials: string;
    date: string;
    time: string;
    note?: string;
  };
  activeOrder?: {
    startTime: string;
    staffName: string;
    guestCount: number;
    notes?: string;
    items: OrderItemPreview[];
    subtotal: number;
    tax: number;
    total: number;
  };
}

interface TableDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  table: TableItem | null;
  onPrevTable?: () => void;
  onNextTable?: () => void;
  onPay?: (table: TableItem) => void;
  onAddOrder?: (table: TableItem) => void;
  onCheckInReservation?: (table: TableItem) => void;
  onCancelReservation?: (table: TableItem) => void;
  onOpenTable?: (table: TableItem) => void;
}

export function TableDetailDrawer({
  isOpen,
  onClose,
  table,
  onPrevTable,
  onNextTable,
  onPay,
  onAddOrder,
  onCheckInReservation,
  onCancelReservation,
  onOpenTable,
}: TableDetailDrawerProps) {
  if (!isOpen || !table) return null;

  const isOccupied = table.status === 'Terisi';
  const isReserved = table.status === 'Reservasi';
  const isAvailable = table.status === 'Kosong';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[500px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Top Header matching Screenshot 1 & 2 */}
        <div className="p-6 border-b border-neutral-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
                Meja {table.tableNumber}
              </h2>
              {isOccupied && (
                <StatusBadge variant="success" icon={<Check className="size-3" />}>
                  Aktif
                </StatusBadge>
              )}
              {isReserved && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Clock className="size-3" />
                  <span>Reservasi</span>
                </span>
              )}
              {isAvailable && (
                <StatusBadge variant="neutral">Kosong</StatusBadge>
              )}
              {table.status === 'Diblokir' && (
                <StatusBadge variant="danger">Diblokir</StatusBadge>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Area {table.area} • {table.capacity} Kursi
            </p>
          </div>

          <button
            onClick={onClose}
            className="size-7 rounded-full bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* CASE 1: RESERVATION (Matching Screenshot 1) */}
          {isReserved && (
            <>
              {/* Customer Card */}
              {table.customer && (
                <div className="p-4 rounded-2xl border border-neutral-200/90 bg-white flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3.5">
                    <div className="size-11 rounded-full bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                      {table.customer.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-900">{table.customer.name}</p>
                      <p className="text-xs text-neutral-400 mt-0.5">{table.customer.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => alert(`Memanggil ${table.customer?.phone}`)}
                      className="size-9 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 flex items-center justify-center transition-colors shadow-2xs"
                      title="Telepon"
                    >
                      <Phone className="size-4" />
                    </button>
                    <a
                      href={`https://wa.me/${table.customer.phone.replace(/^0/, '62')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="size-9 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors shadow-2xs"
                      title="WhatsApp"
                    >
                      <MessageCircle className="size-4" />
                    </a>
                  </div>
                </div>
              )}

              {/* Informasi Section */}
              <div className="space-y-3.5">
                <h3 className="text-sm font-bold text-neutral-900">Informasi</h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-neutral-800">
                    <span className="text-neutral-400">Tanggal</span>
                    <span className="font-semibold">{table.customer?.date || '14/10/2026'}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-800">
                    <span className="text-neutral-400">Waktu</span>
                    <span className="font-semibold">{table.customer?.time || '15:00'}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-800">
                    <span className="text-neutral-400">Jumlah tamu</span>
                    <span className="font-semibold">{table.capacity} Orang</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-800">
                    <span className="text-neutral-400">Staff</span>
                    <span className="font-semibold">{table.activeOrder?.staffName || 'Budi'}</span>
                  </div>
                </div>

                {/* Catatan Card */}
                {table.customer?.note && (
                  <div className="pt-2">
                    <p className="text-xs text-neutral-400 mb-2">Catatan</p>
                    <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 flex items-center gap-2.5 text-xs text-neutral-700">
                      <FileText className="size-4 text-neutral-400 shrink-0" />
                      <span>{table.customer.note}</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* CASE 2: ACTIVE ORDER / OCCUPIED (Matching Screenshot 2) */}
          {isOccupied && (
            <>
              {/* Informasi Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-neutral-900">Informasi</h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Jumlah tamu</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">
                        {table.activeOrder?.guestCount || 2} Orang
                      </span>
                      <button type="button" className="text-blue-600 font-medium hover:underline text-xs">
                        Ubah
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Waktu Mulai</span>
                    <span className="font-semibold text-neutral-900">
                      {table.activeOrder?.startTime || '12:00'} ({table.elapsedTime || '00:13:34'})
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Staff</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-neutral-900">
                        {table.activeOrder?.staffName || 'Budi'}
                      </span>
                      <button type="button" className="text-blue-600 font-medium hover:underline text-xs">
                        Ubah
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Catatan</span>
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-600 flex items-center gap-1">
                        <FileText className="size-3.5 text-neutral-400" />
                        <span>{table.activeOrder?.notes || '-'}</span>
                      </span>
                      <button type="button" className="text-blue-600 font-medium hover:underline text-xs">
                        Tambah
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Pesanan Aktif Section */}
              <div className="pt-2 space-y-3">
                <h3 className="text-sm font-bold text-neutral-900">
                  Pesanan Aktif ({table.activeOrder?.items.length || 0})
                </h3>

                <div className="space-y-2.5">
                  {table.activeOrder?.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl border border-neutral-100 bg-neutral-50/40 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 flex items-center justify-center text-amber-900 shrink-0">
                            <Coffee className="size-5 text-amber-800" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-neutral-900">
                              ({item.qty}) {item.name}
                            </p>
                            {item.variant && (
                              <p className="text-[11px] text-neutral-400 mt-0.5">{item.variant}</p>
                            )}
                          </div>
                        </div>

                        <span className="text-xs font-semibold text-neutral-900">
                          {formatRupiah(item.price)}
                        </span>
                      </div>

                      {/* Item note banner */}
                      {item.note && (
                        <div className="p-2 rounded-lg bg-white border border-neutral-200/80 flex items-center gap-2 text-[11px] text-neutral-600">
                          <FileText className="size-3 text-neutral-400 shrink-0" />
                          <span>{item.note}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Subtotal & Total Bill Summary matching Screenshot 2 */}
                <div className="pt-4 border-t border-neutral-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span className="font-semibold text-neutral-900">
                      {formatRupiah(table.activeOrder?.subtotal || 58000)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>Pajak (10%)</span>
                    <span className="font-semibold text-neutral-900">
                      {formatRupiah(table.activeOrder?.tax || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>Nesos Fee</span>
                    <span className="font-semibold text-neutral-900">Rp0</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-500">
                    <span>Diskon</span>
                    <span className="font-semibold text-neutral-900">- Rp0</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <span className="text-sm font-bold text-neutral-900">Total</span>
                    <span className="text-base font-bold text-neutral-900">
                      {formatRupiah(table.activeOrder?.total || 58000)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* CASE 3: AVAILABLE / KOSONG */}
          {isAvailable && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="size-16 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center">
                <Users className="size-8" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-800">Meja Saat Ini Kosong</h4>
                <p className="text-xs text-neutral-400 mt-1 max-w-[280px]">
                  Meja siap digunakan untuk tamu baru atau reservasi mendatang.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions matching Screenshot 1 & 2 */}
        <div className="p-4 px-6 border-t border-neutral-100 flex items-center justify-between gap-3 bg-white">
          {/* Prev Table Button */}
          <button
            type="button"
            onClick={onPrevTable}
            className="size-10 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors shrink-0"
            title="Meja Sebelumnya"
          >
            <ChevronLeft className="size-5" />
          </button>

          {/* Main Action Buttons */}
          <div className="flex items-center gap-2.5 flex-1 justify-end">
            {isOccupied && (
              <>
                <Button
                  variant="outline-primary"
                  size="md"
                  onClick={() => onAddOrder?.(table)}
                  className="flex-1"
                >
                  Tambah Pesanan
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onPay?.(table)}
                  className="flex-1"
                >
                  Bayar
                </Button>
              </>
            )}

            {isReserved && (
              <>
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => onCancelReservation?.(table)}
                >
                  Batalkan
                </Button>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => alert(`Ubah reservasi Meja ${table.tableNumber}`)}
                >
                  Ubah
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => onCheckInReservation?.(table)}
                >
                  Check-In
                </Button>
              </>
            )}

            {isAvailable && (
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => onOpenTable?.(table)}
              >
                Buka Meja (Dine-In)
              </Button>
            )}
          </div>

          {/* Next Table Button */}
          <button
            type="button"
            onClick={onNextTable}
            className="size-10 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 flex items-center justify-center transition-colors shrink-0"
            title="Meja Berikutnya"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </>
  );
}
