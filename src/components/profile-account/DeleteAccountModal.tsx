'use client';

import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const isMatching = confirmText.trim().toUpperCase() === 'HAPUS';

  const handleConfirm = () => {
    if (!isMatching) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onConfirm();
      onClose();
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Konfirmasi Hapus Akun"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirm}
            disabled={!isMatching || loading}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50"
          >
            {loading ? 'Menghapus Akun...' : 'Ya, Hapus Akun Saya'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-1">
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200">
          <AlertTriangle className="size-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs text-red-700 space-y-1">
            <p className="font-bold">Peringatan: Tindakan ini permanen!</p>
            <p className="leading-relaxed">
              Semua data outlet, transaksi, histori login, dan hak akses Anda di NemuHUB akan dihapus permanen dan tidak dapat dipulihkan.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 mb-1.5">
            Ketik kata <span className="text-red-600 font-extrabold">HAPUS</span> untuk melanjutkan:
          </label>
          <Input
            size="sm"
            placeholder="HAPUS"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="font-mono"
            autoFocus
          />
        </div>
      </div>
    </Modal>
  );
}
