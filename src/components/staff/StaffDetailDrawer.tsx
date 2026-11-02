'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trash2,
  Check,
  CheckCircle2,
  XCircle,
  FileText,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Eye,
  EyeOff,
  KeyRound,
} from 'lucide-react';
import { StaffMember, StaffRole, StaffStatus } from '@/types/staff';
import { Role } from '@/types';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Modal } from '@/components/common/Modal';

interface StaffDetailDrawerProps {
  staff: StaffMember | null;
  availableRoles?: Role[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedStaff: StaffMember) => void;
  onDelete: (staffId: string) => void;
}

const DEFAULT_PERMISSION_MODULES = [
  {
    id: 'pos',
    name: 'Kasir (POS)',
    description: 'Akses ke transaksi kasir dan pengelolaan pesanan.',
    subPermissions: ['Transaksi Baru', 'Batal Transaksi', 'Diskon Kasir', 'Refund'],
  },
  {
    id: 'menu',
    name: 'Menu',
    description: 'Kelola menu, kategori, dan harga.',
    subPermissions: ['Lihat Menu', 'Tambah & Ubah Menu', 'Atur Harga & Promo'],
  },
  {
    id: 'tables',
    name: 'Meja & Reservasi',
    description: 'Kelola meja dan reservasi pelanggan',
    subPermissions: ['Atur Status Meja', 'Kelola Reservasi', 'Pindah Meja'],
  },
  {
    id: 'inventory',
    name: 'Inventori & Stok',
    description: 'Kelola stok, bahan, dan supplier.',
    subPermissions: ['Lihat Stok', 'Input Stok Masuk/Keluar', 'Purchase Order', 'Penyesuaian Stok'],
  },
  {
    id: 'reports',
    name: 'Laporan & Keuangan',
    description: 'Akses laporan penjualan dan rekap kas kasir.',
    subPermissions: ['Laporan Penjualan Harian', 'Rekonsiliasi Kas', 'Export Laporan'],
  },
];

