'use client';

import React, { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Calendar,
  ChevronRight,
  ShoppingBag,
  Ticket,
  Package,
  Settings,
  FileText,
  FolderOpen,
  Filter,
  Check,
  Bell,
} from 'lucide-react';
import {
  NotificationItem,
  NotificationCategory,
  NotificationStatusFilter,
} from '@/types/notifications';
import { Button } from '@/components/common/Button';
import { tenantService } from '@/services/tenant.service';

// Initial Mock Notifications matching Screenshot 1
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Pesanan baru diterima',
    subtitle: 'Pesanan #ORD-0018 dari Dine-in • Meja 3',
    category: 'Pesanan',
    isRead: false,
    dateGroup: 'Hari Ini',
    time: '10:24',
    targetUrl: '/dashboard/orders',
  },
  {
    id: 'notif-2',
    title: 'Reservasi baru masuk',
    subtitle: 'Budi Santoso • 4 orang • Pukul 19:00',
    category: 'Reservasi',
    isRead: false,
    dateGroup: 'Hari Ini',
    time: '10:18',
    targetUrl: '/dashboard/reservations',
  },
  {
    id: 'notif-3',
    title: 'Stok bahan menipis',
    subtitle: 'Daging Sapi tersisa 2 kg. Segera lakukan restock.',
    category: 'Inventori',
    isRead: false,
    dateGroup: 'Hari Ini',
    time: '10:05',
    targetUrl: '/dashboard/inventory',
  },
  {
    id: 'notif-4',
    title: 'Sinkronisasi POS berhasil',
    subtitle: 'Data transaksi berhasil disinkronkan.',
    category: 'Sistem',
    isRead: true,
    dateGroup: 'Hari Ini',
    time: '09:52',
  },
  {
    id: 'notif-5',
    title: 'Pesanan siap disajikan',
    subtitle: 'Pesanan #ORD-0012 • Meja 5 siap diantar.',
    category: 'Pesanan',
    isRead: true,
    dateGroup: 'Hari Ini',
    time: '09:40',
    targetUrl: '/dashboard/orders',
  },
  {
    id: 'notif-6',
    title: 'Pesanan baru diterima',
    subtitle: 'Pesanan #ORD-0015 dari Dine-in • Meja 2',
    category: 'Pesanan',
    isRead: true,
    dateGroup: 'Kemarin',
    time: '20:15',
    targetUrl: '/dashboard/orders',
  },
  {
    id: 'notif-7',
    title: 'Reservasi dikonfirmasi',
    subtitle: 'Reservasi #RSV-0021 atas nama Siti Rahma • 2 orang',
    category: 'Reservasi',
    isRead: true,
    dateGroup: 'Kemarin',
    time: '19:42',
    targetUrl: '/dashboard/reservations',
  },
  {
    id: 'notif-8',
    title: 'Pengguna baru ditambahkan',
    subtitle: 'Rina Putri telah ditambahkan sebagai staf kasir.',
    category: 'Sistem',
    isRead: true,
    dateGroup: 'Kemarin',
    time: '17:30',
    targetUrl: '/dashboard/staff',
  },
  {
    id: 'notif-9',
    title: 'Pesanan dibatalkan',
    subtitle: 'Pesanan #ORD-0010 dibatalkan oleh pelanggan.',
    category: 'Pesanan',
    isRead: true,
    dateGroup: 'Kemarin',
    time: '16:48',
    targetUrl: '/dashboard/orders',
  },
  {
    id: 'notif-10',
    title: 'Laporan harian tersedia',
    subtitle: 'Laporan penjualan 21 Oktober 2026 siap dilihat.',
    category: 'Sistem',
    isRead: true,
    dateGroup: 'Kemarin',
    time: '15:05',
    targetUrl: '/dashboard/reports',
  },
];

