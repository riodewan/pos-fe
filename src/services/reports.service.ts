import api from '@/lib/api';
import { DashboardReport, InventoryUsageReport, CashierAuditReport, ApiResponse } from '@/types';

export const reportsService = {
  getDashboardOverview: (start_date: string, end_date: string) =>
    api.get<ApiResponse<DashboardReport>>('/reports/dashboard', {
      params: { start_date, end_date },
    }),

  getSalesSummary: (start_date: string, end_date: string) =>
    api.get<ApiResponse<DashboardReport['kpis']>>('/reports/sales', {
      params: { start_date, end_date },
    }),

  getTopProducts: (start_date: string, end_date: string, limit = 10) =>
    api.get<ApiResponse<DashboardReport['top_products']>>('/reports/products', {
      params: { start_date, end_date, limit },
    }),

  getPaymentMethods: (start_date: string, end_date: string) =>
    api.get<ApiResponse<DashboardReport['payment_methods']>>('/reports/payments', {
      params: { start_date, end_date },
    }),


  getInventoryUsage: (start_date: string, end_date: string) =>
    api.get<ApiResponse<InventoryUsageReport>>('/reports/inventory-usage', {
      params: { start_date, end_date },
    }),

  getCashierAudit: (start_date: string, end_date: string) =>
    api.get<ApiResponse<CashierAuditReport>>('/reports/cashiers', {
      params: { start_date, end_date },
    }),
};
