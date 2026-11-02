'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  ChevronDown,
  Clock,
  Coffee,
  Tag,
  MapPin,
  Check,
  Users,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  TableItem,
  TableDetailDrawer,
  AddTableModal,
  TableAreaManagement,
  TableCategoryManagement,
} from '@/components/tables';
import { EmptyState, Button, Select, SearchInput, PageLoader } from '@/components/common';
import { posService } from '@/services/pos.service';
import { useToast } from '@/context/ToastContext';
import { DiningTable } from '@/types';

type TablesTab = 'tables' | 'category' | 'area';

export default function TablesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TablesTab>('tables');
  const [tables, setTables] = useState<TableItem[]>([]);
  const [rawTables, setRawTables] = useState<DiningTable[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [areaFilter, setAreaFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Drawer / Modals
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddAreaOpen, setIsAddAreaOpen] = useState(false);

  const showToast = (msg: string) => {
    toast.success(msg);
  };

  // Load real tables from backend
  const loadTables = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await posService.getTables();
      const list: DiningTable[] = Array.isArray(res?.data) ? res.data : [];
      setRawTables(list);

      const mapped: TableItem[] = list.map((t: any, idx: number) => {
        const numMatch = t.code?.match(/\d+/) || t.name?.match(/\d+/);
        const tableNumber = t.table_number || (numMatch ? parseInt(numMatch[0], 10) : idx + 1);

        let area: TableItem['area'] = t.area || 'Indoor';
        if (!t.area) {
          if (t.code?.toUpperCase().includes('OUT') || t.name?.toUpperCase().includes('OUTDOOR')) {
            area = 'Outdoor';
          } else if (t.code?.toUpperCase().includes('VIP') || t.name?.toUpperCase().includes('VIP')) {
            area = 'VIP';
          }
        }

        let status: TableItem['status'] = t.operational_status || 'Kosong';
        if (t.status === 'INACTIVE') {
          status = 'Diblokir';
        } else if (t.is_occupied) {
          status = 'Terisi';
        }

        return {
          id: t.id,
          tableNumber,
          area,
          capacity: t.capacity || 2,
          status,
          elapsedTime: t.is_occupied ? 'Aktif' : undefined,
        };
      });

      setTables(mapped);
    } catch (err) {
      console.error('Failed to load tables:', err);
      showToast('Gagal memuat daftar meja. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  // Filtered tables
  const filteredTables = useMemo(() => {
    return tables.filter((t) => {
      if (areaFilter !== 'all' && t.area !== areaFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = t.tableNumber.toString().includes(q);
        const matchArea = t.area.toLowerCase().includes(q);
        const matchStatus = t.status.toLowerCase().includes(q);
        const matchCustomer = t.customer?.name.toLowerCase().includes(q);
        if (!matchNumber && !matchArea && !matchStatus && !matchCustomer) return false;
      }
      return true;
    });
  }, [tables, areaFilter, searchQuery]);

  const handleOpenDetail = (table: TableItem) => {
    setSelectedTable(table);
    setIsDetailDrawerOpen(true);
  };

  const handlePrevTable = () => {
    if (!selectedTable) return;
    const currentIndex = tables.findIndex((t) => t.id === selectedTable.id);
    const prevIndex = (currentIndex - 1 + tables.length) % tables.length;
    setSelectedTable(tables[prevIndex]);
  };

  const handleNextTable = () => {
    if (!selectedTable) return;
    const currentIndex = tables.findIndex((t) => t.id === selectedTable.id);
    const nextIndex = (currentIndex + 1) % tables.length;
    setSelectedTable(tables[nextIndex]);
  };

  // Add Table calling backend API
  const handleAddTable = async (newTable: TableItem) => {
    try {
      await posService.createTable({
        name: `Meja ${newTable.tableNumber}`,
        code: `${newTable.area.substring(0, 3).toUpperCase()}-${String(newTable.tableNumber).padStart(2, '0')}`,
        capacity: newTable.capacity,
        status: newTable.status === 'Diblokir' ? 'INACTIVE' : 'ACTIVE',
        area: newTable.area,
        table_number: newTable.tableNumber,
        operational_status: newTable.status,
      } as any);
      await loadTables();
      showToast(`Meja ${newTable.tableNumber} berhasil ditambahkan.`);
    } catch (err: any) {
      console.error('Failed to create table:', err);
      showToast(err?.response?.data?.message || 'Gagal menambahkan meja. Silakan coba lagi.');
    }
  };

  const handlePay = (table: TableItem) => {
    posService.updateTable(table.id, { operational_status: 'Kosong' } as any).catch(console.error);
    setTables((prev) =>
      prev.map((t) => (t.id === table.id ? { ...t, status: 'Kosong', activeOrder: undefined } : t))
    );
    setIsDetailDrawerOpen(false);
    showToast(`Pembayaran Meja ${table.tableNumber} berhasil diselesaikan! Meja kembali kosong.`);
  };

  const handleCheckInReservation = (table: TableItem) => {
    posService.updateTable(table.id, { operational_status: 'Terisi' } as any).catch(console.error);
    setTables((prev) =>
      prev.map((t) =>
        t.id === table.id
          ? {
              ...t,
              status: 'Terisi',
              elapsedTime: '00:01:00',
              activeOrder: {
                startTime: '15:00',
                staffName: 'Budi',
                guestCount: table.capacity,
                notes: table.customer?.note || '-',
                items: [],
                subtotal: 0,
                tax: 0,
                total: 0,
              },
            }
          : t
      )
    );
    setIsDetailDrawerOpen(false);
    showToast(`Tamu Meja ${table.tableNumber} berhasil Check-In!`);
  };

  const handleCancelReservation = (table: TableItem) => {
    if (confirm(`Yakin ingin membatalkan reservasi Meja ${table.tableNumber}?`)) {
      posService.updateTable(table.id, { operational_status: 'Kosong' } as any).catch(console.error);
      setTables((prev) =>
        prev.map((t) => (t.id === table.id ? { ...t, status: 'Kosong', customer: undefined } : t))
      );
      setIsDetailDrawerOpen(false);
      showToast(`Reservasi Meja ${table.tableNumber} telah dibatalkan.`);
    }
  };

  const handleOpenTable = (table: TableItem) => {
    posService.updateTable(table.id, { operational_status: 'Terisi' } as any).catch(console.error);
    setTables((prev) =>
      prev.map((t) =>
        t.id === table.id
          ? {
              ...t,
              status: 'Terisi',
              elapsedTime: '00:01:00',
              activeOrder: {
                startTime: '15:30',
                staffName: 'Kasir',
                guestCount: table.capacity,
                notes: '-',
                items: [],
                subtotal: 0,
                tax: 0,
                total: 0,
              },
            }
          : t
      )
    );
    showToast(`Meja ${table.tableNumber} dibuka untuk dine-in!`);
  };

  const getAddButtonText = () => {
    switch (activeTab) {
      case 'category':
        return 'Tambah Kategori';
      case 'area':
        return 'Tambah Area';
      default:
        return 'Tambah Meja';
    }
  };

  const handleTopAddClick = () => {
    switch (activeTab) {
      case 'category':
        setIsAddCategoryOpen(true);
        break;
      case 'area':
        setIsAddAreaOpen(true);
        break;
      default:
        setIsAddTableOpen(true);
        break;
    }
  };

  // Next table number computation
  const nextTableNumber = useMemo(() => {
    if (tables.length === 0) return 1;
    const maxNum = Math.max(...tables.map((t) => t.tableNumber), 0);
    return maxNum + 1;
  }, [tables]);

  if (isLoading) {
    return <PageLoader text="Memuat data meja..." />;
  }

  return (
    <div className="p-6 lg:p-8 space-y-4 max-w-[1600px] mx-auto">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Meja</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Kelola meja, pantau status keterisian, dan alur tata letak outlet dengan mudah.
          </p>
        </div>

        {/* Right Header: Refresh & Dynamic Add Button */}
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            onClick={() => loadTables()}
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

      {/* Navigation Tabs: Menu (Meja), Kategori, Area */}
      <div className="flex items-center border-b border-neutral-200 text-xs gap-1">
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold border-b-2 transition-all relative ${
            activeTab === 'tables'
              ? 'border-[#FF5C38] text-[#FF5C38]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Coffee className="size-4" />
          <span>Meja</span>
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
          onClick={() => setActiveTab('area')}
          className={`flex items-center gap-2 px-5 py-3 font-semibold border-b-2 transition-all relative ${
            activeTab === 'area'
              ? 'border-[#FF5C38] text-[#FF5C38]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <MapPin className="size-4" />
          <span>Area</span>
        </button>
      </div>

      {/* TAB CONTENT: TABLES GRID */}
      {activeTab === 'tables' && (
        <div className="space-y-4">
          {/* Status Indicators Legend & Filter Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Status Indicator Legend */}
            <div className="flex items-center flex-wrap gap-4 text-xs font-medium text-neutral-700">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-neutral-400" />
                <span>Kosong</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#10B981]" />
                <span>Terisi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-blue-500" />
                <span>Pesanan selesai</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#F59E0B]" />
                <span>Reservasi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#EF4444]" />
                <span>Diblokir</span>
              </div>
            </div>

            {/* Right Filters */}
            <div className="flex items-center gap-3">
              {/* Area Filter */}
              <Select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                size="sm"
                options={[
                  { value: 'all', label: 'Semua meja' },
                  { value: 'Indoor', label: 'Indoor' },
                  { value: 'Outdoor', label: 'Outdoor' },
                  { value: 'VIP', label: 'VIP' },
                ]}
              />

              {/* Search input with global SearchInput */}
              <div className="w-64">
                <SearchInput
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                  placeholder="Cari nomor meja"
                  size="sm"
                />
              </div>
            </div>
          </div>

          {/* Table Cards Grid or Loading Skeleton / Empty State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-1">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-4 bg-white border border-neutral-200/80 shadow-2xs space-y-4 animate-pulse"
                >
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-20 bg-neutral-200 rounded-lg" />
                    <div className="h-4 w-12 bg-neutral-200 rounded-full" />
                  </div>
                  <div className="h-10 w-full bg-neutral-100 rounded-xl" />
                  <div className="flex items-center justify-between pt-2">
                    <div className="h-4 w-16 bg-neutral-200 rounded" />
                    <div className="h-4 w-14 bg-neutral-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTables.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-1">
              {filteredTables.map((tbl) => {
                const isOccupied = tbl.status === 'Terisi';
                const isReserved = tbl.status === 'Reservasi';

                // Card Styling based on status
                let cardBorderBg =
                  'border-neutral-200/90 bg-neutral-50/20 hover:border-neutral-300 hover:bg-neutral-50/60';
                if (isOccupied) {
                  cardBorderBg =
                    'border-[#10B981] bg-emerald-50/20 hover:bg-emerald-50/30 ring-1 ring-emerald-500/30';
                } else if (isReserved) {
                  cardBorderBg =
                    'border-[#F59E0B] bg-amber-50/20 hover:bg-amber-50/30 ring-1 ring-amber-500/30';
                }

                return (
                  <div
                    key={tbl.id}
                    onClick={() => handleOpenDetail(tbl)}
                    className={`h-[128px] rounded-2xl border p-4 flex flex-col justify-between cursor-pointer transition-all shadow-2xs ${cardBorderBg}`}
                  >
                    {/* Top Row: Area label & Timer/Clock */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[11px] font-semibold text-blue-600 tracking-tight">
                        {tbl.area}
                      </span>

                      {/* Timer or Reservation Time badge */}
                      {isOccupied && tbl.elapsedTime && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                          <Clock className="size-3" />
                          <span>{tbl.elapsedTime}</span>
                        </div>
                      )}

                      {isReserved && tbl.reservationTime && (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
                          <Clock className="size-3" />
                          <span>{tbl.reservationTime}</span>
                        </div>
                      )}
                    </div>

                    {/* Middle: Big Table Number */}
                    <div className="text-center my-auto">
                      <span className="text-2xl font-bold text-neutral-900 tracking-tight">
                        {tbl.tableNumber}
                      </span>
                    </div>

                    {/* Bottom: Capacity Subtext */}
                    <div className="text-center">
                      <span className="text-xs text-neutral-500 font-medium">
                        {tbl.capacity} Orang
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty State */
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <EmptyState
                title="BELUM ADA MEJA"
                description="Tambahkan meja dan atur tata letaknya untuk mulai mengelola pesanan dine-in di outletmu."
                actionLabel="Tambah Meja"
                onAction={() => setIsAddTableOpen(true)}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: KATEGORI */}
      {activeTab === 'category' && (
        <TableCategoryManagement
          onShowToast={showToast}
          isCreateOpen={isAddCategoryOpen}
          onCloseCreate={() => setIsAddCategoryOpen(false)}
        />
      )}

      {/* TAB CONTENT: AREA */}
      {activeTab === 'area' && (
        <TableAreaManagement
          onShowToast={showToast}
          isCreateOpen={isAddAreaOpen}
          onCloseCreate={() => setIsAddAreaOpen(false)}
        />
      )}

      {/* Detail Slide-over Drawer */}
      <TableDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        table={selectedTable}
        onPrevTable={handlePrevTable}
        onNextTable={handleNextTable}
        onPay={handlePay}
        onAddOrder={() => toast.info(`Buka menu kasir untuk menambah pesanan Meja ${selectedTable?.tableNumber}`)}
        onCheckInReservation={handleCheckInReservation}
        onCancelReservation={handleCancelReservation}
        onOpenTable={handleOpenTable}
      />

      {/* Add Table Drawer/Modal */}
      <AddTableModal
        isOpen={isAddTableOpen}
        onClose={() => setIsAddTableOpen(false)}
        onSave={handleAddTable}
        nextTableNumber={nextTableNumber}
      />
    </div>
  );
}
