export type ReservationStatus =
  | 'AKAN_DATANG'
  | 'DUDUK'
  | 'SELESAI'
  | 'DIBATALKAN';

export type ReservationArea = 'Indoor' | 'Outdoor' | 'VIP';

export interface ReservationActivity {
  id: string;
  time: string;
  description: string;
  type: 'website' | 'whatsapp' | 'staff' | 'system';
}

export interface PastCustomerReservation {
  id: string;
  date: string;
  guests: string;
  time: string;
  status: 'Selesai' | 'Dibatalkan' | 'Duduk';
}

export interface Reservation {
  id: string;
  tableId?: string;
  time: string;
  customerName: string;
  customerPhone: string;
  avatarUrl?: string;
  guestCount: number;
  table: string;
  area: ReservationArea;
  status: ReservationStatus;
  notes: string;
  date: string;
  duration?: string;
  activities?: ReservationActivity[];
  pastReservations?: PastCustomerReservation[];
}
