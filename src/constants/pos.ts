import { PaymentMethod, OrderStatus } from '@/types';

export const TAX_PERCENTAGE = 0.11; // PPN 11%

export const QUICK_CASH_DENOMINATIONS = [50000, 100000, 200000] as const;

export const PAYMENT_METHOD_OPTIONS: Array<{
  id: PaymentMethod;
  label: string;
  badgeVariant: 'success' | 'info' | 'secondary' | 'warning';
}> = [
  { id: 'CASH', label: 'Tunai', badgeVariant: 'success' },
  { id: 'QRIS', label: 'QRIS', badgeVariant: 'info' },
  { id: 'EDC', label: 'Debit / EDC', badgeVariant: 'secondary' },
  { id: 'TRANSFER', label: 'Transfer Bank', badgeVariant: 'secondary' },
];

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' }
> = {
  PENDING: { label: 'Menunggu', badgeVariant: 'warning' },
  CONFIRMED: { label: 'Terkonfirmasi', badgeVariant: 'info' },
  PREPARING: { label: 'Diproses Dapur', badgeVariant: 'info' },
  READY: { label: 'Siap Disajikan', badgeVariant: 'info' },
  COMPLETED: { label: 'Selesai', badgeVariant: 'success' },
  CANCELLED: { label: 'Dibatalkan', badgeVariant: 'destructive' },
};
