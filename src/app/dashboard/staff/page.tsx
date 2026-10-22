'use client';

import React, { useState, useMemo } from 'react';
import {
  Users,
  ShieldCheck,
  History,
  Plus,
  UserPlus,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  LayoutGrid,
} from 'lucide-react';
import { StaffMember, StaffRole, StaffStatus } from '@/types/staff';
import { Button } from '@/components/common/Button';
import { Select } from '@/components/common/Select';
import { SearchInput } from '@/components/common/SearchInput';
import { DataTable, ColumnDef } from '@/components/common/DataTable';
import { StaffDetailDrawer } from '@/components/staff/StaffDetailDrawer';
import { AddStaffDrawer } from '@/components/staff/AddStaffDrawer';
import { RolePermissionTab } from '@/components/staff/RolePermissionTab';
import { LoginActivityTab } from '@/components/staff/LoginActivityTab';

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 's-1',
    name: 'Siti Nurhaliza',
    initials: 'AP',
    email: 'siti@kopimantap.id',
    phone: '08121232423457',
    role: 'Owner',
    status: 'Aktif',
    lastLogin: '7 Okt 2026, 15:00',
    permissions: ['pos', 'menu', 'tables', 'inventory', 'reports'],
  },
  {
    id: 's-2',
    name: 'Andi Pratama',
    initials: 'SR',
    email: 'andi@kopimantap.id',
    phone: '08121232423457',
    role: 'Manager',
    status: 'Aktif',
    lastLogin: '7 Okt 2026, 15:00',
    permissions: ['pos', 'menu', 'tables', 'inventory', 'reports'],
  },
  {
    id: 's-3',
    name: 'Dewi Lestari',
    initials: 'BS',
    email: 'dewi@kopimantap.id',
    phone: '08121232423457',
    role: 'Kasir',
    status: 'Aktif',
    lastLogin: '7 Okt 2026, 15:00',
    permissions: ['pos', 'tables'],
  },
  {
    id: 's-4',
    name: 'Rizky Maulan',
    initials: 'MP',
    email: 'rizky@kopimantap.id',
    phone: '08121232423457',
    role: 'Kasir',
    status: 'Aktif',
    lastLogin: '7 Okt 2026, 15:00',
    permissions: ['pos', 'tables'],
  },
  {
    id: 's-5',
    name: 'Budi Santoso',
    initials: 'RA',
    email: 'budi@kopimantap.id',
    phone: '08121232423457',
    role: 'Dapur',
    status: 'Nonaktif',
    lastLogin: '7 Okt 2026, 15:00',
    permissions: ['pos'],
  },
  {
    id: 's-6',
    name: 'Ana Fitri',
    initials: 'DL',
    email: 'ana@kopimantap.id',
    phone: '08121232423457',
    role: 'Barista',
    status: 'Aktif',
    lastLogin: '7 Okt 2026, 15:00',
    permissions: ['pos'],
  },
  {
    id: 's-7',
    name: 'Rina Amelia',
    initials: 'FM',
    email: 'rina@kopimantap.id',
    phone: '08121232423457',
    role: 'Dapur',
    status: 'Aktif',
    lastLogin: '7 Okt 2026, 15:00',
    permissions: ['pos'],
  },
  {
    id: 's-8',
    name: 'Tono Haryadi',
    initials: 'LM',
    email: 'tono@kopimantap.id',
    phone: '08121232423457',
    role: 'Kasir',
    status: 'Aktif',
    lastLogin: '7 Okt 2026, 15:00',
    permissions: ['pos', 'tables'],
  },
  {
    id: 's-9',
    name: 'Muhammad Fajar',
    initials: 'YP',
    email: 'fajar@kopimantap.id',
    phone: '08121232423457',
    role: 'Server',
    status: 'Aktif',
    lastLogin: '7 Okt 2026, 15:00',
    permissions: ['tables'],
  },
];

type ActiveTab = 'staff' | 'roles' | 'activity';

