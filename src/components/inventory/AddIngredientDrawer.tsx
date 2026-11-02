'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
} from 'lucide-react';
import {
  Button,
  Input,
  Textarea,
  Select,
  Drawer,
} from '@/components/common';
import { InventoryIngredient } from './IngredientDetailDrawer';
import { catalogService } from '@/services/catalog.service';

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
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('kg');
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [supplier, setSupplier] = useState('');
  const [storageLocation, setStorageLocation] = useState('');

  const [dbCategories, setDbCategories] = useState<string[]>([]);
  const [dbUnits, setDbUnits] = useState<Array<{ id: string; code: string; name: string }>>([]);
  const [dbSuppliers, setDbSuppliers] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!isOpen) return;
    Promise.allSettled([
      catalogService.getIngredientCategories(),
      catalogService.getUnits(),
      catalogService.getSuppliers(),
    ]).then(([catRes, unitRes, supRes]) => {
      if (catRes.status === 'fulfilled' && Array.isArray(catRes.value?.data)) {
        const cats = catRes.value.data.map((c: any) => c.name).filter(Boolean);
        setDbCategories(cats);
        if (cats.length > 0 && !category) {
          setCategory(cats[0]);
        }
      }
      if (unitRes.status === 'fulfilled' && Array.isArray(unitRes.value?.data)) {
        const units = unitRes.value.data.map((u: any) => ({
          id: u.id,
          code: u.code || u.name,
          name: u.name,
        }));
        setDbUnits(units);
        if (units.length > 0 && !unit) {
          setUnit(units[0].code);
        }
      }
      if (supRes.status === 'fulfilled' && Array.isArray(supRes.value?.data)) {
        setDbSuppliers(supRes.value.data.map((s: any) => ({ id: s.id, name: s.name })));
      }
    });
  }, [isOpen, category, unit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const generatedSku = sku.trim() || `ING-${Date.now().toString().slice(-5)}`;
    const newItem: InventoryIngredient = {
      id: `ing-${Date.now()}`,
      name: name.trim(),
      sku: generatedSku,
      category: category.trim() || '-',
      unit: unit.trim() || 'kg',
      currentStock,
      minStock,
      costPrice,
      status: currentStock <= 0 ? 'Habis' : currentStock <= minStock ? 'Menipis' : 'Aman',
      description,
      supplier,
      storageLocation,
    };

    onAdd(newItem);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setName('');
    setSku('');
    setCategory(dbCategories[0] || '');
    setUnit(dbUnits[0]?.code || 'kg');
    setCurrentStock(0);
    setMinStock(0);
    setCostPrice(0);
    setDescription('');
    setSupplier('');
    setStorageLocation('');
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
              setSku(`ING-${Math.floor(Math.random() * 899) + 100}`);
            }
          }}
          placeholder="Contoh: Biji Kopi Robusta Premium"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Kode SKU / Barcode"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="ING-001"
            className="font-mono uppercase"
          />

          {dbCategories.length > 0 ? (
            <Select
              label="Kategori"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: '', label: '-- Pilih Kategori --' },
                ...dbCategories.map((c) => ({ value: c, label: c })),
              ]}
            />
          ) : (
            <Input
              label="Kategori"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Contoh: Kopi"
            />
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {dbUnits.length > 0 ? (
            <Select
              label="Satuan"
              required
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              options={dbUnits.map((u) => ({
                value: u.code,
                label: `${u.name} (${u.code})`,
              }))}
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
          <Input
            label="Stok Awal"
            type="number"
            min="0"
            step="0.1"
            value={currentStock}
            onChange={(e) => setCurrentStock(Number(e.target.value))}
          />
          <Input
            label="Stok Minimum"
            type="number"
            min="0"
            step="0.1"
            value={minStock}
            onChange={(e) => setMinStock(Number(e.target.value))}
          />
        </div>

        <Input
          label={`Harga Modal (per ${unit || 'unit'})`}
          type="number"
          min="0"
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
            label="Merk / Supplier (Opsional)"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            options={[
              { value: '', label: '-- Tanpa Supplier --' },
              ...dbSuppliers.map((s) => ({ value: s.name, label: s.name })),
            ]}
          />
          <Input
            label="Lokasi Penyimpanan (Opsional)"
            value={storageLocation}
            onChange={(e) => setStorageLocation(e.target.value)}
            placeholder="Contoh: Gudang Bahan Kering"
          />
        </div>
      </form>
    </Drawer>
  );
}
