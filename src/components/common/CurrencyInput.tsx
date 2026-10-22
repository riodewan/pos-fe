'use client';

import React from 'react';
import { Input, InputProps } from './Input';

export interface CurrencyInputProps
  extends Omit<InputProps, 'value' | 'onChange' | 'type' | 'prefix'> {
  value?: number;
  onValueChange?: (value: number) => void;
  currencyPrefix?: string;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, currencyPrefix = 'Rp', ...props }, ref) => {
    // Format numeric value with dot thousand separators
    const formatDisplay = (val?: number): string => {
      if (val === undefined || val === null || isNaN(val)) return '';
      return val.toLocaleString('id-ID');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Strip everything except digits
      const rawDigits = e.target.value.replace(/\D/g, '');
      const numericVal = rawDigits === '' ? 0 : parseInt(rawDigits, 10);
      onValueChange?.(numericVal);
    };

    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        prefix={currencyPrefix}
        value={formatDisplay(value)}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';
