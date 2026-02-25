// ── Auth ──────────────────────────────────────────────────────────────────
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  userId: number;
  username: string;
  email: string;
  token: string;
}

// ── Enums ─────────────────────────────────────────────────────────────────
export type OrderStatus = 'Draft' | 'Confirmed' | 'Completed' | 'Cancelled';
// Backend sends 0=In, 1=Out, 2=Adjustment when string enum isn't enabled
// If you added JsonStringEnumConverter, it'll be "In"/"Out"/"Adjustment"
export type StockMovementType = 'In' | 'Out' | 'Adjustment' | 0 | 1 | 2;

// ── Category ──────────────────────────────────────────────────────────────
export interface CategoryResponse {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
}

// ── Unit ──────────────────────────────────────────────────────────────────
export interface UnitResponse {
  id: number;
  name: string;
  symbol: string;
}

export interface CreateUnitRequest {
  name: string;
  symbol: string;
}

// ── Supplier ──────────────────────────────────────────────────────────────
export interface SupplierResponse {
  id: number;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierRequest {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateSupplierRequest extends CreateSupplierRequest { }

// ── Customer ──────────────────────────────────────────────────────────────
export interface CustomerResponse {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateCustomerRequest extends CreateCustomerRequest { }

// ── Product ───────────────────────────────────────────────────────────────
export interface ProductResponse {
  id: number;
  name: string;
  sku: string;
  description: string | null;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  isActive: boolean;
  categoryId: number;
  categoryName: string;
  unitId: number;
  unitName: string;
  unitSymbol: string;
  currentStock: number;
  isLowStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  description?: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  categoryId: number;
  unitId: number;
}

export interface UpdateProductRequest extends CreateProductRequest { }

// ── Stock ─────────────────────────────────────────────────────────────────
export interface StockAdjustmentRequest {
  productId: number;
  type: 0 | 1 | 2; // 0=In, 1=Out, 2=Adjustment
  quantity: number;
  notes?: string;
}

export interface CurrentStockResponse {
  productId: number;
  productName: string;
  sku: string;
  currentStock: number;
  unitSymbol: string;
  reorderLevel: number;
  isLowStock: boolean;
}

export interface StockMovementResponse {
  id: number;
  productId: number;
  productName: string;
  sku: string;
  type: string;
  quantity: number;
  notes: string | null;
  referenceId: number | null;
  referenceType: string | null;
  movementDate: string;
}

// ── Purchase Orders ───────────────────────────────────────────────────────
export interface PurchaseItemResponse {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrderResponse {
  id: number;
  orderNumber: string;
  supplierId: number;
  supplierName: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  notes: string | null;
  items: PurchaseItemResponse[];
}

export interface CreatePurchaseItemRequest {
  productId: number;
  quantity: number;
  unitCost: number;
}

export interface CreatePurchaseOrderRequest {
  supplierId: number;
  notes?: string;
  items: CreatePurchaseItemRequest[];
}

// ── Sale Orders ───────────────────────────────────────────────────────────
export interface SaleItemResponse {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SaleOrderResponse {
  id: number;
  orderNumber: string;
  customerId: number;
  customerName: string;
  orderDate: string;
  status: OrderStatus;
  totalAmount: number;
  notes: string | null;
  items: SaleItemResponse[];
}

export interface CreateSaleItemRequest {
  productId: number;
  quantity: number;
  unitPrice: number;
}

export interface CreateSaleOrderRequest {
  customerId: number;
  notes?: string;
  items: CreateSaleItemRequest[];
}

// ── API Error ─────────────────────────────────────────────────────────────
export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  errors?: Record<string, string[]>; // Validation errors
}
