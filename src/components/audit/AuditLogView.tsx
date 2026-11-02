'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  History,
  LogIn,
  LogOut,
  Laptop,
  Smartphone,
  Globe,
  Clock,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Eye,
  ShieldAlert,
  Users,
  Activity,
  Layers,
} from 'lucide-react';
import { systemService, AuditLog } from '@/services/system.service';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { SearchInput } from '@/components/common/SearchInput';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { PageLoader, CircularLoader } from '@/components/common/PageLoader';
import { AuditDetailModal } from './AuditDetailModal';

interface AuditLogViewProps {
  isEmbedded?: boolean;
}

export function AuditLogView({ isEmbedded = false }: AuditLogViewProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Selected Log for detail modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Parse User Agent
  const parseUA = useCallback((ua?: string | null) => {
    if (!ua) return { browser: 'Browser', os: 'Desktop', isMobile: false };
    let browser = 'Browser';
    if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
    else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
    else if (/edg/i.test(ua)) browser = 'Edge';
    else if (/opr\//i.test(ua)) browser = 'Opera';

    let os = 'OS';
    const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
    if (/windows/i.test(ua)) os = 'Windows';
    else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
    else if (/android/i.test(ua)) os = 'Android';
    else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
    else if (/linux/i.test(ua)) os = 'Linux';

    return { browser, os, isMobile };
  }, []);

  // Format relative timestamp
  const formatTime = useCallback((timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      let relative = 'Baru saja';
      if (diffMinutes >= 1 && diffMinutes < 60) {
        relative = `${diffMinutes} menit lalu`;
      } else if (diffHours >= 1 && diffHours < 24) {
        relative = `${diffHours} jam lalu`;
      } else if (diffDays >= 1 && diffDays <= 7) {
        relative = `${diffDays} hari lalu`;
      }

      const formatted = date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      return { formatted, relative };
    } catch {
      return { formatted: timestamp, relative: '' };
    }
  }, []);

  // Fetch real audit logs from systemService
  const fetchAuditLogs = useCallback(
    async (isBackground = false) => {
      try {
        if (!isBackground) setIsLoading(true);
        else setIsRefreshing(true);

        const params: any = {
          page: currentPage,
          per_page: pageSize,
        };

        if (actionFilter !== 'ALL') {
          params.action = actionFilter;
        }

        if (search.trim()) {
          params.search = search.trim();
        }

        if (dateRangeFilter === 'TODAY') {
          const today = new Date().toISOString().split('T')[0];
          params.start_date = today;
          params.end_date = today;
        } else if (dateRangeFilter === '7D') {
          const past = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
          params.start_date = past;
        } else if (dateRangeFilter === '30D') {
          const past = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0];
          params.start_date = past;
        }

        const res = await systemService.getAuditLogs(params);
        if (res && res.data) {
          setLogs(res.data);
          if (res.pagination) {
            setTotalItems(res.pagination.total);
          } else {
            setTotalItems(res.data.length);
          }
        }
      } catch (err) {
        console.error('Error fetching system audit logs:', err);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentPage, pageSize, actionFilter, search, dateRangeFilter]
  );

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  // Client-side role filtering if applied
  const filteredLogs = useMemo(() => {
    if (roleFilter === 'ALL') return logs;
    return logs.filter((log) => {
      const userRole = (
        log.user?.user_roles?.[0]?.role?.name || ''
      ).toLowerCase();
      return userRole.includes(roleFilter.toLowerCase());
    });
  }, [logs, roleFilter]);

  // Role badge helper
  const renderRoleBadge = (roleName?: string) => {
    const norm = (roleName || '').toLowerCase();
    switch (norm) {
      case 'owner':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold border bg-rose-50 text-rose-700 border-rose-200">
            Owner
          </span>
        );
      case 'manager':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold border bg-blue-50 text-blue-700 border-blue-200">
            Manager
          </span>
        );
      case 'kasir':
      case 'cashier':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold border bg-purple-50 text-purple-700 border-purple-200">
            Kasir
          </span>
        );
      case 'inventory':
      case 'gudang':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
            Inventori
          </span>
        );
      case 'dapur':
      case 'kitchen':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold border bg-orange-50 text-orange-700 border-orange-200">
            Dapur
          </span>
        );
      case 'super admin':
      case 'super_admin':
      case 'admin internal':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold border bg-indigo-50 text-indigo-700 border-indigo-200">
            Admin Internal
          </span>
        );
      default:
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold border bg-neutral-100 text-neutral-700 border-neutral-200">
            {roleName || 'Staf'}
          </span>
        );
    }
  };

  // Quick stats calculation
  const stats = useMemo(() => {
    const total = totalItems || logs.length;
    let loginCount = 0;
    let logoutCount = 0;
    const uniqueUsers = new Set<string>();

    logs.forEach((item) => {
      if (item.action === 'LOGIN') loginCount++;
      if (item.action === 'LOGOUT') logoutCount++;
      if (item.user_id) uniqueUsers.add(item.user_id);
    });

    return {
      total,
      loginCount,
      logoutCount,
      uniqueStaff: uniqueUsers.size,
    };
  }, [totalItems, logs]);

  // Columns definition
  const columns: ColumnDef<AuditLog>[] = [
    {
      key: 'user',
      header: 'Staf & Akun',
      className: 'w-[25%]',
      render: (item) => {
        const name = item.user?.name || 'Sistem / Tidak Diketahui';
        const email = item.user?.email || '-';
        const words = name.trim().split(/\s+/);
        const initials =
          words.length >= 2
            ? `${words[0][0]}${words[1][0]}`.toUpperCase()
            : name.slice(0, 2).toUpperCase();

        return (
          <div className="flex items-center gap-2.5 py-1">
            <div className="size-8 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-bold text-neutral-700 shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-neutral-900 text-xs truncate">
                {name}
              </p>
              <p className="text-[11px] text-neutral-400 truncate">{email}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: 'role',
      header: 'Peran',
      className: 'w-[12%]',
      render: (item) => {
        const role = item.user?.user_roles?.[0]?.role?.name || 'Staf';
        return renderRoleBadge(role);
      },
    },
    {
      key: 'action',
      header: 'Aksi',
      className: 'w-[14%]',
      render: (item) => {
        const isLogin = item.action === 'LOGIN';
        return isLogin ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <LogIn className="size-3 text-emerald-600" />
            LOGIN
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-neutral-700 border border-neutral-200">
            <LogOut className="size-3 text-neutral-500" />
            LOGOUT
          </span>
        );
      },
    },
    {
      key: 'device',
      header: 'Perangkat & Jaringan',
      className: 'w-[25%]',
      render: (item) => {
        const { browser, os, isMobile } = parseUA(item.user_agent);
        return (
          <div className="space-y-0.5 py-1">
            <div className="flex items-center gap-1.5 text-xs text-neutral-800 font-medium">
              {isMobile ? (
                <Smartphone className="size-3.5 text-neutral-400 shrink-0" />
              ) : (
                <Laptop className="size-3.5 text-neutral-400 shrink-0" />
              )}
              <span className="truncate">
                {browser} • {os}
              </span>
            </div>
            <p className="font-mono text-[11px] text-neutral-500">
              IP: {item.ip_address || '127.0.0.1'}
            </p>
          </div>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Waktu Aktivitas',
      className: 'w-[18%]',
      render: (item) => {
        const { formatted, relative } = formatTime(item.created_at);
        return (
          <div className="space-y-0.5 py-1">
            <div className="flex items-center gap-1.5 text-xs text-neutral-800">
              <Clock className="size-3 text-neutral-400" />
              <span>{formatted}</span>
            </div>
            {relative && (
              <p className="text-[11px] text-neutral-400">{relative}</p>
            )}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      className: 'w-[6%]',
      render: (item) => (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLog(item);
          }}
          className="text-xs px-2.5 py-1 h-7 text-neutral-600 hover:text-neutral-900 border-neutral-200"
          leftIcon={<Eye className="size-3 text-neutral-400" />}
        >
          Detail
        </Button>
      ),
    },
  ];

  if (isLoading && logs.length === 0) {
    return (
      <PageLoader
        text="Memuat log audit sistem..."
        subtext="Memuat riwayat aktivitas sistem..."
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header (Only displayed if not embedded) */}
      {!isEmbedded && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <History className="size-5 text-[#FF5C38]" />
              Log Audit Sistem
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Rekam jejak riwayat aktivitas autentikasi, akses, dan operasional
              staf demi integritas data & keamanan outlet.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAuditLogs(true)}
              disabled={isRefreshing}
              className="text-xs font-semibold px-3 py-1.5 border-neutral-200"
              leftIcon={
                <RefreshCw
                  className={`size-3.5 text-neutral-500 ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
              }
            >
              {isRefreshing ? 'Menyinkronkan...' : 'Refresh'}
            </Button>
          </div>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
              Total Log
            </span>
            <Activity className="size-4 text-neutral-400" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">
            {stats.total.toLocaleString('id-ID')}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Riwayat log sistem tercatat
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600">
              Sesi Login
            </span>
            <LogIn className="size-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 tracking-tight">
            {stats.loginCount}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Aktivitas masuk pengguna
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
              Sesi Logout
            </span>
            <LogOut className="size-4 text-neutral-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-800 tracking-tight">
            {stats.logoutCount}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Aktivitas keluar pengguna
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600">
              Staf Terlibat
            </span>
            <Users className="size-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-neutral-900 tracking-tight">
            {stats.uniqueStaff}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Akun unik beraktivitas
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-neutral-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="w-full md:w-80">
          <SearchInput
            size="sm"
            placeholder="Cari staf, email, atau IP..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            onClear={() => {
              setSearch('');
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Action Filter */}
          <div className="w-36">
            <Select
              size="sm"
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'ALL', label: 'Semua Aksi' },
                { value: 'LOGIN', label: 'Login Saja' },
                { value: 'LOGOUT', label: 'Logout Saja' },
              ]}
            />
          </div>

          {/* Role Filter */}
          <div className="w-36">
            <Select
              size="sm"
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'ALL', label: 'Semua Peran' },
                { value: 'Owner', label: 'Owner' },
                { value: 'Manager', label: 'Manager' },
                { value: 'Kasir', label: 'Kasir' },
                { value: 'Inventory', label: 'Inventori' },
                { value: 'Dapur', label: 'Dapur' },
                { value: 'Admin Internal', label: 'Admin Internal' },
              ]}
            />
          </div>

          {/* Period Filter */}
          <div className="w-40">
            <Select
              size="sm"
              value={dateRangeFilter}
              onChange={(e) => {
                setDateRangeFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'ALL', label: 'Semua Waktu' },
                { value: 'TODAY', label: 'Hari Ini' },
                { value: '7D', label: '7 Hari Terakhir' },
                { value: '30D', label: '30 Hari Terakhir' },
              ]}
            />
          </div>

          {isEmbedded && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAuditLogs(true)}
              disabled={isRefreshing}
              className="text-xs font-semibold px-2.5 h-8 border-neutral-200"
              title="Refresh Log"
            >
              <RefreshCw
                className={`size-3.5 text-neutral-500 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
            </Button>
          )}
        </div>
      </div>

      {/* Main Table */}
      <DataTable<AuditLog>
        columns={columns}
        data={filteredLogs}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => setSelectedLog(item)}
        showPagination={totalItems > 0}
        currentPage={currentPage}
        totalItems={totalItems}
        pageSize={pageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        emptyTitle="TIDAK ADA LOG AUDIT DITEMUKAN"
        emptyDescription="Belum ada riwayat aktivitas yang sesuai dengan filter pencarian yang diterapkan."
        entityName="log audit"
      />

      {/* Detail Modal */}
      <AuditDetailModal
        log={selectedLog}
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
}

