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

export interface StockInRecord {
  id: string;
  refNumber: string;
  date: string;
  ingredientName: string;
  qty: number;
  unit: string;
  sourceType: string;
  receiverName: string;
  notes?: string;
}

interface StockInManagementProps {
  onShowToast: (msg: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export function StockInManagement({
  onShowToast,
  isCreateOpen,
  onCloseCreate,
}: StockInManagementProps) {
  const [records, setRecords] = useState<StockInRecord[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formIngredientId, setFormIngredientId] = useState('');
  const [formQty, setFormQty] = useState(1);
  const [formSource, setFormSource] = useState('Pembelian Langsung');
  const [formNotes, setFormNotes] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [movRes, ingRes] = await Promise.allSettled([
        inventoryService.getMovements({ type: 'PURCHASE' }),
        catalogService.getIngredients(),
      ]);

      const rawMov = movRes.status === 'fulfilled' ? (movRes.value?.data as any) : null;
      const movList = Array.isArray(rawMov) ? rawMov : Array.isArray(rawMov?.data) ? rawMov.data : [];
      const ingList = ingRes.status === 'fulfilled' && Array.isArray(ingRes.value?.data) ? ingRes.value.data : [];

      setIngredients(ingList);
      if (ingList.length > 0 && !formIngredientId) {
        setFormIngredientId(ingList[0].id);
      }

      const mapped: StockInRecord[] = movList.map((m: any) => ({
        id: m.id,
        refNumber: `IN-${String(m.id || '').slice(-6).toUpperCase()}`,
        date: m.created_at ? new Date(m.created_at).toLocaleString('id-ID') : '-',
        ingredientName: m.ingredient?.name || '-',
        qty: Math.abs(Number(m.quantity || 0)),
        unit: m.unit?.code || m.unit?.name || m.ingredient?.unit?.code || 'unit',
        sourceType: m.reference_type === 'PURCHASE' ? 'Purchase Order' : (m.reference_type || 'Pembelian Langsung'),
        receiverName: m.created_by_name || 'Staf Outlet',
        notes: m.notes || '',
      }));

      setRecords(mapped);
    } catch (err) {
      console.error('Failed to load stock-in movements:', err);
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
    if (!formIngredientId || Number(formQty) <= 0) {
      onShowToast('Pilih bahan baku dan masukkan jumlah masuk yang valid!');
      return;
    }

    try {
      await inventoryService.recordStockIn({
        ingredient_id: formIngredientId,
        quantity: Number(formQty),
        source_type: formSource,
        notes: formNotes || undefined,
      });

      const ing = ingredients.find((i) => i.id === formIngredientId);
      onShowToast(`Stok masuk +${formQty} ${ing?.unit?.code || ''} ${ing?.name || ''} tercatat.`);
      setFormNotes('');
      setFormQty(1);
      await fetchData();
      handleClose();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal mencatat stok masuk.');
    }
  };

  const filteredRecords = records.filter((r) => {
    if (sourceFilter !== 'all' && r.sourceType !== sourceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = r.refNumber.toLowerCase().includes(q);
      const matchIng = r.ingredientName.toLowerCase().includes(q);
      if (!matchRef && !matchIng) return false;
    }
    return true;
  });

  const selectedIng = ingredients.find((i) => i.id === formIngredientId);

  const columns: ColumnDef<StockInRecord>[] = [
    {
      key: 'refNumber',
      header: 'No. Masuk',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs font-mono">{item.refNumber}</span>
      ),
    },
    {
      key: 'date',
      header: 'Waktu Masuk',
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
      header: 'Jumlah Masuk',
      render: (item) => (
        <span className="font-bold text-emerald-600 text-xs font-mono">
          +{item.qty} {item.unit}
        </span>
      ),
    },
    {
      key: 'sourceType',
      header: 'Asal / Sumber',
      render: (item) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8F5E9] text-[#2E7D32]">
          {item.sourceType}
        </span>
      ),
    },
    {
      key: 'receiverName',
      header: 'Penerima',
      render: (item) => <span className="text-neutral-700 text-xs">{item.receiverName}</span>,
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
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          options={[
            { value: 'all', label: 'Semua Sumber Masuk' },
            { value: 'Purchase Order', label: 'Purchase Order' },
            { value: 'Pembelian Langsung', label: 'Pembelian Langsung' },
            { value: 'Transfer Gudang', label: 'Transfer Gudang' },
          ]}
          className="w-48 h-9 text-xs"
        />

        <div className="w-full md:w-80">
          <SearchInput
            placeholder="Cari no. masuk atau bahan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <DataTable<StockInRecord>
          columns={columns}
          data={filteredRecords}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
          selectable={false}
          emptyTitle="BELUM ADA STOK MASUK"
          emptyDescription="Catat penerimaan bahan baku yang masuk dari vendor atau pembelian langsung."
          entityName="stok masuk"
        />
      </div>

      {/* Drawer: Catat Stok Masuk */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleClose}
        title="Catat Stok Masuk Baru"
        subtitle="Input penerimaan fisik bahan baku yang masuk ke gudang outlet"
        size="md"
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            <Button variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              className="bg-[#FF5C38] hover:bg-[#EE4E2A]"
              leftIcon={<CheckCircle2 className="size-4 stroke-[2.5]" />}
            >
              Simpan Stok Masuk
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
              label="Jumlah Kuantitas Masuk"
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
            label="Sumber Penerimaan"
            required
            value={formSource}
            onChange={(e) => setFormSource(e.target.value)}
            options={[
              { value: 'Purchase Order', label: 'Purchase Order Vendor' },
              { value: 'Pembelian Langsung', label: 'Pembelian Langsung / Petty Cash' },
              { value: 'Transfer Gudang', label: 'Transfer Antar Gudang / Cabang' },
            ]}
          />

          <Textarea
            label="Catatan Penerimaan"
            rows={3}
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            placeholder="Kondisi barang, nomor batch, atau nama kurir pengantar..."
          />
        </div>
      </Drawer>
    </div>
  );
}
