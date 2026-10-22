'use client';

import React, { useState } from 'react';
import { X, Plus, Mail } from 'lucide-react';
import { StaffMember, StaffRole, StaffStatus } from '@/types/staff';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';

interface AddStaffDrawerProps {
  isOpen: boolean;
  mode?: 'add' | 'invite';
  onClose: () => void;
  onAdd: (newStaff: StaffMember) => void;
}

export function AddStaffDrawer({
  isOpen,
  mode = 'add',
  onClose,
  onAdd,
}: AddStaffDrawerProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<StaffRole>('Kasir');
  const [status, setStatus] = useState<StaffStatus>('Aktif');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    // Calculate initials
    const words = name.trim().split(/\s+/);
    const initials =
      words.length >= 2
        ? `${words[0][0]}${words[1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: name.trim(),
      initials,
      email: email.trim(),
      phone: phone.trim() || '08121232423457',
      role,
      status,
      lastLogin: 'Baru saja',
      permissions:
        role === 'Owner'
          ? ['pos', 'menu', 'tables', 'inventory', 'reports']
          : role === 'Manager'
          ? ['pos', 'menu', 'tables', 'inventory']
          : ['pos', 'tables'],
    };

    onAdd(newStaff);
    onClose();

    // Reset
    setName('');
    setEmail('');
    setPhone('');
    setRole('Kasir');
    setStatus('Aktif');
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
          className="w-screen max-w-lg bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 ease-out"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white">
            <div>
              <h2 className="text-base font-bold text-neutral-900">
                {mode === 'invite' ? 'Undang Anggota Staff' : 'Tambah Staff Baru'}
              </h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                {mode === 'invite'
                  ? 'Kirimkan undangan ke email staf untuk bergabung'
                  : 'Daftarkan data staf dan atur peran operasionalnya'}
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

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <Input
              label="Nama Lengkap"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Siti Nurhaliza"
            />

            <Input
              label="Email"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: siti@kopimantap.id"
            />

            <Input
              label="Nomor Telepon / WhatsApp"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 08121232423457"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <Select
                label="Peran"
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
              >
                <option value="Kasir">Kasir</option>
                <option value="Barista">Barista</option>
                <option value="Dapur">Dapur</option>
                <option value="Server">Server</option>
                <option value="Manager">Manager</option>
                <option value="Owner">Owner</option>
              </Select>

              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value as StaffStatus)}
              >
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </Select>
            </div>

            {mode === 'invite' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <Mail className="size-4 text-blue-600" /> Undangan Email
                </p>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Tautan aktivasi akun dan pembuatan kata sandi akan dikirimkan otomatis ke alamat email staf yang dimasukkan di atas.
                </p>
              </div>
            )}
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
              leftIcon={mode === 'invite' ? <Mail className="size-4" /> : <Plus className="size-4" />}
              disabled={!name.trim() || !email.trim()}
            >
              {mode === 'invite' ? 'Kirim Undangan' : 'Simpan Staff'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
