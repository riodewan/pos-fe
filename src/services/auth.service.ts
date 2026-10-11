import api from '@/lib/api';
import { User, ApiResponse } from '@/types';

export const authService = {
  login: (data: { email: string; password: string; device_name?: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/login', data, {
      skipAuth: true,
      skipTenant: true,
      skipStore: true,
    }),

  register: (data: { name: string; email: string; password: string; password_confirmation: string }) =>
    api.post<ApiResponse<{ user: User; token: string }>>('/auth/register', data, {
      skipAuth: true,
      skipTenant: true,
      skipStore: true,
    }),

  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout', {}, {
      skipTenant: true,
      skipStore: true,
    }),

  getMe: () =>
    api.get<ApiResponse<User>>('/auth/me', {
      skipTenant: true,
      skipStore: true,
    }),
};
