export type SettingsActiveTab = 'personalization' | 'taxes_fees' | 'payment_methods';

export type ThemePreset = 'Default' | 'Coklat' | 'Hijau' | 'Biru' | 'Oranye' | 'Hitam';

export interface TaxFeeItem {
  id: string;
  name: string;
  type: 'Pajak' | 'Biaya';
  value: string; // e.g. '11%', '2.5%'
  appliesTo: string; // e.g. 'Semua Menu', 'Semua Transaksi'
  isActive: boolean;
  isPlatformManaged?: boolean;
}

export interface PaymentMethodItem {
  id: string;
  name: string;
  type: 'Tunai' | 'E - Wallet' | 'Kartu' | 'Transfer';
  description: string;
  isActive: boolean;
  iconType: 'cash' | 'qris' | 'ovo' | 'dana' | 'shopeepay' | 'card' | 'bank';
}
