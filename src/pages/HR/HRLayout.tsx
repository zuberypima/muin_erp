import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './HR.css';

const HRLayout: React.FC = () => {
  const { user } = useAuth();
  const todayFormatted = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const tabs = [
    { to: '/hr',            label: 'Overview',    icon: 'fas fa-th-large',     end: true },
    { to: '/hr/employees',  label: 'Employees',   icon: 'fas fa-users' },
    { to: '/hr/tasks',      label: 'Staff Tasks', icon: 'fas fa-tasks' },
    { to: '/hr/attendance', label: 'Attendance',  icon: 'fas fa-calendar-check' },
    { to: '/hr/leaves',     label: 'Leaves',      icon: 'fas fa-umbrella-beach' },
    { to: '/hr/performance',label: 'Performance', icon: 'fas fa-star' },
  ];

  const displayName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.username || 'HR Staff');

  return (
    <div className="hr-page fade-in">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">HR MANAGEMENT</h2>
          <p className="text-muted mb-0 small">{todayFormatted}</p>
        </div>
        
        {/* Dynamic User Profile & Date Capture */}
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2.5 p-2 px-3 bg-white border rounded-3 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="avatar bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '38px', height: '38px', fontSize: '0.95rem' }}>
              <i className="fas fa-user-tie"></i>
            </div>
            <div>
              <p className="mb-0 fw-bold fs-6 lh-1 text-dark">{displayName}</p>
              <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                {user?.is_staff ? 'Super Admin / Manager' : (user?.department ? `${user.department} Department` : 'HR Officer')}
              </p>
            </div>
          </div>
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
