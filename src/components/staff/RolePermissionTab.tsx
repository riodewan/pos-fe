'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
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
} from 'lucide-react';
import { RoleDefinition, AccessiblePageData } from '@/types/staff';
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

const PAGE_ICON_MAP: Record<string, React.ElementType> = {
  dashboard: LayoutGrid,
  pos: CreditCard,
  orders: ClipboardList,
  transactions: CreditCard,
  tables: LayoutGrid,
  kds: ChefHat,
  catalog: Coffee,
  recipes: BookOpen,
  inventory: Package,
  reports: TrendingUp,
  finance: Banknote,
  customers: Users,
  staff: ShieldCheck,
  settings: Settings,
};

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
  const [editSelectedPermNames, setEditSelectedPermNames] = useState<string[]>([]);
  const [pageFilter, setPageFilter] = useState<'all' | 'accessible' | 'locked'>('all');
  const [isSaving, setIsSaving] = useState(false);

  // Add Role Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRolePermIds, setNewRolePermIds] = useState<string[]>([]);

  // Fetch roles & permissions directly from backend database
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rolesRes, permsRes] = await Promise.allSettled([
        tenantService.getRoles(),
        tenantService.getPermissions(),
      ]);

      if (permsRes.status === 'fulfilled' && Array.isArray(permsRes.value?.data)) {
        setMasterPermissions(permsRes.value.data);
      }

      if (rolesRes.status === 'fulfilled' && Array.isArray(rolesRes.value?.data)) {
        const mapped: RoleDefinition[] = rolesRes.value.data.map((r: any) => {
          const lowerName = (r.name || '').toLowerCase();
          const style = DEFAULT_COLOR_MAP[lowerName] || DEFAULT_FALLBACK_STYLE;

          const rolePerms = Array.isArray(r.permissions) ? r.permissions : [];
          const permissionLabels = rolePerms.map(
            (p: any) => p.description || p.name
          );
          const permissionNames = rolePerms.map((p: any) => p.name || p.id);

          return {
            id: r.id,
            name: r.name,
            description: r.description || 'Pengaturan hak akses peran staf.',
            staffCount: typeof r.staff_count === 'number' ? r.staff_count : 0,
            color: style.color,
            badgeBg: style.badgeBg,
            badgeText: style.badgeText,
            permissions: permissionLabels,
            permissionIds: permissionNames,
            accessiblePages: Array.isArray(r.accessible_pages) ? r.accessible_pages : [],
            isDefault: Boolean(r.is_default),
          };
        });
        setRoles(mapped);
      }
    } catch (err) {
      console.error('Error fetching database roles/permissions:', err);
      toast.error('Gagal memuat data peran. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group master permissions from database by module
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
    setEditSelectedPermNames(role.permissionIds || []);
    setModalActiveTab('pages');
    setPageFilter('all');
    setIsEditModalOpen(true);
  };

  const handleToggleEditPerm = (permName: string) => {
    if (selectedRole?.name === 'Owner') return;
    setEditSelectedPermNames((prev) =>
      prev.includes(permName) ? prev.filter((name) => name !== permName) : [...prev, permName]
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
        permissions: editSelectedPermNames,
      });
      toast.success(`Hak akses peran ${selectedRole.name} berhasil disimpan.`);
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      console.error('Error saving role to database:', err);
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
      console.error('Error deleting role from database:', err);
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
      toast.success(`Peran "${newRoleName}" berhasil disimpan.`);
      setIsAddModalOpen(false);
      setNewRoleName('');
      setNewRoleDesc('');
      setNewRolePermIds([]);
      fetchData();
    } catch (err: any) {
      console.error('Error creating role in database:', err);
      toast.error(err?.response?.data?.message || 'Gagal membuat peran baru.');
    } finally {
      setIsSaving(false);
    }
  };

  // Helper to determine if a page is accessible given current permissions
  const checkPageAccessibility = (page: AccessiblePageData, roleName: string, activePerms: string[]) => {
    if (roleName.toLowerCase() === 'owner') return true;
    const required = page.required_permissions || [];
    return required.some((req) => activePerms.includes(req));
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
              Manajemen Peran & Hak Akses
            </h3>
            <p className="text-xs text-neutral-500">
              Kelola peran staf dan hak akses fitur sesuai kebutuhan operasional outlet Anda.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-neutral-500 font-medium">
            Total {roles.length} Peran
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
          <p className="text-xs text-neutral-400">Memuat daftar peran...</p>
        </div>
      ) : roles.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-neutral-200 rounded-xl bg-white">
          <ShieldCheck className="size-8 text-neutral-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-neutral-700">Belum ada peran yang dibuat</p>
          <p className="text-xs text-neutral-400 mt-1">Gunakan tombol Tambah Peran untuk membuat peran baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((r) => {
            const pages = r.accessiblePages || [];
            const accessiblePages = pages.filter((p) => p.is_accessible);
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

                  {/* Accessible Pages Counter Badge from Database */}
                  <div className="mb-3.5 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-neutral-50 border border-neutral-100 text-xs">
                    <span className="text-[11px] font-semibold text-neutral-600 flex items-center gap-1.5">
                      <LayoutGrid className="size-3.5 text-neutral-400" />
                      Akses Halaman
                    </span>
                    <span className="font-bold text-[#FF5C38] text-[11px]">
                      {accessibleCount} / {pages.length} Halaman
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
                    (selectedRole.accessiblePages || []).filter((p) =>
                      checkPageAccessibility(p, selectedRole.name, editSelectedPermNames)
                    ).length
                  }
                  /{(selectedRole.accessiblePages || []).length}
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
                <span>Izin Modul Detail</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-neutral-100 text-neutral-600 font-bold">
                  {selectedRole.name === 'Owner' ? 'Akses Penuh' : `${editSelectedPermNames.length} Izin`}
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
                      Semua Halaman ({(selectedRole.accessiblePages || []).length})
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
                        (selectedRole.accessiblePages || []).filter((p) =>
                          checkPageAccessibility(p, selectedRole.name, editSelectedPermNames)
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
                        (selectedRole.accessiblePages || []).filter(
                          (p) =>
                            !checkPageAccessibility(p, selectedRole.name, editSelectedPermNames)
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

                {/* Page Cards from database */}
                <div className="max-h-[380px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {(selectedRole.accessiblePages || [])
                      .filter((page) => {
                        const isAccessible = checkPageAccessibility(
                          page,
                          selectedRole.name,
                          editSelectedPermNames
                        );
                        if (pageFilter === 'accessible') return isAccessible;
                        if (pageFilter === 'locked') return !isAccessible;
                        return true;
                      })
                      .map((page) => {
                        const isAccessible = checkPageAccessibility(
                          page,
                          selectedRole.name,
                          editSelectedPermNames
                        );
                        const IconComponent = PAGE_ICON_MAP[page.id] || LayoutGrid;

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

                            <div className="flex flex-wrap gap-1 pt-1 border-t border-neutral-100">
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-500 font-mono">
                                Izin: {page.required_permissions.join(', ')}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: GRANULAR RBAC PERMISSIONS CHECKLIST FROM DATABASE */}
            {modalActiveTab === 'permissions' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-neutral-800">
                    Daftar Hak Akses Modul:
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
                              editSelectedPermNames.includes(p.name) ||
                              editSelectedPermNames.includes(p.id);
                            return (
                              <button
                                type="button"
                                key={p.id}
                                onClick={() => handleToggleEditPerm(p.name)}
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
                                  <p className="font-semibold text-[11px] leading-tight truncate font-mono">
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
                  <p className="text-xs text-neutral-400">Tidak ada izin tersedia.</p>
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
        subtitle="Buat peran baru dan tentukan hak akses fiturnya."
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
              Simpan Peran
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
              Pilih Hak Akses:
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
                              <p className="font-semibold text-[11px] leading-tight truncate font-mono">
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
