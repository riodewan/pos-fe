'use client';

import React, { useState } from 'react';
import {
  ShoppingBag,
  Clock,
  User,
  Check,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { formatRupiah } from '@/utils';

export interface TakeawayDetails {
  queueNumber: string;
  packagingOption: string;
  packagingFee: number;
  pickupTime: string;
  customerName: string;
}

interface TakeawayDetailsModalProps {
  isOpen: boolean;
  initialDetails?: TakeawayDetails;
  onClose: () => void;
  onConfirm: (details: TakeawayDetails) => void;
}

export function TakeawayDetailsModal({
  isOpen,
  initialDetails,
  onClose,
  onConfirm,
}: TakeawayDetailsModalProps) {
  const [queueNumber, setQueueNumber] = useState(
    initialDetails?.queueNumber || 'TA-014'
  );
  const [packagingOption, setPackagingOption] = useState(
    initialDetails?.packagingOption || 'Paper Bag Ramah Lingkungan'
  );
  const [packagingFee, setPackagingFee] = useState<number>(
    initialDetails?.packagingFee || 2000
  );
  const [pickupTime, setPickupTime] = useState(
    initialDetails?.pickupTime || 'Segera (10-15 menit)'
  );
  const [customerName, setCustomerName] = useState(
    initialDetails?.customerName || 'Marshanda'
  );

  if (!isOpen) return null;

  const packagingList = [
    { name: 'Paper Bag Ramah Lingkungan', fee: 2000 },
    { name: 'Cup Holder & Plastik Bio', fee: 1000 },
    { name: 'Bawa Tas Sendiri (Tanpa Kantong)', fee: 0 },
  ];

  const handleSave = () => {
    onConfirm({
      queueNumber,
      packagingOption,
      packagingFee,
      pickupTime,
      customerName,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pengaturan Pesanan Takeaway (Bungkus)"
      size="sm"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            className="bg-[#FF5C38] hover:bg-[#E04B28]"
          >
            Terapkan Takeaway
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
          <div>
            <p className="text-[11px] text-neutral-400">Nomor Antrean Takeaway</p>
            <p className="text-base font-mono font-bold text-neutral-900">
              {queueNumber}
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
            Siap Diambil
          </span>
        </div>

        <Input
          label="Nama Pengambil Pesanan"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="Nama pemesan"
        />

        <div>
          <label className="text-xs font-semibold text-neutral-800 block mb-1.5">
            Pilihan Kemasan & Kantong
          </label>
          <div className="space-y-2">
            {packagingList.map((pkg, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setPackagingOption(pkg.name);
                  setPackagingFee(pkg.fee);
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors cursor-pointer text-xs ${
                  packagingOption === pkg.name
                    ? 'border-[#FF5C38] bg-rose-50/50 text-[#FF5C38] font-bold'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <span>{pkg.name}</span>
                <span>{pkg.fee > 0 ? `+ ${formatRupiah(pkg.fee)}` : 'Gratis'}</span>
              </div>
            ))}
          </div>
        </div>

        <Select
          label="Estimasi Waktu Pengambilan"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
        >
          <option value="Segera (5-10 menit)">Segera (5-10 menit)</option>
          <option value="Segera (10-15 menit)">Segera (10-15 menit)</option>
          <option value="Ambil 30 Menit Lagi">Ambil 30 Menit Lagi</option>
          <option value="Ambil Jam Makan Siang">Ambil Jam Makan Siang (12:00)</option>
        </Select>
      </div>
    </Modal>
  );
}
