'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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
  Trash2,
  RefreshCw,
  Search,
  X,
  ExternalLink,
  Clock,
  Circle,
  CheckCheck,
} from 'lucide-react';
import {
  NotificationItem,
  NotificationCategory,
  NotificationStatusFilter,
  NotificationDateFilter,
} from '@/types/notifications';
import { Button } from '@/components/common/Button';
import { tenantService } from '@/services/tenant.service';
import { useToast } from '@/context/ToastContext';

function getSmartDateGroup(dateStr?: string): string {
  if (!dateStr) return 'Hari Ini';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Hari Ini';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const itemDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffTime = today.getTime() - itemDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Hari Ini';
  if (diffDays === 1) return 'Kemarin';
  if (diffDays > 1 && diffDays <= 7) return '7 Hari Terakhir';
  if (diffDays > 7 && diffDays <= 30) return 'Bulan Ini';
  return 'Sebelumnya';
}

function formatNotificationTime(dateStr?: string): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFullDateTime(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function NotificationsView() {
  const router = useRouter();
  const { toast } = useToast();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<NotificationCategory>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<NotificationStatusFilter>('Semua');
  const [dateRange, setDateRange] = useState<NotificationDateFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch live notifications from API
  const fetchNotifs = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await tenantService.getNotifications({ per_page: 100 });
      if (res?.data && Array.isArray(res.data)) {
        const mapped: NotificationItem[] = res.data.map((n: any) => ({
          id: n.id,
          title: n.title,
          subtitle: n.subtitle,
          category: (n.category || 'Sistem') as NotificationItem['category'],
          isRead: Boolean(n.is_read),
          createdAt: n.created_at,
          dateGroup: getSmartDateGroup(n.created_at),
          time: formatNotificationTime(n.created_at),
          targetUrl: n.target_url || undefined,
        }));
        setNotifications(mapped);
      }
    } catch {
      toast.error('Gagal memuat daftar notifikasi.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchNotifs();
  }, [fetchNotifs]);

  // Mark single as read
  const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await tenantService.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch {
      toast.error('Gagal memperbarui status notifikasi.');
    }
  };

  // Mark single as unread
  const handleMarkAsUnread = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await tenantService.markNotificationUnread(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: false } : n))
      );
      toast.success('Notifikasi ditandai belum dibaca.');
    } catch {
      toast.error('Gagal memperbarui status notifikasi.');
    }
  };

  // Delete single notification
  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await tenantService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notifikasi berhasil dihapus.');
    } catch {
      toast.error('Gagal menghapus notifikasi.');
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await tenantService.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('Semua notifikasi telah ditandai sebagai dibaca.');
    } catch {
      toast.error('Gagal menandai semua notifikasi.');
    }
  };

  // Clear all read notifications
  const handleClearRead = async () => {
    const hasRead = notifications.some((n) => n.isRead);
    if (!hasRead) {
      toast.info('Tidak ada notifikasi yang sudah dibaca untuk dibersihkan.');
      return;
    }

    try {
      await tenantService.clearAllNotifications(true);
      setNotifications((prev) => prev.filter((n) => !n.isRead));
      toast.success('Semua notifikasi yang sudah dibaca telah dibersihkan.');
    } catch {
      toast.error('Gagal membersihkan notifikasi.');
    }
  };

  // Click on a notification item: mark as read & navigate to targetUrl
  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await tenantService.markNotificationRead(item.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
        );
      } catch {}
    }

    if (item.targetUrl) {
      router.push(item.targetUrl);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedCategory('Semua');
    setSelectedStatus('Semua');
    setDateRange('ALL');
    setSearchQuery('');
  };

  // Summary counts
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      pesanan: notifications.filter((n) => n.category === 'Pesanan').length,
      reservasi: notifications.filter((n) => n.category === 'Reservasi').length,
      inventori: notifications.filter((n) => n.category === 'Inventori').length,
      sistem: notifications.filter((n) => n.category === 'Sistem').length,
      unread: notifications.filter((n) => !n.isRead).length,
      read: notifications.filter((n) => n.isRead).length,
    };
  }, [notifications]);

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Category filter
      if (selectedCategory !== 'Semua' && item.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'BELUM_DIBACA' && item.isRead) return false;
      if (selectedStatus === 'SUDAH_DIBACA' && !item.isRead) return false;

      // Date Range filter
      if (dateRange !== 'ALL' && item.createdAt) {
        const itemDate = new Date(item.createdAt);
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (dateRange === 'TODAY') {
          if (itemDate < todayStart) return false;
        } else if (dateRange === '7D') {
          const sevenDaysAgo = new Date(todayStart.getTime() - 7 * 86400000);
          if (itemDate < sevenDaysAgo) return false;
        } else if (dateRange === '30D') {
          const thirtyDaysAgo = new Date(todayStart.getTime() - 30 * 86400000);
          if (itemDate < thirtyDaysAgo) return false;
        } else if (dateRange === 'THIS_MONTH') {
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          if (itemDate < monthStart) return false;
        }
      }

      // Search keyword
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSub = item.subtitle.toLowerCase().includes(q);
        const matchCat = item.category.toLowerCase().includes(q);
        if (!matchTitle && !matchSub && !matchCat) return false;
      }

      return true;
    });
  }, [notifications, selectedCategory, selectedStatus, dateRange, searchQuery]);

  // Group filtered items by dynamic dateGroup
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: NotificationItem[] } = {};
    filteredNotifications.forEach((item) => {
      const groupKey = item.dateGroup || 'Hari Ini';
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(item);
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
          <div className="size-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Ticket className="size-4.5 stroke-[2.2]" />
          </div>
        );
      case 'Inventori':
        return (
          <div className="size-9 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Package className="size-4.5 stroke-[2.2]" />
          </div>
        );
      case 'Sistem':
      default:
        return (
          <div className="size-9 rounded-xl bg-neutral-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Settings className="size-4.5 stroke-[2.2]" />
          </div>
        );
    }
  };

  const isGlobalEmpty = notifications.length === 0;
  const isFilteredEmpty = filteredNotifications.length === 0 && !isGlobalEmpty;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Notifikasi
            </h1>
            {counts.unread > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-[#FF5C38] text-xs font-bold font-mono">
                {counts.unread} Belum Dibaca
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Pantau semua aktivitas operasional dan transaksi penting di outletmu.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNotifs(true)}
            disabled={isRefreshing}
            leftIcon={<RefreshCw className={`size-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            className="text-xs"
          >
            {isRefreshing ? 'Memuat...' : 'Segarkan'}
          </Button>

          {/* Mark All as Read button */}
          {counts.unread > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              leftIcon={<CheckCheck className="size-4 text-emerald-600" />}
              className="text-xs font-semibold"
            >
              Tandai Semua Dibaca
            </Button>
          )}

          {/* Clear Read notifications */}
          {counts.read > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearRead}
              leftIcon={<Trash2 className="size-3.5 text-neutral-400" />}
              className="text-xs text-neutral-600 hover:text-red-600 hover:border-red-200"
            >
              Bersihkan yang Dibaca
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-12 flex flex-col items-center justify-center min-h-[400px]">
          <RefreshCw className="size-8 text-[#FF5C38] animate-spin mb-3" />
          <p className="text-xs font-semibold text-neutral-600">Memuat data notifikasi outlet...</p>
        </div>
      ) : isGlobalEmpty ? (
        /* FULL EMPTY STATE */
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-12 sm:p-24 flex flex-col items-center justify-center text-center min-h-[480px]">
          <div className="relative mb-4">
            <div className="size-20 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-400">
              <FolderOpen className="size-10 stroke-[1.5]" />
            </div>
            <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-neutral-200 border-2 border-white" />
          </div>

          <h2 className="text-sm font-bold tracking-wider text-neutral-700 uppercase">
            BELUM ADA NOTIFIKASI
          </h2>
          <p className="text-xs text-neutral-400 max-w-md mt-1.5 leading-relaxed">
            Notifikasi aktivitas outlet akan muncul di sini saat ada pesanan baru, reservasi meja, stok bahan baku menipis, atau penutupan kasir.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNotifs(true)}
            className="mt-5 text-xs"
            leftIcon={<RefreshCw className="size-3.5" />}
          >
            Periksa Notifikasi Baru
          </Button>
        </div>
      ) : (
        /* POPULATED 2-COLUMN LAYOUT */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Notifications List (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Search Input Bar */}
            <div className="relative">
              <Search className="size-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Cari notifikasi berdasarkan judul, rincian, atau nomor pesanan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-neutral-200 bg-white text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-[#FF5C38] shadow-2xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5 rounded cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Notifications Card Container */}
            <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 sm:p-6 space-y-6">
              {isFilteredEmpty ? (
                <div className="py-16 text-center space-y-3">
                  <div className="size-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto">
                    <Filter className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-neutral-800">
                      Tidak ada notifikasi dalam filter ini
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Coba ganti kategori, status, rentang tanggal, atau kata kunci pencarian.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={handleResetFilters}
                    className="text-xs"
                  >
                    Reset Semua Filter
                  </Button>
                </div>
              ) : (
                Object.entries(groupedNotifications).map(([groupTitle, items]) => (
                  <div key={groupTitle} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-neutral-100 pb-2">
                      <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                        {groupTitle}
                      </h3>
                      <span className="text-[11px] text-neutral-400 font-medium">
                        {items.length} notifikasi
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className={`group relative flex items-start justify-between gap-3.5 p-3.5 rounded-xl border transition-all cursor-pointer ${
                            item.isRead
                              ? 'bg-white border-transparent hover:bg-neutral-50/90 hover:border-neutral-200'
                              : 'bg-orange-50/30 border-orange-200/60 hover:bg-orange-50/60'
                          }`}
                        >
                          <div className="flex items-start gap-3.5 min-w-0 flex-1">
                            {/* Unread Indicator */}
                            <div className="pt-2 flex justify-center shrink-0">
                              {!item.isRead ? (
                                <span className="size-2 rounded-full bg-[#FF5C38] shrink-0 animate-pulse" />
                              ) : (
                                <span className="size-2 rounded-full bg-transparent shrink-0" />
                              )}
                            </div>

                            {/* Category Icon */}
                            {renderCategoryIcon(item.category)}

                            {/* Content Details */}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-600 uppercase tracking-wider">
                                  {item.category}
                                </span>
                                {item.createdAt && (
                                  <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                                    <Clock className="size-3" />
                                    <span>{formatFullDateTime(item.createdAt)}</span>
                                  </span>
                                )}
                              </div>

                              <p
                                className={`text-xs leading-snug ${
                                  item.isRead
                                    ? 'font-semibold text-neutral-800'
                                    : 'font-bold text-neutral-900'
                                }`}
                              >
                                {item.title}
                              </p>

                              <p className="text-[11.5px] text-neutral-500 leading-relaxed">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>

                          {/* Right: Actions on Hover & Time */}
                          <div className="flex items-center gap-2 shrink-0 pt-1">
                            {/* Actions toolbar */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mr-1">
                              {/* Toggle Read/Unread */}
                              {item.isRead ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleMarkAsUnread(item.id, e)}
                                  className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors"
                                  title="Tandai belum dibaca"
                                >
                                  <Circle className="size-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => handleMarkAsRead(item.id, e)}
                                  className="p-1 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                                  title="Tandai sudah dibaca"
                                >
                                  <Check className="size-3.5" />
                                </button>
                              )}

                              {/* Delete button */}
                              <button
                                type="button"
                                onClick={(e) => handleDelete(item.id, e)}
                                className="p-1 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Hapus notifikasi"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>

                            {/* Navigation cue */}
                            {item.targetUrl && (
                              <span className="text-[10px] text-neutral-400 group-hover:text-[#FF5C38] flex items-center gap-1 font-medium transition-colors">
                                <span className="hidden sm:inline">Buka</span>
                                <ExternalLink className="size-3" />
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Filters Sidebar (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 space-y-5 sticky top-24">
            {/* Date filter dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-neutral-900 flex items-center gap-2">
                <Calendar className="size-3.5 text-neutral-500" />
                <span>Rentang Waktu</span>
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as NotificationDateFilter)}
                className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-800 bg-white focus:outline-none focus:border-[#FF5C38] cursor-pointer"
              >
                <option value="ALL">Semua Waktu</option>
                <option value="TODAY">Hari Ini</option>
                <option value="7D">7 Hari Terakhir</option>
                <option value="30D">30 Hari Terakhir</option>
                <option value="THIS_MONTH">Bulan Ini</option>
              </select>
            </div>

            {/* Kategori Section */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-900">
                  Kategori
                </h4>
                {selectedCategory !== 'Semua' && (
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('Semua')}
                    className="text-[11px] text-[#FF5C38] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {/* Semua */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Semua')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    selectedCategory === 'Semua'
                      ? 'bg-orange-50 text-[#FF5C38] font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-6 rounded-lg bg-[#FF5C38] text-white flex items-center justify-center shrink-0">
                      <FileText className="size-3.5" />
                    </div>
                    <span>Semua Kategori</span>
                  </div>
                  <span className="text-xs font-semibold">{counts.all}</span>
                </button>

                {/* Pesanan */}
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Pesanan')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    selectedCategory === 'Pesanan'
                      ? 'bg-blue-50 text-blue-600 font-bold'
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
                      ? 'bg-amber-50 text-amber-600 font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-6 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
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
                      ? 'bg-purple-50 text-purple-600 font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="size-6 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0">
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
                    <div className="size-6 rounded-lg bg-neutral-600 text-white flex items-center justify-center shrink-0">
                      <Settings className="size-3.5" />
                    </div>
                    <span>Sistem</span>
                  </div>
                  <span className="text-xs font-semibold">{counts.sistem}</span>
                </button>
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-2 pt-2 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-neutral-900">
                  Status
                </h4>
                {selectedStatus !== 'Semua' && (
                  <button
                    type="button"
                    onClick={() => setSelectedStatus('Semua')}
                    className="text-[11px] text-[#FF5C38] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {/* Semua */}
                <button
                  type="button"
                  onClick={() => setSelectedStatus('Semua')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    selectedStatus === 'Semua'
                      ? 'bg-orange-50 text-[#FF5C38] font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50 font-medium'
                  }`}
                >
                  <span>Semua Status</span>
                  <span className="text-xs font-semibold">{counts.all}</span>
                </button>

                {/* Belum Dibaca */}
                <button
                  type="button"
                  onClick={() => setSelectedStatus('BELUM_DIBACA')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    selectedStatus === 'BELUM_DIBACA'
                      ? 'bg-red-50 text-[#FF5C38] font-bold'
                      : 'text-neutral-700 hover:bg-neutral-50 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="size-2 rounded-full bg-[#FF5C38]" />
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
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>Sudah Dibaca</span>
                  </div>
                  <span className="text-xs font-semibold">{counts.read}</span>
                </button>
              </div>
            </div>

            {/* Quick Status Box */}
            <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1">
              <p className="text-[11px] font-semibold text-neutral-700 flex items-center gap-1.5">
                <Bell className="size-3 text-[#FF5C38]" />
                <span>Tips Notifikasi</span>
              </p>
              <p className="text-[10.5px] text-neutral-500 leading-relaxed">
                Klik notifikasi untuk membuka halaman transaksi terkait (pesanan, reservasi, atau inventori).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
