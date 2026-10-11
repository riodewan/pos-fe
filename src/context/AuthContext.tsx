'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { User, TenantMembership, ApiResponse } from '@/types';
import api, { storage, ApiError } from '@/lib/api';

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
  hasRole: (roleName: string) => boolean;
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
      const response = await api.get<ApiResponse<User>>('/auth/me', {
        skipTenant: true,
        skipStore: true,
      });

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

  const login = async (email: string, password: string, deviceName: string = 'web-app'): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>(
        '/auth/login',
        { email, password, device_name: deviceName },
        { skipAuth: true, skipTenant: true, skipStore: true }
      );

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
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    password_confirmation: string
  ): Promise<User> => {
    setIsLoading(true);
    try {
      const response = await api.post<ApiResponse<{ user: User; token: string }>>(
        '/auth/register',
        { name, email, password, password_confirmation },
        { skipAuth: true, skipTenant: true, skipStore: true }
      );

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
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/auth/logout', {}, { skipTenant: true, skipStore: true });
    } catch {
      // Ignore network errors on logout
    } finally {
      storage.clearAll();
      setUser(null);
      setToken(null);
      setActiveTenant(null);
    }
  };

  const selectTenant = (tenantId: string) => {
    if (!user || !user.tenants) return;
    const found = user.tenants.find((t) => t.id === tenantId);
    if (found) {
      setActiveTenant(found);
      storage.setTenantId(found.id);
      // Reset active store so user reselects or defaults
      storage.setStoreId(null);
    }
  };

  const hasRole = (roleName: string): boolean => {
    if (!user) return false;
    if (user.is_internal) return true;
    if (!activeTenant) return false;
    return activeTenant.role?.toUpperCase() === roleName.toUpperCase();
  };

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
    }),
    [user, token, activeTenant, isLoading, refreshUser]
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
