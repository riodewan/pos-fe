'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Coffee,
  Package,
  RefreshCw,
  Upload,
  BarChart3,
  Check,
  Users,
  CreditCard,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { reportsService } from '@/services';
import { DashboardReport } from '@/types';
import { formatRupiah, getISODateOnly, getPastDateISO } from '@/utils';
import {
  DataTable,
  ColumnDef,
  StatusBadge,
  Button,
  Select,
  CardSkeleton,
  PageLoader,
} from '@/components/common';

type ReportTab = 'summary' | 'products' | 'cogs' | 'cashiers';

interface ProductPerformance {
  id: string;
  rank: number;
  name: string;
  category: string;
  qtySold: number;
  revenue: number;
  unitCost: number;
  cogs: number;
  grossProfit: number;
  grossMarginPercent: number;
}

interface CogsItem {
  id: string;
  ingredientName: string;
  unit: string;
  theoreticalUsage: number;
  actualUsage: number;
  varianceQty: number;
  remainingStock: number;
  unitCost: number;
  costTotal: number;
  status: 'Efisien' | 'Wajar' | 'Boros';
}

interface CashierSummaryItem {
  id: string;
  userName: string;
  totalOrders: number;
  cashTotal: number;
  qrisTotal: number;
  otherTotal: number;
  totalCollected: number;
}

