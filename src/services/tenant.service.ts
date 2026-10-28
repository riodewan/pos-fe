import api from '@/lib/api';
import { Store, Tenant, User, Role, ApiResponse } from '@/types';

export const tenantService = {
  getProfile: () =>
    api.get<ApiResponse<Tenant>>('/tenant/profile', { skipStore: true }),

  updateProfile: (data: Partial<Tenant>) =>
    api.put<ApiResponse<Tenant>>('/tenant/profile', data, { skipStore: true }),

  getStores: () =>
    api.get<ApiResponse<Store[]>>('/tenant/stores', { skipStore: true }),

  createStore: (data: Partial<Store>) =>
    api.post<ApiResponse<Store>>('/tenant/stores', data, { skipStore: true }),

  updateStore: (id: string, data: Partial<Store>) =>
    api.put<ApiResponse<Store>>(`/tenant/stores/${id}`, data, { skipStore: true }),

  deleteStore: (id: string) =>
    api.delete<ApiResponse<null>>(`/tenant/stores/${id}`, { skipStore: true }),

  getTeamUsers: () =>
    api.get<ApiResponse<User[]>>('/tenant/users', { skipStore: true }),

  getRoles: () =>
    api.get<ApiResponse<Role[]>>('/tenant/roles', { skipStore: true }),

  // Customers (CRM & Loyalty)
  getCustomers: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<any[]>>('/tenant/customers', { params, skipStore: true }),

  getCustomer: (id: string) =>
    api.get<ApiResponse<any>>(`/tenant/customers/${id}`, { skipStore: true }),

  createCustomer: (data: any) =>
    api.post<ApiResponse<any>>('/tenant/customers', data, { skipStore: true }),

  updateCustomer: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/tenant/customers/${id}`, data, { skipStore: true }),

  deleteCustomer: (id: string) =>
    api.delete<ApiResponse<null>>(`/tenant/customers/${id}`, { skipStore: true }),

  // Notifications
  getNotifications: (params?: { category?: string; unread_only?: boolean }) =>
    api.get<ApiResponse<any[]>>('/tenant/notifications', { params }),

  markNotificationRead: (id: string) =>
    api.patch<ApiResponse<any>>(`/tenant/notifications/${id}/read`),

  markAllNotificationsRead: () =>
    api.post<ApiResponse<null>>('/tenant/notifications/mark-all-read'),

  // Store Outlet Profile
  getOutletProfile: () =>
    api.get<ApiResponse<any>>('/store/profile'),

  updateOutletProfile: (data: any) =>
    api.put<ApiResponse<any>>('/store/profile', data),

  // Taxes & Fees
  getTaxesFees: () =>
    api.get<ApiResponse<any[]>>('/store/taxes-fees'),

  createTaxFee: (data: any) =>
    api.post<ApiResponse<any>>('/store/taxes-fees', data),

  updateTaxFee: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/store/taxes-fees/${id}`, data),

  toggleTaxFee: (id: string) =>
    api.patch<ApiResponse<any>>(`/store/taxes-fees/${id}/toggle`),

  deleteTaxFee: (id: string) =>
    api.delete<ApiResponse<null>>(`/store/taxes-fees/${id}`),

  // Payment Methods
  getPaymentMethods: () =>
    api.get<ApiResponse<any[]>>('/store/payment-methods'),

  createPaymentMethod: (data: any) =>
    api.post<ApiResponse<any>>('/store/payment-methods', data),

  updatePaymentMethod: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/store/payment-methods/${id}`, data),

  togglePaymentMethod: (id: string) =>
    api.patch<ApiResponse<any>>(`/store/payment-methods/${id}/toggle`),

  reorderPaymentMethods: (items: Array<{ id: string; sort_order: number }>) =>
    api.post<ApiResponse<any[]>>('/store/payment-methods/reorder', { items }),

  deletePaymentMethod: (id: string) =>
    api.delete<ApiResponse<null>>(`/store/payment-methods/${id}`),
};
