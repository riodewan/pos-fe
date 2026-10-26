'use client';

import React, { useState } from 'react';
import { Clock, Wifi, Zap, Wind, Cigarette, Sparkles, Car, ShieldCheck, Check } from 'lucide-react';
import { OperatingHourItem } from '@/types/profile-outlet';
import { Button } from '@/components/common/Button';

interface OperationalFacilitiesTabProps {
  initialHours: OperatingHourItem[];
  initialFacilities: string[];
  onSave: (hours: OperatingHourItem[], facilities: string[]) => void;
}

export function OperationalFacilitiesTab({
  initialHours,
  initialFacilities,
  onSave,
}: OperationalFacilitiesTabProps) {
  const [hours, setHours] = useState<OperatingHourItem[]>(initialHours);
  const [facilities, setFacilities] = useState<string[]>(initialFacilities);
  const [isSaved, setIsSaved] = useState(false);

  const availableFacilities = [
    { name: 'WiFi Gratis (High-Speed)', icon: Wifi },
    { name: 'Colokan Listrik di Setiap Meja', icon: Zap },
    { name: 'Ruangan Ber-AC (Indoor)', icon: Wind },
    { name: 'Area Merokok (Smoking Area)', icon: Cigarette },
    { name: 'Toilet Bersih & Higienis', icon: Sparkles },
    { name: 'Musholla', icon: ShieldCheck },
    { name: 'Area Parkir Mobil & Motor', icon: Car },
    { name: 'Pembayaran Cashless (QRIS & Kartu)', icon: Check },
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
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Jam Operasional Outlet</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Atur jadwal jam buka dan tutup operasional outlet untuk setiap hari
            </p>
          </div>
          <Clock className="size-5 text-[#FF5C38]" />
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
                  className="rounded border-neutral-300 text-[#FF5C38] focus:ring-[#FF5C38] cursor-pointer"
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

      {/* Right: Fasilitas Outlet & Kapasitas Meja */}
      <div className="space-y-5">
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 space-y-4">
          <div className="pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">Fasilitas yang Tersedia</h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Pilih fasilitas yang dapat dinikmati pengunjung di outlet ini
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {availableFacilities.map((fac) => {
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
          </div>
        </div>

        {/* Action Save button */}
        <div className="flex items-center justify-end gap-3">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-600 animate-in fade-in">
              Pengaturan operasional berhasil disimpan!
            </span>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-6 py-2.5"
          >
            Simpan Operasional & Fasilitas
          </Button>
        </div>
      </div>
    </div>
  );
}
