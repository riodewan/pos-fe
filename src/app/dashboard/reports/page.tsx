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
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { reportsService } from '@/services';
import { DashboardReport, InventoryUsageReport, CashierAuditReport } from '@/types';
import { formatRupiah, getISODateOnly, getPastDateISO } from '@/utils';
import { PageHeader, StatCard, EmptyState, LoadingScreen } from '@/components/common';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

type ReportTab = 'summary' | 'products' | 'cogs' | 'cashiers';

export default function ReportsPage() {
  const router = useRouter();
  const { user, activeTenant, isLoading } = useAuth();
  const { activeStore } = useStore();

  const roleName = user?.is_internal ? 'SUPER_ADMIN' : activeTenant?.role?.toUpperCase();
  const isOwnerOrManager = roleName === 'SUPER_ADMIN' || roleName === 'OWNER' || roleName === 'MANAGER';

  useEffect(() => {
    if (isLoading) return;
    if (!isOwnerOrManager) {
      if (roleName === 'CASHIER') {
        router.replace('/dashboard/pos');
      } else if (roleName === 'INVENTORY') {
        router.replace('/dashboard/inventory');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isOwnerOrManager, roleName, isLoading, router]);

  const [activeTab, setActiveTab] = useState<ReportTab>('summary');
  const [loading, setLoading] = useState(true);

  // Date Filter Range
  const [startDate, setStartDate] = useState(getPastDateISO(30));
  const [endDate, setEndDate] = useState(getISODateOnly());

  // Data states
  const [dashboardData, setDashboardData] = useState<DashboardReport | null>(null);
  const [cogsData, setCogsData] = useState<InventoryUsageReport | null>(null);
  const [cashierData, setCashierData] = useState<CashierAuditReport | null>(null);

  const loadReports = useCallback(async () => {
    if (isLoading || !activeStore || !isOwnerOrManager) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [dashRes, cogsRes, cashierRes] = await Promise.all([
        reportsService.getDashboardOverview(startDate, endDate),
        reportsService.getInventoryUsage(startDate, endDate),
        reportsService.getCashierAudit(startDate, endDate),
      ]);

      setDashboardData(dashRes.data || null);
      setCogsData(cogsRes.data || null);
      setCashierData(cashierRes.data || null);
    } catch (err) {
      console.error('Failed to load reports:', err);
    } finally {
      setLoading(false);
    }
  }, [activeStore, startDate, endDate, isOwnerOrManager, isLoading]);

  useEffect(() => {
    if (!isLoading && isOwnerOrManager && activeStore) {
      loadReports();
    }
  }, [loadReports, isLoading, isOwnerOrManager, activeStore]);

  if (isLoading || !isOwnerOrManager) {
    return <LoadingScreen message="Memuat dan memvalidasi akses laporan..." />;
  }

  const setQuickRange = (days: number) => {
    const end = getISODateOnly();
    const start = getPastDateISO(days);
    setStartDate(start);
    setEndDate(end);
  };

  const kpis = dashboardData?.kpis || {
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
      {/* Page Header */}
      <PageHeader
        title="Laporan Penjualan & Finansial"
        description="Analisis performa pendapatan toko, marjin laba kotor (HPP), dan audit fisik kasir laci kas"
      >
        <Button variant="outline" size="sm" onClick={loadReports} disabled={loading}>
          <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </PageHeader>

      {/* Date Filter Toolbar */}
      <Card className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="xs"
            onClick={() => setQuickRange(0)}
            className="text-xs"
          >
            Hari Ini
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => setQuickRange(7)}
            className="text-xs"
          >
            7 Hari Terakhir
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => setQuickRange(30)}
            className="text-xs"
          >
            30 Hari Terakhir
          </Button>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground font-medium">Periode:</span>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-8 text-xs w-36"
          />
          <span className="text-muted-foreground">s/d</span>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-8 text-xs w-36"
          />
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border pb-3 overflow-x-auto">
        {[
          { id: 'summary', label: 'Ringkasan Penjualan', icon: DollarSign },
          { id: 'products', label: 'Produk Terlaris', icon: Coffee },
          { id: 'cogs', label: 'HPP & Laba Kotor', icon: TrendingUp },
          { id: 'cashiers', label: 'Audit Kas & Laci Kasir', icon: Wallet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ReportTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isCurrent
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingScreen message="Menghitung laporan finansial..." />
      ) : (
        <>
          {/* TAB 1: SALES SUMMARY */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Revenue"
                  value={formatRupiah(kpis.total_revenue)}
                  subtitle="Termasuk Pajak & Biaya Layanan"
                  icon={DollarSign}
                  iconClassName="bg-emerald-500/10 text-emerald-600"
                />
                <StatCard
                  title="Penjualan Bersih (Net Sales)"
                  value={formatRupiah(kpis.net_sales)}
                  subtitle={`Diskon Total: ${formatRupiah(kpis.total_discounts)}`}
                  icon={TrendingUp}
                  iconClassName="bg-blue-500/10 text-blue-600"
                />
                <StatCard
                  title="Total Transaksi"
                  value={kpis.total_orders.toLocaleString('id-ID')}
                  subtitle="Struk pesanan selesai"
                  icon={Receipt}
                  iconClassName="bg-amber-500/10 text-amber-600"
                />
                <StatCard
                  title="Average Order Value (AOV)"
                  value={formatRupiah(kpis.average_order_value)}
                  subtitle="Rata-rata nominal per struk"
                  icon={Percent}
                  iconClassName="bg-purple-500/10 text-purple-600"
                />
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Rincian Keuangan Penjualan</CardTitle>
                    <CardDescription>Akumulasi perhitungan pos pendapatan toko</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Pendapatan Kotor (Gross Sales):</span>
                      <span className="font-bold text-foreground">{formatRupiah(kpis.gross_sales)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Potongan Diskon:</span>
                      <span className="font-bold text-destructive">-{formatRupiah(kpis.total_discounts)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/50 font-semibold">
                      <span>Penjualan Bersih (Net Sales):</span>
                      <span>{formatRupiah(kpis.net_sales)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Pajak Pertambahan Nilai (PPN 11%):</span>
                      <span className="font-bold text-foreground">{formatRupiah(kpis.tax)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Service Charge:</span>
                      <span className="font-bold text-foreground">{formatRupiah(kpis.service_charge)}</span>
                    </div>
                    <div className="flex justify-between py-2 text-sm font-bold text-amber-700 dark:text-amber-400">
                      <span>Total Penerimaan (Revenue):</span>
                      <span>{formatRupiah(kpis.total_revenue)}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Distribusi Kanal Pembayaran</CardTitle>
                    <CardDescription>Penerimaan berdasarkan metode bayar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dashboardData?.payment_methods && dashboardData.payment_methods.length > 0 ? (
                      <div className="space-y-3">
                        {dashboardData.payment_methods.map((pm) => (
                          <div
                            key={pm.method}
                            className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-muted/20"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="font-mono text-xs">
                                {pm.method}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {pm.transactions_count} transaksi ({pm.percentage}%)
                              </span>
                            </div>
                            <span className="font-bold text-sm text-foreground">
                              {formatRupiah(pm.total_amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-6">
                        Belum ada data pembayaran pada periode ini.
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 2: TOP PRODUCTS */}
          {activeTab === 'products' && (
            <Card className="overflow-hidden">
              {dashboardData?.top_products && dashboardData.top_products.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Peringkat</TableHead>
                      <TableHead>Nama Produk</TableHead>
                      <TableHead>Kuantitas Terjual</TableHead>
                      <TableHead className="text-right">Total Nilai Penjualan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.top_products.map((item, idx) => (
                      <TableRow key={item.product_id}>
                        <TableCell className="font-bold text-muted-foreground font-mono">
                          #{idx + 1}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {item.product_name}
                        </TableCell>
                        <TableCell className="font-bold">
                          {item.total_quantity} porsi
                        </TableCell>
                        <TableCell className="font-mono font-bold text-right text-amber-700 dark:text-amber-400">
                          {formatRupiah(item.total_sales)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <EmptyState
                  icon={Coffee}
                  title="Belum ada data produk terjual"
                  description="Data peringkat produk akan terisi secara otomatis seiring transaksi POS kasir diselesaikan."
                />
              )}
            </Card>
          )}

          {/* TAB 3: COGS & GROSS PROFIT */}
          {activeTab === 'cogs' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard
                  title="Penjualan Kotor (Gross Sales)"
                  value={formatRupiah(cogsData?.gross_sales || 0)}
                  subtitle="Total nilai harga jual produk"
                  icon={DollarSign}
                  iconClassName="bg-blue-500/10 text-blue-600"
                />
                <StatCard
                  title="Total HPP Riil (COGS)"
                  value={formatRupiah(cogsData?.total_cogs || 0)}
                  subtitle="Biaya bahan baku riil terpakai"
                  icon={Package}
                  iconClassName="bg-amber-500/10 text-amber-600"
                />
                <StatCard
                  title="Laba Kotor (Gross Profit)"
                  value={formatRupiah(cogsData?.gross_profit || 0)}
                  subtitle={`Margin: ${cogsData?.gross_profit_margin_pct || 0}%`}
                  icon={TrendingUp}
                  iconClassName="bg-emerald-500/10 text-emerald-600"
                />
              </div>

              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Rincian Konsumsi Bahan Baku (Ingredient Usage)</CardTitle>
                  <CardDescription>
                    Kuantitas bahan baku yang telah terpakai dan total biaya HPP-nya
                  </CardDescription>
                </CardHeader>
                {cogsData?.items && cogsData.items.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nama Bahan Baku</TableHead>
                        <TableHead>Total Pemakaian</TableHead>
                        <TableHead className="text-right">Total Biaya HPP</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cogsData.items.map((item) => (
                        <TableRow key={item.ingredient_id}>
                          <TableCell className="font-semibold text-foreground">
                            {item.ingredient_name}
                          </TableCell>
                          <TableCell className="font-mono font-bold">
                            {Number(item.total_quantity_used).toLocaleString('id-ID')} {item.unit_code}
                          </TableCell>
                          <TableCell className="font-mono font-bold text-right text-foreground">
                            {formatRupiah(item.total_cost)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyState
                    icon={Package}
                    title="Belum ada konsumsi bahan baku"
                    description="Resep bahan baku akan terhitung saat pesanan produk kasir diselesaikan."
                  />
                )}
              </Card>
            </div>
          )}

          {/* TAB 4: CASH DRAWER & CASHIER AUDIT */}
          {activeTab === 'cashiers' && (
            <div className="space-y-6">
              {cashierData?.summary && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <StatCard
                    title="Uang Kas Fisik Wajib Ada (Cash Drawer)"
                    value={formatRupiah(cashierData.summary.cash_drawer_expected)}
                    subtitle="Penerimaan tunai dikurangi kembalian"
                    icon={Wallet}
                    iconClassName="bg-emerald-500/10 text-emerald-600"
                  />
                  <StatCard
                    title="Penjualan Non-Tunai (QRIS/EDC)"
                    value={formatRupiah(cashierData.summary.non_cash_sales)}
                    subtitle="Kanal elektronik & transfer"
                    icon={Receipt}
                    iconClassName="bg-blue-500/10 text-blue-600"
                  />
                  <StatCard
                    title="Total Transaksi Kasir"
                    value={cashierData.summary.total_transactions}
                    subtitle="Jumlah transaksi terlayani"
                    icon={Users}
                    iconClassName="bg-amber-500/10 text-amber-600"
                  />
                </div>
              )}

              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Riwayat Transaksi Penjualan Kasir</CardTitle>
                  <CardDescription>Audit pesanan per nomor transaksi struk</CardDescription>
                </CardHeader>
                {cashierData?.transactions && cashierData.transactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nomor Pesanan</TableHead>
                        <TableHead>Pelanggan</TableHead>
                        <TableHead>Kanal</TableHead>
                        <TableHead>Total Tagihan</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cashierData.transactions.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell className="font-mono font-bold text-muted-foreground">
                            #{t.order_number}
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            {t.customer_name || 'Tamu Kasir'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {t.source}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-amber-700 dark:text-amber-400">
                            {formatRupiah(t.total_amount)}
                          </TableCell>
                          <TableCell>
                            <Badge variant={t.status === 'COMPLETED' ? 'success' : 'warning'}>
                              {t.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <EmptyState
                    icon={Wallet}
                    title="Belum ada riwayat transaksi pada periode ini"
                    description="Audit laci kas kasir akan otomatis ter-update secara berkala."
                  />
                )}
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
