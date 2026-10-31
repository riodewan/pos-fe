'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Smartphone,
  Laptop,
  Globe,
  Clock,
  Loader2,
} from 'lucide-react';
import { LoginActivity } from '@/types/staff';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { SearchInput } from '@/components/common/SearchInput';
import { authService } from '@/services/auth.service';

export function LoginActivityTab() {
  const [logs, setLogs] = useState<LoginActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await authService.getLoginActivities();
      if (Array.isArray(res?.data)) {
        const mapped: LoginActivity[] = res.data.map((item: any) => ({
          id: item.id || `act-${Math.random()}`,
          staffName: item.user?.name || item.name || 'Admin',
          role: 'Manager',
          email: item.user?.email || item.email || 'user@example.com',
          device: item.device || item.user_agent || 'Chrome on Windows',
          ipAddress: item.ip_address || '127.0.0.1',
          timestamp: item.logged_at
            ? new Date(item.logged_at).toLocaleString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'Baru saja',
          status: item.status === 'FAILED' ? 'Gagal' : 'Berhasil',
        }));
        setLogs(mapped);
      }
    } catch (err) {
      console.error('Error fetching login activities:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const q = search.toLowerCase().trim();
      return (
        !q ||
        l.staffName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.ipAddress.toLowerCase().includes(q) ||
        l.device.toLowerCase().includes(q)
      );
    });
  }, [logs, search]);

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  const columns: ColumnDef<LoginActivity>[] = [
    {
      key: 'staffName',
      header: 'Nama Staf',
      className: 'w-[25%]',
      render: (item) => (
        <div className="py-1">
          <p className="font-bold text-neutral-900 text-xs">{item.staffName}</p>
          <p className="text-[11px] text-neutral-400 mt-0.5">{item.email}</p>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Peran',
      className: 'w-[15%]',
      render: (item) => (
        <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold border bg-neutral-50 text-neutral-700 border-neutral-200">
          {item.role}
        </span>
      ),
    },
    {
      key: 'device',
      header: 'Perangkat & Browser',
      className: 'w-[30%]',
      render: (item) => (
        <div className="flex items-center gap-2 py-1">
          <Laptop className="size-4 text-neutral-400 shrink-0" />
          <span className="text-xs text-neutral-700 truncate">{item.device}</span>
        </div>
      ),
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      className: 'w-[15%]',
      render: (item) => (
        <span className="font-mono text-xs text-neutral-600">{item.ipAddress}</span>
      ),
    },
    {
      key: 'timestamp',
      header: 'Waktu Login',
      className: 'w-[15%]',
      render: (item) => (
        <span className="text-xs text-neutral-600">{item.timestamp}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'right',
      className: 'w-[10%]',
      render: (item) => (
        item.status === 'Berhasil' ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="size-3 text-emerald-600" />
            Berhasil
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
            <XCircle className="size-3 text-rose-600" />
            Gagal
          </span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          Mencatat 20 sesi login terakhir demi keamanan akun dan audit outlet.
        </p>

        <div className="w-72">
          <SearchInput
            size="sm"
            placeholder="Cari sesi login staf..."
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
      </div>

      <DataTable<LoginActivity>
        columns={columns}
        data={paginatedLogs}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        showPagination={filteredLogs.length > 0}
        currentPage={currentPage}
        totalItems={filteredLogs.length}
        pageSize={pageSize}
        pageSizeOptions={[10, 20]}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        emptyTitle="TIDAK ADA AKTIVITAS LOGIN"
        emptyDescription="Belum ada catatan aktivitas login staf pada periode ini."
        entityName="aktivitas"
      />
    </div>
  );
}
