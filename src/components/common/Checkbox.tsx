'use client';

import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export function Checkbox({
  checked,
  onChange,
  label,
  description,
  error,
  disabled,
  className = '',
  id,
  ...props
}: CheckboxProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className={`space-y-1 ${className}`}>
      <label
        htmlFor={inputId}
        className={`inline-flex items-start gap-3 select-none cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <div className="relative flex items-center justify-center mt-0.5 shrink-0">
          <input
            id={inputId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={(e) => onChange(e.target.checked)}
            className="sr-only"
            {...props}
          />
          <div
            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
              checked
                ? 'bg-orange-600 border-orange-600 text-white shadow-2xs'
                : 'bg-white border-neutral-300 hover:border-neutral-400'
            } ${disabled ? 'bg-neutral-100 border-neutral-200' : ''}`}
          >
            {checked && <Check className="w-3 h-3 stroke-[3]" />}
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <span className="text-xs font-semibold text-neutral-800 leading-tight">
                {label}
              </span>
            )}
            {description && (
              <span className="text-[11px] text-neutral-500 mt-0.5 leading-normal">
                {description}
              </span>
            )}
          </div>
        )}
      </label>

      {error && <p className="text-[11px] text-rose-500 font-medium pl-7">{error}</p>}
    </div>
  );
}
