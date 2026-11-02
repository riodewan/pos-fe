export type StaffRole = string;

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

export interface AccessiblePageData {
  id: string;
  name: string;
  path: string;
  group: 'Operasional' | 'Katalog & Stok' | 'Bisnis & Pengelolaan' | string;
  description: string;
  required_permissions: string[];
  is_accessible: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  role: StaffRole;
  roleId?: string;
  password?: string;
  status: StaffStatus;
  lastLogin: string;
  avatarUrl?: string;
  permissions: string[];
}

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  staffCount: number;
  color?: string;
  badgeBg?: string;
  badgeText?: string;
  permissions: string[];
  permissionIds?: string[];
  accessiblePages?: AccessiblePageData[];
  isDefault?: boolean;
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
