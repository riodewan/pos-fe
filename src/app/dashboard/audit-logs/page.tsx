'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { AuditLogView } from '@/components/audit/AuditLogView';
import { PageLoader } from '@/components/common/PageLoader';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';

export default function AuditLogsPage() {
  const { isLoading, canAccess, isInternalAdmin } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return <PageLoader text="Memeriksa hak akses log audit..." />;
  }

  const isAllowed =
    isInternalAdmin ||
    canAccess({
      permissions: ['audit.view'],
      roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'],
    });

  if (!isAllowed) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="size-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
          <ShieldAlert className="size-8" />
        </div>
        <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
          Akses Terbatas
        </h2>
        <p className="text-xs text-neutral-500 mt-1.5 leading-relaxed">
          Akun Anda tidak memiliki izin untuk melihat log audit sistem. Silakan hubungi
          Owner atau Manager jika Anda memerlukan akses ini.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="mt-5 text-xs font-semibold"
          leftIcon={<ArrowLeft className="size-3.5" />}
        >
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <AuditLogView />
    </div>
  );
}
