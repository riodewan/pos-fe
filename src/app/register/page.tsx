'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertTriangle, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NemuLogo } from '@/components/common/NemuLogo';
import { LoginSlider } from '@/components/auth/LoginSlider';
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
    <div className="min-h-screen lg:h-screen bg-white p-3 sm:p-4 lg:p-5 flex flex-col lg:flex-row relative">
      {/* Left Branding Panel with Slider */}
      <div className="lg:w-[40%] xl:w-[38%] min-w-[380px] lg:max-w-[560px] shrink-0 bg-[#1A1A1A] text-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden min-h-[580px] lg:h-full">
        {/* Top Logo */}
        <div className="shrink-0 mb-2">
          <NemuLogo size="lg" theme="dark" />
        </div>

        {/* Center Mockup & Bottom Slider */}
        <LoginSlider />
      </div>

      {/* Right Content Panel */}
      <div className="flex-1 flex flex-col justify-between lg:h-full pt-4 sm:pt-6 lg:pt-8 pb-0 sm:pb-1 px-4 sm:px-8 lg:px-10">
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
              type="button"
              onClick={handleContinueVerification}
              className="w-full h-[52px] rounded-xl text-white font-medium text-base flex items-center justify-center transition-all hover:brightness-95 active:scale-[0.99] shadow-sm"
              style={{
                backgroundColor: '#FF5C38',
              }}
            >
              Lanjutkan Verifikasi Bisnis
            </button>
          </div>
        ) : (
          /* State 2: Register Form */
          <div className="w-full max-w-[540px] mx-auto my-auto py-4">
            {/* Header */}
            <div className="space-y-2 mb-8">
              <h2 className="text-[32px] sm:text-[36px] font-bold text-[#111827] tracking-tight leading-tight">
                Buat akun NemuPOS
              </h2>
              <p className="text-[15px] text-[#6B7280]">
                Daftar untuk mulai mengelola transaksi, stok, dan laporan outletmu dengan NemuPOS.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Banner matching Figma Screenshot 2 */}
              {errorMsg && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#FFF5F5] text-[#C53030] border border-[#FEB2B2] animate-in fade-in duration-200">
                  <AlertTriangle className="size-5 shrink-0 text-[#E53E3E] mt-0.5" />
                  <span className="text-xs sm:text-[13px] leading-relaxed">{errorMsg}</span>
                </div>
              )}

              {/* Nama Lengkap Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111827]">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Nama lengkap sesuai ID/KTP"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full h-[52px] px-4 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#374151] transition-colors"
                />
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111827]">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="nama@mail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  className="w-full h-[52px] px-4 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#374151] transition-colors"
                />
              </div>

              {/* Nomor HP Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#111827]">
                  Nomor HP
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={loading}
                  className="w-full h-[52px] px-4 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#374151] transition-colors"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
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
                    className="w-full h-[52px] pl-4 pr-12 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#374151] transition-colors"
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
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-[52px] rounded-xl text-white font-medium text-base flex items-center justify-center gap-2 transition-all hover:brightness-95 active:scale-[0.99] disabled:opacity-80 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#FF8265',
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Membuat Akun...</span>
                    </>
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

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#9CA3AF] gap-3 pt-4 pb-1 border-t border-gray-100 lg:border-t-0">
          <span>© 2026 Nemu Network</span>
          <div className="flex items-center gap-6">
            <Link href="#" className="hover:text-[#4B5563] transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="#" className="hover:text-[#4B5563] transition-colors">
              Syarat dan Ketentuan
            </Link>
            <Link href="#" className="hover:text-[#4B5563] transition-colors">
              Bantuan
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
