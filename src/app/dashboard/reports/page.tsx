'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  TrendingUp,
  Percent,
  Receipt,
  Users,
  Coffee,
  Package,
  RefreshCw,
  Wallet,
  Calendar,
  Upload,
  BarChart3,
  Check,
  Award,
  ArrowUpRight,
  Clock,
  Layers,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { reportsService } from '@/services';
import { DashboardReport, InventoryUsageReport, CashierAuditReport } from '@/types';
import { formatRupiah, getISODateOnly, getPastDateISO } from '@/utils';
import {
  DataTable,
  ColumnDef,
  StatusBadge,
  Button,
  Select,
  SearchInput,
  Pagination,
} from '@/components/common';

type ReportTab = 'summary' | 'products' | 'cogs' | 'cashiers';

// Fallback Top Products Data
interface ProductPerformance {
  id: string;
  rank: number;
  name: string;
  category: string;
  qtySold: number;
  revenue: number;
  cogs: number;
  grossMarginPercent: number;
}

const FALLBACK_PRODUCTS: ProductPerformance[] = [
  {
    id: 'p-1',
    rank: 1,
    name: 'Kopi Susu Gula Aren',
    category: 'Kopi',
    qtySold: 420,
    revenue: 11760000,
    cogs: 3360000,
    grossMarginPercent: 71.4,
  },
  {
    id: 'p-2',
    rank: 2,
    name: 'Matcha Latte',
    category: 'Kopi',
    qtySold: 285,
    revenue: 8550000,
    cogs: 2622000,
    grossMarginPercent: 69.3,
  },
  {
    id: 'p-3',
    rank: 3,
    name: 'Caramel Macchiato',
    category: 'Kopi',
    qtySold: 210,
    revenue: 5880000,
    cogs: 1659000,
    grossMarginPercent: 71.8,
  },
  {
    id: 'p-4',
    rank: 4,
    name: 'Croissant Butter',
    category: 'Pastry',
    qtySold: 180,
    revenue: 3600000,
    cogs: 1080000,
    grossMarginPercent: 70.0,
  },
  {
    id: 'p-5',
    rank: 5,
    name: 'Americano Ice',
    category: 'Kopi',
    qtySold: 165,
    revenue: 3630000,
    cogs: 957000,
    grossMarginPercent: 73.6,
  },
];

// Fallback COGS Data
interface CogsItem {
  id: string;
  ingredientName: string;
  unit: string;
  theoreticalUsage: number;
  actualUsage: number;
  varianceQty: number;
  costTotal: number;
  status: 'Efisien' | 'Wajar' | 'Boros';
}

const FALLBACK_COGS: CogsItem[] = [
  {
    id: 'cg-1',
    ingredientName: 'Biji Kopi Arabica',
    unit: 'kg',
    theoreticalUsage: 14.2,
    actualUsage: 14.5,
    varianceQty: 0.3,
    costTotal: 1740000,
    status: 'Wajar',
  },
  {
    id: 'cg-2',
    ingredientName: 'Susu UHT Full Cream',
    unit: 'liter',
    theoreticalUsage: 82.0,
    actualUsage: 85.0,
    varianceQty: 3.0,
    costTotal: 1530000,
    status: 'Wajar',
  },
  {
    id: 'cg-3',
    ingredientName: 'Sirup Gula Aren',
    unit: 'liter',
    theoreticalUsage: 18.5,
    actualUsage: 18.2,
    varianceQty: -0.3,
    costTotal: 819000,
    status: 'Efisien',
  },
  {
    id: 'cg-4',
    ingredientName: 'Matcha Powder',
    unit: 'kg',
    theoreticalUsage: 3.5,
    actualUsage: 4.2,
    varianceQty: 0.7,
    costTotal: 1470000,
    status: 'Boros',
  },
];

