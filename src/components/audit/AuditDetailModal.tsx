'use client';

import React from 'react';
import {
  X,
  ShieldAlert,
  LogIn,
  LogOut,
  Laptop,
  Smartphone,
  Globe,
  Calendar,
  Clock,
  User,
  Copy,
  Check,
  Server,
  Layers,
} from 'lucide-react';
import { AuditLog } from '@/services/system.service';
import { Button } from '@/components/common/Button';

interface AuditDetailModalProps {
  log: AuditLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditDetailModal({ log, isOpen, onClose }: AuditDetailModalProps) {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  if (!isOpen || !log) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const user = log.user;
  const roleName = user?.user_roles?.[0]?.role?.name || 'Kasir';
  const isLogin = log.action === 'LOGIN';

  const dateObj = new Date(log.created_at);
  const formattedDate = dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = dateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                isLogin
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-neutral-100 text-neutral-600 border-neutral-200'
              }`}
            >
              {isLogin ? <LogIn className="size-5" /> : <LogOut className="size-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-neutral-900">
                  Detail Log: {log.action}
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    isLogin
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                  }`}
                >
                  {log.action}
                </span>
              </div>
              <p className="text-xs text-neutral-500 font-mono mt-0.5">
                ID: {log.id}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* User Section */}
          <div className="bg-neutral-50/80 rounded-xl p-4 border border-neutral-200/80">
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <User className="size-3.5 text-neutral-400" />
              Identitas Pengguna
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-400">Nama Lengkap</p>
                <p className="font-semibold text-neutral-900 mt-0.5">
                  {user?.name || 'Tidak diketahui'}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Email Akun</p>
                <p className="font-semibold text-neutral-900 mt-0.5">
                  {user?.email || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Peran & Hak Akses</p>
                <span className="inline-block mt-0.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-neutral-200/60 text-neutral-800">
                  {roleName}
                </span>
              </div>
              <div>
                <p className="text-xs text-neutral-400">User ID</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xs text-neutral-700 truncate max-w-[160px]">
                    {log.user_id || '-'}
                  </span>
                  {log.user_id && (
                    <button
                      type="button"
                      onClick={() => handleCopy(log.user_id!, 'user_id')}
                      className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-700 transition"
                      title="Salin ID Pengguna"
                    >
                      {copiedKey === 'user_id' ? (
                        <Check className="size-3 text-emerald-600" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Network & Device Info */}
          <div className="bg-neutral-50/80 rounded-xl p-4 border border-neutral-200/80">
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Server className="size-3.5 text-neutral-400" />
              Jaringan & Perangkat
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-neutral-400">Alamat IP Client</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xs font-semibold text-neutral-900">
                    {log.ip_address || '127.0.0.1'}
                  </span>
                  {log.ip_address && (
                    <button
                      type="button"
                      onClick={() => handleCopy(log.ip_address!, 'ip')}
                      className="p-1 hover:bg-neutral-200 rounded text-neutral-400 hover:text-neutral-700 transition"
                      title="Salin Alamat IP"
                    >
                      {copiedKey === 'ip' ? (
                        <Check className="size-3 text-emerald-600" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-neutral-400">Waktu & Tanggal</p>
                <p className="text-xs text-neutral-800 font-medium mt-0.5">
                  {formattedDate}, {formattedTime} WIB
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-neutral-200/60">
              <p className="text-xs text-neutral-400 mb-1">User-Agent Lengkap</p>
              <div className="p-2.5 rounded-lg bg-white border border-neutral-200 text-[11px] font-mono text-neutral-700 break-all leading-relaxed">
                {log.user_agent || 'Tidak tersedia'}
              </div>
            </div>
          </div>

          {/* Module & Context */}
          <div className="bg-neutral-50/80 rounded-xl p-4 border border-neutral-200/80">
            <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Layers className="size-3.5 text-neutral-400" />
              Konteks Sistem
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-neutral-400">Modul</p>
                <p className="font-semibold text-neutral-800 uppercase mt-0.5">
                  {log.module || 'auth'}
                </p>
              </div>
              <div>
                <p className="text-neutral-400">Tipe Entitas</p>
                <p className="font-semibold text-neutral-800 capitalize mt-0.5">
                  {log.entity_type || 'user'}
                </p>
              </div>
              <div>
                <p className="text-neutral-400">Tenant ID</p>
                <p className="font-mono text-neutral-700 truncate mt-0.5">
                  {log.tenant_id ? `${log.tenant_id.slice(0, 8)}...` : 'Semua / Global'}
                </p>
              </div>
              <div>
                <p className="text-neutral-400">Outlet / Store</p>
                <p className="font-semibold text-neutral-800 mt-0.5">
                  {log.store?.name || 'Semua Outlet'}
                </p>
              </div>
            </div>

            {(log.old_values || log.new_values) && (
              <div className="mt-4 pt-3 border-t border-neutral-200/60 space-y-3">
                <p className="text-xs font-bold text-neutral-500 uppercase">
                  Perubahan Data (Payload Diff)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-rose-600 block mb-1">
                      Nilai Sebelumnya:
                    </span>
                    <pre className="p-2 rounded bg-white border border-neutral-200 text-[11px] font-mono overflow-x-auto text-neutral-700">
                      {JSON.stringify(log.old_values, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-emerald-600 block mb-1">
                      Nilai Baru:
                    </span>
                    <pre className="p-2 rounded bg-white border border-neutral-200 text-[11px] font-mono overflow-x-auto text-neutral-700">
                      {JSON.stringify(log.new_values, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-100 flex justify-end bg-neutral-50/50">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
