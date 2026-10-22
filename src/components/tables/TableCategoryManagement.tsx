'use client';

import React, { useState } from 'react';
import {
  Tag,
  Plus,
  Search,
  ChevronDown,
  Edit2,
  Trash2,
  X,
  Check,
  Bookmark,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { DataTable, ColumnDef, StatusBadge } from '@/components/common';

export interface TableCategoryItem {
  id: string;
  name: string;
  slug: string;
  defaultCapacity: number;
  tableCount: number;
  status: 'Aktif' | 'Nonaktif';
  description?: string;
}

const INITIAL_CATEGORIES: TableCategoryItem[] = [
  {
    id: 'tcat-1',
    name: 'Meja Standar (2-4 Orang)',
    slug: 'meja-standar',
    defaultCapacity: 4,
    tableCount: 8,
    status: 'Aktif',
    description: 'Meja makan reguler untuk pasangan atau grup keluarga kecil.',
  },
  {
    id: 'tcat-2',
    name: 'Meja Bar & Stool',
    slug: 'meja-bar',
    defaultCapacity: 2,
    tableCount: 2,
    status: 'Aktif',
    description: 'Meja tinggi dekat counter espresso untuk pelanggan solo / laptop.',
  },
  {
    id: 'tcat-3',
    name: 'Sofa VIP & Rapat',
    slug: 'sofa-vip',
    defaultCapacity: 8,
    tableCount: 2,
    status: 'Aktif',
    description: 'Meja panjang dan sofa nyaman untuk reservasi kelompok besar.',
  },
];

interface TableCategoryManagementProps {
  onShowToast: (msg: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export function TableCategoryManagement({
  onShowToast,
  isCreateOpen,
  onCloseCreate,
}: TableCategoryManagementProps) {
  const [categories, setCategories] = useState<TableCategoryItem[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TableCategoryItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formCapacity, setFormCapacity] = useState<number>(4);
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [formDescription, setFormDescription] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  React.useEffect(() => {
    if (isCreateOpen) {
      handleCreateNew();
    }
  }, [isCreateOpen]);

  const handleCreateNew = () => {
    setEditingCategory(null);
    setFormName('');
    setFormCapacity(4);
    setFormStatus('Aktif');
    setFormDescription('');
    setIsDrawerOpen(true);
  };

  const handleEdit = (item: TableCategoryItem) => {
    setEditingCategory(item);
    setFormName(item.name);
    setFormCapacity(item.defaultCapacity);
    setFormStatus(item.status);
    setFormDescription(item.description || '');
    setIsDrawerOpen(true);
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
    setEditingCategory(null);
    if (onCloseCreate) onCloseCreate();
  };

  const handleSave = (isDraft = false) => {
    if (!formName.trim()) {
      alert('Nama kategori wajib diisi');
      return;
    }

    const slug = formName.toLowerCase().replace(/\s+/g, '-');
    const status = isDraft ? 'Nonaktif' : formStatus;

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: formName,
                slug,
                defaultCapacity: formCapacity,
                status,
                description: formDescription,
              }
            : c
        )
      );
    } else {
      const newCat: TableCategoryItem = {
        id: `tcat-${Date.now()}`,
        name: formName,
        slug,
        defaultCapacity: formCapacity,
        tableCount: 0,
        status,
        description: formDescription,
      };
      setCategories((prev) => [...prev, newCat]);
    }

    setIsDrawerOpen(false);
    setShowSuccessModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus kategori meja "${name}"?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      onShowToast(`Kategori "${name}" berhasil dihapus!`);
      if (editingCategory?.id === id) handleClose();
    }
  };

  const filteredCategories = categories.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCategories.length && filteredCategories.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCategories.map((c) => c.id));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const columns: ColumnDef<TableCategoryItem>[] = [
    {
      key: 'name',
      header: 'Kategori Meja',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-orange-600 shrink-0 shadow-2xs">
            <Tag className="size-4" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900 text-xs tracking-tight">{item.name}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">/{item.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'capacity',
      header: 'Kapasitas Standar',
      render: (item) => (
        <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md">
          {item.defaultCapacity} Kursi
        </span>
      ),
    },
    {
      key: 'tableCount',
      header: 'Total Meja',
      render: (item) => (
        <span className="text-xs font-medium text-neutral-800">{item.tableCount} Meja</span>
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
            title="Edit Kategori"
          >
            <Edit2 className="size-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id, item.name);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Hapus Kategori"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none hover:bg-neutral-50"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
          <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>

        <div className="relative flex-1 min-w-[260px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kategori meja..."
            className="w-full h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 placeholder-neutral-400 shadow-2xs focus:outline-none"
          />
          <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={toggleSelectRow}
        onToggleSelectAll={toggleSelectAll}
        onRowClick={(item) => handleEdit(item)}
        emptyTitle="BELUM ADA KATEGORI MEJA"
        emptyDescription="Kelompokkan jenis meja seperti Standar, Bar Stool, atau VIP."
        entityName="kategori meja"
      />

      {/* Drawer */}
      {isDrawerOpen && (
        <>
          <div
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[540px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="p-6 border-b border-neutral-100 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  {editingCategory ? 'Edit Kategori Meja' : 'Tambah Kategori Meja'}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Atur jenis peruntukan meja dan standar kapasitas tempat duduk.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="size-7 rounded-full bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Nama Kategori *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Meja Outdoor Sofa"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Kapasitas Kursi Standar</label>
                <input
                  type="number"
                  min="1"
                  value={formCapacity}
                  onChange={(e) => setFormCapacity(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus('Aktif')}
                    className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                      formStatus === 'Aktif'
                        ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                        : 'border-neutral-200 bg-white text-neutral-600'
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
                        : 'border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    Nonaktif
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Deskripsi Kategori</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Keterangan singkat..."
                  className="w-full p-3 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none resize-none"
                />
              </div>
            </div>

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
                <span>Simpan Kategori</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <>
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-[2px] transition-opacity" />
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
            <div className="w-full max-w-[480px] bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="size-24 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-6">
                <Check className="size-12 stroke-[3]" />
              </div>

              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                Kategori Meja Berhasil Disimpan!
              </h3>
              <p className="text-xs text-neutral-500 mt-2 max-w-[360px] leading-relaxed">
                Kategori meja berhasil disimpan dan siap dikelompokkan pada tata letak outlet.
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
                  Kembali ke Daftar Kategori
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
