'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

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

  const populatedItems: DailySalesItem[] = [
    { date: '8 Okt', sales: 2800000, orders: 110 },
    { date: '9 Okt', sales: 8200000, orders: 190 },
    { date: '10 Okt', sales: 6600000, orders: 240 },
    { date: '11 Okt', sales: 6800000, orders: 220 },
    { date: '12 Okt', sales: 2900000, orders: 140 },
    { date: '13 Okt', sales: 4300000, orders: 180 },
    { date: '14 Okt', sales: 5900000, orders: 290 },
  ];

  const emptyItems: DailySalesItem[] = [
    { date: '8 Okt', sales: 0, orders: 0 },
    { date: '9 Okt', sales: 0, orders: 0 },
    { date: '10 Okt', sales: 0, orders: 0 },
    { date: '11 Okt', sales: 0, orders: 0 },
    { date: '12 Okt', sales: 0, orders: 0 },
    { date: '13 Okt', sales: 0, orders: 0 },
    { date: '14 Okt', sales: 0, orders: 0 },
  ];

  const items = isEmpty
    ? emptyItems
    : data && data.length > 0
    ? data
    : populatedItems;

  const maxSales = 10000000;
  const maxOrders = 400;

  // Calculate points for the overlay trend line (yellow)
  // Chart inner width: 100%, height: 160px
  // SVG coordinates: 0 to 700 width, 0 to 160 height
  const svgWidth = 600;
  const svgHeight = 150;
  const colStep = svgWidth / (items.length - 1 || 1);

  const linePoints = items.map((item, idx) => {
    const x = idx * colStep;
    // Map orders (0 to 400) to height (svgHeight to 10)
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

  const areaD = `${pathD} L ${svgWidth} ${svgHeight} L 0 ${svgHeight} Z`;

  return (
    <div
      className={`p-5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex flex-col justify-between ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-neutral-900 tracking-tight">
          Penjualan
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

      {/* Chart Canvas with Dual Y-Axis */}
      <div className="relative flex items-stretch gap-2 h-44 text-[10.5px]">
        {/* Left Y-Axis (Sales in Rupiah) */}
        <div className="w-16 flex flex-col justify-between text-right text-neutral-400 select-none pb-6">
          <span>10.000.000</span>
          <span>8.000.000</span>
          <span>4.000.000</span>
          <span>2.000.000</span>
          <span>0</span>
        </div>

        {/* Middle Area: Dashed gridlines, Bars, and Trend Line */}
        <div className="flex-1 relative flex flex-col justify-between pb-6">
          {/* 5 Horizontal Grid lines */}
          <div className="absolute inset-x-0 top-0 border-b border-dashed border-neutral-200" />
          <div className="absolute inset-x-0 top-[25%] border-b border-dashed border-neutral-200" />
          <div className="absolute inset-x-0 top-[50%] border-b border-dashed border-neutral-200" />
          <div className="absolute inset-x-0 top-[75%] border-b border-dashed border-neutral-200" />
          <div className="absolute inset-x-0 bottom-6 border-b border-neutral-200" />

          {/* SVG Overlay: Line Trend (Orders count) */}
          <svg
            className="absolute inset-x-0 top-0 h-[calc(100%-24px)] w-full pointer-events-none z-10 overflow-visible"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="yellowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#yellowGradient)" />
            <path
              d={pathD}
              fill="none"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Vertical Bar Columns */}
          <div className="absolute inset-x-0 top-0 bottom-6 flex items-end justify-between px-3 z-0">
            {items.map((item, idx) => {
              const heightPercent = Math.min(
                100,
                Math.max(0, (item.sales / maxSales) * 100)
              );
              return (
                <div
                  key={idx}
                  className="group relative flex flex-col items-center justify-end h-full w-8"
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 rounded bg-neutral-900 text-white text-[10px] font-semibold whitespace-nowrap pointer-events-none z-30 shadow-md">
                    Rp {item.sales.toLocaleString('id-ID')}
                  </div>
                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-4 sm:w-5 bg-[#2563EB] group-hover:bg-[#1D4ED8] rounded-t-sm transition-all duration-300"
                  />
                </div>
              );
            })}
          </div>

          {/* X-Axis Labels */}
          <div className="absolute inset-x-0 bottom-0 h-6 flex justify-between px-2 pt-1.5 text-[10px] text-neutral-500 font-medium select-none">
            {items.map((item, idx) => (
              <span key={idx} className="w-8 text-center">
                {item.date}
              </span>
            ))}
          </div>
        </div>

        {/* Right Y-Axis (Orders Count) */}
        <div className="w-8 flex flex-col justify-between text-left text-neutral-400 select-none pb-6 pl-1">
          <span>400</span>
          <span>300</span>
          <span>200</span>
          <span>100</span>
          <span>0</span>
        </div>
      </div>
    </div>
  );
}
