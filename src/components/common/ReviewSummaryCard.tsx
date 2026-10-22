'use client';

import React from 'react';

export interface ReviewSummaryCardProps {
  icon: React.ReactNode;
  iconBgColor?: string;
  iconTextColor?: string;
  title: string;
  onEdit?: () => void;
  editLabel?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  divided?: boolean;
}

export function ReviewSummaryCard({
  icon,
  iconBgColor = 'bg-emerald-50',
  iconTextColor = 'text-emerald-600',
  title,
  onEdit,
  editLabel = 'Ubah',
  children,
  className = '',
  contentClassName,
  divided = false,
}: ReviewSummaryCardProps) {
  return (
    <div
      className={`p-4 rounded-2xl border border-gray-200 bg-white shadow-xs ${className}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between ${
          divided ? 'border-b border-gray-100 pb-2.5 mb-3' : 'mb-3'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`size-6 rounded-md ${iconBgColor} ${iconTextColor} flex items-center justify-center text-xs shrink-0`}
          >
            {icon}
          </div>
          <h4 className="text-[13.5px] font-bold text-gray-900 tracking-tight">
            {title}
          </h4>
        </div>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="px-3.5 py-1 rounded-lg bg-[#E0EEFF] hover:bg-[#D0E5FF] text-[#2563EB] text-xs font-semibold transition-colors"
          >
            {editLabel}
          </button>
        )}
      </div>

      {/* Body Content */}
      <div className={contentClassName ?? (divided ? '' : 'pl-8')}>{children}</div>
    </div>
  );
}
