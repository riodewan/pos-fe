'use client';

import React, { Suspense } from 'react';
import { KdsView } from '@/components/kds/KdsView';
import { LoadingScreen } from '@/components/common/LoadingScreen';

export default function KdsPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Memuat Kitchen Display System (KDS)..." />}>
      <KdsView />
    </Suspense>
  );
}
