'use client';

import React, { useState } from 'react';
import { Printer, Check, X, FileText } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { PosCartItem } from './PosCartPanel';
import { formatRupiah } from '@/utils';

export interface PrintableReceiptItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface BillPrintModalProps {
  isOpen: boolean;
  orderNumber: string;
  cart?: PosCartItem[];
  items?: PrintableReceiptItem[];
  customerName?: string;
  customerPhone?: string;
  selectedTable?: string;
  orderNotes?: string;
  subtotalAmount?: number;
  discountAmount?: number;
  taxAmount?: number;
  serviceFeeAmount?: number;
  taxRate?: number;
  platformFeeRate?: number;
  deliveryCost?: number;
  packagingCost?: number;
  courierName?: string;
  cashierName?: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  onClose: () => void;
}

export function BillPrintModal({
  isOpen,
  orderNumber,
  cart,
  items,
  customerName,
  customerPhone,
  selectedTable,
  orderNotes,
  subtotalAmount,
  discountAmount = 0,
  taxAmount,
  serviceFeeAmount,
  taxRate = 10,
  platformFeeRate = 0,
  deliveryCost = 0,
  packagingCost = 0,
  courierName,
  cashierName = 'Kasir',
  storeName = '',
  storeAddress,
  storePhone,
  paymentMethod,
  paymentStatus,
  onClose,
}: BillPrintModalProps) {
  const [paperSize, setPaperSize] = useState<'58mm' | '80mm'>('58mm');

  if (!isOpen) return null;

  // Normalized items list
  const normalizedItems: PrintableReceiptItem[] = items
    ? items
    : cart
    ? cart.map((c) => ({
        id: c.product.id,
        name: c.product.name,
        quantity: c.quantity,
        price: c.product.price,
        notes: c.notes,
      }))
    : [];

  const computedSubtotal =
    subtotalAmount !== undefined
      ? subtotalAmount
      : normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const tax =
    taxAmount !== undefined
      ? taxAmount
      : Math.round((computedSubtotal * taxRate) / 100);

  const nesosFee =
    serviceFeeAmount !== undefined
      ? serviceFeeAmount
      : Math.round((computedSubtotal * platformFeeRate) / 100);

  const total = Math.max(
    0,
    computedSubtotal + tax + nesosFee + deliveryCost + packagingCost - discountAmount
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pratinjau Struk Kasir"
      size="sm"
      footer={
        <div className="flex items-center justify-between w-full">
          {/* Toggle Ukuran Kertas Thermal */}
          <div className="flex items-center gap-1 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
            <button
              type="button"
              onClick={() => setPaperSize('58mm')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                paperSize === '58mm'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="Kertas Thermal 58mm (Standar Mini)"
            >
              58mm
            </button>
            <button
              type="button"
              onClick={() => setPaperSize('80mm')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                paperSize === '80mm'
                  ? 'bg-white text-neutral-900 shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
              title="Kertas Thermal 80mm (Standar Desktop)"
            >
              80mm
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Tutup
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="size-4" />}
              className="bg-[#FF5C38] hover:bg-[#E04B28]"
            >
              Cetak Struk ({paperSize})
            </Button>
          </div>
        </div>
      }
    >
      {/* Wrapper Preview Struk */}
      <div className="flex justify-center p-2 bg-neutral-100/60 rounded-xl overflow-x-auto">
        <div
          id="thermal-receipt"
          className={`bg-white p-4 rounded-xl border border-neutral-200/90 shadow-sm font-mono text-xs text-neutral-900 transition-all ${
            paperSize === '58mm' ? 'w-[280px] paper-58mm' : 'w-[360px] paper-80mm'
          }`}
        >
          {/* Receipt Header */}
          <div className="text-center space-y-0.5 border-b border-dashed border-neutral-400 pb-3">
            <p className="font-bold text-sm tracking-wider uppercase text-neutral-950">
              {storeName || 'NemuHUB POS'}
            </p>
            {storeAddress && (
              <p className="text-[10px] text-neutral-600 leading-tight">
                {storeAddress}
              </p>
            )}
            {storePhone && (
              <p className="text-[10px] text-neutral-600">Telp: {storePhone}</p>
            )}
          </div>

          {/* Order Meta Info */}
          <div className="py-2.5 space-y-1 text-[11px] text-neutral-700 border-b border-dashed border-neutral-400">
            <div className="flex justify-between">
              <span>No. Order</span>
              <span className="font-bold text-neutral-900">{orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Waktu</span>
              <span>
                {new Date().toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Kasir</span>
              <span>{cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan</span>
              <span className="font-medium text-neutral-900 truncate max-w-[150px]">
                {customerName || 'Tamu'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tipe / Meja</span>
              <span className="font-medium">{selectedTable || 'Takeaway'}</span>
            </div>
            {paymentMethod && (
              <div className="flex justify-between">
                <span>Metode Bayar</span>
                <span className="font-bold">{paymentMethod}</span>
              </div>
            )}
            {paymentStatus && (
              <div className="flex justify-between">
                <span>Status</span>
                <span className="font-semibold text-emerald-700">
                  {paymentStatus}
                </span>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="py-2.5 space-y-2 border-b border-dashed border-neutral-400 text-xs">
            {normalizedItems.map((item, idx) => (
              <div key={item.id || idx} className="space-y-0.5">
                <div className="flex justify-between font-semibold text-neutral-950">
                  <span className="truncate max-w-[180px]">{item.name}</span>
                  <span>{formatRupiah(item.price * item.quantity)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-neutral-600">
                  <span>
                    {item.quantity} x {formatRupiah(item.price)}
                  </span>
                  {item.notes && (
                    <span className="italic text-[10px] text-neutral-500 truncate max-w-[120px]">
                      ({item.notes})
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Summary */}
          <div className="py-2.5 space-y-1 text-xs border-b border-dashed border-neutral-400">
            <div className="flex justify-between text-neutral-700">
              <span>Subtotal</span>
              <span>{formatRupiah(computedSubtotal)}</span>
            </div>

            {tax > 0 && (
              <div className="flex justify-between text-neutral-700">
                <span>Pajak ({taxRate}%)</span>
                <span>{formatRupiah(tax)}</span>
              </div>
            )}

            {nesosFee > 0 && (
              <div className="flex justify-between text-neutral-700">
                <span>Biaya Layanan ({platformFeeRate}%)</span>
                <span>{formatRupiah(nesosFee)}</span>
              </div>
            )}

            {deliveryCost > 0 && (
              <div className="flex justify-between text-neutral-700">
                <span>Ongkir {courierName ? `(${courierName})` : ''}</span>
                <span>{formatRupiah(deliveryCost)}</span>
              </div>
            )}

            {packagingCost > 0 && (
              <div className="flex justify-between text-neutral-700">
                <span>Kemasan</span>
                <span>{formatRupiah(packagingCost)}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Diskon</span>
                <span>- {formatRupiah(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-sm text-neutral-950 pt-1.5 border-t border-dotted border-neutral-300">
              <span>TOTAL</span>
              <span>{formatRupiah(total)}</span>
            </div>
          </div>

          {orderNotes && (
            <div className="py-2 text-[10px] text-neutral-600 border-b border-dashed border-neutral-400">
              <span className="font-semibold">Catatan:</span> {orderNotes}
            </div>
          )}

          {/* Receipt Footer */}
          <div className="text-center text-[10px] text-neutral-500 pt-3 space-y-0.5">
            <p className="font-semibold text-neutral-700">
              Terima kasih atas kunjungan Anda!
            </p>
            <p>Simpan struk ini sebagai bukti pembayaran yang sah.</p>
            <p className="text-[9px] text-neutral-400 pt-1 font-sans">
              Powered by NemuPOS
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
