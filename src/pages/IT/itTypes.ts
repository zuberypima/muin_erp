// ─── IT Module — Shared Types & Demo Data ────────────────────────────────────

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
  serialNumber: string;
  purchaseDate: string;
  purchasePrice: number;
  assignedTo: string;   // employee name
  location: string;
  condition: AssetCondition;
  status: AssetStatus;
  warrantyExpiry: string;
  notes?: string;
}

// ── User Account ──────────────────────────────────────────────────────────────
export type AccountStatus = 'active' | 'suspended' | 'inactive';
export type AccountRole   = 'Admin' | 'Manager' | 'Staff' | 'Viewer' | 'Super Admin';

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  role: AccountRole;
  department: string;
  systemAccess: string[];
  status: AccountStatus;
  createdAt: string;
  lastLogin: string;
  mfaEnabled: boolean;
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
  raisedBy: string;
  assignedTo: string;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

// ── Maintenance Record ────────────────────────────────────────────────────────
export type MaintenanceType   = 'preventive' | 'corrective' | 'upgrade' | 'inspection';
export type MaintenanceStatus = 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

export interface MaintenanceRecord {
  id: string;
  assetId: string;
  assetName: string;
  type: MaintenanceType;
  description: string;
  performedBy: string;
  cost: number;
  scheduledDate: string;
  completedDate?: string;
  nextMaintenanceDate?: string;
  status: MaintenanceStatus;
}

// ── Software License ──────────────────────────────────────────────────────────
export type LicenseType   = 'perpetual' | 'subscription' | 'open-source' | 'trial';
export type LicenseStatus = 'active' | 'expired' | 'expiring-soon';

