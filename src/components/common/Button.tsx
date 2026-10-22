'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'outline-primary'
  | 'danger'
  | 'ghost'
  | 'soft';

export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const sizeStyles: Record<ButtonSize, string> = {
      xs: 'px-2 py-1 text-xs gap-1.5',
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-5 py-2.5 text-base gap-2.5',
    };

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        'bg-orange-600 hover:bg-orange-700 text-white shadow-2xs focus:ring-orange-500/20 active:bg-orange-800',
      secondary:
        'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 shadow-2xs focus:ring-neutral-200 active:bg-neutral-100',
      outline:
        'bg-transparent border border-neutral-200 text-neutral-700 hover:bg-neutral-50 focus:ring-neutral-200 active:bg-neutral-100',
      'outline-primary':
        'bg-white border border-orange-500 text-orange-600 hover:bg-orange-50 hover:border-orange-600 focus:ring-orange-500/20 active:bg-orange-100',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs focus:ring-rose-500/20 active:bg-rose-800',
      ghost:
        'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 focus:ring-neutral-200 active:bg-neutral-200',
      soft:
        'bg-orange-50 text-orange-600 hover:bg-orange-100 focus:ring-orange-500/20 active:bg-orange-200',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="shrink-0 flex items-center">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
