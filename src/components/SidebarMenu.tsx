import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SidebarMenu.css';

const SidebarMenu: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

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
        <span className="fs-4 fw-bold text-dark">Muini <span className="text-primary-green">Admin</span></span>
      </NavLink>
      
      <p className="menu-label text-muted text-uppercase fw-bold mb-2">Main Menu</p>
      
      <ul className="nav nav-pills flex-column mb-auto gap-2" style={{ flex: 1 }}>
        <li className="nav-item">
          <NavLink to="/services" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`}>
            <i className="fas fa-tachometer-alt nav-icon"></i> Dashboard
          </NavLink>
        </li>

        
        <li className="nav-item">
          <NavLink to="/tasks" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`}>
            <i className="fas fa-tasks nav-icon"></i> Office Tasks
          </NavLink>
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
