'use client';

import React, { useEffect, useState, useCallback } from 'react';
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

export default function DashboardOverviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, activeTenant, isLoading } = useAuth();
  const { activeStore } = useStore();

  const [report, setReport] = useState<DashboardReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);

  // Preview Mode: 'populated' matches Screenshot 1, 'empty' matches Screenshot 2
  const [previewMode, setPreviewMode] = useState<'populated' | 'empty'>('populated');

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

  const fetchDashboardData = useCallback(async () => {
    if (isLoading || !activeStore || !isOwnerOrManager) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const end_date = getISODateOnly();
    const start_date = getPastDateISO(30);

    try {
      const res = await reportsService.getDashboardOverview(start_date, end_date);
      setReport(res.data);
    } catch (err) {
      console.warn('Dashboard report notice (using default mockup state):', err);
    } finally {
      setLoading(false);
    }
  }, [activeStore, isOwnerOrManager, isLoading]);

  useEffect(() => {
    if (!isLoading && isOwnerOrManager && activeStore) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, isLoading, isOwnerOrManager, activeStore]);

  const isEmpty = previewMode === 'empty';

  // Populated mock data matching Figma Screenshot 1
  const populatedTopProducts = [
    {
      id: 1,
      name: 'Kopi Susu Gula Aren',
      qty: 40,
      sales: 1200000,
      icon: <Coffee className="size-4" />,
      iconBg: 'bg-amber-100 text-amber-800',
    },
    {
      id: 2,
      name: 'Americano',
      qty: 35,
      sales: 875000,
      icon: <Coffee className="size-4" />,
      iconBg: 'bg-stone-200 text-stone-800',
    },
    {
      id: 3,
      name: 'Cafe Latte',
      qty: 20,
      sales: 700000,
      icon: <Coffee className="size-4" />,
      iconBg: 'bg-orange-100 text-orange-800',
    },
    {
      id: 4,
      name: 'Matcha Latte',
      qty: 18,
      sales: 630000,
      icon: <Coffee className="size-4" />,
      iconBg: 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 5,
      name: 'Croissant Butter',
      qty: 13,
      sales: 390000,
      icon: <UtensilsCrossed className="size-4" />,
      iconBg: 'bg-amber-200 text-amber-900',
    },
  ];

  const populatedLowStock = [
    {
      id: 1,
      name: 'Susu Fresh',
      remaining: '2 l',
      status: 'Sangat Rendah',
      isCritical: true,
      icon: <Milk className="size-4" />,
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      id: 2,
      name: 'Biji Kopi Arabika',
      remaining: '500 g',
      status: 'Rendah',
      isCritical: false,
      icon: <Coffee className="size-4" />,
      iconBg: 'bg-amber-100 text-amber-800',
    },
    {
      id: 3,
      name: 'Gula Aren',
      remaining: '1 kg',
      status: 'Rendah',
      isCritical: false,
      icon: <Package className="size-4" />,
      iconBg: 'bg-amber-50 text-amber-800',
    },
    {
      id: 4,
      name: 'Sirup Vanilla',
      remaining: '1 botol',
      status: 'Rendah',
      isCritical: false,
      icon: <Wine className="size-4" />,
      iconBg: 'bg-yellow-50 text-yellow-700',
    },
    {
      id: 5,
      name: 'Cup 16 oz',
      remaining: '35 pcs',
      status: 'Rendah',
      isCritical: false,
      icon: <CupSoda className="size-4" />,
      iconBg: 'bg-neutral-100 text-neutral-600',
    },
  ];

  if (isLoading || loading) {
    return <PageLoader text="Memuat ringkasan dashboard..." />;
  }

  return (
    <div className="p-5 sm:p-6 lg:p-7 space-y-5 max-w-[1520px] mx-auto animate-in fade-in duration-200">
      {/* Top Header Row matching Figma: Greeting, Outlet dropdown, Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#111827] tracking-tight">
            Selamat pagi,
          </h1>
          <p className="text-xs text-[#6B7280] mt-0.5 font-normal">
            Ringkasan performa outlet anda hari ini.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Mode Switcher: Populated vs Empty preview for QA/User */}
          <button
            type="button"
            onClick={() => setPreviewMode(isEmpty ? 'populated' : 'empty')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-colors shadow-2xs"
            title="Klik untuk berpindah antara tampilan data terisi dan kosong"
          >
            <Eye className="size-3.5 text-[#2563EB]" />
            <span>Mode: {isEmpty ? 'Data Kosong' : 'Data Terisi'}</span>
          </button>

          {/* Outlet Selector Dropdown Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-neutral-200/90 shadow-2xs text-xs font-semibold text-[#111827] cursor-pointer hover:bg-neutral-50 transition-colors">
            <span>{activeStore?.name || 'Kopi Mantap (Main Outlet)'}</span>
            <ChevronDown className="size-3.5 text-neutral-400" />
          </div>

          {/* Date Picker Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-neutral-200/90 shadow-2xs text-xs font-semibold text-[#111827] cursor-pointer hover:bg-neutral-50 transition-colors">
            <span>Today (14/10/2026)</span>
            <Calendar className="size-3.5 text-neutral-400" />
          </div>

          {/* Trigger to re-open first login modal anytime */}
          <button
            onClick={() => setShowFirstLoginModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF5C38] border border-orange-200 text-xs font-semibold transition-colors shadow-2xs"
            title="Buka kembali alur Profil Outlet First Login"
          >
            <Sparkles className="size-3.5" />
            <span className="hidden md:inline">Lengkapi Profil</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout: Left 9 Columns & Right 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================== */}
        {/* LEFT SECTION (9 COLS): KPIS, CHARTS, AND DATA TABLES       */}
        {/* ========================================================== */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-5">
          {/* Row 1: 4 Metric KPI Cards using Global KpiCard Component */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {/* KPI 1: Total Penjualan */}
            <KpiCard
              icon={<BarChart3 className="size-3.5" />}
              iconBgColor="bg-emerald-50"
              iconTextColor="text-emerald-600"
              title="Total Penjualan"
              value={isEmpty ? 'Rp0' : 'Rp12.500.000'}
              percentage={isEmpty ? 0 : '12,5%'}
              comparisonLabel="Dari kemarin"
              isPositive={!isEmpty}
              sparklineColor="#10B981"
            />

            {/* KPI 2: Total Transaksi */}
            <KpiCard
              icon={<FileText className="size-3.5" />}
              iconBgColor="bg-blue-50"
              iconTextColor="text-blue-600"
              title="Total Transaksi"
              value={isEmpty ? 'Rp0' : '245'}
              percentage={isEmpty ? 0 : '8,2%'}
              comparisonLabel="Dari kemarin"
              isPositive={!isEmpty}
              sparklineColor="#3B82F6"
            />

            {/* KPI 3: Average Order Value (AOV) */}
            <KpiCard
              icon={<CreditCard className="size-3.5" />}
              iconBgColor="bg-purple-50"
              iconTextColor="text-purple-600"
              title="Average Order Value (AOV)"
              value={isEmpty ? 'Rp0' : 'Rp51.020'}
              percentage={isEmpty ? 0 : '3,1%'}
              comparisonLabel="Dari kemarin"
              isPositive={!isEmpty}
              sparklineColor="#A855F7"
            />

            {/* KPI 4: Profit Estimasi */}
            <KpiCard
              icon={<Coins className="size-3.5" />}
              iconBgColor="bg-amber-50"
              iconTextColor="text-amber-600"
              title="Profit Estimasi"
              value={isEmpty ? 'Rp0' : 'Rp4.800.000'}
              percentage={isEmpty ? 0 : '10,4%'}
              comparisonLabel="Dari kemarin"
              isPositive={!isEmpty}
              sparklineColor="#F59E0B"
            />
          </div>

          {/* Row 2: Charts (Penjualan Bar + Donut Distribusi per Channel) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Chart 1: Penjualan Dual-Axis Bar & Line Chart */}
            <div className="md:col-span-7 xl:col-span-8">
              <SalesTrendChart isEmpty={isEmpty} />
            </div>

            {/* Chart 2: Distribusi Transaksi per Channel Donut */}
            <div className="md:col-span-5 xl:col-span-4">
              <ChannelDistributionChart isEmpty={isEmpty} />
            </div>
          </div>

          {/* Row 3: Produk Terlaris Hari Ini & Stok Tipis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Produk Terlaris Hari Ini */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between min-h-[300px]">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                  Produk Terlaris Hari Ini
                </h3>
                <Link
                  href="/dashboard/catalog"
                  className="text-xs text-neutral-400 hover:text-neutral-700 font-medium transition-colors"
                >
                  Lihat semua produk &rsaquo;
                </Link>
              </div>

              {isEmpty ? (
                <EmptyState
                  title="BELUM ADA PRODUK TERJUAL"
                  description="Produk terlaris akan muncul setelah ada penjualan."
                  actionText="Lihat Produk"
                  actionHref="/dashboard/catalog"
                />
              ) : (
                <div className="divide-y divide-neutral-100">
                  <div className="grid grid-cols-12 py-2 text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">
                    <span className="col-span-1 text-center">#</span>
                    <span className="col-span-6">Produk</span>
                    <span className="col-span-2 text-center">Qty Terjual</span>
                    <span className="col-span-3 text-right">Total Penjualan</span>
                  </div>
                  {populatedTopProducts.map((p) => (
                    <div
                      key={p.id}
                      className="grid grid-cols-12 py-2.5 items-center text-xs hover:bg-neutral-50/60 rounded-lg transition-colors px-1"
                    >
                      <span className="col-span-1 text-center text-neutral-400 font-medium">
                        {p.id}
                      </span>
                      <div className="col-span-6 flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${p.iconBg}`}
                        >
                          {p.icon}
                        </div>
                        <span className="font-semibold text-neutral-900 truncate">
                          {p.name}
                        </span>
                      </div>
                      <span className="col-span-2 text-center font-bold text-neutral-800">
                        {p.qty}
                      </span>
                      <span className="col-span-3 text-right font-bold text-[#2563EB]">
                        {formatRupiah(p.sales)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Card 2: Stok Tipis */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between min-h-[300px]">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
                  Stok Tipis
                </h3>
                <Link
                  href="/dashboard/inventory"
                  className="text-xs text-neutral-400 hover:text-neutral-700 font-medium transition-colors"
                >
                  Lihat Inventori &rsaquo;
                </Link>
              </div>

              {isEmpty ? (
                <EmptyState
                  title="BELUM ADA DATA STOK"
                  description="Tambahkan stok untuk memantau persediaan outlet."
                  actionText="Kelola Stok"
                  actionHref="/dashboard/inventory"
                />
              ) : (
                <div className="divide-y divide-neutral-100">
                  <div className="grid grid-cols-12 py-2 text-[10.5px] font-semibold text-neutral-400 uppercase tracking-wider">
                    <span className="col-span-1 text-center">#</span>
                    <span className="col-span-6">Produk</span>
                    <span className="col-span-2 text-center">Sisa</span>
                    <span className="col-span-3 text-right">Status</span>
                  </div>
                  {populatedLowStock.map((s) => (
                    <div
                      key={s.id}
                      className="grid grid-cols-12 py-2.5 items-center text-xs hover:bg-neutral-50/60 rounded-lg transition-colors px-1"
                    >
                      <span className="col-span-1 text-center text-neutral-400 font-medium">
                        {s.id}
                      </span>
                      <div className="col-span-6 flex items-center gap-2.5 min-w-0 pr-2">
                        <div
                          className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${s.iconBg}`}
                        >
                          {s.icon}
                        </div>
                        <span className="font-semibold text-neutral-900 truncate">
                          {s.name}
                        </span>
                      </div>
                      <span className="col-span-2 text-center font-bold text-red-500">
                        {s.remaining}
                      </span>
                      <div className="col-span-3 flex justify-end">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            s.isCritical
                              ? 'bg-rose-50 text-rose-600 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
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
        {/* RIGHT SECTION (3 COLS): PESANAN HARI INI & FITUR TERBARU   */}
        {/* ========================================================== */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-5">
          {/* Card 1: Pesanan hari ini using Global DashboardWidgetCard */}
          <DashboardWidgetCard
            title="Pesanan hari ini"
            badge={isEmpty ? 0 : 248}
            headerHref="/dashboard/pos?tab=orders"
          >
            <div className="space-y-3">
              {/* Item: Baru */}
              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="size-7 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Sparkles className="size-3.5" />
                  </span>
                  <span className="text-xs font-medium text-neutral-800">
                    Baru
                  </span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    isEmpty ? 'text-neutral-900' : 'text-[#EA580C]'
                  }`}
                >
                  {isEmpty ? 0 : 12}
                </span>
              </div>

              {/* Item: Diproses */}
              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="size-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Play className="size-3 fill-current ml-0.5" />
                  </span>
                  <span className="text-xs font-medium text-neutral-800">
                    Diproses
                  </span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    isEmpty ? 'text-neutral-900' : 'text-[#D97706]'
                  }`}
                >
                  {isEmpty ? 0 : 8}
                </span>
              </div>

              {/* Item: Siap diambil */}
              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="size-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <ShoppingBag className="size-3.5" />
                  </span>
                  <span className="text-xs font-medium text-neutral-800">
                    Siap diambil
                  </span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    isEmpty ? 'text-neutral-900' : 'text-[#2563EB]'
                  }`}
                >
                  {isEmpty ? 0 : 5}
                </span>
              </div>

              {/* Item: Selesai */}
              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="size-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-2xs">
                    <Check className="size-3.5 stroke-[2.5]" />
                  </span>
                  <span className="text-xs font-medium text-neutral-800">
                    Selesai
                  </span>
                </div>
                <span
                  className={`text-sm font-bold ${
                    isEmpty ? 'text-neutral-900' : 'text-[#16A34A]'
                  }`}
                >
                  {isEmpty ? 0 : 220}
                </span>
              </div>

              {/* Item: Dibatalkan */}
              <div className="flex items-center justify-between p-1.5 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="size-7 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center shrink-0 shadow-2xs">
                    <X className="size-3.5 stroke-[2.5]" />
                  </span>
                  <span className="text-xs font-medium text-neutral-800">
                    Dibatalkan
                  </span>
                </div>
                <span className="text-sm font-bold text-neutral-900">
                  {isEmpty ? 0 : 3}
                </span>
              </div>
            </div>
          </DashboardWidgetCard>

          {/* Card 2: Fitur Terbaru using Global DashboardWidgetCard */}
          <DashboardWidgetCard
            title="Fitur Terbaru"
            badge="10"
            headerHref="#"
          >
            <div className="space-y-4">
              {/* Feature 1 */}
              <div className="flex items-start gap-3 p-1 hover:bg-neutral-50/60 rounded-xl transition-colors cursor-pointer">
                <div className="size-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Package className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-orange-100 text-orange-600 shrink-0">
                        Baru
                      </span>
                      <h4 className="text-xs font-semibold text-neutral-900 truncate">
                        Pembelian stok
                      </h4>
                    </div>
                    <span className="text-neutral-400 text-xs font-medium">&rsaquo;</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5 font-normal">
                    14 Okt 2026
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed mt-1">
                    Sekarang anda dapat mencatat pembelian bahan baku langsung di NemuPOS
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-3 p-1 hover:bg-neutral-50/60 rounded-xl transition-colors cursor-pointer">
                <div className="size-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-orange-100 text-orange-600 shrink-0">
                        Baru
                      </span>
                      <h4 className="text-xs font-semibold text-neutral-900 truncate">
                        Penyesuaian stok
                      </h4>
                    </div>
                    <span className="text-neutral-400 text-xs font-medium">&rsaquo;</span>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5 font-normal">
                    14 Okt 2026
                  </p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed mt-1">
                    Perbaiki selisih stok dengan fitur penyesuaian stok.
                  </p>
                </div>
              </div>
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
