'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import {
  TableItem,
  TableDetailDrawer,
  AddTableModal,
  TableAreaManagement,
  TableCategoryManagement,
} from '@/components/tables';
import { EmptyState } from '@/components/common/EmptyState';

// 12 Tables matching Screenshot 3 exactly
const INITIAL_TABLES: TableItem[] = [
  {
    id: 'tbl-1',
    tableNumber: 1,
    area: 'Indoor',
    capacity: 2,
    status: 'Kosong',
  },
  {
    id: 'tbl-2',
    tableNumber: 2,
    area: 'Indoor',
    capacity: 2,
    status: 'Kosong',
  },
  {
    id: 'tbl-3',
    tableNumber: 3,
    area: 'Indoor',
    capacity: 2,
    status: 'Reservasi',
    reservationTime: '15:00 WIB',
    customer: {
      name: 'Siti Nurhaliza',
      phone: '081398765432',
      initials: 'SN',
      date: '14/10/2026',
      time: '15:00',
      note: 'Reservasi untuk ulang tahun',
    },
  },
  {
    id: 'tbl-4',
    tableNumber: 4,
    area: 'Indoor',
    capacity: 2,
    status: 'Kosong',
  },
  {
    id: 'tbl-5',
    tableNumber: 5,
    area: 'Indoor',
    capacity: 2,
    status: 'Terisi',
    elapsedTime: '00:13:34',
    activeOrder: {
      startTime: '12:00',
      staffName: 'Budi',
      guestCount: 2,
      notes: '-',
      items: [
        {
          id: 'item-1',
          name: 'Kopi Susu Gula Aren',
          variant: 'Regular, Less Ice',
          qty: 1,
          price: 28000,
        },
        {
          id: 'item-2',
          name: 'Matcha Latte',
          variant: 'Regular',
          note: 'Tanpa es untuk matcha latte ya.',
          qty: 1,
          price: 30000,
        },
      ],
      subtotal: 58000,
      tax: 0,
      total: 58000,
    },
  },
  {
    id: 'tbl-6',
    tableNumber: 6,
    area: 'Outdoor',
    capacity: 2,
    status: 'Kosong',
  },
  {
    id: 'tbl-7',
    tableNumber: 7,
    area: 'Outdoor',
    capacity: 2,
    status: 'Kosong',
  },
  {
    id: 'tbl-8',
    tableNumber: 8,
    area: 'Outdoor',
    capacity: 2,
    status: 'Kosong',
  },
  {
    id: 'tbl-9',
    tableNumber: 9,
    area: 'Outdoor',
    capacity: 2,
    status: 'Kosong',
  },
  {
    id: 'tbl-10',
    tableNumber: 10,
    area: 'Outdoor',
    capacity: 2,
    status: 'Kosong',
  },
  {
    id: 'tbl-11',
    tableNumber: 11,
    area: 'Outdoor',
    capacity: 2,
    status: 'Kosong',
  },
  {
    id: 'tbl-12',
    tableNumber: 12,
    area: 'Outdoor',
    capacity: 2,
    status: 'Kosong',
  },
];

type TablesTab = 'tables' | 'category' | 'area';

export default function TablesPage() {
  const [activeTab, setActiveTab] = useState<TablesTab>('tables');
  const [tables, setTables] = useState<TableItem[]>(INITIAL_TABLES);
  const [demoMode, setDemoMode] = useState<'populated' | 'empty'>('populated');

  // Filters
  const [areaFilter, setAreaFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Drawer / Modals
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isAddAreaOpen, setIsAddAreaOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered tables
  const filteredTables = useMemo(() => {
    if (demoMode === 'empty') return [];

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
  }, [tables, demoMode, areaFilter, searchQuery]);

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

  const handleAddTable = (newTable: TableItem) => {
    setTables((prev) => [...prev, newTable]);
    showToast(`Meja ${newTable.tableNumber} berhasil ditambahkan!`);
  };

  const handlePay = (table: TableItem) => {
    setTables((prev) =>
      prev.map((t) => (t.id === table.id ? { ...t, status: 'Kosong', activeOrder: undefined } : t))
    );
    setIsDetailDrawerOpen(false);
    showToast(`Pembayaran Meja ${table.tableNumber} berhasil diselesaikan! Meja kembali kosong.`);
  };

  const handleCheckInReservation = (table: TableItem) => {
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
      setTables((prev) =>
        prev.map((t) => (t.id === table.id ? { ...t, status: 'Kosong', customer: undefined } : t))
      );
      setIsDetailDrawerOpen(false);
      showToast(`Reservasi Meja ${table.tableNumber} telah dibatalkan.`);
    }
  };

  const handleOpenTable = (table: TableItem) => {
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

  return (
    <div className="p-6 lg:p-8 space-y-4 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <Check className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Page Header matching Screenshot 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Meja</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Kelola meja, pantau status, dan alur tata letak outlet
          </p>
        </div>

        {/* Right Header: Discrete Switcher & + Dynamic Add Button */}
        <div className="flex items-center gap-3">
          {/* Demo Switcher (available on Table tab) */}
          {activeTab === 'tables' && (
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
                Belum Ada Meja
              </button>
            </div>
          )}

          {/* Dynamic + Tambah Button */}
          <button
            onClick={handleTopAddClick}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#FF4D4D] hover:bg-[#E53939] text-white text-xs font-semibold transition-colors shadow-2xs"
          >
            <Plus className="size-4 stroke-[2.5]" />
            <span>{getAddButtonText()}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs matching Screenshot 3: Menu (Meja), Kategori, Area */}
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
          {/* Status Indicators Legend & Filter Bar matching Screenshot 3 & 4 */}
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

            {/* Right Filters matching Screenshot 3 & 4 */}
            <div className="flex items-center gap-3">
              {/* Area Filter */}
              <div className="relative">
                <select
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none hover:bg-neutral-50"
                >
                  <option value="all">Semua meja</option>
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="VIP">VIP</option>
                </select>
                <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>

              {/* Search input with dark circle magnifying button */}
              <div className="relative w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nomor meja"
                  className="w-full h-9 pl-3.5 pr-9 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 shadow-2xs focus:outline-none"
                />
                <div className="absolute right-2 top-2 size-5 rounded-full bg-neutral-900 text-white flex items-center justify-center">
                  <Search className="size-2.5 stroke-[2.5]" />
                </div>
              </div>
            </div>
          </div>

          {/* Table Cards Grid (Screenshot 3) or Empty State (Screenshot 4) */}
          {filteredTables.length > 0 ? (
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

                      {/* Timer or Reservation Time badge matching Screenshot 3 */}
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
            /* Empty State matching Screenshot 4 */
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

      {/* Detail Slide-over Drawer (Screenshot 1 & 2) */}
      <TableDetailDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        table={selectedTable}
        onPrevTable={handlePrevTable}
        onNextTable={handleNextTable}
        onPay={handlePay}
        onAddOrder={() => alert(`Buka menu kasir untuk menambah pesanan Meja ${selectedTable?.tableNumber}`)}
        onCheckInReservation={handleCheckInReservation}
        onCancelReservation={handleCancelReservation}
        onOpenTable={handleOpenTable}
      />

      {/* Add Table Drawer/Modal */}
      <AddTableModal
        isOpen={isAddTableOpen}
        onClose={() => setIsAddTableOpen(false)}
        onSave={handleAddTable}
        nextTableNumber={tables.length + 1}
      />
    </div>
  );
}
