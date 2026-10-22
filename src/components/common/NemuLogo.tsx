import React from 'react';

interface NemuLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  theme?: 'dark' | 'light';
}

export function NemuLogo({ className = '', size = 'md', theme = 'dark' }: NemuLogoProps) {
  const heights = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-11',
  };

  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src="/img/logo/logo-nemuhub.png"
        alt="Nemu Logo"
        className={`${heights[size]} w-auto object-contain ${
          theme === 'dark' ? 'brightness-100' : ''
        }`}
      />
    </div>
  );
}
