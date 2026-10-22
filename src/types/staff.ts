export type StaffRole =
  | 'Owner'
  | 'Manager'
  | 'Kasir'
  | 'Dapur'
  | 'Barista'
  | 'Server';

export type StaffStatus = 'Aktif' | 'Nonaktif';

export interface PermissionModule {
  id: string;
  name: string;
  description: string;
  subPermissions?: {
    id: string;
    name: string;
  }[];
}

export interface StaffMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: StaffStatus;
  lastLogin: string;
  avatarUrl?: string;
  permissions: string[];
}

export interface RoleDefinition {
  id: string;
  name: StaffRole;
  description: string;
  staffCount: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  permissions: string[];
}

export interface LoginActivity {
  id: string;
  staffName: string;
  role: StaffRole;
  email: string;
  device: string;
  ipAddress: string;
  timestamp: string;
  status: 'Berhasil' | 'Gagal';
}
