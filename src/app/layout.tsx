import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NemuHUB — Sistem Operasional POS, KDS & Inventori F&B Terpadu",
  description:
    "Platform all-in-one Point of Sale (POS), Kitchen Display System (KDS), Reservasi, QR Self-Order, Manajemen Inventori Resep & Keuangan Multi-Outlet.",
  icons: {
    icon: "/img/logo/logo-nemuhub.png",
    shortcut: "/img/logo/logo-nemuhub.png",
    apple: "/img/logo/logo-nemuhub.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FF5C38" },
    { media: "(prefers-color-scheme: dark)", color: "#141414" },
  ],
};

// Applies the saved/system theme before first paint to avoid a light→dark flash.
const themeInitScript = `(function(){try{var t=localStorage.getItem('theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
