'use client';

import React, { useState } from 'react';
import {
  Tag,
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
  Textarea,
  FormField,
  Pagination,
} from '@/components/common';

export interface IngredientCategoryItem {
  id: string;
  name: string;
  code: string;
  itemCount: number;
  status: 'Aktif' | 'Nonaktif';
  description?: string;
}

const INITIAL_CATEGORIES: IngredientCategoryItem[] = [
  {
    id: 'icat-1',
    name: 'Kopi',
    code: 'CAT-KOP',
    itemCount: 2,
    status: 'Aktif',
    description: 'Biji kopi sangrai arabica, robusta, dan house blend.',
  },
  {
    id: 'icat-2',
    name: 'Susu',
    code: 'CAT-SUS',
    itemCount: 2,
    status: 'Aktif',
    description: 'Susu segar UHT, susu nabati oat, almond, dan krimer.',
  },
  {
    id: 'icat-3',
    name: 'Bubuk',
    code: 'CAT-BBK',
    itemCount: 2,
    status: 'Aktif',
    description: 'Bubuk matcha murni, dark chocolate, red velvet, taro.',
  },
  {
    id: 'icat-4',
    name: 'Sirup',
    code: 'CAT-SRP',
    itemCount: 2,
    status: 'Aktif',
    description: 'Sirup perasa karamel, vanilla, hazelnut, pandan, gula aren cair.',
  },
  {
    id: 'icat-5',
    name: 'Minuman',
    code: 'CAT-MNM',
    itemCount: 1,
    status: 'Aktif',
    description: 'Air mineral galon, teh melati kering, soda kaleng.',
  },
  {
    id: 'icat-6',
    name: 'Kemasan',
    code: 'CAT-KMS',
    itemCount: 4,
    status: 'Aktif',
    description: 'Paper cup, plastic cup sealing, sedotan stainless, kantong take-away.',
  },
];

interface IngredientCategoryManagementProps {
  onShowToast: (msg: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export function IngredientCategoryManagement({
  onShowToast,
  isCreateOpen,
  onCloseCreate,
}: IngredientCategoryManagementProps) {
  const [categories, setCategories] = useState<IngredientCategoryItem[]>(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<IngredientCategoryItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [formDescription, setFormDescription] = useState('');

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  React.useEffect(() => {
    if (isCreateOpen) {
      handleCreateNew();
    }
  }, [isCreateOpen]);

  const handleCreateNew = () => {
    setEditingCategory(null);
    setFormName('');
    setFormCode('');
    setFormStatus('Aktif');
    setFormDescription('');
    setIsDrawerOpen(true);
  };

  const handleEdit = (item: IngredientCategoryItem) => {
    setEditingCategory(item);
    setFormName(item.name);
    setFormCode(item.code);
    setFormStatus(item.status);
    setFormDescription(item.description || '');
    setIsDrawerOpen(true);
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
    if (onCloseCreate) onCloseCreate();
  };

  const handleSave = () => {
    if (!formName.trim()) {
      onShowToast('Nama kategori bahan wajib diisi!');
      return;
    }

    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: formName,
                code: formCode || `CAT-${formName.substring(0, 3).toUpperCase()}`,
                status: formStatus,
                description: formDescription,
              }
            : c
        )
      );
      onShowToast(`Kategori "${formName}" berhasil diperbarui.`);
    } else {
      const newCat: IngredientCategoryItem = {
        id: `icat-${Date.now()}`,
        name: formName,
        code: formCode || `CAT-${formName.substring(0, 3).toUpperCase()}`,
        itemCount: 0,
        status: formStatus,
        description: formDescription,
      };
      setCategories((prev) => [...prev, newCat]);
      onShowToast(`Kategori baru "${formName}" berhasil ditambahkan.`);
    }

    handleClose();
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    onShowToast(`Kategori "${deleteTarget.name}" berhasil dihapus.`);
    setDeleteTarget(null);
  };

  const filteredCategories = categories.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCode = item.code.toLowerCase().includes(q);
      if (!matchName && !matchCode) return false;
    }
    return true;
  });

  const columns: ColumnDef<IngredientCategoryItem>[] = [
    {
      key: 'name',
      header: 'Nama Kategori Bahan',
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-[#E5484D]">
            <Tag className="size-4" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900 text-xs">{item.name}</p>
            <p className="text-[11px] text-neutral-400 font-mono">{item.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'itemCount',
      header: 'Bahan Terkait',
      render: (item) => <span className="text-neutral-700 text-xs">{item.itemCount} Bahan</span>,
    },
    {
      key: 'description',
      header: 'Keterangan',
      render: (item) => (
        <span className="text-neutral-500 text-xs line-clamp-1 max-w-sm">
          {item.description || '-'}
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
          <Button
            size="xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
            title="Edit Kategori"
          >
            <Edit2 className="size-3.5 text-neutral-500" />
          </Button>
          <Button
            size="xs"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget({ id: item.id, name: item.name });
            }}
            title="Hapus Kategori"
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: 'all', label: 'Semua Status' },
            { value: 'Aktif', label: 'Aktif' },
            { value: 'Nonaktif', label: 'Nonaktif' },
          ]}
          className="w-40 h-9 text-xs"
        />

        <div className="w-full md:w-80">
          <SearchInput
            placeholder="Cari kategori bahan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="space-y-4">
        <DataTable<IngredientCategoryItem>
          columns={columns}
          data={filteredCategories}
          keyExtractor={(item) => item.id}
          selectable={false}
          onRowClick={handleEdit}
          emptyTitle="BELUM ADA KATEGORI BAHAN"
          emptyDescription="Tambahkan kategori bahan baku untuk mempermudah pengelompokan inventori."
          entityName="kategori bahan"
        />
      </div>

      {/* Drawer: Form Kategori */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleClose}
        title={editingCategory ? 'Edit Kategori Bahan' : 'Tambah Kategori Bahan'}
        subtitle="Atur nama kategori pengelompokan bahan baku inventori"
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
              Simpan Kategori
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <Input
            label="Nama Kategori Bahan"
            required
            value={formName}
            onChange={(e) => {
              setFormName(e.target.value);
              if (!editingCategory) {
                setFormCode(`CAT-${e.target.value.substring(0, 3).toUpperCase()}`);
              }
            }}
            placeholder="Contoh: Kopi"
          />

          <Input
            label="Kode Kategori (Singkat)"
            value={formCode}
            onChange={(e) => setFormCode(e.target.value.toUpperCase())}
            placeholder="CAT-KOP"
            className="font-mono uppercase bg-neutral-50/50"
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

          <Textarea
            label="Keterangan Kategori"
            rows={3}
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Catatan mengenai jenis bahan baku dalam kategori ini..."
          />
        </div>
      </Drawer>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Kategori Bahan"
        subtitle="Apakah Anda yakin ingin menghapus kategori ini? Bahan terkait tidak akan terhapus namun kategori akan kosong."
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="outline" size="sm" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button variant="danger" size="sm" onClick={confirmDelete}>
              Ya, Hapus Kategori
            </Button>
          </div>
        }
      >
        <div className="py-2 text-xs text-neutral-600">
          Kategori: <strong className="text-neutral-900">{deleteTarget?.name}</strong>
        </div>
      </Modal>
    </div>
  );
}
