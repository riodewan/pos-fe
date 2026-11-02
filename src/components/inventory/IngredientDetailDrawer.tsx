'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Trash2,
  CheckCircle2,
  Check,
  Calendar,
  Package,
} from 'lucide-react';
import {
  Button,
  Input,
  Textarea,
  Select,
  FormField,
  StatusBadge,
  Modal,
} from '@/components/common';
import { formatRupiah } from '@/utils';
import { catalogService } from '@/services/catalog.service';
import { inventoryService } from '@/services/inventory.service';

export interface InventoryIngredient {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  unitId?: string;
  currentStock: number;
  minStock: number;
  costPrice: number;
  status: 'Aman' | 'Menipis' | 'Habis' | 'Aktif';
  description?: string;
  image?: string;
  supplier?: string;
  supplierId?: string;
  storageLocation?: string;
  shelfLifeValue?: number;
  shelfLifeUnit?: 'Hari' | 'Bulan' | 'Tahun';
  expiryDate?: string;
  recipeItems?: Array<{ id: string; quantity: number; product_name: string }>;
}

interface IngredientDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryIngredient | null;
  onSave: (updatedItem: InventoryIngredient) => void;
  onDelete: (id: string) => void;
}

type TabKey = 'basic' | 'stock' | 'usage' | 'history';

