import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './HR.css';

const HRLayout: React.FC = () => {
  const tabs = [
    { to: '/hr',            label: 'Overview',    icon: 'fas fa-th-large',     end: true },
    { to: '/hr/employees',  label: 'Employees',   icon: 'fas fa-users' },
    { to: '/hr/attendance', label: 'Attendance',  icon: 'fas fa-calendar-check' },
    { to: '/hr/leaves',     label: 'Leaves',      icon: 'fas fa-umbrella-beach' },
    { to: '/hr/performance',label: 'Performance', icon: 'fas fa-star' },
  ];

  return (
    <div className="hr-page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">HR Management</h2>
          <p className="text-muted mb-0">Manage employees, attendance, and performance.</p>
        </div>
      </div>
      <nav className="hr-subnav mb-4">
        {tabs.map(t => (
          <NavLink key={t.to} to={t.to} end={t.end}
            className={({ isActive }) => `hr-subnav-link ${isActive ? 'active' : ''}`}>
            <i className={t.icon}></i>{t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
};

export default HRLayout;
