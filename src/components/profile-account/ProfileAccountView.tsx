'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Loader2,
  Camera,
  Trash2,
} from 'lucide-react';
import { UserAccountProfile } from '@/types/account-profile';
import { ChangePasswordModal } from './ChangePasswordModal';
import { DeleteAccountModal } from './DeleteAccountModal';
import { Button } from '@/components/common/Button';
import { PageLoader } from '@/components/common/PageLoader';
import { authService } from '@/services/auth.service';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const INITIAL_ACCOUNT_DATA: UserAccountProfile = {
  name: '',
  email: '',
  phone: '',
  role: '',
  avatarUrl: null,
  outletCount: 0,
  joinedDate: '-',
  lastLogin: {
    datetime: '-',
    location: '-',
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
  loginActivities: [],
};

export function ProfileAccountView() {
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<UserAccountProfile>(INITIAL_ACCOUNT_DATA);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [saveSuccessNotification, setSaveSuccessNotification] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch live account profile and login activities from backend
  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        setIsLoading(true);
        const [profileRes, activitiesRes] = await Promise.allSettled([
          authService.getAccountProfile(),
          authService.getLoginActivities(),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
          const d = profileRes.value.data as any;
          const notifs = d.notification_preferences;
          const safeNotifs = {
            orders: {
              email: Boolean(notifs?.orders?.email ?? notifs?.order_email ?? true),
              inApp: Boolean(notifs?.orders?.inApp ?? true),
            },
            transactions: {
              email: Boolean(notifs?.transactions?.email ?? true),
              inApp: Boolean(notifs?.transactions?.inApp ?? true),
            },
            reservations: {
              email: Boolean(notifs?.reservations?.email ?? true),
              inApp: Boolean(notifs?.reservations?.inApp ?? true),
            },
            dailySummary: {
              email: Boolean(notifs?.dailySummary?.email ?? notifs?.sales_summary ?? true),
              inApp: Boolean(notifs?.dailySummary?.inApp ?? true),
            },
          };

          const prefs = d.user_preferences;
          const safePrefs = {
            language: 'Bahasa Indonesia',
            dateFormat: prefs?.dateFormat || 'DD/MM/YYYY',
            timezone: prefs?.timezone || 'WIB (UTC+7)',
          };

          setProfile((prev) => ({
            ...prev,
            name: d.name || user?.name || '',
            email: d.email || user?.email || '',
            phone: d.phone || '',
            role: d.job_title || d.role || prev.role || 'Staff',
            avatarUrl: d.avatar_url || null,
            outletCount: d.outlet_count || 1,
            joinedDate: d.joined_date || prev.joinedDate,
            lastLogin: d.last_login || prev.lastLogin,
            notifications: safeNotifs,
            preferences: safePrefs,
          }));
        }

        if (activitiesRes.status === 'fulfilled' && activitiesRes.value?.data) {
          const acts = activitiesRes.value.data.map((act: any) => ({
            id: act.id,
            status: act.status || 'SUCCESS',
            title: act.title || 'Login Berhasil',
            device: act.device || 'Web Browser',
            date: act.logged_at
              ? new Date(act.logged_at).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })
              : 'Hari ini',
            time: act.logged_at
              ? new Date(act.logged_at).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '10:00',
          }));
          setProfile((prev) => ({ ...prev, loginActivities: acts }));
        }
      } catch (err) {
        console.error('Failed to load account profile:', err);
        toast.error('Gagal memuat profil akun.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountData();
  }, [user, toast]);

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
    setProfile((prev) => {
      const currentNotifications = prev.notifications || INITIAL_ACCOUNT_DATA.notifications;
      const currentCategory = currentNotifications[key] || { email: true, inApp: true };
      return {
        ...prev,
        notifications: {
          ...currentNotifications,
          [key]: {
            ...currentCategory,
            [type]: !currentCategory[type],
          },
        },
      };
    });
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Format file harus berupa gambar.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProfile((prev) => ({ ...prev, avatarUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);

    if (avatarInputRef.current) {
      avatarInputRef.current.value = '';
    }
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      await authService.updateAccountProfile({
        name: profile.name,
        phone: profile.phone,
        job_title: profile.role,
        avatar_url: profile.avatarUrl,
        notification_preferences: profile.notifications,
        user_preferences: profile.preferences,
      });

      setSaveSuccessNotification(true);
      toast.success('Profil akun berhasil disimpan!');
      setTimeout(() => setSaveSuccessNotification(false), 3000);
      refreshUser();
    } catch (err: any) {
      console.error('Failed to update account profile:', err);
      toast.error(err.response?.data?.message || 'Gagal menyimpan profil akun.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <PageLoader text="Memuat profil akun..." />;
  }

  const initials =
    (profile.name || user?.name || 'User')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('') || 'U';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Hidden File Input for Avatar */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Profil Akun
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Kelola informasi akun pengguna, keamanan sandi, dan preferensi notifikasi.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccessNotification && (
            <span className="text-xs font-bold text-emerald-600 animate-in fade-in flex items-center gap-1.5">
              <CheckCircle2 className="size-4" />
              Tersimpan!
            </span>
          )}
          <Button
            type="button"
            variant="primary"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all text-xs disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Check className="size-3.5 stroke-[3]" />
            )}
            <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </Button>
        </div>
      </div>

      {/* 2-Column Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Informasi Akun, Pengaturan Notifikasi, Preferensi (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* 1. Card: Informasi Akun */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
              Informasi Akun
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left: Avatar Upload Box */}
              <div className="md:col-span-4 flex flex-col items-start w-full">
                {profile.avatarUrl ? (
                  <div className="w-full p-4 rounded-xl border border-neutral-200/90 bg-neutral-50/40 flex flex-col items-center justify-between min-h-[190px]">
                    <div className="size-20 rounded-2xl overflow-hidden relative shadow-xs border border-neutral-200 bg-white">
                      <img
                        src={profile.avatarUrl}
                        alt="Avatar"
                        className="size-full object-cover"
                      />
                    </div>
                    <div className="w-full text-center mt-3">
                      <p className="text-xs font-bold text-neutral-800">
                        Foto Profil
                      </p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">
                        Rasio 1:1, Maks. 2MB
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-2.5">
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="px-3 py-1 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Ganti Foto
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInputChange('avatarUrl', null)}
                          className="px-2 py-1 text-xs text-red-500 hover:underline font-semibold cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="w-full p-4 rounded-xl border-2 border-dashed border-neutral-300 hover:border-[#FF5C38] bg-neutral-50/50 hover:bg-orange-50/20 flex flex-col items-center justify-center text-center min-h-[190px] transition-all cursor-pointer group"
                  >
                    <div className="size-16 rounded-2xl bg-[#FF5C38] text-white flex items-center justify-center font-bold text-xl shadow-xs mb-2">
                      {initials}
                    </div>
                    <p className="text-xs font-bold text-neutral-800 group-hover:text-[#FF5C38] transition-colors">
                      Upload Foto Profil
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      WebP, JPG, PNG. Rasio 1:1
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

              {/* Right: Form inputs (Nama, Email, No Telp, Jabatan) */}
              <div className="md:col-span-8 space-y-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Nama Lengkap *
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
                      disabled
                      placeholder="email@example.com"
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 bg-neutral-100/70 text-xs font-medium text-neutral-500 cursor-not-allowed"
                    />
                    <p className="text-[10px] text-neutral-400 mt-1">
                      Digunakan untuk login (tidak dapat diubah)
                    </p>
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
                      placeholder="Contoh: 0812-3456-7890"
                      className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                      Jabatan / Posisi
                    </label>
                    <div className="relative">
                      <select
                        value={profile.role}
                        onChange={(e) => handleInputChange('role', e.target.value)}
                        className="w-full appearance-none px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 bg-white focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38] cursor-pointer"
                      >
                        <option value="Owner">Owner</option>
                        <option value="Admin Internal">Admin Internal</option>
                        <option value="General Manager">General Manager</option>
                        <option value="Store Manager">Store Manager</option>
                        <option value="Kasir">Kasir</option>
                        <option value="Inventory">Inventory</option>
                        <option value="Dapur">Dapur</option>
                        <option value="Staff">Staff</option>
                      </select>
                      <ChevronDown className="size-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Card: Pengaturan Notifikasi */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
              Pengaturan Notifikasi
            </h2>

            <div className="divide-y divide-neutral-100">
              {/* Row 1: Notifikasi Pesanan */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-xl bg-orange-50 text-[#FF5C38] flex items-center justify-center shrink-0 mt-0.5">
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
                        profile.notifications?.orders?.email
                          ? 'bg-[#FF5C38]'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          profile.notifications?.orders?.email
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
                        profile.notifications?.orders?.inApp
                          ? 'bg-[#FF5C38]'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          profile.notifications?.orders?.inApp
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-neutral-700">Notif Aplikasi</span>
                  </div>
                </div>
              </div>

              {/* Row 2: Notifikasi Transaksi */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-xl bg-orange-50 text-[#FF5C38] flex items-center justify-center shrink-0 mt-0.5">
                    <CreditCard className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">
                      Notifikasi Transaksi
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Dapatkan notifikasi untuk transaksi yang berhasil atau refund pembayaran.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-11 sm:pl-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleNotification('transactions', 'email')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        profile.notifications?.transactions?.email
                          ? 'bg-[#FF5C38]'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          profile.notifications?.transactions?.email
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
                        profile.notifications?.transactions?.inApp
                          ? 'bg-[#FF5C38]'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          profile.notifications?.transactions?.inApp
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-neutral-700">Notif Aplikasi</span>
                  </div>
                </div>
              </div>

              {/* Row 3: Notifikasi Reservasi */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-xl bg-orange-50 text-[#FF5C38] flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">
                      Notifikasi Reservasi
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Dapatkan notifikasi saat ada reservasi meja baru atau pembatalan.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-11 sm:pl-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleNotification('reservations', 'email')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        profile.notifications?.reservations?.email
                          ? 'bg-[#FF5C38]'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          profile.notifications?.reservations?.email
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
                        profile.notifications?.reservations?.inApp
                          ? 'bg-[#FF5C38]'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          profile.notifications?.reservations?.inApp
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-neutral-700">Notif Aplikasi</span>
                  </div>
                </div>
              </div>

              {/* Row 4: Ringkasan Harian */}
              <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-xl bg-orange-50 text-[#FF5C38] flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="size-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-900">
                      Ringkasan Harian
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Terima ringkasan omset dan aktivitas harian outlet setiap malam.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 pl-11 sm:pl-0">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleNotification('dailySummary', 'email')}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        profile.notifications?.dailySummary?.email
                          ? 'bg-[#FF5C38]'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          profile.notifications?.dailySummary?.email
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
                        profile.notifications?.dailySummary?.inApp
                          ? 'bg-[#FF5C38]'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          profile.notifications?.dailySummary?.inApp
                            ? 'translate-x-4'
                            : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-neutral-700">Notif Aplikasi</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Card: Preferensi */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
              Preferensi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                  Bahasa Antarmuka
                </label>
                <div className="relative">
                  <select
                    value={profile.preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    className="w-full appearance-none px-3.5 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-900 bg-white focus:outline-none focus:border-[#FF5C38] focus:ring-1 focus:ring-[#FF5C38] cursor-pointer"
                  >
                    <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  </select>
                  <ChevronDown className="size-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Bahasa default sistem operasional
                </p>
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
                    <option value="DD/MM/YYYY">DD/MM/YYYY (Contoh: 02/11/2026)</option>
                    <option value="DD MMMM YYYY">DD MMMM YYYY (Contoh: 2 November 2026)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (Contoh: 2026-11-02)</option>
                  </select>
                  <ChevronDown className="size-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Format tampilan tanggal di aplikasi
                </p>
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
                    <option value="WIB (UTC+7)">WIB (UTC+7) - Waktu Indonesia Barat</option>
                    <option value="WITA (UTC+8)">WITA (UTC+8) - Waktu Indonesia Tengah</option>
                    <option value="WIT (UTC+9)">WIT (UTC+9) - Waktu Indonesia Timur</option>
                  </select>
                  <ChevronDown className="size-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <p className="text-[10px] text-neutral-400 mt-1">
                  Standar waktu operasional transaksi
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Informasi Akun (Meta), Aktivitas Login Terbaru, Ubah Kata Sandi, Hapus Akun (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card 1: Informasi Akun (Summary Meta) */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
              Ringkasan Akun
            </h2>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium">Peran Akun</span>
                <span className="font-bold text-[#FF5C38] px-2 py-0.5 rounded-lg bg-orange-50 border border-orange-100">
                  {profile.role}
                </span>
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

          {/* Card 2: Aktivitas Login Terbaru */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 space-y-4">
            <h2 className="text-sm sm:text-base font-bold text-neutral-900 pb-2 border-b border-neutral-100">
              Aktivitas Login Terbaru
            </h2>

            {profile.loginActivities.length === 0 ? (
              <p className="text-xs text-neutral-400 py-4 text-center">
                Belum ada riwayat aktivitas login tercatat.
              </p>
            ) : (
              <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-3 before:w-0.5 before:bg-neutral-200">
                {profile.loginActivities.map((act) => {
                  const isSuccess = act.status === 'SUCCESS';
                  return (
                    <div key={act.id} className="relative flex items-start justify-between gap-2">
                      {/* Circle Node */}
                      <span
                        className={`absolute -left-6 top-0.5 size-5 rounded-full flex items-center justify-center ring-4 ring-white ${
                          isSuccess
                            ? 'bg-[#FF5C38] text-white'
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
            )}
          </div>

          {/* Card 3: Ubah Kata Sandi */}
          <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs sm:text-sm font-bold text-neutral-900">
                Ubah Kata Sandi
              </h3>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Gunakan kata sandi yang kuat untuk menjaga keamanan akun Anda.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="px-3.5 py-2 rounded-xl border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 shadow-2xs"
            >
              <KeyRound className="size-3.5 text-neutral-600" />
              <span>Ubah Sandi</span>
            </button>
          </div>

          {/* Card 4: Hapus Akun */}
          <div className="p-4 sm:p-5 rounded-2xl bg-red-50/50 border border-red-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-red-600">
                <AlertTriangle className="size-4 text-red-600 shrink-0" />
                <span>Hapus Akun</span>
              </div>
              <p className="text-[11px] text-red-600/80 leading-relaxed">
                Menghapus akun akan menghilangkan hak akses dan data yang terkait secara permanen.
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
        onSuccess={() => toast.success('Kata sandi berhasil diperbarui!')}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => toast.info('Permintaan hapus akun telah diterima.')}
      />
    </div>
  );
}
