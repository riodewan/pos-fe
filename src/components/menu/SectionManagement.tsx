'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronDown,
  Check,
  Columns,
  Sparkles,
  Clock,
  Tv,
  Edit2,
  Trash2,
  X,
  Bookmark,
  CheckCircle2,
  Coffee,
  Cookie,
  Utensils,
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

export interface SectionItem {
  id: string;
  name: string;
  placement: 'Semua Channel' | 'Hanya QR Order' | 'Hanya POS Kasir';
  activeHours: string;
  itemCount: number;
  sortOrder: number;
  status: 'Aktif' | 'Nonaktif';
  description?: string;
  selectedMenuIds?: string[];
}

export const INITIAL_SECTIONS: SectionItem[] = [
  {
    id: 'sec-1',
    name: 'Rekomendasi Barista',
    placement: 'Semua Channel',
    activeHours: 'Sepanjang Hari',
    itemCount: 4,
    sortOrder: 1,
    status: 'Aktif',
    description: 'Menu signature kopi pilihan terbaik barista yang direkomendasikan kepada pelanggan.',
    selectedMenuIds: ['m-1', 'm-2', 'm-4', 'm-6'],
  },
  {
    id: 'sec-2',
    name: 'Sarapan Pagi / Breakfast Combo',
    placement: 'Hanya QR Order',
    activeHours: '07:00 - 11:00 WIB',
    itemCount: 3,
    sortOrder: 2,
    status: 'Aktif',
    description: 'Paket bundling kopi dan croissant hangat untuk santapan pagi hemat.',
    selectedMenuIds: ['m-1', 'm-6', 'm-7'],
  },
  {
    id: 'sec-3',
    name: 'Best Seller Musim Ini',
    placement: 'Semua Channel',
    activeHours: 'Sepanjang Hari',
    itemCount: 5,
    sortOrder: 3,
    status: 'Aktif',
    description: 'Menu dengan penjualan tertinggi bulan ini untuk dorongan impulsive order.',
    selectedMenuIds: ['m-1', 'm-2', 'm-3', 'm-6', 'm-8'],
  },
  {
    id: 'sec-4',
    name: 'Camilan & Dessert Sore',
    placement: 'Semua Channel',
    activeHours: '14:00 - 18:00 WIB',
    itemCount: 4,
    sortOrder: 4,
    status: 'Aktif',
    description: 'Pilihan pastry dan french fries untuk santai sore hari.',
    selectedMenuIds: ['m-6', 'm-7', 'm-8'],
  },
  {
    id: 'sec-5',
    name: 'Paket Hemat Berdua',
    placement: 'Hanya POS Kasir',
    activeHours: 'Sepanjang Hari',
    itemCount: 2,
    sortOrder: 5,
    status: 'Nonaktif',
    description: 'Bundling makan siang hemat 2 porsi makanan dan minuman segar.',
    selectedMenuIds: ['m-8', 'm-9'],
  },
];

const AVAILABLE_MENUS = [
  { id: 'm-1', name: 'Kopi Susu Gula Aren', category: 'Kopi', price: 28000 },
  { id: 'm-2', name: 'Matcha Latte', category: 'Kopi', price: 30000 },
  { id: 'm-3', name: 'Americano', category: 'Kopi', price: 22000 },
  { id: 'm-4', name: 'Cappucino', category: 'Kopi', price: 28000 },
  { id: 'm-5', name: 'Latte', category: 'Kopi', price: 27000 },
  { id: 'm-6', name: 'Croissant', category: 'Pastry', price: 25000 },
  { id: 'm-7', name: 'Chocolate Croissant', category: 'Pastry', price: 28000 },
  { id: 'm-8', name: 'Chicken Sandwich', category: 'Makanan Berat', price: 45000 },
  { id: 'm-9', name: 'Pasta Carbonara', category: 'Makanan Berat', price: 48000 },
];

