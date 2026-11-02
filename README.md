# NemuHUB / NemuPOS Frontend (Next.js 15)

Aplikasi Web Frontend Modern untuk Point of Sale (POS), Kitchen Display System (KDS), Pemesanan Mandiri Meja (QR Order), Manajemen Multi-Cabang Outlet, dan Backoffice Super Admin.

Dibangun dengan **Next.js 15 (App Router)**, **TypeScript**, dan **Tailwind CSS**.

---

## 🚀 Fitur Utama & Wilayah Aplikasi

Aplikasi terbagi menjadi 4 area utama:

### 1. Pelanggan Mandiri (Customer QR Self-Order)
* **`/q/[tableToken]`**: Halaman pemesanan mandiri oleh pelanggan langsung dari meja melalui scan QR code tanpa perlu login akun.

### 2. Dashboard Operasional Mitra (`/dashboard`)
* **Kasir & Transaksi**:
  * `/dashboard/pos`: Terminal Kasir kilat, pencarian cepat, diskon, pajak, biaya layanan, dan cetak struk thermal 58mm/80mm.
  * `/dashboard/orders`: Pelacakan status pesanan real-time.
  * `/dashboard/transactions`: Riwayat transaksi dan audit pembayaran.
* **Dapur & Operasional**:
  * `/dashboard/kds`: Kitchen Display System layar sentuh dengan status *PREPARING* dan *READY*.
  * `/dashboard/tables`: Tata letak meja visual dan pemantauan keterisian meja.
  * `/dashboard/qr-order`: Generator QR code meja fisik dan dinamis.
  * `/dashboard/reservations`: Manajemen reservasi meja dan kalender booking.
* **Katalog & Inventori**:
  * `/dashboard/catalog`: Manajemen menu, varian harga, dan status ketersediaan.
  * `/dashboard/recipes`: Formula resep bahan baku dan kalkulasi HPP otomatis.
  * `/dashboard/inventory`: Stok bahan baku, mutasi masuk/keluar, penyesuaian opname, dan Purchase Order (PO).
* **Bisnis & Keuangan**:
  * `/dashboard/customers`: CRM data pelanggan otomatis (tersimpan otomatis saat input kasir).
  * `/dashboard/reports`: Laporan analitik omset, laba kotor, menu terlaris, dan saluran pesanan.
  * `/dashboard/finance`: Rekonsiliasi pendapatan bersih, penarikan dana (*payout*), dan rekap kas shift kasir.
  * `/dashboard/notifications`: Notifikasi operasional penting (pesanan, stok, reservasi).
* **Tim & Pengaturan**:
  * `/dashboard/staff`: Manajemen akun staf dan matriks izin (*Role-Based Access Control*).
  * `/dashboard/settings`: Pengaturan metode pembayaran dan pajak/biaya outlet.
  * `/dashboard/settings/profile`: Profil cabang outlet, logo, jam operasional, dan preview struk.
  * `/dashboard/settings/account`: Profil akun pribadi, preferensi tanggal/zona waktu, dan ubah sandi.

### 3. Backoffice Internal Super Admin (`/admin`)
* `/admin/tenants`: Manajemen daftar mitra bisnis terdaftar.
* `/admin/approvals`: Tinjauan dan persetujuan pengajuan cabang baru, verifikasi NIB, dan paket langganan.
* `/admin/master-data`: Pengaturan kategori F&B dan template fasilitas global.
* `/admin/commissions`: Pengaturan skema biaya transaksi dan kemitraan.

### 4. Publik & Autentikasi
* `/`: Landing page interaktif.
* `/login`: Halaman login (multi-role: Owner, Manager, Kasir, Gudang, Dapur, Super Admin).
* `/register`: Pendaftaran mitra bisnis baru.

---

## 🛠️ Stack Teknologi

* **Framework**: Next.js 15 (App Router, React 19)
* **Bahasa**: TypeScript
* **Styling**: Tailwind CSS
* **Icons**: Lucide React
* **State Management**: React Context (`AuthContext`, `StoreContext`, `ToastContext`)
* **QR Generation**: QRCode.react
* **HTTP Client**: Axios dengan interseptor Bearer Token & Multi-Outlet header (`X-Tenant-Id`, `X-Store-Id`)

---

## ⚙️ Panduan Menjalankan Lokal

### 1. Prasyarat
* **Node.js**: v18.18 atau lebih baru
* **Package Manager**: npm, pnpm, atau yarn

### 2. Instalasi Dependensi
```bash
cd pos-fe
npm install
```

### 3. Konfigurasi Environment (`.env.local`)
Salin file `.env.example` ke `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

### 4. Jalankan Server Development
```bash
npm run dev
```
Buka browser di: **`http://localhost:3000`**

---

## 🔑 Kredensial Login Pengujian

Gunakan akun berikut (didapat dari seeder backend `php artisan migrate:fresh --seed`):

* **Super Admin**: `admin@pos.com` / `Password123!`
* **Mitra Owner**: `owner@kopinusantara.com` / `Password123!`
* **Kasir**: `kasir@kopinusantara.com` / `Password123!`
* **Dapur/KDS**: `dapur@kopinusantara.com` / `Password123!`

---

## 📦 Build untuk Production

Untuk melakukan kompilasi kode siap deploy:
```bash
npm run build
npm run start
```
Atau deploy langsung ke platform hosting seperti **Vercel**, **Netlify**, atau **VPS (PM2/Docker)** dengan menyetel variabel environment `NEXT_PUBLIC_API_URL` mengarah ke URL API backend production (HTTPS).
