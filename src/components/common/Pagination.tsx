'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { DEFAULT_PAGE_SIZE_OPTIONS } from './DataTable';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  itemName?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage = 10,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
  itemName = 'data',
  className = '',
}: PaginationProps) {
  const from = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const to = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers
  const pages: (number | string)[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 text-xs text-neutral-500 ${className}`}
    >
      <div>
        Menampilkan{' '}
        <span className="font-medium text-neutral-800">
          {from} - {to}
        </span>{' '}
        dari <span className="font-medium text-neutral-800">{totalItems}</span>{' '}
        {itemName}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Halaman sebelumnya"
          className="size-8 flex items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="size-4" />
        </button>

        {pages.map((p, idx) =>
          typeof p === 'number' ? (
            <button
              key={idx}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-8 h-8 px-2 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                currentPage === p
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
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || totalPages === 0}
          aria-label="Halaman berikutnya"
          className="size-8 flex items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span>Tampilkan</span>
          <div className="relative">
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
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
      )}
    </div>
  );
}
