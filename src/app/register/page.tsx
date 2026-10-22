'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertTriangle, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/common/AuthLayout';
import { ApiError } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Daftar Akun NemuPOS';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setErrorMsg('Semua data wajib diisi.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password minimal harus 8 karakter.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      // Backend expects password_confirmation
      await register(name, email, password, password);
      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(
          err.message ||
            'Akun tidak dapat dibuat. Periksa kembali data yang kamu masukkan atau coba lagi beberapa saat.'
        );
      } else {
        setErrorMsg(
          'Akun tidak dapat dibuat. Periksa kembali data yang kamu masukkan atau coba lagi beberapa saat.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinueVerification = () => {
    router.push('/kyb');
  };

  return (
    <AuthLayout>
      {/* State 1: Success State */}
      {isSuccess ? (
        <div className="w-full max-w-[480px] mx-auto my-auto py-8 flex flex-col items-center text-center animate-in fade-in duration-300">
          {/* Glowing Green Checkmark Circle */}
          <div className="size-24 rounded-full bg-[#EAF8F0] flex items-center justify-center mb-6 shadow-sm">
            <div className="size-16 rounded-full bg-[#16A34A] text-white flex items-center justify-center shadow-md">
              <Check className="size-9 stroke-[3]" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-[28px] sm:text-[34px] font-bold text-[#111827] tracking-tight leading-tight mb-2">
            Akun berhasil dibuat!
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-[15px] text-[#6B7280] max-w-sm mb-8 leading-relaxed">
            Selanjutnya, lengkapi informasi bisnis untuk melanjutkan proses pendaftaran NemuPOS.
          </p>

          {/* Action Button */}
          <button
            onClick={handleContinueVerification}
            className="w-full h-[52px] rounded-xl bg-[#FF8265] hover:bg-[#FF6F4E] active:scale-[0.99] text-white font-semibold text-[15px] transition-all flex items-center justify-center shadow-sm"
          >
            Lanjutkan Verifikasi Bisnis
          </button>
        </div>
      ) : (
        /* State 2: Form Registration State */
        <div className="w-full max-w-[540px] mx-auto my-auto py-4 animate-in fade-in duration-200">
          {/* Header */}
          <div className="space-y-2 mb-8">
            <h2 className="text-[32px] sm:text-[36px] font-bold text-[#111827] tracking-tight leading-tight">
              Daftar akun NemuPOS
            </h2>
            <p className="text-[15px] text-[#6B7280]">
              Lengkapi data berikut untuk mulai menggunakan NemuPOS.
            </p>
          </div>

          {/* Error Banner matching Screenshot 2 */}
          {errorMsg && (
            <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-[#991B1B] animate-in fade-in duration-150">
              <AlertTriangle className="size-5 shrink-0 text-[#EF4444] mt-0.5" />
              <div className="text-xs sm:text-[13px] leading-relaxed">
                {errorMsg}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Nama Lengkap Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm font-medium text-[#111827]">
                Nama Lengkap
              </label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                required
                className="w-full h-[50px] sm:h-[52px] px-4 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#374151] transition-colors"
              />
            </div>

            {/* Email Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm font-medium text-[#111827]">
                Email
              </label>
              <input
                type="email"
                placeholder="Masukkan alamat email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full h-[50px] sm:h-[52px] px-4 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#374151] transition-colors"
              />
            </div>

            {/* Nomor HP Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm font-medium text-[#111827]">
                Nomor HP
              </label>
              <input
                type="tel"
                placeholder="Masukkan nomor handphone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
                className="w-full h-[50px] sm:h-[52px] px-4 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#374151] transition-colors"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-sm font-medium text-[#111827]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full h-[50px] sm:h-[52px] pl-4 pr-12 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#374151] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280] transition-colors p-1"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <Eye className="size-5" />
                  ) : (
                    <EyeOff className="size-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[50px] sm:h-[52px] rounded-xl bg-[#FF8265] hover:bg-[#FF6F4E] active:scale-[0.99] text-white font-semibold text-[15px] transition-all flex items-center justify-center shadow-sm disabled:opacity-60"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="size-5 animate-spin" />
                    <span>Membuat Akun...</span>
                  </div>
                ) : (
                  'Buat Akun'
                )}
              </button>
            </div>

            {/* Back to Login link */}
            <div className="text-center text-xs sm:text-[13px] text-[#111827] pt-2">
              Sudah punya akun?{' '}
              <Link
                href="/login"
                className="font-semibold text-[#FF8265] hover:underline"
              >
                Masuk
              </Link>
            </div>
          </form>
        </div>
      )}
    </AuthLayout>
  );
}
