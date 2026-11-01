'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Wifi,
  Zap,
  Wind,
  Cigarette,
  Sparkles,
  Car,
  ShieldCheck,
  Check,
  Copy,
  Plus,
  Utensils,
  Baby,
  Dog,
  Music,
  CheckCircle2,
} from 'lucide-react';
import { OperatingHourItem } from '@/types/profile-outlet';
import { Button } from '@/components/common/Button';

interface OperationalFacilitiesTabProps {
  initialHours: OperatingHourItem[];
  initialFacilities: string[];
  onSave: (hours: OperatingHourItem[], facilities: string[]) => void;
}

const DEFAULT_HOURS: OperatingHourItem[] = [
  { day: 'Senin', openTime: '08:00', closeTime: '22:00', isOpen: true },
  { day: 'Selasa', openTime: '08:00', closeTime: '22:00', isOpen: true },
  { day: 'Rabu', openTime: '08:00', closeTime: '22:00', isOpen: true },
  { day: 'Kamis', openTime: '08:00', closeTime: '22:00', isOpen: true },
  { day: 'Jumat', openTime: '08:00', closeTime: '23:00', isOpen: true },
  { day: 'Sabtu', openTime: '08:00', closeTime: '23:00', isOpen: true },
  { day: 'Minggu', openTime: '08:00', closeTime: '22:00', isOpen: true },
];

