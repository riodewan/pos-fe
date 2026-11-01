'use client';

import React, { useMemo } from 'react';

export interface ChannelItem {
  name: string;
  count: number;
  percentage: number;
  color?: string;
  total_amount?: number;
}

export interface ChannelDistributionChartProps {
  channels?: ChannelItem[];
  isEmpty?: boolean;
  className?: string;
}

export function ChannelDistributionChart({
  channels,
  isEmpty = false,
  className = '',
}: ChannelDistributionChartProps) {
  const palette = ['#F59E0B', '#2563EB', '#10B981', '#8B5CF6', '#EC4899', '#6B7280'];

  const items: ChannelItem[] = useMemo(() => {
    if (isEmpty || !channels || channels.length === 0) {
      return [
        { name: 'Dine In', count: 0, percentage: 0, color: '#F59E0B' },
        { name: 'Takeaway', count: 0, percentage: 0, color: '#10B981' },
        { name: 'Kasir (POS)', count: 0, percentage: 0, color: '#8B5CF6' },
        { name: 'QR Order', count: 0, percentage: 0, color: '#2563EB' },
      ];
    }

    return channels.map((c, i) => ({
      ...c,
      color: c.color || palette[i % palette.length],
    }));
  }, [channels, isEmpty]);

  const hasData = items.some((item) => item.count > 0 || item.percentage > 0);

  // Donut geometry
  const size = 110;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate SVG strokeDashoffset for each segment
  let cumulativePercentage = 0;
  const segments = items.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
    cumulativePercentage += item.percentage;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div
      className={`p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between ${className}`}
    >
      {/* Header */}
      <div className="pb-3 border-b border-neutral-100 flex items-center justify-between">
        <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
          Distribusi Saluran Pesanan
        </h3>
        <span className="text-[11px] font-semibold text-neutral-400">
          {hasData ? `${items.reduce((acc, c) => acc + c.count, 0)} Pesanan` : '0 Pesanan'}
        </span>
      </div>

      {/* Donut and Legend Body */}
      <div className="flex items-center justify-center gap-6 py-4">
        {/* SVG Donut */}
        <div className="relative size-[110px] shrink-0 flex items-center justify-center">
          <svg
            className="size-full -rotate-90"
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Background track circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-neutral-100"
              fill="transparent"
            />

            {/* Segments */}
            {hasData &&
              segments.map((seg, idx) =>
                seg.percentage > 0 ? (
                  <circle
                    key={idx}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={seg.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    fill="transparent"
                    className="transition-all duration-500 ease-out"
                  />
                ) : null
              )}
          </svg>

          {/* Center text inside Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-base font-extrabold text-neutral-900">
              {hasData ? '100%' : '0%'}
            </span>
            <span className="text-[9.5px] font-medium text-neutral-400 uppercase tracking-wider">
              {hasData ? 'Total' : 'Kosong'}
            </span>
          </div>
        </div>

        {/* Legend Column */}
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 truncate">
                <span
                  style={{ backgroundColor: item.color }}
                  className="size-2.5 rounded-full shrink-0"
                />
                <span className="text-neutral-700 truncate font-medium">
                  {item.name}
                </span>
              </div>
              <span className="font-bold text-neutral-900 font-mono shrink-0">
                {item.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer text */}
      <div className="pt-2.5 border-t border-neutral-100 text-[11px] text-neutral-400 text-center">
        Proporsi asal pesanan outlet berdasarkan transaksi selesai
      </div>
    </div>
  );
}
