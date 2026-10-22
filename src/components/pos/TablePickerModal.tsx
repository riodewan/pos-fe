'use client';

import React, { useState } from 'react';
import {
  Users,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';

export interface PosTable {
  id: string;
  name: string;
  area: 'Indoor' | 'Outdoor' | 'VIP';
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  currentCustomer?: string;
}

export const MOCK_POS_TABLES: PosTable[] = [
  { id: 't-1', name: 'Meja 1', area: 'Indoor', capacity: 2, status: 'OCCUPIED', currentCustomer: 'Budi S.' },
  { id: 't-2', name: 'Meja 2', area: 'Indoor', capacity: 4, status: 'AVAILABLE' },
  { id: 't-3', name: 'Meja 3', area: 'Indoor', capacity: 4, status: 'AVAILABLE' },
  { id: 't-4', name: 'Meja 4', area: 'Indoor', capacity: 6, status: 'RESERVED', currentCustomer: 'Meeting Tim' },
  { id: 't-5', name: 'Meja 5', area: 'Outdoor', capacity: 4, status: 'AVAILABLE' },
  { id: 't-6', name: 'Meja 6', area: 'Outdoor', capacity: 2, status: 'AVAILABLE' },
  { id: 't-7', name: 'Meja 7', area: 'Outdoor', capacity: 4, status: 'OCCUPIED', currentCustomer: 'Andi P.' },
  { id: 't-8', name: 'VIP Room', area: 'VIP', capacity: 8, status: 'AVAILABLE' },
];

interface TablePickerModalProps {
  isOpen: boolean;
  selectedTable: string;
  guestCount: number;
  onClose: () => void;
  onSelectTable: (table: string, guests: number) => void;
}

export function TablePickerModal({
  isOpen,
  selectedTable,
  guestCount,
  onClose,
  onSelectTable,
}: TablePickerModalProps) {
  const [activeArea, setActiveArea] = useState<string>('ALL');
  const [currentTable, setCurrentTable] = useState<string>(selectedTable || 'Meja 3');
  const [currentGuests, setCurrentGuests] = useState<number>(guestCount || 2);

  if (!isOpen) return null;

  const filteredTables = MOCK_POS_TABLES.filter(
    (t) => activeArea === 'ALL' || t.area === activeArea
  );

  const handleConfirm = () => {
    onSelectTable(currentTable, currentGuests);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pilih Meja Dine-in"
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-500">Jumlah Tamu:</span>
            <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
              <button
                type="button"
                onClick={() => setCurrentGuests((prev) => Math.max(1, prev - 1))}
                className="w-7 h-7 flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-200/60"
              >
                -
              </button>
              <span className="w-8 text-center text-xs font-bold text-neutral-800">
                {currentGuests}
              </span>
              <button
                type="button"
                onClick={() => setCurrentGuests((prev) => prev + 1)}
                className="w-7 h-7 flex items-center justify-center text-xs font-bold text-neutral-600 hover:bg-neutral-200/60"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleConfirm}
              className="bg-[#FF5C38] hover:bg-[#E04B28]"
            >
              Pilih {currentTable}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Area filter tabs */}
        <div className="flex items-center justify-between gap-2 border-b border-neutral-100 pb-2">
          <div className="flex items-center gap-1.5">
            {['ALL', 'Indoor', 'Outdoor', 'VIP'].map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setActiveArea(area)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeArea === area
                    ? 'bg-[#FF5C38] text-white shadow-2xs'
                    : 'bg-neutral-50 border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {area === 'ALL' ? 'Semua Area' : area}
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-[11px] text-neutral-500">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" /> Kosong
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-rose-500" /> Terisi
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-amber-500" /> Reservasi
            </span>
          </div>
        </div>

        {/* Table Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[320px] overflow-y-auto p-0.5">
          {filteredTables.map((table) => {
            const isSelected = currentTable === table.name;
            const isAvailable = table.status === 'AVAILABLE';

            return (
              <div
                key={table.id}
                onClick={() => setCurrentTable(table.name)}
                className={`p-3 rounded-xl border flex flex-col justify-between transition-all cursor-pointer relative select-none ${
                  isSelected
                    ? 'border-[#FF5C38] bg-rose-50/40 ring-2 ring-[#FF5C38]/20 shadow-2xs'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-neutral-900">
                      {table.name}
                    </span>
                    <span
                      className={`size-2 rounded-full ${
                        table.status === 'AVAILABLE'
                          ? 'bg-emerald-500 ring-2 ring-emerald-100'
                          : table.status === 'OCCUPIED'
                          ? 'bg-rose-500 ring-2 ring-rose-100'
                          : 'bg-amber-500 ring-2 ring-amber-100'
                      }`}
                    />
                  </div>

                  <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                    <Users className="size-3 text-neutral-400" /> {table.capacity} Kursi ({table.area})
                  </p>
                </div>

                <div className="mt-2.5 pt-1.5 border-t border-neutral-100/80 flex items-center justify-between text-[11px]">
                  <span
                    className={`font-semibold ${
                      table.status === 'AVAILABLE'
                        ? 'text-emerald-700'
                        : table.status === 'OCCUPIED'
                        ? 'text-rose-600'
                        : 'text-amber-700'
                    }`}
                  >
                    {table.status === 'AVAILABLE'
                      ? 'Tersedia'
                      : table.status === 'OCCUPIED'
                      ? table.currentCustomer || 'Terisi'
                      : 'Reservasi'}
                  </span>

                  {isSelected && (
                    <span className="size-4 rounded-full bg-[#FF5C38] text-white flex items-center justify-center">
                      <Check className="size-2.5 stroke-3" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
