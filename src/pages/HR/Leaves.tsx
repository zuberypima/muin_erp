import React, { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import { formatDate } from './hrTypes';

interface LeaveRequest {
  id: number;
  employee: number;
  employee_name: string;
  department: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_on: string;
}

interface Employee { id: number; full_name: string; department: string; }

const Leaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    employee: '',
    leave_type: 'annual',
    start_date: '',
    end_date: '',
    days: 1,
    reason: '',
  });

  const fetchLeaves = async () => {
    try {
      const res = await api.get('/hr/leaves/');
      setLeaves(res.data);
    } catch { setError('Failed to load leave requests.'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchLeaves();
    api.get('/hr/employees/').then(r => setEmployees(r.data)).catch(() => {});
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/hr/leaves/', form);
      await fetchLeaves();
      setShowModal(false);
      setForm({ employee: '', leave_type: 'annual', start_date: '', end_date: '', days: 1, reason: '' });
    } catch (err: any) {
      setError('Failed to submit leave request.');
    } finally { setSaving(false); }
  };

  const handleStatusUpdate = async (id: number, action: 'approve' | 'reject') => {
    try {
      await api.post(`/hr/leaves/${id}/${action}/`);
      setLeaves(leaves.map(l => l.id === id ? { ...l, status: action === 'approve' ? 'approved' : 'rejected' } : l));
    } catch { setError(`Failed to ${action} leave.`); }
  };

  return (
    <div className="container-fluid p-0">
      <div className="hr-table-card">
        <div className="d-flex justify-content-between align-items-center px-4 pt-4 pb-3">
          <h5 className="fw-bold mb-0">Leave Requests</h5>
          <button className="btn btn-sm text-white fw-bold px-3"
            style={{ backgroundColor: '#10b981', borderRadius: '8px' }}
            onClick={() => setShowModal(true)}>
            <i className="fas fa-plus me-2"></i>Request Leave
          </button>
        </div>

        {error && <div className="alert alert-danger mx-4 py-2 small">{error}</div>}

        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-success"></div></div>
        ) : (
          <div className="table-responsive">
            <table className="table hr-table align-middle">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Dept.</th>
                  <th>Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Applied On</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.length === 0 ? (
                  <tr><td colSpan={9} className="text-center text-muted py-4">No leave requests found.</td></tr>
                ) : leaves.map(leave => (
                  <tr key={leave.id}>
                    <td className="fw-semibold text-dark">{leave.employee_name}</td>
                    <td className="small text-muted">{leave.department}</td>
                    <td className="text-capitalize">{leave.leave_type}</td>
                    <td className="small">{formatDate(leave.start_date)} → {formatDate(leave.end_date)}</td>
                    <td>{leave.days}d</td>
                    <td className="text-muted small" style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{leave.reason}</td>
                    <td className="small text-muted">{formatDate(leave.applied_on)}</td>
                    <td><span className={`hr-badge ${leave.status}`}>{leave.status}</span></td>
                    <td className="text-end">
                      {leave.status === 'pending' && (
                        <div className="d-flex justify-content-end gap-1">
                          <button className="btn btn-success btn-sm py-0 px-2 text-white" style={{ fontSize: '11px', borderRadius: '6px' }}
                            onClick={() => handleStatusUpdate(leave.id, 'approve')}>Approve</button>
                          <button className="btn btn-danger btn-sm py-0 px-2 text-white" style={{ fontSize: '11px', borderRadius: '6px' }}
                            onClick={() => handleStatusUpdate(leave.id, 'reject')}>Reject</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal fade show d-block hr-modal" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex={-1}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow" style={{ borderRadius: '16px' }}>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Request Leave</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAdd}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-muted small fw-semibold">Employee</label>
                      <select className="form-select bg-light" required value={form.employee}
                        onChange={e => setForm({...form, employee: e.target.value})}>
                        <option value="">Select employee...</option>
                        {employees.map((emp: any) => (
                          <option key={emp.id} value={emp.id}>{emp.full_name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Leave Type</label>
                      <select className="form-select bg-light" value={form.leave_type}
                        onChange={e => setForm({...form, leave_type: e.target.value})}>
                        <option value="annual">Annual</option>
                        <option value="sick">Sick</option>
                        <option value="maternity">Maternity</option>
                        <option value="paternity">Paternity</option>
                        <option value="unpaid">Unpaid</option>
                        <option value="emergency">Emergency</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Duration (Days)</label>
                      <input type="number" min={1} className="form-control bg-light" required
                        value={form.days} onChange={e => setForm({...form, days: parseInt(e.target.value) || 1})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Start Date</label>
                      <input type="date" className="form-control bg-light" required value={form.start_date}
                        onChange={e => setForm({...form, start_date: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">End Date</label>
                      <input type="date" className="form-control bg-light" required value={form.end_date}
                        onChange={e => setForm({...form, end_date: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small fw-semibold">Reason</label>
                      <textarea className="form-control bg-light" rows={2} required value={form.reason}
                        onChange={e => setForm({...form, reason: e.target.value})}></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn text-white fw-bold px-4" style={{ backgroundColor: '#10b981' }} disabled={saving}>
                    {saving ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
