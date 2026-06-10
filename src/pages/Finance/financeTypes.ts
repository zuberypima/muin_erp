// Shared Finance types used across all finance pages

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  reference?: string;
}

export interface Budget {
  id: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  period: 'monthly' | 'quarterly' | 'annual';
  startDate: string;
  endDate: string;
}

export interface Loan {
  id: string;
  borrower: string;
  principalAmount: number;
  interestRate: number;
  paidAmount: number;
  remainingAmount: number;
  startDate: string;
  dueDate: string;
  status: 'active' | 'paid' | 'overdue' | 'defaulted';
  type: 'given' | 'received';
}

export interface IncomeEntry {
  id: string;
  date: string;
  source: string;
  category: string;
  amount: number;
  description?: string;
  status: 'received' | 'pending';
}

export interface ExpenseEntry {
  id: string;
  date: string;
  vendor: string;
  category: string;
  amount: number;
  description?: string;
  status: 'paid' | 'pending' | 'overdue';
  approvedBy?: string;
  notes?: string;
}

// ── Cashflow Types ──────────────────────────────────────────────────────────

export interface CashflowEntry {
  id: string;
  date: string;
  description: string;
  type: 'inflow' | 'outflow';
  category: string;
  amount: number;
  reference?: string;
}

export interface CashflowForecast {
  month: string;        // e.g. "Jan 2026"
  projected_inflow: number;
  actual_inflow: number;
  projected_outflow: number;
  actual_outflow: number;
}

// ── Demo Data ────────────────────────────────────────────────────────────────

export const demoTransactions: Transaction[] = [
  { id: 'TXN-001', date: '2026-06-01', description: 'Sunflower Seed Sales', category: 'Sales', type: 'income', amount: 4500000, status: 'completed', reference: 'INV-2026-001' },
  { id: 'TXN-002', date: '2026-06-01', description: 'Staff Salaries – May', category: 'Payroll', type: 'expense', amount: 2800000, status: 'completed', reference: 'PAY-MAY-2026' },
  { id: 'TXN-003', date: '2026-06-02', description: 'Fertilizer Purchase', category: 'Supplies', type: 'expense', amount: 650000, status: 'completed' },
  { id: 'TXN-004', date: '2026-06-03', description: 'Maize Crop Sales – Batch 3', category: 'Sales', type: 'income', amount: 3200000, status: 'pending', reference: 'INV-2026-002' },
  { id: 'TXN-005', date: '2026-06-03', description: 'Tractor Fuel', category: 'Operations', type: 'expense', amount: 180000, status: 'completed' },
  { id: 'TXN-006', date: '2026-06-04', description: 'Market Stall Rental Income', category: 'Rental', type: 'income', amount: 350000, status: 'completed' },
  { id: 'TXN-007', date: '2026-06-04', description: 'Office Supplies', category: 'Admin', type: 'expense', amount: 55000, status: 'completed' },
  { id: 'TXN-008', date: '2026-06-04', description: 'Irrigation System Repair', category: 'Maintenance', type: 'expense', amount: 420000, status: 'pending' },
];

export const demoBudgets: Budget[] = [
  { id: 'BDG-001', category: 'Payroll', allocatedAmount: 3000000, spentAmount: 2800000, period: 'monthly', startDate: '2026-06-01', endDate: '2026-06-30' },
  { id: 'BDG-002', category: 'Supplies', allocatedAmount: 1500000, spentAmount: 650000, period: 'monthly', startDate: '2026-06-01', endDate: '2026-06-30' },
  { id: 'BDG-003', category: 'Operations', allocatedAmount: 800000, spentAmount: 180000, period: 'monthly', startDate: '2026-06-01', endDate: '2026-06-30' },
  { id: 'BDG-004', category: 'Marketing', allocatedAmount: 500000, spentAmount: 120000, period: 'monthly', startDate: '2026-06-01', endDate: '2026-06-30' },
  { id: 'BDG-005', category: 'Maintenance', allocatedAmount: 600000, spentAmount: 420000, period: 'monthly', startDate: '2026-06-01', endDate: '2026-06-30' },
];

