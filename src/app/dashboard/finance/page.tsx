'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Banknote,
  DollarSign,
  TrendingUp,
  RefreshCw,
  Check,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Calendar,
  CreditCard,
  QrCode,
  Store,
  Layers,
  CheckCircle2,
  Receipt,
  Plus,
  ShieldCheck,
  Search,
} from 'lucide-react';
import {
  DataTable,
  ColumnDef,
  StatusBadge,
  Button,
  Select,
  Drawer,
  Input,
  Modal,
  Textarea,
  CardSkeleton,
  PageLoader,
} from '@/components/common';
import { formatRupiah, getISODateOnly, getPastDateISO } from '@/utils';
import { reportsService } from '@/services/reports.service';
import { tenantService, GlobalMasterItem } from '@/services/tenant.service';
import { useStore } from '@/context/StoreContext';
import { useToast } from '@/context/ToastContext';

// Channel Reconciliation Dataset
interface ChannelReconciliation {
  id: string;
  channelName: string;
  iconType: 'qris' | 'cash' | 'card' | 'online';
  totalTransactions: number;
  grossAmount: number;
  netSales: number;
  taxAmount: number;
  mdrFee: number;
  netSettlement: number;
  settlementStatus: 'Siap Cair' | 'Selesai' | 'Menunggu';
}

// Payment Transaction Item
interface PaymentReconciliationRecord {
  id: string;
  paymentNumber: string;
  orderNumber: string;
  customerName: string;
  method: string;
  grossAmount: number;
  taxAmount: number;
  mdrFee: number;
  netAmount: number;
  settlementStatus: string;
  paidAt: string;
}

// Disbursement Dataset
interface DisbursementRecord {
  id: string;
  batchId: string;
  requestDate: string;
  bankName: string;
  accountNumber: string;
  grossAmount: number;
  fee: number;
  netReceived: number;
  status: 'Berhasil' | 'Diproses' | 'Gagal';
}

// Cashier Audit Dataset
interface CashierShiftAudit {
  id: string;
  shiftName: string;
  cashierName: string;
  date: string;
  openingCash: number;
  cashSales: number;
  expectedCash: number;
  actualCash: number;
  variance: number;
  status: 'Sesuai' | 'Selisih Lebih' | 'Selisih Kurang';
}

type FinanceTab = 'channels' | 'disbursements' | 'cashier-audit';

