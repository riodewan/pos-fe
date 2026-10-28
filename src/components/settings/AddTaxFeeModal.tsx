'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { TaxFeeItem } from '@/types/outlet-settings';

interface AddTaxFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<TaxFeeItem, 'id' | 'isActive'>) => void;
}

export function AddTaxFeeModal({ isOpen, onClose, onSave }: AddTaxFeeModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'Pajak' | 'Biaya'>('Pajak');
  const [valueType, setValueType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState('');
  const [appliesTo, setAppliesTo] = useState('Semua Menu');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !value.trim()) return;

    const formattedValue =
      valueType === 'percent'
        ? `${value.replace('%', '')}%`
        : `Rp${Number(value.replace(/[^0-9]/g, '')).toLocaleString('id-ID')}`;

    onSave({
      name,
      type,
      value: formattedValue,
      appliesTo,
    });
    onClose();
    setName('');
    setValue('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Pajak atau Biaya"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-semibold"
          >
            Simpan
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Tipe
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('Pajak')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                type === 'Pajak'
                  ? 'border-[#FF5C38] bg-red-50 text-[#FF5C38]'
                  : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              Pajak
            </button>
            <button
              type="button"
              onClick={() => setType('Biaya')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                type === 'Biaya'
                  ? 'border-[#FF5C38] bg-red-50 text-[#FF5C38]'
                  : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              Biaya
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Nama Pajak / Biaya *
          </label>
          <Input
            size="sm"
            placeholder="Contoh: PPN 11%, Biaya Layanan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Bentuk Nilai
            </label>
            <Select
              size="sm"
              value={valueType}
              onChange={(e) => setValueType(e.target.value as 'percent' | 'fixed')}
            >
              <option value="percent">Persentase (%)</option>
              <option value="fixed">Nominal Tetap (Rp)</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Nominal / Nilai *
            </label>
            <Input
              size="sm"
              placeholder={valueType === 'percent' ? '11' : '2000'}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Berlaku Untuk
          </label>
          <Select
            size="sm"
            value={appliesTo}
            onChange={(e) => setAppliesTo(e.target.value)}
          >
            <option value="Semua Menu">Semua Menu</option>
            <option value="Dine-in, Takeway">Dine-in, Takeway</option>
            <option value="Takeway, Delivery">Takeway, Delivery</option>
            <option value="Delivery">Delivery</option>
            <option value="Minuman kemasan">Minuman kemasan</option>
          </Select>
        </div>
      </form>
    </Modal>
  );
}
