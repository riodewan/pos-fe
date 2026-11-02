'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Layers,
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  CreditCard,
  Percent,
  CheckCircle2,
  Store,
  Tag,
  DollarSign,
  Coffee,
  UtensilsCrossed,
  Cake,
  Pizza,
  Wine,
  ShoppingBag,
  QrCode,
} from 'lucide-react';
import {
  adminService,
  MasterCategoryItem,
  SubscriptionPlanItem,
} from '@/services/admin.service';
import { formatRupiah } from '@/utils';
import { Button } from '@/components/common/Button';
import { PageLoader } from '@/components/common/PageLoader';
import { useToast } from '@/context/ToastContext';

export default function AdminMasterDataPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'categories' | 'plans' | 'templates'>('categories');
  const [categories, setCategories] = useState<MasterCategoryItem[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MasterCategoryItem | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('Store');

  // Plan Edit Modal
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlanItem | null>(null);
  const [planPrice, setPlanPrice] = useState(0);
  const [planMaxOutlets, setPlanMaxOutlets] = useState(1);
  const [planMaxStaff, setPlanMaxStaff] = useState(5);

  const [isSaving, setIsSaving] = useState(false);

  const loadMasterData = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, planRes] = await Promise.allSettled([
        adminService.getMasterCategories(),
        adminService.getSubscriptionPlans(),
      ]);

      if (catRes.status === 'fulfilled' && catRes.value?.data) {
        setCategories(catRes.value.data);
      }
      if (planRes.status === 'fulfilled' && planRes.value?.data) {
        setPlans(planRes.value.data);
      }
    } catch (err) {
      console.error('Failed to load master data:', err);
      toast.error('Gagal memuat data master.');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);

  const handleOpenCategoryModal = (cat?: MasterCategoryItem) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryName(cat.name);
      setCategoryDesc(cat.description || '');
      setCategoryIcon(cat.icon || 'Store');
    } else {
      setEditingCategory(null);
      setCategoryName('');
      setCategoryDesc('');
      setCategoryIcon('Store');
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName.trim()) return;

    try {
      setIsSaving(true);
      if (editingCategory) {
        await adminService.updateMasterCategory(editingCategory.id, {
          name: categoryName.trim(),
          description: categoryDesc.trim(),
          icon: categoryIcon,
        });
        toast.success('Kategori master berhasil diperbarui!');
      } else {
        await adminService.createMasterCategory({
          name: categoryName.trim(),
          description: categoryDesc.trim(),
          icon: categoryIcon,
        });
        toast.success('Kategori master baru berhasil ditambahkan!');
      }
      setIsCategoryModalOpen(false);
      loadMasterData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan kategori.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus kategori "${name}"?`)) return;
    try {
      await adminService.deleteMasterCategory(id);
      toast.success('Kategori berhasil dihapus.');
      loadMasterData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal menghapus kategori.');
    }
  };

  const handleOpenPlanModal = (plan: SubscriptionPlanItem) => {
    setEditingPlan(plan);
    setPlanPrice(plan.price);
    setPlanMaxOutlets(plan.max_outlets);
    setPlanMaxStaff(plan.max_staff);
    setIsPlanModalOpen(true);
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      setIsSaving(true);
      await adminService.updateSubscriptionPlan(editingPlan.id, {
        price: Number(planPrice),
        max_outlets: Number(planMaxOutlets),
        max_staff: Number(planMaxStaff),
      });
      toast.success('Tarif paket langganan berhasil diperbarui!');
      setIsPlanModalOpen(false);
      loadMasterData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui paket.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <PageLoader text="Memuat data master platform..." />;
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Database className="size-6 text-[#FF5C38]" />
            <span>Data Master Platform</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Kelola data referensi global: kategori bisnis, skema bagi hasil/fee transaksi kerjasama, dan template sistem.
          </p>
        </div>

        {/* 3 Tabs Segmented Control */}
        <div className="flex items-center bg-[#141414] p-1 rounded-xl border border-neutral-800 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-[#FF5C38] text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Kategori Bisnis
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('plans')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'plans'
                ? 'bg-[#FF5C38] text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Fee Transaksi & Kerjasama
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'templates'
                ? 'bg-[#FF5C38] text-white'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
            }`}
          >
            Template Global
          </button>
        </div>
      </div>

      {/* Tab 1: Kategori Bisnis Master */}
      {activeTab === 'categories' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-400">
              Pilihan kategori bisnis yang tersedia untuk dipilih oleh merchant saat mendaftarkan brand.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleOpenCategoryModal()}
              className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs font-bold rounded-xl px-4 py-2 flex items-center gap-1.5"
            >
              <Plus className="size-3.5 stroke-[3]" />
              <span>Tambah Kategori Master</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-[#141414] border border-neutral-800/90 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white px-2.5 py-1 rounded-lg bg-neutral-800/80 border border-neutral-700/60">
                      {cat.name}
                    </span>
                    <span className="text-[10.5px] font-mono text-neutral-500">
                      /{cat.slug}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-2.5 line-clamp-2">
                    {cat.description || 'Tidak ada keterangan.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80">
                  <span className="text-[10.5px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    Aktif
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenCategoryModal(cat)}
                      className="p-1.5 rounded-lg border border-neutral-700 text-neutral-300 hover:text-white hover:bg-neutral-800 text-xs transition-colors cursor-pointer"
                      title="Edit Kategori"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 rounded-lg border border-red-900/40 text-red-400 hover:bg-red-950/20 text-xs transition-colors cursor-pointer"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Skema Fee Transaksi & Model Kerjasama */}
      {activeTab === 'plans' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-white text-sm flex items-center gap-2">
                <Percent className="size-4 text-[#FF5C38]" />
                Model Bisnis: Kemitraan Bagi Hasil & Fee Jasa Transaksi
              </p>
              <p className="text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                NemuPOS tidak memungut biaya langganan bulanan dari mitra tenant. Pendapatan diperoleh dari biaya jasa transaksi yang dibayarkan oleh customer per transaksi berhasil.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs shrink-0 self-start md:self-center">
              Kemitraan 0 Biaya Langganan
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                id: 'fee-1',
                title: 'Biaya Jasa Layanan Customer',
                chargeTo: 'Customer Checkout',
                rate: 'Rp 1.000',
                unit: '/ transaksi',
                description: 'Biaya jasa pemeliharaan aplikasi yang ditambahkan langsung ke total pembayaran customer pada struk checkout.',
                type: 'Nominal Tetap',
                icon: CreditCard,
              },
              {
                id: 'fee-2',
                title: 'MDR Transaksi QRIS & E-Wallet',
                chargeTo: 'Customer / MDR Standar',
                rate: '0.7%',
                unit: 'per transaksi QRIS',
                description: 'Biaya Merchant Discount Rate (MDR) transaksi kode QRIS nasional sesuai regulasi Bank Indonesia.',
                type: 'Persentase Nilai',
                icon: QrCode,
              },
              {
                id: 'fee-3',
                title: 'Bagi Hasil Transaksi Platform',
                chargeTo: 'Kerjasama Merchant',
                rate: '1.5%',
                unit: 'dari GMV berhasil',
                description: 'Bagi hasil kemitraan atas seluruh transaksi penjualan yang diproses secara sukses melalui sistem kasir.',
                type: 'Revenue Sharing',
                icon: Percent,
              },
            ].map((fee) => (
              <div
                key={fee.id}
                className="p-6 rounded-2xl bg-[#141414] border border-neutral-800/90 shadow-2xs space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/10 text-[#FF5C38] border border-orange-500/20">
                      {fee.type}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {fee.chargeTo}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white">{fee.title}</h3>

                  <div>
                    <span className="text-2xl font-black text-white">{fee.rate}</span>
                    <span className="text-xs text-neutral-400 font-medium"> {fee.unit}</span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {fee.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-800 text-xs flex items-center justify-between text-neutral-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                    <span className="size-1.5 rounded-full bg-emerald-400" />
                    Berlaku Otomatis
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">Platform Global</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Template Global */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-150">
          {/* Template Metode Pembayaran */}
          <div className="p-5 rounded-2xl bg-[#141414] border border-neutral-800/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CreditCard className="size-4 text-[#FF5C38]" />
                Template Metode Pembayaran Global
              </h3>
            </div>
            <p className="text-xs text-neutral-400">
              Metode pembayaran standar yang otomatis ditambahkan saat merchant membuat outlet baru:
            </p>
            <div className="space-y-2 text-xs">
              {[
                { name: 'Uang Tunai (Cash)', code: 'CASH', type: 'Offline Cash' },
                { name: 'QRIS Dinamis / Statis', code: 'QRIS', type: 'E-Wallet & Bank' },
                { name: 'Debit / Kartu Kredit EDC', code: 'EDC', type: 'Mesin EDC' },
                { name: 'Transfer Bank Langsung', code: 'TRANSFER', type: 'Virtual Account' },
              ].map((pm) => (
                <div key={pm.code} className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{pm.name}</p>
                    <p className="text-[10px] text-neutral-500 font-mono">Kode: {pm.code}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    Aktif Standar
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Template Pajak & Service Charge */}
          <div className="p-5 rounded-2xl bg-[#141414] border border-neutral-800/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Percent className="size-4 text-blue-400" />
                Template Pajak & Biaya Layanan
              </h3>
            </div>
            <p className="text-xs text-neutral-400">
              Daftar template regulasi pajak F&B yang siap dipakai di seluruh tenant:
            </p>
            <div className="space-y-2 text-xs">
              {[
                { name: 'PB1 / Pajak Restoran (10%)', rate: '10%', desc: 'Pajak daerah restoran standar' },
                { name: 'PPN Pemerintah (11%)', rate: '11%', desc: 'Pajak Pertambahan Nilai nasional' },
                { name: 'Service Charge Cafe (5%)', rate: '5%', desc: 'Biaya layanan operasional meja' },
              ].map((tax) => (
                <div key={tax.name} className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white">{tax.name}</p>
                    <p className="text-[10px] text-neutral-500">{tax.desc}</p>
                  </div>
                  <span className="text-xs font-black text-white px-2.5 py-1 rounded bg-neutral-800 font-mono">
                    {tax.rate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tambah/Edit Kategori Master */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-[#171717] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-800 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white">
                {editingCategory ? 'Edit Kategori Master' : 'Tambah Kategori Master'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gelato & Ice Cream"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full bg-[#1F1F1F] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#FF5C38]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan kategori bisnis..."
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                  className="w-full bg-[#1F1F1F] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#FF5C38] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="border-neutral-700 text-neutral-300 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSaving || !categoryName.trim()}
                  className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs px-4"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Kategori'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Subscription Plan */}
      {isPlanModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-[#171717] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-neutral-800 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white">
                Ubah Tarif: {editingPlan.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1">
                  Tarif Bulanan (Rp)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={planPrice}
                  onChange={(e) => setPlanPrice(Number(e.target.value))}
                  className="w-full bg-[#1F1F1F] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-[#FF5C38]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Maks. Outlet Cabang
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={planMaxOutlets}
                    onChange={(e) => setPlanMaxOutlets(Number(e.target.value))}
                    className="w-full bg-[#1F1F1F] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-[#FF5C38]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-300 mb-1">
                    Maks. Akun Staff
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={planMaxStaff}
                    onChange={(e) => setPlanMaxStaff(Number(e.target.value))}
                    className="w-full bg-[#1F1F1F] border border-neutral-700 rounded-xl px-3.5 py-2 text-xs font-mono focus:outline-none focus:border-[#FF5C38]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="border-neutral-700 text-neutral-300 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSaving}
                  className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs px-4"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
