'use client';

import React, { useState, useMemo } from 'react';
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
} from '@/components/common';

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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    showToast('Tautan berhasil disalin ke clipboard!');
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
          <Card
            title="QR Per Meja"
            subtitle="QR unik untuk setiap meja. Ditempel di meja agar pelanggan bisa langsung memesan."
            className="p-5 lg:p-6"
          >
            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-1 pb-3">
              <div className="flex-1 min-w-[200px]">
                <SearchInput
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  onClear={() => setTableSearch('')}
                  placeholder="Cari nomor meja..."
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
                onClick={() => downloadQr('Semua Meja')}
              >
                Download Semua
              </Button>
            </div>

            {/* Table or Empty State */}
            {filteredTableQrs.length > 0 ? (
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
                        <th className="py-3 px-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-neutral-800">
                      {filteredTableQrs.map((row) => {
                        const isSelected = selectedTableQrIds.includes(row.id);
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
                            <td className="py-3 px-3 font-semibold text-neutral-900">
                              {row.tableNumber}
                            </td>
                            <td className="py-3 px-3">
                              <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
                                {row.area}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="p-1 rounded-md bg-white border border-neutral-200 shadow-2xs inline-flex items-center justify-center relative">
                                <QRCodeSVG value={row.url} size={32} level="M" />
                                <div className="absolute size-2.5 rounded-full bg-[#E5484D] border border-white" />
                              </div>
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
                            <td className="py-3 px-3">
                              <StatusBadge variant="success" dot size="sm">
                                {row.status}
                              </StatusBadge>
                            </td>
                            <td className="py-3 px-3">
                              <Button
                                variant="secondary"
                                size="xs"
                                leftIcon={<Download className="size-3" />}
                                onClick={() => downloadQr(`Meja ${row.tableNumber}`)}
                              >
                                Download
                              </Button>
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
                  currentPage={1}
                  totalPages={1}
                  totalItems={filteredTableQrs.length}
                  itemsPerPage={10}
                  onPageChange={() => {}}
                  itemName="QR"
                />
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <EmptyState
                  title="BELUM ADA MEJA"
                  description="Tambahkan meja dan atur tata letaknya untuk mulai mengelola pesanan dine-in di outletmu."
                  actionLabel="Tambah Meja"
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
                  placeholder="Cari nomor meja / catatan..."
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
                onClick={() => downloadQr('Semua QR Sekali Pakai')}
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
                      {filteredDisposableQrs.map((row) => {
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
                  currentPage={1}
                  totalPages={1}
                  totalItems={filteredDisposableQrs.length}
                  itemsPerPage={10}
                  onPageChange={() => {}}
                  itemName="QR"
                />
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <EmptyState
                  title="BELUM ADA QR SEKALI PAKAI"
                  description="QR untuk pesanan sekali pakai akan muncul di sini setelah kamu membuatnya. Cocok untuk event, pop-up, atau pesanan takeaway."
                  actionLabel="Generate QR Sekarang"
                  onAction={() => setIsGenerateModalOpen(true)}
                />
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: QR Menu Utama & Pengaturan Tampilan (4 Cols ~ 32%) */}
        <div className="lg:col-span-4 space-y-6">
          {/* CARD: QR MENU UTAMA matching Screenshot 1 */}
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
                onClick={() => downloadQr('Menu Utama')}
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
