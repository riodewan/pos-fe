/**
 * Application Route Paths
 */

export const ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  DASHBOARD: {
    ROOT: '/dashboard',
    OVERVIEW: '/dashboard',
    POS: '/dashboard/pos',
    TABLES: '/dashboard/tables',
    CATALOG: '/dashboard/catalog',
    RECIPES: '/dashboard/recipes',
    INVENTORY: '/dashboard/inventory',
    REPORTS: '/dashboard/reports',
    SETTINGS: '/dashboard/settings',
  },
  PUBLIC: {
    QR_ORDER: (token: string) => `/q/${token}`,
  },
} as const;
