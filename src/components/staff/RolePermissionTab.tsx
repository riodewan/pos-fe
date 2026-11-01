'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  Loader2,
  Check,
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
  const [editDescription, setEditDescription] = useState('');
  const [editSelectedPermIds, setEditSelectedPermIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Add Role Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [newRolePermIds, setNewRolePermIds] = useState<string[]>([]);

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
  const permissionsByModule = React.useMemo(() => {
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
              Setiap anggota staf memiliki peran dengan izin modul yang telah disesuaikan agar operasional berjalan aman.
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
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {r.permissions.slice(0, 6).map((p, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs text-neutral-700"
                      >
                        <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{p}</span>
                      </div>
                    ))}
                    {r.permissions.length > 6 && (
                      <p className="text-[11px] text-neutral-400 pl-5">
                        +{r.permissions.length - 6} izin lainnya...
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-[11px] text-neutral-400">
                  {r.name === 'Owner' ? 'Akses permanen sistem' : 'Dapat disesuaikan'}
                </span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => handleOpenEdit(r)}
                  leftIcon={<Edit3 className="size-3" />}
                >
                  Detail Izin
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Role Detail / Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={selectedRole ? `Detail & Atur Izin: ${selectedRole.name}` : 'Detail Peran'}
        size="lg"
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
              <Button
                variant="primary"
                size="sm"
                className="bg-[#FF5C38] hover:bg-[#E04B28]"
                onClick={handleSaveEdit}
                isLoading={isSaving}
              >
                Simpan Perubahan
              </Button>
            </div>
          </div>
        }
      >
        {selectedRole && (
          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Deskripsi Peran
              </label>
              <Input
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Contoh: Menangani pesanan dan kasir POS"
                className="text-xs"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-neutral-800">
                  Daftar Hak Akses & Izin Fitur:
                </p>
                {selectedRole.name === 'Owner' && (
                  <span className="text-[11px] text-amber-600 font-medium">
                    Owner memiliki izin penuh ke seluruh modul sistem.
                  </span>
                )}
              </div>

              {masterPermissions.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1 border border-neutral-200/80 rounded-lg p-3 bg-neutral-50/50">
                  {Object.entries(permissionsByModule).map(([mod, perms]) => (
                    <div key={mod} className="space-y-1.5">
                      <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
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
                              className={`flex items-start gap-2.5 p-2 rounded-md border text-left text-xs transition-colors ${
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
          </div>
        )}
      </Modal>

      {/* Add Role Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Peran Staf Baru"
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
        <form onSubmit={handleCreateRole} className="space-y-4 py-2">
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
              Pilih Hak Akses & Izin:
            </p>
            {masterPermissions.length > 0 ? (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 border border-neutral-200/80 rounded-lg p-3 bg-neutral-50/50">
                {Object.entries(permissionsByModule).map(([mod, perms]) => (
                  <div key={mod} className="space-y-1.5">
                    <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
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
                            className={`flex items-start gap-2.5 p-2 rounded-md border text-left text-xs transition-colors cursor-pointer ${
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
