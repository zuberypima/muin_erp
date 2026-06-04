import React, { useState } from 'react';
import { LeaveRequest, demoLeaves, formatDate } from './hrTypes';

const Leaves: React.FC = () => {
  const [leaves, setLeaves] = useState<LeaveRequest[]>(demoLeaves);
  const [showModal, setShowModal] = useState(false);

  const [form, setForm] = useState<Omit<LeaveRequest, 'id' | 'appliedOn' | 'status'>>({
    employeeId: '',
    employeeName: '',
    department: 'Farm Operations',
    leaveType: 'annual',
    startDate: '',
    endDate: '',
    days: 1,
    reason: ''
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest: LeaveRequest = {
      ...form,
      id: `LV-${(leaves.length + 1).toString().padStart(3, '0')}`,
      status: 'pending',
      appliedOn: new Date().toISOString().split('T')[0]
    };
    setLeaves([newRequest, ...leaves]);
    setShowModal(false);
  };

  const handleStatusUpdate = (id: string, newStatus: 'approved' | 'rejected') => {
    setLeaves(leaves.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  return (
    <div className="container-fluid p-0">
      <div className="hr-table-card">
        <div className="d-flex justify-content-between align-items-center px-4 pt-4 pb-3">
          <h5 className="fw-bold mb-0">Leave Requests</h5>
          <button className="btn btn-sm text-white fw-bold px-3 py-1.5" style={{ backgroundColor: '#10b981', borderRadius: '8px' }} onClick={() => setShowModal(true)}>
            <i className="fas fa-plus me-2"></i> Request Leave
          </button>
        </div>

        <div className="table-responsive">
          <table className="table hr-table align-middle">
            <thead>
              <tr>
                <th>Employee Name</th>
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
              {leaves.map(leave => (
                <tr key={leave.id}>
                  <td className="fw-semibold text-dark">{leave.employeeName}</td>
                  <td className="text-capitalize">{leave.leaveType}</td>
                  <td className="small">
                    {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                  </td>
                  <td>{leave.days} {leave.days === 1 ? 'day' : 'days'}</td>
                  <td className="text-muted small" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {leave.reason}
                  </td>
                  <td className="small text-muted">{formatDate(leave.appliedOn)}</td>
                  <td>
                    <span className={`hr-badge ${leave.status}`}>{leave.status}</span>
                  </td>
                  <td className="text-end">
                    {leave.status === 'pending' && (
                      <div className="d-flex justify-content-end gap-2">
                        <button className="btn btn-xs btn-success py-1 px-2 text-white" style={{ fontSize: '11px', borderRadius: '6px' }} onClick={() => handleStatusUpdate(leave.id, 'approved')}>
                          Approve
                        </button>
                        <button className="btn btn-xs btn-danger py-1 px-2 text-white" style={{ fontSize: '11px', borderRadius: '6px' }} onClick={() => handleStatusUpdate(leave.id, 'rejected')}>
                          Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
                      <label className="form-label text-muted small fw-semibold">Employee Name</label>
                      <input type="text" className="form-control bg-light" required placeholder="e.g. Peter Kamau" value={form.employeeName} onChange={e => setForm({...form, employeeName: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Leave Type</label>
                      <select className="form-select bg-light" value={form.leaveType} onChange={e => setForm({...form, leaveType: e.target.value as any})}>
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
                      <input type="number" min={1} className="form-control bg-light" required value={form.days} onChange={e => setForm({...form, days: parseInt(e.target.value) || 1})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Start Date</label>
                      <input type="date" className="form-control bg-light" required value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">End Date</label>
                      <input type="date" className="form-control bg-light" required value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label text-muted small fw-semibold">Reason</label>
                      <textarea className="form-control bg-light" rows={2} required value={form.reason} onChange={e => setForm({...form, reason: e.target.value})}></textarea>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn text-white fw-bold px-4" style={{ backgroundColor: '#10b981' }}>Submit Request</button>
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
