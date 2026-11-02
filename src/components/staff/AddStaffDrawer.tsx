'use client';

import React, { useState } from 'react';
import { X, Plus, Mail, Eye, EyeOff, KeyRound } from 'lucide-react';
import { StaffMember, StaffRole, StaffStatus } from '@/types/staff';
import { Role } from '@/types';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';

interface AddStaffDrawerProps {
  isOpen: boolean;
  mode?: 'add' | 'invite';
  availableRoles?: Role[];
  onClose: () => void;
  onAdd: (newStaff: StaffMember) => Promise<void> | void;
}

export function AddStaffDrawer({
  isOpen,
  mode = 'add',
  availableRoles = [],
  onClose,
  onAdd,
}: AddStaffDrawerProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<StaffRole>('Kasir');
  const [status, setStatus] = useState<StaffStatus>('Aktif');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const roleOptions =
    availableRoles.length > 0
      ? availableRoles.map((r) => r.name)
      : ['Kasir', 'Barista', 'Dapur', 'Server', 'Inventory', 'Manager', 'Owner'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    if (password.trim().length > 0 && password.trim().length < 6) return;

    const words = name.trim().split(/\s+/);
    const initials =
      words.length >= 2
        ? `${words[0][0]}${words[1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();

    const matchedRole = availableRoles.find(
      (r) => r.name.toLowerCase() === role.toLowerCase()
    );

    const newStaff: StaffMember = {
      id: `staff-${Date.now()}`,
      name: name.trim(),
      initials,
      email: email.trim().toLowerCase(),
      phone: phone.trim() || '-',
      role,
      roleId: matchedRole?.id,
      password: password.trim() || 'password123',
      status,
      lastLogin: 'Baru saja',
      permissions:
        role === 'Owner'
          ? ['pos', 'menu', 'tables', 'inventory', 'reports']
          : role === 'Manager'
          ? ['pos', 'menu', 'tables', 'inventory']
          : ['pos', 'tables'],
    };

    try {
      setIsSubmitting(true);
      await onAdd(newStaff);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
      setRole('Kasir');
      setStatus('Aktif');
    } finally {
      setIsSubmitting(false);
    }
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
                  ? 'Buat akun login staf dan atur hak akses operasionalnya'
                  : 'Daftarkan akun login staf dan atur peran operasionalnya'}
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
              label="Nama Lengkap *"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Siti Nurhaliza"
            />

            <Input
              label="Email Login Staff *"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: nama@emailanda.com"
            />

            {/* Password Login Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-700 flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-[#FF5C38]" />
                <span>Password Login Staff *</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter (untuk login staf)"
                  className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
                >
                  {showPassword ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                </button>
              </div>
              <p className="text-[11px] text-neutral-400">
                Staf dapat langsung masuk di halaman Login menggunakan email dan password ini.
              </p>
            </div>

            <Input
              label="Nomor Telepon / WhatsApp"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Contoh: 08121232423457"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <Select
                label="Peran Operasional"
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
              >
                {roleOptions.map((roleName) => (
                  <option key={roleName} value={roleName}>
                    {roleName}
                  </option>
                ))}
              </Select>

              <Select
                label="Status Akun"
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
                  <Mail className="size-4 text-blue-600" /> Informasi Login Staf
                </p>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Akun staf langsung aktif dan dapat digunakan untuk login sesuai peran operasional yang dipilih.
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
              disabled={isSubmitting || !name.trim() || !email.trim() || password.trim().length < 6}
            >
              {isSubmitting
                ? 'Menyimpan...'
                : mode === 'invite'
                ? 'Buat & Undang Staff'
                : 'Simpan Staff'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
