import api from '@/lib/api';
import { PublicQrResolved, ApiResponse } from '@/types';

export const publicService = {
  resolveQrToken: (token: string) =>
    api.get<ApiResponse<PublicQrResolved>>(`/public/qr/${token}`, {
      skipAuth: true,
      skipTenant: true,
      skipStore: true,
    }),

  submitCustomerOrder: (
    token: string,
    data: {
      customer_name: string;
      customer_phone?: string | null;
      notes?: string | null;
      items: Array<{
        product_id: string;
        quantity: number;
        notes?: string | null;
      }>;
    }
  ) =>
    api.post<ApiResponse<any>>(`/public/qr/${token}/order`, data, {
      skipAuth: true,
      skipTenant: true,
      skipStore: true,
    }),
};
