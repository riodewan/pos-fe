'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle,
  XCircle,
  Search,
  Check,
  X,
  Building2,
  Store,
  AlertCircle,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { adminService, PlatformApprovalItem } from '@/services/admin.service';
import { Button } from '@/components/common/Button';
import { Pagination, DEFAULT_PAGE_SIZE_OPTIONS } from '@/components/common';
import { useToast } from '@/context/ToastContext';

export default function AdminApprovalsPage() {
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<PlatformApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE_OPTIONS[0]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Action Modal State
  const [activeApproval, setActiveApproval] = useState<PlatformApprovalItem | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchApprovals = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getApprovals({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        search: search.trim() || undefined,
        page: currentPage,
        per_page: pageSize,
      });

      if (res?.data) {
        setApprovals(res.data.data || []);
        setCurrentPage(res.data.current_page || 1);
        setTotalPages(res.data.last_page || 1);
        setTotalItems(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load approvals:', err);
      toast.error('Gagal memuat daftar approval.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, search, currentPage, pageSize, toast]);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleOpenActionModal = (item: PlatformApprovalItem, action: 'APPROVE' | 'REJECT') => {
    setActiveApproval(item);
    setActionType(action);
    setReviewNote(action === 'APPROVE' ? 'Disetujui oleh Administrator Platform.' : '');
  };

  const handleExecuteAction = async () => {
    if (!activeApproval || !actionType) return;
    try {
      setIsSubmitting(true);
      await adminService.actionApproval(activeApproval.id, actionType, reviewNote.trim());
      toast.success(
        actionType === 'APPROVE'
          ? 'Pengajuan berhasil disetujui!'
          : 'Pengajuan telah ditolak.'
      );
      setActiveApproval(null);
      setActionType(null);
      fetchApprovals();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gagal memproses aksi approval.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'KYB_VERIFICATION':
      case 'TENANT_REGISTRATION':
        return <Building2 className="size-4 text-blue-600" />;
      case 'STORE_CREATION':
      case 'OUTLET_ADDITION':
        return <Store className="size-4 text-[#FF5C38]" />;
      default:
        return <FileText className="size-4 text-neutral-500" />;
    }
  };

  const renderPayloadValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return <span className="text-neutral-400 italic">-</span>;
    }
    if (typeof value === 'object' && value.url) {
      return (
        <a
          href={value.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#FF5C38] hover:underline font-semibold"
        >
          <span className="truncate max-w-[180px]">{value.name || 'Lihat Dokumen'}</span>
          <ExternalLink className="size-3 shrink-0" />
        </a>
      );
    }
    if (typeof value === 'object') {
      return <span className="font-mono text-[10.5px]">{JSON.stringify(value)}</span>;
    }
    return <span>{String(value)}</span>;
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
          <CheckCircle className="size-6 text-[#FF5C38]" />
          <span>Pusat Persetujuan & Approval</span>
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Tinjau pengajuan registrasi merchant (KYB) dan pembukaan cabang baru dari mitra toko.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="size-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama toko, cabang, atau PIC..."
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-[#FF5C38] transition-colors"
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { value: '', label: 'Semua Tipe' },
            { value: 'KYB_VERIFICATION', label: 'KYB Merchant' },
            { value: 'STORE_CREATION', label: 'Cabang Baru' },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setTypeFilter(t.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                typeFilter === t.value
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-white text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 border-neutral-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 md:border-l md:border-neutral-200 md:pl-3">
          {[
            { value: 'PENDING', label: 'Menunggu' },
            { value: 'APPROVED', label: 'Disetujui' },
            { value: 'REJECTED', label: 'Ditolak' },
            { value: '', label: 'Semua' },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setStatusFilter(tab.value);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === tab.value
                  ? 'bg-[#FF5C38] text-white shadow-2xs'
                  : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Approval List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-neutral-500 text-xs bg-white rounded-2xl border border-neutral-200/80 shadow-2xs">
            Memuat daftar approval...
          </div>
        ) : approvals.length === 0 ? (
          <div className="p-12 text-center text-neutral-500 text-xs bg-white rounded-2xl border border-neutral-200/80 shadow-2xs space-y-2">
            <CheckCircle className="size-10 text-neutral-300 mx-auto" />
            <p className="font-bold text-neutral-700">Tidak ada pengajuan dalam status ini.</p>
            <p>Semua permohonan merchant telah selesai ditinjau.</p>
          </div>
        ) : (
          approvals.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-2xs space-y-3.5"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-neutral-100 border border-neutral-200/60 flex items-center justify-center shrink-0">
                    {getTypeIcon(item.type)}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">{item.title}</h3>
                    <p className="text-[11px] text-neutral-500 mt-0.5">
                      Tenant:{' '}
                      <span className="font-semibold text-neutral-800">
                        {item.tenant?.name || 'Sistem'}
                      </span>{' '}
                      ({item.tenant?.email || '-'})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      item.status === 'PENDING'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : item.status === 'APPROVED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                    }`}
                  >
                    {item.status === 'PENDING'
                      ? 'Menunggu Review'
                      : item.status === 'APPROVED'
                      ? 'Telah Disetujui'
                      : 'Ditolak'}
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    {new Date(item.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-neutral-600 leading-relaxed">{item.description}</p>

              {/* Payload Data details (if any) */}
              {item.payload && Object.keys(item.payload).length > 0 && (
                <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200/70 text-xs">
                  <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2.5">
                    Rincian Parameter & Dokumen Pengajuan:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-neutral-700">
                    {Object.entries(item.payload).map(([k, v]) => (
                      <div
                        key={k}
                        className="p-2.5 rounded-lg bg-white border border-neutral-200/70"
                      >
                        <span className="text-[10px] text-neutral-400 block font-mono uppercase">
                          {k.replace(/_/g, ' ')}
                        </span>
                        <div className="font-bold text-neutral-900 text-[11px] truncate mt-0.5">
                          {renderPayloadValue(v)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Review notes (if reviewed) */}
              {item.reviewed_at && (
                <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs text-neutral-600 flex items-start gap-2">
                  <AlertCircle className="size-4 text-neutral-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-800">
                      Catatan Review ({item.reviewer?.name || 'Admin'}):
                    </span>{' '}
                    <span>{item.review_notes || 'Tidak ada catatan.'}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons for PENDING */}
              {item.status === 'PENDING' && (
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenActionModal(item, 'REJECT')}
                    className="border-red-200 bg-red-50/50 text-red-600 hover:bg-red-100 text-xs cursor-pointer"
                  >
                    <X className="size-3.5 mr-1" />
                    Tolak Pengajuan
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleOpenActionModal(item, 'APPROVE')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs cursor-pointer px-4 font-bold"
                  >
                    <Check className="size-3.5 mr-1" />
                    Setujui Pengajuan
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Standardized Pagination */}
      <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-2xs">
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

      {/* Action Modal (Approve / Reject) */}
      {activeApproval && actionType && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-neutral-200 text-neutral-900">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                {actionType === 'APPROVE' ? (
                  <>
                    <CheckCircle className="size-5 text-emerald-600" />
                    Setujui Pengajuan
                  </>
                ) : (
                  <>
                    <XCircle className="size-5 text-red-600" />
                    Tolak Pengajuan
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActiveApproval(null);
                  setActionType(null);
                }}
                className="text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="size-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600">
              Anda akan {actionType === 'APPROVE' ? 'menyetujui' : 'menolak'} pengajuan:{' '}
              <span className="font-bold text-neutral-900">{activeApproval.title}</span>
            </p>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Catatan Review untuk Merchant
              </label>
              <textarea
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder={
                  actionType === 'APPROVE'
                    ? 'Catatan persetujuan (opsional)...'
                    : 'Jelaskan alasan penolakan secara jelas...'
                }
                className="w-full bg-white border border-neutral-200 rounded-xl p-3 text-xs text-neutral-900 focus:outline-none focus:border-[#FF5C38] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setActiveApproval(null);
                  setActionType(null);
                }}
                className="border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                disabled={isSubmitting || (actionType === 'REJECT' && !reviewNote.trim())}
                onClick={handleExecuteAction}
                className={`text-xs px-4 font-bold ${
                  actionType === 'APPROVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                {isSubmitting
                  ? 'Memproses...'
                  : actionType === 'APPROVE'
                  ? 'Konfirmasi Setujui'
                  : 'Konfirmasi Tolak'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
