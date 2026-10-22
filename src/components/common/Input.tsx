'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export type InputSize = 'sm' | 'md' | 'lg';

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label?: React.ReactNode;
  required?: boolean;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  size?: InputSize;
  containerClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      required = false,
      error,
      hint,
      prefix,
      suffix,
      leftIcon,
      rightIcon,
      size = 'md',
      type = 'text',
      disabled,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';
    const effectiveType = isPasswordType && showPassword ? 'text' : type;

    const generatedId = React.useId();
    const inputId = id || generatedId;

    const sizeStyles: Record<InputSize, { container: string; input: string; text: string }> = {
      sm: { container: 'h-9', input: 'px-3 py-1.5', text: 'text-xs' },
      md: { container: 'h-10', input: 'px-3.5 py-2', text: 'text-xs' },
      lg: { container: 'h-12', input: 'px-4 py-3', text: 'text-sm' },
    };

    const currentSize = sizeStyles[size];

    return (
      <div className={`space-y-1.5 ${containerClassName}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-neutral-800 select-none"
          >
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}

        <div
          className={`relative flex items-center rounded-xl border transition-all ${currentSize.container} ${
            error
              ? 'border-rose-400 bg-rose-50/20 focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/20'
              : 'border-neutral-200 bg-white focus-within:border-neutral-400 focus-within:ring-2 focus-within:ring-neutral-200'
          } ${disabled ? 'opacity-60 bg-neutral-100 cursor-not-allowed' : 'shadow-2xs'}`}
        >
          {/* Prefix badge (e.g. 'Rp', '+62', etc.) */}
          {prefix && (
            <span className="px-3 border-r border-neutral-200 text-xs font-semibold text-neutral-500 bg-neutral-50/80 rounded-l-xl h-full flex items-center shrink-0 select-none">
              {prefix}
            </span>
          )}

          {/* Left Icon */}
          {leftIcon && (
            <span className="pl-3 text-neutral-400 shrink-0 flex items-center pointer-events-none">
              {leftIcon}
            </span>
          )}

          {/* Core Input */}
          <input
            ref={ref}
            id={inputId}
            type={effectiveType}
            disabled={disabled}
            className={`w-full h-full bg-transparent text-neutral-900 placeholder:text-neutral-400 font-medium focus:outline-none disabled:cursor-not-allowed ${
              currentSize.input
            } ${currentSize.text} ${prefix ? 'rounded-r-xl' : 'rounded-xl'} ${className}`}
            {...props}
          />

          {/* Right Icon / Password toggle */}
          {isPasswordType ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={disabled}
              className="pr-3 text-neutral-400 hover:text-neutral-600 transition-colors shrink-0"
              title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          ) : (
            rightIcon && (
              <span className="pr-3 text-neutral-400 shrink-0 flex items-center">
                {rightIcon}
              </span>
            )
          )}

          {/* Suffix badge (e.g. 'kg', 'gr', 'pcs', '%') */}
          {suffix && (
            <span className="px-3 border-l border-neutral-200 text-xs font-medium text-neutral-500 bg-neutral-50/80 rounded-r-xl h-full flex items-center shrink-0 select-none">
              {suffix}
            </span>
          )}
        </div>

        {/* Error message */}
        {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}

        {/* Hint text */}
        {!error && hint && (
          <p className="text-[11px] text-neutral-400 leading-normal">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
