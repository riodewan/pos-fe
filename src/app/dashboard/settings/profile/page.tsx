import { Metadata } from 'next';
import { ProfileOutletView } from '@/components/profile-outlet/ProfileOutletView';

export const metadata: Metadata = {
  title: 'Profil Outlet | NemuHUB',
  description: 'Kelola informasi, operasional, dan pengaturan untuk setiap outlet',
};

export default function ProfileOutletPage() {
  return <ProfileOutletView />;
}
