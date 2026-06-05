import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ServicePage.css';

const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const kpis = [
  { label: 'Total Employees', value: '47', change: '+3 this month', icon: 'fas fa-users', color: 'green', trend: 'up' },
  { label: 'Monthly Revenue', value: 'TZS 84.2M', change: '+12% vs last month', icon: 'fas fa-chart-line', color: 'blue', trend: 'up' },
  { label: 'Pending Tasks', value: '18', change: '5 due today', icon: 'fas fa-tasks', color: 'orange', trend: 'neutral' },
  { label: 'Active Loans', value: '12', change: 'TZS 34.5M outstanding', icon: 'fas fa-hand-holding-usd', color: 'purple', trend: 'neutral' },
];

const modules = [
  { label: 'HR Management', icon: 'fas fa-users-cog', desc: 'Employees, Attendance, Leaves, Performance', route: '/hr', color: 'green' },
  { label: 'Finance', icon: 'fas fa-chart-pie', desc: 'Income, Expenses, Budgets, Transactions', route: '/finance', color: 'blue' },
  { label: 'Office Tasks', icon: 'fas fa-clipboard-list', desc: 'Manage team tasks and assignments', route: '/tasks', color: 'orange' },
  { label: 'ERP Users', icon: 'fas fa-user-shield', desc: 'Manage system users and access control', route: '/erp-users', color: 'purple' },
];

const recentActivity = [
  { icon: 'fas fa-user-plus', text: 'New employee Zawadi Juma added', time: '2 hrs ago', color: 'green' },
  { icon: 'fas fa-money-bill-wave', text: 'June payroll processing initiated', time: '4 hrs ago', color: 'blue' },
  { icon: 'fas fa-check-circle', text: 'Task "Farm inventory audit" completed', time: '6 hrs ago', color: 'green' },
  { icon: 'fas fa-calendar-times', text: 'Leave request from Peter Kamau approved', time: '1 day ago', color: 'orange' },
  { icon: 'fas fa-file-invoice', text: 'Budget Q2 report submitted', time: '1 day ago', color: 'blue' },
  { icon: 'fas fa-exclamation-triangle', text: 'Loan repayment overdue: Ibrahim Salim', time: '2 days ago', color: 'red' },
];

const attendance = [
  { label: 'Present', value: 39, total: 47, color: '#10b981' },
  { label: 'On Leave', value: 5, total: 47, color: '#f59e0b' },
  { label: 'Absent', value: 3, total: 47, color: '#ef4444' },
];

const budgetStatus = [
  { label: 'Operations', spent: 68, color: '#10b981' },
  { label: 'Marketing', spent: 82, color: '#f59e0b' },
  { label: 'HR & Payroll', spent: 55, color: '#3b82f6' },
  { label: 'Logistics', spent: 91, color: '#ef4444' },
];

const ServicePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div id="service-page" className="fade-in">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">ERP Dashboard</h2>
          <p className="text-muted mb-0">{today}</p>
        </div>
        <div className="d-none d-md-flex align-items-center gap-3">
          <div className="erp-alert-badge">
            <i className="fas fa-bell me-1"></i> 3 alerts
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="avatar">
              <i className="fas fa-user text-white"></i>
            </div>
            <div>
              <p className="mb-0 fw-bold fs-6 lh-1">{user?.username || 'Admin'}</p>
              <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>Super Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="col-6 col-lg-3">
            <div className={`erp-kpi-card kpi-${kpi.color}`}>
              <div className="erp-kpi-icon">
                <i className={kpi.icon}></i>
              </div>
              <div className="erp-kpi-body">
                <div className="erp-kpi-value">{kpi.value}</div>
                <div className="erp-kpi-label">{kpi.label}</div>
                <div className={`erp-kpi-change ${kpi.trend}`}>
                  {kpi.trend === 'up' && <i className="fas fa-arrow-up me-1"></i>}
                  {kpi.trend === 'down' && <i className="fas fa-arrow-down me-1"></i>}
                  {kpi.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-4">
        {/* Module Quick Access */}
        <div className="col-lg-5">
          <div className="erp-card h-100">
            <div className="erp-card-header">
              <i className="fas fa-th-large me-2 text-primary-green"></i>
              <span className="fw-semibold">ERP Modules</span>
            </div>
            <div className="erp-card-body p-3">
              <div className="row g-3">
                {modules.map((mod, i) => (
                  <div key={i} className="col-6">
                    <div
                      className={`erp-module-tile module-${mod.color}`}
                      onClick={() => navigate(mod.route)}
                    >
                      <i className={`${mod.icon} erp-module-icon`}></i>
                      <div className="erp-module-label">{mod.label}</div>
                      <div className="erp-module-desc">{mod.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="col-lg-4">
          <div className="erp-card h-100">
            <div className="erp-card-header">
              <i className="fas fa-history me-2 text-primary-green"></i>
              <span className="fw-semibold">Recent Activity</span>
            </div>
            <div className="erp-card-body p-0">
              <ul className="erp-activity-list">
                {recentActivity.map((item, i) => (
                  <li key={i} className="erp-activity-item">
                    <div className={`erp-activity-dot dot-${item.color}`}>
                      <i className={item.icon}></i>
                    </div>
                    <div className="erp-activity-content">
                      <div className="erp-activity-text">{item.text}</div>
                      <div className="erp-activity-time">{item.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Column: Attendance + Budget */}
        <div className="col-lg-3 d-flex flex-column gap-4">
          {/* Attendance Summary */}
          <div className="erp-card flex-fill">
            <div className="erp-card-header">
              <i className="fas fa-calendar-check me-2 text-primary-green"></i>
              <span className="fw-semibold">Today's Attendance</span>
            </div>
            <div className="erp-card-body p-3">
              <div className="text-center mb-3">
                <div className="erp-donut-ring">
                  <span className="erp-donut-value">83%</span>
                  <span className="erp-donut-sub">Present</span>
                </div>
              </div>
              {attendance.map((a, i) => (
                <div key={i} className="mb-2">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">{a.label}</span>
                    <span className="fw-semibold">{a.value}/{a.total}</span>
                  </div>
                  <div className="erp-mini-bar">
                    <div className="erp-mini-bar-fill" style={{ width: `${(a.value / a.total) * 100}%`, background: a.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budget Status */}
          <div className="erp-card flex-fill">
            <div className="erp-card-header">
              <i className="fas fa-wallet me-2 text-primary-green"></i>
              <span className="fw-semibold">Budget Usage</span>
            </div>
            <div className="erp-card-body p-3">
              {budgetStatus.map((b, i) => (
                <div key={i} className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">{b.label}</span>
                    <span className="fw-semibold" style={{ color: b.spent > 85 ? '#ef4444' : '#374151' }}>{b.spent}%</span>
                  </div>
                  <div className="erp-mini-bar">
                    <div className="erp-mini-bar-fill" style={{ width: `${b.spent}%`, background: b.color }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicePage;
