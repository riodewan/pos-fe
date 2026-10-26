'use client';

import React from 'react';
import { ReceiptConfig } from '@/types/profile-outlet';

interface ReceiptPreviewProps {
  config: ReceiptConfig;
  logoUrl?: string;
}

export function ReceiptPreview({ config, logoUrl }: ReceiptPreviewProps) {
  return (
    <div className="w-full sm:w-56 bg-white border border-neutral-200/90 rounded-xl shadow-xs p-3.5 text-[10px] font-mono text-neutral-700 flex flex-col justify-between shrink-0 select-none">
      <div>
        {/* Header: Logo & Store Info */}
        <div className="flex flex-col items-center text-center space-y-1 pb-2 border-b border-dashed border-neutral-300">
          {config.showLogo && (
            <div className="size-8 rounded-lg bg-[#E02626] text-white flex items-center justify-center font-bold text-xs shadow-2xs mb-0.5">
              KM
            </div>
          )}
          <p className="font-bold text-neutral-900 text-[11px] leading-tight">
            {config.displayName || 'Kopi Mantap'}
          </p>
          <p className="text-[9px] text-neutral-500 leading-tight px-1">
            {config.shortAddress || 'Jl. Melati No. 10, Jakarta Barat, Jakarta, Indonesia'}
          </p>
        </div>

        {/* Transaction Info */}
        <div className="py-2 space-y-0.5 text-[9px] border-b border-dashed border-neutral-300 text-neutral-500">
          <div className="flex justify-between">
            <span>Tanggal:</span>
            <span>10 Okt 2026, 14:32</span>
          </div>
          <div className="flex justify-between">
            <span>No. Transaksi:</span>
            <span className="font-semibold text-neutral-700">#POS-00123</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir:</span>
            <span>Budi</span>
          </div>
        </div>

        {/* Items List matching Screenshot 1 */}
        <div className="py-2 space-y-1 border-b border-dashed border-neutral-300 text-[9px]">
          <div className="flex justify-between font-semibold text-neutral-800">
            <span>Americano</span>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-normal">2</span>
              <span>50.000</span>
            </div>
          </div>
          <div className="flex justify-between font-semibold text-neutral-800">
            <span>Croissant</span>
            <div className="flex items-center gap-2">
              <span className="text-neutral-500 font-normal">1</span>
              <span>35.000</span>
            </div>
          </div>
        </div>

        {/* Pricing Summary matching Screenshot 1 */}
        <div className="py-2 space-y-0.5 text-[9px] border-b border-dashed border-neutral-300">
          <div className="flex justify-between text-neutral-500">
            <span>Subtotal</span>
            <span>85.000</span>
          </div>
          <div className="flex justify-between text-neutral-500">
            <span>Pajak (11%)</span>
            <span>9.350</span>
          </div>
          <div className="flex justify-between font-bold text-neutral-900 text-[10px] pt-1">
            <span>Total</span>
            <span>94.350</span>
          </div>
        </div>

        {/* Footer message matching Screenshot 1 */}
        <div className="pt-2 text-center text-[9px] text-neutral-500 font-sans">
          <p className="font-semibold">
            {config.footerMessage || 'Terima Kasih!'}
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
