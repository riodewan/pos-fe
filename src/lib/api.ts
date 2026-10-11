// ==========================================
// Centralized API Client for POS Multi-Tenant SaaS
// ==========================================

import { ApiErrorResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export class ApiError extends Error {
  public status: number;
  public errors?: Record<string, string[]>;
  public raw?: unknown;

  constructor(status: number, message: string, errors?: Record<string, string[]>, raw?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.raw = raw;
  }
}

// Storage Keys
const TOKEN_KEY = 'pos_auth_token';
const TENANT_KEY = 'pos_active_tenant_id';
const STORE_KEY = 'pos_active_store_id';

export const storage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string | null) => {
    if (typeof window === 'undefined') return;
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  },
  getTenantId: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TENANT_KEY);
  },
  setTenantId: (tenantId: string | null) => {
    if (typeof window === 'undefined') return;
    if (tenantId) localStorage.setItem(TENANT_KEY, tenantId);
    else localStorage.removeItem(TENANT_KEY);
  },
  getStoreId: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORE_KEY);
  },
  setStoreId: (storeId: string | null) => {
    if (typeof window === 'undefined') return;
    if (storeId) localStorage.setItem(STORE_KEY, storeId);
    else localStorage.removeItem(STORE_KEY);
  },
  clearAll: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TENANT_KEY);
    localStorage.removeItem(STORE_KEY);
  },
};

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined | null>;
  skipAuth?: boolean;
  skipTenant?: boolean;
  skipStore?: boolean;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { params, skipAuth, skipTenant, skipStore, headers: customHeaders, ...fetchOptions } = options;

  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;

  if (params) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        query.append(key, String(val));
      }
    });
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  });

  if (!skipAuth) {
    const token = storage.getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  if (!skipTenant) {
    const tenantId = storage.getTenantId();
    if (tenantId) {
      headers.set('X-Tenant-Id', tenantId);
    }
  }

  if (!skipStore) {
    const storeId = storage.getStoreId();
    if (storeId) {
      headers.set('X-Store-Id', storeId);
    }
  }

  // Merge custom headers
  if (customHeaders) {
    if (customHeaders instanceof Headers) {
      customHeaders.forEach((value, key) => headers.set(key, value));
    } else if (Array.isArray(customHeaders)) {
      customHeaders.forEach(([key, value]) => headers.set(key, value));
    } else {
      Object.entries(customHeaders).forEach(([key, value]) => {
        if (value) headers.set(key, String(value));
      });
    }
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    let responseData: any = null;
    if (isJson) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      if (response.status === 401 && !skipAuth) {
        // Token expired or invalid
        if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
          storage.clearAll();
          window.location.href = '/login?expired=1';
        }
      }

      const errorMessage =
        (typeof responseData === 'object' && responseData !== null && responseData.message) ||
        `Request failed with status ${response.status}`;

      const errors =
        typeof responseData === 'object' && responseData !== null ? (responseData as ApiErrorResponse).errors : undefined;

      throw new ApiError(response.status, errorMessage, errors, responseData);
    }

    return responseData as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, (error as Error).message || 'Network connection error');
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};

export default api;
