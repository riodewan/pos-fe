'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  Coffee,
  Loader2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { catalogService } from '@/services';
import { Recipe, Product, Ingredient, Unit } from '@/types';
import { ApiError } from '@/lib/api';
import { PageHeader, EmptyState, LoadingScreen } from '@/components/common';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

interface RecipeFormItem {
  ingredient_id: string;
  unit_id: string;
  quantity: string;
}

export default function RecipesPage() {
  const router = useRouter();
  const { user, activeTenant, isLoading } = useAuth();
  const { activeStore } = useStore();

  const roleName = user?.is_internal ? 'SUPER_ADMIN' : activeTenant?.role?.toUpperCase();

  useEffect(() => {
    if (isLoading) return;
    if (roleName === 'CASHIER') {
      router.replace('/dashboard/pos');
    }
  }, [roleName, isLoading, router]);

  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [recipeName, setRecipeName] = useState('');
  const [recipeStatus, setRecipeStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [recipeItems, setRecipeItems] = useState<RecipeFormItem[]>([
    { ingredient_id: '', unit_id: '', quantity: '1' },
  ]);

  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!activeStore) return;
    setLoading(true);
    try {
      const [recRes, prodRes, ingRes, unitRes] = await Promise.all([
        catalogService.getRecipes(),
        catalogService.getProducts(),
        catalogService.getIngredients(),
        catalogService.getUnits(),
      ]);
      setRecipes(recRes.data || []);
      setProducts(prodRes.data || []);
      setIngredients(ingRes.data || []);
      setUnits(unitRes.data || []);
    } catch (err) {
      console.error('Failed to load recipes data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeStore]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Modal Openers
  const openAddModal = () => {
    setEditingRecipeId(null);
    setSelectedProductId(products[0]?.id || '');
    setRecipeName(products[0] ? `Resep Standar ${products[0].name}` : 'Resep Standar');
    setRecipeStatus('ACTIVE');
    setRecipeItems([
      {
        ingredient_id: ingredients[0]?.id || '',
        unit_id: ingredients[0]?.unit_id || units[0]?.id || '',
        quantity: '18',
      },
    ]);
    setFormError(null);
    setModalOpen(true);
  };

  const openEditModal = (rec: Recipe) => {
    setEditingRecipeId(rec.id);
    setSelectedProductId(rec.product_id);
    setRecipeName(rec.name);
    setRecipeStatus(rec.status);
    if (rec.items && rec.items.length > 0) {
      setRecipeItems(
        rec.items.map((i) => ({
          ingredient_id: i.ingredient_id,
          unit_id: i.unit_id,
          quantity: String(i.quantity),
        }))
      );
    } else {
      setRecipeItems([{ ingredient_id: '', unit_id: '', quantity: '1' }]);
    }
    setFormError(null);
    setModalOpen(true);
  };

  // Recipe Item Row handlers
  const handleAddItemRow = () => {
    setRecipeItems((prev) => [
      ...prev,
      {
        ingredient_id: ingredients[0]?.id || '',
        unit_id: ingredients[0]?.unit_id || units[0]?.id || '',
        quantity: '1',
      },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    setRecipeItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateItemRow = (index: number, field: keyof RecipeFormItem, value: string) => {
    setRecipeItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      // If ingredient changed, auto-select its default unit
      if (field === 'ingredient_id') {
        const selectedIng = ingredients.find((i) => i.id === value);
        if (selectedIng && selectedIng.unit_id) {
          updated[index].unit_id = selectedIng.unit_id;
        }
      }

      return updated;
    });
  };

  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) {
      setFormError('Pilih produk yang terkait dengan resep ini.');
      return;
    }
    if (recipeItems.length === 0) {
      setFormError('Tambahkan minimal satu bahan baku pada resep.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      const payload = {
        product_id: selectedProductId,
        name: recipeName,
        status: recipeStatus,
        items: recipeItems.map((item) => ({
          ingredient_id: item.ingredient_id,
          unit_id: item.unit_id,
          quantity: parseFloat(item.quantity) || 1,
        })),
      };

      await catalogService.createRecipe(payload);
      setModalOpen(false);
      loadData();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setFormError(err.message || 'Gagal menyimpan formula resep.');
      } else {
        setFormError((err as Error).message);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Formula Resep & HPP"
        description="Tetapkan takaran bahan baku per porsi produk. Sistem otomatis memotong stok gudang saat transaksi POS diselesaikan."
      >
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
        <Button onClick={openAddModal} className="bg-amber-600 hover:bg-amber-700 text-white" size="sm">
          <Plus className="size-4 mr-1.5" /> Buat Resep Baru
        </Button>
      </PageHeader>

      {/* Info Card Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200">
        <HelpCircle className="size-5 shrink-0 text-amber-600 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold">Otomasi Pemotongan Stok Atomik (Recipe Depletion)</p>
          <p className="text-muted-foreground">
            Setiap kali pesanan kasir dibayar, sistem backend secara otomatis mencari formula resep aktif untuk produk yang dipesan dan memotong gramatur bahan baku di database secara atomik.
          </p>
        </div>
      </div>

      {/* Recipe List */}
      {loading ? (
        <LoadingScreen message="Memuat daftar formula resep..." />
      ) : recipes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Belum ada formula resep"
          description="Rancang formula resep pertama Anda untuk menghubungkan produk minuman/makanan dengan bahan baku di gudang."
          actionLabel="Buat Resep Baru"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recipes.map((rec) => {
            const product = products.find((p) => p.id === rec.product_id);
            return (
              <Card key={rec.id} className="overflow-hidden flex flex-col justify-between">
                <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <Badge variant={rec.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {rec.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {rec.items?.length || 0} Bahan
                    </span>
                  </div>
                  <CardTitle className="text-base mt-2 flex items-center gap-2">
                    <Coffee className="size-4 text-amber-600" />
                    <span>{product ? product.name : rec.name}</span>
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">{rec.name}</p>
                </CardHeader>

                <CardContent className="p-4 flex-1 space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Takaran Bahan Baku:
                  </span>
                  {rec.items && rec.items.length > 0 ? (
                    <div className="space-y-1.5 pt-1">
                      {rec.items.map((item, idx) => {
                        const ing = ingredients.find((i) => i.id === item.ingredient_id);
                        const unit = units.find((u) => u.id === item.unit_id);
                        return (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 rounded-lg bg-muted/40 text-xs border border-border/40"
                          >
                            <span className="font-medium text-foreground">
                              {ing ? ing.name : 'Bahan Baku'}
                            </span>
                            <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                              {item.quantity} {unit?.code || 'UNIT'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">Belum ada rincian bahan.</p>
                  )}
                </CardContent>

                <div className="p-3 border-t border-border/50 bg-muted/10 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => openEditModal(rec)}
                    className="text-xs"
                  >
                    <Edit2 className="size-3 mr-1" /> Edit Formula
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Recipe Create / Edit Modal Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-xl" onClose={() => setModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editingRecipeId ? 'Edit Formula Resep' : 'Buat Formula Resep Baru'}</DialogTitle>
            <DialogDescription>
              Tentukan komposisi dan gramatur bahan baku per 1 porsi saji
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSaveRecipe} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Pilih Produk Jual
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((prod) => prod.id === e.target.value);
                    if (p) setRecipeName(`Resep Standar ${p.name}`);
                  }}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs"
                  required
                >
                  <option value="">Pilih Produk...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">
                  Nama Formula
                </label>
                <Input
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  placeholder="Mis: Resep Standar Iced Latte"
                  required
                />
              </div>
            </div>

            {/* Recipe Items Section */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  Daftar Bahan Baku & Takaran
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={handleAddItemRow}
                  className="text-xs gap-1"
                >
                  <Plus className="size-3" /> Tambah Bahan
                </Button>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {recipeItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 border border-border/60">
                    {/* Ingredient Select */}
                    <div className="flex-1 min-w-0">
                      <select
                        value={item.ingredient_id}
                        onChange={(e) => handleUpdateItemRow(idx, 'ingredient_id', e.target.value)}
                        className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs"
                        required
                      >
                        <option value="">Pilih Bahan...</option>
                        {ingredients.map((ing) => (
                          <option key={ing.id} value={ing.id}>
                            {ing.name} ({ing.sku})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="w-24">
                      <Input
                        type="number"
                        step="any"
                        placeholder="Jumlah"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItemRow(idx, 'quantity', e.target.value)}
                        className="h-8 text-xs font-bold"
                        required
                      />
                    </div>

                    {/* Unit Select */}
                    <div className="w-24">
                      <select
                        value={item.unit_id}
                        onChange={(e) => handleUpdateItemRow(idx, 'unit_id', e.target.value)}
                        className="w-full h-8 rounded-lg border border-input bg-background px-2 text-xs font-mono font-semibold"
                        required
                      >
                        <option value="">Satuan...</option>
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.code}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Remove Row */}
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      disabled={recipeItems.length <= 1}
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive disabled:opacity-30"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Formula Resep'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
