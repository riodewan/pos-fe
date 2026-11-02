'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Building2,
  ShieldCheck,
  Edit2,
  Trash2,
  X,
  KeyRound,
  Store,
  CheckCircle2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  adminService,
  PlatformUserItem,
  PlatformTenantItem,
  CreatePlatformUserPayload,
} from '@/services/admin.service';
import { Button } from '@/components/common/Button';
import { Pagination, DEFAULT_PAGE_SIZE_OPTIONS } from '@/components/common';
import { useToast } from '@/context/ToastContext';

const ROLE_OPTIONS = [
  { value: 'Owner', label: 'Owner (Pemilik Bisnis)' },
  { value: 'Manager', label: 'Manager (Manajer Toko)' },
  { value: 'Kasir', label: 'Kasir (POS & Pembayaran)' },
  { value: 'Inventory', label: 'Inventory / Gudang' },
  { value: 'Dapur', label: 'Dapur / Kitchen (KDS)' },
  { value: 'Barista', label: 'Barista' },
  { value: 'Server', label: 'Server / Pelayan Meja' },
];

export default function AdminUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<PlatformUserItem[]>([]);
  const [tenantsList, setTenantsList] = useState<PlatformTenantItem[]>([]);
  const [selectedTenantStores, setSelectedTenantStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'MITRA' | 'UNASSIGNED' | 'INTERNAL'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_OPTIONS[0]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Create User Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createForm, setCreateForm] = useState<CreatePlatformUserPayload>({
    account_mode: 'EXISTING_TENANT',
    name: '',
    email: '',
    password: 'Password123!',
    phone: '',
    job_title: '',
    tenant_id: '',
    role_name: 'Owner',
    store_id: '',
    tenant_name: '',
    tenant_address: '',
    store_name: '',
    store_code: 'PUSAT-01',
  });

  // Edit User Modal State
  const [editingUser, setEditingUser] = useState<PlatformUserItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    job_title: '',
    password: '',
    is_active: true,
    tenant_id: '',
    role_name: 'Owner',
    store_id: '',
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({
        search: search.trim() || undefined,
        filter_type: filterType,
        page: currentPage,
        per_page: pageSize,
      });

      if (res?.data) {
        setUsers(res.data.data || []);
        setCurrentPage(res.data.current_page || 1);
        setTotalPages(res.data.last_page || 1);
        setTotalItems(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load platform users:', err);
      toast.error('Gagal memuat daftar akun pengguna.');
    } finally {
      setLoading(false);
    }
  }, [search, filterType, currentPage, pageSize, toast]);

  const fetchTenantsDropdown = useCallback(async () => {
    try {
      const res = await adminService.getTenants({ per_page: 100 });
      if (res?.data?.data) {
        setTenantsList(res.data.data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchTenantsDropdown();
  }, [fetchTenantsDropdown]);

  // Load stores when a tenant is selected in create/edit form
  const loadStoresForTenant = async (tenantId: string) => {
    if (!tenantId) {
      setSelectedTenantStores([]);
      return;
    }
    try {
      const res = await adminService.getTenant(tenantId);
      if (res?.data?.stores) {
        setSelectedTenantStores(res.data.stores);
      } else {
        setSelectedTenantStores([]);
      }
    } catch {
      setSelectedTenantStores([]);
    }
  };

  const handleOpenCreateModal = () => {
    const defaultTenantId = tenantsList[0]?.id || '';
    setCreateForm({
      account_mode: tenantsList.length > 0 ? 'EXISTING_TENANT' : 'NEW_TENANT',
      name: '',
      email: '',
      password: 'Password123!',
      phone: '',
      job_title: '',
      tenant_id: defaultTenantId,
      role_name: 'Owner',
      store_id: '',
      tenant_name: '',
      tenant_address: '',
      store_name: '',
      store_code: 'PUSAT-01',
    });
    if (defaultTenantId) {
      loadStoresForTenant(defaultTenantId);
    }
    setIsCreateModalOpen(true);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim() || !createForm.email.trim() || !createForm.password.trim()) {
      toast.error('Nama, email, dan kata sandi wajib diisi.');
      return;
    }
    if (createForm.account_mode === 'EXISTING_TENANT' && !createForm.tenant_id) {
      toast.error('Pilih mitra/tenant tujuan terlebih dahulu.');
      return;
    }
    if (createForm.account_mode === 'NEW_TENANT' && !createForm.tenant_name?.trim()) {
      toast.error('Nama brand bisnis baru wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminService.createUser(createForm);
      toast.success('Akun pengguna berhasil dibuat dan siap digunakan login!');
      setIsCreateModalOpen(false);
      fetchUsers();
      fetchTenantsDropdown();
    } catch (err: any) {
      toast.error(err.message || 'Gagal membuat akun pengguna.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = (u: PlatformUserItem) => {
    const primaryMembership = u.tenants?.[0];
    setEditingUser(u);
    setEditForm({
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      job_title: u.job_title || '',
      password: '',
      is_active: u.is_active,
      tenant_id: primaryMembership?.id || '',
      role_name: primaryMembership?.role || 'Owner',
      store_id: primaryMembership?.store_id || '',
    });
    if (primaryMembership?.id) {
      loadStoresForTenant(primaryMembership.id);
    } else {
      setSelectedTenantStores([]);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setIsSubmitting(true);
      await adminService.updateUser(editingUser.id, {
        name: editForm.name.trim(),
        email: editForm.email.trim(),
        phone: editForm.phone.trim() || undefined,
        job_title: editForm.job_title.trim() || undefined,
        password: editForm.password.trim() || undefined,
        is_active: editForm.is_active,
        tenant_id: editForm.tenant_id || undefined,
        role_name: editForm.tenant_id ? editForm.role_name : undefined,
        store_id: editForm.tenant_id ? editForm.store_id || undefined : undefined,
      });
      toast.success('Data akun pengguna berhasil diperbarui!');
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui akun pengguna.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (u: PlatformUserItem) => {
    try {
      await adminService.toggleUserStatus(u.id);
      toast.success(
        `Status akun "${u.name}" diubah menjadi ${!u.is_active ? 'Aktif' : 'Nonaktif'}.`
      );
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status akun.');
    }
  };

  const handleDeleteUser = async (u: PlatformUserItem) => {
    if (!window.confirm(`Yakin ingin menghapus akun "${u.name} (${u.email})"?`)) return;
    try {
      await adminService.deleteUser(u.id);
      toast.success(`Akun "${u.name}" berhasil dihapus.`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus akun pengguna.');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Users className="size-6 text-[#FF5C38]" />
            <span>Kelola Akun Pengguna & Mitra</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Buat akun login langsung untuk Mitra (Owner/Manager/Staf Toko), reset kata sandi, atau atur penugasan mitra.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={handleOpenCreateModal}
          className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-4 py-2.5 rounded-xl shadow-xs text-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="size-4" />
          <span>Buat Akun Pengguna / Mitra</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="size-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama pengguna, email login, no. telepon, atau nama brand mitra..."
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF5C38] transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { value: 'ALL', label: 'Semua Akun' },
            { value: 'MITRA', label: 'Akun Mitra & Toko' },
            { value: 'UNASSIGNED', label: 'Belum Terkait Toko (KYB)' },
            { value: 'INTERNAL', label: 'Admin Internal' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setFilterType(tab.value as any);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterType === tab.value
                  ? 'bg-[#FF5C38] text-white shadow-2xs'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-500 text-xs">
            Memuat daftar akun pengguna...
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-xs space-y-2">
            <Users className="size-10 text-neutral-300 mx-auto" />
            <p className="font-bold text-neutral-700">Tidak ada akun pengguna ditemukan.</p>
            <p>Klik tombol &ldquo;Buat Akun Pengguna / Mitra&rdquo; di kanan atas untuk menambahkan akun baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/80 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nama & Email Login</th>
                  <th className="py-3.5 px-4">Mitra / Brand Toko</th>
                  <th className="py-3.5 px-4">Peran (Role) & Outlet</th>
                  <th className="py-3.5 px-4">Status Akun</th>
                  <th className="py-3.5 px-4">Tgl Dibuat</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-neutral-900 text-sm">{u.name}</p>
                      <p className="text-[11px] text-neutral-600 font-mono">{u.email}</p>
                      {u.phone && <p className="text-[10.5px] text-neutral-400">{u.phone}</p>}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.is_internal ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[11px]">
                          <ShieldCheck className="size-3.5 text-purple-600" />
                          Platform Internal
                        </span>
                      ) : u.tenants && u.tenants.length > 0 ? (
                        <div className="space-y-1">
                          {u.tenants.map((t) => (
                            <div key={t.id} className="flex items-center gap-1.5">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200/80 font-bold text-[11px]">
                                <Building2 className="size-3.5 text-[#FF5C38]" />
                                {t.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-semibold">
                          Belum Terkait Toko (Siap KYB)
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {u.is_internal ? (
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10.5px] font-bold">
                          SUPER ADMIN
                        </span>
                      ) : u.tenants && u.tenants.length > 0 ? (
                        <div className="space-y-1">
                          {u.tenants.map((t) => (
                            <div key={t.id} className="flex flex-wrap items-center gap-1.5">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 text-[10.5px] font-bold">
                                {t.role}
                              </span>
                              <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                                <Store className="size-3 text-neutral-400" />
                                {t.store_name || 'Semua Outlet'}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-neutral-400 text-[11px]">Calon Owner Mitra</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(u)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border cursor-pointer transition-colors ${
                          u.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-neutral-100 text-neutral-500 border-neutral-200 hover:bg-neutral-200'
                        }`}
                        title="Klik untuk ubah status aktif"
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            u.is_active ? 'bg-emerald-500' : 'bg-neutral-400'
                          }`}
                        />
                        {u.is_active ? 'AKTIF' : 'NONAKTIF'}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-neutral-500">
                      {new Date(u.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(u)}
                          className="px-2.5 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          title="Edit Akun / Reset Password / Tautkan Mitra"
                        >
                          <Edit2 className="size-3.5 text-neutral-500" />
                          <span>Edit & Password</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 rounded-xl border border-red-200 bg-red-50/50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                          title="Hapus Akun"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Standardized Pagination */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/40">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Modal: Buat Akun Pengguna / Mitra Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-xl border border-neutral-200 text-neutral-900 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <UserPlus className="size-5 text-[#FF5C38]" />
                Buat Akun Pengguna / Mitra Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              {/* Pilih Mode Pembuatan Akun */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  1. Pilih Jenis Akun yang Akan Diberikan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'EXISTING_TENANT',
                      title: 'Tautkan ke Mitra yang Ada',
                      desc: 'Tambahkan Owner/Manager/Kasir ke brand mitra yang sudah terdaftar',
                    },
                    {
                      id: 'NEW_TENANT',
                      title: 'Mitra + Brand Toko Baru',
                      desc: 'Buatkan akun Owner sekaligus Brand & Outlet aktif siap pakai',
                    },
                    {
                      id: 'UNASSIGNED_MITRA',
                      title: 'Akun Mitra Baru (Isi KYB)',
                      desc: 'Berikan akun ke mitra agar mengisi registrasi bisnis (KYB) sendiri',
                    },
                    {
                      id: 'INTERNAL_ADMIN',
                      title: 'Admin Internal Platform',
                      desc: 'Akun pengelola portal internal NemuPOS Hub',
                    },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() =>
                        setCreateForm({
                          ...createForm,
                          account_mode: m.id as CreatePlatformUserPayload['account_mode'],
                        })
                      }
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        createForm.account_mode === m.id
                          ? 'border-[#FF5C38] bg-orange-50/70 ring-1 ring-[#FF5C38]'
                          : 'border-neutral-200 bg-white hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900">{m.title}</span>
                        {createForm.account_mode === m.id && (
                          <CheckCircle2 className="size-4 text-[#FF5C38] shrink-0" />
                        )}
                      </div>
                      <p className="text-[10.5px] text-neutral-500 mt-1 leading-snug">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Kredensial Login */}
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  2. Kredensial Login Pengguna
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Nama Lengkap Pengguna *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Andi Wijaya"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Email Login *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="andi@mitratoko.com"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Kata Sandi Login *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={createForm.password}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, password: e.target.value })
                        }
                        className="w-full bg-white border border-neutral-200 rounded-xl pl-3 pr-9 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="size-3.5" />
                        ) : (
                          <Eye className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      No. WhatsApp / Telepon
                    </label>
                    <input
                      type="text"
                      placeholder="0812-3456-7890"
                      value={createForm.phone || ''}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                </div>
              </div>

              {/* Konfigurasi Khusus Mode EXISTING_TENANT */}
              {createForm.account_mode === 'EXISTING_TENANT' && (
                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    3. Penugasan Mitra & Hak Akses Role
                  </h4>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Pilih Mitra / Brand Bisnis *
                    </label>
                    <select
                      required
                      value={createForm.tenant_id || ''}
                      onChange={(e) => {
                        const tid = e.target.value;
                        setCreateForm({ ...createForm, tenant_id: tid, store_id: '' });
                        loadStoresForTenant(tid);
                      }}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    >
                      <option value="">-- Pilih Mitra / Tenant --</option>
                      {tenantsList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.email}) - [{t.status}]
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Peran / Role di Toko *
                      </label>
                      <select
                        value={createForm.role_name || 'Owner'}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, role_name: e.target.value })
                        }
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Penempatan Outlet Cabang
                      </label>
                      <select
                        value={createForm.store_id || ''}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, store_id: e.target.value })
                        }
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                      >
                        <option value="">Semua Outlet (Akses Global Tenant)</option>
                        {selectedTenantStores.map((s: any) => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.code || 'Outlet'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Konfigurasi Khusus Mode NEW_TENANT */}
              {createForm.account_mode === 'NEW_TENANT' && (
                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    3. Informasi Brand & Outlet Mitra Baru
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Nama Brand Bisnis *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Kopi Kenangan Senja"
                        value={createForm.tenant_name || ''}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, tenant_name: e.target.value })
                        }
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Nama Outlet Perdana
                      </label>
                      <input
                        type="text"
                        placeholder="Otomatis jika dikosongkan"
                        value={createForm.store_name || ''}
                        onChange={(e) =>
                          setCreateForm({ ...createForm, store_name: e.target.value })
                        }
                        className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Alamat Toko / Bisnis
                    </label>
                    <input
                      type="text"
                      placeholder="Jl. Sudirman No. 12, Jakarta"
                      value={createForm.tenant_address || ''}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, tenant_address: e.target.value })
                      }
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-xs border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs px-5 font-bold"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Buat Akun Sekarang'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Akun / Reset Password / Tautkan Mitra */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-neutral-200 text-neutral-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Edit2 className="size-4 text-[#FF5C38]" />
                  Edit Akun & Penugasan Mitra
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">{editingUser.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Login *
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    No. Telepon
                  </label>
                  <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1 flex items-center gap-1">
                    <KeyRound className="size-3 text-[#FF5C38]" />
                    Reset Kata Sandi (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Isi jika ingin ganti password"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                  />
                </div>
              </div>

              {!editingUser.is_internal && (
                <div className="space-y-3 pt-3 border-t border-neutral-100">
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                    Penugasan Mitra / Brand Toko
                  </h4>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Tautkan / Pindahkan ke Mitra
                    </label>
                    <select
                      value={editForm.tenant_id}
                      onChange={(e) => {
                        const tid = e.target.value;
                        setEditForm({ ...editForm, tenant_id: tid, store_id: '' });
                        loadStoresForTenant(tid);
                      }}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    >
                      <option value="">-- Belum Terkait Mitra --</option>
                      {tenantsList.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.email})
                        </option>
                      ))}
                    </select>
                  </div>

                  {editForm.tenant_id && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Peran / Role di Toko
                        </label>
                        <select
                          value={editForm.role_name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, role_name: e.target.value })
                          }
                          className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                        >
                          {ROLE_OPTIONS.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          Outlet Cabang
                        </label>
                        <select
                          value={editForm.store_id}
                          onChange={(e) =>
                            setEditForm({ ...editForm, store_id: e.target.value })
                          }
                          className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                        >
                          <option value="">Semua Outlet</option>
                          {selectedTenantStores.map((s: any) => (
                            <option key={s.id} value={s.id}>
                              {s.name} ({s.code || 'Outlet'})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingUser(null)}
                  className="text-xs border-neutral-200 text-neutral-700 hover:bg-neutral-50"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs px-5 font-bold"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

