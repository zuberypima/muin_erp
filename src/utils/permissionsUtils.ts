export interface SystemPageItem {
  id: string; // e.g. 'hr_leaves'
  label: string; // e.g. 'Leave Management'
  route: string; // e.g. '/hr/leaves'
  module: 'hr' | 'finance' | 'procurement' | 'logistics' | 'assets' | 'it' | 'tasks' | 'self-service' | 'admin' | 'services';
  moduleLabel: string;
}

export const ALL_SYSTEM_PAGES: SystemPageItem[] = [
  // Core Services
  { id: 'services_main', label: 'Services Directory', route: '/services', module: 'services', moduleLabel: 'Services Directory' },
  
  // Tasks
  { id: 'tasks_board', label: 'Task Board & Kanban', route: '/tasks', module: 'tasks', moduleLabel: 'Tasks & Collaboration' },
  { id: 'tasks_approvals', label: 'Approvals Inbox', route: '/tasks/approvals', module: 'tasks', moduleLabel: 'Tasks & Collaboration' },
  { id: 'tasks_assist', label: 'Assist Requests', route: '/tasks/assist', module: 'tasks', moduleLabel: 'Tasks & Collaboration' },

  // HR
  { id: 'hr_dashboard', label: 'HR Dashboard', route: '/hr', module: 'hr', moduleLabel: 'Human Resources' },
  { id: 'hr_employees', label: 'Employees Directory', route: '/hr/employees', module: 'hr', moduleLabel: 'Human Resources' },
  { id: 'hr_attendance', label: 'Attendance Records', route: '/hr/attendance', module: 'hr', moduleLabel: 'Human Resources' },
  { id: 'hr_leaves', label: 'Leave Requests', route: '/hr/leaves', module: 'hr', moduleLabel: 'Human Resources' },
  { id: 'hr_performance', label: 'Performance Reviews', route: '/hr/performance', module: 'hr', moduleLabel: 'Human Resources' },

  // Finance
  { id: 'finance_dashboard', label: 'Finance Dashboard', route: '/finance', module: 'finance', moduleLabel: 'Finance & Accounting' },
  { id: 'finance_income', label: 'Income & Revenue', route: '/finance/income', module: 'finance', moduleLabel: 'Finance & Accounting' },
  { id: 'finance_expenses', label: 'Expenses Tracking', route: '/finance/expenses', module: 'finance', moduleLabel: 'Finance & Accounting' },
  { id: 'finance_transactions', label: 'Transactions Ledger', route: '/finance/transactions', module: 'finance', moduleLabel: 'Finance & Accounting' },
  { id: 'finance_budgets', label: 'Department Budgets', route: '/finance/budgets', module: 'finance', moduleLabel: 'Finance & Accounting' },
  { id: 'finance_cashflow', label: 'Cash Flow Statements', route: '/finance/cashflow', module: 'finance', moduleLabel: 'Finance & Accounting' },

  // Procurement
  { id: 'procurement_dashboard', label: 'Procurement Dashboard', route: '/procurement', module: 'procurement', moduleLabel: 'Procurement & Purchasing' },
  { id: 'procurement_requests', label: 'Purchase Requests', route: '/procurement/purchase-requests', module: 'procurement', moduleLabel: 'Procurement & Purchasing' },
  { id: 'procurement_orders', label: 'Purchase Orders', route: '/procurement/purchase-orders', module: 'procurement', moduleLabel: 'Procurement & Purchasing' },
  { id: 'procurement_goods', label: 'Goods Receiving', route: '/procurement/goods-receiving', module: 'procurement', moduleLabel: 'Procurement & Purchasing' },
  { id: 'procurement_inventory', label: 'Warehouse Inventory', route: '/procurement/inventory', module: 'procurement', moduleLabel: 'Procurement & Purchasing' },
  { id: 'procurement_stock', label: 'Stock Tracking', route: '/procurement/stock-tracking', module: 'procurement', moduleLabel: 'Procurement & Purchasing' },
  { id: 'procurement_reports', label: 'Inventory Reports', route: '/procurement/reports', module: 'procurement', moduleLabel: 'Procurement & Purchasing' },

  // Logistics
  { id: 'logistics_dashboard', label: 'Logistics Dashboard', route: '/logistics', module: 'logistics', moduleLabel: 'Logistics & Supply Chain' },
  { id: 'logistics_inventory', label: 'Container Yard Inventory', route: '/logistics/inventory', module: 'logistics', moduleLabel: 'Logistics & Supply Chain' },
  { id: 'logistics_movements', label: 'Vessel & Cargo Movements', route: '/logistics/stock-tracking', module: 'logistics', moduleLabel: 'Logistics & Supply Chain' },
  { id: 'logistics_dispatches', label: 'Container Dispatches & Gate Pass', route: '/logistics/dispatches', module: 'logistics', moduleLabel: 'Logistics & Supply Chain' },
  { id: 'logistics_reports', label: 'Logistics Reports', route: '/logistics/reports', module: 'logistics', moduleLabel: 'Logistics & Supply Chain' },

  // Assets
  { id: 'assets_dashboard', label: 'Assets Dashboard', route: '/assets', module: 'assets', moduleLabel: 'Fixed Assets & Records' },
  { id: 'assets_register', label: 'Asset Register', route: '/assets/register', module: 'assets', moduleLabel: 'Fixed Assets & Records' },
  { id: 'assets_maintenance', label: 'Maintenance Logs', route: '/assets/maintenance', module: 'assets', moduleLabel: 'Fixed Assets & Records' },
  { id: 'assets_transfers', label: 'Asset Transfers', route: '/assets/transfers', module: 'assets', moduleLabel: 'Fixed Assets & Records' },
  { id: 'assets_records', label: 'Archival Records', route: '/assets/records', module: 'assets', moduleLabel: 'Fixed Assets & Records' },
  { id: 'assets_reports', label: 'Asset Reports', route: '/assets/reports', module: 'assets', moduleLabel: 'Fixed Assets & Records' },

  // IT
  { id: 'it_dashboard', label: 'IT Dashboard', route: '/it', module: 'it', moduleLabel: 'IT Infrastructure' },
  { id: 'it_hardware', label: 'Hardware Assets', route: '/it/assets', module: 'it', moduleLabel: 'IT Infrastructure' },
  { id: 'it_accounts', label: 'User Accounts & IAM', route: '/it/user-accounts', module: 'it', moduleLabel: 'IT Infrastructure' },
  { id: 'it_tickets', label: 'Helpdesk Support Tickets', route: '/it/support-tickets', module: 'it', moduleLabel: 'IT Infrastructure' },
  { id: 'it_licenses', label: 'Software Licenses', route: '/it/software-licenses', module: 'it', moduleLabel: 'IT Infrastructure' },

  // Self Service
  { id: 'self_service', label: 'Employee Self Service', route: '/self-service', module: 'self-service', moduleLabel: 'Self Service' },

  // Admin
  { id: 'erp_users', label: 'ERP Users Directory', route: '/erp-users', module: 'admin', moduleLabel: 'System Administration' },
  { id: 'user_permissions', label: 'User Page Access & Permissions', route: '/erp-users/permissions', module: 'admin', moduleLabel: 'System Administration' }
];

