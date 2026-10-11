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
  CheckCircle,
  Clock,
  ExternalLink,
  Printer,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import api, { ApiError } from '@/lib/api';
import { DiningTable, QrCode, ApiResponse } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
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

  const fetchTables = useCallback(async () => {
    if (!activeStore) return;
    setLoading(true);
    try {
      const res = await api.get<ApiResponse<DiningTable[]>>('/pos/tables');
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
        await api.put(`/pos/tables/${editingTable.id}`, {
          name,
          code,
          capacity: Number(capacity) || 4,
          status: 'ACTIVE',
        });
      } else {
        await api.post('/pos/tables', {
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
      await api.delete(`/pos/tables/${id}`);
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
    try {
      const res = await api.get<ApiResponse<QrCode[]>>(`/pos/tables/${t.id}/qr`);
      setQrList(res.data || []);
    } catch (err) {
      console.error('Failed to load QR tokens:', err);
    } finally {
      setLoadingQr(false);
    }
  };

  const handleRotateQr = async () => {
    if (!selectedTableForQr) return;
    setGeneratingQr(true);
    try {
      await api.post(`/pos/tables/${selectedTableForQr.id}/qr`);
      const res = await api.get<ApiResponse<QrCode[]>>(`/pos/tables/${selectedTableForQr.id}/qr`);
      setQrList(res.data || []);
      fetchTables();
    } catch (err: unknown) {
      alert((err as Error).message || 'Gagal rotasi QR');
    } finally {
      setGeneratingQr(false);
    }
  };

  const activeQr = qrList.find((q) => q.is_active);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Manajemen Meja & QR Self-Order
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola tata letak meja dine-in, status okupansi, dan token scan QR pelanggan
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTables} disabled={loading}>
            <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button onClick={openAddModal} className="bg-amber-600 hover:bg-amber-700 text-white" size="sm">
            <Plus className="size-4 mr-1.5" /> Tambah Meja
          </Button>
        </div>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-2">
          <Loader2 className="size-6 animate-spin text-amber-600" />
          <span className="text-xs">Memuat data meja...</span>
        </div>
      ) : tables.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <Grid className="size-12 mx-auto mb-3 opacity-30" />
          <h3 className="text-base font-semibold text-foreground">Belum ada meja</h3>
          <p className="text-xs mt-1">Tambahkan meja pertama Anda untuk mengaktifkan fitur dine-in dan QR self-order.</p>
          <Button onClick={openAddModal} className="mt-4 bg-amber-600 text-white" size="sm">
            Tambah Meja Baru
          </Button>
        </Card>
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

          {loadingQr ? (
            <div className="py-12 flex justify-center text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-amber-600" />
            </div>
          ) : activeQr ? (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-muted/40 border border-border flex flex-col items-center justify-center text-center">
                <div className="p-4 bg-white rounded-xl shadow-md border border-stone-200">
                  {/* Visual QR representation placeholder */}
                  <div className="size-48 bg-stone-900 rounded-lg flex flex-col items-center justify-center text-white p-3">
                    <QrIcon className="size-20 text-amber-400 mb-2" />
                    <span className="font-mono text-[10px] text-zinc-300 break-all px-2">
                      {activeQr.token.slice(0, 16)}...
                    </span>
                  </div>
                </div>

                <p className="mt-3 text-xs font-semibold text-foreground">
                  Scan untuk memesan di {selectedTableForQr?.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Token: <code className="font-mono bg-muted px-1 rounded">{activeQr.token}</code>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  href={`/q/${activeQr.token}`}
                  target="_blank"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full text-xs">
                    <ExternalLink className="size-3.5 mr-1.5" /> Uji Tampilan Self-Order
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  onClick={handleRotateQr}
                  disabled={generatingQr}
                  className="text-xs text-amber-700 dark:text-amber-300"
                >
                  <RefreshCw className={`size-3.5 mr-1.5 ${generatingQr ? 'animate-spin' : ''}`} /> Rotasi Token QR
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground text-xs">
              Belum ada token QR aktif untuk meja ini.
              <Button onClick={handleRotateQr} className="mt-3 bg-amber-600 text-white" size="sm">
                Generate QR Sekarang
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
