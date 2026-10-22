'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Check,
  LayoutGrid,
  Coffee,
  Utensils,
  Cookie,
  Package,
  Edit2,
  Trash2,
  X,
  Percent,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import { DataTable, ColumnDef, StatusBadge } from '@/components/common';

export interface TypeItem {
  id: string;
  name: string;
  code: string;
  categoriesCount: number;
  itemCount: number;
  taxRate: number; // PB1 e.g. 10%
  status: 'Aktif' | 'Nonaktif';
  description?: string;
}

export const INITIAL_TYPES: TypeItem[] = [
  {
    id: 'type-1',
    name: 'Minuman',
    code: 'DRK',
    categoriesCount: 2,
    itemCount: 8,
    taxRate: 10,
    status: 'Aktif',
    description: 'Semua produk minuman kopi, non-kopi, artisan tea, dan mocktail.',
  },
  {
    id: 'type-2',
    name: 'Makanan',
    code: 'FOD',
    categoriesCount: 2,
    itemCount: 6,
    taxRate: 10,
    status: 'Aktif',
    description: 'Makanan utama (mains), bakery, pastry, dan dessert.',
  },
  {
    id: 'type-3',
    name: 'Cemilan',
    code: 'SNK',
    categoriesCount: 1,
    itemCount: 3,
    taxRate: 10,
    status: 'Aktif',
    description: 'Makanan ringan pendamping minuman dan finger food.',
  },
  {
    id: 'type-4',
    name: 'Lainnya',
    code: 'OTH',
    categoriesCount: 1,
    itemCount: 2,
    taxRate: 10,
    status: 'Aktif',
    description: 'Merchandise kopi seperti tumbler, totebag, dan coffee beans roast.',
  },
];

