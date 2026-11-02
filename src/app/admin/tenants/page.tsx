'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Eye,
  Store,
  Users,
  CheckCircle2,
  Ban,
  RefreshCw,
  X,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { adminService, PlatformTenantItem } from '@/services/admin.service';
import { Button } from '@/components/common/Button';
import { PageLoader } from '@/components/common/PageLoader';
import { Pagination, DEFAULT_PAGE_SIZE_OPTIONS } from '@/components/common';
import { useToast } from '@/context/ToastContext';

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
  });

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
      const res = await adminService.getTenant(tenantId);
      if (res?.data) {
        setSelectedTenant(res.data);
      }
    } catch (err) {
      toast.error('Gagal memuat detail tenant.');
    } finally {
      setDetailLoading(false);
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
    if (!formData.name.trim() || !formData.email.trim() || !formData.owner_name.trim() || !formData.owner_email.trim()) {
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
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Building2 className="size-6 text-[#FF5C38]" />
            <span>Kelola Tenant Bisnis</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
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
      <div className="p-4 rounded-2xl bg-[#141414] border border-neutral-800/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="size-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama brand, email, atau slug tenant..."
            className="w-full bg-[#1A1A1A] border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5C38]"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { value: '', label: 'Semua Status' },
            { value: 'ACTIVE', label: 'Aktif' },
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-[#FF5C38] text-white'
                  : 'bg-neutral-800/60 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-[#141414] rounded-2xl border border-neutral-800/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400 text-xs">
            Memuat data tenant...
          </div>
        ) : tenants.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-xs space-y-2">
            <Building2 className="size-10 text-neutral-700 mx-auto" />
            <p className="font-bold text-neutral-300">Tidak ada tenant ditemukan.</p>
            <p>Coba gunakan kata kunci pencarian atau filter status yang berbeda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Brand / Tenant</th>
                  <th className="py-3 px-4">Email Kontak</th>
                  <th className="py-3 px-4">Jumlah Outlet</th>
                  <th className="py-3 px-4">Total Staff</th>
                  <th className="py-3 px-4">Status Akun</th>
                  <th className="py-3 px-4">Tgl Daftar</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white text-sm">{t.name}</p>
                      <p className="text-[10.5px] text-neutral-500 font-mono">ID: {t.id}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-300">
                      {t.email}
                      {t.phone && <p className="text-[10px] text-neutral-500 font-sans">{t.phone}</p>}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-200">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                        <Store className="size-3 text-[#FF5C38]" />
                        {t.stores_count ?? 1} Outlet
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-neutral-200">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                        <Users className="size-3 text-blue-400" />
                        {t.tenant_users_count ?? 1} Staff
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : t.status === 'SUSPENDED'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400">
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
                          className="px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Lihat Detail"
                        >
                          <Eye className="size-3.5" />
                          <span>Detail</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(t)}
                          className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                            t.status === 'ACTIVE'
                              ? 'border border-red-800/40 bg-red-950/20 text-red-400 hover:bg-red-900/40'
                              : 'border border-emerald-800/40 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/40'
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
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/30">
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
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-[#171717] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-neutral-800 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="size-5 text-[#FF5C38]" />
                Daftarkan Tenant Baru
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div className="p-3 rounded-xl bg-orange-950/30 border border-orange-500/30 text-xs text-orange-300">
                Membuat tenant baru akan otomatis membuat akun Owner, hak akses, dan outlet utama perdana.
              </div>

              {/* Detail Bisnis */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Informasi Brand / Merchant
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Nama Brand *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Contoh: Kopi Senja"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#1F1F1F] border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Email Bisnis *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="halo@kopisenja.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#1F1F1F] border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      No. Telepon Bisnis
                    </label>
                    <input
                      type="text"
                      placeholder="0812-3456-7890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#1F1F1F] border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Alamat Kantor Pusat
                    </label>
                    <input
                      type="text"
                      placeholder="Jakarta Selatan"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-[#1F1F1F] border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                </div>
              </div>

              {/* Akun Owner */}
              <div className="space-y-3 pt-2 border-t border-neutral-800">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Kredensial Akun Owner
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Nama Lengkap Owner *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Budi Santoso"
                      value={formData.owner_name}
                      onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                      className="w-full bg-[#1F1F1F] border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Email Login Owner *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="budi@kopisenja.com"
                      value={formData.owner_email}
                      onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                      className="w-full bg-[#1F1F1F] border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Kata Sandi Default
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.owner_password}
                    onChange={(e) => setFormData({ ...formData, owner_password: e.target.value })}
                    className="w-full bg-[#1F1F1F] border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#FF5C38]"
                  />
                  <p className="text-[10.5px] text-neutral-500 mt-1">
                    Owner dapat mengganti kata sandi setelah berhasil login perdana.
                  </p>
                </div>
              </div>

              {/* Outlet Perdana */}
              <div className="space-y-3 pt-2 border-t border-neutral-800">
                <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Outlet Perdana
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Nama Outlet (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="Outlet Senopati"
                      value={formData.store_name}
                      onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                      className="w-full bg-[#1F1F1F] border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-neutral-300 mb-1">
                      Kode Cabang (Opsional)
                    </label>
                    <input
                      type="text"
                      placeholder="SNP-01"
                      value={formData.store_code}
                      onChange={(e) => setFormData({ ...formData, store_code: e.target.value })}
                      className="w-full bg-[#1F1F1F] border border-neutral-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="text-xs border-neutral-700 text-neutral-300"
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

      {/* Slideover / Modal: Detail Tenant */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-[#171717] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-neutral-800 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <Building2 className="size-5 text-[#FF5C38]" />
                  <span>{selectedTenant?.name || 'Detail Tenant'}</span>
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  ID: <span className="font-mono text-neutral-300">{selectedTenant?.id}</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            {detailLoading ? (
              <div className="py-12 text-center text-xs text-neutral-400">
                Memuat rincian data tenant...
              </div>
            ) : selectedTenant ? (
              <div className="space-y-5 text-xs">
                {/* Meta Header Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Status</span>
                    <p className={`font-bold mt-1 ${selectedTenant.status === 'ACTIVE' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {selectedTenant.status}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Email</span>
                    <p className="font-mono font-bold text-white mt-1 truncate">{selectedTenant.email}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Telepon</span>
                    <p className="font-bold text-white mt-1">{selectedTenant.phone || '-'}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                    <span className="text-[10px] text-neutral-500 font-bold uppercase">Terdaftar</span>
                    <p className="font-bold text-white mt-1">
                      {new Date(selectedTenant.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Outlets List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Store className="size-4 text-[#FF5C38]" />
                    <span>Daftar Outlet ({selectedTenant.stores?.length || 0})</span>
                  </h4>
                  <div className="rounded-xl border border-neutral-800 overflow-hidden divide-y divide-neutral-800/60">
                    {selectedTenant.stores && selectedTenant.stores.length > 0 ? (
                      selectedTenant.stores.map((s: any) => (
                        <div key={s.id} className="p-3 flex items-center justify-between bg-neutral-900/50">
                          <div>
                            <p className="font-bold text-white">{s.name}</p>
                            <p className="text-[10.5px] text-neutral-500 font-mono">Kode: {s.code || '-'} | {s.address || 'Alamat belum diatur'}</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                            {s.status || 'ACTIVE'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-neutral-500">Belum ada outlet terdaftar.</div>
                    )}
                  </div>
                </div>

                {/* Tenant Users */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="size-4 text-blue-400" />
                    <span>Staf & Akses Terdaftar ({selectedTenant.tenant_users?.length || 0})</span>
                  </h4>
                  <div className="rounded-xl border border-neutral-800 overflow-hidden divide-y divide-neutral-800/60">
                    {selectedTenant.tenant_users && selectedTenant.tenant_users.length > 0 ? (
                      selectedTenant.tenant_users.map((tu: any) => (
                        <div key={tu.id} className="p-3 flex items-center justify-between bg-neutral-900/50">
                          <div>
                            <p className="font-bold text-white">{tu.user?.name || 'User'}</p>
                            <p className="text-[10.5px] text-neutral-500 font-mono">{tu.user?.email}</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400">
                            {tu.role || 'Staf'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-neutral-500">Belum ada staf terdaftar.</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(selectedTenant)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                      selectedTenant.status === 'ACTIVE'
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                    }`}
                  >
                    {selectedTenant.status === 'ACTIVE' ? 'Suspend Tenant Ini' : 'Aktifkan Tenant Ini'}
                  </button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsDetailModalOpen(false)}
                    className="border-neutral-700 text-neutral-300 text-xs"
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
