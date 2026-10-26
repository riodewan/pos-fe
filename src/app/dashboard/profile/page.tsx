import { Metadata } from 'next';
import { ProfileOutletView } from '@/components/profile-outlet/ProfileOutletView';

export const metadata: Metadata = {
  title: 'Profile Outlet | NemuPOS',
  description: 'Kelola informasi, operasional, dan pengaturan untuk setiap outlet',
};

export default function ProfilePage() {
  return <ProfileOutletView />;
}
