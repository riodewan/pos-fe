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
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import api, { ApiError } from '@/lib/api';
import { DashboardReport, ApiResponse } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function DashboardOverviewPage() {
  const { activeTenant } = useAuth();
  const { activeStore } = useStore();

  const [report, setReport] = useState<DashboardReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [daysFilter, setDaysFilter] = useState<'today' | '7days' | '30days'>('30days');

  const fetchDashboardData = useCallback(async () => {
    if (!activeStore) return;
    setLoading(true);

    const now = new Date();
    const end_date = now.toISOString().split('T')[0];

    let start_date = end_date;
    if (daysFilter === '7days') {
      const past = new Date();
      past.setDate(past.getDate() - 7);
      start_date = past.toISOString().split('T')[0];
    } else if (daysFilter === '30days') {
      const past = new Date();
      past.setDate(past.getDate() - 30);
      start_date = past.toISOString().split('T')[0];
    }

    try {
      const res = await api.get<ApiResponse<DashboardReport>>('/reports/dashboard', {
        params: { start_date, end_date },
      });
      setReport(res.data);
    } catch (err) {
      console.error('Failed to load dashboard report:', err);
    } finally {
      setLoading(false);
    }
  }, [activeStore, daysFilter]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Format IDR Currency
  const formatCurrency = (val: number | string | undefined | null) => {
    const num = Number(val || 0);
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

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
      {/* Page Title & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Ringkasan Outlet
          </h1>
          <p className="text-sm text-muted-foreground">
            Laporan operasional dan kinerja penjualan {activeStore ? activeStore.name : 'Outlet'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Date Filters */}
          <div className="flex items-center rounded-lg border border-border bg-card p-1 text-xs">
            <button
              onClick={() => setDaysFilter('today')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                daysFilter === 'today'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setDaysFilter('7days')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                daysFilter === '7days'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setDaysFilter('30days')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                daysFilter === '30days'
                  ? 'bg-amber-600 text-white shadow-xs'
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
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pendapatan Kotor
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <DollarSign className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(kpis.gross_sales)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-medium flex items-center">
                <TrendingUp className="size-3 mr-0.5" /> Total Penjualan
              </span>
            </p>
          </CardContent>
        </Card>

        {/* Net Sales */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Pendapatan Bersih
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(kpis.net_sales)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Diskon: {formatCurrency(kpis.total_discounts)}
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Total Pesanan
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <ShoppingBag className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {kpis.total_orders.toLocaleString('id-ID')}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Pesanan selesai terverifikasi
            </p>
          </CardContent>
        </Card>

        {/* Average Order Value (AOV) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Rata-rata Order (AOV)
            </CardTitle>
            <div className="size-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
              <CreditCard className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {formatCurrency(kpis.average_order_value)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Rata-rata nominal per struk
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/dashboard/pos">
          <Card className="hover:border-amber-500/40 hover:bg-muted/30 transition-all cursor-pointer p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shrink-0">
              <Coffee className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Buka Kasir POS</p>
              <p className="text-[10px] text-muted-foreground">Input pesanan baru</p>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/tables">
          <Card className="hover:border-amber-500/40 hover:bg-muted/30 transition-all cursor-pointer p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
              <QrCode className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Meja & QR Code</p>
              <p className="text-[10px] text-muted-foreground">Status meja & QR self-order</p>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/inventory">
          <Card className="hover:border-amber-500/40 hover:bg-muted/30 transition-all cursor-pointer p-4 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <PackagePlus className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground">Stok Bahan Baku</p>
              <p className="text-[10px] text-muted-foreground">Pembelian & Opname</p>
            </div>
          </Card>
        </Link>

        <Link href="/dashboard/recipes">
          <Card className="hover:border-amber-500/40 hover:bg-muted/30 transition-all cursor-pointer p-4 flex items-center gap-3">
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
            <Link href="/dashboard/catalog" className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1">
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
                      <p className="text-sm font-bold text-foreground">{formatCurrency(item.total_sales)}</p>
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
            <Link href="/dashboard/reports" className="text-xs text-amber-600 font-semibold hover:underline flex items-center gap-1">
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
                        {formatCurrency(method.total_amount)}
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
