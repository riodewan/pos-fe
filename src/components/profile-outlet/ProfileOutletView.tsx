'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Power,
  Globe,
  Mail,
  Phone,
  Layers,
  FileImage,
  Loader2,
} from 'lucide-react';
import { OutletProfile, OperatingHourItem, OutletPhotoItem } from '@/types/profile-outlet';
import { ReceiptPreview } from './ReceiptPreview';
import { OperationalFacilitiesTab } from './OperationalFacilitiesTab';
import { PhotosMediaTab } from './PhotosMediaTab';
import { AddOutletModal } from './AddOutletModal';
import { Button } from '@/components/common/Button';
import { PageLoader } from '@/components/common/PageLoader';
import { tenantService } from '@/services/tenant.service';
import { useToast } from '@/context/ToastContext';

// Clean Initial Empty Data (No dummy data)
const EMPTY_OUTLET: OutletProfile = {
  id: '',
  name: '',
  branchName: '',
  category: '',
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
    footerMessage: '',
  },
  operationalStatus: 'AKTIF',
  publicationStatus: 'DIPUBLIKASIKAN',
  operatingHours: [
    { day: 'Senin', openTime: '08:00', closeTime: '22:00', isOpen: true },
    { day: 'Selasa', openTime: '08:00', closeTime: '22:00', isOpen: true },
    { day: 'Rabu', openTime: '08:00', closeTime: '22:00', isOpen: true },
    { day: 'Kamis', openTime: '08:00', closeTime: '22:00', isOpen: true },
    { day: 'Jumat', openTime: '08:00', closeTime: '23:00', isOpen: true },
    { day: 'Sabtu', openTime: '08:00', closeTime: '23:00', isOpen: true },
    { day: 'Minggu', openTime: '08:00', closeTime: '22:00', isOpen: true },
  ],
  facilities: [],
  photos: [],
};

interface StoreOption {
  id: string;
  name: string;
  code?: string;
}

