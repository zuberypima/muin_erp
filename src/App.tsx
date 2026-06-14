import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import ServicePage from './pages/ServicePage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import TaskBoard from './pages/Tasks/TaskBoard';
import RequestsInbox from './pages/Tasks/RequestsInbox';
import ERPUsers from './pages/ERPUsers.tsx';
import FinanceLayout from './pages/Finance/FinanceLayout';
import FinanceDashboard from './pages/Finance/FinanceDashboard';
import Income from './pages/Finance/Income';
import Expenses from './pages/Finance/Expenses';
import Transactions from './pages/Finance/Transactions';
import Budgets from './pages/Finance/Budgets';
import Loans from './pages/Finance/Loans';
import CashFlow from './pages/Finance/CashFlow';
import SelfService from './pages/SelfService/SelfService';

// HR Module
import HRLayout from './pages/HR/HRLayout';
import HRDashboard from './pages/HR/HRDashboard';
import Employees from './pages/HR/Employees';
import Attendance from './pages/HR/Attendance';
import Leaves from './pages/HR/Leaves';
import Performance from './pages/HR/Performance';

// Procurement & Inventory Module
import ProcurementLayout from './pages/Procurement/ProcurementLayout';
import ProcurementDashboard from './pages/Procurement/ProcurementDashboard';
import PurchaseRequests from './pages/Procurement/PurchaseRequests';
import PurchaseOrders from './pages/Procurement/PurchaseOrders';
import GoodsReceiving from './pages/Procurement/GoodsReceiving';
import Inventory from './pages/Procurement/Inventory';
import StockTracking from './pages/Procurement/StockTracking';
import Assets from './pages/Procurement/Assets';
import InventoryReports from './pages/Procurement/InventoryReports';

// IT Module
import ITLayout from './pages/IT/ITLayout';
import ITDashboard from './pages/IT/ITDashboard';
import ITAssets from './pages/IT/ITAssets';
import UserAccounts from './pages/IT/UserAccounts';
import SupportTickets from './pages/IT/SupportTickets';
import MaintenanceRecords from './pages/IT/MaintenanceRecords';
import SoftwareLicenses from './pages/IT/SoftwareLicenses';

const RootRedirect = () => {
  const { user } = useAuth();
  const isSuperAdmin = user?.is_staff || user?.department === 'Management';
  const dept = user?.department;

  if (isSuperAdmin) return <Navigate to="/services" replace />;
  if (dept === 'IT') return <Navigate to="/it" replace />;
  if (dept === 'HR') return <Navigate to="/hr" replace />;
  if (dept === 'Finance') return <Navigate to="/finance" replace />;
  if (dept === 'Logistics' || dept === 'Farm Operations') return <Navigate to="/procurement" replace />;

  return <Navigate to="/self-service" replace />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AdminDashboard />}>
              <Route index element={<RootRedirect />} />
              <Route path="services" element={<ServicePage />} />
              <Route path="tasks" element={<TaskBoard />} />
              <Route path="tasks/approvals" element={<RequestsInbox mode="approval" />} />
              <Route path="tasks/assist" element={<RequestsInbox mode="assist" />} />
              <Route path="erp-users" element={<ERPUsers />} />
              <Route path="self-service" element={<SelfService />} />
              
              {/* Finance Module */}
              <Route path="finance" element={<FinanceLayout />}>
                <Route index element={<FinanceDashboard />} />
                <Route path="income" element={<Income />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="budgets" element={<Budgets />} />
                <Route path="loans" element={<Loans />} />
                <Route path="cashflow" element={<CashFlow />} />
              </Route>

              {/* HR Module */}
              <Route path="hr" element={<HRLayout />}>
                <Route index element={<HRDashboard />} />
                <Route path="employees" element={<Employees />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="leaves" element={<Leaves />} />
                <Route path="performance" element={<Performance />} />
              </Route>

              {/* Procurement & Inventory Module */}
              <Route path="procurement" element={<ProcurementLayout />}>
                <Route index element={<ProcurementDashboard />} />
                <Route path="purchase-requests" element={<PurchaseRequests />} />
                <Route path="purchase-orders" element={<PurchaseOrders />} />
                <Route path="goods-receiving" element={<GoodsReceiving />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="stock-tracking" element={<StockTracking />} />
                <Route path="assets" element={<Assets />} />
                <Route path="reports" element={<InventoryReports />} />
              </Route>

              {/* IT Module */}
              <Route path="it" element={<ITLayout />}>
                <Route index element={<ITDashboard />} />
                <Route path="assets" element={<ITAssets />} />
                <Route path="user-accounts" element={<UserAccounts />} />
                <Route path="support-tickets" element={<SupportTickets />} />
                <Route path="maintenance" element={<MaintenanceRecords />} />
                <Route path="software-licenses" element={<SoftwareLicenses />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
