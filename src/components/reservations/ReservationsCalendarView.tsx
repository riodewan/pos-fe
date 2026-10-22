'use client';

import React from 'react';
import { Clock, User, Calendar as CalendarIcon } from 'lucide-react';
import { Reservation } from '@/types/reservation';

interface ReservationsCalendarViewProps {
  reservations: Reservation[];
  onSelectReservation: (reservation: Reservation) => void;
}

export function ReservationsCalendarView({
  reservations,
  onSelectReservation,
}: ReservationsCalendarViewProps) {
  // Time slots from 09:00 to 22:00
  const hours = [
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
    '20:00',
    '21:00',
    '22:00',
  ];

  const tables = [
    'Meja 1',
    'Meja 2',
    'Meja 3',
    'Meja 4',
    'Meja 5',
    'Meja 6, 7',
    'Meja 8',
    'Meja 9',
    'Meja 10, 11',
    'Meja 12',
    'Meja 13',
    'Meja 14',
  ];

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden flex flex-col">
      <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="size-4 text-[#FF5C38]" />
          <h3 className="text-xs font-bold text-neutral-900">
            Jadwal Kalender Reservasi Meja (7 Okt 2026)
          </h3>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-500" /> Akan Datang
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-amber-500" /> Duduk
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-500" /> Selesai
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-rose-500" /> Dibatalkan
          </span>
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <div className="min-w-[800px] space-y-3">
          {tables.map((tbl) => {
            const tableReservations = reservations.filter((r) => r.table === tbl);

            return (
              <div
                key={tbl}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-neutral-100 hover:border-neutral-200 transition-all bg-neutral-50/40"
              >
                <div className="w-24 shrink-0 font-bold text-xs text-neutral-900">
                  {tbl}
                </div>

                <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1">
                  {tableReservations.length > 0 ? (
                    tableReservations.map((res) => {
                      const colorClass =
                        res.status === 'AKAN_DATANG'
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                          : res.status === 'DUDUK'
                          ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100'
                          : res.status === 'SELESAI'
                          ? 'bg-blue-50 border-blue-300 text-blue-800 hover:bg-blue-100'
                          : 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100';

                      return (
                        <button
                          key={res.id}
                          type="button"
                          onClick={() => onSelectReservation(res)}
                          className={`px-3 py-2 rounded-xl border text-left text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-2 ${colorClass}`}
                        >
                          <Clock className="size-3 shrink-0" />
                          <span>{res.time}</span>
                          <span className="font-bold truncate max-w-[120px]">
                            {res.customerName}
                          </span>
                          <span className="text-[10px] opacity-75">
                            ({res.guestCount}pax)
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <span className="text-xs text-neutral-400 italic">
                      Tidak ada reservasi (Tersedia)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
