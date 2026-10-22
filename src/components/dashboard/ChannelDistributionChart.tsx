'use client';

import React from 'react';

export interface ChannelItem {
  name: string;
  count: number;
  percentage: number;
  color: string;
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
  // Default values matching Screenshot 1 if not empty
  const defaultChannels: ChannelItem[] = [
    { name: 'Kasir', count: 147, percentage: 60, color: '#F59E0B' },
    { name: 'QR Order', count: 61, percentage: 25, color: '#2563EB' },
    { name: 'Delivery', count: 37, percentage: 15, color: '#10B981' },
  ];

  const emptyChannels: ChannelItem[] = [
    { name: 'Kasir', count: 0, percentage: 0, color: '#F59E0B' },
    { name: 'QR Order', count: 0, percentage: 0, color: '#2563EB' },
    { name: 'Delivery', count: 0, percentage: 0, color: '#10B981' },
  ];

  const items = isEmpty ? emptyChannels : channels ?? defaultChannels;

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
      <h3 className="text-sm font-bold text-neutral-900 tracking-tight mb-2">
        Distribusi Transaksi per Channel
      </h3>

      {/* Donut Circle */}
      <div className="flex flex-col items-center justify-center my-auto py-2">
        <div className="relative size-[110px] flex items-center justify-center">
          <svg
            className="size-full -rotate-90 transform"
            viewBox={`0 0 ${size} ${size}`}
          >
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#F1F5F9"
              strokeWidth={strokeWidth}
            />

            {/* Segments */}
            {!isEmpty &&
              segments.map((seg, idx) => (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              ))}

            {isEmpty && (
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#E2E8F0"
                strokeWidth={strokeWidth}
              />
            )}
          </svg>
        </div>
      </div>

      {/* Legend below donut matching Figma Screenshot 1 */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-neutral-100 text-xs">
        {items.map((item, idx) => (
          <div key={idx} className="flex flex-col items-start min-w-0">
            <div className="flex items-center gap-1.5 text-neutral-500 text-[11px] font-medium">
              <span
                className="size-2 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.name}</span>
            </div>
            <div className="text-xs font-bold text-neutral-900 mt-0.5 flex items-baseline gap-1">
              <span>{item.count}</span>
              <span className="text-[10px] text-neutral-400 font-normal">
                {item.percentage}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