export function IngredientDetailDrawer({
  isOpen,
  onClose,
  item,
  onSave,
  onDelete,
}: IngredientDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reference options from DB
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [dbUnits, setDbUnits] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [dbSuppliers, setDbSuppliers] = useState<Array<{ id: string; name: string }>>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('');
  const [description, setDescription] = useState('');
  const [supplier, setSupplier] = useState('');
  const [storageLocation, setStorageLocation] = useState('');
  const [shelfLifeValue, setShelfLifeValue] = useState(0);
  const [shelfLifeUnit, setShelfLifeUnit] = useState<'Hari' | 'Bulan' | 'Tahun'>('Bulan');
  const [expiryDate, setExpiryDate] = useState('');

  // Stock tab states
  const [currentStock, setCurrentStock] = useState(0);
  const [minStock, setMinStock] = useState(0);
  const [costPrice, setCostPrice] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    Promise.allSettled([
      catalogService.getIngredientCategories(),
      catalogService.getUnits(),
      catalogService.getSuppliers(),
    ]).then(([catRes, unitRes, supRes]) => {
      if (catRes.status === 'fulfilled' && Array.isArray(catRes.value?.data)) {
        setDbCategories(catRes.value.data.map((c: any) => c.name).filter(Boolean));
      }
      if (unitRes.status === 'fulfilled' && Array.isArray(unitRes.value?.data)) {
        setDbUnits(
          unitRes.value.data.map((u: any) => ({
            id: u.id,
            code: u.code || u.name,
            name: u.name,
          }))
        );
      }
      if (supRes.status === 'fulfilled' && Array.isArray(supRes.value?.data)) {
        setDbSuppliers(supRes.value.data.map((s: any) => ({ id: s.id, name: s.name })));
      }
    });
  }, [isOpen]);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category || '');
      setUnit(item.unit || '');
      setDescription(item.description || '');
      setSupplier(item.supplier || '');
      setStorageLocation(item.storageLocation || '');
      setShelfLifeValue(item.shelfLifeValue ?? 0);
      setShelfLifeUnit(item.shelfLifeUnit || 'Bulan');
      setExpiryDate(item.expiryDate || '');
      setCurrentStock(item.currentStock);
      setMinStock(item.minStock);
      setCostPrice(item.costPrice);
      setActiveTab('basic');
    }
  }, [item]);

  useEffect(() => {
    if (isOpen && item && activeTab === 'history') {
      setLoadingMovements(true);
      inventoryService
        .getMovements({ ingredient_id: item.id })
        .then((res) => {
          const raw = res?.data as any;
          const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : [];
          setMovements(list);
        })
        .catch(() => setMovements([]))
        .finally(() => setLoadingMovements(false));
    }
  }, [isOpen, item, activeTab]);

  if (!isOpen || !item) return null;

  const handleSave = () => {
    onSave({
      ...item,
      name,
      category,
      unit,
      description,
      supplier,
      storageLocation,
      shelfLifeValue,
      shelfLifeUnit,
      expiryDate,
      currentStock,
      minStock,
      costPrice,
    });
    onClose();
  };

  const handleDelete = () => {
    onDelete(item.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const categoryOptions = Array.from(new Set([...dbCategories, ...(category ? [category] : [])])).map((c) => ({
    value: c,
    label: c,
  }));

  const unitOptions = Array.from(
    new Map(
      [
        ...dbUnits.map((u) => [u.code, { value: u.code, label: `${u.name} (${u.code})` }] as const),
        ...(unit ? [[unit, { value: unit, label: unit }] as const] : []),
      ]
    ).values()
  );

  const supplierOptions = [
    { value: '', label: '-- Tanpa Supplier --' },
    ...Array.from(
      new Set([...dbSuppliers.map((s) => s.name), ...(supplier && supplier !== '-' ? [supplier] : [])])
    ).map((s) => ({ value: s, label: s })),
  ];

  const recipeUsage = item.recipeItems || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[760px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between gap-4 bg-white">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="size-13 rounded-xl overflow-hidden border border-neutral-200 shrink-0 relative bg-neutral-50 shadow-2xs flex items-center justify-center text-neutral-400">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <Package className="size-6" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight truncate">
                  {name || item.name}
                </h2>
                <StatusBadge variant="success" icon={<Check className="size-3" />}>
                  Aktif
                </StatusBadge>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5 font-mono">SKU: {item.sku}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Navigation Tabs */}
          <div className="w-44 shrink-0 border-r border-neutral-100 p-3 space-y-1 bg-white">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'basic'
                  ? 'bg-[#FFF1F0] text-[#E5484D] shadow-2xs'
                  : 'text-neutral-600 hover:bg-neutral-50 font-medium'
              }`}
            >
              Informasi Dasar
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stock')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'stock'
                  ? 'bg-[#FFF1F0] text-[#E5484D] shadow-2xs'
                  : 'text-neutral-600 hover:bg-neutral-50 font-medium'
              }`}
            >
              Stok & Harga
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('usage')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'usage'
                  ? 'bg-[#FFF1F0] text-[#E5484D] shadow-2xs'
                  : 'text-neutral-600 hover:bg-neutral-50 font-medium'
              }`}
            >
              Penggunaan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'history'
                  ? 'bg-[#FFF1F0] text-[#E5484D] shadow-2xs'
                  : 'text-neutral-600 hover:bg-neutral-50 font-medium'
              }`}
            >
              Riwayat
            </button>
          </div>

          {/* Right Content Panels */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
            {activeTab === 'basic' && (
              <div className="space-y-5">
                <Input
                  label="Nama Bahan"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Biji Kopi Arabica"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categoryOptions.length > 0 ? (
                    <Select
                      label="Kategori"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      options={[{ value: '', label: '-- Pilih Kategori --' }, ...categoryOptions]}
                    />
                  ) : (
                    <Input
                      label="Kategori"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Contoh: Kopi"
                    />
                  )}

                  {unitOptions.length > 0 ? (
                    <Select
                      label="Satuan"
                      required
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      options={unitOptions}
                    />
                  ) : (
                    <Input
                      label="Satuan"
                      required
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="kg / liter / pcs"
                    />
                  )}
                </div>

                <Textarea
                  label="Deskripsi"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan bahan baku..."
                />

                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-neutral-900 tracking-tight">
                    Informasi Tambahan
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Merk / Supplier"
                      value={supplier === '-' ? '' : supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      options={supplierOptions}
                    />

                    <Input
                      label="Lokasi Penyimpanan"
                      value={storageLocation === '-' ? '' : storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                      placeholder="Contoh: Gudang Bahan Kering"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Masa Simpan">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          value={shelfLifeValue}
                          onChange={(e) => setShelfLifeValue(Number(e.target.value))}
                          className="w-full"
                        />
                        <Select
                          value={shelfLifeUnit}
                          onChange={(e) => setShelfLifeUnit(e.target.value as any)}
                          options={[
                            { value: 'Bulan', label: 'Bulan' },
                            { value: 'Hari', label: 'Hari' },
                            { value: 'Tahun', label: 'Tahun' },
                          ]}
                          className="w-32 shrink-0"
                        />
                      </div>
                    </FormField>

                    <Input
                      label="Tanggal Kadaluwarsa"
                      type="date"
                      value={expiryDate === '-' ? '' : expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      rightIcon={<Calendar className="size-4 text-neutral-400" />}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stock' && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label={`Stok Saat Ini (${unit})`}
                    type="number"
                    value={currentStock}
                    onChange={(e) => setCurrentStock(Number(e.target.value))}
                  />
                  <Input
                    label={`Batas Stok Minimum (${unit})`}
                    type="number"
                    value={minStock}
                    onChange={(e) => setMinStock(Number(e.target.value))}
                    hint="Peringatan 'Menipis' akan otomatis muncul jika stok berada di bawah batas ini."
                  />
                </div>

                <Input
                  label={`Harga Modal (HPP per ${unit})`}
                  type="number"
                  value={costPrice}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  prefix="Rp"
                />

                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Estimasi Nilai Total Aset Bahan:</span>
                    <span className="font-bold text-neutral-900">
                      {formatRupiah(currentStock * costPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Status Ketersediaan:</span>
                    <span
                      className={`font-semibold ${
                        currentStock <= minStock ? 'text-amber-600' : 'text-emerald-600'
                      }`}
                    >
                      {currentStock <= 0 ? 'Stok Habis' : currentStock <= minStock ? 'Stok Menipis' : 'Stok Aman'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="space-y-4">
                <p className="text-xs text-neutral-500">
                  Daftar menu minuman/makanan yang menggunakan bahan baku ini dalam resep:
                </p>

                {recipeUsage.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-neutral-200 text-center text-xs text-neutral-400">
                    Bahan baku ini belum ditautkan pada resep menu mana pun.
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                    {recipeUsage.map((r) => (
                      <div
                        key={r.id}
                        className="p-3.5 flex items-center justify-between text-xs hover:bg-neutral-50/50"
                      >
                        <div>
                          <p className="font-semibold text-neutral-800">{r.product_name}</p>
                          <p className="text-[11px] text-neutral-400">
                            Takaran: {r.quantity} {unit} / porsi
                          </p>
                        </div>
                        <span className="text-[11px] font-mono text-neutral-600">
                          {r.quantity > 0 ? `± ${Math.floor(currentStock / r.quantity)} porsi tersisa` : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <p className="text-xs text-neutral-500">
                  Riwayat mutasi pergerakan stok bahan baku:
                </p>

                {loadingMovements ? (
                  <div className="p-8 text-center text-xs text-neutral-400">Memuat riwayat mutasi...</div>
                ) : movements.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-neutral-200 text-center text-xs text-neutral-400">
                    Belum ada riwayat pergerakan stok untuk bahan baku ini.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {movements.map((m: any) => {
                      const qty = Number(m.quantity || 0);
                      return (
                        <div
                          key={m.id}
                          className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-semibold text-neutral-800">
                              {m.type} {m.notes ? `— ${m.notes}` : ''}
                            </p>
                            <p className="text-[11px] text-neutral-400">
                              {m.created_at ? new Date(m.created_at).toLocaleString('id-ID') : '-'} • Oleh{' '}
                              {m.created_by_name || 'Sistem'}
                            </p>
                          </div>
                          <span
                            className={`font-bold font-mono ${
                              qty >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}
                          >
                            {qty >= 0 ? `+${qty}` : qty} {m.unit?.code || unit}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Drawer Sticky Footer */}
        <div className="p-4 px-6 border-t border-neutral-100 flex items-center justify-between gap-4 bg-white">
          <Button
            variant="outline"
            onClick={() => setShowDeleteConfirm(true)}
            className="border-neutral-200 text-neutral-700 hover:text-red-600 hover:border-red-200 hover:bg-red-50 text-xs font-semibold h-11 px-5 rounded-xl transition-colors"
            leftIcon={<Trash2 className="size-4 text-neutral-500 hover:text-red-600" />}
          >
            Hapus Bahan
          </Button>

          <Button
            variant="primary"
            onClick={handleSave}
            className="bg-[#FF5C38] hover:bg-[#EE4E2A] text-white text-xs font-semibold h-11 px-7 rounded-xl shadow-2xs transition-colors"
            leftIcon={<CheckCircle2 className="size-4 stroke-[2.5]" />}
          >
            Simpan Perubahan
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Hapus Bahan Inventori"
        subtitle="Apakah Anda yakin ingin menghapus bahan baku ini dari inventori? Data stok dan riwayat akan diarsipkan."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setShowDeleteConfirm(false)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>
              Ya, Hapus Bahan
            </Button>
          </div>
        }
      >
        <div className="py-2 text-xs text-neutral-600">
          Bahan: <strong className="text-neutral-900">{name}</strong> (SKU: {item.sku})
        </div>
      </Modal>
    </>
  );
}
