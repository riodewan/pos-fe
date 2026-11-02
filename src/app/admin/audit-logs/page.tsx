'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Search,
  Filter,
  Eye,
  ShieldCheck,
  User,
  Building2,
  Calendar,
  X,
  Clock,
  Layers,
} from 'lucide-react';
import { adminService } from '@/services/admin.service';
import { Button } from '@/components/common/Button';
import { PageLoader } from '@/components/common/PageLoader';
import { Pagination, DEFAULT_PAGE_SIZE_OPTIONS } from '@/components/common';
import { useToast } from '@/context/ToastContext';

export default function AdminAuditLogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_OPTIONS[0]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Detail Modal
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getAuditLogs({
        search: search.trim() || undefined,
        action: actionFilter || undefined,
        page: currentPage,
        per_page: pageSize,
      });

      if (res?.data) {
        setLogs(res.data.data || []);
        setCurrentPage(res.data.current_page || 1);
        setTotalPages(res.data.last_page || 1);
        setTotalItems(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load global audit logs:', err);
      toast.error('Gagal memuat log audit platform.');
    } finally {
      setLoading(false);
    }
  }, [search, actionFilter, currentPage, pageSize, toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadge = (action: string) => {
    const act = (action || '').toUpperCase();
    if (act.includes('LOGIN') || act.includes('LOGOUT')) {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
    if (act.includes('CREATE') || act.includes('STORE')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
    if (act.includes('DELETE') || act.includes('DESTROY')) {
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
    return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <FileText className="size-6 text-[#FF5C38]" />
          <span>Log Audit & Keamanan Global</span>
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Pantau seluruh jejak aktivitas pengguna, perubahan data, dan keamanan login di seluruh platform multi-tenant.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#141414] border border-neutral-800/90 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="size-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari user, tenant, modul, atau alamat IP..."
            className="w-full bg-[#1A1A1A] border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF5C38]"
          />
        </div>

        {/* Action Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { value: '', label: 'Semua Aksi' },
            { value: 'LOGIN', label: 'Login' },
            { value: 'LOGOUT', label: 'Logout' },
            { value: 'CREATE', label: 'Create' },
            { value: 'UPDATE', label: 'Update' },
            { value: 'DELETE', label: 'Delete' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setActionFilter(tab.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                actionFilter === tab.value
                  ? 'bg-[#FF5C38] text-white'
                  : 'bg-neutral-800/60 text-neutral-400 hover:text-white hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#141414] rounded-2xl border border-neutral-800/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400 text-xs">
            Memuat catatan log audit...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-xs space-y-2">
            <FileText className="size-10 text-neutral-700 mx-auto" />
            <p className="font-bold text-neutral-300">Belum ada catatan log audit.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900/60 text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-4">Pengguna</th>
                  <th className="py-3 px-4">Tenant Bisnis</th>
                  <th className="py-3 px-4">Tipe Aksi</th>
                  <th className="py-3 px-4">Modul / Entitas</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-neutral-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{log.user?.name || 'Sistem'}</p>
                      <p className="text-[10px] text-neutral-500 font-mono">{log.user?.email || '-'}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-neutral-200">
                        {log.tenant?.name || 'Platform Global'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300">
                      <span className="font-mono text-[11px]">{log.module || '-'}</span>
                      {log.entity_type && (
                        <span className="text-[10px] text-neutral-500 block">
                          {log.entity_type} #{log.entity_id ? log.entity_id.slice(-6) : ''}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-400">
                      {log.ip_address || '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1.5 rounded-lg border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-[11px] font-bold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="size-3.5" />
                        <span>Rincian</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-900/30">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Detail Log Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-[#171717] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-neutral-800 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="size-5 text-[#FF5C38]" />
                Rincian Log Audit
              </h3>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-400">ID Log:</span>
                  <span className="font-mono text-white">{selectedLog.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Waktu:</span>
                  <span className="text-white">
                    {new Date(selectedLog.created_at).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Aksi:</span>
                  <span className="font-bold text-[#FF5C38]">{selectedLog.action}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Pengguna:</span>
                  <span className="text-white">{selectedLog.user?.name || 'Sistem'} ({selectedLog.user?.email || '-'})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Tenant:</span>
                  <span className="text-white">{selectedLog.tenant?.name || 'Platform Global'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">IP Address:</span>
                  <span className="font-mono text-white">{selectedLog.ip_address || '-'}</span>
                </div>
                {selectedLog.user_agent && (
                  <div className="pt-2 border-t border-neutral-800 text-[10.5px] text-neutral-400 break-all">
                    <span className="font-bold text-neutral-300 block mb-0.5">User Agent:</span>
                    {selectedLog.user_agent}
                  </div>
                )}
              </div>

              {selectedLog.old_values && (
                <div>
                  <p className="font-bold text-neutral-300 mb-1">Nilai Sebelum (Old Values):</p>
                  <pre className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 overflow-x-auto">
                    {JSON.stringify(selectedLog.old_values, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.new_values && (
                <div>
                  <p className="font-bold text-neutral-300 mb-1">Nilai Sesudah (New Values):</p>
                  <pre className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-300 overflow-x-auto">
                    {JSON.stringify(selectedLog.new_values, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-neutral-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="border-neutral-700 text-neutral-300 text-xs"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