export const demoLoans: Loan[] = [
  { id: 'LN-001', borrower: 'John Mwangi', principalAmount: 2000000, interestRate: 12, paidAmount: 1200000, remainingAmount: 800000, startDate: '2026-01-01', dueDate: '2026-12-31', status: 'active', type: 'given' },
  { id: 'LN-002', borrower: 'Agrobank Tanzania', principalAmount: 5000000, interestRate: 8.5, paidAmount: 1500000, remainingAmount: 3500000, startDate: '2025-07-01', dueDate: '2026-07-01', status: 'active', type: 'received' },
  { id: 'LN-003', borrower: 'Mary Osei', principalAmount: 800000, interestRate: 10, paidAmount: 800000, remainingAmount: 0, startDate: '2025-10-01', dueDate: '2026-03-31', status: 'paid', type: 'given' },
  { id: 'LN-004', borrower: 'Peter Kamau', principalAmount: 1200000, interestRate: 15, paidAmount: 200000, remainingAmount: 1000000, startDate: '2025-12-01', dueDate: '2026-03-01', status: 'overdue', type: 'given' },
];

export const demoCashflowEntries: CashflowEntry[] = [
  { id: 'CF-001', date: '2026-06-01', description: 'Sunflower Seed Sales', type: 'inflow', category: 'Sales', amount: 4500000, reference: 'INV-001' },
  { id: 'CF-002', date: '2026-06-01', description: 'Staff Salaries – May', type: 'outflow', category: 'Payroll', amount: 2800000, reference: 'PAY-MAY' },
  { id: 'CF-003', date: '2026-06-02', description: 'Fertilizer Purchase', type: 'outflow', category: 'Supplies', amount: 650000 },
  { id: 'CF-004', date: '2026-06-03', description: 'Maize Sales – Batch 3', type: 'inflow', category: 'Sales', amount: 3200000, reference: 'INV-002' },
  { id: 'CF-005', date: '2026-06-03', description: 'Tractor Fuel', type: 'outflow', category: 'Operations', amount: 180000 },
  { id: 'CF-006', date: '2026-06-04', description: 'Market Stall Rental', type: 'inflow', category: 'Rental', amount: 350000 },
  { id: 'CF-007', date: '2026-06-05', description: 'Equipment Maintenance', type: 'outflow', category: 'Maintenance', amount: 420000 },
  { id: 'CF-008', date: '2026-06-06', description: 'Vegetable Sales', type: 'inflow', category: 'Sales', amount: 1800000 },
  { id: 'CF-009', date: '2026-06-07', description: 'Utility Bills', type: 'outflow', category: 'Utilities', amount: 230000 },
  { id: 'CF-010', date: '2026-06-08', description: 'Consultancy Fee – Agritech', type: 'inflow', category: 'Services', amount: 950000 },
];

export const demoCashflowForecast: CashflowForecast[] = [
  { month: 'Jan 2026', projected_inflow: 7200000, actual_inflow: 6900000, projected_outflow: 5500000, actual_outflow: 5800000 },
  { month: 'Feb 2026', projected_inflow: 6800000, actual_inflow: 7100000, projected_outflow: 5200000, actual_outflow: 5100000 },
  { month: 'Mar 2026', projected_inflow: 7500000, actual_inflow: 7350000, projected_outflow: 5600000, actual_outflow: 5450000 },
  { month: 'Apr 2026', projected_inflow: 8100000, actual_inflow: 7900000, projected_outflow: 5900000, actual_outflow: 6100000 },
  { month: 'May 2026', projected_inflow: 8400000, actual_inflow: 8600000, projected_outflow: 6200000, actual_outflow: 6050000 },
  { month: 'Jun 2026', projected_inflow: 9200000, actual_inflow: 10800000, projected_outflow: 6800000, actual_outflow: 4280000 },
  { month: 'Jul 2026', projected_inflow: 9000000, actual_inflow: 0, projected_outflow: 6500000, actual_outflow: 0 },
  { month: 'Aug 2026', projected_inflow: 8700000, actual_inflow: 0, projected_outflow: 6300000, actual_outflow: 0 },
  { month: 'Sep 2026', projected_inflow: 9100000, actual_inflow: 0, projected_outflow: 6700000, actual_outflow: 0 },
  { month: 'Oct 2026', projected_inflow: 9500000, actual_inflow: 0, projected_outflow: 7000000, actual_outflow: 0 },
  { month: 'Nov 2026', projected_inflow: 10200000, actual_inflow: 0, projected_outflow: 7400000, actual_outflow: 0 },
  { month: 'Dec 2026', projected_inflow: 11500000, actual_inflow: 0, projected_outflow: 8100000, actual_outflow: 0 },
];

// ── Utility Helpers ──────────────────────────────────────────────────────────

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('sw-TZ', { style: 'currency', currency: 'TZS', currencyDisplay: 'code', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
