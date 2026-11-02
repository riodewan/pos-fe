'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Store,
  Users,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  ChevronRight,
  Database,
} from 'lucide-react';
import {
  adminService,
  PlatformOverviewKPIs,
  PlatformTenantItem,
  PlatformApprovalItem,
} from '@/services/admin.service';
import { formatRupiah } from '@/utils';
import { PageLoader } from '@/components/common/PageLoader';
import { Button } from '@/components/common/Button';

export default function AdminOverviewPage() {
  const [kpis, setKpis] = useState<PlatformOverviewKPIs | null>(null);
  const [recentTenants, setRecentTenants] = useState<PlatformTenantItem[]>([]);
  const [recentApprovals, setRecentApprovals] = useState<PlatformApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await adminService.getOverview();
      if (res?.data) {
        setKpis(res.data.kpis);
        setRecentTenants(res.data.recent_tenants || []);
        setRecentApprovals(res.data.recent_approvals || []);
      }
    } catch (err) {
      console.error('Failed to load platform overview:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return <PageLoader text="Memuat dashboard platform admin..." />;
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Overview Platform Admin
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
              Sistem Aktif
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Pantau performa seluruh mitra bisnis, pengajuan verifikasi KYB, dan konfigurasi data master global NemuPOS.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/master-data">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 font-semibold px-3.5 py-2 text-xs flex items-center gap-1.5 rounded-xl shadow-2xs"
            >
              <Database className="size-3.5 text-neutral-500" />
              <span>Data Master</span>
            </Button>
          </Link>
          <Link href="/admin/tenants">
            <Button
              variant="primary"
              size="sm"
              className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-4 py-2 text-xs flex items-center gap-1.5 rounded-xl shadow-xs"
            >
              <Plus className="size-3.5 stroke-[3]" />
              <span>Tambah Tenant Baru</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Pending Approvals Alert Banner */}
      {(kpis?.pending_approvals ?? 0) > 0 && (
        <div className="p-4 rounded-2xl bg-orange-50/90 border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-[#FF5C38]/10 text-[#FF5C38] flex items-center justify-center shrink-0">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-neutral-900">
                Ada {kpis?.pending_approvals} Pengajuan Menunggu Tindakan Anda
              </p>
              <p className="text-xs text-neutral-600 mt-0.5">
                Pengajuan pendaftaran merchant (KYB) dan pembukaan cabang baru membutuhkan review & approval.
              </p>
            </div>
          </div>
          <Link
            href="/admin/approvals"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs font-bold transition-all shrink-0 self-start sm:self-center shadow-xs"
          >
            <span>Buka Pusat Approval</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Cards Grid (Clean NemuHub White Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tenants */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Total Tenant Terdaftar</span>
            <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{kpis?.total_tenants ?? 0}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
              {kpis?.active_tenants ?? 0} Aktif
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">Brand bisnis yang menggunakan NemuPOS</p>
        </div>

        {/* Total Stores / Outlets */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Total Outlet Cabang</span>
            <div className="size-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Store className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{kpis?.total_stores ?? 0}</span>
            <span className="text-xs text-neutral-500 font-medium">Toko Aktif</span>
          </div>
          <p className="text-[11px] text-neutral-400">Titik lokasi kasir yang beroperasi</p>
        </div>

        {/* Total Users across platform */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Total Pengguna Platform</span>
            <div className="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900">{kpis?.total_users ?? 0}</span>
            <span className="text-xs text-neutral-500 font-medium">Akun</span>
          </div>
          <p className="text-[11px] text-neutral-400">Owner, Manager, Kasir, Gudang, Dapur</p>
        </div>

        {/* Total GMV (Gross Merchandise Value) */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Total GMV Transaksi</span>
            <div className="size-9 rounded-xl bg-orange-50 text-[#FF5C38] flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="text-xl sm:text-2xl font-bold text-neutral-900 truncate">
              {formatRupiah(kpis?.total_gmv ?? 0)}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            {kpis?.total_orders ?? 0} transaksi berhasil diproses
          </p>
        </div>
      </div>

      {/* Two Column Section: Recent Tenants & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Tenants Table (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-5 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Mitra Bisnis Terbaru</h2>
              <p className="text-xs text-neutral-500 mt-0.5">
                Daftar brand yang baru mendaftar di platform
              </p>
            </div>
            <Link
              href="/admin/tenants"
              className="text-xs font-bold text-[#FF5C38] hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50/80 border-b border-neutral-200/80 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Nama Brand</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Outlet</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentTenants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-neutral-400">
                      Belum ada data tenant.
                    </td>
                  </tr>
                ) : (
                  recentTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-neutral-900">{t.name}</p>
                        <p className="text-[10.5px] text-neutral-400 font-mono">/{t.slug}</p>
                      </td>
                      <td className="py-3.5 px-4 text-neutral-600 font-mono text-[11px]">
                        {t.email}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-700 font-semibold">
                        {t.stores_count ?? 1} Outlet
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            t.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : t.status === 'PENDING'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Recent Approvals Center (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h2 className="text-sm font-bold text-neutral-900">Antrean Approval</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Pengajuan terbaru dari merchant</p>
            </div>
            <Link
              href="/admin/approvals"
              className="text-xs font-bold text-[#FF5C38] hover:underline flex items-center gap-1"
            >
              <span>Pusat Approval</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentApprovals.length === 0 ? (
              <div className="py-10 text-center text-neutral-400 text-xs">
                Tidak ada antrean approval saat ini.
              </div>
            ) : (
              recentApprovals.map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/50 hover:bg-neutral-50 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 px-2 py-0.5 rounded-md bg-white border border-neutral-200">
                        {app.type.replace('_', ' ')}
                      </span>
                      <p className="text-xs font-bold text-neutral-900 mt-1.5 leading-tight">
                        {app.title}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                        app.status === 'PENDING'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : app.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-600 line-clamp-2">{app.description}</p>

                  <div className="flex items-center justify-between pt-2 text-[10.5px] text-neutral-400 border-t border-neutral-200/60">
                    <span className="font-medium text-neutral-600">
                      {app.tenant?.name || 'Sistem'}
                    </span>
                    <span>
                      {new Date(app.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
