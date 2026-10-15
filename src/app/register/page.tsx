'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Coffee, AlertCircle, Loader2 } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ApiError } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await register(name, email, password, passwordConfirmation);
      router.push('/dashboard');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message || 'Pendaftaran gagal. Periksa kembali formulir.');
      } else {
        setErrorMsg('Terjadi kesalahan koneksi server.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-background bg-grid relative">
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
            Daftar Tenant Baru
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Mulai kelola outlet dan inventaris bisnis F&B Anda
          </p>
        </div>

        {/* Register Card */}
        <Card className="shadow-elevated border-border bg-card">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-semibold">Informasi Akun</CardTitle>
            <CardDescription className="text-xs">
              Buat akun administrator untuk bisnis Anda
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
                  Nama Lengkap
                </label>
                <Input
                  type="text"
                  placeholder="Ahmad Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Alamat Email
                </label>
                <Input
                  type="email"
                  placeholder="ahmad@kopinusantara.com"
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
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-muted-foreground">
                  Konfirmasi Kata Sandi
                </label>
                <Input
                  type="password"
                  placeholder="Ulangi kata sandi"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
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
                    Membuat Akun...
                  </>
                ) : (
                  'Daftarkan Outlet'
                )}
              </Button>
            </CardContent>
          </form>

          <CardFooter className="justify-center border-t border-border py-3 text-xs text-muted-foreground">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="ml-1 text-foreground font-medium hover:underline">
              Masuk di sini
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
