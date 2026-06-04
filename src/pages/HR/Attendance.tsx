import React, { useState } from 'react';
import { AttendanceRecord, demoAttendance, formatDate } from './hrTypes';

const Attendance: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(demoAttendance);
  const [showModal, setShowModal] = useState(false);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  const [form, setForm] = useState<Omit<AttendanceRecord, 'id'>>({
    employeeId: '',
    employeeName: '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '',
    checkOut: '',
    status: 'present',
    hoursWorked: 8
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord: AttendanceRecord = {
      ...form,
      id: `ATT-${(attendance.length + 1).toString().padStart(3, '0')}`
    };
    setAttendance([...attendance, newRecord]);
    setShowModal(false);
  };

  return (
    <div className="container-fluid p-0">
      <div className="hr-table-card">
        <div className="d-flex flex-wrap justify-content-between align-items-center px-4 pt-4 pb-3 gap-3">
          <h5 className="fw-bold mb-0">Daily Attendance Log</h5>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            <input 
              type="date" 
              className="form-control form-control-sm" 
              style={{ width: '150px' }}
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
            <button className="btn btn-sm text-white fw-bold px-3 py-1.5" style={{ backgroundColor: '#10b981', borderRadius: '8px' }} onClick={() => setShowModal(true)}>
              <i className="fas fa-plus me-2"></i> Log Attendance
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table hr-table align-middle">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours Worked</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map(att => (
                <tr key={att.id}>
                  <td className="fw-semibold text-dark">{att.employeeName}</td>
                  <td>{formatDate(att.date)}</td>
                  <td>{att.checkIn || '—'}</td>
                  <td>{att.checkOut || '—'}</td>
                  <td>{att.hoursWorked > 0 ? `${att.hoursWorked} hrs` : '—'}</td>
                  <td>
                    <span className={`hr-badge ${att.status}`}>{att.status}</span>
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
                <h5 className="modal-title fw-bold">Log Attendance</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAdd}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label text-muted small fw-semibold">Employee Name</label>
                      <input type="text" className="form-control bg-light" required placeholder="e.g. Amina Hassan" value={form.employeeName} onChange={e => setForm({...form, employeeName: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Check In</label>
                      <input type="time" className="form-control bg-light" value={form.checkIn} onChange={e => setForm({...form, checkIn: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Check Out</label>
                      <input type="time" className="form-control bg-light" value={form.checkOut} onChange={e => setForm({...form, checkOut: e.target.value})} />
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Status</label>
                      <select className="form-select bg-light" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                        <option value="half-day">Half Day</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label text-muted small fw-semibold">Hours Worked</label>
                      <input type="number" step="0.25" className="form-control bg-light" required value={form.hoursWorked} onChange={e => setForm({...form, hoursWorked: parseFloat(e.target.value) || 0})} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light fw-semibold" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn text-white fw-bold px-4" style={{ backgroundColor: '#10b981' }}>Log Record</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
