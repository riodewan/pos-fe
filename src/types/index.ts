// ==========================================
// Multi-Tenant SaaS POS Platform - Type Definitions
// ==========================================

export type ULID = string;

// Standard API Response Structure
export interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data: T;
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    from?: number;
    to?: number;
  };
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// ==========================================
// Auth & Identity
// ==========================================
export interface User {
  id: ULID;
  name: string;
  email: string;
  is_internal: boolean;
  is_active: boolean;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
  tenants?: TenantMembership[];
  roles?: any[];
  permissions?: string[];
}

export interface TenantMembership {
  id: ULID;
  name: string;
  slug?: string;
  role: string;
  stores?: Store[];
}

export interface Tenant {
  id: ULID;
  name: string;
  slug: string;
  phone?: string | null;
  address?: string | null;
  status: 'TRIAL' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED';
  created_at?: string;
  updated_at?: string;
}

export interface Store {
  id: ULID;
  tenant_id: ULID;
  name: string;
  code: string;
  phone?: string | null;
  address?: string | null;
  timezone?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: ULID;
  name: string;
  display_name?: string;
  scope: 'INTERNAL' | 'TENANT';
  permissions?: Permission[];
}

export interface Permission {
  id: ULID;
  name: string;
  display_name?: string;
  module?: string;
}

export interface AuthSession {
  user: User;
  token: string;
  token_type: string;
}

// ==========================================
// Catalog & Raw Materials
// ==========================================
export type UnitType = 'WEIGHT' | 'VOLUME' | 'PIECE' | 'LENGTH';

export interface Unit {
  id: ULID;
  tenant_id?: ULID;
  name: string;
  code: string;
  type: UnitType;
  created_at?: string;
}

export interface Product {
  id: ULID;
  tenant_id: ULID;
  store_id?: ULID;
  name: string;
  sku: string;
  selling_price: number | string;
  description?: string | null;
  image_url?: string | null;
  status: 'ACTIVE' | 'INACTIVE';
  created_at?: string;
  updated_at?: string;
  recipe?: Recipe | null;
}

export interface Ingredient {
  id: ULID;
  tenant_id: ULID;
  name: string;
  sku: string;
  unit_id: ULID;
  status: 'ACTIVE' | 'INACTIVE';
  unit?: Unit;
  current_stock?: number | string;
  average_cost?: number | string;
  created_at?: string;
  updated_at?: string;
}

