import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Memuat data operasional...' }: LoadingScreenProps) {
  return (
    <div className="w-full space-y-6 py-2">
      {/* Header Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 rounded-xl border border-border/60 bg-card/60 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-3 w-32 rounded" />
          </div>
        ))}
      </div>

      {/* Content Table / Card Skeleton */}
      <div className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <Skeleton className="h-4 w-32 rounded" />
          <Skeleton className="h-8 w-44 rounded-lg" />
        </div>
        <div className="space-y-2.5 pt-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-lg" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3.5 w-36 rounded" />
                  <Skeleton className="h-2.5 w-24 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="size-7 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {message && (
        <p className="text-center text-xs font-medium text-muted-foreground/80 pt-1">
          {message}
        </p>
      )}
    </div>
  );
}

