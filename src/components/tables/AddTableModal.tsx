'use client';

import React, { useState } from 'react';
import { Check, Bookmark, CheckCircle2, LayoutGrid, Users } from 'lucide-react';
import { Drawer, Button, Modal, Input, FormField } from '@/components/common';
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
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title="Tambah Meja"
        subtitle="Atur nomor meja, penempatan area, dan kapasitas tempat duduk."
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Bookmark className="size-4" />}
              onClick={() => handleSubmit(true)}
            >
              Simpan sebagai Draf
            </Button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 className="size-4" />}
              onClick={() => handleSubmit(false)}
            >
              Simpan Meja
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Field: Nomor Meja */}
          <Input
            type="number"
            min="1"
            label="Nomor Meja"
            required
            value={tableNumber}
            onChange={(e) => setTableNumber(Number(e.target.value))}
            placeholder="Contoh: 13"
          />

          {/* Field: Area */}
          <FormField label="Area Outlet">
            <div className="grid grid-cols-3 gap-2">
              {(['Indoor', 'Outdoor', 'VIP'] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setArea(a)}
                  className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    area === a
                      ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-2xs'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <LayoutGrid className="size-3.5" />
                  <span>{a}</span>
                </button>
              ))}
            </div>
          </FormField>

          {/* Field: Kapasitas Kursi */}
          <FormField label="Kapasitas Kursi">
            <div className="grid grid-cols-4 gap-2">
              {[2, 4, 6, 8].map((cap) => (
                <button
                  key={cap}
                  type="button"
                  onClick={() => setCapacity(cap)}
                  className={`h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-all ${
                    capacity === cap
                      ? 'border-orange-500 bg-orange-50 text-orange-600 shadow-2xs'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <Users className="size-3.5" />
                  <span>{cap} Kursi</span>
                </button>
              ))}
            </div>
          </FormField>

          {/* Field: Status Awal */}
          <FormField label="Status Awal">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStatus('Kosong')}
                className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                  status === 'Kosong'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-2xs'
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
          </FormField>
        </div>
      </Drawer>

      {/* Success Modal using global Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        showCloseButton={false}
        size="md"
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="size-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-5">
            <Check className="size-10 stroke-[3]" />
          </div>

          <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
            Meja Berhasil Ditambahkan!
          </h3>
          <p className="text-xs text-neutral-500 mt-2 max-w-[340px] leading-relaxed">
            Meja {tableNumber} di Area {area} ({capacity} Kursi) berhasil disimpan dan siap menerima pesanan dine-in.
          </p>

          <div className="grid grid-cols-2 gap-3 w-full mt-6">
            <Button
              variant="outline-primary"
              size="md"
              onClick={handleSuccessClose}
            >
              Tutup
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSuccessClose}
            >
              Kembali ke Daftar Meja
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
