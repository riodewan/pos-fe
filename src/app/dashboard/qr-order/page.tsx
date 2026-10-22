'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Download,
  Copy,
  Check,
  Share2,
  Plus,
  Search,
  ChevronDown,
  MoreVertical,
  QrCode,
  CheckCircle2,
  X,
  Bookmark,
  Calendar,
  Sparkles,
  ExternalLink,
  Info,
  Clock,
  Layers,
  Palette,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { DataTable, ColumnDef, StatusBadge } from '@/components/common';
import { EmptyState } from '@/components/common/EmptyState';

interface TableQrItem {
  id: string;
  tableNumber: number;
  area: 'Indoor' | 'Outdoor' | 'VIP';
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

const INITIAL_TABLE_QRS: TableQrItem[] = [
  {
    id: 'tqr-1',
    tableNumber: 1,
    area: 'Indoor',
    url: 'https://order.nemu.id/q/tbl-1',
    status: 'Aktif',
  },
  {
    id: 'tqr-2',
    tableNumber: 2,
    area: 'Indoor',
    url: 'https://order.nemu.id/q/tbl-2',
    status: 'Aktif',
  },
];

const INITIAL_DISPOSABLE_QRS: DisposableQrItem[] = [
  {
    id: 'dqr-1',
    name: 'Event Bazaar',
    url: 'https://order.nemu.id/q/evt-bazaar',
    createdAt: '12/10/2026',
    expiredAt: '15/10/2026',
    status: 'Aktif',
  },
  {
    id: 'dqr-2',
    name: 'Takeway hari ini',
    url: 'https://order.nemu.id/q/tkw-today',
    createdAt: '10/10/2026',
    expiredAt: '10/10/2026',
    status: 'Selesai',
  },
];

export default function QrOrderPage() {
  const [demoMode, setDemoMode] = useState<'populated' | 'empty'>('populated');

  // Master QR State
  const [isMasterQrActive, setIsMasterQrActive] = useState(true);
  const masterQrUrl = 'https://qr.nemupos/kopi-mantap';

  // Table QR State
  const [tableQrs, setTableQrs] = useState<TableQrItem[]>(INITIAL_TABLE_QRS);
  const [tableSearch, setTableSearch] = useState('');
  const [tableAreaFilter, setTableAreaFilter] = useState('all');
  const [tableStatusFilter, setTableStatusFilter] = useState('all');
  const [selectedTableQrIds, setSelectedTableQrIds] = useState<string[]>([]);

  // Disposable QR State
  const [disposableQrs, setDisposableQrs] = useState<DisposableQrItem[]>(INITIAL_DISPOSABLE_QRS);
  const [dispSearch, setDispSearch] = useState('');
  const [dispStatusFilter, setDispStatusFilter] = useState('all');
  const [selectedDispIds, setSelectedDispIds] = useState<string[]>([]);

  // Generate Disposable QR Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [formEventName, setFormEventName] = useState('');
  const [formExpiryDate, setFormExpiryDate] = useState('15/10/2026');
  const [formUsageLimit, setFormUsageLimit] = useState<'single' | 'unlimited'>('single');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    showToast('Tautan berhasil disalin!');
  };

  // Filter Table QRs
  const filteredTableQrs = useMemo(() => {
    if (demoMode === 'empty') return [];
    return tableQrs.filter((item) => {
      if (tableAreaFilter !== 'all' && item.area !== tableAreaFilter) return false;
      if (tableStatusFilter !== 'all' && item.status !== tableStatusFilter) return false;
      if (tableSearch.trim()) {
        const q = tableSearch.toLowerCase();
        return item.tableNumber.toString().includes(q) || item.area.toLowerCase().includes(q);
      }
      return true;
    });
  }, [demoMode, tableQrs, tableAreaFilter, tableStatusFilter, tableSearch]);

  // Filter Disposable QRs
  const filteredDisposableQrs = useMemo(() => {
    if (demoMode === 'empty') return [];
    return disposableQrs.filter((item) => {
      if (dispStatusFilter !== 'all' && item.status !== dispStatusFilter) return false;
      if (dispSearch.trim()) {
        const q = dispSearch.toLowerCase();
        return item.name.toLowerCase().includes(q) || item.url.toLowerCase().includes(q);
      }
      return true;
    });
  }, [demoMode, disposableQrs, dispStatusFilter, dispSearch]);

