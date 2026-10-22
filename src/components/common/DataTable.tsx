'use client';

import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CheckSquare,
  Square,
} from 'lucide-react';
import { EmptyState } from '@/components/common/EmptyState';

export interface ColumnDef<T> {
  key: string;
  header: React.ReactNode;
  render: (item: T, index: number) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  selectable?: boolean;
  selectedIds?: string[];
  onToggleSelect?: (id: string, e: React.MouseEvent) => void;
  onToggleSelectAll?: () => void;
  onRowClick?: (item: T) => void;
  emptyTitle?: string;
  emptyDescription?: string;
  entityName?: string; // e.g. "pesanan", "transaksi", "produk"
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  className?: string;
  showPagination?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  selectable = false,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onRowClick,
  emptyTitle = 'BELUM ADA DATA',
  emptyDescription = 'Data akan muncul di sini setelah transaksi dilakukan.',
  entityName = 'data',
  currentPage = 1,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50],
  onPageChange,
  onPageSizeChange,
  className = '',
  showPagination = true,
}: DataTableProps<T>) {
  const isAllSelected =
    data.length > 0 && selectable && selectedIds.length === data.length;

  const totalCols = columns.length + (selectable ? 1 : 0);

  return (
    <div
      className={`bg-white rounded-xl border border-neutral-200/90 shadow-2xs overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-neutral-200/80 bg-white text-neutral-500 font-medium text-[12.5px]">
              {selectable && (
                <th className="py-3.5 px-3.5 w-10">
                  <button
                    type="button"
                    onClick={onToggleSelectAll}
                    className="text-neutral-300 hover:text-neutral-600 transition-colors flex items-center"
                    aria-label="Pilih semua baris"
                  >
                    {isAllSelected ? (
                      <CheckSquare className="size-4 text-blue-600" />
                    ) : (
                      <Square className="size-4" />
                    )}
                  </button>
                </th>
              )}

              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`py-3.5 px-3.5 font-medium ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  } ${col.headerClassName || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {data.length > 0 ? (
              data.map((item, index) => {
                const key = keyExtractor(item);
                const isChecked = selectable && selectedIds.includes(key);

                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(item)}
                    className={`border-b border-neutral-100 hover:bg-neutral-50/70 transition-colors ${
                      onRowClick ? 'cursor-pointer' : ''
                    } ${isChecked ? 'bg-blue-50/20' : ''}`}
                  >
                    {selectable && (
                      <td className="py-3.5 px-3.5">
                        <button
                          type="button"
                          onClick={(e) => onToggleSelect?.(key, e)}
                          className="text-neutral-300 hover:text-neutral-600 transition-colors flex items-center"
                          aria-label={`Pilih baris ${key}`}
                        >
                          {isChecked ? (
                            <CheckSquare className="size-4 text-blue-600" />
                          ) : (
                            <Square className="size-4" />
                          )}
                        </button>
                      </td>
                    )}

                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`py-3.5 px-3.5 ${
                          col.align === 'right'
                            ? 'text-right'
                            : col.align === 'center'
                            ? 'text-center'
                            : 'text-left'
                        } ${col.className || ''}`}
                      >
                        {col.render(item, index)}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              /* Empty State Row */
              <tr>
                <td colSpan={totalCols} className="py-20 text-center">
                  <EmptyState title={emptyTitle} description={emptyDescription} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Pagination */}
      {showPagination && (
        <div className="p-3.5 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500 bg-white">
          <div>
            Menampilkan 1 - {data.length} dari {data.length} {entityName}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => onPageChange?.(currentPage - 1)}
              className="size-8 rounded-lg border border-neutral-200 text-neutral-300 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60 hover:bg-neutral-50"
            >
              <ChevronLeft className="size-4" />
            </button>

            <button className="size-8 rounded-lg border border-[#E5484D] bg-[#FFF5F5] text-[#E5484D] font-medium flex items-center justify-center text-xs shadow-2xs">
              {currentPage}
            </button>

            <button
              disabled
              onClick={() => onPageChange?.(currentPage + 1)}
              className="size-8 rounded-lg border border-neutral-200 text-neutral-300 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60 hover:bg-neutral-50"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Tampilkan</span>
            <div className="relative">
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
                className="h-8 pl-2.5 pr-7 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-700 appearance-none cursor-pointer focus:outline-none"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="size-3 text-neutral-400 absolute right-2 top-2.5 pointer-events-none" />
            </div>
            <span>per halaman</span>
          </div>
        </div>
      )}
    </div>
  );
}
