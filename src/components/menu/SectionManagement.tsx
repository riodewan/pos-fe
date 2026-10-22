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
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[640px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  {editingSection ? 'Edit Section' : 'Tambah Section'}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Atur grup display khusus, penempatan channel, dan daftar menu terkait.
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

              {/* Field: Pilih Menu Terdaftar dalam Section */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-800">
                  Menu Terdaftar ({formSelectedMenuIds.length} Dipilih)
                </label>
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
                          className="rounded border-neutral-300 text-[#FF4D4D] focus:ring-0 size-4"
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
                <span>Simpan Section</span>
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
                Section Berhasil Ditambahkan!
              </h3>
              <p className="text-xs text-neutral-500 mt-2 max-w-[360px] leading-relaxed">
                Section &quot;{savedSectionName}&quot; berhasil disimpan dan akan ditampilkan pada channel yang ditentukan.
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
                  Kembali ke Daftar Section
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
