import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './IT.css';

const ITLayout: React.FC = () => {
  const tabs = [
    { to: '/it',                    label: 'Overview',          icon: 'fas fa-th-large',      end: true },
    { to: '/it/assets',             label: 'IT Assets',         icon: 'fas fa-laptop'                   },
    { to: '/it/user-accounts',      label: 'User Accounts',     icon: 'fas fa-user-shield'              },
    { to: '/it/support-tickets',    label: 'Help Desk',         icon: 'fas fa-headset'                  },
    { to: '/it/maintenance',        label: 'Maintenance',       icon: 'fas fa-tools'                    },
    { to: '/it/software-licenses',  label: 'Licenses',          icon: 'fas fa-key'                      },
  ];

  return (
    <div className="it-page">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Information Technology</h2>
          <p className="text-muted mb-0">Manage IT assets, accounts, tickets, maintenance, and software licenses.</p>
        </div>
      </div>

      <nav className="it-subnav mb-4">
        {tabs.map(t => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) => `it-subnav-link ${isActive ? 'active' : ''}`}
          >
            <i className={t.icon}></i>{t.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </div>
  );
};

export default ITLayout;
