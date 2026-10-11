'use client';

import React from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { StoreProvider } from '@/context/StoreContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <StoreProvider>{children}</StoreProvider>
    </AuthProvider>
  );
}
