'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Coffee, Shield, UserCheck, Package, Store, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ThemeToggle } from '@/components/common/ThemeToggle';
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
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background bg-grid relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-[420px] space-y-6">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center justify-center size-10 rounded-md bg-primary text-primary-foreground mb-1 shadow-xs">
            <Coffee className="size-5" strokeWidth={2.2} />
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Masuk ke Kopi Nusantara
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Sistem POS multi-tenant & manajemen outlet
          </p>
        </div>

        {/* Login Card */}
        <Card className="shadow-elevated border-border bg-card">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-semibold">Kredensial Akun</CardTitle>
            <CardDescription className="text-xs">
              Masukkan email dan kata sandi Anda
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-3.5">
              {errorMsg && (
                <div className="flex items-center gap-2 p-2.5 text-xs rounded-md bg-destructive/10 text-destructive border border-destructive/20 animate-in fade-in">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Alamat Email
                </label>
                <Input
                  type="email"
                  placeholder="owner@kopinusantara.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Kata Sandi
                </label>
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
                className="w-full mt-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  'Masuk ke Sistem'
                )}
              </Button>
            </CardContent>
          </form>

          {/* Quick Demo Credentials */}
          <div className="px-5 pb-5 pt-3 border-t border-border">
            <p className="text-[11px] font-medium text-muted-foreground mb-2.5 text-center">
              Akun Demo Cepat:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('owner@kopinusantara.com', 'Password123!')}
                className="p-2 rounded-md border border-border bg-surface text-left transition-colors hover:border-foreground/30 hover:bg-accent flex flex-col gap-0.5"
              >
                <span className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                  <Store className="size-3.5" /> Tenant Owner
                </span>
                <span className="text-[10px] text-muted-foreground truncate w-full">owner@kopinusantara.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('kasir@kopinusantara.com', 'Password123!')}
                className="p-2 rounded-md border border-border bg-surface text-left transition-colors hover:border-foreground/30 hover:bg-accent flex flex-col gap-0.5"
              >
                <span className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                  <UserCheck className="size-3.5" /> Kasir POS
                </span>
                <span className="text-[10px] text-muted-foreground truncate w-full">kasir@kopinusantara.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('gudang@kopinusantara.com', 'Password123!')}
                className="p-2 rounded-md border border-border bg-surface text-left transition-colors hover:border-foreground/30 hover:bg-accent flex flex-col gap-0.5"
              >
                <span className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                  <Package className="size-3.5" /> Staf Gudang
                </span>
                <span className="text-[10px] text-muted-foreground truncate w-full">gudang@kopinusantara.com</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('admin@pos.com', 'SuperAdmin123!')}
                className="p-2 rounded-md border border-border bg-surface text-left transition-colors hover:border-foreground/30 hover:bg-accent flex flex-col gap-0.5"
              >
                <span className="flex items-center gap-1.5 font-medium text-xs text-foreground">
                  <Shield className="size-3.5" /> Super Admin
                </span>
                <span className="text-[10px] text-muted-foreground truncate w-full">admin@pos.com</span>
              </button>
            </div>
          </div>

          <CardFooter className="justify-center border-t border-border py-3 text-xs text-muted-foreground">
            Belum punya akun?{' '}
            <Link href="/register" className="ml-1 text-foreground font-medium hover:underline">
              Daftar outlet baru
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
          <Loader2 className="size-6 animate-spin text-foreground" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
