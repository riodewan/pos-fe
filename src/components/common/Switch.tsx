'use client';

import React from 'react';

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
  color?: 'orange' | 'blue';
  className?: string;
  id?: string;
}

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = 'md',
  color = 'blue',
  className = '',
  id,
}: SwitchProps) {
  const isSm = size === 'sm';

  const activeBg = color === 'blue' ? 'bg-blue-600' : 'bg-orange-600';

  return (
    <label
      htmlFor={id}
      className={`inline-flex items-center gap-3 select-none cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex shrink-0 transition-colors duration-200 ease-in-out rounded-full border-2 border-transparent focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          color === 'blue' ? 'focus:ring-blue-500/20' : 'focus:ring-orange-500/20'
        } ${checked ? activeBg : 'bg-neutral-300'} ${
          isSm ? 'h-5 w-9' : 'h-6 w-11'
        }`}
      >
        <span
          className={`pointer-events-none inline-block rounded-full bg-white shadow-xs transform ring-0 transition duration-200 ease-in-out ${
            isSm ? 'h-4 w-4' : 'h-5 w-5'
          } ${
            checked
              ? isSm
                ? 'translate-x-4'
                : 'translate-x-5'
              : 'translate-x-0'
          }`}
        />
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <span
              className={`font-medium text-neutral-800 ${
                isSm ? 'text-xs' : 'text-sm'
              }`}
            >
              {label}
            </span>
          )}
          {description && (
            <span
              className={`text-neutral-500 ${isSm ? 'text-[11px]' : 'text-xs'}`}
            >
              {description}
            </span>
          )}
        </div>
      )}
    </label>
  );
}