export default function StaffPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('staff');
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Drawer states
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addMode, setAddMode] = useState<'add' | 'invite'>('add');

  // Action menu popover state
  const [actionMenuOpenId, setActionMenuOpenId] = useState<string | null>(null);

  // Filtered staff
  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q);

      const matchRole = selectedRole === 'ALL' || s.role === selectedRole;
      const matchStatus = selectedStatus === 'ALL' || s.status === selectedStatus;

      return matchSearch && matchRole && matchStatus;
    });
  }, [staffList, searchQuery, selectedRole, selectedStatus]);

  // Paginated items
  const paginatedStaff = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredStaff.slice(start, start + pageSize);
  }, [filteredStaff, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredStaff.length / pageSize) || 1;

  // Handlers
  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === paginatedStaff.length && paginatedStaff.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedStaff.map((s) => s.id));
    }
  };

  const handleRowClick = (staff: StaffMember) => {
    setSelectedStaff(staff);
    setIsDetailOpen(true);
  };

  const handleSaveStaff = (updated: StaffMember) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );
  };

  const handleDeleteStaff = (id: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== id));
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  const handleAddStaff = (newStaff: StaffMember) => {
    setStaffList((prev) => [newStaff, ...prev]);
  };

  const handleToggleStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: s.status === 'Aktif' ? 'Nonaktif' : 'Aktif' }
          : s
      )
    );
    setActionMenuOpenId(null);
  };

  // Role badges rendering matching Screenshot 3
  const renderRoleBadge = (role: StaffRole) => {
    switch (role) {
      case 'Owner':
        return (
          <span className="font-semibold text-rose-600 text-xs">
            Owner
          </span>
        );
      case 'Manager':
        return (
          <span className="font-semibold text-blue-600 text-xs">
            Manager
          </span>
        );
      case 'Kasir':
        return (
          <span className="font-semibold text-purple-600 text-xs">
            Kasir
          </span>
        );
      case 'Dapur':
        return (
          <span className="font-semibold text-amber-600 text-xs">
            Dapur
          </span>
        );
      case 'Barista':
        return (
          <span className="font-semibold text-emerald-600 text-xs">
            Barista
          </span>
        );
      case 'Server':
        return (
          <span className="font-semibold text-sky-600 text-xs">
            Server
          </span>
        );
      default:
        return <span className="text-xs text-neutral-600">{role}</span>;
    }
  };

  // Columns definition matching Screenshot 3
  const columns: ColumnDef<StaffMember>[] = [
    {
      key: 'name',
      header: 'Nama',
      className: 'w-[28%]',
      render: (item) => (
        <div className="flex items-center gap-3 py-1">
          <div className="size-9 rounded-full bg-[#FFEFEF] text-[#FF5C38] font-bold text-xs flex items-center justify-center shrink-0 border border-rose-100">
            {item.initials}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-neutral-900 text-[13px] leading-tight truncate">
              {item.name}
            </p>
            <p className="text-[11px] text-neutral-400 mt-0.5 truncate">
              {item.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Peran',
      className: 'w-[16%]',
      render: (item) => renderRoleBadge(item.role),
    },
    {
      key: 'contact',
      header: 'Kontak',
      className: 'w-[18%]',
      render: (item) => (
        <span className="text-xs text-neutral-800 font-medium">
          {item.phone}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      className: 'w-[14%]',
      render: (item) => {
        if (item.status === 'Aktif') {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="size-3 text-emerald-600" />
              Aktif
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-600 bg-neutral-100 border border-neutral-300 px-2.5 py-0.5 rounded-full">
            <XCircle className="size-3 text-neutral-400" />
            Nonaktif
          </span>
        );
      },
    },
    {
      key: 'lastLogin',
      header: 'Terakhir Login',
      className: 'w-[20%]',
      render: (item) => (
        <span className="text-xs text-neutral-600">
          {item.lastLogin}
        </span>
      ),
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
                  handleDeleteStaff(item.id);
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
      {/* Top Header matching Screenshot 1, 2, 3 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-neutral-900 tracking-tight">
            Staff & Akses
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Kelola data staf, peran, dan hak akses sesuai kebutuhan operasional outlet
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Quick Demo Switcher */}
          <div className="hidden md:flex items-center border border-neutral-200 rounded-lg p-0.5 bg-neutral-50 text-[11px]">
            <button
              type="button"
              onClick={() => setStaffList(INITIAL_STAFF)}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                staffList.length > 0
                  ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Ada Data ({staffList.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setStaffList([]);
                setSelectedIds([]);
              }}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                staffList.length === 0
                  ? 'bg-white text-neutral-900 font-semibold shadow-2xs'
                  : 'text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Kosong (Empty State)
            </button>
          </div>

          <Button
            variant="secondary"
            onClick={() => {
              setAddMode('invite');
              setIsAddOpen(true);
            }}
            className="text-xs font-semibold px-4 py-2"
            leftIcon={<UserPlus className="size-4" />}
          >
            Undang Staff
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              setAddMode('add');
              setIsAddOpen(true);
            }}
            className="bg-[#FF5C38] hover:bg-[#E04B28] text-xs font-semibold px-4 py-2"
            leftIcon={<Plus className="size-4" />}
          >
            Tambah Staff
          </Button>
        </div>
      </div>

      {/* Tabs matching Screenshot 1 & 3 */}
      <div className="flex items-center border-b border-neutral-200/80 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('staff')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
            activeTab === 'staff'
              ? 'border-[#FF5C38] text-[#FF5C38]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Users className="size-4" />
          Daftar Staff
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
            activeTab === 'roles'
              ? 'border-[#FF5C38] text-[#FF5C38]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <LayoutGrid className="size-4" />
          Peran & Hak Akses
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 ${
            activeTab === 'activity'
              ? 'border-[#FF5C38] text-[#FF5C38]'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <History className="size-4" />
          Aktivitas Login
        </button>
      </div>

      {/* Tab 1: Daftar Staff */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          {/* Filter Row matching Screenshot 1 & 3 */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Role Filter */}
              <div className="w-44">
                <Select
                  size="sm"
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="ALL">Semua peran</option>
                  <option value="Owner">Owner</option>
                  <option value="Manager">Manager</option>
                  <option value="Kasir">Kasir</option>
                  <option value="Dapur">Dapur</option>
                  <option value="Barista">Barista</option>
                  <option value="Server">Server</option>
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
                placeholder="Cari nama bahan, SKU, atau kategori"
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

          {/* Data Table */}
          <DataTable<StaffMember>
            columns={columns}
            data={paginatedStaff}
            keyExtractor={(item) => item.id}
            selectable
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onRowClick={handleRowClick}
            showPagination={filteredStaff.length > 0}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            pageSizeOptions={[10, 20, 50]}
            totalItems={filteredStaff.length}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setCurrentPage(1);
            }}
            emptyTitle="BELUM ADA STAFF"
            emptyDescription="Undang anggota tim untuk membantu mengelola operasional outlet dan berikan akses sesuai peran mereka."
            entityName="staf"
          />
        </div>
      )}

      {/* Tab 2: Peran & Hak Akses */}
      {activeTab === 'roles' && <RolePermissionTab />}

      {/* Tab 3: Aktivitas Login */}
      {activeTab === 'activity' && <LoginActivityTab />}

      {/* Staff Detail Drawer matching Screenshot 2 */}
      <StaffDetailDrawer
        staff={selectedStaff}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedStaff(null);
        }}
        onSave={handleSaveStaff}
        onDelete={handleDeleteStaff}
      />

      {/* Add / Invite Staff Drawer */}
      <AddStaffDrawer
        isOpen={isAddOpen}
        mode={addMode}
        onClose={() => setIsAddOpen(false)}
        onAdd={handleAddStaff}
      />
    </div>
  );
}
