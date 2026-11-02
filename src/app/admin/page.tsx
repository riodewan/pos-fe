'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Building2,
  Store,
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { adminService, PlatformOverviewKPIs, PlatformTenantItem, PlatformApprovalItem } from '@/services/admin.service';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>Dashboard Platform Admin</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
              Production Ready
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Pantau performa seluruh tenant bisnis, approval pendaftaran, dan data master sistem POS.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
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
        <div className="p-4 rounded-2xl bg-orange-950/40 border border-orange-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-orange-200">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
              <AlertCircle className="size-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                Ada {kpis?.pending_approvals} Pengajuan Menunggu Tindakan Anda
              </p>
              <p className="text-[11px] text-orange-300/80 mt-0.5">
                Pengajuan cabang baru dan upgrade paket langganan membutuhkan review & approval.
              </p>
            </div>
          </div>
          <Link
            href="/admin/approvals"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shrink-0 self-start sm:self-center"
          >
            <span>Buka Pusat Approval</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tenants */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-neutral-800/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Total Tenant Terdaftar</span>
            <div className="size-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Building2 className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{kpis?.total_tenants ?? 0}</span>
            <span className="text-[11px] text-emerald-400 font-bold">
              ({kpis?.active_tenants ?? 0} Aktif)
            </span>
          </div>
          <p className="text-[10px] text-neutral-500">Brand bisnis yang menggunakan NemuPOS</p>
        </div>

        {/* Total Stores / Outlets */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-neutral-800/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Total Outlet Cabang</span>
            <div className="size-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Store className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{kpis?.total_stores ?? 0}</span>
            <span className="text-[11px] text-neutral-400">Toko Aktif</span>
          </div>
          <p className="text-[10px] text-neutral-500">Titik lokasi kasir yang beroperasi</p>
        </div>

        {/* Total Users across platform */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-neutral-800/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Total Pengguna Platform</span>
            <div className="size-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Users className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{kpis?.total_users ?? 0}</span>
            <span className="text-[11px] text-neutral-400">Akun</span>
          </div>
          <p className="text-[10px] text-neutral-500">Owner, Manager, Kasir, Gudang, Dapur</p>
        </div>

        {/* Total GMV (Gross Merchandise Value) */}
        <div className="p-5 rounded-2xl bg-[#141414] border border-neutral-800/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-semibold">Total GMV Transaksi</span>
            <div className="size-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 truncate">
            <span className="text-xl sm:text-2xl font-black text-white truncate">
              {formatRupiah(kpis?.total_gmv ?? 0)}
            </span>
          </div>
          <p className="text-[10px] text-neutral-500">{kpis?.total_orders ?? 0} transaksi berhasil diproses</p>
        </div>
      </div>

      {/* Two Column Section: Recent Tenants & Pending Approvals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Tenants Table (7 cols) */}
        <div className="lg:col-span-7 bg-[#141414] rounded-2xl border border-neutral-800/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h2 className="text-sm font-bold text-white">Tenant Terbaru</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Daftar brand yang baru mendaftar di platform</p>
            </div>
            <Link
              href="/admin/tenants"
              className="text-xs font-bold text-[#FF5C38] hover:underline flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="size-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800/80 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Nama Brand</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Outlet</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/40">
                {recentTenants.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-neutral-500">
                      Belum ada data tenant.
                    </td>
                  </tr>
                ) : (
                  recentTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <p className="font-bold text-white">{t.name}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">/{t.slug}</p>
                      </td>
                      <td className="py-3 px-3 text-neutral-300 font-mono text-[11px]">
                        {t.email}
                      </td>
                      <td className="py-3 px-3 text-neutral-300 font-bold">
                        {t.stores_count ?? 1} Outlet
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
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
        <div className="lg:col-span-5 bg-[#141414] rounded-2xl border border-neutral-800/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
            <div>
              <h2 className="text-sm font-bold text-white">Antrean Approval</h2>
              <p className="text-xs text-neutral-400 mt-0.5">Pengajuan terbaru dari merchant</p>
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
              <div className="py-8 text-center text-neutral-500 text-xs">
                Tidak ada antrean approval saat ini.
              </div>
            ) : (
              recentApprovals.map((app) => (
                <div
                  key={app.id}
                  className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/40 transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-1.5 py-0.5 rounded bg-neutral-800">
                        {app.type.replace('_', ' ')}
                      </span>
                      <p className="text-xs font-bold text-white mt-1.5 leading-tight">
                        {app.title}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        app.status === 'PENDING'
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                          : app.status === 'APPROVED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-neutral-400 line-clamp-2">
                    {app.description}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-500 border-t border-neutral-800/60">
                    <span>{app.tenant?.name || 'Sistem'}</span>
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
