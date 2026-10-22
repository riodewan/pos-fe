'use client';

import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  ChevronDown,
  Edit2,
  Trash2,
  MoreVertical,
  Check,
  Clock,
  X,
  Truck,
  Printer,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  DataTable,
  ColumnDef,
  StatusBadge,
  Button,
  Select,
  SearchInput,
  Drawer,
  Modal,
  Input,
  Textarea,
  FormField,
  Pagination,
} from '@/components/common';
import { formatRupiah, formatDate } from '@/utils';

export interface POItemLine {
  id: string;
  ingredientName: string;
  qty: number;
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

const INITIAL_POS: PurchaseOrderItem[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-10-001',
    orderDate: '14 Okt 2026',
    expectedDate: '17 Okt 2026',
    supplierName: 'PT Kopi Nusantara',
    itemCount: 2,
    totalAmount: 2100000,
    status: 'Diterima',
    notes: 'Restok mingguan biji kopi arabica dan robusta bar utama.',
    items: [
      { id: '1', ingredientName: 'Biji Kopi Arabica', qty: 15, unit: 'kg', unitPrice: 120000 },
      { id: '2', ingredientName: 'Biji Kopi Robusta', qty: 5, unit: 'kg', unitPrice: 60000 },
    ],
  },
  {
    id: 'po-2',
    poNumber: 'PO-2026-10-002',
    orderDate: '13 Okt 2026',
    expectedDate: '16 Okt 2026',
    supplierName: 'PT Sumber Susu Murni',
    itemCount: 3,
    totalAmount: 1450000,
    status: 'Diajukan',
    notes: 'Kebutuhan weekend chiller bar.',
    items: [
      { id: '3', ingredientName: 'Susu UHT Full Cream', qty: 40, unit: 'liter', unitPrice: 18000 },
      { id: '4', ingredientName: 'Susu Oat Barista', qty: 20, unit: 'liter', unitPrice: 28000 },
      { id: '5', ingredientName: 'Whipping Cream', qty: 5, unit: 'liter', unitPrice: 34000 },
    ],
  },
  {
    id: 'po-3',
    poNumber: 'PO-2026-10-003',
    orderDate: '11 Okt 2026',
    expectedDate: '15 Okt 2026',
    supplierName: 'Mitra Sirup Barista',
    itemCount: 4,
    totalAmount: 780000,
    status: 'Draft',
    notes: 'Draf pesanan sirup dan perasa.',
    items: [
      { id: '6', ingredientName: 'Sirup Gula Aren', qty: 10, unit: 'liter', unitPrice: 45000 },
      { id: '7', ingredientName: 'Sirup Vanilla', qty: 5, unit: 'liter', unitPrice: 60000 },
      { id: '8', ingredientName: 'Sirup Hazelnut', qty: 1, unit: 'liter', unitPrice: 65000 },
    ],
  },
];

interface PurchaseOrderManagementProps {
  onShowToast: (msg: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export function PurchaseOrderManagement({
  onShowToast,
  isCreateOpen,
  onCloseCreate,
}: PurchaseOrderManagementProps) {
  const [orders, setOrders] = useState<PurchaseOrderItem[]>(INITIAL_POS);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawer detail & create
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrderItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Form create states
  const [formSupplier, setFormSupplier] = useState('PT Kopi Nusantara');
  const [formExpectedDate, setFormExpectedDate] = useState('18 Okt 2026');
  const [formNotes, setFormNotes] = useState('');

  React.useEffect(() => {
    if (isCreateOpen) {
      handleCreateNew();
    }
  }, [isCreateOpen]);

  const handleCreateNew = () => {
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

  const handleSavePO = () => {
    const newPo: PurchaseOrderItem = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-10-00${orders.length + 1}`,
      orderDate: '15 Okt 2026',
      expectedDate: formExpectedDate,
      supplierName: formSupplier,
      itemCount: 2,
      totalAmount: 1250000,
      status: 'Diajukan',
      notes: formNotes,
      items: [
        { id: '10', ingredientName: 'Bahan Tambahan 1', qty: 10, unit: 'kg', unitPrice: 75000 },
        { id: '11', ingredientName: 'Bahan Tambahan 2', qty: 10, unit: 'liter', unitPrice: 50000 },
      ],
    };

    setOrders((prev) => [newPo, ...prev]);
    onShowToast(`Purchase Order ${newPo.poNumber} berhasil diajukan.`);
    handleCloseDrawer();
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
              { value: 'Draft', label: 'Draft' },
              { value: 'Dibatalkan', label: 'Dibatalkan' },
            ]}
            className="w-44 h-9 text-xs"
          />

          <Select
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            options={[
              { value: 'all', label: 'Semua supplier' },
              { value: 'PT Kopi Nusantara', label: 'PT Kopi Nusantara' },
              { value: 'PT Sumber Susu Murni', label: 'PT Sumber Susu Murni' },
              { value: 'Mitra Sirup Barista', label: 'Mitra Sirup Barista' },
            ]}
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

        <Pagination
          totalItems={filteredOrders.length}
          totalPages={1}
          currentPage={1}
          itemsPerPage={10}
          onPageChange={() => {}}
          itemName="order"
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
                  <Button
                    variant="primary"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      setOrders((prev) =>
                        prev.map((o) =>
                          o.id === selectedOrder.id ? { ...o, status: 'Diterima' } : o
                        )
                      );
                      onShowToast(`Barang pada ${selectedOrder.poNumber} berhasil diterima ke stok!`);
                      setIsDetailOpen(false);
                    }}
                    leftIcon={<Check className="size-4 stroke-[3]" />}
                  >
                    Terima Barang
                  </Button>
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
                <p className="text-neutral-500">Estimasi Tiba</p>
                <p className="font-semibold text-neutral-900 mt-0.5">{selectedOrder.expectedDate}</p>
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
            label="Pilih Vendor / Supplier"
            required
            value={formSupplier}
            onChange={(e) => setFormSupplier(e.target.value)}
            options={[
              { value: 'PT Kopi Nusantara', label: 'PT Kopi Nusantara' },
              { value: 'PT Sumber Susu Murni', label: 'PT Sumber Susu Murni' },
              { value: 'Mitra Sirup Barista', label: 'Mitra Sirup Barista' },
            ]}
          />

          <Input
            label="Estimasi Tanggal Pengiriman"
            value={formExpectedDate}
            onChange={(e) => setFormExpectedDate(e.target.value)}
            placeholder="18 Okt 2026"
          />

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
