'use client';

import React, { useState } from 'react';
import { X, Check, Bookmark, CheckCircle2, LayoutGrid, Users } from 'lucide-react';
import { TableItem } from './TableDetailDrawer';

interface AddTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (table: TableItem) => void;
  nextTableNumber: number;
}

export function AddTableModal({
  isOpen,
  onClose,
  onSave,
  nextTableNumber,
}: AddTableModalProps) {
  const [tableNumber, setTableNumber] = useState<number>(nextTableNumber);
  const [area, setArea] = useState<'Indoor' | 'Outdoor' | 'VIP'>('Indoor');
  const [capacity, setCapacity] = useState<number>(2);
  const [status, setStatus] = useState<TableItem['status']>('Kosong');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  React.useEffect(() => {
    setTableNumber(nextTableNumber);
  }, [nextTableNumber]);

  if (!isOpen) return null;

  const handleSubmit = (isDraft = false) => {
    const newTable: TableItem = {
      id: `tbl-${Date.now()}`,
      tableNumber,
      area,
      capacity,
      status: isDraft ? 'Diblokir' : status,
    };
    onSave(newTable);
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[540px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">Tambah Meja</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Atur nomor meja, penempatan area, dan kapasitas tempat duduk.
            </p>
          </div>

          <button
            onClick={onClose}
            className="size-7 rounded-full bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Field: Nomor Meja */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800">
              Nomor Meja <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={tableNumber}
              onChange={(e) => setTableNumber(Number(e.target.value))}
              placeholder="Contoh: 13"
              className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs font-semibold"
            />
          </div>

          {/* Field: Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800">Area Outlet</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Indoor', 'Outdoor', 'VIP'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArea(a)}
                  className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                    area === a
                      ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Field: Kapasitas Kursi */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800">Kapasitas Tamu (Kursi)</label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 4, 6, 8].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setCapacity(cap)}
                  className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                    capacity === cap
                      ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {cap} Orang
                </button>
              ))}
            </div>
          </div>

          {/* Field: Status Awal */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-neutral-800">Status Awal</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('Kosong')}
                className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                  status === 'Kosong'
                    ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Kosong (Tersedia)
              </button>
              <button
                type="button"
                onClick={() => setStatus('Diblokir')}
                className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                  status === 'Diblokir'
                    ? 'border-red-500 bg-red-50 text-red-600 shadow-2xs'
                    : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Diblokir (Maintenance)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-neutral-100 flex items-center justify-between gap-4 bg-white">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold transition-colors"
          >
            <Bookmark className="size-4" />
            <span>Simpan sebagai Draf</span>
          </button>

          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="inline-flex items-center gap-2 h-11 px-7 rounded-xl bg-[#E5484D] hover:bg-[#D9383D] text-white text-xs font-semibold transition-colors shadow-2xs"
          >
            <CheckCircle2 className="size-4 stroke-[2.5]" />
            <span>Simpan Meja</span>
          </button>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <>
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-[2px] transition-opacity" />
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
            <div className="w-full max-w-[480px] bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="size-24 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-6">
                <Check className="size-12 stroke-[3]" />
              </div>

              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                Meja Berhasil Ditambahkan!
              </h3>
              <p className="text-xs text-neutral-500 mt-2 max-w-[360px] leading-relaxed">
                Meja {tableNumber} di Area {area} ({capacity} Kursi) berhasil disimpan dan siap menerima pesanan dine-in.
              </p>

              <div className="grid grid-cols-2 gap-3 w-full mt-8">
                <button
                  type="button"
                  onClick={handleSuccessClose}
                  className="h-11 rounded-2xl border border-red-200 hover:bg-red-50/50 text-[#E5484D] text-xs font-semibold transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={handleSuccessClose}
                  className="h-11 rounded-2xl bg-[#FF5C38] hover:bg-[#EE4E2A] text-white text-xs font-semibold transition-colors shadow-2xs"
                >
                  Kembali ke Daftar Meja
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
