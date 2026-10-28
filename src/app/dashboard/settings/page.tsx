import { Metadata } from 'next';
import { OutletSettingsView } from '@/components/settings/OutletSettingsView';

export const metadata: Metadata = {
  title: 'Pengaturan Outlet | NemuHUB',
  description: 'Kelola personalisasi, pajak, biaya, dan metode pembayaran outletmu.',
};

export default function SettingsPage() {
  return <OutletSettingsView />;
}
