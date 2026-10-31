'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  Check,
  Tag,
  Coffee,
  Utensils,
  Cookie,
  Edit2,
  Trash2,
  X,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import {
  DataTable,
  ColumnDef,
  StatusBadge,
  Button,
  SearchInput,
  Select,
  Drawer,
  Modal,
  Input,
  Textarea,
  FormField,
} from '@/components/common';

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

export const INITIAL_CATEGORIES: CategoryItem[] = [];

interface CategoryManagementProps {
  onShowToast: (msg: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export function CategoryManagement({ onShowToast, isCreateOpen, onCloseCreate }: CategoryManagementProps) {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch real categories deduced from products
  React.useEffect(() => {
    setIsLoading(true);
    import('@/services/catalog.service').then(({ catalogService }) => {
      catalogService
        .getProducts()
        .then((res) => {
          if (Array.isArray(res?.data)) {
            const catMap = new Map<string, CategoryItem>();
            res.data.forEach((p: any) => {
              const catName = p.category || 'Kopi';
              const catType = p.type || 'Minuman';
              const slug = catName.toLowerCase().replace(/\s+/g, '-');
              if (!catMap.has(slug)) {
                catMap.set(slug, {
                  id: `cat-${slug}`,
                  name: catName,
                  slug,
                  type: catType as any,
                  itemCount: 1,
                  sortOrder: catMap.size + 1,
                  status: 'Aktif',
                  description: `Kategori menu ${catName}`,
                });
              } else {
                const existing = catMap.get(slug)!;
                existing.itemCount += 1;
              }
            });
            setCategories(Array.from(catMap.values()));
          }
        })
        .catch((err) => console.warn('Failed to fetch categories:', err))
        .finally(() => setIsLoading(false));
    });
  }, []);

  // Drawer / Modal for Edit / Create
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedCategoryName, setSavedCategoryName] = useState('');

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

  const handleSave = (isDraft = false) => {
    if (!formName.trim()) {
      alert('Nama kategori wajib diisi');
      return;
    }

    const slug = formSlug.trim() || formName.toLowerCase().replace(/\s+/g, '-');
    const status = isDraft ? 'Nonaktif' : formStatus;

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
                status,
                description: formDescription,
              }
            : c
        )
      );
    } else {
      const newCat: CategoryItem = {
        id: `cat-${Date.now()}`,
        name: formName,
        slug,
        type: formType,
        itemCount: 0,
        sortOrder: formSortOrder,
        status,
        description: formDescription,
      };
      setCategories((prev) => [...prev, newCat]);
    }

    setSavedCategoryName(formName);
    setIsDrawerOpen(false);
    setShowSuccessModal(true);
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
        <Select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          size="sm"
          options={[
            { value: 'all', label: 'Semua Tipe' },
            { value: 'Minuman', label: 'Minuman' },
            { value: 'Makanan', label: 'Makanan' },
            { value: 'Cemilan', label: 'Cemilan' },
          ]}
        />

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="sm"
          options={[
            { value: 'all', label: 'Semua Status' },
            { value: 'Aktif', label: 'Aktif' },
            { value: 'Nonaktif', label: 'Nonaktif' },
          ]}
        />

        {/* Search input with global SearchInput */}
        <div className="flex-1 min-w-[260px]">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Cari nama kategori atau slug..."
            size="sm"
          />
        </div>
      </div>

      {/* Categories DataTable */}
      <DataTable
        columns={columns}
        data={filteredCategories}
        isLoading={isLoading}
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

      {/* Slide-over Drawer for Add/Edit Category using global Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
        subtitle="Lengkapi nama, tipe, dan urutan kategori untuk katalog menu outlet."
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Bookmark className="size-4" />}
              onClick={() => handleSave(true)}
            >
              Simpan sebagai Draf
            </Button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 className="size-4" />}
              onClick={() => handleSave(false)}
            >
              Simpan Kategori
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Field: Nama Kategori */}
          <Input
            label="Nama Kategori"
            required
            value={formName}
            onChange={(e) => {
              setFormName(e.target.value);
              if (!editingCategory) {
                setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'));
              }
            }}
            placeholder="Contoh: Signature Coffee"
          />

          {/* Field: Slug / Kode URL */}
          <Input
            label="Slug / Kode URL"
            value={formSlug}
            onChange={(e) => setFormSlug(e.target.value)}
            placeholder="signature-coffee"
            className="font-mono bg-neutral-50/50"
          />

          {/* Field: Tipe Menu Terkait */}
          <FormField label="Tipe Menu Terkait">
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
          </FormField>

          {/* Field: Urutan Tampilan */}
          <Input
            type="number"
            min="1"
            label="Urutan Tampilan"
            value={formSortOrder}
            onChange={(e) => setFormSortOrder(Number(e.target.value))}
            hint="Kategori dengan urutan lebih kecil akan tampil lebih awal di POS & QR Order."
          />

          {/* Field: Status */}
          <FormField label="Status">
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
          </FormField>

          {/* Field: Deskripsi */}
          <Textarea
            label="Deskripsi Kategori"
            rows={3}
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Catatan ringkas mengenai kategori ini..."
          />
        </div>
      </Drawer>

      {/* SUCCESS MODAL using global Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        showCloseButton={false}
        size="md"
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="size-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-5">
            <Check className="size-10 stroke-[3]" />
          </div>

          <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
            Kategori Berhasil Ditambahkan!
          </h3>
          <p className="text-xs text-neutral-500 mt-2 max-w-[340px] leading-relaxed">
            Kategori &quot;{savedCategoryName}&quot; berhasil disimpan. Kamu bisa mulai mengelompokkan menu ke dalam kategori ini.
          </p>

          <div className="grid grid-cols-2 gap-3 w-full mt-6">
            <Button
              variant="outline-primary"
              size="md"
              onClick={() => setShowSuccessModal(false)}
            >
              Tutup
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowSuccessModal(false)}
            >
              Kembali ke Daftar Kategori
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