export function ProfileOutletView() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'info' | 'ops' | 'media'>('info');
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [selectedOutletId, setSelectedOutletId] = useState<string>('');
  const [outlet, setOutlet] = useState<OutletProfile>(EMPTY_OUTLET);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState(false);

  // Toggle for Thumbnail state (Screenshot 1: filled image vs Screenshot 2: empty dashed upload box)
  const [hasThumbnail, setHasThumbnail] = useState(true);

  // Fetch outlet profile and store list
  const fetchProfileAndStores = useCallback(async () => {
    try {
      setIsLoading(true);
      const [profileRes, storesRes] = await Promise.allSettled([
        tenantService.getOutletProfile(),
        tenantService.getStores(),
      ]);

      if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
        const d = (profileRes.value.data as any);
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
          receiptConfig: d.receipt_config || EMPTY_OUTLET.receiptConfig,
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
              : EMPTY_OUTLET.operatingHours,
          facilities:
            Array.isArray(d.facilities) && d.facilities.length > 0
              ? d.facilities
              : EMPTY_OUTLET.facilities,
          photos:
            Array.isArray(d.photos) && d.photos.length > 0
              ? d.photos
              : EMPTY_OUTLET.photos,
        });
        setSelectedOutletId(d.id || '');
      }

      if (storesRes.status === 'fulfilled' && Array.isArray(storesRes.value?.data)) {
        setStores(storesRes.value.data);
      }
    } catch (err) {
      console.error('Error fetching outlet profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfileAndStores();
  }, [fetchProfileAndStores]);

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

  const handleToggleOperationalStatus = async () => {
    const nextStatus = outlet.operationalStatus === 'AKTIF' ? 'NON_AKTIF' : 'AKTIF';
    setOutlet((prev) => ({ ...prev, operationalStatus: nextStatus }));
    try {
      await tenantService.updateOutletProfile({
        operational_status: nextStatus === 'AKTIF' ? 'OPEN' : 'CLOSED',
      });
      toast.success(
        `Status operasional diubah menjadi ${nextStatus === 'AKTIF' ? 'Aktif' : 'Non Aktif'}`
      );
    } catch (err) {
      toast.error('Gagal memperbarui status operasional.');
    }
  };

  const handleTogglePublicationStatus = async () => {
    const nextStatus = outlet.publicationStatus === 'DIPUBLIKASIKAN' ? 'NON_AKTIF' : 'DIPUBLIKASIKAN';
    setOutlet((prev) => ({ ...prev, publicationStatus: nextStatus }));
    try {
      await tenantService.updateOutletProfile({
        publication_status: nextStatus === 'DIPUBLIKASIKAN' ? 'PUBLISHED' : 'HIDDEN',
      });
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
        name: outlet.name,
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

      await tenantService.updateOutletProfile(payload);
      setSaveSuccessNotification(true);
      toast.success('Profil outlet berhasil disimpan!');
      setTimeout(() => setSaveSuccessNotification(false), 3000);
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
      await tenantService.createStore({
        name: newOutlet.name,
        code: newOutlet.branchName.toLowerCase().replace(/\s+/g, '-'),
        phone: newOutlet.phone,
        address: newOutlet.address,
      });
      toast.success('Outlet baru berhasil dibuat!');
      setIsAddModalOpen(false);
      const res = await tenantService.getStores();
      if (Array.isArray(res?.data)) {
        setStores(res.data);
      }
    } catch (err: any) {
      console.error('Failed to create store:', err);
      toast.error(err.response?.data?.message || 'Gagal membuat outlet baru.');
    }
  };

  const handleDeleteStore = async () => {
    if (!outlet.id) return;
    if (!window.confirm(`Yakin ingin menghapus outlet "${outlet.name}"?`)) return;

    try {
      await tenantService.deleteStore(outlet.id);
      toast.success('Outlet berhasil dihapus.');
      fetchProfileAndStores();
    } catch (err: any) {
      console.error('Failed to delete store:', err);
      toast.error(err.response?.data?.message || 'Gagal menghapus outlet.');
    }
  };

  if (isLoading) {
    return <PageLoader text="Memuat profil outlet..." />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Top Header Row matching Screenshots */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Profile Outlet
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Kelola informasi, operasional, dan pengaturan untuk setiap outlet
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

      {/* Filter / Subheader Row matching Screenshots */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Outlet Switcher Dropdown */}
        <div className="relative inline-block">
          <select
            value={selectedOutletId || outlet.id}
            onChange={(e) => {
              const sId = e.target.value;
              setSelectedOutletId(sId);
              const found = stores.find((s) => s.id === sId);
              if (found) {
                setOutlet((prev) => ({
                  ...prev,
                  id: found.id,
                  name: found.name,
                  branchName: found.code || '',
                }));
              }
            }}
            className="appearance-none bg-white border border-neutral-200/90 text-neutral-800 text-xs sm:text-sm font-semibold rounded-xl pl-4 pr-10 py-2.5 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#FF5C38]/20 focus:border-[#FF5C38] cursor-pointer"
          >
            {stores.length > 0 ? (
              stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.code ? `(${s.code})` : ''}
                </option>
              ))
            ) : (
              <option value={outlet.id}>{outlet.name}</option>
            )}
          </select>
          <ChevronDown className="size-4 text-[#FF5C38] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
        </div>

        {/* 3 Tabs Segmented Control matching Screenshots */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-neutral-200/90 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'info'
                ? 'bg-red-50/80 text-[#FF5C38] shadow-2xs'
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
                ? 'bg-red-50/80 text-[#FF5C38] shadow-2xs'
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
                ? 'bg-red-50/80 text-[#FF5C38] shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <ImageIcon className="size-4" />
            <span>Foto & Media</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-150">
          {/* LEFT COLUMN: Informasi Dasar & Informasi Kontak (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card: Informasi Dasar */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h2 className="text-sm sm:text-base font-bold text-neutral-900">
                  Informasi Dasar
                </h2>

                {/* Screenshot 1 vs Screenshot 2 Quick Demo Mode Switcher */}
                <div className="flex items-center gap-2 text-[11px] text-neutral-500">
                  <span>Thumbnail Mode:</span>
                  <button
                    type="button"
                    onClick={() => setHasThumbnail(!hasThumbnail)}
                    className="px-2 py-0.5 rounded-md border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 font-semibold cursor-pointer"
                  >
                    {hasThumbnail ? 'Terisi (Gambar 1)' : 'Kosong Upload (Gambar 2)'}
                  </button>
                </div>
              </div>

              {/* Logo & Thumbnail Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Logo Box */}
                <div className="p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/30 flex flex-col items-start justify-between min-h-[170px]">
                  <div className="size-16 rounded-2xl bg-[#E02626] text-white flex items-center justify-center font-bold text-2xl shadow-xs">
                    KM
                  </div>
                  <div className="w-full mt-3">
                    <p className="text-xs font-bold text-blue-600 hover:underline cursor-pointer truncate">
                      Logo_KopiMantap.webp
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      WebP, JPG, PNG. Ratio 1:1, Maks. 2MB
                    </p>
                    <button
                      type="button"
                      className="mt-3 px-3.5 py-1 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Pilih file
                    </button>
                  </div>
                </div>

                {/* Thumbnail Box: Supports Screenshot 1 (Filled) & Screenshot 2 (Dashed empty upload box) */}
                {hasThumbnail ? (
                  <div className="p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/30 flex flex-col items-start justify-between min-h-[170px]">
                    <div className="w-full h-16 rounded-xl overflow-hidden relative shadow-xs border border-neutral-200">
                      <img
                        src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60"
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-full mt-3">
                      <p className="text-xs font-bold text-blue-600 hover:underline cursor-pointer truncate">
                        Thumbnail_KopiMantap.webp
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        WebP, JPG, PNG. Ratio 1:1, Maks. 2MB
                      </p>
                      <button
                        type="button"
                        className="mt-3 px-3.5 py-1 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        Pilih file
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/30 flex flex-col items-center justify-center text-center min-h-[170px]">
                    <div className="size-10 rounded-xl border border-blue-200 bg-white flex items-center justify-center text-blue-500 mb-2 shadow-2xs">
                      <FileImage className="size-5" />
                    </div>
                    <p className="text-xs font-bold text-neutral-800">
                      Upload Thumbnail
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      WebP, JPG, PNG. Ratio 1:1, Maks. 2MB
                    </p>
                    <button
                      type="button"
                      className="mt-3 px-3.5 py-1 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
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
                    Nama Outlet
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
                    Cabang
                  </label>
                  <input
                    type="text"
                    value={outlet.branchName}
                    onChange={(e) => handleInputChange('branchName', e.target.value)}
                    placeholder="Cabang"
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
                    <option value="Coffee Shop">Coffee Shop</option>
                    <option value="Restoran & Cafe">Restoran & Cafe</option>
                    <option value="Bakery & Pastry">Bakery & Pastry</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Food Court">Food Court</option>
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
                  placeholder="Deskripsi singkat outlet..."
                  className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-normal text-neutral-900 focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38] resize-none"
                />
              </div>
            </div>

            {/* Card: Informasi Kontak */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
              <div className="pb-3 border-b border-neutral-100">
                <h2 className="text-sm sm:text-base font-bold text-neutral-900">
                  Informasi Kontak
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
                    placeholder="Masukkan nomor telepon"
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
                    placeholder="Masukkan email"
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
                    placeholder="Link website (opsional)"
                    className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]"
                  />
                </div>
              </div>

              {/* Alamat Bisnis & Alamat Gmaps Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Alamat Bisnis
                  </label>
                  <textarea
                    rows={4}
                    value={outlet.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Jl. Melati No. 10, Jakarta Barat..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-normal text-neutral-900 focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38] resize-none h-[115px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                    Alamat Gmaps
                  </label>
                  <div className="relative rounded-xl border border-neutral-200 overflow-hidden bg-neutral-100 h-[115px] group">
                    {/* Stylized Google Maps Background */}
                    <div className="absolute inset-0 bg-[#E8ECEF] bg-[radial-gradient(#CBD5E1_1px,transparent_1px)] [background-size:12px_12px] opacity-90" />
                    
                    {/* Faux map road lines */}
                    <svg className="absolute inset-0 size-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                      <path d="M-10 60 Q 60 40 140 70 T 300 50" fill="none" stroke="#FDE047" strokeWidth="6" />
                      <path d="M50 -10 Q 70 80 90 150" fill="none" stroke="#FFFFFF" strokeWidth="8" />
                      <path d="M120 -10 Q 110 50 180 150" fill="none" stroke="#FFFFFF" strokeWidth="5" />
                    </svg>

                    {/* Red Map Pin in Center */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex flex-col items-center animate-bounce">
                        <MapPin className="size-6 text-[#FF5C38] fill-[#FF5C38] drop-shadow-md" />
                        <span className="size-2 rounded-full bg-neutral-800/40 blur-2xs -mt-1" />
                      </div>
                    </div>

                    {/* Bottom overlay with quick link */}
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-white/90 backdrop-blur-xs text-[10px] font-bold text-neutral-700 hover:text-[#FF5C38] flex items-center gap-1 shadow-2xs border border-neutral-200/60 transition-colors"
                    >
                      <span>Buka Maps</span>
                      <ExternalLink className="size-2.5" />
                    </a>
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
                      outlet.receiptConfig.showLogo ? 'bg-[#2563EB]' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        outlet.receiptConfig.showLogo ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-[11px] font-bold text-neutral-700">
                    Tampilkan logo di struk
                  </span>
                </div>
              </div>

              {/* Inputs on the left & Receipt paper on the right */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex-1 space-y-3.5 w-full">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Nama Tampil
                    </label>
                    <input
                      type="text"
                      value={outlet.receiptConfig.displayName}
                      onChange={(e) => handleReceiptChange('displayName', e.target.value)}
                      placeholder="Nama di struk"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Alamat Singkat
                    </label>
                    <textarea
                      rows={2}
                      value={outlet.receiptConfig.shortAddress}
                      onChange={(e) => handleReceiptChange('shortAddress', e.target.value)}
                      placeholder="Alamat di struk"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38] resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1">
                      Pesan Tambahan
                    </label>
                    <textarea
                      rows={2}
                      value={outlet.receiptConfig.footerMessage}
                      onChange={(e) => handleReceiptChange('footerMessage', e.target.value)}
                      placeholder="Pesan pada struk"
                      className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38] resize-none"
                    />
                  </div>
                </div>

                {/* Live Real Thermal Receipt Preview */}
                <div className="w-full sm:w-auto flex justify-center">
                  <ReceiptPreview config={outlet.receiptConfig} />
                </div>
              </div>
            </div>

            {/* Card: Status Outlet */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
              <h2 className="text-sm sm:text-base font-bold text-neutral-900 pb-2 border-b border-neutral-100">
                Status Outlet
              </h2>

              {/* Status Operasional (NemuPOS) */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-50/50 border border-neutral-100">
                <div>
                  <p className="text-xs font-bold text-neutral-900">
                    Status Operasional (NemuPOS)
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
                      {outlet.operationalStatus === 'AKTIF' ? 'Aktif' : 'Non Aktif'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Outlet ini aktif dan dapat menerima pesanan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleToggleOperationalStatus}
                  className="px-3.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer shrink-0"
                >
                  {outlet.operationalStatus === 'AKTIF' ? 'Nonaktifkan' : 'Aktifkan'}
                </button>
              </div>

              {/* Status Publikasi (NemuSosial) */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-neutral-50/50 border border-neutral-100">
                <div>
                  <p className="text-xs font-bold text-neutral-900">
                    Status Publikasi (NemuSosial)
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
                        : 'Non Aktif'}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1">
                    Profil outlet ini ditampilkan di NemuSosial.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Lihat Halaman
                  </button>
                  <button
                    type="button"
                    onClick={handleTogglePublicationStatus}
                    className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                  >
                    {outlet.publicationStatus === 'DIPUBLIKASIKAN'
                      ? 'Nonaktifkan'
                      : 'Publikasikan'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Action Buttons matching Screenshots */}
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
                  <span className="text-xs font-bold text-emerald-600 animate-in fade-in">
                    Perubahan berhasil disimpan!
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
              await tenantService.updateOutletProfile({
                operating_hours: hours,
                facilities: facilities,
              });
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
              await tenantService.updateOutletProfile({
                photos: photos,
              });
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
        onSave={handleCreateStore}
      />
    </div>
  );
}
