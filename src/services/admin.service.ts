import { api } from '@/lib/api';
import { ApiResponse } from '@/types';

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface PlatformOverviewKPIs {
  total_tenants: number;
  active_tenants: number;
  total_stores: number;
  total_users: number;
  total_orders: number;
  total_gmv: number;
  pending_approvals: number;
}

export interface PlatformTenantItem {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  address?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE';
  stores_count?: number;
  tenant_users_count?: number;
  created_at: string;
  stores?: any[];
  tenant_users?: any[];
}

export interface PlatformApprovalItem {
  id: string;
  type: 'TENANT_REGISTRATION' | 'OUTLET_ADDITION' | 'PLAN_UPGRADE' | 'REFUND_REQUEST';
  tenant_id?: string;
  store_id?: string;
  user_id?: string;
  title: string;
  description?: string;
  payload?: any;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
  tenant?: { id: string; name: string; email: string };
  reviewer?: { id: string; name: string; email: string };
}

export interface MasterCategoryItem {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export type MasterItemGroup = 'FACILITY' | 'BUSINESS_TYPE' | 'PAYMENT_METHOD' | 'TAX_FEE' | 'BANK';

export interface PlatformMasterItem {
  id: string;
  group: MasterItemGroup;
  name: string;
  code?: string;
  icon?: string;
  description?: string;
  metadata?: Record<string, any> | null;
  is_active: boolean;
  sort_order: number;
  created_at?: string;
}

export interface GlobalUnitItem {
  id: string;
  name: string;
  code: string;
  type: 'WEIGHT' | 'VOLUME' | 'COUNT';
  created_at?: string;
}

export interface SubscriptionPlanItem {
  id: string;
  name: string;
  code: string;
  price: number;
  billing_cycle: string;
  max_outlets: number;
  max_staff: number;
  features: string[];
  is_active: boolean;
}

export const adminService = {
  // Overview
  getOverview: () =>
    api.get<ApiResponse<{
      kpis: PlatformOverviewKPIs;
      recent_tenants: PlatformTenantItem[];
      recent_approvals: PlatformApprovalItem[];
    }>>('/internal/overview', { skipStore: true }),

  // Tenants Management
  getTenants: (params?: { search?: string; status?: string; page?: number; per_page?: number }) =>
    api.get<ApiResponse<PaginatedResponse<PlatformTenantItem>>>('/internal/tenants', {
      params,
      skipStore: true,
    }),

  getTenant: (id: string) =>
    api.get<ApiResponse<PlatformTenantItem>>(`/internal/tenants/${id}`, { skipStore: true }),

  createTenant: (data: {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    owner_name: string;
    owner_email: string;
    owner_password: string;
    store_name?: string;
    store_code?: string;
  }) => api.post<ApiResponse<PlatformTenantItem>>('/internal/tenants', data, { skipStore: true }),

  updateTenant: (id: string, data: Partial<PlatformTenantItem>) =>
    api.put<ApiResponse<PlatformTenantItem>>(`/internal/tenants/${id}`, data, { skipStore: true }),

  updateTenantStatus: (id: string, status: 'ACTIVE' | 'SUSPENDED' | 'INACTIVE') =>
    api.put<ApiResponse<PlatformTenantItem>>(`/internal/tenants/${id}/status`, { status }, { skipStore: true }),

  // Stores Across Platform
  getStores: (params?: { search?: string; tenant_id?: string; page?: number; per_page?: number }) =>
    api.get<ApiResponse<PaginatedResponse<any>>>('/internal/stores', { params, skipStore: true }),

  // Approvals
  getApprovals: (params?: { status?: string; type?: string; search?: string; page?: number; per_page?: number }) =>
    api.get<ApiResponse<PaginatedResponse<PlatformApprovalItem>>>('/internal/approvals', { params, skipStore: true }),

  actionApproval: (id: string, action: 'APPROVE' | 'REJECT', reviewNotes?: string) =>
    api.post<ApiResponse<PlatformApprovalItem>>(
      `/internal/approvals/${id}/action`,
      { action, review_notes: reviewNotes },
      { skipStore: true }
    ),

  // Master Categories
  getMasterCategories: () =>
    api.get<ApiResponse<MasterCategoryItem[]>>('/internal/master/categories', { skipStore: true }),

  createMasterCategory: (data: Partial<MasterCategoryItem>) =>
    api.post<ApiResponse<MasterCategoryItem>>('/internal/master/categories', data, { skipStore: true }),

  updateMasterCategory: (id: string, data: Partial<MasterCategoryItem>) =>
    api.put<ApiResponse<MasterCategoryItem>>(`/internal/master/categories/${id}`, data, { skipStore: true }),

  deleteMasterCategory: (id: string) =>
    api.delete<ApiResponse<null>>(`/internal/master/categories/${id}`, { skipStore: true }),

  // Global Master Items (FACILITY, BUSINESS_TYPE, PAYMENT_METHOD, TAX_FEE, BANK)
  getMasterItems: (group?: MasterItemGroup) =>
    api.get<ApiResponse<PlatformMasterItem[]>>('/internal/master/items', {
      params: group ? { group } : undefined,
      skipStore: true,
    }),

  createMasterItem: (data: Partial<PlatformMasterItem>) =>
    api.post<ApiResponse<PlatformMasterItem>>('/internal/master/items', data, { skipStore: true }),

  updateMasterItem: (id: string, data: Partial<PlatformMasterItem>) =>
    api.put<ApiResponse<PlatformMasterItem>>(`/internal/master/items/${id}`, data, { skipStore: true }),

  toggleMasterItem: (id: string) =>
    api.patch<ApiResponse<PlatformMasterItem>>(`/internal/master/items/${id}/toggle`, {}, { skipStore: true }),

  deleteMasterItem: (id: string) =>
    api.delete<ApiResponse<null>>(`/internal/master/items/${id}`, { skipStore: true }),

  // Global Measurement Units
  getMasterUnits: () =>
    api.get<ApiResponse<GlobalUnitItem[]>>('/internal/master/units', { skipStore: true }),

  createMasterUnit: (data: { name: string; code: string; type: 'WEIGHT' | 'VOLUME' | 'COUNT' }) =>
    api.post<ApiResponse<GlobalUnitItem>>('/internal/master/units', data, { skipStore: true }),

  updateMasterUnit: (id: string, data: Partial<{ name: string; code: string; type: 'WEIGHT' | 'VOLUME' | 'COUNT' }>) =>
    api.put<ApiResponse<GlobalUnitItem>>(`/internal/master/units/${id}`, data, { skipStore: true }),

  deleteMasterUnit: (id: string) =>
    api.delete<ApiResponse<null>>(`/internal/master/units/${id}`, { skipStore: true }),

  // Subscription Plans
  getSubscriptionPlans: () =>
    api.get<ApiResponse<SubscriptionPlanItem[]>>('/internal/master/plans', { skipStore: true }),

  updateSubscriptionPlan: (id: string, data: Partial<SubscriptionPlanItem>) =>
    api.put<ApiResponse<SubscriptionPlanItem>>(`/internal/master/plans/${id}`, data, { skipStore: true }),

  // Platform Audit Logs
  getAuditLogs: (params?: { search?: string; action?: string; module?: string; page?: number; per_page?: number }) =>
    api.get<ApiResponse<PaginatedResponse<any>>>('/internal/audit-logs', { params, skipStore: true }),
};
