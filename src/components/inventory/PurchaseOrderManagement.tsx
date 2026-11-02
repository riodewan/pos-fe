'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  MoreVertical,
  Check,
  Clock,
  X,
  Truck,
  Printer,
  CheckCircle2,
} from 'lucide-react';
import {
  DataTable,
  ColumnDef,
  Button,
  Select,
  SearchInput,
  Drawer,
  Input,
  Textarea,
} from '@/components/common';
import { formatRupiah } from '@/utils';
import { inventoryService } from '@/services/inventory.service';
import { catalogService } from '@/services/catalog.service';

export interface POItemLine {
  id: string;
  ingredientId?: string;
  ingredientName: string;
  qty: number;
  unitId?: string;
  unit: string;
  unitPrice: number;
}

export interface PurchaseOrderItem {
  id: string;
  poNumber: string;
  orderDate: string;
  expectedDate: string;
  supplierName: string;
  itemCount: number;
  totalAmount: number;
  status: 'Draft' | 'Diajukan' | 'Diterima' | 'Dibatalkan';
  notes?: string;
  items: POItemLine[];
}

interface PurchaseOrderManagementProps {
  onShowToast: (msg: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

const mapPurchaseStatus = (status?: string): PurchaseOrderItem['status'] => {
  switch (String(status || '').toUpperCase()) {
    case 'RECEIVED':
    case 'DITERIMA':
      return 'Diterima';
    case 'CANCELLED':
    case 'DIBATALKAN':
      return 'Dibatalkan';
    case 'DRAFT':
    case 'DIAJUKAN':
    default:
      return 'Diajukan';
  }
};

export function PurchaseOrderManagement({
  onShowToast,
  isCreateOpen,
  onCloseCreate,
}: PurchaseOrderManagementProps) {
  const [orders, setOrders] = useState<PurchaseOrderItem[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer detail & create
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form create states
  const [formSupplierId, setFormSupplierId] = useState('');
  const [formPurchaseDate, setFormPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState('');
  const [formItems, setFormItems] = useState<Array<{ ingredient_id: string; unit_id: string; quantity: number; unit_cost: number }>>([]);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      const [poRes, supRes, ingRes] = await Promise.allSettled([
        inventoryService.getPurchases(),
        catalogService.getSuppliers(),
        catalogService.getIngredients(),
      ]);

      const poList = poRes.status === 'fulfilled' && Array.isArray(poRes.value?.data) ? poRes.value.data : [];
      const supList = supRes.status === 'fulfilled' && Array.isArray(supRes.value?.data) ? supRes.value.data : [];
      const ingList = ingRes.status === 'fulfilled' && Array.isArray(ingRes.value?.data) ? ingRes.value.data : [];

      setSuppliers(supList);
      setIngredients(ingList);

      const mappedOrders: PurchaseOrderItem[] = poList.map((po: any) => {
        const items: POItemLine[] = (po.items || []).map((it: any) => ({
          id: it.id,
          ingredientId: it.ingredient_id,
          ingredientName: it.ingredient?.name || '-',
          qty: Number(it.quantity || 0),
          unitId: it.unit_id,
          unit: it.unit?.code || it.unit?.name || it.ingredient?.unit?.code || 'unit',
          unitPrice: Number(it.unit_cost || 0),
        }));

        return {
          id: po.id,
          poNumber: po.purchase_number || po.id,
          orderDate: po.purchase_date || (po.created_at ? new Date(po.created_at).toLocaleDateString('id-ID') : '-'),
          expectedDate: po.purchase_date || '-',
          supplierName: po.supplier?.name || 'pembelian langsung',
          itemCount: items.length,
          totalAmount: Number(po.total_amount || 0),
          status: mapPurchaseStatus(po.status),
          notes: po.notes || '',
          items,
        };
      });

      setOrders(mappedOrders);
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  useEffect(() => {
    if (isCreateOpen) {
      handleCreateNew();
    }
  }, [isCreateOpen]);

  const handleCreateNew = () => {
    setFormSupplierId(suppliers[0]?.id || '');
    setFormPurchaseDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    if (ingredients.length > 0) {
      const firstIng = ingredients[0];
      setFormItems([
        {
          ingredient_id: firstIng.id,
          unit_id: firstIng.unit_id || firstIng.unit?.id || '',
          quantity: 1,
          unit_cost: Number(firstIng.cost_price || 0),
        },
      ]);
    } else {
      setFormItems([]);
    }
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    if (onCloseCreate) onCloseCreate();
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((po) => {
      if (selectedStatus !== 'all' && po.status !== selectedStatus) return false;
      if (selectedSupplier !== 'all' && po.supplierName !== selectedSupplier) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchPo = po.poNumber.toLowerCase().includes(q);
        const matchSup = po.supplierName.toLowerCase().includes(q);
        if (!matchPo && !matchSup) return false;
      }
      return true;
    });
  }, [orders, selectedStatus, selectedSupplier, searchQuery]);

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredOrders.map((item) => item.id));
    }
  };

  const handleAddLine = () => {
    if (ingredients.length === 0) return;
    const first = ingredients[0];
    setFormItems((prev) => [
      ...prev,
      {
        ingredient_id: first.id,
        unit_id: first.unit_id || first.unit?.id || '',
        quantity: 1,
        unit_cost: Number(first.cost_price || 0),
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    setFormItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSavePO = async () => {
    if (formItems.length === 0) {
      onShowToast('Tambahkan minimal 1 bahan baku pada Purchase Order!');
      return;
    }

    try {
      await inventoryService.createPurchase({
        supplier_id: formSupplierId || undefined,
        purchase_date: formPurchaseDate,
        notes: formNotes || undefined,
        items: formItems,
      } as any);

      onShowToast('Purchase Order baru berhasil diajukan.');
      await fetchAll();
      handleCloseDrawer();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal membuat Purchase Order.');
    }
  };

  const handleReceivePO = async (order: PurchaseOrderItem) => {
    try {
      await inventoryService.receivePurchase(order.id);
      onShowToast(`Barang pada ${order.poNumber} berhasil diterima ke stok!`);
      setIsDetailOpen(false);
      await fetchAll();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal menerima Purchase Order.');
    }
  };

  const handleCancelPO = async (order: PurchaseOrderItem) => {
    try {
      await inventoryService.cancelPurchase(order.id);
      onShowToast(`Purchase Order ${order.poNumber} dibatalkan.`);
      setIsDetailOpen(false);
      await fetchAll();
    } catch (err: any) {
      onShowToast(err.message || 'Gagal membatalkan Purchase Order.');
    }
  };

  const renderStatusBadge = (status: PurchaseOrderItem['status']) => {
    switch (status) {
      case 'Diterima':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E8F5E9] text-[#2E7D32]">
            <span className="size-3.5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-[8px] font-bold">
              <Check className="size-2.5 stroke-[3]" />
            </span>
            <span>Diterima</span>
          </span>
        );
      case 'Diajukan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#E3F2FD] text-[#1976D2]">
            <span className="size-3.5 rounded-full bg-[#1976D2] text-white flex items-center justify-center text-[8px] font-bold">
              <Truck className="size-2.5" />
            </span>
            <span>Diajukan</span>
          </span>
        );
      case 'Draft':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#FFF8E1] text-[#B78103]">
            <span className="size-3.5 rounded-full bg-[#F59E0B] text-white flex items-center justify-center text-[8px] font-bold">
              <Clock className="size-2.5" />
            </span>
            <span>Draft</span>
          </span>
        );
      case 'Dibatalkan':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#ECEFF1] text-[#546E7A]">
            <span className="size-3.5 rounded-full bg-[#78909C] text-white flex items-center justify-center text-[8px] font-bold">
              <X className="size-2.5" />
            </span>
            <span>Dibatalkan</span>
          </span>
        );
    }
  };

  const columns: ColumnDef<PurchaseOrderItem>[] = [
    {
      key: 'poNumber',
      header: 'No. PO',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs font-mono">{item.poNumber}</span>
      ),
    },
    {
      key: 'orderDate',
      header: 'Tanggal Order',
      render: (item) => <span className="text-neutral-600 text-xs">{item.orderDate}</span>,
    },
    {
      key: 'supplierName',
      header: 'Supplier',
      render: (item) => (
        <span className="font-medium text-neutral-800 text-xs">{item.supplierName}</span>
      ),
    },
    {
      key: 'itemCount',
      header: 'Jumlah Item',
      render: (item) => <span className="text-neutral-600 text-xs">{item.itemCount} Bahan</span>,
    },
    {
      key: 'totalAmount',
      header: 'Total Biaya',
      render: (item) => (
        <span className="font-semibold text-neutral-900 text-xs">
          {formatRupiah(item.totalAmount)}
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
        <Button
          size="xs"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedOrder(item);
            setIsDetailOpen(true);
          }}
          className="text-neutral-400 hover:text-neutral-700"
        >
          <MoreVertical className="size-4" />
        </Button>
      ),
    },
  ];

  const supplierOptions = [
    { value: 'all', label: 'Semua supplier' },
    ...suppliers.map((s) => ({ value: s.name, label: s.name })),
  ];

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={[
              { value: 'all', label: 'Semua status' },
              { value: 'Diajukan', label: 'Diajukan' },
              { value: 'Diterima', label: 'Diterima' },
              { value: 'Dibatalkan', label: 'Dibatalkan' },
            ]}
            className="w-44 h-9 text-xs"
          />

          <Select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            options={supplierOptions}
            className="w-48 h-9 text-xs"
          />
        </div>

        <div className="w-full md:w-80">
          <SearchInput
            placeholder="Cari no. PO atau supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            className="h-9 text-xs"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="space-y-4">
        <DataTable<PurchaseOrderItem>
          columns={columns}
          data={filteredOrders}
          isLoading={isLoading}
          keyExtractor={(item) => item.id}
          selectable={true}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelectRow}
          onToggleSelectAll={toggleSelectAll}
          onRowClick={(item) => {
            setSelectedOrder(item);
            setIsDetailOpen(true);
          }}
          emptyTitle="BELUM ADA PURCHASE ORDER"
          emptyDescription="Buat purchase order untuk pengadaan bahan baku ke vendor/supplier outlet."
          entityName="purchase order"
        />
      </div>

      {/* Drawer: Detail PO */}
      {selectedOrder && (
        <Drawer
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Purchase Order ${selectedOrder.poNumber}`}
          subtitle={`Diajukan pada ${selectedOrder.orderDate} ke ${selectedOrder.supplierName}`}
          size="lg"
          footer={
            <div className="flex items-center justify-between gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => onShowToast('Mencetak lembar Purchase Order...')}
                leftIcon={<Printer className="size-4" />}
              >
                Cetak PO
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
                  Tutup
                </Button>
                {selectedOrder.status === 'Diajukan' && (
                  <>
                    <Button
                      variant="danger"
                      onClick={() => handleCancelPO(selectedOrder)}
                    >
                      Batalkan PO
                    </Button>
                    <Button
                      variant="primary"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleReceivePO(selectedOrder)}
                      leftIcon={<Check className="size-4 stroke-[3]" />}
                    >
                      Terima Barang
                    </Button>
                  </>
                )}
              </div>
            </div>
          }
        >
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-neutral-50 border border-neutral-200 text-xs">
              <div>
                <p className="text-neutral-500">Supplier Vendor</p>
                <p className="font-semibold text-neutral-900 mt-0.5">{selectedOrder.supplierName}</p>
              </div>
              <div>
                <p className="text-neutral-500">Tanggal PO</p>
                <p className="font-semibold text-neutral-900 mt-0.5">{selectedOrder.orderDate}</p>
              </div>
              <div>
                <p className="text-neutral-500">Status PO</p>
                <div className="mt-1">{renderStatusBadge(selectedOrder.status)}</div>
              </div>
              <div>
                <p className="text-neutral-500">Total Biaya PO</p>
                <p className="font-bold text-neutral-900 mt-0.5 text-sm">
                  {formatRupiah(selectedOrder.totalAmount)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-neutral-900 mb-2">Daftar Bahan Dipesan</h4>
              <div className="border border-neutral-200 rounded-xl overflow-hidden divide-y divide-neutral-100 text-xs">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="p-3.5 flex items-center justify-between hover:bg-neutral-50/50">
                    <div>
                      <p className="font-semibold text-neutral-800">{it.ingredientName}</p>
                      <p className="text-[11px] text-neutral-400">
                        {it.qty} {it.unit} @ {formatRupiah(it.unitPrice)}
                      </p>
                    </div>
                    <span className="font-semibold text-neutral-900 font-mono">
                      {formatRupiah(it.qty * it.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {selectedOrder.notes && (
              <div className="text-xs">
                <span className="text-neutral-500 font-medium">Catatan Pengadaan:</span>
                <p className="text-neutral-700 mt-1 italic bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                  &ldquo;{selectedOrder.notes}&rdquo;
                </p>
              </div>
            )}
          </div>
        </Drawer>
      )}

      {/* Drawer: Buat PO Baru */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        title="Buat Purchase Order Baru"
        subtitle="Ajukan permintaan pengadaan stok bahan baku ke vendor supplier"
        size="lg"
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            <Button variant="outline" onClick={handleCloseDrawer}>
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleSavePO}
              className="bg-[#FF5C38] hover:bg-[#EE4E2A]"
              leftIcon={<CheckCircle2 className="size-4 stroke-[2.5]" />}
            >
              Ajukan Purchase Order
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <Select
            label="Pilih Vendor / Supplier (Opsional)"
            value={formSupplierId}
            onChange={(e) => setFormSupplierId(e.target.value)}
            options={[
              { value: '', label: '-- Tanpa Supplier / Pembelian Langsung --' },
              ...suppliers.map((s) => ({ value: s.id, label: s.name })),
            ]}
          />

          <Input
            label="Tanggal Order"
            type="date"
            required
            value={formPurchaseDate}
            onChange={(e) => setFormPurchaseDate(e.target.value)}
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-neutral-800">Daftar Bahan Baku Dipesan *</label>
              <Button
                type="button"
                size="xs"
                variant="outline"
                onClick={handleAddLine}
                leftIcon={<Plus className="size-3.5" />}
              >
                Tambah Baris Bahan
              </Button>
            </div>

            {ingredients.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
                Belum ada bahan baku di database. Tambahkan bahan baku terlebih dahulu pada tab Bahan.
              </div>
            ) : (
              <div className="space-y-2.5">
                {formItems.map((line, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Select
                        label={idx === 0 ? 'Bahan Baku' : undefined}
                        value={line.ingredient_id}
                        onChange={(e) => {
                          const ing = ingredients.find((i) => i.id === e.target.value);
                          setFormItems((prev) =>
                            prev.map((it, i) =>
                              i === idx
                                ? {
                                    ...it,
                                    ingredient_id: e.target.value,
                                    unit_id: ing?.unit_id || ing?.unit?.id || it.unit_id,
                                    unit_cost: Number(ing?.cost_price || it.unit_cost || 0),
                                  }
                                : it
                            )
                          );
                        }}
                        options={ingredients.map((i) => ({
                          value: i.id,
                          label: `${i.name} (${i.unit?.code || i.unit?.name || ''})`,
                        }))}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        label={idx === 0 ? 'Qty' : undefined}
                        type="number"
                        min="0.1"
                        step="0.1"
                        value={line.quantity}
                        onChange={(e) =>
                          setFormItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, quantity: Number(e.target.value) } : it))
                          )
                        }
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        label={idx === 0 ? 'Harga Satuan' : undefined}
                        type="number"
                        min="0"
                        value={line.unit_cost}
                        onChange={(e) =>
                          setFormItems((prev) =>
                            prev.map((it, i) => (i === idx ? { ...it, unit_cost: Number(e.target.value) } : it))
                          )
                        }
                      />
                    </div>
                    <div className="col-span-1 flex justify-end pb-1">
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(idx)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Textarea
            label="Catatan Tambahan untuk Vendor"
            rows={3}
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            placeholder="Instruksi pengiriman atau kemasan khusus..."
          />
        </div>
      </Drawer>
    </div>
  );
}
