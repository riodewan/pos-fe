'use client';

import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'circular' | 'rounded' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className = '',
  variant = 'rounded',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  const variantClass = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rounded: 'rounded-xl',
    rectangular: 'rounded-none',
  }[variant];

  return (
    <div
      className={`animate-pulse bg-neutral-200/80 ${variantClass} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  );
}

export function TableRowSkeleton({ columns = 5, hasCheckbox = false }: { columns?: number; hasCheckbox?: boolean }) {
  return (
    <tr className="border-b border-neutral-100 animate-pulse">
      {hasCheckbox && (
        <td className="py-4 px-3.5 w-10">
          <div className="size-4 bg-neutral-200 rounded" />
        </td>
      )}
      {Array.from({ length: columns }).map((_, idx) => (
        <td key={idx} className="py-4 px-3.5">
          <div
            className="h-4 bg-neutral-200 rounded"
            style={{ width: `${Math.max(30, (idx % 3 === 0 ? 75 : idx % 2 === 0 ? 55 : 40))}%` }}
          />
        </td>
      ))}
    </tr>
  );
}

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-3 animate-pulse"
        >
          <div className="h-4 w-28 bg-neutral-200 rounded" />
          <div className="h-7 w-36 bg-neutral-200 rounded-lg" />
          <div className="h-3 w-20 bg-neutral-100 rounded" />
        </div>
      ))}
    </div>
  );
}

