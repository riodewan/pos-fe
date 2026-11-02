'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Store,
  Sliders,
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronDown,
  Upload,
  ExternalLink,
  MapPin,
  Check,
  FileImage,
  Loader2,
  X,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { OutletProfile, OperatingHourItem, OutletPhotoItem } from '@/types/profile-outlet';
import { ReceiptPreview } from './ReceiptPreview';
import { OperationalFacilitiesTab } from './OperationalFacilitiesTab';
import { PhotosMediaTab } from './PhotosMediaTab';
import { AddOutletModal } from './AddOutletModal';
import { MapLocationPickerModal } from './MapLocationPickerModal';
import { Button } from '@/components/common/Button';
import { PageLoader } from '@/components/common/PageLoader';
import { tenantService } from '@/services/tenant.service';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';

const DEFAULT_HOURS: OperatingHourItem[] = [
  { day: 'Senin', openTime: '08:00', closeTime: '22:00', isOpen: true },
  { day: 'Selasa', openTime: '08:00', closeTime: '22:00', isOpen: true },
  { day: 'Rabu', openTime: '08:00', closeTime: '22:00', isOpen: true },
  { day: 'Kamis', openTime: '08:00', closeTime: '22:00', isOpen: true },
  { day: 'Jumat', openTime: '08:00', closeTime: '23:00', isOpen: true },
  { day: 'Sabtu', openTime: '08:00', closeTime: '23:00', isOpen: true },
  { day: 'Minggu', openTime: '08:00', closeTime: '22:00', isOpen: true },
];

const EMPTY_OUTLET: OutletProfile = {
  id: '',
  name: '',
  branchName: '',
  category: 'Coffee Shop',
  description: '',
  logoUrl: '',
  thumbnailUrl: null,
  phone: '',
  email: '',
  website: '',
  address: '',
  mapsUrl: '',
  receiptConfig: {
    showLogo: true,
    displayName: '',
    shortAddress: '',
    footerMessage: 'Terima kasih atas kunjungan Anda!',
  },
  operationalStatus: 'AKTIF',
  publicationStatus: 'DIPUBLIKASIKAN',
  operatingHours: DEFAULT_HOURS,
  facilities: [],
  photos: [],
};

interface StoreOption {
  id: string;
  name: string;
  code?: string;
  status?: string;
}

