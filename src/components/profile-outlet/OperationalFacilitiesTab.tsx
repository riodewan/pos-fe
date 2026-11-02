'use client';

import React, { useState, useEffect } from 'react';
import {
  Wifi,
  Zap,
  Wind,
  Cigarette,
  Sparkles,
  Car,
  ShieldCheck,
  Check,
  Copy,
  Utensils,
  Music,
  CheckCircle2,
  Store,
} from 'lucide-react';
import { OperatingHourItem } from '@/types/profile-outlet';
import { Button } from '@/components/common/Button';
import { tenantService, GlobalMasterItem } from '@/services/tenant.service';

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
  const [masterFacilities, setMasterFacilities] = useState<GlobalMasterItem[]>([]);
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

  useEffect(() => {
    tenantService
      .getGlobalMasterData()
      .then((res) => {
        if (res.data?.facilities) {
          setMasterFacilities(res.data.facilities);
        }
      })
      .catch(() => {});
  }, []);

  const getFacilityIcon = (fac: GlobalMasterItem) => {
    const key = `${fac.code || ''} ${fac.icon || ''} ${fac.name || ''}`.toLowerCase();
    if (key.includes('wifi')) return Wifi;
    if (key.includes('ac') || key.includes('wind')) return Wind;
    if (key.includes('power') || key.includes('zap') || key.includes('stop kontak')) return Zap;
    if (key.includes('smok') || key.includes('flame')) return Cigarette;
    if (key.includes('park') || key.includes('car')) return Car;
    if (key.includes('mushola') || key.includes('shield')) return ShieldCheck;
    if (key.includes('music')) return Music;
    if (key.includes('outdoor')) return Utensils;
    if (key.includes('indoor') || key.includes('store')) return Store;
    return Sparkles;
  };

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

      {/* Right: Fasilitas Outlet Global (Dikelola oleh Internal Admin) */}
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 space-y-4">
          <div className="pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">Fasilitas Outlet (Master Data Global)</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Pilih fasilitas yang tersedia di outlet ini dari daftar fasilitas standar platform
            </p>
          </div>

          {masterFacilities.length === 0 ? (
            <p className="text-xs text-neutral-400 py-6 text-center">
              Belum ada master fasilitas aktif dari admin platform.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[420px] overflow-y-auto pr-1">
              {masterFacilities.map((fac) => {
                const Icon = getFacilityIcon(fac);
                const isChecked = facilities.includes(fac.name);

                return (
                  <button
                    key={fac.id}
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
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{fac.name}</p>
                      {fac.description && (
                        <p className="text-[10px] text-neutral-400 font-normal truncate">
                          {fac.description}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
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
            <Check className="size-4 mr-1.5" />
            Simpan Operasional & Fasilitas
          </Button>
        </div>
      </div>
    </div>
  );
}
