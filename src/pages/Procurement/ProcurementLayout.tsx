import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './Procurement.css';

const ProcurementLayout: React.FC = () => {
  const navItems = [
    { to: '/procurement', label: 'Overview',          icon: 'fas fa-chart-bar',       end: true },
    { to: '/procurement/purchase-requests', label: 'Purchase Requests', icon: 'fas fa-file-alt' },
    { to: '/procurement/purchase-orders',   label: 'Purchase Orders',   icon: 'fas fa-shopping-cart' },
    { to: '/procurement/goods-receiving',   label: 'Goods Receiving',   icon: 'fas fa-truck-loading' },
    { to: '/procurement/inventory',         label: 'Inventory',         icon: 'fas fa-boxes' },
    { to: '/procurement/stock-tracking',    label: 'Stock Tracking',    icon: 'fas fa-exchange-alt' },
    { to: '/procurement/assets',            label: 'Assets',            icon: 'fas fa-laptop' },
    { to: '/procurement/reports',           label: 'Reports',           icon: 'fas fa-chart-pie' },
  ];

  return (
    <div className="procurement-page">
      <div className="proc-header">
        <div>
          <h2>Procurement &amp; Inventory</h2>
          <p>Manage purchases, stock, and assets across your organization.</p>
        </div>
      </div>

      <nav className="procurement-subnav mb-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `procurement-subnav-link ${isActive ? 'active' : ''}`}
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

export default ProcurementLayout;
