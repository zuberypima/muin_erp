// ─── IT Module — Shared Types ────────────────────────────────────────────────

// ── IT Asset ─────────────────────────────────────────────────────────────────
export type AssetCategory = 'computer' | 'laptop' | 'printer' | 'server' | 'network' | 'mobile' | 'monitor' | 'other';
export type AssetStatus    = 'active' | 'in-repair' | 'decommissioned' | 'in-storage';
export type AssetCondition = 'excellent' | 'good' | 'fair' | 'poor';

export interface ITAsset {
  id: string;
  name: string;
  category: AssetCategory;
  brand: string;
  model: string;
  serial_number: string;
  purchase_date: string | null;
  purchase_price: number;
  assigned_to: string;
  location: string;
  condition: AssetCondition;
  status: AssetStatus;
  warranty_expiry: string | null;
  notes?: string;
}

// ── User Account ──────────────────────────────────────────────────────────────
export type AccountStatus = 'active' | 'suspended' | 'inactive';
export type AccountRole   = 'Admin' | 'Manager' | 'Staff' | 'Viewer' | 'Super Admin';

export interface UserAccount {
  id: string;
  username: string;
  full_name: string;
  email: string;
  role: AccountRole;
  department: string;
  system_access: string[];
  status: AccountStatus;
  created_at: string;
  last_login: string | null;
  mfa_enabled: boolean;
}

// ── Support Ticket ────────────────────────────────────────────────────────────
export type TicketCategory = 'hardware' | 'software' | 'network' | 'account' | 'other';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus   = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  raised_by: string;
  assigned_to: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
}

// ── Maintenance Record ────────────────────────────────────────────────────────
export type MaintenanceType   = 'preventive' | 'corrective' | 'upgrade' | 'inspection';
export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface MaintenanceRecord {
  id: string;
  asset_id: string;
  asset_name: string;
  type: MaintenanceType;
  description: string;
  performed_by: string;
  cost: number;
  scheduled_date: string | null;
  completed_date?: string | null;
  next_maintenance_date?: string | null;
  status: MaintenanceStatus;
}

// ── Software License ──────────────────────────────────────────────────────────
export type LicenseType   = 'perpetual' | 'subscription' | 'open-source' | 'trial';
export type LicenseStatus = 'active' | 'expired' | 'expiring-soon';

export interface SoftwareLicense {
  id: string;
  software_name: string;
  vendor: string;
  license_key: string;
  license_type: LicenseType;
  seats_total: number;
  seats_used: number;
  purchase_date: string | null;
  expiry_date: string | null;
  cost: number;
  status: LicenseStatus;
  notes?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const formatCurrency = (n: number) =>
  new Intl.NumberFormat('sw-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n);

export const formatDate = (d: string | null | undefined) =>
  d && d !== '—' ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (d: string | null | undefined) =>
  d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export const ASSET_CATEGORIES: AssetCategory[] = ['computer', 'laptop', 'printer', 'server', 'network', 'mobile', 'monitor', 'other'];
export const DEPARTMENTS = ['Management', 'Farm Operations', 'Finance', 'Sales & Marketing', 'IT', 'Logistics', 'HR'];
export const SYSTEMS = ['Finance', 'HR', 'Procurement', 'IT', 'Reports', 'Tasks'];
