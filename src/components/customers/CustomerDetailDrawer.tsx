'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Trash2,
  Check,
  CheckCircle2,
  XCircle,
  Upload,
  FileText,
  Calendar,
  Clock,
  Receipt,
  AlertTriangle,
} from 'lucide-react';
import { Customer, CustomerSegmentation, CustomerStatus } from '@/types/customer';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Textarea } from '@/components/common/Textarea';
import { Modal } from '@/components/common/Modal';
import { StatusBadge } from '@/components/common/StatusBadge';
import { formatRupiah } from '@/utils';

interface CustomerDetailDrawerProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCustomer: Customer) => void;
  onDelete: (customerId: string) => void;
}

export function CustomerDetailDrawer({
  customer,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: CustomerDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'transactions'>('info');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthDate, setBirthDate] = useState('12 Mei 1995');
  const [gender, setGender] = useState<'Laki-laki' | 'Perempuan'>('Laki-laki');
  const [segmentation, setSegmentation] = useState<CustomerSegmentation>('VIP');
  const [status, setStatus] = useState<CustomerStatus>('Aktif');
  const [notes, setNotes] = useState('');
  const [address, setAddress] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone || '');
      setEmail(customer.email || '');
      setBirthDate(customer.birthDate || '12 Mei 1995');
      setGender(customer.gender || 'Laki-laki');
      setSegmentation(customer.segmentation || 'VIP');
      setStatus(customer.status || 'Aktif');
      setNotes(
        customer.notes ||
          'Pelanggan loyal, biasanya pesan kopi susu tanpa gula. Lebih suka duduk di area indoor dan sesekali memesan pastry.'
      );
      setAddress(customer.address || 'Jl. Melati No. 25, Menteng, Jakarta Pusat');
      setPhotoPreview(customer.avatarUrl || null);
      setActiveTab('info');
    }
  }, [customer]);

  if (!isOpen || !customer) return null;

  const handleSave = () => {
    const updated: Customer = {
      ...customer,
      name,
      phone,
      email,
      birthDate,
      gender,
      segmentation,
      status,
      notes,
      address,
      avatarUrl: photoPreview || undefined,
    };
    onSave(updated);
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoPreview(url);
    }
  };

  const dummyTransactions = customer.transactions && customer.transactions.length > 0 ? customer.transactions : [
    {
      id: 'tx-1',
      orderNumber: 'ORD-2024-0012',
      date: '12 Jan 2024 14:30',
      items: '2x Kopi Susu Aren, 1x Croissant Butter',
      amount: 68000,
      paymentMethod: 'QRIS',
      status: 'Selesai' as const,
    },
    {
      id: 'tx-2',
      orderNumber: 'ORD-2024-0009',
      date: '10 Jan 2024 11:15',
      items: '1x Caramel Macchiato, 1x Cinnamon Roll',
      amount: 52000,
      paymentMethod: 'Kartu Debit',
      status: 'Selesai' as const,
    },
    {
      id: 'tx-3',
      orderNumber: 'ORD-2024-0004',
      date: '05 Jan 2024 16:45',
      items: '3x Iced Americano',
      amount: 75000,
      paymentMethod: 'Tunai',
      status: 'Selesai' as const,
    },
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
        />

        {/* Drawer Panel */}
        <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 md:pl-10">
          <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 ease-out">
            {/* Header matching Screenshot 1 */}
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3.5">
                <div className="size-12 rounded-full bg-neutral-100 text-neutral-700 font-bold text-base flex items-center justify-center shrink-0 border border-neutral-200">
                  {customer.initials || customer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-bold text-neutral-900 leading-snug">
                    {name || customer.name}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    {/* VIP / Regular / Baru badge */}
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        segmentation === 'VIP'
                          ? 'bg-rose-50 text-rose-600 border-rose-200'
                          : segmentation === 'Regular'
                          ? 'bg-blue-50 text-blue-600 border-blue-200'
                          : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      }`}
                    >
                      {segmentation}
                    </span>

                    {/* Status badge */}
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                        status === 'Aktif'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-neutral-100 text-neutral-600 border-neutral-200'
                      }`}
                    >
                      {status === 'Aktif' ? (
                        <CheckCircle2 className="size-3 text-emerald-600" />
                      ) : (
                        <XCircle className="size-3 text-neutral-400" />
                      )}
                      {status}
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {customer.joinDate || 'Bergabung 12 Jan 2024'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="size-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
                title="Tutup"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body: Left Tab Navigation + Right Content Panel */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Sub-sidebar Navigation */}
              <div className="w-44 border-r border-neutral-100 p-3 space-y-1 bg-neutral-50/40 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('info')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'info'
                      ? 'bg-rose-50/80 text-[#FF5C38] font-semibold border-l-2 border-[#FF5C38]'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  Informasi Dasar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('transactions')}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    activeTab === 'transactions'
                      ? 'bg-rose-50/80 text-[#FF5C38] font-semibold border-l-2 border-[#FF5C38]'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                >
                  Riwayat Transaksi
                </button>
              </div>

              {/* Right Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {activeTab === 'info' ? (
                  <>
                    {/* Nama Lengkap */}
                    <Input
                      label="Nama Lengkap"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                    />

                    {/* No Telepon & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      <Input
                        label="No Telepon"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Contoh: 081234567890"
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Contoh: email@domain.com"
                      />
                    </div>

                    {/* Foto Pelanggan Card matching Screenshot 1 */}
                    <div>
                      <p className="text-xs font-bold text-neutral-800 mb-2">
                        Foto Pelanggan
                      </p>
                      <div className="border border-dashed border-sky-300 bg-sky-50/20 rounded-xl p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                            <FileText className="size-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-neutral-800">
                              Upload Foto Pelanggan
                            </p>
                            <p className="text-[11px] text-neutral-400 mt-0.5">
                              WeBP, JPG, PNG. Ratio 1:1, Maks. 2MB
                            </p>
                          </div>
                        </div>

                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                          />
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                            className="border-rose-400 text-[#FF5C38] hover:bg-rose-50 text-xs px-3.5 font-medium"
                          >
                            Pilih file
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Informasi Tambahan */}
                    <div className="pt-1">
                      <p className="text-xs font-bold text-neutral-800 mb-2.5">
                        Informasi Tambahan
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-3.5">
                        <Input
                          label="Tanggal Lahir"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          placeholder="Contoh: 12 Mei 1995"
                          rightIcon={<Calendar className="size-4 text-neutral-400" />}
                        />

                        <Select
                          label="Jenis Kelamin"
                          value={gender}
                          onChange={(e) => setGender(e.target.value as any)}
                        >
                          <option value="Laki-laki">Laki-laki</option>
                          <option value="Perempuan">Perempuan</option>
                        </Select>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div className="space-y-3.5">
                          <Select
                            label="Segmentasi"
                            value={segmentation}
                            onChange={(e) =>
                              setSegmentation(e.target.value as CustomerSegmentation)
                            }
                          >
                            <option value="VIP">VIP</option>
                            <option value="Regular">Regular</option>
                            <option value="Baru">Baru</option>
                          </Select>

                          <Select
                            label="Status"
                            value={status}
                            onChange={(e) =>
                              setStatus(e.target.value as CustomerStatus)
                            }
                          >
                            <option value="Aktif">Aktif</option>
                            <option value="Nonaktif">Nonaktif</option>
                          </Select>
                        </div>

                        <Textarea
                          label="Catatan"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={4}
                          placeholder="Catatan mengenai kebiasaan atau preferensi pelanggan..."
                        />
                      </div>
                    </div>

                    {/* Alamat */}
                    <div className="pt-1">
                      <p className="text-xs font-bold text-neutral-800 mb-2.5">
                        Alamat
                      </p>
                      <Textarea
                        label="Catatan Alamat"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        rows={2}
                        placeholder="Alamat lengkap domisili pelanggan..."
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-1">
                      <p className="text-xs font-bold text-neutral-800">
                        Total {dummyTransactions.length} Transaksi Terakhir
                      </p>
                      <p className="text-xs font-semibold text-neutral-500">
                        Total Belanja: {formatRupiah(customer.totalSpent)}
                      </p>
                    </div>

                    <div className="space-y-2.5">
                      {dummyTransactions.map((tx) => (
                        <div
                          key={tx.id}
                          className="p-3.5 rounded-xl border border-neutral-200/80 bg-white hover:border-neutral-300 transition-colors shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-neutral-800">
                              {tx.orderNumber}
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                              {tx.status}
                            </span>
                          </div>

                          <p className="text-xs text-neutral-600 line-clamp-1">
                            {tx.items}
                          </p>

                          <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[11px] text-neutral-400">
                            <span>{tx.date} • {tx.paymentMethod}</span>
                            <span className="text-xs font-bold text-neutral-900">
                              {formatRupiah(tx.amount)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer matching Screenshot 1 */}
            <div className="px-6 py-4 border-t border-neutral-100 bg-white flex items-center justify-between">
              <Button
                variant="outline"
                className="border-neutral-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-semibold px-4 py-2"
                leftIcon={<Trash2 className="size-4 text-rose-500" />}
                onClick={() => setShowDeleteModal(true)}
              >
                Hapus Pelanggan
              </Button>

              <Button
                variant="primary"
                className="bg-[#FF5C38] hover:bg-[#E04B28] text-xs font-semibold px-5 py-2"
                leftIcon={<Check className="size-4" />}
                onClick={handleSave}
              >
                Simpan Perubahan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Hapus Data Pelanggan"
        size="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                onDelete(customer.id);
                setShowDeleteModal(false);
                onClose();
              }}
            >
              Ya, Hapus
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-1">
          <div className="flex items-center gap-3 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
            <AlertTriangle className="size-5 shrink-0" />
            <p className="text-xs text-amber-800 leading-relaxed">
              Apakah Anda yakin ingin menghapus pelanggan <strong>{customer.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}
