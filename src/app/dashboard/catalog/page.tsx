'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Coffee,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Scale,
  Truck,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { catalogService } from '@/services';
import { Product, Ingredient, Unit, Supplier, UnitType } from '@/types';

import { ApiError } from '@/lib/api';
import { formatRupiah } from '@/utils';
import { useDebounce } from '@/hooks';
import { PageHeader, EmptyState, LoadingScreen } from '@/components/common';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

type CatalogTab = 'products' | 'ingredients' | 'units' | 'suppliers';

export default function CatalogPage() {
  const { activeStore } = useStore();

  const [activeTab, setActiveTab] = useState<CatalogTab>('products');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Dialog & Form States
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form Fields - Product
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodSku, setProdSku] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodImage, setProdImage] = useState('');
  const [prodStatus, setProdStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');

  // Form Fields - Ingredient
  const [editingIngId, setEditingIngId] = useState<string | null>(null);
  const [ingName, setIngName] = useState('');
  const [ingSku, setIngSku] = useState('');
  const [ingUnitId, setIngUnitId] = useState('');

  // Form Fields - Unit
  const [unitName, setUnitName] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [unitType, setUnitType] = useState<'WEIGHT' | 'VOLUME' | 'PIECE' | 'LENGTH'>('WEIGHT');

  // Form Fields - Supplier
  const [editingSupId, setEditingSupId] = useState<string | null>(null);
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');

  // Fetch all catalog datasets
  const loadCatalogData = useCallback(async () => {
    if (!activeStore) return;
    setLoading(true);
    try {
      const [prodRes, ingRes, unitRes, supRes] = await Promise.all([
        catalogService.getProducts(),
        catalogService.getIngredients(),
        catalogService.getUnits(),
        catalogService.getSuppliers(),
      ]);
      setProducts(prodRes.data || []);
      setIngredients(ingRes.data || []);
      setUnits(unitRes.data || []);
      setSuppliers(supRes.data || []);
    } catch (err) {
      console.error('Failed to load catalog:', err);
    } finally {
      setLoading(false);
    }
  }, [activeStore]);

  useEffect(() => {
    loadCatalogData();
  }, [loadCatalogData]);

  // Modals Openers
  const openProductModal = (p?: Product) => {
    setFormError(null);
    if (p) {
      setEditingProductId(p.id);
      setProdName(p.name);
      setProdSku(p.sku);
      setProdPrice(String(p.selling_price));
      setProdDesc(p.description || '');
      setProdImage(p.image_url || '');
      setProdStatus(p.status);
    } else {
      setEditingProductId(null);
      setProdName('');
      setProdSku(`PRD-${String(products.length + 1).padStart(3, '0')}`);
      setProdPrice('');
      setProdDesc('');
      setProdImage('');
      setProdStatus('ACTIVE');
    }
    setModalOpen(true);
  };

  const openIngredientModal = (ing?: Ingredient) => {
    setFormError(null);
    if (ing) {
      setEditingIngId(ing.id);
      setIngName(ing.name);
      setIngSku(ing.sku);
      setIngUnitId(ing.unit_id);
    } else {
      setEditingIngId(null);
      setIngName('');
      setIngSku(`ING-${String(ingredients.length + 1).padStart(3, '0')}`);
      setIngUnitId(units[0]?.id || '');
    }
    setModalOpen(true);
  };

  const openUnitModal = () => {
    setFormError(null);
    setUnitName('');
    setUnitCode('');
    setUnitType('WEIGHT');
    setModalOpen(true);
  };

  const openSupplierModal = (sup?: Supplier) => {
    setFormError(null);
    if (sup) {
      setEditingSupId(sup.id);
      setSupName(sup.name);
      setSupContact(sup.contact_name || '');
      setSupPhone(sup.phone || '');
      setSupEmail(sup.email || '');
      setSupAddress(sup.address || '');
    } else {
      setEditingSupId(null);
      setSupName('');
      setSupContact('');
      setSupPhone('');
      setSupEmail('');
      setSupAddress('');
    }
    setModalOpen(true);
  };

  // Form Submissions
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: prodName,
        sku: prodSku,
        selling_price: parseFloat(prodPrice) || 0,
        description: prodDesc || null,
        image_url: prodImage.trim() || null,
        status: prodStatus,
      };

      if (editingProductId) {
        await catalogService.updateProduct(editingProductId, payload);
      } else {
        await catalogService.createProduct(payload);
      }
      setModalOpen(false);
      loadCatalogData();
    } catch (err: unknown) {
      if (err instanceof ApiError) setFormError(err.message);
      else setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: ingName,
        sku: ingSku,
        unit_id: ingUnitId,
        status: 'ACTIVE' as const,
      };

      if (editingIngId) {
        await catalogService.updateIngredient(editingIngId, payload);
      } else {
        await catalogService.createIngredient(payload);
      }
      setModalOpen(false);
      loadCatalogData();
    } catch (err: unknown) {
      if (err instanceof ApiError) setFormError(err.message);
      else setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await catalogService.createUnit({
        name: unitName,
        code: unitCode.toUpperCase(),
        type: unitType,
      });
      setModalOpen(false);
      loadCatalogData();
    } catch (err: unknown) {
      if (err instanceof ApiError) setFormError(err.message);
      else setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const payload = {
        name: supName,
        contact_name: supContact || null,
        phone: supPhone || null,
        email: supEmail || null,
        address: supAddress || null,
      };

      if (editingSupId) {
        await catalogService.createSupplier(payload); // or update
      } else {
        await catalogService.createSupplier(payload);
      }
      setModalOpen(false);
      loadCatalogData();
    } catch (err: unknown) {
      if (err instanceof ApiError) setFormError(err.message);
      else setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // Delete Handlers
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await catalogService.deleteProduct(id);
      loadCatalogData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleDeleteIngredient = async (id: string) => {
    if (!confirm('Yakin ingin menghapus bahan baku ini?')) return;
    try {
      await catalogService.deleteIngredient(id);
      loadCatalogData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  // Filtered Lists
  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          p.sku.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [products, debouncedSearch]
  );

  const filteredIngredients = useMemo(
    () =>
      ingredients.filter(
        (i) =>
          i.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          i.sku.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [ingredients, debouncedSearch]
  );

  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter((s) =>
        s.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      ),
    [suppliers, debouncedSearch]
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Katalog & Bahan Baku"
        description="Kelola produk penjualan, bahan baku resep, satuan ukur master, dan data supplier outlet"
      >
        <Button variant="outline" size="sm" onClick={loadCatalogData} disabled={loading}>
          <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
        {activeTab === 'products' && (
          <Button onClick={() => openProductModal()} className="bg-amber-600 hover:bg-amber-700 text-white" size="sm">
            <Plus className="size-4 mr-1.5" /> Tambah Produk
          </Button>
        )}
        {activeTab === 'ingredients' && (
          <Button onClick={() => openIngredientModal()} className="bg-amber-600 hover:bg-amber-700 text-white" size="sm">
            <Plus className="size-4 mr-1.5" /> Tambah Bahan Baku
          </Button>
        )}
        {activeTab === 'units' && (
          <Button onClick={openUnitModal} className="bg-amber-600 hover:bg-amber-700 text-white" size="sm">
            <Plus className="size-4 mr-1.5" /> Tambah Satuan
          </Button>
        )}
        {activeTab === 'suppliers' && (
          <Button onClick={() => openSupplierModal()} className="bg-amber-600 hover:bg-amber-700 text-white" size="sm">
            <Plus className="size-4 mr-1.5" /> Tambah Supplier
          </Button>
        )}
      </PageHeader>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'products', label: 'Produk Jual', count: products.length, icon: Coffee },
            { id: 'ingredients', label: 'Bahan Baku', count: ingredients.length, icon: Layers },
            { id: 'units', label: 'Satuan Ukur', count: units.length, icon: Scale },
            { id: 'suppliers', label: 'Pemasok (Suppliers)', count: suppliers.length, icon: Truck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as CatalogTab);
                  setSearch('');
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  isCurrent
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="size-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isCurrent ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search input for tabs with filter capability */}
        {activeTab !== 'units' && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder={`Cari ${activeTab}...`}
              className="pl-8 h-8 text-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Main Content Area per Tab */}
      {loading ? (
        <LoadingScreen message="Memuat master data katalog..." />
      ) : (
        <>
          {/* TAB 1: PRODUCTS */}
          {activeTab === 'products' && (
            <Card className="overflow-hidden">
              {filteredProducts.length === 0 ? (
                <EmptyState
                  icon={Coffee}
                  title="Belum ada produk"
                  description="Tambahkan item minuman atau makanan yang akan dijual pada kasir POS outlet."
                  actionLabel="Tambah Produk Baru"
                  onAction={() => openProductModal()}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Nama Produk</TableHead>
                      <TableHead>Harga Jual</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono font-bold text-muted-foreground">
                          {p.sku}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="size-10 rounded-lg overflow-hidden bg-muted shrink-0 border border-border/50">
                              {p.image_url ? (
                                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <Coffee className="size-4 opacity-50" />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-semibold text-foreground truncate">{p.name}</span>
                              {p.description && (
                                <span className="text-[11px] text-muted-foreground line-clamp-1">
                                  {p.description}
                                </span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-amber-700 dark:text-amber-400">
                          {formatRupiah(p.selling_price)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={p.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {p.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openProductModal(p)}
                              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="Edit Produk"
                            >
                              <Edit2 className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="Hapus Produk"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          )}

          {/* TAB 2: INGREDIENTS */}
          {activeTab === 'ingredients' && (
            <Card className="overflow-hidden">
              {filteredIngredients.length === 0 ? (
                <EmptyState
                  icon={Layers}
                  title="Belum ada bahan baku"
                  description="Daftarkan bahan mentah seperti biji kopi, susu, sirup untuk perakitan formula resep & deduksi stok."
                  actionLabel="Tambah Bahan Baku"
                  onAction={() => openIngredientModal()}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SKU</TableHead>
                      <TableHead>Nama Bahan Baku</TableHead>
                      <TableHead>Satuan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredIngredients.map((ing) => (
                      <TableRow key={ing.id}>
                        <TableCell className="font-mono font-bold text-muted-foreground">
                          {ing.sku}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">{ing.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono uppercase">
                            {ing.unit?.code || 'UNIT'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={ing.status === 'ACTIVE' ? 'success' : 'secondary'}>
                            {ing.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => openIngredientModal(ing)}
                              className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                              title="Edit Bahan"
                            >
                              <Edit2 className="size-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteIngredient(ing.id)}
                              className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="Hapus Bahan"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          )}

          {/* TAB 3: UNITS */}
          {activeTab === 'units' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {units.map((unit) => (
                <Card key={unit.id} className="p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-extrabold text-amber-700 dark:text-amber-400">
                        {unit.code}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {unit.type}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-bold text-foreground">{unit.name}</h4>
                  </div>
                  <div className="mt-3 pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                    Standar Pengukuran Resep & Gudang
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* TAB 4: SUPPLIERS */}
          {activeTab === 'suppliers' && (
            <Card className="overflow-hidden">
              {filteredSuppliers.length === 0 ? (
                <EmptyState
                  icon={Truck}
                  title="Belum ada data supplier"
                  description="Catat vendor atau pemasok biji kopi dan bahan baku untuk purchase order (PO) gudang."
                  actionLabel="Tambah Supplier Baru"
                  onAction={() => openSupplierModal()}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Supplier</TableHead>
                      <TableHead>Kontak Person</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSuppliers.map((sup) => (
                      <TableRow key={sup.id}>
                        <TableCell className="font-semibold text-foreground">{sup.name}</TableCell>
                        <TableCell>{sup.contact_name || '-'}</TableCell>
                        <TableCell className="font-mono text-xs">{sup.phone || '-'}</TableCell>
                        <TableCell className="text-xs">{sup.email || '-'}</TableCell>
                        <TableCell className="text-right">
                          <button
                            onClick={() => openSupplierModal(sup)}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Edit Supplier"
                          >
                            <Edit2 className="size-3.5" />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          )}
        </>
      )}

      {/* Dynamic Modal Dialog depending on active tab */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent onClose={() => setModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'products' && (editingProductId ? 'Edit Produk' : 'Tambah Produk Baru')}
              {activeTab === 'ingredients' && (editingIngId ? 'Edit Bahan Baku' : 'Tambah Bahan Baku')}
              {activeTab === 'units' && 'Tambah Satuan Ukur Baru'}
              {activeTab === 'suppliers' && (editingSupId ? 'Edit Supplier' : 'Tambah Supplier Baru')}
            </DialogTitle>
            <DialogDescription>
              Lengkapi formulir di bawah ini untuk menyimpan master data ke sistem outlet
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Form Products */}
          {activeTab === 'products' && (
            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Nama Produk</label>
                <Input
                  placeholder="Mis: Iced Caffe Latte"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">SKU Produk</label>
                  <Input
                    placeholder="LAT-01"
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Harga Jual (Rp)</label>
                  <Input
                    type="number"
                    placeholder="35000"
                    value={prodPrice}
                    onChange={(e) => setProdPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Deskripsi</label>
                <Input
                  placeholder="Espresso dengan susu segar dan es batu..."
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">URL Foto Menu Produk</label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="https://images.unsplash.com/... atau tautan gambar"
                    value={prodImage}
                    onChange={(e) => setProdImage(e.target.value)}
                  />
                  {prodImage && (
                    <div className="size-9 rounded-lg overflow-hidden border border-border shrink-0 bg-muted">
                      <img src={prodImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Foto ini akan ditampilkan kepada pelanggan saat scan QR meja dan di layar kasir.
                </p>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" className="bg-amber-600 text-white" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Produk'}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Form Ingredients */}
          {activeTab === 'ingredients' && (
            <form onSubmit={handleSaveIngredient} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Nama Bahan Baku</label>
                <Input
                  placeholder="Mis: Biji Kopi Arabica Gayo"
                  value={ingName}
                  onChange={(e) => setIngName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">SKU Bahan</label>
                  <Input
                    placeholder="ING-GY-01"
                    value={ingSku}
                    onChange={(e) => setIngSku(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Satuan Ukur</label>
                  <select
                    value={ingUnitId}
                    onChange={(e) => setIngUnitId(e.target.value)}
                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs"
                    required
                  >
                    <option value="">Pilih Satuan...</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" className="bg-amber-600 text-white" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Bahan'}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Form Units */}
          {activeTab === 'units' && (
            <form onSubmit={handleSaveUnit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Nama Satuan</label>
                <Input
                  placeholder="Mis: Kilogram atau Mililiter"
                  value={unitName}
                  onChange={(e) => setUnitName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Kode Singkat</label>
                  <Input
                    placeholder="KG / ML / GR"
                    value={unitCode}
                    onChange={(e) => setUnitCode(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Tipe Dimensi</label>
                  <select
                    value={unitType}
                    onChange={(e) => setUnitType(e.target.value as UnitType)}

                    className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs"
                  >
                    <option value="WEIGHT">WEIGHT (Berat)</option>
                    <option value="VOLUME">VOLUME (Cairan)</option>
                    <option value="PIECE">PIECE (Jumlah/Pcs)</option>
                    <option value="LENGTH">LENGTH (Panjang)</option>
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" className="bg-amber-600 text-white" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Satuan'}
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Form Suppliers */}
          {activeTab === 'suppliers' && (
            <form onSubmit={handleSaveSupplier} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Nama Supplier</label>
                <Input
                  placeholder="Mis: PT Roaster Jaya Abadi"
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Kontak Person</label>
                  <Input
                    placeholder="Pak Hendra"
                    value={supContact}
                    onChange={(e) => setSupContact(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Nomor Telepon</label>
                  <Input
                    placeholder="081122334455"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Email</label>
                <Input
                  type="email"
                  placeholder="hendra@roasterjaya.com"
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Alamat</label>
                <Input
                  placeholder="Bandung, Jawa Barat"
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                  Batal
                </Button>
                <Button type="submit" className="bg-amber-600 text-white" disabled={saving}>
                  {saving ? 'Menyimpan...' : 'Simpan Supplier'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
