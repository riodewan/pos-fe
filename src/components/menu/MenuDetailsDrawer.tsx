'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Trash2,
  Check,
  Upload,
  Coffee,
  Utensils,
  Cookie,
  ChevronDown,
  GripVertical,
  Plus,
  Edit2,
  Bookmark,
  Info,
  Clock,
  Calendar,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { StatusBadge, Button, Modal } from '@/components/common';
import { formatRupiah } from '@/utils';
import { catalogService } from '@/services/catalog.service';

export interface MenuRecipeIngredient {
  id: string;
  ingredientId: string;
  name: string;
  unitId?: string;
  unit: string;
  amount: number;
  unitCost: number;
  cost: number;
  currentStock?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  sku: string;
  category: 'Kopi' | 'Pastry' | 'Makanan Berat' | string;
  type: 'Minuman' | 'Makanan' | 'Cemilan' | 'Lainnya';
  price: number;
  cost: number;
  margin: number;
  status: 'Aktif' | 'Nonaktif';
  description?: string;
  image?: string;
  availablePortions?: number | null;
  recipeItems?: MenuRecipeIngredient[];
}

export interface MenuDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  mode?: 'create' | 'edit';
  onSave?: (updatedItem: MenuItem) => void;
  onDelete?: (itemId: string) => void;
}

interface VariantOption {
  id: string;
  name: string;
  priceModifier: number;
  status: 'Aktif' | 'Nonaktif';
}

interface VariantGroup {
  id: string;
  name: string;
  selectionType: 'Pilihan Tunggal' | 'Pilihan Ganda';
  options: VariantOption[];
}

interface IngredientItem {
  id: string;
  ingredientId: string;
  name: string;
  unitId?: string;
  unit: string;
  amount: number;
  unitCost: number;
  cost: number;
  currentStock?: number;
}

interface StoreIngredientOption {
  id: string;
  name: string;
  unitId: string;
  unitCode: string;
  costPrice: number;
  currentStock: number;
}

