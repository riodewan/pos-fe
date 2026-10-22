'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  X,
  Plus,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  Button,
  Input,
  Textarea,
  Select,
  FormField,
  Drawer,
} from '@/components/common';
import { InventoryIngredient } from './IngredientDetailDrawer';

interface AddIngredientDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newItem: InventoryIngredient) => void;
}

export function AddIngredientDrawer({
  isOpen,
  onClose,
  onAdd,
}: AddIngredientDrawerProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState<InventoryIngredient['category']>('Kopi');
  const [unit, setUnit] = useState('Kg');
  const [currentStock, setCurrentStock] = useState<number>(10);
  const [minStock, setMinStock] = useState<number>(2);
  const [costPrice, setCostPrice] = useState<number>(50000);
  const [description, setDescription] = useState('');
  const [supplier, setSupplier] = useState('PT Kopi Nusantara');
  const [storageLocation, setStorageLocation] = useState('Gudang Bahan Kering');
  const [shelfLifeValue, setShelfLifeValue] = useState(12);
  const [shelfLifeUnit, setShelfLifeUnit] = useState<'Hari' | 'Bulan' | 'Tahun'>('Bulan');
  const [expiryDate, setExpiryDate] = useState('31 Des 2026');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const generatedSku = sku.trim() || `ING-0${Math.floor(Math.random() * 90) + 10}`;
    const newItem: InventoryIngredient = {
      id: `ing-${Date.now()}`,
      name: name.trim(),
      sku: generatedSku,
      category,
      unit,
      currentStock,
      minStock,
      costPrice,
      status: currentStock <= minStock ? 'Menipis' : 'Aman',
      description,
      supplier,
      storageLocation,
      shelfLifeValue,
      shelfLifeUnit,
      expiryDate,
      image: '/img/ingredients/biji_kopi_arabica.jpg',
    };

    onAdd(newItem);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setName('');
    setSku('');
    setCategory('Kopi');
    setUnit('Kg');
    setCurrentStock(10);
    setMinStock(2);
    setCostPrice(50000);
    setDescription('');
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Bahan Inventori"
      subtitle="Tambahkan bahan baku baru ke dalam pencatatan stok outlet"
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3 w-full">
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            className="bg-[#FF5C38] hover:bg-[#EE4E2A]"
            leftIcon={<CheckCircle2 className="size-4 stroke-[2.5]" />}
          >
            Simpan Bahan
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Nama Bahan"
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!sku) {
              setSku(`ING-0${Math.floor(Math.random() * 89) + 10}`);
            }
          }}
          placeholder="Contoh: Biji Kopi Robusta Premium"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Kode SKU / Barcode"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="ING-011"
            className="font-mono uppercase"
          />

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
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Select
            label="Satuan"
            required
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            options={[
              { value: 'Kg', label: 'Kg' },
              { value: 'liter', label: 'liter' },
              { value: 'pcs', label: 'pcs' },
              { value: 'gram', label: 'gram' },
              { value: 'ml', label: 'ml' },
            ]}
          />
          <Input
            label="Stok Awal"
            type="number"
            value={currentStock}
            onChange={(e) => setCurrentStock(Number(e.target.value))}
          />
          <Input
            label="Stok Minimum"
            type="number"
            value={minStock}
            onChange={(e) => setMinStock(Number(e.target.value))}
          />
        </div>

        <Input
          label={`Harga Modal (per ${unit})`}
          type="number"
          prefix="Rp"
          value={costPrice}
          onChange={(e) => setCostPrice(Number(e.target.value))}
        />

        <Textarea
          label="Deskripsi Bahan"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Keterangan mengenai spesifikasi atau asal bahan..."
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Merk / Supplier"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            options={[
              { value: 'PT Kopi Nusantara', label: 'PT Kopi Nusantara' },
              { value: 'PT Sumber Susu Murni', label: 'PT Sumber Susu Murni' },
              { value: 'Mitra Sirup Barista', label: 'Mitra Sirup Barista' },
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
            ]}
          />
        </div>
      </form>
    </Drawer>
  );
}
