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
};
