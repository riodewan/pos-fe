'use client';

import React, { useState } from 'react';
import {
  ArrowDownLeft,
  Plus,
  Search,
  ChevronDown,
  Check,
  CheckCircle2,
  Calendar,
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

export interface StockInRecord {
  id: string;
  refNumber: string;
  date: string;
  ingredientName: string;
  qty: number;
  unit: string;
  sourceType: 'Purchase Order' | 'Pembelian Langsung' | 'Retur Konsumen' | 'Transfer Gudang';
  receiverName: string;
  notes?: string;
}

const INITIAL_STOCK_IN: StockInRecord[] = [
  {
    id: 'in-1',
    refNumber: 'IN-2026-10-089',
    date: '14 Okt 2026, 14:30',
    ingredientName: 'Biji Kopi Arabica',
    qty: 15,
    unit: 'kg',
    sourceType: 'Purchase Order',
    receiverName: 'Andi Pratama',
    notes: 'Kondisi kemasan rapi dan segel utuh.',
  },
  {
    id: 'in-2',
    refNumber: 'IN-2026-10-088',
    date: '13 Okt 2026, 10:15',
    ingredientName: 'Susu UHT Full Cream',
    qty: 40,
    unit: 'liter',
    sourceType: 'Purchase Order',
    receiverName: 'Siti Rahma',
    notes: 'Masuk chiller bar utama.',
  },
  {
    id: 'in-3',
    refNumber: 'IN-2026-10-087',
    date: '12 Okt 2026, 16:45',
    ingredientName: 'Sirup Gula Aren',
    qty: 10,
    unit: 'liter',
    sourceType: 'Pembelian Langsung',
    receiverName: 'Andi Pratama',
    notes: 'Beli darurat di pasar modern.',
  },
  {
    id: 'in-4',
    refNumber: 'IN-2026-10-086',
    date: '11 Okt 2026, 09:00',
    ingredientName: 'Matcha Powder',
    qty: 2,
    unit: 'kg',
    sourceType: 'Transfer Gudang',
    receiverName: 'Budi Santoso',
    notes: 'Mutasi dari gudang pusat.',
  },
];

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
  const [records, setRecords] = useState<StockInRecord[]>(INITIAL_STOCK_IN);
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formIngredient, setFormIngredient] = useState('Biji Kopi Arabica');
  const [formQty, setFormQty] = useState(10);
  const [formUnit, setFormUnit] = useState('kg');
  const [formSource, setFormSource] = useState<StockInRecord['sourceType']>('Purchase Order');
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
    const newRecord: StockInRecord = {
      id: `in-${Date.now()}`,
      refNumber: `IN-2026-10-09${records.length + 1}`,
      date: '15 Okt 2026, 10:00',
      ingredientName: formIngredient,
      qty: Number(formQty),
      unit: formUnit,
      sourceType: formSource,
      receiverName: 'Andi Pratama (Kasir)',
      notes: formNotes,
    };

    setRecords((prev) => [newRecord, ...prev]);
    onShowToast(`Stok masuk ${newRecord.qty} ${newRecord.unit} ${newRecord.ingredientName} tercatat.`);
    handleClose();
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
          keyExtractor={(item) => item.id}
          selectable={false}
          emptyTitle="BELUM ADA STOK MASUK"
          emptyDescription="Catat penerimaan bahan baku yang masuk dari vendor atau pembelian langsung."
          entityName="stok masuk"
        />

        <Pagination
          totalItems={filteredRecords.length}
          totalPages={1}
          currentPage={1}
          itemsPerPage={10}
          onPageChange={() => {}}
          itemName="stok masuk"
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
            value={formIngredient}
            onChange={(e) => setFormIngredient(e.target.value)}
            options={[
              { value: 'Biji Kopi Arabica', label: 'Biji Kopi Arabica (ING-001)' },
              { value: 'Susu UHT Full Cream', label: 'Susu UHT Full Cream (ING-003)' },
              { value: 'Susu Oat', label: 'Susu Oat (ING-004)' },
              { value: 'Sirup Gula Aren', label: 'Sirup Gula Aren (ING-007)' },
              { value: 'Matcha Powder', label: 'Matcha Powder (ING-005)' },
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
            <Select
              label="Satuan"
              value={formUnit}
              onChange={(e) => setFormUnit(e.target.value)}
              options={[
                { value: 'kg', label: 'kg' },
                { value: 'liter', label: 'liter' },
                { value: 'pcs', label: 'pcs' },
              ]}
            />
          </div>

          <Select
            label="Sumber Penerimaan"
            required
            value={formSource}
            onChange={(e) => setFormSource(e.target.value as any)}
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
