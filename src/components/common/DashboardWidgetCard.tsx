'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface DashboardWidgetCardProps {
  title: string;
  badge?: string | number;
  headerHref?: string;
  onHeaderClick?: () => void;
  headerVariant?: 'dark' | 'light';
  children: React.ReactNode;
  className?: string;
}

export function DashboardWidgetCard({
  title,
  badge,
  headerHref,
  onHeaderClick,
  headerVariant = 'dark',
  children,
  className = '',
}: DashboardWidgetCardProps) {
  const isDark = headerVariant === 'dark';

  const HeaderWrapper = headerHref ? Link : 'div';
  const headerProps = headerHref
    ? { href: headerHref }
    : onHeaderClick
    ? { onClick: onHeaderClick, role: 'button', tabIndex: 0 }
    : {};

  return (
    <div
      className={`rounded-2xl border border-neutral-200/80 bg-white shadow-xs overflow-hidden ${className}`}
    >
      {/* Header */}
      <HeaderWrapper
        {...(headerProps as any)}
        className={`px-4 py-3 flex items-center justify-between transition-colors ${
          isDark
            ? 'bg-[#333333] hover:bg-[#3D3D3D] text-white'
            : 'border-b border-neutral-100 text-neutral-900 hover:bg-neutral-50/50'
        } ${headerHref || onHeaderClick ? 'cursor-pointer' : ''}`}
      >
        <div className="flex items-center gap-2">
          <h3
            className={`text-[13px] font-bold tracking-tight ${
              isDark ? 'text-white' : 'text-neutral-900'
            }`}
          >
            {title}
          </h3>
          {badge !== undefined && badge !== null && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                isDark
                  ? 'bg-neutral-600/80 text-white'
                  : 'bg-neutral-100 text-neutral-600'
              }`}
            >
              {badge}
            </span>
          )}
        </div>

        {(headerHref || onHeaderClick) && (
          <ChevronRight
            className={`size-4 ${isDark ? 'text-neutral-400' : 'text-neutral-400'}`}
          />
        )}
      </HeaderWrapper>

      {/* Body Content */}
      <div className="p-4">{children}</div>
    </div>
  );
}
