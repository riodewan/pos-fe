'use client';

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Plus,
  Search,
  Filter,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Inbox,
  User,
  Grid,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Reservation, ReservationArea, ReservationStatus } from '@/types/reservation';
import { ReservationsTableView } from './ReservationsTableView';
import { ReservationDetailsPanel } from './ReservationDetailsPanel';
import { AddReservationModal } from './AddReservationModal';
import { ReservationsCalendarView } from './ReservationsCalendarView';
import { ReservationsFloorplanView } from './ReservationsFloorplanView';
import { Button } from '@/components/common/Button';
import { SearchInput } from '@/components/common/SearchInput';
import { Select } from '@/components/common/Select';
import { posService } from '@/services/pos.service';

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-1',
    time: '09:00',
    customerName: 'Andi Pratama',
    customerPhone: '0812 3456 7890',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    guestCount: 2,
    table: 'Meja 1',
    area: 'Indoor',
    status: 'SELESAI',
    notes: '-',
    date: '7 Okt 2026',
    duration: '2 jam',
  },
  {
    id: 'res-2',
    time: '10:00',
    customerName: 'Siti Nurhaliza',
    customerPhone: '0813 9876 5432',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    guestCount: 4,
    table: 'Meja 3',
    area: 'Indoor',
    status: 'DUDUK',
    notes: 'Ulang tahun',
    date: '7 Okt 2026',
    duration: '2 jam',
    activities: [
      {
        id: 'act-1',
        time: '7 Okt 2026, 08:30',
        description: 'Reservasi dibuat oleh pelanggan (Website)',
        type: 'website',
      },
      {
        id: 'act-2',
        time: '7 Okt 2026, 09:15',
        description: 'Konfirmasi reservasi dikirim (WhatsApp)',
        type: 'whatsapp',
      },
      {
        id: 'act-3',
        time: '7 Okt 2026, 09:16',
        description: 'Pelanggan mengonfirmasi',
        type: 'system',
      },
    ],
    pastReservations: [
      { id: 'past-1', date: '12 Sep 2026', guests: '4 orang', time: '19:00', status: 'Selesai' },
      { id: 'past-2', date: '5 Sep 2026', guests: '2 orang', time: '13:00', status: 'Selesai' },
      { id: 'past-3', date: '20 Aug 2026', guests: '3 orang', time: '11:00', status: 'Selesai' },
    ],
  },
  {
    id: 'res-3',
    time: '11:30',
    customerName: 'Budi Santoso',
    customerPhone: '0812 1122 3344',
    guestCount: 2,
    table: 'Meja 5',
    area: 'Outdoor',
    status: 'AKAN_DATANG',
    notes: '-',
    date: '7 Okt 2026',
    duration: '2 jam',
  },
  {
    id: 'res-4',
    time: '12:00',
    customerName: 'Dewi Lestari',
    customerPhone: '0812 9988 7766',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    guestCount: 6,
    table: 'Meja 6, 7',
    area: 'Indoor',
    status: 'AKAN_DATANG',
    notes: 'Meeting kantor',
    date: '7 Okt 2026',
    duration: '3 jam',
  },
  {
    id: 'res-5',
    time: '13:00',
    customerName: 'Rizky Maulana',
    customerPhone: '0819 8765 4321',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    guestCount: 2,
    table: 'Meja 2',
    area: 'Indoor',
    status: 'AKAN_DATANG',
    notes: '-',
    date: '7 Okt 2026',
    duration: '2 jam',
  },
  {
    id: 'res-6',
    time: '14:30',
    customerName: 'Ana Fitri',
    customerPhone: '0812 4455 6677',
    guestCount: 4,
    table: 'Meja 4',
    area: 'Outdoor',
    status: 'AKAN_DATANG',
    notes: 'Dengan anak',
    date: '7 Okt 2026',
    duration: '2 jam',
  },
  {
    id: 'res-7',
    time: '16:00',
    customerName: 'Rina Amelia',
    customerPhone: '0813 6677 8899',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    guestCount: 3,
    table: 'Meja 8',
    area: 'Indoor',
    status: 'AKAN_DATANG',
    notes: '-',
    date: '7 Okt 2026',
    duration: '2 jam',
  },
  {
    id: 'res-8',
    time: '17:30',
    customerName: 'Tono Haryadi',
    customerPhone: '0812 3344 5566',
    guestCount: 2,
    table: 'Meja 9',
    area: 'Indoor',
    status: 'AKAN_DATANG',
    notes: 'Anniversary',
    date: '7 Okt 2026',
    duration: '2 jam',
  },
  {
    id: 'res-9',
    time: '19:00',
    customerName: 'Muhammad Fajar',
    customerPhone: '0812 9988 1122',
    guestCount: 8,
    table: 'Meja 10, 11',
    area: 'Outdoor',
    status: 'DUDUK',
    notes: 'Rombongan',
    date: '7 Okt 2026',
    duration: '3 jam',
  },
  {
    id: 'res-10',
    time: '20:00',
    customerName: 'Lia Kartika',
    customerPhone: '0813 5544 3322',
    avatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    guestCount: 2,
    table: 'Meja 12',
    area: 'Indoor',
    status: 'DIBATALKAN',
    notes: '-',
    date: '7 Okt 2026',
    duration: '2 jam',
  },
  {
    id: 'res-11',
    time: '21:00',
    customerName: 'Yoga Pratama',
    customerPhone: '0812 2233 4455',
    avatarUrl:
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    guestCount: 4,
    table: 'Meja 13',
    area: 'Outdoor',
    status: 'AKAN_DATANG',
    notes: '-',
    date: '7 Okt 2026',
    duration: '2 jam',
  },
  {
    id: 'res-12',
    time: '21:30',
    customerName: 'Maya Sari',
    customerPhone: '0813 9988 7766',
    avatarUrl:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    guestCount: 2,
    table: 'Meja 14',
    area: 'Outdoor',
    status: 'AKAN_DATANG',
    notes: 'Request jendela',
    date: '7 Okt 2026',
    duration: '2 jam',
  },
];

