'use client';

import React from 'react';
import Link from 'next/link';
import { NemuLogo } from './NemuLogo';
import { LoginSlider } from '@/components/auth/LoginSlider';

export interface AuthLayoutProps {
  children: React.ReactNode;
  floatingHelper?: React.ReactNode;
  rightPanelClassName?: string;
}

export function AuthLayout({
  children,
  floatingHelper,
  rightPanelClassName = '',
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen lg:h-screen bg-white p-3 sm:p-4 lg:p-5 flex flex-col lg:flex-row relative">
      {/* Left Branding Panel with Mockup Slider */}
      <div className="lg:w-[40%] xl:w-[38%] min-w-[380px] lg:max-w-[560px] shrink-0 bg-[#1A1A1A] text-white rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden min-h-[580px] lg:h-full">
        {/* Top Logo */}
        <div className="shrink-0 mb-2">
          <NemuLogo size="lg" theme="dark" />
        </div>

        {/* Center Mockup & Bottom Slider */}
        <LoginSlider />
      </div>

      {/* Right Content Panel */}
      <div
        className={`flex-1 flex flex-col justify-between lg:h-full pt-4 sm:pt-6 lg:pt-8 pb-0 sm:pb-1 px-4 sm:px-8 lg:px-12 overflow-y-auto ${rightPanelClassName}`}
      >
        {/* Form or Page Content Slot */}
        <div className="w-full flex-1 flex flex-col justify-center">
          {children}
        </div>

        {/* Unified Bottom Footer strictly aligned with bottom of left card */}
        <footer className="w-full flex flex-col sm:flex-row items-center justify-between text-xs text-[#9CA3AF] gap-3 pt-6 pb-2 border-t border-gray-100 lg:border-t-0 shrink-0">
          <span>&copy; 2026 Nemu Network</span>
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
        </footer>
      </div>

      {/* Optional Floating Helper (e.g. dev mode switcher) */}
      {floatingHelper && (
        <div className="fixed bottom-4 right-4 z-50">{floatingHelper}</div>
      )}
    </div>
  );
}
