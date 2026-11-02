'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Phone,
  Minus,
  Plus,
  FileText,
  Edit2,
  Tag,
  ChevronRight,
  Receipt,
  CreditCard,
  Trash2,
  ShoppingBag,
  Bike,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { PosProduct } from './PosProductGrid';
import { formatRupiah } from '@/utils';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { EmptyState } from '@/components/common/EmptyState';
import { tenantService } from '@/services/tenant.service';

export interface PosCartItem {
  product: PosProduct;
  quantity: number;
  notes?: string;
}

interface PosCartPanelProps {
  cart: PosCartItem[];
  customerName: string;
  customerPhone: string;
  selectedTable: string;
  orderNotes: string;
  discountAmount: number;
  orderType?: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY' | 'QR_ORDER';
  taxAmount?: number;
  serviceFeeAmount?: number;
  taxRate?: number;
  platformFeeRate?: number;
  deliveryFee?: number;
  packagingFee?: number;
  courierName?: string;
  takeawayQueue?: string;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onUpdateItemNote: (productId: string, notes: string) => void;
  onUpdateOrderNotes: (notes: string) => void;
  onSelectCustomer: (name: string, phone: string) => void;
  onSelectTable: (table: string) => void;
  onOpenTablePicker?: () => void;
  onOpenDeliveryModal?: () => void;
  onOpenTakeawayModal?: () => void;
  onOpenQrIncomingModal?: () => void;
  onOpenDiscountModal: () => void;
  onOpenBillPrint: () => void;
  onOpenPayment: () => void;
  onClearCart?: () => void;
}

