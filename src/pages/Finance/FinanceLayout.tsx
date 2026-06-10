import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Finance.css';

const FinanceLayout: React.FC = () => {
  const navItems = [
    { to: '/finance', label: 'Overview', icon: 'fas fa-chart-pie', end: true },
    { to: '/finance/income', label: 'Income', icon: 'fas fa-arrow-circle-down' },
    { to: '/finance/expenses', label: 'Expenses', icon: 'fas fa-arrow-circle-up' },
    { to: '/finance/transactions', label: 'Transactions', icon: 'fas fa-exchange-alt' },
    { to: '/finance/budgets', label: 'Budgets', icon: 'fas fa-wallet' },
    { to: '/finance/loans', label: 'Loans', icon: 'fas fa-hand-holding-usd' },
    { to: '/finance/cashflow', label: 'Cashflow', icon: 'fas fa-water' },
  ];

  return (
    <div className="finance-page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Finance Management</h2>
          <p className="text-muted mb-0">Track, manage, and analyze your financial data.</p>
        </div>
      </div>

      <nav className="finance-subnav mb-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `finance-subnav-link ${isActive ? 'active' : ''}`}
          >
            <i className={item.icon}></i>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
};

export default FinanceLayout;
