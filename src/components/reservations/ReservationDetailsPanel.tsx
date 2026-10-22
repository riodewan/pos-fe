'use client';

import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageCircle,
  Calendar,
  Clock,
  Users,
  Grid,
  MapPin,
  FileText,
  Edit2,
  XCircle,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  ArrowUpRight,
} from 'lucide-react';
import { Reservation } from '@/types/reservation';
import { Button } from '@/components/common/Button';

interface ReservationDetailsPanelProps {
  reservation: Reservation;
  onClose: () => void;
  onEdit: (reservation: Reservation) => void;
  onCheckIn: (reservationId: string) => void;
  onCancel: (reservationId: string) => void;
}

export function ReservationDetailsPanel({
  reservation,
  onClose,
  onEdit,
  onCheckIn,
  onCancel,
}: ReservationDetailsPanelProps) {
  const [isActivityOpen, setIsActivityOpen] = useState(true);

  // Status Badge formatting matching Image 1
  const renderStatusBadge = () => {
    switch (reservation.status) {
      case 'AKAN_DATANG':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Akan Datang
          </span>
        );
      case 'DUDUK':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            Duduk
          </span>
        );
      case 'SELESAI':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Selesai
          </span>
        );
      case 'DIBATALKAN':
        return (
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            Dibatalkan
          </span>
        );
    }
  };

  const defaultActivities = reservation.activities || [
    {
      id: 'act-1',
      time: '7 Okt 2026, 08:30',
      description: 'Reservasi dibuat oleh pelanggan (Website)',
      type: 'website' as const,
    },
    {
      id: 'act-2',
      time: '7 Okt 2026, 09:15',
      description: 'Konfirmasi reservasi dikirim (WhatsApp)',
      type: 'whatsapp' as const,
    },
    {
      id: 'act-3',
      time: '7 Okt 2026, 09:16',
      description: 'Pelanggan mengonfirmasi',
      type: 'system' as const,
    },
  ];

  const defaultPastReservations = reservation.pastReservations || [
    { id: 'past-1', date: '12 Sep 2026', guests: '4 orang', time: '19:00', status: 'Selesai' as const },
    { id: 'past-2', date: '5 Sep 2026', guests: '2 orang', time: '13:00', status: 'Selesai' as const },
    { id: 'past-3', date: '20 Aug 2026', guests: '3 orang', time: '11:00', status: 'Selesai' as const },
  ];

  return (
    <div className="w-full xl:w-96 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden flex flex-col shrink-0 animate-in fade-in duration-200">
      {/* Top Header matching Image 1 */}
      <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-neutral-900">Detail Reservasi</h2>
        </div>
        <div className="flex items-center gap-2.5">
          {renderStatusBadge()}
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Tutup detail"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-210px)]">
        {/* Customer Profile Card matching Image 1 */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {reservation.avatarUrl ? (
              <img
                src={reservation.avatarUrl}
                alt={reservation.customerName}
                className="size-12 rounded-full object-cover border border-neutral-200 shrink-0"
              />
            ) : (
              <div className="size-12 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-sm shrink-0">
                {reservation.customerName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-neutral-900 truncate">
                {reservation.customerName}
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5 font-mono truncate">
                {reservation.customerPhone}
              </p>
            </div>
          </div>

          {/* Action Icons: Call & WhatsApp */}
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={`tel:${reservation.customerPhone}`}
              className="size-8 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-600 transition-colors shadow-2xs"
              title="Telepon pelanggan"
            >
              <Phone className="size-3.5" />
            </a>
            <a
              href={`https://wa.me/${reservation.customerPhone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="size-8 rounded-full border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center text-emerald-600 transition-colors shadow-2xs"
              title="Kirim pesan WhatsApp"
            >
              <MessageCircle className="size-3.5 fill-emerald-600" />
            </a>
          </div>
        </div>

        {/* Reservation 2-Column Info Grid matching Image 1 */}
        <div className="grid grid-cols-2 gap-3 p-3.5 bg-neutral-50/70 rounded-xl border border-neutral-100 text-xs">
          <div>
            <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] mb-1">
              <Calendar className="size-3 text-neutral-400" />
              <span>Tanggal</span>
            </div>
            <p className="font-bold text-neutral-900">{reservation.date}</p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] mb-1">
              <Clock className="size-3 text-neutral-400" />
              <span>Waktu</span>
            </div>
            <p className="font-bold text-neutral-900">{reservation.time}</p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] mb-1">
              <Users className="size-3 text-neutral-400" />
              <span>Jumlah Tamu</span>
            </div>
            <p className="font-bold text-neutral-900">{reservation.guestCount} orang</p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] mb-1">
              <Clock className="size-3 text-neutral-400" />
              <span>Durasi (opsional)</span>
            </div>
            <p className="font-bold text-neutral-900">{reservation.duration || '2 jam'}</p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] mb-1">
              <Grid className="size-3 text-neutral-400" />
              <span>Meja</span>
            </div>
            <p className="font-bold text-neutral-900">{reservation.table}</p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] mb-1">
              <MapPin className="size-3 text-neutral-400" />
              <span>Area</span>
            </div>
            <p className="font-bold text-neutral-900">{reservation.area}</p>
          </div>

          <div className="col-span-2 pt-2 border-t border-neutral-200/60">
            <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] mb-1">
              <FileText className="size-3 text-neutral-400" />
              <span>Catatan</span>
            </div>
            <p className="font-medium text-neutral-700">
              {reservation.notes && reservation.notes !== '-'
                ? `Reservasi untuk ${reservation.notes.toLowerCase()}.`
                : 'Tidak ada catatan khusus.'}
            </p>
          </div>
        </div>

        {/* Primary Action Buttons: Ubah, Batalkan, Check-in matching Image 1 */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(reservation)}
            className="text-xs font-semibold"
            leftIcon={<Edit2 className="size-3 text-neutral-500" />}
          >
            Ubah
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onCancel(reservation.id)}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-neutral-200"
            leftIcon={<XCircle className="size-3 text-rose-500" />}
          >
            Batalkan
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onCheckIn(reservation.id)}
            className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs font-semibold"
            leftIcon={<CheckCircle2 className="size-3" />}
          >
            Check-in
          </Button>
        </div>

        {/* Section: Riwayat Aktivitas matching Image 1 */}
        <div className="border-t border-neutral-100 pt-4">
          <button
            type="button"
            onClick={() => setIsActivityOpen(!isActivityOpen)}
            className="w-full flex items-center justify-between text-xs font-bold text-neutral-900 mb-3 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-neutral-400" />
              <span>Riwayat Aktivitas</span>
            </div>
            {isActivityOpen ? (
              <ChevronUp className="size-3.5 text-neutral-400" />
            ) : (
              <ChevronDown className="size-3.5 text-neutral-400" />
            )}
          </button>

          {isActivityOpen && (
            <div className="space-y-3.5 pl-2 relative before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[1.5px] before:bg-emerald-200">
              {defaultActivities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 relative">
                  <span className="size-2 rounded-full bg-emerald-500 shrink-0 mt-1 ring-4 ring-white" />
                  <div className="text-[11px] leading-tight">
                    <p className="text-neutral-400 font-mono text-[10px] mb-0.5">
                      {act.time}
                    </p>
                    <p className="font-semibold text-neutral-800">{act.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Reservasi Lain dari Pelanggan Ini matching Image 1 */}
        <div className="border-t border-neutral-100 pt-4">
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold text-neutral-900">
              Reservasi Lain dari Pelanggan Ini
            </h4>
            <button
              type="button"
              className="text-[11px] font-bold text-[#FF5C38] hover:underline cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>

          <div className="space-y-2">
            {defaultPastReservations.map((past) => (
              <div
                key={past.id}
                className="flex items-center justify-between p-2 rounded-xl bg-neutral-50/70 border border-neutral-100 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-bold text-neutral-800">{past.date}</span>
                  <span className="text-neutral-400 font-medium text-[11px]">
                    {past.guests}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-neutral-400 font-mono text-[11px]">
                    {past.time}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                    {past.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
