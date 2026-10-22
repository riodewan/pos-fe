'use client';

import React, { useState } from 'react';
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

const INITIAL_CHANNELS: ChannelReconciliation[] = [
  {
    id: 'ch-1',
    channelName: 'QRIS Dinamis (ShopeePay, GoPay, Dana)',
    iconType: 'qris',
    totalTransactions: 42,
    grossAmount: 1850000,
    mdrFee: 12950,
    netSettlement: 1837050,
    settlementStatus: 'Siap Cair',
  },
  {
    id: 'ch-2',
    channelName: 'Tunai Kasir (Cash Drawer)',
    iconType: 'cash',
    totalTransactions: 35,
    grossAmount: 2150000,
    mdrFee: 0,
    netSettlement: 2150000,
    settlementStatus: 'Selesai',
  },
  {
    id: 'ch-3',
    channelName: 'EDC Kartu Debit BCA / Mandiri',
    iconType: 'card',
    totalTransactions: 18,
    grossAmount: 1240000,
    mdrFee: 18600,
    netSettlement: 1221400,
    settlementStatus: 'Siap Cair',
  },
  {
    id: 'ch-4',
    channelName: 'GrabFood Merchant',
    iconType: 'online',
    totalTransactions: 12,
    grossAmount: 780000,
    mdrFee: 156000,
    netSettlement: 624000,
    settlementStatus: 'Menunggu',
  },
  {
    id: 'ch-5',
    channelName: 'ShopeeFood Merchant',
    iconType: 'online',
    totalTransactions: 9,
    grossAmount: 540000,
    mdrFee: 108000,
    netSettlement: 432000,
    settlementStatus: 'Menunggu',
  },
];

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

const INITIAL_DISBURSEMENTS: DisbursementRecord[] = [
  {
    id: 'dis-1',
    batchId: 'DIS-20261014-001',
    requestDate: '14 Okt 2026, 10:00',
    bankName: 'BCA (Bank Central Asia)',
    accountNumber: '8830192831',
    grossAmount: 5400000,
    fee: 4500,
    netReceived: 5395500,
    status: 'Berhasil',
  },
  {
    id: 'dis-2',
    batchId: 'DIS-20261012-002',
    requestDate: '12 Okt 2026, 17:30',
    bankName: 'BCA (Bank Central Asia)',
    accountNumber: '8830192831',
    grossAmount: 8200000,
    fee: 4500,
    netReceived: 8195500,
    status: 'Berhasil',
  },
  {
    id: 'dis-3',
    batchId: 'DIS-20261009-003',
    requestDate: '09 Okt 2026, 09:15',
    bankName: 'Mandiri',
    accountNumber: '1370019283719',
    grossAmount: 4850000,
    fee: 4500,
    netReceived: 4845500,
    status: 'Berhasil',
  },
];

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

const INITIAL_AUDITS: CashierShiftAudit[] = [
  {
    id: 'aud-1',
    shiftName: 'Shift Pagi (08:00 - 16:00)',
    cashierName: 'Andi Pratama',
    date: '14 Okt 2026',
    openingCash: 500000,
    cashSales: 2150000,
    expectedCash: 2650000,
    actualCash: 2650000,
    variance: 0,
    status: 'Sesuai',
  },
  {
    id: 'aud-2',
    shiftName: 'Shift Malam (16:00 - 23:00)',
    cashierName: 'Siti Rahma',
    date: '13 Okt 2026',
    openingCash: 500000,
    cashSales: 3100000,
    expectedCash: 3600000,
    actualCash: 3600000,
    variance: 0,
    status: 'Sesuai',
  },
  {
    id: 'aud-3',
    shiftName: 'Shift Pagi (08:00 - 16:00)',
    cashierName: 'Budi Santoso',
    date: '12 Okt 2026',
    openingCash: 500000,
    cashSales: 1800000,
    expectedCash: 2300000,
    actualCash: 2305000,
    variance: 5000,
    status: 'Selisih Lebih',
  },
];

type FinanceTab = 'channels' | 'disbursements' | 'cashier-audit';

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<FinanceTab>('channels');
  const [channels, setChannels] = useState<ChannelReconciliation[]>(INITIAL_CHANNELS);
  const [disbursements, setDisbursements] = useState<DisbursementRecord[]>(INITIAL_DISBURSEMENTS);
  const [audits, setAudits] = useState<CashierShiftAudit[]>(INITIAL_AUDITS);

  // Drawer
  const [isDisburseOpen, setIsDisburseOpen] = useState(false);
  const [disburseAmount, setDisburseAmount] = useState('1837050');
  const [targetBank, setTargetBank] = useState('BCA - 8830192831 (Kopi Mantap)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDisburseSubmit = () => {
    const num = Number(disburseAmount) || 1000000;
    const newRecord: DisbursementRecord = {
      id: `dis-${Date.now()}`,
      batchId: `DIS-20261015-00${disbursements.length + 1}`,
      requestDate: '15 Okt 2026, 14:00',
      bankName: 'BCA (Bank Central Asia)',
      accountNumber: '8830192831',
      grossAmount: num,
      fee: 4500,
      netReceived: num - 4500,
      status: 'Diproses',
    };

    setDisbursements((prev) => [newRecord, ...prev]);
    setIsDisburseOpen(false);
    showToast(`Permintaan pencairan dana ${formatRupiah(num)} sedang diproses oleh bank.`);
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
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">Rp18.450.000</p>
          <p className="text-[11px] text-emerald-600 font-medium">QRIS & Payment Gateway</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <p className="text-xs font-medium text-neutral-500">Total Kas Fisik Drawer</p>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">Rp4.250.000</p>
          <p className="text-[11px] text-neutral-500">Sesuai penutupan shift kasir</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <p className="text-xs font-medium text-neutral-500">Estimasi Biaya MDR (0.7%)</p>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">Rp142.500</p>
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
            <p className="text-2xl font-bold text-neutral-900 font-mono">Rp18.450.000</p>
            <p className="text-[11px] text-neutral-400">Batas penarikan harian: Rp50.000.000</p>
          </div>

          <Input
            label="Nominal Penarikan (Rp)"
            type="number"
            value={disburseAmount}
            onChange={(e) => setDisburseAmount(e.target.value)}
            prefix="Rp"
          />

          <Select
            label="Rekening Bank Tujuan"
            value={targetBank}
            onChange={(e) => setTargetBank(e.target.value)}
            options={[
              { value: 'BCA - 8830192831 (Kopi Mantap)', label: 'BCA • 8830192831 (Kopi Mantap)' },
              { value: 'Mandiri - 1370019283719 (Kopi Mantap)', label: 'Mandiri • 1370019283719 (Kopi Mantap)' },
            ]}
          />

          <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Biaya Transfer Real-time:</span>
            <span className="font-semibold text-neutral-900 font-mono">Rp4.500</span>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
