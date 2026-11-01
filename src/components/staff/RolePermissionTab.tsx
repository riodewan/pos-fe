'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  Check,
  Lock,
  LayoutGrid,
  CreditCard,
  Coffee,
  Package,
  BookOpen,
  TrendingUp,
  Banknote,
  Settings,
  ClipboardList,
  ChefHat,
  Layers,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { RoleDefinition, StaffRole } from '@/types/staff';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { tenantService } from '@/services/tenant.service';
import { useToast } from '@/context/ToastContext';

interface MasterPermission {
  id: string;
  name: string;
  module: string;
  description: string;
}

export interface DashboardPageInfo {
  id: string;
  name: string;
  path: string;
  group: 'Operasional' | 'Katalog & Stok' | 'Bisnis & Pengelolaan';
  icon: React.ElementType;
  description: string;
  keyFeatures: string[];
}

export const DASHBOARD_PAGES: DashboardPageInfo[] = [
  // Operasional
  {
    id: 'dashboard',
    name: 'Ringkasan Dashboard',
    path: '/dashboard',
    group: 'Operasional',
    icon: LayoutGrid,
    description: 'Melihat ringkasan metrik penjualan harian, pendapatan kotor/bersih, dan grafik tren outlet.',
    keyFeatures: ['Grafik penjualan', 'Statistik omset', 'Aktivitas terkini'],
  },
  {
    id: 'pos',
    name: 'Kasir POS (Terminal Kasir)',
    path: '/dashboard/pos',
    group: 'Operasional',
    icon: CreditCard,
    description: 'Operasional transaksi kasir, input pesanan dine-in & takeaway, terima bayar tunai/QRIS, cetak struk.',
    keyFeatures: ['Input transaksi', 'Penerimaan pembayaran', 'Buka/tutup shift'],
  },
  {
    id: 'orders',
    name: 'Daftar Pesanan & Antrean',
    path: '/dashboard/orders',
    group: 'Operasional',
    icon: ClipboardList,
    description: 'Memantau seluruh antrean pesanan berjalan, status pesanan di dapur, dan rincian item pesanan.',
    keyFeatures: ['Monitor pesanan aktif', 'Ubah status pesanan', 'Batalkan pesanan'],
  },
  {
    id: 'transactions',
    name: 'Riwayat Transaksi & Struk',
    path: '/dashboard/transactions',
    group: 'Operasional',
    icon: CreditCard,
    description: 'Melihat riwayat struk penjualan yang telah selesai, detail pembayaran, dan pencatatan refund.',
    keyFeatures: ['Histori pembayaran', 'Cetak ulang struk', 'Proses refund kasir'],
  },
  {
    id: 'tables',
    name: 'Meja & Denah Ruangan',
    path: '/dashboard/tables',
    group: 'Operasional',
    icon: LayoutGrid,
    description: 'Melihat denah ruangan outlet, status keterisian meja (kosong/terisi), dan reservasi tamu.',
    keyFeatures: ['Visual denah meja', 'Status meja terisi', 'Pemesanan reservasi'],
  },
  {
    id: 'kds',
    name: 'Kitchen Display System (KDS)',
    path: '/dashboard/kds',
    group: 'Operasional',
    icon: ChefHat,
    description: 'Layar antrean persiapan pesanan langsung untuk station dapur makanan dan station barista minuman.',
    keyFeatures: ['Antrean pesanan dapur', 'Status makanan siap', 'Display minuman barista'],
  },
  // Katalog & Stok
  {
    id: 'catalog',
    name: 'Katalog Menu & Produk',
    path: '/dashboard/catalog',
    group: 'Katalog & Stok',
    icon: Coffee,
    description: 'Melihat dan mengelola daftar produk, variasi harga, kategori menu, dan ketersediaan stok produk.',
    keyFeatures: ['Daftar menu & varian', 'Ubah harga & promo', 'Status habis/tersedia'],
  },
  {
    id: 'recipes',
    name: 'Resep & Kalkulasi HPP',
    path: '/dashboard/recipes',
    group: 'Katalog & Stok',
    icon: BookOpen,
    description: 'Menyusun takaran gramasi bahan baku tiap produk serta memonitor harga pokok penjualan (HPP).',
    keyFeatures: ['Komposisi gramasi', 'Kalkulasi HPP modal', 'Standar porsi resep'],
  },
  {
    id: 'inventory',
    name: 'Inventori & Stok Bahan',
    path: '/dashboard/inventory',
    group: 'Katalog & Stok',
    icon: Package,
    description: 'Mencatat stok masuk/keluar, purchase order (PO) supplier, penyesuaian stok opname, dan wastage.',
    keyFeatures: ['Stok bahan baku', 'Purchase Order (PO)', 'Stok opname & wastage'],
  },
  // Bisnis & Pengelolaan
  {
    id: 'reports',
    name: 'Laporan Penjualan',
    path: '/dashboard/reports',
    group: 'Bisnis & Pengelolaan',
    icon: TrendingUp,
    description: 'Melihat laporan penjualan berkala, produk terlaris (*best seller*), dan export data ke excel/PDF.',
    keyFeatures: ['Laporan omset berkala', 'Ranking menu terlaris', 'Export laporan finansial'],
  },
  {
    id: 'finance',
    name: 'Keuangan & Kas Outlet',
    path: '/dashboard/finance',
    group: 'Bisnis & Pengelolaan',
    icon: Banknote,
    description: 'Rekapitulasi arus kas masuk/keluar harian, audit kasir shift, rekonsiliasi transfer bank & QRIS.',
    keyFeatures: ['Rekap kasir shift', 'Audit selisih kas', 'Pengeluaran kas kecil'],
  },
  {
    id: 'customers',
    name: 'Pelanggan & CRM Loyalitas',
    path: '/dashboard/customers',
    group: 'Bisnis & Pengelolaan',
    icon: Users,
    description: 'Database informasi kontak pelanggan, riwayat kunjungan belanja, dan pencatatan poin loyalitas.',
    keyFeatures: ['Data kontak pelanggan', 'Histori belanja tamu', 'Status membership'],
  },
  {
    id: 'staff',
    name: 'Staf & Hak Akses',
    path: '/dashboard/staff',
    group: 'Bisnis & Pengelolaan',
    icon: ShieldCheck,
    description: 'Menambah anggota tim outlet, mengatur jabatan, dan menentukan izin peran (Role-Based Access).',
    keyFeatures: ['Kelola staf tim', 'Hak akses peran (RBAC)', 'Log aktivitas login'],
  },
  {
    id: 'settings',
    name: 'Pengaturan Outlet',
    path: '/dashboard/settings',
    group: 'Bisnis & Pengelolaan',
    icon: Settings,
    description: 'Mengatur profil bisnis, jam buka/tutup, format struk printer, tarif pajak & service, metode bayar.',
    keyFeatures: ['Profil bisnis & logo', 'Tarif pajak & biaya', 'Format struk & printer'],
  },
];

