'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Check,
  CheckCircle2,
} from 'lucide-react';
import {
  DataTable,
  ColumnDef,
  StatusBadge,
  Button,
  Select,
  SearchInput,
  Drawer,
  Input,
  Textarea,
} from '@/components/common';
import { inventoryService } from '@/services/inventory.service';
import { catalogService } from '@/services/catalog.service';

export interface StockAdjustmentRecord {
  id: string;
  refNumber: string;
  date: string;
  ingredientName: string;
  systemStock: number;
  physicalStock: number;
  diffQty: number;
  unit: string;
  reason: string;
  picName: string;
  status: 'Selesai' | 'Perlu Review';
}

interface StockAdjustmentManagementProps {
  onShowToast: (msg: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export function StockAdjustmentManagement({
  onShowToast,
  isCreateOpen,
  onCloseCreate,
}: StockAdjustmentManagementProps) {
  const [records, setRecords] = useState<StockAdjustmentRecord[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [stocks, setStocks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formIngredientId, setFormIngredientId] = useState('');
  const [formSystemStock, setFormSystemStock] = useState(0);
  const [formPhysicalStock, setFormPhysicalStock] = useState(0);
  const [formUnit, setFormUnit] = useState('unit');
  const [formNotes, setFormNotes] = useState('');

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [movRes, ingRes, stkRes] = await Promise.allSettled([
        inventoryService.getMovements({ type: 'ADJUSTMENT' }),
        catalogService.getIngredients(),
        inventoryService.getStocks(),
      ]);

      const rawMov = movRes.status === 'fulfilled' ? (movRes.value?.data as any) : null;
      const movList = Array.isArray(rawMov) ? rawMov : Array.isArray(rawMov?.data) ? rawMov.data : [];
      const ingList = ingRes.status === 'fulfilled' && Array.isArray(ingRes.value?.data) ? ingRes.value.data : [];
      const stkList = stkRes.status === 'fulfilled' && Array.isArray(stkRes.value?.data) ? stkRes.value.data : [];

      setIngredients(ingList);
      setStocks(stkList);

      const mapped: StockAdjustmentRecord[] = movList.map((m: any) => {
        const diff = Number(m.quantity || 0);
        const rawNotes = String(m.notes || '');
        const match = rawNotes.match(/^\[System:([\d.]+)\|Fisik:([\d.]+)\]\s*(.*)$/);
        const sysStock = match ? Number(match[1]) : 0;
        const phyStock = match ? Number(match[2]) : sysStock + diff;
        const cleanReason = match ? match[3] : rawNotes;

        return {
          id: m.id,
          refNumber: `ADJ-${String(m.id || '').slice(-6).toUpperCase()}`,
          date: m.created_at ? new Date(m.created_at).toLocaleString('id-ID') : '-',
          ingredientName: m.ingredient?.name || '-',
          systemStock: sysStock,
          physicalStock: phyStock,
          diffQty: Number(diff.toFixed(2)),
          unit: m.unit?.code || m.unit?.name || m.ingredient?.unit?.code || 'unit',
          reason: cleanReason || '-',
          picName: m.created_by_name || 'Staf Outlet',
          status: 'Selesai',
        };
      });

      setRecords(mapped);
    } catch (err) {
      console.error('Failed to load stock adjustments:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleIngredientChange = useCallback(
    (ingId: string) => {
      setFormIngredientId(ingId);
      const ing = ingredients.find((i) => i.id === ingId);
      const stk = stocks.find((s) => s.ingredient_id === ingId);
      const currentQty = Number(stk?.quantity ?? ing?.current_stock ?? 0);
      setFormSystemStock(currentQty);
      setFormPhysicalStock(currentQty);
      setFormUnit(ing?.unit?.code || ing?.unit?.name || 'unit');
    },
    [ingredients, stocks]
  );

  useEffect(() => {
    if (isCreateOpen) {
      if (ingredients.length > 0 && !formIngredientId) {
        handleIngredientChange(ingredients[0].id);
      }
      setIsDrawerOpen(true);
    }
  }, [isCreateOpen, ingredients, formIngredientId, handleIngredientChange]);

  const handleClose = () => {
    setIsDrawerOpen(false);
    if (onCloseCreate) onCloseCreate();
  };

  const handleSave = async () => {
    if (!formIngredientId) {
      onShowToast('Pilih bahan baku yang akan di-opname!');
      return;
    }

    try {
      await inventoryService.adjustStock({
        ingredient_id: formIngredientId,
        new_quantity: Number(formPhysicalStock),
        notes: formNotes.trim() || 'Stock opname fisik gudang',
      });

      const ing = ingredients.find((i) => i.id === formIngredientId);
      onShowToast(`Penyesuaian stok opname ${ing?.name || ''} berhasil disimpan.`);
      setFormNotes('');
      await fetchData();
      handleClose();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menyimpan penyesuaian stok.');
    }
  };

  const filteredRecords = records.filter((r) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = r.refNumber.toLowerCase().includes(q);
      const matchIng = r.ingredientName.toLowerCase().includes(q);
      if (!matchRef && !matchIng) return false;
    }
    return true;
  });

  const columns: ColumnDef<StockAdjustmentRecord>[] = [
    {
      key: 'refNumber',
      header: 'No. Opname',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs font-mono">{item.refNumber}</span>
      ),
    },
    {
      key: 'date',
      header: 'Waktu Opname',
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
      key: 'systemStock',
      header: 'Stok Sistem',
      render: (item) => (
        <span className="text-neutral-600 text-xs font-mono">
          {item.systemStock} {item.unit}
        </span>
      ),
    },
    {
      key: 'physicalStock',
      header: 'Stok Fisik',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs font-mono">
          {item.physicalStock} {item.unit}
        </span>
      ),
    },
    {
      key: 'diffQty',
      header: 'Selisih',
      render: (item) => {
        if (item.diffQty === 0) {
          return <span className="text-neutral-500 text-xs font-mono">0 {item.unit} (Sesuai)</span>;
        }
        return (
          <span
            className={`font-bold text-xs font-mono ${
              item.diffQty > 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {item.diffQty > 0 ? `+${item.diffQty}` : item.diffQty} {item.unit}
          </span>
        );
      },
    },
    {
      key: 'picName',
      header: 'Petugas Opname',
      render: (item) => <span className="text-neutral-700 text-xs">{item.picName}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge variant="success" icon={<Check className="size-3" />}>
          {item.status}
        </StatusBadge>
      ),
    },
  ];

  const diffPreview = Number(formPhysicalStock) - Number(formSystemStock);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="text-xs text-neutral-500 font-medium">
          Daftar berita acara stock opname dan penyesuaian fisik barang gudang.
        </div>

        <div className="w-full md:w-80">
          <SearchInput
            placeholder="Cari no. opname atau bahan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <DataTable<StockAdjustmentRecord>
          columns={columns}
          data={filteredRecords}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
          selectable={false}
          emptyTitle="BELUM ADA PENYESUAIAN STOK"
          emptyDescription="Lakukan stock opname fisik gudang untuk mencocokkan stok aktual dengan sistem."
          entityName="penyesuaian stok"
        />
      </div>

      {/* Drawer: Input Penyesuaian Stok */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleClose}
        title="Input Penyesuaian Stok (Opname)"
        subtitle="Cocokkan jumlah fisik riil di gudang dengan pencatatan sistem"
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
              Simpan Penyesuaian
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <Select
            label="Pilih Bahan Baku yang Dihitung"
            required
            value={formIngredientId}
            onChange={(e) => handleIngredientChange(e.target.value)}
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
              label={`Stok Sistem Tercatat (${formUnit})`}
              type="number"
              value={formSystemStock}
              disabled
              className="bg-neutral-50 font-mono"
            />
            <Input
              label={`Stok Fisik Aktual (${formUnit})`}
              type="number"
              step="0.1"
              value={formPhysicalStock}
              onChange={(e) => setFormPhysicalStock(Number(e.target.value))}
              className="font-mono font-bold"
            />
          </div>

          <div className="p-3.5 rounded-xl border border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs">
            <span className="text-neutral-600">Selisih Penyesuaian:</span>
            <span
              className={`font-mono font-bold ${
                diffPreview === 0
                  ? 'text-neutral-600'
                  : diffPreview > 0
                  ? 'text-emerald-600'
                  : 'text-red-600'
              }`}
            >
              {diffPreview > 0 ? `+${diffPreview.toFixed(2)}` : diffPreview.toFixed(2)} {formUnit}
            </span>
          </div>

          <Textarea
            label="Keterangan Selisih Opname"
            rows={3}
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            placeholder="Jelaskan alasan jika ada selisih stok fisik..."
          />
        </div>
      </Drawer>
    </div>
  );
}
