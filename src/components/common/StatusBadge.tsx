'use client';

import React from 'react';

export type StatusBadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'purple'
  | 'outline';

export interface StatusBadgeProps {
  variant?: StatusBadgeVariant;
  dot?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({
  variant = 'neutral',
  dot = false,
  icon,
  children,
  size = 'sm',
  className = '',
}: StatusBadgeProps) {
  const variantStyles: Record<StatusBadgeVariant, { bg: string; dot: string }> = {
    success: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      dot: 'bg-emerald-500',
    },
    warning: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80',
      dot: 'bg-amber-500',
    },
    danger: {
      bg: 'bg-rose-50 text-rose-600 border-rose-200/80',
      dot: 'bg-rose-500',
    },
    info: {
      bg: 'bg-blue-50 text-blue-600 border-blue-200/80',
      dot: 'bg-blue-500',
    },
    neutral: {
      bg: 'bg-neutral-100 text-neutral-600 border-neutral-200/80',
      dot: 'bg-neutral-400',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-700 border-purple-200/80',
      dot: 'bg-purple-500',
    },
    outline: {
      bg: 'bg-white text-neutral-700 border-neutral-200',
      dot: 'bg-neutral-400',
    },
  };

  const current = variantStyles[variant];
  const sizeClasses =
    size === 'sm'
      ? 'px-2.5 py-0.5 text-[11px]'
      : 'px-3 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs whitespace-nowrap ${current.bg} ${sizeClasses} ${className}`}
    >
      {dot && (
        <span
          className={`size-1.5 rounded-full shrink-0 ${current.dot}`}
        />
      )}
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
}
