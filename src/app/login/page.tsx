'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Coffee, Shield, UserCheck, Package, Store, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ApiError } from '@/lib/api';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(
    searchParams.get('expired') ? 'Sesi Anda telah berakhir. Silakan login kembali.' : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Email dan password wajib diisi.');
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
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-gradient-to-br from-amber-50/50 via-background to-stone-100/50 dark:from-zinc-950 dark:to-zinc-900">
      <div className="w-full max-w-md space-y-6">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-amber-600 text-white shadow-lg shadow-amber-600/25">
            <Coffee className="size-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            POS Multi-Tenant Coffee & F&B
          </h1>
          <p className="text-sm text-muted-foreground">
            Sistem Kasir, QR Self-Order & Manajemen Bahan Baku
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/60 shadow-xl shadow-black/5 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Masuk ke Akun</CardTitle>
            <CardDescription>
              Masukkan kredensial Anda untuk mengakses dashboard outlet
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {errorMsg && (
                <div className="flex items-center gap-2 p-3 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Alamat Email
                </label>
                <Input
                  type="email"
                  placeholder="nama@kopinusantara.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Kata Sandi
                  </label>
                </div>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-md shadow-amber-600/20"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  'Masuk Sekarang'
                )}
              </Button>
            </CardContent>
          </form>

          {/* Quick Demo Credentials */}
          <div className="px-6 pb-6 pt-2 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-3 text-center">
              Quick Fill Demo Accounts:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickFill('owner@kopinusantara.com', 'Password123!')}
                className="h-auto py-2 px-2.5 flex flex-col items-start gap-0.5 text-left border-amber-200/50 hover:bg-amber-50 dark:hover:bg-amber-950/20"
              >
                <span className="flex items-center gap-1.5 font-semibold text-xs text-amber-800 dark:text-amber-300">
                  <Store className="size-3.5" /> Tenant Owner
                </span>
                <span className="text-[10px] text-muted-foreground truncate w-full">owner@kopinusantara.com</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickFill('kasir@kopinusantara.com', 'Password123!')}
                className="h-auto py-2 px-2.5 flex flex-col items-start gap-0.5 text-left border-blue-200/50 hover:bg-blue-50 dark:hover:bg-blue-950/20"
              >
                <span className="flex items-center gap-1.5 font-semibold text-xs text-blue-800 dark:text-blue-300">
                  <UserCheck className="size-3.5" /> Kasir POS
                </span>
                <span className="text-[10px] text-muted-foreground truncate w-full">kasir@kopinusantara.com</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickFill('gudang@kopinusantara.com', 'Password123!')}
                className="h-auto py-2 px-2.5 flex flex-col items-start gap-0.5 text-left border-emerald-200/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
              >
                <span className="flex items-center gap-1.5 font-semibold text-xs text-emerald-800 dark:text-emerald-300">
                  <Package className="size-3.5" /> Staf Gudang
                </span>
                <span className="text-[10px] text-muted-foreground truncate w-full">gudang@kopinusantara.com</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickFill('admin@pos.com', 'SuperAdmin123!')}
                className="h-auto py-2 px-2.5 flex flex-col items-start gap-0.5 text-left border-purple-200/50 hover:bg-purple-50 dark:hover:bg-purple-950/20"
              >
                <span className="flex items-center gap-1.5 font-semibold text-xs text-purple-800 dark:text-purple-300">
                  <Shield className="size-3.5" /> Super Admin
                </span>
                <span className="text-[10px] text-muted-foreground truncate w-full">admin@pos.com</span>
              </Button>
            </div>
          </div>

          <CardFooter className="justify-center border-t border-border/40 py-3 text-xs text-muted-foreground">
            Belum punya akun bisnis?{' '}
            <Link href="/register" className="ml-1 font-semibold text-amber-600 hover:underline">
              Daftar Tenant Baru
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="size-8 animate-spin text-amber-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
