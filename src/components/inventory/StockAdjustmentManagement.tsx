'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Plus,
  Search,
  ChevronDown,
  Check,
  CheckCircle2,
  AlertTriangle,
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
  Pagination,
} from '@/components/common';

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

const INITIAL_ADJUSTMENTS: StockAdjustmentRecord[] = [
  {
    id: 'adj-1',
    refNumber: 'ADJ-2026-10-015',
    date: '14 Okt 2026, 22:00',
    ingredientName: 'Biji Kopi Arabica',
    systemStock: 5.5,
    physicalStock: 5.2,
    diffQty: -0.3,
    unit: 'kg',
    reason: 'Sisa serbuk di hopper grinder espresso.',
    picName: 'Andi Pratama',
    status: 'Selesai',
  },
  {
    id: 'adj-2',
    refNumber: 'ADJ-2026-10-014',
    date: '13 Okt 2026, 22:00',
    ingredientName: 'Susu UHT Full Cream',
    systemStock: 12,
    physicalStock: 12,
    diffQty: 0,
    unit: 'liter',
    reason: 'Opname rutin tutup shift malam. Cocok.',
    picName: 'Siti Rahma',
    status: 'Selesai',
  },
  {
    id: 'adj-3',
    refNumber: 'ADJ-2026-10-013',
    date: '10 Okt 2026, 22:00',
    ingredientName: 'Sirup Gula Aren',
    systemStock: 2,
    physicalStock: 1,
    diffQty: -1,
    unit: 'liter',
    reason: 'Botol pecah di rak penyimpanan belum dicatat.',
    picName: 'Budi Santoso',
    status: 'Selesai',
  },
];

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
  const [records, setRecords] = useState<StockAdjustmentRecord[]>(INITIAL_ADJUSTMENTS);
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formIngredient, setFormIngredient] = useState('Biji Kopi Arabica');
  const [formSystemStock, setFormSystemStock] = useState(5.2);
  const [formPhysicalStock, setFormPhysicalStock] = useState(5.2);
  const [formUnit, setFormUnit] = useState('kg');
  const [formNotes, setFormNotes] = useState('Stock opname fisik penutupan outlet');

  React.useEffect(() => {
    if (isCreateOpen) {
      setIsDrawerOpen(true);
    }
  }, [isCreateOpen]);

  const handleClose = () => {
    setIsDrawerOpen(false);
    if (onCloseCreate) onCloseCreate();
  };

  const handleIngredientChange = (ing: string) => {
    setFormIngredient(ing);
    if (ing.includes('Kopi')) {
      setFormSystemStock(5.2);
      setFormPhysicalStock(5.2);
      setFormUnit('kg');
    } else if (ing.includes('Susu')) {
      setFormSystemStock(12);
      setFormPhysicalStock(12);
      setFormUnit('liter');
    } else {
      setFormSystemStock(10);
      setFormPhysicalStock(10);
      setFormUnit('pcs');
    }
  };

  const handleSave = () => {
    const diff = Number(formPhysicalStock) - Number(formSystemStock);
    const newRecord: StockAdjustmentRecord = {
      id: `adj-${Date.now()}`,
      refNumber: `ADJ-2026-10-01${records.length + 1}`,
      date: '15 Okt 2026, 21:00',
      ingredientName: formIngredient,
      systemStock: Number(formSystemStock),
      physicalStock: Number(formPhysicalStock),
      diffQty: Number(diff.toFixed(2)),
      unit: formUnit,
      reason: formNotes,
      picName: 'Andi Pratama (Supervisor)',
      status: 'Selesai',
    };

    setRecords((prev) => [newRecord, ...prev]);
    onShowToast(`Penyesuaian stok opname ${newRecord.ingredientName} berhasil disimpan.`);
    handleClose();
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
            value={formIngredient}
            onChange={(e) => handleIngredientChange(e.target.value)}
            options={[
              { value: 'Biji Kopi Arabica', label: 'Biji Kopi Arabica (ING-001)' },
              { value: 'Susu UHT Full Cream', label: 'Susu UHT Full Cream (ING-003)' },
              { value: 'Susu Oat', label: 'Susu Oat (ING-004)' },
              { value: 'Sirup Gula Aren', label: 'Sirup Gula Aren (ING-007)' },
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
