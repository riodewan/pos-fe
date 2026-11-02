'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
} from 'lucide-react';
import {
  DataTable,
  ColumnDef,
  Button,
  Select,
  SearchInput,
  Drawer,
  Input,
  Textarea,
} from '@/components/common';
import { inventoryService } from '@/services/inventory.service';
import { catalogService } from '@/services/catalog.service';

export interface StockOutRecord {
  id: string;
  refNumber: string;
  date: string;
  ingredientName: string;
  qty: number;
  unit: string;
  reason: string;
  picName: string;
  notes?: string;
}

interface StockOutManagementProps {
  onShowToast: (msg: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export function StockOutManagement({
  onShowToast,
  isCreateOpen,
  onCloseCreate,
}: StockOutManagementProps) {
  const [records, setRecords] = useState<StockOutRecord[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState('all');

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formIngredientId, setFormIngredientId] = useState('');
  const [formQty, setFormQty] = useState(1);
  const [formReason, setFormReason] = useState('Gagal Racik (Spill)');
  const [formNotes, setFormNotes] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [wstRes, ingRes] = await Promise.allSettled([
        inventoryService.getWastages(),
        catalogService.getIngredients(),
      ]);

      const wstList = wstRes.status === 'fulfilled' && Array.isArray(wstRes.value?.data) ? wstRes.value.data : [];
      const ingList = ingRes.status === 'fulfilled' && Array.isArray(ingRes.value?.data) ? ingRes.value.data : [];

      setIngredients(ingList);
      if (ingList.length > 0 && !formIngredientId) {
        setFormIngredientId(ingList[0].id);
      }

      const flattened: StockOutRecord[] = [];
      for (const w of wstList as any[]) {
        const items = Array.isArray(w.items) ? w.items : [];
        if (items.length === 0) {
          flattened.push({
            id: w.id,
            refNumber: w.wastage_number || `OUT-${String(w.id || '').slice(-6).toUpperCase()}`,
            date: w.wastage_date || (w.created_at ? new Date(w.created_at).toLocaleString('id-ID') : '-'),
            ingredientName: '-',
            qty: 0,
            unit: '',
            reason: w.reason || 'Lainnya',
            picName: w.created_by_name || 'Staf Outlet',
            notes: w.notes || '',
          });
        } else {
          for (const it of items) {
            flattened.push({
              id: `${w.id}-${it.id}`,
              refNumber: w.wastage_number || `OUT-${String(w.id || '').slice(-6).toUpperCase()}`,
              date: w.wastage_date || (w.created_at ? new Date(w.created_at).toLocaleString('id-ID') : '-'),
              ingredientName: it.ingredient?.name || '-',
              qty: Number(it.quantity || 0),
              unit: it.unit?.code || it.unit?.name || it.ingredient?.unit?.code || 'unit',
              reason: w.reason || 'Lainnya',
              picName: w.created_by_name || 'Staf Outlet',
              notes: w.notes || '',
            });
          }
        }
      }

      setRecords(flattened);
    } catch (err) {
      console.error('Failed to load wastage records:', err);
    } finally {
      setIsLoading(false);
    }
  }, [formIngredientId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isCreateOpen) {
      if (ingredients.length > 0 && !formIngredientId) {
        setFormIngredientId(ingredients[0].id);
      }
      setIsDrawerOpen(true);
    }
  }, [isCreateOpen, ingredients, formIngredientId]);

  const handleClose = () => {
    setIsDrawerOpen(false);
    if (onCloseCreate) onCloseCreate();
  };

  const handleSave = async () => {
    const ing = ingredients.find((i) => i.id === formIngredientId);
    if (!ing || Number(formQty) <= 0) {
      onShowToast('Pilih bahan baku dan masukkan jumlah keluar yang valid!');
      return;
    }

    try {
      await inventoryService.createWastage({
        wastage_date: new Date().toISOString().split('T')[0],
        reason: formReason,
        notes: formNotes || undefined,
        items: [
          {
            ingredient_id: ing.id,
            unit_id: ing.unit_id || ing.unit?.id,
            quantity: Number(formQty),
          },
        ],
      } as any);

      onShowToast(`Stok keluar -${formQty} ${ing.unit?.code || ''} ${ing.name} tercatat.`);
      setFormNotes('');
      setFormQty(1);
      await fetchData();
      handleClose();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal mencatat stok keluar (pastikan stok mencukupi).');
    }
  };

  const filteredRecords = records.filter((r) => {
    if (reasonFilter !== 'all' && r.reason !== reasonFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = r.refNumber.toLowerCase().includes(q);
      const matchIng = r.ingredientName.toLowerCase().includes(q);
      if (!matchRef && !matchIng) return false;
    }
    return true;
  });

  const selectedIng = ingredients.find((i) => i.id === formIngredientId);

  const columns: ColumnDef<StockOutRecord>[] = [
    {
      key: 'refNumber',
      header: 'No. Keluar',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs font-mono">{item.refNumber}</span>
      ),
    },
    {
      key: 'date',
      header: 'Waktu Keluar',
      render: (item) => <span className="text-neutral-500 text-xs">{item.date}</span>,
    },
    {
      key: 'ingredientName',
      header: 'Nama Bahan Baku',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs">{item.ingredientName}</span>
      ),
    },
    {
      key: 'qty',
      header: 'Jumlah Keluar',
      render: (item) => (
        <span className="font-bold text-red-600 text-xs font-mono">
          -{item.qty} {item.unit}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Alasan Keluar / Pembuangan',
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFEBEE] text-[#D32F2F]">
          {item.reason}
        </span>
      ),
    },
    {
      key: 'picName',
      header: 'PIC Pelapor',
      render: (item) => <span className="text-neutral-700 text-xs">{item.picName}</span>,
    },
    {
      key: 'notes',
      header: 'Catatan',
      render: (item) => (
        <span className="text-neutral-500 text-xs line-clamp-1 max-w-xs">{item.notes || '-'}</span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <Select
          value={reasonFilter}
          onChange={(e) => setReasonFilter(e.target.value)}
          options={[
            { value: 'all', label: 'Semua Alasan Keluar' },
            { value: 'Bahan Kedaluwarsa', label: 'Bahan Kedaluwarsa' },
            { value: 'Kemasan Rusak / Bocor', label: 'Kemasan Rusak / Bocor' },
            { value: 'Gagal Racik (Spill)', label: 'Gagal Racik (Spill)' },
            { value: 'Uji Rasa / Demo', label: 'Uji Rasa / Demo' },
          ]}
          className="w-52 h-9 text-xs"
        />

        <div className="w-full md:w-80">
          <SearchInput
            placeholder="Cari no. keluar atau bahan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <DataTable<StockOutRecord>
          columns={columns}
          data={filteredRecords}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
          selectable={false}
          emptyTitle="BELUM ADA STOK KELUAR / WASTAGE"
          emptyDescription="Catat pembuangan bahan baku yang rusak, kedaluwarsa, atau tumpah untuk akurasi HPP."
          entityName="stok keluar"
        />
      </div>

      {/* Drawer: Catat Stok Keluar */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleClose}
        title="Catat Stok Keluar / Wastage"
        subtitle="Kurangi stok bahan baku akibat kerusakan, kedaluwarsa, atau tumpah"
        size="md"
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            <Button variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="bg-[#E5484D] hover:bg-[#D9383D]"
              leftIcon={<CheckCircle2 className="size-4 stroke-[2.5]" />}
            >
              Simpan Stok Keluar
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <Select
            label="Pilih Bahan Baku"
            required
            value={formIngredientId}
            onChange={(e) => setFormIngredientId(e.target.value)}
            options={[
              { value: '', label: '-- Pilih Bahan Baku --' },
              ...ingredients.map((i) => ({
                value: i.id,
                label: `${i.name} (${i.sku})`,
              })),
            ]}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Jumlah Dikeluarkan"
              type="number"
              min="0.1"
              step="0.1"
              value={formQty}
              onChange={(e) => setFormQty(Number(e.target.value))}
            />
            <Input
              label="Satuan"
              value={selectedIng?.unit?.code || selectedIng?.unit?.name || '-'}
              disabled
              className="bg-neutral-50 font-mono"
            />
          </div>

          <Select
            label="Alasan Pengeluaran"
            required
            value={formReason}
            onChange={(e) => setFormReason(e.target.value)}
            options={[
              { value: 'Gagal Racik (Spill)', label: 'Gagal Racik (Tumpah / Salah Ukur)' },
              { value: 'Bahan Kedaluwarsa', label: 'Bahan Kedaluwarsa / Rusak Kualitas' },
              { value: 'Kemasan Rusak / Bocor', label: 'Kemasan Rusak / Bocor' },
              { value: 'Uji Rasa / Demo', label: 'Uji Rasa / Demo Resep Barista' },
            ]}
          />

          <Textarea
            label="Keterangan Kronologi"
            rows={3}
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            placeholder="Jelaskan secara singkat penyebab bahan dikeluarkan..."
          />
        </div>
      </Drawer>
    </div>
  );
}
