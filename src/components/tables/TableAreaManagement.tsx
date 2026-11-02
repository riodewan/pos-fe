'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Search,
  ChevronDown,
  Edit2,
  Trash2,
  X,
  Check,
  Bookmark,
  CheckCircle2,
} from 'lucide-react';
import { DataTable, ColumnDef, StatusBadge } from '@/components/common';
import { useToast } from '@/context/ToastContext';
import { posService } from '@/services/pos.service';

export interface AreaItem {
  id: string;
  name: string;
  code: string;
  tableCount: number;
  totalSeats: number;
  smokingAllowed: boolean;
  status: 'Aktif' | 'Nonaktif';
  description?: string;
}

const INITIAL_AREAS: AreaItem[] = [];

interface TableAreaManagementProps {
  onShowToast: (msg: string) => void;
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export function TableAreaManagement({
  onShowToast,
  isCreateOpen,
  onCloseCreate,
}: TableAreaManagementProps) {
  const { toast } = useToast();
  const [areas, setAreas] = useState<AreaItem[]>(INITIAL_AREAS);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Fetch areas from system settings API
  React.useEffect(() => {
    setIsLoading(true);
    posService
      .getTableAreas()
      .then((res) => {
        if (res?.data?.value) {
          try {
            const parsed = JSON.parse(res.data.value);
            if (Array.isArray(parsed)) {
              setAreas(parsed);
            }
          } catch (e) {
            console.error('Failed to parse table areas setting:', e);
          }
        }
      })
      .catch(() => {
        setAreas([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<AreaItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formSmoking, setFormSmoking] = useState(false);
  const [formStatus, setFormStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');
  const [formDescription, setFormDescription] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  React.useEffect(() => {
    if (isCreateOpen) {
      handleCreateNew();
    }
  }, [isCreateOpen]);

  const handleCreateNew = () => {
    setEditingArea(null);
    setFormName('');
    setFormCode('');
    setFormSmoking(false);
    setFormStatus('Aktif');
    setFormDescription('');
    setIsDrawerOpen(true);
  };

  const handleEdit = (item: AreaItem) => {
    setEditingArea(item);
    setFormName(item.name);
    setFormCode(item.code);
    setFormSmoking(item.smokingAllowed);
    setFormStatus(item.status);
    setFormDescription(item.description || '');
    setIsDrawerOpen(true);
  };

  const handleClose = () => {
    setIsDrawerOpen(false);
    setEditingArea(null);
    if (onCloseCreate) onCloseCreate();
  };

  const handleSave = (isDraft = false) => {
    if (!formName.trim()) {
      toast.warning('Nama area wajib diisi');
      return;
    }

    const code = formCode.trim().toUpperCase() || formName.substring(0, 3).toUpperCase();
    const status = isDraft ? 'Nonaktif' : formStatus;

    let nextAreas: AreaItem[];
    if (editingArea) {
      nextAreas = areas.map((a) =>
        a.id === editingArea.id
          ? {
              ...a,
              name: formName,
              code,
              smokingAllowed: formSmoking,
              status,
              description: formDescription,
            }
          : a
      );
    } else {
      const newArea: AreaItem = {
        id: `area-${Date.now()}`,
        name: formName,
        code,
        tableCount: 0,
        totalSeats: 0,
        smokingAllowed: formSmoking,
        status,
        description: formDescription,
      };
      nextAreas = [...areas, newArea];
    }

    setAreas(nextAreas);
    posService.saveTableAreas(nextAreas).catch((err) => {
      console.warn('Backend saveTableAreas warning:', err);
    });

    setIsDrawerOpen(false);
    setShowSuccessModal(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus area "${name}"?`)) {
      const nextAreas = areas.filter((a) => a.id !== id);
      setAreas(nextAreas);
      posService.saveTableAreas(nextAreas).catch((err) => {
        console.warn('Backend saveTableAreas warning:', err);
      });
      onShowToast(`Area "${name}" berhasil dihapus!`);
      if (editingArea?.id === id) handleClose();
    }
  };

  const filteredAreas = areas.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q);
    }
    return true;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredAreas.length && filteredAreas.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredAreas.map((a) => a.id));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const columns: ColumnDef<AreaItem>[] = [
    {
      key: 'name',
      header: 'Nama Area',
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 shrink-0 shadow-2xs">
            <MapPin className="size-4" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900 text-xs tracking-tight">{item.name}</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Kode: {item.code}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'tableCount',
      header: 'Jumlah Meja',
      render: (item) => (
        <span className="text-xs font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-md">
          {item.tableCount} Meja
        </span>
      ),
    },
    {
      key: 'totalSeats',
      header: 'Kapasitas Kursi',
      render: (item) => (
        <span className="text-xs font-medium text-neutral-800">{item.totalSeats} Kursi</span>
      ),
    },
    {
      key: 'smoking',
      header: 'Smoking Area',
      render: (item) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
            item.smokingAllowed
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-neutral-100 text-neutral-600'
          }`}
        >
          {item.smokingAllowed ? 'Merokok Diizinkan' : 'Bebas Rokok (Non-Smoking)'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <StatusBadge
          variant={item.status === 'Aktif' ? 'success' : 'neutral'}
          icon={item.status === 'Aktif' ? <Check className="size-3" /> : undefined}
        >
          {item.status}
        </StatusBadge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (item) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(item);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            title="Edit Area"
          >
            <Edit2 className="size-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(item.id, item.name);
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Hapus Area"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs font-medium text-neutral-800 appearance-none shadow-2xs cursor-pointer focus:outline-none hover:bg-neutral-50"
          >
            <option value="all">Semua Status</option>
            <option value="Aktif">Aktif</option>
            <option value="Nonaktif">Nonaktif</option>
          </select>
          <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>

        <div className="relative flex-1 min-w-[260px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama area atau kode..."
            className="w-full h-9 pl-3.5 pr-8 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-800 placeholder-neutral-400 shadow-2xs focus:outline-none"
          />
          <ChevronDown className="size-3.5 text-neutral-400 absolute right-2.5 top-3 pointer-events-none" />
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredAreas}
        isLoading={isLoading}
        keyExtractor={(item) => item.id}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={toggleSelectRow}
        onToggleSelectAll={toggleSelectAll}
        onRowClick={(item) => handleEdit(item)}
        emptyTitle="BELUM ADA AREA"
        emptyDescription="Tambahkan area outlet seperti Indoor, Outdoor, atau VIP Room."
        entityName="area"
      />

      {/* Drawer */}
      {isDrawerOpen && (
        <>
          <div
            onClick={handleClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
          />
          <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[540px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
            <div className="p-6 border-b border-neutral-100 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 tracking-tight">
                  {editingArea ? 'Edit Area' : 'Tambah Area'}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Atur nama zona ruangan, kode area, dan izin smoking area.
                </p>
              </div>

              <button
                onClick={handleClose}
                className="size-7 rounded-full bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Nama Area *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    if (!editingArea) setFormCode(e.target.value.substring(0, 3).toUpperCase());
                  }}
                  placeholder="Contoh: Rooftop Cafe"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Kode Singkat (3 Karakter)</label>
                <input
                  type="text"
                  maxLength={5}
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                  placeholder="ROO"
                  className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs font-mono uppercase bg-neutral-50/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Kebijakan Merokok</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormSmoking(false)}
                    className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                      !formSmoking
                        ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                        : 'border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    Non-Smoking (Bebas Rokok)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormSmoking(true)}
                    className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                      formSmoking
                        ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                        : 'border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    Smoking Area (Merokok)
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormStatus('Aktif')}
                    className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                      formStatus === 'Aktif'
                        ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                        : 'border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    Aktif
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormStatus('Nonaktif')}
                    className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                      formStatus === 'Nonaktif'
                        ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                        : 'border-neutral-200 bg-white text-neutral-600'
                    }`}
                  >
                    Nonaktif
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-800">Deskripsi Area</label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Keterangan singkat area..."
                  className="w-full p-3 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none resize-none"
                />
              </div>
            </div>

            <div className="p-4 px-6 border-t border-neutral-100 flex items-center justify-between gap-4 bg-white">
              <button
                type="button"
                onClick={() => handleSave(true)}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-neutral-200 text-neutral-700 hover:bg-neutral-50 text-xs font-semibold transition-colors"
              >
                <Bookmark className="size-4" />
                <span>Simpan sebagai Draf</span>
              </button>

              <button
                type="button"
                onClick={() => handleSave(false)}
                className="inline-flex items-center gap-2 h-11 px-7 rounded-xl bg-[#E5484D] hover:bg-[#D9383D] text-white text-xs font-semibold transition-colors shadow-2xs"
              >
                <CheckCircle2 className="size-4 stroke-[2.5]" />
                <span>Simpan Area</span>
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
                Area Berhasil Disimpan!
              </h3>
              <p className="text-xs text-neutral-500 mt-2 max-w-[360px] leading-relaxed">
                Area outlet berhasil disimpan dan siap ditautkan ke tata letak meja.
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
                  Kembali ke Daftar Area
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
