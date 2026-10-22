'use client';

import React, { Suspense } from 'react';
import { ReservationsView } from '@/components/reservations/ReservationsView';
import { LoadingScreen } from '@/components/common/LoadingScreen';

export default function ReservationsPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Memuat Reservasi Meja..." />}>
      <ReservationsView />
    </Suspense>
  );
}
