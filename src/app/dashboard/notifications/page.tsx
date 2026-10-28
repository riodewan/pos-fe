import { Metadata } from 'next';
import { NotificationsView } from '@/components/notifications/NotificationsView';

export const metadata: Metadata = {
  title: 'Notifikasi | NemuHUB',
  description: 'Pantau semua aktivitas penting di outletmu.',
};

export default function NotificationsPage() {
  return <NotificationsView />;
}
