export interface OperatingHourItem {
  day: string;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface OutletPhotoItem {
  id: string;
  url: string;
  title: string;
  category: 'Indoor' | 'Outdoor' | 'Menu' | 'Lainnya';
}

export interface ReceiptConfig {
  showLogo: boolean;
  displayName: string;
  shortAddress: string;
  footerMessage: string;
}

export interface OutletProfile {
  id: string;
  name: string;
  branchName: string;
  category: string;
  description: string;
  logoUrl: string;
  thumbnailUrl: string | null;
  phone: string;
  email: string;
  website: string;
  address: string;
  mapsUrl?: string;
  receiptConfig: ReceiptConfig;
  operationalStatus: 'AKTIF' | 'NON_AKTIF';
  publicationStatus: 'DIPUBLIKASIKAN' | 'NON_AKTIF';
  operatingHours: OperatingHourItem[];
  facilities: string[];
  photos: OutletPhotoItem[];
}
