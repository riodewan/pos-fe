export type NotificationCategory = 'Semua' | 'Pesanan' | 'Reservasi' | 'Inventori' | 'Sistem';

export type NotificationStatusFilter = 'Semua' | 'BELUM_DIBACA' | 'SUDAH_DIBACA';

export interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Pesanan' | 'Reservasi' | 'Inventori' | 'Sistem';
  isRead: boolean;
  dateGroup: 'Hari Ini' | 'Kemarin' | string;
  time: string;
  targetUrl?: string;
}