  const toggleSelectTableQr = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const toggleSelectDispQr = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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
      alert('Nama catatan / acara wajib diisi');
      return;
    }

    const newQr: DisposableQrItem = {
      id: `dqr-${Date.now()}`,
      name: formEventName,
      url: `https://order.nemu.id/q/${formEventName.toLowerCase().replace(/\s+/g, '-')}`,
      createdAt: '12/10/2026',
      expiredAt: formExpiryDate || '15/10/2026',
      status: isDraft ? 'Selesai' : 'Aktif',
    };

    setDisposableQrs((prev) => [newQr, ...prev]);
    setIsGenerateModalOpen(false);
    setShowSuccessModal(true);
  };

  const downloadQr = (title: string) => {
    showToast(`Mengunduh file QR Code untuk ${title}...`);
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

      {/* Top Page Header matching Screenshot 1 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">QR Order</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Kelola QR menu untuk meja, area, maupun sekali pakai.
          </p>
        </div>

        {/* Demo Switcher */}
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
            Belum Ada QR
          </button>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout matching Screenshot 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: QR Per Meja & QR Sekali Pakai (8 Cols ~ 68%) */}
        <div className="lg:col-span-8 space-y-6">
          {/* CARD 1: QR PER MEJA */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 lg:p-6 space-y-4 shadow-2xs">
            {/* Header */}
            <div>
              <h2 className="text-base font-bold text-neutral-900">QR Per Meja</h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                QR unik untuk setiap meja. Ditempel di meja agar pelanggan bisa langsung memesan.
              </p>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Search input with dark circle magnifying button */}
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  placeholder="Cari nomor meja..."
                  className="w-full h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 shadow-2xs focus:outline-none"
                />
                <div className="absolute right-2 top-2 size-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <Search className="size-2.5 stroke-[2.5]" />
                </div>
              </div>

              {/* Area filter */}
              <div className="relative">
                <select
                  value={tableAreaFilter}
                  onChange={(e) => setTableAreaFilter(e.target.value)}
                  className="h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none hover:bg-neutral-50"
                >
                  <option value="all">Semua area</option>
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="VIP">VIP</option>
                </select>
                <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  value={tableStatusFilter}
                  onChange={(e) => setTableStatusFilter(e.target.value)}
                  className="h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none hover:bg-neutral-50"
                >
                  <option value="all">Semua status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
                <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>

              {/* Download Semua Button */}
              <button
                type="button"
                onClick={() => downloadQr('Semua Meja')}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-colors shadow-2xs"
              >
                <Download className="size-3.5" />
                <span>Download Semua</span>
              </button>
            </div>

            {/* Table or Empty State */}
            {filteredTableQrs.length > 0 ? (
              <div className="border border-neutral-200/80 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50/70 border-b border-neutral-200/80 text-[11px] font-semibold text-neutral-500">
                    <tr>
                      <th className="py-2.5 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={
                            selectedTableQrIds.length === filteredTableQrs.length &&
                            filteredTableQrs.length > 0
                          }
                          onChange={toggleSelectAllTableQrs}
                          className="rounded border-neutral-300 text-[#FF4D4D] focus:ring-0 size-3.5 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-3">Meja</th>
                      <th className="py-2.5 px-3">Area</th>
                      <th className="py-2.5 px-3">QR Code</th>
                      <th className="py-2.5 px-3">Tautan</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Unduh</th>
                      <th className="py-2.5 px-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredTableQrs.map((tbl) => (
                      <tr key={tbl.id} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={selectedTableQrIds.includes(tbl.id)}
                            onClick={(e) => toggleSelectTableQr(tbl.id, e)}
                            onChange={() => {}}
                            className="rounded border-neutral-300 text-[#FF4D4D] focus:ring-0 size-3.5 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 font-bold text-neutral-900">{tbl.tableNumber}</td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FFF8E1] text-[#A76D04] border border-[#FFE082]/60">
                            {tbl.area}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="size-8 rounded-lg bg-white border border-neutral-200 p-0.5 shadow-2xs flex items-center justify-center">
                            <QRCodeSVG value={tbl.url} size={28} />
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/70 border border-blue-200/60 text-blue-600 font-mono text-[11px]">
                            <span className="truncate max-w-[130px]">{tbl.url}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(tbl.url)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Salin Tautan"
                            >
                              <Copy className="size-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge variant="success" icon={<Check className="size-3" />}>
                            Aktif
                          </StatusBadge>
                        </td>
                        <td className="py-3 px-3">
                          <button
                            type="button"
                            onClick={() => downloadQr(`Meja ${tbl.tableNumber}`)}
                            className="inline-flex items-center gap-1.5 h-7 px-3 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-[11px] font-semibold text-neutral-700 shadow-2xs"
                          >
                            <Download className="size-3" />
                            <span>Download</span>
                          </button>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            type="button"
                            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                          >
                            <MoreVertical className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Footer Pagination */}
                <div className="py-2.5 px-4 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <span>Menampilkan 1 - {filteredTableQrs.length} dari 10 QR</span>
                  <div className="flex items-center gap-1">
                    <button className="size-6 rounded flex items-center justify-center text-neutral-400 hover:bg-neutral-200/50">
                      &lt;
                    </button>
                    <span className="size-6 rounded bg-[#FF4D4D] text-white font-semibold flex items-center justify-center text-xs">
                      1
                    </span>
                    <button className="size-6 rounded flex items-center justify-center text-neutral-400 hover:bg-neutral-200/50">
                      &gt;
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State matching Screenshot 2 */
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <EmptyState
                  title="BELUM ADA MEJA"
                  description="Tambahkan meja dan atur tata letaknya untuk mulai mengelola pesanan dine-in di outletmu."
                  actionLabel="Tambah Meja"
                  onAction={() => (window.location.href = '/dashboard/tables')}
                />
              </div>
            )}
          </div>

          {/* CARD 2: QR SEKALI PAKAI */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 lg:p-6 space-y-4 shadow-2xs">
            {/* Header with Generate Button matching Screenshot 1 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-neutral-900">QR Sekali Pakai</h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Buat QR untuk pesanan sekalai pakai (tidak terikat meja). Cocok untuk event, pop-up, atau takeway.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsGenerateModalOpen(true)}
                className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-[#E5484D] hover:bg-[#D9383D] text-white text-xs font-semibold transition-colors shadow-2xs shrink-0"
              >
                <Plus className="size-4 stroke-[2.5]" />
                <span>Generate QR Sekali Pakai</span>
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={dispSearch}
                  onChange={(e) => setDispSearch(e.target.value)}
                  placeholder="Cari nomor meja..."
                  className="w-full h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-900 placeholder:text-neutral-400 shadow-2xs focus:outline-none"
                />
                <div className="absolute right-2 top-2 size-5 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400">
                  <Search className="size-2.5 stroke-[2.5]" />
                </div>
              </div>

              <div className="relative">
                <select
                  defaultValue="all"
                  className="h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none hover:bg-neutral-50"
                >
                  <option value="all">Semua area</option>
                  <option value="event">Event</option>
                  <option value="takeaway">Takeaway</option>
                </select>
                <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={dispStatusFilter}
                  onChange={(e) => setDispStatusFilter(e.target.value)}
                  className="h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none hover:bg-neutral-50"
                >
                  <option value="all">Semua status</option>
                  <option value="Aktif">Aktif</option>
                  <option value="Selesai">Selesai</option>
                </select>
                <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
              </div>

              <button
                type="button"
                onClick={() => downloadQr('Semua QR Sekali Pakai')}
                className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-700 transition-colors shadow-2xs"
              >
                <Download className="size-3.5" />
                <span>Download Semua</span>
              </button>
            </div>

            {/* Table or Empty State */}
            {filteredDisposableQrs.length > 0 ? (
              <div className="border border-neutral-200/80 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-neutral-50/70 border-b border-neutral-200/80 text-[11px] font-semibold text-neutral-500">
                    <tr>
                      <th className="py-2.5 px-3 w-8">
                        <input
                          type="checkbox"
                          checked={
                            selectedDispIds.length === filteredDisposableQrs.length &&
                            filteredDisposableQrs.length > 0
                          }
                          onChange={toggleSelectAllDispQrs}
                          className="rounded border-neutral-300 text-[#FF4D4D] focus:ring-0 size-3.5 cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-3">Nama / Catatan</th>
                      <th className="py-2.5 px-3">Tautan</th>
                      <th className="py-2.5 px-3">Dibuat</th>
                      <th className="py-2.5 px-3">Kadaluwarsa</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {filteredDisposableQrs.map((item) => (
                      <tr key={item.id} className="hover:bg-neutral-50/50">
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={selectedDispIds.includes(item.id)}
                            onClick={(e) => toggleSelectDispQr(item.id, e)}
                            onChange={() => {}}
                            className="rounded border-neutral-300 text-[#FF4D4D] focus:ring-0 size-3.5 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 font-semibold text-neutral-900">{item.name}</td>
                        <td className="py-3 px-3">
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/70 border border-blue-200/60 text-blue-600 font-mono text-[11px]">
                            <span className="truncate max-w-[130px]">{item.url}</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(item.url)}
                              className="text-blue-500 hover:text-blue-700"
                              title="Salin Tautan"
                            >
                              <Copy className="size-3" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-neutral-600 font-medium">{item.createdAt}</td>
                        <td className="py-3 px-3 text-neutral-600 font-medium">{item.expiredAt}</td>
                        <td className="py-3 px-3">
                          {item.status === 'Aktif' ? (
                            <StatusBadge variant="success" icon={<Check className="size-3" />}>
                              Aktif
                            </StatusBadge>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
                              <X className="size-3" />
                              <span>Selesai</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <button
                            type="button"
                            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                          >
                            <MoreVertical className="size-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Footer Pagination */}
                <div className="py-2.5 px-4 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-500">
                  <span>Menampilkan 1 - {filteredDisposableQrs.length} dari 10 QR</span>
                  <div className="flex items-center gap-1">
                    <button className="size-6 rounded flex items-center justify-center text-neutral-400 hover:bg-neutral-200/50">
                      &lt;
                    </button>
                    <span className="size-6 rounded bg-[#FF4D4D] text-white font-semibold flex items-center justify-center text-xs">
                      1
                    </span>
                    <button className="size-6 rounded flex items-center justify-center text-neutral-400 hover:bg-neutral-200/50">
                      &gt;
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Empty State matching Screenshot 2 */
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <EmptyState
                  title="BELUM ADA QR SEKALI PAKAI"
                  description="QR untuk pesanan sekali pakai akan muncul di sini setelah kamu membuatnya. Cocok untuk event, pop-up, atau pesanan takeaway."
                  actionLabel="Generate QR Sekarang"
                  onAction={() => setIsGenerateModalOpen(true)}
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: QR Menu Utama & Pengaturan Tampilan (4 Cols ~ 32%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* CARD: QR MENU UTAMA matching Screenshot 1 */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 lg:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-neutral-900">QR Menu Utama</h3>
                <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                  Satu QR untuk akses menu tanpa memilih meja (untuk dine-in atau general)
                </p>
              </div>

              {/* Toggle Aktif matching Screenshot 1 */}
              <button
                type="button"
                onClick={() => setIsMasterQrActive(!isMasterQrActive)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all shrink-0 ${
                  isMasterQrActive
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-neutral-200 text-neutral-600'
                }`}
              >
                <span className="size-2 rounded-full bg-white" />
                <span>Aktif</span>
              </button>
            </div>

            {/* Big QR Code in center */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="p-4 rounded-3xl bg-white border border-neutral-200/90 shadow-sm flex items-center justify-center relative">
                <QRCodeSVG
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
              <button
                type="button"
                onClick={() => downloadQr('Menu Utama')}
                className="h-10 rounded-xl bg-[#E5484D] hover:bg-[#D9383D] text-white text-xs font-semibold transition-colors shadow-2xs flex items-center justify-center gap-1.5"
              >
                <Download className="size-4" />
                <span>Download QR</span>
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(masterQrUrl)}
                className="h-10 rounded-xl border border-[#FF7D54] hover:bg-orange-50/50 text-[#E5484D] text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
              >
                <Share2 className="size-4" />
                <span>Bagikan</span>
              </button>
            </div>
          </div>

          {/* CARD: PENGATURAN TAMPILAN */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 lg:p-6 space-y-4 shadow-2xs">
            <div>
              <h3 className="text-base font-bold text-neutral-900">Pengaturan Tampilan</h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Kustomisasi tampilan halaman pemesanan pelanggan
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl border border-neutral-200/80 bg-neutral-50/40 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-800">Tampilkan Logo Outlet</p>
                  <p className="text-[11px] text-neutral-400">Header landing page pelanggan</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-neutral-300 text-blue-600 focus:ring-0 size-4"
                />
              </div>

              <div className="p-3 rounded-xl border border-neutral-200/80 bg-neutral-50/40 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-800">Wajib Masukkan Nama Tamu</p>
                  <p className="text-[11px] text-neutral-400">Sebelum memulai pemesanan</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-neutral-300 text-blue-600 focus:ring-0 size-4"
                />
              </div>

              <div className="p-3 rounded-xl border border-neutral-200/80 bg-neutral-50/40 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-800">Izinkan Pembayaran Online (QRIS)</p>
                  <p className="text-[11px] text-neutral-400">Bayar langsung di browser pelanggan</p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-neutral-300 text-blue-600 focus:ring-0 size-4"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slide-over Drawer for Generate QR Sekali Pakai */}
      {isGenerateModalOpen && (
        <>
          <div
            onClick={() => setIsGenerateModalOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[560px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  Generate QR Sekali Pakai
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Buat QR dinamis untuk event, pop-up booth, atau pelanggan takeaway langsung.
                </p>
              </div>

              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className="size-7 rounded-full bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">
                  Nama Acara / Catatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formEventName}
                  onChange={(e) => setFormEventName(e.target.value)}
                  placeholder="Contoh: Bazaar Akhir Pekan, Takeaway 12 Okt"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Tanggal Kadaluwarsa</label>
                <input
                  type="text"
                  value={formExpiryDate}
                  onChange={(e) => setFormExpiryDate(e.target.value)}
                  placeholder="Contoh: 15/10/2026"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Batas Penggunaan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormUsageLimit('single')}
                    className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                      formUsageLimit === 'single'
                        ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    1 Kali Pesan (Single Order)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormUsageLimit('unlimited')}
                    className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                      formUsageLimit === 'unlimited'
                        ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                        : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    Bebas dalam Periode
                  </button>
                </div>
              </div>

              {/* Info note */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex items-start gap-2.5 text-xs text-blue-700">
                <Info className="size-4 shrink-0 text-blue-600 mt-0.5" />
                <span>
                  QR yang sudah kadaluwarsa otomatis tidak dapat digunakan untuk melakukan pesanan baru.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-6 border-t border-neutral-100 flex items-center justify-between gap-4 bg-white">
              <button
                type="button"
                onClick={() => handleGenerateDisposable(true)}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold transition-colors"
              >
                <Bookmark className="size-4" />
                <span>Simpan sebagai Draf</span>
              </button>

              <button
                type="button"
                onClick={() => handleGenerateDisposable(false)}
                className="inline-flex items-center gap-2 h-11 px-7 rounded-xl bg-[#E5484D] hover:bg-[#D9383D] text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                <CheckCircle2 className="size-4 stroke-[2.5]" />
                <span>Generate QR</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <>
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-[2px] transition-opacity" />
          <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
            <div className="w-full max-w-[480px] bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="size-24 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-6">
                <Check className="size-12 stroke-[3]" />
              </div>

              <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                QR Sekali Pakai Berhasil Dibuat!
              </h3>
              <p className="text-xs text-neutral-500 mt-2 max-w-[360px] leading-relaxed">
                QR &quot;{formEventName}&quot; berhasil dibuat dan siap diunduh atau dibagikan ke pelanggan.
              </p>

              <div className="grid grid-cols-2 gap-3 w-full mt-8">
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="h-11 rounded-2xl border border-red-200 hover:bg-red-50/50 text-[#E5484D] text-xs font-semibold transition-colors"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="h-11 rounded-2xl bg-[#FF5C38] hover:bg-[#EE4E2A] text-white text-xs font-semibold transition-colors shadow-2xs"
                >
                  Kembali ke Daftar QR
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
