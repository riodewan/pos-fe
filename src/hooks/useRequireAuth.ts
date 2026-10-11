'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export function useRequireAuth(allowedRoles?: string[]) {
  const { user, isLoading, isAuthenticated, hasRole, isInternalAdmin, activeTenant } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  const isAuthorized =
    !allowedRoles ||
    allowedRoles.length === 0 ||
    isInternalAdmin ||
    allowedRoles.some((role) => hasRole(role));

  return {
    user,
    activeTenant,
    isLoading,
    isAuthenticated,
    isInternalAdmin,
    isAuthorized,
  };
}