export function ReservationsView() {
  const [reservations, setReservations] = useState<Reservation[]>(INITIAL_RESERVATIONS);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(
    INITIAL_RESERVATIONS[1] // Siti Nurhaliza selected by default matching Image 1
  );

  // Tab: 'list' (Daftar Reservasi), 'calendar' (Tampilan Kalender), 'map' (Peta Meja)
  const [activeTab, setActiveTab] = useState<'list' | 'calendar' | 'map'>('list');

  // Filter Bar state matching Image 1 & 2
  const [selectedDate, setSelectedDate] = useState('7 Okt 2026');
  const [selectedStatus, setSelectedStatus] = useState('Semua Status');
  const [selectedArea, setSelectedArea] = useState('Semua Area');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [reservationToEdit, setReservationToEdit] = useState<Reservation | null>(null);

  // Fetch live reservations on mount
  React.useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await posService.getReservations();
        if (res?.data && res.data.length > 0) {
          const mapped: Reservation[] = res.data.map((r: any) => ({
            id: r.id,
            time: r.reservation_time || '18:00',
            customerName: r.customer_name,
            customerPhone: r.customer_phone || '-',
            avatarUrl:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            guestCount: Number(r.guest_count) || 2,
            table: r.table?.name || 'Meja Umum',
            area: 'Indoor',
            status:
              r.status === 'Selesai'
                ? 'SELESAI'
                : r.status === 'Dibatalkan'
                ? 'DIBATALKAN'
                : r.status === 'Dikonfirmasi'
                ? 'DUDUK'
                : 'AKAN_DATANG',
            notes: r.notes || '-',
            date: r.reservation_date || 'Hari Ini',
            duration: '2 jam',
          }));
          setReservations(mapped);
          if (mapped.length > 0) {
            setSelectedReservation(mapped[0]);
          }
        }
      } catch {
        // Fallback to initial demo reservations
      }
    };

    fetchReservations();
  }, []);

  // KPI Counts matching Image 1
  const kpiStats = useMemo(() => {
    const total = reservations.length;
    const akanDatang = reservations.filter((r) => r.status === 'AKAN_DATANG').length;
    const duduk = reservations.filter((r) => r.status === 'DUDUK').length;
    const selesai = reservations.filter((r) => r.status === 'SELESAI').length;
    const dibatalkan = reservations.filter((r) => r.status === 'DIBATALKAN').length;
    return { total, akanDatang, duduk, selesai, dibatalkan };
  }, [reservations]);

  // Filtered reservations
  const filteredReservations = useMemo(() => {
    return reservations.filter((r) => {
      // Status
      if (selectedStatus !== 'Semua Status') {
        if (selectedStatus === 'Akan Datang' && r.status !== 'AKAN_DATANG') return false;
        if (selectedStatus === 'Duduk' && r.status !== 'DUDUK') return false;
        if (selectedStatus === 'Selesai' && r.status !== 'SELESAI') return false;
        if (selectedStatus === 'Dibatalkan' && r.status !== 'DIBATALKAN') return false;
      }

      // Area
      if (selectedArea !== 'Semua Area' && r.area !== selectedArea) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = r.customerName.toLowerCase().includes(q);
        const matchPhone = r.customerPhone.includes(q);
        const matchTable = r.table.toLowerCase().includes(q);
        const matchNotes = r.notes.toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchTable && !matchNotes) return false;
      }

      return true;
    });
  }, [reservations, selectedStatus, selectedArea, searchQuery]);

  // Actions
  const handleCheckIn = async (id: string) => {
    try {
      await posService.updateReservationStatus(id, 'Dikonfirmasi');
    } catch {}

    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'DUDUK' as ReservationStatus } : r))
    );
    if (selectedReservation?.id === id) {
      setSelectedReservation((prev) =>
        prev ? { ...prev, status: 'DUDUK' as ReservationStatus } : null
      );
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await posService.updateReservationStatus(id, 'Dibatalkan');
    } catch {}

    setReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'DIBATALKAN' as ReservationStatus } : r))
    );
    if (selectedReservation?.id === id) {
      setSelectedReservation((prev) =>
        prev ? { ...prev, status: 'DIBATALKAN' as ReservationStatus } : null
      );
    }
  };

  const handleSaveReservation = async (data: Partial<Reservation>) => {
    if (data.id) {
      // Edit
      setReservations((prev) =>
        prev.map((r) => (r.id === data.id ? ({ ...r, ...data } as Reservation) : r))
      );
      if (selectedReservation?.id === data.id) {
        setSelectedReservation((prev) =>
          prev ? ({ ...prev, ...data } as Reservation) : null
        );
      }
    } else {
      // Add
      let createdId = `res-${Date.now()}`;
      try {
        const apiRes = await posService.createReservation({
          customer_name: data.customerName || 'Tamu Baru',
          customer_phone: data.customerPhone || null,
          guest_count: data.guestCount || 2,
          reservation_date: new Date().toISOString().split('T')[0],
          reservation_time: data.time || '18:00',
          notes: data.notes || null,
        });
        if (apiRes?.data?.id) {
          createdId = apiRes.data.id;
        }
      } catch {}

      const newRes: Reservation = {
        id: createdId,
        time: data.time || '18:00',
        customerName: data.customerName || 'Tamu Baru',
        customerPhone: data.customerPhone || '081234567890',
        guestCount: data.guestCount || 2,
        table: data.table || 'Meja 1',
        area: data.area || 'Indoor',
        status: data.status || 'AKAN_DATANG',
        notes: data.notes || '-',
        date: data.date || 'Hari Ini',
        duration: data.duration || '2 jam',
      };
      setReservations((prev) => [newRes, ...prev]);
      setSelectedReservation(newRes);
    }
  };

  return (
    <div className="p-6 space-y-5 animate-in fade-in duration-150">
      {/* Top Page Header matching Image 1, 2, 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Reservasi
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Kelola reservasi meja dengan mudah, pantau ketersediaan meja, dan atur kunjungan pelanggan.
          </p>
        </div>

        {/* Action Button & Demo Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Quick Demo Switcher */}
          <div className="hidden md:flex items-center bg-white border border-neutral-200/90 rounded-xl p-1 text-[11px] font-semibold text-neutral-600 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setReservations(INITIAL_RESERVATIONS);
                setSelectedReservation(INITIAL_RESERVATIONS[1]);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                reservations.length > 0
                  ? 'bg-neutral-100 text-neutral-900 font-bold'
                  : 'hover:text-neutral-900'
              }`}
            >
              Demo Aktif ({reservations.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setReservations([]);
                setSelectedReservation(null);
              }}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                reservations.length === 0
                  ? 'bg-neutral-100 text-neutral-900 font-bold'
                  : 'hover:text-neutral-900'
              }`}
            >
              Kosong (Empty)
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setReservationToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-semibold text-xs px-4 py-2"
            leftIcon={<Plus className="size-4" />}
          >
            Tambah Reservasi
          </Button>
        </div>
      </div>

      {/* 3 Tabs Navigation matching Image 1 */}
      <div className="flex items-center gap-1 border-b border-neutral-200">
        <button
          type="button"
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'list'
              ? 'border-[#FF5C38] text-[#FF5C38]'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Calendar className="size-3.5" />
          <span>Daftar Reservasi</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'calendar'
              ? 'border-[#FF5C38] text-[#FF5C38]'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Clock className="size-3.5" />
          <span>Tampilan Kalender</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('map')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'map'
              ? 'border-[#FF5C38] text-[#FF5C38]'
              : 'border-transparent text-neutral-600 hover:text-neutral-900'
          }`}
        >
          <Grid className="size-3.5" />
          <span>Peta Meja</span>
        </button>
      </div>

      {/* Filter and Search Bar matching Image 1, 2, 3 */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Date Picker selector */}
          <div className="w-40 sm:w-44">
            <Select
              size="sm"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-semibold bg-white"
            >
              <option value="7 Okt 2026">7 Okt 2026</option>
              <option value="Hari ini (14/10/2026)">Hari ini (14/10/2026)</option>
              <option value="Besok">Besok</option>
              <option value="Minggu Ini">Minggu Ini</option>
            </Select>
          </div>

          {/* Status selector */}
          <div className="w-36 sm:w-40">
            <Select
              size="sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs font-semibold bg-white"
            >
              <option value="Semua Status">Semua Status</option>
              <option value="Akan Datang">Akan Datang</option>
              <option value="Duduk">Duduk</option>
              <option value="Selesai">Selesai</option>
              <option value="Dibatalkan">Dibatalkan</option>
            </Select>
          </div>

          {/* Area selector */}
          <div className="w-36 sm:w-40">
            <Select
              size="sm"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="text-xs font-semibold bg-white"
            >
              <option value="Semua Area">Semua Area</option>
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
              <option value="VIP">VIP</option>
            </Select>
          </div>

          {/* Search input */}
          <div className="flex-1 min-w-[200px]">
            <SearchInput
              size="sm"
              placeholder="Cari nama, nomor telepon, atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>
        </div>

        {/* Filter Button */}
        <Button
          variant="outline"
          size="sm"
          className="text-xs font-semibold bg-white"
          leftIcon={<Filter className="size-3.5 text-neutral-500" />}
        >
          Filter
        </Button>
      </div>

      {/* 5 KPI Stat Cards matching Image 1 */}
      {reservations.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Total Reservasi */}
          <div className="p-3.5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-neutral-900 tracking-tight">
                {kpiStats.total}
              </p>
              <p className="text-xs font-bold text-neutral-700 mt-0.5">Total Reservasi</p>
              <p className="text-[10px] text-neutral-400">{selectedDate}</p>
            </div>
            <div className="size-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-200 flex items-center justify-center shrink-0">
              <Calendar className="size-5" />
            </div>
          </div>

          {/* Card 2: Akan Datang */}
          <div className="p-3.5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-neutral-900 tracking-tight">
                {kpiStats.akanDatang}
              </p>
              <p className="text-xs font-bold text-neutral-700 mt-0.5">Akan Datang</p>
            </div>
            <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <User className="size-5" />
            </div>
          </div>

          {/* Card 3: Duduk */}
          <div className="p-3.5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-neutral-900 tracking-tight">
                {kpiStats.duduk}
              </p>
              <p className="text-xs font-bold text-neutral-700 mt-0.5">Duduk</p>
            </div>
            <div className="size-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <Users className="size-5" />
            </div>
          </div>

          {/* Card 4: Selesai */}
          <div className="p-3.5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-neutral-900 tracking-tight">
                {kpiStats.selesai}
              </p>
              <p className="text-xs font-bold text-neutral-700 mt-0.5">Selesai</p>
            </div>
            <div className="size-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center shrink-0">
              <CheckCircle2 className="size-5" />
            </div>
          </div>

          {/* Card 5: Dibatalkan */}
          <div className="p-3.5 rounded-2xl border border-neutral-200/90 bg-white shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-neutral-900 tracking-tight">
                {kpiStats.dibatalkan}
              </p>
              <p className="text-xs font-bold text-neutral-700 mt-0.5">Dibatalkan</p>
            </div>
            <div className="size-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center shrink-0">
              <XCircle className="size-5" />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area based on Active Tab */}
      {activeTab === 'list' && (
        <>
          {filteredReservations.length > 0 ? (
            /* Populated Table View (Image 1 if selectedReservation, or Image 2 full-width) */
            <div className="flex flex-col xl:flex-row gap-5 items-start">
              {/* Left Column: Table matching Image 1 & 2 */}
              <div className="flex-1 w-full min-w-0">
                <ReservationsTableView
                  reservations={filteredReservations}
                  selectedReservationId={selectedReservation?.id || null}
                  onSelectReservation={(res) => setSelectedReservation(res)}
                  onEdit={(res) => {
                    setReservationToEdit(res);
                    setIsAddModalOpen(true);
                  }}
                  onCheckIn={handleCheckIn}
                  onCancel={handleCancel}
                />
              </div>

              {/* Right Column: Reservation Details Panel matching Image 1 */}
              {selectedReservation && (
                <ReservationDetailsPanel
                  reservation={selectedReservation}
                  onClose={() => setSelectedReservation(null)}
                  onEdit={(res) => {
                    setReservationToEdit(res);
                    setIsAddModalOpen(true);
                  }}
                  onCheckIn={handleCheckIn}
                  onCancel={handleCancel}
                />
              )}
            </div>
          ) : (
            /* Empty State Container matching Image 3 */
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs min-h-[500px] flex flex-col items-center justify-center p-8 animate-in fade-in duration-150">
              <div className="size-20 rounded-2xl bg-neutral-50 border border-neutral-200/80 flex items-center justify-center text-neutral-300 mb-4 shadow-2xs">
                <Inbox className="size-10 stroke-[1.25] text-neutral-300" />
              </div>

              <h2 className="text-xs font-bold tracking-wider text-neutral-600 uppercase">
                BELUM ADA RESERVASI
              </h2>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm text-center">
                Reservasi pelanggan akan muncul di sini setelah ditambahkan.
              </p>

              <button
                type="button"
                onClick={() => {
                  setReservationToEdit(null);
                  setIsAddModalOpen(true);
                }}
                className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Plus className="size-4" />
                <span>Tambah Reservasi</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Tab 2: Calendar View */}
      {activeTab === 'calendar' && (
        <ReservationsCalendarView
          reservations={filteredReservations}
          onSelectReservation={(res) => {
            setSelectedReservation(res);
            setActiveTab('list');
          }}
        />
      )}

      {/* Tab 3: Floorplan Map View */}
      {activeTab === 'map' && (
        <ReservationsFloorplanView
          reservations={filteredReservations}
          onSelectReservation={(res) => {
            setSelectedReservation(res);
            setActiveTab('list');
          }}
        />
      )}

      {/* Add / Edit Reservation Modal */}
      <AddReservationModal
        isOpen={isAddModalOpen}
        reservationToEdit={reservationToEdit}
        onClose={() => {
          setIsAddModalOpen(false);
          setReservationToEdit(null);
        }}
        onSave={handleSaveReservation}
      />
    </div>
  );
}
