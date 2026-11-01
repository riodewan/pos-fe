'use client';

import React from 'react';

interface CircularLoaderProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  color?: string;
}

export function CircularLoader({ size = 'md', className = '', color = '#FF5C38' }: CircularLoaderProps) {
  const sizeMap = {
    sm: { box: 'size-6', stroke: 3, r: 9, cx: 12, cy: 12, dash: '20, 60' },
    md: { box: 'size-10', stroke: 3.5, r: 16, cx: 20, cy: 20, dash: '45, 120' },
    lg: { box: 'size-14', stroke: 4, r: 22, cx: 26, cy: 26, dash: '65, 160' },
    xl: { box: 'size-20', stroke: 4.5, r: 32, cx: 36, cy: 36, dash: '90, 220' },
  }[size];

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg
        className={`${sizeMap.box} animate-spin`}
        viewBox={`0 0 ${sizeMap.cx * 2} ${sizeMap.cy * 2}`}
        fill="none"
      >
        {/* Track circle */}
        <circle
          cx={sizeMap.cx}
          cy={sizeMap.cy}
          r={sizeMap.r}
          stroke="currentColor"
          strokeWidth={sizeMap.stroke}
          className="text-neutral-200"
        />
        {/* Spinning arc */}
        <circle
          cx={sizeMap.cx}
          cy={sizeMap.cy}
          r={sizeMap.r}
          stroke={color}
          strokeWidth={sizeMap.stroke}
          strokeDasharray={sizeMap.dash}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

interface PageLoaderProps {
  text?: string;
  subtext?: string;
  minHeight?: string;
}

export function PageLoader({
  text = 'Memuat data...',
  subtext,
  minHeight = 'min-h-[50vh]',
}: PageLoaderProps) {
  return (
    <div className={`w-full ${minHeight} flex flex-col items-center justify-center gap-3.5 p-8 animate-in fade-in duration-300`}>
      <CircularLoader size="lg" />
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-neutral-800 tracking-tight">{text}</p>
        {subtext && <p className="text-xs text-neutral-400">{subtext}</p>}
      </div>
    </div>
  );
}
