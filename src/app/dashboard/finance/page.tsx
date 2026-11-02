'use client';

import React, { useState, useEffect } from 'react';
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
  MoreVertical,
  Calendar,
  CreditCard,
  QrCode,
  Store,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import {
  DataTable,
  ColumnDef,
  StatusBadge,
  Button,
  Select,
  SearchInput,
  Drawer,
  Input,
  Pagination,
} from '@/components/common';
import { formatRupiah } from '@/utils';
import { reportsService } from '@/services/reports.service';
import { tenantService, GlobalMasterItem } from '@/services/tenant.service';

// Channel Reconciliation Dataset
interface ChannelReconciliation {
  id: string;
  channelName: string;
  iconType: 'qris' | 'cash' | 'card' | 'online';
  totalTransactions: number;
  grossAmount: number;
  mdrFee: number;
  netSettlement: number;
  settlementStatus: 'Siap Cair' | 'Selesai' | 'Menunggu';
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
  const [activeTab, setActiveTab] = useState<FinanceTab>('channels');
  const [channels, setChannels] = useState<ChannelReconciliation[]>([]);
  const [disbursements, setDisbursements] = useState<DisbursementRecord[]>([]);
  const [audits, setAudits] = useState<CashierShiftAudit[]>([]);
  const [totals, setTotals] = useState<{ net: number; mdr: number; cash: number } | null>(null);
  const [available, setAvailable] = useState<number | null>(null);
  const [transferFee, setTransferFee] = useState(4500);

  const loadDisbursements = async () => {
    try {
      const res = await reportsService.getDisbursements();
      const data = (res as any)?.data?.data ?? (res as any)?.data;
      if (data) {
        setAvailable(data.available_balance ?? 0);
        setTransferFee(data.transfer_fee ?? 4500);
        setDisbursements(
          (data.items || []).map((d: any) => ({
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
            grossAmount: d.gross_amount,
            fee: d.fee,
            netReceived: d.net_received,
            status: d.status,
          }))
        );
      }
    } catch (err) {
      console.error('Gagal memuat pencairan', err);
    }
  };

  const loadCashAudits = async () => {
    try {
      const res = await reportsService.getCashAudits();
      const data = (res as any)?.data?.data ?? (res as any)?.data;
      if (Array.isArray(data)) {
        setAudits(
          data.map((a: any) => ({
            id: a.id,
            shiftName: a.shift_name,
            cashierName: a.cashier_name,
            date: a.date,
            openingCash: a.opening_cash,
            cashSales: a.cash_sales,
            expectedCash: a.expected_cash,
            actualCash: a.actual_cash,
            variance: a.variance,
            status: a.status,
          }))
        );
      }
    } catch (err) {
      console.error('Gagal memuat audit kasir', err);
    }
  };

  useEffect(() => {
    const today = new Date();
    const end = today.toISOString().slice(0, 10);
    const start = new Date(today.getFullYear(), today.getMonth(), 1)
      .toLocaleDateString('en-CA');

    const methodIcon = (m: string): ChannelReconciliation['iconType'] => {
      const u = (m || '').toUpperCase();
      if (u === 'QRIS') return 'qris';
      if (u === 'CASH') return 'cash';
      if (u.includes('CARD') || u.includes('DEBIT') || u.includes('EDC')) return 'card';
      return 'online';
    };

    const load = async () => {
      try {
        const res = await reportsService.getFinanceReconciliation(start, end);
        const data = (res as any)?.data?.data ?? (res as any)?.data;
        if (data) {
          const list = (data.methods_breakdown || []).map((m: any, i: number) => ({
            id: `ch-${i}`,
            channelName: m.method,
            iconType: methodIcon(m.method),
            totalTransactions: m.count,
            grossAmount: m.gross_amount,
            mdrFee: m.mdr_fee,
            netSettlement: m.net_amount,
            settlementStatus: m.mdr_fee === 0 ? 'Selesai' : 'Siap Cair',
          })) as ChannelReconciliation[];
          setChannels(list);
          setTotals((prev) => ({
            net: data.totals?.net_settlement ?? 0,
            mdr: data.totals?.total_mdr ?? 0,
            cash: prev?.cash ?? 0,
          }));
        }
      } catch (err) {
        console.error('Gagal memuat rekonsiliasi', err);
      }

      try {
        const res = await reportsService.getCashierAudit(start, end);
        const data = (res as any)?.data?.data ?? (res as any)?.data;
        if (data?.cashiers) {
          const cash = data.cashiers.reduce((s: number, c: any) => s + (c.cash_total || 0), 0);
          setTotals((prev) => ({ net: prev?.net ?? 0, mdr: prev?.mdr ?? 0, cash }));
        }
      } catch (err) {
        console.error('Gagal memuat ringkasan kasir', err);
      }

      await loadDisbursements();
      await loadCashAudits();
    };
    load();
  }, []);

