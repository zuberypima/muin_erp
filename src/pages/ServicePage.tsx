import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosConfig';
import './ServicePage.css';

const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

const getRelativeTime = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
};

const modules = [
  { label: 'HR Management', icon: 'fas fa-users-cog', desc: 'Employees, Attendance, Leaves, Performance', route: '/hr', color: 'green' },
  { label: 'Finance', icon: 'fas fa-chart-pie', desc: 'Income, Expenses, Budgets, Transactions', route: '/finance', color: 'blue' },
  { label: 'Procurement', icon: 'fas fa-boxes', desc: 'Purchases, Inventory, Assets', route: '/procurement', color: 'orange' },
  { label: 'IT Management', icon: 'fas fa-server', desc: 'Assets, Users, Tickets, Maintenance', route: '/it', color: 'red' },
  { label: 'Office Tasks', icon: 'fas fa-clipboard-list', desc: 'Manage team tasks and assignments', route: '/tasks', color: 'purple' },
  { label: 'ERP Users', icon: 'fas fa-user-shield', desc: 'Manage system users and access control', route: '/erp-users', color: 'gray' },
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
  const isSuperAdmin = user?.is_staff || user?.department === 'Management';
  const [tasks, setTasks] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSuperAdmin) {
      navigate('/self-service', { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        const [tasksRes, usersRes, ticketsRes] = await Promise.all([
          api.get('/tasks/'),
          api.get('/users/'),
          api.get('/it/tickets/').catch(() => ({ data: [] }))
        ]);
        setTasks(tasksRes.data);
        setUsers(usersRes.data);
        setTickets(ticketsRes.data);
      } catch (e) {
        console.error('Failed to fetch dashboard data', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isSuperAdmin, navigate]);

  if (!isSuperAdmin) return null;

  // Compute KPI values
  const totalEmployees = users.length;
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;
  const criticalTickets = tickets.filter(t => t.priority === 'critical' && t.status !== 'resolved' && t.status !== 'closed').length;
  
  // Simulated stats based on real totals to keep visual realism
  const presentCount = Math.max(0, Math.round(totalEmployees * 0.85));
  const leaveCount = Math.max(0, Math.round(totalEmployees * 0.10));
  const absentCount = Math.max(0, totalEmployees - presentCount - leaveCount);
  const attendancePct = totalEmployees > 0 ? Math.round((presentCount / totalEmployees) * 100) : 0;

  const kpis = [
    { label: 'Total Employees', value: String(totalEmployees), change: `Active in ERP`, icon: 'fas fa-users', color: 'green', trend: 'up', route: '/hr' },
    { label: 'Monthly Revenue', value: 'TZS 84.2M', change: '+12% vs last month', icon: 'fas fa-chart-line', color: 'blue', trend: 'up', route: '/finance' },
    { label: 'Pending Tasks', value: String(pendingTasks), change: `${tasks.filter(t => t.status === 'Assist-Requested').length} need assist`, icon: 'fas fa-tasks', color: 'orange', trend: 'neutral', route: '/tasks' },
    { label: 'Open IT Tickets', value: String(openTickets), change: `${criticalTickets} critical issues`, icon: 'fas fa-headset', color: 'red', trend: 'neutral', route: '/it/support-tickets' },
  ];

  // Dynamic activity feed
  const activities: any[] = [];
  
  // Add employee added entries
  users.forEach((u: any) => {
    activities.push({
      icon: 'fas fa-user-plus',
      text: `New employee ${u.username} added to system`,
      time: 'New User',
      color: 'green',
      sortTime: 0
    });
  });

  // Add task updates entries
  tasks.forEach((t: any) => {
    const taskTime = new Date(t.created_at || Date.now());
    const timeStr = getRelativeTime(taskTime);

    if (t.status === 'Completed') {
      activities.push({
        icon: 'fas fa-check-circle',
        text: `Task "${t.title}" was marked completed`,
        time: timeStr,
        color: 'green',
        sortTime: taskTime.getTime()
      });
    } else if (t.status === 'Awaiting-Approval') {
      activities.push({
        icon: 'fas fa-gavel',
        text: `Approval requested for task "${t.title}"`,
        time: timeStr,
        color: 'purple',
        sortTime: taskTime.getTime()
      });
    } else if (t.status === 'Assist-Requested') {
      activities.push({
        icon: 'fas fa-life-ring',
        text: `Assistance requested on task "${t.title}"`,
        time: timeStr,
        color: 'orange',
        sortTime: taskTime.getTime()
      });
    } else {
      activities.push({
        icon: 'fas fa-plus-circle',
        text: `Task "${t.title}" initialized as ${t.status}`,
        time: timeStr,
        color: 'blue',
        sortTime: taskTime.getTime()
      });
    }
  });

  // Sort and limit to top 6 activities
  activities.sort((a, b) => b.sortTime - a.sortTime);
  const recentActivity = activities.length > 0 ? activities.slice(0, 6) : [
    { icon: 'fas fa-info-circle', text: 'No recent task activity logged yet.', time: 'System', color: 'blue' }
  ];

  const attendance = [
    { label: 'Present', value: presentCount, total: totalEmployees, color: '#10b981' },
    { label: 'On Leave', value: leaveCount, total: totalEmployees, color: '#f59e0b' },
    { label: 'Absent', value: absentCount, total: totalEmployees, color: '#ef4444' },
  ];

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
            <i className="fas fa-bell me-1"></i> {pendingTasks} tasks active
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="avatar">
              <i className="fas fa-user text-white"></i>
            </div>
            <div>
              <p className="mb-0 fw-bold fs-6 lh-1">{user?.username || 'Admin'}</p>
              <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>
                {user?.is_staff ? 'Super Admin / Manager' : 'ERP User'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="row g-3 mb-4">
            {kpis.map((kpi, i) => (
              <div key={i} className="col-6 col-lg-3">
                <div 
                  className={`erp-kpi-card kpi-${kpi.color}`}
                  onClick={() => kpi.route && navigate(kpi.route)}
                  style={{ cursor: kpi.route ? 'pointer' : 'default' }}
                >
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
                  <ul className="erp-activity-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
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
                      <span className="erp-donut-value">{attendancePct}%</span>
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
                        <div className="erp-mini-bar-fill" style={{ width: totalEmployees > 0 ? `${(a.value / a.total) * 100}%` : '0%', background: a.color }}></div>
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
        </>
      )}
    </div>
  );
};

export default ServicePage;
