'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  CreditCard,
  ShoppingBag,
  DollarSign,
  Coffee,
  ArrowUpRight,
  RefreshCw,
  QrCode,
  PackagePlus,
  UtensilsCrossed,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { reportsService } from '@/services';
import { DashboardReport } from '@/types';
import { formatRupiah, getISODateOnly, getPastDateISO } from '@/utils';
import { ROUTES } from '@/constants';
import { PageHeader, StatCard, LoadingScreen } from '@/components/common';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DashboardOverviewPage() {
  const router = useRouter();
  const { user, activeTenant, isLoading } = useAuth();
  const { activeStore } = useStore();

  const [report, setReport] = useState<DashboardReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState<'today' | '7days' | '30days'>('30days');

  const roleName = user?.is_internal ? 'SUPER_ADMIN' : activeTenant?.role?.toUpperCase();
  const isOwnerOrManager = roleName === 'SUPER_ADMIN' || roleName === 'OWNER' || roleName === 'MANAGER';

  // Role-based redirect from overview: Cashier goes to POS, Inventory goes to Stock
  useEffect(() => {
    if (isLoading) return;
    if (roleName === 'CASHIER') {
      router.replace(ROUTES.DASHBOARD.POS);
    } else if (roleName === 'INVENTORY') {
      router.replace(ROUTES.DASHBOARD.INVENTORY);
    }
  }, [roleName, isLoading, router]);

  const fetchDashboardData = useCallback(async () => {
    if (isLoading || !activeStore || !isOwnerOrManager) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const end_date = getISODateOnly();
    let start_date = end_date;
    if (daysFilter === '7days') {
      start_date = getPastDateISO(7);
    } else if (daysFilter === '30days') {
      start_date = getPastDateISO(30);
    }

    try {
      const res = await reportsService.getDashboardOverview(start_date, end_date);
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load dashboard report:', err);
    } finally {
      setLoading(false);
    }
  }, [activeStore, daysFilter, isOwnerOrManager, isLoading]);

  useEffect(() => {
    if (!isLoading && isOwnerOrManager && activeStore) {
      fetchDashboardData();
    }
  }, [fetchDashboardData, isLoading, isOwnerOrManager, activeStore]);

  if (isLoading || loading) {
    return <LoadingScreen message="Memuat ringkasan performa outlet..." />;
  }

  if (!isOwnerOrManager) {
    return <LoadingScreen message="Mengarahkan ke ruang kerja operasional Anda..." />;
  }

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
    <div className="space-y-6">
      {/* Page Header with Filter Bar */}
      <PageHeader
        title="Ringkasan Outlet"
        description={`Laporan operasional dan kinerja penjualan ${activeStore ? activeStore.name : 'Outlet'}`}
      >
        <div className="flex items-center rounded-lg border border-border bg-card p-1 text-xs">
          <button
            onClick={() => setDaysFilter('today')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              daysFilter === 'today'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setDaysFilter('7days')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              daysFilter === '7days'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            7 Hari
          </button>
          <button
            onClick={() => setDaysFilter('30days')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              daysFilter === '30days'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            30 Hari
          </button>
        </div>

        <Button
          variant="outline"
          size="icon-sm"
          onClick={fetchDashboardData}
          title="Refresh Data"
          disabled={loading}
        >
          <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </PageHeader>

      {/* KPI Cards Grid using StatCard common component */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pendapatan Kotor"
          value={formatRupiah(kpis.gross_sales)}
          subtitle="Total Penjualan Kotor"
          icon={DollarSign}
          iconClassName="bg-emerald-500/10 text-emerald-600"
        />

        <StatCard
          title="Pendapatan Bersih"
          value={formatRupiah(kpis.net_sales)}
          subtitle={`Diskon: ${formatRupiah(kpis.total_discounts)}`}
          icon={TrendingUp}
          iconClassName="bg-blue-500/10 text-blue-600"
        />

        <StatCard
          title="Total Pesanan"
          value={kpis.total_orders.toLocaleString('id-ID')}
          subtitle="Pesanan selesai terverifikasi"
          icon={ShoppingBag}
          iconClassName="bg-indigo-500/10 text-indigo-600"
        />

        <StatCard
          title="Rata-rata Order (AOV)"
          value={formatRupiah(kpis.average_order_value)}
          subtitle="Rata-rata per struk"
          icon={CreditCard}
          iconClassName="bg-purple-500/10 text-purple-600"
        />
      </div>

      {/* Quick Access Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href={ROUTES.DASHBOARD.POS}>
          <Card className="hover:border-indigo-500/40 hover:bg-muted/30 transition-all cursor-pointer p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-indigo-600/30">
              <Coffee className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Buka Kasir POS</p>
              <p className="text-[10px] text-muted-foreground">Input pesanan baru</p>
            </div>
          </Card>
        </Link>

        <Link href={ROUTES.DASHBOARD.TABLES}>
          <Card className="hover:border-indigo-500/40 hover:bg-muted/30 transition-all cursor-pointer p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <QrCode className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Meja & QR Code</p>
              <p className="text-[10px] text-muted-foreground">Status meja & QR self-order</p>
            </div>
          </Card>
        </Link>

        <Link href={ROUTES.DASHBOARD.INVENTORY}>
          <Card className="hover:border-indigo-500/40 hover:bg-muted/30 transition-all cursor-pointer p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <PackagePlus className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Stok Bahan Baku</p>
              <p className="text-[10px] text-muted-foreground">Pembelian & Opname</p>
            </div>
          </Card>
        </Link>

        <Link href={ROUTES.DASHBOARD.RECIPES}>
          <Card className="hover:border-indigo-500/40 hover:bg-muted/30 transition-all cursor-pointer p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0">
              <UtensilsCrossed className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Resep & HPP</p>
              <p className="text-[10px] text-muted-foreground">Deduksi stok otomatis</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Two Column Section: Top Products & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Top Produk Terlaris</CardTitle>
              <CardDescription>Produk dengan penjualan terbanyak</CardDescription>
            </div>
            <Link
              href={ROUTES.DASHBOARD.CATALOG}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              Lihat Semua <ArrowUpRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {report?.top_products && report.top_products.length > 0 ? (
              <div className="space-y-3">
                {report.top_products.map((item, idx) => (
                  <div
                    key={item.product_id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="size-6 rounded-md bg-muted text-muted-foreground text-xs font-bold flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">{item.total_quantity} porsi terjual</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">{formatRupiah(item.total_sales)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Belum ada transaksi penjualan produk pada periode ini.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods Breakdown */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle>Distribusi Metode Pembayaran</CardTitle>
              <CardDescription>Penerimaan kas berdasarkan kanal bayar</CardDescription>
            </div>
            <Link
              href={ROUTES.DASHBOARD.REPORTS}
              className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
            >
              Detail Laporan <ArrowUpRight className="size-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {report?.payment_methods && report.payment_methods.length > 0 ? (
              <div className="space-y-3">
                {report.payment_methods.map((method) => (
                  <div
                    key={method.method}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          method.method === 'CASH'
                            ? 'success'
                            : method.method === 'QRIS'
                            ? 'info'
                            : 'secondary'
                        }
                        className="font-mono"
                      >
                        {method.method}
                      </Badge>
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">
                          {method.transactions_count} transaksi ({method.percentage}%)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        {formatRupiah(method.total_amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                Belum ada data pembayaran pada periode ini.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
