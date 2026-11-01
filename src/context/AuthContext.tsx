'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, TenantMembership } from '@/types';
import { storage } from '@/lib/api';
import { authService } from '@/services';

interface AuthContextType {
  user: User | null;
  token: string | null;
  activeTenant: TenantMembership | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInternalAdmin: boolean;
  login: (email: string, password: string, deviceName?: string) => Promise<User>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<User>;
  logout: () => Promise<void>;
  selectTenant: (tenantId: string) => void;
  refreshUser: () => Promise<User | null>;
  hasRole: (roleName: string | string[]) => boolean;
  hasPermission: (permName: string | string[]) => boolean;
  canAccess: (options: { permissions?: string[]; roles?: string[] }) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTenant, setActiveTenant] = useState<TenantMembership | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync active tenant helper
  const syncTenant = useCallback((currentUser: User | null, preferredTenantId?: string | null) => {
    if (!currentUser || !currentUser.tenants || currentUser.tenants.length === 0) {
      setActiveTenant(null);
      storage.setTenantId(null);
      return;
    }

    const savedTenantId = preferredTenantId || storage.getTenantId();
    const matched = currentUser.tenants.find((t) => t.id === savedTenantId);
    const selected = matched || currentUser.tenants[0];

    setActiveTenant(selected);
    storage.setTenantId(selected.id);
  }, []);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    const currentToken = storage.getToken();
    if (!currentToken) {
      setUser(null);
      setToken(null);
      setActiveTenant(null);
      setIsLoading(false);
      return null;
    }

    try {
      const response = await authService.getMe();
      const userData = response.data;
      setUser(userData);
      setToken(currentToken);
      syncTenant(userData);
      return userData;
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      storage.clearAll();
      setUser(null);
      setToken(null);
      setActiveTenant(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [syncTenant]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (email: string, password: string, deviceName: string = 'web-app'): Promise<User> => {
      setIsLoading(true);
      try {
        const response = await authService.login({ email, password, device_name: deviceName });
        const { user: loggedInUser, token: authToken } = response.data;
        storage.setToken(authToken);
        setToken(authToken);
        setUser(loggedInUser);
        syncTenant(loggedInUser);

        return loggedInUser;
      } catch (err) {
        setIsLoading(false);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [syncTenant]
  );

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      password_confirmation: string
    ): Promise<User> => {
      setIsLoading(true);
      try {
        const response = await authService.register({ name, email, password, password_confirmation });
        const { user: registeredUser, token: authToken } = response.data;
        storage.setToken(authToken);
        setToken(authToken);
        setUser(registeredUser);
        syncTenant(registeredUser);

        return registeredUser;
      } catch (err) {
        setIsLoading(false);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [syncTenant]
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      storage.clearAll();
      setUser(null);
      setToken(null);
      setActiveTenant(null);
    }
  }, []);

  const selectTenant = useCallback(
    (tenantId: string) => {
      if (!user || !user.tenants) return;
      const found = user.tenants.find((t) => t.id === tenantId);
      if (found) {
        setActiveTenant(found);
        storage.setTenantId(found.id);
        // Reset active store so user reselects or defaults
        storage.setStoreId(null);
      }
    },
    [user]
  );

  const hasRole = useCallback(
    (roleName: string | string[]): boolean => {
      if (!user) return false;
      if (user.is_internal) return true;
      if (!activeTenant) return false;

      const userRole = (activeTenant.role || '').toUpperCase();
      if (Array.isArray(roleName)) {
        return roleName.some((r) => r.toUpperCase() === userRole);
      }
      return userRole === roleName.toUpperCase();
    },
    [user, activeTenant]
  );

  const hasPermission = useCallback(
    (permName: string | string[]): boolean => {
      if (!user) return false;
      if (user.is_internal) return true;

      const userRole = (activeTenant?.role || '').toUpperCase();
      if (userRole === 'OWNER') return true;

      const userPerms = user.permissions || [];
      if (Array.isArray(permName)) {
        return permName.some((p) => userPerms.includes(p));
      }
      return userPerms.includes(permName);
    },
    [user, activeTenant]
  );

  const canAccess = useCallback(
    (options: { permissions?: string[]; roles?: string[] }): boolean => {
      if (!user) return false;
      if (user.is_internal) return true;

      const userRole = (activeTenant?.role || '').toUpperCase();
      if (userRole === 'OWNER') return true;

      // Check role match if specified
      if (options.roles && options.roles.length > 0) {
        if (options.roles.some((r) => r.toUpperCase() === userRole)) {
          return true;
        }
      }

      // Check permission match if specified
      if (options.permissions && options.permissions.length > 0) {
        const userPerms = user.permissions || [];
        if (options.permissions.some((p) => userPerms.includes(p))) {
          return true;
        }
      }

      if ((options.roles?.length || 0) > 0 || (options.permissions?.length || 0) > 0) {
        return false;
      }

      return true;
    },
    [user, activeTenant]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      activeTenant,
      isLoading,
      isAuthenticated: !!user && !!token,
      isInternalAdmin: !!user?.is_internal,
      login,
      register,
      logout,
      selectTenant,
      refreshUser,
      hasRole,
      hasPermission,
      canAccess,
    }),
    [user, token, activeTenant, isLoading, refreshUser, hasRole, hasPermission, canAccess, login, register, logout, selectTenant]
  );


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
