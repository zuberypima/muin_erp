import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import muinLogo from '../assets/muin-logo.png';
import './SidebarMenu.css';

interface SidebarMenuProps {
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ isOpen, setIsOpen }) => {
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

  const closeSidebarOnMobile = () => {
    if (setIsOpen && window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const isSuperAdmin = user?.is_staff || user?.department === 'Management';
  const dept = user?.department;

  const showHR = isSuperAdmin || dept === 'HR';
  const showFinance = isSuperAdmin || dept === 'Finance';
  const showIT = isSuperAdmin || dept === 'IT';
  const showProcurement = isSuperAdmin || dept === 'Logistics' || dept === 'Farm Operations';
  const showUsers = isSuperAdmin || dept === 'HR' || dept === 'IT';

  const getDashboardRoute = () => {
    if (isSuperAdmin) return '/services';
    if (dept === 'IT') return '/it';
    if (dept === 'HR') return '/hr';
    if (dept === 'Finance') return '/finance';
    if (dept === 'Logistics' || dept === 'Farm Operations' || dept === 'Procurement') return '/procurement';
    return '/self-service';
  };

  const getDashboardLabel = () => {
    if (isSuperAdmin) return 'Executive Dashboard';
    if (dept) return `${dept} Dashboard`;
    return 'My Dashboard';
  };

  return (
    <div id="side-menu" className={`flex-shrink-0 ${isOpen ? 'show' : ''}`}>
      <div className="sidebar-header position-relative">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <NavLink to="/" onClick={closeSidebarOnMobile} className="d-flex align-items-center text-decoration-none">
            <img src={muinLogo} alt="Logo" style={{ height: '40px', width: 'auto', objectFit: 'contain' }} className="me-2" />
            <span className="fs-4 fw-bold text-dark">MUIN <span className="text-primary-green"> Ltd</span></span>
          </NavLink>
        </div>
        {/* Mobile Close Button */}
        <button 
          className="btn btn-sm btn-light d-md-none border-0 shadow-none text-muted position-absolute" 
          style={{ top: '15px', right: '15px' }}
          onClick={() => setIsOpen && setIsOpen(false)}
        >
          <i className="fas fa-times fs-5"></i>
        </button>
        <p className="menu-label text-muted text-uppercase fw-bold mb-0 mt-3">Main Menu</p>
      </div>

      <div className="sidebar-body">
        <ul className="nav nav-pills flex-column gap-2">
          <li className="nav-item">
            <NavLink 
              to={getDashboardRoute()} 
              end={getDashboardRoute() !== '/services'}
              className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`}
              onClick={closeSidebarOnMobile}
            >
              <i className="fas fa-tachometer-alt nav-icon"></i> <span>{getDashboardLabel()}</span>
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
            <i className={`fas fa-chevron-${tasksDropdownOpen ? 'down' : 'right'} ms-auto dropdown-chevron`} style={{ fontSize: '0.8rem' }}></i>
          </div>

          {tasksDropdownOpen && (
            <ul className="nav flex-column ps-3 mt-1 gap-1" style={{ listStyle: 'none' }}>
              <li className="nav-item">
                <NavLink to="/tasks" end className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                  <i className="fas fa-clipboard-list nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Board</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tasks/approvals" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                  <i className="fas fa-check-circle nav-icon" style={{ color: '#7c3aed', fontSize: '0.9rem' }}></i> <span>Approvals</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink to="/tasks/assist" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
                  <i className="fas fa-life-ring nav-icon" style={{ color: '#ea580c', fontSize: '0.9rem' }}></i> <span>Assistance</span>
                </NavLink>
              </li>
            </ul>
          )}
        </li>

        <li className="nav-item">
          <NavLink to="/self-service" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`}>
            <i className="fas fa-user-circle nav-icon"></i> <span>Self Service Hub</span>
          </NavLink>
        </li>

        {showUsers && (
          <li className="nav-item">
            <NavLink to="/erp-users" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`}>
              <i className="fas fa-user-tie nav-icon"></i> <span>ERP Users</span>
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
              <i className={`fas fa-chevron-${financeDropdownOpen ? 'down' : 'right'} ms-auto dropdown-chevron`} style={{ fontSize: '0.8rem' }}></i>
            </div>
            {financeDropdownOpen && (
              <ul className="nav flex-column ps-3 mt-1 gap-1" style={{ listStyle: 'none' }}>
                <li className="nav-item">
                  <NavLink to="/finance" end className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-chart-pie nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Overview</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/finance/income" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-arrow-circle-down nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Income</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/finance/expenses" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-arrow-circle-up nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Expenses</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/finance/transactions" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-exchange-alt nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Transactions</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/finance/budgets" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-wallet nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Budgets</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/finance/loans" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-hand-holding-usd nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Loans</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/finance/cashflow" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-water nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Cashflow</span>
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
              <i className={`fas fa-chevron-${hrDropdownOpen ? 'down' : 'right'} ms-auto dropdown-chevron`} style={{ fontSize: '0.8rem' }}></i>
            </div>
            {hrDropdownOpen && (
              <ul className="nav flex-column ps-3 mt-1 gap-1" style={{ listStyle: 'none' }}>
                <li className="nav-item">
                  <NavLink to="/hr" end className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-th-large nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Overview</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/hr/employees" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-users nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Employees</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/hr/attendance" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-calendar-check nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Attendance</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/hr/leaves" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-umbrella-beach nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Leaves</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/hr/performance" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-star nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Performance</span>
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
              <i className={`fas fa-chevron-${procurementDropdownOpen ? 'down' : 'right'} ms-auto dropdown-chevron`} style={{ fontSize: '0.8rem' }}></i>
            </div>
            {procurementDropdownOpen && (
              <ul className="nav flex-column ps-3 mt-1 gap-1" style={{ listStyle: 'none' }}>
                <li className="nav-item">
                  <NavLink to="/procurement" end className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-chart-bar nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Overview</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/procurement/purchase-requests" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-file-alt nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Requests</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/procurement/purchase-orders" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-shopping-cart nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Orders</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/procurement/goods-receiving" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-truck-loading nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Receiving</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/procurement/inventory" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-boxes nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Inventory</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/procurement/stock-tracking" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-exchange-alt nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Stock Tracking</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/procurement/assets" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-laptop nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Assets</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/procurement/reports" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-chart-pie nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Reports</span>
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
              <i className={`fas fa-chevron-${itDropdownOpen ? 'down' : 'right'} ms-auto dropdown-chevron`} style={{ fontSize: '0.8rem' }}></i>
            </div>
            {itDropdownOpen && (
              <ul className="nav flex-column ps-3 mt-1 gap-1" style={{ listStyle: 'none' }}>
                <li className="nav-item">
                  <NavLink to="/it" end className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-th-large nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Overview</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/it/assets" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-laptop nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>IT Assets</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/it/user-accounts" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-user-shield nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>User Accounts</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/it/support-tickets" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-headset nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Help Desk</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/it/maintenance" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-tools nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Maintenance</span>
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink to="/it/software-licenses" className={({ isActive }) => `nav-link custom-nav-link ${isActive ? 'active' : ''}`} style={{ paddingLeft: '1.5rem', fontSize: '0.88rem' }}>
                    <i className="fas fa-key nav-icon" style={{ fontSize: '0.9rem' }}></i> <span>Licenses</span>
                  </NavLink>
                </li>
              </ul>
            )}
          </li>
        )}
        </ul>
      </div>

      <div className="sidebar-footer">
        <ul className="nav flex-column gap-2" style={{ paddingLeft: 0 }}>
          <li className="nav-item">
            <a href="#" className="nav-link custom-nav-link">
              <i className="fas fa-cog nav-icon"></i> <span>Settings</span>
            </a>
          </li>
          <li className="nav-item">
            <a href="#" onClick={handleLogout} className="nav-link custom-nav-link logout-btn">
              <i className="fas fa-sign-out-alt nav-icon"></i> <span>Logout</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SidebarMenu;

