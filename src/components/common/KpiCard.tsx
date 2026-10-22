'use client';

import React from 'react';

export interface KpiCardProps {
  icon: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  title: string;
  value: string | number;
  percentage?: string | number;
  comparisonLabel?: string;
  isPositive?: boolean;
  sparklineColor?: string;
  className?: string;
}

export function KpiCard({
  icon,
  iconBgColor = 'bg-emerald-50',
  iconTextColor = 'text-emerald-600',
  title,
  value,
  percentage,
  comparisonLabel = 'Dari kemarin',
  isPositive = true,
  sparklineColor = '#10B981',
  className = '',
}: KpiCardProps) {
  const hasPercentage = percentage !== undefined && percentage !== null;
  const isZero = percentage === 0 || percentage === '0' || percentage === '% 0';

  return (
    <div
      className={`p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between transition-all hover:shadow-sm ${className}`}
    >
      {/* Top: Header Icon + Title */}
      <div className="flex items-center gap-2">
        <div
          className={`size-6 rounded-md ${iconBgColor} ${iconTextColor} flex items-center justify-center shrink-0 text-xs`}
        >
          {icon}
        </div>
        <span className="text-xs text-neutral-500 font-medium">
          {title}
        </span>
      </div>

      {/* Middle: Metric Value */}
      <h3 className="text-xl sm:text-[22px] font-bold text-neutral-900 mt-2.5 tracking-tight">
        {value}
      </h3>

      {/* Bottom: Growth Indicator on Left & Mini Sparkline on Right */}
      <div className="flex items-end justify-between mt-2 pt-0.5">
        <div className="flex items-center gap-1 text-[11px]">
          {hasPercentage ? (
            isZero ? (
              <span className="text-neutral-400">% 0</span>
            ) : (
              <span
                className={`font-semibold flex items-center gap-0.5 ${
                  isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                <span>{isPositive ? '↑' : '↓'}</span>
                <span>{percentage}</span>
              </span>
            )
          ) : (
            <span className="text-neutral-400">% 0</span>
          )}
          <span className="text-neutral-400">{comparisonLabel}</span>
        </div>

        {/* Mini SVG Sparkline Trend at Bottom-Right */}
        <div className="shrink-0">
          <svg width="48" height="22" viewBox="0 0 48 22" fill="none">
            <path
              d={
                isZero
                  ? 'M2 16L16 16L30 16L46 16'
                  : isPositive
                  ? 'M2 16L16 12L30 16L46 4'
                  : 'M2 6L16 10L30 8L46 18'
              }
              stroke={isZero ? '#CBD5E1' : sparklineColor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
