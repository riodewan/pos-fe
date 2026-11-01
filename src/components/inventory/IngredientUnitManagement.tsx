'use client';

import React, { useState } from 'react';
import {
  Scale,
  Plus,
  Search,
  ChevronDown,
  Edit2,
  Trash2,
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
  Modal,
  Input,
  FormField,
  Pagination,
} from '@/components/common';

export interface IngredientUnitItem {
  id: string;
  name: string;
  symbol: string;
  type: 'Berat' | 'Volume' | 'Kuantitas' | 'Lainnya';
  status: 'Aktif' | 'Nonaktif';
}

const INITIAL_UNITS: IngredientUnitItem[] = [
  { id: 'u-1', name: 'Kilogram', symbol: 'kg', type: 'Berat', status: 'Aktif' },
  { id: 'u-2', name: 'Gram', symbol: 'g', type: 'Berat', status: 'Aktif' },
  { id: 'u-3', name: 'Liter', symbol: 'liter', type: 'Volume', status: 'Aktif' },
  { id: 'u-4', name: 'Mililiter', symbol: 'ml', type: 'Volume', status: 'Aktif' },
  { id: 'u-5', name: 'Pieces / Buah', symbol: 'pcs', type: 'Kuantitas', status: 'Aktif' },
  { id: 'u-6', name: 'Porsi / Sachet', symbol: 'porsi', type: 'Kuantitas', status: 'Aktif' },
  { id: 'u-7', name: 'Pack / Dus', symbol: 'pack', type: 'Kuantitas', status: 'Aktif' },
];