export function PosCartPanel({
  cart,
  customerName,
  customerPhone,
  selectedTable,
  orderNotes,
  discountAmount,
  orderType = 'DINE_IN',
  taxAmount,
  serviceFeeAmount,
  taxRate = 10,
  platformFeeRate = 0,
  deliveryFee = 0,
  packagingFee = 0,
  courierName = 'GoSend',
  takeawayQueue = 'TA-014',
  onUpdateQuantity,
  onUpdateItemNote,
  onUpdateOrderNotes,
  onSelectCustomer,
  onSelectTable,
  onOpenTablePicker,
  onOpenDeliveryModal,
  onOpenTakeawayModal,
  onOpenQrIncomingModal,
  onOpenDiscountModal,
  onOpenBillPrint,
  onOpenPayment,
}: PosCartPanelProps) {
  // Item note modal state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [tempItemNote, setTempItemNote] = useState('');

  // Order general note modal state
  const [isOrderNoteModalOpen, setIsOrderNoteModalOpen] = useState(false);
  const [tempOrderNote, setTempOrderNote] = useState(orderNotes);

  // Customer selection dropdown / modal state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [tempCustomerName, setTempCustomerName] = useState(customerName);
  const [tempCustomerPhone, setTempCustomerPhone] = useState(customerPhone);
  const [existingCustomers, setExistingCustomers] = useState<
    Array<{ id: string; name: string; phone: string; segmentation?: string; total_visits?: number }>
  >([]);

  useEffect(() => {
    if (isCustomerModalOpen) {
      tenantService
        .getCustomers()
        .then((res) => {
          if (Array.isArray(res?.data)) {
            setExistingCustomers(
              res.data.map((c: any) => ({
                id: c.id,
                name: c.name || '',
                phone: c.phone || '',
                segmentation: c.segmentation || 'Baru',
                total_visits: Number(c.total_visits) || 0,
              }))
            );
          }
        })
        .catch(() => {});
    }
  }, [isCustomerModalOpen]);

  const matchingCustomerSuggestions = useMemo(() => {
    const qName = (tempCustomerName || '').trim().toLowerCase();
    const qPhone = (tempCustomerPhone || '').replace(/[^0-9]/g, '');
    if (!qName && !qPhone) {
      return existingCustomers.slice(0, 4);
    }
    return existingCustomers
      .filter((c) => {
        const cName = (c.name || '').toLowerCase();
        const cPhone = (c.phone || '').replace(/[^0-9]/g, '');
        const nameMatch = qName.length >= 2 && (cName.includes(qName) || qName.includes(cName));
        const phoneMatch = qPhone.length >= 3 && cPhone.includes(qPhone);
        return nameMatch || phoneMatch;
      })
      .slice(0, 5);
  }, [existingCustomers, tempCustomerName, tempCustomerPhone]);

  // Calculations matching outlet & platform configuration
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const tax = taxAmount !== undefined ? taxAmount : Math.round((subtotal * taxRate) / 100);
  const nesosFee = serviceFeeAmount !== undefined ? serviceFeeAmount : Math.round((subtotal * platformFeeRate) / 100);
  const total = Math.max(
    0,
    subtotal + tax + nesosFee - discountAmount
  );

  const handleOpenItemNote = (item: PosCartItem) => {
    setEditingItemId(item.product.id);
    setTempItemNote(item.notes || '');
  };

  const handleSaveItemNote = () => {
    if (editingItemId) {
      onUpdateItemNote(editingItemId, tempItemNote);
      setEditingItemId(null);
    }
  };

  const handleSaveOrderNote = () => {
    onUpdateOrderNotes(tempOrderNote);
    setIsOrderNoteModalOpen(false);
  };

  const handleSaveCustomer = () => {
    onSelectCustomer(tempCustomerName, tempCustomerPhone);
    setIsCustomerModalOpen(false);
  };

  return (
    <div className="w-full lg:w-96 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col overflow-hidden shrink-0">
      {/* Top Customer & Table bar matching Screenshot 1 & 2 */}
      <div className="p-4 border-b border-neutral-100 bg-white space-y-2">
        <div className="flex items-center justify-between gap-3">
          {/* Customer button / selector */}
          <button
            type="button"
            onClick={() => {
              setTempCustomerName(customerName);
              setTempCustomerPhone(customerPhone);
              setIsCustomerModalOpen(true);
            }}
            className="flex-1 text-left group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <User className="size-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
              <span className="text-xs font-bold text-neutral-900 group-hover:text-[#FF5C38] transition-colors truncate">
                {customerName || 'Ketik atau pilih pelanggan...'}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 pl-6">
              <Phone className="size-3 text-neutral-400" />
              <span className="text-[11px] text-neutral-400 truncate">
                {customerPhone || 'Ketik atau pilih pelanggan...'}
              </span>
            </div>
          </button>

          {/* Contextual Table / Order Type Badge */}
          <div className="shrink-0">
            {orderType === 'DINE_IN' ? (
              <button
                type="button"
                onClick={onOpenTablePicker}
                className="h-8 px-2.5 rounded-lg border border-neutral-200 bg-white hover:border-[#FF5C38] text-xs font-semibold text-neutral-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Pilih Meja Dine-in"
              >
                <span>{selectedTable || 'Pilih Meja'}</span>
              </button>
            ) : orderType === 'TAKEAWAY' ? (
              <button
                type="button"
                onClick={onOpenTakeawayModal}
                className="h-8 px-2.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Pengaturan Takeaway"
              >
                <ShoppingBag className="size-3.5 text-amber-600" />
                <span>{takeawayQueue || 'TA-014'}</span>
              </button>
            ) : orderType === 'DELIVERY' ? (
              <button
                type="button"
                onClick={onOpenDeliveryModal}
                className="h-8 px-2.5 rounded-lg border border-blue-300 bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Pengaturan Kurir Delivery"
              >
                <Bike className="size-3.5 text-blue-600" />
                <span>{courierName || 'GoSend'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenQrIncomingModal}
                className="h-8 px-2.5 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-xs font-bold text-purple-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Antrean QR Order Masuk"
              >
                <QrCode className="size-3.5 text-purple-600" />
                <span>{selectedTable || 'QR Meja'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cart Items Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          /* Empty State matching Screenshot 2 */
          <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-4">
            <EmptyState
              title="BELUM ADA PESANAN"
              description="Pilih menu di sebelah kiri untuk menambahkan pesanan ke keranjang."
            />
          </div>
        ) : (
          /* Cart Item List matching Screenshot 1 */
          cart.map((item) => (
            <div
              key={item.product.id}
              className="p-3 rounded-xl border border-neutral-200/80 bg-white border-l-3 border-l-[#FF5C38] space-y-2.5 shadow-2xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={item.product.imageUrl || ''}
                    alt={item.product.name}
                    className="size-11 rounded-lg object-cover bg-neutral-100 shrink-0"
                  />
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-neutral-900 truncate">
                      {item.product.name}
                    </h5>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      {formatRupiah(item.product.price)}
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-neutral-900 shrink-0">
                  {formatRupiah(item.product.price * item.quantity)}
                </span>
              </div>

              {/* Quantity Stepper & Note Row */}
              <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                {/* Stepper matching Screenshot 1 */}
                <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50/50">
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.product.id, -1)}
                    className="size-6 flex items-center justify-center text-neutral-500 hover:bg-neutral-200/60 transition-colors"
                  >
                    <Minus className="size-3" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-neutral-800">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateQuantity(item.product.id, 1)}
                    className="size-6 flex items-center justify-center text-neutral-500 hover:bg-neutral-200/60 transition-colors"
                  >
                    <Plus className="size-3" />
                  </button>
                </div>

                {/* Note trigger */}
                <button
                  type="button"
                  onClick={() => handleOpenItemNote(item)}
                  className="flex items-center gap-1.5 text-[11px] text-neutral-400 hover:text-neutral-700 transition-colors"
                >
                  <FileText className="size-3 text-neutral-400" />
                  <span className="truncate max-w-[120px]">
                    {item.notes || 'Tambah catatan'}
                  </span>
                  <Edit2 className="size-3 text-neutral-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Diskon / Voucher Row matching Screenshot 1 */}
      <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50/40">
        <button
          type="button"
          onClick={onOpenDiscountModal}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-neutral-200 hover:border-emerald-300 transition-colors group cursor-pointer"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <Tag className="size-4 text-emerald-600" />
            <span>Diskon/Voucher</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-neutral-400 group-hover:text-neutral-700">
            {discountAmount > 0 && (
              <span className="font-bold text-emerald-600">
                - {formatRupiah(discountAmount)}
              </span>
            )}
            <ChevronRight className="size-4" />
          </div>
        </button>
      </div>

      {/* Pricing Breakdown matching Screenshot 1 */}
      <div className="px-4 py-3 border-t border-neutral-100 bg-white space-y-1.5 text-xs">
        <div className="flex items-center justify-between text-neutral-600">
          <span>Subtotal</span>
          <span className="font-semibold text-neutral-900">
            {formatRupiah(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-neutral-600">
          <span>Pajak ({taxRate}%)</span>
          <span className="font-semibold text-neutral-900">
            {formatRupiah(tax)}
          </span>
        </div>

        <div className="flex items-center justify-between text-neutral-600">
          <span>Biaya Platform ({platformFeeRate}%)</span>
          <span className="font-semibold text-neutral-900">
            {formatRupiah(nesosFee)}
          </span>
        </div>

        <div className="flex items-center justify-between text-neutral-600">
          <span>Diskon</span>
          <span className="font-semibold text-rose-600">
            - {formatRupiah(discountAmount)}
          </span>
        </div>

        {/* Total highlighted in blue matching Screenshot 1 */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
          <span className="text-sm font-bold text-neutral-900">Total</span>
          <span className="text-lg font-bold text-blue-600">
            {formatRupiah(total)}
          </span>
        </div>
      </div>

      {/* Catatan Pesanan section matching Screenshot 1 */}
      <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50/40">
        <p className="text-[11px] font-bold text-neutral-700 mb-1">
          Catatan Pesanan
        </p>
        <button
          type="button"
          onClick={() => {
            setTempOrderNote(orderNotes);
            setIsOrderNoteModalOpen(true);
          }}
          className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 text-xs text-neutral-500 cursor-pointer"
        >
          <div className="flex items-center gap-2 truncate">
            <FileText className="size-3.5 text-neutral-400 shrink-0" />
            <span className="truncate">
              {orderNotes || 'Tambah catatan'}
            </span>
          </div>
          <Edit2 className="size-3 text-neutral-400 shrink-0 ml-1" />
        </button>
      </div>

      {/* Bottom Action Buttons matching Screenshot 1 */}
      <div className="p-4 border-t border-neutral-100 bg-white grid grid-cols-2 gap-2.5">
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenBillPrint}
          disabled={cart.length === 0}
          leftIcon={<Receipt className="size-4" />}
          className="text-xs font-semibold py-2.5"
        >
          Cetak Bill
        </Button>

        <Button
          variant="primary"
          size="sm"
          onClick={onOpenPayment}
          disabled={cart.length === 0}
          leftIcon={<CreditCard className="size-4" />}
          className="bg-[#FF5C38] hover:bg-[#E04B28] text-xs font-semibold py-2.5"
        >
          Bayar
        </Button>
      </div>

      {/* Item Note Modal */}
      <Modal
        isOpen={editingItemId !== null}
        onClose={() => setEditingItemId(null)}
        title="Catatan Menu"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingItemId(null)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-[#FF5C38] hover:bg-[#E04B28]"
              onClick={handleSaveItemNote}
            >
              Simpan
            </Button>
          </div>
        }
      >
        <div className="py-1">
          <Input
            label="Catatan khusus hidangan"
            value={tempItemNote}
            onChange={(e) => setTempItemNote(e.target.value)}
            placeholder="Contoh: Less ice, less sugar, pisah sambal..."
          />
        </div>
      </Modal>

      {/* General Order Note Modal */}
      <Modal
        isOpen={isOrderNoteModalOpen}
        onClose={() => setIsOrderNoteModalOpen(false)}
        title="Catatan Seluruh Pesanan"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOrderNoteModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-[#FF5C38] hover:bg-[#E04B28]"
              onClick={handleSaveOrderNote}
            >
              Simpan
            </Button>
          </div>
        }
      >
        <div className="py-1">
          <Textarea
            label="Catatan pesanan"
            value={tempOrderNote}
            onChange={(e) => setTempOrderNote(e.target.value)}
            rows={3}
            placeholder="Contoh: Meja dekat jendela, sajikan makanan bersamaan..."
          />
        </div>
      </Modal>

      {/* Customer Selector Modal */}
      <Modal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        title="Data Pelanggan"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCustomerModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-[#FF5C38] hover:bg-[#E04B28]"
              onClick={handleSaveCustomer}
            >
              Terapkan
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-1">
          <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/80 text-[11px] text-neutral-700 flex items-start gap-2">
            <Sparkles className="size-3.5 text-[#FF5C38] shrink-0 mt-0.5" />
            <span>
              Ketik nama atau nomor HP. Pelanggan baru atau yang memiliki <strong>nomor HP sama / kemiripan nama</strong> akan otomatis disimpan &amp; digabungkan ke Data Pelanggan saat pesanan dibuat.
            </span>
          </div>
          <Input
            label="Nama Pelanggan"
            value={tempCustomerName}
            onChange={(e) => setTempCustomerName(e.target.value)}
            placeholder="Contoh: Marshanda"
          />
          <Input
            label="Nomor Telepon"
            value={tempCustomerPhone}
            onChange={(e) => setTempCustomerPhone(e.target.value)}
            placeholder="Contoh: 081245678909"
          />

          {matchingCustomerSuggestions.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                Pelanggan Terdaftar yang Cocok / Sering Berkunjung
              </p>
              <div className="max-h-36 overflow-y-auto divide-y divide-neutral-100 rounded-xl border border-neutral-200 bg-neutral-50/50">
                {matchingCustomerSuggestions.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setTempCustomerName(c.name);
                      setTempCustomerPhone(c.phone || '');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-orange-50/60 transition-colors flex items-center justify-between text-xs cursor-pointer"
                  >
                    <div>
                      <p className="font-bold text-neutral-900">{c.name}</p>
                      <p className="text-[10.5px] text-neutral-500 font-mono">{c.phone || 'Tanpa No. HP'}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-neutral-600">
                      {c.segmentation} &bull; {c.total_visits}x transaksi
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
