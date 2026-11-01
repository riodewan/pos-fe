import api from '@/lib/api';

export interface AuditLogUser {
  id: string;
  name: string;
  email: string;
  avatar_url?: string | null;
  user_roles?: Array<{
    id: string;
    role_id: string;
    role?: {
      id: string;
      name: string;
    };
  }>;
}

export interface AuditLogStore {
  id: string;
  name: string;
}

export interface AuditLog {
  id: string;
  tenant_id?: string | null;
  store_id?: string | null;
  user_id?: string | null;
  action: 'LOGIN' | 'LOGOUT' | string;
  module?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  old_values?: any;
  new_values?: any;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
  user?: AuditLogUser | null;
  store?: AuditLogStore | null;
}

export interface AuditLogQueryParams {
  [key: string]: string | number | boolean | null | undefined;
  action?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export interface AuditLogPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface AuditLogListResponse {
  message: string;
  data: AuditLog[];
  pagination: AuditLogPagination;
}

export const systemService = {
  getAuditLogs: (params?: AuditLogQueryParams) =>
    api.get<AuditLogListResponse>('/system/audit-logs', { params }),
};
