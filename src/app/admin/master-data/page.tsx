'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Plus,
  Trash2,
  Edit2,
  X,
  CreditCard,
  Percent,
  Wifi,
  Building2,
  Landmark,
  Scale,
  Power,
} from 'lucide-react';
import {
  adminService,
  MasterCategoryItem,
  SubscriptionPlanItem,
  PlatformMasterItem,
  MasterItemGroup,
  GlobalUnitItem,
} from '@/services/admin.service';
import { formatRupiah } from '@/utils';
import { Button } from '@/components/common/Button';
import { PageLoader } from '@/components/common/PageLoader';
import { useToast } from '@/context/ToastContext';

type MasterTab = 'categories' | 'facilities' | 'business_banks' | 'units' | 'templates' | 'plans';

const GROUP_LABELS: Record<MasterItemGroup, string> = {
  FACILITY: 'Fasilitas Outlet',
  BUSINESS_TYPE: 'Jenis Usaha / Badan Hukum',
  BANK: 'Bank Pencairan Dana',
  PAYMENT_METHOD: 'Template Metode Pembayaran',
  TAX_FEE: 'Template Pajak & Biaya Layanan',
};

export default function AdminMasterDataPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<MasterTab>('categories');
  const [categories, setCategories] = useState<MasterCategoryItem[]>([]);
  const [masterItems, setMasterItems] = useState<PlatformMasterItem[]>([]);
  const [units, setUnits] = useState<GlobalUnitItem[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Category Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MasterCategoryItem | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDesc, setCategoryDesc] = useState('');
  const [categoryIcon, setCategoryIcon] = useState('Store');

  // Master Item Modal (FACILITY, BUSINESS_TYPE, BANK, PAYMENT_METHOD, TAX_FEE)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PlatformMasterItem | null>(null);
  const [itemGroup, setItemGroup] = useState<MasterItemGroup>('FACILITY');
  const [itemName, setItemName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [itemIcon, setItemIcon] = useState('Sparkles');
  const [itemDesc, setItemDesc] = useState('');
  const [itemSortOrder, setItemSortOrder] = useState(0);
  // Extra metadata fields for PAYMENT_METHOD & TAX_FEE
  const [metaCategory, setMetaCategory] = useState('QRIS');
  const [metaFeePercent, setMetaFeePercent] = useState(0);
  const [metaTaxType, setMetaTaxType] = useState<'TAX' | 'FEE'>('TAX');
  const [metaValueType, setMetaValueType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [metaValue, setMetaValue] = useState(10);

  // Global Unit Modal
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<GlobalUnitItem | null>(null);
  const [unitName, setUnitName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [unitType, setUnitType] = useState<'WEIGHT' | 'VOLUME' | 'COUNT'>('WEIGHT');

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
      const [catRes, itemsRes, unitsRes, planRes] = await Promise.allSettled([
        adminService.getMasterCategories(),
        adminService.getMasterItems(),
        adminService.getMasterUnits(),
        adminService.getSubscriptionPlans(),
      ]);

      if (catRes.status === 'fulfilled' && catRes.value?.data) {
        setCategories(catRes.value.data);
      }
      if (itemsRes.status === 'fulfilled' && itemsRes.value?.data) {
        setMasterItems(itemsRes.value.data);
      }
      if (unitsRes.status === 'fulfilled' && unitsRes.value?.data) {
        setUnits(unitsRes.value.data);
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

  // Helpers to filter master items by group
  const getItemsByGroup = (group: MasterItemGroup) =>
    masterItems.filter((item) => item.group === group);

  // --- Category Handlers ---
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
        toast.success('Kategori bisnis berhasil diperbarui!');
      } else {
        await adminService.createMasterCategory({
          name: categoryName.trim(),
          description: categoryDesc.trim(),
          icon: categoryIcon,
        });
        toast.success('Kategori bisnis baru berhasil ditambahkan!');
      }
      setIsCategoryModalOpen(false);
      loadMasterData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan kategori.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleCategory = async (cat: MasterCategoryItem) => {
    try {
      await adminService.updateMasterCategory(cat.id, {
        is_active: !cat.is_active,
      });
      toast.success(`Status kategori "${cat.name}" diperbarui.`);
      loadMasterData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status kategori.');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Yakin ingin menghapus kategori "${name}"?`)) return;
    try {
      await adminService.deleteMasterCategory(id);
      toast.success('Kategori berhasil dihapus.');
      loadMasterData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus kategori.');
    }
  };

  // --- Master Item Handlers ---
  const handleOpenItemModal = (group: MasterItemGroup, item?: PlatformMasterItem) => {
    setItemGroup(group);
    if (item) {
      setEditingItem(item);
      setItemName(item.name);
      setItemCode(item.code || '');
      setItemIcon(item.icon || 'Sparkles');
      setItemDesc(item.description || '');
      setItemSortOrder(item.sort_order || 0);
      const meta = item.metadata || {};
      setMetaCategory(meta.category || 'QRIS');
      setMetaFeePercent(Number(meta.fee_percent ?? 0));
      setMetaTaxType(meta.type === 'FEE' ? 'FEE' : 'TAX');
      setMetaValueType(meta.value_type === 'FIXED' ? 'FIXED' : 'PERCENTAGE');
      setMetaValue(Number(meta.value ?? 10));
    } else {
      setEditingItem(null);
      setItemName('');
      setItemCode('');
      setItemIcon(
        group === 'FACILITY'
          ? 'Wifi'
          : group === 'BANK'
          ? 'Landmark'
          : group === 'BUSINESS_TYPE'
          ? 'Building2'
          : group === 'PAYMENT_METHOD'
          ? 'CreditCard'
          : 'Percent'
      );
      setItemDesc('');
      setItemSortOrder(getItemsByGroup(group).length + 1);
      setMetaCategory('QRIS');
      setMetaFeePercent(0);
      setMetaTaxType('TAX');
      setMetaValueType('PERCENTAGE');
      setMetaValue(10);
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    let metadata: Record<string, any> | undefined = undefined;
    if (itemGroup === 'PAYMENT_METHOD') {
      metadata = {
        category: metaCategory,
        fee_percent: Number(metaFeePercent) || 0,
      };
    } else if (itemGroup === 'TAX_FEE') {
      metadata = {
        type: metaTaxType,
        value_type: metaValueType,
        value: Number(metaValue) || 0,
      };
    }

    try {
      setIsSaving(true);
      if (editingItem) {
        await adminService.updateMasterItem(editingItem.id, {
          name: itemName.trim(),
          code: itemCode.trim() || undefined,
          icon: itemIcon.trim() || 'Sparkles',
          description: itemDesc.trim() || undefined,
          sort_order: Number(itemSortOrder) || 0,
          metadata,
        });
        toast.success(`${GROUP_LABELS[itemGroup]} berhasil diperbarui!`);
      } else {
        await adminService.createMasterItem({
          group: itemGroup,
          name: itemName.trim(),
          code: itemCode.trim() || undefined,
          icon: itemIcon.trim() || 'Sparkles',
          description: itemDesc.trim() || undefined,
          sort_order: Number(itemSortOrder) || 0,
          metadata,
          is_active: true,
        });
        toast.success(`${GROUP_LABELS[itemGroup]} baru berhasil ditambahkan!`);
      }
      setIsItemModalOpen(false);
      loadMasterData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan data master.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleItem = async (item: PlatformMasterItem) => {
    try {
      await adminService.toggleMasterItem(item.id);
      toast.success(`Status "${item.name}" berhasil diperbarui.`);
      loadMasterData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengubah status item.');
    }
  };

  const handleDeleteItem = async (item: PlatformMasterItem) => {
    if (!window.confirm(`Yakin ingin menghapus "${item.name}" dari ${GROUP_LABELS[item.group]}?`))
      return;
    try {
      await adminService.deleteMasterItem(item.id);
      toast.success(`"${item.name}" berhasil dihapus.`);
      loadMasterData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menghapus item master.');
    }
  };

  // --- Global Unit Handlers ---
  const handleOpenUnitModal = (unit?: GlobalUnitItem) => {
    if (unit) {
      setEditingUnit(unit);
      setUnitName(unit.name);
      setUnitCode(unit.code);
      setUnitType(unit.type);
    } else {
      setEditingUnit(null);
      setUnitName('');
      setUnitCode('');
      setUnitType('WEIGHT');
    }
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim() || !unitCode.trim()) return;

    try {
      setIsSaving(true);
      if (editingUnit) {
        await adminService.updateMasterUnit(editingUnit.id, {
          name: unitName.trim(),
          code: unitCode.trim(),
          type: unitType,
        });
        toast.success('Satuan ukur global berhasil diperbarui!');
      } else {
        await adminService.createMasterUnit({
          name: unitName.trim(),
          code: unitCode.trim(),
          type: unitType,
        });
        toast.success('Satuan ukur global berhasil ditambahkan!');
      }
      setIsUnitModalOpen(false);
      loadMasterData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal menyimpan satuan ukur.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUnit = async (unit: GlobalUnitItem) => {
    if (!window.confirm(`Yakin ingin menghapus satuan "${unit.name} (${unit.code})"?`)) return;
    try {
      await adminService.deleteMasterUnit(unit.id);
      toast.success('Satuan ukur berhasil dihapus.');
      loadMasterData();
    } catch (err: any) {
      toast.error(
        err.message || 'Gagal menghapus satuan ukur (mungkin sedang digunakan oleh bahan baku).'
      );
    }
  };

  // --- Plan Handlers ---
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
      toast.success('Skema kemitraan berhasil diperbarui!');
      setIsPlanModalOpen(false);
      loadMasterData();
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui skema.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <PageLoader text="Memuat data master global platform..." />;
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Database className="size-6 text-[#FF5C38]" />
            <span>Data Master Global Platform</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Seluruh data referensi global yang tampil di halaman user/merchant dikelola terpusat oleh Internal Admin di sini.
          </p>
        </div>

        {/* 6 Tabs Segmented Control */}
        <div className="flex flex-wrap items-center bg-white p-1.5 rounded-2xl border border-neutral-200/80 shadow-2xs gap-1">
          {[
            { id: 'categories', label: 'Kategori Bisnis', count: categories.length },
            { id: 'facilities', label: 'Fasilitas Outlet', count: getItemsByGroup('FACILITY').length },
            {
              id: 'business_banks',
              label: 'Badan Usaha & Bank',
              count: getItemsByGroup('BUSINESS_TYPE').length + getItemsByGroup('BANK').length,
            },
            { id: 'units', label: 'Satuan Ukur', count: units.length },
            {
              id: 'templates',
              label: 'Pembayaran & Pajak',
              count: getItemsByGroup('PAYMENT_METHOD').length + getItemsByGroup('TAX_FEE').length,
            },
            { id: 'plans', label: 'Skema Kemitraan', count: plans.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as MasterTab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-[#FF5C38] text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-black/20 text-white'
                    : 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab 1: Kategori Bisnis Master */}
      {activeTab === 'categories' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <p className="text-xs text-neutral-600">
              Pilihan kategori bisnis yang tampil saat user registrasi KYB, mengatur Profil Outlet, dan menambah Cabang Baru.
            </p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleOpenCategoryModal()}
              className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs font-bold rounded-xl px-4 py-2 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="size-3.5 stroke-[3]" />
              <span>Tambah Kategori Bisnis</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-neutral-900 px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200/80">
                      {cat.name}
                    </span>
                    <span className="text-[10.5px] font-mono text-neutral-400">/{cat.slug}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2.5 line-clamp-2">
                    {cat.description || 'Tidak ada keterangan.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className={`text-[10.5px] font-bold flex items-center gap-1.5 cursor-pointer ${
                      cat.is_active ? 'text-emerald-600' : 'text-neutral-400'
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        cat.is_active ? 'bg-emerald-500' : 'bg-neutral-400'
                      }`}
                    />
                    {cat.is_active ? 'Aktif (Klik untuk Nonaktifkan)' : 'Nonaktif'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenCategoryModal(cat)}
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 text-xs transition-colors cursor-pointer"
                      title="Edit Kategori"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs transition-colors cursor-pointer"
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

      {/* Tab 2: Fasilitas Outlet Global (FACILITY) */}
      {activeTab === 'facilities' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Wifi className="size-4 text-[#FF5C38]" />
                Master Fasilitas Outlet Global
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Daftar fasilitas ini ditampilkan pada First Login Modal dan pengaturan Operasional & Fasilitas Outlet milik merchant.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleOpenItemModal('FACILITY')}
              className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs font-bold rounded-xl px-4 py-2 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="size-3.5 stroke-[3]" />
              <span>Tambah Fasilitas Outlet</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {getItemsByGroup('FACILITY').map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-neutral-900 px-2.5 py-1 rounded-lg bg-neutral-100 border border-neutral-200/80">
                      {item.name}
                    </span>
                    <span className="text-[10.5px] font-mono text-neutral-400">
                      {item.code || '-'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2.5 line-clamp-2">
                    {item.description || 'Fasilitas standar outlet.'}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <button
                    type="button"
                    onClick={() => handleToggleItem(item)}
                    className={`text-[10.5px] font-bold flex items-center gap-1 cursor-pointer ${
                      item.is_active ? 'text-emerald-600' : 'text-neutral-400'
                    }`}
                  >
                    <Power className="size-3" />
                    {item.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenItemModal('FACILITY', item)}
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 text-xs transition-colors cursor-pointer"
                      title="Edit Fasilitas"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item)}
                      className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs transition-colors cursor-pointer"
                      title="Hapus Fasilitas"
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

      {/* Tab 3: Jenis Usaha (BUSINESS_TYPE) & Bank Pencairan (BANK) */}
      {activeTab === 'business_banks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          {/* Jenis Usaha / Badan Hukum */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Building2 className="size-4 text-[#FF5C38]" />
                  Jenis Usaha / Badan Hukum
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Ditampilkan pada form verifikasi bisnis (KYB) merchant.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleOpenItemModal('BUSINESS_TYPE')}
                className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs font-bold rounded-xl px-3 py-1.5 flex items-center gap-1"
              >
                <Plus className="size-3.5" />
                <span>Tambah</span>
              </Button>
            </div>

            <div className="space-y-2.5">
              {getItemsByGroup('BUSINESS_TYPE').map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-200/80 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-neutral-900">{item.name}</p>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-neutral-600">
                        {item.code}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-neutral-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer ${
                        item.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                      }`}
                    >
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenItemModal('BUSINESS_TYPE', item)}
                      className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 cursor-pointer"
                    >
                      <Edit2 className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item)}
                      className="p-1.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bank Pencairan Dana */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Landmark className="size-4 text-blue-600" />
                  Master Bank Pencairan Dana (Settlement)
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Pilihan bank tujuan penarikan dana (disbursement) di halaman Keuangan merchant.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleOpenItemModal('BANK')}
                className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs font-bold rounded-xl px-3 py-1.5 flex items-center gap-1"
              >
                <Plus className="size-3.5" />
                <span>Tambah Bank</span>
              </Button>
            </div>

            <div className="space-y-2.5">
              {getItemsByGroup('BANK').map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-200/80 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-neutral-900">{item.name}</p>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-neutral-200 text-neutral-600">
                        {item.code}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-neutral-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleItem(item)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer ${
                        item.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                      }`}
                    >
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenItemModal('BANK', item)}
                      className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 cursor-pointer"
                    >
                      <Edit2 className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item)}
                      className="p-1.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Satuan Ukur Global (units) */}
      {activeTab === 'units' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-2xs">
            <div>
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <Scale className="size-4 text-[#FF5C38]" />
                Master Satuan Ukur Global (Bahan Baku & Resep)
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Satuan ukur standar yang tersedia untuk seluruh merchant pada modul Inventaris, Bahan Baku, dan Resep Menu.
              </p>
            </div>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => handleOpenUnitModal()}
              className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs font-bold rounded-xl px-4 py-2 flex items-center gap-1.5 shrink-0"
            >
              <Plus className="size-3.5 stroke-[3]" />
              <span>Tambah Satuan Ukur</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {units.map((u) => (
              <div
                key={u.id}
                className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-neutral-900">{u.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-orange-50 text-[#FF5C38] border border-orange-200 font-bold">
                      {u.code}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Tipe:{' '}
                    {u.type === 'WEIGHT'
                      ? 'Berat (Weight)'
                      : u.type === 'VOLUME'
                      ? 'Volume (Cair)'
                      : 'Jumlah (Count)'}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenUnitModal(u)}
                    className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 cursor-pointer"
                    title="Edit Satuan"
                  >
                    <Edit2 className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteUnit(u)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                    title="Hapus Satuan"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Template Pembayaran & Pajak Global */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          {/* Template Metode Pembayaran */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <CreditCard className="size-4 text-[#FF5C38]" />
                  Template Metode Pembayaran Global
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Digunakan sebagai referensi/template metode pembayaran pada pengaturan outlet merchant.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleOpenItemModal('PAYMENT_METHOD')}
                className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs font-bold rounded-xl px-3 py-1.5 flex items-center gap-1"
              >
                <Plus className="size-3.5" />
                <span>Tambah</span>
              </Button>
            </div>

            <div className="space-y-2.5 text-xs">
              {getItemsByGroup('PAYMENT_METHOD').map((pm) => (
                <div
                  key={pm.id}
                  className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-200/80 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-neutral-900">{pm.name}</p>
                      <span className="text-[10px] text-neutral-600 font-mono px-1.5 py-0.5 rounded bg-white border border-neutral-200">
                        {pm.code}
                      </span>
                      {pm.metadata?.fee_percent !== undefined && (
                        <span className="text-[10px] font-bold text-[#FF5C38] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                          MDR {pm.metadata.fee_percent}%
                        </span>
                      )}
                    </div>
                    {pm.description && (
                      <p className="text-[11px] text-neutral-500 mt-0.5">{pm.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleItem(pm)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer ${
                        pm.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                      }`}
                    >
                      {pm.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenItemModal('PAYMENT_METHOD', pm)}
                      className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 cursor-pointer"
                    >
                      <Edit2 className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(pm)}
                      className="p-1.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Template Pajak & Biaya Layanan */}
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div>
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                  <Percent className="size-4 text-blue-600" />
                  Template Pajak & Biaya Layanan Global
                </h3>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Pilihan preset regulasi pajak & service charge yang bisa dipilih merchant.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleOpenItemModal('TAX_FEE')}
                className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs font-bold rounded-xl px-3 py-1.5 flex items-center gap-1"
              >
                <Plus className="size-3.5" />
                <span>Tambah</span>
              </Button>
            </div>

            <div className="space-y-2.5 text-xs">
              {getItemsByGroup('TAX_FEE').map((tax) => (
                <div
                  key={tax.id}
                  className="p-3.5 rounded-xl bg-neutral-50/70 border border-neutral-200/80 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-neutral-900">{tax.name}</p>
                      <span className="text-[10px] font-bold text-neutral-800 px-2 py-0.5 rounded bg-white border border-neutral-200 font-mono">
                        {tax.metadata?.value_type === 'FIXED'
                          ? formatRupiah(Number(tax.metadata?.value || 0))
                          : `${tax.metadata?.value ?? 0}%`}
                      </span>
                    </div>
                    {tax.description && (
                      <p className="text-[11px] text-neutral-500 mt-0.5">{tax.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleItem(tax)}
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer ${
                        tax.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-neutral-100 text-neutral-500 border-neutral-200'
                      }`}
                    >
                      {tax.is_active ? 'Aktif' : 'Nonaktif'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenItemModal('TAX_FEE', tax)}
                      className="p-1.5 rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 cursor-pointer"
                    >
                      <Edit2 className="size-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(tax)}
                      className="p-1.5 rounded-lg border border-red-200 bg-white text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Skema Fee Transaksi & Model Kerjasama */}
      {activeTab === 'plans' && (
        <div className="space-y-4 animate-in fade-in duration-150">
          <div className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-neutral-900 text-sm flex items-center gap-2">
                <Percent className="size-4 text-[#FF5C38]" />
                Model Bisnis: Kemitraan Bagi Hasil & Fee Jasa Transaksi
              </p>
              <p className="text-neutral-500 mt-1 max-w-2xl leading-relaxed">
                NemuPOS tidak memungut biaya langganan bulanan dari mitra tenant. Pendapatan diperoleh dari biaya jasa transaksi yang dibayarkan oleh customer per transaksi berhasil.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs shrink-0 self-start md:self-center">
              Kemitraan 0 Biaya Langganan
            </span>
          </div>

          {plans.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-neutral-200/80 text-center text-xs text-neutral-500">
              Belum ada skema komisi yang ditambahkan.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-50 text-[#FF5C38] border border-orange-200">
                        Skema Kemitraan
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {(plan as any).slug ? `/${(plan as any).slug}` : plan.code || plan.id}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-neutral-900">{plan.name}</h3>

                    <div>
                      <span className="text-2xl font-bold text-neutral-900">
                        {formatRupiah(plan.price)}
                      </span>
                      <span className="text-xs text-neutral-500 font-medium">
                        {' '}
                        / transaksi atau skema
                      </span>
                    </div>

                    <div className="text-xs text-neutral-500 space-y-1">
                      <p>
                        Kuota Outlet:{' '}
                        <strong className="text-neutral-800">{plan.max_outlets} Cabang</strong>
                      </p>
                      <p>
                        Kuota Staff:{' '}
                        <strong className="text-neutral-800">{plan.max_staff} Akun</strong>
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 text-xs flex items-center justify-between text-neutral-500">
                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-[11px]">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      {plan.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleOpenPlanModal(plan)}
                      className="px-3 py-1.5 rounded-xl border border-neutral-200 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-50 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Edit2 className="size-3" />
                      <span>Atur Skema</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Tambah/Edit Kategori Bisnis */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-neutral-200 text-neutral-900">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">
                {editingCategory ? 'Edit Kategori Bisnis' : 'Tambah Kategori Bisnis'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nama Kategori *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Gelato & Ice Cream"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Deskripsi Singkat
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan kategori bisnis..."
                  value={categoryDesc}
                  onChange={(e) => setCategoryDesc(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs"
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

      {/* Modal: Tambah/Edit Item Master Global (FACILITY, BUSINESS_TYPE, BANK, PAYMENT_METHOD, TAX_FEE) */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-neutral-200 text-neutral-900">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">
                {editingItem
                  ? `Edit ${GROUP_LABELS[itemGroup]}`
                  : `Tambah ${GROUP_LABELS[itemGroup]}`}
              </h3>
              <button
                type="button"
                onClick={() => setIsItemModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nama {GROUP_LABELS[itemGroup]} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    itemGroup === 'FACILITY'
                      ? 'Contoh: Mushola / Live Music'
                      : itemGroup === 'BANK'
                      ? 'Contoh: Bank Permata'
                      : itemGroup === 'BUSINESS_TYPE'
                      ? 'Contoh: Yayasan'
                      : 'Nama item master...'
                  }
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Kode Sistem
                  </label>
                  <input
                    type="text"
                    placeholder="Otomatis jika kosong"
                    value={itemCode}
                    onChange={(e) => setItemCode(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Urutan Tampil
                  </label>
                  <input
                    type="number"
                    value={itemSortOrder}
                    onChange={(e) => setItemSortOrder(Number(e.target.value))}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                  />
                </div>
              </div>

              {itemGroup === 'PAYMENT_METHOD' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Kategori Pembayaran
                    </label>
                    <select
                      value={metaCategory}
                      onChange={(e) => setMetaCategory(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    >
                      <option value="CASH">CASH (Tunai)</option>
                      <option value="QRIS">QRIS</option>
                      <option value="EDC">EDC / Kartu</option>
                      <option value="TRANSFER">Transfer Bank / VA</option>
                      <option value="EWALLET">E-Wallet</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      MDR / Biaya (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      value={metaFeePercent}
                      onChange={(e) => setMetaFeePercent(Number(e.target.value))}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                </div>
              )}

              {itemGroup === 'TAX_FEE' && (
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Jenis
                    </label>
                    <select
                      value={metaTaxType}
                      onChange={(e) => setMetaTaxType(e.target.value as 'TAX' | 'FEE')}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-2.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    >
                      <option value="TAX">Pajak</option>
                      <option value="FEE">Biaya / Service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Tipe Nilai
                    </label>
                    <select
                      value={metaValueType}
                      onChange={(e) => setMetaValueType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-2.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    >
                      <option value="PERCENTAGE">Persen (%)</option>
                      <option value="FIXED">Nominal (Rp)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Nilai
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      value={metaValue}
                      onChange={(e) => setMetaValue(Number(e.target.value))}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Deskripsi / Keterangan
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat..."
                  value={itemDesc}
                  onChange={(e) => setItemDesc(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38] resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsItemModalOpen(false)}
                  className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSaving || !itemName.trim()}
                  className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs px-4"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Data Master'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tambah/Edit Satuan Ukur Global */}
      {isUnitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-neutral-200 text-neutral-900">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">
                {editingUnit ? 'Edit Satuan Ukur Global' : 'Tambah Satuan Ukur Global'}
              </h3>
              <button
                type="button"
                onClick={() => setIsUnitModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUnit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Nama Satuan *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kilogram / Botol"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Simbol / Kode *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: kg, ml, btl"
                    value={unitCode}
                    onChange={(e) => setUnitCode(e.target.value)}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Kategori Satuan *
                  </label>
                  <select
                    value={unitType}
                    onChange={(e) => setUnitType(e.target.value as 'WEIGHT' | 'VOLUME' | 'COUNT')}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                  >
                    <option value="WEIGHT">Berat (Weight)</option>
                    <option value="VOLUME">Volume (Cair)</option>
                    <option value="COUNT">Jumlah / Unit (Count)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsUnitModalOpen(false)}
                  className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isSaving || !unitName.trim() || !unitCode.trim()}
                  className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs px-4"
                >
                  {isSaving ? 'Menyimpan...' : 'Simpan Satuan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Subscription Plan */}
      {isPlanModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-neutral-200 text-neutral-900">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">
                Ubah Skema: {editingPlan.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Fee Transaksi / Tarif (Rp)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={planPrice}
                  onChange={(e) => setPlanPrice(Number(e.target.value))}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Maks. Outlet Cabang
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={planMaxOutlets}
                    onChange={(e) => setPlanMaxOutlets(Number(e.target.value))}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Maks. Akun Staff
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={planMaxStaff}
                    onChange={(e) => setPlanMaxStaff(Number(e.target.value))}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs font-mono text-neutral-900 focus:outline-none focus:border-[#FF5C38]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs"
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
