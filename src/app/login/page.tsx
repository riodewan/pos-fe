'use client';

import React, { useState, Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, AlertCircle, Loader2, Store, UserCheck, Package, Shield, Code, ChefHat, Users } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { AuthLayout } from '@/components/common/AuthLayout';
import { ApiError } from '@/lib/api';
import { getLandingPageForRole } from '@/constants/navigation';

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
      const loggedInUser = await login(email, password);
      const preferredRole = loggedInUser?.is_internal
        ? 'SUPER_ADMIN'
        : loggedInUser?.tenants?.[0]?.role;

      const searchRedirect = searchParams.get('redirect');
      const target =
        searchRedirect && searchRedirect !== '/dashboard'
          ? searchRedirect
          : getLandingPageForRole(preferredRole, !!loggedInUser?.is_internal);

      router.replace(target);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message || 'Login gagal. Periksa email dan password Anda.');
      } else if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Terjadi kesalahan saat masuk. Silakan coba lagi.');
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

  const devHelper = (
    <div>
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
            Pilih Akun Testing (6 Role)
          </div>
          <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
            <button
              type="button"
              onClick={() => handleQuickFill('admin@pos.com', 'Password123!')}
              className="w-full p-2 rounded-lg text-left text-xs hover:bg-gray-50 border border-transparent hover:border-gray-200 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5 font-medium text-gray-800">
                <Shield className="size-3.5 text-purple-600" /> Admin Internal
              </span>
              <span className="text-[10px] text-gray-400">admin@...</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('owner@kopinusantara.com', 'Password123!')}
              className="w-full p-2 rounded-lg text-left text-xs hover:bg-gray-50 border border-transparent hover:border-gray-200 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5 font-medium text-gray-800">
                <Store className="size-3.5 text-[#FF5C38]" /> Owner
              </span>
              <span className="text-[10px] text-gray-400">owner@...</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('manager@kopinusantara.com', 'Password123!')}
              className="w-full p-2 rounded-lg text-left text-xs hover:bg-gray-50 border border-transparent hover:border-gray-200 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5 font-medium text-gray-800">
                <Users className="size-3.5 text-blue-600" /> Manager
              </span>
              <span className="text-[10px] text-gray-400">manager@...</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('kasir@kopinusantara.com', 'Password123!')}
              className="w-full p-2 rounded-lg text-left text-xs hover:bg-gray-50 border border-transparent hover:border-gray-200 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5 font-medium text-gray-800">
                <UserCheck className="size-3.5 text-purple-600" /> Kasir (POS)
              </span>
              <span className="text-[10px] text-gray-400">kasir@...</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('inventory@kopinusantara.com', 'Password123!')}
              className="w-full p-2 rounded-lg text-left text-xs hover:bg-gray-50 border border-transparent hover:border-gray-200 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5 font-medium text-gray-800">
                <Package className="size-3.5 text-amber-600" /> Inventory
              </span>
              <span className="text-[10px] text-gray-400">inventory@...</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('dapur@kopinusantara.com', 'Password123!')}
              className="w-full p-2 rounded-lg text-left text-xs hover:bg-gray-50 border border-transparent hover:border-gray-200 flex items-center justify-between"
            >
              <span className="flex items-center gap-1.5 font-medium text-gray-800">
                <ChefHat className="size-3.5 text-emerald-600" /> Dapur (KDS)
              </span>
              <span className="text-[10px] text-gray-400">dapur@...</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AuthLayout floatingHelper={devHelper}>
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
              placeholder="Masukkan alamat email"
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
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[52px] rounded-xl bg-[#FF8265] hover:bg-[#FF6F4E] active:scale-[0.99] text-white font-semibold text-[15px] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Masuk...</span>
              </>
            ) : (
              <span>Masuk</span>
            )}
          </button>

          {/* Register Link */}
          <div className="text-center pt-2">
            <span className="text-sm text-[#6B7280]">
              Belum punya akun?{' '}
            </span>
            <Link
              href="/register"
              className="text-sm font-semibold text-[#111827] hover:underline"
            >
              Daftar sekarang
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
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
