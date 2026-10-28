'use client';

import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  ChevronDown,
  Monitor,
  ChefHat,
  Search,
  ShoppingCart,
  QrCode,
  Check,
} from 'lucide-react';
import { ThemePreset } from '@/types/outlet-settings';
import { Button } from '@/components/common/Button';

interface PersonalizationTabProps {
  onSaveSuccess?: () => void;
}

export function PersonalizationTab({ onSaveSuccess }: PersonalizationTabProps) {
  const [scope, setScope] = useState<'single' | 'all'>('single');
  const [selectedOutlet, setSelectedOutlet] = useState('Kopi Mantap - Menteng');
  const [activeTheme, setActiveTheme] = useState<ThemePreset>('Default');
  const [previewScreen, setPreviewScreen] = useState<'pos' | 'kds'>('pos');
  const [isSaved, setIsSaved] = useState(false);

  const themeColors: Record<ThemePreset, { primary: string; hover: string; light: string; hex: string }> = {
    Default: { primary: 'bg-[#FF5C38]', hover: 'hover:bg-[#E04B28]', light: 'bg-red-50', hex: '#FF5C38' },
    Coklat: { primary: 'bg-[#5C3826]', hover: 'hover:bg-[#472B1E]', light: 'bg-amber-50', hex: '#5C3826' },
    Hijau: { primary: 'bg-[#10B981]', hover: 'hover:bg-[#059669]', light: 'bg-emerald-50', hex: '#10B981' },
    Biru: { primary: 'bg-[#2563EB]', hover: 'hover:bg-[#1D4ED8]', light: 'bg-blue-50', hex: '#2563EB' },
    Oranye: { primary: 'bg-[#F97316]', hover: 'hover:bg-[#EA580C]', light: 'bg-orange-50', hex: '#F97316' },
    Hitam: { primary: 'bg-[#18181B]', hover: 'hover:bg-[#09090B]', light: 'bg-neutral-100', hex: '#18181B' },
  };

  const handleSave = () => {
    setIsSaved(true);
    onSaveSuccess?.();
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-150">
      {/* LEFT COLUMN: Terapkan Tema & Pilih Preset Tema (6 cols) */}
      <div className="lg:col-span-6 space-y-6">
        {/* Card 1: Terapkan Tema */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-neutral-900">
            Terapkan Tema
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Option A: Hanya outlet ini */}
            <div
              onClick={() => setScope('single')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                scope === 'single'
                  ? 'border-[#2563EB] bg-blue-50/20 shadow-xs'
                  : 'border-neutral-200 bg-white hover:bg-neutral-50/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="size-8 rounded-lg bg-red-50 text-[#FF5C38] flex items-center justify-center">
                    <FileText className="size-4" />
                  </div>
                  {/* Radio dot */}
                  <div className={`size-4 rounded-full border-2 flex items-center justify-center ${
                    scope === 'single' ? 'border-[#2563EB] bg-[#2563EB]' : 'border-neutral-300'
                  }`}>
                    {scope === 'single' && <span className="size-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                <p className="text-xs font-bold text-neutral-900">
                  Hanya outlet ini
                </p>
                <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                  Tema hanya berlaku untuk outlet yang sedang dipilih.
                </p>
              </div>

              {/* Outlet Dropdown below */}
              <div className="mt-4 pt-3 border-t border-neutral-100">
                <label className="block text-[10px] font-bold text-neutral-500 uppercase mb-1">
                  Outlet
                </label>
                <div className="relative">
                  <select
                    value={selectedOutlet}
                    onChange={(e) => setSelectedOutlet(e.target.value)}
                    disabled={scope !== 'single'}
                    className="w-full appearance-none px-3 py-2 rounded-lg border border-neutral-200 text-xs font-medium text-neutral-900 bg-white focus:outline-none focus:border-[#FF5C38] cursor-pointer disabled:opacity-50"
                  >
                    <option value="Kopi Mantap - Menteng">Kopi Mantap - Menteng</option>
                    <option value="Kopi Mantap - Senopati">Kopi Mantap - Senopati</option>
                    <option value="Kopi Mantap - Kemang">Kopi Mantap - Kemang</option>
                  </select>
                  <ChevronDown className="size-3.5 text-neutral-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Option B: Semua Outlet */}
            <div
              onClick={() => setScope('all')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                scope === 'all'
                  ? 'border-[#2563EB] bg-blue-50/20 shadow-xs'
                  : 'border-neutral-200 bg-white hover:bg-neutral-50/60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="size-8 rounded-lg bg-red-50 text-[#FF5C38] flex items-center justify-center">
                    <FileText className="size-4" />
                  </div>
                  <div className={`size-4 rounded-full border-2 flex items-center justify-center ${
                    scope === 'all' ? 'border-[#2563EB] bg-[#2563EB]' : 'border-neutral-300'
                  }`}>
                    {scope === 'all' && <span className="size-1.5 rounded-full bg-white" />}
                  </div>
                </div>

                <p className="text-xs font-bold text-neutral-900">
                  Semua Outlet
                </p>
                <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">
                  Terapkan tema yang sama ke seluruh outlet dalam akun bisnis
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-100 space-y-1 text-[11px] text-neutral-600">
                <p className="flex items-center gap-1.5 font-medium">
                  <span className="size-1.5 rounded-full bg-[#FF5C38]" /> Kopi Mantap - Menteng
                </p>
                <p className="flex items-center gap-1.5 font-medium">
                  <span className="size-1.5 rounded-full bg-[#FF5C38]" /> Kopi Mantap - Cikini
                </p>
                <p className="flex items-center gap-1.5 font-medium text-neutral-400 italic">
                  <span className="size-1.5 rounded-full bg-neutral-300" /> etc.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Pilih Preset Tema */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-neutral-900">
            Pilih Preset Tema
          </h2>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {(['Default', 'Coklat', 'Hijau', 'Biru', 'Oranye', 'Hitam'] as ThemePreset[]).map((theme) => {
              const isSelected = activeTheme === theme;
              const colorInfo = themeColors[theme];

              return (
                <button
                  key={theme}
                  type="button"
                  onClick={() => setActiveTheme(theme)}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2.5 ${
                    isSelected
                      ? 'border-[#2563EB] bg-blue-50/20 shadow-xs ring-1 ring-[#2563EB]'
                      : 'border-neutral-200 bg-white hover:bg-neutral-50'
                  }`}
                >
                  <div
                    className="size-9 rounded-full flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: colorInfo.hex }}
                  >
                    {isSelected && <span className="size-2 rounded-full bg-white shadow-xs" />}
                  </div>
                  <span className="text-xs font-bold text-neutral-800">
                    {theme}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Preview & Action Buttons (6 cols) */}
      <div className="lg:col-span-6 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-5">
        <h2 className="text-sm sm:text-base font-bold text-neutral-900">
          Preview
        </h2>

        {/* Dynamic Mockup Window showing the selected theme color */}
        <div className="rounded-2xl border border-neutral-200 overflow-hidden bg-neutral-900 text-white shadow-xs">
          {/* Top mockup bar */}
          <div className="h-9 px-4 bg-neutral-950 flex items-center justify-between text-[11px] border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <span className="font-bold text-white tracking-wider">NEMU</span>
              <div
                className="px-2.5 py-0.5 rounded-md text-[9px] font-bold text-white"
                style={{ backgroundColor: themeColors[activeTheme].hex }}
              >
                {previewScreen === 'pos' ? 'POS' : 'KDS'}
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-neutral-400">
              <span className="size-2 rounded-full bg-emerald-400" />
              <span>Andi Pratama</span>
            </div>
          </div>

          {/* Main Mockup Content */}
          {previewScreen === 'pos' ? (
            <div className="p-3 bg-[#F8F9FA] text-neutral-800 grid grid-cols-12 gap-2 text-[10px]">
              {/* Product catalog side */}
              <div className="col-span-8 space-y-2">
                <div className="flex items-center justify-between bg-white p-1.5 rounded-lg border border-neutral-200">
                  <span className="font-semibold text-neutral-500">Kopi Mantap (Menteng)</span>
                  <div className="flex gap-1">
                    <span
                      className="px-2 py-0.5 rounded text-[9px] font-bold text-white"
                      style={{ backgroundColor: themeColors[activeTheme].hex }}
                    >
                      Dine-in
                    </span>
                    <span className="px-2 py-0.5 rounded bg-neutral-100 text-neutral-500 text-[9px]">
                      Takeaway
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { name: 'Kopi Susu Gula Aren', price: 'Rp 20.000' },
                    { name: 'Americano', price: 'Rp 22.000' },
                    { name: 'Cappuccino', price: 'Rp 28.000' },
                    { name: 'Croissant', price: 'Rp 25.000' },
                    { name: 'Chocolate Roll', price: 'Rp 27.000' },
                    { name: 'Matcha Latte', price: 'Rp 30.000' },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="p-1.5 rounded-lg border border-neutral-200 bg-white space-y-1 shadow-2xs"
                    >
                      <div className="h-10 rounded bg-neutral-100 flex items-center justify-center text-[18px]">
                        ☕
                      </div>
                      <p className="font-bold truncate text-[9px]">{p.name}</p>
                      <p
                        className="font-semibold text-[8px]"
                        style={{ color: themeColors[activeTheme].hex }}
                      >
                        {p.price}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order bill side */}
              <div className="col-span-4 bg-white p-2 rounded-xl border border-neutral-200 space-y-2 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex justify-between font-bold text-[9px] pb-1 border-b border-neutral-100">
                    <span>Meja 3</span>
                    <span className="text-neutral-400">#ORD-0018</span>
                  </div>
                  <div className="space-y-1 text-[8.5px]">
                    <div className="flex justify-between">
                      <span>1x Kopi Susu Gula Aren</span>
                      <span>20.000</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1x Croissant</span>
                      <span>25.000</span>
                    </div>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-neutral-100 space-y-1">
                  <div className="flex justify-between text-[8px] text-neutral-500">
                    <span>Subtotal</span>
                    <span>45.000</span>
                  </div>
                  <div className="flex justify-between text-[8.5px] font-bold text-neutral-900">
                    <span>Total</span>
                    <span style={{ color: themeColors[activeTheme].hex }}>49.950</span>
                  </div>
                  <button
                    type="button"
                    className="w-full py-1.5 rounded-md font-bold text-white text-[9px] shadow-xs transition-opacity hover:opacity-90"
                    style={{ backgroundColor: themeColors[activeTheme].hex }}
                  >
                    Bayar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* KDS Mockup */
            <div className="p-3 bg-neutral-900 grid grid-cols-3 gap-2 text-[9px] text-white">
              {[
                { table: 'Meja 3', id: '#ORD-0018', status: 'Baru', time: '02:15' },
                { table: 'Meja 5', id: '#ORD-0012', status: 'Dimasak', time: '08:42' },
                { table: 'Takeaway', id: '#ORD-0019', status: 'Siap', time: '12:05' },
              ].map((card, i) => (
                <div
                  key={i}
                  className="p-2 rounded-xl border border-neutral-800 bg-neutral-950 space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold">{card.table}</span>
                    <span
                      className="px-1.5 py-0.5 rounded text-[8px] font-bold text-white"
                      style={{ backgroundColor: themeColors[activeTheme].hex }}
                    >
                      {card.status}
                    </span>
                  </div>
                  <p className="text-neutral-400 text-[8px]">{card.id} • {card.time}</p>
                  <div className="pt-1 border-t border-neutral-800 text-[8px] text-neutral-300">
                    <p>• 1x Americano</p>
                    <p>• 1x Croissant</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Screen Switchers: Kasir (POS) vs KDS */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setPreviewScreen('pos')}
            className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
              previewScreen === 'pos'
                ? 'border-[#2563EB] bg-blue-50/20 text-[#2563EB] shadow-2xs'
                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <Monitor className="size-4" />
            <span>Kasir (POS)</span>
          </button>

          <button
            type="button"
            onClick={() => setPreviewScreen('kds')}
            className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
              previewScreen === 'kds'
                ? 'border-[#2563EB] bg-blue-50/20 text-[#2563EB] shadow-2xs'
                : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
            }`}
          >
            <ChefHat className="size-4" />
            <span>KDS</span>
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          {isSaved && (
            <span className="text-xs font-bold text-emerald-600 animate-in fade-in">
              Tema personalisasi berhasil disimpan!
            </span>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setActiveTheme('Default')}
            className="text-xs font-semibold"
          >
            Batalkan
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={handleSave}
            className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-5 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <CheckCircle2 className="size-4" />
            <span>Simpan Perubahan</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
