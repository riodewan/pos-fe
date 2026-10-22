'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  MoreVertical,
  Check,
  Coffee,
  Tag,
  LayoutGrid,
  Columns,
  Utensils,
  Cookie,
} from 'lucide-react';
import {
  DataTable,
  ColumnDef,
  StatusBadge,
} from '@/components/common';
import {
  MenuDetailsDrawer,
  MenuItem,
  CategoryManagement,
  TypeManagement,
  SectionManagement,
} from '@/components/menu';
import { formatRupiah } from '@/utils';

// 9 Items matching Screenshot 1 exactly
const INITIAL_MENU_ITEMS: MenuItem[] = [
  {
    id: 'm-1',
    name: 'Kopi Susu Gula Aren',
    sku: 'DRK-001',
    category: 'Kopi',
    type: 'Minuman',
    price: 28000,
    cost: 8000,
    margin: 69.6,
    status: 'Aktif',
    description: 'Kopi espresso dengan susu fresh dan gula aren asli.',
  },
  {
    id: 'm-2',
    name: 'Matcha Latte',
    sku: 'DRK-002',
    category: 'Kopi',
    type: 'Minuman',
    price: 30000,
    cost: 9200,
    margin: 69.3,
    status: 'Aktif',
    description: 'Matcha premium Jepang dengan steamed milk gurih.',
  },
  {
    id: 'm-3',
    name: 'Americano',
    sku: 'DRK-003',
    category: 'Kopi',
    type: 'Minuman',
    price: 22000,
    cost: 5800,
    margin: 73.6,
    status: 'Aktif',
    description: 'Double espresso shot dengan air panas atau dingin segar.',
  },
  {
    id: 'm-4',
    name: 'Cappucino',
    sku: 'DRK-004',
    category: 'Kopi',
    type: 'Minuman',
    price: 28000,
    cost: 7900,
    margin: 71.8,
    status: 'Aktif',
    description: 'Espresso dengan foam susu tebal dan taburan bubuk cokelat.',
  },
  {
    id: 'm-5',
    name: 'Latte',
    sku: 'DRK-005',
    category: 'Kopi',
    type: 'Minuman',
    price: 27000,
    cost: 7500,
    margin: 72.2,
    status: 'Aktif',
    description: 'Perpaduan lembut espresso dan susu segar bercita rasa creamy.',
  },
  {
    id: 'm-6',
    name: 'Croissant',
    sku: 'DRK-006',
    category: 'Pastry',
    type: 'Makanan',
    price: 25000,
    cost: 10000,
    margin: 60.0,
    status: 'Aktif',
    description: 'Pastry mentega renyah berlapis-lapis khas Prancis.',
  },
  {
    id: 'm-7',
    name: 'Chocolate Croissant',
    sku: 'DRK-007',
    category: 'Pastry',
    type: 'Makanan',
    price: 28000,
    cost: 11500,
    margin: 58.9,
    status: 'Aktif',
    description: 'Croissant renyah dengan isian cokelat lumer lezat.',
  },
  {
    id: 'm-8',
    name: 'Chicken Sandwich',
    sku: 'DRK-008',
    category: 'Makanan Berat',
    type: 'Makanan',
    price: 45000,
    cost: 18000,
    margin: 60.0,
    status: 'Aktif',
    description: 'Roti lapis ayam panggang dengan sayuran segar dan keju.',
  },
  {
    id: 'm-9',
    name: 'Pasta Carbonara',
    sku: 'DRK-009',
    category: 'Makanan Berat',
    type: 'Makanan',
    price: 48000,
    cost: 20500,
    margin: 57.3,
    status: 'Aktif',
    description: 'Spaghetti saus krim telur kaya rasa dengan taburan smoked beef.',
  },
];

type MenuTab = 'menu' | 'category' | 'type' | 'section';

