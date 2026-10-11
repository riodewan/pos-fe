'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  ShoppingCart,
  AlertTriangle,
  FileText,
  CheckCircle2,
  XCircle,
  Truck,
  Layers,
  DollarSign,
  ArrowDownRight,
  ArrowUpRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { inventoryService, catalogService } from '@/services';
import {
  StockBalance,
  Purchase,
  Wastage,
  StockMovement,
  Supplier,
  Ingredient,
  Unit,
} from '@/types';
import { ApiError } from '@/lib/api';
import { formatRupiah, formatDate, formatDateTime } from '@/utils';
import { useDebounce } from '@/hooks';
import { PageHeader, EmptyState, LoadingScreen, StatCard } from '@/components/common';
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

type InventoryTab = 'stocks' | 'purchases' | 'wastages' | 'movements';

export default function InventoryPage() {
  const { activeStore } = useStore();

  const [activeTab, setActiveTab] = useState<InventoryTab>('stocks');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // Datasets
  const [stocks, setStocks] = useState<StockBalance[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [wastages, setWastages] = useState<Wastage[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);

  // Dialog States
  const [modalType, setModalType] = useState<'purchase' | 'opname' | 'wastage' | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // PO Form State
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poDate, setPoDate] = useState(new Date().toISOString().split('T')[0]);
  const [poNotes, setPoNotes] = useState('');
  const [poItems, setPoItems] = useState([
    { ingredient_id: '', unit_id: '', quantity: '10', unit_cost: '50000' },
  ]);

  // Opname Adjustment Form State
  const [opnameIngredientId, setOpnameIngredientId] = useState('');
  const [opnameQuantity, setOpnameQuantity] = useState('');
  const [opnameNotes, setOpnameNotes] = useState('Stock opname fisik gudang');

  // Wastage Form State
  const [wasteDate, setWasteDate] = useState(new Date().toISOString().split('T')[0]);
  const [wasteReason, setWasteReason] = useState('Bahan kadaluarsa / rusak');
  const [wasteItems, setWasteItems] = useState([
    { ingredient_id: '', unit_id: '', quantity: '1' },
  ]);

  const loadData = useCallback(async () => {
    if (!activeStore) return;
    setLoading(true);
    try {
      const [stockRes, poRes, wasteRes, movRes, supRes, ingRes, unitRes] = await Promise.all([
        inventoryService.getStocks(),
        inventoryService.getPurchases(),
        inventoryService.getWastages(),
        inventoryService.getMovements(),
        catalogService.getSuppliers(),
        catalogService.getIngredients(),
        catalogService.getUnits(),
      ]);

      setStocks(stockRes.data || []);
      setPurchases(poRes.data || []);
      setWastages(wasteRes.data || []);
      setMovements(movRes.data || []);
      setSuppliers(supRes.data || []);
      setIngredients(ingRes.data || []);
      setUnits(unitRes.data || []);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeStore]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Openers
  const openPurchaseModal = () => {
    setFormError(null);
    setPoSupplierId(suppliers[0]?.id || '');
    setPoDate(new Date().toISOString().split('T')[0]);
    setPoNotes('');
    setPoItems([
      {
        ingredient_id: ingredients[0]?.id || '',
        unit_id: ingredients[0]?.unit_id || units[0]?.id || '',
        quantity: '5000',
        unit_cost: '200',
      },
    ]);
    setModalType('purchase');
  };

  const openOpnameModal = (stock?: StockBalance) => {
    setFormError(null);
    const targetIngId = stock?.ingredient_id || ingredients[0]?.id || '';
    setOpnameIngredientId(targetIngId);
    setOpnameQuantity(stock ? String(stock.quantity) : '0');
    setOpnameNotes('Hasil stock opname fisik gudang');
    setModalType('opname');
  };

  const openWastageModal = () => {
    setFormError(null);
    setWasteDate(new Date().toISOString().split('T')[0]);
    setWasteReason('Susu basi terkena mati listrik');
    setWasteItems([
      {
        ingredient_id: ingredients[0]?.id || '',
        unit_id: ingredients[0]?.unit_id || units[0]?.id || '',
        quantity: '1000',
      },
    ]);
    setModalType('wastage');
  };

  // Submissions
  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await inventoryService.createPurchase({
        supplier_id: poSupplierId,
        purchase_date: poDate,
        notes: poNotes || null,
        items: poItems.map((i) => ({
          ingredient_id: i.ingredient_id,
          unit_id: i.unit_id,
          quantity: parseFloat(i.quantity) || 1,
          unit_cost: parseFloat(i.unit_cost) || 0,
        })),
      });
      setModalType(null);
      loadData();
    } catch (err: unknown) {
      if (err instanceof ApiError) setFormError(err.message);
      else setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleReceivePurchase = async (id: string) => {
    if (!confirm('Terima PO ini ke gudang? Stok bahan akan bertambah dan HPP moving average akan dikalkulasi otomatis.')) {
      return;
    }
    try {
      await inventoryService.receivePurchase(id);
      loadData();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleSaveOpname = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await inventoryService.adjustStock({
        ingredient_id: opnameIngredientId,
        quantity: parseFloat(opnameQuantity) || 0,
        notes: opnameNotes,
      });
      setModalType(null);
      loadData();
    } catch (err: unknown) {
      if (err instanceof ApiError) setFormError(err.message);
      else setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveWastage = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      await inventoryService.createWastage({
        wastage_date: wasteDate,
        reason: wasteReason,
        items: wasteItems.map((i) => ({
          ingredient_id: i.ingredient_id,
          unit_id: i.unit_id,
          quantity: parseFloat(i.quantity) || 1,
        })),
      });
      setModalType(null);
      loadData();
    } catch (err: unknown) {
      if (err instanceof ApiError) setFormError(err.message);
      else setFormError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // KPI Calculations
  const totalStockItems = stocks.length;
  const totalAssetValue = stocks.reduce(
    (sum, s) => sum + Number(s.quantity) * Number(s.average_cost),
    0
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Inventaris Stok & Bahan Baku"
        description="Kelola saldo stok gudang, pengadaan PO bahan masuk, audit stock opname, dan buku besar mutasi"
      >
        <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
          <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
        <Button onClick={openPurchaseModal} className="bg-amber-600 hover:bg-amber-700 text-white" size="sm">
          <Plus className="size-4 mr-1.5" /> Pembelian (PO Baru)
        </Button>
      </PageHeader>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Bahan Baku Terdaftar"
          value={totalStockItems}
          subtitle="Item bahan dalam gudang toko"
          icon={Package}
          iconClassName="bg-amber-500/10 text-amber-600"
        />
        <StatCard
          title="Estimasi Nilai Aset Stok"
          value={formatRupiah(totalAssetValue)}
          subtitle="Dihitung berbasis Moving Average Cost"
          icon={DollarSign}
          iconClassName="bg-emerald-500/10 text-emerald-600"
        />
        <StatCard
          title="Pembelian Masuk (PO)"
          value={purchases.length}
          subtitle={`${purchases.filter((p) => p.status === 'RECEIVED').length} PO telah diterima di gudang`}
          icon={Truck}
          iconClassName="bg-blue-500/10 text-blue-600"
        />
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'stocks', label: 'Saldo Stok Bahan', count: stocks.length, icon: Package },
            { id: 'purchases', label: 'Pembelian (PO)', count: purchases.length, icon: ShoppingCart },
            { id: 'wastages', label: 'Bahan Rusak / Basi', count: wastages.length, icon: AlertTriangle },
            { id: 'movements', label: 'Buku Besar Mutasi', count: movements.length, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isCurrent = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as InventoryTab);
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

        {/* Action Buttons for active tabs */}
        <div className="flex items-center gap-2">
          {activeTab === 'stocks' && (
            <Button variant="outline" size="sm" onClick={() => openOpnameModal()}>
              Stock Opname Fisik
            </Button>
          )}
          {activeTab === 'wastages' && (
            <Button variant="outline" size="sm" onClick={openWastageModal}>
              Catat Bahan Rusak
            </Button>
          )}
        </div>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <LoadingScreen message="Memuat data persediaan gudang..." />
      ) : (
        <>
          {/* TAB 1: STOCK BALANCES */}
          {activeTab === 'stocks' && (
            <Card className="overflow-hidden">
              {stocks.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="Belum ada saldo stok bahan"
                  description="Saldo stok bahan akan muncul setelah penerimaan barang masuk (PO) atau input opname awal."
                  actionLabel="Buat Pembelian Bahan (PO)"
                  onAction={openPurchaseModal}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama Bahan Baku</TableHead>
                      <TableHead>Saldo Stok</TableHead>
                      <TableHead>Moving Average Cost</TableHead>
                      <TableHead>Estimasi Nilai Total</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stocks.map((s) => {
                      const ing = ingredients.find((i) => i.id === s.ingredient_id);
                      const unit = units.find((u) => u.id === ing?.unit_id);
                      const subTotalVal = Number(s.quantity) * Number(s.average_cost);

                      return (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">
                                {ing?.name || 'Bahan Baku'}
                              </span>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {ing?.sku}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="font-mono font-bold text-amber-700 dark:text-amber-400 text-sm">
                              {Number(s.quantity).toLocaleString('id-ID')}
                            </span>{' '}
                            <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                              {unit?.code || 'UNIT'}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono text-xs font-semibold">
                            {formatRupiah(s.average_cost)} / {unit?.code || 'UNIT'}
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            {formatRupiah(subTotalVal)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => openOpnameModal(s)}
                              className="text-xs"
                            >
                              Opname
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>
          )}

          {/* TAB 2: PURCHASES (PO) */}
          {activeTab === 'purchases' && (
            <Card className="overflow-hidden">
              {purchases.length === 0 ? (
                <EmptyState
                  icon={ShoppingCart}
                  title="Belum ada transaksi pembelian"
                  description="Catat pembelian biji kopi atau bahan makanan dari supplier untuk menambah stok gudang."
                  actionLabel="Buat PO Pertama"
                  onAction={openPurchaseModal}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal PO</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Total Pembelian</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchases.map((po) => {
                      const sup = suppliers.find((s) => s.id === po.supplier_id);
                      return (
                        <TableRow key={po.id}>
                          <TableCell className="font-mono text-xs">
                            {formatDate(po.purchase_date)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-semibold text-foreground">
                                {sup?.name || 'Pemasok'}
                              </span>
                              {po.notes && (
                                <span className="text-[11px] text-muted-foreground line-clamp-1">
                                  {po.notes}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            {formatRupiah(po.total_amount)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                po.status === 'RECEIVED'
                                  ? 'success'
                                  : po.status === 'CANCELLED'
                                  ? 'destructive'
                                  : 'warning'
                              }
                            >
                              {po.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {po.status !== 'RECEIVED' && po.status !== 'CANCELLED' && (
                              <Button
                                size="xs"
                                onClick={() => handleReceivePurchase(po.id)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs"
                              >
                                Terima Barang
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>
          )}

          {/* TAB 3: WASTAGES */}
          {activeTab === 'wastages' && (
            <Card className="overflow-hidden">
              {wastages.length === 0 ? (
                <EmptyState
                  icon={AlertTriangle}
                  title="Belum ada catatan bahan rusak"
                  description="Pencatatan bahan rusak atau terbuang (wastage) membantu menjaga akurasi HPP riil."
                  actionLabel="Catat Wastage"
                  onAction={openWastageModal}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Alasan Kerusakan</TableHead>
                      <TableHead>Rincian Item</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wastages.map((w) => (
                      <TableRow key={w.id}>
                        <TableCell className="font-mono text-xs">
                          {formatDate(w.wastage_date)}
                        </TableCell>
                        <TableCell className="font-semibold text-foreground">
                          {w.reason}
                        </TableCell>
                        <TableCell>
                          {w.items?.map((item, idx) => {
                            const ing = ingredients.find((i) => i.id === item.ingredient_id);
                            const unit = units.find((u) => u.id === item.unit_id);
                            return (
                              <span
                                key={idx}
                                className="inline-block mr-2 px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono"
                              >
                                {ing?.name}: {item.quantity} {unit?.code || 'UNIT'}
                              </span>
                            );
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          )}

          {/* TAB 4: MOVEMENTS LEDGER */}
          {activeTab === 'movements' && (
            <Card className="overflow-hidden">
              {movements.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="Belum ada riwayat mutasi buku besar"
                  description="Buku besar mencatat seluruh alur mutasi persediaan secara kronologis imutabel."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Waktu</TableHead>
                      <TableHead>Tipe Mutasi</TableHead>
                      <TableHead>Bahan Baku</TableHead>
                      <TableHead>Kuantitas</TableHead>
                      <TableHead>Harga Satuan</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((mov) => {
                      const ing = ingredients.find((i) => i.id === mov.ingredient_id);
                      const isPositive = Number(mov.quantity) > 0;
                      return (
                        <TableRow key={mov.id}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {formatDateTime(mov.created_at)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                mov.type === 'PURCHASE'
                                  ? 'success'
                                  : mov.type === 'SALE'
                                  ? 'info'
                                  : mov.type === 'WASTAGE'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {mov.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            {ing?.name || 'Bahan Baku'}
                          </TableCell>
                          <TableCell
                            className={`font-mono font-bold ${
                              isPositive ? 'text-emerald-600' : 'text-amber-700 dark:text-amber-400'
                            }`}
                          >
                            {isPositive ? `+${mov.quantity}` : mov.quantity}
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            {formatRupiah(mov.unit_cost)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </Card>
          )}
        </>
      )}

      {/* Purchase Order Modal Dialog */}
      <Dialog open={modalType === 'purchase'} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent className="max-w-xl" onClose={() => setModalType(null)}>
          <DialogHeader>
            <DialogTitle>Buat Pembelian Bahan Baru (PO)</DialogTitle>
            <DialogDescription>
              Catat pengadaan bahan baku dari supplier untuk meningkatkan stok outlet
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSavePurchase} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Supplier</label>
                <select
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs"
                  required
                >
                  <option value="">Pilih Supplier...</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Tanggal PO</label>
                <Input
                  type="date"
                  value={poDate}
                  onChange={(e) => setPoDate(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Catatan PO</label>
              <Input
                placeholder="Mis: Pengadaan biji kopi mingguan..."
                value={poNotes}
                onChange={(e) => setPoNotes(e.target.value)}
                className="h-9 text-xs"
              />
            </div>

            {/* PO Items */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Item Pembelian</span>
              {poItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 border border-border/60">
                  <div className="flex-1 min-w-0">
                    <select
                      value={item.ingredient_id}
                      onChange={(e) => {
                        const updated = [...poItems];
                        updated[idx].ingredient_id = e.target.value;
                        const matched = ingredients.find((i) => i.id === e.target.value);
                        if (matched?.unit_id) updated[idx].unit_id = matched.unit_id;
                        setPoItems(updated);
                      }}
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

                  <div className="w-24">
                    <Input
                      type="number"
                      step="any"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const updated = [...poItems];
                        updated[idx].quantity = e.target.value;
                        setPoItems(updated);
                      }}
                      className="h-8 text-xs font-bold"
                      required
                    />
                  </div>

                  <div className="w-28">
                    <Input
                      type="number"
                      placeholder="Biaya/unit"
                      value={item.unit_cost}
                      onChange={(e) => {
                        const updated = [...poItems];
                        updated[idx].unit_cost = e.target.value;
                        setPoItems(updated);
                      }}
                      className="h-8 text-xs font-bold"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalType(null)}>
                Batal
              </Button>
              <Button type="submit" className="bg-amber-600 text-white" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan PO'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock Opname Modal Dialog */}
      <Dialog open={modalType === 'opname'} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent onClose={() => setModalType(null)}>
          <DialogHeader>
            <DialogTitle>Penyesuaian Fisik (Stock Opname)</DialogTitle>
            <DialogDescription>
              Sesuaikan saldo fisik stok bahan baku di gudang sesuai hasil audit
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveOpname} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Bahan Baku</label>
              <select
                value={opnameIngredientId}
                onChange={(e) => setOpnameIngredientId(e.target.value)}
                className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs"
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

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Saldo Stok Fisik Sebenarnya
              </label>
              <Input
                type="number"
                step="any"
                value={opnameQuantity}
                onChange={(e) => setOpnameQuantity(e.target.value)}
                placeholder="4850"
                className="h-9 text-xs font-bold"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">
                Catatan / Alasan Penyesuaian
              </label>
              <Input
                value={opnameNotes}
                onChange={(e) => setOpnameNotes(e.target.value)}
                placeholder="Hasil hitung fisik mingguan"
                className="h-9 text-xs"
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalType(null)}>
                Batal
              </Button>
              <Button type="submit" className="bg-amber-600 text-white" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Penyesuaian'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Wastage Modal Dialog */}
      <Dialog open={modalType === 'wastage'} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent onClose={() => setModalType(null)}>
          <DialogHeader>
            <DialogTitle>Catat Bahan Rusak / Terbuang (Wastage)</DialogTitle>
            <DialogDescription>
              Catat bahan yang basi, tumpah, atau rusak untuk audit pengeluaran non-penjualan
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveWastage} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Tanggal Kejadian</label>
              <Input
                type="date"
                value={wasteDate}
                onChange={(e) => setWasteDate(e.target.value)}
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Alasan Kerusakan</label>
              <Input
                value={wasteReason}
                onChange={(e) => setWasteReason(e.target.value)}
                placeholder="Mis: Susu basi akibat kulkas mati..."
                className="h-9 text-xs"
                required
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-border/60">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Bahan & Kuantitas</span>
              {wasteItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-xl bg-muted/40 border border-border/60">
                  <div className="flex-1 min-w-0">
                    <select
                      value={item.ingredient_id}
                      onChange={(e) => {
                        const updated = [...wasteItems];
                        updated[idx].ingredient_id = e.target.value;
                        const matched = ingredients.find((i) => i.id === e.target.value);
                        if (matched?.unit_id) updated[idx].unit_id = matched.unit_id;
                        setWasteItems(updated);
                      }}
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

                  <div className="w-24">
                    <Input
                      type="number"
                      step="any"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const updated = [...wasteItems];
                        updated[idx].quantity = e.target.value;
                        setWasteItems(updated);
                      }}
                      className="h-8 text-xs font-bold"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalType(null)}>
                Batal
              </Button>
              <Button type="submit" className="bg-amber-600 text-white" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Wastage'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
