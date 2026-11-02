'use client';

import React, { useState } from 'react';
import {
  FolderOpen,
  MoreVertical,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Edit2,
  Power,
} from 'lucide-react';
import { TaxFeeItem } from '@/types/outlet-settings';
import { Button } from '@/components/common/Button';


interface TaxesFeesTabProps {
  onOpenAddModal: () => void;
  onEditItem?: (item: TaxFeeItem) => void;
  items: TaxFeeItem[];
  setItems: React.Dispatch<React.SetStateAction<TaxFeeItem[]>>;
  isDemoEmpty: boolean;
  setIsDemoEmpty: (val: boolean) => void;
  onToggleStatus?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function TaxesFeesTab({
  onOpenAddModal,
  onEditItem,
  items,
  setItems,
  isDemoEmpty,
  setIsDemoEmpty,
  onToggleStatus,
  onDelete,
}: TaxesFeesTabProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const displayItems = isDemoEmpty ? [] : items;

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? displayItems.map((i) => i.id) : []);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleToggleStatus = (id: string) => {
    onToggleStatus?.(id);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isActive: !item.isActive } : item
      )
    );
    setActiveMenuId(null);
  };

  const handleDelete = (id: string) => {
    onDelete?.(id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    setActiveMenuId(null);
  };

  if (isDemoEmpty || displayItems.length === 0) {
    return (
      /* SCREENSHOT 3: EMPTY STATE */
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-12 sm:p-24 flex flex-col items-center justify-center text-center min-h-[500px] animate-in fade-in duration-150">
        <div className="relative mb-4">
          <div className="size-20 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-300">
            <FolderOpen className="size-10 stroke-[1.5]" />
          </div>
          <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-neutral-200 border-2 border-white" />
        </div>

        <h2 className="text-sm font-bold tracking-wider text-neutral-700 uppercase">
          BELUM ADA PAJAK & BIAYA
        </h2>
        <p className="text-xs text-neutral-400 max-w-md mt-1.5 leading-relaxed">
          Atur pajak dan biaya layanan outletmu agar perhitungan setiap transaksi sesuai dengan pengaturan yang berlaku.
        </p>

        <div className="flex items-center gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDemoEmpty(false)}
            className="text-xs text-neutral-600"
          >
            Tampilkan Contoh Data (Gambar 2)
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onOpenAddModal}
            className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold text-xs"
          >
            <Plus className="size-3.5 mr-1" /> Tambah Pajak atau Biaya
          </Button>
        </div>
      </div>
    );
  }

  return (
    /* SCREENSHOT 2: POPULATED TABLE */
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="font-bold">Komponen Penambahan Pembayaran Customer</p>
          <p className="text-[11px] text-blue-700 mt-0.5">
            Penambahan biaya pada pembayaran customer hanya terdiri dari <strong>Pajak (%)</strong> yang dapat Anda atur di bawah ini, serta <strong>Biaya Layanan Platform (%)</strong> yang ditetapkan oleh Internal Admin sesuai kesepakatan mitra.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-200/80 bg-neutral-50/50 text-neutral-600 font-bold">
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === displayItems.length &&
                      displayItems.length > 0
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-neutral-300 text-[#FF5C38] focus:ring-[#FF5C38] cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 font-bold text-neutral-700">Nama</th>
                <th className="py-3 px-4 font-bold text-neutral-700">Tipe</th>
                <th className="py-3 px-4 font-bold text-neutral-700">
                  Persentase (%)
                </th>
                <th className="py-3 px-4 font-bold text-neutral-700">
                  Berlaku Untuk
                </th>
                <th className="py-3 px-4 font-bold text-neutral-700">Status</th>
                <th className="py-3 px-4 w-32 text-center">Pengelolaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-medium">
              {displayItems.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                const isTax = item.type === 'Pajak';
                const isPlatformManaged = item.isPlatformManaged || item.type === 'Biaya';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-neutral-50/70 transition-colors ${
                      isSelected ? 'bg-orange-50/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(item.id)}
                        className="rounded border-neutral-300 text-[#FF5C38] focus:ring-[#FF5C38] cursor-pointer"
                      />
                    </td>

                    <td className="py-3.5 px-4 font-bold text-neutral-900">
                      {item.name}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md text-[10.5px] font-bold ${
                          isTax
                            ? 'bg-red-50 text-red-600'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {isTax ? 'Pajak' : 'Biaya Platform'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-neutral-800">
                      {item.value}
                    </td>

                    <td className="py-3.5 px-4 text-neutral-600">
                      {item.appliesTo}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${
                          item.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        <Check className="size-3 stroke-[2.5]" />
                        <span>{item.isActive ? 'Aktif' : 'Nonaktif'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center relative">
                      {isPlatformManaged ? (
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-600 text-[10px] font-bold">
                          Diatur Internal Admin
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(activeMenuId === item.id ? null : item.id)
                            }
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="size-4" />
                          </button>

                          {activeMenuId === item.id && (
                            <div className="absolute right-4 top-10 w-36 rounded-xl bg-white border border-neutral-200 shadow-xl py-1 z-20 text-xs text-neutral-700 animate-in fade-in duration-100">
                              {onEditItem && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    onEditItem(item);
                                  }}
                                  className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 font-medium"
                                >
                                  <Edit2 className="size-3.5 text-neutral-500" />
                                  <span>Ubah Persentase</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(item.id)}
                                className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 font-medium"
                              >
                                <Power className="size-3.5 text-neutral-500" />
                                <span>{item.isActive ? 'Nonaktifkan' : 'Aktifkan'}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id)}
                                className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-red-50 text-red-600 font-medium"
                              >
                                <Trash2 className="size-3.5" />
                                <span>Hapus</span>
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      {/* Pagination Footer matching Screenshot 2 */}
      <div className="p-4 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
        <div>
          Menampilkan 1 - {displayItems.length} dari {displayItems.length} data
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled
              className="size-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-300 cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              className="size-8 rounded-lg border border-red-300 bg-red-50 text-red-600 font-bold flex items-center justify-center"
            >
              1
            </button>
            <button
              type="button"
              disabled
              className="size-8 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-300 cursor-not-allowed"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Tampilkan</span>
            <select
              defaultValue="10"
              className="px-2 py-1 rounded-lg border border-neutral-200 bg-white font-semibold text-neutral-700 cursor-pointer"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
            <span>per halaman</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}


