'use client';

import React from 'react';
import { QrCode, Store } from 'lucide-react';

export interface ChannelBadgeProps {
  channel: 'QR Order' | 'Kasir' | 'GrabFood' | 'ShopeeFood' | 'GoFood' | string;
  className?: string;
}

export function ChannelBadge({ channel, className = '' }: ChannelBadgeProps) {
  switch (channel) {
    case 'QR Order':
      return (
        <div className={`inline-flex items-center gap-2 text-xs text-neutral-800 font-normal ${className}`}>
          <div className="size-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <QrCode className="size-3.5" />
          </div>
          <span>QR Order</span>
        </div>
      );
    case 'Kasir':
      return (
        <div className={`inline-flex items-center gap-2 text-xs text-neutral-800 font-normal ${className}`}>
          <div className="size-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <Store className="size-3.5" />
          </div>
          <span>Kasir</span>
        </div>
      );
    case 'GrabFood':
      return (
        <div className={`inline-flex items-center gap-2 text-xs text-neutral-800 font-normal ${className}`}>
          <div className="size-6 rounded-full bg-[#00B14F] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
            GF
          </div>
          <span>GrabFood</span>
        </div>
      );
    case 'ShopeeFood':
      return (
        <div className={`inline-flex items-center gap-2 text-xs text-neutral-800 font-normal ${className}`}>
          <div className="size-6 rounded-full bg-[#EE4D2D] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
            SF
          </div>
          <span>ShopeeFood</span>
        </div>
      );
    case 'GoFood':
      return (
        <div className={`inline-flex items-center gap-2 text-xs text-neutral-800 font-normal ${className}`}>
          <div className="size-6 rounded-full bg-[#ED2736] text-white flex items-center justify-center text-[9px] font-bold shrink-0">
            GF
          </div>
          <span>GoFood</span>
        </div>
      );
    default:
      return <span className={`text-xs text-neutral-700 ${className}`}>{channel}</span>;
  }
}
