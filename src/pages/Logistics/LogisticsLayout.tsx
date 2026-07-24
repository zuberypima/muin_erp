import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import '../Procurement/Procurement.css';

const LogisticsLayout: React.FC = () => {
  const navItems = [
    { to: '/logistics', label: 'Overview', icon: 'fas fa-chart-bar', end: true },
    { to: '/logistics/inventory', label: 'Inventory & Stock', icon: 'fas fa-boxes' },
    { to: '/logistics/stock-tracking', label: 'Stock Movements', icon: 'fas fa-exchange-alt' },
    { to: '/logistics/assets', label: 'Fleet & Assets', icon: 'fas fa-truck-loading' },
    { to: '/logistics/receiving', label: 'Goods Receiving', icon: 'fas fa-shipping-fast' },
    { to: '/logistics/reports', label: 'Logistics Reports', icon: 'fas fa-chart-pie' },
  ];

  return (
    <div className="procurement-page fade-in">
      <div className="proc-header">
        <div>
          <h2>Logistics &amp; Supply Chain</h2>
          <p>Manage warehouse inventory, stock tracking, and organizational assets.</p>
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

export default LogisticsLayout;