export function MenuDetailsDrawer({
  isOpen,
  onClose,
  item,
  mode = 'edit',
  onSave,
  onDelete,
}: MenuDetailsDrawerProps) {
  const isCreate = mode === 'create' || !item?.id || item.id.startsWith('new-');
  const [activeTab, setActiveTab] = useState<'info' | 'pricing' | 'ingredients' | 'settings'>('info');

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedItem, setSavedItem] = useState<MenuItem | null>(null);

  // TAB 1: Informasi Dasar
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Kopi');
  const [type, setType] = useState<MenuItem['type']>('Minuman');
  const [status, setStatus] = useState<MenuItem['status']>('Aktif');
  const [description, setDescription] = useState('');

  // TAB 2: Harga & Varian
  const [price, setPrice] = useState(28000);
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([
    {
      id: 'vg-1',
      name: 'Ukuran',
      selectionType: 'Pilihan Tunggal',
      options: [
        { id: 'vo-1', name: 'Regular (Default)', priceModifier: 0, status: 'Aktif' },
        { id: 'vo-2', name: 'Large', priceModifier: 5000, status: 'Aktif' },
        { id: 'vo-3', name: 'Extra Large', priceModifier: 10000, status: 'Aktif' },
      ],
    },
    {
      id: 'vg-2',
      name: 'Level Gula',
      selectionType: 'Pilihan Tunggal',
      options: [
        { id: 'vo-4', name: 'Normal Sugar (100%)', priceModifier: 0, status: 'Aktif' },
        { id: 'vo-5', name: 'Less Sugar (50%)', priceModifier: 0, status: 'Aktif' },
        { id: 'vo-6', name: 'No Sugar (0%)', priceModifier: 0, status: 'Aktif' },
      ],
    },
  ]);

  // TAB 3: Bahan & HPP
  const [activeVariantTab, setActiveVariantTab] = useState('Regular (Default)');
  const [storeIngredients, setStoreIngredients] = useState<StoreIngredientOption[]>([]);
  const [ingredients, setIngredients] = useState<IngredientItem[]>([]);
  const [manualCost, setManualCost] = useState(0);

  // TAB 4: Pengaturan
  const [isAvailable, setIsAvailable] = useState(true);
  const [availabilitySchedule, setAvailabilitySchedule] = useState<'always' | 'hours' | 'period'>('always');
  const [channelPos, setChannelPos] = useState(true);
  const [channelQr, setChannelQr] = useState(false);
  const [showInMenu, setShowInMenu] = useState(true);
  const [isRecommended, setIsRecommended] = useState(true);
  const [isNewBadge, setIsNewBadge] = useState(false);
  const [isFavoriteBadge, setIsFavoriteBadge] = useState(false);

  // Load real ingredients from store inventory when drawer opens
  useEffect(() => {
    if (!isOpen) return;
    catalogService
      .getIngredients()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        const mapped: StoreIngredientOption[] = list.map((ing: any) => ({
          id: ing.id,
          name: ing.name,
          unitId: ing.unit_id || ing.unit?.id || '',
          unitCode: ing.unit?.code || ing.unit?.name || 'pcs',
          costPrice: Number(ing.cost_price ?? 0),
          currentStock: Number(ing.current_stock ?? 0),
        }));
        setStoreIngredients(mapped);
      })
      .catch(() => {
        setStoreIngredients([]);
      });
  }, [isOpen]);

  // Sync state when item changes
  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setCategory(item.category || 'Kopi');
      setType(item.type || 'Minuman');
      setStatus(item.status || 'Aktif');
      setDescription(item.description || '');
      setPrice(item.price || 0);
      setManualCost(item.cost || 0);
      setIsAvailable(item.status === 'Aktif');
      if (Array.isArray(item.recipeItems)) {
        setIngredients(
          item.recipeItems.map((ri) => ({
            id: ri.id || `ri-${ri.ingredientId}`,
            ingredientId: ri.ingredientId,
            name: ri.name,
            unitId: ri.unitId,
            unit: ri.unit || 'pcs',
            amount: Number(ri.amount) || 1,
            unitCost: Number(ri.unitCost) || 0,
            cost: Number(ri.cost) || Math.round((Number(ri.amount) || 0) * (Number(ri.unitCost) || 0)),
            currentStock: ri.currentStock,
          }))
        );
      } else {
        setIngredients([]);
      }
    }
  }, [item]);

  if (!isOpen) return null;

  // HPP Calculation
  const recipeCost = ingredients.reduce((acc, ing) => acc + (Number(ing.cost) || 0), 0);
  const totalCost = ingredients.length > 0 ? Math.round(recipeCost) : manualCost;
  const netProfit = Math.max(0, price - totalCost);
  const calculatedMargin = price > 0 ? Number((((price - totalCost) / price) * 100).toFixed(1)) : 0;

  const handleSaveMenu = (isDraft = false) => {
    const validRecipeItems = ingredients
      .filter((ing) => ing.ingredientId && ing.amount > 0)
      .map((ing) => ({
        id: ing.id,
        ingredientId: ing.ingredientId,
        name: ing.name,
        unitId: ing.unitId,
        unit: ing.unit,
        amount: ing.amount,
        unitCost: ing.unitCost,
        cost: ing.cost,
        currentStock: ing.currentStock,
      }));

    const finalItem: MenuItem = {
      id: item?.id || `m-${Date.now()}`,
      name: name.trim() || 'Menu Tanpa Nama',
      sku: item?.sku || `DRK-00${Math.floor(Math.random() * 90 + 10)}`,
      category,
      type,
      price,
      cost: totalCost,
      margin: calculatedMargin,
      status: isDraft ? 'Nonaktif' : status,
      description,
      recipeItems: validRecipeItems,
    };

    setSavedItem(finalItem);
    onSave?.(finalItem);
    setShowSuccessModal(true);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
  };

  const handleAddIngredient = () => {
    const unused = storeIngredients.find(
      (si) => !ingredients.some((i) => i.ingredientId === si.id)
    ) || storeIngredients[0];

    const newId = `ing-${Date.now()}`;
    if (unused) {
      const defaultAmount = 1;
      setIngredients((prev) => [
        ...prev,
        {
          id: newId,
          ingredientId: unused.id,
          name: unused.name,
          unitId: unused.unitId,
          unit: unused.unitCode,
          amount: defaultAmount,
          unitCost: unused.costPrice,
          cost: Math.round(defaultAmount * unused.costPrice),
          currentStock: unused.currentStock,
        },
      ]);
    } else {
      setIngredients((prev) => [
        ...prev,
        {
          id: newId,
          ingredientId: '',
          name: '',
          unitId: '',
          unit: '-',
          amount: 1,
          unitCost: 0,
          cost: 0,
        },
      ]);
    }
  };

  const handleRemoveIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
      />

      {/* Slide-over Container (matching Screenshot 2, 3, 4, 5) */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[760px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Drawer Top Header matching Screenshots */}
        <div className="p-6 border-b border-neutral-100 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
              {isCreate ? 'Tambah Menu' : 'Edit Menu'}
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Lengkapi informasi menu, bahan, dan harga untuk ditampilkan di POS, QR Order, dan channel lainnya.
            </p>
          </div>

          <button
            onClick={onClose}
            className="size-7 rounded-full bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Drawer Body: 2 Columns (Sidebar & Form Content) */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Sub-nav */}
          <div className="w-44 border-r border-neutral-100 p-4 space-y-1.5 shrink-0 bg-white">
            <button
              onClick={() => setActiveTab('info')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'info'
                  ? 'bg-red-50 text-[#E5484D]'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              Informasi Dasar
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'pricing'
                  ? 'bg-red-50 text-[#E5484D]'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              Harga & Varian
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ingredients'
                  ? 'bg-red-50 text-[#E5484D]'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              Bahan & HPP
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-red-50 text-[#E5484D]'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              Pengaturan
            </button>
          </div>

          {/* Right Form Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* TAB 1: INFORMASI DASAR (Screenshot 5) */}
            {activeTab === 'info' && (
              <>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Informasi Dasar</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Atur informasi utama menu</p>
                </div>

                {/* Field: Nama Menu */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">Nama Menu</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Kopi Susu Gula Aren"
                    className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs"
                  />
                </div>

                {/* Field: Kategori */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">Kategori</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 pl-3.5 pr-8 rounded-xl border border-neutral-200 text-xs text-neutral-900 appearance-none bg-white focus:outline-none focus:border-neutral-400 shadow-2xs cursor-pointer"
                    >
                      <option value="Kopi">Kopi</option>
                      <option value="Non-Kopi">Non-Kopi</option>
                      <option value="Pastry">Pastry</option>
                      <option value="Makanan Berat">Makanan Berat</option>
                      <option value="Snack">Snack</option>
                    </select>
                    <ChevronDown className="size-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Field: Tipe Menu */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">Tipe Menu</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Minuman', 'Makanan', 'Cemilan', 'Lainnya'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                          type === t
                            ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field: Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('Aktif')}
                      className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                        status === 'Aktif'
                          ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      Aktif
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('Nonaktif')}
                      className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                        status === 'Nonaktif'
                          ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      Nonaktif
                    </button>
                  </div>
                </div>

                {/* Field: Deskripsi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">Deskripsi</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Kopi espresso dengan susu fresh dan gula aren"
                    className="w-full p-3 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs resize-none"
                  />
                </div>

                {/* Field: Foto Menu */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">Foto Menu</label>
                  <p className="text-[11px] text-neutral-400">WebP, JPG, PNG. Ratio 1:1, Maks. 2MB</p>

                  <div className="flex items-center gap-3 pt-1">
                    {/* Existing Photo thumbnail 1 */}
                    <div className="size-16 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 relative shadow-2xs shrink-0 group">
                      <div className="w-full h-full bg-gradient-to-br from-amber-700 to-amber-900 flex items-center justify-center text-amber-200">
                        <Coffee className="size-7" />
                      </div>
                    </div>

                    {/* Existing Photo thumbnail 2 */}
                    <div className="size-16 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 relative shadow-2xs shrink-0 group">
                      <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center text-neutral-300">
                        <Utensils className="size-7" />
                      </div>
                    </div>

                    {/* Upload Box */}
                    <div className="size-16 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/50 flex flex-col items-center justify-center text-blue-600 cursor-pointer hover:bg-blue-50 transition-colors shadow-2xs shrink-0">
                      <Upload className="size-4" />
                      <span className="text-[10px] font-semibold mt-1">Upload</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB 2: HARGA & VARIAN (Screenshot 4) */}
            {activeTab === 'pricing' && (
              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Harga & Varian</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Atur harga jual, dan buat varian jika memiliki beberapa opsi
                  </p>
                </div>

                {/* Base Selling Price Input with Rp Prefix */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center">
                    <span className="absolute left-3.5 text-xs font-semibold text-neutral-600 pointer-events-none">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs"
                    />
                  </div>
                  <p className="text-[11px] text-neutral-400">
                    Harga digunakan untuk transaksi POS, QR Order, dan channel lainnya.
                  </p>
                </div>

                {/* Variant Section */}
                <div className="pt-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">
                        Varian Menu <span className="font-normal text-neutral-400">(Opsional)</span>
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Tambahkan kategori varian seperti ukuran, rasa, atau level gula
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const newVg: VariantGroup = {
                          id: `vg-${Date.now()}`,
                          name: 'Varian Baru',
                          selectionType: 'Pilihan Tunggal',
                          options: [
                            { id: `vo-${Date.now()}-1`, name: 'Opsi 1', priceModifier: 0, status: 'Aktif' },
                          ],
                        };
                        setVariantGroups((prev) => [...prev, newVg]);
                      }}
                      className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-neutral-200 hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-colors shadow-2xs"
                    >
                      <Plus className="size-3.5 stroke-[2.5]" />
                      <span>Tambah Kategori Varian</span>
                    </button>
                  </div>

                  {/* Variant Group Cards matching Screenshot 4 */}
                  {variantGroups.map((group, gIdx) => (
                    <div
                      key={group.id}
                      className="p-4 rounded-2xl border border-neutral-200/90 bg-white space-y-3 shadow-2xs"
                    >
                      {/* Group Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="size-4 text-neutral-400 cursor-grab" />
                          <span className="text-xs font-bold text-neutral-900">{group.name}</span>
                          <div className="relative">
                            <select
                              value={group.selectionType}
                              onChange={(e) => {
                                const val = e.target.value as any;
                                setVariantGroups((prev) =>
                                  prev.map((g) => (g.id === group.id ? { ...g, selectionType: val } : g))
                                );
                              }}
                              className="h-7 pl-2 pr-6 rounded-md border border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-700 appearance-none cursor-pointer focus:outline-none"
                            >
                              <option value="Pilihan Tunggal">Pilihan Tunggal</option>
                              <option value="Pilihan Ganda">Pilihan Ganda</option>
                            </select>
                            <ChevronDown className="size-3 text-neutral-400 absolute right-1.5 top-2 pointer-events-none" />
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setVariantGroups((prev) => prev.filter((g) => g.id !== group.id));
                            }}
                            className="p-1 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Options Table */}
                      <div className="border border-neutral-100 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-neutral-50/70 border-b border-neutral-100 text-[11px] font-semibold text-neutral-500">
                            <tr>
                              <th className="py-2 px-3 w-8">
                                <input
                                  type="checkbox"
                                  defaultChecked
                                  className="rounded border-neutral-300 size-3.5 text-[#FF4D4D] focus:ring-0"
                                />
                              </th>
                              <th className="py-2 px-3">Nama</th>
                              <th className="py-2 px-3 w-36">Harga</th>
                              <th className="py-2 px-3 w-28">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-100">
                            {group.options.map((opt, oIdx) => (
                              <tr key={opt.id} className="hover:bg-neutral-50/50">
                                <td className="py-2 px-3">
                                  <input
                                    type="checkbox"
                                    defaultChecked
                                    className="rounded border-neutral-300 size-3.5 text-[#FF4D4D] focus:ring-0"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <input
                                    type="text"
                                    value={opt.name}
                                    onChange={(e) => {
                                      const newName = e.target.value;
                                      setVariantGroups((prev) =>
                                        prev.map((g) =>
                                          g.id === group.id
                                            ? {
                                                ...g,
                                                options: g.options.map((o) =>
                                                  o.id === opt.id ? { ...o, name: newName } : o
                                                ),
                                              }
                                            : g
                                        )
                                      );
                                    }}
                                    className="w-full bg-transparent border-0 text-xs text-neutral-800 focus:outline-none focus:ring-0 font-medium"
                                  />
                                </td>
                                <td className="py-2 px-3">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[11px] text-neutral-400 font-semibold">Rp</span>
                                    <input
                                      type="number"
                                      value={opt.priceModifier}
                                      onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setVariantGroups((prev) =>
                                          prev.map((g) =>
                                            g.id === group.id
                                              ? {
                                                  ...g,
                                                  options: g.options.map((o) =>
                                                    o.id === opt.id ? { ...o, priceModifier: val } : o
                                                  ),
                                                }
                                              : g
                                          )
                                        );
                                      }}
                                      className="w-20 h-7 px-2 rounded-lg border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                                    />
                                  </div>
                                </td>
                                <td className="py-2 px-3">
                                  <div className="relative">
                                    <select
                                      value={opt.status}
                                      onChange={(e) => {
                                        const val = e.target.value as any;
                                        setVariantGroups((prev) =>
                                          prev.map((g) =>
                                            g.id === group.id
                                              ? {
                                                  ...g,
                                                  options: g.options.map((o) =>
                                                    o.id === opt.id ? { ...o, status: val } : o
                                                  ),
                                                }
                                              : g
                                          )
                                        );
                                      }}
                                      className="w-full h-7 pl-2 pr-6 rounded-lg border border-neutral-200 bg-white text-[11px] font-semibold text-emerald-600 appearance-none cursor-pointer focus:outline-none"
                                    >
                                      <option value="Aktif">Aktif</option>
                                      <option value="Nonaktif">Nonaktif</option>
                                    </select>
                                    <ChevronDown className="size-3 text-neutral-400 absolute right-1.5 top-2 pointer-events-none" />
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Add Option Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const newOpt: VariantOption = {
                            id: `vo-${Date.now()}`,
                            name: 'Opsi Baru',
                            priceModifier: 0,
                            status: 'Aktif',
                          };
                          setVariantGroups((prev) =>
                            prev.map((g) =>
                              g.id === group.id ? { ...g, options: [...g.options, newOpt] } : g
                            )
                          );
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-700 hover:text-neutral-900 pt-1"
                      >
                        <Plus className="size-3.5 stroke-[2.5]" />
                        <span>Tambah Opsi Varian</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: BAHAN & HPP (Screenshot 3) */}
            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                {/* Blue Info Callout matching Screenshot 3 */}
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-3">
                  <div className="size-5 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="size-3.5 stroke-[2.5]" />
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed font-medium">
                    HPP akan dihitung otomatis berdasarkan bahan yang dipilih. Pastikan harga bahan pada inventory sudah diperbaharui.
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Bahan & HPP</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Atur bahan yang digunakan, takaran per porsi, dan otomatis menghitung HPP.
                  </p>
                </div>

                {/* Card: Gunakan bahan berbeda per varian */}
                <div className="p-4 rounded-2xl border border-neutral-200/90 bg-white space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-2xs">
                        <Cookie className="size-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900">
                          Gunakan bahan berbeda per varian
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Atur perbedaan takaran bahan untuk setiap setiap varian.
                        </p>
                      </div>
                    </div>

                    <div className="relative">
                      <select
                        defaultValue="Ukuran"
                        className="h-8 pl-3 pr-7 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none"
                      >
                        <option value="Ukuran">Ukuran</option>
                        <option value="Level Gula">Level Gula</option>
                      </select>
                      <ChevronDown className="size-3.5 text-neutral-400 absolute right-2 top-2.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Variant Sub-Tabs matching Screenshot 3 */}
                  <div className="flex items-center border-b border-neutral-200 gap-6 text-xs">
                    {(['Regular (Default)', 'Large', 'Extra Large'] as const).map((vt) => (
                      <button
                        key={vt}
                        type="button"
                        onClick={() => setActiveVariantTab(vt)}
                        className={`pb-2.5 font-semibold transition-all border-b-2 ${
                          activeVariantTab === vt
                            ? 'border-[#FF5C38] text-[#FF5C38]'
                            : 'border-transparent text-neutral-400 hover:text-neutral-700'
                        }`}
                      >
                        {vt}
                      </button>
                    ))}
                  </div>

                  {/* Ingredient Table */}
                  <div className="border border-neutral-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-neutral-50/70 border-b border-neutral-100 text-[11px] font-semibold text-neutral-500">
                        <tr>
                          <th className="py-2.5 px-3 w-8">
                            <input
                              type="checkbox"
                              defaultChecked
                              className="rounded border-neutral-300 size-3.5 text-[#FF4D4D] focus:ring-0"
                            />
                          </th>
                          <th className="py-2.5 px-3">Bahan</th>
                          <th className="py-2.5 px-3 w-20">Satuan</th>
                          <th className="py-2.5 px-3 w-24">Takaran</th>
                          <th className="py-2.5 px-3 w-28">Harga</th>
                          <th className="py-2.5 px-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {ingredients.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-8 px-4 text-center text-xs text-neutral-400">
                              Belum ada bahan baku yang dipilih untuk menu ini. Klik <strong>+ Tambah Bahan</strong> di bawah untuk mengatur takaran resep & HPP otomatis.
                            </td>
                          </tr>
                        ) : (
                          ingredients.map((ing) => (
                            <tr key={ing.id} className="hover:bg-neutral-50/50">
                              <td className="py-2.5 px-3">
                                <input
                                  type="checkbox"
                                  defaultChecked
                                  className="rounded border-neutral-300 size-3.5 text-[#FF4D4D] focus:ring-0"
                                />
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="relative">
                                  <select
                                    value={ing.ingredientId}
                                    onChange={(e) => {
                                      const selectedId = e.target.value;
                                      const found = storeIngredients.find((si) => si.id === selectedId);
                                      if (!found) return;
                                      setIngredients((prev) =>
                                        prev.map((i) =>
                                          i.id === ing.id
                                            ? {
                                                ...i,
                                                ingredientId: found.id,
                                                name: found.name,
                                                unitId: found.unitId,
                                                unit: found.unitCode,
                                                unitCost: found.costPrice,
                                                cost: Math.round((Number(i.amount) || 0) * found.costPrice),
                                                currentStock: found.currentStock,
                                              }
                                            : i
                                        )
                                      );
                                    }}
                                    className="w-full h-8 pl-2.5 pr-7 rounded-lg border border-neutral-200 bg-white text-xs font-semibold text-neutral-800 appearance-none cursor-pointer focus:outline-none"
                                  >
                                    <option value="" disabled>
                                      -- Pilih Bahan Baku --
                                    </option>
                                    {storeIngredients.map((si) => (
                                      <option key={si.id} value={si.id}>
                                        {si.name} (Stok: {si.currentStock} {si.unitCode} • {formatRupiah(si.costPrice)}/{si.unitCode})
                                      </option>
                                    ))}
                                  </select>
                                  <ChevronDown className="size-3 text-neutral-400 absolute right-2 top-2.5 pointer-events-none" />
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-neutral-600 font-medium">{ing.unit}</td>
                              <td className="py-2.5 px-3">
                                <input
                                  type="number"
                                  min="0.01"
                                  step="any"
                                  value={ing.amount}
                                  onChange={(e) => {
                                    const val = Math.max(0, Number(e.target.value));
                                    setIngredients((prev) =>
                                      prev.map((i) =>
                                        i.id === ing.id
                                          ? {
                                              ...i,
                                              amount: val,
                                              cost: Math.round(val * (Number(i.unitCost) || 0)),
                                            }
                                          : i
                                      )
                                    );
                                  }}
                                  className="w-16 h-8 px-2 rounded-lg border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                                />
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-neutral-800">
                                {formatRupiah(ing.cost)}
                              </td>
                              <td className="py-2.5 px-2">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveIngredient(ing.id)}
                                  className="p-1 rounded text-neutral-300 hover:text-red-600 hover:bg-red-50"
                                >
                                  <X className="size-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Ingredient Button */}
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="w-full py-2.5 rounded-xl border border-dashed border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Plus className="size-3.5 stroke-[2.5]" />
                    <span>Tambah Bahan</span>
                  </button>
                </div>

                {/* 4-Grid Summary Stats matching Screenshot 3 */}
                <div className="grid grid-cols-4 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl border border-neutral-200/90 bg-white">
                    <p className="text-[11px] font-medium text-neutral-400">Harga Jual</p>
                    <p className="text-sm font-bold text-neutral-900 mt-1">{formatRupiah(price)}</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-neutral-200/90 bg-white">
                    <p className="text-[11px] font-medium text-neutral-400">Total HPP Regular</p>
                    <p className="text-sm font-bold text-neutral-900 mt-1">{formatRupiah(totalCost)}</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-neutral-200/90 bg-white">
                    <p className="text-[11px] font-medium text-neutral-400">Untung Bersih</p>
                    <p className="text-sm font-bold text-neutral-900 mt-1">{formatRupiah(netProfit)}</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-neutral-200/90 bg-white">
                    <p className="text-[11px] font-medium text-neutral-400">Margin (%)</p>
                    <p className="text-sm font-bold text-emerald-600 mt-1">{calculatedMargin}%</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: PENGATURAN (Screenshot 2) */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Pengaturan</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Atur ketersediaan, tampilan, dan channel penjualan menu ini
                  </p>
                </div>

                {/* Section: Ketersediaan & Status */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-neutral-900">Ketersediaan & Status</h4>

                  <div className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200/90 bg-white">
                    <span className="text-xs font-semibold text-neutral-800">Tersedia</span>
                    <button
                      type="button"
                      onClick={() => setIsAvailable(!isAvailable)}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isAvailable
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      <span className="size-2 rounded-full bg-white" />
                      <span>{isAvailable ? 'Menu Aktif' : 'Menu Nonaktif'}</span>
                    </button>
                  </div>

                  {/* Blue Alert Notice */}
                  <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-center gap-2.5 text-xs text-blue-700 font-medium">
                    <Info className="size-4 shrink-0 text-blue-600" />
                    <span>Nonaktif jika menu tidak tersedia untuk dipesan.</span>
                  </div>

                  {/* Radio Card Group */}
                  <div className="p-4 rounded-2xl border border-neutral-200/90 bg-white space-y-3 shadow-2xs">
                    <div>
                      <h5 className="text-xs font-bold text-neutral-900">Pengaturan</h5>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Atur ketersediaan, tampilan, dan channel penjualan menu ini
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="availability"
                          checked={availabilitySchedule === 'always'}
                          onChange={() => setAvailabilitySchedule('always')}
                          className="mt-0.5 text-blue-600 focus:ring-0"
                        />
                        <div>
                          <p className="text-xs font-semibold text-neutral-800">Selalu tersedia</p>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="availability"
                          checked={availabilitySchedule === 'hours'}
                          onChange={() => setAvailabilitySchedule('hours')}
                          className="mt-0.5 text-blue-600 focus:ring-0"
                        />
                        <div>
                          <p className="text-xs font-semibold text-neutral-800">Atur hari & jam</p>
                          <p className="text-[11px] text-neutral-400">
                            Tentukan hari dan jam khusus untuk menu ini
                          </p>
                        </div>
                      </label>

                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="availability"
                          checked={availabilitySchedule === 'period'}
                          onChange={() => setAvailabilitySchedule('period')}
                          className="mt-0.5 text-blue-600 focus:ring-0"
                        />
                        <div>
                          <p className="text-xs font-semibold text-neutral-800">Atur periode tanggal</p>
                          <p className="text-[11px] text-neutral-400">
                            Tentukan tanggal mulai dan berakhir.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Section: Channel Penjualan */}
                <div className="space-y-2.5">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-900">Channel Penjualan</h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Pilih channel yang menampilkan menu ini
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200/90 bg-white cursor-pointer hover:bg-neutral-50/50">
                      <input
                        type="checkbox"
                        checked={channelPos}
                        onChange={(e) => setChannelPos(e.target.checked)}
                        className="mt-0.5 rounded border-neutral-300 text-blue-600 focus:ring-0 size-4"
                      />
                      <div>
                        <p className="text-xs font-semibold text-neutral-900">POS (Kasir)</p>
                        <p className="text-[11px] text-neutral-400">Tersedia untuk pemesanan di outlet</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 rounded-xl border border-neutral-200/90 bg-white cursor-pointer hover:bg-neutral-50/50">
                      <input
                        type="checkbox"
                        checked={channelQr}
                        onChange={(e) => setChannelQr(e.target.checked)}
                        className="mt-0.5 rounded border-neutral-300 text-blue-600 focus:ring-0 size-4"
                      />
                      <div>
                        <p className="text-xs font-semibold text-neutral-900">QR Order</p>
                        <p className="text-[11px] text-neutral-400">Tersedia untuk pemesanan di outlet</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Section: Tampilan */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-neutral-900">Tampilan</h4>

                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral-200/90 bg-white cursor-pointer hover:bg-neutral-50/50">
                      <input
                        type="checkbox"
                        checked={showInMenu}
                        onChange={(e) => setShowInMenu(e.target.checked)}
                        className="mt-0.5 rounded border-neutral-300 text-blue-600 focus:ring-0 size-4"
                      />
                      <div>
                        <p className="text-xs font-semibold text-neutral-900">
                          Tampilkan di daftar menu
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Menu akan ditampilkan pada semua channel yang dipilih
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral-200/90 bg-white cursor-pointer hover:bg-neutral-50/50">
                      <input
                        type="checkbox"
                        checked={isRecommended}
                        onChange={(e) => setIsRecommended(e.target.checked)}
                        className="mt-0.5 rounded border-neutral-300 text-blue-600 focus:ring-0 size-4"
                      />
                      <div>
                        <p className="text-xs font-semibold text-neutral-900">Menu Rekomendasi</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Tampilkan sebagai menu rekomendasi di POS dan QR Order.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral-200/90 bg-white cursor-pointer hover:bg-neutral-50/50">
                      <input
                        type="checkbox"
                        checked={isNewBadge}
                        onChange={(e) => setIsNewBadge(e.target.checked)}
                        className="mt-0.5 rounded border-neutral-300 text-blue-600 focus:ring-0 size-4"
                      />
                      <div>
                        <p className="text-xs font-semibold text-neutral-900">Menu Baru</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Tampilkan label &quot;Baru&quot; pada menu.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral-200/90 bg-white cursor-pointer hover:bg-neutral-50/50">
                      <input
                        type="checkbox"
                        checked={isFavoriteBadge}
                        onChange={(e) => setIsFavoriteBadge(e.target.checked)}
                        className="mt-0.5 rounded border-neutral-300 text-blue-600 focus:ring-0 size-4"
                      />
                      <div>
                        <p className="text-xs font-semibold text-neutral-900">Menu Favorit</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          Tampilkan label &quot;Favorit&quot; pada menu.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Bottom Footer matching Screenshots 2, 3, 4, 5 */}
        <div className="p-4 px-6 border-t border-neutral-100 flex items-center justify-between gap-4 bg-white">
          <Button
            variant="secondary"
            size="md"
            leftIcon={<Bookmark className="size-4" />}
            onClick={() => handleSaveMenu(true)}
          >
            Simpan sebagai Draf
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<CheckCircle2 className="size-4 stroke-[2.5]" />}
            onClick={() => handleSaveMenu(false)}
          >
            Simpan Menu
          </Button>
        </div>
      </div>

      {/* SUCCESS MODAL matching Screenshot 1 using global Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        showCloseButton={false}
        size="md"
      >
        <div className="flex flex-col items-center text-center py-2">
          {/* Big Green Circle with Checkmark matching Screenshot 1 */}
          <div className="size-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-5">
            <Check className="size-10 stroke-[3]" />
          </div>

          {/* Title & Description */}
          <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
            Menu Berhasil Ditambahkan!
          </h3>
          <p className="text-xs text-neutral-500 mt-2 max-w-[340px] leading-relaxed">
            Menu baru berhasil ditambahkan dan sudah tersimpan. Kamu bisa melihat dan mengelola menu ini di daftar menu.
          </p>

          {/* Action Buttons matching Screenshot 1 */}
          <div className="grid grid-cols-2 gap-3 w-full mt-6">
            <Button
              variant="outline-primary"
              size="md"
              onClick={handleSuccessClose}
            >
              Tutup
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSuccessClose}
            >
              Kembali ke Daftar Menu
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
