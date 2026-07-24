import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../Procurement/Procurement.css';

const LogisticsLayout: React.FC = () => {
  const { user } = useAuth();
  const todayFormatted = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const navItems = [
    { to: '/logistics', label: 'Port Overview', icon: 'fas fa-anchor', end: true },
    { to: '/logistics/inventory', label: 'Container Yard Stock', icon: 'fas fa-boxes' },
    { to: '/logistics/stock-tracking', label: 'Vessel Voyages', icon: 'fas fa-ship' },
    { to: '/logistics/dispatches', label: 'B/L & Dispatches', icon: 'fas fa-file-invoice' },
    { to: '/logistics/assets', label: 'Marine Fleet & Cranes', icon: 'fas fa-truck-loading' },
    { to: '/logistics/reports', label: 'Shipping TEU Reports', icon: 'fas fa-chart-pie' },
  ];

  const displayName = user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : (user?.username || 'Marine Logistics Manager');

  return (
    <div className="procurement-page fade-in">
      {/* Header Banner */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1" style={{ fontSize: '0.75rem' }}>
              <i className="fas fa-ship me-1"></i>MARITIME &amp; CONTAINER SHIPPING
            </span>
          </div>
          <h2 className="fw-bold text-dark mb-1 mt-1">MARINE LOGISTICS &amp; PORT OPERATIONS</h2>
          <p className="text-muted mb-0 small"><i className="far fa-calendar-alt me-1"></i>{todayFormatted}</p>
        </div>

        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center gap-2.5 p-2 px-3 bg-white border rounded-3 shadow-sm" style={{ borderRadius: '12px' }}>
            <div className="avatar bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: '38px', height: '38px', fontSize: '0.95rem' }}>
              <i className="fas fa-anchor"></i>
            </div>
            <div>
              <p className="mb-0 fw-bold fs-6 lh-1 text-dark">{displayName}</p>
              <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                {user?.is_staff ? 'Super Admin / Port Controller' : (user?.department ? `${user.department} Department` : 'Marine Shipping Superintendent')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Subnav Navigation */}
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
