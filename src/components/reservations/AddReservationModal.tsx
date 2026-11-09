'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Users,
  Grid,
  MapPin,
  FileText,
  User,
  Phone,
} from 'lucide-react';
import { Reservation, ReservationArea, ReservationStatus } from '@/types/reservation';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';

export interface TableOption {
  id: string;
  name: string;
  area?: string;
  capacity?: number;
}

interface AddReservationModalProps {
  isOpen: boolean;
  reservationToEdit?: Reservation | null;
  tables?: TableOption[];
  onClose: () => void;
  onSave: (reservationData: Partial<Reservation>) => void;
}

export function AddReservationModal({
  isOpen,
  reservationToEdit,
  tables = [],
  onClose,
  onSave,
}: AddReservationModalProps) {
  const getTodayISO = () => new Date().toISOString().split('T')[0];

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState(getTodayISO());
  const [time, setTime] = useState('18:00');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [tableId, setTableId] = useState<string>('');
  const [table, setTable] = useState('');
  const [area, setArea] = useState<ReservationArea>('Indoor');
  const [duration, setDuration] = useState('2 jam');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ReservationStatus>('AKAN_DATANG');

  useEffect(() => {
    if (reservationToEdit) {
      setCustomerName(reservationToEdit.customerName || '');
      setCustomerPhone(reservationToEdit.customerPhone || '');
      setDate(reservationToEdit.date || getTodayISO());
      setTime(reservationToEdit.time || '18:00');
      setGuestCount(reservationToEdit.guestCount || 2);
      setTableId(reservationToEdit.tableId || '');
      setTable(reservationToEdit.table || '');
      setArea(reservationToEdit.area || 'Indoor');
      setDuration(reservationToEdit.duration || '2 jam');
      setNotes(reservationToEdit.notes === '-' ? '' : reservationToEdit.notes || '');
      setStatus(reservationToEdit.status || 'AKAN_DATANG');
    } else {
      setCustomerName('');
      setCustomerPhone('');
      setDate(getTodayISO());
      setTime('18:00');
      setGuestCount(2);
      const firstTable = tables && tables.length > 0 ? tables[0] : null;
      setTableId(firstTable ? firstTable.id : '');
      setTable(firstTable ? firstTable.name : 'Meja 1');
      setArea((firstTable?.area as ReservationArea) || 'Indoor');
      setDuration('2 jam');
      setNotes('');
      setStatus('AKAN_DATANG');
    }
  }, [reservationToEdit, isOpen, tables]);

  if (!isOpen) return null;

  const handleTableChange = (selectedIdOrName: string) => {
    const found = tables.find((t) => t.id === selectedIdOrName || t.name === selectedIdOrName);
    if (found) {
      setTableId(found.id);
      setTable(found.name);
      if (found.area) {
        setArea((found.area === 'Outdoor' ? 'Outdoor' : found.area === 'VIP' ? 'VIP' : 'Indoor') as ReservationArea);
      }
    } else {
      setTableId('');
      setTable(selectedIdOrName);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    onSave({
      id: reservationToEdit?.id,
      tableId: tableId || undefined,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || '-',
      date,
      time,
      guestCount,
      table: table || 'Meja Umum',
      area,
      duration,
      notes: notes.trim() || '-',
      status,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={reservationToEdit ? 'Ubah Reservasi Meja' : 'Tambah Reservasi Meja'}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose}>
            Batal
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-semibold"
          >
            {reservationToEdit ? 'Simpan Perubahan' : 'Buat Reservasi'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Nama Pelanggan *
            </label>
            <Input
              size="sm"
              placeholder="Contoh: Siti Nurhaliza"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              No. Telepon / WhatsApp
            </label>
            <Input
              size="sm"
              placeholder="Contoh: 0813 9876 5432"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Tanggal Reservasi
            </label>
            <Input
              type="date"
              size="sm"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Waktu / Jam
            </label>
            <Input
              type="time"
              size="sm"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Jumlah Tamu (Pax)
            </label>
            <Input
              type="number"
              size="sm"
              min={1}
              max={50}
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Durasi
            </label>
            <Select
              size="sm"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >
              <option value="1 jam">1 jam</option>
              <option value="2 jam">2 jam</option>
              <option value="3 jam">3 jam</option>
              <option value="4 jam">4 jam</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Pilihan Meja
            </label>
            <Select
              size="sm"
              value={tableId || table}
              onChange={(e) => handleTableChange(e.target.value)}
            >
              {tables && tables.length > 0 ? (
                tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.area || 'Indoor'}{t.capacity ? ` - ${t.capacity} pax` : ''})
                  </option>
                ))
              ) : (
                <>
                  <option value="Meja 1">Meja 1 (Indoor)</option>
                  <option value="Meja 2">Meja 2 (Indoor)</option>
                  <option value="Meja 3">Meja 3 (Indoor)</option>
                  <option value="Meja 4">Meja 4 (Outdoor)</option>
                  <option value="Meja 5">Meja 5 (Outdoor)</option>
                  <option value="VIP Room">VIP Room (VIP)</option>
                </>
              )}
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Area Meja
            </label>
            <Select
              size="sm"
              value={area}
              onChange={(e) => setArea(e.target.value as ReservationArea)}
            >
              <option value="Indoor">Indoor</option>
              <option value="Outdoor">Outdoor</option>
              <option value="VIP">VIP</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Status Reservasi
          </label>
          <Select
            size="sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as ReservationStatus)}
          >
            <option value="AKAN_DATANG">Akan Datang</option>
            <option value="DUDUK">Duduk</option>
            <option value="SELESAI">Selesai</option>
            <option value="DIBATALKAN">Dibatalkan</option>
          </Select>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1">
            Catatan Khusus (Acara / Permintaan)
          </label>
          <Textarea
            rows={2}
            placeholder="Contoh: Ulang tahun, request dekat jendela, siapkan high chair"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </form>
    </Modal>
  );
}
