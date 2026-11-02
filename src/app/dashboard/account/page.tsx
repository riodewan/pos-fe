import { Metadata } from 'next';
import { ProfileAccountView } from '@/components/profile-account/ProfileAccountView';

export const metadata: Metadata = {
  title: 'Profil Akun | NemuHUB',
  description: 'Kelola informasi akun, keamanan, dan preferensi pengguna NemuHUB.',
};

export default function AccountPage() {
  return <ProfileAccountView />;
}
