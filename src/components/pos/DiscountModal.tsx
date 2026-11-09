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
    { label: '5%', percent: 0.05 },
    { label: '10%', percent: 0.1 },
    { label: '15%', percent: 0.15 },
    { label: '20%', percent: 0.2 },
    { label: 'Rp 10.000', amount: 10000 },
    { label: 'Rp 20.000', amount: 20000 },
    { label: 'Rp 50.000', amount: 50000 },
  ];

  const handleApplyPreset = (item: { label: string; percent?: number; amount?: number }) => {
    if (item.percent) {
      setManualAmount(Math.round(subtotal * item.percent));
    } else if (item.amount) {
      setManualAmount(Math.min(item.amount, subtotal));
    }
  };

  const handleCheckPromoCode = () => {
    const code = promoCode.trim().toUpperCase();
    if (!code) {
      toast.warning('Masukkan kode voucher promo terlebih dahulu.');
      return;
    }

    // Dynamic pattern matching for common promo patterns (e.g., DISKON10, DISKON20, HEMAT15, POTONGAN25K)
    const percentMatch = code.match(/(?:DISKON|HEMAT|PROMO|OFF)(\d{1,2})/);
    const nominalMatch = code.match(/(?:POTONGAN|VOUCHER|HEMAT)(\d+)(K)?/);

    if (percentMatch) {
      const pct = parseInt(percentMatch[1], 10);
      if (pct > 0 && pct <= 100) {
        const disc = Math.round(subtotal * (pct / 100));
        setManualAmount(disc);
        toast.success(`Voucher ${code} berhasil! Diskon ${pct}% (${formatRupiah(disc)}) diterapkan.`);
        return;
      }
    }

    if (nominalMatch) {
      let nom = parseInt(nominalMatch[1], 10);
      if (nominalMatch[2] === 'K') nom *= 1000;
      if (nom > 0) {
        const disc = Math.min(nom, subtotal);
        setManualAmount(disc);
        toast.success(`Voucher ${code} berhasil! Potongan ${formatRupiah(disc)} diterapkan.`);
        return;
      }
    }

    toast.error('Kode voucher promo tidak ditemukan atau telah kedaluwarsa.');
  };

  const handleSave = () => {
    if (manualAmount > subtotal) {
      toast.warning('Diskon tidak boleh melebihi subtotal pesanan.');
      return;
    }
    onApplyDiscount(Math.max(0, manualAmount));
    onClose();
  };

  const finalTotal = Math.max(0, subtotal - manualAmount);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Diskon & Voucher Pesanan"
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
        {/* Ringkasan Subtotal */}
        <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/90 flex items-center justify-between text-xs">
          <div>
            <p className="text-neutral-500">Subtotal Pesanan</p>
            <p className="font-bold text-neutral-900 mt-0.5">{formatRupiah(subtotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-neutral-500">Total Setelah Diskon</p>
            <p className="font-bold text-[#FF5C38] mt-0.5">{formatRupiah(finalTotal)}</p>
          </div>
        </div>

        {/* Nominal Diskon Input */}
        <div>
          <label className="text-xs font-semibold text-neutral-800 block mb-1">
            Nominal Potongan (Rp)
          </label>
          <Input
            type="number"
            value={manualAmount || ''}
            onChange={(e) => {
              const val = Number(e.target.value) || 0;
              setManualAmount(Math.min(val, subtotal));
            }}
            placeholder="Contoh: 15000"
          />
        </div>

        {/* Presets */}
        <div>
          <p className="text-xs font-bold text-neutral-800 mb-1.5">
            Pilihan Cepat Diskon
          </p>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="px-2.5 py-1 text-xs rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 hover:border-neutral-300 text-neutral-700 font-medium transition-colors cursor-pointer"
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
              placeholder="Contoh: DISKON10 / HEMAT20K"
              containerClassName="flex-1"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCheckPromoCode}
            >
              Cek
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
