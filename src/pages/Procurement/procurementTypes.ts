// ─── Supplier ────────────────────────────────────────────────────────────────
export type SupplierStatus = 'active' | 'inactive' | 'blacklisted';

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  tax_number: string;
  payment_terms: string;
  status: SupplierStatus;
  notes: string;
  created_at: string;
}

// ─── Purchase Request ─────────────────────────────────────────────────────────
export type PRStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'ordered';

export interface PRItem {
  name: string;
  qty: number;
  unit: string;
  unit_cost: number;
  description?: string;
}

export interface PurchaseRequest {
  id: number;
  pr_number: string;
  title: string;
  requested_by: number | null;
  requested_by_name: string | null;
  department: string;
  status: PRStatus;
  items: PRItem[];
  total_amount: string;
  required_by: string | null;
  notes: string;
  approved_by: number | null;
  approved_by_name: string | null;
  approved_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Purchase Order ───────────────────────────────────────────────────────────
export type POStatus = 'draft' | 'sent' | 'confirmed' | 'delivered' | 'cancelled';

export interface POItem {
  name: string;
  qty: number;
  unit: string;
  unit_cost: number;
  description?: string;
}

export interface PurchaseOrder {
  id: number;
  po_number: string;
  purchase_request: number | null;
  pr_number: string | null;
  supplier: number;
  supplier_name: string | null;
  status: POStatus;
  items: POItem[];
  total_amount: string;
  delivery_date: string | null;
  delivery_address: string;
  payment_terms: string;
  notes: string;
  created_by: number | null;
  created_by_name: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Goods Receiving Note ─────────────────────────────────────────────────────
export type GRNStatus = 'pending' | 'received' | 'discrepancy';

export interface GRNItem {
  name: string;
  ordered_qty: number;
  received_qty: number;
  unit: string;
  notes?: string;
}

export interface GoodsReceivingNote {
  id: number;
  grn_number: string;
  purchase_order: number;
  po_number: string | null;
  supplier_name: string | null;
  received_by: number | null;
  received_by_name: string | null;
  received_date: string;
  status: GRNStatus;
  items: GRNItem[];
  notes: string;
  created_at: string;
}

// ─── Inventory Item ───────────────────────────────────────────────────────────
export type ItemCategory =
  | 'raw_material' | 'finished_good' | 'consumable'
  | 'spare_part' | 'office_supply' | 'packaging' | 'other';

export type StockStatus = 'healthy' | 'warning' | 'low' | 'out_of_stock';

export interface InventoryItem {
  id: number;
  sku: string;
  name: string;
  category: ItemCategory;
  description: string;
  unit: string;
  quantity_on_hand: string;
  reorder_level: string;
  unit_cost: string;
  location: string;
  supplier: number | null;
  supplier_name: string | null;
  is_active: boolean;
  total_value: number;
  stock_status: StockStatus;
  created_at: string;
  updated_at: string;
}

// ─── Stock Movement ───────────────────────────────────────────────────────────
export type MovementType = 'in' | 'out' | 'transfer' | 'adjustment';

export interface StockMovement {
  id: number;
  item: number;
  item_name: string;
  item_sku: string;
  movement_type: MovementType;
  quantity: string;
  quantity_before: string;
  quantity_after: string;
  reference: string;
  notes: string;
  moved_by: number | null;
  moved_by_name: string | null;
  moved_at: string;
}

// ─── Asset ────────────────────────────────────────────────────────────────────
export type AssetStatus = 'active' | 'maintenance' | 'disposed' | 'transferred';
export type AssetCategory =
  | 'it_equipment' | 'furniture' | 'machinery'
  | 'vehicle' | 'land_building' | 'tools' | 'other';

export interface Asset {
  id: number;
  asset_number: string;
  name: string;
  category: AssetCategory;
  serial_number: string;
  description: string;
  assigned_to: number | null;
  assigned_to_name: string | null;
  department: string;
  location: string;
  purchase_date: string | null;
  purchase_cost: string;
  current_value: string;
  useful_life_years: number;
  status: AssetStatus;
  supplier: number | null;
  supplier_name: string | null;
  warranty_expiry: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}
