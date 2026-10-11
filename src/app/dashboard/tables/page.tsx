'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Grid,
  Plus,
  QrCode as QrIcon,
  RefreshCw,
  Trash2,
  Edit2,
  Users,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Printer,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '@/context/StoreContext';
import { posService } from '@/services';
import { DiningTable, QrCode } from '@/types';
import { ApiError } from '@/lib/api';
import { ROUTES } from '@/constants';
import { PageHeader, EmptyState, LoadingScreen } from '@/components/common';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function TablesManagementPage() {
  const { activeStore } = useStore();

  const [tables, setTables] = useState<DiningTable[]>([]);
  const [loading, setLoading] = useState(true);

  // Table Create / Edit Modal State
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<DiningTable | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [capacity, setCapacity] = useState('4');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // QR Code Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedTableForQr, setSelectedTableForQr] = useState<DiningTable | null>(null);
  const [qrList, setQrList] = useState<QrCode[]>([]);
  const [loadingQr, setLoadingQr] = useState(false);
  const [generatingQr, setGeneratingQr] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrError, setQrError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    if (!activeStore) return;
    setLoading(true);
    try {
      const res = await posService.getTables();
      setTables(res.data || []);
    } catch (err) {
      console.error('Failed to load tables:', err);
    } finally {
      setLoading(false);
    }
  }, [activeStore]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const openAddModal = () => {
    setEditingTable(null);
    setName('');
    setCode(`M${String(tables.length + 1).padStart(2, '0')}`);
    setCapacity('4');
    setFormError(null);
    setFormModalOpen(true);
  };

  const openEditModal = (t: DiningTable) => {
    setEditingTable(t);
    setName(t.name);
    setCode(t.code);
    setCapacity(String(t.capacity));
    setFormError(null);
    setFormModalOpen(true);
  };

  const handleSaveTable = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);

    try {
      if (editingTable) {
        await posService.updateTable(editingTable.id, {
          name,
          code,
          capacity: Number(capacity) || 4,
          status: 'ACTIVE',
        });
      } else {
        await posService.createTable({
          name,
          code,
          capacity: Number(capacity) || 4,
          status: 'ACTIVE',
        });
      }
      setFormModalOpen(false);
      fetchTables();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setFormError(err.message || 'Gagal menyimpan data meja.');
      } else {
        setFormError((err as Error).message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTable = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus meja ini?')) return;
    try {
      await posService.deleteTable(id);
      fetchTables();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        alert(err.message);
      }
    }
  };

  // QR Modal Functions
  const openQrModal = async (t: DiningTable) => {
    setSelectedTableForQr(t);
    setQrModalOpen(true);
    setLoadingQr(true);
    setQrError(null);
    setCopied(false);
    try {
      const res = await posService.getTableQrs(t.id);
      let list = res.data || [];
      // Auto-generate if table has no active QR yet
      if (list.length === 0 || !list.some((q) => q.is_active || q.status === 'ACTIVE')) {
        const genRes = await posService.rotateTableQr(t.id);
        if (genRes.data) {
          list = [genRes.data, ...list];
          fetchTables();
        }
      }
      setQrList(list);
    } catch (err: unknown) {
      console.error('Failed to load QR tokens:', err);
      if (err instanceof ApiError) {
        setQrError(err.message);
      } else {
        setQrError((err as Error).message);
      }
    } finally {
      setLoadingQr(false);
    }
  };

  const handleRotateQr = async () => {
    if (!selectedTableForQr) return;
    setGeneratingQr(true);
    setQrError(null);
    try {
      const rotateRes = await posService.rotateTableQr(selectedTableForQr.id);
      const res = await posService.getTableQrs(selectedTableForQr.id);
      const updatedList = res.data && res.data.length > 0 ? res.data : (rotateRes.data ? [rotateRes.data] : []);
      setQrList(updatedList);
      fetchTables();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setQrError(err.message || 'Gagal rotasi QR.');
      } else {
        setQrError((err as Error).message || 'Gagal rotasi QR.');
      }
    } finally {
      setGeneratingQr(false);
    }
  };

  const activeQr = qrList.find((q) => q.is_active || q.status === 'ACTIVE');

  const qrOrderUrl = typeof window !== 'undefined' && activeQr
    ? `${window.location.origin}/q/${activeQr.token}`
    : activeQr ? `/q/${activeQr.token}` : '';

  const handleCopyUrl = async () => {
    if (!qrOrderUrl) return;
    try {
      await navigator.clipboard.writeText(qrOrderUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handlePrintQr = () => {
    if (!activeQr || !selectedTableForQr) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${selectedTableForQr.name}</title>
          <style>
            @media print {
              body { margin: 0; }
            }
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fafafa; }
            .card { border: 2px solid #27272a; padding: 36px 28px; border-radius: 20px; text-align: center; max-width: 300px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            h1 { font-size: 22px; font-weight: 800; margin: 0 0 4px; color: #18181b; }
            .code { font-size: 13px; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
            .qr-wrapper { display: inline-block; padding: 12px; background: white; border-radius: 12px; }
            p { font-size: 13px; font-weight: 500; color: #52525b; margin: 16px 0 4px; }
            .hint { font-size: 11px; color: #a1a1aa; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>${selectedTableForQr.name}</h1>
            <div class="code">Meja: ${selectedTableForQr.code}</div>
            <div class="qr-wrapper">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrOrderUrl)}" width="200" height="200" alt="QR Code" />
            </div>
            <p>Pindai untuk Pesan & Bayar</p>
            <div class="hint">Self-Order Langsung dari Meja</div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Manajemen Meja & QR Self-Order"
        description="Kelola tata letak meja dine-in, status okupansi, dan token scan QR pelanggan"
      >
        <Button variant="outline" size="sm" onClick={fetchTables} disabled={loading}>
          <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
        <Button onClick={openAddModal} className="bg-amber-600 hover:bg-amber-700 text-white" size="sm">
          <Plus className="size-4 mr-1.5" /> Tambah Meja
        </Button>
      </PageHeader>

      {/* Tables Grid */}
      {loading ? (
        <LoadingScreen message="Memuat data meja outlet..." />
      ) : tables.length === 0 ? (
        <EmptyState
          icon={Grid}
          title="Belum ada meja"
          description="Tambahkan meja pertama Anda untuk mengaktifkan fitur dine-in dan QR self-order."
          actionLabel="Tambah Meja Baru"
          onAction={openAddModal}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <Card
              key={table.id}
              className={`relative overflow-hidden transition-all border ${
                table.is_occupied
                  ? 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/10'
                  : 'hover:border-border'
              }`}
            >
              {/* Top Status Bar */}
              <div className="p-4 pb-2 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-muted-foreground">
                  {table.code}
                </span>
                <Badge variant={table.is_occupied ? 'warning' : 'success'}>
                  {table.is_occupied ? 'Sedang Terisi' : 'Kosong'}
                </Badge>
              </div>

              {/* Table Info */}
              <div className="px-4 py-3">
                <h3 className="text-base font-bold text-foreground">{table.name}</h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" /> Kapasitas {table.capacity} Orang
                  </span>
                  {Number(table.active_orders_count || 0) > 0 && (
                    <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-semibold">
                      <Clock className="size-3.5" /> {table.active_orders_count} Pesanan Aktif
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-3 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-1">
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => openQrModal(table)}
                  className="text-xs gap-1 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                >
                  <QrIcon className="size-3.5" /> QR Code
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(table)}
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    title="Edit Meja"
                  >
                    <Edit2 className="size-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTable(table.id)}
                    className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    title="Hapus Meja"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Table Dialog */}
      <Dialog open={formModalOpen} onOpenChange={setFormModalOpen}>
        <DialogContent onClose={() => setFormModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editingTable ? 'Edit Data Meja' : 'Tambah Meja Baru'}</DialogTitle>
            <DialogDescription>
              {editingTable
                ? 'Perbarui nomor atau nama meja outlet'
                : 'Buat meja baru. Token QR code aktif perdana akan di-generate otomatis.'}
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="size-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSaveTable} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Nama Meja</label>
              <Input
                placeholder="Mis: Meja 01 atau Meja VIP Lantai 2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Kode Singkat</label>
                <Input
                  placeholder="M01"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Kapasitas Kursi</label>
                <Input
                  type="number"
                  placeholder="4"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  min="1"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormModalOpen(false)} disabled={saving}>
                Batal
              </Button>
              <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Menyimpan...
                  </>
                ) : (
                  'Simpan Meja'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Code Inspection Dialog */}
      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent onClose={() => setQrModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>QR Code Meja: {selectedTableForQr?.name}</DialogTitle>
            <DialogDescription>
              Kode ({selectedTableForQr?.code}) — Pelanggan dapat memindai QR ini untuk self-order langsung dari meja
            </DialogDescription>
          </DialogHeader>

          {qrError && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="size-4 shrink-0" />
              <span>{qrError}</span>
            </div>
          )}

          {loadingQr ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="size-7 animate-spin text-amber-600" />
              <span className="text-xs">Menyiapkan token QR meja...</span>
            </div>
          ) : activeQr ? (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-border flex flex-col items-center justify-center text-center">
                {/* Real Scannable QR Code */}
                <div className="p-3.5 bg-white rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-700">
                  <QRCodeSVG
                    value={qrOrderUrl}
                    size={192}
                    level="H"
                    includeMargin={false}
                    className="rounded-lg"
                  />
                </div>

                <div className="mt-3 text-center">
                  <span className="text-xs font-bold text-foreground">
                    {selectedTableForQr?.name} ({selectedTableForQr?.code})
                  </span>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Arahkan kamera smartphone ke kode di atas untuk memesan
                  </p>
                </div>

                {/* Copy URL bar */}
                <div className="flex items-center gap-2 w-full max-w-sm mt-3 bg-background p-1.5 rounded-xl border border-border">
                  <input
                    readOnly
                    value={qrOrderUrl}
                    className="bg-transparent text-[11px] font-mono flex-1 px-2 outline-hidden select-all text-muted-foreground truncate"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-2.5 text-xs text-amber-600 hover:text-amber-700"
                    onClick={handleCopyUrl}
                  >
                    {copied ? <Check className="size-3.5 text-emerald-600 mr-1" /> : <Copy className="size-3.5 mr-1" />}
                    {copied ? 'Tersalin' : 'Salin'}
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrintQr}
                  className="text-xs"
                >
                  <Printer className="size-3.5 mr-1.5" /> Cetak QR
                </Button>

                <Link
                  href={ROUTES.PUBLIC.QR_ORDER(activeQr.token)}
                  target="_blank"
                  className="w-full"
                >
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <ExternalLink className="size-3.5 mr-1.5" /> Buka Menu
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRotateQr}
                  disabled={generatingQr}
                  className="text-xs text-amber-700 dark:text-amber-300"
                >
                  <RefreshCw className={`size-3.5 mr-1.5 ${generatingQr ? 'animate-spin' : ''}`} /> Rotasi QR
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-xs space-y-3">
              <p>Belum ada token QR aktif untuk meja ini.</p>
              <Button
                onClick={handleRotateQr}
                disabled={generatingQr}
                className="bg-amber-600 hover:bg-amber-700 text-white"
                size="sm"
              >
                {generatingQr ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Menghasilkan QR...
                  </>
                ) : (
                  'Generate QR Sekarang'
                )}
              </Button>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setQrModalOpen(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
