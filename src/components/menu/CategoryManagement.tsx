'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  MoreVertical,
  Check,
  Tag,
  Coffee,
  Utensils,
  Cookie,
  Edit2,
  Trash2,
  X,
  Layers,
} from 'lucide-react';
import { DataTable, ColumnDef, StatusBadge } from '@/components/common';

export interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  type: 'Minuman' | 'Makanan' | 'Cemilan' | 'Lainnya';
  itemCount: number;
  sortOrder: number;
  status: 'Aktif' | 'Nonaktif';
  description?: string;
}

export const INITIAL_CATEGORIES: CategoryItem[] = [
  {
    id: 'cat-1',
    name: 'Kopi',
    slug: 'kopi',
    type: 'Minuman',
    itemCount: 5,
    sortOrder: 1,
    status: 'Aktif',
    description: 'Semua racikan espresso based, manual brew, dan signature coffee.',
  },
  {
    id: 'cat-2',
    name: 'Non-Kopi',
    slug: 'non-kopi',
    type: 'Minuman',
    itemCount: 3,
    sortOrder: 2,
    status: 'Aktif',
    description: 'Minuman teh, artisan tea, cokelat, dan susu aneka rasa.',
  },
  {
    id: 'cat-3',
    name: 'Pastry',
    slug: 'pastry',
    type: 'Makanan',
    itemCount: 2,
    sortOrder: 3,
    status: 'Aktif',
    description: 'Croissant panggang renyah, muffin, dan roti artisan.',
  },
  {
    id: 'cat-4',
    name: 'Makanan Berat',
    slug: 'makanan-berat',
    type: 'Makanan',
    itemCount: 4,
    sortOrder: 4,
    status: 'Aktif',
    description: 'Aneka nasi bowl, pasta, sandwich, dan olahan ayam.',
  },
  {
    id: 'cat-5',
    name: 'Snack & Bites',
    slug: 'snack-bites',
    type: 'Cemilan',
    itemCount: 3,
    sortOrder: 5,
    status: 'Aktif',
    description: 'Camilan pendamping kopi seperti french fries, churros, dan nachos.',
  },
  {
    id: 'cat-6',
    name: 'Dessert',
    slug: 'dessert',
    type: 'Makanan',
    itemCount: 2,
    sortOrder: 6,
    status: 'Aktif',
    description: 'Puding, cheesecake, dan es krim segar.',
  },
];

interface CategoryManagementProps {
  onShowToast: (msg: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export function CategoryManagement({ onShowToast, isCreateOpen, onCloseCreate }: CategoryManagementProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer / Modal for Edit / Create
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formType, setFormType] = useState<'Minuman' | 'Makanan' | 'Cemilan' | 'Lainnya'>('Minuman');
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [formDescription, setFormDescription] = useState('');

  // Handle external trigger for create
  React.useEffect(() => {
    if (isCreateOpen) {
      handleCreateNew();
    }
  }, [isCreateOpen]);

  const handleCreateNew = () => {
    setEditingCategory(null);
    setFormName('');
    setFormSlug('');
    setFormType('Minuman');
    setFormSortOrder(categories.length + 1);
    setFormStatus('Aktif');
    setFormDescription('');
    setIsDrawerOpen(true);
  };

  const handleEdit = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormType(cat.type);
    setFormSortOrder(cat.sortOrder);
    setFormStatus(cat.status);
    setFormDescription(cat.description || '');
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingCategory(null);
    if (onCloseCreate) onCloseCreate();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Nama kategori wajib diisi');
      return;
    }

