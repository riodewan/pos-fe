'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { PaymentMethodItem } from '@/types/outlet-settings';
import { tenantService, GlobalMasterItem } from '@/services/tenant.service';

interface AddPaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<PaymentMethodItem, 'id' | 'isActive'>) => void;
}

export function AddPaymentMethodModal({
  isOpen,
  onClose,
  onSave,
}: AddPaymentMethodModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<PaymentMethodItem['type']>('E - Wallet');
  const [description, setDescription] = useState('');
  const [iconType, setIconType] = useState<PaymentMethodItem['iconType']>('qris');
  const [masterTemplates, setMasterTemplates] = useState<GlobalMasterItem[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    tenantService
      .getGlobalMasterData()
      .then((res) => {
        if (res.data?.payment_methods) {
          setMasterTemplates(res.data.payment_methods);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectTemplate = (tpl: GlobalMasterItem) => {
    setName(tpl.name);
    setDescription(tpl.description || `Pembayaran menggunakan ${tpl.name}.`);
    const cat = (tpl.metadata?.category || tpl.code || '').toUpperCase();
    if (cat === 'CASH') {
      setType('Tunai');
      setIconType('cash');
    } else if (cat === 'CARD' || cat === 'EDC') {
      setType('Kartu');
      setIconType('card');
    } else if (cat === 'TRANSFER' || cat === 'BANK_TRANSFER') {
      setType('Transfer');
      setIconType('bank');
    } else {
      setType('E - Wallet');
      setIconType('qris');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      name,
      type,
      description: description || `Pembayaran menggunakan ${name}.`,
      iconType,
    });
    onClose();
    setName('');
    setDescription('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Metode Pembayaran"
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
            Simpan Metode
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        {masterTemplates.length > 0 && (
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              Pilih dari Template Master Global (Internal Admin)
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
            Nama Metode Pembayaran *
          </label>
          <Input
            size="sm"
            placeholder="Contoh: GoPay, Bank BCA, LinkAja"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Kategori Tipe
            </label>
            <Select
              size="sm"
              value={type}
              onChange={(e) => {
                const val = e.target.value as PaymentMethodItem['type'];
                setType(val);
                if (val === 'Tunai') setIconType('cash');
                else if (val === 'Kartu') setIconType('card');
                else setIconType('qris');
              }}
            >
              <option value="Tunai">Tunai</option>
              <option value="E - Wallet">E - Wallet</option>
              <option value="Kartu">Kartu</option>
              <option value="Transfer">Transfer Bank</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Tipe Ikon
            </label>
            <Select
              size="sm"
              value={iconType}
              onChange={(e) => setIconType(e.target.value as PaymentMethodItem['iconType'])}
            >
              <option value="cash">Tunai / Uang</option>
              <option value="qris">QRIS</option>
              <option value="ovo">OVO / Ungu</option>
              <option value="dana">DANA / Biru</option>
              <option value="shopeepay">ShopeePay / Oranye</option>
              <option value="card">Kartu Debit/Kredit</option>
              <option value="bank">Transfer Bank</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Keterangan
          </label>
          <Textarea
            rows={2}
            placeholder="Contoh: Pembayaran menggunakan QRIS atau aplikasi terkait."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
