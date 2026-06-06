import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import ServicePage from './pages/ServicePage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
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

// HR Module
import HRLayout from './pages/HR/HRLayout';
import HRDashboard from './pages/HR/HRDashboard';
import Employees from './pages/HR/Employees';
import Attendance from './pages/HR/Attendance';
import Leaves from './pages/HR/Leaves';
import Performance from './pages/HR/Performance';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AdminDashboard />}>
              <Route index element={<Navigate to="/services" replace />} />
              <Route path="services" element={<ServicePage />} />
              <Route path="tasks" element={<TaskBoard />} />
              <Route path="tasks/approvals" element={<RequestsInbox mode="approval" />} />
              <Route path="tasks/assist" element={<RequestsInbox mode="assist" />} />
              <Route path="erp-users" element={<ERPUsers />} />
              
              {/* Finance Module */}
              <Route path="finance" element={<FinanceLayout />}>
                <Route index element={<FinanceDashboard />} />
                <Route path="income" element={<Income />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="budgets" element={<Budgets />} />
                <Route path="loans" element={<Loans />} />
              </Route>

              {/* HR Module */}
              <Route path="hr" element={<HRLayout />}>
                <Route index element={<HRDashboard />} />
                <Route path="employees" element={<Employees />} />
                <Route path="attendance" element={<Attendance />} />
                <Route path="leaves" element={<Leaves />} />
                <Route path="performance" element={<Performance />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
