'use client';

import React from 'react';
import {
  QrCode,
  Clock,
  User,
  ArrowRight,
  CheckCircle2,
  ChefHat,
  X,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { PosCartItem } from './PosCartPanel';
import { INITIAL_POS_PRODUCTS } from './PosProductGrid';
import { formatRupiah } from '@/utils';

export interface QrIncomingOrder {
  id: string;
  orderNumber: string;
  table: string;
  customerName: string;
  customerPhone?: string;
  items: PosCartItem[];
  paymentStatus: 'PAID_QRIS' | 'PAY_AT_CASHIER';
  totalAmount: number;
  timeAgo: string;
}

export const MOCK_QR_INCOMING_ORDERS: QrIncomingOrder[] = [
  {
    id: 'qr-1',
    orderNumber: 'QR-2026-0044',
    table: 'Meja 4',
    customerName: 'Rian Perdana',
    customerPhone: '081299887766',
    items: [
      { product: INITIAL_POS_PRODUCTS[3], quantity: 1, notes: 'Hot, extra shot' }, // Cappucino
      { product: INITIAL_POS_PRODUCTS[5], quantity: 1, notes: 'Hangatkan' }, // Croissant
    ],
    paymentStatus: 'PAY_AT_CASHIER',
    totalAmount: 53000,
    timeAgo: '2 menit lalu',
  },
  {
    id: 'qr-2',
    orderNumber: 'QR-2026-0043',
    table: 'Meja 2',
    customerName: 'Siti Rahma',
    customerPhone: '081434357890',
    items: [
      { product: INITIAL_POS_PRODUCTS[1], quantity: 2, notes: 'Es sedikit' }, // Matcha Latte
    ],
    paymentStatus: 'PAID_QRIS',
    totalAmount: 60000,
    timeAgo: '5 menit lalu',
  },
];

interface QrIncomingOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadOrderToCart: (order: QrIncomingOrder) => void;
  onDirectConfirmToKitchen: (order: QrIncomingOrder) => void;
}

export function QrIncomingOrdersModal({
  isOpen,
  onClose,
  onLoadOrderToCart,
  onDirectConfirmToKitchen,
}: QrIncomingOrdersModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Antrean Pesanan Masuk (QR Order Meja)"
      size="md"
      footer={
        <div className="flex justify-end w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      }
    >
      <div className="space-y-3 py-1">
        <p className="text-xs text-neutral-500">
          Pesanan mandiri dari tamu yang memindai QR code di meja. Anda dapat menarik pesanan ke keranjang kasir atau langsung mengirimnya ke dapur.
        </p>

        <div className="space-y-3">
          {MOCK_QR_INCOMING_ORDERS.map((order) => (
            <div
              key={order.id}
              className="p-3.5 rounded-xl border border-neutral-200/90 bg-white hover:border-neutral-300 transition-all shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-neutral-900">
                    {order.orderNumber}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    {order.table}
                  </span>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    order.paymentStatus === 'PAID_QRIS'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {order.paymentStatus === 'PAID_QRIS'
                    ? 'Lunas (QRIS)'
                    : 'Bayar di Kasir'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-600">
                <span className="font-semibold text-neutral-900">
                  {order.customerName}
                </span>
                <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                  <Clock className="size-3" /> {order.timeAgo}
                </span>
              </div>

              {/* Items Summary */}
              <div className="p-2 rounded-lg bg-neutral-50/70 border border-neutral-100 text-xs text-neutral-700 space-y-1">
                {order.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>
                      {it.quantity}x {it.product.name}
                      {it.notes && <span className="text-[10px] text-neutral-400 italic"> ({it.notes})</span>}
                    </span>
                    <span className="font-semibold">
                      {formatRupiah(it.product.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-neutral-900">
                  Total: {formatRupiah(order.totalAmount)}
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => {
                      onDirectConfirmToKitchen(order);
                      onClose();
                    }}
                    leftIcon={<ChefHat className="size-3 text-blue-600" />}
                  >
                    Kirim Dapur
                  </Button>

                  <Button
                    variant="primary"
                    size="xs"
                    className="bg-[#FF5C38] hover:bg-[#E04B28]"
                    onClick={() => {
                      onLoadOrderToCart(order);
                      onClose();
                    }}
                    leftIcon={<ArrowRight className="size-3" />}
                  >
                    Tarik ke Kasir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
