'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronDown,
  Calendar,
  Sparkles,
  BarChart3,
  FileText,
  CreditCard,
  Coins,
  Package,
  Layers,
  ShoppingBag,
  Check,
  X,
  Play,
  Coffee,
  UtensilsCrossed,
  Milk,
  Wine,
  CupSoda,
  Eye,
  RefreshCw,
  Store as StoreIcon,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { reportsService } from '@/services';
import { DashboardReport } from '@/types';
import { formatRupiah, getISODateOnly, getPastDateISO } from '@/utils';
import { KpiCard, EmptyState, DashboardWidgetCard, PageLoader } from '@/components/common';
import {
  FirstLoginModal,
  SalesTrendChart,
  ChannelDistributionChart,
} from '@/components/dashboard';
import { getLandingPageForRole } from '@/constants/navigation';

type DateFilterPreset = 'TODAY' | '7D' | '30D' | 'THIS_MONTH';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, activeTenant, isLoading } = useAuth();
  const { activeStore, stores, selectStore } = useStore();

  const [report, setReport] = useState<DashboardReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilterPreset>('30D');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [storeDropdownOpen, setStoreDropdownOpen] = useState(false);

  const roleName = user?.is_internal
    ? 'SUPER_ADMIN'
    : activeTenant?.role?.toUpperCase();
  const isOwnerOrManager =
    roleName === 'SUPER_ADMIN' ||
    roleName === 'OWNER' ||
    roleName === 'MANAGER';

  // Role-based redirect from overview: Kasir goes to POS, Inventory goes to Stock, Dapur goes to KDS
  useEffect(() => {
    if (isLoading) return;
    if (!isOwnerOrManager) {
      const target = getLandingPageForRole(roleName, !!user?.is_internal);
      if (target && target !== '/dashboard') {
        router.replace(target);
      }
    }
  }, [roleName, isLoading, isOwnerOrManager, user, router]);

  // Check if first login / onboarding should be displayed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onboarded = localStorage.getItem('nemu_tenant_onboarded');
      const forceOnboarding = searchParams?.get('onboarding') === 'true';
      if (!onboarded || forceOnboarding) {
        setShowFirstLoginModal(true);
      }
    }
  }, [searchParams]);

  // Dynamic greeting based on current time
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    let text = 'Selamat pagi';
    if (hour >= 11 && hour < 15) text = 'Selamat siang';
    else if (hour >= 15 && hour < 18) text = 'Selamat sore';
    else if (hour >= 18 || hour < 4) text = 'Selamat malam';

    const firstName = user?.name ? user.name.split(' ')[0] : '';
    return firstName ? `${text}, ${firstName}!` : `${text}!`;
  }, [user]);

  // Calculate start & end date based on selected preset
  const { startDate, endDate, dateLabel } = useMemo(() => {
    const now = new Date();
    const todayStr = getISODateOnly();

    if (dateFilter === 'TODAY') {
      return {
        startDate: todayStr,
        endDate: todayStr,
        dateLabel: 'Hari Ini',
      };
    }

    if (dateFilter === '7D') {
      return {
        startDate: getPastDateISO(7),
        endDate: todayStr,
        dateLabel: '7 Hari Terakhir',
      };
    }

    if (dateFilter === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const firstDayStr = firstDay.toISOString().split('T')[0];
      return {
        startDate: firstDayStr,
        endDate: todayStr,
        dateLabel: 'Bulan Ini',
      };
    }

    // Default 30D
    return {
      startDate: getPastDateISO(30),
      endDate: todayStr,
      dateLabel: '30 Hari Terakhir',
    };
  }, [dateFilter]);

  // Fetch real dashboard data from backend
  const fetchDashboardData = useCallback(
    async (isManualRefresh = false) => {
      if (isLoading || !isOwnerOrManager) {
        setLoading(false);
        return;
      }

      try {
        if (isManualRefresh) setIsRefreshing(true);
        else setLoading(true);

        const res = await reportsService.getDashboardOverview(startDate, endDate);
        if (res?.data) {
          setReport(res.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard overview:', err);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [startDate, endDate, isLoading, isOwnerOrManager]
  );

  useEffect(() => {
    if (!isLoading && isOwnerOrManager) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, isLoading, isOwnerOrManager, activeStore?.id]);

  // Format trend data for SalesTrendChart
  const salesTrendData = useMemo(() => {
    if (!report?.sales_trend) return [];
    return report.sales_trend.map((item) => ({
      date: item.date,
      sales: item.total_revenue,
      orders: item.order_count,
    }));
  }, [report]);

  const kpis = report?.kpis;
  const topProducts = report?.top_products || [];
  const lowStocks = report?.low_stocks || [];
  const channels = report?.channels || [];
  const todayOrders = report?.today_orders || {
    total: 0,
    new: 0,
    processing: 0,
    ready: 0,
    completed: 0,
    cancelled: 0,
  };

  const hasSalesData = (kpis?.total_orders ?? 0) > 0;

  if (isLoading || (loading && !report)) {
    return <PageLoader text="Memuat ringkasan dashboard..." subtext="Mengambil metrik performa outlet" />;
  }

  return (
    <div className="p-5 sm:p-6 lg:p-7 space-y-6 max-w-[1520px] mx-auto animate-in fade-in duration-200">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#111827] tracking-tight">
            {greeting}
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5 font-normal">
            Ringkasan performa real-time outlet Anda berdasarkan transaksi di database.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200/90 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-colors shadow-2xs cursor-pointer"
            title="Segarkan data performa outlet"
          >
            <RefreshCw className={`size-3.5 text-neutral-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Menyinkronkan...' : 'Segarkan'}</span>
          </button>

          {/* Outlet Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setStoreDropdownOpen(!storeDropdownOpen);
                setDateDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-neutral-200/90 shadow-2xs text-xs font-semibold text-[#111827] cursor-pointer hover:bg-neutral-50 transition-colors"
            >
              <StoreIcon className="size-3.5 text-[#FF5C38]" />
              <span>{activeStore?.name || 'Semua Outlet'}</span>
              <ChevronDown className="size-3.5 text-neutral-400" />
            </button>

            {storeDropdownOpen && stores.length > 0 && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg z-30 py-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                  Pilih Outlet Aktif
                </div>
                {stores.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      selectStore(s.id);
                      setStoreDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center justify-between transition-colors ${
                      activeStore?.id === s.id ? 'font-bold text-[#FF5C38] bg-orange-50/50' : 'text-neutral-700'
                    }`}
                  >
                    <span className="truncate">{s.name}</span>
                    {activeStore?.id === s.id && <Check className="size-3 text-[#FF5C38]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Picker Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setDateDropdownOpen(!dateDropdownOpen);
                setStoreDropdownOpen(false);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-neutral-200/90 shadow-2xs text-xs font-semibold text-[#111827] cursor-pointer hover:bg-neutral-50 transition-colors"
            >
              <Calendar className="size-3.5 text-neutral-500" />
              <span>{dateLabel}</span>
              <ChevronDown className="size-3.5 text-neutral-400" />
            </button>

            {dateDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-neutral-200 rounded-xl shadow-lg z-30 py-1 text-xs animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[10.5px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-100">
                  Rentang Waktu
                </div>
                {[
                  { id: 'TODAY', label: 'Hari Ini' },
                  { id: '7D', label: '7 Hari Terakhir' },
                  { id: '30D', label: '30 Hari Terakhir' },
                  { id: 'THIS_MONTH', label: 'Bulan Ini' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setDateFilter(item.id as DateFilterPreset);
                      setDateDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-neutral-50 flex items-center justify-between transition-colors ${
                      dateFilter === item.id ? 'font-bold text-[#FF5C38] bg-orange-50/50' : 'text-neutral-700'
                    }`}
                  >
                    <span>{item.label}</span>
                    {dateFilter === item.id && <Check className="size-3 text-[#FF5C38]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Left 8-9 cols, Right 3-4 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN (8-9 COLS) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-5">
          {/* Row 1: KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* KPI 1: Total Penjualan */}
            <KpiCard
              icon={<BarChart3 className="size-3.5" />}
              iconBgColor="bg-emerald-50"
              iconTextColor="text-emerald-600"
              title="Total Penjualan"
              value={formatRupiah(kpis?.total_revenue ?? 0)}
              percentage={kpis?.sales_growth !== undefined ? `${kpis.sales_growth}%` : '0%'}
              comparisonLabel="vs periode sebelumnya"
              isPositive={(kpis?.sales_growth ?? 0) >= 0}
              sparklineColor="#10B981"
            />

            {/* KPI 2: Total Transaksi */}
            <KpiCard
              icon={<FileText className="size-3.5" />}
              iconBgColor="bg-blue-50"
              iconTextColor="text-blue-600"
              title="Total Transaksi"
              value={(kpis?.total_orders ?? 0).toLocaleString('id-ID')}
              percentage={kpis?.orders_growth !== undefined ? `${kpis.orders_growth}%` : '0%'}
              comparisonLabel="vs periode sebelumnya"
              isPositive={(kpis?.orders_growth ?? 0) >= 0}
              sparklineColor="#3B82F6"
            />

            {/* KPI 3: Average Order Value (AOV) */}
            <KpiCard
              icon={<CreditCard className="size-3.5" />}
              iconBgColor="bg-purple-50"
              iconTextColor="text-purple-600"
              title="Average Order Value"
              value={formatRupiah(kpis?.average_order_value ?? 0)}
              percentage={kpis?.aov_growth !== undefined ? `${kpis.aov_growth}%` : '0%'}
              comparisonLabel="vs periode sebelumnya"
              isPositive={(kpis?.aov_growth ?? 0) >= 0}
              sparklineColor="#A855F7"
            />

            {/* KPI 4: Profit Estimasi */}
            <KpiCard
              icon={<Coins className="size-3.5" />}
              iconBgColor="bg-amber-50"
              iconTextColor="text-amber-600"
              title="Profit Estimasi"
              value={formatRupiah(kpis?.estimated_profit ?? (kpis?.net_sales ?? 0) * 0.45)}
              percentage={kpis?.profit_growth !== undefined ? `${kpis.profit_growth}%` : '0%'}
              comparisonLabel="vs periode sebelumnya"
              isPositive={(kpis?.profit_growth ?? 0) >= 0}
              sparklineColor="#F59E0B"
            />
          </div>

          {/* Row 2: Charts (Sales Trend Bar & Line Chart + Donut Distribution per Channel) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Chart 1: Penjualan Dual-Axis Bar & Line Chart */}
            <div className="md:col-span-7 xl:col-span-8">
              <SalesTrendChart
                data={salesTrendData}
                timeframe={dateLabel}
                isEmpty={!hasSalesData}
              />
            </div>

            {/* Chart 2: Distribusi Transaksi per Channel Donut */}
            <div className="md:col-span-5 xl:col-span-4">
              <ChannelDistributionChart
                channels={channels}
                isEmpty={channels.length === 0}
              />
            </div>
          </div>

          {/* Row 3: Produk Terlaris & Stok Tipis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Produk Terlaris */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between min-h-[300px]">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                    Produk Terlaris
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Item menu dengan volume penjualan tertinggi pada periode ini
                  </p>
                </div>
                <Link
                  href="/dashboard/catalog"
                  className="text-xs text-[#FF5C38] hover:text-[#E04B28] font-semibold transition-colors shrink-0"
                >
                  Lihat menu &rsaquo;
                </Link>
              </div>

              {topProducts.length === 0 ? (
                <EmptyState
                  title="BELUM ADA PRODUK TERJUAL"
                  description="Produk terlaris akan otomatis tampil di sini setelah ada pesanan selesai."
                  actionText="Buka Katalog Menu"
                  actionHref="/dashboard/catalog"
                />
              ) : (
                <div className="divide-y divide-neutral-100 flex-1">
                  <div className="grid grid-cols-12 py-2 text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">
                    <span className="col-span-1 text-center">#</span>
                    <span className="col-span-6">Produk</span>
                    <span className="col-span-2 text-center">Terjual</span>
                    <span className="col-span-3 text-right">Penjualan</span>
                  </div>
                  {topProducts.map((p, idx) => (
                    <div
                      key={p.product_id || idx}
                      className="grid grid-cols-12 py-2.5 items-center text-xs hover:bg-neutral-50/60 rounded-lg transition-colors px-1"
                    >
                      <span className="col-span-1 text-center text-neutral-400 font-bold">
                        {idx + 1}
                      </span>
                      <div className="col-span-6 flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="size-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100">
                          <Coffee className="size-4" />
                        </div>
                        <span className="font-semibold text-neutral-900 truncate">
                          {p.product_name}
                        </span>
                      </div>
                      <span className="col-span-2 text-center font-bold text-neutral-800">
                        {p.quantity_sold ?? p.total_quantity ?? 0}
                      </span>
                      <span className="col-span-3 text-right font-bold text-[#2563EB]">
                        {formatRupiah(p.total_sales)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card 2: Stok Tipis & Perlu Restock */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between min-h-[300px]">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                    Stok Tipis & Perlu Restock
                  </h3>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    Bahan baku yang berada di bawah atau mendekati batas minimum
                  </p>
                </div>
                <Link
                  href="/dashboard/inventory"
                  className="text-xs text-[#FF5C38] hover:text-[#E04B28] font-semibold transition-colors shrink-0"
                >
                  Kelola stok &rsaquo;
                </Link>
              </div>

              {lowStocks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                  <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 border border-emerald-100">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                    Semua Stok Aman
                  </h4>
                  <p className="text-[11px] text-neutral-400 max-w-xs mt-1">
                    Seluruh bahan baku inventori outlet saat ini berada di atas batas minimum stok.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100 flex-1">
                  <div className="grid grid-cols-12 py-2 text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">
                    <span className="col-span-1 text-center">#</span>
                    <span className="col-span-6">Bahan Baku</span>
                    <span className="col-span-2 text-center">Sisa Stok</span>
                    <span className="col-span-3 text-right">Status</span>
                  </div>
                  {lowStocks.map((s, idx) => (
                    <div
                      key={s.id || idx}
                      className="grid grid-cols-12 py-2.5 items-center text-xs hover:bg-neutral-50/60 rounded-lg transition-colors px-1"
                    >
                      <span className="col-span-1 text-center text-neutral-400 font-medium">
                        {idx + 1}
                      </span>
                      <div className="col-span-6 flex items-center gap-2.5 min-w-0 pr-2">
                        <div className="size-8 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center shrink-0 border border-neutral-200">
                          <Package className="size-4" />
                        </div>
                        <span className="font-semibold text-neutral-900 truncate">
                          {s.name}
                        </span>
                      </div>
                      <span className="col-span-2 text-center font-bold text-neutral-800">
                        {Number(s.remaining).toLocaleString('id-ID')} {s.unit_code}
                      </span>
                      <div className="col-span-3 flex justify-end">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${
                            s.is_critical || s.status === 'Habis' || s.status === 'Sangat Rendah'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* RIGHT COLUMN (3-4 COLS): PESANAN HARI INI & PANDUAN CEPAT  */}
        {/* ========================================================== */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-5">
          {/* Card 1: Pesanan hari ini using real database breakdown */}
          <DashboardWidgetCard
            title="Pesanan Hari Ini"
            badge={todayOrders.total}
            headerHref="/dashboard/orders"
          >
            <div className="space-y-3">
              {/* Item: Baru (Pending) */}
              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="size-7 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Sparkles className="size-3.5" />
                  </span>
                  <span className="text-xs font-medium text-neutral-800">
                    Baru (Pending)
                  </span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    todayOrders.new > 0 ? 'text-[#EA580C]' : 'text-neutral-500'
                  }`}
                >
                  {todayOrders.new}
                </span>
              </div>

              {/* Item: Diproses (Confirmed / Preparing) */}
              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="size-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Play className="size-3 fill-current ml-0.5" />
                  </span>
                  <span className="text-xs font-medium text-neutral-800">
                    Diproses (Dapur)
                  </span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    todayOrders.processing > 0 ? 'text-[#D97706]' : 'text-neutral-500'
                  }`}
                >
                  {todayOrders.processing}
                </span>
              </div>

              {/* Item: Siap diambil (Ready) */}
              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="size-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <ShoppingBag className="size-3.5" />
                  </span>
                  <span className="text-xs font-medium text-neutral-800">
                    Siap Disajikan
                  </span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    todayOrders.ready > 0 ? 'text-[#2563EB]' : 'text-neutral-500'
                  }`}
                >
                  {todayOrders.ready}
                </span>
              </div>

              {/* Item: Selesai (Completed) */}
              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="size-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Check className="size-3.5 stroke-[2.5]" />
                  </span>
                  <span className="text-xs font-medium text-neutral-800">
                    Selesai (Dibayar)
                  </span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    todayOrders.completed > 0 ? 'text-[#16A34A]' : 'text-neutral-500'
                  }`}
                >
                  {todayOrders.completed}
                </span>
              </div>

              {/* Item: Dibatalkan (Cancelled) */}
              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="size-7 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center shrink-0 shadow-2xs">
                    <X className="size-3.5 stroke-[2.5]" />
                  </span>
                  <span className="text-xs font-medium text-neutral-800">
                    Dibatalkan
                  </span>
                </div>
                <span className="text-sm font-bold text-neutral-500">
                  {todayOrders.cancelled}
                </span>
              </div>
            </div>
          </DashboardWidgetCard>

          {/* Card 2: Akses Cepat Operasional */}
          <DashboardWidgetCard
            title="Akses Cepat Operasional"
            headerHref="/dashboard/pos"
          >
            <div className="space-y-3">
              {/* Action 1: Buka Kasir POS */}
              <Link
                href="/dashboard/pos"
                className="flex items-center justify-between p-2 rounded-xl border border-neutral-100 hover:bg-neutral-50/80 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-orange-50 text-[#FF5C38] flex items-center justify-center shrink-0">
                    <ShoppingBag className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-900 group-hover:text-[#FF5C38] transition-colors">
                      Kasir POS
                    </h4>
                    <p className="text-[10.5px] text-neutral-400">
                      Buka terminal kasir & catat pesanan
                    </p>
                  </div>
                </div>
                <span className="text-neutral-400 group-hover:text-neutral-700 text-xs">&rsaquo;</span>
              </Link>

              {/* Action 2: Kitchen Display System (KDS) */}
              <Link
                href="/dashboard/kds"
                className="flex items-center justify-between p-2 rounded-xl border border-neutral-100 hover:bg-neutral-50/80 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <UtensilsCrossed className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors">
                      Kitchen Display (KDS)
                    </h4>
                    <p className="text-[10.5px] text-neutral-400">
                      Antrean pesanan dapur & barista
                    </p>
                  </div>
                </div>
                <span className="text-neutral-400 group-hover:text-neutral-700 text-xs">&rsaquo;</span>
              </Link>

              {/* Action 3: Kelola Stok & Opname */}
              <Link
                href="/dashboard/inventory"
                className="flex items-center justify-between p-2 rounded-xl border border-neutral-100 hover:bg-neutral-50/80 transition-colors group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Package className="size-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-900 group-hover:text-amber-600 transition-colors">
                      Inventori Stok
                    </h4>
                    <p className="text-[10.5px] text-neutral-400">
                      Pantau saldo bahan & stock opname
                    </p>
                  </div>
                </div>
                <span className="text-neutral-400 group-hover:text-neutral-700 text-xs">&rsaquo;</span>
              </Link>
            </div>
          </DashboardWidgetCard>
        </div>
      </div>

      {/* Onboarding Modal: First Login / Newly Registered Tenant */}
      <FirstLoginModal
        isOpen={showFirstLoginModal}
        onClose={() => setShowFirstLoginModal(false)}
        onComplete={() => setShowFirstLoginModal(false)}
      />
    </div>
  );
}
