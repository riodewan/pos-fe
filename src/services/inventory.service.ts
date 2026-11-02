import api from '@/lib/api';
import { Purchase, StockBalance, Wastage, StockMovement, ApiResponse } from '@/types';

export const inventoryService = {
  // Purchases
  getPurchases: () =>
    api.get<ApiResponse<Purchase[]>>('/inventory/purchases'),

  getPurchase: (id: string) =>
    api.get<ApiResponse<Purchase>>(`/inventory/purchases/${id}`),

  createPurchase: (data: Partial<Purchase>) =>
    api.post<ApiResponse<Purchase>>('/inventory/purchases', data),

  receivePurchase: (id: string) =>
    api.post<ApiResponse<Purchase>>(`/inventory/purchases/${id}/receive`),

  cancelPurchase: (id: string) =>
    api.post<ApiResponse<Purchase>>(`/inventory/purchases/${id}/cancel`),

  // Stocks & Opname
  getStocks: () =>
    api.get<ApiResponse<StockBalance[]>>('/inventory/stocks'),

  adjustStock: (data: { ingredient_id: string; new_quantity: number; notes: string }) =>
    api.post<ApiResponse<any>>('/inventory/adjustments', data),

  recordStockIn: (data: { ingredient_id: string; quantity: number; source_type?: string; notes?: string }) =>
    api.post<ApiResponse<StockMovement>>('/inventory/stock-in', data),

  // Wastage
  getWastages: () =>
    api.get<ApiResponse<Wastage[]>>('/inventory/wastages'),

  createWastage: (data: Partial<Wastage>) =>
    api.post<ApiResponse<Wastage>>('/inventory/wastages', data),

  // Ledger Movements
  getMovements: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<StockMovement[]>>('/inventory/movements', { params }),
};
