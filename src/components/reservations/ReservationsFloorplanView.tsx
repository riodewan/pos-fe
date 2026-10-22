'use client';

import React, { useState } from 'react';
import { Users, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Reservation } from '@/types/reservation';

interface ReservationsFloorplanViewProps {
  reservations: Reservation[];
  onSelectReservation: (reservation: Reservation) => void;
}

export function ReservationsFloorplanView({
  reservations,
  onSelectReservation,
}: ReservationsFloorplanViewProps) {
  const [activeArea, setActiveArea] = useState<'ALL' | 'Indoor' | 'Outdoor'>('ALL');

  const tables = [
    { name: 'Meja 1', area: 'Indoor', capacity: 2 },
    { name: 'Meja 2', area: 'Indoor', capacity: 2 },
    { name: 'Meja 3', area: 'Indoor', capacity: 4 },
    { name: 'Meja 4', area: 'Outdoor', capacity: 4 },
    { name: 'Meja 5', area: 'Outdoor', capacity: 2 },
    { name: 'Meja 6, 7', area: 'Indoor', capacity: 6 },
    { name: 'Meja 8', area: 'Indoor', capacity: 3 },
    { name: 'Meja 9', area: 'Indoor', capacity: 2 },
    { name: 'Meja 10, 11', area: 'Outdoor', capacity: 8 },
    { name: 'Meja 12', area: 'Indoor', capacity: 2 },
    { name: 'Meja 13', area: 'Outdoor', capacity: 4 },
    { name: 'Meja 14', area: 'Outdoor', capacity: 2 },
  ];

  const filteredTables = tables.filter(
    (t) => activeArea === 'ALL' || t.area === activeArea
  );

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden flex flex-col p-5 space-y-4">
      {/* Area selector & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {['ALL', 'Indoor', 'Outdoor'].map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setActiveArea(a as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeArea === a
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {a === 'ALL' ? 'Semua Area' : a}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-neutral-600">
            <span className="size-2.5 rounded-full bg-neutral-200 border border-neutral-300" />{' '}
            Kosong
          </span>
          <span className="flex items-center gap-1.5 font-medium text-amber-700">
            <span className="size-2.5 rounded-full bg-amber-500" /> Duduk (Terisi)
          </span>
          <span className="flex items-center gap-1.5 font-medium text-emerald-700">
            <span className="size-2.5 rounded-full bg-emerald-500" /> Reservasi
          </span>
        </div>
      </div>

      {/* Grid of Tables */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-2">
        {filteredTables.map((tbl) => {
          const res = reservations.find(
            (r) =>
              r.table === tbl.name &&
              (r.status === 'AKAN_DATANG' || r.status === 'DUDUK')
          );

          let bgBorder = 'bg-white border-neutral-200 hover:border-neutral-300';
          let badge = 'Kosong';
          let badgeClass = 'bg-neutral-100 text-neutral-500';

          if (res) {
            if (res.status === 'DUDUK') {
              bgBorder = 'bg-amber-50/50 border-amber-300 hover:border-amber-400';
              badge = 'Duduk';
              badgeClass = 'bg-amber-100 text-amber-800 font-bold';
            } else {
              bgBorder =
                'bg-emerald-50/50 border-emerald-300 hover:border-emerald-400';
              badge = 'Reservasi';
              badgeClass = 'bg-emerald-100 text-emerald-800 font-bold';
            }
          }

          return (
            <div
              key={tbl.name}
              onClick={() => res && onSelectReservation(res)}
              className={`p-4 rounded-2xl border transition-all shadow-2xs flex flex-col justify-between min-h-[140px] ${bgBorder} ${
                res ? 'cursor-pointer' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-neutral-900">
                  {tbl.name}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full ${badgeClass}`}
                >
                  {badge}
                </span>
              </div>

              <div className="my-2">
                {res ? (
                  <div className="text-xs">
                    <p className="font-bold text-neutral-900 truncate">
                      {res.customerName}
                    </p>
                    <p className="text-neutral-500 text-[11px] font-mono">
                      Jam {res.time} • {res.guestCount} Tamu
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400">
                    Kapasitas {tbl.capacity} Kursi
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-neutral-100 pt-2">
                <span>{tbl.area}</span>
                <span className="flex items-center gap-1">
                  <Users className="size-3 text-neutral-400" />
                  {tbl.capacity}pax
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
