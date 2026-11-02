'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { Customer, CustomerSegmentation, CustomerStatus } from '@/types/customer';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { SearchInput } from '@/components/common/SearchInput';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { PageLoader } from '@/components/common/PageLoader';
import { CustomerDetailDrawer } from '@/components/customers/CustomerDetailDrawer';
import { AddCustomerDrawer } from '@/components/customers/AddCustomerDrawer';
import { formatRupiah } from '@/utils';
import { tenantService } from '@/services/tenant.service';
import { useToast } from '@/context/ToastContext';

export default function CustomersPage() {
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegmentation, setSelectedSegmentation] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Action menu popover state
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  const mapCustomerList = (rawList: any[]): Customer[] =>
    rawList.map((c: any) => ({
      id: c.id,
      name: c.name,
      initials: (c.name || 'P')
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      joinDate: c.created_at
        ? 'Bergabung ' +
          new Date(c.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
        : 'Bergabung 2024',
      phone: c.phone || '-',
      email: c.email || '-',
      totalTransactions: Number(c.total_visits) || 0,
      totalSpent: Number(c.total_spent) || 0,
      segmentation:
        c.segmentation === 'VIP' || c.tier === 'Gold'
          ? 'VIP'
          : c.segmentation === 'Regular' || c.segmentation === 'Reguler' || c.tier === 'Silver'
          ? 'Regular'
          : 'Baru',
      status: c.status || 'Aktif',
      birthDate: c.birth_date || '-',
      gender: c.gender || 'Laki-laki',
      notes:
        c.notes ||
        (c.points
          ? `Member ${c.tier} (${c.points} poin)`
          : 'Terdaftar otomatis dari transaksi pesanan'),
      address: c.address || '-',
      avatarUrl: c.avatar_url || undefined,
      transactions: Array.isArray(c.transactions) ? c.transactions : [],
    }));

  // Fetch live customers from backend on mount (backend auto-syncs from orders)
  const fetchCustomers = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await tenantService.getCustomers();
      if (res?.data) {
        setCustomers(mapCustomerList(res.data));
      }
    } catch {
      // Keep empty list when the API is unreachable
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSyncFromOrders = async () => {
    try {
      setIsSyncing(true);
      const syncRes = await tenantService.syncCustomers();
      const res = await tenantService.getCustomers();
      if (res?.data) {
        setCustomers(mapCustomerList(res.data));
      }
      const stats = syncRes?.data;
      toast.success(
        stats
          ? `Sinkronisasi selesai! ${stats.total_customers ?? 0} pelanggan aktif (${stats.linked_orders ?? 0} pesanan baru ditautkan, ${stats.merged_customers ?? 0} data duplikat digabung).`
          : 'Data pelanggan berhasil disinkronkan dari riwayat transaksi!'
      );
    } catch {
      toast.error('Gagal menyinkronkan data pelanggan dari transaksi.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter logic
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      // Search
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q);

      // Segmentation
      const matchSegment =
        selectedSegmentation === 'ALL' || c.segmentation === selectedSegmentation;

      // Status
      const matchStatus =
        selectedStatus === 'ALL' || c.status === selectedStatus;

      return matchSearch && matchSegment && matchStatus;
    });
  }, [customers, searchQuery, selectedSegmentation, selectedStatus]);

  // Paginated items
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(startIndex, startIndex + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredCustomers.length / pageSize) || 1;

  // Handlers
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedCustomers.length && paginatedCustomers.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCustomers.map((c) => c.id));
    }
  };

  const handleRowClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDetailOpen(true);
  };

  const handleSaveCustomer = async (updated: Customer) => {
    try {
      await tenantService.updateCustomer(updated.id, {
        name: updated.name,
        phone: updated.phone,
        email: updated.email,
        status: updated.status,
        segmentation: updated.segmentation,
        gender: updated.gender,
        birth_date: updated.birthDate,
        notes: updated.notes,
        address: updated.address,
        avatar_url: updated.avatarUrl,
      });
    } catch {}

    setCustomers((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await tenantService.deleteCustomer(id);
    } catch {}

    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleAddCustomer = async (newCustomer: Customer) => {
    let createdId = newCustomer.id;
    try {
      const res = await tenantService.createCustomer({
        name: newCustomer.name,
        phone: newCustomer.phone,
        email: newCustomer.email,
        tier: newCustomer.segmentation === 'VIP' ? 'Gold' : newCustomer.segmentation === 'Regular' ? 'Silver' : 'Bronze',
        status: newCustomer.status || 'Aktif',
        segmentation: newCustomer.segmentation || 'Baru',
        gender: newCustomer.gender,
        birth_date: newCustomer.birthDate,
        notes: newCustomer.notes,
        address: newCustomer.address,
        avatar_url: newCustomer.avatarUrl,
      });
      if (res?.data?.id) {
        createdId = res.data.id;
      }
    } catch {}

    setCustomers((prev) => [{ ...newCustomer, id: createdId }, ...prev]);
  };

  // Quick action: Toggle Status
  const handleToggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    tenantService.toggleCustomerStatus(id).catch(console.error);
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, status: c.status === 'Aktif' ? 'Nonaktif' : 'Aktif' }
          : c
      )
    );
    setActionMenuOpenId(null);
  };

  // Columns definition matching Screenshot 3
  const columns: ColumnDef<Customer>[] = [
    {
      key: 'name',
      header: 'Nama Pelanggan',
      className: 'w-[28%]',
      render: (item) => (
        <div className="flex items-center gap-3 py-1">
          {/* Avatar circle matching Screenshot 3 */}
          <div className="size-9 rounded-full bg-[#FFEFEF] text-[#FF5C38] font-bold text-xs flex items-center justify-center shrink-0 border border-rose-100">
            {item.initials}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-neutral-900 text-[13px] leading-tight truncate">
              {item.name}
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              {item.joinDate}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Kontak',
      className: 'w-[22%]',
      render: (item) => (
        <div className="py-1">
          <p className="font-semibold text-neutral-800 text-xs">
            {item.phone}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            {item.email}
          </p>
        </div>
      ),
    },
    {
      key: 'totalTransactions',
      header: 'Total Transaksi',
      className: 'w-[12%]',
      render: (item) => (
        <span className="text-xs font-semibold text-neutral-700">
          {item.totalTransactions}
        </span>
      ),
    },
    {
      key: 'totalSpent',
      header: 'Total Belanja',
      className: 'w-[14%]',
      render: (item) => (
        <span className="text-xs font-semibold text-neutral-800">
          {formatRupiah(item.totalSpent)}
        </span>
      ),
    },
    {
      key: 'segmentation',
      header: 'Segmentasi',
      className: 'w-[10%]',
      render: (item) => {
        if (item.segmentation === 'VIP') {
          return (
            <span className="inline-block bg-rose-50 text-rose-600 border border-rose-200/60 font-semibold text-[11px] px-2 py-0.5 rounded">
              VIP
            </span>
          );
        }
        if (item.segmentation === 'Baru') {
          return (
            <span className="inline-block bg-emerald-50 text-emerald-600 border border-emerald-200/60 font-semibold text-[11px] px-2 py-0.5 rounded">
              Baru
            </span>
          );
        }
        return (
          <span className="inline-block bg-blue-50 text-blue-600 border border-blue-200/60 font-semibold text-[11px] px-2 py-0.5 rounded">
            Regular
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-[10%]',
      render: (item) => {
        if (item.status === 'Aktif') {
          return (
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="size-3 text-emerald-600" />
              Aktif
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-600 border border-neutral-300 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
            <XCircle className="size-3 text-neutral-400" />
            Nonaktif
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      className: 'w-[4%]',
      render: (item) => (
        <div className="relative flex justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() =>
              setActionMenuOpenId((prev) => (prev === item.id ? null : item.id))
            }
            className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <MoreVertical className="size-4" />
          </button>

          {/* Action Menu Dropdown */}
          {actionMenuOpenId === item.id && (
            <div className="absolute right-0 top-8 z-30 w-36 bg-white rounded-lg shadow-lg border border-neutral-200 py-1 text-xs animate-in fade-in duration-150">
              <button
                type="button"
                onClick={() => {
                  setActionMenuOpenId(null);
                  handleRowClick(item);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
              >
                <Edit2 className="size-3.5 text-neutral-400" />
                Lihat Detail
              </button>

              <button
                type="button"
                onClick={(e) => handleToggleStatus(item.id, e)}
                className="w-full text-left px-3 py-1.5 hover:bg-neutral-50 flex items-center gap-2 text-neutral-700"
              >
                {item.status === 'Aktif' ? (
                  <>
                    <UserX className="size-3.5 text-neutral-400" />
                    Nonaktifkan
                  </>
                ) : (
                  <>
                    <UserCheck className="size-3.5 text-emerald-500" />
                    Aktifkan
                  </>
                )}
              </button>

              <div className="my-1 border-t border-neutral-100" />

              <button
                type="button"
                onClick={() => {
                  setActionMenuOpenId(null);
                  handleDeleteCustomer(item.id);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-rose-50 flex items-center gap-2 text-rose-600"
              >
                <Trash2 className="size-3.5" />
                Hapus
              </button>
            </div>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return <PageLoader text="Memuat data pelanggan..." />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header matching Screenshot 2 & 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Pelanggan
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Kelola data pelanggan untuk memberikan layanan yang lebih personal.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            onClick={handleSyncFromOrders}
            disabled={isSyncing}
            className="text-xs font-semibold px-3.5 py-2 border-neutral-200 bg-white hover:bg-neutral-50"
            leftIcon={<RefreshCw className={`size-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
          >
            {isSyncing ? 'Menyinkronkan...' : 'Sinkronkan dari Transaksi'}
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsAddOpen(true)}
            className="bg-[#FF5C38] hover:bg-[#E04B28] text-xs font-semibold px-4 py-2"
            leftIcon={<Plus className="size-4" />}
          >
            Tambah Pelanggan
          </Button>
        </div>
      </div>

      {/* Auto-Capture & Smart Deduplication Info Banner */}
      <div className="p-3.5 rounded-xl bg-orange-50/70 border border-orange-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-start sm:items-center gap-2.5 text-neutral-800">
          <Sparkles className="size-4 text-[#FF5C38] shrink-0 mt-0.5 sm:mt-0" />
          <span>
            <strong>Otomatis Terhubung dengan Transaksi POS &amp; QR Order:</strong> Pelanggan yang bertransaksi akan otomatis ditambahkan dan digabungkan berdasarkan <strong>kesamaan nomor HP</strong> dan <strong>kemiripan nama</strong>, lengkap dengan akumulasi kunjungan, total belanja, serta kenaikan tier otomatis (<em>Baru &rarr; Regular &rarr; VIP</em>).
          </span>
        </div>
      </div>

      {/* Filter Row matching Screenshot 2 & 3 */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Segment Filter */}
          <div className="w-44">
            <Select
              size="sm"
              value={selectedSegmentation}
              onChange={(e) => {
                setSelectedSegmentation(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">Semua Segmentasi</option>
              <option value="VIP">VIP</option>
              <option value="Regular">Regular</option>
              <option value="Baru">Baru</option>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-40">
            <Select
              size="sm"
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">Semua status</option>
              <option value="Aktif">Aktif</option>
              <option value="Nonaktif">Nonaktif</option>
            </Select>
          </div>
        </div>

        {/* Search Input */}
        <div className="w-full md:w-80">
          <SearchInput
            placeholder="Cari nama, nomor telepon, atau email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            onClear={() => {
              setSearchQuery('');
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* Data Table with built-in pagination matching Screenshot 3 */}
      <DataTable<Customer>
        columns={columns}
        data={paginatedCustomers}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onRowClick={handleRowClick}
        showPagination={filteredCustomers.length > 0}
        currentPage={currentPage}
        totalPages={totalPages}
        pageSize={pageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        totalItems={filteredCustomers.length}
        onPageChange={(p) => setCurrentPage(p)}
        onPageSizeChange={(s) => {
          setPageSize(s);
          setCurrentPage(1);
        }}
        emptyTitle="BELUM ADA PELANGGAN"
        emptyDescription="Data pelanggan yang melakukan transaksi akan muncul di sini, sehingga kamu dapat mengenali pelanggan dan memberikan layanan yang lebih personal."
        entityName="pelanggan"
      />

      {/* Customer Detail Drawer matching Screenshot 1 */}
      <CustomerDetailDrawer
        customer={selectedCustomer}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedCustomer(null);
        }}
        onSave={handleSaveCustomer}
        onDelete={handleDeleteCustomer}
      />

      {/* Add Customer Drawer */}
      <AddCustomerDrawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddCustomer}
      />
    </div>
  );
}
