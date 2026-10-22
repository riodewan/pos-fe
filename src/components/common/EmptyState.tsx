'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string; strokeWidth?: number }> | React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: IconProp,
  title,
  description,
  actionLabel,
  actionText,
  actionHref,
  onAction,
  className = '',
}: EmptyStateProps) {
  const label = actionLabel || actionText;

  const renderIcon = () => {
    if (!IconProp) {
      // Default Figma document tray illustration
      return (
        <svg
          className="size-16 mx-auto text-neutral-300"
          viewBox="0 0 64 64"
          fill="none"
        >
          <rect
            x="16"
            y="10"
            width="32"
            height="24"
            rx="3"
            fill="#F1F5F9"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
          <rect x="20" y="16" width="24" height="2" rx="1" fill="#CBD5E1" />
          <rect x="20" y="22" width="16" height="2" rx="1" fill="#E2E8F0" />
          <path
            d="M10 26H54V50C54 52.2091 52.2091 54 50 54H14C11.7909 54 10 52.2091 10 50V26Z"
            fill="#F8FAFC"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
          <path
            d="M10 32C10 32 16 35 24 35C32 35 32 40 40 40C48 40 54 36 54 36"
            stroke="#E2E8F0"
            strokeWidth="1.5"
          />
          <path
            d="M24 32H40V36C40 37.1046 39.1046 38 38 38H26C24.8954 38 24 37.1046 24 36V32Z"
            fill="white"
            stroke="#CBD5E1"
            strokeWidth="1.5"
          />
        </svg>
      );
    }

    if (typeof IconProp === 'function') {
      const Component = IconProp as React.ComponentType<{ className?: string; strokeWidth?: number }>;
      return (
        <div className="size-10 rounded-lg border border-border bg-surface flex items-center justify-center text-muted-foreground mb-4">
          <Component className="size-5" strokeWidth={1.75} />
        </div>
      );
    }

    return (
      <div className="mb-3 text-neutral-300">
        {IconProp as React.ReactNode}
      </div>
    );
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-6 text-center my-auto',
        className
      )}
    >
      <div className="mb-2">{renderIcon()}</div>

      {/* Title */}
      <h4 className="text-xs font-bold text-neutral-700 tracking-wider uppercase">
        {title}
      </h4>

      {/* Description */}
      {description && (
        <p className="text-[11.5px] text-neutral-400 mt-1 max-w-[260px] leading-relaxed">
          {description}
        </p>
      )}

      {/* Action Button */}
      {label && (
        <div className="mt-3.5">
          {actionHref ? (
            <Link
              href={actionHref}
              className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-[#2563EB] text-xs font-semibold transition-colors shadow-2xs"
            >
              {label}
            </Link>
          ) : onAction ? (
            <Button
              onClick={onAction}
              size="sm"
              className="px-4 py-1.5 h-8 text-xs font-semibold rounded-lg"
            >
              {label}
            </Button>
          ) : null}
        </div>
      )}
    </div>
  );
}