  // Drawer
  const [isDisburseOpen, setIsDisburseOpen] = useState(false);
  const [disburseAmount, setDisburseAmount] = useState('');
  const [targetBank, setTargetBank] = useState('');
  const [targetAccountNumber, setTargetAccountNumber] = useState('');
  const [masterBanks, setMasterBanks] = useState<GlobalMasterItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    tenantService
      .getGlobalMasterData()
      .then((res) => {
        const list = res.data?.banks || [];
        setMasterBanks(list);
        if (list.length > 0) {
          setTargetBank(list[0].code || list[0].name);
        }
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDisburseSubmit = async () => {
    const num = Number(disburseAmount) || 0;
    if (num <= 0 || !targetBank || !targetAccountNumber.trim()) {
      showToast('Mohon lengkapi nominal penarikan, bank tujuan, dan nomor rekening.');
      return;
    }
    try {
      await reportsService.createDisbursement({
        amount: num,
        bank_name: targetBank,
        account_number: targetAccountNumber.trim(),
      });
      setIsDisburseOpen(false);
      setDisburseAmount('');
      await loadDisbursements();
      showToast(`Permintaan pencairan dana ${formatRupiah(num)} sedang diproses oleh bank.`);
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Gagal mengajukan pencairan dana.');
    }
  };

  const handleRecordCashAudit = async () => {
    const opening = window.prompt('Modal awal kas (Rp):', '500000');
    if (opening === null) return;
    const actual = window.prompt('Kas fisik terhitung saat tutup shift (Rp), kosongkan jika belum:', '');
    if (actual === null) return;
    try {
      await reportsService.createCashAudit({
        shift_name: `Shift ${new Date().getHours() < 16 ? 'Pagi' : 'Malam'}`,
        opening_cash: Number(opening) || 0,
        actual_cash: actual.trim() === '' ? null : Number(actual),
      });
      await loadCashAudits();
      showToast('Audit kas shift berhasil dicatat.');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Gagal mencatat audit kas.');
    }
  };

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
            <p className="text-[11px] text-neutral-400">{item.totalTransactions} Transaksi</p>
          </div>
        </div>
      ),
    },
    {
      key: 'grossAmount',
      header: 'Total Kotor',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs">
          {formatRupiah(item.grossAmount)}
        </span>
      ),
    },
    {
      key: 'mdrFee',
      header: 'Biaya MDR / Potongan',
      render: (item) => (
        <span className="text-red-600 text-xs font-mono">
          {item.mdrFee === 0 ? 'Rp0 (0%)' : `-${formatRupiah(item.mdrFee)}`}
        </span>
      ),
    },
    {
      key: 'netSettlement',
      header: 'Dana Bersih (Net)',
      render: (item) => (
        <span className="font-bold text-emerald-600 text-xs font-mono">
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
        <span className="text-xs font-semibold text-neutral-900">
          {formatRupiah(item.grossAmount)}
        </span>
      ),
    },
    {
      key: 'fee',
      header: 'Biaya Transfer',
      render: (item) => (
        <span className="text-xs text-neutral-500 font-mono">-{formatRupiah(item.fee)}</span>
      ),
    },
    {
      key: 'netReceived',
      header: 'Dana Diterima',
      render: (item) => (
        <span className="text-xs font-bold text-emerald-600 font-mono">
          {formatRupiah(item.netReceived)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge
          variant={item.status === 'Berhasil' ? 'success' : item.status === 'Diproses' ? 'warning' : 'danger'}
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
          <p className="text-[11px] text-neutral-400">{item.cashierName} • {item.date}</p>
        </div>
      ),
    },
    {
      key: 'openingCash',
      header: 'Kas Modal Awal',
      render: (item) => <span className="text-xs text-neutral-600">{formatRupiah(item.openingCash)}</span>,
    },
    {
      key: 'cashSales',
      header: 'Penjualan Tunai',
      render: (item) => <span className="text-xs font-semibold text-neutral-800">{formatRupiah(item.cashSales)}</span>,
    },
    {
      key: 'expectedCash',
      header: 'Kas Harapan Sistem',
      render: (item) => <span className="text-xs font-mono text-neutral-700">{formatRupiah(item.expectedCash)}</span>,
    },
    {
      key: 'actualCash',
      header: 'Kas Fisik Terhitung',
      render: (item) => <span className="text-xs font-mono font-bold text-neutral-900">{formatRupiah(item.actualCash)}</span>,
    },
    {
      key: 'variance',
      header: 'Selisih Kas',
      render: (item) => (
        <span
          className={`text-xs font-mono font-bold ${
            item.variance === 0 ? 'text-emerald-600' : item.variance > 0 ? 'text-blue-600' : 'text-red-600'
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

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-[1600px] mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <Check className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Keuangan & Rekonsiliasi</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Rekonsiliasi pembayaran digital, pencairan dana settlement, dan selisih kas fisik kasir
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => showToast('Menyinkronkan data settlement dari gateway...')}
            leftIcon={<RefreshCw className="size-3.5" />}
          >
            Tarik Settlement
          </Button>

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
          <p className="text-xs font-medium text-neutral-500">Dana Siap Dicairkan</p>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">{available !== null ? formatRupiah(available) : totals ? formatRupiah(totals.net) : formatRupiah(0)}</p>
          <p className="text-[11px] text-emerald-600 font-medium">QRIS & Payment Gateway</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <p className="text-xs font-medium text-neutral-500">Total Kas Fisik Drawer</p>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">{totals ? formatRupiah(totals.cash) : formatRupiah(0)}</p>
          <p className="text-[11px] text-neutral-500">Sesuai penutupan shift kasir</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <p className="text-xs font-medium text-neutral-500">Estimasi Biaya MDR (0.7%)</p>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">{totals ? formatRupiah(totals.mdr) : formatRupiah(0)}</p>
          <p className="text-[11px] text-neutral-400">Potongan transaksi QRIS</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <p className="text-xs font-medium text-neutral-500">Selisih Rekonsiliasi</p>
          <p className="text-2xl font-bold text-emerald-600 tracking-tight">Rp0 (Match 100%)</p>
          <p className="text-[11px] text-emerald-600 font-medium">Tidak ada perbedaan kas</p>
        </div>
      </div>

      {/* Horizontal Tabs */}
      <div className="border-b border-neutral-200 flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
        <button
          type="button"
          onClick={() => setActiveTab('channels')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'channels'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Layers className="size-4" />
          <span>Rekonsiliasi Saluran</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('disbursements')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'disbursements'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Banknote className="size-4" />
          <span>Riwayat Pencairan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cashier-audit')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'cashier-audit'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <DollarSign className="size-4" />
          <span>Audit Kas Kasir</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'channels' && (
        <div className="space-y-4">
          <DataTable<ChannelReconciliation>
            columns={channelColumns}
            data={channels}
            keyExtractor={(item) => item.id}
            selectable={false}
            emptyTitle="BELUM ADA DATA REKONSILIASI"
            emptyDescription="Transaksi harian yang masuk otomatis dicatat dan direkonsiliasi per saluran."
            entityName="saluran"
          />
        </div>
      )}

      {activeTab === 'disbursements' && (
        <div className="space-y-4">
          <DataTable<DisbursementRecord>
            columns={disbursementColumns}
            data={disbursements}
            keyExtractor={(item) => item.id}
            selectable={false}
            emptyTitle="BELUM ADA RIWAYAT PENCAIRAN"
            emptyDescription="Ajukan pencairan dana settlement ke rekening bank operasional outlet."
            entityName="pencairan"
          />
        </div>
      )}

      {activeTab === 'cashier-audit' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="outline" onClick={handleRecordCashAudit}>
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
              onClick={handleDisburseSubmit}
              className="bg-[#FF5C38] hover:bg-[#EE4E2A]"
              leftIcon={<CheckCircle2 className="size-4 stroke-[2.5]" />}
            >
              Konfirmasi Pencairan
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs space-y-1">
            <p className="text-neutral-500">Saldo Siap Dicairkan:</p>
            <p className="text-2xl font-bold text-neutral-900 font-mono">{available !== null ? formatRupiah(available) : formatRupiah(0)}</p>
            <p className="text-[11px] text-neutral-400">Batas penarikan harian: Rp50.000.000</p>
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
            <span className="font-semibold text-neutral-900 font-mono">{formatRupiah(transferFee)}</span>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
