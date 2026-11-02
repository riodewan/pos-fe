export type NotificationCategory = 'Semua' | 'Pesanan' | 'Reservasi' | 'Inventori' | 'Sistem';

export type NotificationStatusFilter = 'Semua' | 'BELUM_DIBACA' | 'SUDAH_DIBACA';

export type NotificationDateFilter = 'ALL' | 'TODAY' | '7D' | '30D' | 'THIS_MONTH';

export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Pesanan' | 'Reservasi' | 'Inventori' | 'Sistem';
  isRead: boolean;
  dateGroup: string;
  time: string;
  createdAt?: string;
  targetUrl?: string;
}

export interface NotificationCounts {
  all: number;
  pesanan: number;
  reservasi: number;
  inventori: number;
  sistem: number;
  unread: number;
  read: number;
}
