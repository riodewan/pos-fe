'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  X,
  Trash2,
  CheckCircle2,
  Check,
  Calendar,
  Layers,
  DollarSign,
  History,
  FileText,
  AlertTriangle,
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

export interface InventoryIngredient {
  id: string;
  name: string;
  sku: string;
  category: 'Kopi' | 'Susu' | 'Bubuk' | 'Sirup' | 'Minuman' | 'Lainnya';
  unit: string;
  currentStock: number;
  minStock: number;
  costPrice: number;
  status: 'Aman' | 'Menipis' | 'Habis' | 'Aktif';
  description?: string;
  image?: string;
  supplier?: string;
  storageLocation?: string;
  shelfLifeValue?: number;
  shelfLifeUnit?: 'Hari' | 'Bulan' | 'Tahun';
  expiryDate?: string;
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

  // Form states
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryIngredient['category']>('Kopi');
  const [unit, setUnit] = useState('Kg');
  const [description, setDescription] = useState('');
  const [supplier, setSupplier] = useState('PT Kopi Nusantara');
  const [storageLocation, setStorageLocation] = useState('Gudang Bahan Kering');
  const [shelfLifeValue, setShelfLifeValue] = useState(12);
  const [shelfLifeUnit, setShelfLifeUnit] = useState<'Hari' | 'Bulan' | 'Tahun'>('Bulan');
  const [expiryDate, setExpiryDate] = useState('31 Des 2026');

  // Stock tab states
  const [currentStock, setCurrentStock] = useState(0);
  const [minStock, setMinStock] = useState(0);
  const [costPrice, setCostPrice] = useState(0);

  useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setUnit(item.unit);
      setDescription(item.description || 'Biji kopi arabica premium untuk menu kopi.');
      setSupplier(item.supplier || 'PT Kopi Nusantara');
      setStorageLocation(item.storageLocation || 'Gudang Bahan Kering');
      setShelfLifeValue(item.shelfLifeValue || 12);
      setShelfLifeUnit(item.shelfLifeUnit || 'Bulan');
      setExpiryDate(item.expiryDate || '31 Des 2026');
      setCurrentStock(item.currentStock);
      setMinStock(item.minStock);
      setCostPrice(item.costPrice);
      setActiveTab('basic');
    }
  }, [item]);

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
            {/* Thumbnail Image */}
            <div className="size-13 rounded-xl overflow-hidden border border-neutral-200 shrink-0 relative bg-neutral-50 shadow-2xs">
              <Image
                src={item.image || '/img/ingredients/biji_kopi_arabica.jpg'}
                alt={item.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Name, Status & SKU */}
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

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors shrink-0"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Drawer Body: Two-column layout matching Figma */}
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
                {/* Field: Nama Bahan */}
                <Input
                  label="Nama Bahan"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Biji Kopi Arabica"
                />

                {/* 2 Cols: Kategori & Satuan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Kategori"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    options={[
                      { value: 'Kopi', label: 'Kopi' },
                      { value: 'Susu', label: 'Susu' },
                      { value: 'Bubuk', label: 'Bubuk' },
                      { value: 'Sirup', label: 'Sirup' },
                      { value: 'Minuman', label: 'Minuman' },
                      { value: 'Lainnya', label: 'Lainnya' },
                    ]}
                  />

                  <Select
                    label="Satuan"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    options={[
                      { value: 'Kg', label: 'Kg' },
                      { value: 'kg', label: 'kg' },
                      { value: 'liter', label: 'liter' },
                      { value: 'pcs', label: 'pcs' },
                      { value: 'gram', label: 'gram' },
                      { value: 'ml', label: 'ml' },
                      { value: 'pack', label: 'pack' },
                    ]}
                  />
                </div>

                {/* Field: Deskripsi */}
                <Textarea
                  label="Deskripsi"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Biji kopi arabica premium untuk menu kopi."
                />

                {/* Section: Foto Bahan matching Figma card */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-800">Foto Bahan</label>
                  <div className="p-4 rounded-2xl border border-neutral-200 flex items-center justify-between gap-4 bg-white">
                    <div className="flex items-center gap-3.5">
                      <div className="size-16 rounded-xl overflow-hidden border border-neutral-200 shrink-0 relative bg-neutral-100">
                        <Image
                          src={item.image || '/img/ingredients/biji_kopi_arabica.jpg'}
                          alt={name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#1976D2] tracking-tight">
                          Biji Kopi_Arabica.webp
                        </p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          WebP, JPG, PNG. Ratio 1:1, Maks. 2MB
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#E5484D] text-[#E5484D] hover:bg-red-50 text-xs font-medium rounded-xl h-8 px-4"
                    >
                      Pilih file
                    </Button>
                  </div>
                </div>

                {/* Section: Informasi Tambahan */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-bold text-neutral-900 tracking-tight">
                    Informasi Tambahan
                  </h3>

                  {/* 2 Cols: Merk / Supplier & Lokasi Penyimpanan */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Merk / Supplier"
                      value={supplier}
                      onChange={(e) => setSupplier(e.target.value)}
                      options={[
                        { value: 'PT Kopi Nusantara', label: 'PT Kopi Nusantara' },
                        { value: 'PT Sumber Susu Murni', label: 'PT Sumber Susu Murni' },
                        { value: 'Mitra Sirup Barista', label: 'Mitra Sirup Barista' },
                        { value: 'Distributor Bubuk Java', label: 'Distributor Bubuk Java' },
                      ]}
                    />

                    <Select
                      label="Lokasi Penyimpanan"
                      value={storageLocation}
                      onChange={(e) => setStorageLocation(e.target.value)}
                      options={[
                        { value: 'Gudang Bahan Kering', label: 'Gudang Bahan Kering' },
                        { value: 'Chiller Bar Depan', label: 'Chiller Bar Depan' },
                        { value: 'Rak Sirup & Topping', label: 'Rak Sirup & Topping' },
                        { value: 'Freezer Utama', label: 'Freezer Utama' },
                      ]}
                    />
                  </div>

                  {/* 2 Cols: Masa Simpan & Tanggal Kadaluwarsa */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Masa Simpan">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
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
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      rightIcon={<Calendar className="size-4 text-neutral-400" />}
                      placeholder="31 Des 2026"
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
                      {currentStock <= minStock ? 'Stok Menipis' : 'Stok Aman'}
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

                <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="p-3.5 flex items-center justify-between text-xs hover:bg-neutral-50/50">
                    <div>
                      <p className="font-semibold text-neutral-800">Kopi Susu Gula Aren</p>
                      <p className="text-[11px] text-neutral-400">Takaran: 18 gram / porsi</p>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-600">± 288 porsi tersisa</span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between text-xs hover:bg-neutral-50/50">
                    <div>
                      <p className="font-semibold text-neutral-800">Americano / Long Black</p>
                      <p className="text-[11px] text-neutral-400">Takaran: 20 gram / porsi</p>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-600">± 260 porsi tersisa</span>
                  </div>
                  <div className="p-3.5 flex items-center justify-between text-xs hover:bg-neutral-50/50">
                    <div>
                      <p className="font-semibold text-neutral-800">Cappuccino & Latte</p>
                      <p className="text-[11px] text-neutral-400">Takaran: 18 gram / porsi</p>
                    </div>
                    <span className="text-[11px] font-mono text-neutral-600">± 288 porsi tersisa</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <p className="text-xs text-neutral-500">
                  Riwayat 5 mutasi pergerakan inventori terakhir:
                </p>

                <div className="space-y-2.5">
                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-neutral-800">Stok Masuk (PO-2026-089)</p>
                      <p className="text-[11px] text-neutral-400">12 Okt 2026, 14:30 • Oleh Kasir</p>
                    </div>
                    <span className="font-bold text-emerald-600 font-mono">+5,0 kg</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-neutral-800">Pemakaian POS (Penjualan)</p>
                      <p className="text-[11px] text-neutral-400">14 Okt 2026, 11:00 • Shift Pagi</p>
                    </div>
                    <span className="font-bold text-red-600 font-mono">-1,8 kg</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Sticky Footer matching Screenshot 1 */}
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
