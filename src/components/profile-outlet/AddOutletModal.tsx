'use client';

import React, { useState } from 'react';
import { Store, MapPin, Phone, Building } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';

interface AddOutletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (outletData: {
    name: string;
    branchName: string;
    category: string;
    phone: string;
    address: string;
  }) => void;
}

export function AddOutletModal({ isOpen, onClose, onSave }: AddOutletModalProps) {
  const [name, setName] = useState('Kopi Mantap');
  const [branchName, setBranchName] = useState('');
  const [category, setCategory] = useState('Coffee Shop');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) return;

    onSave({
      name,
      branchName,
      category,
      phone,
      address,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Outlet Baru"
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
            Simpan Outlet Baru
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Nama Brand / Outlet
            </label>
            <Input
              size="sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Nama Cabang *
            </label>
            <Input
              size="sm"
              placeholder="Contoh: Senopati, BSD, Bandung"
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
              <option value="Coffee Shop">Coffee Shop</option>
              <option value="Restoran">Restoran</option>
              <option value="Kafe & Bakery">Kafe & Bakery</option>
              <option value="Fast Food">Fast Food</option>
              <option value="Bar & Lounge">Bar & Lounge</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              No. Telepon Outlet
            </label>
            <Input
              size="sm"
              placeholder="081234567890"
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
