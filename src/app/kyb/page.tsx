'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Briefcase,
  FileText,
  User,
  CheckCircle2,
  Check,
  UploadCloud,
  X,
  ChevronDown,
  Clock,
  AlertCircle,
  RefreshCw,
  LogOut,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Store,
} from 'lucide-react';
import { AuthLayout } from '@/components/common/AuthLayout';
import { ReviewSummaryCard } from '@/components/common/ReviewSummaryCard';
import { useAuth } from '@/context/AuthContext';
import { tenantService } from '@/services/tenant.service';

interface UploadedFile {
  name: string;
  size: string;
  type: 'pdf' | 'jpg' | 'png';
  status: 'completed' | 'uploading';
  progress?: number;
}

export default function KybPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout, refreshUser } = useAuth();

  // Current Step: 0 = Overview, 1 = Info Bisnis, 2 = Dokumen Legal, 3 = Info Pemilik, 4 = Review, 5 = Status / Approval Screen
  const [step, setStep] = useState<number>(0);
  const [loadingStatus, setLoadingStatus] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Status tracking: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [kybStatus, setKybStatus] = useState<'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED'>('NOT_SUBMITTED');
  const [approvalData, setApprovalData] = useState<any>(null);

  // Form Step 1: Informasi Bisnis
  const [businessName, setBusinessName] = useState('Kopi Mantap');
  const [businessType, setBusinessType] = useState('Perorangan');
  const [businessCategory, setBusinessCategory] = useState('Coffee Shop');
  const [outletCount, setOutletCount] = useState('1 outlet');
  const [businessAddress, setBusinessAddress] = useState(
    'Jl. Melati No. 10, Jakarta Barat, Jakarta, Indonesia'
  );

  // Form Step 2: Dokumen Legal
  const [nibFile, setNibFile] = useState<UploadedFile | null>({
    name: 'NIB_KopiMantap.pdf',
    size: '10KB',
    type: 'pdf',
    status: 'completed',
  });
  const [npwpFile, setNpwpFile] = useState<UploadedFile | null>({
    name: 'NPWP_KopiMantap.pdf',
    size: '10KB',
    type: 'pdf',
    status: 'completed',
  });
  const [siuFile, setSiuFile] = useState<UploadedFile | null>({
    name: 'SIU_KopiMantap.pdf',
    size: '40KB',
    type: 'pdf',
    status: 'completed',
  });

  // Form Step 3: Informasi Pemilik
  const [ownerName, setOwnerName] = useState('');
  const [ownerNik, setOwnerNik] = useState('317545123456789');
  const [ownerRole, setOwnerRole] = useState('Pemilik');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('081234567890');
  const [ownerAddress, setOwnerAddress] = useState(
    'Jl. Melati No. 10, Jakarta Barat, Jakarta, Indonesia'
  );

  // File upload input refs
  const nibInputRef = useRef<HTMLInputElement>(null);
  const npwpInputRef = useRef<HTMLInputElement>(null);
  const siuInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = 'Verifikasi Informasi Bisnis (KYB) — NemuPOS';
  }, []);

  // Fetch live KYB status from backend
  const checkKybStatus = useCallback(async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setIsRefreshing(true);
      else setLoadingStatus(true);

      const res = await tenantService.getKybStatus();
      if (res?.data) {
        const { status, approval, tenant } = res.data;
        setKybStatus(status);
        setApprovalData(approval);

        if (status === 'APPROVED') {
          setStep(5);
          // Refresh user context so activeTenant updates to ACTIVE
          await refreshUser();
        } else if (status === 'PENDING') {
          setStep(5);
          if (approval?.payload?.business_name) {
            setBusinessName(approval.payload.business_name);
          }
        } else if (status === 'REJECTED') {
          setStep(5);
          if (approval?.payload) {
            const p = approval.payload;
            if (p.business_name) setBusinessName(p.business_name);
            if (p.business_type) setBusinessType(p.business_type);
            if (p.business_category) setBusinessCategory(p.business_category);
            if (p.business_address) setBusinessAddress(p.business_address);
            if (p.owner_name) setOwnerName(p.owner_name);
            if (p.owner_nik) setOwnerNik(p.owner_nik);
            if (p.owner_phone) setOwnerPhone(p.owner_phone);
            if (p.owner_address) setOwnerAddress(p.owner_address);
          }
        } else {
          // NOT_SUBMITTED: populate initial owner info from logged in user if available
          if (user) {
            setOwnerName((prev) => prev || user.name || '');
            setOwnerEmail((prev) => prev || user.email || '');
          }
        }
      }
    } catch (err) {
      console.error('Failed to check KYB status:', err);
    } finally {
      setLoadingStatus(false);
      setIsRefreshing(false);
    }
  }, [user, refreshUser]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (!authLoading && isAuthenticated) {
      checkKybStatus();
    }
  }, [authLoading, isAuthenticated, checkKybStatus, router]);

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: UploadedFile | null) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    const fileType = ext === 'pdf' ? 'pdf' : ext === 'png' ? 'png' : 'jpg';
    const sizeKb = Math.round(file.size / 1024);

    setter({
      name: file.name,
      size: `${sizeKb}KB`,
      type: fileType,
      status: 'completed',
    });
  };

  const handleSimpanNanti = () => {
    router.push('/dashboard');
  };

  const handleSubmitAll = async () => {
    if (!businessName.trim()) {
      setErrorMessage('Nama bisnis wajib diisi.');
      setStep(1);
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        business_name: businessName.trim(),
        business_type: businessType,
        business_category: businessCategory,
        outlet_count: outletCount,
        business_address: businessAddress,
        nib_file: nibFile ? { name: nibFile.name, size: nibFile.size } : null,
        npwp_file: npwpFile ? { name: npwpFile.name, size: npwpFile.size } : null,
        siu_file: siuFile ? { name: siuFile.name, size: siuFile.size } : null,
        owner_name: ownerName || user?.name || '',
        owner_nik: ownerNik,
        owner_role: ownerRole,
        owner_email: ownerEmail || user?.email || '',
        owner_phone: ownerPhone,
        owner_address: ownerAddress,
      };

      const res = await tenantService.submitKyb(payload);
      if (res?.data) {
        setApprovalData(res.data.approval);
        setKybStatus('PENDING');
        setStep(5);
        await refreshUser();
      }
    } catch (err: any) {
      console.error('Error submitting KYB:', err);
      setErrorMessage(
        err.response?.data?.message ||
          'Gagal mengirim data verifikasi. Silakan periksa kembali isian form atau coba beberapa saat lagi.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout rightPanelClassName="px-4 sm:px-8 lg:px-12">
        {/* ----------------- STEP 0: OVERVIEW SCREEN (Screenshot 5) ----------------- */}
        {step === 0 && (
          <div className="w-full max-w-[540px] mx-auto my-auto py-6 animate-in fade-in duration-200">
            {/* Header */}
            <div className="space-y-2 mb-8">
              <h2 className="text-[30px] sm:text-[34px] font-bold text-[#111827] tracking-tight leading-tight">
                Verifikasi informasi bisnis
              </h2>
              <p className="text-sm sm:text-[15px] text-[#6B7280] leading-relaxed">
                Lengkapi informasi bisnis berikut untuk mengaktifkan akun NemuPOS dan mulai menggunakan semua fitur.
              </p>
            </div>

            {/* List of Steps Card */}
            <div className="rounded-2xl border border-gray-100 bg-[#F9FAFB] p-4 sm:p-5 mb-8 space-y-4">
              {/* Step 1 Item */}
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                <div className="flex items-center gap-3.5">
                  <div className="size-10 rounded-xl bg-[#E6F4EA] text-[#0F9D58] flex items-center justify-center shrink-0">
                    <Briefcase className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-[15px] font-semibold text-[#111827]">
                      Informasi bisnis
                    </h4>
                    <p className="text-xs text-[#6B7280]">
                      Data dasar mengenai bisnis kamu.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 2 Item */}
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                <div className="flex items-center gap-3.5">
                  <div className="size-10 rounded-xl bg-[#E6F4EA] text-[#0F9D58] flex items-center justify-center shrink-0">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-[15px] font-semibold text-[#111827]">
                      Dokumen legal
                    </h4>
                    <p className="text-xs text-[#6B7280]">
                      Unggah dokumen resmi bisnis.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#9CA3AF] font-medium">Opsional</span>
              </div>

              {/* Step 3 Item */}
              <div className="flex items-center justify-between pb-3.5 border-b border-gray-100">
                <div className="flex items-center gap-3.5">
                  <div className="size-10 rounded-xl bg-[#E6F4EA] text-[#0F9D58] flex items-center justify-center shrink-0">
                    <User className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-[15px] font-semibold text-[#111827]">
                      Informasi pemilik
                    </h4>
                    <p className="text-xs text-[#6B7280]">
                      Data pemilik atau penanggung jawab bisnis.
                    </p>
                  </div>
                </div>
                <span className="text-xs text-[#9CA3AF] font-medium">Opsional</span>
              </div>

              {/* Step 4 Item */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="size-10 rounded-xl bg-[#E6F4EA] text-[#0F9D58] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-[15px] font-semibold text-[#111827]">
                      Review & kirim
                    </h4>
                    <p className="text-xs text-[#6B7280]">
                      Pastikan semua data sudah benar sebelum dikirim.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full h-[52px] rounded-xl text-white font-medium text-base flex items-center justify-center transition-all hover:brightness-95 active:scale-[0.99] shadow-sm"
              style={{
                backgroundColor: '#FF5C38',
              }}
            >
              Mulai Verifikasi Bisnis
            </button>
          </div>
        )}

        {/* ----------------- STEP 1: INFORMASI BISNIS (Screenshot 3 & 4) ----------------- */}
        {step === 1 && (
          <div className="w-full max-w-[540px] mx-auto my-auto py-2 animate-in fade-in duration-200">
            {/* Top Progress Bar */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#2563EB] h-full rounded-full w-1/4 transition-all duration-300" />
              </div>
              <div className="text-sm font-semibold shrink-0">
                <span className="text-[#2563EB]">1</span>
                <span className="text-gray-400">/4</span>
              </div>
            </div>

            {/* Header */}
            <div className="space-y-1.5 mb-5">
              <h2 className="text-[28px] sm:text-[32px] font-bold text-[#111827] tracking-tight leading-tight">
                Informasi bisnis
              </h2>
              <p className="text-sm text-[#6B7280]">
                Masukkan informasi dasar bisnis sesuai dengan dokumen resmi yang kamu miliki.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-3 sm:space-y-3.5">
              {/* Nama Bisnis */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#111827]">
                  Nama Bisnis
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama bisnis atau outlet"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#374151] transition-colors"
                />
              </div>

              {/* Jenis Usaha */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#111827]">
                  Jenis Usaha
                </label>
                <div className="relative">
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] focus:outline-none focus:border-[#374151] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Pilih jenis usaha</option>
                    <option value="Perorangan">Perorangan</option>
                    <option value="PT / Perseroan Terbatas">PT / Perseroan Terbatas</option>
                    <option value="CV">CV</option>
                    <option value="Firma">Firma</option>
                    <option value="Koperasi">Koperasi</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF] pointer-events-none" />
                </div>
              </div>

              {/* Kategori Bisnis */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#111827]">
                  Kategori Bisnis
                </label>
                <div className="relative">
                  <select
                    value={businessCategory}
                    onChange={(e) => setBusinessCategory(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] focus:outline-none focus:border-[#374151] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Pilih kategori bisnis</option>
                    <option value="Coffee Shop">Coffee Shop</option>
                    <option value="Restoran & Kafe">Restoran & Kafe</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Bakery & Pastry">Bakery & Pastry</option>
                    <option value="Bar & Lounge">Bar & Lounge</option>
                    <option value="Retail / Minimarket">Retail / Minimarket</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF] pointer-events-none" />
                </div>
              </div>

              {/* Jumlah Outlet */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#111827]">
                  Jumlah Outlet
                </label>
                <div className="relative">
                  <select
                    value={outletCount}
                    onChange={(e) => setOutletCount(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] focus:outline-none focus:border-[#374151] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Pilih jumlah outlet</option>
                    <option value="1 outlet">1 outlet</option>
                    <option value="2 - 5 outlet">2 - 5 outlet</option>
                    <option value="6 - 10 outlet">6 - 10 outlet</option>
                    <option value="> 10 outlet">&gt; 10 outlet</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF] pointer-events-none" />
                </div>
              </div>

              {/* Alamat Bisnis */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#111827]">
                  Alamat Bisnis
                </label>
                <textarea
                  rows={2}
                  placeholder="Masukkan alamat lengkap bisnis"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="w-full h-18 p-3 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#374151] transition-colors resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSimpanNanti}
                  className="flex-1 h-11 rounded-xl border border-[#FF5C38] text-[#FF5C38] bg-white hover:bg-[#FF5C38]/5 font-medium text-sm transition-all"
                >
                  Simpan & Lanjut Nanti
                </button>
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 h-11 rounded-xl text-white font-medium text-sm transition-all hover:brightness-95 shadow-sm"
                  style={{
                    backgroundColor: '#FF5C38',
                  }}
                >
                  Lanjut
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- STEP 2: DOKUMEN LEGAL (Screenshot 1 & 2) ----------------- */}
        {step === 2 && (
          <div className="w-full max-w-[540px] mx-auto my-auto py-3 animate-in fade-in duration-200">
            {/* Top Progress Bar */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#2563EB] h-full rounded-full w-2/4 transition-all duration-300" />
              </div>
              <div className="text-sm font-semibold shrink-0">
                <span className="text-[#2563EB]">2</span>
                <span className="text-gray-400">/4</span>
              </div>
            </div>

            {/* Header */}
            <div className="space-y-1.5 mb-5">
              <h2 className="text-[28px] sm:text-[32px] font-bold text-[#111827] tracking-tight leading-tight">
                Dokumen legal <span className="text-gray-400 font-normal text-2xl sm:text-[28px]">(Optional)</span>
              </h2>
              <p className="text-sm text-[#6B7280]">
                Unggah dokumen bisnis yang diperlukan untuk proses verifikasi. Pastikan dokumen masih berlaku dan dapat dibaca dengan jelas.
              </p>
            </div>

            {/* Hidden file inputs */}
            <input
              type="file"
              ref={nibInputRef}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => handleFileUpload(e, setNibFile)}
            />
            <input
              type="file"
              ref={npwpInputRef}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => handleFileUpload(e, setNpwpFile)}
            />
            <input
              type="file"
              ref={siuInputRef}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => handleFileUpload(e, setSiuFile)}
            />

            {/* Documents List */}
            <div className="space-y-3.5">
              {/* Document 1: NIB */}
              <div className="rounded-2xl border border-gray-200 p-3.5 bg-white space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="size-7 rounded-lg bg-[#E6F4EA] text-[#0F9D58] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="size-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#111827]">
                      NIB (Nomor Induk Berusaha)
                    </h4>
                    <p className="text-xs text-[#6B7280]">
                      PDF, JPG, PNG. Maksimal 5 MB.
                    </p>
                  </div>
                </div>

                {nibFile ? (
                  <div className="border border-gray-200 rounded-xl p-2.5 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-[#E53E3E] text-white font-bold text-[9px] flex items-center justify-center tracking-wider">
                        PDF
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{nibFile.name}</p>
                        <p className="text-xs text-[#16A34A] flex items-center gap-1 font-medium">
                          <Check className="size-3 stroke-[2.5]" />
                          <span>Completed</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-400 font-normal">{nibFile.size}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNibFile(null)}
                      className="size-6 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-400 flex items-center justify-center transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => nibInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#BFDBFE] bg-[#EFF6FF] rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-[#2563EB] text-sm font-medium hover:bg-[#DBEAFE]/60 transition-colors"
                  >
                    <UploadCloud className="size-4" />
                    <span>Upload Dokumen</span>
                  </button>
                )}
              </div>

              {/* Document 2: NPWP */}
              <div className="rounded-2xl border border-gray-200 p-3.5 bg-white space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="size-7 rounded-lg bg-[#E6F4EA] text-[#0F9D58] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="size-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#111827]">
                      NPWP
                    </h4>
                    <p className="text-xs text-[#6B7280]">
                      PDF, JPG, PNG. Maksimal 5 MB.
                    </p>
                  </div>
                </div>

                {npwpFile ? (
                  <div className="border border-gray-200 rounded-xl p-2.5 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-[#2563EB] text-white font-bold text-[9px] flex items-center justify-center tracking-wider">
                        JPG
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{npwpFile.name}</p>
                        <p className="text-xs text-[#16A34A] flex items-center gap-1 font-medium">
                          <Check className="size-3 stroke-[2.5]" />
                          <span>Completed</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-400 font-normal">{npwpFile.size}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNpwpFile(null)}
                      className="size-6 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-400 flex items-center justify-center transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => npwpInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#BFDBFE] bg-[#EFF6FF] rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-[#2563EB] text-sm font-medium hover:bg-[#DBEAFE]/60 transition-colors"
                  >
                    <UploadCloud className="size-4" />
                    <span>Upload Dokumen</span>
                  </button>
                )}
              </div>

              {/* Document 3: Surat Izin Usaha (jika diperlukan) */}
              <div className="rounded-2xl border border-gray-200 p-3.5 bg-white space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="size-7 rounded-lg bg-[#E6F4EA] text-[#0F9D58] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="size-3.5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#111827]">
                      Surat Izin Usaha (jika diperlukan)
                    </h4>
                    <p className="text-xs text-[#6B7280]">
                      PDF, JPG, PNG. Maksimal 5 MB.
                    </p>
                  </div>
                </div>

                {siuFile ? (
                  <div className="border border-gray-200 rounded-xl p-2.5 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-[#E53E3E] text-white font-bold text-[9px] flex items-center justify-center tracking-wider">
                        PDF
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#111827]">{siuFile.name}</p>
                        <p className="text-xs text-[#16A34A] flex items-center gap-1 font-medium">
                          <Check className="size-3 stroke-[2.5]" />
                          <span>Completed</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-400 font-normal">{siuFile.size}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSiuFile(null)}
                      className="size-6 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-400 flex items-center justify-center transition-colors"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => siuInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-[#BFDBFE] bg-[#EFF6FF] rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-[#2563EB] text-sm font-medium hover:bg-[#DBEAFE]/60 transition-colors"
                  >
                    <UploadCloud className="size-4" />
                    <span>Upload Dokumen</span>
                  </button>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 h-11 rounded-xl border border-[#FF5C38] text-[#FF5C38] bg-white hover:bg-[#FF5C38]/5 font-medium text-sm transition-all"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex-1 h-11 rounded-xl text-white font-medium text-sm transition-all hover:brightness-95 shadow-sm"
                  style={{
                    backgroundColor: '#FF5C38',
                  }}
                >
                  Lanjut
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- STEP 3: INFORMASI PEMILIK (Screenshot 3 & 4) ----------------- */}
        {step === 3 && (
          <div className="w-full max-w-[540px] mx-auto my-auto py-2 animate-in fade-in duration-200">
            {/* Top Progress Bar */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#2563EB] h-full rounded-full w-3/4 transition-all duration-300" />
              </div>
              <div className="text-sm font-semibold shrink-0">
                <span className="text-[#2563EB]">3</span>
                <span className="text-gray-400">/4</span>
              </div>
            </div>

            {/* Header */}
            <div className="space-y-1.5 mb-5">
              <h2 className="text-[28px] sm:text-[32px] font-bold text-[#111827] tracking-tight leading-tight">
                Informasi pemilik <span className="text-gray-400 font-normal text-2xl sm:text-[28px]">(Optional)</span>
              </h2>
              <p className="text-sm text-[#6B7280]">
                Masukkan data pemilik atau penanggung jawab bisnis sesuai identitas resmi.
              </p>
            </div>

            {/* Form */}
            <div className="space-y-3 sm:space-y-3.5">
              {/* Nama Lengkap */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#111827]">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  placeholder="Nama lengkap sesuai ID/KTP"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#374151] transition-colors"
                />
              </div>

              {/* Nomor Identitas (KTP) */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#111827]">
                  Nomor Identitas (KTP)
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nomor KTP"
                  value={ownerNik}
                  onChange={(e) => setOwnerNik(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#374151] transition-colors"
                />
              </div>

              {/* Jabatan */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#111827]">
                  Jabatan
                </label>
                <div className="relative">
                  <select
                    value={ownerRole}
                    onChange={(e) => setOwnerRole(e.target.value)}
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] focus:outline-none focus:border-[#374151] transition-colors appearance-none cursor-pointer"
                  >
                    <option value="">Pilih jabatan</option>
                    <option value="Pemilik">Pemilik</option>
                    <option value="Direktur">Direktur</option>
                    <option value="Manajer Operasional">Manajer Operasional</option>
                    <option value="Kuasa Hukum">Kuasa Hukum</option>
                    <option value="Penanggung Jawab">Penanggung Jawab</option>
                  </select>
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 size-4 text-[#9CA3AF] pointer-events-none" />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#111827]">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="nama@mail.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#374151] transition-colors"
                />
              </div>

              {/* Nomor HP */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#111827]">
                  Nomor HP
                </label>
                <input
                  type="tel"
                  placeholder="Contoh: 081234567890"
                  value={ownerPhone}
                  onChange={(e) => setOwnerPhone(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#374151] transition-colors"
                />
              </div>

              {/* Alamat sesuai KTP */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-[#111827]">
                  Alamat sesuai KTP
                </label>
                <textarea
                  rows={2}
                  placeholder="Masukkan alamat lengkap sesuai KTP"
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  className="w-full h-18 p-3 rounded-xl border border-[#E5E7EB] bg-white text-[15px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#374151] transition-colors resize-none"
                />
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 h-11 rounded-xl border border-[#FF5C38] text-[#FF5C38] bg-white hover:bg-[#FF5C38]/5 font-medium text-sm transition-all"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex-1 h-11 rounded-xl text-white font-medium text-sm transition-all hover:brightness-95 shadow-sm"
                  style={{
                    backgroundColor: '#FF5C38',
                  }}
                >
                  Lanjut
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- STEP 4: PERIKSA KEMBALI DATA KAMU (Screenshot 2) ----------------- */}
        {step === 4 && (
          <div className="w-full max-w-[540px] mx-auto my-auto py-3 animate-in fade-in duration-200">
            {/* Top Progress Bar */}
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#2563EB] h-full rounded-full w-full transition-all duration-300" />
              </div>
              <div className="text-sm font-semibold shrink-0">
                <span className="text-[#2563EB]">4</span>
                <span className="text-gray-400">/4</span>
              </div>
            </div>

            {/* Header */}
            <div className="space-y-1.5 mb-5">
              <h2 className="text-[28px] sm:text-[32px] font-bold text-[#111827] tracking-tight leading-tight">
                Periksa kembali data kamu
              </h2>
              <p className="text-sm text-[#6B7280]">
                Pastikan semua informasi dan dokumen sudah benar sebelum dikirim untuk verifikasi.
              </p>
            </div>

            {/* Review Cards matching Screenshot 2 */}
            <div className="space-y-3.5">
              {/* Card 1: Informasi bisnis */}
              <ReviewSummaryCard
                icon={<Briefcase className="size-3.5" />}
                iconBgColor="bg-[#E6F4EA]"
                iconTextColor="text-[#0F9D58]"
                title="Informasi bisnis"
                onEdit={() => setStep(1)}
                divided
              >
                <div className="space-y-1.5 text-xs">
                  <div className="flex">
                    <span className="text-[#6B7280] w-36 sm:w-40 shrink-0">Nama Bisnis</span>
                    <span className="font-medium text-[#111827]">{businessName || 'Kopi Mantap'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#6B7280] w-36 sm:w-40 shrink-0">Jenis Usaha</span>
                    <span className="font-medium text-[#111827]">{businessType || 'Perorangan'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#6B7280] w-36 sm:w-40 shrink-0">Kategori Bisnis</span>
                    <span className="font-medium text-[#111827]">{businessCategory || 'Coffee Shop'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#6B7280] w-36 sm:w-40 shrink-0">Jumlah Outlet</span>
                    <span className="font-medium text-[#111827]">{outletCount || '1 outlet'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#6B7280] w-36 sm:w-40 shrink-0">Alamat Bisnis</span>
                    <span className="font-medium text-[#111827] leading-relaxed">
                      {businessAddress || 'Jl. Melati No. 10, Jakarta Barat, Jakarta, Indonesia'}
                    </span>
                  </div>
                </div>
              </ReviewSummaryCard>

              {/* Card 2: Dokumen legal */}
              <ReviewSummaryCard
                icon={<FileText className="size-3.5" />}
                iconBgColor="bg-[#E6F4EA]"
                iconTextColor="text-[#0F9D58]"
                title="Dokumen legal"
                onEdit={() => setStep(2)}
                divided
              >
                <div className="space-y-2 text-xs">
                  <div className="flex items-center">
                    <span className="text-[#6B7280] w-36 sm:w-40 shrink-0">NIB</span>
                    <div className="flex items-center gap-1.5 font-medium text-[#111827]">
                      <span className="size-4 rounded bg-[#E53E3E] text-white text-[8px] font-bold flex items-center justify-center">
                        PDF
                      </span>
                      <span>{nibFile ? nibFile.name : 'NIB_KopiMantap.pdf'}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[#6B7280] w-36 sm:w-40 shrink-0">NPWP</span>
                    <div className="flex items-center gap-1.5 font-medium text-[#111827]">
                      <span className="size-4 rounded bg-[#2563EB] text-white text-[8px] font-bold flex items-center justify-center">
                        JPG
                      </span>
                      <span>{npwpFile ? npwpFile.name : 'NPWP_KopiMantap.pdf'}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[#6B7280] w-36 sm:w-40 shrink-0">Surat Izin Usaha</span>
                    <div className="flex items-center gap-1.5 font-medium text-[#111827]">
                      <span className="size-4 rounded bg-[#E53E3E] text-white text-[8px] font-bold flex items-center justify-center">
                        PDF
                      </span>
                      <span>{siuFile ? siuFile.name : 'SIU_KopiMantap.pdf'}</span>
                    </div>
                  </div>
                </div>
              </ReviewSummaryCard>

              {/* Card 3: Informasi pemilik */}
              <ReviewSummaryCard
                icon={<User className="size-3.5" />}
                iconBgColor="bg-[#E6F4EA]"
                iconTextColor="text-[#0F9D58]"
                title="Informasi pemilik"
                onEdit={() => setStep(3)}
                divided
              >
                <div className="space-y-1.5 text-xs">
                  <div className="flex">
                    <span className="text-[#6B7280] w-36 sm:w-40 shrink-0">Nama Lengkap</span>
                    <span className="font-medium text-[#111827]">{ownerName || 'Andi Pratama'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#6B7280] w-36 sm:w-40 shrink-0">Nomor Identitas</span>
                    <span className="font-medium text-[#111827]">{ownerNik || '317545123456789'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#6B7280] w-36 sm:w-40 shrink-0">Jabatan</span>
                    <span className="font-medium text-[#111827]">{ownerRole || 'Pemilik'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#6B7280] w-36 sm:w-40 shrink-0">Email</span>
                    <span className="font-medium text-[#111827]">{ownerEmail || 'andi.pratama@example.com'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#6B7280] w-36 sm:w-40 shrink-0">Nomor Handphone</span>
                    <span className="font-medium text-[#111827]">{ownerPhone || '081234567890'}</span>
                  </div>
                  <div className="flex">
                    <span className="text-[#6B7280] w-36 sm:w-40 shrink-0">Alamat sesuai KTP</span>
                    <span className="font-medium text-[#111827] leading-relaxed">
                      {ownerAddress || 'Jl. Melati No. 10, Jakarta Barat, Jakarta, Indonesia'}
                    </span>
                  </div>
                </div>
              </ReviewSummaryCard>

              {/* Error Message if submit fails */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setStep(3)}
                  className="flex-1 h-11 rounded-xl border border-[#FF5C38] text-[#FF5C38] bg-white hover:bg-[#FF5C38]/5 font-medium text-sm transition-all disabled:opacity-50"
                >
                  Kembali
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleSubmitAll}
                  className="flex-1 h-11 rounded-xl text-white font-medium text-sm transition-all hover:brightness-95 shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                  style={{
                    backgroundColor: '#FF5C38',
                  }}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Mengirim Pengajuan...</span>
                    </>
                  ) : (
                    <span>Kirim Verifikasi KYB</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- STEP 5: LIVE APPROVAL STATUS SCREEN ----------------- */}
        {step === 5 && (
          <div className="w-full max-w-[540px] mx-auto my-auto py-6 flex flex-col items-center text-center animate-in fade-in duration-300">
            {/* Loading status spinner */}
            {loadingStatus ? (
              <div className="py-16 flex flex-col items-center">
                <Loader2 className="size-10 animate-spin text-[#FF5C38] mb-3" />
                <p className="text-sm text-neutral-500">Memeriksa status verifikasi bisnis...</p>
              </div>
            ) : kybStatus === 'APPROVED' ? (
              /* ================= 5A: APPROVED CELEBRATION ================= */
              <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-200">
                <div className="size-24 rounded-full bg-emerald-50 border-4 border-emerald-100 flex items-center justify-center mb-6 shadow-sm">
                  <div className="size-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md">
                    <Check className="size-9 stroke-[3]" />
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
                  <CheckCircle2 className="size-3.5" />
                  <span>Akun Telah Disetujui Super Admin</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-tight mb-2">
                  Selamat, Toko Anda Siap Digunakan!
                </h2>

                <p className="text-sm text-[#4B5563] max-w-md mb-6 leading-relaxed">
                  Verifikasi KYB untuk bisnis <span className="font-bold text-neutral-900">{approvalData?.payload?.business_name || businessName}</span> telah disetujui oleh tim Super Admin. Toko dan outlet utama Anda kini aktif.
                </p>

                <div className="w-full bg-white border border-emerald-200 rounded-2xl p-4 text-left shadow-xs mb-8 space-y-2">
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-100">
                    <span className="text-neutral-500">Status Toko:</span>
                    <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">AKTIF</span>
                  </div>
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-100">
                    <span className="text-neutral-500">Kategori Bisnis:</span>
                    <span className="font-medium text-neutral-900">{approvalData?.payload?.business_category || businessCategory}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-500">Outlet Utama:</span>
                    <span className="font-medium text-neutral-900">{approvalData?.payload?.business_name || businessName} - Outlet Pusat</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push('/dashboard')}
                  className="w-full h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.99] transition-all shadow-md cursor-pointer"
                  style={{ backgroundColor: '#FF5C38' }}
                >
                  <span>Buka Dashboard Toko Sekarang</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            ) : kybStatus === 'REJECTED' ? (
              /* ================= 5B: REJECTED / REVISION REQUIRED ================= */
              <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-200">
                <div className="size-24 rounded-full bg-red-50 border-4 border-red-100 flex items-center justify-center mb-6 shadow-sm">
                  <div className="size-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md">
                    <ShieldAlert className="size-8 stroke-[2.4]" />
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-bold mb-3">
                  <AlertCircle className="size-3.5" />
                  <span>Verifikasi Perlu Perbaikan</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-tight mb-2">
                  Pengajuan Memerlukan Revisi
                </h2>

                <p className="text-sm text-[#4B5563] max-w-md mb-6 leading-relaxed">
                  Super Admin telah memeriksa data dan dokumen verifikasi bisnis Anda. Silakan baca catatan berikut untuk memperbarui dokumen.
                </p>

                {/* Rejection Note from Super Admin */}
                <div className="w-full bg-red-50/80 border border-red-200 rounded-2xl p-4 text-left mb-6 shadow-xs">
                  <p className="text-xs font-bold text-red-900 mb-1 flex items-center gap-1.5">
                    <AlertCircle className="size-3.5 text-red-600" />
                    Catatan Review dari Super Admin:
                  </p>
                  <p className="text-xs text-red-800 leading-relaxed font-medium bg-white/70 p-3 rounded-xl border border-red-100">
                    {approvalData?.review_notes || 'Mohon periksa kembali keabsahan data NIB / NPWP atau lampirkan dokumen yang terbaca jelas.'}
                  </p>
                </div>

                {/* Actions */}
                <div className="w-full flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => logout?.()}
                    className="w-full sm:w-auto px-5 h-12 rounded-xl border border-neutral-300 text-neutral-700 bg-white hover:bg-neutral-50 font-medium text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogOut className="size-4 text-neutral-500" />
                    <span>Keluar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 w-full h-12 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 hover:brightness-95 active:scale-[0.99] transition-all shadow-md cursor-pointer"
                    style={{ backgroundColor: '#FF5C38' }}
                  >
                    <span>Perbaiki Data & Ajukan Ulang</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* ================= 5C: PENDING SUPER ADMIN APPROVAL ================= */
              <div className="w-full flex flex-col items-center">
                {/* Pulsing Status Icon */}
                <div className="relative size-24 rounded-full bg-amber-50 border-4 border-amber-100 flex items-center justify-center mb-6 shadow-sm">
                  <div className="size-16 rounded-full bg-[#EA580C] text-white flex items-center justify-center shadow-md animate-pulse">
                    <Clock className="size-8 stroke-[2.4]" />
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3">
                  <span className="size-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Sedang Ditinjau oleh Super Admin</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight leading-tight mb-2">
                  Menunggu Persetujuan Akun
                </h2>

                <p className="text-sm text-[#6B7280] max-w-md mb-6 leading-relaxed">
                  Pengajuan verifikasi bisnis toko <span className="font-semibold text-neutral-900">{approvalData?.payload?.business_name || businessName}</span> telah kami terima. Tim Super Admin kami sedang memverifikasi data dan dokumen tokomu.
                </p>

                {/* Stepper Timeline Card */}
                <div className="w-full bg-[#FAFAFA] border border-neutral-200/80 rounded-2xl p-4 sm:p-5 text-left mb-6 shadow-2xs space-y-3.5">
                  <p className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                    Tahapan Pendaftaran:
                  </p>

                  {/* Step A */}
                  <div className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-neutral-800">1. Registrasi Akun</p>
                      <p className="text-[11px] text-neutral-500">Akun pengguna berhasil dibuat.</p>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Selesai</span>
                  </div>

                  {/* Step B */}
                  <div className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="size-3.5 stroke-[3]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-neutral-800">2. Pengajuan Dokumen KYB</p>
                      <p className="text-[11px] text-neutral-500">Data bisnis & informasi pemilik terkirim.</p>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Terkirim</span>
                  </div>

                  {/* Step C */}
                  <div className="flex items-start gap-3">
                    <div className="size-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 animate-pulse">
                      <Clock className="size-3.5 stroke-[2.5]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-amber-900">3. Review & Verifikasi Super Admin</p>
                      <p className="text-[11px] text-neutral-500">Pemeriksaan legalitas oleh Admin Internal platform.</p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">Proses</span>
                  </div>

                  {/* Step D */}
                  <div className="flex items-start gap-3 opacity-60">
                    <div className="size-6 rounded-full bg-neutral-200 text-neutral-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Store className="size-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-neutral-700">4. Pembukaan Akses Dashboard Toko</p>
                      <p className="text-[11px] text-neutral-500">Fitur POS, outlet, dan transaksi siap digunakan.</p>
                    </div>
                    <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded">Menunggu</span>
                  </div>
                </div>

                {/* Submitted Summary Box */}
                <div className="w-full bg-white border border-neutral-200/90 rounded-2xl p-4 text-left shadow-2xs mb-6 text-xs space-y-2">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <span className="text-neutral-500">Nama Bisnis:</span>
                    <span className="font-bold text-neutral-900">{approvalData?.payload?.business_name || businessName}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <span className="text-neutral-500">Tipe & Kategori:</span>
                    <span className="font-medium text-neutral-800">
                      {approvalData?.payload?.business_type || businessType} • {approvalData?.payload?.business_category || businessCategory}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                    <span className="text-neutral-500">Penanggung Jawab:</span>
                    <span className="font-medium text-neutral-800">{approvalData?.payload?.owner_name || ownerName || user?.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Estimasi Review:</span>
                    <span className="font-semibold text-amber-700">1x24 Jam Kerja</span>
                  </div>
                </div>

                {/* Refresh and Logout Buttons */}
                <div className="w-full flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => logout?.()}
                    className="px-4 h-12 rounded-xl border border-neutral-200 text-neutral-600 bg-white hover:bg-neutral-50 font-medium text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <LogOut className="size-4" />
                    <span>Keluar</span>
                  </button>
                  <button
                    type="button"
                    disabled={isRefreshing}
                    onClick={() => checkKybStatus(true)}
                    className="flex-1 h-12 rounded-xl text-white font-semibold text-sm transition-all hover:brightness-95 shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    style={{ backgroundColor: '#FF5C38' }}
                  >
                    <RefreshCw className={`size-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Memeriksa...' : 'Periksa Ulang Status'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

    </AuthLayout>
  );
}