    const slug = formSlug.trim() || formName.toLowerCase().replace(/\s+/g, '-');

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: formName,
                slug,
                type: formType,
                sortOrder: formSortOrder,
                status: formStatus,
                description: formDescription,
              }
            : c
        )
      );
      onShowToast(`Kategori ${formName} berhasil diperbarui!`);
    } else {
      const newCat: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: formName,
        slug,
        type: formType,
        itemCount: 0,
        sortOrder: formSortOrder,
        status: formStatus,
        description: formDescription,
      };
      setCategories((prev) => [...prev, newCat]);
      onShowToast(`Kategori ${formName} berhasil ditambahkan!`);
    }
    handleCloseDrawer();
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus kategori "${name}"?`)) {
      setCategories((prev) => prev.filter((c) => c.id !== id));
      onShowToast(`Kategori "${name}" berhasil dihapus!`);
      if (editingCategory?.id === id) {
        handleCloseDrawer();
      }
    }
  };

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (typeFilter !== 'all' && c.type !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
      }
      return true;
    });
  }, [categories, statusFilter, typeFilter, searchQuery]);

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

  const columns: ColumnDef<CategoryItem>[] = [
    {
      key: 'name',
      header: 'Nama Kategori',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#E5484D] shrink-0 shadow-2xs">
            {item.name === 'Kopi' || item.name === 'Non-Kopi' ? (
              <Coffee className="size-4 text-orange-600" />
            ) : item.name === 'Pastry' ? (
              <Cookie className="size-4 text-amber-600" />
            ) : item.name === 'Makanan Berat' ? (
              <Utensils className="size-4 text-blue-600" />
            ) : (
              <Tag className="size-4 text-orange-500" />
            )}
          </div>
          <div>
            <p className="font-semibold text-neutral-900 text-xs tracking-tight">{item.name}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">/{item.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipe Terkait',
      render: (item) => {
        const isDrink = item.type === 'Minuman';
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
              isDrink
                ? 'bg-rose-50/70 text-rose-600 border-rose-200/60'
                : 'bg-sky-50/70 text-sky-600 border-sky-200/60'
            }`}
          >
            {item.type}
          </span>
        );
      },
    },
    {
      key: 'itemCount',
      header: 'Jumlah Menu',
      render: (item) => (
        <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md">
          {item.itemCount} Menu
        </span>
      ),
    },
    {
      key: 'sortOrder',
      header: 'Urutan Tampil',
      render: (item) => (
        <span className="text-xs text-neutral-600 font-mono font-medium">#{item.sortOrder}</span>
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
      {/* Filters Bar: Clean individual pills directly on background */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Type Filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none focus:border-neutral-400 hover:bg-neutral-50"
          >
            <option value="all">Semua Tipe</option>
            <option value="Minuman">Minuman</option>
            <option value="Makanan">Makanan</option>
            <option value="Cemilan">Cemilan</option>
          </select>
          <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>

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
            placeholder="Cari nama kategori atau slug..."
            className="w-full h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 placeholder-neutral-400 shadow-2xs focus:outline-none focus:border-neutral-400"
          />
          <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Categories DataTable */}
      <DataTable
        columns={columns}
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={toggleSelectRow}
        onToggleSelectAll={toggleSelectAll}
        onRowClick={(item) => handleEdit(item)}
        emptyTitle="BELUM ADA KATEGORI"
        emptyDescription="Tambahkan kategori untuk mengelompokkan menu di outletmu."
        entityName="kategori"
      />

      {/* Slide-over Drawer for Add/Edit Category */}
      {isDrawerOpen && (
        <>
          <div
            onClick={handleCloseDrawer}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[520px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
                  <Tag className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                    {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {editingCategory
                      ? `Kelola informasi kategori "${editingCategory.name}"`
                      : 'Buat kategori baru untuk menu katalog'}
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseDrawer}
                className="size-7 rounded-full bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Field: Nama Kategori */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingCategory) {
                      setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  placeholder="Contoh: Signature Coffee"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs"
                />
              </div>

              {/* Field: Slug / Kode URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Slug / Kode URL</label>
                <input
                  type="text"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="contoh: signature-coffee"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs font-mono text-neutral-700 focus:outline-none focus:border-neutral-400 shadow-2xs bg-neutral-50/50"
                />
              </div>

              {/* Field: Tipe Menu Terkait */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Tipe Menu Terkait</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Minuman', 'Makanan', 'Cemilan', 'Lainnya'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormType(t)}
                      className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                        formType === t
                          ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field: Urutan Tampilan */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Urutan Tampilan</label>
                <input
                  type="number"
                  min="1"
                  value={formSortOrder}
                  onChange={(e) => setFormSortOrder(Number(e.target.value))}
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs"
                />
                <p className="text-[11px] text-neutral-400">
                  Kategori dengan urutan lebih kecil akan tampil lebih awal di POS & QR Order.
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
                <label className="text-xs font-semibold text-neutral-800">Deskripsi Kategori</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Catatan ringkas mengenai kategori ini..."
                  className="w-full p-3 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs resize-none"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                {editingCategory ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingCategory.id, editingCategory.name)}
                    className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="size-4" />
                    <span>Hapus Kategori</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCloseDrawer}
                    className="h-10 px-4 rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50 text-xs font-semibold transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-[#FF7D54] hover:bg-[#FF6A3D] text-white text-xs font-semibold transition-colors shadow-2xs"
                  >
                    <Check className="size-4 stroke-[2.5]" />
                    <span>Simpan Kategori</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
