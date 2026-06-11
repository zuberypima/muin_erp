import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SidebarMenu.css';

const SidebarMenu: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isTasksRoute = location.pathname.startsWith('/tasks');
  const [tasksDropdownOpen, setTasksDropdownOpen] = useState(isTasksRoute);

  useEffect(() => {
    if (isTasksRoute) {
      setTasksDropdownOpen(true);
    }
  }, [location.pathname, isTasksRoute]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  return (
    <div id="side-menu" className="d-flex flex-column flex-shrink-0 p-4">
      <NavLink to="/" className="d-flex align-items-center mb-4 text-decoration-none">
        <div className="logo-icon me-2">
          <i className="fas fa-leaf"></i>
        </div>
        <span className="fs-4 fw-bold text-dark">MUIN <span className="text-primary-green"> Ltd</span></span>
      </NavLink>

      <p className="menu-label text-muted text-uppercase fw-bold mb-2">Main Menu</p>

      <ul className="nav nav-pills flex-column mb-auto gap-2" style={{ flex: 1 }}>
        <li className="nav-item">
          <NavLink to="/services" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`}>
            <i className="fas fa-tachometer-alt nav-icon"></i> Dashboard
          </NavLink>
        </li>


        <li className="nav-item">
          <div
            className={`nav-link custom-nav-link d-flex align-items-center justify-content-between ${isTasksRoute ? 'active' : ''}`}
            style={{ cursor: 'pointer' }}
            onClick={() => setTasksDropdownOpen(!tasksDropdownOpen)}
          >
            <div className="d-flex align-items-center">
              <i className="fas fa-tasks nav-icon"></i>
              <span>Office Tasks</span>
            </div>
            <i className={`fas fa-chevron-${tasksDropdownOpen ? 'down' : 'right'} ms-auto`} style={{ fontSize: '0.8rem' }}></i>
          </div>

          {tasksDropdownOpen && (
            <ul className="nav flex-column ps-3 mt-1 gap-1" style={{ listStyle: 'none' }}>
              <li className="nav-item">
                <NavLink to="/tasks" end className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                  <i className="fas fa-clipboard-list nav-icon" style={{ fontSize: '0.9rem' }}></i> Board
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tasks/approvals" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                  <i className="fas fa-check-circle nav-icon" style={{ color: '#7c3aed', fontSize: '0.9rem' }}></i> Approvals
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tasks/assist" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                  <i className="fas fa-life-ring nav-icon" style={{ color: '#ea580c', fontSize: '0.9rem' }}></i> Assistance
                </NavLink>
              </li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <NavLink to="/erp-users" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`}>
            <i className="fas fa-user-tie nav-icon"></i> ERP Users
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/finance" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`}>
            <i className="fas fa-chart-pie nav-icon"></i> Finance
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/hr" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`}>
            <i className="fas fa-users-cog nav-icon"></i> HR Management
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/procurement" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`}>
            <i className="fas fa-boxes nav-icon"></i> Procurement
          </NavLink>
        </li>
        <li className="my-3"><hr className="sidebar-divider" /></li>

        <p className="menu-label text-muted text-uppercase fw-bold mb-2">Support & Tools</p>

        <li className="nav-item">
          <a href="#" className="nav-link custom-nav-link">
            <i className="fas fa-comments nav-icon"></i> Customer Support
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link custom-nav-link">
            <i className="fas fa-cloud-sun nav-icon"></i> Weather Info
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link custom-nav-link">
            <i className="fas fa-hand-holding-usd nav-icon"></i> Loan Management
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link custom-nav-link">
            <i className="fas fa-shield-alt nav-icon"></i> Insurance
          </a>
        </li>
        <li className="nav-item">
          <a href="#" className="nav-link custom-nav-link">
            <i className="fas fa-cog nav-icon"></i> Settings
          </a>
        </li>
        <li className="nav-item mt-auto">
          <a href="#" onClick={handleLogout} className="nav-link custom-nav-link logout-btn">
            <i className="fas fa-sign-out-alt nav-icon"></i> Logout
          </a>
        </li>
      </ul>
    </div>
  );
};

export default SidebarMenu;
