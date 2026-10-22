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
} from 'lucide-react';
import { Customer, CustomerSegmentation, CustomerStatus } from '@/types/customer';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { SearchInput } from '@/components/common/SearchInput';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { CustomerDetailDrawer } from '@/components/customers/CustomerDetailDrawer';
import { AddCustomerDrawer } from '@/components/customers/AddCustomerDrawer';
import { formatRupiah } from '@/utils';

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c-1',
    name: 'Andi Pratama',
    initials: 'AP',
    joinDate: 'Bergabung 12 Jan 2024',
    phone: '0812 3456 7890',
    email: 'andip@gmail.com',
    totalTransactions: 12,
    totalSpent: 560000,
    segmentation: 'VIP',
    status: 'Aktif',
    birthDate: '12 Mei 1995',
    gender: 'Laki-laki',
    notes:
      'Pelanggan loyal, biasanya pesan kopi susu tanpa gula. Lebih suka duduk di area indoor dan sesekali memesan pastry.',
    address: 'Jl. Melati No. 25, Menteng, Jakarta Pusat',
  },
  {
    id: 'c-2',
    name: 'Siti Rahma',
    initials: 'SR',
    joinDate: 'Bergabung 12 Jan 2024',
    phone: '0814 3435 7890',
    email: 'sitir@gmail.com',
    totalTransactions: 8,
    totalSpent: 280000,
    segmentation: 'Regular',
    status: 'Aktif',
    birthDate: '24 Oktober 1997',
    gender: 'Perempuan',
    notes: 'Suka matcha latte dingin dengan oatmilk.',
    address: 'Jl. Tebet Barat Dalam No. 14, Jakarta Selatan',
  },
  {
    id: 'c-3',
    name: 'Budi Santoso',
    initials: 'BS',
    joinDate: 'Bergabung 12 Jan 2024',
    phone: '0812 3456 7890',
    email: 'budis@gmail.com',
    totalTransactions: 25,
    totalSpent: 1250000,
    segmentation: 'VIP',
    status: 'Aktif',
    birthDate: '03 Maret 1990',
    gender: 'Laki-laki',
    notes: 'Sering meeting di meja 4, langganan manual brew V60.',
    address: 'Apartemen Sudirman Tower A Lt. 12, Jakarta Pusat',
  },
  {
    id: 'c-4',
    name: 'Maya Putri',
    initials: 'MP',
    joinDate: 'Bergabung 12 Jan 2024',
    phone: '0812 3456 7890',
    email: 'maput@gmail.com',
    totalTransactions: 3,
    totalSpent: 120000,
    segmentation: 'Baru',
    status: 'Aktif',
    birthDate: '18 September 2001',
    gender: 'Perempuan',
    notes: 'Pelanggan baru dari program promo Instagram.',
    address: 'Jl. Kemang Raya No. 45, Jakarta Selatan',
  },
  {
    id: 'c-5',
    name: 'Rizky Aditya',
    initials: 'RA',
    joinDate: 'Bergabung 12 Jan 2024',
    phone: '0812 3456 7890',
    email: 'riad@gmail.com',
    totalTransactions: 6,
    totalSpent: 210000,
    segmentation: 'Regular',
    status: 'Nonaktif',
    birthDate: '11 Juli 1998',
    gender: 'Laki-laki',
    notes: 'Akun dinonaktifkan sementara atas permintaan pengguna.',
    address: 'Jl. Rawamangun No. 88, Jakarta Timur',
  },
  {
    id: 'c-6',
    name: 'Dewi Lestari',
    initials: 'DL',
    joinDate: 'Bergabung 12 Jan 2024',
    phone: '0812 3456 7890',
    email: 'dele@gmail.com',
    totalTransactions: 18,
    totalSpent: 890000,
    segmentation: 'VIP',
    status: 'Aktif',
    birthDate: '29 Desember 1992',
    gender: 'Perempuan',
    notes: 'Pelanggan VIP, selalu memesan pastry artisan dan cold brew.',
    address: 'Jl. Cipete Raya No. 19, Jakarta Selatan',
  },
  {
    id: 'c-7',
    name: 'Fajar Maulana',
    initials: 'FM',
    joinDate: 'Bergabung 12 Jan 2024',
    phone: '0812 3456 7890',
    email: 'fama@gmail.com',
    totalTransactions: 2,
    totalSpent: 80000,
    segmentation: 'Baru',
    status: 'Aktif',
    birthDate: '07 April 2002',
    gender: 'Laki-laki',
    notes: 'Mahasiswa, sering belajar di area smoking luar.',
    address: 'Jl. Salemba Tengah No. 3, Jakarta Pusat',
  },
  {
    id: 'c-8',
    name: 'Lina Marlina',
    initials: 'LM',
    joinDate: 'Bergabung 12 Jan 2024',
    phone: '0812 3456 7890',
    email: 'lima@gmail.com',
    totalTransactions: 9,
    totalSpent: 340000,
    segmentation: 'Regular',
    status: 'Aktif',
    birthDate: '14 Februari 1994',
    gender: 'Perempuan',
    notes: 'Penyuka latte art manis dan red velvet cake.',
    address: 'Jl. Gandaria I No. 10, Jakarta Selatan',
  },
  {
    id: 'c-9',
    name: 'Yoga Pratama',
    initials: 'YP',
    joinDate: 'Bergabung 12 Jan 2024',
    phone: '0812 3456 7890',
    email: 'yoma@gmail.com',
    totalTransactions: 4,
    totalSpent: 150000,
    segmentation: 'Regular',
    status: 'Aktif',
    birthDate: '22 Agustus 1999',
    gender: 'Laki-laki',
    notes: 'Langganan es kopi susu pandan.',
    address: 'Jl. Senopati No. 50, Jakarta Selatan',
  },
  {
    id: 'c-10',
    name: 'Nisa Amalia',
    initials: 'NA',
    joinDate: 'Bergabung 12 Jan 2024',
    phone: '0812 3456 7890',
    email: 'nisa@gmail.com',
    totalTransactions: 47,
    totalSpent: 290000,
    segmentation: 'Regular',
    status: 'Aktif',
    birthDate: '05 Januari 1996',
    gender: 'Perempuan',
    notes: 'Langganan takeaway pagi sebelum berangkat kantor.',
    address: 'Jl. Palmerah Barat No. 12, Jakarta Barat',
  },
];

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
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

  const handleSaveCustomer = (updated: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  const handleDeleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleAddCustomer = (newCustomer: Customer) => {
    setCustomers((prev) => [newCustomer, ...prev]);
  };

  // Quick action: Toggle Status
  const handleToggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
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

        <div className="flex items-center gap-2.5">
          {/* Quick Demo Toggle between populated data and empty state */}
          <div className="hidden md:flex items-center border border-neutral-200 rounded-lg p-0.5 bg-neutral-50 text-[11px]">
            <button
              type="button"
              onClick={() => setCustomers(INITIAL_CUSTOMERS)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                customers.length > 0
                  ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Ada Data ({customers.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomers([]);
                setSelectedIds([]);
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                customers.length === 0
                  ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Kosong (Empty State)
            </button>
          </div>

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
        pageSizeOptions={[10, 20, 50]}
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
