'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Store } from '@/types';
import { storage } from '@/lib/api';
import { tenantService } from '@/services';
import { useAuth } from './AuthContext';

interface StoreContextType {
  stores: Store[];
  activeStore: Store | null;
  isLoadingStores: boolean;
  selectStore: (storeId: string) => void;
  refreshStores: () => Promise<Store[]>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, activeTenant } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [activeStore, setActiveStore] = useState<Store | null>(null);
  const [isLoadingStores, setIsLoadingStores] = useState(false);

  const refreshStores = useCallback(async (): Promise<Store[]> => {
    if (!isAuthenticated || !activeTenant) {
      setStores([]);
      setActiveStore(null);
      storage.setStoreId(null);
      return [];
    }

    setIsLoadingStores(true);
    try {
      const response = await tenantService.getStores();
      const storeList = response.data || [];

      setStores(storeList);

      const savedStoreId = storage.getStoreId();
      const matched = storeList.find((s) => s.id === savedStoreId);
      const selected = matched || storeList[0] || null;

      setActiveStore(selected);
      storage.setStoreId(selected ? selected.id : null);

      return storeList;
    } catch (err) {
      console.error('Failed to load stores:', err);
      setStores([]);
      setActiveStore(null);
      return [];
    } finally {
      setIsLoadingStores(false);
    }
  }, [isAuthenticated, activeTenant]);

  useEffect(() => {
    if (isAuthenticated && activeTenant) {
      refreshStores();
    } else {
      setStores([]);
      setActiveStore(null);
    }
  }, [isAuthenticated, activeTenant, refreshStores]);

  const selectStore = (storeId: string) => {
    const found = stores.find((s) => s.id === storeId);
    if (found) {
      setActiveStore(found);
      storage.setStoreId(found.id);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        stores,
        activeStore,
        isLoadingStores,
        selectStore,
        refreshStores,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore(): StoreContextType {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