interface SectionManagementProps {
  onShowToast: (msg: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export function SectionManagement({ onShowToast, isCreateOpen, onCloseCreate }: SectionManagementProps) {
  const [sections, setSections] = useState<SectionItem[]>(INITIAL_SECTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [placementFilter, setPlacementFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer / Modal for Edit / Create
  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedSectionName, setSavedSectionName] = useState('');

  // Form State
  const [formName, setFormName] = useState('');
  const [formPlacement, setFormPlacement] = useState<'Semua Channel' | 'Hanya QR Order' | 'Hanya POS Kasir'>('Semua Channel');
  const [formActiveHours, setFormActiveHours] = useState('Sepanjang Hari');
  const [formSortOrder, setFormSortOrder] = useState<number>(1);
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [formDescription, setFormDescription] = useState('');
  const [formSelectedMenuIds, setFormSelectedMenuIds] = useState<string[]>([]);

  // Handle external trigger for create
  React.useEffect(() => {
    if (isCreateOpen) {
      handleCreateNew();
    }
  }, [isCreateOpen]);

  const handleCreateNew = () => {
    setEditingSection(null);
    setFormName('');
    setFormPlacement('Semua Channel');
    setFormActiveHours('Sepanjang Hari');
    setFormSortOrder(sections.length + 1);
    setFormStatus('Aktif');
    setFormDescription('');
    setFormSelectedMenuIds(['m-1', 'm-2']);
    setIsDrawerOpen(true);
  };

  const handleEdit = (sec: SectionItem) => {
    setEditingSection(sec);
    setFormName(sec.name);
    setFormPlacement(sec.placement);
    setFormActiveHours(sec.activeHours);
    setFormSortOrder(sec.sortOrder);
    setFormStatus(sec.status);
    setFormDescription(sec.description || '');
    setFormSelectedMenuIds(sec.selectedMenuIds || []);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingSection(null);
    if (onCloseCreate) onCloseCreate();
  };

  const toggleMenuSelection = (menuId: string) => {
    setFormSelectedMenuIds((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  const handleSave = (isDraft = false) => {
    if (!formName.trim()) {
      alert('Nama section wajib diisi');
      return;
    }

    const status = isDraft ? 'Nonaktif' : formStatus;

    if (editingSection) {
      setSections((prev) =>
        prev.map((s) =>
          s.id === editingSection.id
            ? {
                ...s,
                name: formName,
                placement: formPlacement,
                activeHours: formActiveHours,
                itemCount: formSelectedMenuIds.length,
                sortOrder: formSortOrder,
                status,
                description: formDescription,
                selectedMenuIds: formSelectedMenuIds,
              }
            : s
        )
      );
    } else {
      const newSec: SectionItem = {
        id: `sec-${Date.now()}`,
        name: formName,
        placement: formPlacement,
        activeHours: formActiveHours,
        itemCount: formSelectedMenuIds.length,
        sortOrder: formSortOrder,
        status,
        description: formDescription,
        selectedMenuIds: formSelectedMenuIds,
      };
      setSections((prev) => [...prev, newSec]);
    }

    setSavedSectionName(formName);
    setIsDrawerOpen(false);
    setShowSuccessModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus section "${name}"?`)) {
      setSections((prev) => prev.filter((s) => s.id !== id));
      onShowToast(`Section "${name}" berhasil dihapus!`);
      if (editingSection?.id === id) {
        handleCloseDrawer();
      }
    }
  };

  // Filtered sections
  const filteredSections = useMemo(() => {
    return sections.filter((s) => {
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (placementFilter !== 'all' && s.placement !== placementFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
      }
      return true;
    });
  }, [sections, statusFilter, placementFilter, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredSections.length && filteredSections.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredSections.map((s) => s.id));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const columns: ColumnDef<SectionItem>[] = [
    {
      key: 'name',
      header: 'Nama Section',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-purple-50 border border-purple-200/80 flex items-center justify-center text-purple-600 shrink-0 shadow-2xs">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900 text-xs tracking-tight">{item.name}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1 max-w-[240px]">
              {item.description || 'Section khusus display menu'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'placement',
      header: 'Penempatan Display',
      render: (item) => (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200/60">
          <Tv className="size-3 text-neutral-400" />
          <span>{item.placement}</span>
        </span>
      ),
    },
    {
      key: 'itemCount',
      header: 'Menu Terdaftar',
      render: (item) => (
        <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md">
          {item.itemCount} Item
        </span>
      ),
    },
    {
      key: 'activeHours',
      header: 'Jadwal Tampil',
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-neutral-600 font-medium">
          <Clock className="size-3.5 text-neutral-400" />
          <span>{item.activeHours}</span>
        </div>
      ),
    },
    {
      key: 'sortOrder',
      header: 'Urutan',
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
            title="Edit Section"
          >
            <Edit2 className="size-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id, item.name);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Hapus Section"
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
        {/* Placement Filter */}
        <Select
          value={placementFilter}
          onChange={(e) => setPlacementFilter(e.target.value)}
          size="sm"
          options={[
            { value: 'all', label: 'Semua Penempatan' },
            { value: 'Semua Channel', label: 'Semua Channel' },
            { value: 'Hanya QR Order', label: 'Hanya QR Order' },
            { value: 'Hanya POS Kasir', label: 'Hanya POS Kasir' },
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
            placeholder="Cari nama section..."
            size="sm"
          />
        </div>
      </div>

      {/* Sections DataTable */}
      <DataTable
        columns={columns}
        data={filteredSections}
        keyExtractor={(item) => item.id}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={toggleSelectRow}
        onToggleSelectAll={toggleSelectAll}
        onRowClick={(item) => handleEdit(item)}
        emptyTitle="BELUM ADA SECTION"
        emptyDescription="Buat section tampilan menu untuk menonjolkan rekomendasi outletmu."
        entityName="section"
      />

      {/* Slide-over Drawer for Add/Edit Section using global Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title={editingSection ? 'Edit Section' : 'Tambah Section'}
        subtitle="Atur grup display khusus, penempatan channel, dan daftar menu terkait."
        size="lg"
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
              Simpan Section
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Field: Nama Section */}
          <Input
            label="Nama Section"
            required
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Contoh: Rekomendasi Barista, Sarapan Hemat"
          />

          {/* Field: Penempatan Display */}
          <FormField label="Penempatan Tampilan">
            <div className="grid grid-cols-3 gap-2">
              {(['Semua Channel', 'Hanya QR Order', 'Hanya POS Kasir'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormPlacement(p)}
                  className={`h-9 px-2 rounded-xl text-xs font-semibold border transition-all ${
                    formPlacement === p
                      ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </FormField>

          {/* Field: Jadwal / Jam Tayang */}
          <Input
            label="Jadwal Tampil"
            value={formActiveHours}
            onChange={(e) => setFormActiveHours(e.target.value)}
            placeholder="Contoh: Sepanjang Hari atau 07:00 - 11:00 WIB"
          />

          {/* Field: Urutan Tampilan */}
          <Input
            type="number"
            min="1"
            label="Urutan Tampilan"
            value={formSortOrder}
            onChange={(e) => setFormSortOrder(Number(e.target.value))}
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

          {/* Field: Pilih Menu Terdaftar dalam Section */}
          <FormField label={`Menu Terdaftar (${formSelectedMenuIds.length} Dipilih)`}>
            <div className="border border-neutral-200 rounded-xl p-3 max-h-48 overflow-y-auto space-y-1.5 bg-neutral-50/40">
              {AVAILABLE_MENUS.map((menu) => (
                <label
                  key={menu.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white border border-neutral-200/70 hover:border-neutral-300 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={formSelectedMenuIds.includes(menu.id)}
                      onChange={() => toggleMenuSelection(menu.id)}
                      className="rounded border-neutral-300 text-orange-600 focus:ring-0 size-4"
                    />
                    <span className="font-semibold text-neutral-800">{menu.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-500">
                      {menu.category}
                    </span>
                  </div>
                  <span className="font-medium text-neutral-700">Rp{menu.price.toLocaleString('id-ID')}</span>
                </label>
              ))}
            </div>
          </FormField>

          {/* Field: Deskripsi */}
          <Textarea
            label="Deskripsi Section"
            rows={3}
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Keterangan singkat mengenai banner atau grup section ini..."
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
            Section Berhasil Ditambahkan!
          </h3>
          <p className="text-xs text-neutral-500 mt-2 max-w-[340px] leading-relaxed">
            Section &quot;{savedSectionName}&quot; berhasil disimpan dan akan ditampilkan pada channel yang ditentukan.
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
              Kembali ke Daftar Section
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