interface IngredientUnitManagementProps {
  onShowToast: (msg: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export function IngredientUnitManagement({
  onShowToast,
  isCreateOpen,
  onCloseCreate,
}: IngredientUnitManagementProps) {
  const [units, setUnits] = useState<IngredientUnitItem[]>(INITIAL_UNITS);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Drawer
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<IngredientUnitItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formSymbol, setFormSymbol] = useState('');
  const [formType, setFormType] = useState<IngredientUnitItem['type']>('Berat');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<IngredientUnitItem | null>(null);

  React.useEffect(() => {
    if (isCreateOpen) {
      handleCreateNew();
    }
  }, [isCreateOpen]);

  const handleCreateNew = () => {
    setEditingUnit(null);
    setFormName('');
    setFormSymbol('');
    setFormType('Berat');
    setFormStatus('Aktif');
    setIsDrawerOpen(true);
  };

  const handleEdit = (item: IngredientUnitItem) => {
    setEditingUnit(item);
    setFormName(item.name);
    setFormSymbol(item.symbol);
    setFormType(item.type);
    setFormStatus(item.status);
    setIsDrawerOpen(true);
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
    if (onCloseCreate) onCloseCreate();
  };

  const handleSave = () => {
    if (!formName.trim() || !formSymbol.trim()) {
      onShowToast('Nama dan simbol satuan wajib diisi!');
      return;
    }

    if (editingUnit) {
      setUnits((prev) =>
        prev.map((u) =>
          u.id === editingUnit.id
            ? {
                ...u,
                name: formName,
                symbol: formSymbol.toLowerCase(),
                type: formType,
                status: formStatus,
              }
            : u
        )
      );
      onShowToast(`Satuan "${formName}" berhasil diperbarui.`);
    } else {
      const newUnit: IngredientUnitItem = {
        id: `u-${Date.now()}`,
        name: formName,
        symbol: formSymbol.toLowerCase(),
        type: formType,
        status: formStatus,
      };
      setUnits((prev) => [...prev, newUnit]);
      onShowToast(`Satuan baru "${formName}" (${formSymbol}) berhasil ditambahkan.`);
    }

    handleClose();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setUnits((prev) => prev.filter((u) => u.id !== deleteTarget.id));
    onShowToast(`Satuan "${deleteTarget.name}" berhasil dihapus.`);
    setDeleteTarget(null);
  };

  const filteredUnits = units.filter((u) => {
    if (typeFilter !== 'all' && u.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.name.toLowerCase().includes(q);
      const matchSym = u.symbol.toLowerCase().includes(q);
      if (!matchName && !matchSym) return false;
    }
    return true;
  });

  const columns: ColumnDef<IngredientUnitItem>[] = [
    {
      key: 'name',
      header: 'Nama Satuan Ukur',
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1976D2]">
            <Scale className="size-4" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900 text-xs">{item.name}</p>
            <p className="text-[11px] text-neutral-400 font-mono">Simbol: {item.symbol}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'symbol',
      header: 'Simbol',
      render: (item) => (
        <span className="font-mono font-medium text-xs text-neutral-800 px-2 py-0.5 rounded bg-neutral-100">
          {item.symbol}
        </span>
      ),
    },
    {
      key: 'type',
      header: 'Kategori Besaran',
      render: (item) => (
        <span className="text-neutral-700 text-xs font-medium">{item.type}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge
          variant={item.status === 'Aktif' ? 'success' : 'neutral'}
          icon={item.status === 'Aktif' ? <Check className="size-3" /> : undefined}
        >
          {item.status}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
            title="Edit Satuan"
          >
            <Edit2 className="size-3.5 text-neutral-500" />
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(item);
            }}
            title="Hapus Satuan"
            className="hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          options={[
            { value: 'all', label: 'Semua Besaran' },
            { value: 'Berat', label: 'Berat' },
            { value: 'Volume', label: 'Volume' },
            { value: 'Kuantitas', label: 'Kuantitas' },
          ]}
          className="w-40 h-9 text-xs"
        />

        <div className="w-full md:w-80">
          <SearchInput
            placeholder="Cari satuan atau simbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <DataTable<IngredientUnitItem>
          columns={columns}
          data={filteredUnits}
          keyExtractor={(item) => item.id}
          selectable={false}
          onRowClick={handleEdit}
          emptyTitle="BELUM ADA SATUAN UKUR"
          emptyDescription="Tambahkan satuan ukur untuk mendukung penimbangan bahan dan resep menu."
          entityName="satuan"
        />
      </div>

      {/* Drawer: Form Satuan */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleClose}
        title={editingUnit ? 'Edit Satuan Ukur' : 'Tambah Satuan Ukur'}
        subtitle="Atur nama satuan dan simbol penakaran bahan baku"
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
              Simpan Satuan
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <Input
            label="Nama Satuan"
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Contoh: Kilogram"
          />

          <Input
            label="Simbol Singkat"
            required
            value={formSymbol}
            onChange={(e) => setFormSymbol(e.target.value.toLowerCase())}
            placeholder="kg"
            className="font-mono"
            hint="Simbol ringkas yang muncul pada label resep dan stok (misal: kg, liter, pcs)."
          />

          <Select
            label="Kategori Besaran"
            required
            value={formType}
            onChange={(e) => setFormType(e.target.value as any)}
            options={[
              { value: 'Berat', label: 'Berat (Massa)' },
              { value: 'Volume', label: 'Volume (Cair)' },
              { value: 'Kuantitas', label: 'Kuantitas (Satuan Hitung / Pcs)' },
              { value: 'Lainnya', label: 'Lainnya' },
            ]}
          />

          <FormField label="Status">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={formStatus === 'Aktif' ? 'soft' : 'outline'}
                onClick={() => setFormStatus('Aktif')}
                className={`h-9 text-xs font-semibold ${
                  formStatus === 'Aktif' ? 'border-[#E5484D] text-[#E5484D] bg-red-50' : ''
                }`}
              >
                Aktif
              </Button>
              <Button
                variant={formStatus === 'Nonaktif' ? 'soft' : 'outline'}
                onClick={() => setFormStatus('Nonaktif')}
                className={`h-9 text-xs font-semibold ${
                  formStatus === 'Nonaktif' ? 'border-[#E5484D] text-[#E5484D] bg-red-50' : ''
                }`}
              >
                Nonaktif
              </Button>
            </div>
          </FormField>
        </div>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Satuan Ukur"
        subtitle="Apakah Anda yakin ingin menghapus satuan ukur ini? Satuan tidak dapat dihapus jika masih digunakan pada bahan aktif."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDelete}>
              Ya, Hapus Satuan
            </Button>
          </div>
        }
      >
        <div className="py-2 text-xs text-neutral-600">
          Satuan: <strong className="text-neutral-900">{deleteTarget?.name}</strong> ({deleteTarget?.symbol})
        </div>
      </Modal>
    </div>
  );
}
