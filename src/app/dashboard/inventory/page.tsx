'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  ChevronDown,
  MoreVertical,
  Check,
  Bell,
  FileText,
  Tag,
  Scale,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  AlertCircle,
  Inbox,
  Filter,
} from 'lucide-react';
import {
  DataTable,
  ColumnDef,
  Button,
  Select,
  SearchInput,
  Pagination,
  StatusBadge,
} from '@/components/common';
import {
  IngredientDetailDrawer,
  AddIngredientDrawer,
  InventoryIngredient,
  PurchaseOrderManagement,
  IngredientCategoryManagement,
  IngredientUnitManagement,
  StockInManagement,
  StockOutManagement,
  StockAdjustmentManagement,
} from '@/components/inventory';
import { formatRupiah } from '@/utils';

// 9 Items matching Screenshot 2 exactly
const INITIAL_INGREDIENTS: InventoryIngredient[] = [
  {
    id: 'ing-1',
    name: 'Biji Kopi Arabica',
    sku: 'ING-001',
    category: 'Kopi',
    unit: 'kg',
    currentStock: 5.2,
    minStock: 2,
    costPrice: 120000,
    status: 'Aman',
    description: 'Biji kopi arabica premium untuk menu kopi.',
    image: '/img/ingredients/biji_kopi_arabica.jpg',
    supplier: 'PT Kopi Nusantara',
    storageLocation: 'Gudang Bahan Kering',
    shelfLifeValue: 12,
    shelfLifeUnit: 'Bulan',
    expiryDate: '31 Des 2026',
  },
  {
    id: 'ing-2',
    name: 'Biji Kopi Arabica',
    sku: 'ING-002',
    category: 'Kopi',
    unit: 'kg',
    currentStock: 3.1,
    minStock: 2,
    costPrice: 90000,
    status: 'Aman',
    description: 'Biji kopi arabica grade 2 untuk blend.',
    image: '/img/ingredients/biji_kopi_arabica.jpg',
    supplier: 'PT Kopi Nusantara',
    storageLocation: 'Gudang Bahan Kering',
    shelfLifeValue: 12,
    shelfLifeUnit: 'Bulan',
    expiryDate: '31 Des 2026',
  },
  {
    id: 'ing-3',
    name: 'Susu UHT Full Cream',
    sku: 'ING-003',
    category: 'Susu',
    unit: 'liter',
    currentStock: 12,
    minStock: 5,
    costPrice: 18000,
    status: 'Aman',
    description: 'Susu cair segar kemasan karton 1L.',
    image: '/img/ingredients/biji_kopi_arabica.jpg',
    supplier: 'PT Sumber Susu Murni',
    storageLocation: 'Chiller Bar Depan',
    shelfLifeValue: 6,
    shelfLifeUnit: 'Bulan',
    expiryDate: '15 Jan 2027',
  },
  {
    id: 'ing-4',
    name: 'Susu Oat',
    sku: 'ING-004',
    category: 'Susu',
    unit: 'liter',
    currentStock: 2,
    minStock: 5,
    costPrice: 28000,
    status: 'Menipis',
    description: 'Plant-based oat milk ramah vegan & lactose-free.',
    image: '/img/ingredients/biji_kopi_arabica.jpg',
    supplier: 'PT Sumber Susu Murni',
    storageLocation: 'Chiller Bar Depan',
    shelfLifeValue: 6,
    shelfLifeUnit: 'Bulan',
    expiryDate: '20 Des 2026',
  },
  {
    id: 'ing-5',
    name: 'Matcha Powder',
    sku: 'ING-005',
    category: 'Bubuk',
    unit: 'kg',
    currentStock: 0.8,
    minStock: 1,
    costPrice: 350000,
    status: 'Menipis',
    description: 'Bubuk matcha murni impor dari Uji, Kyoto.',
    image: '/img/ingredients/biji_kopi_arabica.jpg',
    supplier: 'Distributor Bubuk Java',
    storageLocation: 'Gudang Bahan Kering',
    shelfLifeValue: 12,
    shelfLifeUnit: 'Bulan',
    expiryDate: '31 Des 2026',
  },
  {
    id: 'ing-6',
    name: 'Coklat Powder',
    sku: 'ING-006',
    category: 'Bubuk',
    unit: 'kg',
    currentStock: 1.5,
    minStock: 1,
    costPrice: 120000,
    status: 'Aman',
    description: 'Dark cocoa powder 100% tanpa pemanis buatan.',
    image: '/img/ingredients/biji_kopi_arabica.jpg',
    supplier: 'Distributor Bubuk Java',
    storageLocation: 'Gudang Bahan Kering',
    shelfLifeValue: 18,
    shelfLifeUnit: 'Bulan',
    expiryDate: '10 Feb 2027',
  },
  {
    id: 'ing-7',
    name: 'Sirup Gula Aren',
    sku: 'ING-007',
    category: 'Sirup',
    unit: 'liter',
    currentStock: 1,
    minStock: 2,
    costPrice: 45000,
    status: 'Menipis',
    description: 'Liquid palm sugar kental dengan aroma karamel alami.',
    image: '/img/ingredients/biji_kopi_arabica.jpg',
    supplier: 'Mitra Sirup Barista',
    storageLocation: 'Rak Sirup & Topping',
    shelfLifeValue: 12,
    shelfLifeUnit: 'Bulan',
    expiryDate: '31 Des 2026',
  },
  {
    id: 'ing-8',
    name: 'Sirup Vanilla',
    sku: 'ING-008',
    category: 'Sirup',
    unit: 'liter',
    currentStock: 4,
    minStock: 2,
    costPrice: 60000,
    status: 'Aktif',
    description: 'Sirup rasa vanilla premium untuk varian latte.',
    image: '/img/ingredients/biji_kopi_arabica.jpg',
    supplier: 'Mitra Sirup Barista',
    storageLocation: 'Rak Sirup & Topping',
    shelfLifeValue: 12,
    shelfLifeUnit: 'Bulan',
    expiryDate: '31 Des 2026',
  },
  {
    id: 'ing-9',
    name: 'Air Mineral',
    sku: 'ING-009',
    category: 'Minuman',
    unit: 'pcs',
    currentStock: 10,
    minStock: 10,
    costPrice: 5000,
    status: 'Menipis',
    description: 'Air mineral kemasan galon/botol 600ml.',
    image: '/img/ingredients/biji_kopi_arabica.jpg',
    supplier: 'Distributor Sumber Air',
    storageLocation: 'Gudang Bahan Kering',
    shelfLifeValue: 24,
    shelfLifeUnit: 'Bulan',
    expiryDate: '31 Des 2027',
  },
];

