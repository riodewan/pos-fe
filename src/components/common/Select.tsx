'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  size?: 'sm' | 'md';
  options?: SelectOption[];
  containerClassName?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      size = 'md',
      options,
      children,
      className = '',
      containerClassName = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const isSm = size === 'sm';

    return (
      <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
        {label && (
          <label className="text-xs font-semibold text-neutral-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            disabled={disabled}
            className={`w-full appearance-none bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
              isSm ? 'px-3 py-1.5 pr-8 text-xs' : 'px-3.5 py-2 pr-9 text-sm'
            } ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20' : ''} ${className}`}
            {...props}
          >
            {options
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none ${
              isSm ? 'w-3.5 h-3.5' : 'w-4 h-4'
            }`}
          />
        </div>
        {error && <span className="text-xs text-rose-500">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
