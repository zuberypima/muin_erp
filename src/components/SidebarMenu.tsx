import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './SidebarMenu.css';

const SidebarMenu: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isTasksRoute = location.pathname.startsWith('/tasks');
  const [tasksDropdownOpen, setTasksDropdownOpen] = useState(isTasksRoute);

  const isHRRoute = location.pathname.startsWith('/hr');
  const [hrDropdownOpen, setHrDropdownOpen] = useState(isHRRoute);

  const isFinanceRoute = location.pathname.startsWith('/finance');
  const [financeDropdownOpen, setFinanceDropdownOpen] = useState(isFinanceRoute);

  const isProcurementRoute = location.pathname.startsWith('/procurement');
  const [procurementDropdownOpen, setProcurementDropdownOpen] = useState(isProcurementRoute);

  const isITRoute = location.pathname.startsWith('/it');
  const [itDropdownOpen, setItDropdownOpen] = useState(isITRoute);

  useEffect(() => {
    if (isTasksRoute) setTasksDropdownOpen(true);
    if (isHRRoute) setHrDropdownOpen(true);
    if (isFinanceRoute) setFinanceDropdownOpen(true);
    if (isProcurementRoute) setProcurementDropdownOpen(true);
    if (isITRoute) setItDropdownOpen(true);
  }, [location.pathname, isTasksRoute, isHRRoute, isFinanceRoute, isProcurementRoute, isITRoute]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const isSuperAdmin = user?.is_staff || user?.department === 'Management';
  const dept = user?.department;

  const showHR = isSuperAdmin || dept === 'HR';
  const showFinance = isSuperAdmin || dept === 'Finance';
  const showIT = isSuperAdmin || dept === 'IT';
  const showProcurement = isSuperAdmin || dept === 'Logistics' || dept === 'Farm Operations';
  const showUsers = isSuperAdmin || dept === 'HR' || dept === 'IT';

  return (
    <div id="side-menu" className="d-flex flex-column flex-shrink-0 p-4">
      <NavLink to="/" className="d-flex align-items-center mb-4 text-decoration-none">
        <div className="logo-icon me-2">
          <i className="fas fa-leaf"></i>
        </div>
        <span className="fs-4 fw-bold text-dark">MUIN <span className="text-primary-green"> Ltd</span></span>
      </NavLink>

      <p className="menu-label text-muted text-uppercase fw-bold mb-2">Main Menu</p>

      <ul className="nav nav-pills flex-column mb-auto gap-2" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {isSuperAdmin && (
          <li className="nav-item">
            <NavLink to="/services" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`}>
              <i className="fas fa-tachometer-alt nav-icon"></i> Dashboard
            </NavLink>
          </li>
        )}


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
          <NavLink to="/self-service" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`}>
            <i className="fas fa-user-circle nav-icon"></i> Self Service Hub
          </NavLink>
        </li>

        {showUsers && (
          <li className="nav-item">
            <NavLink to="/erp-users" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`}>
              <i className="fas fa-user-tie nav-icon"></i> ERP Users
            </NavLink>
          </li>
        )}

        {showFinance && (
          <li className="nav-item">
            <div
              className={`nav-link custom-nav-link d-flex align-items-center justify-content-between ${isFinanceRoute ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setFinanceDropdownOpen(!financeDropdownOpen)}
            >
              <div className="d-flex align-items-center">
                <i className="fas fa-chart-pie nav-icon"></i>
                <span>Finance</span>
              </div>
              <i className={`fas fa-chevron-${financeDropdownOpen ? 'down' : 'right'} ms-auto`} style={{ fontSize: '0.8rem' }}></i>
            </div>
            {financeDropdownOpen && (
              <ul className="nav flex-column ps-3 mt-1 gap-1" style={{ listStyle: 'none' }}>
                <li className="nav-item">
                  <NavLink to="/finance" end className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-chart-pie nav-icon" style={{ fontSize: '0.9rem' }}></i> Overview
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/finance/income" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-arrow-circle-down nav-icon" style={{ fontSize: '0.9rem' }}></i> Income
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/finance/expenses" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-arrow-circle-up nav-icon" style={{ fontSize: '0.9rem' }}></i> Expenses
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/finance/transactions" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-exchange-alt nav-icon" style={{ fontSize: '0.9rem' }}></i> Transactions
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/finance/budgets" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-wallet nav-icon" style={{ fontSize: '0.9rem' }}></i> Budgets
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/finance/loans" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-hand-holding-usd nav-icon" style={{ fontSize: '0.9rem' }}></i> Loans
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/finance/cashflow" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-water nav-icon" style={{ fontSize: '0.9rem' }}></i> Cashflow
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        )}

        {showHR && (
          <li className="nav-item">
            <div
              className={`nav-link custom-nav-link d-flex align-items-center justify-content-between ${isHRRoute ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setHrDropdownOpen(!hrDropdownOpen)}
            >
              <div className="d-flex align-items-center">
                <i className="fas fa-users-cog nav-icon"></i>
                <span>HR Management</span>
              </div>
              <i className={`fas fa-chevron-${hrDropdownOpen ? 'down' : 'right'} ms-auto`} style={{ fontSize: '0.8rem' }}></i>
            </div>
            {hrDropdownOpen && (
              <ul className="nav flex-column ps-3 mt-1 gap-1" style={{ listStyle: 'none' }}>
                <li className="nav-item">
                  <NavLink to="/hr" end className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-th-large nav-icon" style={{ fontSize: '0.9rem' }}></i> Overview
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/hr/employees" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-users nav-icon" style={{ fontSize: '0.9rem' }}></i> Employees
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/hr/attendance" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-calendar-check nav-icon" style={{ fontSize: '0.9rem' }}></i> Attendance
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/hr/leaves" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-umbrella-beach nav-icon" style={{ fontSize: '0.9rem' }}></i> Leaves
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/hr/performance" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-star nav-icon" style={{ fontSize: '0.9rem' }}></i> Performance
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        )}

        {showProcurement && (
          <li className="nav-item">
            <div
              className={`nav-link custom-nav-link d-flex align-items-center justify-content-between ${isProcurementRoute ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setProcurementDropdownOpen(!procurementDropdownOpen)}
            >
              <div className="d-flex align-items-center">
                <i className="fas fa-boxes nav-icon"></i>
                <span>Procurement</span>
              </div>
              <i className={`fas fa-chevron-${procurementDropdownOpen ? 'down' : 'right'} ms-auto`} style={{ fontSize: '0.8rem' }}></i>
            </div>
            {procurementDropdownOpen && (
              <ul className="nav flex-column ps-3 mt-1 gap-1" style={{ listStyle: 'none' }}>
                <li className="nav-item">
                  <NavLink to="/procurement" end className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-chart-bar nav-icon" style={{ fontSize: '0.9rem' }}></i> Overview
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/procurement/purchase-requests" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-file-alt nav-icon" style={{ fontSize: '0.9rem' }}></i> Requests
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/procurement/purchase-orders" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-shopping-cart nav-icon" style={{ fontSize: '0.9rem' }}></i> Orders
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/procurement/goods-receiving" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-truck-loading nav-icon" style={{ fontSize: '0.9rem' }}></i> Receiving
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/procurement/inventory" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-boxes nav-icon" style={{ fontSize: '0.9rem' }}></i> Inventory
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/procurement/stock-tracking" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-exchange-alt nav-icon" style={{ fontSize: '0.9rem' }}></i> Stock Tracking
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/procurement/assets" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-laptop nav-icon" style={{ fontSize: '0.9rem' }}></i> Assets
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/procurement/reports" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-chart-pie nav-icon" style={{ fontSize: '0.9rem' }}></i> Reports
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        )}

        {showIT && (
          <li className="nav-item">
            <div
              className={`nav-link custom-nav-link d-flex align-items-center justify-content-between ${isITRoute ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setItDropdownOpen(!itDropdownOpen)}
            >
              <div className="d-flex align-items-center">
                <i className="fas fa-server nav-icon"></i>
                <span>IT Management</span>
              </div>
              <i className={`fas fa-chevron-${itDropdownOpen ? 'down' : 'right'} ms-auto`} style={{ fontSize: '0.8rem' }}></i>
            </div>
            {itDropdownOpen && (
              <ul className="nav flex-column ps-3 mt-1 gap-1" style={{ listStyle: 'none' }}>
                <li className="nav-item">
                  <NavLink to="/it" end className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-th-large nav-icon" style={{ fontSize: '0.9rem' }}></i> Overview
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/it/assets" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-laptop nav-icon" style={{ fontSize: '0.9rem' }}></i> IT Assets
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/it/user-accounts" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-user-shield nav-icon" style={{ fontSize: '0.9rem' }}></i> User Accounts
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/it/support-tickets" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-headset nav-icon" style={{ fontSize: '0.9rem' }}></i> Help Desk
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/it/maintenance" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-tools nav-icon" style={{ fontSize: '0.9rem' }}></i> Maintenance
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/it/software-licenses" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-key nav-icon" style={{ fontSize: '0.9rem' }}></i> Licenses
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        )}
        <li className="my-3"><hr className="sidebar-divider" /></li>


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

