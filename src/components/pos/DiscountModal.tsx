'use client';

import React, { useState } from 'react';
import { Tag, Check } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { formatRupiah } from '@/utils';
import { useToast } from '@/context/ToastContext';

interface DiscountModalProps {
  isOpen: boolean;
  subtotal: number;
  currentDiscount: number;
  onClose: () => void;
  onApplyDiscount: (amount: number) => void;
}

export function DiscountModal({
  isOpen,
  subtotal,
  currentDiscount,
  onClose,
  onApplyDiscount,
}: DiscountModalProps) {
  const { toast } = useToast();
  const [promoCode, setPromoCode] = useState('');
  const [manualAmount, setManualAmount] = useState<number>(currentDiscount || 0);

  if (!isOpen) return null;

  const presets = [
    { label: 'Diskon 5%', percent: 0.05 },
    { label: 'Diskon 10%', percent: 0.1 },
    { label: 'Diskon 15%', percent: 0.15 },
    { label: 'Potongan Rp10.000', amount: 10000 },
    { label: 'Potongan Rp20.000', amount: 20000 },
  ];

  const handleApplyPreset = (item: { label: string; percent?: number; amount?: number }) => {
    if (item.percent) {
      setManualAmount(Math.round(subtotal * item.percent));
    } else if (item.amount) {
      setManualAmount(item.amount);
    }
  };

  const handleSave = () => {
    onApplyDiscount(manualAmount);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Diskon & Voucher"
      size="sm"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onApplyDiscount(0);
              onClose();
            }}
            className="text-rose-600 hover:bg-rose-50"
          >
            Hapus Diskon
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            className="bg-[#FF5C38] hover:bg-[#E04B28]"
          >
            Terapkan Diskon
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Nominal Diskon Input */}
        <div>
          <label className="text-xs font-semibold text-neutral-800 block mb-1">
            Nominal Potongan (Rp)
          </label>
          <Input
            type="number"
            value={manualAmount || ''}
            onChange={(e) => setManualAmount(Number(e.target.value) || 0)}
            placeholder="Contoh: 15000"
          />
        </div>

        {/* Presets */}
        <div>
          <p className="text-xs font-bold text-neutral-800 mb-2">
            Pilihan Cepat Diskon
          </p>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 text-xs rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-medium transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Promo code input */}
        <div className="pt-2 border-t border-neutral-100">
          <label className="text-xs font-semibold text-neutral-800 block mb-1">
            Kode Voucher Promo
          </label>
          <div className="flex items-center gap-2">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="Contoh: KOPIHEMAT10"
              containerClassName="flex-1"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (promoCode === 'KOPIHEMAT10') {
                  const disc = Math.round(subtotal * 0.1);
                  setManualAmount(disc);
                  toast.success(`Kode promo aktif! Diskon 10% (${formatRupiah(disc)}) diterapkan.`);
                } else {
                  toast.error('Kode promo tidak valid atau telah kedaluwarsa.');
                }
              }}
            >
              Cek
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
