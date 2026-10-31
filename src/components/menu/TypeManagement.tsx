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
} from '@/components/common';

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

export const INITIAL_TYPES: TypeItem[] = [];

interface TypeManagementProps {
  onShowToast: (msg: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export function TypeManagement({ onShowToast, isCreateOpen, onCloseCreate }: TypeManagementProps) {
  const [types, setTypes] = useState<TypeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch real types deduced from products
  React.useEffect(() => {
    setIsLoading(true);
    import('@/services/catalog.service').then(({ catalogService }) => {
      catalogService
        .getProducts()
        .then((res) => {
          if (Array.isArray(res?.data)) {
            const typeMap = new Map<string, TypeItem>();
            res.data.forEach((p: any) => {
              const typeName = p.type || 'Minuman';
              const code = typeName.substring(0, 3).toUpperCase();
              if (!typeMap.has(typeName)) {
                typeMap.set(typeName, {
                  id: `type-${typeName.toLowerCase()}`,
                  name: typeName,
                  code,
                  categoriesCount: 1,
                  itemCount: 1,
                  taxRate: 10,
                  status: 'Aktif',
                  description: `Kelompok menu ${typeName}`,
                });
              } else {
                const existing = typeMap.get(typeName)!;
                existing.itemCount += 1;
              }
            });
            setTypes(Array.from(typeMap.values()));
          }
        })
        .catch((err) => console.warn('Failed to fetch types:', err))
        .finally(() => setIsLoading(false));
    });
  }, []);

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
            placeholder="Cari nama tipe atau kode..."
            size="sm"
          />
        </div>
      </div>

      {/* Types DataTable */}
      <DataTable
        columns={columns}
        data={filteredTypes}
        isLoading={isLoading}
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

      {/* Slide-over Drawer for Add/Edit Type using global Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={editingType ? 'Edit Tipe' : 'Tambah Tipe'}
        subtitle="Lengkapi data klasifikasi tipe dan pengaturan pajak restoran."
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
              leftIcon={<CheckCircle2 className="size-4 stroke-[2.5]" />}
              onClick={() => handleSave(false)}
            >
              Simpan Tipe
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Field: Nama Tipe */}
          <Input
            label="Nama Tipe"
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
          />

          {/* Field: Kode Singkat Tipe */}
          <Input
            label="Kode Singkat (3 Karakter)"
            maxLength={5}
            value={formCode}
            onChange={(e) => setFormCode(e.target.value.toUpperCase())}
            placeholder="DRK"
            className="font-mono bg-neutral-50/50 uppercase"
          />

          {/* Field: Pajak PB1 Default */}
          <Input
            type="number"
            min="0"
            max="100"
            label="Pajak PB1 Default (%)"
            value={formTaxRate}
            onChange={(e) => setFormTaxRate(Number(e.target.value))}
            suffix={<Percent className="size-3.5 text-neutral-400" />}
            hint="Persentase pajak restoran (PB1) standar yang dikenakan pada item dalam tipe ini."
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
            label="Deskripsi Tipe"
            rows={3}
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Keterangan singkat tipe ini..."
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
            Tipe Menu Berhasil Ditambahkan!
          </h3>
          <p className="text-xs text-neutral-500 mt-2 max-w-[340px] leading-relaxed">
            Tipe &quot;{savedTypeName}&quot; berhasil disimpan dan sudah aktif untuk mengelompokkan kategori dan menu outlet.
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
              Kembali ke Daftar Tipe
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
