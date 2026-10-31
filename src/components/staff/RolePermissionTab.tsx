'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Users,
  CheckCircle2,
  Lock,
  Plus,
  Edit3,
} from 'lucide-react';
import { RoleDefinition, StaffRole } from '@/types/staff';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { tenantService } from '@/services/tenant.service';

const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'role-owner',
    name: 'Owner',
    description: 'Akses penuh ke seluruh konfigurasi toko, data keuangan, laporan, dan staf.',
    staffCount: 1,
    color: '#FF5C38',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-600 border-rose-200',
    permissions: [
      'Akses Penuh Semua Modul',
      'Kelola Toko & Pengaturan',
      'Kelola Staf & Hak Akses',
      'Laporan & Keuangan Lengkap',
      'Inventori & Pembelian',
      'Operasional Kasir (POS)',
    ],
  },
  {
    id: 'role-manager',
    name: 'Manager',
    description: 'Mengelola operasional harian outlet, inventori, stok, dan memantau pesanan.',
    staffCount: 1,
    color: '#2563EB',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-600 border-blue-200',
    permissions: [
      'Operasional Kasir & Refund',
      'Kelola Menu & Stok Harian',
      'Manajemen Inventori & PO',
      'Laporan Penjualan Shift',
      'Kelola Meja & Reservasi',
    ],
  },
  {
    id: 'role-kasir',
    name: 'Kasir',
    description: 'Menjalankan kasir POS, menerima pesanan, dan mencetak struk pembayaran.',
    staffCount: 3,
    color: '#7C3AED',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-600 border-purple-200',
    permissions: [
      'Buka / Tutup Kasir Shift',
      'Buat Transaksi Kasir (POS)',
      'Terima Pembayaran Tunai & QRIS',
      'Cetak Struk Pembayaran',
      'Lihat Status Meja',
    ],
  },
  {
    id: 'role-barista',
    name: 'Barista',
    description: 'Menerima pesanan minuman pada Kitchen Display System (KDS) dan memperbarui status hidangan.',
    staffCount: 1,
    color: '#059669',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-600 border-emerald-200',
    permissions: [
      'Akses Kitchen Display (KDS)',
      'Update Status Pesanan Minuman',
      'Lihat Resep & Standar Minuman',
    ],
  },
  {
    id: 'role-dapur',
    name: 'Dapur',
    description: 'Menerima pesanan makanan, menyiapkan pesanan, dan konfirmasi pesanan siap disajikan.',
    staffCount: 2,
    color: '#D97706',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-600 border-amber-200',
    permissions: [
      'Akses Kitchen Display (KDS)',
      'Update Status Makanan Siap',
      'Lihat Antrean Pesanan Makanan',
    ],
  },
  {
    id: 'role-server',
    name: 'Server',
    description: 'Melayani tamu di meja, mengantar makanan/minuman, dan update ketersediaan meja.',
    staffCount: 1,
    color: '#0284C7',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-600 border-sky-200',
    permissions: [
      'Akses Status Meja & Reservasi',
      'Bantu Input Pesanan Tamu',
      'Konfirmasi Pesanan Terantar',
    ],
  },
];

export function RolePermissionTab() {
  const [roles, setRoles] = useState<RoleDefinition[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    tenantService
      .getRoles()
      .then((res) => {
        if (Array.isArray(res?.data) && res.data.length > 0) {
          // Merge fetched roles with visual configurations
          const merged: RoleDefinition[] = res.data.map((r: any) => {
            const foundDef = DEFAULT_ROLES.find(
              (dr) => dr.name.toLowerCase() === r.name.toLowerCase()
            );
            return {
              id: r.id,
              name: (foundDef?.name || r.name) as StaffRole,
              description: r.description || foundDef?.description || 'Pengaturan akses peran staf.',
              staffCount: foundDef?.staffCount ?? 1,
              color: foundDef?.color || '#FF5C38',
              badgeBg: foundDef?.badgeBg || 'bg-rose-50',
              badgeText: foundDef?.badgeText || 'text-rose-600 border-rose-200',
              permissions: foundDef?.permissions || ['Akses Standar Modul'],
            };
          });
          setRoles(merged);
        }
      })
      .catch((err) => {
        console.warn('Backend roles warning, using defaults:', err);
      });
  }, []);

  const handleEditRole = (role: RoleDefinition) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Overview Header Card */}
      <div className="p-4 rounded-xl border border-neutral-200/80 bg-white shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF5C38]">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Hak Akses Berbasis Peran (RBAC)
            </h3>
            <p className="text-xs text-neutral-500">
              Setiap anggota staf memiliki peran dengan izin fitur yang telah disesuaikan agar operasional berjalan aman.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-500 font-medium">
            Total {roles.length} Peran Terdefinisi
          </span>
        </div>
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((r) => (
          <div
            key={r.id}
            className="p-5 rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-300 transition-all shadow-2xs flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${r.badgeBg} ${r.badgeText}`}
                >
                  {r.name}
                </span>

                <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                  <Users className="size-3.5 text-neutral-400" />
                  <span>{r.staffCount} staf</span>
                </div>
              </div>

              <p className="text-xs text-neutral-600 mb-4 leading-relaxed min-h-[36px]">
                {r.description}
              </p>

              {/* Permission List Preview */}
              <div className="space-y-1.5 border-t border-neutral-100 pt-3">
                <p className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-2">
                  Hak Akses Utama
                </p>
                {r.permissions.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs text-neutral-700"
                  >
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-[11px] text-neutral-400">
                {r.name === 'Owner' ? 'Akses sistem permanen' : 'Dapat disesuaikan'}
              </span>
              <Button
                variant="outline"
                size="xs"
                onClick={() => handleEditRole(r)}
                leftIcon={<Edit3 className="size-3" />}
              >
                Detail Izin
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Role Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedRole ? `Detail Izin Peran: ${selectedRole.name}` : 'Detail Peran'}
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Tutup
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-[#FF5C38] hover:bg-[#E04B28]"
              onClick={() => setIsModalOpen(false)}
            >
              Simpan Pengaturan
            </Button>
          </div>
        }
      >
        {selectedRole && (
          <div className="space-y-4 py-2">
            <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200/80">
              <p className="text-xs text-neutral-600">
                {selectedRole.description}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-neutral-800 mb-2">
                Daftar Hak Akses Aktif:
              </p>
              <div className="space-y-2">
                {selectedRole.permissions.map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 p-2 rounded-md bg-white border border-neutral-200/60 text-xs text-neutral-800"
                  >
                    <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