export const DEPARTMENT_DEFAULT_PRESETS: Record<string, string[]> = {
  hr: [
    '/services', '/self-service', '/tasks', '/tasks/approvals', '/tasks/assist',
    '/hr', '/hr/employees', '/hr/attendance', '/hr/leaves', '/hr/performance'
  ],
  finance: [
    '/services', '/self-service', '/tasks', '/tasks/approvals', '/tasks/assist',
    '/finance', '/finance/income', '/finance/expenses', '/finance/transactions', '/finance/budgets', '/finance/cashflow'
  ],
  logistics: [
    '/services', '/self-service', '/tasks', '/tasks/approvals', '/tasks/assist',
    '/logistics', '/logistics/inventory', '/logistics/stock-tracking', '/logistics/dispatches', '/logistics/reports'
  ],
  procurement: [
    '/services', '/self-service', '/tasks', '/tasks/approvals', '/tasks/assist',
    '/procurement', '/procurement/purchase-requests', '/procurement/purchase-orders', '/procurement/goods-receiving', '/procurement/inventory', '/procurement/stock-tracking', '/procurement/reports'
  ],
  assets: [
    '/services', '/self-service', '/tasks', '/tasks/approvals', '/tasks/assist',
    '/assets', '/assets/register', '/assets/maintenance', '/assets/transfers', '/assets/records', '/assets/reports'
  ],
  it: [
    '/services', '/self-service', '/tasks', '/tasks/approvals', '/tasks/assist',
    '/it', '/it/assets', '/it/user-accounts', '/it/support-tickets', '/it/software-licenses'
  ],
  management: ALL_SYSTEM_PAGES.map(p => p.route),
  admin: ALL_SYSTEM_PAGES.map(p => p.route)
};

export const isSuperAdminUser = (user: any): boolean => {
  if (!user) return false;
  const dept = (user.department || '').toLowerCase();
  return Boolean(
    user.is_superuser ||
    user.is_staff ||
    dept.includes('management') ||
    dept.includes('admin') ||
    (user.username || '').toLowerCase() === 'admin'
  );
};

export const getPermissionsForUser = (user: any): string[] => {
  if (!user) return ['/services', '/self-service'];

  // 1. Check custom user override in localStorage (ID or username)
  if (user.id) {
    try {
      const userCustom = localStorage.getItem(`muin_permissions_user_${user.id}`);
      if (userCustom) {
        return JSON.parse(userCustom);
      }
    } catch {}
  }
  if (user.username) {
    try {
      const userCustom = localStorage.getItem(`muin_permissions_user_${user.username}`);
      if (userCustom) {
        return JSON.parse(userCustom);
      }
    } catch {}
  }

  // 2. Check custom user override from backend API user profile object (if present)
  if (Array.isArray(user.allowed_pages) && user.allowed_pages.length > 0) {
    return user.allowed_pages;
  }
  if (user.profile && Array.isArray(user.profile.allowed_pages) && user.profile.allowed_pages.length > 0) {
    return user.profile.allowed_pages;
  }

  // 3. Check department override in localStorage
  const deptKey = (user.department || '').toLowerCase().trim();
  if (deptKey) {
    try {
      const deptCustom = localStorage.getItem(`muin_permissions_dept_${deptKey}`);
      if (deptCustom) {
        return JSON.parse(deptCustom);
      }
    } catch {}
  }

  // 4. If user is Admin / Staff / Management, return ALL system pages
  if (isSuperAdminUser(user)) {
    return ALL_SYSTEM_PAGES.map(p => p.route);
  }

  // 5. Fallback to default preset by department
  for (const [key, allowedRoutes] of Object.entries(DEPARTMENT_DEFAULT_PRESETS)) {
    if (deptKey.includes(key)) {
      return allowedRoutes;
    }
  }

  return ['/services', '/self-service', '/tasks'];
};

export const isPageAllowedForUser = (user: any, routePath: string): boolean => {
  if (!user) return false;

  const allowedRoutes = getPermissionsForUser(user);
  
  // Exact match or sub-route match
  return allowedRoutes.some(allowed => {
    if (allowed === routePath) return true;
    if (allowed !== '/' && routePath.startsWith(allowed + '/')) return true;
    return false;
  });
};
