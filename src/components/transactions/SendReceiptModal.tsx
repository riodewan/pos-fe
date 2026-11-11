'use client';

import React, { useState, useEffect } from 'react';
import { Send, Copy, Phone, MessageSquare, Check, X, Store } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useToast } from '@/context/ToastContext';
import { formatRupiah } from '@/utils';

export interface SendReceiptItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface SendReceiptData {
  orderNumber: string;
  storeName?: string;
  storeAddress?: string;
  customerName?: string;
  customerPhone?: string;
  dateTime?: string;
  diningType?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  items: SendReceiptItem[];
  subtotal: number;
  tax?: number;
  serviceFee?: number;
  discount?: number;
  total: number;
}

interface SendReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: SendReceiptData | null;
}

/**
 * Normalisasi nomor HP ke format internasional Indonesia (62xxx)
 */
export function normalizeIndonesianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) {
    return '62' + digits.slice(1);
  }
  if (digits.startsWith('62')) {
    return digits;
  }
  if (digits.startsWith('8')) {
    return '62' + digits;
  }
  return digits;
}

export function buildReceiptWhatsAppText(data: SendReceiptData): string {
  const store = data.storeName || 'NemuHUB POS';
  const orderNum = data.orderNumber || '-';
  const dateStr =
    data.dateTime ||
    new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  const customer = data.customerName || 'Tamu';
  const type = data.diningType || 'Takeaway';
  const payMethod = data.paymentMethod ? `${data.paymentMethod} (${data.paymentStatus || 'Lunas'})` : (data.paymentStatus || 'Lunas');

  let text = `🧾 *STRUK PEMBAYARAN - ${store.toUpperCase()}*\n`;
  if (data.storeAddress) {
    text += `📍 ${data.storeAddress}\n`;
  }
  text += `----------------------------------------\n`;
  text += `🔢 *No. Order*: ${orderNum}\n`;
  text += `🕒 *Waktu*: ${dateStr}\n`;
  text += `👤 *Pelanggan*: ${customer}\n`;
  text += `🍽️ *Layanan*: ${type}\n`;
  text += `💳 *Metode*: ${payMethod}\n`;
  text += `----------------------------------------\n`;
  text += `*RINCIAN PESANAN:*\n`;

  data.items.forEach((it) => {
    const lineTotal = formatRupiah(it.price * it.quantity);
    text += `• ${it.quantity}x ${it.name} - ${lineTotal}\n`;
    if (it.notes) {
      text += `  _Catatan: ${it.notes}_\n`;
    }
  });

  text += `----------------------------------------\n`;
  text += `Subtotal: ${formatRupiah(data.subtotal)}\n`;
  if (data.tax && data.tax > 0) {
    text += `Pajak: ${formatRupiah(data.tax)}\n`;
  }
  if (data.serviceFee && data.serviceFee > 0) {
    text += `Biaya Layanan: ${formatRupiah(data.serviceFee)}\n`;
  }
  if (data.discount && data.discount > 0) {
    text += `Diskon: -${formatRupiah(data.discount)}\n`;
  }
  text += `*TOTAL: ${formatRupiah(data.total)}*\n`;
  text += `----------------------------------------\n`;
  text += `Terima kasih atas kunjungan Anda! 🙏\n`;
  text += `_Simpan struk digital ini sebagai bukti transaksi yang sah._`;

  return text;
}

export function SendReceiptModal({ isOpen, onClose, data }: SendReceiptModalProps) {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && data) {
      setPhoneNumber(data.customerPhone || '');
      setCopied(false);
    }
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  const receiptText = buildReceiptWhatsAppText(data);
  const normalizedPhone = normalizeIndonesianPhone(phoneNumber);

  const handleSendWhatsApp = () => {
    if (!normalizedPhone || normalizedPhone.length < 9) {
      toast.warning('Masukkan nomor WhatsApp yang valid (contoh: 081234567890)');
      return;
    }

    const encoded = encodeURIComponent(receiptText);
    const waUrl = `https://wa.me/${normalizedPhone}?text=${encoded}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
    toast.success(`Struk digital diarahkan ke WhatsApp (+${normalizedPhone})`);
    onClose();
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(receiptText);
      setCopied(true);
      toast.success('Rincian struk disalin ke clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Gagal menyalin struk ke clipboard.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kirim Struk ke Pelanggan"
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyText}
            leftIcon={copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
          >
            {copied ? 'Tersalin' : 'Salin Teks'}
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSendWhatsApp}
              leftIcon={<Send className="size-4" />}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              Kirim ke WhatsApp
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Input Nomor WhatsApp */}
        <div>
          <label className="block text-xs font-semibold text-neutral-800 mb-1.5">
            Nomor WhatsApp Pelanggan
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Phone className="size-4" />
            </div>
            <input
              type="tel"
              placeholder="081234567890 atau 6281234567890"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono"
              autoFocus
            />
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Format otomatis dikonversi ke kode negara Indonesia (+62).
          </p>
        </div>

        {/* Pratinjau Pesan WhatsApp */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
              <MessageSquare className="size-3.5 text-emerald-600" />
              Pratinjau Pesan Struk
            </span>
            <span className="text-[11px] text-neutral-400">Siap dikirim via WhatsApp Web / App</span>
          </div>
          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 font-mono text-[11px] text-neutral-700 whitespace-pre-wrap max-h-56 overflow-y-auto leading-relaxed selection:bg-emerald-100">
            {receiptText}
          </div>
        </div>
      </div>
    </Modal>
  );
}
