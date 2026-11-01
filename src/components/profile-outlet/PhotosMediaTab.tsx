'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Trash2,
  Plus,
  Eye,
  X,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { OutletPhotoItem } from '@/types/profile-outlet';
import { Button } from '@/components/common/Button';

interface PhotosMediaTabProps {
  initialPhotos: OutletPhotoItem[];
  onSave: (photos: OutletPhotoItem[]) => void;
}

export function PhotosMediaTab({ initialPhotos, onSave }: PhotosMediaTabProps) {
  const [photos, setPhotos] = useState<OutletPhotoItem[]>(initialPhotos || []);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [isSaved, setIsSaved] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<OutletPhotoItem | null>(null);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [titleInput, setTitleInput] = useState('');
  const [categoryInput, setCategoryInput] = useState<'Indoor' | 'Outdoor' | 'Menu' | 'Lainnya'>('Indoor');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (Array.isArray(initialPhotos)) {
      setPhotos(initialPhotos);
    }
  }, [initialPhotos]);

  const categories = ['Semua', 'Indoor', 'Outdoor', 'Menu', 'Lainnya'];

  const filteredPhotos =
    activeCategory === 'Semua'
      ? photos
      : photos.filter((p) => p.category === activeCategory);

  const getCategoryCount = (cat: string) => {
    if (cat === 'Semua') return photos.length;
    return photos.filter((p) => p.category === cat).length;
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Yakin ingin menghapus foto ini?')) {
      setPhotos((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const newPhoto: OutletPhotoItem = {
            id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            url: reader.result,
            title: file.name.replace(/\.[^/.]+$/, ''),
            category: activeCategory === 'Semua' ? 'Indoor' : (activeCategory as any),
          };
          setPhotos((prev) => [newPhoto, ...prev]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAddViaUrl = () => {
    const trimmedUrl = urlInput.trim();
    if (!trimmedUrl) return;

    const newPhoto: OutletPhotoItem = {
      id: `photo-${Date.now()}`,
      url: trimmedUrl,
      title: titleInput.trim() || `Foto ${categoryInput}`,
      category: categoryInput,
    };

    setPhotos((prev) => [newPhoto, ...prev]);
    setUrlInput('');
    setTitleInput('');
    setIsUrlModalOpen(false);
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
          {categories.map((cat) => {
            const count = getCategoryCount(cat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeCategory === cat
                    ? 'bg-[#FF5C38] text-white shadow-xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeCategory === cat
                      ? 'bg-white/20 text-white'
                      : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Dropzone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-neutral-200 hover:border-[#FF5C38]/60 bg-neutral-50/50 hover:bg-orange-50/20 rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center group"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className="size-12 rounded-full bg-white shadow-xs border border-neutral-200 group-hover:border-[#FF5C38] flex items-center justify-center text-[#FF5C38] mb-3 transition-colors">
          <UploadCloud className="size-6" />
        </div>
        <p className="text-xs font-bold text-neutral-800">
          Tarik & letakkan foto di sini, atau{' '}
          <span className="text-[#FF5C38] hover:underline">pilih file dari perangkat</span>
        </p>
        <p className="text-[11px] text-neutral-400 mt-1">
          Mendukung WebP, JPG, PNG. Rekomendasi rasio 16:9 atau 4:3.
        </p>

        <div className="flex items-center gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs h-8 border-neutral-200 cursor-pointer"
          >
            <Plus className="size-3.5 mr-1.5 text-[#FF5C38]" /> Pilih File Foto
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsUrlModalOpen(true)}
            className="text-xs h-8 border-neutral-200 cursor-pointer"
          >
            <LinkIcon className="size-3.5 mr-1.5 text-blue-500" /> Tambah via URL
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
            Kategori saat ini: {activeCategory}
          </span>
        </div>

        {filteredPhotos.length === 0 ? (
          <div className="py-12 text-center text-neutral-400 text-xs border border-neutral-100 rounded-xl bg-neutral-50/50 flex flex-col items-center justify-center">
            <ImageIcon className="size-8 text-neutral-300 mb-2 stroke-[1.5]" />
            <p className="font-semibold text-neutral-600">Belum ada foto dalam kategori {activeCategory}.</p>
            <p className="text-[11px] text-neutral-400 mt-0.5">Unggah foto baru menggunakan form di atas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative rounded-xl overflow-hidden border border-neutral-200 bg-neutral-100 aspect-4/3 flex flex-col justify-end shadow-2xs"
              >
                {/* Image */}
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                {/* Top Badge */}
                <div className="absolute top-2 left-2 z-10">
                  <span className="px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                    {photo.category}
                  </span>
                </div>

                {/* Actions: View & Delete */}
                <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => setPreviewPhoto(photo)}
                    className="size-7 rounded-lg bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors shadow-xs"
                    title="Pratinjau foto"
                  >
                    <Eye className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(photo.id)}
                    className="size-7 rounded-lg bg-red-600/90 text-white flex items-center justify-center cursor-pointer hover:bg-red-700 transition-colors shadow-xs"
                    title="Hapus foto"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>

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
          <span className="text-xs font-bold text-emerald-600 animate-in fade-in flex items-center gap-1.5">
            <CheckCircle2 className="size-4" />
            Galeri foto & media berhasil disimpan!
          </span>
        )}
        <Button
          variant="primary"
          size="sm"
          onClick={handleSave}
          className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-6 py-2.5 rounded-xl shadow-xs cursor-pointer"
        >
          Simpan Foto & Media
        </Button>
      </div>

      {/* Modal: Tambah via URL */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2">
                <LinkIcon className="size-4 text-[#FF5C38]" />
                Tambah Foto dari URL
              </h3>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  URL Gambar
                </label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/foto-outlet.jpg"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF5C38]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Judul / Keterangan
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="Area Depan Barista"
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium focus:outline-none focus:border-[#FF5C38]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1">
                  Kategori
                </label>
                <select
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-neutral-200 text-xs font-medium bg-white focus:outline-none focus:border-[#FF5C38]"
                >
                  <option value="Indoor">Indoor</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="Menu">Menu</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsUrlModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAddViaUrl}
                disabled={!urlInput.trim()}
                className="bg-[#FF5C38] hover:bg-[#E04B28] text-white text-xs px-4"
              >
                Tambahkan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Preview Modal */}
      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl relative"
          >
            <div className="relative aspect-16/10 bg-black flex items-center justify-center">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-h-[75vh] w-auto max-w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewPhoto(null)}
                className="absolute top-3 right-3 size-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="p-4 bg-neutral-900 text-white flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{previewPhoto.title}</p>
                <span className="text-[11px] text-neutral-400">
                  Kategori: {previewPhoto.category}
                </span>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleDelete(previewPhoto.id);
                  setPreviewPhoto(null);
                }}
                className="text-xs text-red-400 hover:text-red-300 border-red-500/30 hover:bg-red-500/10"
              >
                <Trash2 className="size-3.5 mr-1.5" /> Hapus Foto
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
