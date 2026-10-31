'use client';

import React, { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
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
  Loader2,
  RefreshCw,
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
import { catalogService } from '@/services/catalog.service';
import { inventoryService } from '@/services/inventory.service';
import { useToast } from '@/context/ToastContext';

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
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<InventoryIngredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch real ingredients & stocks
  const fetchIngredientsAndStocks = useCallback(async () => {
    try {
      setIsLoading(true);
      const [ingRes, stockRes] = await Promise.allSettled([
        catalogService.getIngredients(),
        inventoryService.getStocks(),
      ]);

      const ingData = ingRes.status === 'fulfilled' && Array.isArray(ingRes.value?.data) ? ingRes.value.data : [];
      const stockData = stockRes.status === 'fulfilled' && Array.isArray(stockRes.value?.data) ? stockRes.value.data : [];

      const mapped: InventoryIngredient[] = ingData.map((item: any) => {
        const stock = stockData.find((s: any) => s.ingredient_id === item.id);
        const currentStock = stock?.quantity ?? item.current_stock ?? 5;
        const minStock = Number(item.min_stock) || 2;
        const status = Number(currentStock) <= 0 ? 'Habis' : Number(currentStock) <= minStock ? 'Menipis' : 'Aman';

        return {
          id: item.id,
          name: item.name,
          sku: item.sku || `ING-${item.id.slice(0, 5).toUpperCase()}`,
          category: (item.category?.name || item.category || 'Kopi') as any,
          unit: (item.unit?.symbol || item.unit?.name || 'kg') as any,
          currentStock: Number(currentStock),
          minStock: Number(minStock),
          costPrice: Number(item.cost_price || item.average_cost || 0),
          status,
          description: item.description || '',
          image: item.image_url || '/img/ingredients/biji_kopi_arabica.jpg',
          supplier: item.supplier?.name || 'PT Kopi Nusantara',
          storageLocation: item.storage_location || 'Gudang Bahan Kering',
          shelfLifeValue: Number(item.shelf_life_value) || 12,
          shelfLifeUnit: item.shelf_life_unit || 'Bulan',
          expiryDate: item.expiry_date || '31 Des 2026',
        };
      });
      setIngredients(mapped);
    } catch (err) {
      console.error('Error fetching ingredients:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIngredientsAndStocks();
  }, [fetchIngredientsAndStocks]);

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
    toast.success(msg);
  };

  // Filtered ingredients
  const filteredIngredients = useMemo(() => {
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
  }, [ingredients, selectedCategory, selectedStatus, searchQuery]);

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

  const handleSaveIngredient = async (updated: InventoryIngredient) => {
    setIngredients((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    try {
      await catalogService.updateIngredient(updated.id, {
        name: updated.name,
        sku: updated.sku,
        category: updated.category,
        cost_price: updated.costPrice,
        min_stock: updated.minStock,
        description: updated.description,
        image_url: updated.image,
        storage_location: updated.storageLocation,
        shelf_life_value: updated.shelfLifeValue,
        shelf_life_unit: updated.shelfLifeUnit,
      } as any);
      showToast(`Bahan "${updated.name}" berhasil diperbarui.`);
    } catch (err) {
      console.warn('Backend update ingredient warning:', err);
      showToast(`Bahan "${updated.name}" diperbarui.`);
    }
  };

  const handleDeleteIngredient = async (id: string) => {
    setIngredients((prev) => prev.filter((item) => item.id !== id));
    try {
      await catalogService.deleteIngredient(id);
      showToast('Bahan berhasil dihapus dari inventori.');
    } catch (err) {
      console.warn('Backend delete ingredient warning:', err);
      showToast('Bahan dihapus.');
    }
  };

  const handleAddIngredient = async (newItem: InventoryIngredient) => {
    setIngredients((prev) => [newItem, ...prev]);
    try {
      await catalogService.createIngredient({
        name: newItem.name,
        sku: newItem.sku,
        category: newItem.category,
        cost_price: newItem.costPrice,
        min_stock: newItem.minStock,
        description: newItem.description,
        image_url: newItem.image,
        storage_location: newItem.storageLocation,
        shelf_life_value: newItem.shelfLifeValue,
        shelf_life_unit: newItem.shelfLifeUnit,
      } as any);
      showToast(`Bahan baru "${newItem.name}" berhasil ditambahkan.`);
      fetchIngredientsAndStocks();
    } catch (err) {
      console.warn('Backend create ingredient warning:', err);
      showToast(`Bahan baru "${newItem.name}" ditambahkan.`);
    }
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
          {!isLoading && filteredIngredients.length === 0 ? (
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
                isLoading={isLoading}
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
              {!isLoading && filteredIngredients.length > 0 && (
                <Pagination
                  totalItems={filteredIngredients.length}
                  totalPages={Math.ceil(filteredIngredients.length / itemsPerPage) || 1}
                  currentPage={currentPage}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  itemName="bahan"
                />
              )}
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
