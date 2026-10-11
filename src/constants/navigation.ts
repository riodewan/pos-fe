import {
  LayoutDashboard,
  ShoppingCart,
  Grid,
  Coffee,
  BookOpen,
  Package,
  BarChart3,
  Settings,
  LucideIcon,
} from 'lucide-react';
import { ROUTES } from './routes';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { href: ROUTES.DASHBOARD.OVERVIEW, label: 'Ringkasan', icon: LayoutDashboard },
  { href: ROUTES.DASHBOARD.POS, label: 'Kasir POS', icon: ShoppingCart },
  { href: ROUTES.DASHBOARD.TABLES, label: 'Meja & QR', icon: Grid },
  { href: ROUTES.DASHBOARD.CATALOG, label: 'Katalog Produk', icon: Coffee },
  { href: ROUTES.DASHBOARD.RECIPES, label: 'Resep & HPP', icon: BookOpen },
  { href: ROUTES.DASHBOARD.INVENTORY, label: 'Inventaris Stok', icon: Package },
  { href: ROUTES.DASHBOARD.REPORTS, label: 'Laporan Penjualan', icon: BarChart3 },
  { href: ROUTES.DASHBOARD.SETTINGS, label: 'Pengaturan', icon: Settings },
];
