'use client';

import React, { useState } from 'react';
import { Image as ImageIcon, UploadCloud, Trash2, Plus, Eye } from 'lucide-react';
import { OutletPhotoItem } from '@/types/profile-outlet';
import { Button } from '@/components/common/Button';

interface PhotosMediaTabProps {
  initialPhotos: OutletPhotoItem[];
  onSave: (photos: OutletPhotoItem[]) => void;
}

export function PhotosMediaTab({ initialPhotos, onSave }: PhotosMediaTabProps) {
  const [photos, setPhotos] = useState<OutletPhotoItem[]>(initialPhotos);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [isSaved, setIsSaved] = useState(false);

  const categories = ['Semua', 'Indoor', 'Outdoor', 'Menu', 'Lainnya'];

  const filteredPhotos = activeCategory === 'Semua'
    ? photos
    : photos.filter((p) => p.category === activeCategory);

  const handleDelete = (id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddSample = (cat: 'Indoor' | 'Outdoor' | 'Menu' | 'Lainnya') => {
    const newPhoto: OutletPhotoItem = {
      id: `photo-${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=60',
      title: `${cat} Foto Outlet #${photos.length + 1}`,
      category: cat,
    };
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  const handleSave = () => {
    onSave(photos);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-2xs p-5 space-y-6 animate-in fade-in duration-150">
      {/* Header & Categories */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Foto & Media Outlet</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Unggah foto suasana outlet, area indoor/outdoor, dan display menu untuk memikat pelanggan
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#FF5C38] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="border-2 border-dashed border-neutral-200 hover:border-[#FF5C38]/60 bg-neutral-50/50 hover:bg-orange-50/20 rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center">
        <div className="size-12 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center text-[#FF5C38] mb-3">
          <UploadCloud className="size-6" />
        </div>
        <p className="text-xs font-bold text-neutral-800">
          Tarik & letakkan foto di sini, atau{' '}
          <span className="text-[#FF5C38] hover:underline">pilih file dari perangkat</span>
        </p>
        <p className="text-[11px] text-neutral-400 mt-1">
          Mendukung WebP, JPG, PNG hingga 5MB. Rasio rekomendasi 16:9 atau 4:3.
        </p>
        <div className="flex gap-2 mt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddSample('Indoor')}
            className="text-[11px] h-7 border-neutral-200"
          >
            <Plus className="size-3 mr-1" /> Tambah Contoh Indoor
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleAddSample('Menu')}
            className="text-[11px] h-7 border-neutral-200"
          >
            <Plus className="size-3 mr-1" /> Tambah Contoh Menu
          </Button>
        </div>
      </div>

      {/* Grid of Photos */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-neutral-800">
            Daftar Foto ({filteredPhotos.length})
          </h4>
          <span className="text-[11px] text-neutral-400">
            Maksimal 20 foto per outlet
          </span>
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-xs">
            Belum ada foto dalam kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 aspect-4/3 flex flex-col justify-end"
              >
                {/* Image */}
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                    {photo.category}
                  </span>
                </div>

                {/* Top Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(photo.id)}
                  className="absolute top-2 right-2 size-7 rounded-lg bg-red-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:bg-red-700 shadow-xs z-10"
                  title="Hapus foto"
                >
                  <Trash2 className="size-3.5" />
                </button>

                {/* Bottom Title */}
                <div className="relative z-10 p-2.5 text-white">
                  <p className="text-xs font-semibold truncate leading-tight">
                    {photo.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
        {isSaved && (
          <span className="text-xs font-bold text-emerald-600 animate-in fade-in">
            Galeri foto berhasil disimpan!
          </span>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-6 py-2.5"
        >
          Simpan Foto & Media
        </Button>
      </div>
    </div>
  );
}
