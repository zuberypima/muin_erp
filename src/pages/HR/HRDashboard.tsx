import { demoEmployees, demoAttendance, demoLeaves } from './hrTypes';

const HRDashboard: React.FC = () => {
  const activeCount = demoEmployees.filter(e => e.status === 'active').length;
  const leaveCount = demoEmployees.filter(e => e.status === 'on-leave').length;
  const todayPresent = demoAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const pendingLeaves = demoLeaves.filter(l => l.status === 'pending').length;

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
            <h3 className="kpi-value">{activeCount} / {demoEmployees.length}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="hr-card text-center">
            <div className="emp-avatar mx-auto mb-3" style={{ width: '56px', height: '56px', fontSize: '1.25rem', background: '#eff6ff', color: '#3b82f6', border: '2px solid #dbeafe' }}>
              <i className="fas fa-plane-departure"></i>
            </div>
            <h6 className="kpi-label">On Leave</h6>
            <h3 className="kpi-value">{leaveCount}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="hr-card text-center">
            <div className="emp-avatar mx-auto mb-3" style={{ width: '56px', height: '56px', fontSize: '1.25rem', background: '#ecfdf5', color: '#10b981', border: '2px solid #d1fae5' }}>
              <i className="fas fa-clock"></i>
            </div>
            <h6 className="kpi-label">Present Today</h6>
            <h3 className="kpi-value">{todayPresent}</h3>
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
        {/* Attendance Summary */}
        <div className="col-lg-6">
          <div className="hr-table-card">
            <div className="p-4 border-bottom">
              <h5 className="fw-bold mb-0">Today's Attendance Snapshot</h5>
            </div>
            <div className="table-responsive">
              <table className="table hr-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Check In</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {demoAttendance.slice(0, 5).map(att => (
                    <tr key={att.id}>
                      <td className="fw-medium">{att.employeeName}</td>
                      <td>{att.checkIn || '—'}</td>
                      <td>
                        <span className={`hr-badge ${att.status}`}>{att.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Leave Requests Summary */}
        <div className="col-lg-6">
          <div className="hr-table-card">
            <div className="p-4 border-bottom">
              <h5 className="fw-bold mb-0">Recent Leave Requests</h5>
            </div>
            <div className="table-responsive">
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
                  {demoLeaves.slice(0, 5).map(leave => (
                    <tr key={leave.id}>
                      <td className="fw-medium">{leave.employeeName}</td>
                      <td className="text-capitalize">{leave.leaveType}</td>
                      <td>{leave.days}</td>
                      <td>
                        <span className={`hr-badge ${leave.status}`}>{leave.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