export interface SoftwareLicense {
  id: string;
  softwareName: string;
  vendor: string;
  licenseKey: string;
  licenseType: LicenseType;
  seatsTotal: number;
  seatsUsed: number;
  purchaseDate: string;
  expiryDate: string;
  cost: number;
  status: LicenseStatus;
  notes?: string;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

export const demoAssets: ITAsset[] = [
  { id: 'AST-001', name: 'Admin Desktop PC', category: 'computer', brand: 'Dell', model: 'OptiPlex 7090', serialNumber: 'DL7090-00123', purchaseDate: '2023-01-15', purchasePrice: 1800000, assignedTo: 'Amina Hassan', location: 'Head Office – Room 101', condition: 'excellent', status: 'active', warrantyExpiry: '2026-01-15' },
  { id: 'AST-002', name: 'Finance Laptop', category: 'laptop', brand: 'HP', model: 'EliteBook 840 G9', serialNumber: 'HP840-00456', purchaseDate: '2023-03-20', purchasePrice: 2200000, assignedTo: 'Fatuma Ally', location: 'Finance Department', condition: 'good', status: 'active', warrantyExpiry: '2026-03-20' },
  { id: 'AST-003', name: 'Network Switch – Core', category: 'network', brand: 'Cisco', model: 'Catalyst 2960-X', serialNumber: 'CSC2960-00789', purchaseDate: '2022-07-10', purchasePrice: 3500000, assignedTo: 'Grace Mwangi', location: 'Server Room', condition: 'excellent', status: 'active', warrantyExpiry: '2025-07-10' },
  { id: 'AST-004', name: 'HP LaserJet MFP', category: 'printer', brand: 'HP', model: 'LaserJet M428fdw', serialNumber: 'HPL428-00321', purchaseDate: '2023-05-01', purchasePrice: 950000, assignedTo: 'Shared – Admin', location: 'Admin Office', condition: 'good', status: 'active', warrantyExpiry: '2025-05-01' },
  { id: 'AST-005', name: 'Main File Server', category: 'server', brand: 'Dell', model: 'PowerEdge R740', serialNumber: 'DLR740-00654', purchaseDate: '2022-01-05', purchasePrice: 8500000, assignedTo: 'Grace Mwangi', location: 'Server Room', condition: 'good', status: 'active', warrantyExpiry: '2027-01-05' },
  { id: 'AST-006', name: 'Sales Manager Phone', category: 'mobile', brand: 'Samsung', model: 'Galaxy S23', serialNumber: 'SMS23-00987', purchaseDate: '2024-02-14', purchasePrice: 1200000, assignedTo: 'Peter Kamau', location: 'Sales Department', condition: 'excellent', status: 'active', warrantyExpiry: '2026-02-14' },
  { id: 'AST-007', name: 'Conference Monitor', category: 'monitor', brand: 'LG', model: '27UL650', serialNumber: 'LG27UL-00741', purchaseDate: '2023-08-20', purchasePrice: 650000, assignedTo: 'Shared – Boardroom', location: 'Boardroom', condition: 'excellent', status: 'active', warrantyExpiry: '2026-08-20' },
  { id: 'AST-008', name: 'Logistics Laptop', category: 'laptop', brand: 'Lenovo', model: 'ThinkPad E14', serialNumber: 'LNE14-00852', purchaseDate: '2022-11-10', purchasePrice: 1600000, assignedTo: 'Ibrahim Salim', location: 'Logistics Office', condition: 'fair', status: 'in-repair', warrantyExpiry: '2024-11-10', notes: 'Keyboard replacement in progress' },
];

export const demoAccounts: UserAccount[] = [
  { id: 'USR-001', username: 'amina.hassan', fullName: 'Amina Hassan', email: 'amina.h@muini.co.tz', role: 'Super Admin', department: 'Management', systemAccess: ['Finance', 'HR', 'Procurement', 'IT', 'Reports'], status: 'active', createdAt: '2022-01-15', lastLogin: '2026-06-11T08:32:00Z', mfaEnabled: true },
  { id: 'USR-002', username: 'james.okonkwo', fullName: 'James Okonkwo', email: 'james.o@muini.co.tz', role: 'Manager', department: 'Farm Operations', systemAccess: ['Procurement', 'Reports'], status: 'active', createdAt: '2022-03-01', lastLogin: '2026-06-10T17:11:00Z', mfaEnabled: false },
  { id: 'USR-003', username: 'fatuma.ally', fullName: 'Fatuma Ally', email: 'fatuma.a@muini.co.tz', role: 'Manager', department: 'Finance', systemAccess: ['Finance', 'Reports'], status: 'active', createdAt: '2023-06-01', lastLogin: '2026-06-11T09:05:00Z', mfaEnabled: true },
  { id: 'USR-004', username: 'peter.kamau', fullName: 'Peter Kamau', email: 'peter.k@muini.co.tz', role: 'Staff', department: 'Sales & Marketing', systemAccess: ['Reports'], status: 'suspended', createdAt: '2023-09-15', lastLogin: '2026-05-30T14:22:00Z', mfaEnabled: false },
  { id: 'USR-005', username: 'grace.mwangi', fullName: 'Grace Mwangi', email: 'grace.m@muini.co.tz', role: 'Admin', department: 'IT', systemAccess: ['Finance', 'HR', 'Procurement', 'IT', 'Reports'], status: 'active', createdAt: '2024-01-10', lastLogin: '2026-06-11T07:58:00Z', mfaEnabled: true },
  { id: 'USR-006', username: 'ibrahim.salim', fullName: 'Ibrahim Salim', email: 'ibrahim.s@muini.co.tz', role: 'Staff', department: 'Logistics', systemAccess: ['Procurement'], status: 'active', createdAt: '2024-04-01', lastLogin: '2026-06-09T16:45:00Z', mfaEnabled: false },
];

export const demoTickets: SupportTicket[] = [
  { id: 'TKT-001', title: 'Email client not syncing', description: 'Outlook is not syncing emails since this morning. All other staff in Finance are affected.', category: 'software', priority: 'high', raisedBy: 'Fatuma Ally', assignedTo: 'Grace Mwangi', status: 'in-progress', createdAt: '2026-06-11T07:30:00Z', updatedAt: '2026-06-11T09:00:00Z' },
  { id: 'TKT-002', title: 'Laptop keyboard broken', description: 'Keys on the logistics laptop are sticking — multiple keys non-functional.', category: 'hardware', priority: 'medium', raisedBy: 'Ibrahim Salim', assignedTo: 'Grace Mwangi', status: 'open', createdAt: '2026-06-10T14:20:00Z', updatedAt: '2026-06-10T14:20:00Z' },
  { id: 'TKT-003', title: 'Cannot access ERP system', description: 'Getting 403 Forbidden when trying to log in. Password was reset yesterday.', category: 'account', priority: 'critical', raisedBy: 'James Okonkwo', assignedTo: 'Grace Mwangi', status: 'resolved', createdAt: '2026-06-09T11:00:00Z', updatedAt: '2026-06-09T12:30:00Z', resolvedAt: '2026-06-09T12:30:00Z' },
  { id: 'TKT-004', title: 'Printer offline – Admin Office', description: 'HP LaserJet not responding on the network. Print jobs are queued.', category: 'hardware', priority: 'medium', raisedBy: 'Amina Hassan', assignedTo: '', status: 'open', createdAt: '2026-06-11T10:15:00Z', updatedAt: '2026-06-11T10:15:00Z' },
  { id: 'TKT-005', title: 'Slow internet in Farm Operations', description: 'Internet speed is extremely slow at the farm office wing since yesterday afternoon.', category: 'network', priority: 'high', raisedBy: 'Zawadi Juma', assignedTo: 'Grace Mwangi', status: 'in-progress', createdAt: '2026-06-10T16:00:00Z', updatedAt: '2026-06-11T08:00:00Z' },
  { id: 'TKT-006', title: 'Request new user account', description: 'New staff member Layla Ahmed joining Finance on June 15. Needs ERP access.', category: 'account', priority: 'low', raisedBy: 'Fatuma Ally', assignedTo: 'Grace Mwangi', status: 'open', createdAt: '2026-06-08T09:00:00Z', updatedAt: '2026-06-08T09:00:00Z' },
];

export const demoMaintenance: MaintenanceRecord[] = [
  { id: 'MNT-001', assetId: 'AST-005', assetName: 'Main File Server', type: 'preventive', description: 'Quarterly server health check — SMART disk scan, fan cleaning, OS patches applied.', performedBy: 'Grace Mwangi', cost: 0, scheduledDate: '2026-06-10', completedDate: '2026-06-10', nextMaintenanceDate: '2026-09-10', status: 'completed' },
  { id: 'MNT-002', assetId: 'AST-008', assetName: 'Logistics Laptop', type: 'corrective', description: 'Keyboard replacement due to stuck/broken keys. Ordered replacement part.', performedBy: 'Grace Mwangi', cost: 85000, scheduledDate: '2026-06-12', status: 'in-progress' },
  { id: 'MNT-003', assetId: 'AST-003', assetName: 'Network Switch – Core', type: 'preventive', description: 'Firmware upgrade to latest stable version. Scheduled during off-hours.', performedBy: 'Grace Mwangi', cost: 0, scheduledDate: '2026-06-15', nextMaintenanceDate: '2026-12-15', status: 'scheduled' },
  { id: 'MNT-004', assetId: 'AST-004', assetName: 'HP LaserJet MFP', type: 'corrective', description: 'Replace toner cartridge and run nozzle clean cycle.', performedBy: 'External — TechFix Ltd', cost: 120000, scheduledDate: '2026-06-11', status: 'scheduled' },
  { id: 'MNT-005', assetId: 'AST-001', assetName: 'Admin Desktop PC', type: 'upgrade', description: 'RAM upgrade from 8GB to 16GB for improved performance.', performedBy: 'Grace Mwangi', cost: 180000, scheduledDate: '2026-05-20', completedDate: '2026-05-20', nextMaintenanceDate: '2027-05-20', status: 'completed' },
];

export const demoLicenses: SoftwareLicense[] = [
  { id: 'LIC-001', softwareName: 'Microsoft 365 Business', vendor: 'Microsoft', licenseKey: 'M365-XXXX-XXXX-ABCD', licenseType: 'subscription', seatsTotal: 20, seatsUsed: 14, purchaseDate: '2026-01-01', expiryDate: '2027-01-01', cost: 3200000, status: 'active' },
  { id: 'LIC-002', softwareName: 'Kaspersky Endpoint Security', vendor: 'Kaspersky', licenseKey: 'KES-YYYY-YYYY-1234', licenseType: 'subscription', seatsTotal: 15, seatsUsed: 12, purchaseDate: '2025-06-01', expiryDate: '2026-06-30', cost: 850000, status: 'expiring-soon', notes: 'Renew before June 30' },
  { id: 'LIC-003', softwareName: 'Adobe Acrobat Pro', vendor: 'Adobe', licenseKey: 'ACR-ZZZZ-ZZZZ-5678', licenseType: 'perpetual', seatsTotal: 5, seatsUsed: 4, purchaseDate: '2022-09-15', expiryDate: '—', cost: 1200000, status: 'active' },
  { id: 'LIC-004', softwareName: 'QuickBooks Accounting', vendor: 'Intuit', licenseKey: 'QB22-AAAA-BBBB-CCCC', licenseType: 'subscription', seatsTotal: 3, seatsUsed: 2, purchaseDate: '2024-04-01', expiryDate: '2026-06-20', cost: 540000, status: 'expiring-soon', notes: 'Migration to ERP Finance underway' },
  { id: 'LIC-005', softwareName: 'AutoCAD LT', vendor: 'Autodesk', licenseKey: 'ACD-DDDD-EEEE-FFFF', licenseType: 'subscription', seatsTotal: 2, seatsUsed: 1, purchaseDate: '2025-01-15', expiryDate: '2026-01-15', cost: 720000, status: 'expired' },
  { id: 'LIC-006', softwareName: 'Ubuntu Server LTS', vendor: 'Canonical', licenseKey: 'OPEN-SOURCE', licenseType: 'open-source', seatsTotal: 999, seatsUsed: 3, purchaseDate: '2022-01-01', expiryDate: '—', cost: 0, status: 'active' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const formatCurrency = (n: number) =>
  new Intl.NumberFormat('sw-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(n);

export const formatDate = (d: string) =>
  d && d !== '—' ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export const formatDateTime = (d: string) =>
  d ? new Date(d).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export const ASSET_CATEGORIES: AssetCategory[] = ['computer', 'laptop', 'printer', 'server', 'network', 'mobile', 'monitor', 'other'];
export const DEPARTMENTS = ['Management', 'Farm Operations', 'Finance', 'Sales & Marketing', 'IT', 'Logistics', 'HR'];
export const SYSTEMS = ['Finance', 'HR', 'Procurement', 'IT', 'Reports', 'Tasks'];
