'use client';

import React, { useState, useRef } from 'react';
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
} from 'lucide-react';

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
  // modalMode: 'welcome' | 'stepper' | 'success'
  const [modalMode, setModalMode] = useState<'welcome' | 'stepper' | 'success'>('welcome');
  // step inside stepper: 1 to 5
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Identitas Outlet
  const [logoUploaded, setLogoUploaded] = useState(true);
  const [logoFileName, setLogoFileName] = useState('Logo_KopiMantap.webp');
  const [photos, setPhotos] = useState<string[]>([
    '/img/outlet/interior.jpg',
    '/img/outlet/exterior.jpg',
  ]);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Jam Operasional
  const [schedules, setSchedules] = useState<DaySchedule[]>([
    { day: 'Senin', isOpen: true, openTime: '08:00', closeTime: '23:00' },
    { day: 'Selasa', isOpen: true, openTime: '08:00', closeTime: '23:00' },
    { day: 'Rabu', isOpen: true, openTime: '08:00', closeTime: '23:00' },
    { day: 'Kamis', isOpen: true, openTime: '08:00', closeTime: '23:00' },
    { day: 'Jumat', isOpen: true, openTime: '08:00', closeTime: '23:00' },
    { day: 'Sabtu', isOpen: true, openTime: '08:00', closeTime: '23:00' },
    { day: 'Minggu', isOpen: true, openTime: '08:00', closeTime: '23:00' },
  ]);

  // Step 3: Deskripsi
  const [description, setDescription] = useState(
    'Kopi Mantap adalah tempat ngopi santai untuk menikmati kopi favorit, bekerja, atau berkumpul bersama teman. Temukan teman terbaik untuk setiap momen dalam secangkir kopi.'
  );

  // Step 4: Fasilitas Outlet (Screenshots 3 & 2)
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([
    'Indoor',
    'Indoor Smooking',
  ]);

  // 10 Facilities matching Figma Screenshot 3 & 2
  const allFacilities = [
    {
      id: 'Indoor',
      label: 'Indoor',
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <path d="M9 10h2M13 10h2M9 14h2M13 14h2M9 18h6" />
        </svg>
      ),
    },
    {
      id: 'Indoor Smooking',
      label: 'Indoor Smooking',
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="8" cy="14" r="3" />
          <circle cx="16" cy="14" r="3" />
          <circle cx="12" cy="8" r="3" />
        </svg>
      ),
    },
    {
      id: 'Outdoor',
      label: 'Outdoor',
      icon: <Cloud className="size-5" />,
    },
    {
      id: 'AC',
      label: 'AC',
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="2" y="4" width="20" height="9" rx="2" />
          <path d="M6 18c1-1 2-1 3 0s2 1 3 0 2-1 3 0M6 21c1-1 2-1 3 0s2 1 3 0 2-1 3 0" />
        </svg>
      ),
    },
    {
      id: 'WIFI',
      label: 'WIFI',
      icon: <Wifi className="size-5" />,
    },
    {
      id: 'Stop Kontak',
      label: 'Stop Kontak',
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M12 2v6M9 4v4M15 4v4M7 8h10a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4v-2a4 4 0 0 1 4-4z" />
          <path d="M12 18v4" />
        </svg>
      ),
    },
    {
      id: 'Parkir',
      label: 'Parkir',
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8h3a2.5 2.5 0 0 1 0 5h-3v3" />
        </svg>
      ),
    },
    {
      id: 'Toilet',
      label: 'Toilet',
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M7 12h10M12 12v6M10 18h4" />
          <circle cx="12" cy="7" r="3" />
        </svg>
      ),
    },
    {
      id: 'Mushola',
      label: 'Mushola',
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M12 3v3M9 6a3 3 0 0 0 6 0M4 21V10c0-2 2-4 4-4h8c2 0 4 2 4 4v11" />
          <path d="M9 21v-5a3 3 0 0 1 6 0v5" />
        </svg>
      ),
    },
    {
      id: 'Akses Kursi Roda',
      label: 'Akses Kursi Roda',
      icon: (
        <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="4" r="2" />
          <path d="M12 8v5l3 3M8 17a5 5 0 1 0 5-5" />
        </svg>
      ),
    },
  ];

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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFileName(file.name);
      setLogoUploaded(true);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotos((prev) => [...prev, url]);
    }
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

  const handleFinish = () => {
    setModalMode('success');
  };

  const handleFinalDashboardRedirect = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nemu_tenant_onboarded', 'true');
    }
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
            onClick={() => setModalMode('stepper')}
            className="w-full h-12 rounded-xl bg-[#FF5C38] hover:bg-[#FF4D2D] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-[0.99]"
          >
            <span>Lengkapi Profil Toko</span>
            <ArrowRight className="size-4" />
          </button>
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

          {/* 5-Step Progress Stepper: Continuous, perfectly centered track line */}
          <div className="relative mb-7 px-1">
            {/* Continuous Connecting Track Line spanning exactly from center of step 1 (10%) to center of step 5 (90%) */}
            <div className="absolute top-[14px] left-[10%] right-[10%] h-[2.5px] -translate-y-1/2 z-0">
              {/* Background inactive track */}
              <div className="w-full h-full bg-neutral-200 rounded-full" />
              {/* Active filled orange track */}
              <div
                className="absolute top-0 left-0 h-full bg-[#FF5C38] rounded-full transition-all duration-300"
                style={{
                  width: `${((Math.min(currentStep, 5) - 1) / 4) * 100}%`,
                }}
              />
            </div>

            {/* Stepper Columns */}
            <div className="relative z-10 flex items-start justify-between">
              {[
                { num: 1, label: 'Identitas Outlet' },
                { num: 2, label: 'Jam Operasional' },
                { num: 3, label: 'Deskripsi' },
                { num: 4, label: 'Fasilitas' },
                { num: 5, label: 'Review' },
              ].map((s) => {
                const isPast = s.num < currentStep;
                const isCurrent = s.num === currentStep;
                const isDoneOrActive = isCurrent || isPast;

                return (
                  <div key={s.num} className="flex-1 flex flex-col items-center">
                    {/* Step Circle with solid white ring to cleanly mask the line underneath */}
                    <button
                      type="button"
                      onClick={() => {
                        if (s.num <= currentStep) setCurrentStep(s.num);
                      }}
                      className={`size-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ring-4 ring-white select-none cursor-pointer ${
                        isDoneOrActive
                          ? 'bg-[#FF5C38] text-white shadow-xs'
                          : 'bg-neutral-200 text-neutral-500'
                      }`}
                    >
                      {s.num}
                    </button>

                    {/* Step Label */}
                    <span
                      className={`text-[10.5px] mt-2 text-center font-medium leading-tight max-w-[68px] select-none ${
                        isDoneOrActive ? 'text-[#FF5C38]' : 'text-neutral-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ============================================================ */}
          {/* STEP 1: IDENTITAS OUTLET                                     */}
          {/* ============================================================ */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-neutral-900 mb-2.5">
                  Logo Outlet
                </h3>

                {logoUploaded ? (
                  <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-white">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="size-14 rounded-xl bg-[#C2410C] text-white flex items-center justify-center font-black text-lg tracking-wider shrink-0 shadow-sm">
                        KM
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

              <div className="pt-4 flex items-center justify-end">
                <button
                  disabled={!logoUploaded || photos.length < 2}
                  onClick={() => setCurrentStep(2)}
                  className={`w-full h-11 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2 transition-all ${
                    logoUploaded && photos.length >= 2
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

                  <button
                    type="button"
                    onClick={() => toggleDaySchedule(idx)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      item.isOpen ? 'bg-[#2563EB]' : 'bg-neutral-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        item.isOpen ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
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

              {/* 5 columns x 2 rows grid matching Figma Screenshots 3 & 2 */}
              <div className="grid grid-cols-5 gap-2.5">
                {allFacilities.map((fac) => {
                  const isSelected = selectedFacilities.includes(fac.id);
                  return (
                    <button
                      key={fac.id}
                      type="button"
                      onClick={() => toggleFacility(fac.id)}
                      className={`h-[82px] rounded-2xl flex flex-col items-center justify-center gap-1.5 p-2 text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'border-2 border-blue-400 bg-blue-50/70 text-blue-600 shadow-xs'
                          : 'border border-neutral-200 hover:border-neutral-300 bg-white text-neutral-600'
                      }`}
                    >
                      <div className={isSelected ? 'text-blue-600' : 'text-neutral-500'}>
                        {fac.icon}
                      </div>
                      <span
                        className={`text-[10px] leading-tight font-medium ${
                          isSelected ? 'font-semibold text-blue-600' : 'text-neutral-600'
                        }`}
                      >
                        {fac.label}
                      </span>
                    </button>
                  );
                })}
              </div>

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

              {/* 4 Summary Cards matching Screenshot 1 */}
              <div className="space-y-3">
                {/* 1. Identitas Outlet */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                        🏢
                      </div>
                      <h4 className="text-[13px] font-bold text-neutral-900">
                        Identitas Outlet
                      </h4>
                    </div>
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors"
                    >
                      Ubah
                    </button>
                  </div>

                  <div className="space-y-3 pl-8 text-xs">
                    <div className="flex items-center gap-6">
                      <span className="w-16 text-neutral-500">Logo</span>
                      <div className="size-12 rounded-xl bg-[#C2410C] text-white flex items-center justify-center font-black text-sm tracking-wider shadow-sm">
                        KM
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
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Jam Operasional */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center text-xs">
                        ⏰
                      </div>
                      <h4 className="text-[13px] font-bold text-neutral-900">
                        Jam Operasional
                      </h4>
                    </div>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors"
                    >
                      Ubah
                    </button>
                  </div>
                  <div className="flex items-center gap-8 pl-8 mt-2 text-xs">
                    <span className="font-semibold text-neutral-900">
                      Senin - Minggu
                    </span>
                    <span className="text-neutral-600">08:00 - 23:00</span>
                  </div>
                </div>

                {/* 3. Deskripsi */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center text-xs">
                        📄
                      </div>
                      <h4 className="text-[13px] font-bold text-neutral-900">
                        Deskripsi
                      </h4>
                    </div>
                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors"
                    >
                      Ubah
                    </button>
                  </div>
                  <p className="text-xs text-neutral-700 pl-8 leading-relaxed">
                    {description || 'Belum ada deskripsi.'}
                  </p>
                </div>

                {/* 4. Fasilitas */}
                <div className="p-4 rounded-2xl border border-neutral-200 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="size-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs">
                        ⚡
                      </div>
                      <h4 className="text-[13px] font-bold text-neutral-900">
                        Fasilitas
                      </h4>
                    </div>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors"
                    >
                      Ubah
                    </button>
                  </div>
                  <div className="flex items-center gap-2 pl-8 flex-wrap">
                    {selectedFacilities.map((fac) => (
                      <span
                        key={fac}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-500 border border-red-200"
                      >
                        {fac}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="pt-4 flex items-center gap-3">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 h-11 rounded-xl border border-neutral-200 hover:bg-neutral-50 text-red-500 font-medium text-sm transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={handleFinish}
                  className="flex-1 h-11 rounded-xl bg-[#FF5C38] hover:bg-[#FF4D2D] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <span>Simpan Profile</span>
                  <ArrowRight className="size-4" />
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