export function OperationalFacilitiesTab({
  initialHours,
  initialFacilities,
  onSave,
}: OperationalFacilitiesTabProps) {
  const [hours, setHours] = useState<OperatingHourItem[]>(
    Array.isArray(initialHours) && initialHours.length > 0 ? initialHours : DEFAULT_HOURS
  );
  const [facilities, setFacilities] = useState<string[]>(initialFacilities || []);
  const [newFacilityInput, setNewFacilityInput] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (Array.isArray(initialHours) && initialHours.length > 0) {
      setHours(initialHours);
    }
  }, [initialHours]);

  useEffect(() => {
    if (Array.isArray(initialFacilities)) {
      setFacilities(initialFacilities);
    }
  }, [initialFacilities]);

  const presetFacilities = [
    { name: 'WiFi Gratis (High-Speed)', icon: Wifi },
    { name: 'Colokan Listrik di Setiap Meja', icon: Zap },
    { name: 'Ruangan Ber-AC (Indoor)', icon: Wind },
    { name: 'Area Merokok (Smoking Area)', icon: Cigarette },
    { name: 'Toilet Bersih & Higienis', icon: Sparkles },
    { name: 'Musholla', icon: ShieldCheck },
    { name: 'Area Parkir Mobil & Motor', icon: Car },
    { name: 'Pembayaran Cashless (QRIS & Kartu)', icon: Check },
    { name: 'Kursi Bayi / Baby Chair', icon: Baby },
    { name: 'Area Outdoor / Rooftop', icon: Utensils },
    { name: 'Live Music / Akustik', icon: Music },
    { name: 'Ramah Hewan Peliharaan (Pet Friendly)', icon: Dog },
  ];

  const handleToggleDay = (index: number) => {
    setHours((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], isOpen: !next[index].isOpen };
      return next;
    });
  };

  const handleTimeChange = (index: number, field: 'openTime' | 'closeTime', val: string) => {
    setHours((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleApplyToAllDays = (sourceIndex: number = 0) => {
    const source = hours[sourceIndex];
    if (!source) return;
    setHours((prev) =>
      prev.map((h) => ({
        ...h,
        openTime: source.openTime,
        closeTime: source.closeTime,
        isOpen: source.isOpen,
      }))
    );
  };

  const handleToggleFacility = (facilityName: string) => {
    setFacilities((prev) =>
      prev.includes(facilityName)
        ? prev.filter((f) => f !== facilityName)
        : [...prev, facilityName]
    );
  };

  const handleAddCustomFacility = () => {
    const trimmed = newFacilityInput.trim();
    if (!trimmed) return;
    if (!facilities.includes(trimmed)) {
      setFacilities((prev) => [...prev, trimmed]);
    }
    setNewFacilityInput('');
  };

  const handleSave = () => {
    onSave(hours, facilities);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-150">
      {/* Left: Jam Operasional Harian */}
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Jam Operasional Outlet</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Atur jadwal jam buka dan tutup operasional outlet untuk setiap hari
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleApplyToAllDays(0)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-[11px] font-bold text-neutral-700 transition-colors cursor-pointer self-start sm:self-center"
            title="Salin jam Senin ke seluruh hari"
          >
            <Copy className="size-3 text-[#FF5C38]" />
            <span>Terapkan Senin ke Semua</span>
          </button>
        </div>

        <div className="space-y-3">
          {hours.map((item, idx) => (
            <div
              key={item.day}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs ${
                item.isOpen
                  ? 'border-neutral-200 bg-white'
                  : 'border-neutral-100 bg-neutral-50/60 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 w-32 shrink-0">
                <input
                  type="checkbox"
                  checked={item.isOpen}
                  onChange={() => handleToggleDay(idx)}
                  className="rounded border-neutral-300 text-[#FF5C38] focus:ring-[#FF5C38] cursor-pointer size-4"
                />
                <span className="font-bold text-neutral-900">{item.day}</span>
              </div>

              {item.isOpen ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={item.openTime}
                    onChange={(e) => handleTimeChange(idx, 'openTime', e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-neutral-50 font-mono text-xs font-semibold focus:outline-none focus:border-[#FF5C38]"
                  />
                  <span className="text-neutral-400 font-bold">-</span>
                  <input
                    type="time"
                    value={item.closeTime}
                    onChange={(e) => handleTimeChange(idx, 'closeTime', e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-neutral-200 bg-neutral-50 font-mono text-xs font-semibold focus:outline-none focus:border-[#FF5C38]"
                  />
                </div>
              ) : (
                <span className="text-neutral-400 font-semibold italic">Tutup</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right: Fasilitas Outlet */}
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 space-y-4">
          <div className="pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">Fasilitas yang Tersedia</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Pilih fasilitas yang dapat dinikmati pengunjung di outlet ini
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {presetFacilities.map((fac) => {
              const Icon = fac.icon;
              const isChecked = facilities.includes(fac.name);

              return (
                <button
                  key={fac.name}
                  type="button"
                  onClick={() => handleToggleFacility(fac.name)}
                  className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center gap-2.5 ${
                    isChecked
                      ? 'border-[#FF5C38]/40 bg-orange-50/40 text-neutral-900 shadow-2xs'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  <div
                    className={`size-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isChecked
                        ? 'bg-[#FF5C38] text-white'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  <span className="truncate">{fac.name}</span>
                </button>
              );
            })}

            {/* Custom Facilities added by user */}
            {facilities
              .filter((f) => !presetFacilities.some((pf) => pf.name === f))
              .map((customName) => (
                <button
                  key={customName}
                  type="button"
                  onClick={() => handleToggleFacility(customName)}
                  className="p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center justify-between gap-2.5 border-[#FF5C38]/40 bg-orange-50/40 text-neutral-900 shadow-2xs"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="size-7 rounded-lg bg-[#FF5C38] text-white flex items-center justify-center shrink-0">
                      <Check className="size-3.5" />
                    </div>
                    <span className="truncate">{customName}</span>
                  </div>
                  <span className="text-[10px] text-red-500 font-bold hover:underline shrink-0">
                    Hapus
                  </span>
                </button>
              ))}
          </div>

          {/* Add Custom Facility Form */}
          <div className="pt-2 flex items-center gap-2">
            <input
              type="text"
              value={newFacilityInput}
              onChange={(e) => setNewFacilityInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomFacility();
                }
              }}
              placeholder="Tambah fasilitas lain (mis. Valet Parking)..."
              className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF5C38]"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddCustomFacility}
              className="h-9 px-3 text-xs border-neutral-200"
            >
              <Plus className="size-3.5 mr-1" /> Tambah
            </Button>
          </div>
        </div>

        {/* Action Save button */}
        <div className="flex items-center justify-end gap-3">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-600 animate-in fade-in flex items-center gap-1.5">
              <CheckCircle2 className="size-4" />
              Pengaturan operasional & fasilitas tersimpan!
            </span>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-6 py-2.5 rounded-xl shadow-xs cursor-pointer"
          >
            Simpan Operasional & Fasilitas
          </Button>
        </div>
      </div>
    </div>
  );
}
