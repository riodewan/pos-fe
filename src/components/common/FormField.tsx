'use client';

import React from 'react';

export interface FormFieldProps {
  label?: React.ReactNode;
  required?: boolean;
  error?: string;
  hint?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  required = false,
  error,
  hint,
  extra,
  children,
  className = '',
}: FormFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      {(label || extra) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="block text-xs font-semibold text-neutral-800 select-none">
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
          )}
          {extra && <div className="text-[11px] text-neutral-400">{extra}</div>}
        </div>
      )}

      <div>{children}</div>

      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}

      {!error && hint && (
        <p className="text-[11px] text-neutral-400 leading-normal">{hint}</p>
      )}
    </div>
  );
}
