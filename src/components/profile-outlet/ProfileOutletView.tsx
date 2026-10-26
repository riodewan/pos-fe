'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { OutletProfile, OperatingHourItem, OutletPhotoItem } from '@/types/profile-outlet';
import { ReceiptPreview } from './ReceiptPreview';
import { OperationalFacilitiesTab } from './OperationalFacilitiesTab';
import { PhotosMediaTab } from './PhotosMediaTab';
import { AddOutletModal } from './AddOutletModal';
import { Button } from '@/components/common/Button';

// Mock Initial Data matching Screenshots 1 & 2
const INITIAL_OUTLET: OutletProfile = {
  id: 'outlet-menteng',
  name: 'Kopi Mantap',
  branchName: 'Main Outlet',
  category: 'Coffee Shop',
  description:
    'Kopi Mantap adalah tempat ngopi santai untuk menikmati kopi favorit, bekerja, atau berkumpul bersama teman. Temukan teman terbaik untuk setiap momen dalam secangkir kopi.',
  logoUrl: '/images/km-logo.png',
  thumbnailUrl:
    'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60',
  phone: '081234567890',
  email: 'halo@kopimantap.com',
  website: 'https://kopimantap.com',
  address: 'Jl. Melati No. 10, Jakarta Barat, Jakarta, Indonesia',
  mapsUrl: 'https://maps.google.com',
  receiptConfig: {
    showLogo: true,
    displayName: 'Kopi Mantap',
    shortAddress: 'Jl. Melati No. 10, Jakarta Barat, Jakarta, Indonesia',
    footerMessage: 'Pesan pada struk',
  },
  operationalStatus: 'NON_AKTIF',
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
  facilities: [
    'WiFi Gratis (High-Speed)',
    'Colokan Listrik di Setiap Meja',
    'Ruangan Ber-AC (Indoor)',
    'Area Merokok (Smoking Area)',
    'Toilet Bersih & Higienis',
    'Pembayaran Cashless (QRIS & Kartu)',
  ],
  photos: [
    {
      id: 'photo-1',
      url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=60',
      title: 'Counter & Barista Area',
      category: 'Indoor',
    },
    {
      id: 'photo-2',
      url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=60',
      title: 'Seating Outdoor Garden',
      category: 'Outdoor',
    },
    {
      id: 'photo-3',
      url: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=800&auto=format&fit=crop&q=60',
      title: 'Signature Latte & Pastry',
      category: 'Menu',
    },
  ],
};

const OUTLET_OPTIONS = [
  { id: 'outlet-menteng', name: 'Kopi Mantap - Menteng' },
  { id: 'outlet-senopati', name: 'Kopi Mantap - Senopati' },
  { id: 'outlet-kemang', name: 'Kopi Mantap - Kemang' },
];

export function ProfileOutletView() {
  const [activeTab, setActiveTab] = useState<'info' | 'ops' | 'media'>('info');
  const [selectedOutlet, setSelectedOutlet] = useState(OUTLET_OPTIONS[0].name);
  const [outlet, setOutlet] = useState<OutletProfile>(INITIAL_OUTLET);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState(false);

  // Toggle for Thumbnail state (Screenshot 1: filled image vs Screenshot 2: empty dashed upload box)
  const [hasThumbnail, setHasThumbnail] = useState(true);

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

  const handleToggleOperationalStatus = () => {
    setOutlet((prev) => ({
      ...prev,
      operationalStatus: prev.operationalStatus === 'AKTIF' ? 'NON_AKTIF' : 'AKTIF',
    }));
  };

  const handleTogglePublicationStatus = () => {
    setOutlet((prev) => ({
      ...prev,
      publicationStatus: prev.publicationStatus === 'DIPUBLIKASIKAN' ? 'NON_AKTIF' : 'DIPUBLIKASIKAN',
    }));
  };

  const handleSaveAll = () => {
    setSaveSuccessNotification(true);
    setTimeout(() => setSaveSuccessNotification(false), 3000);
  };

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
            value={selectedOutlet}
            onChange={(e) => setSelectedOutlet(e.target.value)}
            className="appearance-none bg-white border border-neutral-200/90 text-neutral-800 text-xs sm:text-sm font-semibold rounded-xl pl-4 pr-10 py-2.5 shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#FF5C38]/20 focus:border-[#FF5C38] cursor-pointer"
          >
            {OUTLET_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.name}>
                {opt.name}
              </option>
            ))}
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
                  className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Simpan Perubahan</span>
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
          onSave={(hours, facilities) => {
            setOutlet((prev) => ({
              ...prev,
              operatingHours: hours,
              facilities: facilities,
            }));
          }}
        />
      )}

      {/* Tab 3: Foto & Media */}
      {activeTab === 'media' && (
        <PhotosMediaTab
          initialPhotos={outlet.photos}
          onSave={(photos) => {
            setOutlet((prev) => ({
              ...prev,
              photos: photos,
            }));
          }}
        />
      )}

      {/* Modal: Tambah Outlet */}
      <AddOutletModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={(newOutlet) => {
          setSelectedOutlet(`${newOutlet.name} - ${newOutlet.branchName}`);
          setSaveSuccessNotification(true);
          setTimeout(() => setSaveSuccessNotification(false), 3000);
        }}
      />
    </div>
  );
}