export function isPageAccessibleByRole(
  pageId: string,
  roleName: string,
  permissionIds: string[] = []
): boolean {
  const normRole = (roleName || '').toLowerCase().trim();
  const perms = (permissionIds || []).map((p) => p.toLowerCase());

  // Owner has absolute access to every page
  if (normRole === 'owner') return true;

  switch (pageId) {
    case 'dashboard':
      return normRole === 'manager' || perms.includes('report.sales') || perms.includes('audit.view');
    case 'pos':
      return (
        ['manager', 'kasir', 'cashier'].includes(normRole) ||
        perms.includes('order.create') ||
        perms.includes('payment.process')
      );
    case 'orders':
      return (
        ['manager', 'kasir', 'cashier', 'server', 'dapur', 'barista', 'kitchen'].includes(normRole) ||
        perms.includes('order.view')
      );
    case 'transactions':
      return (
        ['manager', 'kasir', 'cashier'].includes(normRole) ||
        perms.includes('payment.view')
      );
    case 'tables':
      return (
        ['manager', 'kasir', 'cashier', 'server'].includes(normRole) ||
        perms.includes('table.view')
      );
    case 'kds':
      return (
        ['manager', 'barista', 'dapur', 'kitchen', 'kasir', 'cashier'].includes(normRole) ||
        perms.includes('order.view')
      );
    case 'catalog':
      return (
        ['manager', 'kasir', 'cashier', 'inventory', 'dapur', 'barista'].includes(normRole) ||
        perms.includes('product.view') ||
        perms.includes('menu.view')
      );
    case 'recipes':
      return (
        ['manager', 'inventory', 'dapur'].includes(normRole) ||
        perms.includes('recipe.view')
      );
    case 'inventory':
      return (
        ['manager', 'inventory', 'dapur'].includes(normRole) ||
        perms.includes('inventory.view') ||
        perms.includes('purchase.view') ||
        perms.includes('ingredient.view')
      );
    case 'reports':
      return normRole === 'manager' || perms.includes('report.sales') || perms.includes('report.financial');
    case 'finance':
      return normRole === 'manager' || perms.includes('report.financial');
    case 'customers':
      return ['manager', 'kasir', 'cashier'].includes(normRole) || perms.includes('order.create');
    case 'staff':
      return normRole === 'manager' || perms.includes('user.view') || perms.includes('role.view');
    case 'settings':
      return perms.includes('tenant.settings') || perms.includes('tenant.update');
    default:
      return false;
  }
}

