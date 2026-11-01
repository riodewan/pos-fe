'use client';

import React from 'react';
import { CircularLoader } from './PageLoader';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Memuat data operasional...' }: LoadingScreenProps) {
  return (
    <div className="w-full min-h-[450px] flex flex-col items-center justify-center gap-3.5 p-8 animate-in fade-in duration-200">
      <CircularLoader size="lg" />
      {message && (
        <p className="text-sm font-semibold text-neutral-800 tracking-tight">
          {message}
        </p>
      )}
    </div>
  );
}
