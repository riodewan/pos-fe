'use client';

import React from 'react';
import {
  Coffee,
  GlassWater,
  UtensilsCrossed,
  Heart,
  Cake,
  Star,
  Plus,
} from 'lucide-react';
import { formatRupiah } from '@/utils';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';

export interface PosProduct {
  id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  isFavorite?: boolean;
}


interface PosProductGridProps {
  products: PosProduct[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  showOnlyFavorites: boolean;
  onToggleFavorites: () => void;
  onAddToCart: (product: PosProduct) => void;
  onResetDemoMenu?: () => void;
}

export function PosProductGrid({
  products,
  selectedCategory,
  onSelectCategory,
  showOnlyFavorites,
  onToggleFavorites,
  onAddToCart,
  onResetDemoMenu,
}: PosProductGridProps) {
  const categories = [{ id: 'Semua', label: 'Semua', icon: null as null | typeof Coffee }];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white rounded-2xl border border-neutral-200/90 shadow-2xs overflow-hidden">
      {/* Category Pills Bar matching Screenshot 1 */}
      <div className="px-5 py-3 border-b border-neutral-100 flex items-center justify-between gap-2 overflow-x-auto bg-white">
        <div className="flex items-center gap-6 text-xs whitespace-nowrap">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id && !showOnlyFavorites;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  if (showOnlyFavorites) onToggleFavorites();
                  onSelectCategory(cat.id);
                }}
                className={`flex items-center gap-1.5 py-1 transition-colors relative cursor-pointer ${
                  isActive
                    ? 'text-[#FF5C38] font-bold'
                    : 'text-neutral-500 hover:text-neutral-800 font-medium'
                }`}
              >
                {Icon && <Icon className="size-3.5" />}
                <span>{cat.label}</span>
                {isActive && (
                  <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-[#FF5C38]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Favorit button */}
        <button
          type="button"
          onClick={onToggleFavorites}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
            showOnlyFavorites
              ? 'border-amber-400 bg-amber-50 text-amber-700 shadow-2xs'
              : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
          }`}
        >
          <Star className="size-3.5 fill-amber-400 text-amber-400" />
          <span>Favorit</span>
        </button>
      </div>

      {/* Product Cards Grid matching Screenshot 1 */}
      <div className="flex-1 overflow-y-auto p-5">
        {products.length === 0 ? (
          /* Empty State matching Screenshot 2 */
          <div className="h-full min-h-[380px] flex flex-col items-center justify-center text-center p-6">
            <EmptyState
              title="BELUM ADA MENU"
              description="Tambahkan menu terlebih dahulu untuk mulai mencatat pesanan di kasir."
              actionLabel="Tambah Menu"
              onAction={onResetDemoMenu}
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
            {products.map((item) => (
              <div
                key={item.id}
                onClick={() => onAddToCart(item)}
                className="group p-3 rounded-2xl border border-neutral-200/80 bg-white hover:border-[#FF5C38]/40 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between select-none"
              >
                {/* Product Image */}
                <div className="relative w-full aspect-square rounded-xl bg-neutral-50/60 overflow-hidden flex items-center justify-center mb-3">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <Coffee className="size-8 text-neutral-300" />
                  )}
                  {/* Subtle Add Hover Overlay */}
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="size-7 rounded-full bg-white text-[#FF5C38] shadow-md flex items-center justify-center">
                      <Plus className="size-4" />
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-neutral-900 line-clamp-1 leading-snug group-hover:text-[#FF5C38] transition-colors">
                    {item.name}
                  </h4>
                  <p className="text-xs font-medium text-neutral-500">
                    {formatRupiah(item.price)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
