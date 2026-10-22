'use client';

import React, { useState } from 'react';
import { X, Plus, Calendar } from 'lucide-react';
import { Customer, CustomerSegmentation, CustomerStatus } from '@/types/customer';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';

interface AddCustomerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newCustomer: Customer) => void;
}

export function AddCustomerDrawer({
  isOpen,
  onClose,
  onAdd,
}: AddCustomerDrawerProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [segmentation, setSegmentation] = useState<CustomerSegmentation>('Regular');
  const [status, setStatus] = useState<CustomerStatus>('Aktif');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Create initials
    const words = name.trim().split(/\s+/);
    const initials =
      words.length >= 2
        ? `${words[0][0]}${words[1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();

    const newCustomer: Customer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      initials,
      joinDate: `Bergabung ${new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date())}`,
      phone: phone.trim() || '-',
      email: email.trim() || '-',
      totalTransactions: 0,
      totalSpent: 0,
      segmentation,
      status,
      birthDate: birthDate || '-',
      gender,
      notes,
      address,
      transactions: [],
    };

    onAdd(newCustomer);
    onClose();

    // Reset form
    setName('');
    setPhone('');
    setEmail('');
    setBirthDate('');
    setGender('Laki-laki');
    setSegmentation('Regular');
    setStatus('Aktif');
    setNotes('');
    setAddress('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 md:pl-10">
        <form
          onSubmit={handleSubmit}
          className="w-screen max-w-xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 ease-out"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                Tambah Pelanggan Baru
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Daftarkan pelanggan baru ke dalam basis data POS
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="size-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <Input
              label="Nama Lengkap"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <Input
                label="No Telepon"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
              />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Contoh: budi@gmail.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <Input
                label="Tanggal Lahir"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="Contoh: 15 Agustus 1996"
                rightIcon={<Calendar className="size-4 text-neutral-400" />}
              />

              <Select
                label="Jenis Kelamin"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <Select
                label="Segmentasi"
                value={segmentation}
                onChange={(e) =>
                  setSegmentation(e.target.value as CustomerSegmentation)
                }
              >
                <option value="Regular">Regular</option>
                <option value="VIP">VIP</option>
                <option value="Baru">Baru</option>
              </Select>

              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as CustomerStatus)}
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </Select>
            </div>

            <Textarea
              label="Catatan Preferensi"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Preferensi minuman, tempat duduk favorit, dll..."
            />

            <Textarea
              label="Alamat Lengkap"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              placeholder="Contoh: Jl. Sudirman No. 10, Jakarta Selatan"
            />
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-neutral-100 bg-white flex items-center justify-end gap-2.5">
            <Button variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              className="bg-[#FF5C38] hover:bg-[#E04B28]"
              leftIcon={<Plus className="size-4" />}
              disabled={!name.trim()}
            >
              Simpan Pelanggan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
