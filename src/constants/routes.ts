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
    ORDERS: '/dashboard/orders',
    TRANSACTIONS: '/dashboard/transactions',
    POS: '/dashboard/pos',
    KDS: '/dashboard/kds',
    TABLES: '/dashboard/tables',
    RESERVATIONS: '/dashboard/reservations',
    QR_ORDER: '/dashboard/qr-order',
    CATALOG: '/dashboard/catalog',
    RECIPES: '/dashboard/recipes',
    INVENTORY: '/dashboard/inventory',
    REPORTS: '/dashboard/reports',
    SETTINGS: '/dashboard/settings',
    PROFILE: '/dashboard/settings/profile',
    ACCOUNT: '/dashboard/settings/account',
    NOTIFICATIONS: '/dashboard/notifications',
    STAFF: '/dashboard/staff',
  },
  PUBLIC: {
    QR_ORDER: (token: string) => `/q/${token}`,
  },
} as const;