export default function ReportsPage() {
  const { activeStore } = useStore();

  const [activeTab, setActiveTab] = useState<ReportTab>('summary');
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRangeFilter, setDateRangeFilter] = useState('30d');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<DashboardReport | null>(null);
  const [productList, setProductList] = useState<ProductPerformance[]>([]);
  const [cogsList, setCogsList] = useState<CogsItem[]>([]);
  const [financialAnalysis, setFinancialAnalysis] = useState<{
    net_sales: number;
    total_cogs: number;
    gross_profit: number;
    gross_profit_margin_percentage: number;
  }>({
    net_sales: 0,
    total_cogs: 0,
    gross_profit: 0,
    gross_profit_margin_percentage: 0,
  });
  const [cashierList, setCashierList] = useState<CashierSummaryItem[]>([]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const computeDateRange = useCallback(() => {
    const end = getISODateOnly();
    if (dateRangeFilter === 'today') {
      return { start: end, end };
    }
    if (dateRangeFilter === '7d') {
      return { start: getPastDateISO(7), end };
    }
    if (dateRangeFilter === 'this_month') {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      return { start: firstDay, end };
    }
    return { start: getPastDateISO(30), end };
  }, [dateRangeFilter]);

  const loadReports = useCallback(
    async (manual = false) => {
      if (!activeStore) {
        setLoading(false);
        return;
      }
      if (manual) setIsRefreshing(true);
      else setLoading(true);

      try {
        const { start, end } = computeDateRange();

        const [res, topProdRes, usageRes, cashierRes] = await Promise.allSettled([
          reportsService.getDashboardOverview(start, end),
          reportsService.getTopProducts(start, end, 20),
          reportsService.getInventoryUsage(start, end),
          reportsService.getCashierAudit(start, end),
        ]);

        if (res.status === 'fulfilled' && res.value?.data) {
          setDashboardData(res.value.data);
        }

        if (topProdRes.status === 'fulfilled' && Array.isArray(topProdRes.value?.data)) {
          const mappedProducts: ProductPerformance[] = topProdRes.value.data.map(
            (p: any, idx: number) => {
              const sales = Number(p.total_sales ?? p.revenue ?? 0);
              const cogs = Number(p.total_cogs ?? 0);
              const profit = Number(p.gross_profit ?? Math.max(0, sales - cogs));
              const margin =
                p.margin_percent !== undefined
                  ? Number(p.margin_percent)
                  : sales > 0
                  ? Number(((profit / sales) * 100).toFixed(1))
                  : 0;

              return {
                id: p.id || p.product_id || `p-${idx}`,
                rank: idx + 1,
                name: p.name || p.product_name || 'Produk',
                category: p.category || 'Menu Utama',
                qtySold: Number(p.quantity_sold ?? p.total_quantity_sold ?? p.qty ?? 0),
                revenue: sales,
                unitCost: Number(p.unit_cost ?? 0),
                cogs,
                grossProfit: profit,
                grossMarginPercent: margin,
              };
            }
          );
          setProductList(mappedProducts);
        } else {
          setProductList([]);
        }

        if (usageRes.status === 'fulfilled' && usageRes.value?.data) {
          const uData = usageRes.value.data as any;
          if (uData.financial_analysis) {
            setFinancialAnalysis({
              net_sales: Number(uData.financial_analysis.net_sales ?? 0),
              total_cogs: Number(uData.financial_analysis.total_cogs ?? 0),
              gross_profit: Number(uData.financial_analysis.gross_profit ?? 0),
              gross_profit_margin_percentage: Number(
                uData.financial_analysis.gross_profit_margin_percentage ?? 0
              ),
            });
          }
          if (Array.isArray(uData.items)) {
            const mappedCogs: CogsItem[] = uData.items.map((c: any, idx: number) => ({
              id: c.id || c.ingredient_id || `cg-${idx}`,
              ingredientName: c.ingredient_name || c.name || 'Bahan Baku',
              unit: c.unit_code || c.unit || 'unit',
              theoreticalUsage: Number(c.theoretical_usage ?? 0),
              actualUsage: Number(c.actual_usage ?? c.total_consumed_quantity ?? 0),
              varianceQty: Number(c.variance ?? 0),
              remainingStock: Number(c.remaining_stock ?? 0),
              unitCost: Number(c.unit_cost ?? 0),
              costTotal: Number(c.estimated_cogs ?? c.cost ?? 0),
              status: (c.status || (Number(c.variance ?? 0) <= 0 ? 'Efisien' : 'Wajar')) as any,
            }));
            setCogsList(mappedCogs);
          } else {
            setCogsList([]);
          }
        }

        if (cashierRes.status === 'fulfilled' && (cashierRes.value?.data as any)?.cashiers) {
          const rawCashiers = (cashierRes.value.data as any).cashiers || [];
          setCashierList(
            rawCashiers.map((c: any, idx: number) => ({
              id: c.user_id || `cashier-${idx}`,
              userName: c.user_name || 'Kasir / QR Order',
              totalOrders: Number(c.total_orders ?? 0),
              cashTotal: Number(c.cash_total ?? 0),
              qrisTotal: Number(c.qris_total ?? 0),
              otherTotal: Number(c.other_total ?? 0),
              totalCollected: Number(c.total_collected ?? 0),
            }))
          );
        } else {
          setCashierList([]);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [activeStore, computeDateRange]
  );

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const kpis = dashboardData?.kpis || {
    gross_sales: 0,
    total_discounts: 0,
    net_sales: 0,
    tax: 0,
    total_tax: 0,
    service_charge: 0,
    total_revenue: 0,
    total_orders: 0,
    average_order_value: 0,
    estimated_profit: 0,
  };

  const taxCollected = Number((kpis as any).total_tax ?? (kpis as any).tax ?? 0);
  const channels = dashboardData?.channels || [];
  const paymentMethods = dashboardData?.payment_methods || [];

  const handleExportCsv = () => {
    const { start, end } = computeDateRange();
    const lines: string[] = [];
    lines.push(`LAPORAN PENJUALAN & HPP OUTLET - ${activeStore?.name || 'Outlet'}`);
    lines.push(`Periode,${start} s/d ${end}`);
    lines.push('');
    lines.push('RINGKASAN PENDAPATAN TOKO');
    lines.push(`Penjualan Kotor (Gross Sales),${kpis.gross_sales}`);
    lines.push(`Potongan Diskon,${kpis.total_discounts}`);
    lines.push(`Penjualan Bersih (Net Sales),${kpis.net_sales}`);
    lines.push(`Pajak Restoran / Toko,${taxCollected}`);
    lines.push(`Total Penerimaan Toko,${kpis.total_revenue}`);
    lines.push(`Total HPP Bahan Baku,${financialAnalysis.total_cogs}`);
    lines.push(`Laba Kotor (Gross Profit),${financialAnalysis.gross_profit}`);
    lines.push('');
    lines.push('PRODUK TERLARIS');
    lines.push('No,Nama Produk,Kategori,Terjual (Porsi),Omzet Penjualan,HPP Satuan,Total HPP,Laba Kotor,Margin (%)');
    productList.forEach((p) => {
      lines.push(
        `${p.rank},"${p.name}","${p.category}",${p.qtySold},${p.revenue},${p.unitCost},${p.cogs},${p.grossProfit},${p.grossMarginPercent}%`
      );
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan-outlet-${start}-${end}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Laporan berhasil diunduh dalam format CSV!');
  };

  const productColumns: ColumnDef<ProductPerformance>[] = [
    {
      key: 'rank',
      header: 'No',
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
      header: 'Terjual',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs font-mono">
          {item.qtySold} Porsi
        </span>
      ),
    },
    {
      key: 'revenue',
      header: 'Omzet Penjualan',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs font-mono">
          {formatRupiah(item.revenue)}
        </span>
      ),
    },
    {
      key: 'cogs',
      header: 'Total HPP Resep',
      render: (item) => (
        <div>
          <span className="text-neutral-700 text-xs font-mono">{formatRupiah(item.cogs)}</span>
          {item.unitCost > 0 && (
            <p className="text-[10px] text-neutral-400 font-mono">
              @{formatRupiah(item.unitCost)}/porsi
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'grossProfit',
      header: 'Laba Kotor',
      render: (item) => (
        <span className="font-bold text-emerald-700 text-xs font-mono">
          {formatRupiah(item.grossProfit)}
        </span>
      ),
    },
    {
      key: 'grossMarginPercent',
      header: 'Margin Laba',
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
      header: 'Pemakaian Resep',
      render: (item) => (
        <span className="text-neutral-600 text-xs font-mono">
          {item.theoreticalUsage} {item.unit}
        </span>
      ),
    },
    {
      key: 'actualUsage',
      header: 'Pemakaian Aktual',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs font-mono">
          {item.actualUsage} {item.unit}
        </span>
      ),
    },
    {
      key: 'remainingStock',
      header: 'Sisa Stok Gudang',
      render: (item) => (
        <span className="text-neutral-600 text-xs font-mono">
          {item.remainingStock} {item.unit}
        </span>
      ),
    },
    {
      key: 'unitCost',
      header: 'Harga Beli / Unit',
      render: (item) => (
        <span className="text-neutral-600 text-xs font-mono">{formatRupiah(item.unitCost)}</span>
      ),
    },
    {
      key: 'costTotal',
      header: 'Total Nilai HPP',
      render: (item) => (
        <span className="font-bold text-neutral-900 text-xs font-mono">
          {formatRupiah(item.costTotal)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Efisiensi',
      render: (item) => (
        <StatusBadge
          variant={
            item.status === 'Efisien'
              ? 'success'
              : item.status === 'Wajar'
              ? 'neutral'
              : 'warning'
          }
        >
          {item.status}
        </StatusBadge>
      ),
    },
  ];

  const cashierColumns: ColumnDef<CashierSummaryItem>[] = [
    {
      key: 'userName',
      header: 'Nama Kasir / Saluran',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs">{item.userName}</span>
      ),
    },
    {
      key: 'totalOrders',
      header: 'Jumlah Struk',
      render: (item) => (
        <span className="font-mono font-semibold text-xs text-neutral-700">
          {item.totalOrders} Pesanan
        </span>
      ),
    },
    {
      key: 'cashTotal',
      header: 'Penerimaan Tunai (CASH)',
      render: (item) => (
        <span className="font-mono text-xs text-neutral-800">{formatRupiah(item.cashTotal)}</span>
      ),
    },
    {
      key: 'qrisTotal',
      header: 'Penerimaan QRIS',
      render: (item) => (
        <span className="font-mono text-xs text-emerald-700 font-semibold">
          {formatRupiah(item.qrisTotal)}
        </span>
      ),
    },
    {
      key: 'otherTotal',
      header: 'Metode Lainnya',
      render: (item) => (
        <span className="font-mono text-xs text-neutral-600">{formatRupiah(item.otherTotal)}</span>
      ),
    },
    {
      key: 'totalCollected',
      header: 'Total Penerimaan Toko',
      render: (item) => (
        <span className="font-mono font-bold text-xs text-neutral-900">
          {formatRupiah(item.totalCollected)}
        </span>
      ),
    },
  ];

  if (loading) {
    return <PageLoader text="Memuat laporan analitik..." />;
  }

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
            Analisis performa pendapatan toko, pajak, HPP bahan baku, dan performa menu
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            onClick={() => loadReports(true)}
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
            variant="outline"
            onClick={handleExportCsv}
            leftIcon={<Upload className="size-3.5" />}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
            <p className="text-xs font-medium text-neutral-500">Total Penerimaan Toko (Gross Revenue)</p>
            <p className="text-2xl font-bold text-neutral-900 tracking-tight font-mono">
              {formatRupiah(kpis.total_revenue)}
            </p>
            <p className="text-[11px] text-emerald-600 font-medium">
              Penjualan Bersih + Pajak Toko ({formatRupiah(taxCollected)})
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
            <p className="text-xs font-medium text-neutral-500">Penjualan Bersih (Net Sales)</p>
            <p className="text-2xl font-bold text-neutral-900 tracking-tight font-mono">
              {formatRupiah(kpis.net_sales)}
            </p>
            <p className="text-[11px] text-neutral-400">
              Diskon: -{formatRupiah(kpis.total_discounts)}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
            <p className="text-xs font-medium text-neutral-500">Laba Kotor (Setelah HPP Resep)</p>
            <p className="text-2xl font-bold text-emerald-700 tracking-tight font-mono">
              {formatRupiah(financialAnalysis.gross_profit || (kpis as any).estimated_profit || 0)}
            </p>
            <p className="text-[11px] text-neutral-500">
              Total HPP Bahan: {formatRupiah(financialAnalysis.total_cogs)} (Margin {financialAnalysis.gross_profit_margin_percentage}%)
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
            <p className="text-xs font-medium text-neutral-500">Total Transaksi & Rata-rata (AOV)</p>
            <p className="text-2xl font-bold text-neutral-900 tracking-tight font-mono">
              {kpis.total_orders.toLocaleString('id-ID')} Struk
            </p>
            <p className="text-[11px] text-blue-600 font-medium">
              Rata-rata: {formatRupiah(kpis.average_order_value)} / struk
            </p>
          </div>
        </div>
      )}

      {/* Horizontal Tabs */}
      <div className="border-b border-neutral-200 flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
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
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'products'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Coffee className="size-4" />
          <span>Produk Terlaris & Margin ({productList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cogs')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'cogs'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Package className="size-4" />
          <span>HPP & Pemakaian Bahan ({cogsList.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cashiers')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 cursor-pointer ${
            activeTab === 'cashiers'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Users className="size-4" />
          <span>Rekap Kasir & Pembayaran</span>
        </button>
      </div>

      {/* Tab 1: Ringkasan Penjualan */}
      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pos Keuangan Breakdown */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
              Rincian Pos Pendapatan & Laba Kotor Toko
            </h3>
            <div className="divide-y divide-neutral-100 text-xs">
              <div className="flex justify-between py-2.5">
                <span className="text-neutral-500">Penjualan Kotor (Gross Sales):</span>
                <span className="font-semibold text-neutral-900 font-mono">
                  {formatRupiah(kpis.gross_sales)}
                </span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-neutral-500">Potongan Diskon & Promo:</span>
                <span className="font-bold text-red-600 font-mono">
                  -{formatRupiah(kpis.total_discounts)}
                </span>
              </div>
              <div className="flex justify-between py-2.5 font-bold text-neutral-900">
                <span>Penjualan Bersih (Net Sales):</span>
                <span className="font-mono">{formatRupiah(kpis.net_sales)}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-neutral-500">Pajak Toko / Restoran (PB1):</span>
                <span className="font-semibold text-emerald-700 font-mono">
                  +{formatRupiah(taxCollected)}
                </span>
              </div>
              <div className="flex justify-between py-3 text-sm font-bold text-[#E5484D]">
                <span>Total Penerimaan Toko (Gross Revenue):</span>
                <span className="font-mono">{formatRupiah(kpis.total_revenue)}</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-neutral-500">Total HPP Bahan Baku Terpakai (Resep):</span>
                <span className="font-semibold text-amber-700 font-mono">
                  -{formatRupiah(financialAnalysis.total_cogs)}
                </span>
              </div>
              <div className="flex justify-between pt-3 text-sm font-bold text-emerald-700">
                <span>Laba Kotor Operasional (Net Sales - HPP):</span>
                <span className="font-mono">
                  {formatRupiah(financialAnalysis.gross_profit)} ({financialAnalysis.gross_profit_margin_percentage}%)
                </span>
              </div>
            </div>
          </div>

          {/* Real Dynamic Channel & Payment Distribution */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                Distribusi Saluran Pemesanan
              </h3>
              {channels.length === 0 ? (
                <p className="text-xs text-neutral-400 py-6 text-center">
                  Belum ada transaksi selesai pada periode ini.
                </p>
              ) : (
                <div className="space-y-3 text-xs">
                  {channels.map((ch, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between font-medium mb-1.5">
                        <span className="text-neutral-700">
                          {ch.name} ({ch.count} pesanan)
                        </span>
                        <span className="font-bold text-neutral-900 font-mono">
                          {formatRupiah(ch.total_amount ?? 0)} ({ch.percentage}%)
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.max(4, ch.percentage))}%`,
                            backgroundColor: ch.color || '#FF5C38',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                <CreditCard className="size-4 text-[#FF5C38]" />
                <span>Rincian Metode Pembayaran (Penerimaan Bersih)</span>
              </h3>
              {paymentMethods.length === 0 ? (
                <p className="text-xs text-neutral-400 py-4 text-center">
                  Belum ada data metode pembayaran pada periode ini.
                </p>
              ) : (
                <div className="space-y-2.5 text-xs">
                  {paymentMethods.map((pm, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/70"
                    >
                      <div>
                        <span className="font-bold text-neutral-900">{pm.method}</span>
                        <span className="text-neutral-400 ml-2">
                          ({pm.payment_count} transaksi &bull; {pm.percentage}%)
                        </span>
                      </div>
                      <span className="font-mono font-bold text-neutral-900">
                        {formatRupiah(pm.total_amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Produk Terlaris */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <DataTable<ProductPerformance>
            columns={productColumns}
            data={productList}
            isLoading={loading}
            keyExtractor={(item) => item.id}
            selectable={false}
            emptyTitle="BELUM ADA DATA PENJUALAN PRODUK"
            emptyDescription="Menu yang terjual akan otomatis dianalisis omzet, HPP resep, dan margin laba kotornya di sini."
            entityName="produk"
          />
        </div>
      )}

      {/* Tab 3: HPP & Pemakaian Bahan */}
      {activeTab === 'cogs' && (
        <div className="space-y-4">
          <DataTable<CogsItem>
            columns={cogsColumns}
            data={cogsList}
            isLoading={loading}
            keyExtractor={(item) => item.id}
            selectable={false}
            emptyTitle="BELUM ADA PEMAKAIAN BAHAN BAKU"
            emptyDescription="Saat pesanan dibayar, pengurangan stok bahan berdasarkan resep akan tercatat otomatis di sini."
            entityName="bahan"
          />
        </div>
      )}

      {/* Tab 4: Rekap Kasir */}
      {activeTab === 'cashiers' && (
        <div className="space-y-4">
          <DataTable<CashierSummaryItem>
            columns={cashierColumns}
            data={cashierList}
            isLoading={loading}
            keyExtractor={(item) => item.id}
            selectable={false}
            emptyTitle="BELUM ADA DATA TRANSAKSI KASIR"
            emptyDescription="Rekapitulasi penerimaan per kasir dan pesanan mandiri QR akan tampil di sini."
            entityName="kasir"
          />
        </div>
      )}
    </div>
  );
}