type InventoryTabKey =
  | 'bahan'
  | 'po'
  | 'category'
  | 'unit'
  | 'stock-in'
  | 'stock-out'
  | 'adjustment';

function InventoryContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab') as InventoryTabKey | null;

  const [activeTab, setActiveTab] = useState<InventoryTabKey>(tabParam || 'bahan');

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);
  const [ingredients, setIngredients] = useState<InventoryIngredient[]>(INITIAL_INGREDIENTS);
  const [demoMode, setDemoMode] = useState<'populated' | 'empty'>('populated');

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer States
  const [selectedIngredient, setSelectedIngredient] = useState<InventoryIngredient | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sub-tab creation modal triggers
  const [isCreatePOOpen, setIsCreatePOOpen] = useState(false);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isCreateUnitOpen, setIsCreateUnitOpen] = useState(false);
  const [isCreateStockInOpen, setIsCreateStockInOpen] = useState(false);
  const [isCreateStockOutOpen, setIsCreateStockOutOpen] = useState(false);
  const [isCreateAdjustmentOpen, setIsCreateAdjustmentOpen] = useState(false);

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'po':
        return 'Buat PO';
      case 'category':
        return 'Tambah Kategori';
      case 'unit':
        return 'Tambah Satuan';
      case 'stock-in':
        return 'Catat Stok Masuk';
      case 'stock-out':
        return 'Catat Stok Keluar';
      case 'adjustment':
        return 'Mulai Opname';
      default:
        return 'Tambah Bahan';
    }
  };

  const handleTopAddClick = () => {
    switch (activeTab) {
      case 'po':
        setIsCreatePOOpen(true);
        break;
      case 'category':
        setIsCreateCategoryOpen(true);
        break;
      case 'unit':
        setIsCreateUnitOpen(true);
        break;
      case 'stock-in':
        setIsCreateStockInOpen(true);
        break;
      case 'stock-out':
        setIsCreateStockOutOpen(true);
        break;
      case 'adjustment':
        setIsCreateAdjustmentOpen(true);
        break;
      default:
        setIsAddOpen(true);
        break;
    }
  };

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered ingredients
  const filteredIngredients = useMemo(() => {
    if (demoMode === 'empty') return [];

    return ingredients.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
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
  }, [ingredients, demoMode, selectedCategory, selectedStatus, searchQuery]);

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredIngredients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIngredients.map((item) => item.id));
    }
  };

  // Handlers
  const handleOpenDetail = (item: InventoryIngredient) => {
    setSelectedIngredient(item);
    setIsDetailOpen(true);
  };

  const handleSaveIngredient = (updated: InventoryIngredient) => {
    setIngredients((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    showToast(`Bahan "${updated.name}" berhasil diperbarui.`);
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
    showToast('Bahan berhasil dihapus dari inventori.');
  };

  const handleAddIngredient = (newItem: InventoryIngredient) => {
    setIngredients((prev) => [newItem, ...prev]);
    showToast(`Bahan baru "${newItem.name}" berhasil ditambahkan.`);
  };

  // Helper for Category Pill
  const renderCategoryBadge = (category: InventoryIngredient['category']) => {
    switch (category) {
      case 'Kopi':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFF8E1] text-[#8D6E63] border border-[#FFE082]/40">
            Kopi
          </span>
        );
      case 'Susu':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E3F2FD] text-[#1976D2] border border-[#BBDEFB]/50">
            Susu
          </span>
        );
      case 'Bubuk':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#ECEFF1] text-[#546E7A] border border-[#CFD8DC]/50">
            Bubuk
          </span>
        );
      case 'Sirup':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FFEBEE] text-[#D32F2F] border border-[#FFCDD2]/50">
            Sirup
          </span>
        );
      case 'Minuman':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E0F7FA] text-[#00838F] border border-[#B2EBF2]/50">
            Minuman
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
            {category}
          </span>
        );
    }
  };

  // Helper for Status Badge
  const renderStatusBadge = (status: InventoryIngredient['status']) => {
    switch (status) {
      case 'Aman':
      case 'Aktif':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E8F5E9] text-[#2E7D32]">
            <span className="size-3.5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-[8px] font-bold">
              <Check className="size-2.5 stroke-[3]" />
            </span>
            <span>{status}</span>
          </span>
        );
      case 'Menipis':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FFF8E1] text-[#B78103]">
            <span className="size-3.5 rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-[8px] font-bold">
              <Bell className="size-2.5 stroke-[2.5]" />
            </span>
            <span>Menipis</span>
          </span>
        );
      case 'Habis':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FFEBEE] text-[#C62828]">
            <span className="size-3.5 rounded-full bg-[#E53935] text-white flex items-center justify-center text-[8px] font-bold">
              !
            </span>
            <span>Habis</span>
          </span>
        );
    }
  };

  // DataTable Columns definition
  const columns: ColumnDef<InventoryIngredient>[] = [
    {
      key: 'name',
      header: 'Nama Bahan',
      render: (item) => (
        <div className="flex items-center gap-3">
          {/* Thumbnail */}
          <div className="size-10 rounded-lg overflow-hidden border border-neutral-200 shrink-0 relative bg-neutral-100 shadow-2xs">
            <Image
              src={item.image || '/img/ingredients/biji_kopi_arabica.jpg'}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>

          <div>
            <p className="font-semibold text-neutral-900 text-xs tracking-tight">{item.name}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5 font-mono">SKU: {item.sku}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (item) => renderCategoryBadge(item.category),
    },
    {
      key: 'unit',
      header: 'Satuan',
      render: (item) => <span className="text-neutral-600 text-xs">{item.unit}</span>,
    },
    {
      key: 'currentStock',
      header: 'Stok saat ini',
      render: (item) => (
        <span className="font-medium text-neutral-900 text-xs">
          {item.currentStock.toString().replace('.', ',')} {item.unit}
        </span>
      ),
    },
    {
      key: 'minStock',
      header: 'Stok Minimum',
      render: (item) => (
        <span className="text-neutral-600 text-xs">
          {item.minStock.toString().replace('.', ',')} {item.unit}
        </span>
      ),
    },
    {
      key: 'costPrice',
      header: 'Harga Modal',
      render: (item) => (
        <span className="font-medium text-neutral-800 text-xs">
          {formatRupiah(item.costPrice)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => renderStatusBadge(item.status),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (item) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenDetail(item);
          }}
          className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          title="Opsi Bahan"
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

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Inventori & Stok</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Kelola bahan, stok, pergerakan inventori dan purchase order untuk mendukung operasional
            outlet
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Subtle switcher for testing empty state per screenshot 3 */}
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-lg border border-neutral-200 text-xs">
            <Button
              size="xs"
              variant={demoMode === 'populated' ? 'secondary' : 'ghost'}
              onClick={() => setDemoMode('populated')}
              className={demoMode === 'populated' ? 'bg-white shadow-2xs text-neutral-900' : 'text-neutral-500'}
            >
              Data Terisi
            </Button>
            <Button
              size="xs"
              variant={demoMode === 'empty' ? 'secondary' : 'ghost'}
              onClick={() => setDemoMode('empty')}
              className={demoMode === 'empty' ? 'bg-white shadow-2xs text-neutral-900' : 'text-neutral-500'}
            >
              Data Kosong
            </Button>
          </div>

          {/* Dynamic "+ Tambah ..." Primary Button */}
          <Button
            variant="primary"
            onClick={handleTopAddClick}
            className="bg-[#FF5C38] hover:bg-[#EE4E2A] text-white text-xs font-semibold h-9 px-4 rounded-xl shadow-2xs"
            leftIcon={<Plus className="size-4 stroke-[2.5]" />}
          >
            {getAddButtonText()}
          </Button>
        </div>
      </div>

      {/* Horizontal Tabs matching Screenshot 2 */}
      <div className="border-b border-neutral-200 flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
        <button
          type="button"
          onClick={() => setActiveTab('bahan')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'bahan'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Package className="size-4" />
          <span>Bahan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('po')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'po'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <FileText className="size-4" />
          <span>Purchase Order</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('category')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'category'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Tag className="size-4" />
          <span>Kategori</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('unit')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'unit'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Scale className="size-4" />
          <span>Satuan</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stock-in')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'stock-in'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <ArrowDownLeft className="size-4" />
          <span>Stok Masuk</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('stock-out')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'stock-out'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <ArrowUpRight className="size-4" />
          <span>Stok Keluar</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('adjustment')}
          className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all shrink-0 ${
            activeTab === 'adjustment'
              ? 'border-[#E5484D] text-[#E5484D]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Sliders className="size-4" />
          <span>Penyesuaian Stok</span>
        </button>
      </div>

      {activeTab === 'bahan' ? (
        <div className="space-y-4">
          {/* Filters Bar matching Screenshot 2 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={[
                  { value: 'all', label: 'Semua kategori' },
                  { value: 'Kopi', label: 'Kopi' },
                  { value: 'Susu', label: 'Susu' },
                  { value: 'Bubuk', label: 'Bubuk' },
                  { value: 'Sirup', label: 'Sirup' },
                  { value: 'Minuman', label: 'Minuman' },
                ]}
                className="w-44 h-9 text-xs"
              />

              {/* Status Filter */}
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={[
                  { value: 'all', label: 'Semua status' },
                  { value: 'Aman', label: 'Aman' },
                  { value: 'Menipis', label: 'Menipis' },
                  { value: 'Habis', label: 'Habis' },
                ]}
                className="w-44 h-9 text-xs"
              />
            </div>

            {/* Right Search Input */}
            <div className="w-full md:w-80">
              <SearchInput
                placeholder="Cari nama bahan, SKU, atau kategori"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Main Table or Empty State */}
          {filteredIngredients.length === 0 ? (
            /* Empty State matching Screenshot 3 */
            <div className="min-h-[460px] bg-white rounded-2xl border border-neutral-200 p-8 flex flex-col items-center justify-center text-center">
              <div className="size-20 rounded-2xl bg-neutral-100 flex items-center justify-center mb-4 text-neutral-400">
                <Inbox className="size-10 stroke-[1.5]" />
              </div>
              <h3 className="text-sm font-bold text-neutral-800 tracking-wider uppercase mb-1">
                BELUM ADA DATA INVENTORI
              </h3>
              <p className="text-xs text-neutral-500 max-w-md mb-6 leading-relaxed">
                Tambahkan bahan baku atau barang inventori untuk mulai memantau stok dan pemakaian
                di outletmu.
              </p>
              <Button
                variant="primary"
                onClick={() => setIsAddOpen(true)}
                className="bg-[#2196F3] hover:bg-[#1E88E5] text-white text-xs font-semibold h-10 px-6 rounded-xl"
              >
                Tambah Bahan
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <DataTable<InventoryIngredient>
                columns={columns}
                data={filteredIngredients}
                keyExtractor={(item) => item.id}
                selectable={true}
                selectedIds={selectedIds}
                onToggleSelect={toggleSelectRow}
                onToggleSelectAll={toggleSelectAll}
                onRowClick={(item) => handleOpenDetail(item)}
                emptyTitle="BELUM ADA DATA INVENTORI"
                emptyDescription="Tambahkan bahan baku atau barang inventori untuk mulai memantau stok dan pemakaian di outletmu."
                entityName="bahan"
              />

              {/* Bottom Pagination matching Screenshot 2 */}
              <Pagination
                totalItems={filteredIngredients.length}
                totalPages={Math.ceil(filteredIngredients.length / itemsPerPage) || 1}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                itemName="bahan"
              />
            </div>
          )}
        </div>
      ) : activeTab === 'po' ? (
        <PurchaseOrderManagement
          onShowToast={showToast}
          isCreateOpen={isCreatePOOpen}
          onCloseCreate={() => setIsCreatePOOpen(false)}
        />
      ) : activeTab === 'category' ? (
        <IngredientCategoryManagement
          onShowToast={showToast}
          isCreateOpen={isCreateCategoryOpen}
          onCloseCreate={() => setIsCreateCategoryOpen(false)}
        />
      ) : activeTab === 'unit' ? (
        <IngredientUnitManagement
          onShowToast={showToast}
          isCreateOpen={isCreateUnitOpen}
          onCloseCreate={() => setIsCreateUnitOpen(false)}
        />
      ) : activeTab === 'stock-in' ? (
        <StockInManagement
          onShowToast={showToast}
          isCreateOpen={isCreateStockInOpen}
          onCloseCreate={() => setIsCreateStockInOpen(false)}
        />
      ) : activeTab === 'stock-out' ? (
        <StockOutManagement
          onShowToast={showToast}
          isCreateOpen={isCreateStockOutOpen}
          onCloseCreate={() => setIsCreateStockOutOpen(false)}
        />
      ) : activeTab === 'adjustment' ? (
        <StockAdjustmentManagement
          onShowToast={showToast}
          isCreateOpen={isCreateAdjustmentOpen}
          onCloseCreate={() => setIsCreateAdjustmentOpen(false)}
        />
      ) : null}

      {/* Ingredient Detail & Edit Drawer (Screenshot 1) */}
      <IngredientDetailDrawer
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        item={selectedIngredient}
        onSave={handleSaveIngredient}
        onDelete={handleDeleteIngredient}
      />

      {/* Add Ingredient Drawer */}
      <AddIngredientDrawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddIngredient}
      />
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-neutral-400">Memuat inventori...</div>}>
      <InventoryContent />
    </Suspense>
  );
}
