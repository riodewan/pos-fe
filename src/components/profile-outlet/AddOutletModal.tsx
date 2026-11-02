'use client';

import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Building } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { tenantService } from '@/services/tenant.service';

interface AddOutletModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultBrandName?: string;
  onSave: (outletData: {
    name: string;
    branchName: string;
    category: string;
    phone: string;
    address: string;
  }) => void;
}

export function AddOutletModal({
  isOpen,
  onClose,
  defaultBrandName = '',
  onSave,
}: AddOutletModalProps) {
  const [name, setName] = useState(defaultBrandName);
  const [branchName, setBranchName] = useState('');
  const [category, setCategory] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (isOpen) {
      setName(defaultBrandName);
      setBranchName('');
      setPhone('');
      setAddress('');
      tenantService
        .getGlobalMasterData()
        .then((res) => {
          const list = res.data?.categories || [];
          setCategories(list);
          if (list.length > 0) {
            setCategory(list[0].name);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, defaultBrandName]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !branchName.trim()) return;

    onSave({
      name: name.trim(),
      branchName: branchName.trim(),
      category,
      phone: phone.trim(),
      address: address.trim(),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Cabang / Outlet Baru"
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
            disabled={!name.trim() || !branchName.trim()}
            className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-semibold disabled:opacity-50"
          >
            Ajukan Cabang Baru
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-xs text-amber-800 flex items-start gap-2">
          <Building className="size-4 shrink-0 text-amber-600 mt-0.5" />
          <span>
            Setiap pembukaan cabang baru memerlukan verifikasi dan persetujuan (approval) dari tim Super Admin internal sebelum dapat aktif memproses transaksi kasir POS.
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Nama Brand / Outlet *
            </label>
            <Input
              size="sm"
              placeholder="Contoh: Kopi Nusantara"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Nama Cabang / Kode *
            </label>
            <Input
              size="sm"
              placeholder="Contoh: Senopati, Sudirman, BSD"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Kategori Bisnis
            </label>
            <Select
              size="sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Pilih kategori bisnis</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              No. Telepon Outlet
            </label>
            <Input
              size="sm"
              placeholder="Contoh: 081234567890"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Alamat Lengkap Outlet
          </label>
          <Textarea
            rows={2}
            placeholder="Jl. Nama Jalan No. XX, Kecamatan, Kota"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
