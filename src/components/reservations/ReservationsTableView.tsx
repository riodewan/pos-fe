'use client';

import React, { useState } from 'react';
import {
  MoreVertical,
  CheckCircle2,
  Edit2,
  XCircle,
  Phone,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Reservation } from '@/types/reservation';

interface ReservationsTableViewProps {
  reservations: Reservation[];
  selectedReservationId: string | null;
  onSelectReservation: (reservation: Reservation) => void;
  onEdit: (reservation: Reservation) => void;
  onCheckIn: (reservationId: string) => void;
  onCancel: (reservationId: string) => void;
}

export function ReservationsTableView({
  reservations,
  selectedReservationId,
  onSelectReservation,
  onEdit,
  onCheckIn,
  onCancel,
}: ReservationsTableViewProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(reservations.map((r) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const renderStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'AKAN_DATANG':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Akan Datang
          </span>
        );
      case 'DUDUK':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <span className="size-1.5 rounded-full bg-amber-500" />
            Duduk
          </span>
        );
      case 'SELESAI':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <span className="size-1.5 rounded-full bg-blue-500" />
            Selesai
          </span>
        );
      case 'DIBATALKAN':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Dibatalkan
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-neutral-50/70 border-b border-neutral-200/80 text-neutral-500 font-bold">
              <th className="py-3 px-3.5 w-10 text-center">
                <input
                  type="checkbox"
                  checked={
                    reservations.length > 0 &&
                    selectedIds.length === reservations.length
                  }
                  onChange={handleSelectAll}
                  className="rounded border-neutral-300 text-[#FF5C38] focus:ring-[#FF5C38]"
                />
              </th>
              <th className="py-3 px-3">Waktu</th>
              <th className="py-3 px-3">Nama Pelanggan</th>
              <th className="py-3 px-3">Kontak</th>
              <th className="py-3 px-3">Jumlah</th>
              <th className="py-3 px-3">Meja</th>
              <th className="py-3 px-3">Area</th>
              <th className="py-3 px-3">Status</th>
              <th className="py-3 px-3">Catatan</th>
              <th className="py-3 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {reservations.map((row) => {
              const isSelected = selectedReservationId === row.id;
              const isChecked = selectedIds.includes(row.id);

              return (
                <tr
                  key={row.id}
                  onClick={() => onSelectReservation(row)}
                  className={`transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-50/50 hover:bg-blue-50/70'
                      : 'hover:bg-neutral-50/80'
                  }`}
                >
                  <td
                    className="py-3 px-3.5 text-center"
                    onClick={(e) => handleToggleRow(row.id, e)}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="rounded border-neutral-300 text-[#FF5C38] focus:ring-[#FF5C38] cursor-pointer"
                    />
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-neutral-900 whitespace-nowrap">
                    {row.time}
                  </td>

                  <td className="py-3 px-3 font-semibold text-neutral-900 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      {row.avatarUrl ? (
                        <img
                          src={row.avatarUrl}
                          alt={row.customerName}
                          className="size-7 rounded-full object-cover border border-neutral-200 shrink-0"
                        />
                      ) : (
                        <div className="size-7 rounded-full bg-neutral-800 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                          {row.customerName
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                        </div>
                      )}
                      <span className="truncate max-w-[140px] group-hover:text-[#FF5C38] transition-colors">
                        {row.customerName}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                    {row.customerPhone}
                  </td>

                  <td className="py-3 px-3 text-neutral-700 font-medium whitespace-nowrap">
                    {row.guestCount} orang
                  </td>

                  <td className="py-3 px-3 font-semibold text-neutral-900 whitespace-nowrap">
                    {row.table}
                  </td>

                  <td className="py-3 px-3 text-neutral-600 font-medium whitespace-nowrap">
                    {row.area}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    {renderStatusBadge(row.status)}
                  </td>

                  <td className="py-3 px-3 text-neutral-500 text-xs truncate max-w-[130px]">
                    {row.notes}
                  </td>

                  <td className="py-3 px-3 text-right whitespace-nowrap relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === row.id ? null : row.id);
                      }}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                    >
                      <MoreVertical className="size-4" />
                    </button>

                    {/* Quick Dropdown Actions Menu */}
                    {activeMenuId === row.id && (
                      <div
                        className="absolute right-3 top-10 z-20 w-44 bg-white border border-neutral-200 rounded-xl shadow-lg py-1 text-left text-xs animate-in fade-in duration-150"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onCheckIn(row.id);
                          }}
                          className="w-full px-3 py-1.5 text-left text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="size-3.5 text-emerald-600" />
                          <span>Check-in Tamu</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onEdit(row);
                          }}
                          className="w-full px-3 py-1.5 text-left text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Edit2 className="size-3.5 text-neutral-500" />
                          <span>Ubah Data</span>
                        </button>
                        <a
                          href={`https://wa.me/${row.customerPhone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full px-3 py-1.5 text-left text-neutral-700 hover:bg-neutral-50 flex items-center gap-2 cursor-pointer"
                        >
                          <MessageCircle className="size-3.5 text-emerald-600" />
                          <span>Kirim WhatsApp</span>
                        </a>
                        <div className="my-1 border-t border-neutral-100" />
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null);
                            onCancel(row.id);
                          }}
                          className="w-full px-3 py-1.5 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <XCircle className="size-3.5 text-rose-500" />
                          <span>Batalkan Reservasi</span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer matching Image 1 & 2 */}
      <div className="p-3.5 border-t border-neutral-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
        <p>Menampilkan 1-{reservations.length} dari {reservations.length} reservasi</p>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-1 rounded-md border border-neutral-200 text-neutral-400 hover:bg-neutral-50 cursor-pointer disabled:opacity-40"
              disabled
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <span className="size-6 rounded-md bg-[#FF5C38] text-white font-bold flex items-center justify-center text-xs">
              1
            </span>
            <button
              type="button"
              className="p-1 rounded-md border border-neutral-200 text-neutral-400 hover:bg-neutral-50 cursor-pointer disabled:opacity-40"
              disabled
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Tampilkan</span>
            <select
              defaultValue="10"
              className="px-2 py-1 rounded-lg border border-neutral-200 bg-white font-semibold text-neutral-700 cursor-pointer"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>per halaman</span>
          </div>
        </div>
      </div>
    </div>
  );
}
