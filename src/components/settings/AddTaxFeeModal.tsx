'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { TaxFeeItem } from '@/types/outlet-settings';
import { tenantService, GlobalMasterItem } from '@/services/tenant.service';

interface AddTaxFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: TaxFeeItem | null;
  onSave: (item: Omit<TaxFeeItem, 'id' | 'isActive'>, editId?: string) => void;
}

export function AddTaxFeeModal({ isOpen, onClose, editingItem, onSave }: AddTaxFeeModalProps) {
  const [name, setName] = useState('PB1 / Pajak Restoran');
  const [value, setValue] = useState('10');
  const [appliesTo, setAppliesTo] = useState('Semua Menu');
  const [masterTemplates, setMasterTemplates] = useState<GlobalMasterItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    if (editingItem) {
      setName(editingItem.name);
      setValue(editingItem.value.replace(/[^0-9.,]/g, '').replace(',', '.'));
      setAppliesTo(editingItem.appliesTo || 'Semua Menu');
    } else {
      setName('PB1 / Pajak Restoran');
      setValue('10');
      setAppliesTo('Semua Menu');
    }
    tenantService
      .getGlobalMasterData()
      .then((res) => {
        if (res.data?.tax_fees) {
          setMasterTemplates(
            res.data.tax_fees.filter((t) => (t.metadata?.type || 'TAX') !== 'FEE')
          );
        }
      })
      .catch(() => {});
  }, [isOpen, editingItem]);

  if (!isOpen) return null;

  const handleSelectTemplate = (tpl: GlobalMasterItem) => {
    setName(tpl.name);
    const meta = tpl.metadata || {};
    setValue(String(meta.value ?? '10'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !value.trim()) return;

    const cleanNum = Number(value.replace(/[^0-9.,]/g, '').replace(',', '.')) || 0;
    const formattedValue = `${cleanNum}%`;

    onSave(
      {
        name: name.trim(),
        type: 'Pajak',
        value: formattedValue,
        appliesTo,
      },
      editingItem?.id
    );
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingItem ? 'Ubah Pengaturan Pajak' : 'Atur Pajak Transaksi'}
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
            Simpan Pajak
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {masterTemplates.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              Pilih dari Template Pajak Global
            </label>
            <div className="flex flex-wrap gap-1.5">
              {masterTemplates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                    name === tpl.name
                      ? 'border-[#FF5C38] bg-orange-50 text-[#FF5C38] font-semibold'
                      : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                  }`}
                >
                  {tpl.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Nama Pajak *
          </label>
          <Input
            size="sm"
            placeholder="Contoh: PB1 10%, PPN 11%"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Persentase Pajak (%) *
            </label>
            <Input
              size="sm"
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="10"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              required
            />
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
              <option value="Dine-in, Takeway">Dine-in, Takeaway</option>
            </Select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
