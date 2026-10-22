'use client';

import React from 'react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: React.ReactNode;
  required?: boolean;
  error?: string;
  hint?: string;
  showCount?: boolean;
  containerClassName?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      required = false,
      error,
      hint,
      showCount = false,
      maxLength,
      value,
      rows = 3,
      disabled,
      className = '',
      containerClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;

    const currentLength =
      typeof value === 'string'
        ? value.length
        : typeof props.defaultValue === 'string'
        ? props.defaultValue.length
        : 0;

    return (
      <div className={`space-y-1.5 ${containerClassName}`}>
        {label && (
          <div className="flex items-center justify-between">
            <label
              htmlFor={textareaId}
              className="block text-xs font-semibold text-neutral-800 select-none"
            >
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {showCount && maxLength && (
              <span className="text-[11px] text-neutral-400">
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            id={textareaId}
            rows={rows}
            maxLength={maxLength}
            value={value}
            disabled={disabled}
            className={`w-full rounded-xl border p-3 text-xs text-neutral-900 placeholder:text-neutral-400 font-medium transition-all focus:outline-none ${
              error
                ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                : 'border-neutral-200 bg-white focus:border-neutral-400 focus:ring-2 focus:ring-neutral-200'
            } ${disabled ? 'opacity-60 bg-neutral-100 cursor-not-allowed' : 'shadow-2xs'} ${className}`}
            {...props}
          />
        </div>

        {error && <p className="text-[11px] text-rose-500 font-medium">{error}</p>}

        {!error && hint && (
          <p className="text-[11px] text-neutral-400 leading-normal">{hint}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
