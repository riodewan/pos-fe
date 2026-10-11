import React from 'react';
import { Coffee } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Memuat data operasional...' }: LoadingScreenProps) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="size-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white animate-pulse shadow-md shadow-amber-600/30">
        <Coffee className="size-6" />
      </div>
      <p className="mt-4 text-xs font-semibold text-muted-foreground">{message}</p>
    </div>
  );
}