export interface Supplier {
  id: ULID;
  tenant_id: ULID;
  name: string;
  contact_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// Recipes & Menus
// ==========================================
export interface RecipeItem {
  id?: ULID;
  recipe_id?: ULID;
  ingredient_id: ULID;
  unit_id: ULID;
  quantity: number | string;
  ingredient?: Ingredient;
  unit?: Unit;
}

export interface Recipe {
  id: ULID;
  tenant_id: ULID;
  store_id?: ULID;
  product_id: ULID;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  items?: RecipeItem[];
  created_at?: string;
  updated_at?: string;
}

export interface Menu {
  id: ULID;
  tenant_id: ULID;
  store_id: ULID;
  name: string;
  status: 'ACTIVE' | 'INACTIVE';
  products?: Product[];
  product_ids?: ULID[];
  created_at?: string;
  updated_at?: string;
}

// ==========================================
// Inventory Management
// ==========================================
export type PurchaseStatus = 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseItem {
  id?: ULID;
  purchase_id?: ULID;
  ingredient_id: ULID;
  unit_id: ULID;
  quantity: number | string;
  unit_cost: number | string;
  subtotal?: number | string;
  ingredient?: Ingredient;
  unit?: Unit;
}

export interface Purchase {
  id: ULID;
  tenant_id: ULID;
  store_id: ULID;
  supplier_id: ULID;
  purchase_number?: string;
  purchase_date: string;
  total_amount: number | string;
  status: PurchaseStatus;
  notes?: string | null;
  received_at?: string | null;
  supplier?: Supplier;
  items?: PurchaseItem[];
  created_at?: string;
  updated_at?: string;
}

export interface StockBalance {
  id: ULID;
  store_id: ULID;
  ingredient_id: ULID;
  quantity: number | string;
  average_cost: number | string;
  ingredient?: Ingredient;
  updated_at?: string;
}

export interface WastageItem {
  id?: ULID;
  wastage_id?: ULID;
  ingredient_id: ULID;
  unit_id: ULID;
  quantity: number | string;
  ingredient?: Ingredient;
  unit?: Unit;
}

export interface Wastage {
  id: ULID;
  tenant_id: ULID;
  store_id: ULID;
  wastage_date: string;
  reason: string;
  items?: WastageItem[];
  created_at?: string;
  updated_at?: string;
}

export type MovementType = 'PURCHASE' | 'SALE' | 'WASTAGE' | 'ADJUSTMENT' | 'TRANSFER';

export interface StockMovement {
  id: ULID;
  store_id: ULID;
  ingredient_id: ULID;
  type: MovementType;
  quantity: number | string;
  unit_cost: number | string;
  reference_type?: string;
  reference_id?: ULID;
  notes?: string | null;
  ingredient?: Ingredient;
  created_at: string;
}

// ==========================================
// POS Tables, Orders & Payments
// ==========================================
export interface DiningTable {
  id: ULID;
  tenant_id?: ULID;
  store_id?: ULID;
  name: string;
  code: string;
  capacity: number;
  status: 'ACTIVE' | 'INACTIVE';
  is_occupied?: boolean;
  active_orders_count?: number;
  active_qr_token?: string | null;
  active_qr_code?: QrCode | null;
  created_at?: string;
  updated_at?: string;
}

export interface QrCode {
  id: ULID;
  table_id: ULID;
  token: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  is_active?: boolean;
  expires_at?: string | null;
  created_at?: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
export type OrderSource = 'POS' | 'QR' | 'ONLINE';

export interface OrderItem {
  id: ULID;
  order_id: ULID;
  product_id: ULID;
  product_name?: string;
  quantity: number;
  unit_price: number | string;
  discount_amount?: number | string;
  subtotal: number | string;
  notes?: string | null;
  product?: Product;
}

export interface Order {
  id: ULID;
  tenant_id: ULID;
  store_id: ULID;
  table_id?: ULID | null;
  order_number: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  source: OrderSource;
  status: OrderStatus;
  subtotal: number | string;
  discount_amount: number | string;
  tax_amount: number | string;
  service_charge: number | string;
  total_amount: number | string;
  notes?: string | null;
  table?: DiningTable | null;
  items?: OrderItem[];
  order_items?: OrderItem[];
  payments?: Payment[];
  created_at: string;
  updated_at?: string;
}

export type PaymentMethod = 'CASH' | 'QRIS' | 'TRANSFER' | 'EDC' | 'ONLINE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

export interface Payment {
  id: ULID;
  order_id: ULID;
  method: PaymentMethod;
  amount: number | string;
  status: PaymentStatus;
  provider?: string | null;
  provider_reference?: string | null;
  metadata?: {
    received_amount?: number;
    change_amount?: number;
    [key: string]: unknown;
  } | null;
  created_at: string;
}

// ==========================================
// Public Customer QR Self-Order
// ==========================================
export interface PublicQrResolved {
  token: string;
  store: {
    id: ULID;
    name: string;
    code: string;
    address?: string | null;
    phone?: string | null;
  };
  table: {
    id: ULID;
    name: string;
    code: string;
    capacity: number;
  };
  settings?: {
    tax_percentage?: number;
    service_charge_percentage?: number;
  };
  active_order?: Order | null;
  products: Array<{
    id: ULID;
    name: string;
    sku: string;
    selling_price: string | number;
    description?: string | null;
    image_url?: string | null;
  }>;
}

// ==========================================
// Reporting & Analytics
// ==========================================
export interface DashboardReport {
  kpis: {
    gross_sales: number;
    total_discounts: number;
    net_sales: number;
    tax: number;
    service_charge: number;
    total_revenue: number;
    total_orders: number;
    average_order_value: number;
  };
  daily_trends: Array<{
    date: string;
    total_revenue: number;
    orders_count: number;
  }>;
  top_products: Array<{
    product_id: ULID;
    product_name: string;
    total_quantity: number;
    total_sales: number;
  }>;
  payment_methods: Array<{
    method: PaymentMethod;
    total_amount: number;
    transactions_count: number;
    percentage: number;
  }>;
}

export interface InventoryUsageReport {
  gross_sales: number;
  total_cogs: number;
  gross_profit: number;
  gross_profit_margin_pct: number;
  items: Array<{
    ingredient_id: ULID;
    ingredient_name: string;
    unit_code: string;
    total_quantity_used: number;
    total_cost: number;
  }>;
}

export interface CashierAuditReport {
  summary: {
    cashier_id: ULID;
    cashier_name: string;
    total_transactions: number;
    cash_sales: number;
    cash_drawer_expected: number;
    non_cash_sales: number;
    total_sales: number;
  };
  transactions: Order[];
}
