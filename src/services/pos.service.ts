import api from '@/lib/api';
import { DiningTable, QrCode, Order, Payment, ApiResponse, PaymentMethod } from '@/types';

export const posService = {
  // Tables & QR
  getTables: () =>
    api.get<ApiResponse<DiningTable[]>>('/pos/tables'),

  getTable: (id: string) =>
    api.get<ApiResponse<DiningTable>>(`/pos/tables/${id}`),

  createTable: (data: Partial<DiningTable>) =>
    api.post<ApiResponse<DiningTable>>('/pos/tables', data),

  updateTable: (id: string, data: Partial<DiningTable>) =>
    api.put<ApiResponse<DiningTable>>(`/pos/tables/${id}`, data),

  deleteTable: (id: string) =>
    api.delete<ApiResponse<null>>(`/pos/tables/${id}`),

  getTableQrs: (tableId: string) =>
    api.get<ApiResponse<QrCode[]>>(`/pos/tables/${tableId}/qr`),

  rotateTableQr: (tableId: string) =>
    api.post<ApiResponse<QrCode>>(`/pos/tables/${tableId}/qr`),

  // Orders
  getOrders: (params?: Record<string, string | number>) =>
    api.get<ApiResponse<Order[]>>('/pos/orders', { params }),

  getOrder: (id: string) =>
    api.get<ApiResponse<Order>>(`/pos/orders/${id}`),

  createOrder: (data: {
    table_id?: string | null;
    customer_name?: string | null;
    customer_phone?: string | null;
    discount_amount?: number;
    tax_amount?: number;
    service_charge?: number;
    notes?: string | null;
    items: Array<{
      product_id: string;
      quantity: number;
      discount_amount?: number;
      notes?: string | null;
    }>;
  }) => api.post<ApiResponse<Order>>('/pos/orders', data),

  updateOrderStatus: (orderId: string, status: string) =>
    api.put<ApiResponse<Order>>(`/pos/orders/${orderId}/status`, { status }),

  cancelOrder: (orderId: string, reason: string) =>
    api.post<ApiResponse<Order>>(`/pos/orders/${orderId}/cancel`, { reason }),

  // Payments
  getOrderPayments: (orderId: string) =>
    api.get<ApiResponse<Payment[]>>(`/pos/orders/${orderId}/payments`),

  processPayment: (
    orderId: string,
    data: {
      method: PaymentMethod;
      amount: number;
      provider?: string | null;
      provider_reference?: string | null;
      metadata?: Record<string, unknown>;
    }
  ) => api.post<ApiResponse<Payment>>(`/pos/orders/${orderId}/payments`, data),
};
