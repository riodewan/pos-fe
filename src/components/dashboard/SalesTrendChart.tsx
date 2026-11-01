'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { formatRupiah } from '@/utils';

export interface DailySalesItem {
  date: string;
  sales: number;
  orders: number;
}

export interface SalesTrendChartProps {
  data?: DailySalesItem[];
  timeframe?: string;
  onTimeframeChange?: (tf: string) => void;
  isEmpty?: boolean;
  className?: string;
}

export function SalesTrendChart({
  data,
  timeframe = '7 Hari Terakhir',
  onTimeframeChange,
  isEmpty = false,
  className = '',
}: SalesTrendChartProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Generate dynamic 7-day fallback based on current date
  const fallbackItems: DailySalesItem[] = useMemo(() => {
    const list: DailySalesItem[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      list.push({ date: label, sales: 0, orders: 0 });
    }
    return list;
  }, []);

  const items = useMemo(() => {
    if (isEmpty) return fallbackItems;
    if (data && data.length > 0) {
      return data.map((item) => {
        // format date if full YYYY-MM-DD
        let label = item.date;
        if (/^\d{4}-\d{2}-\d{2}/.test(item.date)) {
          const d = new Date(item.date);
          label = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        }
        return {
          ...item,
          date: label,
        };
      });
    }
    return fallbackItems;
  }, [isEmpty, data, fallbackItems]);

  const maxSales = useMemo(() => {
    const max = Math.max(1000000, ...items.map((i) => i.sales));
    return Math.ceil(max / 500000) * 500000 || 1000000;
  }, [items]);

  const maxOrders = useMemo(() => {
    const max = Math.max(10, ...items.map((i) => i.orders));
    return Math.ceil(max / 10) * 10 || 10;
  }, [items]);

  // Calculate points for the overlay trend line
  const svgWidth = 600;
  const svgHeight = 150;
  const colStep = svgWidth / (items.length - 1 || 1);

  const linePoints = items.map((item, idx) => {
    const x = idx * colStep;
    const y = svgHeight - (item.orders / maxOrders) * (svgHeight - 20);
    return { x, y };
  });

  const pathD = linePoints.reduce(
    (acc, pt, idx) =>
      idx === 0
        ? `M ${pt.x} ${pt.y}`
        : `${acc} L ${pt.x} ${pt.y}`,
    ''
  );

  return (
    <div
      className={`p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
          Tren Penjualan
        </h3>

        {/* Timeframe selector pill */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors cursor-pointer"
          >
            <span>{timeframe}</span>
            <ChevronDown className="size-3.5 text-neutral-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1 w-36 bg-white border border-neutral-200 rounded-xl shadow-lg z-20 py-1 text-xs">
              {['7 Hari Terakhir', '30 Hari Terakhir', 'Bulan Ini'].map((tf) => (
                <button
                  key={tf}
                  type="button"
                  onClick={() => {
                    onTimeframeChange?.(tf);
                    setDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-neutral-50 transition-colors ${
                    timeframe === tf ? 'font-bold text-blue-600 bg-blue-50/50' : 'text-neutral-700'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative h-[180px] w-full pt-4">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7">
          <div className="w-full border-b border-dashed border-neutral-100" />
          <div className="w-full border-b border-dashed border-neutral-100" />
          <div className="w-full border-b border-dashed border-neutral-100" />
          <div className="w-full border-b border-neutral-200" />
        </div>

        {/* Bar & Line container */}
        <div className="relative h-full flex flex-col justify-between">
          <div className="relative h-[150px] w-full">
            {/* SVG Trend Line for Orders */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              preserveAspectRatio="none"
            >
              <path
                d={pathD}
                fill="none"
                stroke="#F59E0B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {linePoints.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#FFFFFF"
                  stroke="#F59E0B"
                  strokeWidth="2"
                />
              ))}
            </svg>

            {/* Bars Column */}
            <div className="absolute inset-0 flex items-end justify-between px-2 sm:px-4 z-0">
              {items.map((item, idx) => {
                const heightPct = maxSales > 0 ? (item.sales / maxSales) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-full mb-2 bg-neutral-900 text-white text-[10px] rounded-lg px-2.5 py-1 pointer-events-none whitespace-nowrap shadow-lg z-30">
                      <p className="font-semibold">{item.date}</p>
                      <p className="text-emerald-400 font-mono">{formatRupiah(item.sales)}</p>
                      <p className="text-amber-400 font-mono">{item.orders} pesanan</p>
                    </div>

                    {/* Blue Bar */}
                    <div
                      style={{ height: `${Math.max(4, heightPct)}%` }}
                      className={`w-5 sm:w-7 rounded-t-md transition-all duration-300 ${
                        item.sales > 0
                          ? 'bg-[#2563EB] group-hover:bg-[#1D4ED8]'
                          : 'bg-neutral-100'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* X Axis Labels */}
          <div className="flex justify-between items-center px-2 sm:px-4 text-[11px] font-medium text-neutral-400 pt-1">
            {items.map((item, idx) => (
              <span key={idx} className="flex-1 text-center truncate">
                {item.date}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-center gap-6 pt-3 mt-1 border-t border-neutral-100 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#2563EB]" />
          <span>Nominal Penjualan (Rp)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#F59E0B]" />
          <span>Jumlah Transaksi</span>
        </div>
      </div>
    </div>
  );
}
