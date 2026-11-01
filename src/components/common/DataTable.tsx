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

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

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
  totalItems?: number;
  className?: string;
  showPagination?: boolean;
  isLoading?: boolean;
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
  currentPage: controlledPage,
  totalPages: controlledTotalPages,
  pageSize: controlledPageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
  totalItems: controlledTotalItems,
  className = '',
  showPagination = true,
  isLoading = false,
}: DataTableProps<T>) {
  const isControlled = onPageChange !== undefined;

  const [internalPage, setInternalPage] = React.useState(1);
  const [internalPageSize, setInternalPageSize] = React.useState(controlledPageSize || 10);

  const activePage = isControlled ? (controlledPage ?? 1) : internalPage;
  const activePageSize = isControlled ? (controlledPageSize ?? 10) : internalPageSize;

  const actualTotal = controlledTotalItems ?? data.length;
  const computedTotalPages =
    controlledTotalPages ?? Math.max(1, Math.ceil(actualTotal / (activePageSize || 10)));

  // Auto-slice if data is not already sliced by parent
  const displayedData = React.useMemo(() => {
    if (isControlled && controlledTotalItems !== undefined && data.length <= activePageSize) {
      return data;
    }
    const start = (activePage - 1) * activePageSize;
    return data.slice(start, start + activePageSize);
  }, [data, isControlled, controlledTotalItems, activePage, activePageSize]);

  const handlePageChange = (newPage: number) => {
    if (isControlled) {
      onPageChange?.(newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handlePageSizeChange = (newSize: number) => {
    if (isControlled) {
      onPageSizeChange?.(newSize);
      onPageChange?.(1);
    } else {
      setInternalPageSize(newSize);
      setInternalPage(1);
    }
  };

  const isAllSelected =
    displayedData.length > 0 &&
    selectable &&
    displayedData.every((item) => selectedIds.includes(keyExtractor(item)));

  const totalCols = columns.length + (selectable ? 1 : 0);

  // Generate multi-page numbers: e.g. 1, 2, 3...
  const pageNumbers = React.useMemo(() => {
    const pages: (number | string)[] = [];
    if (computedTotalPages <= 7) {
      for (let i = 1; i <= computedTotalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (activePage > 3) pages.push('...');
      const start = Math.max(2, activePage - 1);
      const end = Math.min(computedTotalPages - 1, activePage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (activePage < computedTotalPages - 2) pages.push('...');
      pages.push(computedTotalPages);
    }
    return pages;
  }, [computedTotalPages, activePage]);

  const from = actualTotal === 0 ? 0 : (activePage - 1) * activePageSize + 1;
  const to = Math.min(activePage * activePageSize, actualTotal);

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
            {isLoading ? (
              Array.from({ length: Math.min(activePageSize, 6) }).map((_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="border-b border-neutral-100 animate-pulse">
                  {selectable && (
                    <td className="py-4 px-3.5">
                      <div className="size-4 bg-neutral-200/80 rounded" />
                    </td>
                  )}
                  {columns.map((col, cIdx) => (
                    <td key={`skeleton-col-${cIdx}`} className="py-4 px-3.5">
                      <div
                        className={`h-4 bg-neutral-200/80 rounded ${
                          col.align === 'right' ? 'ml-auto' : col.align === 'center' ? 'mx-auto' : ''
                        }`}
                        style={{
                          width: `${Math.max(30, (cIdx % 3 === 0 ? 70 : cIdx % 2 === 0 ? 50 : 40))}%`,
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : displayedData.length > 0 ? (
              displayedData.map((item, index) => {
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
            Menampilkan <span className="font-medium text-neutral-800">{from} - {to}</span> dari{' '}
            <span className="font-medium text-neutral-800">{actualTotal}</span> {entityName}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={activePage <= 1}
              onClick={() => handlePageChange(activePage - 1)}
              className="size-8 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft className="size-4" />
            </button>

            {pageNumbers.map((p, idx) =>
              typeof p === 'number' ? (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePageChange(p)}
                  className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                    activePage === p
                      ? 'border border-[#FF5C38] bg-[#FFF5F2] text-[#FF5C38] shadow-2xs'
                      : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  {p}
                </button>
              ) : (
                <span
                  key={idx}
                  className="size-8 flex items-center justify-center text-neutral-400 select-none text-xs"
                >
                  ...
                </span>
              )
            )}

            <button
              type="button"
              disabled={activePage >= computedTotalPages || computedTotalPages === 0}
              onClick={() => handlePageChange(activePage + 1)}
              className="size-8 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span>Tampilkan</span>
            <div className="relative">
              <select
                value={activePageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="h-8 pl-2.5 pr-7 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-700 appearance-none cursor-pointer focus:outline-none focus:border-neutral-300 font-medium"
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
