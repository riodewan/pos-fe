'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Store,
  Clock,
  FileText,
  Sparkles,
  ArrowRight,
  Upload,
  Wifi,
  Wind,
  Zap,
  Cigarette,
  ShieldCheck,
  Car,
  Bike,
  QrCode,
  X,
  Coffee,
  Building,
  Cloud,
  CheckCircle2,
  Check,
  Link2,
  User as UserIcon,
  Loader2,
} from 'lucide-react';
import { ProgressStepper, StepItem } from '@/components/common/ProgressStepper';
import { ReviewSummaryCard } from '@/components/common/ReviewSummaryCard';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { tenantService } from '@/services/tenant.service';
import { authService } from '@/services/auth.service';
import { useToast } from '@/context/ToastContext';

const ONBOARDING_STEPS: StepItem[] = [
  { num: 1, label: 'Identitas Outlet' },
  { num: 2, label: 'Jam Operasional' },
  { num: 3, label: 'Deskripsi' },
  { num: 4, label: 'Fasilitas' },
  { num: 5, label: 'Review' },
];

export interface FirstLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface DaySchedule {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export function FirstLoginModal({ isOpen, onClose, onComplete }: FirstLoginModalProps) {
  const { toast } = useToast();
  const { user, activeTenant, refreshUser } = useAuth();
  const { stores, activeStore, refreshStores } = useStore();

  // modalMode: 'welcome' | 'owner' | 'stepper' | 'success'
  const [modalMode, setModalMode] = useState<'welcome' | 'owner' | 'stepper' | 'success'>('welcome');
  // step inside stepper: 1 to 5
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Owner profile
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerJobTitle, setOwnerJobTitle] = useState('');

  useEffect(() => {
    if (user) {
      setOwnerName((prev) => prev || user.name || '');
      setOwnerPhone((prev) => prev || (user as any).phone || '');
      setOwnerJobTitle((prev) => prev || (user as any).job_title || '');
    }
  }, [user]);

  const targetStore = activeStore || stores?.[0] || null;

  // Step 1: Identitas Outlet
  const [logoData, setLogoData] = useState<string>('');
  const [logoFileName, setLogoFileName] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Jam Operasional
  const [schedules, setSchedules] = useState<DaySchedule[]>([
    { day: 'Senin', isOpen: true, openTime: '08:00', closeTime: '22:00' },
    { day: 'Selasa', isOpen: true, openTime: '08:00', closeTime: '22:00' },
    { day: 'Rabu', isOpen: true, openTime: '08:00', closeTime: '22:00' },
    { day: 'Kamis', isOpen: true, openTime: '08:00', closeTime: '22:00' },
    { day: 'Jumat', isOpen: true, openTime: '08:00', closeTime: '22:00' },
    { day: 'Sabtu', isOpen: true, openTime: '08:00', closeTime: '22:00' },
    { day: 'Minggu', isOpen: true, openTime: '08:00', closeTime: '22:00' },
  ]);

  // Step 3: Deskripsi
  const [description, setDescription] = useState('');

  // Step 4: Fasilitas Outlet (Fetched from Global Master Data curated by Internal Admin)
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [masterFacilities, setMasterFacilities] = useState<Array<{ id: string; name: string; code?: string; icon?: string }>>([]);

