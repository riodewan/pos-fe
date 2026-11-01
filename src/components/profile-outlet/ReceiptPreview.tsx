'use client';

import React from 'react';
import { ReceiptConfig } from '@/types/profile-outlet';

interface ReceiptPreviewProps {
  config: ReceiptConfig;
  logoUrl?: string;
  storeName?: string;
}

export function ReceiptPreview({ config, logoUrl, storeName }: ReceiptPreviewProps) {
  const displayName = config.displayName || storeName || 'Outlet NemuPOS';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'NP';

  return (
    <div className="w-full sm:w-56 bg-white border border-neutral-200/90 rounded-xl shadow-xs p-3.5 text-[10px] font-mono text-neutral-700 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Header: Logo & Store Info */}
        <div className="flex flex-col items-center text-center space-y-1 pb-2 border-b border-dashed border-neutral-300">
          {config.showLogo && (
            logoUrl ? (
              <img
                src={logoUrl}
                alt={displayName}
                className="size-8 object-contain rounded-lg shadow-2xs mb-0.5 border border-neutral-100"
              />
            ) : (
              <div className="size-8 rounded-lg bg-[#FF5C38] text-white flex items-center justify-center font-bold text-xs shadow-2xs mb-0.5">
                {initials}
              </div>
            )
          )}
          <p className="font-bold text-neutral-900 text-[11px] leading-tight">
            {displayName}
          </p>
          <p className="text-[9px] text-neutral-500 leading-tight px-1">
            {config.shortAddress || 'Jl. Contoh No. 123, Indonesia'}
          </p>
        </div>

        {/* Transaction Info */}
        <div className="py-2 space-y-0.5 text-[9px] border-b border-dashed border-neutral-300 text-neutral-500">
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span>02 Nov 2026, 14:30</span>
          </div>
          <div className="flex justify-between">
            <span>No. Transaksi:</span>
            <span className="font-semibold text-neutral-700">#POS-00123</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir:</span>
            <span>Kasir Utama</span>
          </div>
        </div>

        {/* Items List */}
        <div className="py-2 space-y-1 border-b border-dashed border-neutral-300 text-[9px]">
          <div className="flex justify-between font-semibold text-neutral-800">
            <span>Kopi Susu Gula Aren</span>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-normal">2</span>
              <span>44.000</span>
            </div>
          </div>
          <div className="flex justify-between font-semibold text-neutral-800">
            <span>Butter Croissant</span>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-normal">1</span>
              <span>28.000</span>
            </div>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="py-2 space-y-0.5 text-[9px] border-b border-dashed border-neutral-300">
          <div className="flex justify-between text-neutral-500">
            <span>Subtotal</span>
            <span>72.000</span>
          </div>
          <div className="flex justify-between text-neutral-500">
            <span>PB1 / Pajak (10%)</span>
            <span>7.200</span>
          </div>
          <div className="flex justify-between font-bold text-neutral-900 text-[10px] pt-1">
            <span>Total</span>
            <span>79.200</span>
          </div>
        </div>

        {/* Footer message */}
        <div className="pt-2 text-center text-[9px] text-neutral-500 font-sans">
          <p className="font-semibold">
            {config.footerMessage || 'Terima Kasih Atas Kunjungan Anda!'}
          </p>
        </div>
      </div>

      {/* Decorative thermal paper zigzag bottom edge */}
      <div className="pt-2.5 flex justify-center opacity-40">
        <div className="w-full h-1 border-b border-dashed border-neutral-400" />
      </div>
    </div>
  );
}
