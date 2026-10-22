'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  TrendingUp,
  CreditCard,
  ShoppingBag,
  DollarSign,
  ChevronDown,
  Calendar,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Package,
  Layers,
  Sparkle,
  BarChart3,
  ShoppingCart,
  Coins,
  Clock,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { reportsService } from '@/services';
import { DashboardReport } from '@/types';
import { formatRupiah, getISODateOnly, getPastDateISO } from '@/utils';
import { FirstLoginModal } from '@/components/dashboard/FirstLoginModal';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, activeTenant, isLoading } = useAuth();
  const { activeStore } = useStore();

  const [report, setReport] = useState<DashboardReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);

  const roleName = user?.is_internal
    ? 'SUPER_ADMIN'
    : activeTenant?.role?.toUpperCase();
  const isOwnerOrManager =
    roleName === 'SUPER_ADMIN' ||
    roleName === 'OWNER' ||
    roleName === 'MANAGER';

  // Role-based redirect from overview: Cashier goes to POS, Inventory goes to Stock
  useEffect(() => {
    if (isLoading) return;
    if (roleName === 'CASHIER') {
      router.replace('/dashboard/pos');
    } else if (roleName === 'INVENTORY') {
      router.replace('/dashboard/inventory');
    }
  }, [roleName, isLoading, router]);

  // Check if first login / onboarding should be displayed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const onboarded = localStorage.getItem('nemu_tenant_onboarded');
      const forceOnboarding = searchParams?.get('onboarding') === 'true';
      // Automatically open onboarding for new tenants or if forced
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

  const kpis = report?.kpis || {
    gross_sales: 0,
    total_discounts: 0,
    net_sales: 0,
    tax: 0,
    service_charge: 0,
    total_revenue: 0,
    total_orders: 0,
    average_order_value: 0,
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-[1440px] mx-auto">
      {/* Top Header Row matching Figma: Greeting, Outlet dropdown, Date Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Selamat pagi,
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Ringkasan performa outlet anda hari ini.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Outlet Selector Dropdown Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-neutral-200 shadow-xs text-xs font-semibold text-neutral-800 cursor-pointer hover:bg-neutral-50 transition-colors">
            <span>{activeStore?.name || 'Kopi Mantap (Main Outlet)'}</span>
            <ChevronDown className="size-3.5 text-neutral-400" />
          </div>

          {/* Date Picker Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-neutral-200 shadow-xs text-xs font-semibold text-neutral-800 cursor-pointer hover:bg-neutral-50 transition-colors">
            <span>Today (14/10/2026)</span>
            <Calendar className="size-3.5 text-neutral-400" />
          </div>

          {/* Trigger to re-open first login modal anytime */}
          <button
            onClick={() => setShowFirstLoginModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#FF5C38] border border-orange-200 text-xs font-semibold transition-colors"
            title="Buka kembali alur Profil Outlet First Login"
          >
            <Sparkles className="size-3.5" />
            <span className="hidden md:inline">Lengkapi Profil</span>
          </button>
        </div>
      </div>

      {/* Row 1: 4 Metric KPI Cards matching Figma */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Penjualan */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <BarChart3 className="size-3.5" />
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                Total Penjualan
              </span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mt-2">
              {formatRupiah(kpis.gross_sales)}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-1">
              <span>% 0</span>
              <span>Dari kemarin</span>
            </div>
          </div>
          <div className="text-emerald-500 shrink-0">
            <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
              <path
                d="M2 18L16 14L30 18L46 6"
                stroke="#10B981"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        {/* KPI 2: Total Transaksi */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center">
              <CreditCard className="size-3.5" />
            </div>
            <span className="text-xs text-neutral-500 font-medium">
              Total Transaksi
            </span>
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mt-2">
            {kpis.total_orders}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-1">
            <span>&nbsp;</span>
          </div>
        </div>

        {/* KPI 3: Average Order Value (AOV) */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShoppingCart className="size-3.5" />
            </div>
            <span className="text-xs text-neutral-500 font-medium truncate">
              Average Order Value (AOV)
            </span>
          </div>
          <h3 className="text-xl font-bold text-neutral-900 mt-2">
            {formatRupiah(kpis.average_order_value)}
          </h3>
          <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-1">
            <span>&nbsp;</span>
          </div>
        </div>

        {/* KPI 4: Profit Estimasi */}
        <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="size-6 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center">
                <Coins className="size-3.5" />
              </div>
              <span className="text-xs text-neutral-500 font-medium">
                Profit Estimasi
              </span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mt-2">
              {formatRupiah(kpis.net_sales)}
            </h3>
            <div className="flex items-center gap-1 text-[11px] text-neutral-400 mt-1">
              <span>% 0</span>
              <span>Dari kemarin</span>
            </div>
          </div>
          <div className="text-amber-500 shrink-0">
            <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
              <path
                d="M2 18L16 16L30 19L46 12"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 2 Columns & Right 1 Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Section (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card: Penjualan & Channel */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Chart: Penjualan */}
              <div className="md:col-span-8 border-b md:border-b-0 md:border-r border-neutral-100 pb-4 md:pb-0 md:pr-4">
                <h3 className="text-sm font-bold text-neutral-900 mb-4">
                  Penjualan
                </h3>
                <div className="h-44 flex flex-col justify-between text-[10.5px] text-neutral-400">
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-right">10.000.000</span>
                    <div className="flex-1 border-b border-dashed border-neutral-200" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-right">8.000.000</span>
                    <div className="flex-1 border-b border-dashed border-neutral-200" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-right">4.000.000</span>
                    <div className="flex-1 border-b border-dashed border-neutral-200" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-right">2.000.000</span>
                    <div className="flex-1 border-b border-dashed border-neutral-200" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-16 text-right">0</span>
                    <div className="flex-1 border-b border-neutral-200" />
                  </div>
                  <div className="flex justify-between pl-18 pr-2 pt-1 text-[10px]">
                    <span>8 Okt</span>
                    <span>9 Okt</span>
                    <span>10 Okt</span>
                    <span>11 Okt</span>
                    <span>12 Okt</span>
                    <span>13 Okt</span>
                    <span>14 Okt</span>
                  </div>
                </div>
              </div>

              {/* Chart: Channel Donut */}
              <div className="md:col-span-4 flex flex-col justify-between">
                <h3 className="text-sm font-bold text-neutral-900 mb-2">
                  Distribusi Transaksi per Channel
                </h3>
                <div className="flex flex-col items-center justify-center my-auto">
                  <div className="size-24 rounded-full border-8 border-neutral-200/70 flex items-center justify-center text-xs text-neutral-400 font-semibold">
                    0%
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span className="text-neutral-600">QR Order <strong>0%</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-teal-500" />
                      <span className="text-neutral-600">Delivery <strong>0%</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row: Produk Terlaris Hari Ini & Stok */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card: Produk Terlaris Hari Ini */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between min-h-[220px]">
              <div>
                <h3 className="text-sm font-bold text-neutral-900">
                  Produk Terlaris Hari Ini
                </h3>
              </div>
              <div className="flex flex-col items-center justify-center my-4 text-center">
                <p className="text-xs font-bold text-neutral-700 tracking-wide uppercase">
                  BELUM ADA PRODUK TERJUAL
                </p>
                <p className="text-[11.5px] text-neutral-400 mt-1 max-w-[220px]">
                  Produk terlaris akan muncul setelah ada penjualan.
                </p>
                <Link
                  href="/dashboard/catalog"
                  className="mt-3 px-4 py-1.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/60 text-blue-600 text-xs font-semibold transition-colors"
                >
                  Lihat Produk
                </Link>
              </div>
              <div />
            </div>

            {/* Card: Stok */}
            <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between min-h-[220px]">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-neutral-900">Stok</h3>
                <Link
                  href="/dashboard/inventory"
                  className="text-xs text-neutral-400 hover:text-neutral-700 font-medium flex items-center gap-0.5"
                >
                  Lihat inventori &rsaquo;
                </Link>
              </div>
              <div className="flex flex-col items-center justify-center my-4 text-center">
                <p className="text-xs font-bold text-neutral-700 tracking-wide uppercase">
                  BELUM ADA DATA STOK
                </p>
                <p className="text-[11.5px] text-neutral-400 mt-1 max-w-[220px]">
                  Tambahkan stok untuk memantau persediaan outlet.
                </p>
                <Link
                  href="/dashboard/inventory"
                  className="mt-3 px-4 py-1.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100/60 text-blue-600 text-xs font-semibold transition-colors"
                >
                  Kelola Stok
                </Link>
              </div>
              <div />
            </div>
          </div>
        </div>

        {/* Right Section (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Card: Pesanan hari ini */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900">
                Pesanan hari ini
              </h3>
              <ChevronRight className="size-4 text-neutral-400" />
            </div>

            <div className="space-y-3">
              {/* Item: Baru */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="size-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center">
                    <Sparkles className="size-3.5" />
                  </span>
                  <span className="text-xs font-medium text-neutral-800">
                    Baru
                  </span>
                </div>
                <span className="text-sm font-bold text-neutral-900">0</span>
              </div>

              {/* Item: Diproses */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="size-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock className="size-3.5" />
                  </span>
                  <span className="text-xs font-medium text-neutral-800">
                    Diproses
                  </span>
                </div>
                <span className="text-sm font-bold text-neutral-900">0</span>
              </div>

              {/* Item: Siap diambil */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="size-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <ShoppingBag className="size-3.5" />
                  </span>
                  <span className="text-xs font-medium text-neutral-800">
                    Siap diambil
                  </span>
                </div>
                <span className="text-sm font-bold text-neutral-900">0</span>
              </div>

              {/* Item: Selesai */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="size-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Check className="size-3.5" />
                  </span>
                  <span className="text-xs font-medium text-neutral-800">
                    Selesai
                  </span>
                </div>
                <span className="text-sm font-bold text-neutral-900">0</span>
              </div>

              {/* Item: Dibatalkan */}
              <div className="flex items-center justify-between p-2 rounded-xl hover:bg-neutral-50 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="size-7 rounded-lg bg-neutral-100 text-neutral-500 flex items-center justify-center">
                    <X className="size-3.5" />
                  </span>
                  <span className="text-xs font-medium text-neutral-800">
                    Dibatalkan
                  </span>
                </div>
                <span className="text-sm font-bold text-neutral-900">0</span>
              </div>
            </div>
          </div>

          {/* Card: Fitur Terbaru */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-neutral-900">
                Fitur Terbaru
              </h3>
              <ChevronRight className="size-4 text-neutral-400" />
            </div>

            <div className="space-y-4">
              {/* Feature 1 */}
              <div className="flex items-start gap-3 p-1">
                <div className="size-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Package className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-orange-100 text-orange-600">
                      Baru
                    </span>
                    <h4 className="text-xs font-semibold text-neutral-900 truncate">
                      Pembelian stok
                    </h4>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5">14 Okt 2026</p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed mt-1">
                    Sekarang anda dapat mencatat pembelian bahan baku langsung di NemuPOS
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-3 p-1">
                <div className="size-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Layers className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-orange-100 text-orange-600">
                      Baru
                    </span>
                    <h4 className="text-xs font-semibold text-neutral-900 truncate">
                      Penyesuaian stok
                    </h4>
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-0.5">14 Okt 2026</p>
                  <p className="text-[11px] text-neutral-500 leading-relaxed mt-1">
                    Perbaiki selisih stok dengan fitur penyesuaian stok.
                  </p>
                </div>
              </div>
            </div>
          </div>
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
