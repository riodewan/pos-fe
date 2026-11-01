'use client';

import React, { useState } from 'react';
import {
  ArrowUpRight,
  Plus,
  Search,
  ChevronDown,
  AlertTriangle,
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
  Pagination,
} from '@/components/common';

export interface StockOutRecord {
  id: string;
  refNumber: string;
  date: string;
  ingredientName: string;
  qty: number;
  unit: string;
  reason: 'Bahan Kedaluwarsa' | 'Kemasan Rusak / Bocor' | 'Gagal Racik (Spill)' | 'Uji Rasa / Demo' | 'Lainnya';
  picName: string;
  notes?: string;
}

const INITIAL_STOCK_OUT: StockOutRecord[] = [
  {
    id: 'out-1',
    refNumber: 'OUT-2026-10-032',
    date: '14 Okt 2026, 17:00',
    ingredientName: 'Susu UHT Full Cream',
    qty: 1,
    unit: 'liter',
    reason: 'Gagal Racik (Spill)',
    picName: 'Andi Pratama',
    notes: 'Tumpah saat proses frothing susu rush hour.',
  },
  {
    id: 'out-2',
    refNumber: 'OUT-2026-10-031',
    date: '13 Okt 2026, 21:30',
    ingredientName: 'Sirup Vanilla',
    qty: 0.2,
    unit: 'liter',
    reason: 'Uji Rasa / Demo',
    picName: 'Siti Rahma',
    notes: 'Kalibrasi rasa menu seasonal baru.',
  },
  {
    id: 'out-3',
    refNumber: 'OUT-2026-10-030',
    date: '10 Okt 2026, 11:15',
    ingredientName: 'Biji Kopi Arabica',
    qty: 0.5,
    unit: 'kg',
    reason: 'Kemasan Rusak / Bocor',
    picName: 'Budi Santoso',
    notes: 'Kemasan sobek terkena cutter saat unboxing.',
  },
];

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
  const [records, setRecords] = useState<StockOutRecord[]>(INITIAL_STOCK_OUT);
  const [searchQuery, setSearchQuery] = useState('');
  const [reasonFilter, setReasonFilter] = useState('all');

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formIngredient, setFormIngredient] = useState('Susu UHT Full Cream');
  const [formQty, setFormQty] = useState(1);
  const [formUnit, setFormUnit] = useState('liter');
  const [formReason, setFormReason] = useState<StockOutRecord['reason']>('Gagal Racik (Spill)');
  const [formNotes, setFormNotes] = useState('');

  React.useEffect(() => {
    if (isCreateOpen) {
      setIsDrawerOpen(true);
    }
  }, [isCreateOpen]);

  const handleClose = () => {
    setIsDrawerOpen(false);
    if (onCloseCreate) onCloseCreate();
  };

  const handleSave = () => {
    const newRecord: StockOutRecord = {
      id: `out-${Date.now()}`,
      refNumber: `OUT-2026-10-03${records.length + 1}`,
      date: '15 Okt 2026, 12:00',
      ingredientName: formIngredient,
      qty: Number(formQty),
      unit: formUnit,
      reason: formReason,
      picName: 'Andi Pratama (Kasir)',
      notes: formNotes,
    };

    setRecords((prev) => [newRecord, ...prev]);
    onShowToast(`Stok keluar ${newRecord.qty} ${newRecord.unit} ${newRecord.ingredientName} tercatat.`);
    handleClose();
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
            value={formIngredient}
            onChange={(e) => setFormIngredient(e.target.value)}
            options={[
              { value: 'Susu UHT Full Cream', label: 'Susu UHT Full Cream (ING-003)' },
              { value: 'Biji Kopi Arabica', label: 'Biji Kopi Arabica (ING-001)' },
              { value: 'Sirup Vanilla', label: 'Sirup Vanilla (ING-008)' },
              { value: 'Sirup Gula Aren', label: 'Sirup Gula Aren (ING-007)' },
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
            <Select
              label="Satuan"
              value={formUnit}
              onChange={(e) => setFormUnit(e.target.value)}
              options={[
                { value: 'liter', label: 'liter' },
                { value: 'kg', label: 'kg' },
                { value: 'pcs', label: 'pcs' },
              ]}
            />
          </div>

          <Select
            label="Alasan Pengeluaran"
            required
            value={formReason}
            onChange={(e) => setFormReason(e.target.value as any)}
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
