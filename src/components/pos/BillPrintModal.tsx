'use client';

import React from 'react';
import { Printer, Check, X } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { PosCartItem } from './PosCartPanel';
import { formatRupiah } from '@/utils';

interface BillPrintModalProps {
  isOpen: boolean;
  orderNumber: string;
  cart: PosCartItem[];
  customerName: string;
  customerPhone: string;
  selectedTable: string;
  orderNotes?: string;
  discountAmount: number;
  taxAmount?: number;
  serviceFeeAmount?: number;
  deliveryCost?: number;
  packagingCost?: number;
  courierName?: string;
  cashierName?: string;
  storeName?: string;
  storeAddress?: string;
  storePhone?: string;
  onClose: () => void;
}

export function BillPrintModal({
  isOpen,
  orderNumber,
  cart,
  customerName,
  customerPhone,
  selectedTable,
  orderNotes,
  discountAmount,
  taxAmount,
  serviceFeeAmount,
  deliveryCost = 0,
  packagingCost = 0,
  courierName,
  cashierName = 'Kasir',
  storeName = 'NemuPOS Outlet',
  storeAddress,
  storePhone,
  onClose,
}: BillPrintModalProps) {
  if (!isOpen) return null;

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = taxAmount !== undefined ? taxAmount : Math.round(subtotal * 0.1);
  const nesosFee = serviceFeeAmount !== undefined ? serviceFeeAmount : 0;
  const total = Math.max(
    0,
    subtotal + tax + nesosFee + deliveryCost + packagingCost - discountAmount
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pratinjau Struk / Bill"
      size="sm"
      footer={
        <div className="flex items-center justify-between w-full">
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
            Cetak Struk
          </Button>
        </div>
      }
    >
      <div className="bg-neutral-50/70 p-4 rounded-xl border border-neutral-200/80 font-mono text-xs text-neutral-800 space-y-3">
        {/* Receipt Header */}
        <div className="text-center space-y-0.5 border-b border-dashed border-neutral-300 pb-3">
          <p className="font-bold text-sm text-neutral-900 tracking-wider uppercase">
            {storeName}
          </p>
          {storeAddress && (
            <p className="text-[11px] text-neutral-500">
              {storeAddress}
            </p>
          )}
          {storePhone && (
            <p className="text-[11px] text-neutral-500">Telp: {storePhone}</p>
          )}
        </div>

        {/* Order Info */}
        <div className="space-y-1 text-[11px] text-neutral-600 border-b border-dashed border-neutral-300 pb-2">
          <div className="flex justify-between">
            <span>No. Order:</span>
            <span className="font-bold text-neutral-800">{orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span>Kasir:</span>
            <span>{cashierName}</span>
          </div>
          <div className="flex justify-between">
            <span>Pelanggan:</span>
            <span>{customerName || 'Tamu'}</span>
          </div>
          <div className="flex justify-between">
            <span>Meja:</span>
            <span>{selectedTable || 'Takeaway'}</span>
          </div>
          <div className="flex justify-between">
            <span>Waktu:</span>
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
        </div>

        {/* Items List */}
        <div className="space-y-1.5 border-b border-dashed border-neutral-300 pb-3 text-xs">
          {cart.map((item) => (
            <div key={item.product.id} className="space-y-0.5">
              <div className="flex justify-between font-semibold">
                <span className="truncate max-w-[170px]">{item.product.name}</span>
                <span>{formatRupiah(item.product.price * item.quantity)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-neutral-500">
                <span>
                  {item.quantity} x {formatRupiah(item.product.price)}
                </span>
                {item.notes && <span className="italic">({item.notes})</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="space-y-1 text-xs border-b border-dashed border-neutral-300 pb-3">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Pajak (10%)</span>
            <span>{formatRupiah(tax)}</span>
          </div>
          <div className="flex justify-between">
            <span>Nesos Fee</span>
            <span>{formatRupiah(nesosFee)}</span>
          </div>
          {deliveryCost > 0 && (
            <div className="flex justify-between">
              <span>Ongkir ({courierName || 'Kurir'})</span>
              <span>{formatRupiah(deliveryCost)}</span>
            </div>
          )}
          {packagingCost > 0 && (
            <div className="flex justify-between">
              <span>Biaya Kemasan</span>
              <span>{formatRupiah(packagingCost)}</span>
            </div>
          )}
          {discountAmount > 0 && (
            <div className="flex justify-between text-rose-600">
              <span>Diskon</span>
              <span>- {formatRupiah(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-sm text-neutral-900 pt-1">
            <span>TOTAL</span>
            <span>{formatRupiah(total)}</span>
          </div>
        </div>

        {/* Receipt Footer */}
        <div className="text-center text-[10px] text-neutral-400 pt-1">
          <p>Terima kasih atas kunjungan Anda!</p>
          <p>WiFi: KopiMantap_Guest / Sandi: ngopidulu</p>
        </div>
      </div>
    </Modal>
  );
}
