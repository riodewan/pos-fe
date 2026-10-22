'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onClear?: () => void;
  size?: 'sm' | 'md';
  containerClassName?: string;
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onClear,
      placeholder = 'Cari...',
      size = 'md',
      disabled,
      className = '',
      containerClassName = '',
      ...props
    },
    ref
  ) => {
    const isSmall = size === 'sm';
    const hasValue = value !== undefined && value !== null && String(value).length > 0;

    return (
      <div className={`relative flex items-center ${containerClassName}`}>
        <Search
          className={`absolute text-neutral-400 pointer-events-none ${
            isSmall ? 'left-2.5 w-3.5 h-3.5' : 'left-3 w-4 h-4'
          }`}
        />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder:text-neutral-400 transition-colors focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed ${
            isSmall
              ? 'pl-8 pr-7 py-1.5 text-xs'
              : 'pl-9 pr-8 py-2 text-sm'
          } ${className}`}
          {...props}
        />
        {hasValue && onClear && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className={`absolute text-neutral-400 hover:text-neutral-600 transition-colors p-0.5 rounded-full hover:bg-neutral-200/60 ${
              isSmall ? 'right-2' : 'right-2.5'
            }`}
            title="Hapus pencarian"
          >
            <X className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