interface TypeManagementProps {
  onShowToast: (msg: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export function TypeManagement({ onShowToast, isCreateOpen, onCloseCreate }: TypeManagementProps) {
  const [types, setTypes] = useState<TypeItem[]>(INITIAL_TYPES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer / Modal for Edit / Create
  const [editingType, setEditingType] = useState<TypeItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedTypeName, setSavedTypeName] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formTaxRate, setFormTaxRate] = useState<number>(10);
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [formDescription, setFormDescription] = useState('');

  // Handle external trigger for create
  React.useEffect(() => {
    if (isCreateOpen) {
      handleCreateNew();
    }
  }, [isCreateOpen]);

  const handleCreateNew = () => {
    setEditingType(null);
    setFormName('');
    setFormCode('');
    setFormTaxRate(10);
    setFormStatus('Aktif');
    setFormDescription('');
    setIsDrawerOpen(true);
  };

  const handleEdit = (t: TypeItem) => {
    setEditingType(t);
    setFormName(t.name);
    setFormCode(t.code);
    setFormTaxRate(t.taxRate);
    setFormStatus(t.status);
    setFormDescription(t.description || '');
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingType(null);
    if (onCloseCreate) onCloseCreate();
  };

  const handleSave = (isDraft = false) => {
    if (!formName.trim()) {
      alert('Nama tipe wajib diisi');
      return;
    }

    const code =
      formCode.trim().toUpperCase() ||
      formName
        .trim()
        .substring(0, 3)
        .toUpperCase();
    const status = isDraft ? 'Nonaktif' : formStatus;

    if (editingType) {
      setTypes((prev) =>
        prev.map((t) =>
          t.id === editingType.id
            ? {
                ...t,
                name: formName,
                code,
                taxRate: formTaxRate,
                status,
                description: formDescription,
              }
            : t
        )
      );
    } else {
      const newType: TypeItem = {
        id: `type-${Date.now()}`,
        name: formName,
        code,
        categoriesCount: 0,
        itemCount: 0,
        taxRate: formTaxRate,
        status,
        description: formDescription,
      };
      setTypes((prev) => [...prev, newType]);
    }

    setSavedTypeName(formName);
    setIsDrawerOpen(false);
    setShowSuccessModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus tipe "${name}"?`)) {
      setTypes((prev) => prev.filter((t) => t.id !== id));
      onShowToast(`Tipe "${name}" berhasil dihapus!`);
      if (editingType?.id === id) {
        handleCloseDrawer();
      }
    }
  };

  // Filtered types
  const filteredTypes = useMemo(() => {
    return types.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [types, statusFilter, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredTypes.length && filteredTypes.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTypes.map((t) => t.id));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const columns: ColumnDef<TypeItem>[] = [
    {
      key: 'name',
      header: 'Nama Tipe',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
            {item.name === 'Minuman' ? (
              <Coffee className="size-4 text-blue-600" />
            ) : item.name === 'Makanan' ? (
              <Utensils className="size-4 text-blue-600" />
            ) : item.name === 'Cemilan' ? (
              <Cookie className="size-4 text-blue-600" />
            ) : (
              <Package className="size-4 text-blue-600" />
            )}
          </div>
          <div>
            <p className="font-semibold text-neutral-900 text-xs tracking-tight">{item.name}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Kode: {item.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'categoriesCount',
      header: 'Kategori Terhubung',
      render: (item) => (
        <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md">
          {item.categoriesCount} Kategori
        </span>
      ),
    },
    {
      key: 'itemCount',
      header: 'Jumlah Menu',
      render: (item) => (
        <span className="text-xs font-medium text-neutral-800">{item.itemCount} Menu</span>
      ),
    },
    {
      key: 'taxRate',
      header: 'Pajak PB1',
      render: (item) => (
        <span className="text-xs font-mono font-medium text-neutral-600 bg-neutral-50 border border-neutral-200/60 px-2 py-0.5 rounded">
          {item.taxRate}%
        </span>
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            title="Edit Tipe"
          >
            <Edit2 className="size-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id, item.name);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Hapus Tipe"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters Bar: Clean individual pills directly on background */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none focus:border-neutral-400 hover:bg-neutral-50"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
          <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>

        {/* Search input with right dropdown icon matching design */}
        <div className="relative flex-1 min-w-[260px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama tipe atau kode..."
            className="w-full h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 placeholder-neutral-400 shadow-2xs focus:outline-none focus:border-neutral-400"
          />
          <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Types DataTable */}
      <DataTable
        columns={columns}
        data={filteredTypes}
        keyExtractor={(item) => item.id}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={toggleSelectRow}
        onToggleSelectAll={toggleSelectAll}
        onRowClick={(item) => handleEdit(item)}
        emptyTitle="BELUM ADA TIPE"
        emptyDescription="Tambahkan tipe untuk mengorganisasi kelompok menu utama."
        entityName="tipe"
      />

      {/* Slide-over Drawer for Add/Edit Type */}
      {isDrawerOpen && (
        <>
          <div
            onClick={handleCloseDrawer}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[600px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  {editingType ? 'Edit Tipe' : 'Tambah Tipe'}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Lengkapi data klasifikasi tipe dan pengaturan pajak restoran.
                </p>
              </div>

              <button
                onClick={handleCloseDrawer}
                className="size-7 rounded-full bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Form Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Field: Nama Tipe */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">
                  Nama Tipe <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingType) {
                      setFormCode(
                        e.target.value
                          .trim()
                          .substring(0, 3)
                          .toUpperCase()
                      );
                    }
                  }}
                  placeholder="Contoh: Minuman, Makanan, Merchandise"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs"
                />
              </div>

              {/* Field: Kode Singkat Tipe */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Kode Singkat (3 Karakter)</label>
                <input
                  type="text"
                  maxLength={5}
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="DRK"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-700 focus:outline-none focus:border-neutral-400 shadow-2xs bg-neutral-50/50 uppercase"
                />
              </div>

              {/* Field: Pajak PB1 Default */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Pajak PB1 Default (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formTaxRate}
                    onChange={(e) => setFormTaxRate(Number(e.target.value))}
                    className="w-full h-10 pl-3.5 pr-8 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs"
                  />
                  <Percent className="size-3.5 text-neutral-400 absolute right-3 top-3.5 pointer-events-none" />
                </div>
                <p className="text-[11px] text-neutral-400">
                  Persentase pajak restoran (PB1) standar yang dikenakan pada item dalam tipe ini.
                </p>
              </div>

              {/* Field: Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus('Aktif')}
                    className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                      formStatus === 'Aktif'
                        ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    Aktif
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('Nonaktif')}
                    className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                      formStatus === 'Nonaktif'
                        ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    Nonaktif
                  </button>
                </div>
              </div>

              {/* Field: Deskripsi */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Deskripsi Tipe</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Keterangan singkat tipe ini..."
                  className="w-full p-3 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs resize-none"
                />
              </div>
            </div>

            {/* Footer matching Tambah Menu styling */}
            <div className="p-4 px-6 border-t border-neutral-100 flex items-center justify-between gap-4 bg-white">
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold transition-colors"
              >
                <Bookmark className="size-4" />
                <span>Simpan sebagai Draf</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                className="inline-flex items-center gap-2 h-11 px-7 rounded-xl bg-[#E5484D] hover:bg-[#D9383D] text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                <CheckCircle2 className="size-4 stroke-[2.5]" />
                <span>Simpan Tipe</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* SUCCESS MODAL matching Screenshot 1 */}
      {showSuccessModal && (
        <>
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-[2px] transition-opacity" />
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
            <div className="w-full max-w-[480px] bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="size-24 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-6">
                <Check className="size-12 stroke-[3]" />
              </div>

              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                Tipe Menu Berhasil Ditambahkan!
              </h3>
              <p className="text-xs text-neutral-500 mt-2 max-w-[360px] leading-relaxed">
                Tipe &quot;{savedTypeName}&quot; berhasil disimpan dan sudah aktif untuk mengelompokkan kategori dan menu outlet.
              </p>

              <div className="grid grid-cols-2 gap-3 w-full mt-8">
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="h-11 rounded-2xl border border-red-200 hover:bg-red-50/50 text-[#E5484D] text-xs font-semibold transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="h-11 rounded-2xl bg-[#FF5C38] hover:bg-[#EE4E2A] text-white text-xs font-semibold transition-colors shadow-2xs"
                >
                  Kembali ke Daftar Tipe
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
