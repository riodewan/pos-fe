import api from '@/lib/api';
import { PublicQrResolved, Order, ApiResponse, IpaymuQrisData, IpaymuStatusData } from '@/types';

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
      payment_method?: string | null;
      items: Array<{
        product_id: string;
        quantity: number;
        notes?: string | null;
      }>;
    }
  ) =>
    api.post<ApiResponse<Order>>(`/public/qr/${token}/order`, data, {
      skipAuth: true,
      skipTenant: true,
      skipStore: true,
    }),

  payCustomerOrder: (
    token: string,
    orderId: string,
    data: {
      method: string;
      provider?: string | null;
    }
  ) =>
    api.post<ApiResponse<Order>>(`/public/qr/${token}/order/${orderId}/pay`, data, {
      skipAuth: true,
      skipTenant: true,
      skipStore: true,
    }),

  trackCustomerOrder: (token: string, orderId: string) =>
    api.get<ApiResponse<Order>>(`/public/qr/${token}/order/${orderId}`, {
      skipAuth: true,
      skipTenant: true,
      skipStore: true,
    }),

  createPublicIpaymuQris: (
    token: string,
    orderId: string,
    data?: { customer_name?: string; customer_phone?: string; customer_email?: string }
  ) =>
    api.post<ApiResponse<IpaymuQrisData>>(`/public/qr/${token}/order/${orderId}/ipaymu/qris`, data || {}, {
      skipAuth: true,
      skipTenant: true,
      skipStore: true,
    }),

  checkPublicIpaymuStatus: (token: string, orderId: string, transactionId?: number | string) =>
    api.get<IpaymuStatusData>(`/public/qr/${token}/order/${orderId}/ipaymu/status`, {
      params: transactionId ? { transaction_id: transactionId } : undefined,
      skipAuth: true,
      skipTenant: true,
      skipStore: true,
    }),
};