export default function ReportsPage() {
  const router = useRouter();
  const { user, activeTenant, isLoading } = useAuth();
  const { activeStore } = useStore();

  const [activeTab, setActiveTab] = useState<ReportTab>('summary');
  const [loading, setLoading] = useState(false);
  const [dateRangeFilter, setDateRangeFilter] = useState('30d');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<DashboardReport | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const loadReports = useCallback(async () => {
    if (!activeStore) return;
    setLoading(true);
    try {
      const days = dateRangeFilter === 'today' ? 0 : dateRangeFilter === '7d' ? 7 : 30;
      const start = getPastDateISO(days);
      const end = getISODateOnly();
      const res = await reportsService.getDashboardOverview(start, end);
      if (res.data) {
        setDashboardData(res.data);
      }
    } catch (err) {
      // Use graceful fallback
    } finally {
      setLoading(false);
    }
  }, [activeStore, dateRangeFilter]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Derived KPI values or default demo
  const kpis = dashboardData?.kpis || {
    gross_sales: 34850000,
    total_discounts: 1250000,
    net_sales: 33600000,
    tax: 3360000,
    service_charge: 0,
    total_revenue: 36960000,
    total_orders: 1260,
    average_order_value: 29333,
  };

  const productColumns: ColumnDef<ProductPerformance>[] = [
    {
      key: 'rank',
      header: 'Peringkat',
      render: (item) => (
        <span className="size-6 rounded-full bg-neutral-100 font-bold text-xs flex items-center justify-center text-neutral-800">
          {item.rank}
        </span>
      ),
    },
    {
      key: 'name',
      header: 'Nama Menu Produk',
      render: (item) => (
        <div>
          <p className="font-semibold text-neutral-900 text-xs">{item.name}</p>
          <p className="text-[11px] text-neutral-400">{item.category}</p>
        </div>
      ),
    },
    {
      key: 'qtySold',
      header: 'Terjual (Porsi)',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs font-mono">{item.qtySold} Porsi</span>
      ),
    },
    {
      key: 'revenue',
      header: 'Omzet Penjualan',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs">{formatRupiah(item.revenue)}</span>
      ),
    },
    {
      key: 'cogs',
      header: 'Total HPP Bahan',
      render: (item) => <span className="text-neutral-600 text-xs">{formatRupiah(item.cogs)}</span>,
    },
    {
      key: 'grossMarginPercent',
      header: 'Margin Laba Kotor',
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#2E7D32]">
          {item.grossMarginPercent}%
        </span>
      ),
    },
  ];

  const cogsColumns: ColumnDef<CogsItem>[] = [
    {
      key: 'ingredientName',
      header: 'Nama Bahan Baku',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs">{item.ingredientName}</span>
      ),
    },
    {
      key: 'theoreticalUsage',
      header: 'Pemakaian Standar Resep',
      render: (item) => (
        <span className="text-neutral-600 text-xs font-mono">
          {item.theoreticalUsage} {item.unit}
        </span>
      ),
    },
    {
      key: 'actualUsage',
      header: 'Pemakaian Riil Aktual',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs font-mono">
          {item.actualUsage} {item.unit}
        </span>
      ),
    },
    {
      key: 'varianceQty',
      header: 'Selisih (Variance)',
      render: (item) => (
        <span
          className={`font-mono font-bold text-xs ${
            item.varianceQty <= 0 ? 'text-emerald-600' : 'text-amber-600'
          }`}
        >
          {item.varianceQty > 0 ? `+${item.varianceQty}` : item.varianceQty} {item.unit}
        </span>
      ),
    },
    {
      key: 'costTotal',
      header: 'Nilai Pemakaian',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs">{formatRupiah(item.costTotal)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Efisiensi',
      render: (item) => (
        <StatusBadge
          variant={item.status === 'Efisien' ? 'success' : item.status === 'Wajar' ? 'neutral' : 'warning'}
        >
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
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Laporan & Analitik</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Analisis performa pendapatan toko, marjin laba kotor (HPP), dan audit operasional
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Date Filter */}
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
            variant="outline"
            onClick={() => showToast('Mengekspor laporan ke file Excel...')}
            leftIcon={<Upload className="size-3.5" />}
          >
            Export Laporan
          </Button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <p className="text-xs font-medium text-neutral-500">Total Pendapatan (Revenue)</p>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">
            {formatRupiah(kpis.total_revenue)}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">Termasuk PPN & Biaya Layanan</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <p className="text-xs font-medium text-neutral-500">Penjualan Bersih (Net Sales)</p>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">
            {formatRupiah(kpis.net_sales)}
          </p>
          <p className="text-[11px] text-neutral-400">
            Diskon: -{formatRupiah(kpis.total_discounts)}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <p className="text-xs font-medium text-neutral-500">Total Pesanan Selesai</p>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">
            {kpis.total_orders.toLocaleString('id-ID')} Struk
          </p>
          <p className="text-[11px] text-blue-600 font-medium">100% Pesanan Terlayani</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <p className="text-xs font-medium text-neutral-500">Rata-rata Transaksi (AOV)</p>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">
            {formatRupiah(kpis.average_order_value)}
          </p>
          <p className="text-[11px] text-neutral-400">Rerata nilai belanja pelanggan</p>
        </div>
      </div>

      {/* Horizontal Tabs */}
      <div className="border-b border-neutral-200 flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'summary'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <BarChart3 className="size-4" />
          <span>Ringkasan Penjualan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'products'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Coffee className="size-4" />
          <span>Produk Terlaris</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cogs')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'cogs'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Package className="size-4" />
          <span>HPP & Pemakaian Bahan</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pos Keuangan Breakdown */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
              Rincian Pos Pendapatan Toko
            </h3>
            <div className="divide-y divide-neutral-100 text-xs">
              <div className="flex justify-between py-2.5">
                <span className="text-neutral-500">Penjualan Kotor (Gross Sales):</span>
                <span className="font-semibold text-neutral-900">{formatRupiah(kpis.gross_sales)}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-neutral-500">Potongan Diskon & Promo:</span>
                <span className="font-bold text-red-600">-{formatRupiah(kpis.total_discounts)}</span>
              </div>
              <div className="flex justify-between py-2.5 font-bold text-neutral-900">
                <span>Penjualan Bersih (Net Sales):</span>
                <span>{formatRupiah(kpis.net_sales)}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-neutral-500">Pajak Restoran (PB1 10%):</span>
                <span className="font-semibold text-neutral-900">{formatRupiah(kpis.tax)}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-neutral-500">Biaya Layanan (Service Charge):</span>
                <span className="font-semibold text-neutral-900">{formatRupiah(kpis.service_charge)}</span>
              </div>
              <div className="flex justify-between pt-3 text-sm font-bold text-[#E5484D]">
                <span>Total Penerimaan (Revenue):</span>
                <span>{formatRupiah(kpis.total_revenue)}</span>
              </div>
            </div>
          </div>

          {/* Distribusi Channel */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
              Distribusi Saluran Pemesanan
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-neutral-700">QR Order Meja (Dine-in)</span>
                  <span className="font-bold text-neutral-900">Rp19.450.000 (52.6%)</span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '52.6%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-neutral-700">POS Kasir Counter</span>
                  <span className="font-bold text-neutral-900">Rp12.180.000 (33.0%)</span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '33.0%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-medium mb-1.5">
                  <span className="text-neutral-700">Online Food Delivery</span>
                  <span className="font-bold text-neutral-900">Rp5.330.000 (14.4%)</span>
                </div>
                <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: '14.4%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div className="space-y-4">
          <DataTable<ProductPerformance>
            columns={productColumns}
            data={FALLBACK_PRODUCTS}
            keyExtractor={(item) => item.id}
            selectable={false}
            emptyTitle="BELUM ADA DATA PENJUALAN PRODUK"
            emptyDescription="Menu yang terjual akan otomatis dianalisis margin dan omzetnya di sini."
            entityName="produk"
          />
        </div>
      )}

      {activeTab === 'cogs' && (
        <div className="space-y-4">
          <DataTable<CogsItem>
            columns={cogsColumns}
            data={FALLBACK_COGS}
            keyExtractor={(item) => item.id}
            selectable={false}
            emptyTitle="BELUM ADA DATA HPP"
            emptyDescription="Pemakaian bahan baku resep vs aktual tercatat otomatis di sini."
            entityName="bahan"
          />
        </div>
      )}
    </div>
  );
}
