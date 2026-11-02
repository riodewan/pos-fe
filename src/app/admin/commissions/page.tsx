'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Percent,
  TrendingUp,
  Building2,
  Store,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  X,
  ArrowRight,
  Wallet,
  Receipt,
  ShieldCheck,
  Calculator,
} from 'lucide-react';
import {
  adminService,
  PlatformOverviewKPIs,
  PlatformTenantItem,
} from '@/services/admin.service';
import { formatRupiah } from '@/utils';
import { Button } from '@/components/common/Button';
import { Pagination, DEFAULT_PAGE_SIZE_OPTIONS } from '@/components/common';
import { PageLoader } from '@/components/common/PageLoader';
import { useToast } from '@/context/ToastContext';

export default function AdminCommissionsPage() {
  const { toast } = useToast();
  const [kpis, setKpis] = useState<PlatformOverviewKPIs | null>(null);
  const [tenants, setTenants] = useState<PlatformTenantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_OPTIONS[0]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Edit Fee & Tax Modal state
  const [editingTenant, setEditingTenant] = useState<PlatformTenantItem | null>(null);
  const [feeForm, setFeeForm] = useState({
    platform_fee_percentage: 0,
    tax_percentage: 10,
  });
  const [simAmount, setSimAmount] = useState<number>(100000);
  const [isSaving, setIsSaving] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, tenantsRes] = await Promise.all([
        adminService.getOverview(),
        adminService.getTenants({
          search: search || undefined,
          status: statusFilter || undefined,
          page: currentPage,
          per_page: pageSize,
        }),
      ]);

      if (overviewRes?.data?.kpis) {
        setKpis(overviewRes.data.kpis);
      }

      if (tenantsRes?.data) {
        setTenants(tenantsRes.data.data || []);
        setTotalPages(tenantsRes.data.last_page || 1);
        setTotalItems(tenantsRes.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load commission & tax data:', err);
      toast.error('Gagal memuat data komisi & pajak mitra.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, currentPage, pageSize, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenEditModal = (tenant: PlatformTenantItem) => {
    setEditingTenant(tenant);
    setFeeForm({
      platform_fee_percentage: Number(tenant.platform_fee_percentage ?? 0),
      tax_percentage: Number(tenant.tax_percentage ?? 10),
    });
  };

  const handleSaveFees = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;

    try {
      setIsSaving(true);
      await adminService.updateTenant(editingTenant.id, {
        platform_fee_percentage: Number(feeForm.platform_fee_percentage),
        tax_percentage: Number(feeForm.tax_percentage),
      });
      toast.success(`Tarif komisi platform & pajak untuk ${editingTenant.name} berhasil disimpan!`);
      setEditingTenant(null);
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan pengaturan komisi & pajak.');
    } finally {
      setIsSaving(false);
    }
  };

  // Simulation calculation inside modal
  const simBase = Math.max(0, Number(simAmount) || 0);
  const simTax = Math.round((simBase * Number(feeForm.tax_percentage || 0)) / 100);
  const simPlatformFee = Math.round((simBase * Number(feeForm.platform_fee_percentage || 0)) / 100);
  const simCustomerTotal = simBase + simTax + simPlatformFee;
  const simMerchantNet = simBase + simTax;

  if (loading && !kpis && tenants.length === 0) {
    return <PageLoader text="Memuat manajemen komisi, pajak & pendapatan platform..." />;
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Percent className="size-6 text-[#FF5C38]" />
              <span>Komisi Platform, Pajak & Pembagian Revenue</span>
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-[#FF5C38] font-bold">
              Akses Eksklusif Internal Admin
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Atur persentase komisi layanan platform per mitra dan pantau pendapatan biaya layanan yang masuk ke NemuPOS vs hak bersih mitra (termasuk pajak mereka).
          </p>
        </div>
      </div>

      {/* 4 Financial Split KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pendapatan Komisi Platform (Hak Kita) */}
        <div className="p-5 rounded-2xl bg-orange-50/80 border border-orange-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#FF5C38]">
            <span className="text-xs font-bold">Pendapatan Biaya Platform (Kita)</span>
            <div className="size-9 rounded-xl bg-[#FF5C38] text-white flex items-center justify-center shadow-2xs">
              <Wallet className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#FF5C38] font-mono">
              {formatRupiah(kpis?.total_platform_revenue ?? 0)}
            </span>
          </div>
          <p className="text-[11px] text-orange-900/75 font-medium">
            Uang biaya layanan yang masuk ke platform kita
          </p>
        </div>

        {/* Card 2: Hak Bersih Mitra (Penjualan + Pajak) */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Total Hak Bersih Mitra (+Pajak)</span>
            <div className="size-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Building2 className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-700 font-mono">
              {formatRupiah(kpis?.total_merchant_revenue ?? 0)}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Penjualan bersih + pajak yang masuk ke mitra
          </p>
        </div>

        {/* Card 3: Total Pajak Mitra */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Akumulasi Pajak Toko (Milik Mitra)</span>
            <div className="size-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Receipt className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 font-mono">
              {formatRupiah(kpis?.total_merchant_tax ?? 0)}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Tetap diteruskan ke saldo masing-masing mitra
          </p>
        </div>

        {/* Card 4: Total GMV Transaksi Customer */}
        <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-medium">Total GMV Pembayaran Customer</span>
            <div className="size-9 rounded-xl bg-neutral-100 text-neutral-700 flex items-center justify-center">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-neutral-900 font-mono">
              {formatRupiah(kpis?.total_gmv ?? 0)}
            </span>
          </div>
          <p className="text-[11px] text-neutral-400">
            Dari {kpis?.total_orders ?? 0} pesanan selesai di seluruh outlet
          </p>
        </div>
      </div>

      {/* Alur Distribusi Dana Transaksi Banner */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="size-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="size-5 text-[#FF5C38]" />
          </div>
          <div>
            <p className="text-xs font-bold text-neutral-900">
              Skema Distribusi Dana Pembayaran Customer
            </p>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Setiap pembayaran customer otomatis dipisah: <strong>Penjualan Bersih + Pajak (%)</strong> masuk ke saldo Mitra, sedangkan <strong>Biaya Layanan Platform (%)</strong> langsung masuk ke pendapatan Internal Admin.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            (Subtotal - Diskon) + Pajak % &rarr; Masuk Mitra
          </span>
          <span className="text-neutral-300">+</span>
          <span className="px-3 py-1.5 rounded-xl bg-orange-50 text-[#FF5C38] border border-orange-200">
            Biaya Layanan % &rarr; Masuk Kita (Platform)
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="size-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama mitra bisnis untuk mengatur komisi & pajak..."
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF5C38] transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { value: 'ACTIVE', label: 'Mitra Aktif' },
            { value: '', label: 'Semua Mitra' },
            { value: 'PENDING', label: 'Pending KYB' },
            { value: 'SUSPENDED', label: 'Suspended' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatusFilter(tab.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-[#FF5C38] text-white shadow-2xs'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Per-Mitra Commission, Tax & Revenue Split Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">
              Daftar Tarif Komisi, Pajak & Rekonsiliasi per Mitra
            </h2>
            <p className="text-[11px] text-neutral-500 mt-0.5">
              Klik tombol <strong>Atur Komisi &amp; Pajak</strong> pada baris mitra untuk mengubah persentase potongan platform atau pajak mitra tersebut.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-neutral-500 text-xs">
            Memuat data komisi &amp; pajak mitra...
          </div>
        ) : tenants.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-xs space-y-2">
            <Building2 className="size-10 text-neutral-300 mx-auto" />
            <p className="font-bold text-neutral-700">Tidak ada mitra ditemukan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-200/80 bg-neutral-50/80 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Mitra Bisnis (Tenant)</th>
                  <th className="py-3.5 px-4 text-center">Komisi Platform (Kita)</th>
                  <th className="py-3.5 px-4 text-center">Pajak Toko (Mitra)</th>
                  <th className="py-3.5 px-4 text-right">Total GMV Customer</th>
                  <th className="py-3.5 px-4 text-right">Hak Bersih Mitra (+Pajak)</th>
                  <th className="py-3.5 px-4 text-right">Pendapatan Komisi Kita</th>
                  <th className="py-3.5 px-4 text-right">Pengaturan Tarif</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-xl bg-orange-50 text-[#FF5C38] border border-orange-100 flex items-center justify-center font-bold text-xs shrink-0">
                          {t.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 text-xs">{t.name}</p>
                          <div className="flex items-center gap-2 text-[10.5px] text-neutral-400 mt-0.5">
                            <span className="inline-flex items-center gap-1">
                              <Store className="size-3 text-neutral-400" />
                              {t.stores_count ?? 1} Outlet
                            </span>
                            <span>&bull;</span>
                            <span>{t.total_orders_completed ?? 0} Transaksi</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-[#FF5C38] border border-orange-200 font-extrabold text-xs font-mono">
                        {Number(t.platform_fee_percentage ?? 0)}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs font-mono">
                        {Number(t.tax_percentage ?? 10)}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-neutral-800">
                      {formatRupiah(t.total_gmv ?? 0)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <p className="font-mono font-bold text-emerald-700">
                        {formatRupiah(t.merchant_net_revenue ?? 0)}
                      </p>
                      <p className="text-[10px] text-neutral-400 font-mono">
                        Termasuk Pajak: {formatRupiah(t.tax_collected ?? 0)}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-orange-50/80 text-[#FF5C38] font-mono font-extrabold text-xs">
                        +{formatRupiah(t.platform_revenue ?? 0)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(t)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-[#FF5C38] text-white text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                      >
                        <SlidersHorizontal className="size-3.5" />
                        <span>Atur Komisi &amp; Pajak</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-neutral-100 bg-neutral-50/40">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Modal: Atur Komisi Platform & Pajak Mitra + Kalkulator Simulasi */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-xl border border-neutral-200 text-neutral-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Percent className="size-5 text-[#FF5C38]" />
                  <span>Atur Komisi &amp; Pajak Mitra</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Mitra: <strong className="text-neutral-900">{editingTenant.name}</strong> ({editingTenant.stores_count ?? 1} Outlet)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTenant(null)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFees} className="space-y-4">
              {/* Input Komisi Platform (Hak Kita) */}
              <div className="p-4 rounded-xl bg-orange-50/60 border border-orange-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-900">
                    1. Biaya Layanan / Komisi Platform (%)
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF5C38] text-white">
                    Masuk ke Kita (Platform)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={feeForm.platform_fee_percentage}
                    onChange={(e) =>
                      setFeeForm({
                        ...feeForm,
                        platform_fee_percentage: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full h-10 px-3.5 rounded-xl bg-white border border-orange-300 text-sm font-extrabold text-neutral-900 font-mono focus:outline-none focus:border-[#FF5C38]"
                  />
                  <span className="text-sm font-extrabold text-[#FF5C38]">%</span>
                </div>
                <p className="text-[11px] text-neutral-600">
                  Persentase ini ditambahkan ke tagihan customer dan uangnya langsung dipisahkan menjadi pendapatan platform NemuPOS (tidak bisa diubah oleh mitra).
                </p>
              </div>

              {/* Input Pajak Toko (Hak Mitra) */}
              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-900">
                    2. Pajak Transaksi Toko / PB1 (%)
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                    Tetap Masuk ke Mitra
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    required
                    value={feeForm.tax_percentage}
                    onChange={(e) =>
                      setFeeForm({
                        ...feeForm,
                        tax_percentage: Math.max(0, Number(e.target.value)),
                      })
                    }
                    className="w-full h-10 px-3.5 rounded-xl bg-white border border-emerald-300 text-sm font-extrabold text-neutral-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                  <span className="text-sm font-extrabold text-emerald-700">%</span>
                </div>
                <p className="text-[11px] text-neutral-600">
                  Pajak ditambahkan ke tagihan customer dan uangnya tetap diteruskan ke saldo penerimaan mitra.
                </p>
              </div>

              {/* Live Calculator Preview */}
              <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <Calculator className="size-4 text-[#FF5C38]" />
                    Simulasi Tagihan &amp; Pembagian Uang
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-neutral-500">Subtotal:</span>
                    <input
                      type="number"
                      step="1000"
                      min="0"
                      value={simAmount}
                      onChange={(e) => setSimAmount(Math.max(0, Number(e.target.value)))}
                      className="w-28 h-7 px-2 rounded-lg bg-white border border-neutral-200 text-xs font-mono font-bold text-right"
                    />
                  </div>
                </div>

                <div className="divide-y divide-neutral-200/70 text-xs">
                  <div className="flex justify-between py-1.5">
                    <span className="text-neutral-600">Subtotal Pesanan Customer</span>
                    <span className="font-mono font-semibold">{formatRupiah(simBase)}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-emerald-700">
                      + Pajak ({feeForm.tax_percentage}%) &rarr; <strong>Masuk Mitra</strong>
                    </span>
                    <span className="font-mono font-semibold text-emerald-700">
                      +{formatRupiah(simTax)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-[#FF5C38]">
                      + Biaya Platform ({feeForm.platform_fee_percentage}%) &rarr; <strong>Masuk Kita</strong>
                    </span>
                    <span className="font-mono font-semibold text-[#FF5C38]">
                      +{formatRupiah(simPlatformFee)}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 font-bold text-neutral-900">
                    <span>Total Dibayar Customer</span>
                    <span className="font-mono">{formatRupiah(simCustomerTotal)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200/80">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                      Diterima Mitra (Subtotal + Pajak)
                    </span>
                    <span className="text-xs font-extrabold text-emerald-800 font-mono">
                      {formatRupiah(simMerchantNet)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-orange-50 border border-orange-200/80">
                    <span className="text-[10px] font-bold text-[#FF5C38] uppercase block">
                      Diterima Kita (Biaya Platform)
                    </span>
                    <span className="text-xs font-extrabold text-[#FF5C38] font-mono">
                      {formatRupiah(simPlatformFee)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingTenant(null)}
                  className="text-xs text-neutral-600"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSaving}
                  className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold text-xs px-5 py-2 rounded-xl"
                  leftIcon={<CheckCircle2 className="size-4" />}
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Tarif Mitra'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