export default function FinancePage() {
  const { toast } = useToast();
  const { activeStore } = useStore();

  const [activeTab, setActiveTab] = useState<FinanceTab>('channels');
  const [dateRangeFilter, setDateRangeFilter] = useState('this_month');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [channels, setChannels] = useState<ChannelReconciliation[]>([]);
  const [reconciliations, setReconciliations] = useState<PaymentReconciliationRecord[]>([]);
  const [disbursements, setDisbursements] = useState<DisbursementRecord[]>([]);
  const [audits, setAudits] = useState<CashierShiftAudit[]>([]);
  const [totals, setTotals] = useState<{
    net: number;
    tax: number;
    mdr: number;
    cash: number;
    digitalNet: number;
  } | null>(null);
  const [available, setAvailable] = useState<number | null>(null);
  const [transferFee, setTransferFee] = useState(4500);

  // Search filter for recent transactions
  const [transSearch, setTransSearch] = useState('');

  // Disbursement Drawer state
  const [isDisburseOpen, setIsDisburseOpen] = useState(false);
  const [disburseAmount, setDisburseAmount] = useState('');
  const [targetBank, setTargetBank] = useState('');
  const [targetAccountNumber, setTargetAccountNumber] = useState('');
  const [masterBanks, setMasterBanks] = useState<GlobalMasterItem[]>([]);
  const [isSubmittingDisburse, setIsSubmittingDisburse] = useState(false);

  // Cash Shift Audit Modal state
  const [isCashAuditModalOpen, setIsCashAuditModalOpen] = useState(false);
  const [auditForm, setAuditForm] = useState({
    shift_name: 'Shift Siang',
    shift_date: getISODateOnly(),
    opening_cash: '500000',
    actual_cash: '',
    notes: '',
  });
  const [isSubmittingAudit, setIsSubmittingAudit] = useState(false);

  const computeDateRange = useCallback(() => {
    const end = getISODateOnly();
    if (dateRangeFilter === 'today') {
      return { start: end, end };
    }
    if (dateRangeFilter === '7d') {
      return { start: getPastDateISO(7), end };
    }
    if (dateRangeFilter === '30d') {
      return { start: getPastDateISO(30), end };
    }
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0];
    return { start: firstDay, end };
  }, [dateRangeFilter]);

  const methodIcon = (m: string): ChannelReconciliation['iconType'] => {
    const u = (m || '').toUpperCase();
    if (u === 'QRIS') return 'qris';
    if (u === 'CASH') return 'cash';
    if (u.includes('CARD') || u.includes('DEBIT') || u.includes('EDC')) return 'card';
    return 'online';
  };

  const loadData = useCallback(
    async (manual = false) => {
      if (manual) setIsRefreshing(true);
      else setIsLoading(true);

      const { start, end } = computeDateRange();

      try {
        const [recRes, disbRes, auditRes] = await Promise.allSettled([
          reportsService.getFinanceReconciliation(start, end),
          reportsService.getDisbursements(),
          reportsService.getCashAudits(),
        ]);

        if (recRes.status === 'fulfilled' && recRes.value?.data) {
          const data = (recRes.value as any)?.data?.data ?? recRes.value?.data;
          if (data) {
            const list = (data.methods_breakdown || []).map((m: any, i: number) => ({
              id: `ch-${i}`,
              channelName: m.method,
              iconType: methodIcon(m.method),
              totalTransactions: Number(m.count ?? 0),
              grossAmount: Number(m.gross_amount ?? 0),
              netSales: Number(m.net_sales ?? 0),
              taxAmount: Number(m.tax_amount ?? 0),
              mdrFee: Number(m.mdr_fee ?? 0),
              netSettlement: Number(m.net_amount ?? 0),
              settlementStatus: (m.method || '').toUpperCase() === 'CASH' ? 'Selesai' : 'Siap Cair',
            })) as ChannelReconciliation[];
            setChannels(list);

            const recList = (data.reconciliations || []).map((r: any) => ({
              id: r.id,
              paymentNumber: r.payment_number,
              orderNumber: r.order_number,
              customerName: r.customer_name || 'Pelanggan Umum',
              method: r.method,
              grossAmount: Number(r.gross_amount ?? 0),
              taxAmount: Number(r.tax_amount ?? 0),
              mdrFee: Number(r.mdr_fee ?? 0),
              netAmount: Number(r.net_amount ?? 0),
              settlementStatus: r.settlement_status || 'SELESAI',
              paidAt: r.paid_at
                ? new Date(r.paid_at).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '-',
            })) as PaymentReconciliationRecord[];
            setReconciliations(recList);

            setTotals({
              net: Number(data.totals?.net_settlement ?? 0),
              tax: Number(data.totals?.total_tax ?? 0),
              mdr: Number(data.totals?.total_mdr ?? 0),
              cash: Number(data.totals?.cash_net_settlement ?? 0),
              digitalNet: Number(data.totals?.digital_net_settlement ?? 0),
            });
          }
        }

        if (disbRes.status === 'fulfilled' && disbRes.value?.data) {
          const dData = (disbRes.value as any)?.data?.data ?? disbRes.value?.data;
          if (dData) {
            setAvailable(Number(dData.available_balance ?? 0));
            setTransferFee(Number(dData.transfer_fee ?? 4500));
            setDisbursements(
              (dData.items || []).map((d: any) => ({
                id: d.id,
                batchId: d.batch_id,
                requestDate: new Date(d.requested_at).toLocaleString('id-ID', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                bankName: d.bank_name,
                accountNumber: d.account_number,
                grossAmount: Number(d.gross_amount ?? 0),
                fee: Number(d.fee ?? 0),
                netReceived: Number(d.net_received ?? 0),
                status: d.status || 'Berhasil',
              }))
            );
          }
        }

        if (auditRes.status === 'fulfilled' && auditRes.value?.data) {
          const aData = (auditRes.value as any)?.data?.data ?? auditRes.value?.data;
          if (Array.isArray(aData)) {
            setAudits(
              aData.map((a: any) => ({
                id: a.id,
                shiftName: a.shift_name,
                cashierName: a.cashier_name,
                date: a.date,
                openingCash: Number(a.opening_cash ?? 0),
                cashSales: Number(a.cash_sales ?? 0),
                expectedCash: Number(a.expected_cash ?? 0),
                actualCash: Number(a.actual_cash ?? a.expected_cash ?? 0),
                variance: Number(a.variance ?? 0),
                status: a.status || 'Sesuai',
              }))
            );
          }
        }
      } catch (err) {
        console.error('Failed to load finance reconciliation:', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [computeDateRange]
  );

  useEffect(() => {
    loadData();
  }, [loadData, activeStore?.id]);

  // Load global master banks for disbursement drawer
  useEffect(() => {
    tenantService
      .getGlobalMasterData()
      .then((res) => {
        const list = res.data?.banks || [];
        setMasterBanks(list);
        if (list.length > 0 && !targetBank) {
          setTargetBank(list[0].code || list[0].name);
        }
      })
      .catch(() => {});
  }, [targetBank]);

  const handleDisburseSubmit = async () => {
    const num = Number(disburseAmount) || 0;
    if (num <= transferFee || !targetBank || !targetAccountNumber.trim()) {
      toast.error('Mohon lengkapi nominal penarikan, bank tujuan, dan nomor rekening operasional.');
      return;
    }
    if (available !== null && num > available) {
      toast.error('Nominal penarikan melebihi saldo siap cair saat ini.');
      return;
    }

    try {
      setIsSubmittingDisburse(true);
      await reportsService.createDisbursement({
        amount: num,
        bank_name: targetBank,
        account_number: targetAccountNumber.trim(),
      });
      setIsDisburseOpen(false);
      setDisburseAmount('');
      toast.success(`Pengajuan pencairan ${formatRupiah(num)} berhasil diajukan dan diproses bank!`);
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mengajukan pencairan dana.');
    } finally {
      setIsSubmittingDisburse(false);
    }
  };

  const handleOpenCashAuditModal = () => {
    const hour = new Date().getHours();
    const defaultShift = hour < 14 ? 'Shift Pagi' : hour < 19 ? 'Shift Siang' : 'Shift Malam';
    setAuditForm({
      shift_name: defaultShift,
      shift_date: getISODateOnly(),
      opening_cash: '500000',
      actual_cash: '',
      notes: '',
    });
    setIsCashAuditModalOpen(true);
  };

  const handleSaveCashAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    const opening = Number(auditForm.opening_cash) || 0;
    const actual = auditForm.actual_cash.trim() === '' ? null : Number(auditForm.actual_cash);

    try {
      setIsSubmittingAudit(true);
      await reportsService.createCashAudit({
        shift_name: auditForm.shift_name,
        shift_date: auditForm.shift_date,
        opening_cash: opening,
        actual_cash: actual,
        notes: auditForm.notes || null,
      });
      setIsCashAuditModalOpen(false);
      toast.success('Audit kas shift kasir berhasil disimpan!');
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Gagal mencatat audit kas shift.');
    } finally {
      setIsSubmittingAudit(false);
    }
  };

  // Filtered recent transactions
  const filteredReconciliations = useMemo(() => {
    if (!transSearch.trim()) return reconciliations;
    const q = transSearch.toLowerCase();
    return reconciliations.filter(
      (r) =>
        r.paymentNumber.toLowerCase().includes(q) ||
        r.orderNumber.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.method.toLowerCase().includes(q)
    );
  }, [reconciliations, transSearch]);

  const totalWithdrawn = useMemo(() => {
    return disbursements
      .filter((d) => d.status === 'Berhasil')
      .reduce((sum, d) => sum + d.grossAmount, 0);
  }, [disbursements]);

  const channelColumns: ColumnDef<ChannelReconciliation>[] = [
    {
      key: 'channelName',
      header: 'Saluran Pembayaran',
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
            {item.iconType === 'qris' ? (
              <QrCode className="size-4 text-emerald-600" />
            ) : item.iconType === 'cash' ? (
              <DollarSign className="size-4 text-amber-600" />
            ) : item.iconType === 'card' ? (
              <CreditCard className="size-4 text-blue-600" />
            ) : (
              <Store className="size-4 text-orange-600" />
            )}
          </div>
          <div>
            <p className="font-semibold text-neutral-900 text-xs">{item.channelName}</p>
            <p className="text-[11px] text-neutral-400 font-mono">{item.totalTransactions} Transaksi</p>
          </div>
        </div>
      ),
    },
    {
      key: 'grossAmount',
      header: 'Total Tagihan',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs font-mono">
          {formatRupiah(item.grossAmount)}
        </span>
      ),
    },
    {
      key: 'taxAmount',
      header: 'Pajak Toko',
      render: (item) => (
        <span className="text-emerald-700 font-mono text-xs font-semibold">
          +{formatRupiah(item.taxAmount)}
        </span>
      ),
    },
    {
      key: 'netSettlement',
      header: 'Total Penerimaan Toko',
      render: (item) => (
        <span className="font-bold text-emerald-700 text-xs font-mono">
          {formatRupiah(item.netSettlement)}
        </span>
      ),
    },
    {
      key: 'settlementStatus',
      header: 'Status Settlement',
      render: (item) => (
        <StatusBadge
          variant={
            item.settlementStatus === 'Siap Cair'
              ? 'info'
              : item.settlementStatus === 'Selesai'
              ? 'success'
              : 'warning'
          }
        >
          {item.settlementStatus}
        </StatusBadge>
      ),
    },
  ];

  const transactionColumns: ColumnDef<PaymentReconciliationRecord>[] = [
    {
      key: 'paymentNumber',
      header: 'No. Pembayaran / Struk',
      render: (item) => (
        <div>
          <p className="font-mono font-bold text-xs text-neutral-900">{item.paymentNumber}</p>
          <p className="text-[10.5px] text-neutral-400 font-mono">Pesanan #{item.orderNumber}</p>
        </div>
      ),
    },
    {
      key: 'customerName',
      header: 'Pelanggan',
      render: (item) => (
        <span className="text-xs font-semibold text-neutral-800">{item.customerName}</span>
      ),
    },
    {
      key: 'method',
      header: 'Metode',
      render: (item) => (
        <span className="inline-block px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-700 font-bold text-[11px] font-mono">
          {item.method}
        </span>
      ),
    },
    {
      key: 'grossAmount',
      header: 'Total Tagihan',
      render: (item) => (
        <span className="text-xs font-mono text-neutral-900">{formatRupiah(item.grossAmount)}</span>
      ),
    },
    {
      key: 'taxAmount',
      header: 'Pajak Toko',
      render: (item) => (
        <span className="text-xs font-mono text-emerald-700 font-medium">+{formatRupiah(item.taxAmount)}</span>
      ),
    },
    {
      key: 'netAmount',
      header: 'Total Penerimaan Toko',
      render: (item) => (
        <span className="text-xs font-mono font-bold text-emerald-700">
          {formatRupiah(item.netAmount)}
        </span>
      ),
    },
    {
      key: 'paidAt',
      header: 'Waktu Transaksi',
      render: (item) => <span className="text-[11px] text-neutral-500">{item.paidAt}</span>,
    },
  ];

  const disbursementColumns: ColumnDef<DisbursementRecord>[] = [
    {
      key: 'batchId',
      header: 'ID Batch Pencairan',
      render: (item) => (
        <span className="font-mono font-semibold text-xs text-neutral-900">{item.batchId}</span>
      ),
    },
    {
      key: 'requestDate',
      header: 'Waktu Pengajuan',
      render: (item) => <span className="text-xs text-neutral-500">{item.requestDate}</span>,
    },
    {
      key: 'bankName',
      header: 'Rekening Tujuan',
      render: (item) => (
        <div>
          <p className="text-xs font-semibold text-neutral-900">{item.bankName}</p>
          <p className="text-[11px] text-neutral-400 font-mono">{item.accountNumber}</p>
        </div>
      ),
    },
    {
      key: 'grossAmount',
      header: 'Jumlah Dicairkan',
      render: (item) => (
        <span className="text-xs font-semibold text-neutral-900 font-mono">
          {formatRupiah(item.grossAmount)}
        </span>
      ),
    },
    {
      key: 'fee',
      header: 'Biaya Transfer Bank',
      render: (item) => (
        <span className="text-xs text-neutral-500 font-mono">-{formatRupiah(item.fee)}</span>
      ),
    },
    {
      key: 'netReceived',
      header: 'Dana Bersih Diterima',
      render: (item) => (
        <span className="text-xs font-bold text-emerald-700 font-mono">
          {formatRupiah(item.netReceived)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge
          variant={
            item.status === 'Berhasil'
              ? 'success'
              : item.status === 'Diproses'
              ? 'warning'
              : 'danger'
          }
        >
          {item.status}
        </StatusBadge>
      ),
    },
  ];

  const auditColumns: ColumnDef<CashierShiftAudit>[] = [
    {
      key: 'shiftName',
      header: 'Shift & Kasir',
      render: (item) => (
        <div>
          <p className="font-semibold text-neutral-900 text-xs">{item.shiftName}</p>
          <p className="text-[11px] text-neutral-400">{item.cashierName} &bull; {item.date}</p>
        </div>
      ),
    },
    {
      key: 'openingCash',
      header: 'Kas Modal Awal',
      render: (item) => (
        <span className="text-xs text-neutral-600 font-mono">{formatRupiah(item.openingCash)}</span>
      ),
    },
    {
      key: 'cashSales',
      header: 'Penjualan Tunai Bersih',
      render: (item) => (
        <span className="text-xs font-semibold text-neutral-800 font-mono">
          {formatRupiah(item.cashSales)}
        </span>
      ),
    },
    {
      key: 'expectedCash',
      header: 'Kas Harapan Sistem',
      render: (item) => (
        <span className="text-xs font-mono text-neutral-700">{formatRupiah(item.expectedCash)}</span>
      ),
    },
    {
      key: 'actualCash',
      header: 'Kas Fisik Terhitung',
      render: (item) => (
        <span className="text-xs font-mono font-bold text-neutral-900">
          {formatRupiah(item.actualCash)}
        </span>
      ),
    },
    {
      key: 'variance',
      header: 'Selisih Kas',
      render: (item) => (
        <span
          className={`text-xs font-mono font-bold ${
            item.variance === 0
              ? 'text-emerald-600'
              : item.variance > 0
              ? 'text-blue-600'
              : 'text-red-600'
          }`}
        >
          {item.variance === 0 ? 'Rp0 (Sesuai)' : formatRupiah(item.variance)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge variant={item.status === 'Sesuai' ? 'success' : 'warning'}>
          {item.status}
        </StatusBadge>
      ),
    },
  ];

  if (isLoading) {
    return <PageLoader text="Memuat data keuangan & rekonsiliasi..." />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-[1600px] mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            Keuangan & Rekonsiliasi
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Rekonsiliasi settlement pembayaran digital, pencairan dana toko, dan audit kas fisik drawer kasir
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            onClick={() => loadData(true)}
            disabled={isRefreshing}
            leftIcon={<RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
          >
            {isRefreshing ? 'Memuat...' : 'Segarkan'}
          </Button>

          <Select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            options={[
              { value: 'today', label: 'Hari Ini' },
              { value: '7d', label: '7 Hari Terakhir' },
              { value: '30d', label: '30 Hari Terakhir' },
              { value: 'this_month', label: 'Bulan Ini' },
            ]}
            className="w-40 h-9 text-xs"
          />

          <Button
            variant="primary"
            onClick={() => setIsDisburseOpen(true)}
            className="bg-[#FF5C38] hover:bg-[#EE4E2A]"
            leftIcon={<Banknote className="size-4" />}
          >
            Pencairan Dana
          </Button>
        </div>
      </div>

      {/* 4 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <p className="text-xs font-medium text-neutral-500">Dana Siap Dicairkan (Digital Payout)</p>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight font-mono">
            {available !== null ? formatRupiah(available) : totals ? formatRupiah(totals.digitalNet) : formatRupiah(0)}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">
            Saldo digital siap ditarik ke rekening bank
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <p className="text-xs font-medium text-neutral-500">Total Penerimaan Bersih Toko</p>
          <p className="text-2xl font-bold text-emerald-700 tracking-tight font-mono">
            {totals ? formatRupiah(totals.net) : formatRupiah(0)}
          </p>
          <p className="text-[11px] text-neutral-500">
            Termasuk Pajak Toko {formatRupiah(totals?.tax ?? 0)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <p className="text-xs font-medium text-neutral-500">Total Kas Fisik Drawer (CASH)</p>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight font-mono">
            {totals ? formatRupiah(totals.cash) : formatRupiah(0)}
          </p>
          <p className="text-[11px] text-neutral-500">Sesuai penutupan shift kasir</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <p className="text-xs font-medium text-neutral-500">Total Berhasil Dicairkan (Payout)</p>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight font-mono">
            {formatRupiah(totalWithdrawn)}
          </p>
          <p className="text-[11px] text-neutral-500">
            {disbursements.filter((d) => d.status === 'Berhasil').length} penarikan dana ke rekening
          </p>
        </div>
      </div>

      {/* Horizontal Tabs */}
      <div className="border-b border-neutral-200 flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
        <button
          type="button"
          onClick={() => setActiveTab('channels')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'channels'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Layers className="size-4" />
          <span>Rekonsiliasi Saluran &amp; Transaksi ({reconciliations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('disbursements')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'disbursements'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Banknote className="size-4" />
          <span>Riwayat Pencairan ({disbursements.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cashier-audit')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'cashier-audit'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <DollarSign className="size-4" />
          <span>Audit Kas Kasir ({audits.length})</span>
        </button>
      </div>

      {/* Tab 1: Rekonsiliasi Saluran & Transaksi */}
      {activeTab === 'channels' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-neutral-900">
              Ringkasan Rekonsiliasi Saluran Pembayaran
            </h3>
            <DataTable<ChannelReconciliation>
              columns={channelColumns}
              data={channels}
              keyExtractor={(item) => item.id}
              selectable={false}
              emptyTitle="BELUM ADA DATA REKONSILIASI"
              emptyDescription="Transaksi pembayaran customer otomatis tercatat dan direkonsiliasi per saluran."
              entityName="saluran"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Rincian Transaksi Pembayaran Customer Terakhir
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Daftar transaksi yang membentuk rekonsiliasi dan settlement keuangan
                </p>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Cari no. pembayaran, pesanan, pelanggan..."
                  value={transSearch}
                  onChange={(e) => setTransSearch(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#FF5C38]"
                />
              </div>
            </div>

            <DataTable<PaymentReconciliationRecord>
              columns={transactionColumns}
              data={filteredReconciliations}
              keyExtractor={(item) => item.id}
              selectable={false}
              emptyTitle="BELUM ADA TRANSAKSI"
              emptyDescription="Transaksi yang berhasil dibayar kasir atau QR self-order akan muncul di sini."
              entityName="transaksi"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Riwayat Pencairan Dana */}
      {activeTab === 'disbursements' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
            <div>
              <p className="text-xs text-neutral-500">Saldo Tersedia untuk Dicairkan:</p>
              <p className="text-2xl font-extrabold text-neutral-900 font-mono mt-0.5">
                {available !== null ? formatRupiah(available) : formatRupiah(0)}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsDisburseOpen(true)}
              className="bg-[#FF5C38] hover:bg-[#EE4E2A]"
              leftIcon={<Plus className="size-4" />}
            >
              Ajukan Penarikan Dana
            </Button>
          </div>

          <DataTable<DisbursementRecord>
            columns={disbursementColumns}
            data={disbursements}
            keyExtractor={(item) => item.id}
            selectable={false}
            emptyTitle="BELUM ADA RIWAYAT PENCAIRAN"
            emptyDescription="Ajukan pencairan dana settlement ke rekening bank operasional terdaftar."
            entityName="pencairan"
          />
        </div>
      )}

      {/* Tab 3: Audit Kas Kasir */}
      {activeTab === 'cashier-audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-500">
              Laporan penutupan kas fisik per shift kasir untuk mencegah selisih uang drawer.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenCashAuditModal}
              className="bg-[#FF5C38] hover:bg-[#EE4E2A]"
              leftIcon={<Plus className="size-4" />}
            >
              Catat Kas Shift
            </Button>
          </div>

          <DataTable<CashierShiftAudit>
            columns={auditColumns}
            data={audits}
            keyExtractor={(item) => item.id}
            selectable={false}
            emptyTitle="BELUM ADA AUDIT KASIR"
            emptyDescription="Penutupan shift kasir otomatis menghasilkan laporan cash drawer audit."
            entityName="audit kasir"
          />
        </div>
      )}

      {/* Modal: Catat Kas Shift (Tanpa window.prompt) */}
      <Modal
        isOpen={isCashAuditModalOpen}
        onClose={() => setIsCashAuditModalOpen(false)}
        title="Catat Audit Kas Shift Kasir"
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCashAuditModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={isSubmittingAudit}
              className="bg-[#FF5C38] hover:bg-[#EE4E2A]"
              onClick={handleSaveCashAudit}
            >
              {isSubmittingAudit ? 'Menyimpan...' : 'Simpan Audit Kas'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveCashAudit} className="space-y-3.5 py-1 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Nama Shift *</label>
              <input
                type="text"
                required
                value={auditForm.shift_name}
                onChange={(e) => setAuditForm({ ...auditForm, shift_name: e.target.value })}
                placeholder="Contoh: Shift Siang"
                className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
              />
            </div>
            <div>
              <label className="block font-semibold text-neutral-700 mb-1">Tanggal Shift *</label>
              <input
                type="date"
                required
                value={auditForm.shift_date}
                onChange={(e) => setAuditForm({ ...auditForm, shift_date: e.target.value })}
                className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Modal Awal Kas (Rp) *</label>
            <input
              type="number"
              required
              min="0"
              value={auditForm.opening_cash}
              onChange={(e) => setAuditForm({ ...auditForm, opening_cash: e.target.value })}
              placeholder="500000"
              className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
            />
            <p className="text-[10.5px] text-neutral-400 mt-0.5">Uang kembalian yang dimasukkan ke laci saat buka shift.</p>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">
              Kas Fisik Terhitung Saat Tutup Shift (Rp)
            </label>
            <input
              type="number"
              min="0"
              value={auditForm.actual_cash}
              onChange={(e) => setAuditForm({ ...auditForm, actual_cash: e.target.value })}
              placeholder="Kosongkan jika shift masih berjalan"
              className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
            />
            <p className="text-[10.5px] text-neutral-400 mt-0.5">
              Uang tunai fisik yang dihitung di drawer saat kasir serah terima / tutup buku.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-neutral-700 mb-1">Catatan Shift (Opsional)</label>
            <textarea
              rows={2}
              value={auditForm.notes}
              onChange={(e) => setAuditForm({ ...auditForm, notes: e.target.value })}
              placeholder="Contoh: Kas fisik sesuai, nota titip beli bensin Rp20.000..."
              className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
            />
          </div>
        </form>
      </Modal>

      {/* Drawer: Pencairan Dana */}
      <Drawer
        isOpen={isDisburseOpen}
        onClose={() => setIsDisburseOpen(false)}
        title="Ajukan Pencairan Dana (Payout)"
        subtitle="Transfer saldo siap cair ke rekening bank operasional terdaftar"
        size="md"
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            <Button variant="outline" onClick={() => setIsDisburseOpen(false)}>
              Batal
            </Button>
            <Button
              variant="primary"
              disabled={isSubmittingDisburse}
              onClick={handleDisburseSubmit}
              className="bg-[#FF5C38] hover:bg-[#EE4E2A]"
              leftIcon={<CheckCircle2 className="size-4 stroke-[2.5]" />}
            >
              {isSubmittingDisburse ? 'Memproses...' : 'Konfirmasi Pencairan'}
            </Button>
          </div>
        }
      >
        <div className="space-y-5 text-xs">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
            <p className="text-neutral-500">Saldo Siap Dicairkan:</p>
            <p className="text-2xl font-bold text-neutral-900 font-mono">
              {available !== null ? formatRupiah(available) : formatRupiah(0)}
            </p>
            <p className="text-[11px] text-neutral-400">Batas penarikan sesuai ketentuan rekening terdaftar</p>
          </div>

          <Input
            label="Nominal Penarikan (Rp)"
            type="number"
            value={disburseAmount}
            onChange={(e) => setDisburseAmount(e.target.value)}
            placeholder="Masukkan nominal penarikan"
            prefix="Rp"
          />

          <Select
            label="Bank Tujuan (Master Bank Global)"
            value={targetBank}
            onChange={(e) => setTargetBank(e.target.value)}
            options={masterBanks.map((bank) => ({
              value: bank.code || bank.name,
              label: `${bank.name} (${bank.code || '-'})`,
            }))}
          />

          <Input
            label="Nomor Rekening Tujuan"
            type="text"
            value={targetAccountNumber}
            onChange={(e) => setTargetAccountNumber(e.target.value)}
            placeholder="Masukkan nomor rekening operasional"
          />

          <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Biaya Transfer Real-time:</span>
            <span className="font-semibold text-neutral-900 font-mono">
              {formatRupiah(transferFee)}
            </span>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
