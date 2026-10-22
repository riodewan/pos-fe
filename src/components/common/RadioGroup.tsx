'use client';

import React from 'react';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  label?: React.ReactNode;
  required?: boolean;
  error?: string;
  variant?: 'simple' | 'card';
  direction?: 'horizontal' | 'vertical' | 'grid-2' | 'grid-3' | 'grid-4';
  className?: string;
}

export function RadioGroup({
  name,
  value,
  onChange,
  options,
  label,
  required = false,
  error,
  variant = 'simple',
  direction = 'vertical',
  className = '',
}: RadioGroupProps) {
  const generatedName = React.useId();
  const groupName = name || generatedName;

  const directionClasses: Record<string, string> = {
    vertical: 'flex flex-col gap-2.5',
    horizontal: 'flex flex-row flex-wrap gap-4',
    'grid-2': 'grid grid-cols-2 gap-2.5',
    'grid-3': 'grid grid-cols-3 gap-2.5',
    'grid-4': 'grid grid-cols-4 gap-2.5',
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-neutral-800 select-none">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className={directionClasses[direction] || directionClasses.vertical}>
        {options.map((option) => {
          const isSelected = value === option.value;
          const isCard = variant === 'card';

          if (isCard) {
            return (
              <label
                key={option.value}
                className={`relative flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all select-none ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/40 text-orange-900 shadow-2xs'
                    : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                } ${option.disabled ? 'opacity-50 cursor-not-allowed bg-neutral-50' : ''}`}
              >
                <input
                  type="radio"
                  name={groupName}
                  value={option.value}
                  checked={isSelected}
                  disabled={option.disabled}
                  onChange={() => !option.disabled && onChange(option.value)}
                  className="sr-only"
                />

                <div className="flex items-center gap-2.5">
                  {option.icon && (
                    <span
                      className={`shrink-0 ${
                        isSelected ? 'text-orange-600' : 'text-neutral-400'
                      }`}
                    >
                      {option.icon}
                    </span>
                  )}
                  <div>
                    <p className="font-semibold">{option.label}</p>
                    {option.description && (
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        {option.description}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-3 ${
                    isSelected
                      ? 'border-orange-600 bg-orange-600'
                      : 'border-neutral-300 bg-white'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </label>
            );
          }

          return (
            <label
              key={option.value}
              className={`inline-flex items-start gap-2.5 select-none cursor-pointer ${
                option.disabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                <input
                  type="radio"
                  name={groupName}
                  value={option.value}
                  checked={isSelected}
                  disabled={option.disabled}
                  onChange={() => !option.disabled && onChange(option.value)}
                  className="sr-only"
                />
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? 'border-orange-600 bg-orange-600'
                      : 'border-neutral-300 bg-white hover:border-neutral-400'
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-semibold text-neutral-800 leading-tight">
                  {option.label}
                </span>
                {option.description && (
                  <span className="text-[11px] text-neutral-400 mt-0.5 leading-normal">
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}
    </div>
  );
}
