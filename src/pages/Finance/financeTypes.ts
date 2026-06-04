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
}

// Demo data generators
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

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('sw-TZ', { style: 'currency', currency: 'TZS', maximumFractionDigits: 0 }).format(amount);

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
