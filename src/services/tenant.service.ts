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
    api.get<ApiResponse<any[]>>('/tenant/users', { skipStore: true }),

  addTeamUser: (data: { email: string; name?: string; phone?: string; job_title?: string; password?: string; role_id: string; store_id?: string }) =>
    api.post<ApiResponse<any>>('/tenant/users', data, { skipStore: true }),

  updateTeamUser: (userId: string, data: { name?: string; email?: string; phone?: string; job_title?: string; role_id?: string; store_id?: string; is_active?: boolean; password?: string }) =>
    api.put<ApiResponse<any>>(`/tenant/users/${userId}`, data, { skipStore: true }),

  toggleTeamUserStatus: (userId: string) =>
    api.patch<ApiResponse<any>>(`/tenant/users/${userId}/toggle`, {}, { skipStore: true }),

  updateUserRoles: (userId: string, roles: Array<{ role_id: string; store_id?: string }>) =>
    api.put<ApiResponse<any>>(`/tenant/users/${userId}/roles`, { roles }, { skipStore: true }),

  removeTeamUser: (userId: string) =>
    api.delete<ApiResponse<null>>(`/tenant/users/${userId}`, { skipStore: true }),

  getRoles: () =>
    api.get<ApiResponse<Role[]>>('/tenant/roles', { skipStore: true }),

  createRole: (data: { name: string; description?: string; permissions?: string[] }) =>
    api.post<ApiResponse<Role>>('/tenant/roles', data, { skipStore: true }),

  updateRole: (id: string, data: { name?: string; description?: string; permissions?: string[] }) =>
    api.put<ApiResponse<Role>>(`/tenant/roles/${id}`, data, { skipStore: true }),

  deleteRole: (id: string) =>
    api.delete<ApiResponse<null>>(`/tenant/roles/${id}`, { skipStore: true }),

  getPermissions: () =>
    api.get<ApiResponse<any[]>>('/tenant/permissions', { skipStore: true }),

  // Customers (CRM & Loyalty)
  getCustomers: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<any[]>>('/tenant/customers', { params, skipStore: true }),

  getCustomer: (id: string) =>
    api.get<ApiResponse<any>>(`/tenant/customers/${id}`, { skipStore: true }),

  createCustomer: (data: any) =>
    api.post<ApiResponse<any>>('/tenant/customers', data, { skipStore: true }),

  updateCustomer: (id: string, data: any) =>
    api.put<ApiResponse<any>>(`/tenant/customers/${id}`, data, { skipStore: true }),

  toggleCustomerStatus: (id: string) =>
    api.patch<ApiResponse<any>>(`/tenant/customers/${id}/toggle`, {}, { skipStore: true }),

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
  getOutletProfile: (storeId?: string) =>
    api.get<ApiResponse<any>>('/store/profile', {
      params: storeId ? { store_id: storeId } : undefined,
      headers: storeId ? { 'X-Store-Id': storeId } : undefined,
    }),

  updateOutletProfile: (data: any, storeId?: string) =>
    api.put<ApiResponse<any>>('/store/profile', data, {
      params: storeId ? { store_id: storeId } : undefined,
      headers: storeId ? { 'X-Store-Id': storeId } : undefined,
    }),

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

  // KYB Verification & Onboarding Approval
  submitKyb: (data: any) =>
    api.post<ApiResponse<any>>('/tenant/kyb/submit', data, { skipStore: true }),

  getKybCategories: () =>
    api.get<ApiResponse<Array<{ id: string; name: string; slug: string }>>>('/tenant/kyb/categories', { skipStore: true }),

  getKybStatus: () =>
    api.get<ApiResponse<{
      has_submitted: boolean;
      status: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
      tenant?: any;
      approval?: any;
    }>>('/tenant/kyb/status', { skipStore: true }),
};
