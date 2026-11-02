'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  DataTable,
  ColumnDef,
  StatusBadge,
  Button,
  SearchInput,
  Select,
  PageLoader,
} from '@/components/common';
import {
  MenuDetailsDrawer,
  MenuItem,
  CategoryManagement,
  TypeManagement,
  SectionManagement,
} from '@/components/menu';
import { catalogService } from '@/services/catalog.service';
import { Product } from '@/types';
import { formatRupiah } from '@/utils';

type MenuTab = 'menu' | 'category' | 'type' | 'section';

export default function MenuCatalogPage() {
  const [activeTab, setActiveTab] = useState<MenuTab>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('edit');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to deduce category & type from product attributes
  const deduceMeta = (name: string, description: string = '') => {
    const lower = `${name} ${description}`.toLowerCase();
    if (lower.includes('croissant') || lower.includes('pain au') || lower.includes('roll') || lower.includes('pastry') || lower.includes('roti') || lower.includes('bread')) {
      return { category: 'Pastry', type: 'Makanan' as const };
    }
    if (lower.includes('nasi') || lower.includes('pasta') || lower.includes('sandwich') || lower.includes('carbonara') || lower.includes('burger')) {
      return { category: 'Makanan Berat', type: 'Makanan' as const };
    }
    if (lower.includes('fries') || lower.includes('snack') || lower.includes('truffle')) {
      return { category: 'Cemilan', type: 'Cemilan' as const };
    }
    if (lower.includes('tea') || lower.includes('matcha') || lower.includes('chocolate') || lower.includes('cokelat') || lower.includes('lychee')) {
      return { category: 'Non-Kopi', type: 'Minuman' as const };
    }
    return { category: 'Kopi', type: 'Minuman' as const };
  };

  // Load products from backend database
  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await catalogService.getProducts();
      const rawProducts: Product[] = Array.isArray(res?.data) ? res.data : [];

      const mapped: MenuItem[] = rawProducts.map((p) => {
        const rawCategory = (p as any).category;
        const rawType = (p as any).type;
        const meta = deduceMeta(p.name, p.description || '');
        const category = rawCategory || meta.category;
        const type = rawType || meta.type;
        const price = Number(p.selling_price) || 0;
        const cost = Number((p as any).cost_price) || 0;
        const margin = price > 0 ? Math.round(((price - cost) / price) * 100 * 10) / 10 : 0;

        const rawRecipeItems = Array.isArray((p as any).recipe?.items)
          ? (p as any).recipe.items.map((ri: any) => ({
              id: ri.id,
              ingredientId: ri.ingredient_id,
              name: ri.ingredient_name || 'Bahan',
              unitId: ri.unit_id,
              unit: ri.unit_code || 'pcs',
              amount: Number(ri.quantity) || 0,
              unitCost: Number(ri.unit_cost) || 0,
              cost: Number(ri.subtotal_cost) || Math.round((Number(ri.quantity) || 0) * (Number(ri.unit_cost) || 0)),
              currentStock: Number(ri.current_stock ?? 0),
            }))
          : [];

        return {
          id: p.id,
          name: p.name,
          sku: p.sku || `SKU-${p.id.slice(-6)}`,
          category,
          type,
          price,
          cost,
          margin,
          status: p.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif',
          description: p.description || '',
          image: p.image_url || undefined,
          availablePortions: (p as any).available_portions ?? null,
          recipeItems: rawRecipeItems,
        };
      });

      setMenuItems(mapped);
    } catch (err) {
      console.error('Failed to load catalog products:', err);
      showToast('Gagal memuat katalog menu dari database.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Filtered menu list
  const filteredMenuItems = useMemo(() => {
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
  }, [menuItems, selectedType, selectedStatus, searchQuery]);

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

  const handleOpenItem = (item: MenuItem) => {
    setSelectedItem(item);
    setDrawerMode('edit');
    setIsDrawerOpen(true);
  };

  const handleSaveItem = async (updated: MenuItem) => {
    try {
      const recipePayload = Array.isArray(updated.recipeItems)
        ? updated.recipeItems
            .filter((ri) => ri.ingredientId && ri.amount > 0)
            .map((ri) => ({
              ingredient_id: ri.ingredientId,
              unit_id: ri.unitId || undefined,
              quantity: ri.amount,
            }))
        : [];

      if (drawerMode === 'create') {
        await catalogService.createProduct({
          name: updated.name,
          sku: updated.sku,
          selling_price: updated.price,
          description: updated.description,
          status: updated.status === 'Aktif' ? 'ACTIVE' : 'INACTIVE',
          image_url: updated.image,
          category: updated.category,
          type: updated.type,
          cost_price: updated.cost,
          recipe_items: recipePayload,
        } as any);
        showToast(`Menu ${updated.name} beserta resep berhasil dibuat di database!`);
      } else {
        await catalogService.updateProduct(updated.id, {
          name: updated.name,
          sku: updated.sku,
          selling_price: updated.price,
          description: updated.description,
          status: updated.status === 'Aktif' ? 'ACTIVE' : 'INACTIVE',
          image_url: updated.image,
          category: updated.category,
          type: updated.type,
          cost_price: updated.cost,
          recipe_items: recipePayload,
        } as any);
        showToast(`Menu ${updated.name} beserta resep berhasil diperbarui di database!`);
      }
      await loadProducts();
      setIsDrawerOpen(false);
    } catch (err: any) {
      console.error('Failed to save product:', err);
      showToast(err?.message || err?.response?.data?.message || 'Gagal menyimpan menu ke database.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await catalogService.deleteProduct(itemId);
      await loadProducts();
      setIsDrawerOpen(false);
      showToast('Menu berhasil dihapus dari database!');
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      showToast(err?.response?.data?.message || 'Gagal menghapus menu.');
    }
  };

  const handleCreateNew = () => {
    const newItem: MenuItem = {
      id: '',
      name: '',
      sku: `PRD-${String(menuItems.length + 1).padStart(3, '0')}`,
      category: 'Kopi',
      type: 'Minuman',
      price: 28000,
      cost: 8000,
      margin: 71.4,
      status: 'Aktif',
      description: '',
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

  // Category Badge Helper
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Kopi':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <Coffee className="size-3" />
            <span>Kopi</span>
          </span>
        );
      case 'Pastry':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-800 border border-orange-200">
            <Cookie className="size-3" />
            <span>Pastry</span>
          </span>
        );
      case 'Makanan Berat':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Utensils className="size-3" />
            <span>Makanan</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
            <span>{category}</span>
          </span>
        );
    }
  };

  // Columns definition for DataTable
  const columns: ColumnDef<MenuItem>[] = [
    {
      key: 'name',
      header: 'Nama Menu',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0 overflow-hidden border border-neutral-200/80">
            {item.image ? (
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            ) : item.category === 'Pastry' ? (
              <Cookie className="size-5 text-neutral-500" />
            ) : item.category === 'Makanan Berat' ? (
              <Utensils className="size-5 text-neutral-500" />
            ) : (
              <Coffee className="size-5 text-neutral-500" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-neutral-900 group-hover:text-orange-600 transition-colors">
              {item.name}
            </span>
            <span className="text-xs text-neutral-400 font-mono">{item.sku}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (item) => getCategoryBadge(item.category),
    },
    {
      key: 'type',
      header: 'Tipe',
      render: (item) => (
        <span className="text-xs text-neutral-600 font-medium">{item.type}</span>
      ),
    },
    {
      key: 'price',
      header: 'Harga Jual',
      align: 'right',
      render: (item) => (
        <span className="font-semibold text-neutral-900">{formatRupiah(item.price)}</span>
      ),
    },
    {
      key: 'cost',
      header: 'Harga Modal',
      align: 'right',
      render: (item) => (
        <span className="text-neutral-500 text-xs">{formatRupiah(item.cost)}</span>
      ),
    },
    {
      key: 'margin',
      header: 'Margin',
      align: 'right',
      render: (item) => (
        <span className="text-xs font-medium text-emerald-600">{item.margin}%</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge
          variant={item.status === 'Aktif' ? 'success' : 'neutral'}
          dot
          size="sm"
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
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleOpenItem(item);
          }}
          className="text-neutral-400 hover:text-neutral-600 p-1 rounded-md hover:bg-neutral-100 transition-colors"
        >
          <MoreVertical className="size-4" />
        </button>
      ),
      width: '48px',
    },
  ];

  if (isLoading) {
    return <PageLoader text="Memuat katalog menu..." />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-4 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <Check className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header matching Figma screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Menu</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Kelola semua menu, harga jual, dan status produk langsung dari database.
          </p>
        </div>

        {/* Right Header: Refresh & Add Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => loadProducts()}
            disabled={isLoading}
          >
            Segarkan
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="size-4 stroke-[2.5]" />}
            onClick={handleTopAddClick}
          >
            {getAddButtonText()}
          </Button>
        </div>
      </div>

      {/* Navigation Tabs: Menu, Kategori, Tipe, Section */}
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
          {/* Filter Bar matching Screenshot 1 */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Channel Filter */}
              <Select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value)}
                size="sm"
                options={[
                  { value: 'all', label: 'Semua Channel' },
                  { value: 'dine-in', label: 'Dine-In' },
                  { value: 'takeaway', label: 'Takeaway' },
                  { value: 'delivery', label: 'Delivery' },
                ]}
              />

              {/* Tipe Filter */}
              <Select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
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
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                size="sm"
                options={[
                  { value: 'all', label: 'Semua Status' },
                  { value: 'Aktif', label: 'Aktif' },
                  { value: 'Nonaktif', label: 'Nonaktif' },
                ]}
              />
            </div>

            {/* Search Input on right */}
            <div className="w-full sm:w-64">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Cari nama menu..."
                size="sm"
              />
            </div>
          </div>

          {/* Table Container with Skeleton & Real Data */}
          <DataTable
            columns={columns}
            data={filteredMenuItems}
            isLoading={isLoading}
            keyExtractor={(item) => item.id}
            selectable
            selectedIds={selectedIds}
            onToggleSelect={toggleSelectRow}
            onToggleSelectAll={toggleSelectAll}
            onRowClick={handleOpenItem}
            emptyTitle="BELUM ADA MENU"
            emptyDescription="Kamu belum menambahkan menu. Klik tombol di bawah untuk mulai membuat menu pertamamu."
            entityName="menu"
            showPagination={!isLoading && filteredMenuItems.length > 0}
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

      {/* Detail Slide-over Drawer */}
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
