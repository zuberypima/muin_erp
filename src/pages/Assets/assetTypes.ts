export interface FixedAsset {
  id: string | number;
  asset_tag: string; // e.g. AST-10045
  name: string;
  category: 'Machinery & Equipment' | 'Vehicles & Transport' | 'IT & Electronics' | 'Buildings & Facilities' | 'Office Furniture & Fixtures' | 'Marine & Vessel Assets';
  serial_number: string;
  location: string;
  department_assigned: string;
  custodian_name: string;
  purchase_date: string;
  purchase_cost: number;
  current_value: number; // Net Book Value
  depreciation_rate_pct: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair' | 'scrapped';
  status: 'active' | 'in-maintenance' | 'disposed' | 'archived';
}

export interface AssetMaintenanceLog {
  id: string | number;
  work_order_no: string;
  asset_tag: string;
  asset_name: string;
  service_type: 'routine' | 'emergency-repair' | 'calibration' | 'inspection';
  scheduled_date: string;
  vendor_or_technician: string;
  cost_tzs: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes: string;
}

export interface CustodyTransfer {
  id: string | number;
  transfer_ref: string;
  asset_tag: string;
  asset_name: string;
  from_custodian: string;
  to_custodian: string;
  from_department: string;
  to_department: string;
  transfer_date: string;
  approved_by: string;
  status: 'pending' | 'approved' | 'completed';
}

export interface DocumentRecord {
  id: string | number;
  record_code: string; // e.g. REC-2026-081
  title: string;
  record_type: 'Title Deed' | 'Vehicle Logbook' | 'Warranty Contract' | 'Audit Certificate' | 'Insurance Policy' | 'Compliance Permit';
  related_asset_tag?: string;
  physical_shelf_location: string; // e.g. Cabinet B, Shelf 3
  custodian: string;
  issue_date: string;
  expiry_date?: string;
  status: 'active' | 'archived' | 'expired';
}

export const ASSET_CATEGORIES = [
  'Machinery & Equipment',
  'Vehicles & Transport',
  'IT & Electronics',
  'Buildings & Facilities',
  'Office Furniture & Fixtures',
  'Marine & Vessel Assets'
];

export const LOCATIONS = [
  'Head Office (Dar es Salaam)',
  'Central Warehouse Yard',
  'Bandari Container Port Depot',
  'Arusha Branch Office',
  'Mbeya Regional Store',
  'Farm Operations Site A'
];
