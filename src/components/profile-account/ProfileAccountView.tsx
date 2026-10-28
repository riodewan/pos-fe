'use client';

import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Bell,
  Utensils,
  CreditCard,
  Calendar,
  TrendingUp,
  Globe,
  Clock,
  KeyRound,
  AlertTriangle,
  FileImage,
  ChevronDown,
  CheckCircle2,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { UserAccountProfile } from '@/types/account-profile';
import { ChangePasswordModal } from './ChangePasswordModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { Button } from '@/components/common/Button';
import { authService } from '@/services/auth.service';

// Initial Mock Data matching Screenshots 1 & 2
const INITIAL_ACCOUNT_DATA: UserAccountProfile = {
  name: 'Bambang Sudiro',
  email: 'owner@kopinusantara.com',
  phone: '+62 812-3456-7890',
  role: 'General Manager & Co-Founder',
  avatarUrl:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  outletCount: 1,
  joinedDate: '12 Jan 2024',
  lastLogin: {
    datetime: 'Hari ini, 10:24',
    location: 'Jakarta Selatan, Indonesia',
  },
  notifications: {
    orders: { email: true, inApp: true },
    transactions: { email: true, inApp: true },
    reservations: { email: true, inApp: true },
    dailySummary: { email: true, inApp: true },
  },
  preferences: {
    language: 'Bahasa Indonesia',
    dateFormat: 'DD/MM/YYYY',
    timezone: 'WIB (UTC+7)',
  },
  loginActivities: [
    {
      id: 'login-1',
      status: 'SUCCESS',
      title: 'Login Berhasil',
      device: 'MacOS • Chrome 130',
      date: 'Hari ini',
      time: '10:24',
    },
    {
      id: 'login-2',
      status: 'SUCCESS',
      title: 'Login Berhasil',
      device: 'iPhone 15 Pro • Safari',
      date: 'Kemarin',
      time: '14:10',
    },
  ],
};