export function NotificationsView() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<NotificationStatusFilter>('Semua');
  const [dateFilter, setDateFilter] = useState('Hari ini (14/10/2026)');
  const [isDemoEmpty, setIsDemoEmpty] = useState(false); // Toggle Screenshot 1 vs Screenshot 2
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch live notifications on mount
  React.useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await tenantService.getNotifications();
        if (res?.data && res.data.length > 0) {
          const mapped: NotificationItem[] = res.data.map((n: any) => ({
            id: n.id,
            title: n.title,
            subtitle: n.subtitle,
            category: (n.category || 'Sistem') as NotificationItem['category'],
            isRead: Boolean(n.is_read),
            dateGroup: 'Hari Ini',
            time: n.created_at
              ? new Date(n.created_at).toLocaleTimeString('id-ID', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '10:00',
            targetUrl: n.target_url || '/dashboard',
          }));
          setNotifications(mapped);
        }
      } catch {
        // Fallback to initial notifications
      }
    };

    fetchNotifs();
  }, []);

  // Mark single as read
  const handleMarkAsRead = async (id: string) => {
    try {
      await tenantService.markNotificationRead(id);
    } catch {}

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await tenantService.markAllNotificationsRead();
    } catch {}

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('Semua notifikasi telah ditandai sebagai dibaca');
  };

  // Counts for sidebar
  const counts = useMemo(() => {
    const list = isDemoEmpty ? [] : notifications;
    return {
      all: list.length,
      pesanan: list.filter((n) => n.category === 'Pesanan').length,
      reservasi: list.filter((n) => n.category === 'Reservasi').length,
      inventori: list.filter((n) => n.category === 'Inventori').length,
      sistem: list.filter((n) => n.category === 'Sistem').length,
      unread: list.filter((n) => !n.isRead).length,
      read: list.filter((n) => n.isRead).length,
    };
  }, [notifications, isDemoEmpty]);

  // Filtered notifications
  const filteredNotifications = useMemo(() => {
    if (isDemoEmpty) return [];

    return notifications.filter((item) => {
      // Category filter
      if (selectedCategory !== 'Semua' && item.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatus === 'BELUM_DIBACA' && item.isRead) return false;
      if (selectedStatus === 'SUDAH_DIBACA' && !item.isRead) return false;

      return true;
    });
  }, [notifications, selectedCategory, selectedStatus, isDemoEmpty]);

  // Group filtered by dateGroup
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: NotificationItem[] } = {};
    filteredNotifications.forEach((item) => {
      if (!groups[item.dateGroup]) {
        groups[item.dateGroup] = [];
      }
      groups[item.dateGroup].push(item);
    });
    return groups;
  }, [filteredNotifications]);

  // Render Category Icon Badge
  const renderCategoryIcon = (category: NotificationItem['category']) => {
    switch (category) {
      case 'Pesanan':
        return (
          <div className="size-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <ShoppingBag className="size-4.5 stroke-[2.2]" />
          </div>
        );
      case 'Reservasi':
        return (
          <div className="size-9 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Ticket className="size-4.5 stroke-[2.2]" />
          </div>
        );
      case 'Inventori':
        return (
          <div className="size-9 rounded-xl bg-[#8B5CF6] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Package className="size-4.5 stroke-[2.2]" />
          </div>
        );
      case 'Sistem':
      default:
        return (
          <div className="size-9 rounded-xl bg-neutral-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Settings className="size-4.5 stroke-[2.2]" />
          </div>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Row matching Screenshots 1 & 2 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Notifikasi
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Pantau semua aktivitas penting di outletmu.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Demo Mode Switcher (Screenshot 1 vs Screenshot 2) */}
          <button
            type="button"
            onClick={() => setIsDemoEmpty(!isDemoEmpty)}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 transition-colors cursor-pointer shadow-2xs"
          >
            {isDemoEmpty ? 'Mode: Kosong (Gambar 2)' : 'Mode: Ada Notifikasi (Gambar 1)'}
          </button>

          {/* Mark All as Read button matching Screenshot 1 */}
          {!isDemoEmpty && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-neutral-200/90 bg-white hover:bg-neutral-50 text-neutral-800 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <CheckCircle2 className="size-4 text-emerald-500 fill-emerald-50" />
              <span>Tandai Semua Dibaca</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isDemoEmpty ? (
        /* SCREENSHOT 2: EMPTY STATE */
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-12 sm:p-24 flex flex-col items-center justify-center text-center min-h-[520px] animate-in fade-in duration-150">
          {/* Folder graphic with sheets */}
          <div className="relative mb-4">
            <div className="size-20 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-300">
              <FolderOpen className="size-10 stroke-[1.5]" />
            </div>
            <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-neutral-200 border-2 border-white" />
          </div>

          <h2 className="text-sm font-bold tracking-wider text-neutral-700 uppercase">
            BELUM ADA NOTIFIKASI
          </h2>
          <p className="text-xs text-neutral-400 max-w-md mt-1.5 leading-relaxed">
            Notifikasi aktivitas outlet akan muncul di sini saat ada pesanan baru, reservasi, atau pembaruan penting lainnya.
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDemoEmpty(false)}
            className="mt-6 text-xs text-neutral-600"
          >
            Tampilkan Contoh Notifikasi
          </Button>
        </div>
      ) : (
        /* SCREENSHOT 1: POPULATED 2-COLUMN LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-in fade-in duration-150">
          {/* LEFT COLUMN: Notifications List (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-6">
            {Object.keys(groupedNotifications).length === 0 ? (
              <div className="py-16 text-center text-neutral-400 text-xs">
                Tidak ada notifikasi dalam filter ini.
              </div>
            ) : (
              Object.entries(groupedNotifications).map(([groupTitle, items]) => (
                <div key={groupTitle} className="space-y-3">
                  <h3 className="text-xs font-bold text-neutral-800 tracking-wide">
                    {groupTitle}
                  </h3>

                  <div className="space-y-1">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => handleMarkAsRead(item.id)}
                        className={`group relative flex items-center justify-between gap-4 p-3 rounded-xl transition-all cursor-pointer ${
                          item.isRead
                            ? 'hover:bg-neutral-50/80'
                            : 'bg-orange-50/20 hover:bg-orange-50/40'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Unread Red Dot */}
                          <div className="w-2 flex justify-center shrink-0">
                            {!item.isRead && (
                              <span className="size-2 rounded-full bg-[#FF5C38] shrink-0" />
                            )}
                          </div>

                          {/* Category Icon */}
                          {renderCategoryIcon(item.category)}

                          {/* Title & Subtitle */}
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-bold truncate leading-tight ${
                                item.isRead ? 'text-neutral-800' : 'text-neutral-900 font-extrabold'
                              }`}
                            >
                              {item.title}
                            </p>
                            <p className="text-[11px] text-neutral-500 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Right: Time & Chevron */}
                        <div className="flex items-center gap-2.5 shrink-0 text-neutral-400 group-hover:text-neutral-600 transition-colors">
                          <span className="text-[11px] font-mono font-medium">
                            {item.time}
                          </span>
                          <ChevronRight className="size-4 stroke-[2]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT COLUMN: Filters Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 space-y-5">
            {/* Date filter field matching Screenshot 1 */}
            <div className="relative">
              <input
                type="text"
                readOnly
                value={dateFilter}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-800 bg-white focus:outline-none cursor-pointer"
              />
              <Calendar className="size-4 text-neutral-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Kategori Section */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-neutral-900 pb-1">
                Kategori
              </h4>

              <div className="space-y-1">
                {/* Semua */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Semua')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    selectedCategory === 'Semua'
                      ? 'bg-red-50/70 text-[#FF5C38] font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-6 rounded-lg bg-[#FF5C38] text-white flex items-center justify-center shrink-0">
                      <FileText className="size-3.5" />
                    </div>
                    <span>Semua</span>
                  </div>
                  <span className="text-xs font-semibold">{counts.all}</span>
                </button>

                {/* Pesanan */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Pesanan')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    selectedCategory === 'Pesanan'
                      ? 'bg-blue-50/70 text-blue-600 font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-6 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                      <ShoppingBag className="size-3.5" />
                    </div>
                    <span>Pesanan</span>
                  </div>
                  <span className="text-xs font-semibold">{counts.pesanan}</span>
                </button>

                {/* Reservasi */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Reservasi')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    selectedCategory === 'Reservasi'
                      ? 'bg-amber-50/70 text-amber-600 font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-6 rounded-lg bg-[#F59E0B] text-white flex items-center justify-center shrink-0">
                      <Ticket className="size-3.5" />
                    </div>
                    <span>Reservasi</span>
                  </div>
                  <span className="text-xs font-semibold">{counts.reservasi}</span>
                </button>

                {/* Inventori */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Inventori')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    selectedCategory === 'Inventori'
                      ? 'bg-purple-50/70 text-purple-600 font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-6 rounded-lg bg-[#8B5CF6] text-white flex items-center justify-center shrink-0">
                      <Package className="size-3.5" />
                    </div>
                    <span>Inventori</span>
                  </div>
                  <span className="text-xs font-semibold">{counts.inventori}</span>
                </button>

                {/* Sistem */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Sistem')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    selectedCategory === 'Sistem'
                      ? 'bg-neutral-100 text-neutral-900 font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-6 rounded-lg bg-neutral-500 text-white flex items-center justify-center shrink-0">
                      <Settings className="size-3.5" />
                    </div>
                    <span>Sistem</span>
                  </div>
                  <span className="text-xs font-semibold">{counts.sistem}</span>
                </button>
              </div>
            </div>

            {/* Status Section matching Screenshot 1 */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <h4 className="text-xs font-bold text-neutral-900 pb-1">
                Status
              </h4>

              <div className="space-y-1">
                {/* Semua */}
                <button
                  type="button"
                  onClick={() => setSelectedStatus('Semua')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    selectedStatus === 'Semua'
                      ? 'bg-red-50/70 text-[#FF5C38] font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50 font-medium'
                  }`}
                >
                  <span>Semua</span>
                  <span className="text-xs font-semibold">{counts.all}</span>
                </button>

                {/* Belum Dibaca */}
                <button
                  type="button"
                  onClick={() => setSelectedStatus('BELUM_DIBACA')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    selectedStatus === 'BELUM_DIBACA'
                      ? 'bg-red-50/70 text-[#FF5C38] font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-[#FF5C38]" />
                    <span>Belum Dibaca</span>
                  </div>
                  <span className="text-xs font-semibold">{counts.unread}</span>
                </button>

                {/* Sudah Dibaca */}
                <button
                  type="button"
                  onClick={() => setSelectedStatus('SUDAH_DIBACA')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    selectedStatus === 'SUDAH_DIBACA'
                      ? 'bg-emerald-50 text-emerald-700 font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    <span>Sudah Dibaca</span>
                  </div>
                  <span className="text-xs font-semibold">{counts.read}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
