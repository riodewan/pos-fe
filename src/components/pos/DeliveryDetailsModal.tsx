'use client';

import React, { useState, useEffect } from 'react';
import {
  Bike,
  Truck,
  MapPin,
  Phone,
  User,
  DollarSign,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { formatRupiah } from '@/utils';
import { useToast } from '@/context/ToastContext';

export interface DeliveryDetails {
  courier: 'GoSend' | 'GrabExpress' | 'Kurir Toko';
  recipientName: string;
  recipientPhone: string;
  address: string;
  deliveryFee: number;
  notes?: string;
}

interface DeliveryDetailsModalProps {
  isOpen: boolean;
  initialDetails?: DeliveryDetails;
  onClose: () => void;
  onConfirm: (details: DeliveryDetails) => void;
}

export function DeliveryDetailsModal({
  isOpen,
  initialDetails,
  onClose,
  onConfirm,
}: DeliveryDetailsModalProps) {
  const { toast } = useToast();
  const [courier, setCourier] = useState<'GoSend' | 'GrabExpress' | 'Kurir Toko'>(
    initialDetails?.courier || 'GoSend'
  );
  const [recipientName, setRecipientName] = useState(
    initialDetails?.recipientName || ''
  );
  const [recipientPhone, setRecipientPhone] = useState(
    initialDetails?.recipientPhone || ''
  );
  const [address, setAddress] = useState(
    initialDetails?.address || ''
  );
  const [deliveryFee, setDeliveryFee] = useState<number>(
    initialDetails?.deliveryFee ?? 10000
  );
  const [notes, setNotes] = useState(
    initialDetails?.notes || ''
  );

  // Sync state when initialDetails change or modal opens
  useEffect(() => {
    if (isOpen) {
      setCourier(initialDetails?.courier || 'GoSend');
      setRecipientName(initialDetails?.recipientName || '');
      setRecipientPhone(initialDetails?.recipientPhone || '');
      setAddress(initialDetails?.address || '');
      setDeliveryFee(initialDetails?.deliveryFee ?? 10000);
      setNotes(initialDetails?.notes || '');
    }
  }, [isOpen, initialDetails]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!recipientName.trim()) {
      toast.warning('Nama penerima wajib diisi.');
      return;
    }
    if (!address.trim()) {
      toast.warning('Alamat pengantaran wajib diisi.');
      return;
    }

    onConfirm({
      courier,
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      address: address.trim(),
      deliveryFee: Number(deliveryFee) || 0,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Informasi Pengantaran (Delivery)"
      size="md"
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
            Terapkan Pengantaran
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        {/* Courier selector chips */}
        <div>
          <label className="text-xs font-semibold text-neutral-800 block mb-1.5">
            Layanan Pengantaran / Kurir
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'GoSend', label: 'GoSend Instant', fee: 15000 },
              { id: 'GrabExpress', label: 'GrabExpress', fee: 16000 },
              { id: 'Kurir Toko', label: 'Kurir Internal', fee: 10000 },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCourier(c.id as any);
                  setDeliveryFee(c.fee);
                }}
                className={`p-2.5 rounded-xl border text-left transition-colors cursor-pointer ${
                  courier === c.id
                    ? 'border-[#FF5C38] bg-rose-50/50 text-[#FF5C38] font-bold'
                    : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Bike className="size-3.5" />
                  <span className="text-xs">{c.id}</span>
                </div>
                <p className="text-[11px] font-semibold text-neutral-500">
                  {formatRupiah(c.fee)}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Recipient info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Nama Penerima"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Nama lengkap penerima"
          />
          <Input
            label="Nomor Telepon / WA"
            value={recipientPhone}
            onChange={(e) => setRecipientPhone(e.target.value)}
            placeholder="0812xxxxxxxx"
          />
        </div>

        {/* Address */}
        <Textarea
          label="Alamat Pengantaran Lengkap"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={2}
          placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan..."
        />

        {/* Delivery Fee Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Biaya Ongkos Kirim (Rp)"
            type="number"
            value={deliveryFee || ''}
            onChange={(e) => setDeliveryFee(Number(e.target.value) || 0)}
          />
          <Input
            label="Catatan untuk Kurir"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Patokan lokasi / instruksi drop-off"
          />
        </div>
      </div>
    </Modal>
  );
}
