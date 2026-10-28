export type SettingsActiveTab = 'personalization' | 'taxes_fees' | 'payment_methods';

export type ThemePreset = 'Default' | 'Coklat' | 'Hijau' | 'Biru' | 'Oranye' | 'Hitam';

export interface TaxFeeItem {
  id: string;
  name: string;
  type: 'Pajak' | 'Biaya';
  value: string; // e.g. '11%', 'Rp2.000'
  appliesTo: string; // e.g. 'Semua Menu', 'Dine-in, Takeway'
  isActive: boolean;
}

export interface PaymentMethodItem {
  id: string;
  name: string;
  type: 'Tunai' | 'E - Wallet' | 'Kartu' | 'Transfer';
  description: string;
  isActive: boolean;
  iconType: 'cash' | 'qris' | 'ovo' | 'dana' | 'shopeepay' | 'card' | 'bank';
}
