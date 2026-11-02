'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  Search,
  Eye,
  Store,
  Users,
  X,
  Percent,
  CheckCircle2,
} from 'lucide-react';
import { adminService, PlatformTenantItem } from '@/services/admin.service';
import { Button } from '@/components/common/Button';
import { Pagination, DEFAULT_PAGE_SIZE_OPTIONS } from '@/components/common';
import { useToast } from '@/context/ToastContext';
import { formatRupiah } from '@/utils';

export default function AdminTenantsPage() {
  const { toast } = useToast();
  const [tenants, setTenants] = useState<PlatformTenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_OPTIONS[0]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<PlatformTenantItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inline Add User inside Tenant Detail Modal
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    phone: '',
    role_name: 'Owner',
    store_id: '',
  });
  const [isAddingUser, setIsAddingUser] = useState(false);

  // Create Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    owner_name: '',
    owner_email: '',
    owner_password: 'Password123!',
    store_name: '',
    store_code: '',
    platform_fee_percentage: 2.5,
    tax_percentage: 10,
  });

  // Per-Mitra Payment Fee & Tax Edit State inside Detail Modal
  const [feeForm, setFeeForm] = useState({
    platform_fee_percentage: 0,
    tax_percentage: 10,
  });
  const [isSavingFees, setIsSavingFees] = useState(false);

  const fetchTenants = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getTenants({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        page: currentPage,
        per_page: pageSize,
      });

      if (res?.data) {
        setTenants(res.data.data || []);
        setCurrentPage(res.data.current_page || 1);
        setTotalPages(res.data.last_page || 1);
        setTotalItems(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load tenants:', err);
      toast.error('Gagal memuat daftar tenant.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, currentPage, pageSize, toast]);

  useEffect(() => {
    fetchTenants();
  }, [fetchTenants]);

  const handleOpenDetail = async (tenantId: string) => {
    try {
      setDetailLoading(true);
      setIsDetailModalOpen(true);
      setShowAddUserForm(false);
      const res = await adminService.getTenant(tenantId);
      if (res?.data) {
        setSelectedTenant(res.data);
        setFeeForm({
          platform_fee_percentage: Number(res.data.platform_fee_percentage ?? 0),
          tax_percentage: Number(res.data.tax_percentage ?? 10),
        });
      }
    } catch (err) {
      toast.error('Gagal memuat detail tenant.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSaveTenantFees = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    try {
      setIsSavingFees(true);
      const res = await adminService.updateTenant(selectedTenant.id, {
        platform_fee_percentage: Number(feeForm.platform_fee_percentage) || 0,
        tax_percentage: Number(feeForm.tax_percentage) || 0,
      });
      if (res?.data) {
        setSelectedTenant({
          ...selectedTenant,
          platform_fee_percentage: res.data.platform_fee_percentage,
          tax_percentage: res.data.tax_percentage,
        });
      }
      toast.success(
        `Pengaturan komisi platform (${feeForm.platform_fee_percentage}%) & pajak (${feeForm.tax_percentage}%) untuk ${selectedTenant.name} berhasil disimpan!`
      );
      fetchTenants();
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menyimpan pengaturan biaya mitra.');
    } finally {
      setIsSavingFees(false);
    }
  };

  const handleAddUserToTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    if (!newUserForm.name.trim() || !newUserForm.email.trim() || !newUserForm.password.trim()) {
      toast.error('Nama, email, dan kata sandi wajib diisi.');
      return;
    }

    try {
      setIsAddingUser(true);
      await adminService.createUser({
        account_mode: 'EXISTING_TENANT',
        tenant_id: selectedTenant.id,
        name: newUserForm.name.trim(),
        email: newUserForm.email.trim(),
        password: newUserForm.password.trim(),
        phone: newUserForm.phone.trim() || undefined,
        role_name: newUserForm.role_name,
        store_id: newUserForm.store_id || undefined,
      });
      toast.success(`Akun "${newUserForm.name}" berhasil ditambahkan ke ${selectedTenant.name}!`);
      setNewUserForm({
        name: '',
        email: '',
        password: 'Password123!',
        phone: '',
        role_name: 'Owner',
        store_id: '',
      });
      setShowAddUserForm(false);
      // Reload tenant detail & table
      const res = await adminService.getTenant(selectedTenant.id);
      if (res?.data) {
        setSelectedTenant(res.data);
      }
      fetchTenants();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambahkan akun ke tenant.');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleToggleStatus = async (tenant: PlatformTenantItem) => {
    const nextStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const actionLabel = nextStatus === 'ACTIVE' ? 'mengaktifkan kembali' : 'menangguhkan (suspend)';
    if (!window.confirm(`Yakin ingin ${actionLabel} tenant "${tenant.name}"?`)) return;

    try {
      await adminService.updateTenantStatus(tenant.id, nextStatus);
      toast.success(`Status tenant "${tenant.name}" diubah menjadi ${nextStatus}.`);
      fetchTenants();
      if (selectedTenant && selectedTenant.id === tenant.id) {
        setSelectedTenant({ ...selectedTenant, status: nextStatus });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal mengubah status tenant.');
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.owner_name.trim() ||
      !formData.owner_email.trim()
    ) {
      toast.error('Harap lengkapi semua field wajib.');
      return;
    }

    try {
      setIsSubmitting(true);
      await adminService.createTenant(formData);
      toast.success('Tenant baru dan akun owner berhasil didaftarkan!');
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        owner_name: '',
        owner_email: '',
        owner_password: 'Password123!',
        store_name: '',
        store_code: '',
        platform_fee_percentage: 2.5,
        tax_percentage: 10,
      });
      fetchTenants();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal membuat tenant baru.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Building2 className="size-6 text-[#FF5C38]" />
            <span>Mitra Bisnis & Toko</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Daftar seluruh entitas bisnis/merchant yang terdaftar di sistem SaaS NemuPOS.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-4 py-2.5 rounded-xl shadow-xs text-xs flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="size-4 stroke-[3]" />
          <span>Daftarkan Tenant Baru</span>
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="size-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama brand, email, atau slug tenant..."
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF5C38] transition-colors"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { value: '', label: 'Semua Status' },
            { value: 'ACTIVE', label: 'Aktif' },
            { value: 'PENDING', label: 'Pending KYB' },
            { value: 'SUSPENDED', label: 'Suspended' },
            { value: 'INACTIVE', label: 'Non-Aktif' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatusFilter(tab.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-[#FF5C38] text-white shadow-2xs'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-500 text-xs">
            Memuat data tenant...
          </div>
        ) : tenants.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-xs space-y-2">
            <Building2 className="size-10 text-neutral-300 mx-auto" />
            <p className="font-bold text-neutral-700">Tidak ada tenant ditemukan.</p>
            <p>Coba gunakan kata kunci pencarian atau filter status yang berbeda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/80 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Nama Brand / Tenant</th>
                  <th className="py-3.5 px-4">Email Kontak</th>
                  <th className="py-3.5 px-4">Jumlah Outlet</th>
                  <th className="py-3.5 px-4">Total Staff</th>
                  <th className="py-3.5 px-4">Tarif Komisi & Pajak</th>
                  <th className="py-3.5 px-4">Status Akun</th>
                  <th className="py-3.5 px-4">Tgl Daftar</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-neutral-900 text-sm">{t.name}</p>
                      <p className="text-[10.5px] text-neutral-400 font-mono">ID: {t.id}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-600">
                      {t.email}
                      {t.phone && (
                        <p className="text-[10px] text-neutral-400 font-sans">{t.phone}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-700">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-100">
                        <Store className="size-3.5 text-[#FF5C38]" />
                        {t.stores_count ?? 1} Outlet
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-700">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                        <Users className="size-3.5 text-blue-600" />
                        {t.tenant_users_count ?? 1} Staff
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-orange-50 text-[#FF5C38] border border-orange-200/80 text-[10.5px] font-bold">
                          Komisi: {Number(t.platform_fee_percentage ?? 0)}%
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10.5px] font-bold">
                          Pajak: {Number(t.tax_percentage ?? 10)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          t.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : t.status === 'PENDING'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : t.status === 'SUSPENDED'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500">
                      {new Date(t.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(t.id)}
                          className="px-2.5 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                          title="Lihat Detail"
                        >
                          <Eye className="size-3.5 text-neutral-500" />
                          <span>Detail</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(t)}
                          className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-colors cursor-pointer border ${
                            t.status === 'ACTIVE'
                              ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {t.status === 'ACTIVE' ? 'Suspend' : 'Aktifkan'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Global Standardized Pagination */}
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

      {/* Modal: Tambah Tenant Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-neutral-200 text-neutral-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <Building2 className="size-5 text-[#FF5C38]" />
                Daftarkan Tenant Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-xs text-orange-800">
                Membuat tenant baru akan otomatis membuat akun Owner, hak akses, dan outlet utama perdana.
              </div>

              {/* Detail Bisnis */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Informasi Brand / Merchant
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Nama Brand *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kopi Senja"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Email Bisnis *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="halo@kopisenja.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      No. Telepon Bisnis
                    </label>
                    <input
                      type="text"
                      placeholder="0812-3456-7890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Alamat Kantor Pusat
                    </label>
                    <input
                      type="text"
                      placeholder="Jakarta Selatan"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                </div>
              </div>

              {/* Akun Owner */}
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Kredensial Akun Owner
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Nama Lengkap Owner *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Budi Santoso"
                      value={formData.owner_name}
                      onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Email Login Owner *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="budi@kopisenja.com"
                      value={formData.owner_email}
                      onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Kata Sandi Default
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.owner_password}
                    onChange={(e) => setFormData({ ...formData, owner_password: e.target.value })}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                  />
                  <p className="text-[10.5px] text-neutral-500 mt-1">
                    Owner dapat mengganti kata sandi setelah berhasil login perdana.
                  </p>
                </div>
              </div>

              {/* Outlet Perdana */}
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Outlet Perdana
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Nama Outlet (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Outlet Senopati"
                      value={formData.store_name}
                      onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Kode Cabang (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="SNP-01"
                      value={formData.store_code}
                      onChange={(e) => setFormData({ ...formData, store_code: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                </div>
              </div>

              {/* Pengaturan Komisi Platform & Pajak Per-Mitra */}
              <div className="space-y-3 pt-2 border-t border-neutral-100">
                <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Percent className="size-3.5 text-[#FF5C38]" />
                  <span>Pengaturan Komisi Platform (Payment) & Pajak</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Potongan / Biaya Platform (%) *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.platform_fee_percentage}
                      onChange={(e) =>
                        setFormData({ ...formData, platform_fee_percentage: Number(e.target.value) })
                      }
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Persentase biaya layanan / payment gateway khusus mitra ini.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Pajak Transaksi Default (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={formData.tax_percentage}
                      onChange={(e) =>
                        setFormData({ ...formData, tax_percentage: Number(e.target.value) })
                      }
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Dapat disesuaikan kembali oleh mitra di Pengaturan Outlet.
                    </p>
                  </div>
                </div>
              </div>

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
                  className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs px-5"
                >
                  {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Tenant'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detail Tenant */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-xl border border-neutral-200 text-neutral-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
                  <Building2 className="size-5 text-[#FF5C38]" />
                  <span>{selectedTenant?.name || 'Detail Tenant'}</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  ID: <span className="font-mono text-neutral-700">{selectedTenant?.id}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12 text-center text-xs text-neutral-500">
                Memuat rincian data tenant...
              </div>
            ) : selectedTenant ? (
              <div className="space-y-5 text-xs">
                {/* Meta Header Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Status</span>
                    <p
                      className={`font-bold mt-1 ${
                        selectedTenant.status === 'ACTIVE'
                          ? 'text-emerald-600'
                          : selectedTenant.status === 'PENDING'
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {selectedTenant.status}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Email</span>
                    <p className="font-mono font-bold text-neutral-900 mt-1 truncate">
                      {selectedTenant.email}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">
                      Telepon
                    </span>
                    <p className="font-bold text-neutral-900 mt-1">
                      {selectedTenant.phone || '-'}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">
                      Terdaftar
                    </span>
                    <p className="font-bold text-neutral-900 mt-1">
                      {new Date(selectedTenant.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Ringkasan Pembagian Dana Transaksi (Hak Platform vs Hak Mitra) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200">
                    <span className="text-[10.5px] text-[#FF5C38] font-bold uppercase">
                      Pendapatan Komisi Platform (Kita)
                    </span>
                    <p className="text-base font-extrabold text-[#FF5C38] mt-1 font-mono">
                      {formatRupiah(selectedTenant.platform_revenue ?? 0)}
                    </p>
                    <p className="text-[10px] text-orange-800/80 mt-0.5">
                      Biaya layanan platform dari {selectedTenant.total_orders_completed ?? 0} transaksi
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
                    <span className="text-[10.5px] text-emerald-700 font-bold uppercase">
                      Hak Bersih Mitra (Termasuk Pajak)
                    </span>
                    <p className="text-base font-extrabold text-emerald-700 mt-1 font-mono">
                      {formatRupiah(selectedTenant.merchant_net_revenue ?? 0)}
                    </p>
                    <p className="text-[10px] text-emerald-700/80 mt-0.5">
                      Termasuk pajak toko {formatRupiah(selectedTenant.tax_collected ?? 0)}
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200">
                    <span className="text-[10.5px] text-neutral-500 font-bold uppercase">
                      Total GMV Transaksi Customer
                    </span>
                    <p className="text-base font-bold text-neutral-900 mt-1 font-mono">
                      {formatRupiah(selectedTenant.total_gmv ?? 0)}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Total dibayarkan oleh pelanggan
                    </p>
                  </div>
                </div>

                {/* Pengaturan Persentase Payment / Komisi Platform & Pajak per Mitra */}
                <form
                  onSubmit={handleSaveTenantFees}
                  className="p-4 rounded-xl bg-orange-50/50 border border-orange-200/80 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-neutral-900 flex items-center gap-1.5 text-xs">
                        <Percent className="size-4 text-[#FF5C38]" />
                        <span>Pengaturan Persentase Komisi Platform (Payment) & Pajak Mitra</span>
                      </h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        Atur persentase biaya layanan / payment gateway khusus untuk mitra ini serta besaran pajak transaksi customer.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="bg-white p-3 rounded-xl border border-neutral-200">
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Potongan / Biaya Platform Mitra (%)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={feeForm.platform_fee_percentage}
                          onChange={(e) =>
                            setFeeForm({
                              ...feeForm,
                              platform_fee_percentage: Math.max(0, Number(e.target.value)),
                            })
                          }
                          className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                        />
                        <span className="text-xs font-bold text-neutral-500">%</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        Diterapkan otomatis pada setiap transaksi pembayaran customer & perhitungan settlement mitra.
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-neutral-200">
                      <label className="block text-[11px] font-bold text-neutral-700 mb-1">
                        Pajak Transaksi Customer (%)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={feeForm.tax_percentage}
                          onChange={(e) =>
                            setFeeForm({
                              ...feeForm,
                              tax_percentage: Math.max(0, Number(e.target.value)),
                            })
                          }
                          className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs font-bold text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                        />
                        <span className="text-xs font-bold text-neutral-500">%</span>
                      </div>
                      <p className="text-[10px] text-neutral-400 mt-1">
                        Persentase pajak (PB1 / PPN) yang ditambahkan pada tagihan pembayaran customer.
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <Button
                      type="submit"
                      variant="primary"
                      size="xs"
                      disabled={isSavingFees}
                      className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold text-xs px-4 py-2 rounded-lg"
                      leftIcon={<CheckCircle2 className="size-3.5" />}
                    >
                      {isSavingFees ? 'Menyimpan...' : 'Simpan Pengaturan Biaya Mitra'}
                    </Button>
                  </div>
                </form>

                {/* Outlets List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Store className="size-4 text-[#FF5C38]" />
                    <span>Daftar Outlet ({selectedTenant.stores?.length || 0})</span>
                  </h4>
                  <div className="rounded-xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
                    {selectedTenant.stores && selectedTenant.stores.length > 0 ? (
                      selectedTenant.stores.map((s: any) => (
                        <div
                          key={s.id}
                          className="p-3 flex items-center justify-between bg-white hover:bg-neutral-50/60"
                        >
                          <div>
                            <p className="font-bold text-neutral-900">{s.name}</p>
                            <p className="text-[10.5px] text-neutral-500 font-mono">
                              Kode: {s.code || '-'} | {s.address || 'Alamat belum diatur'}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {s.status || 'ACTIVE'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-neutral-400">
                        Belum ada outlet terdaftar.
                      </div>
                    )}
                  </div>
                </div>

                {/* Tenant Users */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="size-4 text-blue-600" />
                      <span>
                        Staf & Akses Terdaftar ({selectedTenant.tenant_users?.length || 0})
                      </span>
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowAddUserForm(!showAddUserForm)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FF5C38] hover:bg-[#E04B28] text-white text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      <Plus className="size-3 stroke-[3]" />
                      <span>{showAddUserForm ? 'Tutup Form' : 'Tambah Akun User'}</span>
                    </button>
                  </div>

                  {showAddUserForm && (
                    <form
                      onSubmit={handleAddUserToTenant}
                      className="p-3.5 rounded-xl bg-orange-50/60 border border-orange-200 space-y-3 animate-in fade-in"
                    >
                      <p className="text-[11px] font-bold text-neutral-800">
                        Tambahkan Akun Login Baru ke Mitra &ldquo;{selectedTenant.name}&rdquo;
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                            Nama Lengkap *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Nama Owner / Staf"
                            value={newUserForm.name}
                            onChange={(e) =>
                              setNewUserForm({ ...newUserForm, name: e.target.value })
                            }
                            className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                            Email Login *
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="user@mitra.com"
                            value={newUserForm.email}
                            onChange={(e) =>
                              setNewUserForm({ ...newUserForm, email: e.target.value })
                            }
                            className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                            Kata Sandi *
                          </label>
                          <input
                            type="text"
                            required
                            minLength={6}
                            value={newUserForm.password}
                            onChange={(e) =>
                              setNewUserForm({ ...newUserForm, password: e.target.value })
                            }
                            className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                            Peran / Role *
                          </label>
                          <select
                            value={newUserForm.role_name}
                            onChange={(e) =>
                              setNewUserForm({ ...newUserForm, role_name: e.target.value })
                            }
                            className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                          >
                            <option value="Owner">Owner</option>
                            <option value="Manager">Manager</option>
                            <option value="Kasir">Kasir</option>
                            <option value="Inventory">Inventory / Gudang</option>
                            <option value="Dapur">Dapur / Kitchen</option>
                            <option value="Barista">Barista</option>
                            <option value="Server">Server</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                            Penempatan Outlet
                          </label>
                          <select
                            value={newUserForm.store_id}
                            onChange={(e) =>
                              setNewUserForm({ ...newUserForm, store_id: e.target.value })
                            }
                            className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                          >
                            <option value="">Semua Outlet</option>
                            {(selectedTenant.stores || []).map((s: any) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddUserForm(false)}
                          className="text-xs border-neutral-200 text-neutral-700 bg-white"
                        >
                          Batal
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          disabled={isAddingUser}
                          className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs font-bold px-4"
                        >
                          {isAddingUser ? 'Menyimpan...' : 'Simpan Akun'}
                        </Button>
                      </div>
                    </form>
                  )}

                  <div className="rounded-xl border border-neutral-200 overflow-hidden divide-y divide-neutral-100">
                    {selectedTenant.tenant_users && selectedTenant.tenant_users.length > 0 ? (
                      selectedTenant.tenant_users.map((tu: any) => (
                        <div
                          key={tu.id}
                          className="p-3 flex items-center justify-between bg-white hover:bg-neutral-50/60"
                        >
                          <div>
                            <p className="font-bold text-neutral-900">
                              {tu.user?.name || 'User'}
                            </p>
                            <p className="text-[10.5px] text-neutral-500 font-mono">
                              {tu.user?.email}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {tu.store_name && (
                              <span className="text-[10px] text-neutral-500 px-2 py-0.5 rounded bg-neutral-100">
                                {tu.store_name}
                              </span>
                            )}
                            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
                              {tu.role || 'Owner'}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-neutral-400">
                        Belum ada staf terdaftar.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedTenant)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors border ${
                      selectedTenant.status === 'ACTIVE'
                        ? 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
                    }`}
                  >
                    {selectedTenant.status === 'ACTIVE'
                      ? 'Suspend Tenant Ini'
                      : 'Aktifkan Tenant Ini'}
                  </button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