export default function MenuCatalogPage() {
  const [activeTab, setActiveTab] = useState<MenuTab>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [demoMode, setDemoMode] = useState<'populated' | 'empty'>('populated');

  // Filter states
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer states
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered menu list
  const filteredMenuItems = useMemo(() => {
    if (demoMode === 'empty') return [];

    return menuItems.filter((item) => {
      if (selectedType !== 'all' && item.type !== selectedType) return false;
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchSku = item.sku.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchCat) return false;
      }
      return true;
    });
  }, [demoMode, menuItems, selectedType, selectedStatus, searchQuery]);

  // Bulk selection
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredMenuItems.length && filteredMenuItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredMenuItems.map((m) => m.id));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('edit');

  const handleOpenItem = (item: MenuItem) => {
    setSelectedItem(item);
    setDrawerMode('edit');
    setIsDrawerOpen(true);
  };

  const handleSaveItem = (updated: MenuItem) => {
    setMenuItems((prev) => {
      const exists = prev.some((m) => m.id === updated.id);
      if (exists) {
        return prev.map((m) => (m.id === updated.id ? updated : m));
      }
      return [updated, ...prev];
    });
  };

  const handleDeleteItem = (itemId: string) => {
    setMenuItems((prev) => prev.filter((m) => m.id !== itemId));
    showToast('Menu berhasil dihapus!');
  };

  const handleCreateNew = () => {
    const newItem: MenuItem = {
      id: `m-${Date.now()}`,
      name: '',
      sku: `DRK-00${menuItems.length + 1}`,
      category: 'Kopi',
      type: 'Minuman',
      price: 28000,
      cost: 8000,
      margin: 69.6,
      status: 'Aktif',
      description: 'Kopi espresso dengan susu fresh dan gula aren',
    };
    setSelectedItem(newItem);
    setDrawerMode('create');
    setIsDrawerOpen(true);
  };

  // Sub-tab creation modal triggers
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreateTypeOpen, setIsCreateTypeOpen] = useState(false);
  const [isCreateSectionOpen, setIsCreateSectionOpen] = useState(false);

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'category':
        return 'Tambah Kategori';
      case 'type':
        return 'Tambah Tipe';
      case 'section':
        return 'Tambah Section';
      default:
        return 'Tambah Menu';
    }
  };

  const handleTopAddClick = () => {
    switch (activeTab) {
      case 'category':
        setIsCreateCategoryOpen(true);
        break;
      case 'type':
        setIsCreateTypeOpen(true);
        break;
      case 'section':
        setIsCreateSectionOpen(true);
        break;
      default:
        handleCreateNew();
        break;
    }
  };

  // Category Badge Helper matching Figma
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Kopi':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFF8E1] text-[#A76D04] border border-[#FFE082]/60">
            Kopi
          </span>
        );
      case 'Pastry':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FCE4EC] text-[#C2185B] border border-[#F8BBD0]/60">
            Pastry
          </span>
        );
      case 'Makanan Berat':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E3F2FD] text-[#1565C0] border border-[#BBDEFB]/60">
            Makanan Berat
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
            {category}
          </span>
        );
    }
  };

  // Type Badge Helper matching Figma
  const getTypeBadge = (type: MenuItem['type']) => {
    switch (type) {
      case 'Minuman':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFEBEE] text-[#D32F2F] border border-[#FFCDD2]/60">
            Minuman
          </span>
        );
      case 'Makanan':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E3F2FD] text-[#1976D2] border border-[#BBDEFB]/60">
            Makanan
          </span>
        );
      case 'Cemilan':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFF3E0] text-[#E65100] border border-[#FFE0B2]/60">
            Cemilan
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
            {type}
          </span>
        );
    }
  };

  // Global DataTable Columns Definition matching Screenshot 1
  const columns: ColumnDef<MenuItem>[] = [
    {
      key: 'menu',
      header: 'Menu',
      render: (item) => (
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="size-10 rounded-lg bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 flex items-center justify-center text-amber-900 shrink-0 shadow-2xs">
            {item.category === 'Pastry' ? (
              <Cookie className="size-5 text-amber-800" />
            ) : item.category === 'Makanan Berat' ? (
              <Utensils className="size-5 text-blue-700" />
            ) : (
              <Coffee className="size-5 text-amber-800" />
            )}
          </div>

          <div>
            <p className="font-semibold text-neutral-900 text-xs tracking-tight">{item.name}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">SKU: {item.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'kategori',
      header: 'Kategori',
      render: (item) => getCategoryBadge(item.category),
    },
    {
      key: 'tipe',
      header: 'Tipe',
      render: (item) => getTypeBadge(item.type),
    },
    {
      key: 'hargaJual',
      header: 'Harga Jual',
      render: (item) => (
        <span className="text-xs text-neutral-800 font-medium">{formatRupiah(item.price)}</span>
      ),
    },
    {
      key: 'hpp',
      header: 'HPP',
      render: (item) => (
        <span className="text-xs text-neutral-800 font-medium">{formatRupiah(item.cost)}</span>
      ),
    },
    {
      key: 'margin',
      header: 'Margin',
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-800">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          <span>{item.margin}%</span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge variant="success" icon={<Check className="size-3" />}>
          Aktif
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (item) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenItem(item);
          }}
          className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <MoreVertical className="size-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-4 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <Check className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Page Header matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Menu</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Kelola semua menu, harga, kategori, dan informasi bahan.
          </p>
        </div>

        {/* Right Header: Discrete Switcher & + Dynamic Add Button */}
        <div className="flex items-center gap-3">
          {/* Demo Switcher (only for menu tab) */}
          {activeTab === 'menu' && (
            <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200 text-xs">
              <button
                onClick={() => setDemoMode('populated')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  demoMode === 'populated'
                    ? 'bg-white text-neutral-800 shadow-2xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Data Terisi
              </button>
              <button
                onClick={() => setDemoMode('empty')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  demoMode === 'empty'
                    ? 'bg-white text-neutral-800 shadow-2xs font-semibold'
                    : 'text-neutral-500 hover:text-neutral-800'
                }`}
              >
                Belum Ada Menu
              </button>
            </div>
          )}

          {/* Dynamic + Tambah Button matching active tab */}
          <button
            onClick={handleTopAddClick}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#FF4D4D] hover:bg-[#E53939] text-white text-xs font-semibold transition-colors shadow-2xs"
          >
            <Plus className="size-4 stroke-[2.5]" />
            <span>{getAddButtonText()}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs matching Screenshot 1: Menu, Kategori, Tipe, Section */}
      <div className="flex items-center border-b border-neutral-200 text-xs gap-1">
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold border-b-2 transition-all relative ${
            activeTab === 'menu'
              ? 'border-[#FF5C38] text-[#FF5C38]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Coffee className="size-4" />
          <span>Menu</span>
        </button>

        <button
          onClick={() => setActiveTab('category')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold border-b-2 transition-all relative ${
            activeTab === 'category'
              ? 'border-[#FF5C38] text-[#FF5C38]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Tag className="size-4" />
          <span>Kategori</span>
        </button>

        <button
          onClick={() => setActiveTab('type')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold border-b-2 transition-all relative ${
            activeTab === 'type'
              ? 'border-[#FF5C38] text-[#FF5C38]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <LayoutGrid className="size-4" />
          <span>Tipe</span>
        </button>

        <button
          onClick={() => setActiveTab('section')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold border-b-2 transition-all relative ${
            activeTab === 'section'
              ? 'border-[#FF5C38] text-[#FF5C38]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Columns className="size-4" />
          <span>Section</span>
        </button>
      </div>

      {/* TAB CONTENT: MENU */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          {/* Filters Bar: Clean individual pills directly on background */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Channel Filter */}
            <div className="relative">
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                className="h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none focus:border-neutral-400 hover:bg-neutral-50"
              >
                <option value="all">Semua channel</option>
                <option value="Kasir">Kasir</option>
                <option value="QR Order">QR Order</option>
                <option value="GrabFood">GrabFood</option>
                <option value="ShopeeFood">ShopeeFood</option>
                <option value="GoFood">GoFood</option>
              </select>
              <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none focus:border-neutral-400 hover:bg-neutral-50"
              >
                <option value="all">Semua tipe</option>
                <option value="Minuman">Minuman</option>
                <option value="Makanan">Makanan</option>
                <option value="Cemilan">Cemilan</option>
              </select>
              <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Status / Pembayaran Filter */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none focus:border-neutral-400 hover:bg-neutral-50"
              >
                <option value="all">Semua status</option>
                <option value="Aktif">Aktif</option>
                <option value="Nonaktif">Nonaktif</option>
              </select>
              <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Search Input */}
            <div className="relative flex-1 min-w-[280px]">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama menu, kategori, atau SKU"
                className="w-full h-9 pl-3.5 pr-9 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 shadow-2xs focus:outline-none focus:border-neutral-400"
              />
              <div className="absolute right-2.5 top-2 size-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                <Search className="size-3" />
              </div>
            </div>
          </div>

          {/* Global DataTable matching Screenshot 1 & 3 */}
          <DataTable
            columns={columns}
            data={filteredMenuItems}
            keyExtractor={(item) => item.id}
            selectable
            selectedIds={selectedIds}
            onToggleSelect={toggleSelectRow}
            onToggleSelectAll={toggleSelectAll}
            onRowClick={handleOpenItem}
            emptyTitle="BELUM ADA MENU"
            emptyDescription="Tambahkan menu untuk mulai mengelola harga jual, bahan, dan HPP produk outletmu."
            entityName="menu"
          />
        </div>
      )}

      {/* TAB CONTENT: KATEGORI */}
      {activeTab === 'category' && (
        <CategoryManagement
          onShowToast={showToast}
          isCreateOpen={isCreateCategoryOpen}
          onCloseCreate={() => setIsCreateCategoryOpen(false)}
        />
      )}

      {/* TAB CONTENT: TIPE */}
      {activeTab === 'type' && (
        <TypeManagement
          onShowToast={showToast}
          isCreateOpen={isCreateTypeOpen}
          onCloseCreate={() => setIsCreateTypeOpen(false)}
        />
      )}

      {/* TAB CONTENT: SECTION */}
      {activeTab === 'section' && (
        <SectionManagement
          onShowToast={showToast}
          isCreateOpen={isCreateSectionOpen}
          onCloseCreate={() => setIsCreateSectionOpen(false)}
        />
      )}

      {/* Slide-over Menu Edit/Detail Drawer matching Screenshot 2 */}
      <MenuDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        item={selectedItem}
        mode={drawerMode}
        onSave={handleSaveItem}
        onDelete={handleDeleteItem}
      />
    </div>
  );
}
