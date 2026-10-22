'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
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
  Layers,
} from 'lucide-react';
import { DataTable, ColumnDef, StatusBadge } from '@/components/common';

export interface SectionItem {
  id: string;
  name: string;
  placement: 'Semua Channel' | 'Hanya QR Order' | 'Hanya POS Kasir';
  activeHours: string;
  itemCount: number;
  sortOrder: number;
  status: 'Aktif' | 'Nonaktif';
  description?: string;
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
  },
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

  // Form State
  const [formName, setFormName] = useState('');
  const [formPlacement, setFormPlacement] = useState<'Semua Channel' | 'Hanya QR Order' | 'Hanya POS Kasir'>('Semua Channel');
  const [formActiveHours, setFormActiveHours] = useState('Sepanjang Hari');
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
    setEditingSection(null);
    setFormName('');
    setFormPlacement('Semua Channel');
    setFormActiveHours('Sepanjang Hari');
    setFormSortOrder(sections.length + 1);
    setFormStatus('Aktif');
    setFormDescription('');
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
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setEditingSection(null);
    if (onCloseCreate) onCloseCreate();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert('Nama section wajib diisi');
      return;
    }

    if (editingSection) {
      setSections((prev) =>
        prev.map((s) =>
          s.id === editingSection.id
            ? {
                ...s,
                name: formName,
                placement: formPlacement,
                activeHours: formActiveHours,
                sortOrder: formSortOrder,
                status: formStatus,
                description: formDescription,
              }
            : s
        )
      );
      onShowToast(`Section ${formName} berhasil diperbarui!`);
    } else {
      const newSec: SectionItem = {
        id: `sec-${Date.now()}`,
        name: formName,
        placement: formPlacement,
        activeHours: formActiveHours,
        itemCount: 0,
        sortOrder: formSortOrder,
        status: formStatus,
        description: formDescription,
      };
      setSections((prev) => [...prev, newSec]);
      onShowToast(`Section ${formName} berhasil ditambahkan!`);
    }
    handleCloseDrawer();
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
        <div className="relative">
          <select
            value={placementFilter}
            onChange={(e) => setPlacementFilter(e.target.value)}
            className="h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none focus:border-neutral-400 hover:bg-neutral-50"
          >
            <option value="all">Semua Penempatan</option>
            <option value="Semua Channel">Semua Channel</option>
            <option value="Hanya QR Order">Hanya QR Order</option>
            <option value="Hanya POS Kasir">Hanya POS Kasir</option>
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
            placeholder="Cari nama section..."
            className="w-full h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 placeholder-neutral-400 shadow-2xs focus:outline-none focus:border-neutral-400"
          />
          <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
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

      {/* Slide-over Drawer for Add/Edit Section */}
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
                <div className="size-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600">
                  <Columns className="size-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                    {editingSection ? 'Edit Section Menu' : 'Tambah Section Baru'}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {editingSection
                      ? `Atur penempatan dan jadwal section "${editingSection.name}"`
                      : 'Buat grup display khusus di QR order atau POS'}
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
              {/* Field: Nama Section */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">
                  Nama Section <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Rekomendasi Barista, Sarapan Hemat"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs"
                />
              </div>

              {/* Field: Penempatan Display */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Penempatan Tampilan</label>
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
              </div>

              {/* Field: Jadwal / Jam Tayang */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Jadwal Tampil</label>
                <input
                  type="text"
                  value={formActiveHours}
                  onChange={(e) => setFormActiveHours(e.target.value)}
                  placeholder="Contoh: Sepanjang Hari atau 07:00 - 11:00 WIB"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs"
                />
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
                <label className="text-xs font-semibold text-neutral-800">Deskripsi Section</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Keterangan singkat mengenai banner atau grup section ini..."
                  className="w-full p-3 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs resize-none"
                />
              </div>

              {/* Footer Buttons */}
              <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-3">
                {editingSection ? (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingSection.id, editingSection.name)}
                    className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="size-4" />
                    <span>Hapus Section</span>
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
                    <span>Simpan Section</span>
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
