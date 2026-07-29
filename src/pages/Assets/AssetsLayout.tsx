import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isPageAllowedForUser, isModuleAllowedForUser } from '../../utils/permissionsUtils';
import { resolveDepartmentRoute } from '../../utils/departmentUtils';
import '../Procurement/Procurement.css';

const AssetsLayout: React.FC = () => {
  const { user } = useAuth();
  const todayFormatted = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const isAuthorized = isModuleAllowedForUser(user, 'assets');

  if (user && !isAuthorized) {
    const fallbackRoute = resolveDepartmentRoute(user);
    return <Navigate to={fallbackRoute} replace />;
  }

  const navItems = [
    { to: '/assets', label: 'Overview', icon: 'fas fa-chart-bar', end: true },
    { to: '/assets/register', label: 'Asset Register', icon: 'fas fa-boxes' },
    { to: '/assets/maintenance', label: 'Maintenance & Service', icon: 'fas fa-tools' },
    { to: '/assets/transfers', label: 'Custody Transfers', icon: 'fas fa-exchange-alt' },
    { to: '/assets/records', label: 'Document Records', icon: 'fas fa-folder-open' },
    { to: '/assets/reports', label: 'Valuation & Audits', icon: 'fas fa-chart-pie' },
  ];

  const visibleNavItems = navItems.filter(item => isPageAllowedForUser(user, item.to));

  const displayName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.username || 'Asset Manager');

  return (
    <div className="procurement-page fade-in">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1" style={{ fontSize: '0.75rem' }}>
              <i className="fas fa-cubes me-1"></i>RECORDS &amp; ASSET MANAGEMENT
            </span>
          </div>
          <h2 className="fw-bold text-dark mb-1 mt-1">RECORDS &amp; ASSET MANAGEMENT</h2>
          <p className="text-muted mb-0 small"><i className="far fa-calendar-alt me-1"></i>{todayFormatted}</p>
        </div>

        <div className="d-flex align-items-center">
          <div className="header-user-badge">
            <div className="avatar bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold">
              <i className="fas fa-archive"></i>
            </div>
            <div className="header-user-badge-text">
              <p className="header-user-badge-title">{displayName}</p>
              <p className="header-user-badge-sub">
                {user?.is_staff ? 'Super Admin / Manager' : (user?.department ? `${user.department} Department` : 'Asset & Records Officer')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subnav Navigation */}
      <nav className="procurement-subnav mb-4">
        {visibleNavItems.map((item) => (
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

export default AssetsLayout;
