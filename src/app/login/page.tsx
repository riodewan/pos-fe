'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, Loader2, Store, UserCheck, Package, Shield, Code } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { NemuLogo } from '@/components/common/NemuLogo';
import { LoginSlider } from '@/components/auth/LoginSlider';
import { ApiError } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    searchParams.get('expired') ? 'Sesi Anda telah berakhir. Silakan login kembali.' : null
  );

  useEffect(() => {
    document.title = 'Masuk ke NemuPOS';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Email dan kata sandi wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const user = await login(email, password, 'web-pos');
      const userRole = (user.is_internal ? 'SUPER_ADMIN' : user.tenants?.[0]?.role || 'OWNER').toUpperCase();

      if (userRole === 'CASHIER') {
        router.push('/dashboard/pos');
      } else if (userRole === 'INVENTORY') {
        router.push('/dashboard/inventory');
      } else {
        router.push('/dashboard');
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message || 'Login gagal. Periksa kembali email dan kata sandi Anda.');
      } else {
        setErrorMsg('Terjadi kesalahan koneksi server.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
    setShowDemoModal(false);
  };

  return (
    <div className="min-h-screen lg:h-screen bg-white p-3 sm:p-4 lg:p-5 flex flex-col lg:flex-row relative">
      {/* Left Branding Panel with Image Slider Template */}
      <div className="lg:w-[40%] xl:w-[38%] min-w-[380px] lg:max-w-[560px] shrink-0 bg-[#1A1A1A] text-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden min-h-[580px] lg:h-full">
        {/* Top Logo */}
        <div className="shrink-0 mb-2">
          <NemuLogo size="lg" theme="dark" />
        </div>

        {/* Slider with Showcase Image & Bottom Content */}
        <LoginSlider />
      </div>

      {/* Right Login Form Panel */}
      <div className="flex-1 flex flex-col justify-between lg:h-full pt-4 sm:pt-6 lg:pt-8 pb-0 sm:pb-1 px-4 sm:px-8 lg:px-10">
        {/* Form Container - Vertically Centered & Wide like Figma */}
        <div className="w-full max-w-[540px] mx-auto my-auto py-4">
          {/* Header */}
          <div className="space-y-2 mb-9">
            <h2 className="text-[32px] sm:text-[36px] font-bold text-[#111827] tracking-tight leading-tight">
              Masuk ke NemuPOS
            </h2>
            <p className="text-[15px] text-[#6B7280]">
              Lanjutkan untuk mengelola outlet dan bisnis F&B kamu.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMsg && (
              <div className="flex items-center gap-2.5 p-3.5 text-xs sm:text-sm rounded-xl bg-red-50 text-red-600 border border-red-200">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

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

            {/* Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#111827]">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
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

            {/* Forgot password */}
            <div className="flex justify-end pt-0.5">
              <Link
                href="/forgot-password"
                className="text-xs sm:text-[13px] font-semibold text-[#111827] hover:underline"
              >
                Lupa password?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
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
                    <span>Masuk...</span>
                  </>
                ) : (
                  'Masuk'
                )}
              </button>
            </div>

            {/* Register link */}
            <div className="text-center text-xs sm:text-[13px] text-[#111827] pt-2">
              Sudah punya akun?{' '}
              <Link
                href="/register"
                className="font-semibold text-[#FF8265] hover:underline"
              >
                Daftar Sekarang
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#9CA3AF] gap-3 pt-6 border-t border-gray-100 lg:border-t-0">
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

      {/* Floating discreet dev account helper (doesn't interfere with main Figma design) */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          type="button"
          onClick={() => setShowDemoModal(!showDemoModal)}
          className="size-8 rounded-full bg-gray-900/10 hover:bg-gray-900/20 text-gray-500 hover:text-gray-900 flex items-center justify-center transition-all backdrop-blur-sm"
          title="Demo Accounts Helper (Dev Mode)"
        >
          <Code className="size-3.5" />
        </button>

        {showDemoModal && (
          <div className="absolute bottom-10 right-0 w-72 p-3 bg-white rounded-xl shadow-xl border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Akun Demo Cepat
            </div>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('owner@kopinusantara.com', 'Password123!')}
                className="w-full p-2 rounded-lg text-left text-xs hover:bg-gray-50 border border-transparent hover:border-gray-200 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5 font-medium text-gray-800">
                  <Store className="size-3.5 text-[#FF8265]" /> Owner
                </span>
                <span className="text-[10px] text-gray-400">owner@...</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('kasir@kopinusantara.com', 'Password123!')}
                className="w-full p-2 rounded-lg text-left text-xs hover:bg-gray-50 border border-transparent hover:border-gray-200 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5 font-medium text-gray-800">
                  <UserCheck className="size-3.5 text-[#FF8265]" /> Kasir POS
                </span>
                <span className="text-[10px] text-gray-400">kasir@...</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('gudang@kopinusantara.com', 'Password123!')}
                className="w-full p-2 rounded-lg text-left text-xs hover:bg-gray-50 border border-transparent hover:border-gray-200 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5 font-medium text-gray-800">
                  <Package className="size-3.5 text-[#FF8265]" /> Staf Gudang
                </span>
                <span className="text-[10px] text-gray-400">gudang@...</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin@pos.com', 'SuperAdmin123!')}
                className="w-full p-2 rounded-lg text-left text-xs hover:bg-gray-50 border border-transparent hover:border-gray-200 flex items-center justify-between"
              >
                <span className="flex items-center gap-1.5 font-medium text-gray-800">
                  <Shield className="size-3.5 text-[#FF8265]" /> Super Admin
                </span>
                <span className="text-[10px] text-gray-400">admin@...</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white">
          <Loader2 className="size-6 animate-spin text-[#FF8265]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