export function ProfileOutletView() {
  const { toast } = useToast();
  const { activeTenant } = useAuth();
  const { activeStore, refreshStores } = useStore();

  const [activeTab, setActiveTab] = useState<'info' | 'ops' | 'media'>('info');
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const [outlet, setOutlet] = useState<OutletProfile>(EMPTY_OUTLET);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState(false);
  const [masterCategories, setMasterCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    tenantService
      .getGlobalMasterData()
      .then((res) => {
        if (res.data?.categories) {
          setMasterCategories(res.data.categories);
        }
      })
      .catch(() => {});
  }, []);

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const thumbInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch outlet profile by specific ID or current active store
  const loadProfile = useCallback(async (storeId?: string) => {
    try {
      setIsLoading(true);
      const res = await tenantService.getOutletProfile(storeId);
      if (res?.data) {
        const d = res.data as any;
        setOutlet({
          id: d.id || '',
          name: d.name || '',
          branchName: d.code || '',
          category: d.category || 'Coffee Shop',
          description: d.description || '',
          logoUrl: d.logo_url || '',
          thumbnailUrl: d.thumbnail_url || null,
          phone: d.phone || '',
          email: d.email || '',
          website: d.website || '',
          address: d.address || '',
          mapsUrl: d.maps_url || '',
          receiptConfig: d.receipt_config || {
            showLogo: true,
            displayName: d.name || '',
            shortAddress: d.address || '',
            footerMessage: 'Terima kasih atas kunjungan Anda!',
          },
          operationalStatus:
            d.operational_status === 'OPEN' || d.operational_status === 'AKTIF'
              ? 'AKTIF'
              : 'NON_AKTIF',
          publicationStatus:
            d.publication_status === 'PUBLISHED' || d.publication_status === 'DIPUBLIKASIKAN'
              ? 'DIPUBLIKASIKAN'
              : 'NON_AKTIF',
          operatingHours:
            Array.isArray(d.operating_hours) && d.operating_hours.length > 0
              ? d.operating_hours
              : DEFAULT_HOURS,
          facilities: Array.isArray(d.facilities) ? d.facilities : [],
          photos: Array.isArray(d.photos) ? d.photos : [],
        });
        setSelectedOutletId(d.id || '');
      }
    } catch (err: any) {
      console.error('Error fetching outlet profile:', err);
      toast.error('Gagal memuat profil outlet.');
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Initial load: stores list & profile
  const fetchAllInitial = useCallback(async () => {
    try {
      setIsLoading(true);
      const storesRes = await tenantService.getStores();
      const storeList: StoreOption[] = Array.isArray(storesRes?.data) ? storesRes.data : [];
      setStores(storeList);

      const targetId = activeStore?.id || storeList[0]?.id;
      if (targetId) {
        setSelectedOutletId(targetId);
        await loadProfile(targetId);
      } else {
        await loadProfile();
      }
    } catch (err) {
      console.error('Error fetching initial outlet data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [activeStore?.id, loadProfile]);

  useEffect(() => {
    fetchAllInitial();
  }, [fetchAllInitial]);

  // When user switches outlet in the dropdown
  const handleSelectOutlet = async (storeId: string) => {
    setSelectedOutletId(storeId);
    await loadProfile(storeId);
  };

  // Form handlers
  const handleInputChange = (field: keyof OutletProfile, value: any) => {
    setOutlet((prev) => ({ ...prev, [field]: value }));
  };

  const handleReceiptChange = (field: keyof OutletProfile['receiptConfig'], value: any) => {
    setOutlet((prev) => ({
      ...prev,
      receiptConfig: {
        ...prev.receiptConfig,
        [field]: value,
      },
    }));
  };

  // Image upload helpers (converts image to Data URL for instant preview and persistent storage)
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Format file harus berupa gambar.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setOutlet((prev) => ({ ...prev, logoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Format file harus berupa gambar.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setOutlet((prev) => ({ ...prev, thumbnailUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
    if (thumbInputRef.current) thumbInputRef.current.value = '';
  };

  const handleToggleOperationalStatus = async () => {
    const nextStatus = outlet.operationalStatus === 'AKTIF' ? 'NON_AKTIF' : 'AKTIF';
    setOutlet((prev) => ({ ...prev, operationalStatus: nextStatus }));
    try {
      await tenantService.updateOutletProfile(
        {
          operational_status: nextStatus === 'AKTIF' ? 'OPEN' : 'CLOSED',
        },
        selectedOutletId
      );
      toast.success(
        `Status operasional diubah menjadi ${nextStatus === 'AKTIF' ? 'Aktif' : 'Non Aktif'}`
      );
    } catch (err) {
      toast.error('Gagal memperbarui status operasional.');
    }
  };

  const handleTogglePublicationStatus = async () => {
    const nextStatus =
      outlet.publicationStatus === 'DIPUBLIKASIKAN' ? 'NON_AKTIF' : 'DIPUBLIKASIKAN';
    setOutlet((prev) => ({ ...prev, publicationStatus: nextStatus }));
    try {
      await tenantService.updateOutletProfile(
        {
          publication_status: nextStatus === 'DIPUBLIKASIKAN' ? 'PUBLISHED' : 'HIDDEN',
        },
        selectedOutletId
      );
      toast.success(
        `Status publikasi diubah menjadi ${nextStatus === 'DIPUBLIKASIKAN' ? 'Dipublikasikan' : 'Non Aktif'}`
      );
    } catch (err) {
      toast.error('Gagal memperbarui status publikasi.');
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      const payload = {
        store_id: selectedOutletId,
        name: outlet.name,
        code: outlet.branchName,
        address: outlet.address,
        phone: outlet.phone,
        email: outlet.email,
        website: outlet.website,
        maps_url: outlet.mapsUrl,
        logo_url: outlet.logoUrl,
        thumbnail_url: outlet.thumbnailUrl,
        category: outlet.category,
        description: outlet.description,
        operational_status: outlet.operationalStatus === 'AKTIF' ? 'OPEN' : 'CLOSED',
        publication_status: outlet.publicationStatus === 'DIPUBLIKASIKAN' ? 'PUBLISHED' : 'HIDDEN',
        receipt_config: outlet.receiptConfig,
        operating_hours: outlet.operatingHours,
        facilities: outlet.facilities,
        photos: outlet.photos,
      };

      await tenantService.updateOutletProfile(payload, selectedOutletId);
      setSaveSuccessNotification(true);
      toast.success('Profil outlet berhasil disimpan!');
      setTimeout(() => setSaveSuccessNotification(false), 3000);
      refreshStores();
    } catch (err: any) {
      console.error('Failed to save outlet profile:', err);
      toast.error(err.response?.data?.message || 'Gagal menyimpan profil outlet.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateStore = async (newOutlet: {
    name: string;
    branchName: string;
    category: string;
    phone: string;
    address: string;
  }) => {
    try {
      const res = await tenantService.createStore({
        name: newOutlet.name,
        code: newOutlet.branchName.toUpperCase().replace(/\s+/g, '-'),
        phone: newOutlet.phone,
        address: newOutlet.address,
      });
      toast.success('Pengajuan cabang baru berhasil dikirim dan sedang menunggu approval Super Admin!');
      setIsAddModalOpen(false);

      const refreshed = await refreshStores();
      setStores(refreshed);

      const newId = (res as any)?.data?.id;
      if (newId) {
        setSelectedOutletId(newId);
        await loadProfile(newId);
      }
    } catch (err: any) {
      console.error('Failed to create store:', err);
      toast.error(err.response?.data?.message || 'Gagal mengajukan cabang baru.');
    }
  };

  const handleDeleteStore = async () => {
    if (!selectedOutletId) return;
    if (stores.length <= 1) {
      toast.error('Tidak dapat menghapus satu-satunya outlet yang dimiliki.');
      return;
    }
    if (!window.confirm(`Yakin ingin menghapus outlet "${outlet.name}"?`)) return;

    try {
      await tenantService.deleteStore(selectedOutletId);
      toast.success('Outlet berhasil dihapus.');
      const refreshed = await refreshStores();
      setStores(refreshed);
      if (refreshed.length > 0) {
        setSelectedOutletId(refreshed[0].id);
        await loadProfile(refreshed[0].id);
      }
    } catch (err: any) {
      console.error('Failed to delete store:', err);
      toast.error(err.response?.data?.message || 'Gagal menghapus outlet.');
    }
  };

  if (isLoading) {
    return <PageLoader text="Memuat profil outlet..." />;
  }

  const initials =
    outlet.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') || 'OP';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Hidden File Inputs for Logo & Thumbnail */}
      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={handleLogoFileChange}
        className="hidden"
      />
      <input
        ref={thumbInputRef}
        type="file"
        accept="image/*"
        onChange={handleThumbnailFileChange}
        className="hidden"
      />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Profil Outlet
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Kelola informasi, operasional, fasilitas, dan media untuk setiap outlet
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="primary"
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <Plus className="size-4 stroke-[3]" />
            <span>Tambah Outlet</span>
          </Button>
        </div>
      </div>

      {/* Subheader: Outlet Selector & Tab Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Outlet Switcher Dropdown */}
        <div className="relative inline-block">
          <select
            value={selectedOutletId || outlet.id}
            onChange={(e) => handleSelectOutlet(e.target.value)}
            className="appearance-none bg-white border border-neutral-200 text-neutral-800 text-xs sm:text-sm font-bold rounded-xl pl-4 pr-10 py-2.5 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#FF5C38]/20 focus:border-[#FF5C38] cursor-pointer"
          >
            {stores.length > 0 ? (
              stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.code ? `(${s.code})` : ''} {s.status === 'PENDING' ? '⏳ [Menunggu Approval]' : s.status === 'REJECTED' ? '❌ [Ditolak]' : ''}
                </option>
              ))
            ) : (
              <option value={outlet.id}>{outlet.name || 'Pilih Outlet'}</option>
            )}
          </select>
          <ChevronDown className="size-4 text-[#FF5C38] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
        </div>

        {/* 3 Tabs Segmented Control */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-neutral-200/90 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'bg-orange-50 text-[#FF5C38] shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Store className="size-4" />
            <span>Informasi Outlet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ops')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'ops'
                ? 'bg-orange-50 text-[#FF5C38] shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Sliders className="size-4" />
            <span>Operasional & Fasilitas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('media')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'media'
                ? 'bg-orange-50 text-[#FF5C38] shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <ImageIcon className="size-4" />
            <span>Foto & Media</span>
          </button>
        </div>
      </div>

      {/* Notice if selected outlet is pending approval */}
      {stores.find((s) => s.id === selectedOutletId)?.status === 'PENDING' && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2.5 animate-in fade-in">
          <Clock className="size-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-bold">Cabang Ini Menunggu Persetujuan Super Admin:</span>
            <p className="mt-0.5 text-amber-700 leading-relaxed">
              Pengajuan cabang ini sedang ditinjau oleh Admin Internal. Anda tetap dapat melengkapi data profil, fasilitas, dan foto di bawah ini. Fitur transaksi kasir POS akan aktif segera setelah disetujui.
            </p>
          </div>
        </div>
      )}

      {/* Tab 1: Informasi Outlet */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
          {/* LEFT COLUMN: Informasi Dasar & Informasi Kontak (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card: Informasi Dasar */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
              <div className="pb-3 border-b border-neutral-100">
                <h2 className="text-sm sm:text-base font-bold text-neutral-900">
                  Informasi Dasar
                </h2>
              </div>

              {/* Logo & Thumbnail Upload Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Logo Box */}
                <div className="p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/40 flex flex-col items-start justify-between min-h-[170px]">
                  {outlet.logoUrl ? (
                    <div className="relative group size-16 rounded-2xl overflow-hidden border border-neutral-200 bg-white shadow-xs">
                      <img
                        src={outlet.logoUrl}
                        alt="Logo Outlet"
                        className="size-full object-contain p-1"
                      />
                      <button
                        type="button"
                        onClick={() => handleInputChange('logoUrl', '')}
                        className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold cursor-pointer"
                        title="Hapus Logo"
                      >
                        Hapus
                      </button>
                    </div>
                  ) : (
                    <div className="size-16 rounded-2xl bg-[#FF5C38] text-white flex items-center justify-center font-bold text-2xl shadow-xs">
                      {initials}
                    </div>
                  )}

                  <div className="w-full mt-3">
                    <p className="text-xs font-bold text-neutral-800 truncate">
                      {outlet.logoUrl ? 'Logo Outlet Terpasang' : 'Logo Outlet'}
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Rekomendasi rasio 1:1 (Persegi), PNG/JPG/WebP.
                    </p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="px-3 py-1 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        {outlet.logoUrl ? 'Ganti Logo' : 'Pilih File'}
                      </button>
                      {outlet.logoUrl && (
                        <button
                          type="button"
                          onClick={() => handleInputChange('logoUrl', '')}
                          className="px-2.5 py-1 text-xs text-red-500 hover:underline font-semibold cursor-pointer"
                        >
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Thumbnail / Sampul Box */}
                {outlet.thumbnailUrl ? (
                  <div className="p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/40 flex flex-col items-start justify-between min-h-[170px]">
                    <div className="w-full h-16 rounded-xl overflow-hidden relative shadow-xs border border-neutral-200 bg-neutral-100">
                      <img
                        src={outlet.thumbnailUrl}
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-full mt-3">
                      <p className="text-xs font-bold text-neutral-800 truncate">
                        Foto Sampul / Banner
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        Rasio 16:9 atau 4:3, PNG/JPG/WebP.
                      </p>
                      <div className="flex items-center gap-2 mt-2.5">
                        <button
                          type="button"
                          onClick={() => thumbInputRef.current?.click()}
                          className="px-3 py-1 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Ganti Sampul
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange('thumbnailUrl', null)}
                          className="px-2.5 py-1 text-xs text-red-500 hover:underline font-semibold cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => thumbInputRef.current?.click()}
                    className="p-4 rounded-xl border-2 border-dashed border-neutral-300 hover:border-[#FF5C38] bg-neutral-50/50 hover:bg-orange-50/20 flex flex-col items-center justify-center text-center min-h-[170px] transition-all cursor-pointer"
                  >
                    <div className="size-10 rounded-xl border border-neutral-200 bg-white flex items-center justify-center text-neutral-400 mb-2 shadow-2xs">
                      <FileImage className="size-5 text-[#FF5C38]" />
                    </div>
                    <p className="text-xs font-bold text-neutral-800">
                      Upload Foto Sampul
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Rasio 16:9 atau 4:3, Maks 5MB
                    </p>
                    <button
                      type="button"
                      className="mt-2.5 px-3.5 py-1 rounded-lg border border-neutral-300 text-neutral-700 text-xs font-semibold pointer-events-none"
                    >
                      Pilih file
                    </button>
                  </div>
                )}
              </div>

              {/* Nama Outlet & Cabang */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Nama Outlet *
                  </label>
                  <input
                    type="text"
                    value={outlet.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Nama Outlet"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Kode Cabang / Singkatan
                  </label>
                  <input
                    type="text"
                    value={outlet.branchName}
                    onChange={(e) => handleInputChange('branchName', e.target.value)}
                    placeholder="Contoh: SNP-01"
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]"
                  />
                </div>
              </div>

              {/* Kategori Bisnis */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Kategori Bisnis
                </label>
                <div className="relative">
                  <select
                    value={outlet.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full appearance-none px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 bg-white focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38] cursor-pointer"
                  >
                    <option value="">Pilih kategori bisnis</option>
                    {outlet.category &&
                      !masterCategories.some((c) => c.name === outlet.category) && (
                        <option value={outlet.category}>{outlet.category}</option>
                      )}
                    {masterCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="size-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Deskripsi Outlet */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Deskripsi Outlet
                </label>
                <textarea
                  rows={3}
                  value={outlet.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Ceritakan tentang suasana, menu unggulan, atau konsep outlet Anda..."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-normal text-neutral-900 focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38] resize-none"
                />
              </div>
            </div>

            {/* Card: Informasi Kontak & Lokasi */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
              <div className="pb-3 border-b border-neutral-100">
                <h2 className="text-sm sm:text-base font-bold text-neutral-900">
                  Informasi Kontak & Lokasi
                </h2>
              </div>

              {/* No Telepon, Email, Website */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    No Telepon
                  </label>
                  <input
                    type="text"
                    value={outlet.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="0812-3456-7890"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={outlet.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="outlet@brand.com"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Website (Opsional)
                  </label>
                  <input
                    type="text"
                    value={outlet.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://brand.com"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]"
                  />
                </div>
              </div>

              {/* Alamat Bisnis */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Alamat Lengkap
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMapModalOpen(true)}
                    className="text-xs font-bold text-[#FF5C38] hover:text-[#E04B28] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <MapPin className="size-3.5" />
                    <span>Pilih dari Peta</span>
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={outlet.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Jl. Senopati No. 45, Kebayoran Baru, Jakarta Selatan"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-normal text-neutral-900 focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38] resize-none"
                />
              </div>

              {/* Link Google Maps & Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-neutral-700">
                    Link Google Maps
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMapModalOpen(true)}
                    className="text-[11px] font-semibold text-neutral-500 hover:text-[#FF5C38] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <MapPin className="size-3" />
                    <span>Atur Titik Peta</span>
                  </button>
                </div>
                <div className="flex gap-2 mb-3">
                  <input
                    type="url"
                    value={outlet.mapsUrl}
                    onChange={(e) => handleInputChange('mapsUrl', e.target.value)}
                    placeholder="https://maps.google.com/?q=..."
                    className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                  />
                  {outlet.mapsUrl && (
                    <a
                      href={outlet.mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-xs font-bold text-neutral-700 flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <span>Tes Buka</span>
                      <ExternalLink className="size-3" />
                    </a>
                  )}
                </div>

                {/* Stylized Google Maps Graphic - Clickable to open picker */}
                <div
                  onClick={() => setIsMapModalOpen(true)}
                  className="relative rounded-xl border border-neutral-200 overflow-hidden bg-neutral-100 h-[100px] group cursor-pointer hover:border-[#FF5C38]/60 transition-all shadow-2xs"
                  title="Klik untuk memilih titik lokasi pada peta"
                >
                  <div className="absolute inset-0 bg-[#E8ECEF] bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:12px_12px] opacity-90" />
                  <svg
                    className="absolute inset-0 size-full opacity-40"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M-10 50 Q 60 30 140 60 T 400 40"
                      fill="none"
                      stroke="#FDE047"
                      strokeWidth="6"
                    />
                    <path
                      d="M60 -10 Q 80 60 100 120"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="8"
                    />
                    <path
                      d="M180 -10 Q 170 50 240 120"
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth="5"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex flex-col items-center group-hover:scale-110 transition-transform">
                      <MapPin className="size-6 text-[#FF5C38] fill-[#FF5C38] drop-shadow-md" />
                      <span className="size-2 rounded-full bg-neutral-800/40 blur-2xs -mt-1" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[10px] font-bold text-neutral-700 group-hover:text-[#FF5C38] flex items-center gap-1 shadow-2xs border border-neutral-200/80 transition-colors">
                    <MapPin className="size-2.5" />
                    <span>Pilih Titik di Peta</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Pengaturan Struk & Status Outlet (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card: Pengaturan Struk */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h2 className="text-sm sm:text-base font-bold text-neutral-900">
                  Pengaturan Struk
                </h2>

                {/* Toggle: Tampilkan logo di struk */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleReceiptChange('showLogo', !outlet.receiptConfig.showLogo)
                    }
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      outlet.receiptConfig.showLogo ? 'bg-[#FF5C38]' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        outlet.receiptConfig.showLogo ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-[11px] font-bold text-neutral-700">
                    Tampilkan logo
                  </span>
                </div>
              </div>

              {/* Form Inputs & Live Receipt Preview */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1 space-y-3.5 w-full">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Nama Tampil di Struk
                    </label>
                    <input
                      type="text"
                      value={outlet.receiptConfig.displayName}
                      onChange={(e) => handleReceiptChange('displayName', e.target.value)}
                      placeholder={outlet.name || 'Nama Outlet'}
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Alamat Singkat di Struk
                    </label>
                    <textarea
                      rows={2}
                      value={outlet.receiptConfig.shortAddress}
                      onChange={(e) => handleReceiptChange('shortAddress', e.target.value)}
                      placeholder="Alamat ringkas untuk cetak struk"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Pesan Footer Struk
                    </label>
                    <textarea
                      rows={2}
                      value={outlet.receiptConfig.footerMessage}
                      onChange={(e) => handleReceiptChange('footerMessage', e.target.value)}
                      placeholder="Terima kasih atas kunjungan Anda!"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38] resize-none"
                    />
                  </div>
                </div>

                {/* Thermal Receipt Paper Live Preview */}
                <div className="w-full sm:w-auto flex justify-center">
                  <ReceiptPreview
                    config={outlet.receiptConfig}
                    logoUrl={outlet.logoUrl}
                    storeName={outlet.name}
                  />
                </div>
              </div>
            </div>

            {/* Card: Status Outlet */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-neutral-900 pb-2 border-b border-neutral-100">
                Status Outlet
              </h2>

              {/* Status Operasional Kasir */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-50/50 border border-neutral-100">
                <div>
                  <p className="text-xs font-bold text-neutral-900">
                    Status Operasional Kasir
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                        outlet.operationalStatus === 'AKTIF'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          outlet.operationalStatus === 'AKTIF'
                            ? 'bg-emerald-500'
                            : 'bg-neutral-500'
                        }`}
                      />
                      {outlet.operationalStatus === 'AKTIF' ? 'Aktif (Menerima Pesanan)' : 'Non-Aktif (Tutup)'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Saat non-aktif, kasir tidak dapat memproses transaksi baru.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleOperationalStatus}
                  className="px-3.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  {outlet.operationalStatus === 'AKTIF' ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </div>

              {/* Status Publikasi (Katalog / Web Order) */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-50/50 border border-neutral-100">
                <div>
                  <p className="text-xs font-bold text-neutral-900">
                    Status Publikasi Outlet
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                        outlet.publicationStatus === 'DIPUBLIKASIKAN'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-neutral-200 text-neutral-700'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          outlet.publicationStatus === 'DIPUBLIKASIKAN'
                            ? 'bg-emerald-500'
                            : 'bg-neutral-500'
                        }`}
                      />
                      {outlet.publicationStatus === 'DIPUBLIKASIKAN'
                        ? 'Dipublikasikan'
                        : 'Draf / Sembunyi'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Tampilkan profil outlet pada menu pemesanan QR dan online.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleTogglePublicationStatus}
                    className="px-3.5 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {outlet.publicationStatus === 'DIPUBLIKASIKAN'
                      ? 'Sembunyikan'
                      : 'Publikasikan'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Actions Row */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={handleDeleteStore}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-200 hover:border-red-300 hover:bg-red-50 text-neutral-700 hover:text-red-600 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <Trash2 className="size-4 text-red-500" />
                <span>Hapus Outlet</span>
              </button>

              <div className="flex items-center gap-3">
                {saveSuccessNotification && (
                  <span className="text-xs font-bold text-emerald-600 animate-in fade-in flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" />
                    Tersimpan!
                  </span>
                )}
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Operasional & Fasilitas */}
      {activeTab === 'ops' && (
        <OperationalFacilitiesTab
          initialHours={outlet.operatingHours}
          initialFacilities={outlet.facilities}
          onSave={async (hours, facilities) => {
            setOutlet((prev) => ({
              ...prev,
              operatingHours: hours,
              facilities: facilities,
            }));
            try {
              await tenantService.updateOutletProfile(
                {
                  store_id: selectedOutletId,
                  operating_hours: hours,
                  facilities: facilities,
                },
                selectedOutletId
              );
              toast.success('Jam operasional & fasilitas berhasil diperbarui!');
            } catch (err: any) {
              toast.error(err.response?.data?.message || 'Gagal memperbarui jam operasional.');
            }
          }}
        />
      )}

      {/* Tab 3: Foto & Media */}
      {activeTab === 'media' && (
        <PhotosMediaTab
          initialPhotos={outlet.photos}
          onSave={async (photos) => {
            setOutlet((prev) => ({
              ...prev,
              photos: photos,
            }));
            try {
              await tenantService.updateOutletProfile(
                {
                  store_id: selectedOutletId,
                  photos: photos,
                },
                selectedOutletId
              );
              toast.success('Foto & media berhasil diperbarui!');
            } catch (err: any) {
              toast.error(err.response?.data?.message || 'Gagal memperbarui foto & media.');
            }
          }}
        />
      )}

      {/* Modal: Tambah Outlet */}
      <AddOutletModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        defaultBrandName={activeTenant?.name || outlet.name}
        onSave={handleCreateStore}
      />

      {/* Modal: Pilih Titik Lokasi Peta */}
      <MapLocationPickerModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        initialAddress={outlet.address}
        initialMapsUrl={outlet.mapsUrl}
        onSelectLocation={({ address, mapsUrl }) => {
          setOutlet((prev) => ({
            ...prev,
            address,
            mapsUrl,
            receiptConfig: {
              ...prev.receiptConfig,
              shortAddress: address.length > 60 ? address.substring(0, 60) + '...' : address,
            },
          }));
          toast.success('Titik lokasi berhasil dipilih!');
        }}
      />
    </div>
  );
}
