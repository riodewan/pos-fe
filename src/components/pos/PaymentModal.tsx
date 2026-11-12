'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Banknote,
  QrCode,
  CreditCard,
  Building2,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { formatRupiah } from '@/utils';
import { posService } from '@/services';
import { IpaymuQrisData } from '@/types';

interface PaymentModalProps {
  isOpen: boolean;
  totalAmount: number;
  customerName: string;
  customerPhone?: string;
  selectedTable: string;
  paymentMethods?: Array<{
    id: string;
    name: string;
    type: string;
    is_active: boolean;
  }>;
  onClose: () => void;
  onSuccess: (method: string, tendered: number, change: number, paidOrder?: any) => Promise<void> | void;
  onRequestCreateOrder?: () => Promise<any | null>;
  existingOrderId?: string | null;
}

export function PaymentModal({
  isOpen,
  totalAmount,
  customerName,
  customerPhone,
  selectedTable,
  paymentMethods = [],
  onClose,
  onSuccess,
  onRequestCreateOrder,
  existingOrderId = null,
}: PaymentModalProps) {
  const [method, setMethod] = useState<'CASH' | 'QRIS' | 'EDC' | 'TRANSFER'>('CASH');
  const [cashTendered, setCashTendered] = useState<number>(totalAmount);
  const [isProcessing, setIsProcessing] = useState(false);

  // iPaymu QRIS States
  const [isGeneratingQris, setIsGeneratingQris] = useState(false);
  const [qrisData, setQrisData] = useState<IpaymuQrisData | null>(null);
  const [qrisError, setQrisError] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(existingOrderId);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isQrisPaid, setIsQrisPaid] = useState(false);
  const [paidOrderData, setPaidOrderData] = useState<any | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(900); // 15 mins
  const [imgError, setImgError] = useState(false);

  const pollingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop polling helper
  const stopPolling = useCallback(() => {
    if (pollingTimerRef.current) {
      clearInterval(pollingTimerRef.current);
      pollingTimerRef.current = null;
    }
  }, []);

  // Reset state when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setCashTendered(totalAmount);
      setActiveOrderId(existingOrderId);
      setIsQrisPaid(false);
      setPaidOrderData(null);
      setQrisError(null);
      setImgError(false);
    } else {
      stopPolling();
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
      setQrisData(null);
      setImgError(false);
      setIsGeneratingQris(false);
      setIsCheckingStatus(false);
      setIsQrisPaid(false);
    }
  }, [isOpen, totalAmount, existingOrderId, stopPolling]);

  // Check transaction status against backend & iPaymu
  const checkStatus = useCallback(
    async (orderIdToUse: string, trxId?: number | string) => {
      if (!orderIdToUse || isQrisPaid) return;
      try {
        setIsCheckingStatus(true);
        const res: any = await posService.checkIpaymuStatus(orderIdToUse, trxId);
        const data = res?.data ?? res;

        if (data?.is_paid) {
          setIsQrisPaid(true);
          const order = data?.data?.order ?? data?.data;
          setPaidOrderData(order);
          stopPolling();

          // Auto-trigger success after a brief pause so cashier sees checkmark
          setTimeout(() => {
            onSuccess('QRIS', totalAmount, 0, order);
          }, 1200);
        }
      } catch {
        // Continue polling silently on intermittent network error
      } finally {
        setIsCheckingStatus(false);
      }
    },
    [isQrisPaid, stopPolling, onSuccess, totalAmount]
  );

  // Generate QRIS via iPaymu
  const generateQris = useCallback(async () => {
    setIsGeneratingQris(true);
    setQrisError(null);
    try {
      let orderId = activeOrderId;
      if (!orderId && onRequestCreateOrder) {
        const createdOrder = await onRequestCreateOrder();
        if (createdOrder?.id) {
          orderId = createdOrder.id;
          setActiveOrderId(createdOrder.id);
        }
      }

      if (!orderId) {
        throw new Error('Pesanan belum dapat dibuat untuk QRIS. Silakan periksa kembali keranjang.');
      }

      const res: any = await posService.createIpaymuQris(orderId, {
        customer_name: customerName || 'Pelanggan POS',
        customer_phone: customerPhone || undefined,
      });

      const qrisResult = res?.data?.data ?? res?.data;
      if (!qrisResult?.qr_string && !qrisResult?.qr_image) {
        throw new Error(res?.data?.message || 'Gagal menghasilkan kode QRIS dari iPaymu.');
      }

      setQrisData(qrisResult);
      setCountdownSeconds(900); // 15 mins default

      // Start Countdown Timer
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Start Polling every 3.5s
      stopPolling();
      pollingTimerRef.current = setInterval(() => {
        checkStatus(orderId, qrisResult.transaction_id);
      }, 3500);
    } catch (err: any) {
      setQrisError(err?.response?.data?.message || err?.message || 'Gagal menghubungkan ke iPaymu Gateway.');
    } finally {
      setIsGeneratingQris(false);
    }
  }, [activeOrderId, onRequestCreateOrder, customerName, customerPhone, stopPolling, checkStatus]);

  // Handle switching method
  const handleSelectMethod = (selected: 'CASH' | 'QRIS' | 'EDC' | 'TRANSFER') => {
    setMethod(selected);
    setCashTendered(totalAmount);

    if (selected === 'QRIS') {
      if (!qrisData && !isGeneratingQris) {
        generateQris();
      } else if (qrisData && activeOrderId && !pollingTimerRef.current && !isQrisPaid) {
        // Resume polling
        pollingTimerRef.current = setInterval(() => {
          checkStatus(activeOrderId, qrisData.transaction_id);
        }, 3500);
      }
    } else {
      stopPolling();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling();
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [stopPolling]);

  if (!isOpen) return null;

  const denominations = [
    totalAmount,
    Math.ceil(totalAmount / 50000) * 50000,
    100000,
    150000,
    200000,
  ].filter((v, idx, arr) => arr.indexOf(v) === idx && v >= totalAmount);

  const change = Math.max(0, cashTendered - totalAmount);

  const handlePay = async () => {
    if (method === 'QRIS') {
      if (isQrisPaid && paidOrderData) {
        await onSuccess('QRIS', totalAmount, 0, paidOrderData);
        return;
      }
      if (activeOrderId && qrisData) {
        await checkStatus(activeOrderId, qrisData.transaction_id);
      }
      return;
    }

    setIsProcessing(true);
    try {
      await onSuccess(method, cashTendered, change);
    } finally {
      setIsProcessing(false);
    }
  };

  // Resolve active payment methods from store settings
  const hasTransfer = paymentMethods.some(
    (pm) => pm.is_active && (pm.type?.toUpperCase().includes('TRANSFER') || pm.name?.toUpperCase().includes('TRANSFER'))
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Proses Pembayaran"
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>
            Batal
          </Button>
          {method === 'QRIS' ? (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => activeOrderId && qrisData && checkStatus(activeOrderId, qrisData.transaction_id)}
                disabled={!qrisData || isCheckingStatus || isQrisPaid}
                className="text-xs"
              >
                <RefreshCw className={`size-3.5 mr-1 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                Periksa Status
              </Button>
              <Button
                variant="primary"
                size="sm"
                isLoading={isProcessing || isGeneratingQris}
                onClick={handlePay}
                disabled={!isQrisPaid && !qrisData}
                className={`${isQrisPaid ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#FF5C38] hover:bg-[#E04B28]'} font-bold`}
              >
                {isQrisPaid ? 'Selesaikan Transaksi' : `Bayar ${formatRupiah(totalAmount)}`}
              </Button>
            </div>
          ) : (
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
          )}
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
              onClick={() => handleSelectMethod('CASH')}
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
              onClick={() => handleSelectMethod('QRIS')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-colors cursor-pointer relative ${
                method === 'QRIS'
                  ? 'border-[#FF5C38] bg-rose-50/50 text-[#FF5C38] font-bold'
                  : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              <span className="absolute -top-1.5 -right-1 px-1.5 py-0.2 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[9px] font-black rounded-full shadow-xs">
                iPaymu
              </span>
              <QrCode className="size-5" />
              <span className="text-xs">QRIS Dinamis</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMethod('EDC')}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                method === 'EDC'
                  ? 'border-[#FF5C38] bg-rose-50/50 text-[#FF5C38] font-bold'
                  : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
              }`}
            >
              <CreditCard className="size-5" />
              <span className="text-xs">Kartu Debit / EDC</span>
            </button>

            {hasTransfer && (
              <button
                type="button"
                onClick={() => handleSelectMethod('TRANSFER')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${
                  method === 'TRANSFER'
                    ? 'border-[#FF5C38] bg-rose-50/50 text-[#FF5C38] font-bold'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <Building2 className="size-5" />
                <span className="text-xs">Transfer Bank</span>
              </button>
            )}
          </div>
        </div>

        {/* Method Detail: CASH */}
        {method === 'CASH' && (
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
        )}

        {/* Method Detail: QRIS (iPaymu Live Gateway) */}
        {method === 'QRIS' && (
          <div className="p-4 bg-white rounded-2xl border border-neutral-200/90 shadow-sm flex flex-col items-center justify-center text-center space-y-3">
            {isGeneratingQris ? (
              <div className="py-10 flex flex-col items-center space-y-2.5">
                <Loader2 className="size-8 text-[#FF5C38] animate-spin" />
                <p className="text-xs font-semibold text-neutral-700">Menghubungkan ke iPaymu Gateway...</p>
                <p className="text-[11px] text-neutral-400">Membuat QRIS Dinamis Sandbox</p>
              </div>
            ) : qrisError ? (
              <div className="py-6 px-3 bg-red-50 border border-red-200 rounded-xl text-center space-y-2 w-full">
                <AlertCircle className="size-6 text-red-600 mx-auto" />
                <p className="text-xs font-semibold text-red-800">{qrisError}</p>
                <Button variant="outline" size="sm" onClick={generateQris} className="text-xs mx-auto">
                  <RefreshCw className="size-3 mr-1" /> Coba Lagi
                </Button>
              </div>
            ) : isQrisPaid ? (
              <div className="py-6 px-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 w-full animate-in zoom-in-95">
                <CheckCircle2 className="size-12 text-emerald-600 mx-auto animate-bounce" />
                <p className="text-sm font-black text-emerald-800">Pembayaran Berhasil Diterima!</p>
                <p className="text-xs text-emerald-700">
                  Nominal {formatRupiah(totalAmount)} telah lunas diverifikasi oleh iPaymu.
                </p>
              </div>
            ) : qrisData ? (
              <>
                <div className="flex items-center justify-between w-full px-1">
                  <span className="px-2 py-0.5 bg-neutral-900 text-white text-[10px] font-black rounded tracking-wider">
                    QRIS DINAMIS
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                    <Clock className="size-3.5 text-neutral-400" />
                    <span className="font-mono font-bold text-neutral-800">
                      {String(Math.floor(countdownSeconds / 60)).padStart(2, '0')}:
                      {String(countdownSeconds % 60).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                {/* QR Display - Direct from iPaymu */}
                <div className="relative p-3 rounded-2xl bg-white border border-neutral-200/80 shadow-inner flex flex-col items-center justify-center min-h-[220px]">
                  {!imgError && qrisData.qr_image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={qrisData.qr_image}
                      alt="QRIS Asli Langsung dari iPaymu"
                      className="size-52 object-contain rounded-xl"
                      onError={() => setImgError(true)}
                    />
                  ) : qrisData.qr_string ? (
                    <QRCodeSVG
                      value={qrisData.qr_string}
                      size={180}
                      level="M"
                      includeMargin={false}
                    />
                  ) : (
                    <QrCode className="size-32 text-neutral-400" />
                  )}
                  <div className="mt-2 flex items-center justify-center gap-1 text-[10px] text-neutral-500 font-semibold uppercase tracking-wider">
                    <ShieldCheck className="size-3 text-emerald-600" /> QRIS Resmi Langsung dari iPaymu
                  </div>
                </div>

                {qrisData.qr_template && (
                  <a
                    href={qrisData.qr_template}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#FF5C38] hover:underline flex items-center justify-center gap-1 font-semibold"
                  >
                    <span>Buka Template Banner QRIS iPaymu</span>
                    <ExternalLink className="size-3" />
                  </a>
                )}

                {/* Polling Indicator */}
                <div className="flex items-center gap-2 text-xs text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-full border border-neutral-200/60">
                  <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Menunggu pembayaran pelanggan...</span>
                </div>

                <div className="text-[11px] text-neutral-400">
                  ID Transaksi: <span className="font-mono font-semibold text-neutral-600">#{qrisData.transaction_id}</span>
                </div>
              </>
            ) : (
              <div className="py-6 flex flex-col items-center space-y-2">
                <Button variant="outline" size="sm" onClick={generateQris} className="text-xs">
                  <QrCode className="size-4 mr-1.5 text-[#FF5C38]" /> Buat QRIS iPaymu
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Method Detail: EDC */}
        {method === 'EDC' && (
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

        {/* Method Detail: TRANSFER */}
        {method === 'TRANSFER' && (
          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-center space-y-1.5">
            <Building2 className="size-8 mx-auto text-neutral-500" />
            <p className="text-xs font-bold text-neutral-800">
              Transfer Bank Langsung
            </p>
            <p className="text-[11px] text-neutral-400">
              Pastikan bukti transfer telah diperiksa dan dana telah masuk ke rekening outlet.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}