  useEffect(() => {
    if (!isOpen) return;
    tenantService
      .getGlobalMasterData()
      .then((res) => {
        if (res.data?.facilities) {
          setMasterFacilities(res.data.facilities);
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const renderFacilityIcon = (codeOrIcon?: string) => {
    const key = (codeOrIcon || '').toLowerCase();
    if (key.includes('wifi')) return <Wifi className="size-5" />;
    if (key.includes('ac') || key.includes('wind')) return <Wind className="size-5" />;
    if (key.includes('outdoor') || key.includes('sun') || key.includes('cloud')) return <Cloud className="size-5" />;
    if (key.includes('park') || key.includes('car')) return <Car className="size-5" />;
    if (key.includes('power') || key.includes('zap')) return <Zap className="size-5" />;
    if (key.includes('smok') || key.includes('flame')) return <Cigarette className="size-5" />;
    if (key.includes('indoor') || key.includes('store')) return <Store className="size-5" />;
    return <Sparkles className="size-5" />;
  };

  if (!isOpen) return null;

  const toggleDaySchedule = (index: number) => {
    setSchedules((prev) =>
      prev.map((item, i) => (i === index ? { ...item, isOpen: !item.isOpen } : item))
    );
  };

  const updateScheduleTime = (
    index: number,
    field: 'openTime' | 'closeTime',
    value: string
  ) => {
    setSchedules((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const readImage = (file: File): Promise<string | null> =>
    new Promise((resolve) => {
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Format file harus berupa gambar (WebP, JPG, PNG).');
        return resolve(null);
      }
      if (file.size > 2 * 1024 * 1024) {
        setErrorMsg('Ukuran gambar maksimal 2MB.');
        return resolve(null);
      }
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await readImage(file);
    if (data) {
      setLogoData(data);
      setLogoFileName(file.name);
    }
    e.target.value = '';
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const data = await readImage(file);
    if (data) setPhotos((prev) => [...prev, data]);
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleFacility = (facilityId: string) => {
    setSelectedFacilities((prev) =>
      prev.includes(facilityId)
        ? prev.filter((id) => id !== facilityId)
        : [...prev, facilityId]
    );
  };

  const handleSaveOwner = async () => {
    if (!ownerName.trim()) {
      setErrorMsg('Nama lengkap wajib diisi.');
      return;
    }
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await authService.updateAccountProfile({
        name: ownerName.trim(),
        phone: ownerPhone.trim() || null,
        job_title: ownerJobTitle.trim() || null,
      });
      await refreshUser();
      setModalMode('stepper');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyimpan profil pemilik.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinish = async () => {
    if (!targetStore) {
      setErrorMsg('Outlet belum tersedia. Silakan hubungi admin.');
      return;
    }
    setIsSaving(true);
    setErrorMsg(null);
    try {
      await tenantService.updateOutletProfile(
        {
          store_id: targetStore.id,
          logo_url: logoData,
          description: description.trim() || null,
          operating_hours: schedules,
          facilities: selectedFacilities,
          photos: photos.map((url, i) => ({
            id: `photo-${Date.now()}-${i}`,
            url,
            title: `Foto Outlet ${i + 1}`,
            category: 'Lainnya',
          })),
        },
        targetStore.id
      );
      await tenantService.completeOnboarding();
      await Promise.all([refreshUser(), refreshStores()]);
      setModalMode('success');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyimpan profil outlet.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalDashboardRedirect = () => {
    if (onComplete) onComplete();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      {modalMode === 'welcome' ? (
        /* ============================================================ */
        /* MODAL 0: SELAMAT DATANG DI NEMUPOS                           */
        /* ============================================================ */
        <div className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl p-7 flex flex-col items-center animate-in zoom-in-95 duration-200">
          {/* Party Popper Illustration */}
          <div className="w-20 h-20 mb-3 flex items-center justify-center relative">
            <svg
              className="w-16 h-16 transform -rotate-12"
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14 48L44 18C45.5 19.5 46.5 21.5 46.5 24L20 50C17.5 50 15.5 49.5 14 48Z"
                fill="#FF8265"
              />
              <path
                d="M10 52L24 38L30 44L16 58C13 58 11 55 10 52Z"
                fill="#A855F7"
              />
              <path
                d="M20 42L36 26L41 31L25 47L20 42Z"
                fill="#FBBF24"
              />
              <circle cx="50" cy="14" r="2.5" fill="#3B82F6" />
              <circle cx="56" cy="22" r="2" fill="#10B981" />
              <circle cx="42" cy="10" r="2.5" fill="#EF4444" />
              <circle cx="48" cy="28" r="1.5" fill="#F59E0B" />
              <circle cx="58" cy="12" r="2" fill="#8B5CF6" />
              <path
                d="M36 8C39 6 44 8 46 6"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M52 32C55 35 53 38 56 40"
                stroke="#EC4899"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h2 className="text-[20px] font-bold text-neutral-900 tracking-tight text-center mb-1.5">
            Selamat datang di NemuPOS!
          </h2>
          <p className="text-[12.5px] text-neutral-500 text-center leading-relaxed max-w-[380px] mb-6">
            Akun kamu sudah disetujui. Yuk, lengkapi profil toko agar siap
            menggunakan NemuPOS dan tampil di{' '}
            <span className="text-[#FF5C38] font-medium">NemuSosial</span>.
          </p>

          <div className="w-full space-y-4 mb-7">
            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Store className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[13.5px] font-semibold text-neutral-900 leading-tight">
                  Identitas toko
                </h4>
                <p className="text-[12px] text-neutral-500 leading-tight mt-0.5">
                  Logo dan minimal 2 foto toko
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                <Clock className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[13.5px] font-semibold text-neutral-900 leading-tight">
                  Jam operasional
                </h4>
                <p className="text-[12px] text-neutral-500 leading-tight mt-0.5">
                  Atur jadwal buka dan tutup toko
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100">
                <FileText className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[13.5px] font-semibold text-neutral-900 leading-tight">
                  Deskripsi toko
                </h4>
                <p className="text-[12px] text-neutral-500 leading-tight mt-0.5">
                  Ceritakan tentang tokomu (opsional)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                <Zap className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[13.5px] font-semibold text-neutral-900 leading-tight">
                  Fasilitas toko
                </h4>
                <p className="text-[12px] text-neutral-500 leading-tight mt-0.5">
                  Pilih fasilitas yang tersedia
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setModalMode('owner')}
            className="w-full h-12 rounded-xl bg-[#FF5C38] hover:bg-[#FF4D2D] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
          >
            <span>Lengkapi Profil Toko</span>
            <ArrowRight className="size-4" />
          </button>
        </div>
      ) : modalMode === 'owner' ? (
        <div className="relative w-full max-w-[500px] bg-white rounded-2xl shadow-2xl p-7 flex flex-col animate-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="size-11 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
              <UserIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-[19px] font-bold text-neutral-900 tracking-tight">Profil Pemilik</h2>
              <p className="text-[12px] text-neutral-500 mt-0.5">
                Lengkapi data akun Owner untuk {activeTenant?.name || 'tokomu'}.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Nama Lengkap *</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#FF5C38]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Email</label>
              <input
                type="text"
                value={user?.email || ''}
                disabled
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Nomor Telepon</label>
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#FF5C38]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Jabatan</label>
              <input
                type="text"
                value={ownerJobTitle}
                onChange={(e) => setOwnerJobTitle(e.target.value)}
                placeholder="Contoh: Pemilik / Founder"
                className="w-full h-11 px-3.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-[#FF5C38]"
              />
            </div>
          </div>

          {errorMsg && (
            <p className="mt-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorMsg}</p>
          )}

          <div className="pt-5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                setModalMode('welcome');
              }}
              className="flex-1 h-11 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-red-500 font-medium text-sm transition-colors"
            >
              Kembali
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveOwner}
              className="flex-1 h-11 rounded-xl bg-[#FF5C38] hover:bg-[#FF4D2D] disabled:opacity-60 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all"
            >
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : null}
              <span>Simpan & Lanjutkan</span>
              {!isSaving && <ArrowRight className="size-4" />}
            </button>
          </div>
        </div>
      ) : modalMode === 'stepper' ? (
        /* ============================================================ */
        /* MODAL 1-5: PROFILE OUTLET STEPPER                            */
        /* ============================================================ */
        <div className="relative w-full max-w-[540px] bg-white rounded-2xl shadow-2xl p-7 flex flex-col animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="mb-5">
            <h2 className="text-[19px] font-bold text-neutral-900 tracking-tight">
              Profile Outlet
            </h2>
            <p className="text-[12px] text-neutral-500 mt-1">
              Lengkapi profil outlet untuk mulai menggunakan NemuPOS dan tampil
              di NemuSosial.
            </p>
          </div>

          {/* 5-Step Progress Stepper using Global ProgressStepper Component */}
          <ProgressStepper
            steps={ONBOARDING_STEPS}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
          />

          {/* ============================================================ */}
          {/* STEP 1: IDENTITAS OUTLET                                     */}
          {/* ============================================================ */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-2.5">
                  Logo Outlet
                </h3>

                {logoData ? (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative size-14 rounded-xl overflow-hidden border border-neutral-200 shrink-0 shadow-sm">
                        <Image src={logoData} alt="Logo outlet" fill unoptimized className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-blue-600 truncate">
                          {logoFileName}
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          WeBP, JPG, PNG. Ratio 1:1, Maks. 2MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 text-xs font-medium transition-colors shrink-0"
                    >
                      Pilih file
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-3 rounded-xl border border-dashed border-blue-300 bg-blue-50/30">
                    <div className="size-14 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <Upload className="size-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-neutral-800">
                        Upload Logo outlet
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        WeBP, JPG, PNG. Ratio 1:1, Maks. 2MB
                      </p>
                    </div>
                    <button
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3.5 py-1.5 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 text-xs font-medium transition-colors shrink-0"
                    >
                      Pilih file
                    </button>
                  </div>
                )}

                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                />
              </div>

              <div>
                <div className="mb-2.5">
                  <h3 className="text-sm font-semibold text-neutral-900">
                    Foto Outlet <span className="font-normal text-neutral-500">(Minimal 2 Foto)</span>
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    WeBP, JPG, PNG. Ratio 3:4, Maks. 2MB
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  {photos.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-28 rounded-xl overflow-hidden border border-neutral-200 group shrink-0 shadow-sm"
                    >
                      <Image
                        src={src}
                        alt={`Foto Outlet ${idx + 1}`}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                      <button
                        onClick={() => removePhoto(idx)}
                        className="absolute top-1 right-1 size-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                        title="Hapus foto"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="w-20 h-28 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-50 text-blue-600 flex flex-col items-center justify-center gap-1.5 transition-colors shrink-0"
                  >
                    <div className="size-7 rounded-lg bg-white shadow-sm flex items-center justify-center">
                      <Upload className="size-4 text-blue-600" />
                    </div>
                    <span className="text-[11px] font-medium">Upload</span>
                  </button>

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorMsg}</p>
              )}

              <div className="pt-4 flex items-center justify-end">
                <button
                  disabled={!logoData || photos.length < 2}
                  onClick={() => setCurrentStep(2)}
                  className={`w-full h-11 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    logoData && photos.length >= 2
                      ? 'bg-[#FF5C38] hover:bg-[#FF4D2D] shadow-md'
                      : 'bg-[#FF8265]/50 cursor-not-allowed'
                  }`}
                >
                  <span>Lanjutkan</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 2: JAM OPERASIONAL                                      */}
          {/* ============================================================ */}
          {currentStep === 2 && (
            <div className="space-y-3.5">
              {schedules.map((item, idx) => (
                <div key={item.day} className="flex items-center gap-3">
                  <span className="w-16 text-sm font-semibold text-neutral-800">
                    {item.day}
                  </span>

                  {item.isOpen ? (
                    <div className="flex-1 flex items-center gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={item.openTime}
                          onChange={(e) =>
                            updateScheduleTime(idx, 'openTime', e.target.value)
                          }
                          className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-800 focus:outline-none focus:border-blue-500"
                        />
                        <Clock className="absolute right-3 top-3 size-4 text-neutral-400" />
                      </div>
                      <span className="text-neutral-400 font-bold">—</span>
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={item.closeTime}
                          onChange={(e) =>
                            updateScheduleTime(idx, 'closeTime', e.target.value)
                          }
                          className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-sm font-medium text-neutral-800 focus:outline-none focus:border-blue-500"
                        />
                        <Clock className="absolute right-3 top-3 size-4 text-neutral-400" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center text-sm font-medium text-neutral-400">
                        Tutup
                      </div>
                    </div>
                  )}

                  <Switch
                    checked={item.isOpen}
                    onCheckedChange={() => toggleDaySchedule(idx)}
                    aria-label={`Jadwal ${item.day}`}
                  />
                </div>
              ))}

              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 h-11 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-red-500 font-medium text-sm transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 h-11 rounded-xl bg-[#FF5C38] hover:bg-[#FF4D2D] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 3: DESKRIPSI (SCREENSHOT 5 & 4)                         */}
          {/* ============================================================ */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-neutral-800 mb-2">
                  Tentang Outlet <span className="font-normal text-neutral-400">(Opsional)</span>
                </label>
                <textarea
                  rows={6}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tulis deskripsi di sini..."
                  className="w-full p-3.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:border-orange-500 resize-none leading-relaxed"
                />
              </div>

              {/* Bottom Buttons */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 h-11 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-red-500 font-medium text-sm transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 h-11 rounded-xl bg-[#FF5C38] hover:bg-[#FF4D2D] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 4: FASILITAS OUTLET (SCREENSHOT 3 & 2)                  */}
          {/* ============================================================ */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Fasilitas Outlet
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Pilih semua fasilitas yang tersedia di outlet kamu.
                </p>
              </div>

              {/* Grid of Global Master Facilities */}
              {masterFacilities.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">
                  Belum ada master fasilitas aktif dari admin platform.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {masterFacilities.map((fac) => {
                    const isSelected = selectedFacilities.includes(fac.name);
                    return (
                      <button
                        key={fac.id}
                        type="button"
                        onClick={() => toggleFacility(fac.name)}
                        className={`h-[82px] rounded-2xl flex flex-col items-center justify-center gap-1.5 p-2 text-center transition-all cursor-pointer ${
                          isSelected
                            ? 'border-2 border-blue-400 bg-blue-50/70 text-blue-600 shadow-xs'
                            : 'border border-neutral-200 hover:border-neutral-300 bg-white text-neutral-600'
                        }`}
                      >
                        <div className={isSelected ? 'text-blue-600' : 'text-neutral-500'}>
                          {renderFacilityIcon(fac.code || fac.icon || fac.name)}
                        </div>
                        <span
                          className={`text-[10px] leading-tight font-medium ${
                            isSelected ? 'font-semibold text-blue-600' : 'text-neutral-600'
                          }`}
                        >
                          {fac.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Bottom Buttons */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 h-11 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-red-500 font-medium text-sm transition-colors"
                >
                  Kembali
                </button>
                <button
                  disabled={selectedFacilities.length === 0}
                  onClick={() => setCurrentStep(5)}
                  className={`flex-1 h-11 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    selectedFacilities.length > 0
                      ? 'bg-[#FF5C38] hover:bg-[#FF4D2D] text-white shadow-md'
                      : 'bg-[#FF8265]/50 text-white cursor-not-allowed'
                  }`}
                >
                  <span>Review Profile</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* STEP 5: REVIEW PROFILE OUTLET (SCREENSHOT 1)                 */}
          {/* ============================================================ */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Review Profile Outlet
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Pastikan semua informasi sudah benar sebelum disimpan.
                </p>
              </div>

              {/* 4 Summary Cards using Global ReviewSummaryCard Component */}
              <div className="space-y-3">
                {/* 1. Identitas Outlet */}
                <ReviewSummaryCard
                  icon={<Building className="size-3.5" />}
                  iconBgColor="bg-emerald-50"
                  iconTextColor="text-emerald-600"
                  title="Identitas Outlet"
                  onEdit={() => setCurrentStep(1)}
                >
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-6">
                      <span className="w-16 text-neutral-500">Logo</span>
                      <div className="relative size-12 rounded-xl overflow-hidden border border-neutral-200 shadow-sm">
                        {logoData && <Image src={logoData} alt="Logo outlet" fill unoptimized className="object-cover" />}
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="w-16 text-neutral-500">Foto Outlet</span>
                      <div className="flex items-center gap-2">
                        {photos.map((src, idx) => (
                          <div
                            key={idx}
                            className="relative size-12 rounded-lg overflow-hidden border border-neutral-200 shadow-xs"
                          >
                            <Image
                              src={src}
                              alt="Outlet preview"
                              fill
                              unoptimized
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ReviewSummaryCard>

                {/* 2. Jam Operasional */}
                <ReviewSummaryCard
                  icon={<Clock className="size-3.5" />}
                  iconBgColor="bg-teal-50"
                  iconTextColor="text-teal-600"
                  title="Jam Operasional"
                  onEdit={() => setCurrentStep(2)}
                >
                  <div className="space-y-1 text-xs">
                    {schedules.map((s) => (
                      <div key={s.day} className="flex items-center gap-8">
                        <span className="w-16 font-semibold text-neutral-900">{s.day}</span>
                        <span className="text-neutral-600">
                          {s.isOpen ? `${s.openTime} - ${s.closeTime}` : 'Tutup'}
                        </span>
                      </div>
                    ))}
                  </div>
                </ReviewSummaryCard>

                {/* 3. Deskripsi */}
                <ReviewSummaryCard
                  icon={<FileText className="size-3.5" />}
                  iconBgColor="bg-teal-50"
                  iconTextColor="text-teal-600"
                  title="Deskripsi"
                  onEdit={() => setCurrentStep(3)}
                >
                  <p className="text-xs text-neutral-700 leading-relaxed">
                    {description || 'Belum ada deskripsi.'}
                  </p>
                </ReviewSummaryCard>

                {/* 4. Fasilitas */}
                <ReviewSummaryCard
                  icon={<Zap className="size-3.5" />}
                  iconBgColor="bg-emerald-50"
                  iconTextColor="text-emerald-600"
                  title="Fasilitas"
                  onEdit={() => setCurrentStep(4)}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedFacilities.map((fac) => (
                      <span
                        key={fac}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-500 border border-red-200"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                </ReviewSummaryCard>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorMsg}</p>
              )}

              {/* Bottom Buttons */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 h-11 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-red-500 font-medium text-sm transition-colors"
                >
                  Kembali
                </button>
                <button
                  disabled={isSaving}
                  onClick={handleFinish}
                  className="flex-1 h-11 rounded-xl bg-[#FF5C38] hover:bg-[#FF4D2D] disabled:opacity-60 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  {isSaving && <Loader2 className="size-4 animate-spin" />}
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Profile'}</span>
                  {!isSaving && <ArrowRight className="size-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ============================================================ */
        /* MODAL 6: SUCCESS MODAL (DATA BERHASIL DISIMPAN)              */
        /* ============================================================ */
        <div className="relative w-full max-w-[480px] bg-white rounded-3xl shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200 overflow-hidden">
          {/* Main Content Area */}
          <div className="w-full px-8 pt-9 pb-0 flex flex-col items-center z-10">
            {/* Glowing Green Checkmark Badge */}
            <div className="size-24 rounded-full bg-emerald-50 flex items-center justify-center ring-8 ring-emerald-50/70 mb-6">
              <div className="size-16 rounded-full bg-[#10B981] text-white flex items-center justify-center shadow-md">
                <Check className="size-9 text-white" strokeWidth={3.5} />
              </div>
            </div>

            {/* Heading */}
            <h2 className="text-[20px] font-bold text-neutral-900 tracking-tight text-center mb-2">
              Profile outlet berhasil disimpan
            </h2>

            {/* Subtitle */}
            <p className="text-[13px] text-neutral-500 text-center leading-relaxed max-w-[360px] mb-8">
              Data outlet kamu sudah tersimpan dan akan segera tersedia di{' '}
              <span className="text-neutral-700 font-medium">NemuSosil</span>
            </p>

            {/* Action Buttons */}
            <button
              type="button"
              onClick={handleFinalDashboardRedirect}
              className="w-full h-12 rounded-xl bg-[#FF5C38] hover:bg-[#FF4D2D] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all mb-3 active:scale-[0.99]"
            >
              <span>Lihat Profile di NemuSosial</span>
              <Link2 className="size-4" />
            </button>

            <button
              type="button"
              onClick={handleFinalDashboardRedirect}
              className="w-full h-12 rounded-xl border border-[#FF5C38] text-[#FF5C38] hover:bg-orange-50 font-medium text-sm flex items-center justify-center transition-colors mb-2 active:scale-[0.99]"
            >
              Masuk ke Dashboard
            </button>
          </div>

          {/* Bottom Landscape & Foliage SVG Illustration matching Figma */}
          <div className="w-full h-28 relative -mt-2 pointer-events-none">
            <svg
              className="w-full h-full"
              viewBox="0 0 480 110"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              {/* Back pastel blue hill */}
              <path
                d="M0 110V55C80 30 160 70 240 45C320 20 400 65 480 40V110H0Z"
                fill="#E0F2FE"
              />
              {/* Front soft sky blue hill */}
              <path
                d="M0 110V70C90 55 180 85 270 60C360 35 430 75 480 60V110H0Z"
                fill="#BAE6FD"
                fillOpacity="0.55"
              />
              {/* Left botanical peach / coral fronds */}
              <path
                d="M135 110C125 80 140 50 155 35C165 60 170 85 160 110"
                fill="#FF8265"
                fillOpacity="0.8"
              />
              <path
                d="M160 110C170 75 190 60 205 50C210 75 195 95 180 110"
                fill="#FCA5A5"
                fillOpacity="0.85"
              />
              <path
                d="M115 110C120 85 110 68 100 55C115 65 130 85 130 110"
                fill="#E2E8F0"
                fillOpacity="0.95"
              />
              {/* Right botanical peach / coral fronds */}
              <path
                d="M325 110C315 78 300 60 285 50C300 70 315 92 310 110"
                fill="#FCA5A5"
                fillOpacity="0.85"
              />
              <path
                d="M335 110C325 82 320 58 310 35C330 55 345 82 340 110"
                fill="#FF8265"
                fillOpacity="0.8"
              />
              <path
                d="M350 110C360 88 375 70 390 55C385 78 370 95 360 110"
                fill="#E2E8F0"
                fillOpacity="0.95"
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
