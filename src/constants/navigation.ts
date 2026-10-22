import {
  LayoutDashboard,
  ShoppingCart,
  Grid,
  Coffee,
  BookOpen,
  Package,
  BarChart3,
  Settings,
  ClipboardList,
  LucideIcon,
} from 'lucide-react';
import { ROUTES } from './routes';

export type NavGroup = 'Operasional' | 'Produk & Stok' | 'Bisnis';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  roles?: string[];
  group?: NavGroup;
}

export const NAV_GROUP_ORDER: NavGroup[] = ['Operasional', 'Produk & Stok', 'Bisnis'];

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    href: ROUTES.DASHBOARD.OVERVIEW,
    label: 'Ringkasan',
    icon: LayoutDashboard,
    roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'],
    group: 'Operasional',
  },
  {
    href: ROUTES.DASHBOARD.TABLES,
    label: 'Meja & QR',
    icon: Grid,
    roles: ['OWNER', 'MANAGER', 'CASHIER', 'SUPER_ADMIN'],
    group: 'Operasional',
  },
  {
    href: ROUTES.DASHBOARD.CATALOG,
    label: 'Katalog Produk',
    icon: Coffee,
    roles: ['OWNER', 'MANAGER', 'CASHIER', 'INVENTORY', 'SUPER_ADMIN'],
    group: 'Produk & Stok',
  },
  {
    href: ROUTES.DASHBOARD.RECIPES,
    label: 'Resep & HPP',
    icon: BookOpen,
    roles: ['OWNER', 'MANAGER', 'INVENTORY', 'SUPER_ADMIN'],
    group: 'Produk & Stok',
  },
  {
    href: ROUTES.DASHBOARD.INVENTORY,
    label: 'Inventaris Stok',
    icon: Package,
    roles: ['OWNER', 'MANAGER', 'INVENTORY', 'SUPER_ADMIN'],
    group: 'Produk & Stok',
  },
  {
    href: ROUTES.DASHBOARD.REPORTS,
    label: 'Laporan Penjualan',
    icon: BarChart3,
    roles: ['OWNER', 'MANAGER', 'SUPER_ADMIN'],
    group: 'Bisnis',
  },
  {
    href: ROUTES.DASHBOARD.SETTINGS,
    label: 'Pengaturan',
    icon: Settings,
    roles: ['OWNER', 'SUPER_ADMIN'],
    group: 'Bisnis',
  },
];
