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

  getFinanceReconciliation: (start_date?: string, end_date?: string) =>
    api.get<ApiResponse<any>>('/reports/reconciliation', {
      params: { start_date, end_date },
    }),

  getDisbursements: () => api.get<ApiResponse<any>>('/reports/disbursements'),

  createDisbursement: (data: { amount: number; bank_name: string; account_number: string }) =>
    api.post<ApiResponse<any>>('/reports/disbursements', data),

  getCashAudits: () => api.get<ApiResponse<any[]>>('/reports/cash-audits'),

  createCashAudit: (data: {
    shift_name: string;
    shift_date?: string;
    opening_cash: number;
    actual_cash?: number | null;
    notes?: string | null;
  }) => api.post<ApiResponse<any>>('/reports/cash-audits', data),

  updateCashAudit: (id: string, data: { opening_cash?: number; actual_cash?: number | null; notes?: string | null }) =>
    api.put<ApiResponse<any>>(`/reports/cash-audits/${id}`, data),
};
