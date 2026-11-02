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
  Power,
  GripVertical,
  Banknote,
  QrCode,
  CreditCard,
  Wallet,
} from 'lucide-react';
import { PaymentMethodItem } from '@/types/outlet-settings';
import { Button } from '@/components/common/Button';


interface PaymentMethodsTabProps {
  onOpenAddModal: () => void;
  items: PaymentMethodItem[];
  setItems: React.Dispatch<React.SetStateAction<PaymentMethodItem[]>>;
  isDemoEmpty: boolean;
  setIsDemoEmpty: (val: boolean) => void;
  onToggleStatus?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function PaymentMethodsTab({
  onOpenAddModal,
  items,
  setItems,
  isDemoEmpty,
  setIsDemoEmpty,
  onToggleStatus,
  onDelete,
}: PaymentMethodsTabProps) {
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

  // Render stylized brand icon matching Screenshot 4
  const renderMethodIcon = (method: PaymentMethodItem) => {
    switch (method.iconType) {
      case 'cash':
        return (
          <div className="size-7 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Banknote className="size-4" />
          </div>
        );
      case 'qris':
        return (
          <div className="px-1.5 py-0.5 rounded border border-neutral-300 bg-white text-[9px] font-black text-neutral-900 tracking-tighter shrink-0 shadow-2xs">
            QRIS
          </div>
        );
      case 'ovo':
        return (
          <div className="size-6 rounded-full border-2 border-[#4C3494] bg-white text-[#4C3494] flex items-center justify-center text-[8px] font-black shrink-0">
            O
          </div>
        );
      case 'dana':
        return (
          <div className="px-1 py-0.5 rounded bg-[#108EE9] text-white text-[8px] font-bold shrink-0">
            dana
          </div>
        );
      case 'shopeepay':
        return (
          <div className="px-1 py-0.5 rounded bg-[#EE4D2D] text-white text-[8px] font-bold shrink-0">
            Pay
          </div>
        );
      case 'card':
      default:
        return (
          <div className="size-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <CreditCard className="size-4" />
          </div>
        );
    }
  };

  if (displayItems.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-12 sm:p-24 flex flex-col items-center justify-center text-center min-h-[500px] animate-in fade-in duration-150">
        <div className="relative mb-4">
          <div className="size-20 rounded-2xl bg-neutral-100 flex items-center justify-center text-neutral-300">
            <FolderOpen className="size-10 stroke-[1.5]" />
          </div>
          <span className="absolute -top-1 -right-1 size-3.5 rounded-full bg-neutral-200 border-2 border-white" />
        </div>

        <h2 className="text-sm font-bold tracking-wider text-neutral-700 uppercase">
          BELUM ADA METODE PEMBAYARAN
        </h2>
        <p className="text-xs text-neutral-400 max-w-md mt-1.5 leading-relaxed">
          Tambahkan metode pembayaran yang tersedia di outletmu agar transaksi dapat dicatat dengan benar.
        </p>

        <div className="flex items-center gap-3 mt-6">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={onOpenAddModal}
            className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold text-xs"
            leftIcon={<Plus className="size-3.5" />}
          >
            Tambah Metode Pembayaran
          </Button>
        </div>
      </div>
    );
  }

  return (
    /* SCREENSHOT 4: POPULATED TABLE */
    <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden flex flex-col justify-between animate-in fade-in duration-150">
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
              <th className="py-3 px-4 font-bold text-neutral-700">Nama Metode</th>
              <th className="py-3 px-4 font-bold text-neutral-700">Tipe</th>
              <th className="py-3 px-4 font-bold text-neutral-700">Keterangan</th>
              <th className="py-3 px-4 font-bold text-neutral-700">Status</th>
              <th className="py-3 px-4 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 font-medium">
            {displayItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);

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

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <GripVertical className="size-4 text-neutral-300 hover:text-neutral-500 cursor-grab shrink-0" />
                      {renderMethodIcon(item)}
                      <span className="font-bold text-neutral-900">
                        {item.name}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[10.5px] font-bold ${
                        item.type === 'Tunai'
                          ? 'bg-red-50 text-red-600'
                          : item.type === 'E - Wallet'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-neutral-600">
                    {item.description}
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer matching Screenshot 4 */}
      <div className="p-4 border-t border-neutral-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
        <div>
          Menampilkan 1 - {displayItems.length} dari {displayItems.length} pesanan
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
  );
}


