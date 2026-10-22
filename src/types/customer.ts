export type CustomerSegmentation = 'VIP' | 'Regular' | 'Baru';
export type CustomerStatus = 'Aktif' | 'Nonaktif';

export interface CustomerTransaction {
  id: string;
  orderNumber: string;
  date: string;
  items: string;
  amount: number;
  paymentMethod: string;
  status: 'Selesai' | 'Dibatalkan';
}

export interface Customer {
  id: string;
  name: string;
  initials: string;
  joinDate: string;
  phone: string;
  email: string;
  totalTransactions: number;
  totalSpent: number;
  segmentation: CustomerSegmentation;
  status: CustomerStatus;
  birthDate?: string;
  gender?: 'Laki-laki' | 'Perempuan';
  notes?: string;
  address?: string;
  avatarUrl?: string;
  transactions?: CustomerTransaction[];
}
