'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Store as StoreIcon,
  Users,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  Building,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { tenantService } from '@/services';
import { Store, User } from '@/types';
import { ApiError } from '@/lib/api';
import { PageHeader, LoadingScreen } from '@/components/common';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

type SettingsTab = 'tenant' | 'stores' | 'team';

export default function SettingsPage() {
  const router = useRouter();
  const { user, activeTenant, isLoading } = useAuth();
  const { stores, refreshStores } = useStore();

  const roleName = user?.is_internal ? 'SUPER_ADMIN' : activeTenant?.role?.toUpperCase();
  const isOwner = roleName === 'SUPER_ADMIN' || roleName === 'OWNER';

  useEffect(() => {
    if (isLoading) return;
    if (!isOwner) {
      if (roleName === 'CASHIER') {
        router.replace('/dashboard/pos');
      } else if (roleName === 'INVENTORY') {
        router.replace('/dashboard/inventory');
      } else {
        router.replace('/dashboard');
      }
    }
  }, [isOwner, roleName, isLoading, router]);

  const [activeTab, setActiveTab] = useState<SettingsTab>('tenant');
  const [loading, setLoading] = useState(true);

  // Tenant Profile State
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantAddress, setTenantAddress] = useState('');
  const [savingTenant, setSavingTenant] = useState(false);
  const [tenantSavedSuccess, setTenantSavedSuccess] = useState(false);

  // Store Outlet Modal State
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [stName, setStName] = useState('');
  const [stCode, setStCode] = useState('');
  const [stPhone, setStPhone] = useState('');
  const [stAddress, setStAddress] = useState('');
  const [stTimezone, setStTimezone] = useState('Asia/Jakarta');
  const [savingStore, setSavingStore] = useState(false);
  const [storeError, setStoreError] = useState<string | null>(null);

  // Team Members State
  const [teamUsers, setTeamUsers] = useState<User[]>([]);

  const loadSettingsData = useCallback(async () => {
    if (!isOwner) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [profRes, usersRes] = await Promise.all([
        tenantService.getProfile(),
        tenantService.getTeamUsers(),
      ]);

      const prof = profRes.data;
      if (prof) {
        setTenantName(prof.name || '');
        setTenantPhone(prof.phone || '');
        setTenantAddress(prof.address || '');
      }

      setTeamUsers(usersRes.data || []);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }, [isOwner]);

  useEffect(() => {
    loadSettingsData();
  }, [loadSettingsData]);

  // Save Tenant Profile
  const handleSaveTenantProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTenant(true);
    setTenantSavedSuccess(false);
    try {
      await tenantService.updateProfile({
        name: tenantName,
        phone: tenantPhone,
        address: tenantAddress,
      });
      setTenantSavedSuccess(true);
      setTimeout(() => setTenantSavedSuccess(false), 3000);
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setSavingTenant(false);
    }
  };

  // Open Store Modal
  const openAddStoreModal = () => {
    setEditingStoreId(null);
    setStName('');
    setStCode(`OUT-${String(stores.length + 1).padStart(2, '0')}`);
    setStPhone('');
    setStAddress('');
    setStTimezone('Asia/Jakarta');
    setStoreError(null);
    setStoreModalOpen(true);
  };

  const openEditStoreModal = (st: Store) => {
    setEditingStoreId(st.id);
    setStName(st.name);
    setStCode(st.code);
    setStPhone(st.phone || '');
    setStAddress(st.address || '');
    setStTimezone(st.timezone || 'Asia/Jakarta');
    setStoreError(null);
    setStoreModalOpen(true);
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingStore(true);
    setStoreError(null);
    try {
      const payload = {
        name: stName,
        code: stCode,
        phone: stPhone || null,
        address: stAddress || null,
        timezone: stTimezone,
      };

      if (editingStoreId) {
        await tenantService.updateStore(editingStoreId, payload);
      } else {
        await tenantService.createStore(payload);
      }
      setStoreModalOpen(false);
      refreshStores();
    } catch (err: unknown) {
      if (err instanceof ApiError) setStoreError(err.message);
      else setStoreError((err as Error).message);
    } finally {
      setSavingStore(false);
    }
  };

  const handleDeleteStore = async (id: string) => {
    if (!confirm('Yakin ingin menghapus outlet toko ini?')) return;
    try {
      await tenantService.deleteStore(id);
      refreshStores();
    } catch (err: unknown) {
      alert((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Pengaturan Sistem & Bisnis"
        description="Kelola profil identitas bisnis tenant, cabang outlet toko multi-store, dan hak akses staf"
      >
        <Button variant="outline" size="sm" onClick={loadSettingsData} disabled={loading}>
          <RefreshCw className={`size-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
        {activeTab === 'stores' && (
          <Button onClick={openAddStoreModal} className="bg-primary hover:bg-primary/90 text-primary-foreground" size="sm">
            <Plus className="size-4 mr-1.5" /> Tambah Outlet Toko
          </Button>
        )}
      </PageHeader>

      {/* Tabs Toolbar */}
      <div className="flex items-center gap-1.5 border-b border-border pb-3 overflow-x-auto">
        {[
          { id: 'tenant', label: 'Profil Bisnis Tenant', icon: Building },
          { id: 'stores', label: `Daftar Outlet Toko (${stores.length})`, icon: StoreIcon },
          { id: 'team', label: `Anggota Tim & Staf (${teamUsers.length})`, icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                isCurrent
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingScreen message="Memuat konfigurasi outlet..." />
      ) : (
        <>
          {/* TAB 1: TENANT PROFILE */}
          {activeTab === 'tenant' && (
            <Card className="max-w-2xl">
              <CardHeader>
                <CardTitle>Profil Tenant Bisnis</CardTitle>
                <CardDescription>
                  Informasi legalitas dan identitas usaha yang tertera pada invoice serta struk pelanggan
                </CardDescription>
              </CardHeader>

              <form onSubmit={handleSaveTenantProfile}>
                <CardContent className="space-y-4">
                  {tenantSavedSuccess && (
                    <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>Profil tenant berhasil diperbarui!</span>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Nama Bisnis Tenant
                    </label>
                    <Input
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="Kopi Nusantara Group"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Nomor Telepon Kantor
                    </label>
                    <Input
                      value={tenantPhone}
                      onChange={(e) => setTenantPhone(e.target.value)}
                      placeholder="081299998888"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">
                      Alamat Kantor Pusat
                    </label>
                    <Input
                      value={tenantAddress}
                      onChange={(e) => setTenantAddress(e.target.value)}
                      placeholder="Jl. Senopati Raya No. 45, Jakarta Selatan"
                    />
                  </div>
                </CardContent>

                <CardFooter className="border-t border-border/50 pt-4 flex justify-end">
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={savingTenant}>
                    <Save className="size-3.5 mr-1.5" />
                    {savingTenant ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* TAB 2: STORES MANAGEMENT */}
          {activeTab === 'stores' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stores.map((st) => (
                  <Card key={st.id} className="p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="font-mono text-xs font-bold">
                          {st.code}
                        </Badge>
                        <Badge variant="success">AKTIF</Badge>
                      </div>
                      <h3 className="text-base font-bold text-foreground">{st.name}</h3>
                      {st.address && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {st.address}
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground mt-2 font-mono">
                        {st.phone || 'No phone registered'}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {st.timezone || 'Asia/Jakarta'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditStoreModal(st)}
                          className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Edit Outlet"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteStore(st.id)}
                          className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Hapus Outlet"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: TEAM MEMBERS */}
          {activeTab === 'team' && (
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Anggota</TableHead>
                    <TableHead>Alamat Email</TableHead>
                    <TableHead>Hak Akses / Role</TableHead>
                    <TableHead>Status Akun</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamUsers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-semibold text-foreground">
                        {member.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {member.email}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-semibold">
                          {member.is_internal ? 'SUPER ADMIN' : 'STAFF'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.is_active ? 'success' : 'destructive'}>
                          {member.is_active ? 'AKTIF' : 'NON-AKTIF'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </>
      )}

      {/* Store Create / Edit Dialog */}
      <Dialog open={storeModalOpen} onOpenChange={setStoreModalOpen}>
        <DialogContent onClose={() => setStoreModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editingStoreId ? 'Edit Outlet Toko' : 'Tambah Outlet Toko Baru'}</DialogTitle>
            <DialogDescription>
              Outlet toko baru akan memiliki ruang isolasi data terpisah untuk pesanan dan meja
            </DialogDescription>
          </DialogHeader>

          {storeError && (
            <div className="mb-4 flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
              <AlertCircle className="size-4 shrink-0" />
              <span>{storeError}</span>
            </div>
          )}

          <form onSubmit={handleSaveStore} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Nama Toko</label>
              <Input
                placeholder="Mis: Outlet Senayan City"
                value={stName}
                onChange={(e) => setStName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Kode Singkat Toko</label>
                <Input
                  placeholder="SCBD-01"
                  value={stCode}
                  onChange={(e) => setStCode(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Nomor Telepon</label>
                <Input
                  placeholder="021-5551234"
                  value={stPhone}
                  onChange={(e) => setStPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Alamat Lengkap</label>
              <Input
                placeholder="Mall Senayan City Lt. LG No. 12"
                value={stAddress}
                onChange={(e) => setStAddress(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setStoreModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={savingStore}>
                {savingStore ? 'Menyimpan...' : 'Simpan Toko'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
