'use client';

import React, { useState } from 'react';
import {
  Sliders,
  Percent,
  CreditCard,
  Plus,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import {
  SettingsActiveTab,
  TaxFeeItem,
  PaymentMethodItem,
} from '@/types/outlet-settings';
import { PersonalizationTab } from './PersonalizationTab';
import { TaxesFeesTab } from './TaxesFeesTab';
import { PaymentMethodsTab } from './PaymentMethodsTab';
import { AddTaxFeeModal } from './AddTaxFeeModal';
import { AddPaymentMethodModal } from './AddPaymentMethodModal';
import { Button } from '@/components/common/Button';
import { tenantService } from '@/services/tenant.service';

export function OutletSettingsView() {
  const [activeTab, setActiveTab] = useState<SettingsActiveTab>('personalization');

  // Taxes & Fees State
  const [taxesFeesItems, setTaxesFeesItems] = useState<TaxFeeItem[]>([]);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isTaxDemoEmpty, setIsTaxDemoEmpty] = useState(false);

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPaymentDemoEmpty, setIsPaymentDemoEmpty] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch live backend settings on mount
  React.useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [taxesRes, paymentsRes] = await Promise.allSettled([
          tenantService.getTaxesFees(),
          tenantService.getPaymentMethods(),
        ]);

        if (taxesRes.status === 'fulfilled' && taxesRes.value?.data) {
          const mappedTaxes: TaxFeeItem[] = taxesRes.value.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            type: item.type === 'Pajak' ? 'Pajak' : 'Biaya',
            value: item.value,
            appliesTo: item.applies_to || 'Semua Menu',
            isActive: Boolean(item.is_active),
          }));
          setTaxesFeesItems(mappedTaxes);
        }

        if (paymentsRes.status === 'fulfilled' && paymentsRes.value?.data) {
          const mappedPayments: PaymentMethodItem[] = paymentsRes.value.data.map((item: any) => ({
            id: item.id,
            name: item.name,
            type: item.type,
            description: item.description || '',
            isActive: Boolean(item.is_active),
            iconType: item.icon_type || 'qris',
          }));
          setPaymentMethods(mappedPayments);
        }
      } catch {
        // Leave lists empty when the API is unreachable
      }
    };

    fetchSettings();
  }, []);

  const handleAddTaxFee = async (item: Omit<TaxFeeItem, 'id' | 'isActive'>) => {
    try {
      const res = await tenantService.createTaxFee({
        name: item.name,
        type: item.type,
        value_type: item.value.includes('%') ? 'percent' : 'fixed',
        value: item.value,
        applies_to: item.appliesTo,
        is_active: true,
      });

      const newItem: TaxFeeItem = {
        ...item,
        id: res.data?.id || `tf-${Date.now()}`,
        isActive: true,
      };
      setIsTaxDemoEmpty(false);
      showToast(`${item.name} berhasil ditambahkan!`);
    } catch {
      showToast('Gagal menambahkan pajak / biaya');
    }
  };

  const handleToggleTaxFee = async (id: string) => {
    try {
      await tenantService.toggleTaxFee(id);
    } catch {
      // Handled silently
    }
  };

  const handleDeleteTaxFee = async (id: string) => {
    try {
      await tenantService.deleteTaxFee(id);
      showToast('Pajak / Biaya berhasil dihapus');
    } catch {
      // Handled silently
    }
  };

  const handleAddPaymentMethod = async (
    item: Omit<PaymentMethodItem, 'id' | 'isActive'>
  ) => {
    try {
      const res = await tenantService.createPaymentMethod({
        name: item.name,
        type: item.type,
        description: item.description,
        icon_type: item.iconType,
        is_active: true,
      });

      const newItem: PaymentMethodItem = {
        ...item,
        id: res.data?.id || `pm-${Date.now()}`,
        isActive: true,
      };
      setPaymentMethods((prev) => [newItem, ...prev]);
      setIsPaymentDemoEmpty(false);
      showToast(`Metode ${item.name} berhasil ditambahkan!`);
    } catch {
      showToast('Gagal menambahkan metode pembayaran');
    }
  };

  const handleTogglePaymentMethod = async (id: string) => {
    try {
      await tenantService.togglePaymentMethod(id);
    } catch {
      // Handled silently
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    try {
      await tenantService.deletePaymentMethod(id);
      showToast('Metode pembayaran berhasil dihapus');
    } catch {
      // Handled silently
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="size-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Title & Header matching Screenshots 1-5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Pengaturan Outlet
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Kelola personalisasi, pajak, biaya, dan metode pembayaran outletmu.
          </p>
        </div>

        {/* Right Action Button changes per tab */}
        <div className="flex items-center gap-3">
          {activeTab === 'taxes_fees' && (
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsTaxModalOpen(true)}
              className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all text-xs"
            >
              <Plus className="size-4 stroke-[3]" />
              <span>Tambah Pajak atau Biaya</span>
            </Button>
          )}

          {activeTab === 'payment_methods' && (
            <Button
              type="button"
              variant="primary"
              onClick={() => setIsPaymentModalOpen(true)}
              className="bg-[#FF5C38] hover:bg-[#E04B28] text-white font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-all text-xs"
            >
              <Plus className="size-4 stroke-[3]" />
              <span>Tambah Metode</span>
            </Button>
          )}
        </div>
      </div>

      {/* 3 Tabs Segmented Control matching Screenshots 1-5 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center bg-white p-1 rounded-xl border border-neutral-200/90 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('personalization')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'personalization'
                ? 'bg-red-50/80 text-[#FF5C38] shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Sliders className="size-4" />
            <span>Personalisasi</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('taxes_fees')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'taxes_fees'
                ? 'bg-red-50/80 text-[#FF5C38] shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <Percent className="size-4" />
            <span>Pajak & Biaya</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payment_methods')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'payment_methods'
                ? 'bg-red-50/80 text-[#FF5C38] shadow-2xs'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
            }`}
          >
            <CreditCard className="size-4" />
            <span>Metode Pembayaran</span>
          </button>
        </div>


      </div>

      {/* Main Tab Contents */}
      {activeTab === 'personalization' && (
        <PersonalizationTab onSaveSuccess={() => showToast('Tema berhasil disimpan!')} />
      )}

      {activeTab === 'taxes_fees' && (
        <TaxesFeesTab
          onOpenAddModal={() => setIsTaxModalOpen(true)}
          items={taxesFeesItems}
          setItems={setTaxesFeesItems}
          isDemoEmpty={isTaxDemoEmpty}
          setIsDemoEmpty={setIsTaxDemoEmpty}
          onToggleStatus={handleToggleTaxFee}
          onDelete={handleDeleteTaxFee}
        />
      )}

      {activeTab === 'payment_methods' && (
        <PaymentMethodsTab
          onOpenAddModal={() => setIsPaymentModalOpen(true)}
          items={paymentMethods}
          setItems={setPaymentMethods}
          isDemoEmpty={isPaymentDemoEmpty}
          setIsDemoEmpty={setIsPaymentDemoEmpty}
          onToggleStatus={handleTogglePaymentMethod}
          onDelete={handleDeletePaymentMethod}
        />
      )}

      {/* Modals */}
      <AddTaxFeeModal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
        onSave={handleAddTaxFee}
      />

      <AddPaymentMethodModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSave={handleAddPaymentMethod}
      />
    </div>
  );
}
