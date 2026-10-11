/**
 * Indonesian Rupiah (IDR) currency formatting & parsing utilities
 */

export function formatRupiah(amount: number | string | null | undefined): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : (amount ?? 0);
  if (isNaN(num)) return 'Rp 0';

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(num);
}

export function parseRupiah(formatted: string): number {
  if (!formatted) return 0;
  const cleaned = formatted.replace(/[^0-9,-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
