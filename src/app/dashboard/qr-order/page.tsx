'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Download,
  Copy,
  Check,
  Share2,
  Plus,
  MoreVertical,
  QrCode,
  CheckCircle2,
  Bookmark,
  Info,
  RefreshCw,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import {
  DataTable,
  ColumnDef,
  StatusBadge,
  EmptyState,
  Button,
  SearchInput,
  Switch,
  Select,
  Pagination,
  Card,
  Drawer,
  Modal,
  Input,
  RadioGroup,
  TableRowSkeleton,
  PageLoader,
} from '@/components/common';
import { formatRupiah } from '@/utils';
import { posService } from '@/services/pos.service';
import { useToast } from '@/context/ToastContext';
import { DiningTable } from '@/types';

interface TableQrItem {
  id: string;
  tableNumber: number;
  tableName: string;
  tableCode: string;
  area: 'Indoor' | 'Outdoor' | 'VIP';
  token: string;
  url: string;
  status: 'Aktif' | 'Nonaktif';
}

interface DisposableQrItem {
  id: string;
  name: string;
  url: string;
  createdAt: string;
  expiredAt: string;
  status: 'Aktif' | 'Selesai';
}

export default function QrOrderPage() {
  const { toast } = useToast();
  const [windowOrigin, setWindowOrigin] = useState('');
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [isRotatingId, setIsRotatingId] = useState<string | null>(null);

  // Master QR State
  const [isMasterQrActive, setIsMasterQrActive] = useState(true);

  // Table QR State
  const [tableSearch, setTableSearch] = useState('');
  const [tableAreaFilter, setTableAreaFilter] = useState('all');
  const [tableStatusFilter, setTableStatusFilter] = useState('all');
  const [selectedTableQrIds, setSelectedTableQrIds] = useState<string[]>([]);
  const [activeMenuTableId, setActiveMenuTableId] = useState<string | null>(null);

  // Disposable QR State
  const [disposableQrs, setDisposableQrs] = useState<DisposableQrItem[]>([]);
  const [dispSearch, setDispSearch] = useState('');
  const [dispStatusFilter, setDispStatusFilter] = useState('all');
  const [selectedDispIds, setSelectedDispIds] = useState<string[]>([]);

  // Modal / Drawer state for creating Disposable QR
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [formEventName, setFormEventName] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('15/10/2026');
  const [formUsageLimit, setFormUsageLimit] = useState<'single' | 'unlimited'>('single');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Settings State
  const [showLogoOnMenu, setShowLogoOnMenu] = useState(true);
  const [requireCustomerName, setRequireCustomerName] = useState(true);
  const [enableQrisPayment, setEnableQrisPayment] = useState(true);

  // Copy Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowOrigin(window.location.origin);
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    if (!text) return;
    navigator.clipboard?.writeText(text);
    showToast('Tautan berhasil disalin ke clipboard!');
  };

  // Fetch real tables from backend
  const loadTables = useCallback(async () => {
    setIsLoadingTables(true);
    try {
      const res = await posService.getTables();
      const data = Array.isArray(res?.data) ? res.data : [];
      setTables(data);
    } catch (err) {
      console.error('Failed to load tables:', err);
      showToast('Gagal memuat daftar meja dari server.');
    } finally {
      setIsLoadingTables(false);
    }
  }, []);

  useEffect(() => {
    loadTables();
    posService
      .getDisposableQrs()
      .then((res) => {
        if (res?.data?.value) {
          try {
            const parsed = JSON.parse(res.data.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setDisposableQrs(parsed);
            }
          } catch {
            // Ignore malformed JSON
          }
        }
      })
      .catch(() => {
        setDisposableQrs([]);
      });
  }, [loadTables]);

  // Rotate QR Token for table
  const handleRotateQr = async (tableId: string, tableLabel: string) => {
    setIsRotatingId(tableId);
    setActiveMenuTableId(null);
    try {
      await posService.rotateTableQr(tableId);
      showToast(`QR Code ${tableLabel} berhasil diperbarui!`);
      await loadTables();
    } catch (err: any) {
      console.error('Failed to rotate QR:', err);
      showToast(err?.response?.data?.message || 'Gagal memperbarui QR code.');
    } finally {
      setIsRotatingId(null);
    }
  };

  // Master QR URL
  const masterQrUrl = useMemo(() => {
    const origin = windowOrigin || 'http://localhost:3000';
    return `${origin}/q/menu`;
  }, [windowOrigin]);

  // Format DiningTable into TableQrItem
  const tableQrs = useMemo<TableQrItem[]>(() => {
    const origin = windowOrigin || 'http://localhost:3000';

    return tables.map((t, index) => {
      const match = t.code.match(/\d+/) || t.name.match(/\d+/);
      const num = match ? parseInt(match[0], 10) : index + 1;
      const token = t.active_qr_code?.token || t.active_qr_token || '';
      const url = token ? `${origin}/q/${token}` : '';

      let area: TableQrItem['area'] = 'Indoor';
      if (t.code.toUpperCase().includes('OUT') || t.name.toUpperCase().includes('OUTDOOR')) {
        area = 'Outdoor';
      } else if (t.code.toUpperCase().includes('VIP') || t.name.toUpperCase().includes('VIP')) {
        area = 'VIP';
      }

      return {
        id: t.id,
        tableNumber: num,
        tableName: t.name || `Meja ${num}`,
        tableCode: t.code || `T-${String(num).padStart(2, '0')}`,
        area,
        token,
        url,
        status: t.status === 'ACTIVE' ? 'Aktif' : 'Nonaktif',
      };
    });
  }, [tables, windowOrigin]);

  // Filter Table QRs
  const filteredTableQrs = useMemo(() => {
    return tableQrs.filter((item) => {
      if (tableAreaFilter !== 'all' && item.area !== tableAreaFilter) return false;
      if (tableStatusFilter !== 'all' && item.status !== tableStatusFilter) return false;
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        return (
          item.tableNumber.toString().includes(q) ||
          item.tableName.toLowerCase().includes(q) ||
          item.tableCode.toLowerCase().includes(q) ||
          item.area.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tableQrs, tableAreaFilter, tableStatusFilter, tableSearch]);

  // Filter Disposable QRs
  const filteredDisposableQrs = useMemo(() => {
    return disposableQrs.filter((item) => {
      if (dispStatusFilter !== 'all' && item.status !== dispStatusFilter) return false;
      if (dispSearch.trim()) {
        const q = dispSearch.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.url.toLowerCase().includes(q);
      }
      return true;
    });
  }, [disposableQrs, dispStatusFilter, dispSearch]);

  // Pagination State
  const [tableQrPage, setTableQrPage] = useState(1);
  const [tableQrPageSize, setTableQrPageSize] = useState(10);
  const [dispQrPage, setDispQrPage] = useState(1);
  const [dispQrPageSize, setDispQrPageSize] = useState(10);

  const paginatedTableQrs = useMemo(() => {
    const start = (tableQrPage - 1) * tableQrPageSize;
    return filteredTableQrs.slice(start, start + tableQrPageSize);
  }, [filteredTableQrs, tableQrPage, tableQrPageSize]);

  const paginatedDisposableQrs = useMemo(() => {
    const start = (dispQrPage - 1) * dispQrPageSize;
    return filteredDisposableQrs.slice(start, start + dispQrPageSize);
  }, [filteredDisposableQrs, dispQrPage, dispQrPageSize]);

  const toggleSelectTableQr = (id: string, e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    setSelectedTableQrIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllTableQrs = () => {
    if (selectedTableQrIds.length === filteredTableQrs.length && filteredTableQrs.length > 0) {
      setSelectedTableQrIds([]);
    } else {
      setSelectedTableQrIds(filteredTableQrs.map((i) => i.id));
    }
  };

  const toggleSelectDispQr = (id: string, e?: React.SyntheticEvent) => {
    e?.stopPropagation();
    setSelectedDispIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllDispQrs = () => {
    if (selectedDispIds.length === filteredDisposableQrs.length && filteredDisposableQrs.length > 0) {
      setSelectedDispIds([]);
    } else {
      setSelectedDispIds(filteredDisposableQrs.map((i) => i.id));
    }
  };

  const handleGenerateDisposable = (isDraft = false) => {
    if (!formEventName.trim()) {
      toast.warning('Nama catatan / acara wajib diisi');
      return;
    }

    const origin = windowOrigin || 'http://localhost:3000';
    const slug = formEventName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newQr: DisposableQrItem = {
      id: `dqr-${Date.now()}`,
      name: formEventName,
      url: `${origin}/q/evt-${slug}`,
      createdAt: new Date().toLocaleDateString('id-ID'),
      expiredAt: formExpiryDate || '15/10/2026',
      status: isDraft ? 'Selesai' : 'Aktif',
    };

    const nextQrs = [newQr, ...disposableQrs];
    setDisposableQrs(nextQrs);
    posService.saveDisposableQrs(nextQrs).catch((err) => {
      console.warn('Backend saveDisposableQrs warning:', err);
    });

    setIsGenerateModalOpen(false);
    setShowSuccessModal(true);
  };

  // High-Resolution PNG Card Download
  const downloadQrCodeImage = (title: string, svgElementId: string, filename: string) => {
    const svg = document.getElementById(svgElementId) as SVGSVGElement | null;
    if (!svg) {
      showToast('QR Code belum siap untuk diunduh.');
      return;
    }

    const svgXml = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // White background card
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 600, 700);

      // Card border
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 12;
      ctx.strokeRect(16, 16, 568, 668);

      // Top brand bar
      ctx.fillStyle = '#E5484D';
      ctx.fillRect(16, 16, 568, 12);

      // Title
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 38px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(title.toUpperCase(), 300, 85);

      // Subtitle
      ctx.fillStyle = '#64748b';
      ctx.font = '18px Inter, sans-serif';
      ctx.fillText('Pindai untuk memesan menu langsung dari meja', 300, 122);

      // QR Code in center
      ctx.drawImage(img, 100, 155, 400, 400);

      // Footer
      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText('NEMU POS • Self-Service Dine In', 300, 615);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = dataUrl;
      link.click();
      showToast(`${title} berhasil diunduh!`);
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgXml)));
  };

  const handleDownloadSingleTable = (item: TableQrItem) => {
    downloadQrCodeImage(
      item.tableName,
      `qr-table-svg-${item.id}`,
      `QR-${item.tableCode || `Meja-${item.tableNumber}`}`
    );
  };

  const handleDownloadAllTables = () => {
    if (filteredTableQrs.length === 0) {
      showToast('Tidak ada data QR Meja yang dapat diunduh.');
      return;
    }
    filteredTableQrs.forEach((item, index) => {
      setTimeout(() => {
        handleDownloadSingleTable(item);
      }, index * 300);
    });
    showToast(`Memulai unduhan ${filteredTableQrs.length} QR Code Meja...`);
  };

  const handleDownloadMasterQr = () => {
    downloadQrCodeImage('Menu Utama', 'master-qr-svg', 'QR-Menu-Utama');
  };

  return (
    <div className="p-6 lg:p-8 space-y-5 max-w-[1600px] mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-top-2">
          <Check className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">QR Order</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Kelola QR menu untuk meja, area, maupun sekali pakai yang selalu tersinkron otomatis.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<RefreshCw className={`size-3.5 ${isLoadingTables ? 'animate-spin' : ''}`} />}
            onClick={() => loadTables()}
            disabled={isLoadingTables}
          >
            Segarkan Data
          </Button>
          <Link href="/dashboard/tables">
            <Button variant="primary" size="sm" leftIcon={<Plus className="size-3.5" />}>
              Kelola Meja
            </Button>
          </Link>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: QR Per Meja & QR Sekali Pakai (8 Cols ~ 68%) */}
        <div className="lg:col-span-8 space-y-6">
          {/* CARD 1: QR PER MEJA */}
          <Card
            title="QR Per Meja"
            subtitle="QR unik untuk setiap meja. Ditempel di meja agar pelanggan bisa langsung memesan mandiri."
            className="p-5 lg:p-6"
          >
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-1 pb-3">
              <div className="flex-1 min-w-[200px]">
                <SearchInput
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  onClear={() => setTableSearch('')}
                  placeholder="Cari nomor atau nama meja..."
                  size="sm"
                />
              </div>

              <Select
                value={tableAreaFilter}
                onChange={(e) => setTableAreaFilter(e.target.value)}
                size="sm"
                options={[
                  { value: 'all', label: 'Semua area' },
                  { value: 'Indoor', label: 'Indoor' },
                  { value: 'Outdoor', label: 'Outdoor' },
                  { value: 'VIP', label: 'VIP' },
                ]}
              />

              <Select
                value={tableStatusFilter}
                onChange={(e) => setTableStatusFilter(e.target.value)}
                size="sm"
                options={[
                  { value: 'all', label: 'Semua status' },
                  { value: 'Aktif', label: 'Aktif' },
                  { value: 'Nonaktif', label: 'Nonaktif' },
                ]}
              />

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download className="size-3.5" />}
                onClick={handleDownloadAllTables}
                disabled={filteredTableQrs.length === 0}
              >
                Download Semua
              </Button>
            </div>

            {/* Table or Loading / Empty State */}
            {isLoadingTables ? (
              <PageLoader text="Memuat data QR meja..." minHeight="min-h-[320px]" />
            ) : filteredTableQrs.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto border-t border-neutral-100">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200/80 text-neutral-500 font-medium">
                        <th className="py-3 px-2 w-8">
                          <input
                            type="checkbox"
                            checked={
                              selectedTableQrIds.length === filteredTableQrs.length &&
                              filteredTableQrs.length > 0
                            }
                            onChange={toggleSelectAllTableQrs}
                            className="rounded border-neutral-300 text-orange-600 focus:ring-0 size-3.5"
                          />
                        </th>
                        <th className="py-3 px-3 font-semibold text-neutral-700">Meja</th>
                        <th className="py-3 px-3 font-semibold text-neutral-700">Area</th>
                        <th className="py-3 px-3 font-semibold text-neutral-700">QR Code</th>
                        <th className="py-3 px-3 font-semibold text-neutral-700">Tautan</th>
                        <th className="py-3 px-3 font-semibold text-neutral-700">Status</th>
                        <th className="py-3 px-3 font-semibold text-neutral-700">Unduh</th>
                        <th className="py-3 px-2 w-12 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-800">
                      {paginatedTableQrs.map((row) => {
                        const isSelected = selectedTableQrIds.includes(row.id);
                        const isRotating = isRotatingId === row.id;
                        const isMenuOpen = activeMenuTableId === row.id;

                        return (
                          <tr
                            key={row.id}
                            className={`hover:bg-neutral-50/70 transition-colors ${
                              isSelected ? 'bg-orange-50/20' : ''
                            }`}
                          >
                            <td className="py-3 px-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => toggleSelectTableQr(row.id, e)}
                                className="rounded border-neutral-300 text-orange-600 focus:ring-0 size-3.5"
                              />
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-neutral-900">{row.tableName}</div>
                              <div className="text-[10px] text-neutral-400 font-mono">{row.tableCode}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                                {row.area}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="p-1 rounded-md bg-white border border-neutral-200 shadow-2xs inline-flex items-center justify-center relative">
                                <QRCodeSVG
                                  id={`qr-table-svg-${row.id}`}
                                  value={row.url || ""}
                                  size={34}
                                  level="M"
                                />
                                <div className="absolute size-2 rounded-full bg-[#E5484D] border border-white" />
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              {row.url ? (
                                <div className="flex items-center gap-1.5 text-blue-600 font-mono text-[11px]">
                                  <a
                                    href={row.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:underline truncate max-w-[130px] inline-flex items-center gap-1"
                                    title="Buka Menu Pelanggan"
                                  >
                                    <span>{row.url.replace(/^https?:\/\//, '')}</span>
                                    <ExternalLink className="size-2.5 shrink-0 opacity-60" />
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(row.url)}
                                    className="text-neutral-400 hover:text-neutral-600 transition-colors p-0.5"
                                    title="Salin Tautan"
                                  >
                                    <Copy className="size-3" />
                                  </button>
                                </div>
                              ) : (
                                <span className="text-neutral-400 italic text-[11px]">Belum ada token</span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <StatusBadge
                                variant={row.status === 'Aktif' ? 'success' : 'neutral'}
                                dot
                                size="sm"
                              >
                                {row.status}
                              </StatusBadge>
                            </td>
                            <td className="py-3 px-3">
                              <Button
                                variant="secondary"
                                size="xs"
                                leftIcon={<Download className="size-3" />}
                                onClick={() => handleDownloadSingleTable(row)}
                                disabled={!row.url}
                              >
                                Download
                              </Button>
                            </td>
                            <td className="py-3 px-2 text-right relative">
                              <button
                                onClick={() => setActiveMenuTableId(isMenuOpen ? null : row.id)}
                                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-md hover:bg-neutral-100 transition-colors"
                                title="Menu Aksi"
                              >
                                {isRotating ? (
                                  <Loader2 className="size-4 animate-spin text-orange-500" />
                                ) : (
                                  <MoreVertical className="size-4" />
                                )}
                              </button>

                              {isMenuOpen && (
                                <>
                                  <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setActiveMenuTableId(null)}
                                  />
                                  <div className="absolute right-0 top-8 z-20 w-44 bg-white rounded-xl shadow-xl border border-neutral-100 py-1.5 text-xs text-left animate-in fade-in zoom-in-95">
                                    {row.url && (
                                      <a
                                        href={row.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 px-3 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors"
                                        onClick={() => setActiveMenuTableId(null)}
                                      >
                                        <ExternalLink className="size-3.5 text-neutral-400" />
                                        <span>Buka Menu Self-Order</span>
                                      </a>
                                    )}
                                    {row.url && (
                                      <button
                                        type="button"
                                        className="w-full flex items-center gap-2 px-3 py-2 text-neutral-700 hover:bg-neutral-50 transition-colors text-left"
                                        onClick={() => {
                                          copyToClipboard(row.url);
                                          setActiveMenuTableId(null);
                                        }}
                                      >
                                        <Copy className="size-3.5 text-neutral-400" />
                                        <span>Salin Tautan</span>
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      className="w-full flex items-center gap-2 px-3 py-2 text-amber-700 hover:bg-amber-50 transition-colors text-left border-t border-neutral-100 mt-1 pt-1.5"
                                      onClick={() => handleRotateQr(row.id, row.tableName)}
                                      disabled={isRotating}
                                    >
                                      <RefreshCw className={`size-3.5 text-amber-600 ${isRotating ? 'animate-spin' : ''}`} />
                                      <span>Perbarui Token QR</span>
                                    </button>
                                  </div>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={tableQrPage}
                  totalPages={Math.max(1, Math.ceil(filteredTableQrs.length / tableQrPageSize))}
                  totalItems={filteredTableQrs.length}
                  itemsPerPage={tableQrPageSize}
                  pageSizeOptions={[10, 25, 50, 100]}
                  onPageChange={setTableQrPage}
                  onPageSizeChange={setTableQrPageSize}
                  itemName="QR Meja"
                />
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <EmptyState
                  title="BELUM ADA MEJA"
                  description="Tambahkan meja di outletmu untuk otomatis membuatkan QR pemesanan unik untuk setiap meja."
                  actionLabel="Tambah Meja Sekarang"
                  onAction={() => window.location.assign('/dashboard/tables')}
                />
              </div>
            )}
          </Card>

          {/* CARD 2: QR SEKALI PAKAI */}
          <Card
            title="QR Sekali Pakai"
            subtitle="Buat QR untuk pesanan sekali pakai (tidak terikat meja). Cocok untuk event, pop-up, atau takeaway."
            action={
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="size-4" />}
                onClick={() => setIsGenerateModalOpen(true)}
              >
                Generate QR Sekali Pakai
              </Button>
            }
            className="p-5 lg:p-6"
          >
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-1 pb-3">
              <div className="flex-1 min-w-[200px]">
                <SearchInput
                  value={dispSearch}
                  onChange={(e) => setDispSearch(e.target.value)}
                  onClear={() => setDispSearch('')}
                  placeholder="Cari nama event / catatan..."
                  size="sm"
                />
              </div>

              <Select
                value="all"
                disabled
                size="sm"
                options={[{ value: 'all', label: 'Semua area' }]}
              />

              <Select
                value={dispStatusFilter}
                onChange={(e) => setDispStatusFilter(e.target.value)}
                size="sm"
                options={[
                  { value: 'all', label: 'Semua status' },
                  { value: 'Aktif', label: 'Aktif' },
                  { value: 'Selesai', label: 'Selesai' },
                ]}
              />

              <Button
                variant="secondary"
                size="sm"
                leftIcon={<Download className="size-3.5" />}
                onClick={() => showToast('Mengunduh QR Sekali Pakai...')}
                disabled={filteredDisposableQrs.length === 0}
              >
                Download Semua
              </Button>
            </div>

            {/* Table or Empty State */}
            {filteredDisposableQrs.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto border-t border-neutral-100">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-neutral-200/80 text-neutral-500 font-medium">
                        <th className="py-3 px-2 w-8">
                          <input
                            type="checkbox"
                            checked={
                              selectedDispIds.length === filteredDisposableQrs.length &&
                              filteredDisposableQrs.length > 0
                            }
                            onChange={toggleSelectAllDispQrs}
                            className="rounded border-neutral-300 text-orange-600 focus:ring-0 size-3.5"
                          />
                        </th>
                        <th className="py-3 px-3 font-semibold text-neutral-700">Nama / Catatan</th>
                        <th className="py-3 px-3 font-semibold text-neutral-700">Tautan</th>
                        <th className="py-3 px-3 font-semibold text-neutral-700">Dibuat</th>
                        <th className="py-3 px-3 font-semibold text-neutral-700">Kadaluwarsa</th>
                        <th className="py-3 px-3 font-semibold text-neutral-700">Status</th>
                        <th className="py-3 px-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-800">
                      {paginatedDisposableQrs.map((row) => {
                        const isSelected = selectedDispIds.includes(row.id);
                        return (
                          <tr
                            key={row.id}
                            className={`hover:bg-neutral-50/70 transition-colors ${
                              isSelected ? 'bg-orange-50/20' : ''
                            }`}
                          >
                            <td className="py-3 px-2">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => toggleSelectDispQr(row.id, e)}
                                className="rounded border-neutral-300 text-orange-600 focus:ring-0 size-3.5"
                              />
                            </td>
                            <td className="py-3 px-3 font-medium text-neutral-900">
                              {row.name}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5 text-blue-600 font-mono text-[11px]">
                                <span className="hover:underline cursor-pointer truncate max-w-[130px]">
                                  {row.url}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(row.url)}
                                  className="text-neutral-400 hover:text-neutral-600 transition-colors"
                                  title="Salin Tautan"
                                >
                                  <Copy className="size-3" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-neutral-600">{row.createdAt}</td>
                            <td className="py-3 px-3 text-neutral-600">{row.expiredAt}</td>
                            <td className="py-3 px-3">
                              {row.status === 'Aktif' ? (
                                <StatusBadge variant="success" dot size="sm">
                                  Aktif
                                </StatusBadge>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-neutral-600 text-white">
                                  <span className="size-1.5 rounded-full bg-neutral-300" />
                                  <span>Selesai</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2 text-right">
                              <button className="text-neutral-400 hover:text-neutral-600 p-1">
                                <MoreVertical className="size-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={dispQrPage}
                  totalPages={Math.max(1, Math.ceil(filteredDisposableQrs.length / dispQrPageSize))}
                  totalItems={filteredDisposableQrs.length}
                  itemsPerPage={dispQrPageSize}
                  pageSizeOptions={[10, 25, 50, 100]}
                  onPageChange={setDispQrPage}
                  onPageSizeChange={setDispQrPageSize}
                  itemName="QR"
                />
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <EmptyState
                  title="BELUM ADA QR SEKALI PAKAI"
                  description="QR untuk pesanan sekali pakai akan muncul di sini setelah kamu membuatnya. Cocok untuk event, pop-up booth, atau pesanan takeaway."
                  actionLabel="Generate QR Sekarang"
                  onAction={() => setIsGenerateModalOpen(true)}
                />
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: QR Menu Utama & Pengaturan Tampilan (4 Cols ~ 32%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* CARD: QR MENU UTAMA */}
          <Card
            title="QR Menu Utama"
            subtitle="Satu QR untuk akses menu tanpa memilih meja (untuk dine-in atau general)"
            action={
              <Switch
                checked={isMasterQrActive}
                onChange={setIsMasterQrActive}
                label="Aktif"
                size="sm"
                color="blue"
              />
            }
            className="p-5 lg:p-6"
          >
            {/* Big QR Code in center */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="p-4 rounded-3xl bg-white border border-neutral-200/90 shadow-sm flex items-center justify-center relative">
                <QRCodeSVG
                  id="master-qr-svg"
                  value={masterQrUrl}
                  size={190}
                  level="H"
                  marginSize={1}
                />
                {/* Center red Nemu badge */}
                <div className="absolute size-9 rounded-xl bg-[#E5484D] text-white font-black text-sm flex items-center justify-center shadow-md border-2 border-white">
                  n
                </div>
              </div>

              {/* Link Box */}
              <div className="w-full mt-4 flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-blue-600 text-xs font-mono">
                <span className="truncate">{masterQrUrl}</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(masterQrUrl)}
                  className="text-blue-500 hover:text-blue-700 shrink-0 ml-2"
                  title="Salin Tautan"
                >
                  <Copy className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Action Buttons: Download QR & Bagikan */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Download className="size-4" />}
                onClick={handleDownloadMasterQr}
                fullWidth
              >
                Download QR
              </Button>

              <Button
                variant="outline-primary"
                size="md"
                leftIcon={<Share2 className="size-4" />}
                onClick={() => copyToClipboard(masterQrUrl)}
                fullWidth
              >
                Bagikan
              </Button>
            </div>
          </Card>

          {/* CARD: PENGATURAN TAMPILAN */}
          <Card
            title="Pengaturan Tampilan"
            subtitle="Kustomisasi tampilan halaman pemesanan pelanggan"
            className="p-5 lg:p-6"
          >
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-neutral-800">Tampilkan Logo Outlet</p>
                  <p className="text-[11px] text-neutral-400">Header landing page pelanggan</p>
                </div>
                <Switch
                  checked={showLogoOnMenu}
                  onChange={setShowLogoOnMenu}
                  size="sm"
                  color="blue"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-neutral-800">Wajib Masukkan Nama Tamu</p>
                  <p className="text-[11px] text-neutral-400">Sebelum memulai pemesanan</p>
                </div>
                <Switch
                  checked={requireCustomerName}
                  onChange={setRequireCustomerName}
                  size="sm"
                  color="blue"
                />
              </div>

              <div className="p-3.5 rounded-xl border border-neutral-200/80 bg-neutral-50/40 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-neutral-800">Izinkan Pembayaran Online (QRIS)</p>
                  <p className="text-[11px] text-neutral-400">Bayar langsung di browser pelanggan</p>
                </div>
                <Switch
                  checked={enableQrisPayment}
                  onChange={setEnableQrisPayment}
                  size="sm"
                  color="blue"
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Slide-over Drawer for Generate QR Sekali Pakai using global Drawer */}
      <Drawer
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate QR Sekali Pakai"
        subtitle="Buat QR dinamis untuk event, pop-up booth, atau pelanggan takeaway langsung."
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Bookmark className="size-4" />}
              onClick={() => handleGenerateDisposable(true)}
            >
              Simpan sebagai Draf
            </Button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<CheckCircle2 className="size-4" />}
              onClick={() => handleGenerateDisposable(false)}
            >
              Generate QR
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <Input
            label="Nama Acara / Catatan"
            required
            value={formEventName}
            onChange={(e) => setFormEventName(e.target.value)}
            placeholder="Contoh: Bazaar Akhir Pekan, Takeaway 12 Okt"
          />

          <Input
            label="Tanggal Kadaluwarsa"
            value={formExpiryDate}
            onChange={(e) => setFormExpiryDate(e.target.value)}
            placeholder="Contoh: 15/10/2026"
            hint="Tanggal batas terakhir QR dapat diakses oleh pelanggan."
          />

          <RadioGroup
            label="Batas Penggunaan"
            value={formUsageLimit}
            onChange={(val) => setFormUsageLimit(val as 'single' | 'unlimited')}
            variant="card"
            direction="grid-2"
            options={[
              {
                value: 'single',
                label: '1 Kali Pesan',
                description: 'Single Order',
              },
              {
                value: 'unlimited',
                label: 'Bebas Periode',
                description: 'Multi Order',
              },
            ]}
          />

          <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-700">
            <Info className="size-4 shrink-0 text-blue-600 mt-0.5" />
            <span>
              QR yang sudah kadaluwarsa otomatis tidak dapat digunakan untuk melakukan pesanan baru.
            </span>
          </div>
        </div>
      </Drawer>

      {/* Success Modal using global Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        showCloseButton={false}
        size="md"
      >
        <div className="flex flex-col items-center text-center py-2">
          <div className="size-20 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-5">
            <Check className="size-10 stroke-[3]" />
          </div>

          <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
            QR Sekali Pakai Berhasil Dibuat!
          </h3>
          <p className="text-xs text-neutral-500 mt-2 max-w-[340px] leading-relaxed">
            QR &quot;{formEventName}&quot; berhasil dibuat dan siap diunduh atau dibagikan ke pelanggan.
          </p>

          <div className="grid grid-cols-2 gap-3 w-full mt-6">
            <Button
              variant="outline-primary"
              size="md"
              onClick={() => setShowSuccessModal(false)}
            >
              Tutup
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowSuccessModal(false)}
            >
              Kembali ke Daftar QR
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