export function StaffDetailDrawer({
  staff,
  availableRoles = [],
  isOpen,
  onClose,
  onSave,
  onDelete,
}: StaffDetailDrawerProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<StaffRole>('Owner');
  const [status, setStatus] = useState<StaffStatus>('Aktif');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Permission states
  const [allAccess, setAllAccess] = useState(true);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (staff) {
      setName(staff.name || '');
      setPhone(staff.phone || '');
      setEmail(staff.email || '');
      setPassword('');
      setRole(staff.role || 'Kasir');
      setStatus(staff.status || 'Aktif');
      setPhotoPreview(staff.avatarUrl || null);

      const isOwner = staff.role === 'Owner';
      setAllAccess(isOwner);
      setSelectedPermissions(
        isOwner
          ? DEFAULT_PERMISSION_MODULES.map((m) => m.id)
          : staff.permissions || ['pos']
      );
      setExpandedModules({});
    }
  }, [staff]);

  if (!isOpen || !staff) return null;

  const toggleExpand = (moduleId: string) => {
    setExpandedModules((prev) => ({
      ...prev,
      [moduleId]: !prev[moduleId],
    }));
  };

  const handleToggleModule = (moduleId: string) => {
    if (allAccess) return;
    setSelectedPermissions((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleToggleAllAccess = (checked: boolean) => {
    setAllAccess(checked);
    if (checked) {
      setSelectedPermissions(DEFAULT_PERMISSION_MODULES.map((m) => m.id));
    }
  };

  const handleRoleChange = (newRole: StaffRole) => {
    setRole(newRole);
    if (newRole === 'Owner') {
      setAllAccess(true);
      setSelectedPermissions(DEFAULT_PERMISSION_MODULES.map((m) => m.id));
    } else {
      setAllAccess(false);
      if (newRole === 'Kasir') {
        setSelectedPermissions(['pos', 'tables']);
      } else if (newRole === 'Barista' || newRole === 'Dapur') {
        setSelectedPermissions(['pos']);
      } else if (newRole === 'Manager') {
        setSelectedPermissions(['pos', 'menu', 'tables', 'inventory', 'reports']);
      }
    }
  };

  const roleOptions =
    availableRoles.length > 0
      ? availableRoles.map((r) => r.name)
      : ['Owner', 'Manager', 'Kasir', 'Inventory', 'Dapur', 'Barista', 'Server'];

  const handleSave = () => {
    const matchedRole = availableRoles.find(
      (r) => r.name.toLowerCase() === role.toLowerCase()
    );
    const updated: StaffMember = {
      ...staff,
      name,
      phone,
      email: email.trim().toLowerCase(),
      role,
      roleId: matchedRole?.id,
      password: password.trim() || undefined,
      status,
      permissions: allAccess
        ? DEFAULT_PERMISSION_MODULES.map((m) => m.id)
        : selectedPermissions,
      avatarUrl: photoPreview || undefined,
    };
    onSave(updated);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
        />

        {/* Drawer Panel */}
        <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 md:pl-10">
          <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 ease-out">
            {/* Header matching Screenshot 2 */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-neutral-900 leading-snug">
                    {name || staff.name}
                  </h2>
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                      status === 'Aktif'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                    }`}
                  >
                    {status === 'Aktif' ? (
                      <CheckCircle2 className="size-3 text-emerald-600" />
                    ) : (
                      <XCircle className="size-3 text-neutral-400" />
                    )}
                    {status}
                  </span>
                </div>
                <p className="text-xs text-neutral-400 mt-0.5">
                  {email || staff.email}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="size-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                title="Tutup"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Nama Lengkap */}
              <Input
                label="Nama Lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama lengkap staf"
              />

              {/* No Telepon & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <Input
                  label="No Telepon"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                />
                <Input
                  label="Email Login"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: nama@kopimantap.id"
                />
              </div>

              {/* Ubah Password Login Staff (Opsional) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                  <KeyRound className="size-3.5 text-[#FF5C38]" />
                  <span>Ubah Password Login Staff (Opsional)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Kosongkan jika tidak ingin mengubah password"
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
              </div>

              {/* Foto Staff Card matching Screenshot 2 */}
              <div>
                <p className="text-xs font-bold text-neutral-800 mb-2">
                  Foto Staff
                </p>
                <div className="border border-dashed border-sky-300 bg-sky-50/20 rounded-xl p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                      <FileText className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-800">
                        Upload Foto Staff
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        WeBP, JPG, PNG. Ratio 1:1, Maks. 2MB
                      </p>
                    </div>
                  </div>

                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-rose-400 text-[#FF5C38] hover:bg-rose-50 text-xs px-3.5 font-medium"
                    >
                      Pilih file
                    </Button>
                  </div>
                </div>
              </div>

              {/* Peran & Hak Akses Section */}
              <div className="pt-2">
                <p className="text-xs font-bold text-neutral-800 mb-3">
                  Peran & Hak Akses
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-4">
                  <Select
                    label="Peran"
                    value={role}
                    onChange={(e) => handleRoleChange(e.target.value as StaffRole)}
                  >
                    {roleOptions.map((roleName) => (
                      <option key={roleName} value={roleName}>
                        {roleName}
                      </option>
                    ))}
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

                {/* Master Checkbox: Semua Hak Akses */}
                <div className="p-3 rounded-xl border border-neutral-200/80 bg-neutral-50/50 mb-3.5 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="all-access-checkbox"
                    checked={allAccess}
                    onChange={(e) => handleToggleAllAccess(e.target.checked)}
                    className="mt-0.5 size-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer"
                  />
                  <label
                    htmlFor="all-access-checkbox"
                    className="text-xs font-bold text-neutral-900 cursor-pointer select-none"
                  >
                    Semua Hak Akses ({role})
                    <span className="block text-[11px] font-normal text-neutral-500 mt-0.5">
                      Memiliki akses penuh ke semua fitur operasional.
                    </span>
                  </label>
                </div>

                {/* Module Permissions Accordion matching Screenshot 2 */}
                <div className="space-y-2">
                  {DEFAULT_PERMISSION_MODULES.map((mod) => {
                    const isChecked = allAccess || selectedPermissions.includes(mod.id);
                    const isExpanded = expandedModules[mod.id];

                    return (
                      <div
                        key={mod.id}
                        className="rounded-xl border border-neutral-200/80 bg-white overflow-hidden"
                      >
                        <div className="p-3 flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={() => toggleExpand(mod.id)}
                            className="mt-0.5 text-neutral-400 hover:text-neutral-700"
                          >
                            {isExpanded ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </button>

                          <input
                            type="checkbox"
                            id={`perm-${mod.id}`}
                            checked={isChecked}
                            disabled={allAccess}
                            onChange={() => handleToggleModule(mod.id)}
                            className="mt-0.5 size-4 rounded text-blue-600 focus:ring-blue-500 accent-blue-600 cursor-pointer disabled:opacity-75"
                          />

                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={`perm-${mod.id}`}
                              className="text-xs font-bold text-neutral-800 cursor-pointer select-none block"
                            >
                              {mod.name}
                            </label>
                            <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight">
                              {mod.description}
                            </p>
                          </div>
                        </div>

                        {/* Sub Permissions (Accordion dropdown) */}
                        {isExpanded && (
                          <div className="pl-11 pr-4 pb-3 pt-1 border-t border-neutral-100 bg-neutral-50/40 space-y-1.5">
                            {mod.subPermissions.map((sub, sIdx) => (
                              <div
                                key={sIdx}
                                className="flex items-center gap-2 text-[11px] text-neutral-600"
                              >
                                <span className="size-1.5 rounded-full bg-neutral-400" />
                                <span>{sub}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer matching Screenshot 2 */}
            <div className="px-6 py-4 border-t border-neutral-100 bg-white flex items-center justify-between">
              <Button
                variant="outline"
                className="border-neutral-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-semibold px-4 py-2"
                leftIcon={<Trash2 className="size-4 text-rose-500" />}
                onClick={() => setShowDeleteModal(true)}
              >
                Hapus Staff
              </Button>

              <Button
                variant="primary"
                className="bg-[#FF5C38] hover:bg-[#E04B28] text-xs font-semibold px-5 py-2"
                leftIcon={<Check className="size-4" />}
                onClick={handleSave}
              >
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Hapus Akun Staff"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onDelete(staff.id);
                setShowDeleteModal(false);
                onClose();
              }}
            >
              Ya, Hapus
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-1">
          <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
            <AlertTriangle className="size-5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Apakah Anda yakin ingin menghapus staf <strong>{staff.name}</strong>? Akun ini tidak akan dapat login lagi ke dalam sistem.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