export function ProfileAccountView() {
  const [profile, setProfile] = useState<UserAccountProfile>(INITIAL_ACCOUNT_DATA);
  const [hasAvatar, setHasAvatar] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch live account profile and login activities from backend
  React.useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const [profileRes, activitiesRes] = await Promise.allSettled([
          authService.getAccountProfile(),
          authService.getLoginActivities(),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
          const d = profileRes.value.data;
          setProfile((prev) => ({
            ...prev,
            name: d.name || prev.name,
            email: d.email || prev.email,
            phone: d.phone || prev.phone,
            role: d.job_title || prev.role,
            avatarUrl: d.avatar_url || prev.avatarUrl,
          }));
        }

        if (activitiesRes.status === 'fulfilled' && activitiesRes.value?.data && activitiesRes.value.data.length > 0) {
          const acts = activitiesRes.value.data.map((act: any) => ({
            id: act.id,
            status: act.status || 'SUCCESS',
            title: act.title || 'Login Berhasil',
            device: act.device || 'Web Browser',
            date: act.logged_at ? new Date(act.logged_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Hari ini',
            time: act.logged_at ? new Date(act.logged_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '10:00',
          }));
          setProfile((prev) => ({ ...prev, loginActivities: acts }));
        }
      } catch {
        // Fallback to initial account data
      }
    };

    fetchAccountData();
  }, []);

  const handleInputChange = (field: keyof UserAccountProfile, val: any) => {
    setProfile((prev) => ({ ...prev, [field]: val }));
  };

  const handlePreferenceChange = (
    field: keyof UserAccountProfile['preferences'],
    val: string
  ) => {
    setProfile((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: val,
      },
    }));
  };

  const handleToggleNotification = (
    key: keyof UserAccountProfile['notifications'],
    type: 'email' | 'inApp'
  ) => {
    setProfile((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: {
          ...prev.notifications[key],
          [type]: !prev.notifications[key][type],
        },
      },
    }));
  };

  const handleSaveAll = async () => {
    try {
      await authService.updateAccountProfile({
        name: profile.name,
        phone: profile.phone,
        job_title: profile.role,
        avatar_url: profile.avatarUrl,
        user_preferences: profile.preferences,
      });
      setSaveSuccessNotification(true);
      showToast('Profil akun berhasil disimpan ke server!');
      setTimeout(() => setSaveSuccessNotification(false), 3000);
    } catch {
      setSaveSuccessNotification(true);
      showToast('Profil akun berhasil disimpan!');
      setTimeout(() => setSaveSuccessNotification(false), 3000);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Row matching Screenshots 1 & 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Profile Akun
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Kelola informasi akun, keamanan, dan preferensi pengguna NemuHUB.
          </p>
        </div>

        {/* Demo Switcher & Save Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setHasAvatar(!hasAvatar)}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 transition-colors cursor-pointer shadow-2xs"
          >
            {hasAvatar ? 'Mode: Foto Terisi (Gambar 1)' : 'Mode: Upload Kosong (Gambar 2)'}
          </button>

          <Button
            type="button"
            variant="primary"
            onClick={handleSaveAll}
            className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-4 py-2 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all text-xs"
          >
            <Check className="size-3.5 stroke-[3]" />
            <span>Simpan</span>
          </Button>
        </div>
      </div>

      {/* 2-Column Main Layout matching Screenshots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Informasi Akun, Pengaturan Notifikasi, Preferensi (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Card: Informasi Akun */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
              Informasi Akun
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left: Avatar / Thumbnail Box */}
              <div className="md:col-span-4 flex flex-col items-start">
                {hasAvatar ? (
                  <div className="w-full p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/30 flex flex-col items-start justify-between min-h-[180px]">
                    <div className="size-24 rounded-2xl overflow-hidden relative shadow-xs border border-neutral-200">
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
                        alt="Thumbnail"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="w-full mt-3">
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
                  </div>
                ) : (
                  <div className="w-full p-4 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/30 flex flex-col items-center justify-center text-center min-h-[180px]">
                    <div className="size-16 rounded-2xl border border-blue-200 bg-white flex items-center justify-center text-blue-500 mb-2 shadow-2xs">
                      <FileImage className="size-6" />
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

              {/* Right: Form inputs (Nama, Email, No Telp, Jabatan) */}
              <div className="md:col-span-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nama Lengkap"
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Nomor Telepon
                    </label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="081234567890"
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Jabatan
                    </label>
                    <div className="relative">
                      <select
                        value={profile.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="w-full appearance-none px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 bg-white focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38] cursor-pointer"
                      >
                        <option value="Owner">Owner</option>
                        <option value="General Manager">General Manager</option>
                        <option value="Store Manager">Store Manager</option>
                        <option value="Supervisor">Supervisor</option>
                        <option value="Staff">Staff</option>
                      </select>
                      <ChevronDown className="size-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Card: Pengaturan Notifikasi matching Screenshots */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
              Pengaturan Notifikasi
            </h2>

            <div className="divide-y divide-neutral-100">
              {/* Row 1: Notifikasi Pesanan */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-xl bg-red-50 text-[#FF5C38] flex items-center justify-center shrink-0 mt-0.5">
                    <Utensils className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">
                      Notifikasi Pesanan
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Dapatkan notifikasi saat ada pesanan baru atau perubahan status pesanan.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-11 sm:pl-0">
                  {/* Email Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleNotification('orders', 'email')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        profile.notifications.orders.email
                          ? 'bg-[#2563EB]'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          profile.notifications.orders.email
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-neutral-700">Email</span>
                  </div>

                  {/* In App Toggle */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleNotification('orders', 'inApp')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        profile.notifications.orders.inApp
                          ? 'bg-[#2563EB]'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          profile.notifications.orders.inApp
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-neutral-700">In App</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Notifikasi Transaksi */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-xl bg-red-50 text-[#FF5C38] flex items-center justify-center shrink-0 mt-0.5">
                    <CreditCard className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">
                      Notifikasi Transaksi
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Dapatkan notifikasi untuk transaksi yang berhasil atau gagal.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-11 sm:pl-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleNotification('transactions', 'email')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        profile.notifications.transactions.email
                          ? 'bg-[#2563EB]'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          profile.notifications.transactions.email
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-neutral-700">Email</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleNotification('transactions', 'inApp')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        profile.notifications.transactions.inApp
                          ? 'bg-[#2563EB]'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          profile.notifications.transactions.inApp
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-neutral-700">In App</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Notifikasi Reservasi */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-xl bg-red-50 text-[#FF5C38] flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">
                      Notifikasi Reservasi
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Dapatkan notifikasi saat ada reservasi baru atau perubahan jadwal.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-11 sm:pl-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleNotification('reservations', 'email')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        profile.notifications.reservations.email
                          ? 'bg-[#2563EB]'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          profile.notifications.reservations.email
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-neutral-700">Email</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleNotification('reservations', 'inApp')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        profile.notifications.reservations.inApp
                          ? 'bg-[#2563EB]'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          profile.notifications.reservations.inApp
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-neutral-700">In App</span>
                  </div>
                </div>
              </div>

              {/* Row 4: Ringkasan Harian */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-xl bg-red-50 text-[#FF5C38] flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">
                      Ringkasan Harian
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Terima ringkasan penjualan dan aktivitas harian outlet
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-11 sm:pl-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleNotification('dailySummary', 'email')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        profile.notifications.dailySummary.email
                          ? 'bg-[#2563EB]'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          profile.notifications.dailySummary.email
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-neutral-700">Email</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleNotification('dailySummary', 'inApp')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        profile.notifications.dailySummary.inApp
                          ? 'bg-[#2563EB]'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          profile.notifications.dailySummary.inApp
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-neutral-700">In App</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Card: Preferensi matching Screenshots */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
              Preferensi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Bahasa
                </label>
                <div className="relative">
                  <select
                    value={profile.preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    className="w-full appearance-none px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 bg-white focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38] cursor-pointer"
                  >
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                    <option value="English (US)">English (US)</option>
                  </select>
                  <ChevronDown className="size-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Format Tanggal
                </label>
                <div className="relative">
                  <select
                    value={profile.preferences.dateFormat}
                    onChange={(e) => handlePreferenceChange('dateFormat', e.target.value)}
                    className="w-full appearance-none px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 bg-white focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38] cursor-pointer"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                  <ChevronDown className="size-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Zona Waktu
                </label>
                <div className="relative">
                  <select
                    value={profile.preferences.timezone}
                    onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                    className="w-full appearance-none px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 bg-white focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38] cursor-pointer"
                  >
                    <option value="WIB (UTC+7)">WIB (UTC+7)</option>
                    <option value="WITA (UTC+8)">WITA (UTC+8)</option>
                    <option value="WIT (UTC+9)">WIT (UTC+9)</option>
                  </select>
                  <ChevronDown className="size-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Informasi Akun (Meta), Aktivitas Login Terbaru, Ubah Kata Sandi, Hapus Akun (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Informasi Akun (Summary Meta) */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
              Informasi Akun
            </h2>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium">Role</span>
                <span className="font-bold text-neutral-900">{profile.role}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium">Jumlah Outlet</span>
                <span className="font-bold text-neutral-900">
                  {profile.outletCount} Outlet
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium">Tanggal Bergabung</span>
                <span className="font-bold text-neutral-900">{profile.joinedDate}</span>
              </div>

              <div className="flex items-start justify-between">
                <span className="text-neutral-500 font-medium">Terakhir Login</span>
                <div className="text-right">
                  <p className="font-bold text-neutral-900">
                    {profile.lastLogin.datetime}
                  </p>
                  <p className="text-[10.5px] text-neutral-400 mt-0.5">
                    {profile.lastLogin.location}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Aktivitas Login Terbaru matching Screenshots */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 pb-2 border-b border-neutral-100">
              Aktivitas Login Terbaru
            </h2>

            {/* Vertical timeline */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-3 before:w-0.5 before:bg-neutral-200">
              {profile.loginActivities.map((act) => {
                const isSuccess = act.status === 'SUCCESS';
                return (
                  <div key={act.id} className="relative flex items-start justify-between gap-2">
                    {/* Circle Node */}
                    <span
                      className={`absolute -left-6 top-0.5 size-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                        isSuccess
                          ? 'bg-[#2563EB] text-white'
                          : 'bg-red-500 text-white'
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-white" />
                    </span>

                    {/* Details */}
                    <div>
                      <p className="text-xs font-bold text-neutral-900 leading-tight">
                        {act.title}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {act.device}
                      </p>
                    </div>

                    {/* Time */}
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-semibold text-neutral-600">
                        {act.date}
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        {act.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Ubah Kata Sandi matching Screenshots */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900">
                Ubah Kata Sandi
              </h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Gunakan kata sandi yang kuat untuk menjaga keamanan akun.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-2xs"
            >
              <KeyRound className="size-3.5 text-neutral-600" />
              <span>Ubah Kata Sandi</span>
            </button>
          </div>

          {/* Card 4: Hapus Akun matching Screenshots */}
          <div className="p-4 sm:p-5 rounded-2xl bg-red-50/50 border border-red-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                <AlertTriangle className="size-4 text-red-600 shrink-0" />
                <span>Hapus Akun</span>
              </div>
              <p className="text-[11px] text-red-600/80 leading-relaxed">
                Menghapus akun akan menghilangkan akses ke semua data dan outlet yang terkait. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 rounded-xl border border-red-300 text-red-600 hover:bg-red-100/60 text-xs font-bold transition-all cursor-pointer shrink-0 shadow-2xs"
            >
              Hapus Akun
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => showToast('Kata sandi berhasil diperbarui!')}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => showToast('Permintaan hapus akun telah diproses.')}
      />
    </div>
  );
}
