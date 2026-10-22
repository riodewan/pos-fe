'use client';

import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, BarChart3, ShoppingBag, Layers } from 'lucide-react';

export interface SlideData {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  tag?: string;
}

export const LOGIN_SLIDES: SlideData[] = [
  {
    id: 1,
    tag: 'POINT OF SALE',
    title: 'Kelola outlet,\nlebih mudah.',
    subtitle: 'Satu platform untuk transaksi, stok, dan laporan bisnis F&B kamu.',
    image: '/img/slider/slider-1.png',
  },
  {
    id: 2,
    tag: 'INVENTORY & RECIPE',
    title: 'Pantau stok & resep,\nsecara real-time.',
    subtitle: 'Otomatisasi pemotongan bahan baku setiap kali pesanan selesai dibuat.',
    image: '/img/slider/slider-2.png',
  },
  {
    id: 3,
    tag: 'BUSINESS ANALYTICS',
    title: 'Laporan analitik\nbisnis lengkap.',
    subtitle: 'Grafik penjualan, produk terlaris, dan performa outlet dalam satu layar.',
    image: '/img/slider/slider-3.png',
  },
];

export function LoginSlider() {
  const [current, setCurrent] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % LOGIN_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const activeSlide = LOGIN_SLIDES[current];
  const hasImage = Boolean(loadedImages[activeSlide.image]);

  return (
    <div className="flex-1 flex flex-col justify-between w-full h-full">
      {/* Preload / check image in background */}
      <img
        src={activeSlide.image}
        alt=""
        className="hidden"
        onLoad={() =>
          setLoadedImages((prev) => ({ ...prev, [activeSlide.image]: true }))
        }
      />

      {/* Center Image / Mockup Template Area */}
      <div className="my-auto py-4 w-full flex items-center justify-center">
        <div className="w-full max-w-[400px] aspect-[16/11] relative rounded-2xl overflow-hidden border border-white/10 bg-white/[0.03] shadow-2xl backdrop-blur-xs flex items-center justify-center p-3 transition-all duration-500">
          {hasImage ? (
            <img
              key={activeSlide.image}
              src={activeSlide.image}
              alt={activeSlide.title}
              className="w-full h-full object-contain rounded-xl transition-opacity duration-500 animate-in fade-in"
            />
          ) : (
            /* Elegant Placeholder Template when the user hasn't added the image file yet */
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#242426] to-[#18181A] border border-white/10 p-4 flex flex-col justify-between text-white select-none animate-in fade-in duration-300">
              {/* Mockup Header Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-1.5">
                  <div className="size-2 rounded-full bg-[#FF5C38]" />
                  <div className="size-2 rounded-full bg-white/20" />
                  <div className="size-2 rounded-full bg-white/20" />
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-white/50 tracking-wider font-mono">
                  <ImageIcon className="size-3 text-[#FF8265]" />
                  <span>SLIDER {current + 1} / {LOGIN_SLIDES.length}</span>
                </div>
              </div>

              {/* Mockup Center Visual Graphic */}
              <div className="flex-1 flex flex-col items-center justify-center text-center py-2 px-2">
                <div className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2 shadow-inner">
                  {current === 0 && <ShoppingBag className="size-6 text-[#FF8265]" />}
                  {current === 1 && <Layers className="size-6 text-[#FF8265]" />}
                  {current === 2 && <BarChart3 className="size-6 text-[#FF8265]" />}
                </div>
                <p className="text-xs font-semibold text-white/90">
                  Template Preview Image
                </p>
                <p className="text-[10px] text-white/40 mt-0.5 font-mono max-w-[240px] truncate">
                  {activeSlide.image}
                </p>
              </div>

              {/* Mockup Bottom Hint */}
              <div className="bg-white/5 rounded-lg py-1.5 px-2.5 text-center border border-white/5">
                <p className="text-[10px] text-white/50">
                  Simpan file gambar di <span className="text-[#FF8265] font-mono">public{activeSlide.image}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Text & Dots Indicators */}
      <div className="space-y-4 pt-2">
        {/* Slide Tag / Category */}
        {activeSlide.tag && (
          <span className="text-[11px] font-bold tracking-widest text-[#FF8265] uppercase">
            {activeSlide.tag}
          </span>
        )}

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl lg:text-[38px] font-bold text-white tracking-tight leading-[1.14] whitespace-pre-line min-h-[5rem] flex items-end">
          {activeSlide.title}
        </h2>

        {/* Subtitle */}
        <p className="text-white/65 text-xs sm:text-sm font-normal leading-relaxed min-h-[2.5rem]">
          {activeSlide.subtitle}
        </p>

        {/* Pagination Dots (like Prisma reference) */}
        <div className="flex items-center gap-2 pt-2">
          {LOGIN_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              type="button"
              onClick={() => setCurrent(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === current
                  ? 'w-7 bg-[#FF8265]'
                  : 'w-2 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
