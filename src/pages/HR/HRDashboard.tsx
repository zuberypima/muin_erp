import React, { useEffect, useState } from 'react';
import api from '../../api/axiosConfig';

const HRDashboard: React.FC = () => {
  const today = new Date().toISOString().split('T')[0];

  const [employees, setEmployees] = useState<any[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<any[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [empRes, attRes, leaveRes] = await Promise.all([
          api.get('/hr/employees/'),
          api.get(`/hr/attendance/?date=${today}`),
          api.get('/hr/leaves/'),
        ]);
        setEmployees(empRes.data);
        setTodayAttendance(attRes.data);
        setLeaves(leaveRes.data);
      } catch (e) {
        console.error('HR Dashboard fetch error', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [today]);

  const activeCount = employees.filter(e => e.status === 'active').length;
  const onLeaveCount = employees.filter(e => e.status === 'on-leave').length;
  const presentToday = todayAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const pendingLeaves = leaves.filter(l => l.status === 'pending').length;

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <div className="spinner-border text-success"></div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0">
      {/* KPI Cards */}
      <div className="row g-4 mb-4">
        <div className="col-md-3">
          <div className="hr-card text-center">
            <div className="emp-avatar mx-auto mb-3" style={{ width: '56px', height: '56px', fontSize: '1.25rem' }}>
              <i className="fas fa-users"></i>
            </div>
            <h6 className="kpi-label">Active Employees</h6>
            <h3 className="kpi-value">{activeCount} / {employees.length}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="hr-card text-center">
            <div className="emp-avatar mx-auto mb-3" style={{ width: '56px', height: '56px', fontSize: '1.25rem', background: '#eff6ff', color: '#3b82f6', border: '2px solid #dbeafe' }}>
              <i className="fas fa-plane-departure"></i>
            </div>
            <h6 className="kpi-label">On Leave</h6>
            <h3 className="kpi-value">{onLeaveCount}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="hr-card text-center">
            <div className="emp-avatar mx-auto mb-3" style={{ width: '56px', height: '56px', fontSize: '1.25rem', background: '#ecfdf5', color: '#10b981', border: '2px solid #d1fae5' }}>
              <i className="fas fa-clock"></i>
            </div>
            <h6 className="kpi-label">Present Today</h6>
            <h3 className="kpi-value">{presentToday}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="hr-card text-center">
            <div className="emp-avatar mx-auto mb-3" style={{ width: '56px', height: '56px', fontSize: '1.25rem', background: '#fffbeb', color: '#d97706', border: '2px solid #fef3c7' }}>
              <i className="fas fa-envelope-open-text"></i>
            </div>
            <h6 className="kpi-label">Pending Leaves</h6>
            <h3 className="kpi-value">{pendingLeaves}</h3>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Today's Attendance Snapshot */}
        <div className="col-lg-6">
          <div className="hr-table-card">
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Today's Attendance Snapshot</h5>
              <span className="badge bg-light text-muted border small">{today}</span>
            </div>
            <div className="table-responsive">
              {todayAttendance.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-calendar-times fa-2x mb-2 d-block" style={{ color: '#cbd5e1' }}></i>
                  No attendance logged for today yet.
                </div>
              ) : (
                <table className="table hr-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Check In</th>
                      <th>Check Out</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayAttendance.slice(0, 6).map(att => (
                      <tr key={att.id}>
                        <td>
                          <div className="fw-medium">{att.employee_name}</div>
                          <div className="small text-muted">{att.employee_id_code}</div>
                        </td>
                        <td>{att.check_in || '—'}</td>
                        <td>{att.check_out || '—'}</td>
                        <td><span className={`hr-badge ${att.status}`}>{att.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Recent Leave Requests */}
        <div className="col-lg-6">
          <div className="hr-table-card">
            <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Recent Leave Requests</h5>
              <span className="badge rounded-pill" style={{ backgroundColor: pendingLeaves > 0 ? '#fef3c7' : '#f1f5f9', color: pendingLeaves > 0 ? '#d97706' : '#64748b', fontSize: '0.75rem' }}>
                {pendingLeaves} pending
              </span>
            </div>
            <div className="table-responsive">
              {leaves.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="fas fa-inbox fa-2x mb-2 d-block" style={{ color: '#cbd5e1' }}></i>
                  No leave requests found.
                </div>
              ) : (
                <table className="table hr-table">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Type</th>
                      <th>Days</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaves.slice(0, 6).map(leave => (
                      <tr key={leave.id}>
                        <td>
                          <div className="fw-medium">{leave.employee_name}</div>
                          <div className="small text-muted">{leave.department}</div>
                        </td>
                        <td className="text-capitalize">{leave.leave_type}</td>
                        <td>{leave.days}d</td>
                        <td><span className={`hr-badge ${leave.status}`}>{leave.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
