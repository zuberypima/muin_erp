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

// Logistics Module
import LogisticsLayout from './pages/Logistics/LogisticsLayout';
import LogisticsDashboard from './pages/Logistics/LogisticsDashboard';
import LogisticsInventory from './pages/Logistics/LogisticsInventory';
import LogisticsMovements from './pages/Logistics/LogisticsMovements';
import LogisticsDispatches from './pages/Logistics/LogisticsDispatches';
import LogisticsFleet from './pages/Logistics/LogisticsFleet';
import LogisticsReports from './pages/Logistics/LogisticsReports';

// Records & Asset Management Module
import AssetsLayout from './pages/Assets/AssetsLayout';
import AssetsDashboard from './pages/Assets/AssetsDashboard';
import AssetRegister from './pages/Assets/AssetRegister';
import AssetMaintenance from './pages/Assets/AssetMaintenance';
import AssetTransfers from './pages/Assets/AssetTransfers';
import AssetRecords from './pages/Assets/AssetRecords';
import AssetReports from './pages/Assets/AssetReports';

import { resolveDepartmentRoute } from './utils/departmentUtils';

const RootRedirect = () => {
  const { user, userLoading } = useAuth();

  if (userLoading || (!user && localStorage.getItem('access_token'))) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading department dashboard...</span>
        </div>
      </div>
    );
  }

  const targetRoute = resolveDepartmentRoute(user);
  return <Navigate to={targetRoute} replace />;
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
                <Route path="tasks" element={<TaskBoard />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="leaves" element={<Leaves />} />
                <Route path="performance" element={<Performance />} />
              </Route>

              {/* Procurement & Purchasing Module */}
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

              {/* Logistics & Supply Module */}
              <Route path="logistics" element={<LogisticsLayout />}>
                <Route index element={<LogisticsDashboard />} />
                <Route path="inventory" element={<LogisticsInventory />} />
                <Route path="stock-tracking" element={<LogisticsMovements />} />
                <Route path="dispatches" element={<LogisticsDispatches />} />
                <Route path="assets" element={<LogisticsFleet />} />
                <Route path="reports" element={<LogisticsReports />} />
              </Route>

              {/* Records & Asset Management Module */}
              <Route path="assets" element={<AssetsLayout />}>
                <Route index element={<AssetsDashboard />} />
                <Route path="register" element={<AssetRegister />} />
                <Route path="maintenance" element={<AssetMaintenance />} />
                <Route path="transfers" element={<AssetTransfers />} />
                <Route path="records" element={<AssetRecords />} />
                <Route path="reports" element={<AssetReports />} />
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
