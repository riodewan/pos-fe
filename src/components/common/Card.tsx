'use client';

import React from 'react';

export interface CardProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  headerBorder?: boolean;
  noPadding?: boolean;
}

export function Card({
  title,
  subtitle,
  action,
  headerBorder = false,
  noPadding = false,
  children,
  className = '',
  ...props
}: CardProps) {
  const hasHeader = Boolean(title || subtitle || action);

  return (
    <div
      className={`bg-white rounded-xl border border-neutral-200/80 shadow-2xs overflow-hidden ${className}`}
      {...props}
    >
      {hasHeader && (
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-5 ${
            headerBorder ? 'border-b border-neutral-100' : 'pb-3'
          }`}
        >
          <div>
            {title && (
              <h3 className="text-base font-semibold text-neutral-900 leading-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-neutral-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
        </div>
      )}

      <div className={noPadding ? '' : 'p-5 pt-2'}>{children}</div>
    </div>
  );
}
