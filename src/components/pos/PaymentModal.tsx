'use client';

import React, { useState } from 'react';
import {
  Banknote,
  QrCode,
  CreditCard,
  CheckCircle2,
  Receipt,
  Printer,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { formatRupiah } from '@/utils';

interface PaymentModalProps {
  isOpen: boolean;
  totalAmount: number;
  customerName: string;
  selectedTable: string;
  onClose: () => void;
  onSuccess: (method: string, tendered: number, change: number) => void;
}

export function PaymentModal({
  isOpen,
  totalAmount,
  customerName,
  selectedTable,
  onClose,
  onSuccess,
}: PaymentModalProps) {
  const [method, setMethod] = useState<'CASH' | 'QRIS' | 'DEBIT'>('CASH');
  const [cashTendered, setCashTendered] = useState<number>(totalAmount);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const denominations = [
    totalAmount,
    Math.ceil(totalAmount / 50000) * 50000,
    100000,
    150000,
    200000,
  ].filter((v, idx, arr) => arr.indexOf(v) === idx && v >= totalAmount);

  const change = Math.max(0, cashTendered - totalAmount);

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess(method, cashTendered, change);
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Proses Pembayaran"
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isProcessing}
            onClick={handlePay}
            disabled={method === 'CASH' && cashTendered < totalAmount}
            className="bg-[#FF5C38] hover:bg-[#E04B28] font-bold"
          >
            Bayar {formatRupiah(totalAmount)}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Total Summary Header */}
        <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-neutral-500">Total Tagihan</p>
            <p className="text-lg font-bold text-neutral-900">
              {formatRupiah(totalAmount)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-neutral-700">
              {customerName || 'Tamu'}
            </p>
            <p className="text-[11px] text-neutral-400">{selectedTable || 'Takeaway'}</p>
          </div>
        </div>

        {/* Method Selector */}
        <div>
          <p className="text-xs font-bold text-neutral-800 mb-2">
            Metode Pembayaran
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => {
                setMethod('CASH');
                setCashTendered(totalAmount);
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                method === 'CASH'
                  ? 'border-[#FF5C38] bg-rose-50/50 text-[#FF5C38] font-bold'
                  : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              <Banknote className="size-5" />
              <span className="text-xs">Tunai (Cash)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod('QRIS');
                setCashTendered(totalAmount);
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                method === 'QRIS'
                  ? 'border-[#FF5C38] bg-rose-50/50 text-[#FF5C38] font-bold'
                  : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              <QrCode className="size-5" />
              <span className="text-xs">QRIS Dinamis</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMethod('DEBIT');
                setCashTendered(totalAmount);
              }}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                method === 'DEBIT'
                  ? 'border-[#FF5C38] bg-rose-50/50 text-[#FF5C38] font-bold'
                  : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              <CreditCard className="size-5" />
              <span className="text-xs">Kartu Debit</span>
            </button>
          </div>
        </div>

        {/* Method Detail */}
        {method === 'CASH' ? (
          <div className="space-y-3 pt-1">
            <div>
              <label className="text-xs font-semibold text-neutral-800 block mb-1">
                Uang Diterima
              </label>
              <Input
                type="number"
                value={cashTendered || ''}
                onChange={(e) => setCashTendered(Number(e.target.value) || 0)}
                placeholder="Masukkan nominal uang tunai"
              />
            </div>

            {/* Quick cash denomination chips */}
            <div className="flex flex-wrap gap-1.5">
              {denominations.map((d, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCashTendered(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                    cashTendered === d
                      ? 'border-[#FF5C38] bg-rose-50 text-[#FF5C38]'
                      : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {d === totalAmount ? 'Uang Pas' : formatRupiah(d)}
                </button>
              ))}
            </div>

            {/* Change / Kembalian */}
            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-600">
                Kembalian
              </span>
              <span className="text-base font-bold text-emerald-700">
                {formatRupiah(change)}
              </span>
            </div>
          </div>
        ) : method === 'QRIS' ? (
          <div className="p-4 bg-white rounded-xl border border-neutral-200 flex flex-col items-center justify-center text-center space-y-2">
            <div className="size-40 bg-neutral-100 rounded-xl border border-neutral-200 flex items-center justify-center">
              <QrCode className="size-28 text-neutral-800" />
            </div>
            <p className="text-xs font-bold text-neutral-800">
              Pindai QRIS untuk Bayar
            </p>
            <p className="text-[11px] text-neutral-400">
              Mendukung GoPay, OVO, Dana, ShopeePay, BCA, dll.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center space-y-1.5">
            <CreditCard className="size-8 mx-auto text-neutral-500" />
            <p className="text-xs font-bold text-neutral-800">
              Gesek / Tap Kartu pada EDC
            </p>
            <p className="text-[11px] text-neutral-400">
              Pastikan struk EDC telah berhasil dicetak sebelum menyelesaikan transaksi.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