const DEFAULT_COLOR_MAP: Record<string, { badgeBg: string; badgeText: string; color: string }> = {
  owner: { color: '#FF5C38', badgeBg: 'bg-rose-50', badgeText: 'text-rose-600 border-rose-200' },
  manager: { color: '#2563EB', badgeBg: 'bg-blue-50', badgeText: 'text-blue-600 border-blue-200' },
  kasir: { color: '#7C3AED', badgeBg: 'bg-purple-50', badgeText: 'text-purple-600 border-purple-200' },
  cashier: { color: '#7C3AED', badgeBg: 'bg-purple-50', badgeText: 'text-purple-600 border-purple-200' },
  barista: { color: '#059669', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-600 border-emerald-200' },
  dapur: { color: '#D97706', badgeBg: 'bg-amber-50', badgeText: 'text-amber-600 border-amber-200' },
  inventory: { color: '#D97706', badgeBg: 'bg-amber-50', badgeText: 'text-amber-600 border-amber-200' },
  server: { color: '#0284C7', badgeBg: 'bg-sky-50', badgeText: 'text-sky-600 border-sky-200' },
};

const DEFAULT_FALLBACK_STYLE = {
  color: '#6366F1',
  badgeBg: 'bg-indigo-50',
  badgeText: 'text-indigo-600 border-indigo-200',
};

export function RolePermissionTab() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [masterPermissions, setMasterPermissions] = useState<MasterPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Detail Modal state
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState<'pages' | 'permissions'>('pages');
  const [editDescription, setEditDescription] = useState('');
  const [editSelectedPermIds, setEditSelectedPermIds] = useState<string[]>([]);
  const [pageFilter, setPageFilter] = useState<'all' | 'accessible' | 'locked'>('all');
  const [isSaving, setIsSaving] = useState(false);

  // Add Role Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRolePermIds, setNewRolePermIds] = useState<string[]>([]);
  const [addModalTab, setAddModalTab] = useState<'permissions' | 'pages'>('permissions');

  // Fetch roles & permissions
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rolesRes, permsRes] = await Promise.allSettled([
        tenantService.getRoles(),
        tenantService.getPermissions(),
      ]);

      let loadedPerms: MasterPermission[] = [];
      if (permsRes.status === 'fulfilled' && Array.isArray(permsRes.value?.data)) {
        loadedPerms = permsRes.value.data;
        setMasterPermissions(loadedPerms);
      }

      if (rolesRes.status === 'fulfilled' && Array.isArray(rolesRes.value?.data)) {
        const mapped: RoleDefinition[] = rolesRes.value.data.map((r: any) => {
          const lowerName = (r.name || '').toLowerCase();
          const style = DEFAULT_COLOR_MAP[lowerName] || DEFAULT_FALLBACK_STYLE;

          const rolePerms = Array.isArray(r.permissions) ? r.permissions : [];
          const permissionLabels = rolePerms.map(
            (p: any) => p.description || p.name || 'Izin'
          );
          const permissionIds = rolePerms.map((p: any) => p.id || p.name);

          return {
            id: r.id,
            name: r.name as StaffRole,
            description: r.description || 'Pengaturan akses peran staf.',
            staffCount: typeof r.staff_count === 'number' ? r.staff_count : 0,
            color: style.color,
            badgeBg: style.badgeBg,
            badgeText: style.badgeText,
            permissions: permissionLabels.length > 0 ? permissionLabels : ['Akses Standar Modul'],
            permissionIds,
            isDefault: Boolean(r.is_default),
          };
        });
        setRoles(mapped);
      }
    } catch (err) {
      console.error('Error fetching roles/permissions:', err);
      toast.error('Gagal memuat data peran & izin.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group master permissions by module for the modal checklist
  const permissionsByModule = useMemo(() => {
    const groups: Record<string, MasterPermission[]> = {};
    for (const p of masterPermissions) {
      const mod = p.module || 'Lainnya';
      if (!groups[mod]) groups[mod] = [];
      groups[mod].push(p);
    }
    return groups;
  }, [masterPermissions]);

  const handleOpenEdit = (role: RoleDefinition) => {
    setSelectedRole(role);
    setEditDescription(role.description || '');
    setEditSelectedPermIds(role.permissionIds || []);
    setModalActiveTab('pages'); // Default to showing accessible pages
    setPageFilter('all');
    setIsEditModalOpen(true);
  };

  const handleToggleEditPerm = (permId: string) => {
    if (selectedRole?.name === 'Owner') return; // Owner has permanent all-access
    setEditSelectedPermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleToggleNewPerm = (permId: string) => {
    setNewRolePermIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleSaveEdit = async () => {
    if (!selectedRole) return;
    try {
      setIsSaving(true);
      await tenantService.updateRole(selectedRole.id, {
        description: editDescription,
        permissions: editSelectedPermIds,
      });
      toast.success(`Hak akses peran ${selectedRole.name} berhasil diperbarui.`);
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Error saving role:', err);
      toast.error(err?.response?.data?.message || 'Gagal menyimpan pembaruan peran.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;
    if (selectedRole.isDefault || ['owner', 'manager'].includes(selectedRole.name.toLowerCase())) {
      toast.error('Peran sistem utama tidak dapat dihapus.');
      return;
    }
    try {
      setIsSaving(true);
      await tenantService.deleteRole(selectedRole.id);
      toast.success(`Peran ${selectedRole.name} berhasil dihapus.`);
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Error deleting role:', err);
      toast.error(err?.response?.data?.message || 'Gagal menghapus peran.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      toast.error('Nama peran wajib diisi.');
      return;
    }
    try {
      setIsSaving(true);
      await tenantService.createRole({
        name: newRoleName.trim(),
        description: newRoleDesc.trim() || undefined,
        permissions: newRolePermIds,
      });
      toast.success(`Peran baru "${newRoleName}" berhasil dibuat.`);
      setIsAddModalOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
      setNewRolePermIds([]);
      fetchData();
    } catch (err: any) {
      console.error('Error creating role:', err);
      toast.error(err?.response?.data?.message || 'Gagal membuat peran baru.');
    } finally {
      setIsSaving(false);
    }
  };

  // Group pages for the modal
  const pagesByGroup = useMemo(() => {
    const groups: Record<string, DashboardPageInfo[]> = {
      'Operasional': [],
      'Katalog & Stok': [],
      'Bisnis & Pengelolaan': [],
    };
    for (const page of DASHBOARD_PAGES) {
      groups[page.group].push(page);
    }
    return groups;
  }, []);

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
              Setiap peran mengatur halaman dashboard apa saja yang dapat dibuka dan fitur apa yang diizinkan untuk operasional outlet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 font-medium">
            Total {roles.length} Peran Terdefinisi
          </span>
          <Button
            variant="primary"
            size="sm"
            className="bg-[#FF5C38] hover:bg-[#E04B28] text-xs h-8.5"
            onClick={() => setIsAddModalOpen(true)}
            leftIcon={<Plus className="size-3.5" />}
          >
            Tambah Peran
          </Button>
        </div>
      </div>

      {/* Role Cards Grid */}
      {isLoading ? (
        <div className="p-12 flex flex-col items-center justify-center gap-2">
          <Loader2 className="size-6 animate-spin text-[#FF5C38]" />
          <p className="text-xs text-neutral-400">Memuat daftar peran & izin...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((r) => {
            // Calculate accessible pages for this role
            const accessiblePages = DASHBOARD_PAGES.filter((p) =>
              isPageAccessibleByRole(p.id, r.name, r.permissionIds)
            );
            const accessibleCount = accessiblePages.length;

            return (
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

                  <p className="text-xs text-neutral-600 mb-3 leading-relaxed min-h-[36px]">
                    {r.description}
                  </p>

                  {/* Accessible Pages Counter Badge */}
                  <div className="mb-3.5 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-neutral-50 border border-neutral-100 text-xs">
                    <span className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1.5">
                      <LayoutGrid className="size-3.5 text-neutral-400" />
                      Akses Halaman
                    </span>
                    <span className="font-bold text-[#FF5C38] text-[11px]">
                      {accessibleCount} / {DASHBOARD_PAGES.length} Halaman
                    </span>
                  </div>

                  {/* Accessible Page Pills Preview */}
                  <div className="space-y-1.5 border-t border-neutral-100 pt-3">
                    <p className="text-[11px] font-bold text-neutral-700 uppercase tracking-wider mb-2">
                      Halaman yang Dapat Diakses
                    </p>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {accessiblePages.slice(0, 5).map((page) => (
                        <span
                          key={page.id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium"
                        >
                          <Check className="size-3 text-emerald-600" />
                          {page.name.split(' (')[0]}
                        </span>
                      ))}
                      {accessiblePages.length > 5 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600 text-[10.5px]">
                          +{accessiblePages.length - 5} lainnya
                        </span>
                      )}
                      {accessiblePages.length === 0 && (
                        <span className="text-xs text-neutral-400 italic">Belum ada halaman diizinkan</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                  <span className="text-[11px] text-neutral-400">
                    {r.name === 'Owner' ? 'Akses sistem permanen' : 'Dapat disesuaikan'}
                  </span>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => handleOpenEdit(r)}
                    leftIcon={<Edit3 className="size-3" />}
                  >
                    Detail Izin & Halaman
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Role Detail / Edit Modal with Accessible Pages View */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={
          selectedRole ? (
            <div className="flex items-center gap-2">
              <span>Detail Hak Akses:</span>
              <span className="text-[#FF5C38] font-bold">{selectedRole.name}</span>
            </div>
          ) : (
            'Detail Peran'
          )
        }
        subtitle="Lihat rincian halaman dashboard yang dapat dibuka dan sesuaikan izin teknis fitur."
        size="xl"
        footer={
          <div className="flex items-center justify-between gap-2 w-full">
            <div>
              {selectedRole && !selectedRole.isDefault && !['owner', 'manager'].includes(selectedRole.name.toLowerCase()) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  onClick={handleDeleteRole}
                  disabled={isSaving}
                  leftIcon={<Trash2 className="size-3.5" />}
                >
                  Hapus Peran
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
              >
                Tutup
              </Button>
              {selectedRole?.name !== 'Owner' && (
                <Button
                  variant="primary"
                  size="sm"
                  className="bg-[#FF5C38] hover:bg-[#E04B28]"
                  onClick={handleSaveEdit}
                  isLoading={isSaving}
                >
                  Simpan Perubahan
                </Button>
              )}
            </div>
          </div>
        }
      >
        {selectedRole && (
          <div className="space-y-4 py-1">
            {/* Description Banner */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Deskripsi Peran
                </p>
                <p className="text-xs text-neutral-700 mt-0.5">
                  {selectedRole.description || 'Tidak ada deskripsi.'}
                </p>
              </div>
              {selectedRole.name !== 'Owner' && (
                <div className="shrink-0 w-full md:w-64">
                  <Input
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Ubah deskripsi peran..."
                    className="text-xs h-8"
                  />
                </div>
              )}
            </div>

            {/* Modal Tab Switcher */}
            <div className="flex items-center border-b border-neutral-200 gap-4">
              <button
                type="button"
                onClick={() => setModalActiveTab('pages')}
                className={`flex items-center gap-2 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                  modalActiveTab === 'pages'
                    ? 'border-[#FF5C38] text-[#FF5C38]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <LayoutGrid className="size-4" />
                <span>Halaman Yang Dapat Diakses</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-100 text-neutral-600 font-bold">
                  {
                    DASHBOARD_PAGES.filter((p) =>
                      isPageAccessibleByRole(p.id, selectedRole.name, editSelectedPermIds)
                    ).length
                  }
                  /{DASHBOARD_PAGES.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setModalActiveTab('permissions')}
                className={`flex items-center gap-2 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                  modalActiveTab === 'permissions'
                    ? 'border-[#FF5C38] text-[#FF5C38]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <ShieldCheck className="size-4" />
                <span>Izin Modul Detail (RBAC)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-100 text-neutral-600 font-bold">
                  {selectedRole.name === 'Owner' ? 'Penuh' : `${editSelectedPermIds.length} Izin`}
                </span>
              </button>
            </div>

            {/* TAB 1: ACCESSIBLE PAGES */}
            {modalActiveTab === 'pages' && (
              <div className="space-y-4">
                {/* Filter and stats row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setPageFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        pageFilter === 'all'
                          ? 'bg-neutral-900 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      Semua Halaman ({DASHBOARD_PAGES.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setPageFilter('accessible')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        pageFilter === 'accessible'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      Dapat Diakses (
                      {
                        DASHBOARD_PAGES.filter((p) =>
                          isPageAccessibleByRole(p.id, selectedRole.name, editSelectedPermIds)
                        ).length
                      }
                      )
                    </button>
                    <button
                      type="button"
                      onClick={() => setPageFilter('locked')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        pageFilter === 'locked'
                          ? 'bg-neutral-600 text-white'
                          : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      }`}
                    >
                      Terkunci (
                      {
                        DASHBOARD_PAGES.filter(
                          (p) =>
                            !isPageAccessibleByRole(p.id, selectedRole.name, editSelectedPermIds)
                        ).length
                      }
                      )
                    </button>
                  </div>

                  {selectedRole.name === 'Owner' && (
                    <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md font-semibold">
                      Owner memiliki akses penuh permanen ke seluruh halaman sistem
                    </span>
                  )}
                </div>

                {/* Page Cards grouped by module category */}
                <div className="max-h-[380px] overflow-y-auto pr-1 space-y-4">
                  {Object.entries(pagesByGroup).map(([groupName, groupPages]) => {
                    const displayedPages = groupPages.filter((page) => {
                      const isAccessible = isPageAccessibleByRole(
                        page.id,
                        selectedRole.name,
                        editSelectedPermIds
                      );
                      if (pageFilter === 'accessible') return isAccessible;
                      if (pageFilter === 'locked') return !isAccessible;
                      return true;
                    });

                    if (displayedPages.length === 0) return null;

                    return (
                      <div key={groupName} className="space-y-2">
                        <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                          Kelompok {groupName}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {displayedPages.map((page) => {
                            const isAccessible = isPageAccessibleByRole(
                              page.id,
                              selectedRole.name,
                              editSelectedPermIds
                            );
                            const IconComponent = page.icon;

                            return (
                              <div
                                key={page.id}
                                className={`p-3 rounded-xl border transition-all ${
                                  isAccessible
                                    ? 'bg-white border-emerald-200/90 shadow-2xs hover:border-emerald-300'
                                    : 'bg-neutral-50/70 border-neutral-200 opacity-60'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${
                                        isAccessible
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                          : 'bg-neutral-200/60 text-neutral-400'
                                      }`}
                                    >
                                      <IconComponent className="size-4" />
                                    </div>
                                    <div>
                                      <h4 className="text-xs font-bold text-neutral-900 leading-tight">
                                        {page.name}
                                      </h4>
                                      <span className="text-[10px] text-neutral-400 font-mono">
                                        {page.path}
                                      </span>
                                    </div>
                                  </div>

                                  <div>
                                    {isAccessible ? (
                                      <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
                                        <CheckCircle2 className="size-3 text-emerald-600" />
                                        Dapat Diakses
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full shrink-0">
                                        <Lock className="size-3 text-neutral-400" />
                                        Terkunci
                                      </span>
                                    )}
                                  </div>
                                </div>

                                <p className="text-[11px] text-neutral-600 leading-relaxed mb-2">
                                  {page.description}
                                </p>

                                {/* Key Features Tags */}
                                <div className="flex flex-wrap gap-1 pt-1 border-t border-neutral-100">
                                  {page.keyFeatures.map((feat, idx) => (
                                    <span
                                      key={idx}
                                      className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600 font-medium"
                                    >
                                      • {feat}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: GRANULAR RBAC PERMISSIONS CHECKLIST */}
            {modalActiveTab === 'permissions' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-neutral-800">
                    Daftar Hak Akses Modul Teknis (API Endpoints & RBAC):
                  </p>
                  {selectedRole.name === 'Owner' && (
                    <span className="text-[11px] text-amber-600 font-medium">
                      Owner memiliki izin penuh ke seluruh modul sistem.
                    </span>
                  )}
                </div>

                {masterPermissions.length > 0 ? (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 border border-neutral-200/80 rounded-xl p-3 bg-neutral-50/50">
                    {Object.entries(permissionsByModule).map(([mod, perms]) => (
                      <div key={mod} className="space-y-1.5">
                        <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-1">
                          Modul {mod}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {perms.map((p) => {
                            const isChecked =
                              selectedRole.name === 'Owner' ||
                              editSelectedPermIds.includes(p.id) ||
                              editSelectedPermIds.includes(p.name);
                            return (
                              <button
                                type="button"
                                key={p.id}
                                onClick={() => handleToggleEditPerm(p.id)}
                                disabled={selectedRole.name === 'Owner'}
                                className={`flex items-start gap-2.5 p-2 rounded-lg border text-left text-xs transition-colors ${
                                  isChecked
                                    ? 'bg-emerald-50/80 border-emerald-300 text-neutral-900 font-medium'
                                    : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                                } ${selectedRole.name === 'Owner' ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                              >
                                <div
                                  className={`size-4 mt-0.5 rounded flex items-center justify-center shrink-0 border ${
                                    isChecked
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : 'border-neutral-300 bg-white'
                                  }`}
                                >
                                  {isChecked && <Check className="size-3" />}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-[11px] leading-tight truncate">
                                    {p.name}
                                  </p>
                                  <p className="text-[10px] text-neutral-500 line-clamp-1">
                                    {p.description}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
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
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add Role Modal with accessible pages preview */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Peran Staf Baru"
        subtitle="Buat peran baru dan sesuaikan halaman serta fitur apa yang dapat diakses."
        size="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
              disabled={isSaving}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-[#FF5C38] hover:bg-[#E04B28]"
              onClick={handleCreateRole}
              isLoading={isSaving}
            >
              Buat Peran
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateRole} className="space-y-4 py-1">
          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1">
              Nama Peran <span className="text-red-500">*</span>
            </label>
            <Input
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              placeholder="Contoh: Barista Supervisor, Akuntan Outlet"
              className="text-xs"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1">
              Deskripsi Tugas
            </label>
            <Input
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              placeholder="Contoh: Bertanggung jawab atas pengelolaan bahan baku kopi & KDS"
              className="text-xs"
            />
          </div>

          <div>
            <p className="text-xs font-bold text-neutral-800 mb-2">
              Pilih Hak Akses & Izin Fitur:
            </p>
            {masterPermissions.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 border border-neutral-200/80 rounded-xl p-3 bg-neutral-50/50">
                {Object.entries(permissionsByModule).map(([mod, perms]) => (
                  <div key={mod} className="space-y-1.5">
                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider px-1">
                      Modul {mod}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {perms.map((p) => {
                        const isChecked = newRolePermIds.includes(p.id);
                        return (
                          <button
                            type="button"
                            key={p.id}
                            onClick={() => handleToggleNewPerm(p.id)}
                            className={`flex items-start gap-2.5 p-2 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                              isChecked
                                ? 'bg-emerald-50/80 border-emerald-300 text-neutral-900 font-medium'
                                : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                            }`}
                          >
                            <div
                              className={`size-4 mt-0.5 rounded flex items-center justify-center shrink-0 border ${
                                isChecked
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'border-neutral-300 bg-white'
                              }`}
                            >
                              {isChecked && <Check className="size-3" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-[11px] leading-tight truncate">
                                {p.name}
                              </p>
                              <p className="text-[10px] text-neutral-500 line-clamp-1">
                                {p.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400">Tidak ada daftar izin tersedia.</p>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}
