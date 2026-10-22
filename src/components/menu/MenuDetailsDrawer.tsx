'use client';

import React, { useState } from 'react';
import {
  X,
  Trash2,
  Check,
  Upload,
  Coffee,
  Utensils,
  Cookie,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatRupiah } from '@/utils';

export interface MenuItem {
  id: string;
  name: string;
  sku: string;
  category: 'Kopi' | 'Pastry' | 'Makanan Berat' | string;
  type: 'Minuman' | 'Makanan' | 'Cemilan' | 'Lainnya';
  price: number;
  cost: number;
  margin: number;
  status: 'Aktif' | 'Nonaktif';
  description?: string;
  image?: string;
}

export interface MenuDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem | null;
  onSave?: (updatedItem: MenuItem) => void;
  onDelete?: (itemId: string) => void;
}

export function MenuDetailsDrawer({
  isOpen,
  onClose,
  item,
  onSave,
  onDelete,
}: MenuDetailsDrawerProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'pricing' | 'ingredients' | 'settings'>('info');

  // Form states initialized from item
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState(item?.category || 'Kopi');
  const [type, setType] = useState<MenuItem['type']>(item?.type || 'Minuman');
  const [status, setStatus] = useState<MenuItem['status']>(item?.status || 'Aktif');
  const [description, setDescription] = useState(
    item?.description || 'Kopi espresso dengan susu fresh dan gula aren'
  );
  const [price, setPrice] = useState(item?.price || 28000);
  const [cost, setCost] = useState(item?.cost || 8000);

  // Sync state when item changes
  React.useEffect(() => {
    if (item) {
      setName(item.name);
      setCategory(item.category);
      setType(item.type);
      setStatus(item.status);
      setDescription(item.description || 'Kopi espresso dengan susu fresh dan gula aren');
      setPrice(item.price);
      setCost(item.cost);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const handleSave = () => {
    onSave?.({
      ...item,
      name,
      category,
      type,
      status,
      description,
      price,
      cost,
      margin: price > 0 ? Number((((price - cost) / price) * 100).toFixed(1)) : 0,
    });
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
      />

      {/* Slide-over Container (matching Screenshot 2) */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[620px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
        {/* Drawer Top Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Thumbnail */}
            <div className="size-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 border border-amber-300 flex items-center justify-center text-amber-900 shrink-0 shadow-2xs">
              <Coffee className="size-6 text-amber-800" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900 tracking-tight">
                  {name || item.name}
                </h2>
                <StatusBadge variant="success" icon={<Check className="size-3" />}>
                  Aktif
                </StatusBadge>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">SKU: {item.sku}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="size-7 rounded-full bg-neutral-100 text-neutral-400 hover:text-neutral-700 flex items-center justify-center transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Drawer Body: 2 Columns (Sidebar & Form Content) */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Sub-nav */}
          <div className="w-40 border-r border-neutral-100 p-4 space-y-1.5 shrink-0 bg-white">
            <button
              onClick={() => setActiveTab('info')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'info'
                  ? 'bg-red-50 text-[#E5484D]'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              Informasi Dasar
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'pricing'
                  ? 'bg-red-50 text-[#E5484D]'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              Harga & Varian
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'ingredients'
                  ? 'bg-red-50 text-[#E5484D]'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              Bahan & HPP
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-red-50 text-[#E5484D]'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              Pengaturan
            </button>
          </div>

          {/* Right Form Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {activeTab === 'info' && (
              <>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Informasi Dasar</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Atur informasi utama menu</p>
                </div>

                {/* Field: Nama Menu */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">Nama Menu</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Kopi Susu Gula Aren"
                    className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs"
                  />
                </div>

                {/* Field: Kategori */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">Kategori</label>
                  <div className="relative">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 pl-3.5 pr-8 rounded-xl border border-neutral-200 text-xs text-neutral-900 appearance-none bg-white focus:outline-none focus:border-neutral-400 shadow-2xs cursor-pointer"
                    >
                      <option value="Kopi">Kopi</option>
                      <option value="Non-Kopi">Non-Kopi</option>
                      <option value="Pastry">Pastry</option>
                      <option value="Makanan Berat">Makanan Berat</option>
                      <option value="Snack">Snack</option>
                    </select>
                    <ChevronDown className="size-4 text-neutral-400 absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Field: Tipe Menu */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">Tipe Menu</label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['Minuman', 'Makanan', 'Cemilan', 'Lainnya'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setType(t)}
                        className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                          type === t
                            ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Field: Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setStatus('Aktif')}
                      className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                        status === 'Aktif'
                          ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      Aktif
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatus('Nonaktif')}
                      className={`h-9 rounded-xl text-xs font-semibold border transition-all ${
                        status === 'Nonaktif'
                          ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-2xs'
                          : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      Nonaktif
                    </button>
                  </div>
                </div>

                {/* Field: Deskripsi */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">Deskripsi</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Deskripsi bahan dan rasa menu..."
                    className="w-full p-3 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs resize-none"
                  />
                </div>

                {/* Field: Foto Menu */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">Foto Menu</label>
                  <p className="text-[11px] text-neutral-400">WebP, JPG, PNG. Ratio 1:1, Maks. 2MB</p>

                  <div className="flex items-center gap-3 pt-1">
                    {/* Existing Photo thumbnail */}
                    <div className="size-16 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-800 shadow-2xs shrink-0">
                      <Coffee className="size-7 text-amber-800" />
                    </div>

                    {/* Upload Box */}
                    <div className="size-16 rounded-xl border-2 border-dashed border-blue-400 bg-blue-50/50 flex flex-col items-center justify-center text-blue-600 cursor-pointer hover:bg-blue-50 transition-colors shadow-2xs shrink-0">
                      <Upload className="size-4" />
                      <span className="text-[10px] font-semibold mt-1">Upload</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Harga & Varian</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Kelola harga dasar dan opsi varian ukuran / rasa</p>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">Harga Jual Dasar (Rp)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-800">Perkiraan HPP (Rp)</label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(Number(e.target.value))}
                    className="w-full h-10 px-3.5 rounded-xl border border-neutral-200 text-xs text-neutral-900 focus:outline-none focus:border-neutral-400 shadow-2xs"
                  />
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-xs flex justify-between items-center">
                  <span className="text-neutral-500">Margin Keuntungan:</span>
                  <span className="font-bold text-emerald-600">
                    {price > 0 ? (((price - cost) / price) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'ingredients' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Bahan & HPP</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Resep dan alokasi stok bahan baku untuk menu ini</p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs text-neutral-600 space-y-2">
                  <div className="flex justify-between font-semibold text-neutral-800">
                    <span>Bahan Baku</span>
                    <span>Takaran</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-neutral-200">
                    <span>Biji Kopi House Blend</span>
                    <span>18 gram</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fresh Milk Greenfields</span>
                    <span>120 ml</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sirup Gula Aren Organik</span>
                    <span>25 ml</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Pengaturan Tambahan</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Pengaturan visibilitas kasir dan channel penjualan</p>
                </div>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2 text-neutral-800 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-neutral-300 text-blue-600" />
                    <span>Tampilkan di Kasir POS</span>
                  </label>
                  <label className="flex items-center gap-2 text-neutral-800 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-neutral-300 text-blue-600" />
                    <span>Tampilkan di QR Order Pelanggan</span>
                  </label>
                  <label className="flex items-center gap-2 text-neutral-800 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-neutral-300 text-blue-600" />
                    <span>Tersedia untuk Online Delivery (GoFood / GrabFood)</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drawer Bottom Actions matching Screenshot 2 */}
        <div className="p-4 border-t border-neutral-100 flex items-center justify-between gap-4 bg-white">
          <button
            onClick={() => {
              if (confirm(`Apakah Anda yakin ingin menghapus menu ${item.name}?`)) {
                onDelete?.(item.id);
                onClose();
              }
            }}
            className="h-10 px-4 rounded-xl border border-neutral-200 text-red-500 hover:bg-red-50 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Trash2 className="size-3.5" />
            <span>Hapus Menu</span>
          </button>

          <button
            onClick={handleSave}
            className="flex-1 h-10 px-5 rounded-xl bg-[#FF7A59] hover:bg-[#E56645] text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
          >
            <Check className="size-4 stroke-[2.5]" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </div>
    </>
  );
}
